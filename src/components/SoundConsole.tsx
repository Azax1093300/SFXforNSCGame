import React, { useRef, useEffect, useState } from 'react';
import type { AudioFile } from '../types';
import { audioEngine } from '../utils/AudioEngine';
import { SpectrogramVisualizer } from './SpectrogramVisualizer';
import { useTranslation, useTheme } from '../context/AppContext';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Gauge,
  Sliders,
  Radio,
  Zap,
  Wind,
  Activity
} from 'lucide-react';

interface SoundConsoleProps {
  selectedFile: AudioFile | null;
  onEnded: () => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

export const SoundConsole: React.FC<SoundConsoleProps> = ({
  selectedFile,
  onEnded,
  isPlaying,
  setIsPlaying,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const waveCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const [activeTab, setActiveTab] = useState<'wave' | 'spectrum'>('wave');

  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isLooping, setIsLooping] = useState(false);
  const [filterFreq, setFilterFreq] = useState(20000);

  /* ── Waveform canvas animation ── */
  useEffect(() => {
    const canvas = waveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const isLight = theme === 'light';

      // grid colors
      ctx.strokeStyle = isLight ? 'rgba(17, 24, 39, 0.07)' : 'rgba(31,42,42,0.3)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 15) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let y = 0; y < H; y += 15) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

      // center line
      ctx.strokeStyle = isLight ? 'rgba(17, 24, 39, 0.18)' : 'rgba(149,255,149,0.12)';
      ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();

      if (isPlaying && analyserRef.current) {
        const analyser = analyserRef.current;
        const buf = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteTimeDomainData(buf);

        if (!isLight) {
          // Glow pass (only for CRT dark theme)
          ctx.strokeStyle = 'rgba(149, 255, 149, 0.25)';
          ctx.lineWidth = 6;
          ctx.shadowColor = 'rgba(149,255,149,1)';
          ctx.shadowBlur = 18;
          ctx.beginPath();
          buf.forEach((v, i) => {
            const x = (i / buf.length) * W;
            const y = ((v / 128) * H) / 2;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          });
          ctx.stroke();
        }

        // Sharp main line
        ctx.strokeStyle = isLight ? '#2b261f' : '#95ff95';
        ctx.lineWidth = 2;
        ctx.shadowBlur = isLight ? 0 : 4;
        ctx.beginPath();
        buf.forEach((v, i) => {
          const x = (i / buf.length) * W;
          const y = ((v / 128) * H) / 2;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.lineTo(W, H / 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        // Idle: organic breathing wave + static
        ctx.strokeStyle = isLight ? 'rgba(17, 24, 39, 0.4)' : 'rgba(149,255,149,0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const t = Date.now() * 0.003;
        for (let x = 0; x <= W; x += 2) {
          const y = H / 2
            + Math.sin(x * 0.025 + t) * 14
            + Math.sin(x * 0.06 - t * 0.7) * 7
            + (Math.random() - 0.5) * 2.5;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    draw();
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isPlaying, theme]);

  /* ── Play / Pause ── */
  const togglePlay = async () => {
    if (!selectedFile) return;
    if (isPlaying) {
      audioEngine.stopAllSounds();
      setIsPlaying(false);
      return;
    }

    audioEngine.init();
    let buffer: AudioBuffer;

    if (selectedFile.isCustom && selectedFile.blobUrl) {
      try {
        buffer = selectedFile.audioBuffer
          ?? await audioEngine.decodeAudioFile(
              await fetch(selectedFile.blobUrl)
                .then(r => r.blob())
                .then(b => new File([b], selectedFile.name))
            );
        selectedFile.audioBuffer = buffer;
      } catch {
        alert('DECRYPTION FAILED: Audio format unrecognized or corrupted.');
        return;
      }
    } else {
      buffer = audioEngine.createProceduralBuffer(selectedFile.proceduralType);
    }

    const { analyser, filter } = audioEngine.playCustomAudio(
      buffer,
      () => { setIsPlaying(false); onEnded(); },
      isLooping,
      playbackRate
    );
    analyserRef.current = analyser;
    filterNodeRef.current = filter;
    filter.frequency.setValueAtTime(filterFreq, 0);
    setIsPlaying(true);
  };

  useEffect(() => { audioEngine.setMasterVolume(isMuted ? 0 : volume); }, [volume, isMuted]);
  useEffect(() => {
    if (filterNodeRef.current)
      filterNodeRef.current.frequency.setTargetAtTime(filterFreq, 0, 0.05);
  }, [filterFreq]);

  const TRIGGERS = [
    { label: 'pingRadar',    fn: () => audioEngine.triggerPing(),         Icon: Activity, danger: false },
    { label: 'geigerTick',   fn: () => audioEngine.triggerGeiger(),       Icon: Zap,      danger: false },
    { label: 'morseSos',     fn: () => audioEngine.triggerMorse(),        Icon: Radio,    danger: false },
    { label: 'barrageBoom',  fn: () => audioEngine.triggerExplosion(),    Icon: Zap,      danger: true  },
    { label: 'whisperGhost', fn: () => audioEngine.triggerWhisper(),      Icon: Wind,     danger: true  },
    { label: 'radioScreech', fn: () => audioEngine.triggerRadioScreech(), Icon: Radio,    danger: true  },
  ];

  return (
    <div className="bunker-panel p-3 flex flex-col gap-3 font-mono text-xs select-none">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-bunker-panel pb-2">
        <div className="flex items-center gap-2">
          <Radio size={14} className="text-red-500 animate-pulse" />
          <span className="font-bold text-[11px] tracking-widest text-gray-500">
            {t('previewDeck')}
          </span>
        </div>
        {/* Visualizer tab switcher */}
        <div className="flex text-[9px] border border-bunker-panel rounded overflow-hidden">
          <button
            onClick={() => setActiveTab('wave')}
            className={`px-2 py-0.5 transition-colors ${activeTab === 'wave' ? 'bg-bunker-dark text-phosphor-green' : 'text-gray-600 hover:text-gray-400'}`}
          >{t('waveformTab')}</button>
          <button
            onClick={() => setActiveTab('spectrum')}
            className={`px-2 py-0.5 transition-colors ${activeTab === 'spectrum' ? 'bg-bunker-dark text-phosphor-green' : 'text-gray-600 hover:text-gray-400'}`}
          >{t('spectrogramTab')}</button>
        </div>
        <div className="flex items-center gap-1 bg-bunker-dark/40 border border-bunker-panel px-2 py-0.5 rounded text-[10px] text-gray-400">
          SYS: <span className={`ml-1 font-semibold ${isPlaying ? 'text-red-400 animate-pulse' : 'text-phosphor-green'}`}>
            {isPlaying ? t('sysTransmitting') : t('sysStandby')}
          </span>
        </div>
      </div>

      {/* Visualizer area */}
      <div className="relative border border-bunker-panel rounded bg-bunker-black overflow-hidden" style={{ height: 120 }}>
        {activeTab === 'wave' ? (
          <canvas ref={waveCanvasRef} width={600} height={120} className="w-full h-full" style={{ filter: theme === 'light' ? 'none' : 'drop-shadow(0 0 3px rgba(149,255,149,0.5))' }} />
        ) : (
          <SpectrogramVisualizer analyser={analyserRef.current} isPlaying={isPlaying} height={120} theme={theme} />
        )}

        {/* Top-left overlay */}
        <div className="absolute top-1.5 left-2 text-[9px] text-gray-500/30 pointer-events-none font-mono">
          CH:01 // {activeTab === 'wave' ? 'TIME_DOMAIN' : 'FREQ_DOMAIN'} // AUTO_SYNC
        </div>

        {/* File status badge */}
        {selectedFile && (
          <div className="absolute bottom-1.5 right-2 flex items-center gap-1.5 pointer-events-none">
            <span className={`text-[9px] font-bold tracking-widest px-1.5 py-0.5 border rounded ${
              selectedFile.corrupted
                ? 'border-red-700 text-red-500 bg-red-950/60'
                : 'border-phosphor-green/30 text-phosphor-green/70 bg-bunker-panel/40'
            }`}>
              {selectedFile.corrupted ? t('corruptedBadge') : t('decryptedBadge')}
            </span>
          </div>
        )}
      </div>

      {/* Controls row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

        {/* File info */}
        <div className="md:col-span-1 bg-bunker-dark/60 border border-bunker-panel rounded p-2.5 flex flex-col justify-center gap-1.5">
          {selectedFile ? (
            <>
              <div className="text-[11px] font-bold text-phosphor-green truncate">{selectedFile.name}</div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] text-gray-500 mt-0.5 font-mono">
                <span>CAT: <span className="text-gray-400">{selectedFile.category}</span></span>
                <span>SIZE: <span className="text-gray-400">{selectedFile.size}</span></span>
                <span>LEN: <span className="text-gray-400">{selectedFile.duration}</span></span>
                <span>UPD: <span className="text-gray-400">{selectedFile.lastUpdatedDate?.slice(0, 10)}</span></span>
              </div>
              {selectedFile.description && (
                <p className="text-[9px] text-gray-600 italic line-clamp-2 border-t border-bunker-panel pt-1 mt-0.5">
                  "{selectedFile.description}"
                </p>
              )}
            </>
          ) : (
            <div className="text-center text-gray-700 italic py-3 text-[11px] font-mono">{t('noAudioMounted')}</div>
          )}
        </div>

        {/* Sliders */}
        <div className="md:col-span-1 space-y-2">
          {[
            {
              label: isMuted ? t('mutedLabel') : t('volumeLabel'),
              icon: isMuted ? <VolumeX size={11}/> : <Volume2 size={11}/>,
              min: 0, max: 1, step: 0.05, value: volume,
              display: `${Math.round(volume * 100)}%`,
              onChange: (v: number) => { setVolume(v); setIsMuted(false); },
              onDblClick: () => setIsMuted(m => !m),
            },
            {
              label: t('filterLabel'),
              icon: <Sliders size={11}/>,
              min: 150, max: 20000, step: 50, value: filterFreq,
              display: filterFreq >= 20000 ? t('bypassFilter') : `${filterFreq}Hz`,
              onChange: (v: number) => setFilterFreq(v),
            },
            {
              label: t('rateLabel'),
              icon: <Gauge size={11}/>,
              min: 0.25, max: 2.0, step: 0.05, value: playbackRate,
              display: `${playbackRate.toFixed(2)}×`,
              onChange: (v: number) => setPlaybackRate(v),
            },
          ].map(sl => (
            <div key={sl.label} className="space-y-0.5">
              <div className="flex justify-between items-center text-[9px] text-gray-500">
                <span className="flex items-center gap-1">{sl.icon}{sl.label}</span>
                <span className="text-phosphor-green/80">{sl.display}</span>
              </div>
              <input
                type="range" min={sl.min} max={sl.max} step={sl.step} value={sl.value}
                onChange={e => sl.onChange(Number(e.target.value))}
                onDoubleClick={sl.onDblClick}
                className="w-full h-1 rounded accent-phosphor-green bg-bunker-dark cursor-pointer animate-none"
              />
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="md:col-span-1 flex flex-col gap-2">
          {/* Play + Loop */}
          <div className="flex gap-1.5">
            <button
              onClick={togglePlay}
              disabled={!selectedFile}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 border rounded font-bold text-[11px] tracking-wider transition-all ${
                !selectedFile ? 'border-bunker-panel text-gray-700 cursor-not-allowed' :
                isPlaying
                  ? 'border-red-600 bg-blood-dark/40 text-red-400 hover:bg-blood-dark/60'
                  : 'border-phosphor-green/60 bg-phosphor-green/5 text-phosphor-green hover:bg-phosphor-green/15'
              }`}
            >
              {isPlaying ? <Pause size={13}/> : <Play size={13}/>}
              {isPlaying ? t('haltBtn') : t('engageBtn')}
            </button>
            <button
              onClick={() => setIsLooping(l => !l)}
              disabled={!selectedFile}
              title="Toggle Loop"
              className={`px-3 border rounded transition-all ${
                !selectedFile ? 'border-bunker-panel text-gray-700 cursor-not-allowed' :
                isLooping ? 'border-phosphor-green bg-phosphor-green/10 text-phosphor-green' : 'border-bunker-panel text-gray-600 hover:text-gray-300'
              }`}
            >
              <RotateCcw size={13} className={isLooping ? 'animate-spin' : ''} style={{ animationDuration: '4s' }} />
            </button>
          </div>

          {/* Trigger pad */}
          <div className="grid grid-cols-3 gap-1 bg-bunker-black border border-bunker-panel p-1.5 rounded flex-1">
            {TRIGGERS.map(({ label, fn, Icon, danger }) => (
              <button
                key={label}
                onClick={fn}
                title={t(label as any)}
                className={`text-[8px] border py-1 px-0.5 rounded transition-all flex flex-col items-center gap-0.5 font-mono ${
                  danger
                    ? 'border-blood-dark hover:border-red-600 text-gray-600 hover:text-red-400 hover:bg-blood-dark/20'
                    : 'border-bunker-panel hover:border-phosphor-green/50 text-gray-600 hover:text-phosphor-green hover:bg-bunker-dark/60'
                }`}
              >
                <Icon size={10} />
                <span className="leading-none text-center truncate w-full">{t(label as any)}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
