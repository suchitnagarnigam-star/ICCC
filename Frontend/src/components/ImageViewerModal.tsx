import React, { useEffect, useState } from 'react';

interface ImageViewerModalProps {
  isOpen: boolean;
  imageUrl: string;
  title?: string;
  fileName?: string;
  onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  isOpen,
  imageUrl,
  title,
  fileName,
  onClose,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setZoomLevel(1);
      setIsLoading(true);
      setHasError(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') setZoomLevel((z) => Math.min(z + 0.25, 3));
      if (e.key === '-') setZoomLevel((z) => Math.max(z - 0.25, 0.5));
      if (e.key === '0') setZoomLevel(1);
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, imageUrl, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(10, 25, 47, 0.88)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#0f172a',
          borderRadius: '12px',
          border: '1px solid #334155',
          maxWidth: '92vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          width: '800px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1.25rem',
            borderBottom: '1px solid #334155',
            backgroundColor: '#1e293b',
          }}
        >
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#f8fafc', fontWeight: 600 }}>
              {title || 'Evidence Photo Inspector'}
            </h4>
            {fileName && (
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                {fileName}
              </span>
            )}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.5))}
              style={{
                background: '#334155',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 8px',
                cursor: 'pointer',
              }}
              title="Zoom Out (-)"
            >
              🔍 -
            </button>
            <span style={{ fontSize: '0.8rem', color: '#cbd5e1', minWidth: '45px', textAlign: 'center' }}>
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 3))}
              style={{
                background: '#334155',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 8px',
                cursor: 'pointer',
              }}
              title="Zoom In (+)"
            >
              🔍 +
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              style={{
                background: '#334155',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 8px',
                cursor: 'pointer',
              }}
              title="Reset Zoom (0)"
            >
              Reset
            </button>
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                background: '#0284c7',
                color: '#fff',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '0.8rem',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Open Original
            </a>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '4px 10px',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Viewport */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#020617',
            padding: '1.5rem',
            minHeight: '380px',
          }}
        >
          {isLoading && !hasError && (
            <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading image...</div>
          )}
          {hasError && (
            <div style={{ color: '#f87171', fontSize: '0.9rem' }}>
              Unable to preview file. Click &quot;Open Original&quot; to view.
            </div>
          )}
          <img
            src={imageUrl}
            alt={title || 'Evidence inspection'}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            style={{
              maxWidth: '100%',
              maxHeight: '70vh',
              transform: `scale(${zoomLevel})`,
              transition: 'transform 0.15s ease',
              display: hasError ? 'none' : 'block',
              borderRadius: '4px',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
          />
        </div>
      </div>
    </div>
  );
};
export default ImageViewerModal;
