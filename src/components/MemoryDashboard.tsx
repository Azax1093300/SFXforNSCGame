import React, { useState } from 'react';
import type { AudioFile, Folder, MemoryLog } from '../types';
import { useTranslation } from '../context/AppContext';
import { 
  BarChart3, 
  Activity, 
  Terminal, 
  HardDrive, 
  Clock, 
  Star,
  Skull,
  Binary,
  AlertOctagon
} from 'lucide-react';
import { audioEngine } from '../utils/AudioEngine';

interface MemoryDashboardProps {
  files: AudioFile[];
  folders: Folder[];
  logs: MemoryLog[];
  onDecryptLog: (logId: string) => void;
  heartbeatBpm: number;
}

export const MemoryDashboard: React.FC<MemoryDashboardProps> = ({
  files,
  folders,
  logs,
  onDecryptLog,
  heartbeatBpm
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'logs'>('status');
  const { t, language } = useTranslation();

  // Compute metrics
  const totalFiles = files.length;
  const starredFiles = files.filter(f => f.starred).length;
  const corruptedFiles = files.filter(f => f.corrupted).length;
  const recentFiles = [...files].sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()).slice(0, 4);
  const recentFolders = [...folders].sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()).slice(0, 3);

  // Group files by category
  const categoriesMap: Record<string, number> = {};
  files.forEach(f => {
    categoriesMap[f.category] = (categoriesMap[f.category] || 0) + 1;
  });
  const categoriesList = Object.entries(categoriesMap).sort((a, b) => b[1] - a[1]);

  const getFolderName = (name: string) => {
    if (name === 'BATTLEFIELD_RECORDS') return t('folder_records');
    if (name === 'HALLUCINATIONS') return t('folder_hallucinations');
    if (name === 'RADIO_INTERCEPTS') return t('folder_intercepts');
    if (name === 'LOST_COMRADES') return t('folder_lost');
    return name;
  };

  const getCategoryName = (cat: string) => {
    if (cat === 'Battlefield') return language === 'th' ? 'สนามรบ' : 'Battlefield';
    if (cat === 'Hallucination') return language === 'th' ? 'ภาพหลอนประสาท' : 'Hallucination';
    if (cat === 'Radio Static') return language === 'th' ? 'สัญญาณวิทยุรบกวน' : 'Radio Static';
    if (cat === 'Whisper') return language === 'th' ? 'เสียงกระซิบ' : 'Whisper';
    if (cat === 'Nightmare') return language === 'th' ? 'ฝันร้าย' : 'Nightmare';
    if (cat === 'Flashback') return language === 'th' ? 'ภาพย้อนอดีต' : 'Flashback';
    if (cat === 'Enemy Voices') return language === 'th' ? 'เสียงข้าศึก' : 'Enemy Voices';
    if (cat === 'Ambient Horror') return language === 'th' ? 'ความสยองขวัญรอบข้าง' : 'Ambient Horror';
    if (cat === 'PTSD Episode') return language === 'th' ? 'อาการทางจิตหลอน' : 'PTSD Episode';
    if (cat === 'Screams') return language === 'th' ? 'เสียงกรีดร้อง' : 'Screams';
    if (cat === 'Gunfight') return language === 'th' ? 'การยิงต่อสู้' : 'Gunfight';
    if (cat === 'Emotional Memory') return language === 'th' ? 'ความจำทางอารมณ์' : 'Emotional Memory';
    if (cat === 'Lost Friend') return language === 'th' ? 'เพื่อนที่สูญเสีย' : 'Lost Friend';
    if (cat === 'Psychological Breakdown') return language === 'th' ? 'จิตใจพังทลาย' : 'Psychological Breakdown';
    return cat;
  };

  return (
    <div className="flex flex-col gap-4 font-mono text-xs select-none h-full overflow-y-auto pr-1">
      
      {/* Overview stats cards grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bunker-panel p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[var(--text-secondary)] font-bold">{t('totalArchivedFiles')}</div>
            <div className="text-xl font-bold text-phosphor-green glow-text mt-0.5">{totalFiles}</div>
          </div>
          <HardDrive size={24} className="text-phosphor-green/40" />
        </div>

        <div className="bunker-panel p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[var(--text-secondary)] font-bold">{t('mutilatedCorrupted')}</div>
            <div className="text-xl font-bold text-red-500 glow-text-danger mt-0.5">{corruptedFiles}</div>
          </div>
          <Skull size={24} className="text-red-500/40 animate-bounce" style={{ animationDuration: '3s' }} />
        </div>

        <div className="bunker-panel p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[var(--text-secondary)] font-bold">{t('markedEssentials')}</div>
            <div className="text-xl font-bold text-amber-500 mt-0.5">{starredFiles}</div>
          </div>
          <Star size={24} className="text-amber-500/40" />
        </div>

        <div className="bunker-panel p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-[var(--text-secondary)] font-bold">{t('bunkerHeartRate')}</div>
            <div className="text-xl font-bold text-red-500 glow-text-danger mt-0.5 flex items-baseline gap-1">
              <span>{heartbeatBpm}</span>
              <span className="text-[10px] text-red-700">BPM</span>
            </div>
          </div>
          <Activity size={24} className={`text-red-500/40 ${heartbeatBpm > 90 ? 'animate-ping' : 'animate-pulse'}`} />
        </div>
      </div>

      {/* Main interactive diagnostic dashboard tabs */}
      <div className="bunker-panel flex-1 flex flex-col min-h-[350px]">
        {/* Tab Headers */}
        <div className="flex border-b border-bunker-panel bg-bunker-dark/50">
          <button
            onClick={() => setActiveTab('status')}
            className={`flex items-center gap-1.5 px-4 py-2 border-r border-bunker-panel font-bold transition-all ${
              activeTab === 'status'
                ? 'text-phosphor-green bg-bunker-black border-b border-b-transparent'
                : 'text-[var(--text-secondary)] hover:text-phosphor-green'
            }`}
          >
            <Activity size={13} />
            {t('tabDiagnostics')}
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-1.5 px-4 py-2 border-r border-bunker-panel font-bold transition-all ${
              activeTab === 'logs'
                ? 'text-phosphor-green bg-bunker-black border-b border-b-transparent'
                : 'text-[var(--text-secondary)] hover:text-phosphor-green'
            }`}
          >
            <Terminal size={13} />
            {t('tabLogs')}
            {logs.filter(l => !l.decrypted).length > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            )}
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 p-3 min-h-0 overflow-y-auto">
          {activeTab === 'status' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
              
              {/* Left Col: Diagnostics & Timeline */}
              <div className="lg:col-span-2 space-y-3">
                <div className="border border-bunker-panel/40 bg-bunker-black/35 rounded p-3">
                  <div className="text-[11px] font-bold text-[var(--text-secondary)] mb-2 flex items-center gap-1.5">
                    <Clock size={12} className="text-phosphor-green" />
                    {t('timelineTitle')}
                  </div>
                  {recentFiles.length > 0 ? (
                    <div className="relative border-l border-bunker-panel/60 pl-3 ml-1.5 space-y-3 my-2">
                      {recentFiles.map(file => (
                        <div key={file.id} className="relative">
                          <div className="absolute -left-[16.5px] top-1.5 w-2 h-2 rounded-full bg-phosphor-green/60 border border-bunker-black"></div>
                          <div className="flex justify-between items-baseline text-[10px]">
                            <span className="text-phosphor-green font-bold truncate max-w-[200px]">
                              {file.name}
                            </span>
                            <span className="text-[var(--text-secondary)] font-mono">
                              {file.uploadDate}
                            </span>
                          </div>
                          <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 italic">
                            [{getCategoryName(file.category)}] &quot;{file.description || (language === 'th' ? 'ไม่มีการแนบบันทึกการประเมินความทรงจำ' : 'No evaluation notes attached.')}&quot;
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-[var(--text-secondary)] italic">
                      {t('timelineEmpty')}
                    </div>
                  )}
                </div>

                {/* Subfolder logs */}
                <div className="border border-bunker-panel/40 bg-bunker-black/35 rounded p-3">
                  <div className="text-[11px] font-bold text-[var(--text-secondary)] mb-2">{t('recentSectors')}</div>
                  <div className="space-y-1.5">
                    {recentFolders.map(folder => (
                      <div key={folder.id} className="flex justify-between items-center p-1.5 border border-bunker-panel/20 bg-bunker-black/50 rounded">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></span>
                          <span className="text-gray-400 font-bold">{getFolderName(folder.name)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-[var(--text-secondary)] font-mono">
                          <span className={`px-1 py-0.5 rounded-sm border text-[9px] badge-classification-${folder.classification.replace(/\s+/g, '-').toLowerCase()}`}>
                            {t('sectorClassification')} {folder.classification}
                          </span>
                          <span>{t('updateLabel')} {folder.lastModified}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Col: Category Frequency */}
              <div className="lg:col-span-1 space-y-3">
                <div className="border border-bunker-panel/40 bg-bunker-black/35 rounded p-3 h-full flex flex-col">
                  <div className="text-[11px] font-bold text-[var(--text-secondary)] mb-2 flex items-center gap-1.5">
                    <BarChart3 size={12} className="text-phosphor-green" />
                    {t('categoryWeights')}
                  </div>
                  {categoriesList.length > 0 ? (
                    <div className="flex-1 space-y-2 mt-1">
                      {categoriesList.map(([cat, val]) => {
                        const pct = Math.max(8, Math.min(100, (val / totalFiles) * 100));
                        const isHighParanoia = ['Nightmare', 'PTSD Episode', 'Screams', 'Lost Friend', 'Psychological Breakdown'].includes(cat);
                        return (
                          <div key={cat} className="space-y-0.5">
                            <div className="flex justify-between text-[10px]">
                              <span className={isHighParanoia ? 'text-red-400 font-semibold' : 'text-gray-400'}>{getCategoryName(cat)}</span>
                              <span className="text-phosphor-green">{val} ({Math.round((val / totalFiles) * 100)}%)</span>
                            </div>
                            <div className="w-full bg-bunker-black border border-bunker-panel/30 h-1.5 rounded-sm overflow-hidden">
                              <div 
                                className={`h-full ${isHighParanoia ? 'bg-red-700 shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 'bg-phosphor-green/60'}`}
                                style={{ width: `${pct}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-[var(--text-secondary)] italic flex-1 flex items-center justify-center">
                      {t('matrixVacant')}
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            // Recovered Memory Logs Decryption Interface
            <div className="flex flex-col gap-3 h-full">
              <div className="bg-bunker-black border border-bunker-panel rounded p-2 text-red-400 text-[10px] flex items-center gap-2 animate-pulse">
                <AlertOctagon size={14} className="text-red-500 flex-shrink-0" />
                <span>{t('journalDecryptWarning')}</span>
              </div>

              <div className="flex-1 space-y-3 mt-1">
                {logs.map(log => {
                  const senderKey = `${log.id}_sender` as any;
                  const contentKey = `${log.id}_content` as any;
                  const senderText = t(senderKey);
                  const logSender = senderText !== senderKey ? senderText : log.sender;
                  const contentText = t(contentKey);
                  const logContent = contentText !== contentKey ? contentText : log.content;

                  return (
                    <div 
                      key={log.id} 
                      className={`border rounded p-3 transition-all ${
                        log.decrypted 
                          ? 'border-bunker-panel bg-bunker-black/45' 
                          : 'border-red-950 bg-red-950/5 hover:bg-red-950/10'
                      }`}
                    >
                      <div className="flex justify-between items-center border-b border-bunker-panel/30 pb-1.5 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${log.decrypted ? 'bg-phosphor-green' : 'bg-red-600 animate-ping'}`}></span>
                          <span className={`font-bold ${log.decrypted ? 'text-gray-400' : 'text-red-400'}`}>
                            FRAGMENT_{logSender}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-[var(--text-secondary)]">
                          <span>TS: {log.timestamp}</span>
                          {!log.decrypted && (
                            <button
                              onClick={() => {
                                audioEngine.triggerRadioScreech();
                                onDecryptLog(log.id);
                              }}
                              className="flex items-center gap-1 px-2 py-0.5 border border-red-500/40 hover:border-red-500 text-red-500 hover:bg-red-950/20 text-[9px] rounded font-mono transition-all uppercase"
                            >
                              <Binary size={10} />
                              {t('decryptBtn')}
                            </button>
                          )}
                        </div>
                      </div>

                      {log.decrypted ? (
                        <p className="text-[11px] text-phosphor-green leading-relaxed whitespace-pre-line font-mono glow-text">
                          {logContent}
                        </p>
                      ) : (
                        <div className="font-mono text-red-950 flex items-center gap-2 text-[11px] select-none break-all">
                          <Binary size={12} className="text-red-950 animate-spin flex-shrink-0" style={{ animationDuration: '6s' }} />
                          <span className="tracking-widest">
                            {logContent.replace(/[^\s]/g, () => Math.round(Math.random()).toString())}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
