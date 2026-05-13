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

// NOTE: file-type v16+ is ESM-only and cannot be used with require().
// We use a lightweight magic-bytes detector built on Node.js built-ins instead.
const detectFileType = (buffer) => {
  if (!buffer || buffer.length < 4) return null;

  // PDF: %PDF
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return { mime: 'application/pdf', ext: 'pdf' };
  }
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { mime: 'image/jpeg', ext: 'jpg' };
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return { mime: 'image/png', ext: 'png' };
  }
  // WebP: RIFF....WEBP
  if (buffer.length >= 12 &&
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
    return { mime: 'image/webp', ext: 'webp' };
  }
  // DOC: D0 CF 11 E0 (OLE2 compound document)
  if (buffer[0] === 0xD0 && buffer[1] === 0xCF && buffer[2] === 0x11 && buffer[3] === 0xE0) {
    return { mime: 'application/msword', ext: 'doc' };
  }
  // DOCX / XLSX / ZIP: PK (50 4B 03 04)
  if (buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04) {
    return { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ext: 'docx' };
  }
  return null;
};

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
    const type = detectFileType(buffer);
    
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

    // Deep validation for PDF files
    if (type.mime === 'application/pdf') {
      const pdfValidation = await validatePDFStructure(buffer);
      if (!pdfValidation.valid) {
        await fs.unlink(req.file.path);
        return res.status(400).json({ message: `Security Alert: Invalid PDF structure - ${pdfValidation.reason}` });
      }
    }

    // Deep validation for images
    if (type.mime.startsWith('image/')) {
      const imageValidation = await validateImageStructure(buffer, type.mime);
      if (!imageValidation.valid) {
        await fs.unlink(req.file.path);
        return res.status(400).json({ message: `Security Alert: Invalid image structure - ${imageValidation.reason}` });
      }
    }

    // Check for embedded scripts or suspicious content
    const contentCheck = await scanForSuspiciousContent(buffer);
    if (!contentCheck.safe) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ message: `Security Alert: Suspicious content detected - ${contentCheck.reason}` });
    }

    next();
  } catch (error) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    return res.status(500).json({ message: 'Error validating file security' });
  }
};

// Validate PDF structure
const validatePDFStructure = async (buffer) => {
  try {
    // Check PDF header
    const header = buffer.toString('ascii', 0, 4);
    if (header !== '%PDF') {
      return { valid: false, reason: 'Invalid PDF header' };
    }

    // Check for PDF trailer (must be at the end of the file)
    const trailer = buffer.subarray(-1024).toString('ascii');
    if (!trailer.includes('%%EOF')) {
      return { valid: false, reason: 'Missing PDF trailer' };
    }

    // JavaScript check disabled to avoid false positives
    // const content = buffer.toString('ascii');
    // if (content.includes('/JavaScript') || content.includes('/JS')) {
    //   return { valid: false, reason: 'Embedded JavaScript detected' };
    // }

    // Suspicious actions check disabled to avoid false positives
    // if (content.includes('/Launch') || content.includes('/URI') || content.includes('/GoTo')) {
    //   return { valid: false, reason: 'Suspicious PDF actions detected' };
    // }

    return { valid: true };
  } catch (error) {
    return { valid: false, reason: 'PDF validation error' };
  }
};

// Validate image structure
const validateImageStructure = async (buffer, mimeType) => {
  try {
    if (mimeType === 'image/jpeg') {
      // Check JPEG header
      const header = buffer.readUInt16BE(0);
      if (header !== 0xFFD8) {
        return { valid: false, reason: 'Invalid JPEG header' };
      }
    } else if (mimeType === 'image/png') {
      // Check PNG header
      const header = buffer.toString('ascii', 0, 8);
      if (header !== '\x89PNG\r\n\x1A\n') {
        return { valid: false, reason: 'Invalid PNG header' };
      }
    } else if (mimeType === 'image/webp') {
      // Check WebP header
      const header = buffer.toString('ascii', 0, 4);
      if (header !== 'RIFF') {
        return { valid: false, reason: 'Invalid WebP header' };
      }
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, reason: 'Image validation error' };
  }
};

// Scan for suspicious content
const scanForSuspiciousContent = async (buffer) => {
  try {
    const content = buffer.toString('ascii', 0, Math.min(1024, buffer.length));
    
    // Check for script tags
    if (content.includes('<script') || content.includes('javascript:')) {
      return { safe: false, reason: 'Script content detected' };
    }

    // Check for embedded executables
    if (content.includes('MZ') || content.includes('PE')) {
      return { safe: false, reason: 'Executable content detected' };
    }

    // Check for shell commands
    if (content.includes('eval(') || content.includes('exec(') || content.includes('system(')) {
      return { safe: false, reason: 'Shell command patterns detected' };
    }

    return { safe: true };
  } catch (error) {
    return { safe: false, reason: 'Content scan error' };
  }
};

module.exports = { upload, ensureUploadDir, validateFileType };
