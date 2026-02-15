"use client";

import React, { useState, useEffect } from "react";
import { useGame } from "@/contexts/GameContext";

interface StockSetting {
    symbol: string;
    volatility: number;
    trend: number;
}

export default function Settings() {
    const { user, logout } = useGame();
    const [marketTrend, setMarketTrend] = useState(0);
    const [volatilityMultiplier, setVolatilityMultiplier] = useState(1.0);
    const [isAdmin, setIsAdmin] = useState(false);
    const [message, setMessage] = useState("");

    // 회원 탈퇴 상태
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            setMessage("비밀번호를 입력해주세요.");
            return;
        }

        if (!confirm("정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;

        try {
            const res = await fetch("/api/user/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: user?.username, password: deletePassword }),
            });

            if (res.ok) {
                alert("회원 탈퇴가 완료되었습니다. 이용해 주셔서 감사합니다.");
                logout(); // 로그아웃 처리
            } else {
                const data = await res.json();
                setMessage(data.error || "탈퇴 실패");
            }
        } catch (error) {
            console.error("Delete account error", error);
            setMessage("서버 오류가 발생했습니다.");
        }
    };

    const [stockSettings, setStockSettings] = useState<StockSetting[]>([]);
    const [hasFetched, setHasFetched] = useState(false);
    const [loadingStocks, setLoadingStocks] = useState(false);

    useEffect(() => {
        // admin일 때만 데이터를 가져오되, 한 번 가져왔으면 다시 가져오지 않음 (로컬 수정 값 보호)
        if (user?.username === "admin" && !hasFetched) {
            setIsAdmin(true);
            fetchGlobalSettings();
            fetchStockSettings();
            setHasFetched(true);
        } else if (user?.username !== "admin") {
            setIsAdmin(false);
            setHasFetched(false);
        }
    }, [user?.username, hasFetched]);

    const fetchGlobalSettings = async () => {
        try {
            const res = await fetch("/api/admin/settings");
            if (res.ok) {
                const data = await res.json();
                setMarketTrend(parseFloat(data.marketTrend));
                setVolatilityMultiplier(parseFloat(data.volatilityMultiplier));
            }
        } catch (error) {
            console.error("Failed to fetch global settings", error);
        }
    };

    const fetchStockSettings = async () => {
        setLoadingStocks(true);
        try {
            const res = await fetch("/api/admin/stocks"); // 종목 목록 조회 API (생성 필요)
            if (res.ok) {
                const data = await res.json();
                // 데이터 매핑: API 결과에 trend가 없으면 0으로 처리
                const mapped = data.map((s: any) => ({
                    symbol: s.symbol,
                    volatility: s.volatility || 1.0,
                    trend: s.trend || 0
                }));
                setStockSettings(mapped);
            }
        } catch (error) {
            console.error("Failed to fetch stock settings", error);
        } finally {
            setLoadingStocks(false);
        }
    };

    const handleSaveGlobal = async () => {
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ marketTrend, volatilityMultiplier }),
            });
            if (res.ok) {
                setMessage("전체 설정 저장 완료!");
                setTimeout(() => setMessage(""), 2000);
            }
        } catch (error) {
            console.error("Failed to save settings", error);
            setMessage("저장 실패");
        }
    };

    const handleSaveStock = async (symbol: string, volatility: number, trend: number) => {
        try {
            const res = await fetch("/api/admin/stocks", {
                method: "POST", // 개별 종목 업데이트 API
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ symbol, volatility, trend }),
            });
            if (res.ok) {
                // 로컬 상태 업데이트
                setStockSettings(prev => prev.map(s =>
                    s.symbol === symbol ? { ...s, volatility, trend } : s
                ));
                setMessage(`${symbol} 설정 저장 완료!`);
                setTimeout(() => setMessage(""), 2000);
            }
        } catch (error) {
            console.error("Failed to save stock setting", error);
            setMessage(`${symbol} 저장 실패`);
        }
    };

    if (!user) {
        return <div style={{ padding: "20px" }}>로그인이 필요합니다.</div>;
    }

    return (
        <div style={{ padding: "16px", height: "100%", overflowY: "auto" }}>
            <h3 style={{ marginBottom: "16px" }}>환경 설정</h3>

            <div style={{ marginBottom: "24px", padding: "12px", border: "1px solid #888", backgroundColor: "#f0f0f0" }}>
                <h4 style={{ marginBottom: "8px" }}>계정 정보</h4>
                <div style={{ marginBottom: "8px" }}>사용자명: <b>{user.username}</b></div>
                <div style={{ marginBottom: "16px" }}>보유 현금: {user.cash.toLocaleString()} C</div>
                <button
                    onClick={logout}
                    style={{
                        padding: "6px 12px",
                        backgroundColor: "#c0c0c0",
                        border: "2px solid #000",
                        borderRightColor: "#fff",
                        borderBottomColor: "#fff",
                        cursor: "pointer",
                        marginRight: "8px",
                    }}
                >
                    로그아웃
                </button>

                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{
                        padding: "6px 12px",
                        backgroundColor: "#c0c0c0",
                        color: "#c00",
                        border: "2px solid #000",
                        borderRightColor: "#fff",
                        borderBottomColor: "#fff",
                        cursor: "pointer",
                        fontSize: "12px",
                    }}
                >
                    회원 탈퇴
                </button>

                {showDeleteConfirm && (
                    <div style={{ marginTop: "16px", padding: "12px", border: "2px solid #c00", backgroundColor: "#fff0f0" }}>
                        <h5 style={{ color: "#c00", marginBottom: "8px" }}>⚠️ 정말 탈퇴하시겠습니까?</h5>
                        <p style={{ fontSize: "12px", marginBottom: "8px" }}>
                            모든 자산과 거래 내역이 삭제되며 복구할 수 없습니다.
                        </p>
                        <input
                            type="password"
                            placeholder="비밀번호 확인"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            style={{ width: "100%", padding: "4px", marginBottom: "8px", border: "1px solid #000" }}
                        />
                        <div style={{ display: "flex", gap: "8px" }}>
                            <button
                                onClick={handleDeleteAccount}
                                style={{
                                    flex: 1,
                                    padding: "4px",
                                    backgroundColor: "#c00",
                                    color: "#fff",
                                    border: "1px solid #000",
                                    cursor: "pointer",
                                }}
                            >
                                탈퇴 확인
                            </button>
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeletePassword("");
                                }}
                                style={{
                                    flex: 1,
                                    padding: "4px",
                                    backgroundColor: "#fff",
                                    border: "1px solid #000",
                                    cursor: "pointer",
                                }}
                            >
                                취소
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isAdmin && (
                <div style={{ border: "2px solid #c00", padding: "12px", backgroundColor: "#fff0f0" }}>
                    <h4 style={{ color: "#c00", marginBottom: "12px", borderBottom: "1px solid #c00", paddingBottom: "4px" }}>
                        🛠️ 관리자 제어 패널
                    </h4>

                    {/* 글로벌 설정 */}
                    <div style={{ marginBottom: "20px" }}>
                        <h5 style={{ marginBottom: "8px" }}>📈 글로벌 시장 설정</h5>
                        <div style={{ marginBottom: "12px" }}>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "12px" }}>
                                Market Trend (시장 추세): {marketTrend}
                                <span style={{ color: "#666", marginLeft: "8px" }}>(양수=상승장, 음수=하락장)</span>
                            </label>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <input
                                    type="range"
                                    min="-2.0"
                                    max="2.0"
                                    step="0.1"
                                    value={marketTrend}
                                    onChange={(e) => setMarketTrend(parseFloat(e.target.value))}
                                    style={{ flex: 1 }}
                                />
                                <span style={{ width: "40px", textAlign: "right", fontSize: "12px" }}>{marketTrend}</span>
                            </div>
                        </div>

                        <div style={{ marginBottom: "16px" }}>
                            <label style={{ display: "block", marginBottom: "4px", fontSize: "12px" }}>
                                Volatility (변동성 배수): x{volatilityMultiplier}
                                {volatilityMultiplier === 0 && <span style={{ color: "blue", marginLeft: "8px" }}>(시장 동결)</span>}
                            </label>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <input
                                    type="range"
                                    min="0"
                                    max="5.0"
                                    step="0.1"
                                    value={volatilityMultiplier}
                                    onChange={(e) => setVolatilityMultiplier(parseFloat(e.target.value))}
                                    style={{ flex: 1 }}
                                />
                                <span style={{ width: "40px", textAlign: "right", fontSize: "12px" }}>x{volatilityMultiplier}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveGlobal}
                            style={{
                                width: "100%",
                                padding: "6px",
                                backgroundColor: "#c00",
                                color: "#fff",
                                border: "1px solid #000",
                                cursor: "pointer",
                                fontSize: "12px",
                            }}
                        >
                            글로벌 설정 저장
                        </button>
                    </div>

                    {/* 종목별 설정 */}
                    <div>
                        <h5 style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
                            📊 종목별 설정
                            <button onClick={fetchStockSettings} style={{ fontSize: "10px", padding: "2px 4px" }}>새로고침</button>
                        </h5>

                        {loadingStocks ? (
                            <div style={{ fontSize: "12px", color: "#666" }}>로딩 중...</div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflowY: "auto", border: "1px solid #ccc", padding: "4px" }}>
                                {stockSettings.map((stock) => (
                                    <div key={stock.symbol} style={{ padding: "8px", border: "1px solid #ddd", display: "flex", flexDirection: "column", gap: "4px", backgroundColor: "#fff" }}>
                                        <div style={{ fontWeight: "bold", fontSize: "12px", display: "flex", justifyContent: "space-between" }}>
                                            {stock.symbol}
                                            <button
                                                onClick={() => handleSaveStock(stock.symbol, stock.volatility, stock.trend)}
                                                style={{ fontSize: "10px", padding: "2px 6px", cursor: "pointer", backgroundColor: "#008080", color: "#fff", border: "none" }}
                                            >
                                                저장
                                            </button>
                                        </div>

                                        {/* 개별 변동성 */}
                                        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}>
                                            <span style={{ width: "30px" }}>변동:</span>
                                            <input
                                                type="range" min="0" max="5.0" step="0.1"
                                                value={stock.volatility}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    setStockSettings(prev => prev.map(s => s.symbol === stock.symbol ? { ...s, volatility: val } : s));
                                                }}
                                                style={{ flex: 1 }}
                                            />
                                            <span style={{ width: "24px", textAlign: "right" }}>{stock.volatility}</span>
                                        </div>

                                        {/* 개별 추세 */}
                                        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}>
                                            <span style={{ width: "30px" }}>추세:</span>
                                            <input
                                                type="range" min="-2.0" max="2.0" step="0.1"
                                                value={stock.trend}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    setStockSettings(prev => prev.map(s => s.symbol === stock.symbol ? { ...s, trend: val } : s));
                                                }}
                                                style={{ flex: 1 }}
                                            />
                                            <span style={{ width: "24px", textAlign: "right" }}>{stock.trend}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {message && (
                        <div style={{ marginTop: "12px", color: "blue", fontSize: "12px", textAlign: "center", fontWeight: "bold" }}>
                            {message}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
