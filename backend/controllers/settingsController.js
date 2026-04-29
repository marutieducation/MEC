const ConsentLog = require('../models/ConsentLog');
const User = require('../models/User');
const Application = require('../models/Application');
const Document = require('../models/Document');
const Invoice = require('../models/Invoice');
const Setting = require('../models/Setting');


const DEFAULT_SETTINGS = [
  { key: 'site_name', value: 'MEC UAFMS', label: 'Platform Name', description: 'Display name across the system', group: 'Platform Configuration', type: 'text' },
  { key: 'maint_mode', value: false, label: 'Maintenance Mode', description: 'Restrict access to the platform', group: 'Platform Configuration', type: 'toggle' },
  { key: 'region', value: 'Gujarat, India', label: 'Primary Region', description: 'Default timezone and regional settings', group: 'Platform Configuration', type: 'text' },
  { key: '2fa_enforce', value: true, label: 'Enforce 2FA', description: 'Force 2FA for all administrative accounts', group: 'Security & Access', type: 'toggle' },
  { key: 'session_timeout', value: '2 Hours', label: 'Session Timeout', description: 'Inactivity period before logout', group: 'Security & Access', type: 'text' },
  { key: 'ip_whitelist', value: 'Not Configured', label: 'IP Whitelisting', description: 'Restrict admin access to specific IPs', group: 'Security & Access', type: 'text' },
  { key: 'email_notif', value: true, label: 'Email Alerts', description: 'System-wide critical event alerts', group: 'Notifications', type: 'toggle' },
  { key: 'slack_webhook', value: 'Connected', label: 'Slack Integration', description: 'Sync escalations to Slack', group: 'Notifications', type: 'text' },
];



const getPlatformSettings = async (req, res) => {
  try {
    let settings = await Setting.find({}).sort({ group: 1 });


    if (settings.length === 0) {
      settings = await Setting.insertMany(DEFAULT_SETTINGS);
    }


    const grouped = {};
    settings.forEach((s) => {
      if (!grouped[s.group]) grouped[s.group] = [];
      grouped[s.group].push({
        key: s.key,
        label: s.label,
        value: s.value,
        description: s.description,
        type: s.type,
      });
    });

    res.json({ success: true, data: grouped });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const updatePlatformSettings = async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ message: 'Invalid settings payload' });
    }

    const ops = Object.entries(settings).map(([key, value]) =>
      Setting.findOneAndUpdate(
        { key },
        { value },
        { new: true, upsert: true, runValidators: true }
      )
    );

    await Promise.all(ops);


    const updated = await Setting.find({}).sort({ group: 1 });
    const grouped = {};
    updated.forEach((s) => {
      if (!grouped[s.group]) grouped[s.group] = [];
      grouped[s.group].push({
        key: s.key,
        label: s.label,
        value: s.value,
        description: s.description,
        type: s.type,
      });
    });

    res.json({ success: true, message: 'Settings saved to database', data: grouped });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const getConsentLogs = async (req, res) => {
  try {
    const logs = await ConsentLog.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const recordConsent = async (req, res) => {
  try {
    const { action, status } = req.body;

    const log = await ConsentLog.create({
      user: req.user._id,
      action,
      status: status || 'granted',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '0.0.0.0',
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const requestDataExport = async (req, res) => {
  try {
    const userId = req.user._id;


    const user = await User.findById(userId).select('-password');
    const applications = await Application.find({ student: userId }).populate('university', 'name');
    const documents = await Document.find({ student: userId });
    const invoices = await Invoice.find({ student: userId });
    const consentLogs = await ConsentLog.find({ user: userId });

    const exportData = {
      exportDate: new Date().toISOString(),
      user: user.toObject(),
      applications,
      documents: documents.map((d) => ({
        name: d.name,
        category: d.category,
        status: d.status,
        fileSize: d.fileSize,
        createdAt: d.createdAt,
      })),
      invoices,
      consentLogs,
    };


    await ConsentLog.create({
      user: userId,
      action: 'Requested Data Export (JSON)',
      status: 'granted',
      ipAddress: req.ip || '0.0.0.0',
    });

    res.json(exportData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;


    await ConsentLog.create({
      user: userId,
      action: 'Account Deletion Initiated (RTBF / Right to be Forgotten)',
      status: 'granted',
      ipAddress: req.ip || '0.0.0.0',
    });


    await Application.deleteMany({ student: userId });
    await Document.deleteMany({ student: userId });
    await Invoice.deleteMany({ student: userId });
    await ConsentLog.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);

    res.json({ message: 'Account and all associated data have been permanently deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getConsentLogs, recordConsent, requestDataExport, deleteAccount, getPlatformSettings, updatePlatformSettings };
