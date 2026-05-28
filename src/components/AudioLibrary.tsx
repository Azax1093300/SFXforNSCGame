import React, { useState, useRef } from 'react';
import type { AudioFile, Folder } from '../types';
import { useTranslation } from '../context/AppContext';
import { 
  Search, 
  Filter, 
  SortAsc, 
  Plus, 
  Star, 
  Trash2, 
  Skull, 
  Upload, 
  Clock, 
  Volume2,
  VolumeX,
  Edit2,
  Lock,
  Activity
} from 'lucide-react';


interface AudioLibraryProps {
  files: AudioFile[];
  selectedFolderId: string | null;
  folders: Folder[];
  onSelectFile: (file: AudioFile) => void;
  selectedFileId: string | null;
  onUploadFile: (file: File, folderId: string | null) => void;
  onUpdateFile: (fileId: string, updates: Partial<AudioFile>) => void;
  onDeleteFile: (fileId: string) => void;
}

export const AudioLibrary: React.FC<AudioLibraryProps> = ({
  files,
  selectedFolderId,
  folders,
  onSelectFile,
  selectedFileId,
  onUploadFile,
  onUpdateFile,
  onDeleteFile
}) => {
  const { t, language } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'duration' | 'name'>('newest');
  
  // File upload drag and mount progress states
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadIntercept = async (file: File) => {
    setUploadProgress(0);
    setUploadStatus(t('uploadConnecting'));
    
    const steps = [
      { pct: 15, msg: t('uploadMounting') },
      { pct: 40, msg: t('uploadDecompressing') },
      { pct: 70, msg: t('uploadDecrypting') },
      { pct: 90, msg: t('uploadAllocating') },
      { pct: 100, msg: t('uploadCompleted') }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 250 + Math.random() * 200));
      setUploadProgress(step.pct);
      setUploadStatus(step.msg);
    }

    onUploadFile(file, selectedFolderId);

    setTimeout(() => {
      setUploadProgress(null);
      setUploadStatus('');
    }, 400);
  };

  // Edit notes state
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editName, setEditName] = useState('');

  const currentFolder = folders.find(f => f.id === selectedFolderId);
  const filteredFiles = files.filter(file => {
    // Match folder
    if (file.folderId !== selectedFolderId) return false;
    // Match search query
    if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    // Match category
    if (selectedCategory !== 'ALL' && file.category !== selectedCategory) return false;
    return true;
  });

  // Sort files
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'duration') {
      return b.durationSec - a.durationSec;
    }
    return 0;
  });

  // Categories list
  const categories = [
    'Battlefield', 'Hallucination', 'Radio Static', 'Whisper', 'Nightmare',
    'Flashback', 'Enemy Voices', 'Ambient Horror', 'PTSD Episode', 'Screams',
    'Gunfight', 'Emotional Memory', 'Lost Friend', 'Psychological Breakdown'
  ];

  const getFolderName = (name: string) => {
    if (name === 'BATTLEFIELD_RECORDS') return t('folder_records');
    if (name === 'HALLUCINATIONS') return t('folder_hallucinations');
    if (name === 'RADIO_INTERCEPTS') return t('folder_intercepts');
    if (name === 'LOST_COMRADES') return t('folder_lost');
    return name;
  };

  const getCategoryName = (cat: string) => {
    if (cat === 'ALL' || cat === 'ALL_CATEGORIES') return language === 'th' ? 'ทุกหมวดหมู่' : 'ALL_CATEGORIES';
    if (cat === 'Battlefield') return language === 'th' ? 'สนามรบ' : 'BATTLEFIELD';
    if (cat === 'Hallucination') return language === 'th' ? 'ภาพหลอนประสาท' : 'HALLUCINATION';
    if (cat === 'Radio Static') return language === 'th' ? 'สัญญาณวิทยุรบกวน' : 'RADIO STATIC';
    if (cat === 'Whisper') return language === 'th' ? 'เสียงกระซิบ' : 'WHISPER';
    if (cat === 'Nightmare') return language === 'th' ? 'ฝันร้าย' : 'NIGHTMARE';
    if (cat === 'Flashback') return language === 'th' ? 'ภาพย้อนอดีต' : 'FLASHBACK';
    if (cat === 'Enemy Voices') return language === 'th' ? 'เสียงข้าศึก' : 'ENEMY VOICES';
    if (cat === 'Ambient Horror') return language === 'th' ? 'ความสยองขวัญรอบข้าง' : 'AMBIENT HORROR';
    if (cat === 'PTSD Episode') return language === 'th' ? 'อาการทางจิตหลอน' : 'PTSD EPISODE';
    if (cat === 'Screams') return language === 'th' ? 'เสียงกรีดร้อง' : 'SCREAMS';
    if (cat === 'Gunfight') return language === 'th' ? 'การยิงต่อสู้' : 'GUNFIGHT';
    if (cat === 'Emotional Memory') return language === 'th' ? 'ความจำทางอารมณ์' : 'EMOTIONAL MEMORY';
    if (cat === 'Lost Friend') return language === 'th' ? 'เพื่อนที่สูญเสีย' : 'LOST FRIEND';
    if (cat === 'Psychological Breakdown') return language === 'th' ? 'จิตใจพังทลาย' : 'PSYCHOLOGICAL BREAKDOWN';
    return cat.toUpperCase();
  };

  // Drag and Drop files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      droppedFiles.forEach(file => {
        // Limit to audio files
        if (file.type.startsWith('audio/') || file.name.endsWith('.mp3') || file.name.endsWith('.wav') || file.name.endsWith('.ogg')) {
          handleUploadIntercept(file);
        } else {
          alert(`File format "${file.name}" not recognized. Tactical archiver accepts MP3, WAV, OGG.`);
        }
      });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach(file => {
        handleUploadIntercept(file);
      });
    }
  };

  // Open note edit drawer
  const startEditing = (file: AudioFile, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFileId(file.id);
    setEditNotes(file.description || '');
    setEditName(file.name);
  };

  const saveEdits = (fileId: string) => {
    onUpdateFile(fileId, {
      name: editName,
      description: editNotes,
      lastUpdatedDate: new Date().toLocaleString()
    });
    setEditingFileId(null);
  };

  return (
    <div 
      className="flex flex-col h-full font-mono text-xs select-none relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      
      {/* File Dragging Visual overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-bunker-black/90 border-2 border-dashed border-phosphor-green z-50 flex flex-col items-center justify-center gap-4 text-center">
          <Upload size={48} className="text-phosphor-green animate-bounce" />
          <span className="text-sm font-bold glow-text">{t('releaseToMount')}</span>
          <span className="text-[10px] text-gray-500">{t('supportsFormats')}</span>
        </div>
      )}

      {/* Upload Progress Overlay */}
      {uploadProgress !== null && (
        <div className="absolute inset-0 bg-bunker-black/95 border border-phosphor-green z-50 flex flex-col items-center justify-center gap-4 text-center p-6">
          <Activity size={48} className="text-phosphor-green animate-pulse" />
          <span className="text-sm font-bold glow-text tracking-widest">{uploadStatus}</span>
          
          <div className="w-64 space-y-1">
            <div className="flex justify-between text-[10px] text-gray-500">
              <span>{t('decryptProgress')}</span>
              <span className="text-phosphor-green">{uploadProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#111111] border border-[#1f2a2a] rounded overflow-hidden">
              <div 
                className="h-full bg-phosphor-green transition-all duration-300"
                style={{ width: `${uploadProgress}%`, boxShadow: '0 0 8px rgba(149,255,149,0.8)' }}
              />
            </div>
          </div>
          <span className="text-[9px] text-red-500 font-bold uppercase tracking-widest animate-pulse mt-2">
            {t('doNotDisconnect')}
          </span>
        </div>
      )}

      {/* Library Filter Header */}
      <div className="bunker-panel p-3 flex flex-wrap items-center justify-between gap-3 mb-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <span className="absolute left-2.5 top-2 text-gray-500">
            <Search size={14} />
          </span>
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bunker-black border border-bunker-panel hover:border-phosphor-green/40 focus:border-phosphor-green pl-8 pr-3 py-1.5 rounded focus:outline-none text-phosphor-green font-mono text-xs"
          />
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 flex items-center gap-1">
              <Filter size={12} />
              {t('tagLabel')}
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-bunker-black border border-bunker-panel hover:border-phosphor-green/40 text-phosphor-green px-2 py-1 rounded focus:outline-none font-mono text-xs"
            >
              <option value="ALL">{getCategoryName('ALL')}</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{getCategoryName(cat)}</option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500 flex items-center gap-1">
              <SortAsc size={12} />
              {t('sortLabel')}
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-bunker-black border border-bunker-panel hover:border-phosphor-green/40 text-phosphor-green px-2 py-1 rounded focus:outline-none font-mono text-xs"
            >
              <option value="newest">{language === 'th' ? 'ใหม่ล่าสุดก่อน' : 'NEWEST_FIRST'}</option>
              <option value="oldest">{language === 'th' ? 'เก่าที่สุดก่อน' : 'OLDEST_FIRST'}</option>
              <option value="name">{language === 'th' ? 'ตามตัวอักษร' : 'ALPHABETICAL'}</option>
              <option value="duration">{language === 'th' ? 'ตามความยาว' : 'DURATION'}</option>
            </select>
          </div>

          {/* Add file manually */}
          <button
            onClick={triggerFileInput}
            className="flex items-center gap-1 border border-phosphor-green/40 hover:border-phosphor-green px-3 py-1 rounded bg-phosphor-green/10 hover:bg-phosphor-green/20 text-phosphor-green font-bold transition-all"
          >
            <Plus size={12} />
            {t('mountAudioBtn')}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="audio/*"
            multiple
            className="hidden"
          />
        </div>
      </div>

      {/* Directory path header */}
      <div className="flex items-center justify-between border-b border-bunker-panel/40 pb-2 mb-3">
        <span className="text-[11px] text-gray-500 font-bold">
          {t('dirLabel')} {currentFolder ? getFolderName(currentFolder.name).toUpperCase() : 'ROOT'}
          {currentFolder && (
            <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded border badge-classification-${currentFolder.classification.replace(/\s+/g, '-').toLowerCase()}`}>
              {t('sectorRestriction')} {currentFolder.classification}
            </span>
          )}
        </span>
        <span className="text-gray-600 text-[10px]">
          {t('mountedMemories')}: {sortedFiles.length} / {files.length}
        </span>
      </div>

      {/* Files Grid */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-1">
        {sortedFiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedFiles.map(file => {
              const isSelected = selectedFileId === file.id;
              const isCorrupt = file.corrupted;

              // Setup styles matching classification stamp
              const bgClass = isSelected 
                ? 'border-phosphor-green bg-bunker-panel/60 shadow-[0_0_15px_rgba(149,255,149,0.1)]' 
                : isCorrupt
                  ? 'border-red-950 hover:border-red-600/50 bg-red-950/5 hover:bg-red-950/10'
                  : 'border-bunker-panel hover:border-phosphor-green/40 hover:bg-bunker-panel/20';

              return (
                <div
                  key={file.id}
                  onClick={() => onSelectFile(file)}
                  className={`border rounded p-3 cursor-pointer flex flex-col justify-between transition-all relative overflow-hidden ${bgClass}`}
                >
                  {/* Corrupted noise static background overlay */}
                  {isCorrupt && (
                    <div className="absolute inset-0 bg-repeat bg-center opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
                  )}

                  {/* Top card bar: Tag, Star, Delete */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[9px] px-1.5 py-0.5 border rounded uppercase ${
                      isCorrupt 
                        ? 'border-red-700 text-red-500 bg-red-950/20' 
                        : 'border-phosphor-green/30 text-phosphor-green/70 bg-bunker-panel/40'
                    }`}>
                      {getCategoryName(file.category)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateFile(file.id, { starred: !file.starred });
                        }}
                        className={`p-1 rounded hover:bg-bunker-panel/40 transition-colors ${
                          file.starred ? 'text-amber-500' : 'text-gray-600 hover:text-gray-400'
                        }`}
                      >
                        <Star size={12} fill={file.starred ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateFile(file.id, { corrupted: !file.corrupted });
                        }}
                        className={`p-1 rounded hover:bg-bunker-panel/40 transition-colors ${
                          isCorrupt ? 'text-red-500 animate-pulse' : 'text-gray-600 hover:text-red-500'
                        }`}
                        title="Corrupt Memory Signature"
                      >
                        <Skull size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if(confirm(t('eraseConfirm').replace('{name}', file.name))) {
                            onDeleteFile(file.id);
                          }
                        }}
                        className="p-1 rounded hover:bg-bunker-panel/40 text-gray-600 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Middle Area: File Name & Information */}
                  <div className="space-y-1">
                    <div className={`font-bold text-[11px] truncate flex items-center gap-1.5 ${isCorrupt ? 'text-red-500 line-through' : 'text-gray-200'}`}>
                      {isCorrupt ? (
                        <>
                          <Lock size={11} className="text-red-700" />
                          <span>{file.name.replace(/[a-zA-Z]/g, '#')}</span>
                        </>
                      ) : (
                        <>
                          {isSelected && <Volume2 size={12} className="text-phosphor-green animate-pulse" />}
                          <span>{file.name}</span>
                        </>
                      )}
                    </div>
                    
                    {editingFileId === file.id ? (
                      <div className="space-y-1 my-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-bunker-dark border border-phosphor-green text-phosphor-green px-1.5 py-0.5 rounded text-[10px] font-mono focus:outline-none"
                        />
                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          rows={2}
                          className="w-full bg-bunker-dark border border-phosphor-green/50 text-phosphor-green px-1.5 py-0.5 rounded text-[9px] font-mono focus:outline-none resize-none"
                          placeholder={t('addClassifiedNotes')}
                        />
                        <div className="flex gap-1 justify-end">
                          <button 
                            onClick={() => saveEdits(file.id)}
                            className="bg-phosphor-green/10 border border-phosphor-green text-phosphor-green text-[9px] px-1.5 py-0.5 rounded"
                          >
                            {t('saveBtn')}
                          </button>
                          <button 
                            onClick={() => setEditingFileId(null)}
                            className="border border-bunker-panel text-gray-500 text-[9px] px-1.5 py-0.5 rounded"
                          >
                            {t('cancelBtn')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className={`text-[10px] line-clamp-2 italic min-h-[28px] ${isCorrupt ? 'text-red-950' : 'text-gray-500'}`}>
                        {file.description || (language === 'th' ? 'ไม่มีการแนบบันทึกการประเมินความทรงจำ' : 'No evaluation notes attached.')}
                      </p>
                    )}
                  </div>

                  {/* Bottom Stats Footer */}
                  <div className="flex items-center justify-between border-t border-bunker-panel/20 pt-2 mt-3 text-[9px] text-gray-600 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock size={9} />
                      {file.duration}
                    </span>
                    <span>{file.size}</span>
                    <div className="flex items-center gap-1.5">
                      {!editingFileId && (
                        <button
                          onClick={(e) => startEditing(file, e)}
                          className="text-gray-500 hover:text-phosphor-green p-0.5"
                          title="Edit Document Info"
                        >
                          <Edit2 size={10} />
                        </button>
                      )}
                      <span>{t('classifiedBadge')}</span>
                    </div>
                  </div>

                  {/* Absolute Dossier Stamp style overlay for selected */}
                  {isSelected && (
                    <div className="absolute top-2 right-12 text-[10px] font-bold text-phosphor-green/15 tracking-widest border border-phosphor-green/10 rounded px-1 rotate-12 pointer-events-none">
                      {t('mountedStamp')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border border-dashed border-bunker-panel rounded p-8 text-center text-gray-600 flex flex-col items-center justify-center gap-3">
            <VolumeX size={32} className="text-gray-700" />
            <div>
              <div className="font-bold text-xs uppercase tracking-wide">{t('noAudioRecords')}</div>
              <div className="text-[10px] text-gray-600 mt-1 max-w-xs mx-auto">
                {t('noAudioRecordsDesc')}
              </div>
            </div>
            <button
              onClick={triggerFileInput}
              className="mt-2 text-[10px] border border-bunker-panel hover:border-phosphor-green hover:text-phosphor-green px-3 py-1 rounded bg-bunker-panel/20 transition-all font-mono"
            >
              {t('dragOrUpload')}
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
