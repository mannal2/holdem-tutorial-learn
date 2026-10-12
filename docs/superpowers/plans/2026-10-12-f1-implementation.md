# F1 구현 기록

계획: `docs/superpowers/plans/2026-10-12-holdem-25-lessons.md`의 F1만 실행.
명세: `docs/superpowers/specs/2026-10-12-holdem-learning-design.md`.
작성: 2026-10-12. F1 완료. 25개 신규 레슨은 미착수.

## 범위와 선택

- 현재 가능한 수업은 첫걸음 체험(prototype)뿐이다. 목록에 커리큘럼25개 제목을 등록하고 준비 중으로 비활성 표시한다. 새 레슨 내용은 만들지 않는다.
- 기존 LESSON 줄을 선택 버튼으로 사용한다. 브랜드 헤더·상시 목차·홍보 문구는 복원하지 않는다.
- Ruling: 목록에서 가능한 수업을 선택하면 그 수업 첫 단계부터 시작한다. 현재 행에 ‘현재 수업 · 처음부터 보기’를 표시하여 명확하게 한다. 비용: 수업별 마지막 단계 여러 개를 저장하지 않으며 복귀는 앱의 마지막 확정 위치 하나이다.
- Ruling: 목록을 여는 순간 재생을 취소하고 장면 진입 checkpoint를 복원한다. 닫기만 해도 자동 재생하지 않는다. 비용: 중간 애니메이션은 다시 보기/주 행동으로 재생한다.
- Git 저장소가 없는 승인 작업 폴더이므로 worktree/커밋 작업은 하지 않는다.

## 파일과 계약

- `src/lessons/index.js`: lessonCatalog(26행), getLesson(id), firstLesson. definition이 있는 항목만 선택·복원 가능.
- `src/progress.mjs`: readProgress(storage), writeProgress(storage,value), PROGRESS_KEY.
- 키: `holdem-tutorial:progress:v1`. 형식: `{version:1,lessonId,stepId,completedLessonIds,reviewLessonIds}`. 프레임·DOM·칩 상태는 저장하지 않는다.
- 잘못된 JSON/버전/레슨은 가능한 첫 수업으로, 삭제된 단계는 해당 수업 첫 단계로 복구. 완료·복습 ID는 등록된 수업만 남기고 중복 제거.
- window.localStorage 접근 자체가 차단되는 경우까지 처리. 저장 실패는 학습 동작을 막지 않는다.
- runtime의 initialStepId는 재생하지 않고 checkpoint 상태만 복원한다. 완료된 관찰/정답 단계를 추적하고 필수 단계가 모두 끝난 경우에만 onComplete를 호출한다.
- 유효한 복원 cursor보다 앞선 단계는 이미 수행한 것으로 복원한다. 저장 cursor는 일반 UI의 순차 진행/이전에서 만들어지며, 레슨 선택은 항상 첫 단계로 간다.
- goToLesson(id)는 기존 재생을 취소하고 새 정의로 바꾼 뒤 첫 단계로 간다. F0의 선택적 definition 훅 인자 대신 레지스트리를 연결했다.
- 진도 초기화는 확인 후 이 앱의 저장 키만 기본 상태로 덮어쓴다. 다른 브라우저 데이터를 지우지 않는다.
- native dialog는 Escape/닫기/포커스 복귀, Tab/Shift+Tab 경계 순환, 내부 스크롤, 배경 스크롤 복구를 제공한다.
- LESSON 버튼44px 터치 높이를 확보했다. 모바일 설명 패널의 기존 줄 높이만 조금 늘고 별도 상단 줄은 추가하지 않는다.

## 검증 진행

- RED: progress 모듈 없음, 초기 cursor 미복원, goToLesson 없음, 목록 버튼 없음으로 신규 검사 실패 확인.
- RED→GREEN: Shift+Tab 경계에서 focus가 body로 빠짐을 실제 Chromium에서 재현하여 대화상자 내부 순환 처리 추가.
- RED→GREEN: 미구현 레슨 ID에 prototype의 유효 stepId가 우연히 들어 있어도 첫 단계로 복구하도록 검사·수정.
- 현재 26개단위검사·빌드 통과.
- 신규브라우저검사:320px목록/준비중/키보드/Escape/포커스/복원/완료유지/초기화확인, 재생중reload/수업전환, 오염저장복구, 차단된localStorage getter 모두통과.
- 전체 기존 회귀와 독립 리뷰 통과.

## 최종 결과

- `npm run check`: 전체 26개 단위 검사와 프로덕션 빌드 성공.
- `npm run test:e2e`: 기존 카드 착지·모바일·콜/체크·취소 검사, F0 resize/props 검사, F1 저장/복원/목록/초기화 검사 모두 성공(exit 0).
- 독립 리뷰: 저장·런타임 검사 17개 재실행 성공, 320px에서 초기화 확인/취소 포커스, Escape 포커스 복귀, 다시 연 목록의 스크롤 초기화 확인. 추가 지적 없음.
- 캡처를 320/474/1366px에서 확인했다. 마지막 선택 아이콘의 문자 위치를 SVG로 정렬했고 단위 검사·빌드를 다시 통과했다.
- Task F1: complete. 25개 신규 레슨과 다음 단계는 진행하지 않았다.
