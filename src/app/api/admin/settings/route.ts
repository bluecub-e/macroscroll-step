import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: 현재 설정 조회
export async function GET() {
    try {
        const settings = await prisma.globalSetting.findMany();
        const marketTrend = settings.find((s: { key: string; value: string }) => s.key === "marketTrend")?.value || "0";
        const volatilityMultiplier = settings.find((s: { key: string; value: string }) => s.key === "volatilityMultiplier")?.value || "1.0";

        return NextResponse.json({
            marketTrend,
            volatilityMultiplier,
        });
    } catch (error) {
        console.error("Failed to fetch settings:", error);
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

// POST: 설정 업데이트
export async function POST(request: NextRequest) {
    try {
        const { marketTrend, volatilityMultiplier } = await request.json();

        // 트랜잭션으로 한니에 업데이트
        await prisma.$transaction([
            prisma.globalSetting.upsert({
                where: { key: "marketTrend" },
                update: { value: String(marketTrend) },
                create: { key: "marketTrend", value: String(marketTrend) },
            }),
            prisma.globalSetting.upsert({
                where: { key: "volatilityMultiplier" },
                update: { value: String(volatilityMultiplier) },
                create: { key: "volatilityMultiplier", value: String(volatilityMultiplier) },
            }),
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to save settings:", error);
        return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
    }
}
