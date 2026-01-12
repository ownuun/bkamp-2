'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { UserMenu } from '@/components/auth/UserMenu';
import { LinkedInLoginButton } from '@/components/auth/LinkedInLoginButton';

interface FormData {
  name: string;
  slug: string;
  date: string;
  time: string;
  endDate: string;
  endTime: string;
  location: string;
  description: string;
  coverImageUrl: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    date: '',
    time: '',
    endDate: '',
    endTime: '',
    location: '',
    description: '',
    coverImageUrl: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: value
        .toLowerCase()
        .replace(/[^a-z0-9가-힣\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50),
    }));
  };

  const handleSubmit = async () => {
    setError('');

    if (!formData.name.trim()) {
      setError('이벤트 이름을 입력해주세요');
      return;
    }
    if (!formData.slug.trim()) {
      setError('URL을 입력해주세요');
      return;
    }
    if (!formData.date) {
      setError('날짜를 선택해주세요');
      return;
    }
    if (!formData.location.trim()) {
      setError('장소를 입력해주세요');
      return;
    }

    setIsLoading(true);

    try {
      // Combine date and time
      const dateTime = formData.time
        ? `${formData.date}T${formData.time}:00`
        : `${formData.date}T00:00:00`;

      const endDateTime =
        formData.endDate && formData.endTime
          ? `${formData.endDate}T${formData.endTime}:00`
          : formData.endDate
            ? `${formData.endDate}T23:59:59`
            : null;

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          date: dateTime,
          end_date: endDateTime,
          location: formData.location,
          description: formData.description || null,
          cover_image_url: formData.coverImageUrl || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '이벤트 생성에 실패했습니다');
      }

      // Redirect to the new event page
      router.push(`/e/${formData.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '이벤트 생성에 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-brand-600 font-semibold text-lg">
              MeetLink
            </Link>
            <UserMenu />
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-12 text-center space-y-6">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">이벤트 만들기</h1>
                <p className="text-gray-600">
                  이벤트를 만들려면 먼저 로그인해주세요
                </p>
              </div>
              <LinkedInLoginButton redirectTo="/create" className="w-full max-w-xs mx-auto" />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-brand-600 font-semibold text-lg">
            MeetLink
          </Link>
          <UserMenu />
        </div>
      </header>

      {/* Main */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900">새 이벤트 만들기</h1>
              <p className="text-sm text-gray-600">
                네트워킹 이벤트를 만들고 참여자들을 연결하세요
              </p>
            </div>

            <div className="space-y-4">
              {/* Event Name */}
              <Input
                label="이벤트 이름"
                placeholder="예: 스타트업 네트워킹 밋업"
                value={formData.name}
                onChange={handleNameChange}
                isRequired
              />

              {/* Slug */}
              <div>
                <Input
                  label="이벤트 URL"
                  placeholder="startup-meetup"
                  value={formData.slug}
                  onChange={(v) => setFormData((prev) => ({ ...prev, slug: v.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                  description={formData.slug ? `meetlink.app/e/${formData.slug}` : '영문 소문자, 숫자, 하이픈만 사용 가능'}
                  isRequired
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="시작 날짜"
                  type="date"
                  value={formData.date}
                  onChange={(v) => setFormData((prev) => ({ ...prev, date: v }))}
                  isRequired
                />
                <Input
                  label="시작 시간"
                  type="time"
                  value={formData.time}
                  onChange={(v) => setFormData((prev) => ({ ...prev, time: v }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="종료 날짜 (선택)"
                  type="date"
                  value={formData.endDate}
                  onChange={(v) => setFormData((prev) => ({ ...prev, endDate: v }))}
                />
                <Input
                  label="종료 시간"
                  type="time"
                  value={formData.endTime}
                  onChange={(v) => setFormData((prev) => ({ ...prev, endTime: v }))}
                />
              </div>

              {/* Location */}
              <Input
                label="장소"
                placeholder="예: 서울 강남구 테헤란로 123"
                value={formData.location}
                onChange={(v) => setFormData((prev) => ({ ...prev, location: v }))}
                isRequired
              />

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명 (선택)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="이벤트에 대한 간단한 설명을 입력하세요"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Cover Image URL */}
              <Input
                label="커버 이미지 URL (선택)"
                placeholder="https://example.com/image.jpg"
                value={formData.coverImageUrl}
                onChange={(v) => setFormData((prev) => ({ ...prev, coverImageUrl: v }))}
                description="이미지 URL을 입력하세요"
              />

              {/* Error */}
              {error && (
                <p className="text-sm text-error-600">{error}</p>
              )}

              {/* Submit */}
              <Button
                onPress={handleSubmit}
                isDisabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? '생성 중...' : '이벤트 만들기'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
