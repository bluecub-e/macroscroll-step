"use client";

import React from "react";
import { useGame } from "@/contexts/GameContext";

export default function Settings() {
    const { user, logout } = useGame();

    if (!user) {
        return (
            <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
                로그인 후 이용 가능합니다.
            </div>
        );
    }

    return (
        <div style={{ padding: "12px", fontSize: "13px" }}>
            <div style={{ marginBottom: "16px" }}>
                <div style={{ fontWeight: "bold", marginBottom: "8px" }}>계정 정보</div>
                <div style={{ padding: "8px", backgroundColor: "#e0e0e0", border: "1px solid #000" }}>
                    <div>사용자: {user.username}</div>
                    <div>ID: {user.id}</div>
                </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
                <div style={{ fontWeight: "bold", marginBottom: "8px" }}>시뮬레이션 정보</div>
                <div style={{ padding: "8px", backgroundColor: "#e0e0e0", border: "1px solid #000" }}>
                    <div>주가 업데이트: 5초마다</div>
                    <div style={{ fontSize: "11px", color: "#666" }}>모든 사용자가 동일한 주가를 봅니다.</div>
                </div>
            </div>

            <button
                onClick={logout}
                style={{
                    width: "100%",
                    padding: "8px",
                    backgroundColor: "#800",
                    color: "#fff",
                    border: "1px solid #000",
                    cursor: "pointer",
                }}
            >
                로그아웃
            </button>

            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #000" }}>
                <div style={{ fontWeight: "bold", marginBottom: "8px" }}>화폐 정보</div>
                <div style={{ fontSize: "12px", color: "#444" }}>
                    <p>• 크레딧(C): 1C ≈ 0.01 USD</p>
                    <p>• 흰 식빵: 약 100 C</p>
                    <p>• 올드밸리 월세: 약 75,000 C</p>
                </div>
            </div>
        </div>
    );
}
