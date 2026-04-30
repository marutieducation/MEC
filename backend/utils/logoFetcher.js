const fetchLogo = async (universityName) => {
  return {
    logo: 'https://via.placeholder.com/150?text=' + encodeURIComponent(universityName),
    source: 'fallback',
    domain: null
  };
};

module.exports = { fetchLogo };
