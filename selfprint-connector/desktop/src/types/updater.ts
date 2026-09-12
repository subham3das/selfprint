export type UpdateState =
  | 'IDLE'
  | 'CHECKING'
  | 'AVAILABLE'
  | 'DOWNLOADING'
  | 'DOWNLOADED'
  | 'UP_TO_DATE'
  | 'ERROR';

export interface UpdateProgress {
  percent: number;
  bytesPerSecond: number;
  transferred: number;
  total: number;
}

export interface UpdateStatusPayload {
  state: UpdateState;
  currentVersion: string;
  latestVersion?: string;
  progress?: UpdateProgress;
  error?: string;
  releaseNotes?: string;
  releaseDate?: string;
  lastChecked?: string;
}
