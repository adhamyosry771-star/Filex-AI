
export interface ImageItem {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  type: 'generation' | 'edit';
}

export enum AppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  ERROR = 'ERROR'
}
