

export const UNIVERSITY_LOGOS: Record<string, string> = {
  'Sinhgad Institutes': '/university_logos/sinhgad-institutes.jpg',
  'Mahindra University': '/university_logos/mahindra-university.jpg',
  'Karnavati University': '/university_logos/karnavati-university.jpg',
  'ICFAI University Jaipur': '/university_logos/icfai-university-jaipur.jpg',
  'Swarrnim Startup & Innovation': '/university_logos/swarrnim-startup-innovation.jpg',
  'Amity University': '/university_logos/amity-university.jpg',
  'Symbiosis Institute of Tech': '/university_logos/symbiosis-institute-of-tech.jpg',
  'ICFAI Foundation': '/university_logos/icfai-foundation.jpg',
  'Jaipur National University': '/university_logos/jaipur-national-university.jpg',
  'Ramaiah University': '/university_logos/ramaiah-university.jpg',
  'Sri Balaji University': '/university_logos/sri-balaji-university.jpg',
  'Asia Pacific Institute': '/university_logos/asia-pacific-institute.jpg',
  'Pandit Deendayal Energy Univ': '/university_logos/pandit-deendayal-energy-univ.jpg',
  'Symbiosis International Dubai': '/university_logos/symbiosis-international-dubai.jpg',
  'Indus University': '/university_logos/indus-university.jpg',
  'SRM University': '/university_logos/srm-university.jpg',
  'Sinhgad Management': '/university_logos/sinhgad-institutes.jpg',
  'SKIPS University': '/university_logos/skips-university.jpg',
  'GLS University': '/university_logos/gls-university.jpg',
  'Alliance University': '/university_logos/alliance-university.jpg',
  'Manipal Academy': '/university_logos/manipal-academy.jpg',
  'MIT World Peace University': '/university_logos/mit-world-peace-university.jpg',
  'Parul University': '/university_logos/parul-university.jpg',
  'Broadway Overseas Education': '/university_logos/broadway-overseas-education.jpg',
  'Symbiosis School for Liberal Arts': '/university_logos/symbiosis-school-for-liberal-arts.jpg',
  'Ahmedabad Institute of Management': '/university_logos/ahmedabad-institute-of-management.jpg',
  'Sikkim University': '/university_logos/sikkim-university.jpg',
  'Asian International University': '/university_logos/asian-international-university.jpg',
  'Silver Oak University': '/university_logos/silver-oak-university.jpg',
  'Gandhinagar University': '/university_logos/gandhinagar-university.jpg',
  'Shreyarth University': '/university_logos/shreyarth-university.jpg',
  'Institute of Company Secretaries': '/university_logos/institute-of-company-secretaries.jpg'
};


export const getUniversityColor = (name: string): string => {
  const colors = [
    '#002147', 
    '#D41B2C', 
    '#006400', 
    '#4B0082', 
    '#800000', 
    '#000080', 
    '#FF6B00', 
    '#2E3192', 
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};


export const getInitialsAvatar = (name: string): string => {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
    
  const color = getUniversityColor(name).replace('#', '');
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=${color}&color=fff&bold=true`;
};


export const getUniversityLogo = (name: string): string => {
  if (!name) return getInitialsAvatar('University');
  
  
  if (UNIVERSITY_LOGOS[name]) return UNIVERSITY_LOGOS[name];
  
  
  const normalizedName = name.toLowerCase().trim();
  const foundKey = Object.keys(UNIVERSITY_LOGOS).find(
    key => key.toLowerCase().trim() === normalizedName
  );
  
  if (foundKey) return UNIVERSITY_LOGOS[foundKey];
  
  
  return getInitialsAvatar(name);
};
