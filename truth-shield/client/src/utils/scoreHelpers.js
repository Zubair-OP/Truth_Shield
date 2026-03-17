export const scoreZone = (score) => {
  if (score <= 3) {
    return {
      label: 'Likely Authentic',
      color: 'text-truth-authentic',
      bg: 'bg-truth-authentic/20',
      stroke: '#16A34A',
      icon: '✅',
    };
  }

  if (score >= 7) {
    return {
      label: 'Likely AI-Generated',
      color: 'text-truth-danger',
      bg: 'bg-truth-danger/20',
      stroke: '#DC2626',
      icon: '🚨',
    };
  }

  return {
    label: 'Uncertain',
    color: 'text-truth-warning',
    bg: 'bg-truth-warning/20',
    stroke: '#EA580C',
    icon: '⚠️',
  };
};

export const scorePercent = (score) => Math.max(0, Math.min(100, (score / 10) * 100));

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 MB';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
};
