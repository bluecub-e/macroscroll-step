import { prisma } from "./prisma";
import { initialStocks } from "./stockData";

// 초기 주가 데이터 시딩
export async function seedStockPrices() {
    for (const stock of initialStocks) {
        await prisma.stockPrice.upsert({
            where: { symbol: stock.symbol },
            update: {},
            create: {
                symbol: stock.symbol,
                name: stock.name,
                price: stock.price,
                change: 0,
                changePercent: 0,
                volatility: stock.volatility,
                type: stock.type,
                trend: (stock as any).trend || 0,
            } as any,
        });
    }
}

// 주가 시뮬레이션
export async function simulatePrices() {
    const stocks = await prisma.stockPrice.findMany();

    // 글로벌 설정 조회 (없으면 기본값 사용)
    const settings = await prisma.globalSetting.findMany();
    const marketTrend = parseFloat(settings.find((s: { key: string; value: string }) => s.key === "marketTrend")?.value || "0");
    const volatilityMultiplier = parseFloat(settings.find((s: { key: string; value: string }) => s.key === "volatilityMultiplier")?.value || "1.0");

    for (const stock of stocks) {
        // 기본 변동성에 배수 적용
        const volatility = stock.volatility * volatilityMultiplier;

        // 랜덤 변화율 계산 (-volatility ~ +volatility)
        let changePercent = (Math.random() - 0.5) * 2 * volatility;

        // 시장 추세 반영 (Trend가 양수면 상승 확률 증가)
        // Trend 1.0 = 약 1% 추가 상승 압력
        // 개별 종목 트렌드도 반영
        const stockTrend = (stock as any).trend || 0;
        changePercent += marketTrend + stockTrend;

        const change = Math.round(stock.price * (changePercent / 100));
        const newPrice = Math.max(1, stock.price + change);

        // 주가 업데이트
        await prisma.stockPrice.update({
            where: { symbol: stock.symbol },
            data: {
                price: newPrice,
                change: change,
                changePercent: parseFloat(changePercent.toFixed(2)),
            },
        });

        // 히스토리 기록
        await prisma.stockHistory.create({
            data: {
                symbol: stock.symbol,
                price: newPrice,
            },
        });

        // 오래된 기록 삭제 (최근 20개만 유지) - 성능 최적화
        if (Math.random() < 0.1) {
            const count = await prisma.stockHistory.count({ where: { symbol: stock.symbol } });
            if (count > 20) {
                const deleteCount = count - 20;
                const toDelete = await prisma.stockHistory.findMany({
                    where: { symbol: stock.symbol },
                    orderBy: { createdAt: "asc" },
                    take: deleteCount,
                    select: { id: true },
                });

                if (toDelete.length > 0) {
                    await prisma.stockHistory.deleteMany({
                        where: { id: { in: toDelete.map(h => h.id) } },
                    });
                }
            }
        }
    }
}
