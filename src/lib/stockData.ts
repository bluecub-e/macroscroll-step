export interface Stock {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volatility: number; // 0.0 to 1.0 (higher means more volatile)
    type: 'stock' | 'fund' | 'index';
    description?: string;
}

export const initialStocks: Stock[] = [
    {
        symbol: "RLSA",
        name: "릴리상스 (Releassance)",
        price: 15000,
        change: 0,
        changePercent: 0,
        volatility: 0.05,
        type: "stock",
    },
    {
        symbol: "HSR",
        name: "하이시어 (Highseer)",
        price: 8500,
        change: 0,
        changePercent: 0,
        volatility: 0.04,
        type: "stock",
    },
    {
        symbol: "MCSC",
        name: "매크로스크롤 (Macroscroll)",
        price: 42000,
        change: 0,
        changePercent: 0,
        volatility: 0.03,
        type: "stock",
    },
    {
        symbol: "ENVI",
        name: "엔비전 (Envision)",
        price: 12000,
        change: 0,
        changePercent: 0,
        volatility: 0.06,
        type: "stock",
    },
    {
        symbol: "AAR",
        name: "에테르 아카이브 (Aether Archive)",
        price: 2500,
        change: 0,
        changePercent: 0,
        volatility: 0.08,
        type: "stock",
    },
    {
        symbol: "ARBP",
        name: "ARBP (Big Players Fund)",
        price: 10000,
        change: 0,
        changePercent: 0,
        volatility: 0.02,
        type: "fund",
        description: "릴리상스/하이시어 등 대형주 포함 펀드",
    },
    {
        symbol: "TFTF",
        name: "TFTF (Tech Focus Fund)",
        price: 10000,
        change: 0,
        changePercent: 0,
        volatility: 0.04,
        type: "fund",
    },
    {
        symbol: "OVTK",
        name: "OVTK (Old Valley Top 1000)",
        price: 3000,
        change: 0,
        changePercent: 0,
        volatility: 0.01,
        type: "index",
    },
    {
        symbol: "BBDS",
        name: "Bow Bones (Index)",
        price: 15000,
        change: 0,
        changePercent: 0,
        volatility: 0.02,
        type: "index",
    },
];
