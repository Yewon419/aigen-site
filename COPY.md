# COPY.md · aigen-site 전 문장과 출처

> 상태: 초안(2026-11-13 새벽, 대표님 검토 전). 출처 없는 문장은 "신규"로 표시. 결과 숫자(다운로드·베타 인원) 없음. em-dash 없음.
> 출처 약어: BD-README = 빛뜰 데스크 README(`Yewon419/bitteul-desk`), q1~q4 = `Downloads\aigen\q*.txt` 확정본, pf = `portfolio.txt`, SC-README = 슈가캡 README, TR-README = 템포루틴 README, MASTER = 템포루틴 MASTER.md, 판넬 = `5팀_판넬.pdf`

## 모서리 라벨 (전 섹션 고정)

| 위치 | 문구 | 출처 |
|---|---|---|
| 좌상 | 한예원 · SK AIGEN 1기 지원 | 지원서 |
| 우상 | 2026 | |
| 좌하 | (현재 섹션명: 슈가캡 / 템포루틴 / 짐살라빔 / 빛뜰 데스크 / 일하는 방식) | |
| 우하 | 창업/비즈니스 | 지원서 1지망 |

## 0. 히어로

| 문장 | 출처 |
|---|---|
| 한예원 | |
| Portfolio | 11-13 대표님 결정(이전 "iOS 앱 두 개를 혼자 만들어 출시했습니다." 폐기) |
| 슈가캡 · 템포루틴 · 짐살라빔 · 빛뜰 데스크 | 목차 역할 (11-14 빛뜰 데스크 추가) |

## 1. 슈가캡

| 비트 | 문장 | 출처 |
|---|---|---|
| 1 | 슈가캡 | |
| 2 | 참는 대신, 즐겁게 줄인다. | pf 1문장 변형 |
| 3 | 오늘 마실 수 있는 양이 컵 하나에 담기고, 한 잔 기록할 때마다 그만큼 비워진다. | pf 그대로 |
| 3.5 | 기준은 주마다 서서히 낮아져, 지난주보다 조금씩 덜 마시게 된다. | pf 그대로(11-14 추가: 행동을 바꾸는 장치) |
| 4 | 2,057종 (띠 안 카운터) / 카페 브랜드 16곳 메뉴를 검색해 한 번에 기록한다. 판매는 한국부터 시작했고, 영어·중국어와 미국·대만 카탈로그까지 갖춰 뒀다. | SC-README(16곳·2,057종, "앱은 한국어·영어·중국어(번체)를 지원한다. 판매는 한국부터 시작했고, 미국·대만 카탈로그는 구현해 두었다"), pf(검색해 한 번에 기록) |
| 5 | 밤이 되면 남은 음료를 로슈와 카인에게 먹인다. | pf |
| 6 | 기획, 데이터 수집, 캐릭터 원화, 개발, 출시를 혼자 했다. | pf 마지막 문장 그대로. 11-14 "서버도 계정도 없다"를 대표님 지시로 교체(슈가캡엔 약한 장점) |
| 7 | 만든 방법 도표(11-14 글 목록을 도표로 교체): 카페 공식 홈페이지(브랜드 16곳) → Python 수집기(ruff · mypy · pytest) → catalog.json(손으로 고치지 않는다) → iOS 앱(Swift · SwiftUI · 직접 그린 원화) → GitHub Actions(빌드 · UI 테스트 · 스토어 스크린샷) → App Store(한국부터 판매) | SC-README "데이터"(브랜드 공식 홈페이지 값을 `tools/scrape/` 파이프라인으로 수집, `data/catalog.json`은 손으로 고치지 않음), "만든 방법" 표(Python 3.13·ruff·mypy·pytest / Swift·SwiftUI·SwiftData / GitHub Actions macOS 러너 빌드·UI 테스트·스토어 스크린샷 / 직접 그린 원화), 판매는 한국부터 |
| 8 | App Store · GitHub · sugarcap.vercel.app | `apps.apple.com/kr/app/id6814832068` · `github.com/Yewon419/sugarcap` · `sugarcap.vercel.app` |

## 2. 템포루틴

| 비트 | 문장 | 출처 |
|---|---|---|
| 1 | 템포루틴 | |
| 2 | 당신 몸의 템포에 맞게. | MASTER 태그라인 |
| 3 | 주기의 네 단계를 겨울·봄·여름·가을로. | pf |
| 4 | 평균을 내면 패턴이 사라진다. 그래서 정답 대신 본인 기록을 돌려준다. | q1 두 문장 압축 |
| 5 | "기록상 이때 에너지가 높았어요" 단정 대신 관찰한 사실만. | q1 |
| 6 | 생리 기록은 내 기기와 개인 iCloud에만 저장된다. Apple 건강 앱 연동은 선택. | TR-README 프라이버시 "기기(SwiftData)와 사용자 개인 iCloud(CloudKit private DB)에만 저장", "HealthKit 연동은 선택". 11-14 교체. iCloud 동기화가 있어 "기기 밖으로 안 나간다"는 틀림 |
| 2.5 | 어떤 주는 술술 되고, 어떤 주는 유난히 버겁다. 몸에도 계절이 있어서다. | 템포루틴 `marketing/ad-teaser/SCRIPT.md` 자막 "어떤 주는 술술 되고, / 어떤 주는 유난히 버거워요.", 완성본 자막 "여자의 몸엔 계절이 있다는 걸". 11-14 "출시 티저도 만들었다"를 대표님 지시로 개념 설명으로 교체 |
| 보조 | 개념 영상: `ad-teaser/final/temporoutine-teaser-4k.mp4`를 540x960·무음으로 줄임, 장 앞쪽(제목 다음) | 같은 폴더 |
| 6.2 | 체크인할 때마다 씨앗이 모이고, 그 씨앗으로 테마를 연다. | TR-README "체크인으로 모으는 씨앗으로 잠금 해제하는 테마". 테마 수는 코드와 촬영본이 달라 쓰지 않음 |
| 보조 | 테마 화면 6장(Standard·Plain·Modern·Letterpress·Ticket·Weather의 오늘 화면) | Kayla 릴스 000 에셋 `컷/apps_shots/temporoutine/ThemeShot*Today.jpg` (11-14 대표님 허가) |
| 7 | 만든 방법 도표(11-14 글 목록을 도표로 교체): Windows(여기서 개발하고 push) → 예측 엔진 테스트(GitHub Actions · Linux) → 앱 빌드(GitHub Actions · macOS) → TestFlight(실기기 베타) → App Store(출시), TestFlight에서 Windows로 되돌아가는 화살표 「베타 피드백을 꾸준히 반영」 | TR-README 개발 방식(Windows 개발, 로컬 Swift 컴파일 없음, CI 3잡: TempoCore 테스트는 Linux 공식 Swift 컨테이너, 앱 빌드는 macOS 러너, TestFlight 업로드, 런타임 동작은 TestFlight 실기기에서 최종 확인), 구조(TempoCore = 예측 엔진, 순수 Foundation 패키지), TR-README 개발 방식·구조, 템포루틴 리포 커밋 제목의 「베타 N건」 기록(1.0 출시 전후 계속). 11-14 대표님 지시로 횟수 대신 꾸준함으로 |
| 8 | App Store · GitHub | `apps.apple.com/kr/app/id6791803620` · `github.com/Yewon419/TempoRoutine` |

## 3. 짐살라빔

| 비트 | 문장 | 출처 |
|---|---|---|
| 1 | 짐살라빔 | |
| 2 | 웹캠 하나로 스쿼트를 채점한다. | pf 변형 |
| 3 | 스쿼트를 다섯 단계로 나눠 무릎·몸통·엉덩이 각도를 기준값과 비교한다. | pf, 판넬(5-step, Knee/Trunk/Hip Angle) |
| 4 | 정확도 대신 실시간을 골랐다. MediaPipe. | q3 |
| 5 | AI 동아리 4인 팀. 자세 인식 모델 리서치와 데모를 맡았다. | pf, 판넬 Members 4명 |
| 6 | 데모데이 부스에서 시연하자 교수들까지 직접 스쿼트를 해 보고 갔다. | pf |
| 6 | 판넬 PDF 보기 | `assets/gimsalabim-panel.pdf` |

## 3.5 빛뜰 데스크 (11-14 추가, 대표님 지시)

| 비트 | 문장 | 출처 |
|---|---|---|
| 1 | 빛뜰 데스크 | |
| 2 | 맞는 도구가 없어서, 직접 만들었다. | q2(11-14 개정본) 요지 |
| 3 | 오픈소스 Pixel Agents를 포크해, Claude Code 세션 하나를 사무실 직원 한 명으로. | BD-README 첫 줄·"세션마다 직원 한 명", 리포가 Pixel Agents(MIT) 포크 |
| 4 | 직원을 누르면 그 세션의 대화 창. 답장도 도구 승인도 거기서 한다. | BD-README "누르면 대화 창", "대시보드에서 바로 답장" |
| 5 | 밖에서는 폰으로. 사무실을 보고 지시와 승인까지 한다. | BD-README "폰으로 밖에서도" |
| 6 | 답을 기다리거나 일을 마치면 폰으로 알림이 온다. | 리포 커밋 10-24 `Push phone alerts over Web Push when something waits on the user`, `feat(push): alert when a session finishes its turn` |
| 7 | GitHub | `github.com/Yewon419/bitteul-desk` |
| 보조 | 첫 문장 옆 그림: 큐브 사무실 여섯 칸(Kayla 릴스 000 에셋 `컷/company/gen/cube_1.png` 위 두 줄 크롭, 11-14 대표님 허가) | 장식 그림, 실제 화면 아님 |
| 보조 | 챕터 아이콘: 빛뜰 컴퍼니 큐브 사무실(Kayla 릴스 000 에셋 `컷/company/gen/box_3.png`, 11-14 대표님 허가) | 정사각 크롭 |
| 보조 | 스크린샷 4장: 사무실, 대화 창, 폰 사무실, 폰 대화 창 | BD-README `docs/screenshots/`(격리 환경·가짜 세션으로 촬영) |

## 4. AI와 일하는 방식

| 비트 | 문장 | 출처 |
|---|---|---|
| 1 | AI와 일하는 방식 | |
| 2~5 | 다섯 단계 도표(11-14 문장 다섯 줄을 도표로 교체, 띠가 지금 단계 상자를 칠함): 스펙 문서(단일 출처. AI도 나도 여기서) → 구현(AI가 코드를 쓴다) → 게이트(린터 · 타입 체크 · 테스트) → 스크린샷 검수(CI가 찍고, 내가 본다) → 환경 고치기(반복되는 불편은 참지 않는다), 마지막 상자에서 첫 상자로 「다음 작업으로」 | 아래 원문 문장들을 상자로 줄임. 「다음 작업으로」 되돌이 화살표는 신규, 확인 필요 |
| (원문) | 스펙 문서 하나가 단일 출처다. AI도 나도 거기서 출발한다. | SC-README("SPEC.md 제품 스펙 (SSOT)"), TR-README("설계 SSOT는 MASTER.md"). 신규 문장 |
| (원문) | AI가 쓴 코드는 린터·타입 체크·테스트 게이트를 지나야 들어온다. | SC-README 표. 신규 문장 |
| (원문) | 화면은 스크린샷으로 확인한다. CI가 찍고, 내가 본다. | SC store-screenshots 워크플로. 신규 문장 |
| (원문) | 반복되는 불편은 참기보다 환경부터 고친다. | q2(11-14 개정본) 마지막 문장. 이전 문장은 주식 Q2 폐기로 교체 |
| 5 | 이 페이지도 같은 방식으로 만들었다. | 리포 링크(생성 후) |
| 보조 | COPY.md 표 카드: "COPY.md: 이 페이지의 모든 문장과 출처" + 이 파일의 네 줄(문장·출처, 출처 약어는 풀어 씀) | 이 파일 |
| 보조 | 검수 스틸 이미지: 슈가캡 컵 수위 장면 비트별 스틸(`tools/stills.mjs` 결과) | 이 리포 |

## 5. 엔드

| 문장 | 출처 |
|---|---|
| 한예원 | |
| 슈가캡 App Store / 슈가캡 GitHub / 템포루틴 App Store / 템포루틴 GitHub / 짐살라빔 판넬 PDF / 빛뜰 데스크 GitHub / github.com/Yewon419 | 링크 전체 목록 |

## 대표님 확인 필요 (신규 문장)

1. ~~히어로 문장~~ → "Portfolio"로 확정(11-13)
2. 슈가캡 "AI와 같이 쓴 코드는 ruff·mypy·pytest를 지나야 들어온다."
3. 방식 2·3·4 세 문장 (스펙 SSOT / 게이트 / 스크린샷 확인)
4. 템포루틴 GitHub 링크를 넣을지 (리포 public이지만 지원서 링크 목록엔 없었음)
