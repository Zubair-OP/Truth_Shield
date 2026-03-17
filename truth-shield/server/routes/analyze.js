import fs from 'fs/promises';
import path from 'path';
import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { uploadVideo } from '../middleware/upload.js';
import { analyzeFramesWithGemini } from '../services/claudeAnalyzer.js';
import { extractFrames } from '../services/frameExtractor.js';
import { scoreVideo } from '../services/scoreCalculator.js';

const router = Router();
const MAX_TIMEOUT_MS = 120000;
const FRAME_COUNT = Number(process.env.FRAME_COUNT || 20);

const jobs = new Map();

const setJob = (jobId, patch) => {
  const current = jobs.get(jobId) || {};
  const next = { ...current, ...patch, updatedAt: Date.now() };
  jobs.set(jobId, next);
  return next;
};

const createJob = () => {
  const jobId = uuidv4();
  const initial = {
    id: jobId,
    status: 'queued',
    step: 'Waiting...',
    progress: 0,
    result: null,
    error: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  jobs.set(jobId, initial);
  return initial;
};

const removeJobLater = (jobId, ttlMs = 10 * 60 * 1000) => {
  setTimeout(() => jobs.delete(jobId), ttlMs).unref?.();
};

const cleanupPaths = async (paths) => {
  await Promise.all(
    paths.map(async (target) => {
      if (!target) {
        return;
      }
      try {
        await fs.rm(target, { recursive: true, force: true });
      } catch {
        // Best-effort cleanup.
      }
    })
  );
};

router.get('/events/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);

  if (!job) {
    res.status(404).json({ error: 'Job not found.' });
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const send = () => {
    const snapshot = jobs.get(jobId);
    if (!snapshot) {
      res.write('event: done\n');
      res.write('data: {}\n\n');
      res.end();
      return;
    }

    res.write(`data: ${JSON.stringify(snapshot)}\n\n`);

    if (snapshot.status === 'completed' || snapshot.status === 'failed') {
      res.write('event: done\n');
      res.write(`data: ${JSON.stringify(snapshot)}\n\n`);
      res.end();
    }
  };

  const interval = setInterval(send, 750);
  send();

  req.on('close', () => {
    clearInterval(interval);
  });
});

router.post('/', (req, res, next) => {
  uploadVideo(req, res, async (uploadError) => {
    if (uploadError) {
      next(uploadError);
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'No video file provided.' });
      return;
    }

    const job = createJob();
    const frameOutputDir = path.join(path.dirname(req.file.path), `${job.id}-frames`);

    res.status(202).json({
      jobId: job.id,
      eventStream: `/api/analyze/events/${job.id}`,
    });

    const timer = setTimeout(() => {
      setJob(job.id, {
        status: 'failed',
        step: 'Timed out',
        progress: 100,
        error: 'Analysis timed out after 120 seconds.',
      });
      cleanupPaths([req.file.path, frameOutputDir]);
      removeJobLater(job.id);
    }, MAX_TIMEOUT_MS);

    try {
      setJob(job.id, { status: 'processing', step: 'Uploading...', progress: 10 });

      setJob(job.id, { step: 'Extracting Frames...', progress: 25 });
      const extracted = await extractFrames({
        filePath: req.file.path,
        outputDir: frameOutputDir,
        frameCount: FRAME_COUNT,
        onProgress: (progress) => {
          setJob(job.id, { step: 'Extracting Frames...', progress });
        },
      });

      setJob(job.id, { step: 'Analyzing with AI...', progress: 65 });
      const analysis = await analyzeFramesWithGemini(extracted.frames);

      setJob(job.id, { step: 'Calculating Score...', progress: 90 });
      const scored = scoreVideo(analysis);

      const payload = {
        model_identifier: 'gpt-5.3-codex',
        ai_engine: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
        score: scored.score,
        verdict: scored.verdict,
        confidence: scored.confidence,
        breakdown: scored.breakdown,
        findings: analysis.key_findings,
        reasoning: analysis.reasoning,
        red_flags: analysis.red_flags,
        authentic_signals: analysis.authentic_signals,
      };

      setJob(job.id, {
        status: 'completed',
        step: 'Complete',
        progress: 100,
        result: payload,
      });
    } catch (error) {
      setJob(job.id, {
        status: 'failed',
        step: 'Failed',
        progress: 100,
        error: error.message || 'Analysis failed.',
      });
    } finally {
      clearTimeout(timer);
      await cleanupPaths([req.file.path, frameOutputDir]);
      removeJobLater(job.id);
    }
  });
});

export default router;
