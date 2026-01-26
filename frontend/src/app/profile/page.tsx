// 프로필 페이지
// プロフィールページ
//
// 로그인한 사용자의 프로필 보기/수정
// ログインユーザーのプロフィール表示/編集

'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getIdToken } from '@/lib/cognito';
import ProfileImageUpload from '@/components/ProfileImageUpload';

// ============================================================
// 타입 정의
// 型定義
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
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  // 상태 관리
  // 状態管理
  const [userData, setUserData] = useState<UserData | null>(null);
  const [profile, setProfile] = useState<JobSeekerProfile | CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 폼 데이터 (JobSeeker)
  // フォームデータ（JobSeeker）
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

  // 폼 데이터 (Company)
  // フォームデータ（Company）
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
  // 프로필 데이터 로드
  // プロフィールデータロード
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
          throw new Error('프로필 로드 실패');
        }

        const data: ProfileResponse = await response.json();
        setUserData(data.user);
        setProfile(data.profile);

        // 폼 데이터 초기화
        // フォームデータ初期化
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
        setError('프로필을 불러오는데 실패했습니다.');
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
  // 프로필 저장
  // プロフィール保存
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

      // 저장할 데이터 준비
      // 保存するデータ準備
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
        throw new Error(errorData.error || '저장 실패');
      }

      setSuccessMessage('프로필이 저장되었습니다. / プロフィールが保存されました。');

      // 3초 후 메시지 숨김
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Profile save error:', err);
      setError('프로필 저장에 실패했습니다. / プロフィール保存に失敗しました。');
    } finally {
      setIsSaving(false);
    }
  };

  // ------------------------------------------------------------
  // 이미지 업로드 완료 핸들러
  // 画像アップロード完了ハンドラー
  // ------------------------------------------------------------
  const handleImageUpload = (imageUrl: string) => {
    if (userData?.userType === 'JOBSEEKER') {
      setJobSeekerForm((prev) => ({ ...prev, profileImageUrl: imageUrl }));
    } else {
      setCompanyForm((prev) => ({ ...prev, logoUrl: imageUrl }));
    }
  };

  // ------------------------------------------------------------
  // 로딩 상태
  // ローディング状態
  // ------------------------------------------------------------
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // 렌더링
  // レンダリング
  // ------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 / ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">프로필 설정</h1>
          <p className="mt-2 text-gray-600">
            {userData?.userType === 'JOBSEEKER' ? '구직자 프로필' : '기업 프로필'}
          </p>
        </div>

        {/* 성공 메시지 / 成功メッセージ */}
        {successMessage && (
          <div className="mb-6 rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-700">{successMessage}</div>
          </div>
        )}

        {/* 에러 메시지 / エラーメッセージ */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* 프로필 폼 / プロフィールフォーム */}
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          {/* 이미지 업로드 / 画像アップロード */}
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

          {/* JobSeeker 폼 / JobSeekerフォーム */}
          {userData?.userType === 'JOBSEEKER' && (
            <>
              {/* 이름 / 名前 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    성 (姓)
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
                    이름 (名)
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

              {/* 가타카나 / カタカナ */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="lastNameKana" className="block text-sm font-medium text-gray-700">
                    성 (セイ)
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
                    이름 (メイ)
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

              {/* 한줄 소개 / 一行紹介 */}
              <div>
                <label htmlFor="headline" className="block text-sm font-medium text-gray-700">
                  한줄 소개 / 一行紹介
                </label>
                <input
                  type="text"
                  id="headline"
                  value={jobSeekerForm.headline}
                  onChange={(e) => setJobSeekerForm({ ...jobSeekerForm, headline: e.target.value })}
                  placeholder="예: 5년차 프론트엔드 개발자"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* 자기 소개 / 自己紹介 */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  자기 소개 / 自己紹介
                </label>
                <textarea
                  id="bio"
                  rows={4}
                  value={jobSeekerForm.bio}
                  onChange={(e) => setJobSeekerForm({ ...jobSeekerForm, bio: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* 현재 회사/직책 / 現在の会社/役職 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="currentCompany" className="block text-sm font-medium text-gray-700">
                    현재 회사 / 現在の会社
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
                    현재 직책 / 現在の役職
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

              {/* 경력/희망연봉 / 経験年数/希望年収 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="yearsOfExp" className="block text-sm font-medium text-gray-700">
                    경력 연수 / 経験年数
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
                    희망 연봉 (만엔) / 希望年収（万円）
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

              {/* 희망 근무지 / 希望勤務地 */}
              <div>
                <label htmlFor="desiredLocations" className="block text-sm font-medium text-gray-700">
                  희망 근무지 / 希望勤務地 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  id="desiredLocations"
                  value={jobSeekerForm.desiredLocations}
                  onChange={(e) => setJobSeekerForm({ ...jobSeekerForm, desiredLocations: e.target.value })}
                  placeholder="예: 도쿄, 오사카, 리모트"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* 스킬 / スキル */}
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                  스킬 / スキル (쉼표로 구분)
                </label>
                <input
                  type="text"
                  id="skills"
                  value={jobSeekerForm.skills}
                  onChange={(e) => setJobSeekerForm({ ...jobSeekerForm, skills: e.target.value })}
                  placeholder="예: React, TypeScript, Node.js"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* 공개 설정 / 公開設定 */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={jobSeekerForm.isPublic}
                  onChange={(e) => setJobSeekerForm({ ...jobSeekerForm, isPublic: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                  프로필 공개 / プロフィールを公開する
                </label>
              </div>
            </>
          )}

          {/* Company 폼 / Companyフォーム */}
          {userData?.userType === 'COMPANY' && (
            <>
              {/* 기업명 / 企業名 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  기업명 / 企業名 <span className="text-red-500">*</span>
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

              {/* 기업명 가타카나 / 企業名カタカナ */}
              <div>
                <label htmlFor="nameKana" className="block text-sm font-medium text-gray-700">
                  기업명 (カタカナ)
                </label>
                <input
                  type="text"
                  id="nameKana"
                  value={companyForm.nameKana}
                  onChange={(e) => setCompanyForm({ ...companyForm, nameKana: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* 웹사이트 / ウェブサイト */}
              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  웹사이트 / ウェブサイト
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

              {/* 회사 소개 / 会社紹介 */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  회사 소개 / 会社紹介
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={companyForm.description}
                  onChange={(e) => setCompanyForm({ ...companyForm, description: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              {/* 업종/종업원수 / 業種/従業員数 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                    업종 / 業種
                  </label>
                  <input
                    type="text"
                    id="industry"
                    value={companyForm.industry}
                    onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
                    placeholder="예: IT/소프트웨어"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="employeeCount" className="block text-sm font-medium text-gray-700">
                    종업원 수 / 従業員数
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

              {/* 설립연도/본사 / 設立年/本社 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="foundedYear" className="block text-sm font-medium text-gray-700">
                    설립 연도 / 設立年
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
                    본사 소재지 / 本社所在地
                  </label>
                  <input
                    type="text"
                    id="headquarters"
                    value={companyForm.headquarters}
                    onChange={(e) => setCompanyForm({ ...companyForm, headquarters: e.target.value })}
                    placeholder="예: 도쿄도 시부야구"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </>
          )}

          {/* 저장 버튼 / 保存ボタン */}
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
                  저장 중...
                </span>
              ) : (
                '저장 / 保存'
              )}
            </button>
          </div>
        </form>

        {/* 홈으로 돌아가기 / ホームへ戻る */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            ← 홈으로 돌아가기 / ホームへ戻る
          </button>
        </div>
      </div>
    </div>
  );
}
