import * as cdk from 'aws-cdk-lib';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import { Construct } from 'constructs';

/**
 * Certificate 스택 Props
 * Certificateスタック Props
 */
export interface CertificateStackProps extends cdk.StackProps {
  readonly projectName: string;
  readonly environment: string;
  readonly domainName: string;
}

/**
 * ACM Certificate 스택
 * ACM Certificateスタック
 *
 * [Security Layer] SSL/TLS 인증서 관리
 * SSL/TLS証明書管理
 *
 * 주의사항:
 * - CloudFront용 인증서는 반드시 us-east-1 리전에 생성해야 함
 * - DNS 검증 방식 사용 (외부 DNS 관리자에게 CNAME 추가 요청 필요)
 *
 * 注意事項:
 * - CloudFront用証明書は必ずus-east-1リージョンに作成する必要あり
 * - DNS検証方式使用（外部DNS管理者にCNAME追加依頼が必要）
 */
export class CertificateStack extends cdk.Stack {
  public readonly certificate: acm.Certificate;

  constructor(scope: Construct, id: string, props: CertificateStackProps) {
    super(scope, id, props);

    const { projectName, environment, domainName } = props;

    // ============================================================
    // ACM 인증서 생성 (DNS 검증)
    // ACM証明書作成（DNS検証）
    //
    // DNS 검증 선택 이유:
    // - 자동 갱신 지원
    // - 이메일 접근 불필요
    // - 외부 DNS 관리자에게 CNAME 추가만 요청하면 됨
    //
    // DNS検証選択理由:
    // - 自動更新対応
    // - メールアクセス不要
    // - 外部DNS管理者にCNAME追加を依頼するだけ
    // ============================================================
    this.certificate = new acm.Certificate(this, 'Certificate', {
      domainName: domainName,
      validation: acm.CertificateValidation.fromDns(),
      certificateName: `${projectName}-${environment}-certificate`,
    });

    // ============================================================
    // 출력값 정의
    // 出力値定義
    // ============================================================
    new cdk.CfnOutput(this, 'CertificateArn', {
      value: this.certificate.certificateArn,
      description: 'ACM Certificate ARN (use this in CloudFront)',
      exportName: `${projectName}-${environment}-certificate-arn`,
    });

    new cdk.CfnOutput(this, 'DomainName', {
      value: domainName,
      description: 'Domain name for the certificate',
      exportName: `${projectName}-${environment}-domain-name`,
    });
  }
}
