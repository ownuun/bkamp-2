'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { UserMenu } from '@/components/auth/UserMenu';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-brand-600 font-bold text-xl">
            MeetLink
          </Link>
          <UserMenu />
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            네트워킹 이벤트에서<br />
            LinkedIn을 쉽게 교환하세요
          </h1>
          <p className="text-gray-600 text-lg">
            참여자들과 연결하고, 놓친 연락처를 찾아보세요
          </p>
        </div>

        {/* Demo Event Card */}
        <Card className="mb-8">
          <CardContent>
            <div className="flex items-center gap-2 text-xs font-medium text-brand-600 uppercase tracking-wide mb-3">
              <span className="w-2 h-2 bg-brand-600 rounded-full animate-pulse"></span>
              진행 중인 이벤트
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              창업자들이 꼭 알아야 할 바이브코딩 in SF
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              2025년 1월 14일 · San Francisco
            </p>
            <Link
              href="/e/vibe-coding-sf-2025"
              className="inline-flex items-center text-brand-600 font-medium hover:text-brand-700"
            >
              이벤트 보기 →
            </Link>
          </CardContent>
        </Card>

        {/* How it works */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900 text-center">사용 방법</h3>

          <div className="grid gap-4">
            <div className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-brand-600 font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">LinkedIn URL 등록</h4>
                <p className="text-sm text-gray-600">이벤트 페이지에서 내 LinkedIn 프로필을 등록하세요</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-brand-600 font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">참여자 둘러보기</h4>
                <p className="text-sm text-gray-600">다른 참여자들의 프로필을 보고 LinkedIn으로 연결하세요</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 bg-white rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-brand-600 font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">놓친 사람 찾기</h4>
                <p className="text-sm text-gray-600">이벤트 후에도 검색으로 놓친 연락처를 찾을 수 있어요</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-2xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
        <p>MeetLink - 네트워킹을 더 쉽게</p>
      </footer>
    </div>
  );
}
