import fs from 'fs/promises';
import path from 'path';

import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import ffprobe from 'ffprobe-static';

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

if (ffprobe?.path) {
  ffmpeg.setFfprobePath(ffprobe.path);
}

const probeVideo = (filePath) =>
  new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (error, metadata) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(metadata);
    });
  });

const runFrameExtraction = ({ filePath, outputDir, frameCount, duration, onProgress }) =>
  new Promise((resolve, reject) => {
    const safeDuration = Math.max(duration || 1, 1);
    const fps = frameCount / safeDuration;

    ffmpeg(filePath)
      .outputOptions(['-vf', `fps=${fps}`, '-q:v', '2'])
      .output(path.join(outputDir, 'frame-%03d.jpg'))
      .on('progress', (progress) => {
        const raw = Number(progress.percent || 0);
        const mapped = Math.min(55, 25 + Math.round(raw * 0.3));
        onProgress?.(mapped);
      })
      .on('end', () => resolve())
      .on('error', (error) => reject(error))
      .run();
  });

export const extractFrames = async ({ filePath, outputDir, frameCount, onProgress }) => {
  await fs.mkdir(outputDir, { recursive: true });

  const metadata = await probeVideo(filePath);
  const duration = Number(metadata?.format?.duration || 0);

  await runFrameExtraction({
    filePath,
    outputDir,
    frameCount,
    duration,
    onProgress,
  });

  const frameFiles = (await fs.readdir(outputDir))
    .filter((name) => name.startsWith('frame-') && name.endsWith('.jpg'))
    .sort();

  const frames = await Promise.all(
    frameFiles.map(async (fileName) => {
      const framePath = path.join(outputDir, fileName);
      const buffer = await fs.readFile(framePath);

      return {
        path: framePath,
        mediaType: 'image/jpeg',
        base64: buffer.toString('base64'),
      };
    })
  );

  return {
    duration,
    frames,
  };
};
