# F0 구현 기록

계획: `docs/superpowers/plans/2026-10-12-holdem-25-lessons.md`의 F0만 실행.
명세: `docs/superpowers/specs/2026-10-12-holdem-learning-design.md`.
작성: 2026-10-12.

## 범위와 판단 기록

- 현재 체험은 `prototype` 한 레슨으로 유지한다. F1 목록/저장 및25개 신규 레슨은 구현하지 않는다.
- Ruling: 이 폴더는 Git 저장소가 아니므로 현재 승인된 작업 폴더에서 수정하고 Git worktree/커밋 스크립트를 사용하지 않는다. 새 Git 저장소도 만들지 않는다. 비용: 변경 이력은 문서와 기존 파일/검증으로 남으며 Git 커밋은 없다.
- Ruling: F0의 `getStep(lesson, stepId)`는 레슨 정의 객체를 직접 받는다. `getStep(lessonId, stepId)` 레지스트리/레슨 전환은 F1에서 연결한다. 비용: F1에서 ID를 정의 객체로 해석하는 연결이 필요하다.
- Ruling: 이미 검증된11개 문구는 `src/lesson-content.js`를 그대로 읽어 prototype 정의를 만든다. legacy `lesson.mjs`도 비교 검사 기준으로 보존한다. 비용: 문구의 원본 파일은 현재 위치에 남고 신규 레슨은 별도 데이터 파일을 사용한다.

## 기존 stage → 새 stepId

| stage | stepId | 진입 사건 완료 수 | 다음 재생 완료 수 |
| --- | --- | ---: | ---: |
| 0 | first-recipient | 0 | 질문 |
| 1 | deal-first-round | 0 | 6 |
| 2 | deal-second-round | 6 | 12 |
| 3 | dealt | 12 | 없음 |
| 4 | first-actor | 12 | 질문 |
| 5 | first-actor-found | 12 | 없음 |
| 6 | watch-calls | 12 | 16 |
| 7 | call-amount | 16 | 질문 |
| 8 | call-correct | 16 | 17 |
| 9 | called | 17 | 18 |
| 10 | complete | 18 | 없음 |

## 추가한 계약

- `prototype.scenario`: 초기 테이블과18개의사건(배분12/콜5/체크1).
- `prototype.steps`: 문구, 질문, 정답/힌트, focus, 설명visual, 진입checkpoint, playTo, nextId, replayFrom.
- `applyEvent(state,event)`는 현재 필요한 deal/call/check만 처리한다. 기존 객체를 수정하지 않고 칩 이동/순서 오류를 거절한다.
- `stateAt(scenario,eventCount)`는 초기 상태부터 사건을 적용하고 handCommitted 합으로 potTotal을 계산한다.
- `createLessonRuntime({lesson,playEvent,onChange,wait,reducedMotion})`는 React/DOM 없이 이전·다음·정답·힌트·재생·취소를 관리한다.
- `entryTable`은 장면 시작 상태, `table`은 현재 재생 상태이다. 계산 설명의 이미 낸5와 추가5가 착지 직후0으로 바뀌는 것을 방지한다.
- `useLesson(playCard,playAction,definition=prototype)`는 최초 정의를 연결하는 React 어댑터다. 레슨 선택 시 정의 변경/재시작 연결은 F1에서 구현한다.
- Table은 입력받은 seats/card/role/board를 표시한다. 카드refs의 플레이어+슬롯 identity는 유지한다.
- 효과 함수·CSS·App 화면 배치는 그대로 사용한다. 화면resize 중에는 진행을 취소하고 현재step 진입checkpoint로 복구한다.

## 검증 기록

- 수정 전: 기존9개단위검사/빌드/기존E2E 모두 통과.
- RED: 신규 모듈이 없는 상태의 단위검사 실패, 기존 배분 중 viewport 변경 시 카드가 남는 회귀 재현(예상0/실제1).
- GREEN: 전체16개단위검사/프로덕션빌드 통과.
- 단위검사: 기존11단계와 모든 재생중간프레임의 카드·금액 비교, immutable재구성, 늦게 완료되는 취소효과 무시, 반복체크팟60, 두번클릭효과4회, 다른정의의질문/힌트판정.
- 변이검사: 프로덕션을 바꾸지 않은 임시복사본에서 취소/중복방어를 제거하면 해당두검사가 실제assertion으로 실패함을 확인(이전step덮어쓰기, 효과8회≠4회). 최초 변이실험의 대기중프로세스는 종료하고 첫효과만 지연시키는 올바른테스트로 재검증했다.
- E2E: 12장슬롯착지(<1px, 320/474/1366px), 전체체험/오답/이전/재생/모션감소(320/390/474/1366px), 실제칩/체크2회/취소/중복지출0.
- 신규E2E: 배분중resize복구/재생완료, 실제다른카드·보드·이동된역할을Tableprops로표시.
- 최종캡처: 수정전474px/1366px 콜질문장면과 픽셀차이0. CSS 결과파일도 기존과동일.
- `npm run test:e2e`에신규runtime-browser검사를연결했다.

## 최종 리뷰와 완료

- 독립 리뷰: 취소·재생·슬롯·카드 공개·역할 입력에서 추가 문제 없음. applyEvent 직접 호출 시 파생 팟 값이 이전 값으로 남는 P2 문제 1개 발견.
- 해당 문제를 검사로 재현(15≠25)한 뒤 기여액에서 팟을 다시 계산하도록 수정했다. 추가 검사와 전체 16개 검사를 통과했다.
- 최종 `npm run check` 및 `npm run test:e2e` 모두 성공(exit 0). 일반 모션·모션 감소·리사이즈·props 검사를 포함한다.
- 마지막 수정 후 474px/1366px 수정 전후 화면을 PNG 디코딩하여 비교했고 픽셀 차이 0.
- Task F0: complete. F1 및 신규 레슨은 미착수. Git 저장소가 없어 커밋·브랜치 통합 작업은 없다.

