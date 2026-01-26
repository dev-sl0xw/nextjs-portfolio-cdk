// 내 프로필 API
// マイプロフィールAPI
//
// GET /api/profile/me - 내 프로필 조회 (없으면 생성)
// PUT /api/profile/me - 내 프로필 업데이트

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser, isAuthError } from '@/lib/auth';
import { UserType } from '@prisma/client';

// ============================================================
// GET /api/profile/me
// 내 프로필 조회 (없으면 자동 생성)
// マイプロフィール取得（なければ自動作成）
// ============================================================
export async function GET(request: NextRequest) {
  // 인증 확인
  // 認証確認
  const authResult = await getAuthenticatedUser(request);

  if (isAuthError(authResult)) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const { sub, email, userType } = authResult;

  try {
    // 기존 사용자 조회
    // 既存ユーザー検索
    let user = await prisma.user.findUnique({
      where: { cognitoSub: sub },
      include: {
        jobSeeker: true,
        company: true,
      },
    });

    // 사용자가 없으면 새로 생성
    // ユーザーがいなければ新規作成
    if (!user) {
      const dbUserType = userType === 'company' ? UserType.COMPANY : UserType.JOBSEEKER;

      user = await prisma.user.create({
        data: {
          cognitoSub: sub,
          email,
          userType: dbUserType,
          // 사용자 유형에 따라 프로필 생성
          // ユーザータイプに応じてプロフィール作成
          ...(dbUserType === UserType.JOBSEEKER
            ? { jobSeeker: { create: {} } }
            : { company: { create: { name: '' } } }),
        },
        include: {
          jobSeeker: true,
          company: true,
        },
      });
    }

    // 프로필 정보 반환
    // プロフィール情報返却
    const profile =
      user.userType === UserType.JOBSEEKER ? user.jobSeeker : user.company;

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        createdAt: user.createdAt,
      },
      profile,
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json(
      { error: '프로필 조회 중 오류가 발생했습니다. / プロフィール取得中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}

// ============================================================
// PUT /api/profile/me
// 내 프로필 업데이트
// マイプロフィール更新
// ============================================================
export async function PUT(request: NextRequest) {
  // 인증 확인
  // 認証確認
  const authResult = await getAuthenticatedUser(request);

  if (isAuthError(authResult)) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const { sub } = authResult;

  try {
    // 요청 바디 파싱
    // リクエストボディ解析
    const body = await request.json();

    // 사용자 조회
    // ユーザー検索
    const user = await prisma.user.findUnique({
      where: { cognitoSub: sub },
      include: {
        jobSeeker: true,
        company: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없습니다. / ユーザーが見つかりません。' },
        { status: 404 }
      );
    }

    // 사용자 유형에 따라 프로필 업데이트
    // ユーザータイプに応じてプロフィール更新
    let updatedProfile;

    if (user.userType === UserType.JOBSEEKER && user.jobSeeker) {
      // 구직자 프로필 업데이트
      // 求職者プロフィール更新
      updatedProfile = await prisma.jobSeeker.update({
        where: { userId: user.id },
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          firstNameKana: body.firstNameKana,
          lastNameKana: body.lastNameKana,
          profileImageUrl: body.profileImageUrl,
          headline: body.headline,
          bio: body.bio,
          currentCompany: body.currentCompany,
          currentPosition: body.currentPosition,
          yearsOfExp: body.yearsOfExp,
          desiredSalary: body.desiredSalary,
          desiredLocations: body.desiredLocations,
          skills: body.skills,
          isPublic: body.isPublic,
        },
      });
    } else if (user.userType === UserType.COMPANY && user.company) {
      // 기업 프로필 업데이트
      // 企業プロフィール更新
      updatedProfile = await prisma.company.update({
        where: { userId: user.id },
        data: {
          name: body.name,
          nameKana: body.nameKana,
          logoUrl: body.logoUrl,
          website: body.website,
          description: body.description,
          industry: body.industry,
          employeeCount: body.employeeCount,
          foundedYear: body.foundedYear,
          headquarters: body.headquarters,
        },
      });
    } else {
      return NextResponse.json(
        { error: '프로필을 찾을 수 없습니다. / プロフィールが見つかりません。' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: '프로필이 업데이트되었습니다. / プロフィールが更新されました。',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json(
      { error: '프로필 업데이트 중 오류가 발생했습니다. / プロフィール更新中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}
