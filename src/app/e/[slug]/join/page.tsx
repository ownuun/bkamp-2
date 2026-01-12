'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { LinkedInLoginButton } from '@/components/auth/LinkedInLoginButton';

type Step = 'login' | 'profile' | 'success' | 'already_joined';

interface ProfileData {
  name: string;
  headline: string;
  photoUrl: string;
  linkedinUrl: string;
}

export default function JoinPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user, isLoading: authLoading } = useAuth();
  const t = useTranslations('join');
  const tDirectory = useTranslations('directory');
  const tValidation = useTranslations('validation');

  const [step, setStep] = useState<Step>('login');
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    headline: '',
    photoUrl: '',
    linkedinUrl: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingParticipation, setIsCheckingParticipation] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  // Check if user is already a participant
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setStep('login');
      setIsCheckingParticipation(false);
      return;
    }

    // Fill profile data from LinkedIn OAuth
    setProfileData({
      name: user.user_metadata?.full_name || user.user_metadata?.name || '',
      headline: '',
      photoUrl: user.user_metadata?.picture || user.user_metadata?.avatar_url || '',
      linkedinUrl: user.user_metadata?.linkedin_url || '',
    });

    // Check if already joined
    checkParticipation();
  }, [user, authLoading, slug]);

  const checkParticipation = async () => {
    if (!user) return;

    try {
      const response = await fetch(`/api/check-participation?eventSlug=${slug}`);
      const data = await response.json();

      if (data.isParticipant) {
        setStep('already_joined');
      } else {
        setStep('profile');
      }
    } catch {
      // If check fails, assume not joined
      setStep('profile');
    } finally {
      setIsCheckingParticipation(false);
    }
  };

  const handleJoin = async () => {
    if (!profileData.name.trim()) {
      setError(tValidation('nameRequired'));
      return;
    }

    // Validate LinkedIn URL (required)
    let normalizedUrl = profileData.linkedinUrl.trim();
    if (!normalizedUrl) {
      setError(tValidation('linkedinUrlRequired'));
      setShowGuide(true);
      return;
    }

    // Auto-add https:// if missing
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    try {
      const url = new URL(normalizedUrl);
      if (!url.hostname.includes('linkedin.com') || !normalizedUrl.includes('/in/')) {
        setError(tValidation('invalidLinkedInUrl'));
        setShowGuide(true);
        return;
      }
    } catch {
      setError(tValidation('invalidLinkedInUrl'));
      setShowGuide(true);
      return;
    }

    // Update profile data with normalized URL
    setProfileData(prev => ({ ...prev, linkedinUrl: normalizedUrl }));

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventSlug: slug,
          name: profileData.name,
          headline: profileData.headline,
          photoUrl: profileData.photoUrl,
          linkedinUrl: normalizedUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t('registrationFailed'));
      }

      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('registrationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (authLoading || isCheckingParticipation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  // Already joined
  if (step === 'already_joined') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center space-y-6">
            <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">{t('alreadyJoined')}</h1>
              <p className="text-gray-600">
                {t('alreadyJoinedDescription')}
              </p>
            </div>
            <div className="space-y-3">
              <Link
                href={`/e/${slug}/directory`}
                className="block w-full py-3 px-4 bg-brand-600 text-white text-center rounded-lg font-semibold hover:bg-brand-700 transition-colors"
              >
                {tDirectory('browseParticipants')}
              </Link>
              <Link
                href={`/e/${slug}`}
                className="block w-full py-3 px-4 border border-gray-300 text-gray-700 text-center rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                {tDirectory('backToEvent')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center space-y-6">
            <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">{t('success')}</h1>
              <p className="text-gray-600">
                {t('successDescription')}
              </p>
            </div>
            <div className="space-y-3">
              <Link
                href={`/e/${slug}/directory`}
                className="block w-full py-3 px-4 bg-brand-600 text-white text-center rounded-lg font-semibold hover:bg-brand-700 transition-colors"
              >
                {tDirectory('browseParticipants')}
              </Link>
              <Link
                href={`/e/${slug}`}
                className="block w-full py-3 px-4 border border-gray-300 text-gray-700 text-center rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                {tDirectory('backToEvent')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href={`/e/${slug}`} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="font-semibold text-gray-900">{t('title')}</h1>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="space-y-6">
            {step === 'login' && (
              <>
                <div className="space-y-2 text-center">
                  <h2 className="text-xl font-bold text-gray-900">{t('joinWithLinkedIn')}</h2>
                  <p className="text-sm text-gray-600">
                    {t('joinDescription')}
                  </p>
                </div>

                <div className="py-4">
                  <LinkedInLoginButton
                    redirectTo={`/e/${slug}/join`}
                    className="w-full"
                  />
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    {t('visibilityNote')}
                  </p>
                </div>
              </>
            )}

            {step === 'profile' && (
              <>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-gray-900">{t('profileConfirm')}</h2>
                  <p className="text-sm text-gray-600">
                    {t('profileConfirmDescription')}
                  </p>
                </div>

                {/* Preview Card */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={profileData.photoUrl}
                      name={profileData.name || 'User'}
                      size="xl"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{profileData.name || t('enterName')}</p>
                      <p className="text-sm text-gray-500">{profileData.headline || t('headline')}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Input
                    label={t('name')}
                    placeholder={t('namePlaceholder')}
                    value={profileData.name}
                    onChange={(v) => setProfileData(prev => ({ ...prev, name: v }))}
                    isRequired
                  />

                  <Input
                    label={t('headline')}
                    placeholder={t('headlinePlaceholder')}
                    value={profileData.headline}
                    onChange={(v) => setProfileData(prev => ({ ...prev, headline: v }))}
                    description={t('headlineDescription')}
                  />

                  <div className="space-y-2">
                    <Input
                      label={t('linkedinUrl')}
                      placeholder={t('linkedinUrlPlaceholder')}
                      value={profileData.linkedinUrl}
                      onChange={(v) => setProfileData(prev => ({ ...prev, linkedinUrl: v }))}
                      isRequired
                    />
                    <div className="text-sm">
                      <span className="text-gray-600">{t('yourProfileUrl')}: </span>
                      <a
                        href="https://linkedin.com/in/me"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 hover:text-brand-700 underline"
                      >
                        linkedin.com/in/me
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowGuide(!showGuide)}
                      className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {t('linkedinUrlGuide')}
                    </button>

                    {showGuide && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
                        <h4 className="font-medium text-blue-900">{t('linkedinUrlGuideTitle')}</h4>
                        <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                          <li><strong>{t('linkedinUrlGuideStep1')}</strong></li>
                          <li><strong>{t('linkedinUrlGuideStep2')}</strong></li>
                          <li><strong>{t('linkedinUrlGuideStep3')}</strong></li>
                        </ol>
                        <div className="relative w-full rounded-lg overflow-hidden border border-blue-200 bg-white">
                          <Image
                            src="/images/linkedin-url-guide.png"
                            alt="LinkedIn URL Guide"
                            width={600}
                            height={500}
                            className="w-full h-auto"
                          />
                        </div>
                        <p className="text-xs text-blue-600">
                          {t('linkedinUrlGuideHint')}
                        </p>
                      </div>
                    )}
                  </div>

                  {error && (
                    <p className="text-sm text-error-600">{error}</p>
                  )}

                  <Button
                    onPress={handleJoin}
                    isDisabled={isLoading}
                    className="w-full"
                    size="lg"
                  >
                    {isLoading ? t('submitting') : t('submit')}
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  {t('registrationNote')}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
