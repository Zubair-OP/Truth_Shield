import { GoogleGenAI } from '@google/genai';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  return new GoogleGenAI({ apiKey });
};

export const ANALYSIS_PROMPT = `
You are an expert AI video forensics analyst. Analyze the provided video
frames and determine if this video is authentic (real) or AI-generated/deepfake.

Examine these specific signal categories:

1. VISUAL ARTIFACTS (weight: 35%)
   - Unnatural skin smoothing or waxy texture
   - Edge flickering at hair/face boundaries
   - Lighting inconsistencies or mismatched shadows
   - Background morphing or temporal inconsistencies
   - Eye blinking irregularities

2. FACIAL COHERENCE (weight: 25%)
   - Face geometry consistency across frames
   - Lip-sync accuracy
   - Identity consistency (same person throughout)
   - Micro-expression naturalness

3. MOTION & PHYSICS (weight: 20%)
   - Unnatural motion trajectories
   - Hair and clothing physics
   - Camera grain and natural shake

4. COMPRESSION PATTERNS (weight: 10%)
   - DCT block artifact patterns
   - Noise distribution anomalies

5. OVERALL COHERENCE (weight: 10%)
   - Scene consistency
   - General plausibility of the video

Return ONLY a valid JSON object in this exact structure:
{
  "authenticity_score": <number 0-10, where 0=most authentic, 10=most AI>,
  "confidence": <"Low" | "Medium" | "High">,
  "verdict": <"Likely Authentic" | "Uncertain" | "Likely AI-Generated">,
  "category_scores": {
    "visual_artifacts": <0-10>,
    "facial_coherence": <0-10>,
    "motion_physics": <0-10>,
    "compression_patterns": <0-10>,
    "overall_coherence": <0-10>
  },
  "key_findings": [<array of 3-6 specific observations as strings>],
  "reasoning": "<2-3 sentence summary of why this score was assigned>",
  "red_flags": [<array of specific AI artifacts detected, empty if none>],
  "authentic_signals": [<array of real video signals detected, empty if none>]
}
`;

const normalizeParsed = (value) => ({
  authenticity_score: Number(value?.authenticity_score ?? 5),
  confidence: value?.confidence || 'Medium',
  verdict: value?.verdict || 'Uncertain',
  category_scores: {
    visual_artifacts: Number(value?.category_scores?.visual_artifacts ?? 5),
    facial_coherence: Number(value?.category_scores?.facial_coherence ?? 5),
    motion_physics: Number(value?.category_scores?.motion_physics ?? 5),
    compression_patterns: Number(value?.category_scores?.compression_patterns ?? 5),
    overall_coherence: Number(value?.category_scores?.overall_coherence ?? 5),
  },
  key_findings: Array.isArray(value?.key_findings) ? value.key_findings : [],
  reasoning: value?.reasoning || 'No reasoning provided.',
  red_flags: Array.isArray(value?.red_flags) ? value.red_flags : [],
  authentic_signals: Array.isArray(value?.authentic_signals) ? value.authentic_signals : [],
});

const parseAnalysisJson = (text) => {
  const stripped = text.trim().replace(/```json|```/gi, '');
  const start = stripped.indexOf('{');
  const end = stripped.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON object found in Gemini response.');
  }

  const jsonText = stripped.slice(start, end + 1);
  return JSON.parse(jsonText);
};

const extractTextFromResponse = (response) => {
  if (typeof response?.text === 'string' && response.text.trim()) {
    return response.text;
  }

  const parts = response?.candidates?.[0]?.content?.parts || [];
  return parts
    .map((item) => item?.text)
    .filter(Boolean)
    .join('\n');
};

const retryForJson = async (rawText) => {
  const client = getClient();
  const retryResponse = await client.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text:
              'Convert the following text into valid JSON only. Do not add markdown. Keep the same schema.\n\n' +
              rawText,
          },
        ],
      },
    ],
    config: {
      temperature: 0,
      maxOutputTokens: 1200,
    },
  });

  const retryText = extractTextFromResponse(retryResponse);
  return parseAnalysisJson(retryText);
};

export const analyzeFramesWithGemini = async (frames) => {
  const client = getClient();

  const parts = [
    {
      text: ANALYSIS_PROMPT,
    },
    ...frames.map((frame) => ({
      inlineData: {
        mimeType: frame.mediaType,
        data: frame.base64,
      },
    })),
  ];

  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        role: 'user',
        parts,
      },
    ],
    config: {
      temperature: 0.2,
      maxOutputTokens: 2000,
    },
  });

  const rawText = extractTextFromResponse(response);

  try {
    const parsed = parseAnalysisJson(rawText);
    return normalizeParsed(parsed);
  } catch {
    const parsedRetry = await retryForJson(rawText);
    return normalizeParsed(parsedRetry);
  }
};

export const analyzeFramesWithClaude = analyzeFramesWithGemini;
