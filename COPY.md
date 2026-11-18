# COPY.md · aigen-site 전 문장과 출처

> 상태: 11-18 최종안 반영(`Downloads\aigen\site_copy_v2.md`, ChatGPT·Gemini 채점과 말투 검토 후 대표님 확정). 문구는 작품 설명 중심, 경험담은 쓰지 않는다. 결과 숫자(다운로드·베타 인원) 없음. em-dash 없음.
> 어미: 띠·제목 줄은 마침표 없는 명사형, 본문은 "~한다/~했다", 앱 속 말은 해요체 인용, 그림 라벨은 명사형.
> 출처 약어: BD-README = 빛뜰 데스크 README(`Yewon419/bitteul-desk`), q1~q4 = `Downloads/aigen/q*.txt` 지원서 확정본, pf = `portfolio.txt`, SC-README = 슈가캡 README, SC-SPEC = 슈가캡 SPEC.md, TR-README = 템포루틴 README, MASTER = 템포루틴 MASTER.md, 판넬 = `5팀_판넬.pdf`, FS = `Downloads/aigen/site_script.md` 사실 시트(11-18, 위 문서들에서 정리해 ChatGPT·Gemini 채점에 쓴 것)

## 모서리 라벨 (전 섹션 고정)

| 위치 | 문구 | 출처 |
|---|---|---|
| 좌상 | 한예원 · SK AIGEN 1기 지원 | 지원서 |
| 우상 | 2026 | |
| 좌하 | (현재 장 이름. 11-18 장 순서 = 슈가캡 → 템포루틴 → 빛뜰 데스크 → 짐살라빔 → 일하는 방식) | 대표님 지시 |
| 우하 | 창업/비즈니스 | 지원서 1지망 |

## 0. 히어로

| 문장 | 출처 |
|---|---|
| 한예원 | |
| Portfolio | 11-13 대표님 결정 |
| 슈가캡 · 템포루틴 · 빛뜰 데스크 · 짐살라빔 | 장 순서 |

## 0.5 목차

| 장 | 한 줄 소개 | 링크 | 출처 |
|---|---|---|---|
| 슈가캡 | 당·카페인을 즐겁게 줄이는 iOS 앱, 1인 개발 | App Store · GitHub · 소개 페이지 | SC-README 첫 줄, pf |
| 템포루틴 | 생리 주기에 맞춰 한 달을 짜는 iOS 플래너, 1인 개발 | App Store · GitHub | TR-README, MASTER |
| 빛뜰 데스크 | Claude Code 세션 관리 웹 대시보드, 1인 개발 | GitHub | BD-README |
| 짐살라빔 | 웹캠으로 스쿼트·댄스 자세를 채점하는 웹, 4인 팀 | 판넬 PDF | 판넬 |
| AI와 일하는 방식 | 스펙부터 화면 검수까지, 만드는 공정 | GitHub(aigen-site) | 아래 4장 |

장 이름은 그 장 첫 화면으로 가는 링크. 링크 미리보기(og): 설명 = "슈가캡, 템포루틴, 빛뜰 데스크, 짐살라빔과 AI와 일하는 방식.", 그림 = 첫 화면 1200x630(`tools/og.mjs`).

## 1. 슈가캡

| 칸 | 문장 | 출처 |
|---|---|---|
| 띠 | 슈가캡 | |
| su-1 | 당과 카페인을 즐겁게 줄이는 앱 | SC-README 첫 줄 |
| su-2 | 오늘 마실 수 있는 당·카페인 양이 컵에 담기고, 한 잔 기록할 때마다 그만큼 줄어든다. | pf |
| su-2b | 5일 이상 지킨 주가 끝나면 하루 기준이 한 칸 내려가고, 선물이 온다. | `ReductionMath.swift`: 7일 중 5일 이상 그 주 기준 이하면 달성, 달성한 주만 내려감. 선물 = FS 슈가캡 기능("지킨 주에는 선물이 온다") |
| 그림 | 막대 50·45·45·40·35·35·30·30·25g / 기본 설정 예: 하루 당류 50g에서 25g까지, 8주 계획 | 기본값(50g→25g, 8주, 5g 단위 반올림) |
| 띠 | 2,057종 (카운터) | SC-README |
| su-3 | 카페 16곳 메뉴 2,057종과 편의점 음료 17,243종을 검색해 기록한다. 고르는 순간, 마시면 얼마가 남는지 보여 준다. | SC-README(카페 16곳 2,057종, 편의점 17,243종), FS("고르기 전에 마시면 당이 얼마 남는지 미리 보여 준다") |
| 그림 | 한국 / 카페 16곳 · 편의점 2,057종 · 17,243종, 미국 / Starbucks · Dutch Bros 467종(167+300), 대만 / cama café · 可不可 143종(100+43) | 카탈로그 파일 집계. 편의점 카탈로그는 한국에만 있음(SC-SPEC) |
| 그림 설명 | 한국·미국·대만 출시. 기기 지역에 따라 카탈로그가 바뀐다. | 11-17 대표님 정정(3개국 출시), `MenuCountry.resolve`(설정값 → 기기 지역) |
| su-4 | 남은 양은 밤에 캐릭터에게 먹인다 | pf |
| su-4c | 로슈는 당을, 카인은 카페인을 먹는다. 먹일수록 호감도가 쌓인다. | FS 슈가캡 기능(로슈 = 당, 카인 = 카페인, 먹여 호감도를 쌓는다) |
| su-5 | 기획부터 메뉴 데이터 수집, 캐릭터 원화, 개발, 3개국 출시까지 혼자 했다. | pf 마지막 문장, 출시 국가 11-17 정정 |
| 띠 + 도표 | 만든 방법: 카페 홈페이지(브랜드가 공개한 수치) → Python 수집기(린터·타입·테스트 통과) → catalog.json(손으로 고치지 않는다) → iOS 앱(SwiftUI · 직접 그린 원화) → GitHub Actions(빌드·UI 테스트·스크린샷) → App Store(한국 · 미국 · 대만) | SC-README "데이터"·"만든 방법" 표(ruff·mypy·pytest, macOS 러너 빌드·UI 테스트·스토어 스크린샷) |
| 링크 | App Store · GitHub · sugarcap.vercel.app | `apps.apple.com/kr/app/id6814832068` · `github.com/Yewon419/sugarcap` · `sugarcap.vercel.app` |

## 2. 템포루틴

| 칸 | 문장 | 출처 |
|---|---|---|
| 띠 | 템포루틴 | |
| te-1 | 몸의 주기에 맞추는 iOS 플래너 | FS 템포루틴 "무엇"(플래너·캘린더 앱) |
| 보조 | 개념 영상: `ad-teaser/final/temporoutine-teaser-4k.mp4`를 540x960·무음으로 줄임 | 템포루틴 리포 |
| te-6 | 대부분의 플래너는 매일 컨디션이 같다고 가정한다. 템포루틴은 한 달의 흐름에 맞춰 할 일을 나눈다. | FS 템포루틴 "문제"(매일 같은 컨디션을 전제로 계획) |
| 띠 | 겨울 / 봄 / 여름 / 가을 | 앱 캘린더 계절 띠 |
| te-2 | 생리 주기의 네 단계를 겨울·봄·여름·가을로 나타내, 캘린더 날짜 아래 띠로 보여 준다. | pf, 캘린더 스크린샷 |
| te-3 | 주기 패턴은 사람마다 달라 평균으로는 드러나지 않는다. 그래서 에너지·기분 기록으로 각자의 경향을 보여 준다. | q1, "나의 템포" 화면 |
| te-4 | "기록을 보면 이때 에너지가 높았어요." 진단하지 않고, 관찰한 사실만 말한다. | q1, 앱 문구 원칙 |
| te-5 | 계정과 자체 서버가 없고, 생리 기록은 iCloud 동기화 대상에서 뺐다. | FS 개인정보(계정 없음, 자체 서버 없음), `PlannerSync.swift` 7-8행(PeriodDay 미동기). ⚠ "기기에만"이라고 쓰지 않는다(SwiftData 자동 미러 여부 미확인) |
| 그림 | 생리 기록 → iCloud 동기화 제외(건강 앱 연동은 선택) / 일정 · 체크인 → 개인 iCloud(설정에서 끄기 가능) / 주기 예측 → 기기 안에서 계산(서버 전송 없음) | `PlannerSync.swift`(CKSyncEngine 범위, 사용자 토글), HealthKit menstrualFlow 연동 선택, TempoCore(Foundation만) |
| 그림 설명 | 분석 도구도 넣지 않았다. | FS 개인정보(분석 도구 없음). 외부 통신 = GitHub 공지·테마 영상, WeatherKit, StoreKit, CloudKit뿐 |
| te-7 | 체크인할 때마다 씨앗이 모이고, 씨앗으로 화면 테마 6종을 잠금 해제한다. | TR-README(씨앗으로 잠금 해제하는 테마), FS(테마 6종 이름) |
| 보조 | 테마 화면 6장(Standard·Plain·Modern·Letterpress·Ticket·Weather) | Kayla 릴스 000 에셋(11-14 대표님 허가) |
| 띠 + 도표 | 만든 방법: Windows PC(맥 없이 개발, push) → 엔진 테스트(GitHub Actions · Linux) → 앱 빌드(GitHub Actions · macOS) → TestFlight(실기기 베타) → App Store(출시 · 4개 언어), TestFlight에서 처음으로 「베타 피드백 반영」 | TR-README 개발 방식(Windows 개발, CI 3잡), FS(한국어·영어·일본어·중국어 4개 언어) |
| 링크 | App Store · GitHub | `apps.apple.com/kr/app/id6791803620` · `github.com/Yewon419/TempoRoutine` |

## 3. 빛뜰 데스크

| 칸 | 문장 | 출처 |
|---|---|---|
| 띠 | 빛뜰 데스크 | |
| de-1 | AI 코딩 세션 관리 대시보드 | BD-README 첫 줄 |
| de-2 | Claude Code 세션을 여러 개 띄우면 어느 세션이 답을 기다리는지 찾기 어렵다. 그래서 세션 하나가 사무실 직원 한 명이 된다. | BD-README("세션마다 직원 한 명") |
| de-3 | 머리 위에 지금 하는 일이 뜨고, 직원을 누르면 대화 창이 열린다. 답장과 도구 승인은 여기서 한다. | BD-README("누르면 대화 창", "대시보드에서 바로 답장") |
| de-4 | 자리를 비워도 폰 브라우저로 사무실을 보고 지시와 승인을 이어 간다. | BD-README("폰으로 밖에서도") |
| de-5 | 세션이 일을 마치거나 답을 기다리면 폰으로 알림이 온다. | 리포 커밋 10-24 Web Push 알림 두 건 |
| de-6 | PC에서 도는 서버 하나가 세션, 사무실 화면, 폰을 잇는다. 명령 한 줄로 켠다. | 서버 구조(아래), BD-README npx 한 줄 실행 |
| 그림 | 터미널 세션(상태를 서버에 알림) · 데스크 세션(대화와 승인 주고받기) · 로컬 서버(내 PC에서 실행) · PC 사무실(실시간 상태 표시) · 폰(암호화 연결(Tailscale)) · 폰 알림(완료·승인 요청) | hook POST → Fastify 127.0.0.1 / Agent SDK `query({resume})`·`canUseTool`(`managedSessions.ts`) / `/ws` / Tailscale Serve(`phoneAccess.ts`) / `web-push` VAPID(`pushNotifier.ts`) |
| 그림 설명 | 점선은 원본 Pixel Agents, 실선은 포크해 더한 기능. | 점선 = hook·JSONL 감지, 사무실 화면. 실선 = 09-25 이후 포크 기능 |
| 링크 | GitHub | `github.com/Yewon419/bitteul-desk` |
| 보조 | 큐브 사무실 그림·챕터 아이콘(Kayla 릴스 000 에셋, 11-14 대표님 허가), 스크린샷 4장(BD-README `docs/screenshots/`, 가짜 세션으로 촬영) | |

## 4. 짐살라빔

| 칸 | 문장 | 출처 |
|---|---|---|
| 띠 | 짐살라빔 | |
| gi-1 | 웹캠으로 운동 자세를 채점한다 | pf, 판넬 |
| gi-2 | 스쿼트 모드는 동작을 다섯 단계로 나누고, 무릎·몸통·엉덩이 각도를 기준값과 비교한다. | 판넬(5-step 상태 기계, Knee/Trunk/Hip Angle) |
| 띠 | 몸통 32.59° / 엉덩이 110.11° / 무릎 108.35° | 판넬 "Scoring Methods" 표의 Trunk·Hip·Knee Mean. AI Hub 피트니스 자세 데이터 기준 평균값 |
| gi-3 | 휴대폰에서도 실시간으로 돌도록 가벼운 MediaPipe를 골랐다. 가려진 관절은 인체 구조를 바탕으로 계산한다. | q3, FS 짐살라빔 스쿼트·기술 선택(휴대폰 실시간, 가려진 관절 계산) |
| gi-4 | 댄스 모드는 속도가 다른 두 동작의 시간 축을 DTW로 맞춘 뒤, 팔꿈치·무릎 각도를 비교한다. | 포트폴리오 PDF(`pdf/portfolio.html`) |
| 그림 | 기준 동작 / 따라 한 동작 / 시간 축 맞추기 → 팔꿈치 · 무릎 각도 비교 → 점수 | 설명용 도식(실측값 아님) |
| gi-5 | AI 동아리 4인 팀. 자세 인식 모델 리서치와 댄스 모드 채점 구현을 맡았다. | pf(11-15 확정본), 판넬 Members 4명 |
| 링크 | 판넬 PDF 보기 | `assets/gimsalabim-panel.pdf` |

## 5. AI와 일하는 방식

| 칸 | 문장 | 출처 |
|---|---|---|
| 띠 | AI와 일하는 방식 | |
| me-1 | AI가 코드를 쓰고, 검증 게이트를 통과한 코드만 반영한다. | SC-README 표(ruff·mypy·pytest), 리포 CI |
| 도표 | 스펙 문서(단일 출처, 여기서 출발) → AI 구현(AI가 코드를 쓴다) → 게이트(린터·타입 체크·테스트) → 화면 검수(자동 촬영, 직접 확인) → 도구 만들기(불편하면 환경을 고친다), 마지막에서 처음으로 「다음 작업으로」 | SC-README("SPEC.md 제품 스펙 (SSOT)"), TR-README("설계 SSOT는 MASTER.md"), SC store-screenshots 워크플로, q2 마지막 문장 |
| me-5 | 이 페이지도 같은 공정이다. 문구마다 출처를 COPY.md에 적고, 스크롤 위치마다 화면을 찍어 검수했다. + GitHub에서 보기 | 이 파일, `tools/stills.mjs` |
| 보조 | COPY.md 표 카드: 이 파일에서 네 줄(슈가캡 카탈로그 수, 템포루틴 동기화, 빛뜰 데스크 알림, 짐살라빔 각도) | 이 파일 |
| 보조 | 검수 스틸 이미지: 슈가캡 컵 수위 장면 비트별 스틸 | 이 리포 |

## 6. 엔드

| 문장 | 출처 |
|---|---|
| 한예원 | |
| 슈가캡 App Store / 슈가캡 GitHub / 템포루틴 App Store / 템포루틴 GitHub / 빛뜰 데스크 GitHub / 짐살라빔 판넬 PDF / github.com/Yewon419 | 링크 전체 목록 |
