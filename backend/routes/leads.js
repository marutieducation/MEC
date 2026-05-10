const express = require('express');
const router = express.Router();
const { submitLead } = require('../controllers/leadController');

router.post('/submit', submitLead);

module.exports = router;
