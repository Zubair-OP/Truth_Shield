import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

import AnalyzingScreen from './components/AnalyzingScreen';
import ResultsDashboard from './components/ResultsDashboard';
import UploadZone from './components/UploadZone';
import { useVideoAnalysis } from './hooks/useVideoAnalysis';

function App() {
  const [file, setFile] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('truth-shield-theme') || 'dark');
  const { phase, progress, step, result, error, analyze, reset, isBusy } = useVideoAnalysis();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('truth-shield-theme', theme);
  }, [theme]);

  const onAnalyze = async () => {
    if (!file) return;
    await analyze(file);
  };

  const resetAll = () => {
    setFile(null);
    reset();
  };

  return (
    <main className="app-shell">
      <aside className="side-nav">
        <div>
          <div className="brand-block">
            <span className="brand-dot" aria-hidden="true" />
            <div>
              <p className="brand-title">Truth Shield</p>
              <p className="brand-subtitle">Integrity Console</p>
            </div>
          </div>

          <nav className="nav-stack" aria-label="Main Navigation">
            <button type="button" className="nav-item nav-item--active">
              Analysis
            </button>
            <button type="button" className="nav-item">
              Uploads
            </button>
            <button type="button" className="nav-item">
              Signals
            </button>
            <button type="button" className="nav-item">
              Settings
            </button>
          </nav>
        </div>

        <div className="help-card">
          <p className="help-title">Need fast verification?</p>
          <p className="help-text">Drop a clip and get authenticity scoring in under 2 minutes.</p>
        </div>
      </aside>

      <section className="main-panel">
        <header className="top-header">
          <div>
            <p className="project-kicker">Project Heading</p>
            <h1 className="project-title">Truth Shield Analytics Dashboard</h1>
          </div>

          <div className="header-controls">
            <button
              type="button"
              onClick={() => setTheme((curr) => (curr === 'dark' ? 'light' : 'dark'))}
              className="theme-toggle"
              aria-label="Toggle dark and light theme"
            >
              <span className="toggle-icon" aria-hidden="true">
                {theme === 'dark' ? '☾' : '☀'}
              </span>
              <span>{theme === 'dark' ? 'Dark' : 'Light'}</span>
            </button>
          </div>
        </header>

        <div className={`content-area ${result ? 'content-area--results' : ''}`}>
          {!result ? (
            <UploadZone file={file} onFileChange={setFile} onAnalyze={onAnalyze} disabled={isBusy} />
          ) : (
            <ResultsDashboard result={result} onReset={resetAll} />
          )}

          {phase === 'error' ? <p className="error-banner">{error}</p> : null}
        </div>
      </section>

      {isBusy ? <AnalyzingScreen progress={progress} step={step} /> : null}

      <ToastContainer
        position="top-right"
        autoClose={2200}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme={theme === 'dark' ? 'dark' : 'light'}
      />
    </main>
  );
}

export default App;
