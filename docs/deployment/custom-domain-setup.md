# Custom Domain Setup Guide

## 개요

`vibe.er.ht` 커스텀 도메인을 CloudFront에 연결하기 위한 배포 가이드.

## 사전 조건

- AWS CLI 설정 완료
- CDK bootstrap 완료 (us-east-1 리전 포함)
- 지인(DNS 관리자)에게 CNAME 추가 요청 가능

## 배포 단계

### 1. us-east-1 리전 Bootstrap (최초 1회)

```bash
cd infrastructure
npx cdk bootstrap aws://<ACCOUNT_ID>/us-east-1
```

### 2. CertificateStack 배포

```bash
npx cdk deploy CertificateStack
```

배포 완료 후 AWS Console에서 인증서 상태 확인:
1. AWS Console → Certificate Manager → us-east-1 리전
2. 인증서 선택 → "Domains" 섹션에서 CNAME 레코드 확인

### 3. DNS 검증 CNAME 추가 요청

지인(DNS 관리자)에게 다음 정보 전달:

```
레코드 유형: CNAME
이름: _<hash>.vibe.er.ht
값: _<hash>.acm-validations.aws
```

(실제 값은 AWS Console에서 확인)

### 4. 인증서 발급 대기

- 상태가 "Pending validation" → "Issued"로 변경될 때까지 대기
- 일반적으로 DNS 레코드 추가 후 수 분 ~ 수 시간 소요

### 5. CloudFrontStack 배포

인증서 발급 완료 후:

```bash
npx cdk deploy CloudFrontStack
```

### 6. CloudFront 도메인 CNAME 추가 요청

지인(DNS 관리자)에게 다음 정보 전달:

```
레코드 유형: CNAME
이름: vibe
값: <distribution-id>.cloudfront.net
```

(실제 CloudFront 도메인은 배포 출력에서 확인)

### 7. 접속 테스트

```bash
curl -I https://vibe.er.ht
```

## 문제 해결

### 인증서 검증 실패
- DNS CNAME 레코드가 올바르게 추가되었는지 확인
- `dig _<hash>.vibe.er.ht CNAME` 명령으로 DNS 전파 확인

### CloudFront 배포 실패
- 인증서 상태가 "Issued"인지 확인
- 인증서가 us-east-1 리전에 있는지 확인

### HTTPS 접속 오류
- DNS CNAME이 CloudFront 도메인을 올바르게 가리키는지 확인
- `dig vibe.er.ht CNAME` 명령으로 확인
