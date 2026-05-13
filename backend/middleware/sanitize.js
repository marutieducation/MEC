const sanitizeHtml = require('sanitize-html');

// Sanitize HTML to prevent XSS attacks
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
};

// Recursive function to sanitize object
const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'string') {
        sanitized[key] = sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object') {
        sanitized[key] = sanitizeObject(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }
  }
  return sanitized;
};

// Sanitize individual string
const sanitizeString = (str) => {
  // Remove HTML tags and dangerous characters
  return sanitizeHtml(str, {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: 'discard',
    textFilter: (text) => {
      // Remove null bytes and other control characters
      return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    }
  });
};

// Sanitize for SQL injection prevention (basic)
const sanitizeSql = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/['"\\;]/g, '');
};

// Sanitize for NoSQL injection prevention
const sanitizeNoSql = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const sanitized = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // Block MongoDB operators
      if (key.startsWith('$')) {
        continue;
      }
      if (typeof obj[key] === 'object') {
        sanitized[key] = sanitizeNoSql(obj[key]);
      } else if (typeof obj[key] === 'string') {
        sanitized[key] = obj[key].replace(/\$/g, '');
      } else {
        sanitized[key] = obj[key];
      }
    }
  }
  return sanitized;
};

module.exports = {
  sanitizeInput,
  sanitizeObject,
  sanitizeString,
  sanitizeSql,
  sanitizeNoSql
};
