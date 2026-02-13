import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: 매수 또는 매도
export async function POST(request: NextRequest) {
    try {
        const { userId, symbol, quantity, action } = await request.json();

        if (!userId || !symbol || !quantity || !action) {
            return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 });
        }

        if (quantity <= 0) {
            return NextResponse.json({ error: "수량은 1 이상이어야 합니다." }, { status: 400 });
        }

        // 현재 주가 조회
        const stock = await prisma.stockPrice.findUnique({ where: { symbol } });
        if (!stock) {
            return NextResponse.json({ error: "존재하지 않는 종목입니다." }, { status: 404 });
        }

        // 사용자 조회
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
        }

        const totalAmount = stock.price * quantity;

        if (action === "buy") {
            // 매수
            if (user.cash < totalAmount) {
                return NextResponse.json({ error: "잔고가 부족합니다." }, { status: 400 });
            }

            // 현금 차감
            await prisma.user.update({
                where: { id: userId },
                data: { cash: user.cash - totalAmount },
            });

            // 보유 주식 업데이트
            const existingHolding = await prisma.holding.findUnique({
                where: { userId_symbol: { userId, symbol } },
            });

            if (existingHolding) {
                const totalQty = existingHolding.quantity + quantity;
                const totalValue = existingHolding.avgPrice * existingHolding.quantity + stock.price * quantity;
                await prisma.holding.update({
                    where: { id: existingHolding.id },
                    data: {
                        quantity: totalQty,
                        avgPrice: Math.round(totalValue / totalQty),
                    },
                });
            } else {
                await prisma.holding.create({
                    data: { userId, symbol, quantity, avgPrice: stock.price },
                });
            }

            // 거래 내역 기록
            await prisma.transaction.create({
                data: { userId, type: "buy", symbol, quantity, price: stock.price, total: totalAmount },
            });

            return NextResponse.json({ success: true, message: `${symbol} ${quantity}주 매수 완료` });

        } else if (action === "sell") {
            // 매도
            const holding = await prisma.holding.findUnique({
                where: { userId_symbol: { userId, symbol } },
            });

            if (!holding || holding.quantity < quantity) {
                return NextResponse.json({ error: "보유 수량이 부족합니다." }, { status: 400 });
            }

            // 현금 증가
            await prisma.user.update({
                where: { id: userId },
                data: { cash: user.cash + totalAmount },
            });

            // 보유 주식 업데이트
            if (holding.quantity === quantity) {
                await prisma.holding.delete({ where: { id: holding.id } });
            } else {
                await prisma.holding.update({
                    where: { id: holding.id },
                    data: { quantity: holding.quantity - quantity },
                });
            }

            // 거래 내역 기록
            await prisma.transaction.create({
                data: { userId, type: "sell", symbol, quantity, price: stock.price, total: totalAmount },
            });

            return NextResponse.json({ success: true, message: `${symbol} ${quantity}주 매도 완료` });
        }

        return NextResponse.json({ error: "유효하지 않은 액션입니다." }, { status: 400 });

    } catch (error) {
        console.error("Trade error:", error);
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}
