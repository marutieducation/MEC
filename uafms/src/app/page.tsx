'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MagnifyingGlassIcon, Bars3Icon, XMarkIcon,
  CheckCircleIcon, ArrowRightIcon, StarIcon,
  AcademicCapIcon, DocumentTextIcon, ChatBubbleLeftRightIcon,
  ShieldCheckIcon, CurrencyRupeeIcon, RocketLaunchIcon,
  ChevronRightIcon, MapPinIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Navbar } from '@/components/layout/Navbar';
import { getUniversityLogo } from '@/lib/universityLogos';

const featuredColleges = [
  {
    id: 1, name: 'Alliance School of Business', location: 'Bangalore, Karnataka', rank: 'Top Management',
    courses: ['MBA', 'PGDM', 'BBA', 'B.Com'],
    fee: '₹12,00,000/yr', logo: getUniversityLogo('Alliance University'),
    tag: 'Top Management', color: 'blue'
  },
  {
    id: 2, name: 'Alliance School of Law', location: 'Bangalore, Karnataka', rank: 'Top Law',
    courses: ['BA LLB (Hons)', 'BBA LLB (Hons)', 'LLM'],
    fee: '₹4,50,000/yr', logo: getUniversityLogo('Alliance University'),
    tag: 'Best Private Law', color: 'green'
  },
  {
    id: 3, name: 'Alliance College of Engg & Design', location: 'Bangalore, Karnataka', rank: 'Top Engineering',
    courses: ['B.Tech CSE', 'AI & ML', 'Data Science'],
    fee: '₹3,50,000/yr', logo: getUniversityLogo('Alliance University'),
    tag: 'Top Tech', color: 'purple'
  },
  {
    id: 4, name: 'Alliance School of Liberal Arts', location: 'Bangalore, Karnataka', rank: 'Top Liberal Arts',
    courses: ['Liberal Arts', 'Humanities', 'Psychology'],
    fee: '₹2,50,000/yr', logo: getUniversityLogo('Alliance University'),
    tag: 'Top Liberal Arts', color: 'orange'
  },
  {
    id: 5, name: 'Alliance School of Sciences', location: 'Bangalore, Karnataka', rank: 'Top Science',
    courses: ['B.Sc', 'M.Sc', 'Research'],
    fee: '₹1,50,000/yr', logo: getUniversityLogo('Alliance University'),
    tag: 'Research Oriented', color: 'blue'
  },
  {
    id: 6, name: 'Alliance School of Design', location: 'Bangalore, Karnataka', rank: 'Top Design',
    courses: ['B.Des', 'Fashion Design', 'Interior Design'],
    fee: '₹4,00,000/yr', logo: getUniversityLogo('Alliance University'),
    tag: 'Top Innovation', color: 'green'
  },
  {
    id: 7, name: 'Alliance School of Economics', location: 'Bangalore, Karnataka', rank: 'Top Economics',
    courses: ['B.A. Economics', 'M.A. Economics'],
    fee: '₹2,00,000/yr', logo: getUniversityLogo('Alliance University'),
    tag: 'Top Economics', color: 'purple'
  },
  {
    id: 8, name: 'Alliance Ascent College', location: 'Bangalore, Karnataka', rank: 'Top Multi-Disciplinary',
    courses: ['BBA', 'B.Com', 'MBA'],
    fee: '₹3,00,000/yr', logo: getUniversityLogo('Alliance University'),
    tag: 'Top Professional', color: 'orange'
  }
];

const features = [
  { icon: DocumentTextIcon, title: 'Apply With One Form', desc: 'Single application to 75+ top Gujarat institutions', color: 'bg-blue-50 text-blue-600' },
  { icon: AcademicCapIcon, title: 'Get Career Match', desc: 'AI-powered career compass to find your perfect course', color: 'bg-orange-50 text-orange-600' },
  { icon: ChatBubbleLeftRightIcon, title: 'Talk to Experts', desc: 'Free personalised guidance from certified counsellors', color: 'bg-purple-50 text-purple-600' },
  { icon: ShieldCheckIcon, title: 'Secure Document Locker', desc: 'Encrypted storage for all your academic documents', color: 'bg-green-50 text-green-600' },
  { icon: RocketLaunchIcon, title: 'Easy Apply in 5 Mins', desc: 'Fill and submit college applications in minutes', color: 'bg-pink-50 text-pink-600' },
  { icon: CurrencyRupeeIcon, title: 'Scholarship Finder', desc: 'Discover lakhs in scholarships matching your profile', color: 'bg-yellow-50 text-yellow-600' },
];

const steps = [
  { num: 1, label: 'Register', done: true },
  { num: 2, label: 'Select Course', done: true },
  { num: 3, label: 'Fill Application', done: true },
  { num: 4, label: 'Upload Documents', active: true },
  { num: 5, label: 'Make Payment', done: false },
  { num: 6, label: 'Admission Confirmed', done: false },
];

const streams = ['Engineering', 'Management', 'Medical', 'Science', 'Commerce', 'Arts & Humanities', 'Law', 'Hotel Management'];

const topExams = ['JEE Main', 'JEE Advanced', 'NEET UG', 'CAT', 'GATE', 'CLAT', 'XAT', 'CUET'];

const universityPartners = [
  { name: 'Nirma University', logo: getUniversityLogo('Nirma University') },
  { name: 'MSU Baroda', logo: getUniversityLogo('MSU Baroda') },
  { name: 'DA-IICT', logo: getUniversityLogo('DA-IICT') },
  { name: 'PDEU', logo: getUniversityLogo('Pandit Deendayal Energy Univ') },
  { name: 'SRM University', logo: getUniversityLogo('SRM University') },
  { name: 'Amity University', logo: getUniversityLogo('Amity University') },
];

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStream, setActiveStream] = useState('Engineering');
  const [colleges, setColleges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  React.useEffect(() => {
    const fetchColleges = async () => {
      try {
        // Wake up the server immediately
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mec-backend-9uu9.onrender.com/api'}/health`).catch(() => {});

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://mec-backend-9uu9.onrender.com/api'}/universities/search?limit=8`);
        const data = await res.json();
        if (data.results) {
          const mapped = data.results.map((r: any) => ({
            id: r.courseId,
            name: r.universityName,
            location: r.location,
            rank: 'Partner Institution',
            courses: [r.courseName],
            fee: r.fee,
            logo: r.logo || getUniversityLogo(r.universityName),
            tag: r.degreeLevel?.toUpperCase() || 'TOP RATED',
            color: 'orange'
          }));
          setColleges(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch colleges:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchColleges();
  }, []);

  return (
    <div className="min-h-screen font-sans bg-bg text-body transition-colors duration-300">
      <Navbar />

      {}

      {}
      <section className="relative bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] text-white overflow-hidden min-h-[580px] flex items-center">
        {}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FF6B00] opacity-10 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500 opacity-10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          <div>
            {}
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-[12px] font-bold px-3 py-1.5 rounded-full mb-6 backdrop-blur-sm">
              <SparklesIcon className="w-3.5 h-3.5 text-yellow-400" />
              #1 Ranked College Admissions Platform in India
            </div>

            <h1 className="text-[40px] sm:text-[52px] font-black leading-tight mb-4">
              Right Guidance,<br />
              <span className="text-[#FF6B00]">Bright Future</span>
            </h1>
            <p className="text-[17px] text-gray-300 leading-relaxed mb-8 max-w-lg">
              Guiding lakhs of students to find the right college. Building a better future for India,{' '}
              <span className="text-[#FF6B00] font-semibold">one student at a time.</span>
            </p>

            {}
            <div className="relative bg-white rounded-xl shadow-lg mb-6 flex items-center overflow-hidden">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 ml-4 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search colleges, courses, exams..."
                className="flex-1 h-14 px-3 text-gray-800 text-[15px] focus:outline-none placeholder:text-gray-400"
              />
              <button
                onClick={() => router.push(`/search?query=${searchQuery}`)}
                className="h-14 px-6 bg-[#FF6B00] hover:bg-orange-600 text-white font-bold text-[14px] flex items-center gap-2 transition-colors shrink-0"
              >
                Search <MagnifyingGlassIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/search" className="h-12 px-8 bg-[#FF6B00] hover:bg-orange-600 text-white font-bold text-[15px] rounded-lg flex items-center gap-2 transition-colors shadow-md hover:shadow-lg">
                Find Your College <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <Link href="#counselling" className="h-12 px-8 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-[15px] rounded-lg flex items-center gap-2 transition-colors backdrop-blur-sm">
                Talk to Expert
              </Link>
            </div>
          </div>

          {}
          <div className="hidden lg:grid grid-cols-2 gap-4">
            {[
              { val: '500+', label: 'Partner Colleges', icon: '🏛️' },
              { val: '50,000+', label: 'Students Placed', icon: '🎓' },
              { val: '98%', label: 'Success Rate', icon: '⭐' },
              { val: '150+', label: 'Expert Counsellors', icon: '👨‍🏫' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center hover:bg-white/15 transition-colors">
                <div className="text-3xl mb-2">{s.icon}</div>
                <div className="text-[28px] font-black text-white">{s.val}</div>
                <div className="text-[13px] text-gray-300 font-medium mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
        <div className="py-16 bg-surface border-b border-border overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-10 text-center">
           <h2 className="text-[15px] font-bold text-heading opacity-70 tracking-widest uppercase">Trusted by India&apos;s Elite Institutions</h2>
        </div>

        <div className="relative flex overflow-hidden">
          {}
          <div className="flex gap-20 animate-ticker items-center whitespace-nowrap w-max will-change-transform">
            {[...universityPartners, ...universityPartners, ...universityPartners, ...universityPartners].map((uni, idx) => (
              <div key={idx} className="flex items-center gap-4 transition-all cursor-pointer hover:scale-105">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-2 shadow-sm">
                  <img src={uni.logo} alt={uni.name} className="h-10 w-auto object-contain" />
                </div>
                <span className="font-extrabold text-[18px] text-heading tracking-tight">{uni.name}</span>
              </div>
            ))}
          </div>
        </div>

        {}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none"></div>
      </div>

      {}
      <section className="bg-surface py-10 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {steps.map((step, idx) => (
              <div key={step.num} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold border-2 ${step.done ? 'bg-primary border-primary text-white' : step.active ? 'bg-surface border-primary text-primary' : 'bg-bg border-border text-muted'}`}>
                  {step.done ? <CheckCircleIcon className="w-4 h-4" /> : step.num}
                </div>
                <span className={`text-[13px] font-semibold ${step.done ? 'text-primary' : step.active ? 'text-heading' : 'text-muted'}`}>{step.label}</span>
                {idx < steps.length - 1 && <ChevronRightIcon className="w-4 h-4 text-gray-300 hidden sm:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="py-20 bg-bg" id="courses">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-[32px] font-black text-heading mb-3">Choosing the right college can be confusing</h2>
            <p className="text-[16px] text-muted">We&apos;re here to guide you at every step of your college journey.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.title} className="bg-surface border border-border rounded-xl p-6 flex items-start gap-4 hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group">
                <div className={`w-14 h-14 rounded-xl ${f.color} flex items-center justify-center shrink-0`}>
                  <f.icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-[15px] text-heading group-hover:text-primary transition-colors">{f.title}</h3>
                  <p className="text-[13px] text-muted mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-10">
            <Link href="/signup" className="h-12 px-8 bg-[#FF6B00] hover:bg-orange-600 text-white font-bold text-[14px] rounded-lg flex items-center gap-2 transition-colors">
              Let&apos;s start your application
            </Link>
            <Link href="#counselling" className="h-12 px-8 bg-white border-2 border-[#FF6B00] text-[#FF6B00] font-bold text-[14px] rounded-lg flex items-center gap-2 transition-colors hover:bg-orange-50">
              Talk to a college expert
            </Link>
          </div>
        </div>
      </section>

      {}
      <section className="py-20 bg-surface" id="colleges">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-[32px] font-black text-heading mb-3">Find The Perfect College For You</h2>
            <p className="text-[16px] text-muted">Discover top colleges, exams, and opportunities in your preferred field.</p>
          </div>

          {}
          <div className="flex overflow-x-auto gap-1 pb-2 mb-8 scrollbar-hide">
            {streams.map(s => (
              <button
                key={s}
                onClick={() => setActiveStream(s)}
                className={`shrink-0 px-4 py-2 text-[13px] font-bold rounded-full transition-all ${activeStream === s ? 'bg-primary text-white shadow-md' : 'bg-bg text-muted hover:bg-border/50'}`}
              >
                {s}
              </button>
            ))}
          </div>

          {}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {isLoading ? (
              [1, 2, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="h-64 bg-surface border border-border rounded-xl animate-pulse"></div>
              ))
            ) : colleges.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                 <p className="text-muted">No universities found. The database is working, but please add some programs to see them here.</p>
              </div>
            ) : (
              colleges.map(college => (
                <div key={college.id} className="bg-surface border border-border rounded-xl overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all group cursor-pointer">
                  <div className="h-28 bg-bg flex items-center justify-center p-4 relative">
                    <img 
                      src={college.logo} 
                      alt={college.name} 
                      className="h-16 w-auto object-contain" 
                      onError={(e) => { 
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = getUniversityLogo(college.name); 
                      }} 
                    />
                    <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-orange-500`}>
                      {college.tag}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-black text-[15px] text-heading group-hover:text-primary transition-colors">{college.name}</h3>
                    <div className="flex items-center gap-1 text-muted text-[12px] mt-1 mb-2">
                      <MapPinIcon className="w-3.5 h-3.5" />
                      {college.location}
                    </div>
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}
                      <span className="text-[11px] text-muted ml-1">4.8</span>
                    </div>
                    <div className="text-[11px] text-muted font-semibold mb-2">{college.rank}</div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {college.courses.slice(0, 2).map((c: any) => (
                        <span key={c} className="bg-bg border border-border text-muted text-[10px] px-2 py-0.5 rounded-full font-medium">{c}</span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-muted font-medium">Fees from</div>
                        <div className="text-[14px] font-black text-heading">{college.fee}</div>
                      </div>
                      <Link href={`/signup?college=${encodeURIComponent(college.name)}`} className="px-3 py-1.5 bg-[#FF6B00] hover:bg-orange-600 text-white text-[11px] font-bold rounded-lg transition-colors">
                        Apply Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="text-center">
            <Link href="/search" className="inline-flex items-center gap-2 text-[#FF6B00] font-bold hover:underline text-[14px]">
              View All 500+ Colleges <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {}
      <section className="py-16 bg-bg" id="exams">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-[28px] font-black text-heading mb-8 text-center">Important Entrance Exams</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {topExams.map(exam => (
              <Link key={exam} href={`/search?exam=${encodeURIComponent(exam)}`} className="px-5 py-2.5 bg-surface border border-border rounded-full text-[13px] font-bold text-body hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm">
                {exam}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="py-20 bg-gradient-to-r from-[#FF6B00] to-orange-500 text-white" id="counselling">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="text-[13px] font-bold uppercase tracking-wider mb-3 opacity-90">🏆 #1 India&apos;s Largest Common Application Form</div>
          <h2 className="text-[40px] font-black mb-4">
            <span className="text-yellow-300">500+ Colleges,</span> 1 Application Form
          </h2>
          <p className="text-[17px] mb-8 opacity-90">Applying to your dream colleges is now easier than ever!</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/signup" className="h-14 px-10 bg-white text-[#FF6B00] font-black text-[16px] rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
              Start Your Application
            </Link>
            <Link href="/login" className="h-14 px-10 bg-white/20 border-2 border-white text-white font-black text-[16px] rounded-xl hover:bg-white/30 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-[28px] font-black text-heading mb-10 text-center">What Students Say About Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Aarav Sharma', college: 'IIT Delhi, B.Tech CSE', text: 'MEC UAFMS made my IIT application process incredibly smooth. The counsellors were available 24/7 and guided me through each step!', avatar: 'AS' },
              { name: 'Priya Patel', college: 'IIM Ahmedabad, PGP', text: 'From CAT preparation to PGP admission — the platform tracked every document and deadline for me. Couldn\'t have done it without MEC!', avatar: 'PP' },
              { name: 'Rohan Singh', college: 'AIIMS Delhi, MBBS', text: 'The scholarship finder alone saved me over ₹5 lakhs. The team is fantastic and genuinely cares about student success.', avatar: 'RS' },
            ].map(t => (
              <div key={t.name} className="bg-bg border border-border rounded-2xl p-6">
                <div className="flex mb-3">
                  {[1, 2, 3, 4, 5].map(s => <StarIcon key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-[14px] text-muted leading-relaxed mb-5 italic">&quot;{t.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-black text-[13px]">{t.avatar}</div>
                  <div>
                    <div className="font-bold text-[14px] text-heading">{t.name}</div>
                    <div className="text-[12px] text-muted">{t.college}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <footer className="bg-[#1A1A2E] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logo.jpeg" alt="MEC Logo" className="w-10 h-10 rounded-lg object-contain bg-white p-1 shadow-sm border border-white/10 shrink-0" />
                <div>
                  <div className="font-black text-[16px]">MEC UAFMS</div>
                  <div className="text-[11px] text-gray-400">Maruti Education &amp; Consultancy</div>
                </div>
              </div>
              <p className="text-[13px] text-gray-400 leading-relaxed">India&apos;s most trusted unified college admissions and facility management system.</p>
              <div className="flex gap-3 mt-4">
                {['f', 'in', 't', 'yt'].map(s => (
                  <div key={s} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold hover:bg-[#FF6B00] cursor-pointer transition-colors">{s}</div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-[14px] mb-4">Quick Links</h4>
              <div className="flex flex-col gap-2.5">
                {['Find Colleges', 'Top Exams', 'Career Counselling', 'Scholarships', 'Study Abroad'].map(l => (
                  <Link key={l} href="/search" className="text-[13px] text-gray-400 hover:text-[#FF6B00] transition-colors">{l}</Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-[14px] mb-4">Top Streams</h4>
              <div className="flex flex-col gap-2.5">
                {['Engineering', 'Medical', 'Management', 'Law', 'Arts & Humanities'].map(l => (
                  <Link key={l} href="/search" className="text-[13px] text-gray-400 hover:text-[#FF6B00] transition-colors">{l}</Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-[14px] mb-4">For Institutions</h4>
              <div className="flex flex-col gap-2.5">
                {['Partner With Us', 'University Portal', 'Post Your Programs', 'Student Leads'].map(l => (
                  <Link key={l} href="/partner/register" className="text-[13px] text-gray-400 hover:text-[#FF6B00] transition-colors">{l}</Link>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
              <p className="text-[12px] text-gray-500">© 2026 Maruti Education &amp; Consultancy. All rights reserved.</p>

            </div>
            <div className="flex gap-4">
              <Link href="/privacy" className="text-[12px] text-gray-500 hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-[12px] text-gray-500 hover:text-white transition-colors">Terms of Service</Link>
              <span className="text-[12px] text-gray-500 transition-colors">GSTIN: 27AABCU9603R1ZX</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
