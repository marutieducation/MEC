'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-primary transition-colors">
            <ArrowLeftIcon className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        <div className="bg-surface border border-border rounded-3xl p-8 md:p-12 shadow-sm">
          <h1 className="text-3xl md:text-4xl font-black text-heading mb-4 tracking-tight">Terms of Service</h1>
          <p className="text-sm text-muted font-medium mb-12">Last Updated: October 2023</p>

          <div className="space-y-8 text-heading/80 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-heading mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using the services provided by Maruti Education & Consultancy (MEC) via the Universal Application & Finance Management System (UAFMS), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-heading mb-4">2. Description of Services</h2>
              <p>
                MEC provides educational consulting, application tracking, and document management services to prospective students, universities, and partner agencies. We strive to provide accurate information regarding university admissions, courses, and fees, but do not guarantee placement or admission to any specific institution.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-heading mb-4">3. User Accounts & Responsibilities</h2>
              <p>
                When creating an account, you agree to provide accurate and complete information. You are solely responsible for maintaining the confidentiality of your login credentials. Any activity occurring under your account is your responsibility. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-heading mb-4">4. Document Submission & Accuracy</h2>
              <p>
                Users are responsible for ensuring that all documents uploaded for university applications (transcripts, identity proofs, etc.) are authentic and unaltered. MEC reserves the right to terminate accounts that submit fraudulent documents. We are not liable for rejections arising from inaccurate or incomplete information provided by the user.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-heading mb-4">5. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by applicable law, MEC shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-heading mb-4">6. Modifications to Terms</h2>
              <p>
                We reserve the right to modify these Terms of Service at any time. We will provide notice of significant changes by updating the date at the top of this page or by sending an email notification. Continued use of the platform after changes constitutes your acceptance of the new terms.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
