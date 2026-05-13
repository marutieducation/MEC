const crypto = require('crypto');

// Generate CSRF token
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// CSRF protection middleware
const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const token = req.headers['x-csrf-token'];
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({ 
      message: 'CSRF token validation failed. Please refresh the page and try again.' 
    });
  }

  next();
};

// CSRF token generation middleware (add to session)
const csrfTokenMiddleware = (req, res, next) => {
  if (!req.session) {
    req.session = {};
  }
  
  // Generate new token if not exists
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCSRFToken();
  }
  
  // Add token to response
  res.locals.csrfToken = req.session.csrfToken;
  
  next();
};

// Route to get CSRF token
const getCSRFToken = (req, res) => {
  const token = generateCSRFToken();
  req.session.csrfToken = token;
  res.json({ csrfToken: token });
};

module.exports = {
  csrfProtection,
  csrfTokenMiddleware,
  getCSRFToken,
  generateCSRFToken
};
