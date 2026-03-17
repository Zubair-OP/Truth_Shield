import { useMemo, useState } from 'react';

const initialState = {
  phase: 'idle',
  progress: 0,
  step: 'Waiting...',
  result: null,
  error: null,
};

export const useVideoAnalysis = () => {
  const [state, setState] = useState(initialState);

  const reset = () => setState(initialState);

  const analyze = async (file) => {
    if (!file) {
      return;
    }

    setState({ phase: 'uploading', progress: 5, step: 'Uploading...', result: null, error: null });

    const formData = new FormData();
    formData.append('video', file);

    let eventSource;

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to start analysis.');
      }

      setState((prev) => ({ ...prev, phase: 'processing', step: 'Queued for analysis...' }));

      await new Promise((resolve, reject) => {
        eventSource = new EventSource(data.eventStream);

        eventSource.onmessage = (event) => {
          const payload = JSON.parse(event.data);

          if (payload.status === 'completed') {
            setState({
              phase: 'completed',
              progress: 100,
              step: 'Complete',
              result: payload.result,
              error: null,
            });
            eventSource.close();
            resolve();
            return;
          }

          if (payload.status === 'failed') {
            setState({
              phase: 'error',
              progress: 100,
              step: 'Failed',
              result: null,
              error: payload.error || 'Analysis failed.',
            });
            eventSource.close();
            reject(new Error(payload.error || 'Analysis failed.'));
            return;
          }

          setState((prev) => ({
            ...prev,
            phase: 'processing',
            progress: payload.progress ?? prev.progress,
            step: payload.step ?? prev.step,
          }));
        };

        eventSource.onerror = () => {
          eventSource.close();
          reject(new Error('Connection to progress stream was interrupted.'));
        };
      });
    } catch (error) {
      if (eventSource) {
        eventSource.close();
      }
      setState({
        phase: 'error',
        progress: 100,
        step: 'Failed',
        result: null,
        error: error.message || 'Something went wrong.',
      });
    }
  };

  const isBusy = useMemo(() => ['uploading', 'processing'].includes(state.phase), [state.phase]);

  return {
    ...state,
    analyze,
    reset,
    isBusy,
  };
};
