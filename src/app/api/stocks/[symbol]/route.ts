import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ symbol: string }> }
) {
    const { symbol } = await params;

    if (!symbol) {
        return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }

    try {
        const history = await prisma.stockHistory.findMany({
            where: { symbol },
            orderBy: { createdAt: "asc" },
            take: 12, // 최근 1분 (5초 * 12)
        });

        const data = history.map((h) => ({
            price: h.price,
            time: h.createdAt,
        }));

        return NextResponse.json(data);
    } catch (error) {
        console.error("Failed to fetch history:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
