# 상록수커피클럽 음료 주문 시스템

동국대학교 봄 축제에서 운영되는 **상록수커피클럽(SCC)**의 음료 주문 · 결제 · 제조 현황 추적을 위한 웹앱입니다.

## 주요 기능

### 고객
- 메뉴 선택 및 옵션(핫/아이스) 지정
- 장바구니 담기 (최대 10잔)
- 토스 QR 결제 연동
- 실시간 주문 현황 추적 (pending → paid → preparing → ready → picked_up)
- 예상 대기시간 표시 — 메뉴별 병렬 제조 공식 적용
  ```
  max(항상잔수, 푸른잔수, ceil(나무잔수 / 2)) × 3분
  ```
- PWA 지원 (홈 화면 추가, iOS Safari)

### 운영진
- 어드민 페이지 (`/admin`) — 주문 목록 실시간 확인 및 상태 변경
- 현금 결제 확인 기능

## 메뉴

| 메뉴 | 가격 | 원두 | 옵션 |
|------|------|------|------|
| 항상 | 4,000원 | Black Suit (브라질·콜롬비아·에티오피아) | 핫·아이스 |
| 푸른 | 4,000원 | Velvet White (에티오피아 3종 블렌드) | 핫·아이스 |
| 나무 | 3,500원 | — (블루레몬에이드) | 아이스 |

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Firebase Firestore (실시간 구독) |
| Deployment | Vercel |
| Font | Pretendard |

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx          # 메인 — 메뉴 목록, 장바구니, 주문
│   ├── menu/[id]/        # 메뉴 상세 페이지
│   ├── order/[id]/       # 결제 QR 페이지
│   ├── track/[id]/       # 주문 현황 추적
│   ├── complete/[id]/    # 수령 완료
│   ├── admin/            # 운영진 어드민
│   └── info/             # 부스 안내
├── components/
│   ├── MenuItem.tsx      # 메뉴 카드 (플레이버 휠 태그 색상)
│   └── CartItem.tsx      # 장바구니 아이템
└── lib/
    ├── menu.ts           # 메뉴 데이터
    ├── orders.ts         # Firebase 주문 CRUD · 실시간 구독 · 대기시간 계산
    ├── cart.ts           # localStorage 장바구니
    ├── flavor.ts         # 플레이버 휠 색상 매핑
    └── firebase.ts       # Firebase 초기화 (iOS PWA long-polling 대응)
```

## 로컬 실행

```bash
# 의존성 설치
npm install

# 환경변수 설정 (.env.local)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_TOSS_PAYMENT_URL=...

# 개발 서버 시작
npm run dev
```

## 배포

Vercel에 연결된 GitHub 레포에 push하면 자동 배포됩니다.

---

상록수커피클럽 · 동국대학교 봄 축제 2026
