import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { seedStockPrices, simulatePrices } from "@/lib/priceSimulator";

// 서버 시작 시 초기화
let initialized = false;
let lastSimulationTime = 0;
const SIMULATION_INTERVAL = 5000; // 5초

async function ensureInitialized() {
    if (!initialized) {
        await seedStockPrices();
        initialized = true;
    }
}

// 시간 기반 시뮬레이션 (5초에 한 번만 실행)
async function runSimulationIfNeeded() {
    const now = Date.now();
    if (now - lastSimulationTime >= SIMULATION_INTERVAL) {
        await simulatePrices();
        lastSimulationTime = now;
        return true;
    }
    return false;
}

// GET: 현재 주가 조회 (필요시 시뮬레이션 실행)
export async function GET() {
    await ensureInitialized();
    await runSimulationIfNeeded();

    const stocks = await prisma.stockPrice.findMany({
        orderBy: { symbol: "asc" },
    });

    return NextResponse.json(stocks);
}

// POST: 강제 시뮬레이션 (관리용)
export async function POST() {
    await ensureInitialized();
    await simulatePrices();
    lastSimulationTime = Date.now();

    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
}
