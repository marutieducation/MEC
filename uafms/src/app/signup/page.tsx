'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon, AcademicCapIcon, GlobeAltIcon,
  MapPinIcon, CheckCircleIcon, ArrowRightIcon,
  BookOpenIcon, CurrencyRupeeIcon, PresentationChartLineIcon,
  ChevronLeftIcon, LightBulbIcon, DocumentTextIcon
} from '@heroicons/react/24/outline';
import { SparklesIcon } from '@heroicons/react/20/solid';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const steps = [
  { id: 1, name: 'Personal Details', icon: UserIcon },
  { id: 2, name: 'Academic Goals', icon: AcademicCapIcon },
  { id: 3, name: 'Preferences', icon: GlobeAltIcon },
];

const collegeCoursesData: Record<string, string[]> = {
  'Alliance School of Business': ['BBA', 'B.Com', 'MBA', 'PGDM', 'PhD'],
  'Alliance School of Law': ['BA LLB (Hons)', 'BBA LLB (Hons)', 'LLM', 'PhD'],
  'Alliance College of Engg & Design': ['B.Tech CSE', 'AI & ML', 'Data Science', 'Aerospace Engineering', 'M.Tech'],
  'Alliance School of Liberal Arts': ['BA', 'B.Sc', 'Psychology', 'Liberal Arts', 'MA'],
  'Alliance School of Sciences': ['B.Sc', 'M.Sc', 'Applied Physics', 'Applied Mathematics'],
  'Alliance School of Design': ['B.Des', 'Fashion Design', 'Interior Design', 'Product Design'],
  'Alliance School of Economics': ['BA Economics', 'MA Economics', 'PhD Economics'],
  'Alliance Ascent College': ['BBA', 'B.Com', 'MBA']
};

export default function CreateProfilePage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-bg flex items-center justify-center text-primary font-bold text-lg">Loading Profile...</div>}>
      <CreateProfile />
    </React.Suspense>
  );
}

function CreateProfile() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [selectedDegrees, setSelectedDegrees] = useState<string[]>([]);

  const searchParams = useSearchParams();
  const collegeParam = searchParams?.get('college');


  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');

  const [specialization, setSpecialization] = useState('');
  const [intakeTerm, setIntakeTerm] = useState('Fall 2024');
  const [budget, setBudget] = useState('₹15 Lakhs - ₹30 Lakhs');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConsultationRequested, setIsConsultationRequested] = useState(true);
  const [consultationDate, setConsultationDate] = useState('');
  const [consultationTime, setConsultationTime] = useState('');

  const { login } = useAuth();

  const toggleDestination = (dest: string) => {
    if (selectedDestinations.includes(dest)) {
      setSelectedDestinations(selectedDestinations.filter(d => d !== dest));
    } else {
       if (selectedDestinations.length < 3) setSelectedDestinations([...selectedDestinations, dest]);
    }
  };

  const toggleDegree = (degree: string) => {
    if (selectedDegrees.includes(degree)) {
      setSelectedDegrees(selectedDegrees.filter(d => d !== degree));
    } else {
       if (selectedDegrees.length < 2) setSelectedDegrees([...selectedDegrees, degree]);
    }
  };

  const handleRegister = async () => {
    try {
      if (!firstName || !lastName || !email || !password || !phone || !city) {
         setError("Please fill out all required personal details");
         setCurrentStep(1);
         return;
      }

      setIsLoading(true);
      setError('');

      const response = await api.post('/auth/register', {
        firstName,
        lastName,
        email,
        password,
        role: 'student',
        phone,
        city,
        selectedDestinations,
        selectedDegrees,
        specialization,
        intakeTerm,
        budget
      });


      if (isConsultationRequested) {
         try {
           await api.post('/students/book-consultation', {
             preferredDate: consultationDate,
             preferredTime: consultationTime
           }, {
             headers: { Authorization: `Bearer ${response.token}` }
           });
         } catch (consultErr) {
           console.error("Consultation booking failed, continuing anyway:", consultErr);
         }
      }


      login(response, response.token);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Registration failed');
      } else {
        setError('Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {}
      <header className="h-16 border-b border-border bg-surface flex items-center px-6 md:px-12 shrink-0">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-border p-1 flex items-center justify-center transition-all duration-300 group-hover:shadow-md group-hover:scale-105">
            <img src="/logo.jpeg" alt="MEC Logo" className="max-w-full max-h-full object-contain" />
          </div>
          <span className="text-xl font-bold text-heading tracking-tight">MEC UAFMS</span>
        </Link>
        <div className="ml-auto text-sm text-muted">
           Already have an account? <Link href="/" className="font-semibold text-primary hover:underline">Sign in</Link>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

        {}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10 -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none -z-10 translate-y-1/3 -translate-x-1/4"></div>

        {}
        <div className="w-full lg:w-[320px] xl:w-[400px] shrink-0 p-8 lg:p-12 lg:border-r border-border bg-surface/50 flex flex-col justify-center">
          <div>
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider mb-2 block">Student Onboarding</span>
            <h1 className="text-3xl font-extrabold text-heading tracking-tight mb-4">Complete your <br/>MEC Profile</h1>
            <p className="text-[14px] text-muted mb-10 max-w-sm">
              We need a bit more information to tailor your dashboard, university matches, and counsellor assignments.
            </p>

            <div className="space-y-6">
               {steps.map((step) => (
                 <div key={step.id} className="flex gap-4 relative">
                    {step.id !== steps.length && (
                       <div className={`absolute left-[19px] top-10 w-0.5 h-10 ${currentStep > step.id ? 'bg-primary' : 'bg-border'}`}></div>
                    )}

                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 ${
                       currentStep > step.id ? 'bg-primary border-primary text-white' :
                       currentStep === step.id ? 'bg-surface border-primary text-primary shadow-[0_0_0_4px_#FFF0E6]' :
                       'bg-surface border-border text-muted'
                    }`}>
                       {currentStep > step.id ? <CheckCircleIcon className="w-5 h-5"/> : <step.icon className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col justify-center">
                       <span className={`text-[11px] font-bold uppercase tracking-wider ${currentStep >= step.id ? 'text-primary' : 'text-muted'}`}>Step {step.id}</span>
                       <span className={`text-[15px] font-semibold ${currentStep >= step.id ? 'text-heading' : 'text-muted'}`}>{step.name}</span>
                    </div>
                 </div>
               ))}
            </div>

            <div className="mt-12 p-4 bg-primary/5 border border-primary/20 rounded-xl relative overflow-hidden">
               <SparklesIcon className="w-24 h-24 text-primary opacity-5 absolute -right-4 -bottom-4" />
               <div className="flex items-start gap-2 text-primary font-bold text-[13px] mb-1">
                 <SparklesIcon className="w-4 h-4 mt-0.5" /> AI Profile Matching
               </div>
               <p className="text-[12px] text-primary/80 leading-relaxed font-medium relative z-10">
                 Completing your profile unlocks personalized university recommendations with accurate admission probability scores.
               </p>
            </div>
          </div>
        </div>

        {}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 lg:px-24 flex flex-col pt-10 pb-32">

          <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col justify-center">
            <AnimatePresence mode="wait">

              {}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-heading mb-6">Tell us about yourself</h2>

                  {error && currentStep === 1 && (
                    <div className="p-3 bg-danger/10 text-danger rounded-lg text-sm font-medium border border-danger/20 mb-4">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                     <div className="space-y-1.5">
                       <label className="text-label">First Name <span className="text-danger">*</span></label>
                       <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First Name" className="w-full h-11 px-3 bg-surface border border-border rounded-lg text-body text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all" />
                     </div>
                     <div className="space-y-1.5">
                       <label className="text-label">Last Name <span className="text-danger">*</span></label>
                       <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last Name" className="w-full h-11 px-3 bg-surface border border-border rounded-lg text-body text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all" />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-label">Email Address <span className="text-danger">*</span></label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="off" className="w-full h-11 px-3 bg-surface border border-border rounded-lg text-body text-heading focus:outline-none focus:border-primary transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-label">Password <span className="text-danger">*</span></label>
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" className="w-full h-11 px-3 bg-surface border border-border rounded-lg text-body text-heading focus:outline-none focus:border-primary transition-all" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-label">Phone Number & WhatsApp <span className="text-danger">*</span></label>
                    <div className="flex">
                       <select className="h-11 px-2 bg-surface text-center border border-border border-r-0 rounded-l-lg text-body text-heading focus:outline-none focus:border-primary z-10">
                          <option>+91</option>
                          <option>+1</option>
                          <option>+44</option>
                       </select>
                       <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="98765 43210" className="w-full h-11 px-3 bg-surface border border-border rounded-r-lg text-body text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-label">Current City of Residence <span className="text-danger">*</span></label>
                    <div className="relative">
                       <MapPinIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                       <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="City, State (e.g., Pune, Maharashtra)" className="w-full h-11 pl-10 pr-3 bg-surface border border-border rounded-lg text-body text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all" />
                    </div>
                  </div>

                </motion.div>
              )}

              {}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                     <h2 className="text-2xl font-bold text-heading mb-1">What are you looking to study?</h2>
                     <p className="text-[13px] text-muted">Select your target degree level and specialization.</p>
                  </div>

                  <div className="flex items-center gap-2">
                     <input type="checkbox" id="terms" className="w-4 h-4 text-primary focus:ring-primary" />
                     <label htmlFor="terms" className="text-sm font-medium text-heading">I confirm all provided information is accurate and I agree to the <Link href="/terms" target="_blank" className="text-primary hover:underline">Terms of Service</Link> &amp; <Link href="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</Link>.</label>
                  </div>

                  <div className="space-y-3">
                     <label className="text-label flex justify-between">
                       Target Degree Level <span className="text-[11px] font-normal text-muted">(Max 2)</span>
                     </label>
                     <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                        {[
                           { name: 'Bachelor\'s (UG)', icon: BookOpenIcon },
                           { name: 'Master\'s (PG)', icon: AcademicCapIcon },
                           { name: 'MBA (PG)', icon: PresentationChartLineIcon },
                           { name: 'Ph.D. / Research', icon: LightBulbIcon },
                           { name: 'Diploma / Other', icon: DocumentTextIcon },
                        ].map(deg => {
                           const isSelected = selectedDegrees.includes(deg.name);
                           const disabled = !isSelected && selectedDegrees.length >= 2;
                           return (
                              <button
                                key={deg.name}
                                onClick={() => !disabled && toggleDegree(deg.name)}
                                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                   isSelected ? 'bg-primary/5 border-primary text-primary shadow-[0_0_15px_rgba(255,107,0,0.1)]' :
                                   disabled ? 'bg-bg border-border text-muted/50 cursor-not-allowed opacity-50' :
                                   'bg-surface border-border text-heading hover:border-primary/50 hover:bg-bg/50'
                                }`}
                              >
                                <deg.icon className={`w-6 h-6 ${isSelected ? 'text-primary' : 'text-muted'}`} />
                                <span className="text-[13px] font-semibold text-center leading-tight">{deg.name}</span>
                              </button>
                           )
                        })}
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-label">Primary Subject Area / Specialization</label>
                     <select value={specialization} onChange={e => setSpecialization(e.target.value)} className="w-full h-11 px-3 bg-surface border border-border rounded-lg text-body text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all">
                        <option value="" disabled>Select a field of study...</option>
                        {(() => {
                          if (collegeParam && collegeCoursesData[collegeParam]) {
                            return collegeCoursesData[collegeParam].map(course => (
                              <option key={course} value={course}>{course}</option>
                            ));
                          }


                          const defaultCourses = ['Engineering', 'Management', 'Computer Science', 'Commerce', 'Arts & Humanities', 'Law', 'Pharmacy', 'Science'];
                          return defaultCourses.map(course => (
                            <option key={course} value={course}>{course}</option>
                          ));
                        })()}
                     </select>
                  </div>

                  <div className="space-y-3">
                     <label className="text-label">Target Intake Term</label>
                     <div className="grid grid-cols-2 gap-3">
                        <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${intakeTerm === 'Fall 2024' ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:bg-bg/50'}`}>
                           <input type="radio" name="intake" className="w-4 h-4 text-primary focus:ring-primary" checked={intakeTerm === 'Fall 2024'} onChange={() => setIntakeTerm('Fall 2024')} />
                           <span className="text-[13px] font-medium text-heading">Fall / Autumn 2024</span>
                        </label>
                        <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${intakeTerm === 'Spring 2025' ? 'border-primary bg-primary/5' : 'border-border bg-surface hover:bg-bg/50'}`}>
                           <input type="radio" name="intake" className="w-4 h-4 text-primary focus:ring-primary" checked={intakeTerm === 'Spring 2025'} onChange={() => setIntakeTerm('Spring 2025')} />
                           <span className="text-[13px] font-medium text-heading">Spring / Feb 2025</span>
                        </label>
                     </div>
                  </div>

                </motion.div>
              )}

              {}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                     <h2 className="text-2xl font-bold text-heading mb-1">Destinations & Budget</h2>
                     <p className="text-[13px] text-muted">Where do you want to study?</p>
                  </div>

                  <div className="space-y-3">
                     <label className="text-label flex justify-between">
                       Target Cities / Regions <span className="text-[11px] font-normal text-muted">(Select up to 3)</span>
                     </label>
                     <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Junagadh'].map(country => {
                           const isSelected = selectedDestinations.includes(country);
                           const disabled = !isSelected && selectedDestinations.length >= 3;
                           return (
                              <button
                                key={country}
                                onClick={() => !disabled && toggleDestination(country)}
                                className={`h-11 rounded-lg border-2 text-[13px] font-medium transition-all ${
                                   isSelected ? 'bg-primary/5 border-primary text-primary shadow-[0_0_10px_rgba(255,107,0,0.1)]' :
                                   disabled ? 'bg-bg border-border text-muted/50 cursor-not-allowed opacity-50' :
                                   'bg-surface border-border text-heading hover:border-primary/50'
                                }`}
                              >
                                {country}
                              </button>
                           )
                        })}
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-label">Estimated Tuition Budget (Per Year)</label>
                     <div className="relative">
                        <CurrencyRupeeIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <select value={budget} onChange={e => setBudget(e.target.value)} className="w-full h-11 pl-10 pr-3 bg-surface border border-border rounded-lg text-body text-heading focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all appearance-none cursor-pointer">
                           <option value="Under ₹15 Lakhs">Under ₹15 Lakhs</option>
                           <option value="₹15 Lakhs - ₹30 Lakhs">₹15 Lakhs - ₹30 Lakhs</option>
                           <option value="₹30 Lakhs - ₹50 Lakhs">₹30 Lakhs - ₹50 Lakhs</option>
                           <option value="₹50 Lakhs+">₹50 Lakhs+</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted text-[10px]">&#9660;</div>
                     </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsConsultationRequested(!isConsultationRequested)}
                    className={`w-full p-4 rounded-xl flex items-start text-left gap-3 transition-all border-2 ${
                      isConsultationRequested
                        ? 'bg-primary/5 border-primary shadow-[0_0_15px_rgba(255,107,0,0.1)]'
                        : 'bg-surface border-border hover:border-primary/30'
                    }`}
                  >
                     <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                       isConsultationRequested ? 'bg-primary text-white' : 'bg-surface border-2 border-muted/30 text-transparent'
                     }`}>
                        <CheckCircleIcon className="w-4 h-4" />
                     </div>
                     <div>
                        <h4 className={`text-[13px] font-bold mb-1 ${isConsultationRequested ? 'text-primary' : 'text-heading'}`}>
                           Need a consultation? Book a free strategy call
                        </h4>
                        <p className="text-[12px] text-muted">Don't worry if you aren't exactly sure yet. Check this box to automatically match with a Senior Counsellor.</p>
                     </div>
                  </button>

                  <AnimatePresence>
                     {isConsultationRequested && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 p-5 border border-primary/20 bg-surface rounded-xl flex flex-col gap-4 overflow-hidden"
                        >
                           <div>
                              <label className="text-label mb-2 block">Select preferred date</label>
                              <input
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                value={consultationDate}
                                onChange={e => setConsultationDate(e.target.value)}
                                className="w-full h-11 px-3 bg-bg border border-border rounded-lg text-body text-heading focus:outline-none focus:border-primary transition-all"
                              />
                           </div>

                           <div>
                              <label className="text-label mb-2 block">Select preferred time block</label>
                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                 {['10:00 AM - 12:00 PM', '12:00 PM - 02:00 PM', '02:00 PM - 04:00 PM', '04:00 PM - 06:00 PM'].map(time => (
                                    <button
                                      key={time}
                                      onClick={() => setConsultationTime(time)}
                                      className={`py-2 px-1 text-[11px] font-semibold border rounded-lg transition-all ${
                                         consultationTime === time ? 'bg-primary text-white border-primary' : 'bg-bg text-heading border-border hover:border-primary/50'
                                      }`}
                                    >
                                       {time}
                                    </button>
                                 ))}
                              </div>
                           </div>
                        </motion.div>
                     )}
                  </AnimatePresence>

                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {}
          <div className="w-full max-w-2xl mx-auto mt-12 flex items-center justify-between border-t border-border pt-6">
             <button
               onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
               className={`h-11 px-5 rounded-lg font-medium text-[14px] flex items-center gap-2 transition-colors ${
                  currentStep === 1 ? 'opacity-0 pointer-events-none' : 'bg-surface border border-border text-heading hover:bg-bg'
               }`}
             >
                <ChevronLeftIcon className="w-4 h-4" /> Back
             </button>

             {currentStep < 3 ? (
                <button
                  onClick={() => setCurrentStep(prev => Math.min(3, prev + 1))}
                  className="h-11 px-8 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold text-[14px] flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                >
                   Continue <ArrowRightIcon className="w-4 h-4" />
                </button>
             ) : (
                <button
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="h-11 px-8 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold text-[14px] flex items-center gap-2 transition-all shadow-md hover:shadow-lg focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                   {isLoading ? 'Creating Profile...' : 'Complete Setup'} <CheckCircleIcon className="w-5 h-5" />
                </button>
             )}
          </div>

          {error && currentStep === 3 && (
            <div className="w-full max-w-2xl mx-auto mt-4 p-3 bg-danger/10 text-danger rounded-lg text-sm font-medium border border-danger/20 text-center">
              {error}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
