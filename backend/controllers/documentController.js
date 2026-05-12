const Document = require('../models/Document');
const Application = require('../models/Application');

const path = require('path');
const fs = require('fs');

const canAccessDocument = (document, user) => (
  user.role === 'admin' || document.student.toString() === user._id.toString()
);



const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const { name, category } = req.body;
    const fileSizeMB = (req.file.size / (1024 * 1024)).toFixed(1) + ' MB';

    const existing = await Document.findOne({ student: req.user._id, name });
    if (existing) {
      existing.versions.push({ filePath: existing.filePath, uploadedAt: existing.updatedAt, uploadedBy: req.user._id });
      existing.filePath = req.file.path;
      existing.fileSize = fileSizeMB;
      existing.originalName = req.file.originalname;
      existing.status = 'pending';
      await existing.save();
      return res.json(existing);
    }

    const document = await Document.create({
      student: req.user._id,
      name: name || req.file.originalname,
      category: category || 'academic',
      filePath: req.file.path,
      fileSize: fileSizeMB,
      originalName: req.file.originalname,
      status: 'pending',
      versions: [],
    });
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const getDocuments = async (req, res) => {
  try {
    const query = { student: req.user._id };
    if (req.query.category) query.category = req.query.category;
    const documents = await Document.find(query).populate('verifiedBy', 'firstName lastName').sort({ updatedAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const getStudentDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ student: req.params.studentId })
      .populate('verifiedBy', 'firstName lastName')
      .sort({ updatedAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });
    if (!canAccessDocument(document, req.user)) {
      return res.status(403).json({ message: 'Not authorized to access this document' });
    }

    if (!document.filePath) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Check file existence asynchronously
    try {
      await fs.promises.access(document.filePath);
    } catch (err) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    res.download(document.filePath, document.originalName || path.basename(document.filePath));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const approveDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    document.status = 'verified';
    document.remark = '';
    document.verifiedBy = req.user._id;
    document.verifiedAt = new Date();
    await document.save();

    const populated = await document.populate('verifiedBy', 'firstName lastName');

    // AUTO-MOVE PIPELINE LOGIC
    // Check if ALL documents for this student are now verified
    const allDocs = await Document.find({ student: document.student });
    const allVerified = allDocs.every(d => d.status === 'verified');

    if (allVerified && allDocs.length > 0) {
      // Move all 'leads' stage applications to 'verified'
      await Application.updateMany(
        { student: document.student, pipelineStage: 'leads' },
        { pipelineStage: 'verified', status: 'submitted', currentStep: 1 }
      );
    }

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const rejectDocument = async (req, res) => {
  try {
    const { remark } = req.body;
    if (!remark) return res.status(400).json({ message: 'Rejection remark is required' });

    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    document.status = 'rejected';
    document.remark = remark;
    document.verifiedBy = req.user._id;
    document.verifiedAt = new Date();
    await document.save();

    const populated = await document.populate('verifiedBy', 'firstName lastName');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const verifyDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    document.status = 'verified';
    document.verifiedBy = req.user._id;
    document.verifiedAt = new Date();
    await document.save();

    const populated = await document.populate('verifiedBy', 'firstName lastName');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const getDocumentHistory = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('verifiedBy', 'firstName lastName')
      .populate('versions.uploadedBy', 'firstName lastName');

    if (!document) return res.status(404).json({ message: 'Document not found' });
    if (!canAccessDocument(document, req.user)) {
      return res.status(403).json({ message: 'Not authorized to access this document' });
    }

    res.json({
      document: { _id: document._id, name: document.name, status: document.status, verifiedBy: document.verifiedBy, verifiedAt: document.verifiedAt },
      versions: document.versions,
      sharedWith: document.sharedWith,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found' });

    if (document.student.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this document' });
    }

    // Async file deletion using promises
    if (document.filePath) {
      try {
        await fs.promises.access(document.filePath);
        await fs.promises.unlink(document.filePath);
      } catch (err) {
        if (err.code !== 'ENOENT') console.error('File delete error:', err);
      }
    }
    if (document.versions?.length > 0) {
      for (const v of document.versions) {
        if (v.filePath) {
          try {
            await fs.promises.access(v.filePath);
            await fs.promises.unlink(v.filePath);
          } catch (err) {
            if (err.code !== 'ENOENT') console.error('Version file delete error:', err);
          }
        }
      }
    }

    await document.deleteOne();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadDocument, getDocuments, downloadDocument,
  verifyDocument, getDocumentHistory, deleteDocument,
  getStudentDocuments, approveDocument, rejectDocument,
};
