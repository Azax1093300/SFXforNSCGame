import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/AppContext';
import type { TranslationKey } from '../utils/translations';

interface BootScreenProps {
  onBootComplete: () => void;
}

interface BootLine {
  key: TranslationKey | '';
  delay: number;
  color: string;
}

const BOOT_LINES: BootLine[] = [
  { key: 'bootTitle', delay: 0, color: 'var(--primary-glow)' },
  { key: 'bootCopyright', delay: 120, color: 'var(--text-secondary)' },
  { key: '', delay: 200, color: '' },
  { key: 'bootBios', delay: 280, color: 'var(--primary-glow)' },
  { key: 'bootOkKernel', delay: 400, color: '#4ade80' },
  { key: 'bootOkMount', delay: 520, color: '#4ade80' },
  { key: 'bootCorrupted', delay: 640, color: '#ef4444' },
  { key: 'bootForced', delay: 760, color: '#fbbf24' },
  { key: '', delay: 850, color: '' },
  { key: 'bootInitPtsd', delay: 920, color: 'var(--primary-glow)' },
  { key: 'bootLoadingTrauma', delay: 1050, color: 'var(--text-secondary)' },
  { key: 'bootDecryptingSfx', delay: 1170, color: 'var(--text-secondary)' },
  { key: 'bootHeartbeat', delay: 1290, color: 'var(--text-secondary)' },
  { key: 'bootStatic', delay: 1410, color: 'var(--text-secondary)' },
  { key: '', delay: 1500, color: '' },
  { key: 'bootWarningHazard', delay: 1560, color: '#ef4444' },
  { key: 'bootWarningClearance', delay: 1680, color: '#ef4444' },
  { key: '', delay: 1780, color: '' },
  { key: 'bootLoadingDb', delay: 1850, color: 'var(--primary-glow)' },
  { key: 'bootFragmentsRecovered', delay: 1970, color: 'var(--text-secondary)' },
  { key: 'bootSectorsOnline', delay: 2060, color: 'var(--text-secondary)' },
  { key: 'bootLogsPending', delay: 2150, color: 'var(--text-secondary)' },
  { key: '', delay: 2250, color: '' },
  { key: 'bootReady', delay: 2400, color: 'var(--primary-glow)' },
  { key: '', delay: 2520, color: '' },
  { key: 'bootEnterPrompt', delay: 2600, color: 'var(--primary-glow)' },
];

export const BootScreen: React.FC<BootScreenProps> = ({ onBootComplete }) => {
  const { t } = useTranslation();
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    BOOT_LINES.forEach((line, idx) => {
      timers.push(setTimeout(() => {
        setVisibleLines(prev => [...prev, idx]);
        const pct = Math.round(((idx + 1) / BOOT_LINES.length) * 100);
        setProgress(pct);
      }, line.delay));
    });

    timers.push(setTimeout(() => {
      setDone(true);
    }, 2800));

    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const handleEnter = () => {
    setFadeOut(true);
    setTimeout(onBootComplete, 700);
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-700 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: '#0b0f0f', cursor: done ? 'pointer' : 'default' }}
      onClick={done ? handleEnter : undefined}
    >
      {/* CRT Scanlines on boot */}
      <div className="crt-scanlines pointer-events-none" />
      <div className="crt-vignette pointer-events-none" />

      {/* Boot terminal window */}
      <div className="w-full max-w-3xl px-6 py-8 font-mono text-xs leading-relaxed">
        {/* Header stamp */}
        <div className="mb-6 border border-[#1f2a2a] p-3 text-center">
          <div className="text-[10px] text-gray-600 tracking-widest mb-1">
            ██████████████████████████████████████████████████████████
          </div>
          <div className="text-lg font-bold tracking-[0.35em]" style={{ color: '#95ff95', textShadow: '0 0 12px rgba(149,255,149,0.8)' }}>
            MEMENTO-WAR
          </div>
          <div className="text-[10px] tracking-widest text-gray-500 mt-1">
            TACTICAL PSYCHOLOGICAL AUDIO ARCHIVE SYSTEM
          </div>
          <div className="text-[10px] text-gray-600 tracking-widest mt-1">
            ██████████████████████████████████████████████████████████
          </div>
        </div>

        {/* Boot lines */}
        <div className="space-y-0.5 min-h-[280px]">
          {BOOT_LINES.map((line, idx) =>
            visibleLines.includes(idx) ? (
              <div
                key={idx}
                className="text-[11px] leading-5"
                style={{ color: line.color || 'transparent', fontFamily: '"Share Tech Mono", monospace' }}
              >
                {line.key ? t(line.key) : '\u00A0'}
              </div>
            ) : null
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-6 space-y-1">
          <div className="flex justify-between text-[10px] text-gray-600">
            <span>SYSTEM INIT PROGRESS</span>
            <span style={{ color: 'var(--primary-glow)' }}>{progress}%</span>
          </div>
          <div className="w-full h-1 bg-[#111111] border border-[#1f2a2a] rounded overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #3a4a3a, var(--primary-glow))',
                boxShadow: '0 0 8px rgba(149,255,149,0.5)',
              }}
            />
          </div>
        </div>

        {/* Enter prompt */}
        {done && (
          <div className="mt-8 text-center animate-pulse">
            <div className="text-sm tracking-[0.3em] font-bold" style={{ color: 'var(--primary-glow)', textShadow: '0 0 10px rgba(149,255,149,0.8)', fontFamily: '"VT323", monospace', fontSize: '20px' }}>
              {t('clickToAccess')}
            </div>
            <div className="text-[10px] text-gray-600 mt-2 tracking-widest">
              {t('courtMartialOffense')}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div className="mt-6 text-right text-[9px] text-gray-700 font-mono">
          TIMESTAMP: {new Date().toISOString().replace('T', ' ').slice(0, 19)} UTC // NODE: ALPHA-7 // SEC-LEVEL: EYES-ONLY
        </div>
      </div>
    </div>
  );
};
