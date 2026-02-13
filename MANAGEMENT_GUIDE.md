# Macroscroll Step For OVSE - 거시적 시뮬레이션 관리 가이드

배포 후 시장 전체의 흐름(거시 경제)을 만들기 위한 수정 포인트와 관리 방법을 안내합니다.

## 1. 전역 추세(Market Trend) 도입
현재 시뮬레이터는 각 종목이 독립적인 랜덤 워크로 움직입니다. 시장 전체가 함께 움직이는 효과를 주려면 `Global Trend` 계수를 도입해야 합니다.

### 코드 수정 포인트 (`src/lib/priceSimulator.ts`)
```typescript
// -1.0(폭락) ~ 1.0(폭등) 사이의 전역 변수
let globalMarketTrend = 0; 

// 시뮬레이션 함수 내부 수정 예시
export async function simulatePrices() {
  const stocks = await prisma.stockPrice.findMany();
  
  // (옵션) 시간 흐름에 따라 Trend를 서서히 변화시킬 수 있음
  // globalMarketTrend += (Math.random() - 0.5) * 0.1; 

  for (const stock of stocks) {
    // 개별 변동성에 전역 추세를 더함
    const randomFactor = (Math.random() - 0.5) * 2;
    // trendFactor가 양수면 상승 확률 증가
    const combinedFactor = randomFactor + (globalMarketTrend * 0.5); 
    
    // ... 가격 계산 로직
  }
}
```

## 2. 뉴스 및 이벤트 시스템 구축
단순한 랜덤성을 넘어, 특정 이벤트가 발생했을 때 시장이 반응하도록 만들 수 있습니다.

### 방법 A: 관리자 API 추가 (간편함)
관리자가 특정 URL을 호출하여 이벤트를 트리거합니다.
- **예시**: `POST /api/admin/event`
  ```json
  { "type": "CRASH", "strength": 0.8, "duration": 12 } // 12번의 틱(약 1분) 동안 80% 강도로 하락장
  ```
- **구현**: `globalMarketTrend` 변수를 이 API가 직접 수정하도록 만듭니다.

### 방법 B: DB 기반 스케줄링 (체계적)
`GameEvent` 테이블을 만들고 시작 시간/종료 시간을 설정해두면, 시뮬레이터가 매번 이를 체크하여 반영합니다.
- `prisma/schema.prisma`에 모델 추가:
  ```prisma
  model GameEvent {
    id        Int      @id @default(autoincrement())
    name      String   // 예: "올드밸리 경제 호황"
    effect    Float    // 예: +0.3 (전체 주가 상승)
    startsAt  DateTime
    endsAt    DateTime
  }
  ```

## 3. 섹터(Sector)별 상관관계
종목 데이터(`StockPrice` 모델)에 `sector` (예: 기술, 식품, 에너지) 필드를 활용하여, 특정 섹터만 오르거나 내리게 할 수 있습니다. `initialStocks` 데이터에 이미 `type`이 있으므로 이를 활용하세요.

```typescript
// 특정 섹터 붐
if (stock.type === "fund" && isFundBoom) {
    changePercent += 2.0; // 펀드 상품 추가 상승
}
```

## 4. 팁: 플레이어 개입 유도
거시적 흐름을 단순히 보여주는 것을 넘어, 플레이어들에게 "곧 경제 발표가 있습니다" 같은 예고를(공지사항 창이나 뉴스 티커 기능 추가) 하면 게임의 몰입도가 훨씬 높아집니다.
