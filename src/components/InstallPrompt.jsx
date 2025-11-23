import React, { useState, useEffect } from 'react';

const InstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setShowPrompt(false);
        }
    };

    if (!showPrompt) return null;

    return (
        <div className="install-prompt">
            <div className="install-content">
                <span className="install-text">Install QuestLog for a better experience!</span>
                <div className="install-actions">
                    <button onClick={() => setShowPrompt(false)} className="btn btn-secondary btn-sm">Later</button>
                    <button onClick={handleInstallClick} className="btn btn-primary btn-sm">Install App</button>
                </div>
            </div>

            <style>{`
        .install-prompt {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 400px;
          background: var(--bg-card);
          border: 1px solid var(--accent-primary);
          border-radius: var(--radius-lg);
          padding: var(--spacing-md);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          z-index: 1000;
          animation: slideUp 0.5s ease-out;
        }
        .install-content {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          text-align: center;
        }
        .install-actions {
          display: flex;
          justify-content: center;
          gap: var(--spacing-md);
        }
        @keyframes slideUp {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
        </div>
    );
};

export default InstallPrompt;
