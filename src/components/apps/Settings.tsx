"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "@/contexts/GameContext";

export default function Settings() {
    const { user, logout } = useGame();
    const [isAdmin, setIsAdmin] = useState(false);
    const [marketTrend, setMarketTrend] = useState("0");
    const [volatilityMultiplier, setVolatilityMultiplier] = useState("1.0");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (user?.username === "admin") {
            setIsAdmin(true);
            fetchSettings();
        }
    }, [user]);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/admin/settings");
            if (res.ok) {
                const data = await res.json();
                setMarketTrend(data.marketTrend || "0");
                setVolatilityMultiplier(data.volatilityMultiplier || "1.0");
            }
        } catch (e) {
            console.error("Failed to fetch settings", e);
        }
    };

    const saveSettings = async () => {
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ marketTrend, volatilityMultiplier }),
            });
            if (res.ok) {
                setMessage("설정이 저장되었습니다.");
                setTimeout(() => setMessage(""), 2000);
            } else {
                setMessage("저장 실패");
            }
        } catch (e) {
            setMessage("오류 발생");
        }
    };

    if (!user) return <div>로그인이 필요합니다.</div>;

    return (
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ border: "1px solid #000", padding: "12px", backgroundColor: "#fff" }}>
                <h4 style={{ margin: "0 0 8px 0" }}>사용자 정보</h4>
                <div style={{ fontSize: "14px", marginBottom: "8px" }}>
                    <strong>ID:</strong> {user.username}
                </div>
                <div style={{ fontSize: "14px", marginBottom: "16px" }}>
                    <strong>자산:</strong> {user.cash.toLocaleString()} C
                </div>
                <button
                    onClick={logout}
                    style={{
                        width: "100%",
                        padding: "6px",
                        backgroundColor: "#c0c0c0",
                        border: "1px solid #000",
                        cursor: "pointer",
                    }}
                >
                    로그아웃
                </button>
            </div>

            {isAdmin && (
                <div style={{ border: "1px solid #000", padding: "12px", backgroundColor: "#e0e0e0" }}>
                    <h4 style={{ margin: "0 0 12px 0", color: "#c00" }}>관리자 제어 패널</h4>

                    <div style={{ marginBottom: "12px" }}>
                        <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>
                            시장 추세 (Trend): {marketTrend}
                        </label>
                        <input
                            type="range"
                            min="-2.0"
                            max="2.0"
                            step="0.1"
                            value={marketTrend}
                            onChange={(e) => setMarketTrend(e.target.value)}
                            style={{ width: "100%" }}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px" }}>
                            <span>Bear (-2.0)</span>
                            <span>Neutral (0)</span>
                            <span>Bull (+2.0)</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                        <label style={{ display: "block", fontSize: "12px", marginBottom: "4px" }}>
                            변동성 배수 (Volatility): {volatilityMultiplier}x
                        </label>
                        <input
                            type="range"
                            min="0.5"
                            max="3.0"
                            step="0.1"
                            value={volatilityMultiplier}
                            onChange={(e) => setVolatilityMultiplier(e.target.value)}
                            style={{ width: "100%" }}
                        />
                    </div>

                    <button
                        onClick={saveSettings}
                        style={{
                            width: "100%",
                            padding: "6px",
                            backgroundColor: "#000080",
                            color: "#fff",
                            border: "1px solid #000",
                            cursor: "pointer",
                        }}
                    >
                        설정 저장
                    </button>
                    {message && <div style={{ marginTop: "8px", fontSize: "12px", color: "green" }}>{message}</div>}
                </div>
            )}
        </div>
    );
}
