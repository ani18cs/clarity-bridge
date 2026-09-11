const multer = require('multer');

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  // PDF
  'application/pdf',
  // Audio
  'audio/wav',
  'audio/x-wav',
  'audio/mpeg',
  'audio/mp3',
  'audio/webm',
  'audio/ogg',
  'audio/m4a',
  'audio/x-m4a',
  'audio/aac'
];

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype) || file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    const error = new Error(`Unsupported file type: ${file.mimetype}. Allowed types are Images, PDFs, and Audio recordings.`);
    error.statusCode = 400;
    cb(error, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 2 // Document + optional Audio
  },
  fileFilter
});

// Middleware for analyzing inputs (accepts optional 'file' and optional 'audio')
const uploadFields = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]);

const uploadSingleAudio = upload.single('audio');

module.exports = {
  upload,
  uploadFields,
  uploadSingleAudio,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE
};
