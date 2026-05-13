const Application = require('../models/Application');
const User = require('../models/User');
const University = require('../models/University');
const Payment = require('../models/Payment');
const Scholarship = require('../models/Scholarship');
const ScholarshipApplication = require('../models/ScholarshipApplication');
const Interview = require('../models/Interview');
const Booking = require('../models/Booking');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const generateApplicationsReport = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      status, 
      universityId, 
      format = 'excel',
      includeDetails = false 
    } = req.query;

    // Check authorization
    if (req.user.role !== 'admin' && 
        (req.user.role === 'university_partner' && !req.user.universityId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Build query
    let query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (status) query.status = status;
    if (universityId) query.university = universityId;
    if (req.user.role === 'university_partner') {
      query.university = req.user.universityId;
    }

    const applications = await Application.find(query)
      .populate('student', 'firstName lastName email phone')
      .populate('university', 'name location')
      .sort({ createdAt: -1 });

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Applications Report');

      // Set columns
      worksheet.columns = [
        { header: 'Application ID', key: 'id', width: 20 },
        { header: 'Student Name', key: 'studentName', width: 20 },
        { header: 'Student Email', key: 'studentEmail', width: 25 },
        { header: 'Student Phone', key: 'studentPhone', width: 15 },
        { header: 'University', key: 'university', width: 20 },
        { header: 'Course', key: 'course', width: 25 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Created Date', key: 'createdAt', width: 15 },
        { header: 'Last Updated', key: 'updatedAt', width: 15 }
      ];

      if (includeDetails) {
        worksheet.columns.push(
          { header: 'Academics', key: 'academics', width: 30 },
          { header: 'Test Scores', key: 'testScores', width: 20 },
          { header: 'Documents', key: 'documents', width: 20 }
        );
      }

      // Add data
      applications.forEach(app => {
        worksheet.addRow({
          id: app._id.toString(),
          studentName: app.student ? `${app.student.firstName} ${app.student.lastName}` : 'N/A',
          studentEmail: app.student ? app.student.email : 'N/A',
          studentPhone: app.student ? app.student.phone : 'N/A',
          university: app.university ? app.university.name : 'N/A',
          course: app.course,
          status: app.status,
          createdAt: app.createdAt.toLocaleDateString(),
          updatedAt: app.updatedAt.toLocaleDateString(),
          ...(includeDetails && {
            academics: JSON.stringify(app.academics),
            testScores: JSON.stringify(app.testScores),
            documents: app.documents ? app.documents.length : 0
          })
        });
      });

      // Style header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=applications-report-${Date.now()}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();
    } else if (format === 'pdf') {
      const doc = new PDFDocument();
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=applications-report-${Date.now()}.pdf`);
      
      doc.pipe(res);

      // Add content to PDF
      doc.fontSize(20).text('Applications Report', { align: 'center' });
      doc.moveDown();
      
      applications.forEach(app => {
        doc.fontSize(12).text(`ID: ${app._id}`);
        doc.text(`Student: ${app.student ? `${app.student.firstName} ${app.student.lastName}` : 'N/A'}`);
        doc.text(`University: ${app.university ? app.university.name : 'N/A'}`);
        doc.text(`Course: ${app.course}`);
        doc.text(`Status: ${app.status}`);
        doc.text(`Created: ${app.createdAt.toLocaleDateString()}`);
        doc.moveDown();
      });

      doc.end();
    } else {
      // JSON format
      res.json({
        success: true,
        data: applications,
        summary: {
          total: applications.length,
          statusBreakdown: applications.reduce((acc, app) => {
            acc[app.status] = (acc[app.status] || 0) + 1;
            return acc;
          }, {}),
          dateRange: {
            start: startDate || 'All time',
            end: endDate || 'All time'
          }
        }
      });
    }
  } catch (error) {
    console.error('Generate applications report error:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
};

const generateRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate, universityId, format = 'excel' } = req.query;

    // Check authorization
    if (req.user.role !== 'admin' && 
        (req.user.role === 'university_partner' && !req.user.universityId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Build query
    let query = { status: 'completed' };
    if (startDate || endDate) {
      query.completedAt = {};
      if (startDate) query.completedAt.$gte = new Date(startDate);
      if (endDate) query.completedAt.$lte = new Date(endDate);
    }
    if (universityId) query.university = universityId;
    if (req.user.role === 'university_partner') {
      query.university = req.user.universityId;
    }

    const payments = await Payment.find(query)
      .populate('user', 'firstName lastName email')
      .populate('university', 'name')
      .populate('application', 'course')
      .sort({ completedAt: -1 });

    // Calculate summary
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const revenueByUniversity = payments.reduce((acc, payment) => {
      const uniName = payment.university ? payment.university.name : 'Unknown';
      acc[uniName] = (acc[uniName] || 0) + payment.amount;
      return acc;
    }, {});

    const revenueByMonth = payments.reduce((acc, payment) => {
      const month = payment.completedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      acc[month] = (acc[month] || 0) + payment.amount;
      return acc;
    }, {});

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      
      // Summary sheet
      const summarySheet = workbook.addWorksheet('Revenue Summary');
      summarySheet.columns = [
        { header: 'Metric', key: 'metric', width: 20 },
        { header: 'Value', key: 'value', width: 15 }
      ];

      summarySheet.addRow({ metric: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}` });
      summarySheet.addRow({ metric: 'Total Transactions', value: payments.length });
      summarySheet.addRow({ metric: 'Average Transaction', value: `₹${Math.round(totalRevenue / payments.length).toLocaleString()}` });

      // Style summary
      summarySheet.getRow(1).font = { bold: true };
      summarySheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Revenue by University sheet
      const uniSheet = workbook.addWorksheet('Revenue by University');
      uniSheet.columns = [
        { header: 'University', key: 'university', width: 25 },
        { header: 'Revenue', key: 'revenue', width: 15 },
        { header: 'Percentage', key: 'percentage', width: 12 }
      ];

      Object.entries(revenueByUniversity).forEach(([uni, revenue]) => {
        uniSheet.addRow({
          university: uni,
          revenue: `₹${revenue.toLocaleString()}`,
          percentage: `${((revenue / totalRevenue) * 100).toFixed(1)}%`
        });
      });

      // Revenue by Month sheet
      const monthSheet = workbook.addWorksheet('Revenue by Month');
      monthSheet.columns = [
        { header: 'Month', key: 'month', width: 15 },
        { header: 'Revenue', key: 'revenue', width: 15 }
      ];

      Object.entries(revenueByMonth).forEach(([month, revenue]) => {
        monthSheet.addRow({
          month,
          revenue: `₹${revenue.toLocaleString()}`
        });
      });

      // Detailed transactions sheet
      const detailSheet = workbook.addWorksheet('Transactions');
      detailSheet.columns = [
        { header: 'Payment ID', key: 'id', width: 20 },
        { header: 'Student', key: 'student', width: 20 },
        { header: 'University', key: 'university', width: 20 },
        { header: 'Course', key: 'course', width: 25 },
        { header: 'Amount', key: 'amount', width: 12 },
        { header: 'Date', key: 'date', width: 15 }
      ];

      payments.forEach(payment => {
        detailSheet.addRow({
          id: payment._id.toString(),
          student: payment.user ? `${payment.user.firstName} ${payment.user.lastName}` : 'N/A',
          university: payment.university ? payment.university.name : 'N/A',
          course: payment.application ? payment.application.course : 'N/A',
          amount: `₹${payment.amount.toLocaleString()}`,
          date: payment.completedAt.toLocaleDateString()
        });
      });

      // Style headers
      [summarySheet, uniSheet, monthSheet, detailSheet].forEach(sheet => {
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=revenue-report-${Date.now()}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();
    } else {
      res.json({
        success: true,
        summary: {
          totalRevenue,
          totalTransactions: payments.length,
          averageTransaction: Math.round(totalRevenue / payments.length),
          revenueByUniversity,
          revenueByMonth
        },
        transactions: payments
      });
    }
  } catch (error) {
    console.error('Generate revenue report error:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
};

const generateUserAnalytics = async (req, res) => {
  try {
    // Check authorization
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { period = 'monthly' } = req.query;

    // User statistics
    const totalUsers = await User.countDocuments();
    const students = await User.countDocuments({ role: 'student' });
    const counsellors = await User.countDocuments({ role: 'counsellor' });
    const universityPartners = await User.countDocuments({ role: 'university_partner' });
    const admins = await User.countDocuments({ role: 'admin' });

    // User registration trends
    let registrationTrends = [];
    if (period === 'monthly') {
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

        const monthlyUsers = await User.countDocuments({
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        });

        registrationTrends.push({
          month: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
          users: monthlyUsers
        });
      }
    }

    // Active users (users who logged in in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: thirtyDaysAgo }
    });

    // Profile completion stats
    const profileStats = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: {
        _id: '$profileCompleted',
        count: { $sum: 1 }
      }}
    ]);

    res.json({
      success: true,
      analytics: {
        totalUsers,
        breakdown: {
          students,
          counsellors,
          universityPartners,
          admins
        },
        activeUsers,
        registrationTrends,
        profileCompletion: {
          completed: profileStats.find(s => s._id === true)?.count || 0,
          incomplete: profileStats.find(s => s._id === false)?.count || 0
        }
      }
    });
  } catch (error) {
    console.error('Generate user analytics error:', error);
    res.status(500).json({ message: 'Failed to generate analytics' });
  }
};

const generateApplicationAnalytics = async (req, res) => {
  try {
    // Check authorization
    if (req.user.role !== 'admin' && 
        (req.user.role === 'university_partner' && !req.user.universityId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let universityFilter = {};
    if (req.user.role === 'university_partner') {
      universityFilter.university = req.user.universityId;
    }

    // Application statistics
    const totalApplications = await Application.countDocuments(universityFilter);
    const applicationsByStatus = await Application.aggregate([
      { $match: universityFilter },
      { $group: {
        _id: '$status',
        count: { $sum: 1 }
      }}
    ]);

    // Application trends
    const applicationTrends = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthlyApps = await Application.countDocuments({
        ...universityFilter,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });

      applicationTrends.push({
        month: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        applications: monthlyApps
      });
    }

    // Top universities
    const topUniversities = await Application.aggregate([
      { $match: { ...universityFilter, university: { $exists: true } } },
      { $group: {
        _id: '$university',
        count: { $sum: 1 }
      }},
      { $lookup: { from: 'universities', localField: '_id', foreignField: '_id', as: 'uniInfo' }},
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Popular courses
    const popularCourses = await Application.aggregate([
      { $match: universityFilter },
      { $group: {
        _id: '$course',
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      analytics: {
        totalApplications,
        statusBreakdown: applicationsByStatus.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        applicationTrends,
        topUniversities: topUniversities.map(uni => ({
          id: uni._id,
          name: uni.uniInfo[0]?.name || 'Unknown',
          applications: uni.count
        })),
        popularCourses
      }
    });
  } catch (error) {
    console.error('Generate application analytics error:', error);
    res.status(500).json({ message: 'Failed to generate analytics' });
  }
};

const generateScholarshipAnalytics = async (req, res) => {
  try {
    // Check authorization
    if (req.user.role !== 'admin' && req.user.role !== 'university_partner') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Scholarship statistics
    const totalScholarships = await Scholarship.countDocuments({ status: 'active' });
    const totalApplications = await ScholarshipApplication.countDocuments();
    const applicationsByStatus = await ScholarshipApplication.aggregate([
      { $group: {
        _id: '$status',
        count: { $sum: 1 }
      }}
    ]);

    // Scholarship distribution by type
    const scholarshipsByType = await Scholarship.aggregate([
      { $match: { status: 'active' } },
      { $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }}
    ]);

    // Application trends
    const applicationTrends = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthlyApps = await ScholarshipApplication.countDocuments({
        submittedAt: { $gte: startOfMonth, $lte: endOfMonth }
      });

      applicationTrends.push({
        month: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        applications: monthlyApps
      });
    }

    res.json({
      success: true,
      analytics: {
        totalScholarships,
        totalApplications,
        statusBreakdown: applicationsByStatus.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        typeBreakdown: scholarshipsByType.reduce((acc, type) => {
          acc[type._id] = {
            count: type.count,
            totalAmount: type.totalAmount
          };
          return acc;
        }, {}),
        applicationTrends
      }
    });
  } catch (error) {
    console.error('Generate scholarship analytics error:', error);
    res.status(500).json({ message: 'Failed to generate analytics' });
  }
};

const exportData = async (req, res) => {
  try {
    const { type, format = 'json', ...filters } = req.query;

    // Check authorization based on data type
    const allowedTypes = {
      'applications': ['admin', 'university_partner'],
      'users': ['admin'],
      'payments': ['admin', 'university_partner'],
      'scholarships': ['admin', 'university_partner'],
      'interviews': ['admin', 'university_partner', 'interviewer'],
      'bookings': ['admin', 'counsellor']
    };

    if (!allowedTypes[type] || !allowedTypes[type].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied for this data type' });
    }

    let data;
    switch (type) {
      case 'applications':
        data = await Application.find(filters).populate('student university');
        break;
      case 'users':
        data = await User.find(filters).select('-password');
        break;
      case 'payments':
        data = await Payment.find(filters).populate('user university application');
        break;
      case 'scholarships':
        data = await Scholarship.find(filters).populate('university createdBy');
        break;
      case 'interviews':
        data = await Interview.find(filters).populate('student university interviewer');
        break;
      case 'bookings':
        data = await Booking.find(filters).populate('student counsellor');
        break;
      default:
        return res.status(400).json({ message: 'Invalid data type' });
    }

    if (format === 'csv') {
      // Convert to CSV
      const csv = convertToCSV(data);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${type}-export-${Date.now()}.csv`);
      res.send(csv);
    } else if (format === 'excel') {
      // Convert to Excel
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(type.charAt(0).toUpperCase() + type.slice(1));

      // Add headers based on data structure
      if (data.length > 0) {
        const headers = Object.keys(data[0].toObject());
        worksheet.columns = headers.map(header => ({ header, key: header, width: 15 }));
        
        data.forEach(item => {
          worksheet.addRow(item.toObject());
        });

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${type}-export-${Date.now()}.xlsx`);
      
      await workbook.xlsx.write(res);
      res.end();
    } else {
      // JSON format
      res.json({
        success: true,
        data,
        exportedAt: new Date(),
        count: data.length
      });
    }
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({ message: 'Failed to export data' });
  }
};

const convertToCSV = (data) => {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0].toObject());
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(item => {
    return headers.map(header => {
      const value = item.get(header);
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return `"${value.toString().replace(/"/g, '""')}"`;
    }).join(',');
  });

  return [csvHeaders, ...csvRows].join('\n');
};

module.exports = {
  generateApplicationsReport,
  generateRevenueReport,
  generateUserAnalytics,
  generateApplicationAnalytics,
  generateScholarshipAnalytics,
  exportData
};
