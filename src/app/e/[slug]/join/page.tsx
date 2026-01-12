'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
      setError('이름을 입력해주세요');
      return;
    }

    // Validate LinkedIn URL (required)
    let normalizedUrl = profileData.linkedinUrl.trim();
    if (!normalizedUrl) {
      setError('LinkedIn 프로필 URL을 입력해주세요');
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
        setError('올바른 LinkedIn 프로필 URL을 입력해주세요');
        setShowGuide(true);
        return;
      }
    } catch {
      setError('올바른 LinkedIn 프로필 URL을 입력해주세요');
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
        throw new Error(data.error || '등록에 실패했습니다');
      }

      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : '등록에 실패했습니다');
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
              <h1 className="text-xl font-bold text-gray-900 mb-2">이미 등록되어 있습니다</h1>
              <p className="text-gray-600">
                이 이벤트에 이미 참여하셨습니다.
              </p>
            </div>
            <div className="space-y-3">
              <Link
                href={`/e/${slug}/directory`}
                className="block w-full py-3 px-4 bg-brand-600 text-white text-center rounded-lg font-semibold hover:bg-brand-700 transition-colors"
              >
                참여자 둘러보기
              </Link>
              <Link
                href={`/e/${slug}`}
                className="block w-full py-3 px-4 border border-gray-300 text-gray-700 text-center rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                이벤트 페이지로 돌아가기
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
              <h1 className="text-xl font-bold text-gray-900 mb-2">등록 완료!</h1>
              <p className="text-gray-600">
                이제 다른 참여자들을 둘러볼 수 있습니다
              </p>
            </div>
            <div className="space-y-3">
              <Link
                href={`/e/${slug}/directory`}
                className="block w-full py-3 px-4 bg-brand-600 text-white text-center rounded-lg font-semibold hover:bg-brand-700 transition-colors"
              >
                참여자 둘러보기
              </Link>
              <Link
                href={`/e/${slug}`}
                className="block w-full py-3 px-4 border border-gray-300 text-gray-700 text-center rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                이벤트 페이지로 돌아가기
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
          <h1 className="font-semibold text-gray-900">이벤트 참여하기</h1>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="space-y-6">
            {step === 'login' && (
              <>
                <div className="space-y-2 text-center">
                  <h2 className="text-xl font-bold text-gray-900">LinkedIn으로 참여하기</h2>
                  <p className="text-sm text-gray-600">
                    LinkedIn 계정으로 로그인하면 프로필 정보가 자동으로 입력됩니다
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
                    로그인하면 다른 참여자들이 내 프로필을 볼 수 있습니다
                  </p>
                </div>
              </>
            )}

            {step === 'profile' && (
              <>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-gray-900">프로필 확인</h2>
                  <p className="text-sm text-gray-600">
                    다른 참여자들에게 보여질 정보를 확인하세요
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
                      <p className="font-semibold text-gray-900">{profileData.name || '이름 입력'}</p>
                      <p className="text-sm text-gray-500">{profileData.headline || '헤드라인 (선택)'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Input
                    label="이름"
                    placeholder="홍길동"
                    value={profileData.name}
                    onChange={(v) => setProfileData(prev => ({ ...prev, name: v }))}
                    isRequired
                  />

                  <Input
                    label="헤드라인 (선택)"
                    placeholder="예: Founder at StartupX"
                    value={profileData.headline}
                    onChange={(v) => setProfileData(prev => ({ ...prev, headline: v }))}
                    description="직책, 회사, 또는 자신을 소개하는 한 줄"
                  />

                  <div className="space-y-2">
                    <Input
                      label="LinkedIn 프로필 URL"
                      placeholder="https://linkedin.com/in/username"
                      value={profileData.linkedinUrl}
                      onChange={(v) => setProfileData(prev => ({ ...prev, linkedinUrl: v }))}
                      isRequired
                    />
                    <button
                      type="button"
                      onClick={() => setShowGuide(!showGuide)}
                      className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      LinkedIn URL 찾는 법
                    </button>

                    {showGuide && (
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
                        <h4 className="font-medium text-blue-900">LinkedIn 프로필 URL 찾기</h4>
                        <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                          <li>LinkedIn 앱 또는 웹사이트에서 <strong>내 프로필</strong>로 이동</li>
                          <li>프로필 상단의 <strong>연락처 정보</strong> 클릭</li>
                          <li><strong>프로필 URL</strong> 복사</li>
                        </ol>
                        <div className="relative w-full rounded-lg overflow-hidden border border-blue-200 bg-white">
                          <Image
                            src="/images/linkedin-url-guide.png"
                            alt="LinkedIn URL 찾기 가이드"
                            width={600}
                            height={500}
                            className="w-full h-auto"
                          />
                        </div>
                        <p className="text-xs text-blue-600">
                          위 화면에서 &quot;프로필&quot; 아래 URL을 복사하세요
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
                    {isLoading ? '등록 중...' : '등록하기'}
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  등록하면 같은 이벤트 참여자들이 내 프로필을 볼 수 있습니다
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
