import { useMemo, useRef, useState } from 'react';

import { formatFileSize } from '../utils/scoreHelpers';

const ACCEPT_TEXT = 'MP4, MOV, AVI, WEBM up to 500MB';

const parseDuration = (seconds) => {
  if (!seconds || Number.isNaN(seconds)) {
    return 'Unknown';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
};

export default function UploadZone({ file, onFileChange, onAnalyze, disabled }) {
  const [dragActive, setDragActive] = useState(false);
  const [duration, setDuration] = useState(null);
  const inputRef = useRef(null);

  const fileInfo = useMemo(() => {
    if (!file) return null;
    return {
      name: file.name,
      size: formatFileSize(file.size),
      duration: parseDuration(duration),
    };
  }, [file, duration]);

  const handleFile = async (selectedFile) => {
    if (!selectedFile) {
      return;
    }

    onFileChange(selectedFile);

    const objectUrl = URL.createObjectURL(selectedFile);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = objectUrl;

    video.onloadedmetadata = () => {
      setDuration(video.duration || null);
      URL.revokeObjectURL(objectUrl);
    };

    video.onerror = () => {
      setDuration(null);
      URL.revokeObjectURL(objectUrl);
    };
  };

  const onDrop = async (event) => {
    event.preventDefault();
    setDragActive(false);
    const dropped = event.dataTransfer.files?.[0];
    await handleFile(dropped);
  };

  return (
    <div className="h-full w-full animate-riseIn">
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`panel group relative flex h-full cursor-pointer flex-col justify-center border-2 border-dashed p-8 transition-all duration-300 ${
          dragActive
            ? 'border-truth-accent shadow-[0_0_40px_rgba(79,125,255,0.35)]'
            : 'border-[var(--line)] hover:border-truth-accent'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/quicktime,video/x-msvideo,video/webm,.mp4,.mov,.avi,.webm"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />

        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full border border-[var(--line)] bg-[var(--accent-soft)] p-4 text-4xl">🛡️</div>
          <h2 className="font-display text-3xl font-semibold">Drop Video to Verify Truth</h2>
          <p className="text-muted mt-2">Drag and drop your file here or click to browse securely.</p>

          {fileInfo ? (
            <div className="mt-5 w-full max-w-xl rounded-2xl border border-[var(--line)] bg-[var(--accent-soft)] p-4 text-left">
              <p className="truncate text-sm">Name: {fileInfo.name}</p>
              <p className="text-muted text-sm">Size: {fileInfo.size}</p>
              <p className="text-muted text-sm">Duration: {fileInfo.duration}</p>
            </div>
          ) : null}

          <p className="text-muted mt-5 text-xs tracking-wide">Accepted formats: {ACCEPT_TEXT}</p>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onAnalyze();
            }}
            disabled={!file || disabled}
            className="mt-6 rounded-xl bg-truth-accent px-8 py-3 font-display text-lg font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Analyze Video
          </button>
        </div>
      </div>
    </div>
  );
}
