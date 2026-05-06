const University = require('../models/University');
const Application = require('../models/Application');
const { fetchLogo } = require('../utils/logoFetcher');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');


const searchUniversities = async (req, res) => {
  try {
    const { q, country, degreeLevel, page = 1, limit = 20 } = req.query;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    let query = {};


    if (q) {
      const safeQuery = escapeRegex(String(q).trim());
      query.$or = [
        { name: { $regex: safeQuery, $options: 'i' } },
        { 'courses.name': { $regex: safeQuery, $options: 'i' } },
        { location: { $regex: safeQuery, $options: 'i' } },
      ];
    }


    if (country) {
      query.country = country;
    }


    if (degreeLevel) {
      query['courses.degreeLevel'] = degreeLevel;
    }

    const total = await University.countDocuments(query);
    const universities = await University.find(query)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .sort({ name: 1 });


    const results = [];
    const updatePromises = [];

    for (const uni of universities) {
      
      if (!uni.logo || uni.logoSource === 'fallback') {
        
        const updateTask = (async () => {
          try {
            const logoData = await fetchLogo(uni.name);
            
            if (logoData.source !== 'fallback' || !uni.logo) {
              uni.logo = logoData.logo;
              uni.logoSource = logoData.source;
              if (logoData.domain) uni.officialDomain = logoData.domain;
              uni.logoLastUpdated = new Date();
              await uni.save();
            }
          } catch (e) {
            console.error(`Failed to auto-update logo for ${uni.name}:`, e.message);
          }
        })();
        updatePromises.push(updateTask);
      }

      const filteredCourses = degreeLevel
        ? uni.courses.filter((c) => c.degreeLevel === degreeLevel)
        : uni.courses;

      filteredCourses.forEach((course) => {
        results.push({
          universityId: uni._id,
          universityName: uni.name,
          location: uni.location,
          logo: uni.logo,
          courseId: course._id,
          courseName: course.name,
          fee: course.fee,
          duration: course.duration,
          intake: course.intake,
          degreeLevel: course.degreeLevel,
          matchScore: Math.floor(75 + Math.random() * 25),
        });
      });
    }

    
    
    
    
    await Promise.race([
      Promise.all(updatePromises),
      new Promise(resolve => setTimeout(resolve, 3000))
    ]);

    res.json({
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber),
      count: results.length,
      results,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const getUniversity = async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }
    res.json(university);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



const getRecommendations = async (req, res) => {
  try {

    const applications = await Application.find({ student: req.user._id })
      .populate('university', 'name logo');


    const universities = await University.find({}).limit(14);


    const recommendations = universities.map((uni) => {
      const courses = uni.courses.map((course) => ({
        universityId: uni._id,
        universityName: uni.name,
        logo: uni.logo,
        courseName: course.name,
        fee: course.fee,
        matchScore: Math.floor(78 + Math.random() * 22),
      }));
      return courses;
    }).flat();


    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.json(recommendations.slice(0, 14));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




const createUniversity = async (req, res) => {
  try {
    const { partnerUser, ...uniData } = req.body;
    const university = await University.create({ ...uniData, partnerUser });

    if (partnerUser) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(partnerUser, { universityId: university._id });
    }

    res.status(201).json({
      success: true,
      data: university,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'University with this name already exists' });
    }
    res.status(500).json({ message: error.message });
  }
};




const getUniversities = async (req, res) => {
  try {
    const universities = await University.find({}).sort({ name: 1 });
    res.json(universities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




const updateUniversity = async (req, res) => {
  try {
    const { partnerUser } = req.body;
    
    const university = await University.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }

    if (partnerUser) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(partnerUser, { universityId: university._id });
    }

    res.json({
      success: true,
      data: university,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUniversity = async (req, res) => {
  try {
    const university = await University.findByIdAndDelete(req.params.id);

    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }

    res.json({
      success: true,
      message: 'University deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};




const refreshUniversityLogo = async (req, res) => {
  try {
    const university = await University.findById(req.params.id);
    if (!university) {
      return res.status(404).json({ message: 'University not found' });
    }

    const logoData = await fetchLogo(university.name);
    university.logo = logoData.logo;
    university.logoSource = logoData.source;
    if (logoData.domain) university.officialDomain = logoData.domain;
    university.logoLastUpdated = new Date();
    
    await university.save();

    res.json({
      success: true,
      data: university,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  searchUniversities,
  getUniversity,
  getRecommendations,
  createUniversity,
  getUniversities,
  updateUniversity,
  deleteUniversity,
  refreshUniversityLogo
};
