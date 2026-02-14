"use client";

import React, { useEffect, useState } from "react";

interface ChartProps {
    symbol: string;
    width?: number;
    height?: number;
}

interface DataPoint {
    price: number;
    time: string;
}

export default function StockChart({ symbol, width = 160, height = 80 }: ChartProps) {
    const [data, setData] = useState<DataPoint[]>([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // 캐싱 방지를 위해 timestamp 추가
                const res = await fetch(`/api/stocks/${symbol}?t=${Date.now()}`);
                if (res.ok) {
                    const history = await res.json();
                    setData(history);
                }
            } catch (error) {
                console.error("Failed to fetch chart data:", error);
            }
        };

        fetchHistory();
        // 5초마다 갱신
        const interval = setInterval(fetchHistory, 5000);
        return () => clearInterval(interval);
    }, [symbol]);

    if (data.length < 2) return <div style={{ width, height, backgroundColor: "#fff", border: "1px solid #000" }}>Loading...</div>;

    // Min/Max 계산
    const prices = data.map((d) => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice || 1;

    // 좌표 변환
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((d.price - minPrice) / range) * (height - 10) - 5; // 여백 5px
        return `${x},${y}`;
    }).join(" ");

    const color = prices[prices.length - 1] >= prices[0] ? "#c00" : "#00c";

    return (
        <div style={{ width, height, backgroundColor: "#fff", border: "1px solid #000", position: "relative" }}>
            <svg width={width} height={height}>
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    points={points}
                />
            </svg>
            <div style={{ position: "absolute", top: 2, left: 2, fontSize: "10px", color: "#666" }}>
                Max: {maxPrice}
            </div>
            <div style={{ position: "absolute", bottom: 2, left: 2, fontSize: "10px", color: "#666" }}>
                Min: {minPrice}
            </div>
        </div>
    );
}
