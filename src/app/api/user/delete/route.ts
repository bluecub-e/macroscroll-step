import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// DELETE: 회원 탈퇴
export async function DELETE(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: "사용자명과 비밀번호가 필요합니다." }, { status: 400 });
        }

        // 사용자 확인
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
        }

        // 비밀번호 검증
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
        }

        // 트랜잭션으로 관련 데이터 삭제 후 사용자 삭제
        await prisma.$transaction([
            prisma.holding.deleteMany({ where: { userId: user.id } }),
            prisma.transaction.deleteMany({ where: { userId: user.id } }),
            prisma.user.delete({ where: { id: user.id } }),
        ]);

        return NextResponse.json({ success: true, message: "계정이 삭제되었습니다." });
    } catch (error) {
        console.error("Account deletion error:", error);
        return NextResponse.json({ error: "계정 삭제 중 오류가 발생했습니다." }, { status: 500 });
    }
}
