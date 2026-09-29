import { extname } from 'path';

const PHOTO_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.jfif',
  '.png',
  '.webp',
  '.gif',
  '.bmp',
  '.heic',
  '.heif',
  '.avif',
]);

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/pjpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/bmp': '.bmp',
  'image/heic': '.heic',
  'image/heif': '.heif',
  'image/avif': '.avif',
};

const EXT_TO_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.jfif': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
  '.avif': 'image/avif',
};

function mimeOf(file: { mimetype?: string }) {
  return (file.mimetype || '').toLowerCase().split(';')[0].trim();
}

// Gallery picks and camera captures both count: image/* plus the
// extension-only files some phones send as application/octet-stream.
export function isPhotoFile(file: {
  mimetype?: string;
  originalname?: string;
}): boolean {
  const mime = mimeOf(file);
  const ext = extname(file.originalname || '').toLowerCase();

  if (mime.startsWith('image/')) return true;

  const genericMime = mime === '' || mime === 'application/octet-stream';
  return genericMime && PHOTO_EXTENSIONS.has(ext);
}

// Camera blobs often arrive as "blob" or with an empty name. Give them an
// extension so storage still records a normal photo.
export function preparePhotoFile(file: Express.Multer.File): Express.Multer.File {
  const mime = mimeOf(file);
  const currentExt = extname(file.originalname || '').toLowerCase();

  if (!currentExt) {
    const guessed = MIME_TO_EXT[mime] || (mime.startsWith('image/') ? '.jpg' : '');
    if (guessed) file.originalname = `photo${guessed}`;
  }

  const ext = extname(file.originalname || '').toLowerCase();
  if ((!mime || mime === 'application/octet-stream') && EXT_TO_MIME[ext]) {
    file.mimetype = EXT_TO_MIME[ext];
  }

  return file;
}
