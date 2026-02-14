"use client";

import React, { useState } from "react";
import { useGame } from "@/contexts/GameContext";

const TERMS_CONTENT = `
제1조 (목적)
본 서비스는 사용자가 가상의 주식 투자를 체험할 수 있는 모의 시뮬레이션 게임입니다.

제2조 (가상 재화의 성격)
1. 서비스 내에서 사용되는 화폐("Credit", "C")와 주식 자산은 오로지 게임의 진행을 위한 전자적 수치입니다.
2. 유료 재화 없음: 본 서비스는 현금으로 충전하거나 구매할 수 있는 유료 아이템이나 재화를 포함하지 않습니다.
3. 환전 불가: 서비스 내의 재화는 어떠한 경우에도 현금이나 실물 경품으로 환전, 환불, 거래될 수 없습니다.

제3조 (투자에 대한 비보장)
본 서비스에서 제공되는 주가 데이터와 시장 상황은 시뮬레이션 알고리즘에 의해 생성된 허구의 정보입니다. 이는 실제 금융 시장과 무관하며, 실제 투자에 대한 지표나 권유로 활용될 수 없습니다.

제4조 (서비스의 변경 및 중단)
1. 운영자는 시뮬레이션 로직 업데이트나 버그 수정을 위해 예고 없이 서비스를 변경하거나 중단할 수 있습니다.
2. 데이터 초기화: 본 서비스는 개발 및 테스트 목적의 프로젝트 특성상, 업데이트 과정에서 사용자의 이용 기록(계정, 자산 정보 등)이 초기화될 수 있습니다. 이에 대해 운영자는 복구 의무를 지지 않습니다.

제5조 (비인가 프로그램 및 악용 금지)
1. 사용자는 서비스 이용 시 다음 각 호의 행위를 하여서는 안 됩니다.
    - 매크로, 봇(Bot), 자동 스크립트 등 운영자가 제공하지 않은 비인가 프로그램을 사용하는 행위
    - 서비스의 버그나 취약점을 이용하여 부당한 이득을 취하거나 시스템에 부하를 주는 행위
    - 타인의 계정 정보를 도용하거나 비정상적인 방법으로 데이터를 조작하는 행위
2. 운영자는 제1항을 위반한 사용자에 대하여 다음 각 호의 조치를 취할 수 있습니다.
    - 서비스 이용 권한 제한 (계정 정지)
    - 부당하게 취득한 가상 자산 및 데이터의 회수 또는 초기화
    - 기타 서비스 보호를 위해 필요한 관리 조치

제6조 (면책 조항)
운영자는 사용자가 본 서비스를 이용하며 기대하는 수익을 얻지 못하거나 상실한 것에 대하여 책임을 지지 않으며, 서비스 이용으로 발생하는 손해에 대해 책임지지 않습니다.
`;

export default function Login() {
    const { login, register, authError, isLoading } = useGame();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const [localError, setLocalError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError("");

        if (isRegisterMode && !agreedToTerms) {
            setLocalError("이용약관에 동의해야 합니다.");
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
        setShowTerms(false);
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
                            boxSizing: "border-box", // Ensure padding doesn't overflow width
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
                            <label htmlFor="terms" style={{ fontSize: "12px", cursor: "pointer" }}>
                                이용약관에 동의합니다
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowTerms(!showTerms)}
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
                                {showTerms ? "약관 닫기" : "약관 보기"}
                            </button>
                        </div>

                        {showTerms && (
                            <div style={{
                                height: "100px",
                                overflowY: "auto",
                                border: "1px solid #888",
                                padding: "4px",
                                fontSize: "11px",
                                backgroundColor: "#fff",
                                whiteSpace: "pre-wrap",
                                marginBottom: "8px",
                            }}>
                                {TERMS_CONTENT}
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
                        marginTop: "auto", // Push simply to bottom if space allows
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
