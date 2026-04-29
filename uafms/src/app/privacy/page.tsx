'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-primary transition-colors">
            <ArrowLeftIcon className="w-4 h-4" /> Back to Home
          </Link>
        </div>

        <div className="bg-surface border border-border rounded-3xl p-8 md:p-12 shadow-sm">
          <h1 className="text-3xl md:text-4xl font-black text-heading mb-4 tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted font-medium mb-12">Last Updated: October 2023</p>

          <div className="space-y-8 text-heading/80 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-heading mb-4">1. Information We Collect</h2>
              <p>
                Maruti Education & Consultancy (MEC) collects personal information that you provide to us directly, such as your name, email address, phone number, educational background, and financial documentation necessary for processing university applications and visas via the UAFMS platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-heading mb-4">2. How We Use Your Information</h2>
              <p>
                We use the information we collect to provide, maintain, and improve our services. Specifically, your data is used to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Create and manage your user account.</li>
                <li>Process your applications to partner universities.</li>
                <li>Communicate with you regarding application statuses, deadlines, and requirements.</li>
                <li>Ensure platform security and prevent fraudulent activities.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-heading mb-4">3. Data Sharing & Disclosure</h2>
              <p>
                We do not sell your personal information to third parties. We may share your information with:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li><strong>Universities & Educational Institutions:</strong> To facilitate your admission process.</li>
                <li><strong>Service Providers:</strong> Third-party vendors who assist us with cloud hosting, email delivery, and analytics.</li>
                <li><strong>Legal Requirements:</strong> If required by law, subpoena, or other legal processes.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-heading mb-4">4. Data Security</h2>
              <p>
                We implement robust, industry-standard security measures, including encryption and secure socket layer (SSL) technology, to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-heading mb-4">5. Your Rights</h2>
              <p>
                Depending on your location, you may have the right to access, correct, or delete your personal data. You can manage your information directly through your UAFMS dashboard or by contacting our support team at <a href="mailto:privacy@mec.com" className="text-primary hover:underline">privacy@mec.com</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-heading mb-4">6. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy periodically. Any changes will be posted on this page with an updated "Last Updated" date. We encourage you to review this policy regularly to stay informed about how we protect your data.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
