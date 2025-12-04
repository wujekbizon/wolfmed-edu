export const UPLOAD_SIZE_LIMITS: Record<string, number> = {
  "application/pdf": 4,
  "video/mp4": 8,
  "text/plain": 1,
  "application/json": 1,
} as const;

export type SupportedFileType = keyof typeof UPLOAD_SIZE_LIMITS;

export const FILE_TYPE_NAMES: Record<string, string> = {
  "application/pdf": "PDF",
  "video/mp4": "MP4",
  "text/plain": "TXT",
  "application/json": "JSON",
};