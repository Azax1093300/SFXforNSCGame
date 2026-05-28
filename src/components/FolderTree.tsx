import React, { useState } from 'react';
import type { Folder, AudioFile } from '../types';
import { useTranslation } from '../context/AppContext';
import { 
  Folder as FolderIcon, 
  FolderOpen as FolderOpenIcon, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Trash2, 
  Edit3, 
  ShieldAlert
} from 'lucide-react';


interface FolderTreeProps {
  folders: Folder[];
  files: AudioFile[];
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: (name: string, parentId: string | null) => void;
  onRenameFolder: (folderId: string, newName: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onMoveFile: (fileId: string, targetFolderId: string) => void;
  onTriggerPtsdFlash: () => void;
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  folders,
  files,
  selectedFolderId,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveFile,
  onTriggerPtsdFlash
}) => {
  const { t } = useTranslation();

  const getFolderName = (name: string) => {
    if (name === 'BATTLEFIELD_RECORDS') return t('folder_records');
    if (name === 'HALLUCINATIONS') return t('folder_hallucinations');
    if (name === 'RADIO_INTERCEPTS') return t('folder_intercepts');
    if (name === 'LOST_COMRADES') return t('folder_lost');
    return name;
  };
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'root': true
  });
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [newFolderNameParentId, setNewFolderNameParentId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [draggedOverFolderId, setDraggedOverFolderId] = useState<string | null>(null);

  const toggleExpand = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders(prev => {
      const isCurrentlyExpanded = !!prev[folderId];
      // Play a quick clicking noise when opening/closing folders
      // triggers flash overlay if paranoia level is high
      const targetFolder = folders.find(f => f.id === folderId);
      if (!isCurrentlyExpanded && targetFolder && targetFolder.paranoiaLevel > 40) {
        onTriggerPtsdFlash();
      }
      return {
        ...prev,
        [folderId]: !isCurrentlyExpanded
      };
    });
  };

  const handleSelect = (folderId: string | null) => {
    const targetFolder = folders.find(f => f.id === folderId);
    if (targetFolder && targetFolder.paranoiaLevel > 50) {
      onTriggerPtsdFlash();
    }
    onSelectFolder(folderId);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim(), newFolderNameParentId);
      setNewFolderName('');
      setNewFolderNameParentId(null);
    }
  };

  const startRename = (folder: Folder, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolderId(folder.id);
    setEditName(folder.name);
  };

  const handleRenameSubmit = (folderId: string) => {
    if (editName.trim()) {
      onRenameFolder(folderId, editName.trim());
      setEditingFolderId(null);
    }
  };

  // Drag and drop mechanics for moving files
  const handleDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    setDraggedOverFolderId(folderId);
  };

  const handleDragLeave = () => {
    setDraggedOverFolderId(null);
  };

  const handleDrop = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    setDraggedOverFolderId(null);
    const fileId = e.dataTransfer.getData('text/plain');
    if (fileId) {
      onMoveFile(fileId, folderId);
    }
  };

  // Helper to render folders recursively
  const renderFolderNode = (folderId: string | null, depth: number = 0) => {
    const childFolders = folders.filter(f => f.parentId === folderId);
    
    return (
      <div key={folderId || 'root'} className="select-none">
        {/* Main Folder Row (skip root rendering as row, root is represented by sidebar header) */}
        {folderId !== null && (() => {
          const folder = folders.find(f => f.id === folderId)!;
          const isExpanded = !!expandedFolders[folder.id];
          const isSelected = selectedFolderId === folder.id;
          const isDraggedOver = draggedOverFolderId === folder.id;
          const fileCount = files.filter(f => f.folderId === folder.id).length;

          // Paranoia/PTSD warning styles
          const isParanoid = folder.paranoiaLevel > 60;
          const borderStyle = isDraggedOver
            ? 'border-phosphor-green bg-bunker-panel'
            : isSelected
              ? 'border-phosphor-green bg-bunker-panel/50'
              : 'border-transparent hover:bg-bunker-panel/30';

          return (
            <div
              className={`flex items-center justify-between p-1.5 my-0.5 border rounded cursor-pointer transition-all ${borderStyle}`}
              style={{ paddingLeft: `${depth * 12 + 6}px` }}
              onClick={() => handleSelect(folder.id)}
              onDragOver={(e) => handleDragOver(e, folder.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, folder.id)}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <button
                  onClick={(e) => toggleExpand(folder.id, e)}
                  className="p-0.5 hover:text-phosphor-green rounded text-gray-500"
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                {isExpanded ? (
                  <FolderOpenIcon 
                    size={16} 
                    className={isParanoid ? 'text-red-500 animate-pulse' : 'text-phosphor-green'} 
                  />
                ) : (
                  <FolderIcon 
                    size={16} 
                    className={isParanoid ? 'text-red-500' : 'text-phosphor-green/70'} 
                  />
                )}

                {editingFolderId === folder.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => handleRenameSubmit(folder.id)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(folder.id)}
                    className="bg-bunker-dark border border-phosphor-green text-phosphor-green text-xs px-1 py-0.5 rounded focus:outline-none w-28 font-mono"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className={`text-xs truncate ${isSelected ? 'glow-text font-bold text-phosphor-green' : 'text-gray-400'} ${isParanoid ? 'text-red-400 font-semibold' : ''}`}>
                    {getFolderName(folder.name)}
                  </span>
                )}

                {isParanoid && (
                  <span className="text-red-500 animate-pulse" title="High Paranoia Level folder">
                    <ShieldAlert size={12} />
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNewFolderNameParentId(folder.id);
                  }}
                  title="Add Subfolder"
                  className="p-0.5 hover:text-phosphor-green text-gray-500 transition-colors"
                >
                  <Plus size={12} />
                </button>
                <button
                  onClick={(e) => startRename(folder, e)}
                  title="Rename"
                  className="p-0.5 hover:text-phosphor-green text-gray-500 transition-colors"
                >
                  <Edit3 size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if(confirm(t('purgeConfirm', { name: getFolderName(folder.name) }))) {
                      onDeleteFolder(folder.id);
                    }
                  }}
                  title="Purge"
                  className="p-0.5 hover:text-red-500 text-gray-500 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
                <span className="text-[10px] text-gray-600 font-mono px-1">
                  ({fileCount})
                </span>
              </div>
            </div>
          );
        })()}

        {/* Subfolders expansion */}
        {(folderId === null || expandedFolders[folderId]) && (
          <div className="flex flex-col">
            {childFolders.map(child => renderFolderNode(child.id, depth + 1))}
            
            {/* Show inline creation form if this folder is currently targeted for a new subfolder */}
            {newFolderNameParentId === folderId && (
              <form 
                onSubmit={handleCreate}
                className="flex items-center gap-1 my-1 px-2"
                style={{ paddingLeft: `${(depth + 1) * 12 + 6}px` }}
              >
                <FolderIcon size={14} className="text-phosphor-green/40" />
                <input
                  type="text"
                  placeholder={t('newMemDir')}
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="bg-bunker-dark border border-dashed border-phosphor-green/50 text-phosphor-green text-xs px-1.5 py-0.5 rounded focus:outline-none w-28 font-mono"
                  autoFocus
                  onBlur={() => {
                    // Delay slightly to let click submit trigger if applicable
                    setTimeout(() => setNewFolderNameParentId(null), 200);
                  }}
                />
              </form>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full text-xs">
      {/* Sidebar Top Header */}
      <div className="flex items-center justify-between p-3 border-b border-bunker-panel">
        <span className="text-[11px] font-bold text-gray-500 tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-phosphor-green animate-pulse"></span>
          {t('menuTitle')}
        </span>
        <button
          onClick={() => setNewFolderNameParentId(null)} // root
          className="flex items-center gap-1 text-[10px] border border-phosphor-green/30 hover:border-phosphor-green px-1.5 py-0.5 rounded text-phosphor-green bg-bunker-panel/20 hover:bg-phosphor-green/10 transition-all font-mono"
        >
          <Plus size={10} />
          {t('newDir')}
        </button>
      </div>

      {/* Main Folder Navigation Body */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Root Directory Button */}
        <div 
          onClick={() => handleSelect(null)}
          className={`flex items-center gap-2 p-2 border rounded cursor-pointer mb-2 transition-all ${
            selectedFolderId === null 
              ? 'border-phosphor-green bg-bunker-panel/50 font-bold glow-text' 
              : 'border-transparent hover:bg-bunker-panel/30 text-gray-400'
          }`}
        >
          <FolderOpenIcon size={16} className="text-phosphor-green" />
          <span>{t('rootDirectory')}</span>
          <span className="ml-auto text-[10px] text-gray-500 font-mono">
            ({files.length})
          </span>
        </div>

        {/* Render nested tree */}
        <div className="space-y-0.5 border-l border-bunker-panel/40 ml-2">
          {renderFolderNode(null)}
        </div>
      </div>

      {/* Form for creating root directories when tree is empty or clicked outside */}
      {newFolderNameParentId === null && selectedFolderId === null && (
        <div className="p-3 border-t border-bunker-panel bg-bunker-dark/50">
          <form onSubmit={handleCreate} className="flex gap-1.5">
            <input
              type="text"
              placeholder={t('createRootDir')}
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="flex-1 bg-bunker-black border border-bunker-panel hover:border-phosphor-green/40 focus:border-phosphor-green text-phosphor-green text-xs px-2 py-1 rounded focus:outline-none font-mono"
            />
            <button
              type="submit"
              className="bg-bunker-panel hover:bg-phosphor-green/10 border border-bunker-panel hover:border-phosphor-green px-2 text-phosphor-green transition-all"
            >
              {t('addBtn')}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
