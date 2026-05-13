'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LockClosedIcon, CheckCircleIcon, ArrowRightIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { api } from '@/lib/api';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      // Basic token validation
      if (tokenParam.length === 64 && /^[a-f0-9]+$/i.test(tokenParam)) {
        setTokenValid(true);
      } else {
        setTokenValid(false);
        setError('Invalid reset token. Please request a new password reset.');
      }
    } else {
      setTokenValid(false);
      setError('Reset token is required. Please use the link from your email.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token || !newPassword || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex relative items-center justify-center min-h-screen font-sans bg-bg w-full">
        <div className="flex w-full h-screen bg-bg flex-col lg:flex-row">
          {/* Left Side - Success Message */}
          <div className="hidden lg:flex w-full lg:w-[55%] bg-[#1A1A2E] text-white flex-col relative justify-center items-start px-12 lg:px-24 py-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-20 -mr-24 -mt-24 transform rotate-45 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary opacity-10 rounded-full blur-3xl pointer-events-none -mb-32 -ml-32"></div>
            
            <div className="z-10 mb-4">
              <Link href="/" className="text-[28px] font-bold tracking-tight mb-2 text-surface">MEC</Link>
            </div>
            <div className="z-10 mb-8 max-w-lg">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
                <CheckCircleIcon className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-h1 text-white mb-6">Password Reset Successful!</h1>
              <p className="text-body text-gray-400 mb-8">
                Your password has been successfully reset. You can now log in to your account with your new password.
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 bg-primary hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-lg transition-colors">
                Go to Login <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Side - Success Confirmation */}
          <div className="w-full lg:w-[45%] bg-surface flex flex-col justify-center items-center px-8 sm:px-16 py-12 relative overflow-y-auto min-h-screen lg:min-h-0">
            <div className="w-full max-w-[400px] text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-[28px] font-bold text-heading mb-4">Success!</h2>
              <p className="text-body text-muted mb-8">
                Your password has been successfully reset. You can now log in to your account with your new password.
              </p>
              <Link href="/login" className="w-full bg-primary hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-lg transition-colors inline-block">
                Continue to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex relative items-center justify-center min-h-screen font-sans bg-bg w-full">
      <div className="flex w-full h-screen bg-bg flex-col lg:flex-row">
        {/* Left Side - Info */}
        <div className="hidden lg:flex w-full lg:w-[55%] bg-[#1A1A2E] text-white flex-col relative justify-center items-start px-12 lg:px-24 py-16 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary opacity-20 -mr-24 -mt-24 transform rotate-45 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary opacity-10 rounded-full blur-3xl pointer-events-none -mb-32 -ml-32"></div>
          
          <div className="z-10 mb-4">
            <Link href="/" className="text-[28px] font-bold tracking-tight mb-2 text-surface">MEC</Link>
          </div>
          <div className="z-10 mb-8 max-w-lg">
            <h1 className="text-h1 text-white mb-6">Reset Your Password</h1>
            <p className="text-body text-gray-400">
              Choose a strong password for your account. Make sure it's at least 8 characters long and includes a mix of letters, numbers, and special characters.
            </p>
          </div>
          <div className="z-10 flex gap-4 mt-8 opacity-75">
            <div className="flex items-center text-sm font-medium">
              <div className="w-2 h-2 rounded-full bg-success mr-2" /> Secure Connection
            </div>
            <div className="flex items-center text-sm font-medium">
              <div className="w-2 h-2 rounded-full bg-info mr-2" /> Encrypted Data
            </div>
            <div className="flex items-center text-sm font-medium">
              <div className="w-2 h-2 rounded-full bg-warning mr-2" /> Token Protected
            </div>
          </div>
        </div>

        {/* Right Side - Reset Form */}
        <div className="w-full lg:w-[45%] bg-surface flex flex-col justify-center items-center px-8 sm:px-16 py-12 relative overflow-y-auto min-h-screen lg:min-h-0">
          <div className="w-full max-w-[400px]">
            <div className="flex lg:hidden mb-8 items-center gap-3">
              <div className="w-11 h-11 bg-white rounded-xl shadow-sm border border-border p-1.5 flex items-center justify-center">
                <img src="/logo.jpeg" alt="MEC Logo" className="max-w-full max-h-full object-contain" />
              </div>
              <h2 className="text-[20px] font-bold tracking-tight text-[#1A1A2E]">MEC UAFMS</h2>
            </div>
            
            <h2 className="text-h2 text-heading mb-2">Reset Password</h2>
            <p className="text-body text-muted mb-8">Enter your new password below.</p>

            {tokenValid === false && (
              <div className="p-3 bg-danger/10 text-danger rounded-lg text-sm font-medium border border-danger/20 mb-6">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  {error || 'Invalid reset token. Please request a new password reset.'}
                </div>
              </div>
            )}

            {error && tokenValid && (
              <div className="p-3 bg-danger/10 text-danger rounded-lg text-sm font-medium border border-danger/20 mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
              <div className="flex flex-col gap-1.5">
                <label className="text-h4">New Password</label>
                <div className="relative">
                  <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={!tokenValid}
                    className="w-full h-10 pl-10 pr-4 bg-bg border border-border rounded-lg text-[14px] text-heading placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                  />
                </div>
                <p className="text-[11px] text-muted">Must be at least 8 characters with uppercase, lowercase, and numbers</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-h4">Confirm New Password</label>
                <div className="relative">
                  <LockClosedIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={!tokenValid}
                    className="w-full h-10 pl-10 pr-4 bg-bg border border-border rounded-lg text-[14px] text-heading placeholder:text-muted focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !tokenValid}
                className="w-full h-10 mt-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold text-[14px] uppercase tracking-wide flex justify-center items-center gap-2 transition-all duration-150 active:scale-[0.98] disabled:opacity-70"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'} <ArrowRightIcon className="w-4 h-4" />
              </button>

              <div className="mt-8 pt-6 border-t border-border/50 text-center">
                <div className="mt-2">
                  Remember your password? <Link href="/login" className="text-primary hover:underline hover:text-primary-dark font-medium pl-1">Sign In</Link>
                </div>
                <div className="mt-2">
                  Need a new reset link? <Link href="/forgot-password" className="text-primary hover:underline hover:text-primary-dark font-medium pl-1">Request Again</Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
