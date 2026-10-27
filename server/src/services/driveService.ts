import { readFile, unlink, mkdir, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const DRIVE_SERVICE_URL = process.env.GOOGLE_DRIVE_WEB_APP_URL;

export const CACHE_DIR = path.resolve(process.cwd(), 'uploads', 'drive_cache');
export const TEMP_DIR = path.resolve(process.cwd(), 'uploads', 'temp_uploads');

// Ensure cache & temp directories exist
void Promise.all([
  mkdir(CACHE_DIR, { recursive: true }).catch(() => {}),
  mkdir(TEMP_DIR, { recursive: true }).catch(() => {}),
]);

export type DriveFileType = 'source' | 'res' | 'general';

export interface DriveFile {
  fileId: string;
  fileName: string;
  mimeType: string;
  size: number;
  category?: DriveFileType;
  fileUrl?: string;
  cachedPath?: string;
}

export interface DriveCreateFolderResponse {
  success: boolean;
  folderId?: string;
  folderName?: string;
  folderUrl?: string;
  message?: string;
}

export interface DriveUploadResponse {
  success: boolean;
  fileId?: string;
  fileName?: string;
  mimeType?: string;
  fileUrl?: string;
  message?: string;
}

const callDriveService = async (payload: Record<string, unknown>) => {
  if (!DRIVE_SERVICE_URL) {
    throw new Error('Google Drive service URL is not configured.');
  }

  const response = await fetch(DRIVE_SERVICE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Google Drive service returned HTTP ${response.status}.`);
  }

  const data = (await response.json()) as { success?: boolean; message?: string };
  if (!data.success) {
    throw new Error(data.message || 'Google Drive operation failed.');
  }

  return data;
};

/**
 * Creates or gets the Google Drive folder for a complaint
 */
export async function createComplaintDriveFolder(complaintNumber: string): Promise<DriveCreateFolderResponse> {
  if (DRIVE_SERVICE_URL) {
    try {
      const result = (await callDriveService({
        action: 'createComplaintFolder',
        complaintId: complaintNumber,
      })) as DriveCreateFolderResponse;
      return result;
    } catch (err: any) {
      console.warn(`[DriveService] Remote folder creation failed, using local mock:`, err.message);
    }
  }

  return {
    success: true,
    folderId: `local-folder-${complaintNumber}`,
    folderName: complaintNumber,
    folderUrl: `https://drive.google.com/drive/folders/mock-${complaintNumber}`,
  };
}

/**
 * Uploads a single file to Drive or caches locally if Drive is unavailable
 */
export async function uploadSingleFile(
  complaintNumber: string,
  category: DriveFileType,
  index: number,
  filePath: string,
  originalFileName: string,
  mimeType: string
): Promise<DriveFile> {
  const fileBuffer = await readFile(filePath);
  const size = fileBuffer.length;

  if (DRIVE_SERVICE_URL) {
    try {
      const base64Data = fileBuffer.toString('base64');
      const result = (await callDriveService({
        action: 'uploadFile',
        complaintId: complaintNumber,
        type: category,
        index,
        fileName: originalFileName,
        mimeType,
        data: base64Data,
      })) as DriveUploadResponse;

      if (result.success && result.fileId) {
        // Cache to local drive_cache for rapid streaming
        const cachedPath = path.join(CACHE_DIR, result.fileId);
        await writeFile(cachedPath, fileBuffer).catch(() => {});

        return {
          fileId: result.fileId,
          fileName: result.fileName || originalFileName,
          mimeType: result.mimeType || mimeType,
          size,
          category,
          fileUrl: result.fileUrl || `/api/drive/files/${result.fileId}`,
        };
      }
    } catch (err: any) {
      console.warn(`[DriveService] Remote upload failed, storing in local cache:`, err.message);
    }
  }

  // Local fallback: store directly in CACHE_DIR
  const fileId = `loc_${randomUUID().replace(/-/g, '')}`;
  const localCachedPath = path.join(CACHE_DIR, fileId);
  await writeFile(localCachedPath, fileBuffer);

  return {
    fileId,
    fileName: originalFileName,
    mimeType,
    size,
    category,
    fileUrl: `/api/drive/files/${fileId}`,
  };
}

/**
 * Upload multiple files for a complaint in background
 */
export async function uploadComplaintFiles(
  complaintNumber: string,
  category: DriveFileType,
  files: Express.Multer.File[]
): Promise<DriveFile[]> {
  const uploaded: DriveFile[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      const res = await uploadSingleFile(
        complaintNumber,
        category,
        i + 1,
        file.path,
        file.originalname,
        file.mimetype
      );
      uploaded.push(res);
    } catch (err) {
      console.error(`[DriveService] Failed to upload ${file.originalname}:`, err);
    }
  }

  return uploaded;
}

/**
 * Retrieve file buffer by fileId (from local cache first, then remote Drive if needed)
 */
export async function getDriveFileBuffer(
  fileId: string
): Promise<{ buffer: Buffer; mimeType: string; fileName?: string } | null> {
  const cachedPath = path.join(CACHE_DIR, fileId);

  try {
    const fileStat = await stat(cachedPath);
    if (fileStat.isFile()) {
      const buffer = await readFile(cachedPath);
      return { buffer, mimeType: 'image/jpeg' };
    }
  } catch {
    // Cache miss, try remote Drive
  }

  if (DRIVE_SERVICE_URL) {
    try {
      const result = (await callDriveService({
        action: 'getFile',
        fileId,
      })) as { success?: boolean; data?: string; mimeType?: string; fileName?: string };

      if (result.success && result.data) {
        const buffer = Buffer.from(result.data, 'base64');
        await writeFile(cachedPath, buffer).catch(() => {});
        return {
          buffer,
          mimeType: result.mimeType || 'image/jpeg',
          fileName: result.fileName,
        };
      }
    } catch (err: any) {
      console.warn(`[DriveService] Remote retrieval failed for ${fileId}:`, err.message);
    }
  }

  return null;
}

/**
 * Safe cleanup of temporary multer upload files
 */
export async function deleteTemporaryFiles(files: Express.Multer.File[]): Promise<void> {
  await Promise.allSettled(
    files.map(async (file) => {
      try {
        if (file?.path) await unlink(file.path);
      } catch (err) {
        // Ignore unlink error if already deleted
      }
    })
  );
}
