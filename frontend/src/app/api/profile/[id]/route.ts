// 공개 프로필 API
// 公開プロフィールAPI
//
// GET /api/profile/[id] - 공개 프로필 조회
// 인증 불필요 (공개 프로필만 표시)

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { UserType } from '@prisma/client';

// ============================================================
// GET /api/profile/[id]
// 공개 프로필 조회
// 公開プロフィール取得
//
// 구직자: isPublic = true인 경우만 표시
// 기업: 모든 기업 프로필 표시 (채용 목적)
// ============================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 사용자 및 프로필 조회
    // ユーザーおよびプロフィール検索
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        jobSeeker: true,
        company: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '프로필을 찾을 수 없습니다. / プロフィールが見つかりません。' },
        { status: 404 }
      );
    }

    // 구직자인 경우 공개 설정 확인
    // 求職者の場合、公開設定確認
    if (user.userType === UserType.JOBSEEKER) {
      if (!user.jobSeeker?.isPublic) {
        return NextResponse.json(
          { error: '비공개 프로필입니다. / 非公開プロフィールです。' },
          { status: 403 }
        );
      }

      // 공개 프로필 정보만 반환 (민감한 정보 제외)
      // 公開プロフィール情報のみ返却（機密情報除外）
      return NextResponse.json({
        userType: user.userType,
        profile: {
          id: user.jobSeeker.id,
          firstName: user.jobSeeker.firstName,
          lastName: user.jobSeeker.lastName,
          profileImageUrl: user.jobSeeker.profileImageUrl,
          headline: user.jobSeeker.headline,
          bio: user.jobSeeker.bio,
          currentCompany: user.jobSeeker.currentCompany,
          currentPosition: user.jobSeeker.currentPosition,
          yearsOfExp: user.jobSeeker.yearsOfExp,
          skills: user.jobSeeker.skills,
          // desiredSalary, desiredLocations는 비공개
          // desiredSalary, desiredLocationsは非公開
        },
      });
    }

    // 기업 프로필
    // 企業プロフィール
    if (user.userType === UserType.COMPANY && user.company) {
      return NextResponse.json({
        userType: user.userType,
        profile: {
          id: user.company.id,
          name: user.company.name,
          nameKana: user.company.nameKana,
          logoUrl: user.company.logoUrl,
          website: user.company.website,
          description: user.company.description,
          industry: user.company.industry,
          employeeCount: user.company.employeeCount,
          foundedYear: user.company.foundedYear,
          headquarters: user.company.headquarters,
          isVerified: user.company.isVerified,
        },
      });
    }

    return NextResponse.json(
      { error: '프로필을 찾을 수 없습니다. / プロフィールが見つかりません。' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Public profile GET error:', error);
    return NextResponse.json(
      { error: '프로필 조회 중 오류가 발생했습니다. / プロフィール取得中にエラーが発生しました。' },
      { status: 500 }
    );
  }
}
