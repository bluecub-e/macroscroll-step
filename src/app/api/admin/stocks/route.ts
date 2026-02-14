import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: 모든 종목 정보 조회 (설정용)
export async function GET() {
    try {
        const stocks = await prisma.stockPrice.findMany({
            orderBy: { symbol: 'asc' },
        });
        return NextResponse.json(stocks);
    } catch (error) {
        console.error("Failed to fetch stocks:", error);
        return NextResponse.json({ error: "Failed to fetch stocks" }, { status: 500 });
    }
}

// POST: 특정 종목 설정 업데이트
export async function POST(request: NextRequest) {
    try {
        const { symbol, volatility, trend } = await request.json();

        if (!symbol) {
            return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
        }

        const updateData: any = {};
        if (volatility !== undefined) updateData.volatility = parseFloat(volatility);
        if (trend !== undefined) updateData.trend = parseFloat(trend);

        const updatedStock = await prisma.stockPrice.update({
            where: { symbol },
            data: updateData,
        });

        return NextResponse.json({ success: true, stock: updatedStock });
    } catch (error) {
        console.error("Failed to update stock settings:", error);
        return NextResponse.json({ error: "Failed to update stock settings" }, { status: 500 });
    }
}
