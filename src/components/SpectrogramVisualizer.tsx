import React, { useRef, useEffect } from 'react';

interface SpectrogramProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  height?: number;
  theme?: 'dark' | 'light';
}

export const SpectrogramVisualizer: React.FC<SpectrogramProps> = ({ analyser, isPlaying, height = 80, theme = 'dark' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const isLight = theme === 'light';

    const draw = () => {
      animRef.current = requestAnimationFrame(draw);

      if (isPlaying && analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const freqData = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(freqData);

        // Scroll existing image left by 1px
        const existing = ctx.getImageData(1, 0, W - 1, H);
        ctx.putImageData(existing, 0, 0);

        // Draw new column at right edge
        for (let i = 0; i < H; i++) {
          const freqIdx = Math.floor((i / H) * bufferLength * 0.6);
          const val = freqData[freqIdx] / 255;

          let r = 0, g = 0, b = 0;
          if (isLight) {
            // Light (Dossier): White -> Charcoal -> Red
            if (val < 0.5) {
              const t = val / 0.5;
              r = Math.round(255 - t * (255 - 17));
              g = Math.round(255 - t * (255 - 24));
              b = Math.round(255 - t * (255 - 39));
            } else {
              const t = (val - 0.5) / 0.5;
              r = Math.round(17 + t * (220 - 17));
              g = Math.round(24 + t * (38 - 24));
              b = Math.round(39 - t * 1);
            }
          } else {
            // Dark (CRT): Black -> Green -> Yellow-Green -> Red
            if (val < 0.33) {
              r = 0; g = Math.round(val * 3 * 149); b = 0;
            } else if (val < 0.66) {
              const t = (val - 0.33) / 0.33;
              r = Math.round(t * 200); g = Math.round(149 + t * 50); b = 0;
            } else {
              const t = (val - 0.66) / 0.34;
              r = Math.round(200 + t * 55); g = Math.round(100 * (1 - t)); b = 0;
            }
          }

          ctx.fillStyle = `rgb(${r},${g},${b})`;
          ctx.fillRect(W - 1, H - 1 - i, 1, 1);
        }
      } else {
        // Idle: fade to background color with subtle noise lines
        if (isLight) {
          ctx.fillStyle = 'rgba(255,255,255,0.08)';
          ctx.fillRect(0, 0, W, H);

          if (Math.random() < 0.05) {
            const y = Math.floor(Math.random() * H);
            ctx.fillStyle = `rgba(17,24,39,${Math.random() * 0.08})`;
            ctx.fillRect(0, y, W, 1);
          }
        } else {
          ctx.fillStyle = 'rgba(11,15,15,0.08)';
          ctx.fillRect(0, 0, W, H);

          if (Math.random() < 0.05) {
            const y = Math.floor(Math.random() * H);
            ctx.fillStyle = `rgba(149,255,149,${Math.random() * 0.08})`;
            ctx.fillRect(0, y, W, 1);
          }
        }
      }
    };

    // Fill initial background
    ctx.fillStyle = isLight ? '#ffffff' : '#0b0f0f';
    ctx.fillRect(0, 0, W, H);

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [analyser, isPlaying, theme]);

  return (
    <div className="relative w-full overflow-hidden" style={{ height }}>
      {/* Freq axis labels */}
      <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-[8px] text-gray-700 font-mono py-0.5 z-10 pointer-events-none">
        <span>HF</span>
        <span>MF</span>
        <span>LF</span>
      </div>
      <canvas
        ref={canvasRef}
        width={580}
        height={height}
        className="w-full h-full ml-8"
        style={{ imageRendering: 'pixelated', filter: theme === 'light' ? 'none' : 'brightness(1.2)' }}
      />
      {/* Time axis */}
      <div className="absolute bottom-0 right-0 text-[8px] text-gray-700 font-mono pr-1 pointer-events-none">
        ◄ TIME
      </div>
      {/* Overlay label */}
      <div className="absolute top-1 left-9 text-[9px] text-gray-700 font-mono pointer-events-none">
        SPECTROGRAM // FFT:1024 // RANGE:0-8kHz
      </div>
    </div>
  );
};
