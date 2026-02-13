"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

// 타입 정의
interface Stock {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    type: string;
}

interface Holding {
    symbol: string;
    quantity: number;
    avgPrice: number;
}

interface Transaction {
    id: number;
    type: string;
    symbol: string;
    quantity: number;
    price: number;
    total: number;
    createdAt: string;
}

interface User {
    id: number;
    username: string;
    cash: number;
}

interface GameState {
    user: User | null;
    stocks: Stock[];
    holdings: Holding[];
    transactions: Transaction[];
    isLoading: boolean;
}

interface GameContextType extends GameState {
    login: (username: string, password: string) => Promise<boolean>;
    register: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    buyStock: (symbol: string, quantity: number) => Promise<boolean>;
    sellStock: (symbol: string, quantity: number) => Promise<boolean>;
    refreshPortfolio: () => Promise<void>;
    getHolding: (symbol: string) => Holding | undefined;
    getTotalValue: () => number;
    authError: string | null;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [holdings, setHoldings] = useState<Holding[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);

    // 주가 조회 (5초마다)
    const fetchStocks = useCallback(async () => {
        try {
            const res = await fetch("/api/stocks");
            if (res.ok) {
                const data = await res.json();
                setStocks(data);
            }
        } catch (error) {
            console.error("Failed to fetch stocks:", error);
        }
    }, []);

    // 5초마다 주가 조회 (서버가 알아서 시뮬레이션 실행)
    useEffect(() => {
        fetchStocks();
        const interval = setInterval(fetchStocks, 5000);
        return () => clearInterval(interval);
    }, [fetchStocks]);


    // 포트폴리오 조회
    const refreshPortfolio = useCallback(async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/portfolio?userId=${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setUser((prev) => prev ? { ...prev, cash: data.cash } : null);
                setHoldings(data.holdings);
                setTransactions(data.transactions);
            }
        } catch (error) {
            console.error("Failed to fetch portfolio:", error);
        }
    }, [user]);

    // 로그인
    const login = async (username: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        setAuthError(null);
        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, action: "login" }),
            });
            const data = await res.json();
            if (data.success) {
                setUser(data.user);
                setHoldings(data.holdings || []);
                return true;
            }
            setAuthError(data.error);
            return false;
        } catch {
            setAuthError("로그인 중 오류가 발생했습니다.");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // 회원가입
    const register = async (username: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        setAuthError(null);
        try {
            const res = await fetch("/api/auth", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, action: "register" }),
            });
            const data = await res.json();
            if (data.success) {
                setUser(data.user);
                setHoldings([]);
                return true;
            }
            setAuthError(data.error);
            return false;
        } catch {
            setAuthError("회원가입 중 오류가 발생했습니다.");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // 로그아웃
    const logout = () => {
        setUser(null);
        setHoldings([]);
        setTransactions([]);
    };

    // 매수
    const buyStock = async (symbol: string, quantity: number): Promise<boolean> => {
        if (!user) return false;
        try {
            const res = await fetch("/api/trade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, symbol, quantity, action: "buy" }),
            });
            const data = await res.json();
            if (data.success) {
                await refreshPortfolio();
                return true;
            }
            return false;
        } catch {
            return false;
        }
    };

    // 매도
    const sellStock = async (symbol: string, quantity: number): Promise<boolean> => {
        if (!user) return false;
        try {
            const res = await fetch("/api/trade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: user.id, symbol, quantity, action: "sell" }),
            });
            const data = await res.json();
            if (data.success) {
                await refreshPortfolio();
                return true;
            }
            return false;
        } catch {
            return false;
        }
    };

    const getHolding = (symbol: string) => holdings.find((h) => h.symbol === symbol);

    const getTotalValue = () => {
        const stockValue = holdings.reduce((sum, h) => {
            const stock = stocks.find((s) => s.symbol === h.symbol);
            return sum + (stock ? stock.price * h.quantity : 0);
        }, 0);
        return (user?.cash || 0) + stockValue;
    };

    return (
        <GameContext.Provider
            value={{
                user,
                stocks,
                holdings,
                transactions,
                isLoading,
                authError,
                login,
                register,
                logout,
                buyStock,
                sellStock,
                refreshPortfolio,
                getHolding,
                getTotalValue,
            }}
        >
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const context = useContext(GameContext);
    if (!context) throw new Error("useGame must be used within GameProvider");
    return context;
}
