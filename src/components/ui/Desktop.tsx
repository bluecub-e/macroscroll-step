"use client";

import React, { useState, useEffect } from "react";
import Window from "./Window";
import StockMarket from "../apps/StockMarket";
import Portfolio from "../apps/Portfolio";
import Settings from "../apps/Settings";
import Login from "../apps/Login";
import { useGame } from "@/contexts/GameContext";

// 창 렌더링 컴포넌트 (Desktop 밖으로 분리하여 리렌더링 시 상태 초기화 방지)
const RenderWindow = ({ id, isOpen, isActive, title, component, initialPos, onClose, onFocus, isMobile }: any) => {
    if (!isOpen) return null;

    // 모바일이면 전체 화면 강제 적용 (안전하게 100dvh 사용 고려 또는 margin 적용)
    const mobileProps = isMobile ? {
        width: window.innerWidth,
        height: window.innerHeight - 44, // 작업 표시줄(40px) + 안전 여백
        initialX: 0,
        initialY: 0,
        minWidth: window.innerWidth,
        minHeight: window.innerHeight - 44,
        style: {
            position: "fixed" as const, // 모바일에서는 강제 고정
            top: 0,
            left: 0,
        }
    } : {};

    return (
        <Window
            title={title}
            isActive={isActive}
            onClose={() => onClose(id)}
            onFocus={() => onFocus(id)}
            initialX={initialPos.x}
            initialY={initialPos.y}
            // 모바일 최적화 props 전달
            {...mobileProps}
        >
            {component}
        </Window>
    );
};

export default function Desktop() {
    const { user } = useGame();
    const [openWindows, setOpenWindows] = useState<string[]>(["login"]);
    const [activeWindowId, setActiveWindowId] = useState<string>("login");
    const [isMobile, setIsMobile] = useState(false);

    // 모바일 감지
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // 로그인 상태 변경 시 창 업데이트
    useEffect(() => {
        if (user) {
            setOpenWindows(["stock-market", "portfolio"]);
            setActiveWindowId("stock-market");
        } else {
            setOpenWindows(["login"]);
            setActiveWindowId("login");
        }
    }, [user ? "logged-in" : "logged-out"]);

    const openWindow = (id: string) => {
        if (!openWindows.includes(id)) {
            setOpenWindows([...openWindows, id]);
        }
        setActiveWindowId(id);
    };

    const closeWindow = (id: string) => {
        if (id === "login" && !user) return; // 로그인 전에는 닫기 불가
        setOpenWindows(openWindows.filter((windowId) => windowId !== id));
    };

    const focusWindow = (id: string) => {
        setActiveWindowId(id);
    };

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                backgroundColor: "#008080", // Windows 95 Teal
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* 바탕화면 아이콘 */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, 80px)",
                    gap: "16px",
                    padding: "16px",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    zIndex: 0,
                }}
            >
                {user && (
                    <>
                        <DesktopIcon label="주식 시세" icon="📈" onClick={() => openWindow("stock-market")} />
                        <DesktopIcon label="내 자산" icon="💼" onClick={() => openWindow("portfolio")} />
                        <DesktopIcon label="설정" icon="⚙️" onClick={() => openWindow("settings")} />
                    </>
                )}
            </div>

            {/* 모바일 화면에서 로그인 페이지는 창 장식 없이 전체 화면으로 표시 */}
            {!user && isMobile ? (
                <div style={{ width: "100%", height: "100%", backgroundColor: "#c0c0c0", overflow: "hidden" }}>
                    <Login />
                </div>
            ) : (
                <RenderWindow
                    id="login"
                    isOpen={openWindows.includes("login")}
                    isActive={activeWindowId === "login"}
                    title="시스템 접속"
                    component={<Login />}
                    initialPos={{ x: isMobile ? 0 : 300, y: isMobile ? 0 : 200 }}
                    onClose={closeWindow}
                    onFocus={focusWindow}
                    isMobile={isMobile}
                />
            )}
            <RenderWindow
                key="stock-market"
                id="stock-market"
                isOpen={openWindows.includes("stock-market")}
                isActive={activeWindowId === "stock-market"}
                title="주식 시세 정보"
                component={<StockMarket />}
                initialPos={{ x: 50, y: 50 }}
                onClose={closeWindow}
                onFocus={focusWindow}
                isMobile={isMobile}
            />
            <RenderWindow
                key="portfolio"
                id="portfolio"
                isOpen={openWindows.includes("portfolio")}
                isActive={activeWindowId === "portfolio"}
                title="포트폴리오 관리"
                component={<Portfolio />}
                initialPos={{ x: 500, y: 50 }}
                onClose={closeWindow}
                onFocus={focusWindow}
                isMobile={isMobile}
            />
            <RenderWindow
                key="settings"
                id="settings"
                isOpen={openWindows.includes("settings")}
                isActive={activeWindowId === "settings"}
                title="환경 설정"
                component={<Settings />}
                initialPos={{ x: 300, y: 300 }}
                onClose={closeWindow}
                onFocus={focusWindow}
                isMobile={isMobile}
            />

            {/* 작업 표시줄 */}
            <div
                className="taskbar"
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    height: "40px",
                    backgroundColor: "#c0c0c0",
                    borderTop: "2px solid #fff",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 4px",
                    zIndex: 1000,
                }}
            >
                <button
                    style={{
                        fontWeight: "bold",
                        padding: "4px 8px",
                        marginRight: "8px",
                        border: "2px solid #000",
                        borderLeftColor: "#fff",
                        borderTopColor: "#fff",
                        backgroundColor: "#c0c0c0",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                    }}
                >
                    <span style={{ fontSize: "16px" }}>🏁</span> 시작
                </button>

                <div style={{ flex: 1, display: "flex", gap: "4px", overflowX: "auto" }}>
                    {openWindows.map((id) => (
                        <button
                            key={id}
                            onClick={() => activeWindowId === id ? setActiveWindowId("") : focusWindow(id)}
                            style={{
                                padding: "2px 8px",
                                minWidth: "100px",
                                textAlign: "left",
                                backgroundColor: activeWindowId === id ? "#e0e0e0" : "#c0c0c0",
                                border: activeWindowId === id ? "2px solid #000" : "2px solid #fff",
                                borderRightColor: activeWindowId === id ? "#fff" : "#000",
                                borderBottomColor: activeWindowId === id ? "#fff" : "#000",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                fontWeight: activeWindowId === id ? "bold" : "normal",
                            }}
                        >
                            {id === "login" ? "시스템 접속" :
                                id === "stock-market" ? "주식 시세" :
                                    id === "portfolio" ? "내 자산" : "설정"}
                        </button>
                    ))}
                </div>

                <div
                    style={{
                        padding: "2px 8px",
                        border: "2px solid #888",
                        borderRightColor: "#fff",
                        borderBottomColor: "#fff",
                        backgroundColor: "#c0c0c0",
                        marginLeft: "8px",
                        fontSize: "12px",
                    }}
                >
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
}

function DesktopIcon({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) {
    return (
        <div
            onClick={onClick}
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                width: "80px",
                textAlign: "center",
            }}
        >
            <div style={{ fontSize: "32px", marginBottom: "4px" }}>{icon}</div>
            <span
                style={{
                    color: "#fff",
                    fontSize: "12px",
                    textShadow: "1px 1px 1px #000",
                    backgroundColor: "rgba(0,0,0,0.2)",
                    padding: "2px 4px",
                }}
            >
                {label}
            </span>
        </div>
    );
}
