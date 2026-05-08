"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  CheckCircleIcon, BuildingLibraryIcon,
  DocumentArrowUpIcon,
  SparklesIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  XMarkIcon,
  TicketIcon
} from '@heroicons/react/24/outline';
import { PlusIcon } from '@heroicons/react/24/solid';

const STEPS_CONFIG = [
  { id: 1, name: 'Personal Info' },
  { id: 2, name: 'Academics' },
  { id: 3, name: 'Test Scores' },
  { id: 4, name: 'Documents' },
  { id: 5, name: 'Review & Submit' },
];

export default function UnifiedApplicationForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [qualifications, setQualifications] = useState<any[]>([
    { id: Date.now(), institution: '', degree: '', passingYear: '', cgpa: '', transcript: null }
  ]);

  const { user } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    testScores: {
      ielts: '',
      gre: '',
      gmat: ''
    }
  });

  const [documents, setDocuments] = useState<{ [key: string]: File | null }>({

    '10th Marksheet': null,
    '10th Passing Certificate': null,
    '12th Marksheet': null,
    '12th Passing Certificate': null,
    'Transfer Certificate (TC)': null,
    'Migration Certificate': null,
    'Character Certificate': null,

    'Entrance Exam Scorecard (JEE/NEET/CUET)': null,
    'Admit Card': null,
    'Counseling Allotment Letter': null,

    'Aadhaar Card': null,
    'PAN Card (Optional)': null,
    'Passport-size Photos': null,

    'Caste Certificate (SC/ST/OBC/EWS)': null,
    'Income Certificate': null,
    'Domicile Certificate': null,
  });


  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userData = await api.get('/auth/me');
        setFormData(prev => ({
          ...prev,
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone ? `${userData.countryCode || '+91'} ${userData.phone}` : '',
          testScores: {
            ielts: userData.testScores?.ielts?.toString() || '',
            gre: userData.testScores?.gre?.toString() || '',
            gmat: userData.testScores?.gmat?.toString() || ''
          }
        }));
      } catch (err) {

        if (user) {
          setFormData(prev => ({
            ...prev,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
          }));
        }
      }
    };
    loadUserProfile();
  }, [user]);

  const addQualification = () => {
    setQualifications([...qualifications, { id: Date.now(), institution: '', degree: '', passingYear: '', cgpa: '', transcript: null }]);
  };

  const removeQualification = (id: number) => {
    if (qualifications.length > 1) {
      setQualifications(qualifications.filter(q => q.id !== id));
    }
  };

  const handleBack = () => setCurrentStep(prev => Math.max(1, prev - 1));
  const handleNext = () => setCurrentStep(prev => Math.min(5, prev + 1));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {

      let applicationsToSubmit: any[] = [];
      const storedCart = localStorage.getItem('mec_application_cart');

      if (storedCart) {
        const cartItems = JSON.parse(storedCart);
        applicationsToSubmit = cartItems.map((item: any) => ({
          universityId: item.universityId,
          course: item.course || 'Selected Course',
          academics: qualifications,
          testScores: formData.testScores
        }));
      } else {

        const demoUnis = [
          { universityId: '69e387e72feb44f2c611c66c', course: 'Project Management' }
        ];

        applicationsToSubmit = demoUnis.map(item => ({
          universityId: item.universityId,
          course: item.course,
          academics: qualifications,
          testScores: formData.testScores
        }));

        alert("Demo Mode Information: You haven't selected any universities from the Search page, so we added a demo entry (Karnavati University) for this submission test.");
      }

      await api.post('/applications/bulk', { applications: applicationsToSubmit });

      router.push('/student?submitted=true');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit applications');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6 fade-in h-auto lg:h-[calc(100vh-64px)] flex flex-col relative pb-24">

      {}
      <div>
        <h1 className="text-h1 text-heading">Unified Application Form</h1>
        <p className="text-body text-muted mt-1">Apply to multiple partner universities using this single, smart form.</p>
      </div>

      <nav aria-label="Progress" className="hidden lg:block pb-10">
        <ol role="list" className="flex items-center w-full">
          {STEPS_CONFIG.map((step, stepIdx) => {
            const isComplete = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <li key={step.name} className={`relative flex-1 ${stepIdx === STEPS_CONFIG.length - 1 ? 'flex-grow-0' : ''}`}>
                {stepIdx !== STEPS_CONFIG.length - 1 && (
                  <div className="absolute inset-x-0 top-4 flex items-center" aria-hidden="true">
                    <div className={`h-[2px] w-full ${isComplete ? 'bg-primary' : 'bg-border'}`} />
                  </div>
                )}
                <div className="relative flex flex-col items-center group">
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                      isComplete ? 'bg-primary hover:bg-primary-dark text-white' :
                      isCurrent ? 'bg-surface border-2 border-primary shadow-[0_0_0_4px_#FFF0E6] text-primary' :
                      'bg-surface border-2 border-border hover:border-muted text-muted'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircleIcon className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <span className="text-[12px] font-bold">{step.id}</span>
                    )}
                  </button>
                  <span className={`absolute top-10 text-[11px] font-semibold transition-colors text-center w-32 ${isCurrent ? 'text-heading' : 'text-muted'}`}>
                    {step.name}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4 lg:mt-8 h-full min-h-0">

        {}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border shadow-sm grid grid-rows-[auto,1fr] min-h-0 overflow-hidden">
          {}
          <div className="px-6 py-5 border-b border-border bg-bg/5 shrink-0 z-10">
            <h3 className="text-h3">{STEPS_CONFIG.find(s => s.id === currentStep)?.name}</h3>
            <p className="text-sm text-muted mt-1">Please provide accurate information to expedite your application.</p>
          </div>

          {}
          <div className="overflow-y-auto min-h-0 p-6">
            <div className="space-y-6">

                {}
                {currentStep === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-label">First Name</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full h-11 px-3 bg-bg/50 border border-border rounded-lg text-body"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-label">Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full h-11 px-3 bg-bg/50 border border-border rounded-lg text-body"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-label">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full h-11 px-3 bg-bg/20 border border-border rounded-lg text-muted cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-label">Phone Number</label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full h-11 px-3 bg-bg/50 border border-border rounded-lg text-body"
                      />
                    </div>
                  </div>
                )}

                {}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    {qualifications.map((q, idx) => (
                      <div key={q.id} className="p-5 border border-border rounded-lg bg-bg/50 space-y-4 relative">
                        <div className="flex justify-between items-center mb-2">
                           <h4 className="text-[14px] font-semibold text-heading flex items-center gap-2">
                             <BuildingLibraryIcon className="w-4 h-4 text-primary" /> Qualification {idx + 1}
                           </h4>
                           {qualifications.length > 1 && (
                             <button
                               onClick={() => removeQualification(q.id)}
                               className="text-danger text-[12px] font-medium hover:underline flex items-center gap-1"
                             >
                               <XMarkIcon className="w-3 h-3" /> Remove
                             </button>
                           )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-label">Institution Name <span className="text-danger">*</span></label>
                            <input
                              type="text"
                              value={q.institution}
                              onChange={(e) => {
                                const newQuals = [...qualifications];
                                newQuals[idx].institution = e.target.value;
                                setQualifications(newQuals);
                              }}
                              placeholder="e.g. Gujarat University"
                              className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-[14px] focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-label">Degree Name <span className="text-danger">*</span></label>
                            <input
                              type="text"
                              value={q.degree}
                              onChange={(e) => {
                                const newQuals = [...qualifications];
                                newQuals[idx].degree = e.target.value;
                                setQualifications(newQuals);
                              }}
                              placeholder="e.g. B.Com"
                              className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-[14px] focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-label">Passing Year <span className="text-danger">*</span></label>
                            <select
                              value={q.passingYear}
                              onChange={(e) => {
                                const newQuals = [...qualifications];
                                newQuals[idx].passingYear = e.target.value;
                                setQualifications(newQuals);
                              }}
                              className="w-full h-10 px-3 bg-surface border border-border rounded-lg text-[14px] focus:outline-none focus:border-primary"
                            >
                               <option value="">Select Year</option>
                               {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                 <option key={year} value={year}>{year}</option>
                               ))}
                            </select>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <label className="text-label">CGPA / Percentage <span className="text-danger">*</span></label>
                            <div className="relative">
                              <input
                                type="text"
                                value={q.cgpa}
                                onChange={(e) => {
                                  const newQuals = [...qualifications];
                                  newQuals[idx].cgpa = e.target.value;
                                  setQualifications(newQuals);
                                }}
                                className="w-full h-10 pl-3 pr-12 bg-surface border border-border rounded-lg text-[14px] focus:outline-none focus:border-primary"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted font-medium">/ 10</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <input
                            type="file"
                            id={`transcript-${q.id}`}
                            className="hidden"
                            accept=".pdf"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                const newQuals = [...qualifications];
                                newQuals[idx].transcript = file;
                                setQualifications(newQuals);
                              }
                            }}
                          />
                          <label
                            htmlFor={`transcript-${q.id}`}
                            className="p-4 border border-dashed border-border rounded-lg bg-surface flex flex-col items-center justify-center gap-2 hover:bg-bg/50 transition-colors cursor-pointer w-full"
                          >
                            {q.transcript ? (
                              <>
                                <CheckCircleIcon className="w-6 h-6 text-success" />
                                <span className="text-sm font-medium text-success">{q.transcript.name}</span>
                                <span className="text-xs text-muted">Click to change file</span>
                              </>
                            ) : (
                              <>
                                <DocumentArrowUpIcon className="w-6 h-6 text-muted" />
                                <span className="text-sm font-medium text-heading">Upload Transcript (PDF)</span>
                                <span className="text-xs text-muted">Max size: 5MB</span>
                              </>
                            )}
                          </label>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={addQualification}
                      className="w-full py-3 border border-border border-dashed rounded-lg text-[14px] font-medium text-heading hover:bg-bg hover:border-primary transition-colors flex items-center justify-center gap-2"
                    >
                      <PlusIcon className="w-4 h-4 text-primary" /> Add Another Qualification
                    </button>
                  </div>
                )}

                {}
                {currentStep === 3 && (
                  <div className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-5 border border-border rounded-xl bg-bg/30">
                           <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center text-info">
                                 <ChartBarIcon className="w-6 h-6" />
                              </div>
                              <h4 className="font-bold text-heading">JEE or NEET</h4>
                           </div>
                           <input
                             type="text"
                             value={formData.testScores.ielts}
                             onChange={(e) => setFormData({...formData, testScores: {...formData.testScores, ielts: e.target.value}})}
                             placeholder="Percentile or Rank (e.g. 98.5)"
                             className="w-full h-11 px-3 bg-surface border border-border rounded-lg text-body focus:border-primary"
                           />
                        </div>
                        <div className="p-5 border border-border rounded-xl bg-bg/30">
                           <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
                                 <TicketIcon className="w-6 h-6" />
                              </div>
                              <h4 className="font-bold text-heading">GUJCET</h4>
                           </div>
                           <input
                             type="text"
                             value={formData.testScores.gre}
                             onChange={(e) => setFormData({...formData, testScores: {...formData.testScores, gre: e.target.value}})}
                             placeholder="Score or Percentile"
                             className="w-full h-11 px-3 bg-surface border border-border rounded-lg text-body focus:border-primary"
                           />
                        </div>
                     </div>
                  </div>
                )}

                {}
                {currentStep === 4 && (() => {
                  const groups = [
                    { label: '📚 Academic Documents', keys: ['10th Marksheet', '10th Passing Certificate', '12th Marksheet', '12th Passing Certificate', 'Transfer Certificate (TC)', 'Migration Certificate', 'Character Certificate'] },
                    { label: '📝 Entrance Exam Documents', keys: ['Entrance Exam Scorecard (JEE/NEET/CUET)', 'Admit Card', 'Counseling Allotment Letter'] },
                    { label: '🪪 Identity Documents', keys: ['Aadhaar Card', 'PAN Card (Optional)', 'Passport-size Photos'] },
                    { label: '🏠 Reservation / Category', keys: ['Caste Certificate (SC/ST/OBC/EWS)', 'Income Certificate', 'Domicile Certificate'] },
                  ];
                  return (
                    <div className="space-y-6">
                      {groups.map(group => (
                        <div key={group.label}>
                          <p className="text-[11px] font-black uppercase tracking-widest text-muted mb-3">{group.label}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {group.keys.filter(doc => doc in documents).map(doc => (
                              <div key={doc} className="relative">
                                <input
                                  type="file"
                                  id={`doc-${doc}`}
                                  className="hidden"
                                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      setDocuments(prev => ({ ...prev, [doc]: e.target.files![0] }));
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={`doc-${doc}`}
                                  className={`p-3.5 border rounded-lg flex items-center justify-between group transition-colors cursor-pointer w-full ${documents[doc] ? 'border-success bg-success/5' : 'border-border hover:border-primary'}`}
                                >
                                  <div className="flex items-center gap-3 overflow-hidden">
                                    {documents[doc] ? (
                                      <CheckCircleIcon className="w-4 h-4 text-success shrink-0" />
                                    ) : (
                                      <DocumentTextIcon className="w-4 h-4 text-muted group-hover:text-primary shrink-0" />
                                    )}
                                    <div className="flex flex-col truncate">
                                      <span className={`text-[13px] font-medium truncate ${documents[doc] ? 'text-success' : 'text-heading'}`}>
                                        {documents[doc] ? documents[doc]!.name : doc}
                                      </span>
                                      {documents[doc] && <span className="text-[10px] text-muted">Click to change</span>}
                                    </div>
                                  </div>
                                  {!documents[doc] && (
                                    <div className="text-[10px] font-bold text-primary px-2.5 py-1 bg-primary/5 rounded border border-primary/20 shrink-0 ml-2">UPLOAD</div>
                                  )}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}


                {}
                {currentStep === 5 && (
                  <div className="space-y-6">
                     <div className="p-6 bg-primary/5 border border-primary/10 rounded-xl mb-4">
                        <div className="flex items-center gap-3 mb-3">
                           <SparklesIcon className="w-5 h-5 text-primary" />
                           <h4 className="font-bold text-heading text-[15px]">Ready for submission?</h4>
                        </div>
                        <p className="text-[13px] text-muted leading-relaxed">Review all your entries carefully. This form will be sent to 2 partner universities simultaneously.</p>
                     </div>

                     {submitError && (
                       <div className="p-4 bg-danger/10 border border-danger/20 rounded-lg text-danger text-sm font-medium mb-4">
                         {submitError}
                       </div>
                     )}

                     <div className="space-y-4">
                        <div className="flex justify-between text-sm py-2 border-b border-border">
                           <span className="text-muted">Applicant Name</span>
                           <span className="font-bold text-heading">{formData.firstName} {formData.lastName}</span>
                        </div>
                        <div className="flex justify-between text-sm py-2 border-b border-border">
                           <span className="text-muted">Qualifications</span>
                           <span className="font-bold text-heading">{qualifications.length} Entries</span>
                        </div>
                        <div className="flex justify-between text-sm py-2 border-b border-border">
                           <span className="text-muted">Documents</span>
                           <span className="font-bold text-heading">{Object.values(documents).filter(Boolean).length}/16 Uploaded</span>
                        </div>
                     </div>
                  </div>
                )}

              </div>
          </div>
        </div>

        {}
        <div className="bg-surface rounded-xl border border-border shadow-sm p-6 grid grid-rows-[auto,1fr] min-h-0 overflow-hidden">
          <h3 className="text-h3 mb-4 shrink-0">Applying To (0)</h3>
          <div className="overflow-y-auto min-h-0">
            <div className="space-y-4">

            <div className="p-8 border border-dashed border-border rounded-lg text-center text-muted bg-bg/50">
               <p className="text-[13px] font-bold text-heading">No Universities Selected</p>
               <p className="text-[11px] mt-1">Please select universities from the search page to apply.</p>
            </div>

            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <div className="bg-bg/50 p-4 rounded-lg flex items-start gap-3 border border-border/50">
                <div className="text-primary mt-0.5"><InformationCircleIcon className="w-4 h-4" /></div>
                 <p className="text-[12px] text-muted leading-relaxed"><strong>Pro Tip:</strong> {currentStep === 2 ? 'Upload high-quality PDFs. Blurred transcripts often lead to immediate rejections.' : 'Ensure your phone number has the correct country code for counsellor reachouts.'}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 h-20 bg-surface border-t border-border shadow-[0_-10px_30px_rgba(0,0,0,0.05)] px-6 lg:px-8 flex items-center justify-between z-20">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className={`px-4 h-10 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${currentStep === 1 ? 'text-muted opacity-20 pointer-events-none' : 'text-heading hover:bg-bg'}`}
        >
          <ChevronLeftIcon className="w-4 h-4" /> Back
        </button>

        <div className="flex gap-4">
          <button
            onClick={() => alert('Draft saved successfuly!')}
            className="px-6 h-10 rounded-lg border border-border text-sm font-semibold text-heading hover:bg-bg transition-colors hidden sm:block"
          >
            Save Draft
          </button>

          {currentStep < 5 ? (
            <button
              onClick={handleNext}
              className="px-8 h-10 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
            >
              Continue <ArrowRightIcon className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-8 h-10 rounded-lg bg-success hover:bg-success-dark text-white text-sm font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'} <CheckCircleIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
