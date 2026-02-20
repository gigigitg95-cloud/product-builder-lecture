# Community Admin View TODO

커뮤니티 운영용 관리자 뷰는 다음 세트에서 구현 예정입니다.

## 목표
- 신고 누적 게시글 우선 검토
- 스팸/욕설/반복 게시글 빠른 조치
- 태그 품질(잘못된 태그/무의미 태그) 정리

## 최소 기능 요구
1. 신고 큐
- `bulletin` 문서를 `reportCount desc`로 조회
- `bulletinReports` 사유 집계 표시
- 최근 신고 시각 표시

2. 게시글 조치
- 숨김/복구 토글(`isHidden`)
- 관리자 메모(`adminNote`)
- 반복 위반 `clientId` 임시 차단 리스트

3. 운영 지표
- 일별 작성 수
- 신고율(신고 게시글/전체 게시글)
- 태그 분포(메뉴/지역/가격대/난이도)

## 데이터 모델 확장 TODO
- `bulletin/{postId}`
  - `isHidden: boolean` (default false)
  - `adminNote: string`
  - `moderationUpdatedAt: number`
- `communitySettings/blockedClients`
  - `ids: string[]`

## 접근 제어 TODO
- 관리자 전용 인증(예: Firebase Auth custom claim)
- Firestore rule에서 관리자 write 권한 분리

## 비고
- 현재 릴리스는 일반 사용자 기능(태그/정렬/좋아요/신고/스팸 제한)에 집중.
- 관리자 UI는 문서 기준으로 별도 PR에서 구현.
