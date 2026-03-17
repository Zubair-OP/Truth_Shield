const clampScore = (value) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return 5;
  }
  return Math.max(0, Math.min(10, numeric));
};

export const scoreVideo = (analysis) => {
  const categoryScores = analysis?.category_scores || {};

  const weightedScore =
    clampScore(categoryScores.visual_artifacts) * 0.35 +
    clampScore(categoryScores.facial_coherence) * 0.25 +
    clampScore(categoryScores.motion_physics) * 0.2 +
    clampScore(categoryScores.compression_patterns) * 0.1 +
    clampScore(categoryScores.overall_coherence) * 0.1;

  const fallback = clampScore(analysis?.authenticity_score);
  const finalScore = Number((Number.isFinite(weightedScore) ? weightedScore : fallback).toFixed(1));

  let verdict = 'Uncertain';
  if (finalScore <= 3) {
    verdict = 'Likely Authentic';
  } else if (finalScore >= 7) {
    verdict = 'Likely AI-Generated';
  }

  return {
    score: finalScore,
    verdict,
    confidence: analysis?.confidence || 'Medium',
    breakdown: {
      visual_artifacts: clampScore(categoryScores.visual_artifacts),
      facial_coherence: clampScore(categoryScores.facial_coherence),
      motion_physics: clampScore(categoryScores.motion_physics),
      compression_patterns: clampScore(categoryScores.compression_patterns),
      overall_coherence: clampScore(categoryScores.overall_coherence),
    },
  };
};
