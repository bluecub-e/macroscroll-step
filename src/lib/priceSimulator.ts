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
            },
        });
    }
}

// 주가 시뮬레이션
export async function simulatePrices() {
    const stocks = await prisma.stockPrice.findMany();

    for (const stock of stocks) {
        const changePercent = (Math.random() - 0.5) * 2 * stock.volatility * 100;
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
        // 10분의 1 확률로 실행하여 DB 부하 감소
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
