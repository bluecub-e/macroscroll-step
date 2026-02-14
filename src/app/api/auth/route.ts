import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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

        if (action === "register") {
            // 회원가입
            const existing = await prisma.user.findUnique({ where: { username } });
            if (existing) {
                return NextResponse.json({ error: "이미 존재하는 사용자명입니다." }, { status: 400 });
            }

            // 비밀번호 해시화 (bcrypt)
            const passwordHash = await bcrypt.hash(password, 10);

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
            if (!user) {
                return NextResponse.json({ error: "사용자명 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
            }

            // 비밀번호 검증 (bcrypt)
            const isValid = await bcrypt.compare(password, user.passwordHash);
            if (!isValid) {
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
