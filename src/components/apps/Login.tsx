"use client";

import React, { useState } from "react";
import { useGame } from "@/contexts/GameContext";
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from "@/lib/policies";

export default function Login() {
    const { login, register, authError, isLoading } = useGame();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    // 약관 표시 관련 상태
    const [showPolicies, setShowPolicies] = useState(false);
    const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms");
    const [localError, setLocalError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError("");

        if (isRegisterMode && !agreedToTerms) {
            setLocalError("이용약관 및 개인정보처리방침에 동의해야 합니다.");
            return;
        }

        if (isRegisterMode) {
            await register(username, password);
        } else {
            await login(username, password);
        }
    };

    const toggleMode = () => {
        setIsRegisterMode(!isRegisterMode);
        setLocalError("");
        setAgreedToTerms(false);
        setShowPolicies(false);
    };

    return (
        <div style={{ padding: "16px", height: "100%", display: "flex", flexDirection: "column", boxSizing: "border-box", width: "100%", overflowX: "hidden" }}>
            <h3 style={{ marginBottom: "16px", fontSize: "14px" }}>
                {isRegisterMode ? "회원가입" : "로그인"}
            </h3>

            <form onSubmit={handleSubmit} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", marginBottom: "4px" }}>사용자명</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "6px",
                            border: "1px solid #000",
                            fontFamily: "inherit",
                            boxSizing: "border-box",
                        }}
                        placeholder="2-20자"
                        required
                        disabled={isLoading}
                    />
                </div>

                <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", marginBottom: "4px" }}>비밀번호</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            width: "100%",
                            padding: "6px",
                            border: "1px solid #000",
                            fontFamily: "inherit",
                            boxSizing: "border-box",
                        }}
                        required
                        disabled={isLoading}
                    />
                </div>

                {isRegisterMode && (
                    <div style={{ marginBottom: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}>
                            <input
                                type="checkbox"
                                id="terms"
                                checked={agreedToTerms}
                                onChange={(e) => setAgreedToTerms(e.target.checked)}
                                style={{ marginRight: "6px" }}
                                disabled={isLoading}
                            />
                            <label htmlFor="terms" style={{ fontSize: "11px", cursor: "pointer" }}>
                                이용약관 및 개인정보처리방침 동의
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowPolicies(!showPolicies)}
                                style={{
                                    marginLeft: "auto",
                                    fontSize: "11px",
                                    textDecoration: "underline",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "#000080",
                                }}
                            >
                                {showPolicies ? "닫기" : "약관 보기"}
                            </button>
                        </div>

                        {showPolicies && (
                            <div style={{ border: "1px solid #888", backgroundColor: "#fff", marginBottom: "8px" }}>
                                {/* 탭 버튼 */}
                                <div style={{ display: "flex", borderBottom: "1px solid #888", backgroundColor: "#e0e0e0" }}>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("terms")}
                                        style={{
                                            flex: 1,
                                            padding: "4px",
                                            border: "none",
                                            backgroundColor: activeTab === "terms" ? "#fff" : "#e0e0e0",
                                            fontWeight: activeTab === "terms" ? "bold" : "normal",
                                            cursor: "pointer",
                                            fontSize: "11px"
                                        }}
                                    >
                                        이용약관
                                    </button>
                                    <div style={{ width: "1px", backgroundColor: "#888" }}></div>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab("privacy")}
                                        style={{
                                            flex: 1,
                                            padding: "4px",
                                            border: "none",
                                            backgroundColor: activeTab === "privacy" ? "#fff" : "#e0e0e0",
                                            fontWeight: activeTab === "privacy" ? "bold" : "normal",
                                            cursor: "pointer",
                                            fontSize: "11px"
                                        }}
                                    >
                                        개인정보처리방침
                                    </button>
                                </div>
                                {/* 내용 영역 */}
                                <div style={{
                                    height: "100px",
                                    overflowY: "auto",
                                    padding: "4px",
                                    fontSize: "11px",
                                    whiteSpace: "pre-wrap",
                                }}>
                                    {activeTab === "terms" ? TERMS_OF_SERVICE : PRIVACY_POLICY}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {(authError || localError) && (
                    <div style={{ color: "#c00", marginBottom: "12px", fontSize: "12px" }}>
                        {localError || authError}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        width: "100%",
                        padding: "8px",
                        backgroundColor: "#000080",
                        color: "#fff",
                        border: "1px solid #000",
                        cursor: isLoading ? "wait" : "pointer",
                        marginBottom: "8px",
                        marginTop: "auto",
                    }}
                >
                    {isLoading ? "처리 중..." : isRegisterMode ? "가입하기" : "로그인"}
                </button>
            </form>

            <button
                type="button"
                onClick={toggleMode}
                disabled={isLoading}
                style={{
                    width: "100%",
                    padding: "6px",
                    backgroundColor: "#c0c0c0",
                    border: "1px solid #000",
                    cursor: "pointer",
                    fontSize: "12px",
                }}
            >
                {isRegisterMode ? "이미 계정이 있나요? 로그인" : "계정이 없나요? 회원가입"}
            </button>

            <div style={{ marginTop: "16px", fontSize: "11px", color: "#666" }}>
                <p>• 초기 자금: 1,000,000 C</p>
                <p>• 모든 사용자가 동일한 주가를 봅니다.</p>
            </div>
        </div>
    );
}
