# 상록수커피클럽 음료 주문 시스템

동국대학교 봄 축제에서 운영되는 **상록수커피클럽(SCC)**의 음료 주문·결제·제조 현황 추적을 위한 모바일 웹앱입니다. 고객이 직접 스마트폰으로 메뉴를 고르고 토스로 결제하면, 운영진이 어드민 페이지에서 주문을 확인하고 상태를 업데이트합니다. 고객은 제조 현황을 실시간으로 확인할 수 있습니다.

---

## 기능

### 고객 플로우

**메뉴 탐색 및 주문**
메인 화면에서 항상·푸른·나무 세 가지 메뉴를 카드 형태로 확인할 수 있습니다. 각 메뉴 카드에는 플레이버 휠 기반으로 색상이 분류된 키워드 태그(초콜릿·복숭아·플로럴 등)가 표시됩니다. 메뉴를 탭하면 원두 정보(산지·비율), 컵 노트, 소개 글이 담긴 상세 모달이 열립니다. 핫/아이스 옵션 선택 후 장바구니에 담을 수 있으며, 최대 10잔까지 담을 수 있습니다.

**결제**
주문 시 토스 송금자명(입금자명)을 입력하면 토스 QR코드 화면으로 이동합니다. QR을 스캔해 결제하면 주문이 접수됩니다.

**실시간 현황 추적**
주문 후 현황 페이지(`/track/[id]`)에서 주문 상태를 실시간으로 확인할 수 있습니다. 상태는 `접수 → 결제 확인 → 제조 중 → 준비 완료 → 수령 완료` 순으로 진행되며, Firebase Firestore의 실시간 구독으로 새로고침 없이 자동 업데이트됩니다.

**예상 대기시간**
항상·푸른·나무는 각기 다른 바리스타가 제조하므로, 합산 대기 대신 가장 오래 걸리는 파트를 기준으로 계산합니다.
```
대기시간(분) = max(항상잔수, 푸른잔수, ceil(나무잔수 / 2)) × 3
```
항상·푸른은 1잔당 3분, 나무(에이드)는 2잔당 3분으로 산정합니다.

**PWA**
iOS Safari에서 홈 화면에 추가하면 앱처럼 실행됩니다. iOS 환경에서 Firebase WebSocket이 끊기는 문제를 HTTP long-polling(`experimentalForceLongPolling`)으로 해결했으며, 앱이 백그라운드에서 포그라운드로 돌아올 때 자동으로 Firestore 연결을 복구합니다.

### 운영진 플로우

어드민 페이지(`/admin`)에서 전체 주문 목록을 실시간으로 확인하고 상태를 단계별로 전진시킬 수 있습니다. 현금 결제 고객의 경우 별도 버튼으로 결제 확인 처리가 가능합니다.

---

## 메뉴

| 메뉴 | 가격 | 원두 | 옵션 |
|------|------|------|------|
| 항상 | 4,000원 | Black Suit (브라질 60%·콜롬비아 25%·에티오피아 15%) | 핫·아이스 |
| 푸른 | 4,000원 | Velvet White (에티오피아 3종 블렌드) | 핫·아이스 |
| 나무 | 3,500원 | — (블루레몬에이드) | 아이스 |

---

## 기술 스택

**Next.js 16 (App Router)**
페이지 라우팅, 서버/클라이언트 컴포넌트 분리, Image 최적화에 활용합니다. 개발·빌드 모두 Turbopack을 사용합니다.

**TypeScript**
메뉴 아이템, 장바구니, 주문, Firebase 문서 등 모든 데이터 구조를 타입으로 정의해 런타임 오류를 최소화했습니다.

**Tailwind CSS v4**
커스텀 sage 컬러 팔레트를 `@theme`으로 정의해 일관된 브랜드 색상을 유지합니다. 반응형(모바일 우선)과 데스크탑 레이아웃을 함께 지원합니다.

**Firebase Firestore**
주문 데이터 저장 및 실시간 구독에 사용합니다. `onSnapshot`으로 운영진과 고객 양쪽에서 상태 변화를 즉시 반영합니다. iOS PWA 환경의 WebSocket 불안정 문제를 long-polling 모드로 해결했습니다.

**Vercel**
GitHub 연동으로 main 브랜치 push 시 자동 배포됩니다. `generateBuildId`로 매 배포마다 빌드 캐시를 무효화해 로컬과 프로덕션의 CSS가 항상 일치하도록 합니다.

---

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

---

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
