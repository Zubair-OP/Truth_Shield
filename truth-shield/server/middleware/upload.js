import fs from 'fs/promises';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'tmp', 'uploads');

const ALLOWED_MIME_TYPES = new Set([
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
]);

const ALLOWED_EXTENSIONS = new Set(['.mp4', '.mov', '.avi', '.webm']);

const ensureUploadsDir = async () => {
  await fs.mkdir(uploadsDir, { recursive: true });
};

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await ensureUploadsDir();
      cb(null, uploadsDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${extension}`);
  },
});

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();
  const hasValidMime = ALLOWED_MIME_TYPES.has(file.mimetype);
  const hasValidExtension = ALLOWED_EXTENSIONS.has(extension);

  if (!hasValidMime || !hasValidExtension) {
    cb(new Error('Unsupported video format. Use MP4, MOV, AVI, or WEBM.'));
    return;
  }

  cb(null, true);
};

const maxFileSizeMb = Number(process.env.MAX_FILE_SIZE_MB || 500);

export const uploadVideo = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSizeMb * 1024 * 1024,
  },
}).single('video');
