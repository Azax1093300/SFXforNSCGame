export interface AudioFile {
  id: string;
  name: string;
  size: string;
  sizeBytes: number;
  duration: string;
  durationSec: number;
  category: string;
  tags: string[];
  description: string;
  uploadDate: string;
  lastUpdatedDate: string;
  folderId: string; // references Folder.id
  starred: boolean;
  corrupted: boolean;
  isCustom: boolean;
  proceduralType: 'ambient' | 'static' | 'screams' | 'gunfight' | 'heartbeat' | 'whisper' | 'sonar';
  blobUrl?: string;
  audioBuffer?: AudioBuffer;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  lastModified: string;
  classification: 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET' | 'TOP SECRET' | 'EYES ONLY';
  paranoiaLevel: number; // 0 to 100
}

export interface MemoryLog {
  id: string;
  timestamp: string;
  sender: string;
  content: string;
  decrypted: boolean;
  isGlitchy?: boolean;
}
