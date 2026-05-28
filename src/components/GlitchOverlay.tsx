import React, { useState, useEffect } from 'react';

// Random glitch messages that flash on screen
const GHOST_MESSAGES = [
  "THEY'RE STILL WATCHING",
  "HE NEVER CAME HOME",
  "THE RADIO LIED",
  "SECTOR 7 WAS A MISTAKE",
  "WE HEARD SCREAMING ALL NIGHT",
  "IT WASN'T AN ACCIDENT",
  "DON'T OPEN THE LOG FILES",
  "SGT. KOWALSKI IS STILL IN THERE",
  "SIGNAL LOST — 03:14AM",
  "HELP US",
  "REMEMBER US",
  "YOU LEFT US BEHIND",
  "THE FREQUENCY IS CHANGING",
];

interface GlitchOverlayProps {
  intensity: number; // 0-100 paranoia level
}

export const GlitchOverlay: React.FC<GlitchOverlayProps> = ({ intensity }) => {
  const [activeMessage, setActiveMessage] = useState<string | null>(null);
  const [glitchBars, setGlitchBars] = useState<Array<{ y: number; w: number; h: number; opacity: number }>>([]);
  const [chromaShift, setChromaShift] = useState(false);

  useEffect(() => {
    if (intensity <= 0) return;

    // Message interval — shorter when paranoia is high
    const msgInterval = Math.max(8000, 25000 - intensity * 170);
    const barInterval = Math.max(2000, 8000 - intensity * 60);

    const msgTimer = setInterval(() => {
      if (Math.random() < intensity / 100) {
        const msg = GHOST_MESSAGES[Math.floor(Math.random() * GHOST_MESSAGES.length)];
        setActiveMessage(msg);
        setTimeout(() => setActiveMessage(null), 600 + Math.random() * 400);
      }
    }, msgInterval);

    const barTimer = setInterval(() => {
      if (Math.random() < intensity / 120) {
        const count = Math.floor(Math.random() * 4) + 1;
        const bars = Array.from({ length: count }, () => ({
          y: Math.random() * 100,
          w: 20 + Math.random() * 80,
          h: 1 + Math.random() * 3,
          opacity: 0.1 + Math.random() * 0.25,
        }));
        setGlitchBars(bars);
        setChromaShift(true);
        setTimeout(() => {
          setGlitchBars([]);
          setChromaShift(false);
        }, 80 + Math.random() * 120);
      }
    }, barInterval);

    return () => {
      clearInterval(msgTimer);
      clearInterval(barTimer);
    };
  }, [intensity]);

  if (intensity <= 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[990]">
      {/* Chromatic aberration shift */}
      {chromaShift && (
        <div
          className="absolute inset-0"
          style={{
            background: 'transparent',
            mixBlendMode: 'screen',
            filter: 'url(#chromaFilter)',
          }}
        />
      )}

      {/* Glitch bars */}
      {glitchBars.map((bar, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: `${bar.y}%`,
            left: 0,
            width: `${bar.w}%`,
            height: `${bar.h}px`,
            background: `rgba(149,255,149,${bar.opacity})`,
            transform: `translateX(${Math.random() * 20 - 10}px)`,
          }}
        />
      ))}

      {/* Ghost message flash */}
      {activeMessage && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(11,15,15,0.6)' }}
        >
          <div
            className="text-center px-8 py-4"
            style={{
              fontFamily: '"VT323", monospace',
              fontSize: '2.5rem',
              color: '#ff3333',
              textShadow: '0 0 20px rgba(255,51,51,0.9), 3px 3px 0 rgba(0,0,0,0.8)',
              letterSpacing: '0.2em',
              animation: 'none',
            }}
          >
            {activeMessage}
          </div>
        </div>
      )}

      {/* SVG filter for chromatic aberration */}
      <svg className="absolute" style={{ width: 0, height: 0 }}>
        <defs>
          <filter id="chromaFilter" x="0" y="0" width="100%" height="100%">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="red"
            />
            <feOffset in="red" dx="3" dy="0" result="redShift" />
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="green"
            />
            <feOffset in="green" dx="-2" dy="0" result="greenShift" />
            <feBlend in="redShift" in2="greenShift" mode="screen" />
          </filter>
        </defs>
      </svg>
    </div>
  );
};
