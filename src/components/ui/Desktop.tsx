"use client";

import React, { useState, useRef, useEffect } from "react";
import Window from "./Window";
import StockMarket from "../apps/StockMarket";
import Portfolio from "../apps/Portfolio";
import Settings from "../apps/Settings";
import Login from "../apps/Login";
import { useGame } from "@/contexts/GameContext";

interface WindowConfig {
    id: string;
    title: string;
    component: React.ReactNode;
    width: number;
    height: number;
    initialX: number;
    initialY: number;
    icon: string;
}

export default function Desktop() {
    const { user, stocks } = useGame();
    const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
    const [openWindows, setOpenWindows] = useState<string[]>([]);
    const wasLoggedIn = useRef(false);

    // 로그인/로그아웃 시에만 창 상태 변경
    useEffect(() => {
        const isLoggedIn = !!user;

        // 로그인 상태가 변경된 경우에만 처리
        if (isLoggedIn !== wasLoggedIn.current) {
            if (isLoggedIn) {
                setOpenWindows(["stock-market", "portfolio"]);
                setActiveWindowId("stock-market");
            } else {
                setOpenWindows(["login"]);
                setActiveWindowId("login");
            }
            wasLoggedIn.current = isLoggedIn;
        }
    }, [user]);

    // 초기 상태 설정
    useEffect(() => {
        if (user) {
            setOpenWindows(["stock-market", "portfolio"]);
            setActiveWindowId("stock-market");
            wasLoggedIn.current = true;
        } else {
            setOpenWindows(["login"]);
            setActiveWindowId("login");
            wasLoggedIn.current = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const windowConfigs: WindowConfig[] = [
        {
            id: "login",
            title: "로그인",
            component: <Login />,
            width: 280,
            height: 320,
            initialX: 200,
            initialY: 80,
            icon: "👤",
        },
        {
            id: "stock-market",
            title: "주식 시세",
            component: <StockMarket />,
            width: 450,
            height: 350,
            initialX: 20,
            initialY: 20,
            icon: "📈",
        },
        {
            id: "portfolio",
            title: "포트폴리오",
            component: <Portfolio />,
            width: 350,
            height: 320,
            initialX: 490,
            initialY: 20,
            icon: "💼",
        },
        {
            id: "settings",
            title: "설정",
            component: <Settings />,
            width: 280,
            height: 300,
            initialX: 200,
            initialY: 100,
            icon: "⚙️",
        },
    ];

    const handleFocus = (id: string) => setActiveWindowId(id);

    const handleClose = (id: string) => {
        if (id === "login" && !user) return;
        setOpenWindows((prev) => prev.filter((w) => w !== id));
    };

    const handleOpen = (id: string) => {
        if (id !== "login" && !user) return;
        setOpenWindows((prev) => {
            if (prev.includes(id)) return prev;
            return [...prev, id];
        });
        setActiveWindowId(id);
    };

    return (
        <div style={{ width: "100vw", height: "100vh", backgroundColor: "var(--desktop-bg)", position: "relative", overflow: "hidden" }}>
            {/* 바탕화면 아이콘 */}
            {user && (
                <div style={{ position: "absolute", top: 10, left: 10, display: "flex", flexDirection: "column", gap: "16px" }}>
                    {windowConfigs.filter(w => w.id !== "login").map((win) => (
                        <div
                            key={win.id}
                            onClick={() => handleOpen(win.id)}
                            style={{ width: 70, textAlign: "center", cursor: "pointer", color: "#fff", textShadow: "1px 1px 0 #000" }}
                        >
                            <div style={{ width: 48, height: 48, margin: "0 auto 4px", backgroundColor: "#c0c0c0", border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
                                {win.icon}
                            </div>
                            <div style={{ fontSize: "12px" }}>{win.title}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* 창들 */}
            {windowConfigs.map((win) =>
                openWindows.includes(win.id) && (
                    <Window
                        key={win.id}
                        title={win.title}
                        isActive={activeWindowId === win.id}
                        onFocus={() => handleFocus(win.id)}
                        onClose={() => handleClose(win.id)}
                        initialX={win.initialX}
                        initialY={win.initialY}
                        width={win.width}
                        height={win.height}
                    >
                        {win.component}
                    </Window>
                )
            )}

            {/* 상태 표시줄 */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "24px", backgroundColor: "var(--window-frame)", borderTop: "2px solid #fff", display: "flex", alignItems: "center", padding: "0 8px", fontSize: "12px" }}>
                <span style={{ marginRight: "16px" }}>
                    {user ? `👤 ${user.username}` : "로그인 필요"}
                </span>
                <span style={{ marginRight: "16px" }}>
                    {stocks.length > 0 ? "🟢 연결됨" : "⏳ 로딩 중..."}
                </span>
                <span>Macroscroll Step For OVSE</span>
            </div>
        </div>
    );
}
