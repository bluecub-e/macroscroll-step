"use client";

import React, { useState } from "react";
import { useGame } from "@/contexts/GameContext";
// 차트 컴포넌트 import (상대 경로 주의)
import StockChart from "../ui/StockChart";

export default function StockMarket() {
    const { stocks, user, buyStock, sellStock, getHolding } = useGame();
    const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
    const [orderQuantity, setOrderQuantity] = useState(1);
    const [message, setMessage] = useState("");
    const [isTrading, setIsTrading] = useState(false);

    const selectedStock = stocks.find((s) => s.symbol === selectedSymbol);
    const holding = selectedSymbol ? getHolding(selectedSymbol) : undefined;

    const handleBuy = async () => {
        if (!selectedSymbol || !user) return;
        setIsTrading(true);
        const success = await buyStock(selectedSymbol, orderQuantity);
        setMessage(success ? `${orderQuantity}주 매수 완료!` : "잔고 부족!");
        setIsTrading(false);
        setTimeout(() => setMessage(""), 2000);
    };

    const handleSell = async () => {
        if (!selectedSymbol || !user) return;
        setIsTrading(true);
        const success = await sellStock(selectedSymbol, orderQuantity);
        setMessage(success ? `${orderQuantity}주 매도 완료!` : "보유 수량 부족!");
        setIsTrading(false);
        setTimeout(() => setMessage(""), 2000);
    };

    // 모바일 감지 (간단한 구현)
    const [isMobile, setIsMobile] = useState(false);
    React.useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    if (!user) {
        return (
            <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
                로그인 후 이용 가능합니다.
            </div>
        );
    }

    return (
        <div style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: "8px",
            height: "100%",
            overflow: "hidden" // 전체 컨테이너는 넘치지 않도록
        }}>
            {/* 종목 리스트 */}
            <div style={{
                flex: isMobile ? "1 1 auto" : 1, // 모바일에서는 유연하게 남는 공간 차지
                height: isMobile ? "auto" : "auto",
                overflowY: "auto",
                minHeight: 0 // Flex child scroll fix
            }}>
                <div style={{ padding: "4px", borderBottom: "1px solid #000", fontWeight: "bold", fontSize: isMobile ? "12px" : "14px" }}>
                    보유 현금: {user.cash.toLocaleString()} C
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: isMobile ? "11px" : "13px" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid #000", textAlign: "left" }}>
                            <th style={{ padding: "4px" }}>종목</th>
                            <th style={{ padding: "4px", textAlign: "right" }}>현재가</th>
                            <th style={{ padding: "4px", textAlign: "right" }}>변동</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stocks.map((stock) => (
                            <tr
                                key={stock.symbol}
                                onClick={() => setSelectedSymbol(stock.symbol)}
                                style={{
                                    borderBottom: "1px dotted #888",
                                    cursor: "pointer",
                                    backgroundColor: selectedSymbol === stock.symbol ? "#000080" : "transparent",
                                    color: selectedSymbol === stock.symbol ? "#fff" : "#000",
                                }}
                            >
                                <td style={{ padding: "4px" }}>
                                    <div style={{ fontWeight: "bold" }}>{stock.symbol}</div>
                                    <div style={{ fontSize: "10px", opacity: 0.8, display: isMobile ? "none" : "block" }}>{stock.name}</div>
                                </td>
                                <td style={{ padding: "4px", textAlign: "right" }}>
                                    {stock.price.toLocaleString()} C
                                </td>
                                <td style={{ padding: "4px", textAlign: "right", color: selectedSymbol === stock.symbol ? "#fff" : stock.change > 0 ? "#c00" : stock.change < 0 ? "#00c" : "#000" }}>
                                    {stock.change > 0 ? "▲" : stock.change < 0 ? "▼" : "-"}
                                    {Math.abs(stock.change).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 주문 패널 & 차트 */}
            {selectedStock && (
                <div style={{
                    width: isMobile ? "100%" : "180px",
                    display: "flex",
                    flexDirection: isMobile ? "row" : "column",
                    gap: "8px",
                    flex: isMobile ? "0 0 auto" : "none", // 모바일에서는 내용물만큼만 높이 차지 (하단 고정 느낌)
                    maxHeight: isMobile ? "45%" : "none", // 너무 커지지 않도록 제한
                    borderTop: isMobile ? "1px solid #888" : "none",
                    paddingTop: isMobile ? "8px" : "0"
                }}>
                    {/* 차트 영역 */}
                    <div style={{ border: "1px solid #000", padding: "4px", backgroundColor: "#fff", flex: 1, display: "flex", flexDirection: "column" }}>
                        <div style={{ fontSize: "11px", marginBottom: "2px", textAlign: "center" }}>{selectedStock.name}</div>
                        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <StockChart symbol={selectedStock.symbol} width={isMobile ? 120 : 170} height={isMobile ? 80 : 100} />
                        </div>
                    </div>

                    {/* 주문 영역 */}
                    <div style={{ padding: "8px", backgroundColor: "#e0e0e0", border: "1px solid #000", fontSize: "12px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        {!isMobile && <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{selectedStock.symbol} 주문</div>}
                        <div style={{ marginBottom: "4px" }}>현재가: {selectedStock.price.toLocaleString()} C</div>
                        <div style={{ marginBottom: "8px" }}>보유: {holding?.quantity || 0}주</div>

                        <div style={{ marginBottom: "4px", display: "flex", alignItems: "center" }}>
                            <label style={{ marginRight: "4px" }}>수량:</label>
                            <input
                                type="number"
                                min={1}
                                value={orderQuantity}
                                onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                style={{ width: "60px", border: "1px solid #000", padding: "2px" }}
                            />
                        </div>

                        <div style={{ fontSize: "11px", marginBottom: "8px" }}>
                            총액: {(selectedStock.price * orderQuantity).toLocaleString()} C
                        </div>

                        <div style={{ display: "flex", gap: "4px" }}>
                            <button onClick={handleBuy} disabled={isTrading} style={{ flex: 1, padding: "8px 4px", backgroundColor: "#c00", color: "#fff", border: "1px solid #000", cursor: "pointer", opacity: isTrading ? 0.5 : 1 }}>
                                매수
                            </button>
                            <button onClick={handleSell} disabled={isTrading} style={{ flex: 1, padding: "8px 4px", backgroundColor: "#00c", color: "#fff", border: "1px solid #000", cursor: "pointer", opacity: isTrading ? 0.5 : 1 }}>
                                매도
                            </button>
                        </div>

                        {message && <div style={{ marginTop: "8px", fontWeight: "bold", color: "#000", fontSize: "11px" }}>{message}</div>}
                    </div>
                </div>
            )}
        </div>
    );
}
