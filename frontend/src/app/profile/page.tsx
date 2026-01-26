// プロフィールページ
// 프로필 페이지
//
// ログインユーザーのプロフィール表示/編集
// 로그인한 사용자의 프로필 보기/수정

'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/cognito';
import ProfileImageUpload from '@/components/ProfileImageUpload';

// ============================================================
// 型定義
// 타입 정의
// ============================================================
interface JobSeekerProfile {
  id: string;
  firstName?: string;
  lastName?: string;
  firstNameKana?: string;
  lastNameKana?: string;
  profileImageUrl?: string;
  headline?: string;
  bio?: string;
  currentCompany?: string;
  currentPosition?: string;
  yearsOfExp?: number;
  desiredSalary?: number;
  desiredLocations?: string[];
  skills?: string[];
  isPublic?: boolean;
}

interface CompanyProfile {
  id: string;
  name: string;
  nameKana?: string;
  logoUrl?: string;
  website?: string;
  description?: string;
  industry?: string;
  employeeCount?: number;
  foundedYear?: number;
  headquarters?: string;
}

interface UserData {
  id: string;
  email: string;
  userType: 'JOBSEEKER' | 'COMPANY';
  createdAt: string;
}

interface ProfileResponse {
  user: UserData;
  profile: JobSeekerProfile | CompanyProfile;
}

export default function ProfilePage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();

  // 状態管理
  // 상태 관리
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // フォームデータ（JobSeeker）
  // 폼 데이터 (JobSeeker)
  const [jobSeekerForm, setJobSeekerForm] = useState({
    firstName: '',
    lastName: '',
    firstNameKana: '',
    lastNameKana: '',
    profileImageUrl: '',
    headline: '',
    bio: '',
    currentCompany: '',
    currentPosition: '',
    yearsOfExp: '',
    desiredSalary: '',
    desiredLocations: '',
    skills: '',
    isPublic: false,
  });

  // フォームデータ（Company）
  // 폼 데이터 (Company)
  const [companyForm, setCompanyForm] = useState({
    name: '',
    nameKana: '',
    logoUrl: '',
    website: '',
    description: '',
    industry: '',
    employeeCount: '',
    foundedYear: '',
    headquarters: '',
  });

  // ------------------------------------------------------------
  // プロフィールデータロード
  // 프로필 데이터 로드
  // ------------------------------------------------------------
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) return;

      try {
        const idToken = await getIdToken();
        if (!idToken) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/profile/me', {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('プロフィールの読み込みに失敗しました');
        }

        const data: ProfileResponse = await response.json();
        setUserData(data.user);

        // フォームデータ初期化
        // 폼 데이터 초기화
        if (data.user.userType === 'JOBSEEKER') {
          const p = data.profile as JobSeekerProfile;
          setJobSeekerForm({
            firstName: p.firstName || '',
            lastName: p.lastName || '',
            firstNameKana: p.firstNameKana || '',
            lastNameKana: p.lastNameKana || '',
            profileImageUrl: p.profileImageUrl || '',
            headline: p.headline || '',
            bio: p.bio || '',
            currentCompany: p.currentCompany || '',
            currentPosition: p.currentPosition || '',
            yearsOfExp: p.yearsOfExp?.toString() || '',
            desiredSalary: p.desiredSalary?.toString() || '',
            desiredLocations: p.desiredLocations?.join(', ') || '',
            skills: p.skills?.join(', ') || '',
            isPublic: p.isPublic || false,
          });
        } else {
          const p = data.profile as CompanyProfile;
          setCompanyForm({
            name: p.name || '',
            nameKana: p.nameKana || '',
            logoUrl: p.logoUrl || '',
            website: p.website || '',
            description: p.description || '',
            industry: p.industry || '',
            employeeCount: p.employeeCount?.toString() || '',
            foundedYear: p.foundedYear?.toString() || '',
            headquarters: p.headquarters || '',
          });
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError('プロフィールの読み込みに失敗しました。');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else {
        fetchProfile();
      }
    }
  }, [authLoading, isAuthenticated, router]);

  // ------------------------------------------------------------
  // プロフィール保存
  // 프로필 저장
  // ------------------------------------------------------------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      const idToken = await getIdToken();
      if (!idToken) {
        router.push('/login');
        return;
      }

      // 保存するデータ準備
      // 저장할 데이터 준비
      let bodyData: Record<string, unknown>;

      if (userData?.userType === 'JOBSEEKER') {
        bodyData = {
          firstName: jobSeekerForm.firstName || null,
          lastName: jobSeekerForm.lastName || null,
          firstNameKana: jobSeekerForm.firstNameKana || null,
          lastNameKana: jobSeekerForm.lastNameKana || null,
          profileImageUrl: jobSeekerForm.profileImageUrl || null,
          headline: jobSeekerForm.headline || null,
          bio: jobSeekerForm.bio || null,
          currentCompany: jobSeekerForm.currentCompany || null,
          currentPosition: jobSeekerForm.currentPosition || null,
          yearsOfExp: jobSeekerForm.yearsOfExp ? parseInt(jobSeekerForm.yearsOfExp) : null,
          desiredSalary: jobSeekerForm.desiredSalary ? parseInt(jobSeekerForm.desiredSalary) : null,
          desiredLocations: jobSeekerForm.desiredLocations
            ? jobSeekerForm.desiredLocations.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
          skills: jobSeekerForm.skills
            ? jobSeekerForm.skills.split(',').map((s) => s.trim()).filter(Boolean)
            : [],
          isPublic: jobSeekerForm.isPublic,
        };
      } else {
        bodyData = {
          name: companyForm.name,
          nameKana: companyForm.nameKana || null,
          logoUrl: companyForm.logoUrl || null,
          website: companyForm.website || null,
          description: companyForm.description || null,
          industry: companyForm.industry || null,
          employeeCount: companyForm.employeeCount ? parseInt(companyForm.employeeCount) : null,
          foundedYear: companyForm.foundedYear ? parseInt(companyForm.foundedYear) : null,
          headquarters: companyForm.headquarters || null,
        };
      }

      const response = await fetch('/api/profile/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '保存に失敗しました');
      }

      setSuccessMessage('プロフィールが保存されました。');

      // 3秒後メッセージ非表示
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Profile save error:', err);
      setError('プロフィールの保存に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  // ------------------------------------------------------------
  // 画像アップロード完了ハンドラー
  // 이미지 업로드 완료 핸들러
  // ------------------------------------------------------------
  const handleImageUpload = (imageUrl: string) => {
    if (userData?.userType === 'JOBSEEKER') {
      setJobSeekerForm((prev) => ({ ...prev, profileImageUrl: imageUrl }));
    } else {
      setCompanyForm((prev) => ({ ...prev, logoUrl: imageUrl }));
    }
  };

  // ------------------------------------------------------------
  // ローディング状態
  // 로딩 상태
  // ------------------------------------------------------------
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // レンダリング
  // 렌더링
  // ------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* ヘッダー / 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">プロフィール設定</h1>
          <p className="mt-2 text-gray-600">
            {userData?.userType === 'JOBSEEKER' ? '求職者プロフィール' : '企業プロフィール'}
          </p>
        </div>

        {/* 成功メッセージ / 성공 메시지 */}
        {successMessage && (
          <div className="mb-6 rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-700">{successMessage}</div>
          </div>
        )}

        {/* エラーメッセージ / 에러 메시지 */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* プロフィールフォーム / 프로필 폼 */}
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          {/* 画像アップロード / 이미지 업로드 */}
          <div className="flex justify-center pb-6 border-b">
            <ProfileImageUpload
              currentImageUrl={
                userData?.userType === 'JOBSEEKER'
                  ? jobSeekerForm.profileImageUrl
                  : companyForm.logoUrl
              }
              onUploadComplete={handleImageUpload}
            />
          </div>

          {/* JobSeekerフォーム / JobSeeker 폼 */}
          {userData?.userType === 'JOBSEEKER' && (
            <>
              {/* 名前 / 이름 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    姓
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={jobSeekerForm.lastName}
                    onChange={(e) => setJobSeekerForm({ ...jobSeekerForm, lastName: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    名
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={jobSeekerForm.firstName}
                    onChange={(e) => setJobSeekerForm({ ...jobSeekerForm, firstName: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* カタカナ / 가타카나 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lastNameKana" className="block text-sm font-medium text-gray-700">
                    セイ
                  </label>
                  <input
                    type="text"
                    id="lastNameKana"
                    value={jobSeekerForm.lastNameKana}
                    onChange={(e) => setJobSeekerForm({ ...jobSeekerForm, lastNameKana: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="firstNameKana" className="block text-sm font-medium text-gray-700">
                    メイ
                  </label>
                  <input
                    type="text"
                    id="firstNameKana"
                    value={jobSeekerForm.firstNameKana}
                    onChange={(e) => setJobSeekerForm({ ...jobSeekerForm, firstNameKana: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* 一行紹介 / 한줄 소개 */}
              <div>
                <label htmlFor="headline" className="block text-sm font-medium text-gray-700">
                  一行紹介
                </label>
                <input
                  type="text"
                  id="headline"
                  value={jobSeekerForm.headline}
                  onChange={(e) => setJobSeekerForm({ ...jobSeekerForm, headline: e.target.value })}
                  placeholder="例: 5年目フロントエンドエンジニア"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* 自己紹介 / 자기 소개 */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  自己紹介
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={jobSeekerForm.bio}
                  onChange={(e) => setJobSeekerForm({ ...jobSeekerForm, bio: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* 現在の会社/役職 / 현재 회사/직책 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="currentCompany" className="block text-sm font-medium text-gray-700">
                    現在の会社
                  </label>
                  <input
                    type="text"
                    id="currentCompany"
                    value={jobSeekerForm.currentCompany}
                    onChange={(e) => setJobSeekerForm({ ...jobSeekerForm, currentCompany: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="currentPosition" className="block text-sm font-medium text-gray-700">
                    現在の役職
                  </label>
                  <input
                    type="text"
                    id="currentPosition"
                    value={jobSeekerForm.currentPosition}
                    onChange={(e) => setJobSeekerForm({ ...jobSeekerForm, currentPosition: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* 経験年数/希望年収 / 경력/희망연봉 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="yearsOfExp" className="block text-sm font-medium text-gray-700">
                    経験年数
                  </label>
                  <input
                    type="number"
                    id="yearsOfExp"
                    value={jobSeekerForm.yearsOfExp}
                    onChange={(e) => setJobSeekerForm({ ...jobSeekerForm, yearsOfExp: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="desiredSalary" className="block text-sm font-medium text-gray-700">
                    希望年収（万円）
                  </label>
                  <input
                    type="number"
                    id="desiredSalary"
                    value={jobSeekerForm.desiredSalary}
                    onChange={(e) => setJobSeekerForm({ ...jobSeekerForm, desiredSalary: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* 希望勤務地 / 희망 근무지 */}
              <div>
                <label htmlFor="desiredLocations" className="block text-sm font-medium text-gray-700">
                  希望勤務地（カンマ区切り）
                </label>
                <input
                  type="text"
                  id="desiredLocations"
                  value={jobSeekerForm.desiredLocations}
                  onChange={(e) => setJobSeekerForm({ ...jobSeekerForm, desiredLocations: e.target.value })}
                  placeholder="例: 東京, 大阪, リモート"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* スキル / 스킬 */}
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                  スキル（カンマ区切り）
                </label>
                <input
                  type="text"
                  id="skills"
                  value={jobSeekerForm.skills}
                  onChange={(e) => setJobSeekerForm({ ...jobSeekerForm, skills: e.target.value })}
                  placeholder="例: React, TypeScript, Node.js"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* 公開設定 / 공개 설정 */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={jobSeekerForm.isPublic}
                  onChange={(e) => setJobSeekerForm({ ...jobSeekerForm, isPublic: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                  プロフィールを公開する
                </label>
              </div>
            </>
          )}

          {/* Companyフォーム / Company 폼 */}
          {userData?.userType === 'COMPANY' && (
            <>
              {/* 企業名 / 기업명 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  企業名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={companyForm.name}
                  onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* 企業名カタカナ / 기업명 가타카나 */}
              <div>
                <label htmlFor="nameKana" className="block text-sm font-medium text-gray-700">
                  企業名（カタカナ）
                </label>
                <input
                  type="text"
                  id="nameKana"
                  value={companyForm.nameKana}
                  onChange={(e) => setCompanyForm({ ...companyForm, nameKana: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* ウェブサイト / 웹사이트 */}
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  ウェブサイト
                </label>
                <input
                  type="url"
                  id="website"
                  value={companyForm.website}
                  onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })}
                  placeholder="https://example.com"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* 会社紹介 / 회사 소개 */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  会社紹介
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={companyForm.description}
                  onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* 業種/従業員数 / 업종/종업원수 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                    業種
                  </label>
                  <input
                    type="text"
                    id="industry"
                    value={companyForm.industry}
                    onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                    placeholder="例: IT/ソフトウェア"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="employeeCount" className="block text-sm font-medium text-gray-700">
                    従業員数
                  </label>
                  <input
                    type="number"
                    id="employeeCount"
                    value={companyForm.employeeCount}
                    onChange={(e) => setCompanyForm({ ...companyForm, employeeCount: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* 設立年/本社 / 설립연도/본사 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="foundedYear" className="block text-sm font-medium text-gray-700">
                    設立年
                  </label>
                  <input
                    type="number"
                    id="foundedYear"
                    value={companyForm.foundedYear}
                    onChange={(e) => setCompanyForm({ ...companyForm, foundedYear: e.target.value })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="headquarters" className="block text-sm font-medium text-gray-700">
                    本社所在地
                  </label>
                  <input
                    type="text"
                    id="headquarters"
                    value={companyForm.headquarters}
                    onChange={(e) => setCompanyForm({ ...companyForm, headquarters: e.target.value })}
                    placeholder="例: 東京都渋谷区"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {/* 保存ボタン / 저장 버튼 */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  保存中...
                </span>
              ) : (
                '保存'
              )}
            </button>
          </div>
        </form>

        {/* ホームへ戻る / 홈으로 돌아가기 */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            ← ホームへ戻る
          </button>
        </div>
      </div>
    </div>
  );
}
