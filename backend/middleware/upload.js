const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Base upload directory
const uploadDir = path.join(__dirname, '..', 'uploads');

// Ensure base upload directory exists at startup (async, but we await in server.js later? For now fire-and-forget)
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // NOTE: This function is called synchronously by multer.
    // We assume directory was created by ensureUploadDir middleware before this.
    const userDir = path.join(uploadDir, req.user ? req.user._id.toString() : 'anonymous');
    cb(null, userDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = new Set(['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.webp']);
  const allowedMimeTypes = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp',
  ]);
  const extname = allowedExtensions.has(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimeTypes.has(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX, JPG, PNG, and WEBP files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const fileType = require('file-type');

// Middleware to ensure user upload directory exists before multer processes file
const ensureUploadDir = async (req, res, next) => {
  if (req.user) {
    try {
      const userDir = path.join(uploadDir, req.user._id.toString());
      await fs.mkdir(userDir, { recursive: true });
    } catch (err) {
      console.error('Failed to create upload directory:', err);
    }
  }
  next();
};

const validateFileType = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const buffer = await fs.readFile(req.file.path);
    const type = await fileType.fromBuffer(buffer);
    
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/webp'
    ];

    if (!type || !allowedMimeTypes.includes(type.mime)) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ message: 'Security Alert: File type mismatch detected (Magic Bytes)' });
    }
    next();
  } catch (error) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    return res.status(500).json({ message: 'Error validating file security' });
  }
};

module.exports = { upload, ensureUploadDir, validateFileType };
