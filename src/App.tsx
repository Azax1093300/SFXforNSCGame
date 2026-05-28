import React, { useState, useEffect } from 'react';
import type { Folder, AudioFile, MemoryLog } from './types';
import { FolderTree } from './components/FolderTree';
import { AudioLibrary } from './components/AudioLibrary';
import { SoundConsole } from './components/SoundConsole';
import { MemoryDashboard } from './components/MemoryDashboard';
import { BootScreen } from './components/BootScreen';
import { GlitchOverlay } from './components/GlitchOverlay';
import { useTranslation, useTheme } from './context/AppContext';
import { audioEngine } from './utils/AudioEngine';
import { 
  Skull, 
  VolumeX, 
  Volume2
} from 'lucide-react';


export const App: React.FC = () => {
  // --- Preloaded Database State (Local Storage backed) ---
  const [folders, setFolders] = useState<Folder[]>(() => {
    try {
      const saved = localStorage.getItem('memento_folders');
      return saved ? JSON.parse(saved) : [
        { id: 'f1', name: 'BATTLEFIELD_RECORDS', parentId: null, lastModified: '28-MAY-2026', classification: 'SECRET', paranoiaLevel: 30 },
        { id: 'f2', name: 'HALLUCINATIONS', parentId: null, lastModified: '28-MAY-2026', classification: 'TOP SECRET', paranoiaLevel: 80 },
        { id: 'f3', name: 'RADIO_INTERCEPTS', parentId: null, lastModified: '28-MAY-2026', classification: 'RESTRICTED', paranoiaLevel: 45 },
        { id: 'f4', name: 'LOST_COMRADES', parentId: 'f2', lastModified: '28-MAY-2026', classification: 'EYES ONLY', paranoiaLevel: 95 }
      ];
    } catch {
      return [
        { id: 'f1', name: 'BATTLEFIELD_RECORDS', parentId: null, lastModified: '28-MAY-2026', classification: 'SECRET', paranoiaLevel: 30 },
        { id: 'f2', name: 'HALLUCINATIONS', parentId: null, lastModified: '28-MAY-2026', classification: 'TOP SECRET', paranoiaLevel: 80 },
        { id: 'f3', name: 'RADIO_INTERCEPTS', parentId: null, lastModified: '28-MAY-2026', classification: 'RESTRICTED', paranoiaLevel: 45 },
        { id: 'f4', name: 'LOST_COMRADES', parentId: 'f2', lastModified: '28-MAY-2026', classification: 'EYES ONLY', paranoiaLevel: 95 }
      ];
    }
  });

  const [files, setFiles] = useState<AudioFile[]>(() => {
    const defaultFiles = [
      {
        id: 'file1',
        name: 'ARTILLERY_SECTOR_07.mp3',
        size: '2.4 MB',
        sizeBytes: 2516582,
        duration: '0:24',
        durationSec: 24,
        category: 'Battlefield',
        tags: ['battlefield', 'gunfight'],
        description: 'Heavy mortar fire recorded during the retreat at Sector 7. Low frequency shell thuds.',
        uploadDate: '28-MAY-2026 12:45:10',
        lastUpdatedDate: '28-MAY-2026 12:45:10',
        folderId: 'f1',
        starred: true,
        corrupted: false,
        isCustom: false,
        proceduralType: 'gunfight'
      },
      {
        id: 'file2',
        name: 'RAPID_FIRE_CONTACT.wav',
        size: '1.8 MB',
        sizeBytes: 1887436,
        duration: '0:18',
        durationSec: 18,
        category: 'Gunfight',
        tags: ['gunfight'],
        description: 'Close quarters skirmish inside trenches. Gunshots and distant screaming.',
        uploadDate: '28-MAY-2026 12:46:12',
        lastUpdatedDate: '28-MAY-2026 12:46:12',
        folderId: 'f1',
        starred: false,
        corrupted: false,
        isCustom: false,
        proceduralType: 'gunfight'
      },
      {
        id: 'file3',
        name: 'SURVIVOR_GUILT_ECHO.wav',
        size: '1.1 MB',
        sizeBytes: 1153433,
        duration: '0:30',
        durationSec: 30,
        category: 'Hallucination',
        tags: ['hallucination', 'whisper'],
        description: 'Auditory distortion of dead squadmate\'s voice asking why they were left behind.',
        uploadDate: '28-MAY-2026 13:02:40',
        lastUpdatedDate: '28-MAY-2026 13:02:40',
        folderId: 'f2',
        starred: true,
        corrupted: false,
        isCustom: false,
        proceduralType: 'whisper'
      },
      {
        id: 'file4',
        name: 'DISTANT_SCREAMS_NIGHT.ogg',
        size: '3.2 MB',
        sizeBytes: 3355443,
        duration: '0:45',
        durationSec: 45,
        category: 'Screams',
        tags: ['nightmare', 'screams'],
        description: 'Unidentified screams recurring at 03:00 hours. Paranoia trigger high.',
        uploadDate: '28-MAY-2026 13:10:05',
        lastUpdatedDate: '28-MAY-2026 13:10:05',
        folderId: 'f2',
        starred: false,
        corrupted: true,
        isCustom: false,
        proceduralType: 'screams'
      },
      {
        id: 'file5',
        name: 'WHITE_NOISE_BEACON.mp3',
        size: '850 KB',
        sizeBytes: 870400,
        duration: '0:12',
        durationSec: 12,
        category: 'Radio Static',
        tags: ['static'],
        description: 'Encrypted SOS distress beacon looping on frequency 88.4 MHz.',
        uploadDate: '28-MAY-2026 14:20:10',
        lastUpdatedDate: '28-MAY-2026 14:20:10',
        folderId: 'f3',
        starred: false,
        corrupted: false,
        isCustom: false,
        proceduralType: 'static'
      },
      {
        id: 'file6',
        name: 'SOS_MORSE_TRANS.wav',
        size: '1.5 MB',
        sizeBytes: 1572864,
        duration: '0:25',
        durationSec: 25,
        category: 'Radio Static',
        tags: ['static', 'sonar'],
        description: 'Telegraph code intercepted from an abandoned radar outpost.',
        uploadDate: '28-MAY-2026 14:25:33',
        lastUpdatedDate: '28-MAY-2026 14:25:33',
        folderId: 'f3',
        starred: false,
        corrupted: false,
        isCustom: false,
        proceduralType: 'sonar'
      },
      {
        id: 'file7',
        name: 'HEARTBEAT_EPISODE_02.wav',
        size: '4.1 MB',
        sizeBytes: 4300000,
        duration: '0:50',
        durationSec: 50,
        category: 'PTSD Episode',
        tags: ['heartbeat', 'lost friend'],
        description: 'Biometric cardiovascular feedback file recorded during panic episode at the memorial monument.',
        uploadDate: '28-MAY-2026 15:40:02',
        lastUpdatedDate: '28-MAY-2026 15:40:02',
        folderId: 'f4',
        starred: true,
        corrupted: false,
        isCustom: false,
        proceduralType: 'heartbeat'
      }
    ];
    try {
      const saved = localStorage.getItem('memento_files');
      return saved ? JSON.parse(saved) : defaultFiles;
    } catch {
      return defaultFiles;
    }
  });

  const [logs, setLogs] = useState<MemoryLog[]>(() => {
    const defaultLogs = [
      {
        id: 'log1',
        timestamp: '28-MAY-2026 10:14:22',
        sender: 'SGT_KOWALSKI',
        content: 'Day 42 inside Bunker 12. We lost comms with command three days ago. The static on the radio is changing. It sounds like whispers. I keep hearing my own name being Morse-coded. Or maybe my mind is leaking...',
        decrypted: false
      },
      {
        id: 'log2',
        timestamp: '28-MAY-2026 11:35:10',
        sender: 'PVT_MILLER',
        content: 'I can\'t close my eyes without seeing Sector 7. The flash of the artillery... the dirt in my throat... and Miller\'s hand reaching out from the rubble. I woke up with my hands shaking again. The hum in the bunker walls is driving me mad.',
        decrypted: false
      },
      {
        id: 'log3',
        timestamp: '28-MAY-2026 12:05:44',
        sender: 'CAPT_VANCE',
        content: 'CLASSIFIED LOG // FORWARD OPERATING STATION ALPHA. Memory corruption spreads. Biometrics show heartbeats exceeding 140BPM in active sleep. Sleep deprivation is triggering tactical visual hallucinations. The shadows are moving. We are not alone in this bunker.',
        decrypted: false
      }
    ];
    try {
      const saved = localStorage.getItem('memento_logs');
      return saved ? JSON.parse(saved) : defaultLogs;
    } catch {
      return defaultLogs;
    }
  });

  // --- UI Layout & Interaction States ---
  const [booted, setBooted] = useState<boolean>(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<AudioFile | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // Immersive variables
  const [heartbeatBpm, setHeartbeatBpm] = useState<number>(60);
  const [ambientStaticLevel, setAmbientStaticLevel] = useState<number>(0.2); // Default background static level
  const [audioEngineInitialized, setAudioEngineInitialized] = useState<boolean>(false);
  const [flashActive, setFlashActive] = useState<boolean>(false);
  const [screenGlitchActive, setScreenGlitchActive] = useState<boolean>(false);

  const { t, language, toggleLanguage } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const handleBootComplete = () => {
    setBooted(true);
    if (!audioEngineInitialized) {
      audioEngine.init();
      audioEngine.setStaticVolume(ambientStaticLevel);
      setAudioEngineInitialized(true);
    }
  };

  // Sync state with local storage
  useEffect(() => {
    localStorage.setItem('memento_folders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('memento_files', JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem('memento_logs', JSON.stringify(logs));
  }, [logs]);

  // Periodic random screen glitches (10x-15x more immersive horror vibe)
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      // 30% chance to glitch every 15 seconds
      if (Math.random() < 0.3) {
        setScreenGlitchActive(true);
        // Play sudden quick radio screech or geiger click
        if (audioEngineInitialized) {
          if (Math.random() < 0.5) {
            audioEngine.triggerGeiger(Math.floor(Math.random() * 4) + 2);
          } else {
            audioEngine.triggerRadioScreech();
          }
        }
        setTimeout(() => {
          setScreenGlitchActive(false);
        }, 300 + Math.random() * 300);
      }
    }, 15000);

    return () => clearInterval(glitchInterval);
  }, [audioEngineInitialized]);

  // Sync heartbeat speed state with selected folder's paranoia level
  useEffect(() => {
    if (!audioEngineInitialized) return;
    
    if (selectedFolderId) {
      const activeFolder = folders.find(f => f.id === selectedFolderId);
      if (activeFolder) {
        // High paranoia folder increases heartrate
        const paranoia = activeFolder.paranoiaLevel;
        const targetBpm = Math.round(60 + (paranoia * 0.9)); // Range: 60 - 150 BPM
        setHeartbeatBpm(targetBpm);
        audioEngine.setHeartbeatBpm(targetBpm);
        
        // Slightly increase ambient static for high paranoia
        audioEngine.setStaticVolume(ambientStaticLevel * (1 + paranoia / 100));
        return;
      }
    }
    
    // Default heartbeat and static when at root/low-paranoia
    setHeartbeatBpm(60);
    audioEngine.setHeartbeatBpm(60);
    audioEngine.setStaticVolume(ambientStaticLevel);
  }, [selectedFolderId, folders, audioEngineInitialized, ambientStaticLevel]);

  // Initialize audio engine on first click
  const handleInteractionInitAudio = () => {
    if (!audioEngineInitialized) {
      audioEngine.init();
      audioEngine.setStaticVolume(ambientStaticLevel);
      setAudioEngineInitialized(true);
    }
  };

  // Trigger red screen PTSD overlay flash
  const triggerPtsdFlash = () => {
    setFlashActive(true);
    if (audioEngineInitialized) {
      // Rapid heartbeat pulse
      audioEngine.setHeartbeatBpm(140);
      setTimeout(() => {
        setFlashActive(false);
        audioEngine.setHeartbeatBpm(selectedFolderId ? 95 : 60);
      }, 900);
    } else {
      setTimeout(() => setFlashActive(false), 900);
    }
  };

  // --- Folder Management Actions ---
  const handleCreateFolder = (name: string, parentId: string | null) => {
    const newFolder: Folder = {
      id: `f_${Date.now()}`,
      name: name.toUpperCase().replace(/\s+/g, '_'),
      parentId,
      lastModified: new Date().toLocaleDateString(),
      classification: parentId ? 'SECRET' : 'RESTRICTED',
      paranoiaLevel: Math.floor(Math.random() * 60) + 20 // random paranoia level
    };
    setFolders(prev => [...prev, newFolder]);
    
    // Spooky trigger
    if (audioEngineInitialized) {
      audioEngine.triggerGeiger(3);
    }
  };

  const handleRenameFolder = (folderId: string, newName: string) => {
    setFolders(prev => prev.map(f => f.id === folderId ? { 
      ...f, 
      name: newName.toUpperCase().replace(/\s+/g, '_'),
      lastModified: new Date().toLocaleDateString()
    } : f));
  };

  const handleDeleteFolder = (folderId: string) => {
    // Delete folders recursively
    const idsToDelete = [folderId];
    const findChildren = (id: string) => {
      folders.forEach(f => {
        if (f.parentId === id) {
          idsToDelete.push(f.id);
          findChildren(f.id);
        }
      });
    };
    findChildren(folderId);

    setFolders(prev => prev.filter(f => !idsToDelete.includes(f.id)));
    // Delete files in deleted folders
    setFiles(prev => prev.filter(f => !idsToDelete.includes(f.folderId)));
    
    if (selectedFolderId && idsToDelete.includes(selectedFolderId)) {
      setSelectedFolderId(null);
    }
  };

  // --- File Management Actions ---
  const handleUploadFile = async (file: File, folderId: string | null) => {
    // Show a loading/corruption mock delay for military atmosphere
    const targetFolderId = folderId || 'f1'; // fallback to first folder if root

    // Determine metadata
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    
    // Web Audio decode to find real duration
    let durationStr = '0:05';
    let durationSec = 5;
    let decodedBuffer: AudioBuffer | undefined = undefined;

    try {
      decodedBuffer = await audioEngine.decodeAudioFile(file);
      const minutes = Math.floor(decodedBuffer.duration / 60);
      const seconds = Math.floor(decodedBuffer.duration % 60);
      durationStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      durationSec = decodedBuffer.duration;
    } catch (e) {
      console.warn("Couldn't decode audio duration, defaulting.", e);
    }

    const categoriesList = [
      'Battlefield', 'Hallucination', 'Radio Static', 'Whisper', 'Nightmare',
      'Flashback', 'Enemy Voices', 'Ambient Horror', 'PTSD Episode', 'Screams',
      'Gunfight', 'Emotional Memory', 'Lost Friend', 'Psychological Breakdown'
    ];

    // Pick tag based on file name or default
    let category = 'Battlefield';
    const lowerName = file.name.toLowerCase();
    if (lowerName.includes('scream') || lowerName.includes('shout')) category = 'Screams';
    else if (lowerName.includes('static') || lowerName.includes('radio')) category = 'Radio Static';
    else if (lowerName.includes('whisper') || lowerName.includes('voice')) category = 'Whisper';
    else if (lowerName.includes('shoot') || lowerName.includes('gun') || lowerName.includes('fire')) category = 'Gunfight';
    else if (lowerName.includes('night') || lowerName.includes('scare') || lowerName.includes('horror')) category = 'Nightmare';
    else if (lowerName.includes('friend') || lowerName.includes('lost')) category = 'Lost Friend';
    else {
      // Pick random
      category = categoriesList[Math.floor(Math.random() * categoriesList.length)];
    }

    const newAudio: AudioFile = {
      id: `file_${Date.now()}`,
      name: file.name,
      size: `${sizeMB} MB`,
      sizeBytes: file.size,
      duration: durationStr,
      durationSec: durationSec,
      category,
      tags: [category.toLowerCase()],
      description: `Tactical memory record imported on node. Format: ${file.type}. Sector decryption confirmed.`,
      uploadDate: new Date().toLocaleString().toUpperCase(),
      lastUpdatedDate: new Date().toLocaleString().toUpperCase(),
      folderId: targetFolderId,
      starred: false,
      corrupted: false,
      isCustom: true,
      proceduralType: 'ambient', // placeholder
      blobUrl: URL.createObjectURL(file), // Local buffer url
      audioBuffer: decodedBuffer
    };

    setFiles(prev => [...prev, newAudio]);

    // Audio cues
    if (audioEngineInitialized) {
      audioEngine.triggerMorse();
    }
  };

  const handleUpdateFile = (fileId: string, updates: Partial<AudioFile>) => {
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, ...updates } : f));
    // If the currently previewed file is updated, update the selectedFile ref
    if (selectedFile && selectedFile.id === fileId) {
      setSelectedFile(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    if (selectedFile && selectedFile.id === fileId) {
      audioEngine.stopAllSounds();
      setIsPlaying(false);
      setSelectedFile(null);
    }
  };

  const handleMoveFile = (fileId: string, targetFolderId: string) => {
    handleUpdateFile(fileId, { folderId: targetFolderId });
  };

  // --- Log Fragment Decryption ---
  const handleDecryptLog = (logId: string) => {
    setLogs(prev => prev.map(l => l.id === logId ? { ...l, decrypted: true } : l));
    // Brief screen glitch trigger
    setScreenGlitchActive(true);
    setTimeout(() => setScreenGlitchActive(false), 200);
  };

  // Handle ambient background static level adjustments
  const handleStaticLevelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setAmbientStaticLevel(val);
    if (audioEngineInitialized) {
      audioEngine.setStaticVolume(val);
    }
  };

  if (!booted) {
    return <BootScreen onBootComplete={handleBootComplete} />;
  }

  const selectedFolder = folders.find(f => f.id === selectedFolderId);
  const currentParanoiaLevel = selectedFolder ? selectedFolder.paranoiaLevel : 0;

  return (
    <div 
      className={`crt-container theme-${theme} ${screenGlitchActive ? 'glitch-text' : ''}`}
      onClick={handleInteractionInitAudio}
    >
      {/* Scanline Grid, CRT vignette, flicker */}
      <div className="crt-scanlines"></div>
      <div className="crt-vignette"></div>
      <div className="crt-flicker"></div>
      <div className="crt-scanbar"></div>

      {/* PTSD Flash Overlay */}
      {flashActive && <div className="ptsd-overlay"></div>}

      {/* Glitch Overlay for ambient ghost overlays */}
      <GlitchOverlay intensity={currentParanoiaLevel} />

      {/* Main Terminal Frame */}
      <div className="flex flex-col h-screen w-screen overflow-hidden border border-bunker-panel p-2 bg-bunker-black">
        
        {/* Terminal Header Bar */}
        <header className="flex items-center justify-between border-b border-bunker-panel pb-2 mb-2">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-7 h-7 border border-red-500 rounded bg-[#1c0808]">
              <Skull className="text-red-500 animate-pulse" size={16} />
              <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full border border-bunker-black animate-ping" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-phosphor-green glow-text tracking-widest leading-none">
                {t('appTitle')}
              </h1>
              <span className="text-[9px] text-gray-500 tracking-wider font-mono">
                {t('systemSubtitle')}
              </span>
            </div>
          </div>

          {/* Central System Status */}
          <div className="hidden md:flex items-center gap-4 bg-bunker-dark/80 border border-bunker-panel px-3 py-1 rounded">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
              <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
                {t('warningRecallActive')}
              </span>
            </div>
            <div className="w-px h-3 bg-bunker-panel"></div>
            <div className="text-[9px] text-gray-500 font-mono">
              {t('nodesOnline')}
            </div>
          </div>

          {/* Audio Engine controls */}
          <div className="flex items-center gap-3">
            {/* Theme switcher */}
            <button 
              onClick={toggleTheme}
              className="p-1 border border-bunker-panel hover:border-phosphor-green bg-bunker-dark/60 rounded text-gray-400 hover:text-phosphor-green transition-all text-[9px] font-bold"
              title="Toggle Day/Night Terminal Mode"
            >
              {theme === 'dark' ? '☼ LIGHT' : '☾ DARK'}
            </button>

            {/* Language switcher */}
            <button 
              onClick={toggleLanguage}
              className="p-1 border border-bunker-panel hover:border-phosphor-green bg-bunker-dark/60 rounded text-gray-400 hover:text-phosphor-green font-bold transition-all text-[9px]"
              title="Toggle English/Thai language"
            >
              {language === 'en' ? 'TH 🇹🇭' : 'EN 🇬🇧'}
            </button>

            {/* Background Static level selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 font-mono flex items-center gap-0.5">
                {ambientStaticLevel > 0 ? <Volume2 size={12} /> : <VolumeX size={12} />}
                {t('backgroundStatic')}
              </span>
              <input 
                type="range"
                min="0"
                max="0.8"
                step="0.05"
                value={ambientStaticLevel}
                onChange={handleStaticLevelChange}
                className="w-16 accent-phosphor-green bg-bunker-dark h-1 rounded"
                title="Adjust background military radio noise level"
              />
            </div>

            {/* Click to enable initial sound prompt */}
            {!audioEngineInitialized && (
              <button 
                onClick={handleInteractionInitAudio}
                className="px-2 py-0.5 border border-red-500 hover:border-red-400 bg-red-950/20 text-red-500 hover:text-red-400 rounded text-[9px] font-bold animate-pulse"
              >
                {t('systemAudioUnmute')}
              </button>
            )}
          </div>
        </header>

        {/* Content Layout Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2.5 min-h-0 mb-2">
          
          {/* Left Panel: Folders Tree */}
          <div className="md:col-span-1 bunker-panel rounded flex flex-col min-h-0">
            <FolderTree 
              folders={folders}
              files={files}
              selectedFolderId={selectedFolderId}
              onSelectFolder={setSelectedFolderId}
              onCreateFolder={handleCreateFolder}
              onRenameFolder={handleRenameFolder}
              onDeleteFolder={handleDeleteFolder}
              onMoveFile={handleMoveFile}
              onTriggerPtsdFlash={triggerPtsdFlash}
            />
          </div>

          {/* Right Panel: Library Grid OR Dashboard view */}
          <div className="md:col-span-3 bunker-panel rounded p-3 flex flex-col min-h-0">
            {selectedFolderId !== null ? (
              <AudioLibrary 
                files={files}
                selectedFolderId={selectedFolderId}
                folders={folders}
                onSelectFile={setSelectedFile}
                selectedFileId={selectedFile ? selectedFile.id : null}
                onUploadFile={handleUploadFile}
                onUpdateFile={handleUpdateFile}
                onDeleteFile={handleDeleteFile}
              />
            ) : (
              // Root view displays active horror diagnostics and recovered soldier logs
              <MemoryDashboard 
                files={files}
                folders={folders}
                logs={logs}
                onDecryptLog={handleDecryptLog}
                heartbeatBpm={heartbeatBpm}
              />
            )}
          </div>

        </div>

        {/* Bottom Audio Control Console Dock */}
        <div className="w-full">
          <SoundConsole 
            selectedFile={selectedFile}
            onEnded={() => setIsPlaying(false)}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          />
        </div>

        {/* Console status footer */}
        <footer className="flex items-center justify-between border-t border-bunker-panel pt-1 mt-1 text-[9px] text-gray-600 font-mono">
          <span>{t('classificationRestricted')}</span>
          <span>{t('decKeyHash')}</span>
          <span className="flex items-center gap-1">
            {t('cursorLabel')}
            <span className="terminal-cursor"></span>
          </span>
        </footer>

      </div>
    </div>
  );
};
