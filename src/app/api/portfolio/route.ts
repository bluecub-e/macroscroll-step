import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: 사용자 포트폴리오 조회
export async function GET(request: NextRequest) {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
        return NextResponse.json({ error: "userId가 필요합니다." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!user) {
        return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
    }

    const holdings = await prisma.holding.findMany({ where: { userId: user.id } });
    const transactions = await prisma.transaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 20,
    });

    return NextResponse.json({
        cash: user.cash,
        holdings,
        transactions,
    });
}
