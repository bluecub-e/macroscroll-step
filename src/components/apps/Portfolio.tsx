"use client";

import React, { useEffect } from "react";
import { useGame } from "@/contexts/GameContext";

export default function Portfolio() {
    const { user, holdings, stocks, transactions, getTotalValue, refreshPortfolio } = useGame();

    useEffect(() => {
        if (user) refreshPortfolio();
    }, [user, refreshPortfolio]);

    if (!user) {
        return (
            <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
                로그인 후 이용 가능합니다.
            </div>
        );
    }

    const totalValue = getTotalValue();
    const initialCash = 1000000;
    const profit = totalValue - initialCash;
    const profitPercent = ((profit / initialCash) * 100).toFixed(2);

    return (
        <div style={{ padding: "8px", fontSize: "13px" }}>
            {/* 요약 */}
            <div style={{ padding: "8px", backgroundColor: "#e0e0e0", border: "1px solid #000", marginBottom: "8px" }}>
                <div style={{ fontWeight: "bold", marginBottom: "4px" }}>자산 현황 ({user.username})</div>
                <div>현금: {user.cash.toLocaleString()} C</div>
                <div>주식 평가액: {(totalValue - user.cash).toLocaleString()} C</div>
                <div style={{ fontWeight: "bold", marginTop: "4px" }}>총 자산: {totalValue.toLocaleString()} C</div>
                <div style={{ color: profit >= 0 ? "#c00" : "#00c", fontWeight: "bold" }}>
                    수익: {profit >= 0 ? "+" : ""}{profit.toLocaleString()} C ({profitPercent}%)
                </div>
            </div>

            {/* 보유 주식 */}
            <div style={{ marginBottom: "8px" }}>
                <div style={{ fontWeight: "bold", marginBottom: "4px" }}>보유 주식</div>
                {holdings.length === 0 ? (
                    <div style={{ color: "#666" }}>보유 주식 없음</div>
                ) : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid #000" }}>
                                <th style={{ textAlign: "left", padding: "2px" }}>종목</th>
                                <th style={{ textAlign: "right", padding: "2px" }}>수량</th>
                                <th style={{ textAlign: "right", padding: "2px" }}>평균가</th>
                                <th style={{ textAlign: "right", padding: "2px" }}>현재가</th>
                                <th style={{ textAlign: "right", padding: "2px" }}>손익</th>
                            </tr>
                        </thead>
                        <tbody>
                            {holdings.map((h) => {
                                const stock = stocks.find((s) => s.symbol === h.symbol);
                                const currentPrice = stock?.price || 0;
                                const totalProfit = (currentPrice - h.avgPrice) * h.quantity;
                                return (
                                    <tr key={h.symbol} style={{ borderBottom: "1px dotted #888" }}>
                                        <td style={{ padding: "2px" }}>{h.symbol}</td>
                                        <td style={{ textAlign: "right", padding: "2px" }}>{h.quantity}</td>
                                        <td style={{ textAlign: "right", padding: "2px" }}>{h.avgPrice.toLocaleString()}</td>
                                        <td style={{ textAlign: "right", padding: "2px" }}>{currentPrice.toLocaleString()}</td>
                                        <td style={{ textAlign: "right", padding: "2px", color: totalProfit >= 0 ? "#c00" : "#00c" }}>
                                            {totalProfit >= 0 ? "+" : ""}{totalProfit.toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* 거래 내역 */}
            <div>
                <div style={{ fontWeight: "bold", marginBottom: "4px" }}>최근 거래</div>
                <div style={{ maxHeight: "100px", overflowY: "auto" }}>
                    {transactions.length === 0 ? (
                        <div style={{ color: "#666" }}>거래 내역 없음</div>
                    ) : (
                        transactions.slice(0, 10).map((t) => (
                            <div key={t.id} style={{ fontSize: "11px", padding: "2px", borderBottom: "1px dotted #ccc" }}>
                                <span style={{ color: t.type === "buy" ? "#c00" : "#00c" }}>
                                    {t.type === "buy" ? "매수" : "매도"}
                                </span> {t.symbol} {t.quantity}주 @ {t.price.toLocaleString()} C
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
