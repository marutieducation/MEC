const Counsellor = require('../models/Counsellor');
const Application = require('../models/Application');



const getCounsellors = async (req, res) => {
  try {
    const { search, region } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { region: { $regex: search, $options: 'i' } },
      ];
    }

    if (region) {
      query.region = region;
    }

    const counsellors = await Counsellor.find(query)
      .populate('user', 'firstName lastName email')
      .sort({ name: 1 });


    const unassignedLeads = await Application.countDocuments({ counsellor: null, pipelineStage: 'leads' });
    const highIntentLeads = Math.floor(unassignedLeads * 0.6);

    res.json({
      success: true,
      data: counsellors,
      stats: {
        unassignedLeads,
        highIntentLeads,
        standardLeads: unassignedLeads - highIntentLeads,
        targetKPI: '85% Utilization',
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const addCounsellor = async (req, res) => {
  try {
    const counsellor = await Counsellor.create(req.body);
    res.status(201).json(counsellor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const updateCounsellor = async (req, res) => {
  try {
    const counsellor = await Counsellor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!counsellor) {
      return res.status(404).json({ message: 'Counsellor not found' });
    }

    res.json(counsellor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};








const deleteCounsellor = async (req, res) => {
  try {
    const counsellor = await Counsellor.findByIdAndDelete(req.params.id);

    if (!counsellor) {
      return res.status(404).json({ message: 'Counsellor not found' });
    }

    res.json({
      success: true,
      message: 'Counsellor deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCounsellors,
  addCounsellor,
  updateCounsellor,
  deleteCounsellor
};
