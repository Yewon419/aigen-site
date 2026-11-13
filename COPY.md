# COPY.md · aigen-site 전 문장과 출처

> 상태: 초안(2026-11-13 새벽, 대표님 검토 전). 출처 없는 문장은 "신규"로 표시. 결과 숫자(다운로드·베타 인원) 없음. em-dash 없음.
> 출처 약어: q1~q4 = `Downloads\aigen\q*.txt` 확정본, pf = `portfolio.txt`, SC-README = 슈가캡 README, TR-README = 템포루틴 README, MASTER = 템포루틴 MASTER.md, 판넬 = `5팀_판넬.pdf`

## 모서리 라벨 (전 섹션 고정)

| 위치 | 문구 | 출처 |
|---|---|---|
| 좌상 | 한예원 · SK AIGEN 1기 지원 | 지원서 |
| 우상 | 2026 | |
| 좌하 | (현재 섹션명: 슈가캡 / 템포루틴 / 짐살라빔 / 일하는 방식) | |
| 우하 | 창업/비즈니스 | 지원서 1지망 |

## 0. 히어로

| 문장 | 출처 |
|---|---|
| 한예원 | |
| Portfolio | 11-13 대표님 결정(이전 "iOS 앱 두 개를 혼자 만들어 출시했습니다." 폐기) |
| 슈가캡 · 템포루틴 · 짐살라빔 | 목차 역할 |

## 1. 슈가캡

| 비트 | 문장 | 출처 |
|---|---|---|
| 1 | 슈가캡 | |
| 2 | 참는 대신, 즐겁게 줄인다. | pf 1문장 변형 |
| 3 | 오늘 마실 수 있는 양이 컵 하나에 담기고, 한 잔 기록할 때마다 그만큼 비워진다. | pf 그대로 |
| 4 | 카페 브랜드 16곳 메뉴 2,057종. | SC-README |
| 5 | 밤이 되면 남은 음료를 로슈와 카인에게 먹인다. | pf |
| 6 | 서버도 계정도 없다. 기록은 기기에만 남는다. | pf·SC-README |
| 7 | 만든 방법: Swift·SwiftUI·SwiftData / 메뉴 데이터는 Python 파서로만 만들고 손으로 고치지 않는다 / CI가 빌드·UI 테스트·스토어 스크린샷까지 / 캐릭터 원화는 직접 | SC-README "만든 방법"·"데이터" |
| 7 | AI와 같이 쓴 코드는 ruff·mypy·pytest를 지나야 들어온다. | SC-README 표(ruff, mypy, pytest). "AI와 같이" 부분은 신규, 확인 필요 |
| 8 | App Store · GitHub · sugarcap.vercel.app | `apps.apple.com/kr/app/id6814832068` · `github.com/Yewon419/sugarcap` · `sugarcap.vercel.app` |

## 2. 템포루틴

| 비트 | 문장 | 출처 |
|---|---|---|
| 1 | 템포루틴 | |
| 2 | 당신 몸의 템포에 맞게. | MASTER 태그라인 |
| 3 | 주기의 네 단계를 겨울·봄·여름·가을로. | pf |
| 4 | 평균을 내면 패턴이 사라진다. 그래서 정답 대신 본인 기록을 돌려준다. | q1 두 문장 압축 |
| 5 | "기록상 이때 에너지가 높았어요" 단정 대신 관찰한 사실만. | q1 |
| 6 | 무계정, 자체 서버 없음. Apple 건강 앱 연동은 선택. | TR-README 프라이버시 |
| 7 | 만든 방법: Windows에서 개발, 빌드는 GitHub Actions macOS 러너에서 TestFlight로 / 예측 엔진은 순수 Foundation 패키지(TempoCore)에 테스트와 함께 / 베타 피드백을 열 차례 넘게 반영해 출시 | TR-README 개발 방식·구조, pf |
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

## 4. AI와 일하는 방식

| 비트 | 문장 | 출처 |
|---|---|---|
| 1 | AI와 일하는 방식 | |
| 2 | 스펙 문서 하나가 단일 출처다. AI도 나도 거기서 출발한다. | SC-README("SPEC.md 제품 스펙 (SSOT)"), TR-README("설계 SSOT는 MASTER.md"). 신규 문장 |
| 3 | AI가 쓴 코드는 린터·타입 체크·테스트 게이트를 지나야 들어온다. | SC-README 표. 신규 문장 |
| 4 | 화면은 스크린샷으로 확인한다. CI가 찍고, 내가 본다. | SC store-screenshots 워크플로. 신규 문장 |
| 5 | AI를 잘 쓰려면 그 일을 맡기는 영역을 먼저 이해해야 한다. | q2 마지막 문단 |
| 5 | 이 페이지도 같은 방식으로 만들었다. | 리포 링크(생성 후) |

## 5. 엔드

| 문장 | 출처 |
|---|---|
| 한예원 | |
| 슈가캡 App Store / 슈가캡 GitHub / 템포루틴 App Store / 템포루틴 GitHub / 짐살라빔 판넬 PDF / github.com/Yewon419 | 링크 전체 목록 |

## 대표님 확인 필요 (신규 문장)

1. ~~히어로 문장~~ → "Portfolio"로 확정(11-13)
2. 슈가캡 "AI와 같이 쓴 코드는 ruff·mypy·pytest를 지나야 들어온다."
3. 방식 2·3·4 세 문장 (스펙 SSOT / 게이트 / 스크린샷 확인)
4. 템포루틴 GitHub 링크를 넣을지 (리포 public이지만 지원서 링크 목록엔 없었음)
