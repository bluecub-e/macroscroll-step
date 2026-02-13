import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 간단한 해시 함수 (프로덕션에서는 bcrypt 사용 권장)
function simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0;
    }
    return hash.toString(16);
}

// POST: 로그인 또는 회원가입
export async function POST(request: NextRequest) {
    try {
        const { username, password, action } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: "사용자명과 비밀번호를 입력해주세요." }, { status: 400 });
        }

        if (username.length < 2 || username.length > 20) {
            return NextResponse.json({ error: "사용자명은 2-20자여야 합니다." }, { status: 400 });
        }

        const passwordHash = simpleHash(password);

        if (action === "register") {
            // 회원가입
            const existing = await prisma.user.findUnique({ where: { username } });
            if (existing) {
                return NextResponse.json({ error: "이미 존재하는 사용자명입니다." }, { status: 400 });
            }

            const user = await prisma.user.create({
                data: { username, passwordHash },
            });

            return NextResponse.json({
                success: true,
                user: { id: user.id, username: user.username, cash: user.cash },
            });
        } else {
            // 로그인
            const user = await prisma.user.findUnique({ where: { username } });
            if (!user || user.passwordHash !== passwordHash) {
                return NextResponse.json({ error: "사용자명 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
            }

            // 보유 주식 조회
            const holdings = await prisma.holding.findMany({ where: { userId: user.id } });

            return NextResponse.json({
                success: true,
                user: { id: user.id, username: user.username, cash: user.cash },
                holdings,
            });
        }
    } catch (error) {
        console.error("Auth error:", error);
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}
