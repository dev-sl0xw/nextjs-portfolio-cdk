핵심 내용
- 개발 환경 AWS FreeTier, TypeScript, CDK
- 작고 빠르게 시작하여 점진적으로 개선해 나아가는 방향으로 개발
- 개발을 시작하기 전에 Root 아래에 README.md 를 작성한다.
	- 개발 목적, 사용된 기술, 인프라 아키텍처 등을 기술한다.
- 언어는 한국어로 작성하고 그 바로 아래줄에 번역 스크립트로서 일본어로 작성한다
	- 예시) 안녕하세요
	     　こんにちは
	- 주의점 : 일본어 작성은 일본의 실생활에서 사용되는 자연스러우면서도 어색하지 않은 비즈니스 일본어(N1~비즈니스 레벨)로 작성한다.
- rules/ 아래에 항상 적용될 가드레일 설정은 아직 정하지 못했으니 이 부분은 나에게 어떻게 하면 좋을지 추천을 부탁해
주 목적 
- 면접에서 자기 어필을 위한 간단한 포트폴리오 사이트 작성이 목적이기 때문에 MVP 개발로 진행한다
	- 사이트 접속시 간단한 기업 소개 랜딩 페이지를 작성, 나중에 사용자가 직접 생성한 기업 광고용 영상 (30초~1분) 짜리를 iframe 태그로 넣거나 혹은 영상 자체를 삽입할 수 있도록 되어야함.

사용하고자 하는 AWS 서비스
- Route53
	- DNS발급 (오래 걸리거나 굳이 필요하지 않다면 아키텍처와 readme.md 에 언급만 하여도 무방함)
- CloudFront
	- ACM을 추가하여 HTTPS 적용(추가 설명 부탁)
- S3
	- OAC
	- 404(SorryPage) - static page
		- Astro 사용하여 작성
- WAF
	- 보호(추가 설명 부탁)
- VPC
	- 2계층
	- public subnet
		- Elastic Load Balancer
			- ALB?
			- NLB?
		- NATGateway
	- private subnet
		- ECS Container x 1 (frontend)
			- NEXT.js 사용
				- DockerImage
- CI/CD
	- Github Actions