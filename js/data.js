const STORAGE_KEY = 'LLG_DATA_FINAL';

// 초기 데이터 (3계층 구조)
const DEFAULT_STATE = {
    gold: 0,
    totalLevel: 0,
    currentJob: "백수",
    cores: {
        INT: { name: "지능 (INT)", level: 0 },
        STR: { name: "힘 (STR)", level: 0 },
        WIS: { name: "지혜 (WIS)", level: 0 }
    },
    masteries: {
        m1: { name: "언어학", core: "INT", level: 0 },
        m2: { name: "공학", core: "INT", level: 0 },
        m3: { name: "신체단련", core: "STR", level: 0 },
        m4: { name: "투자전략", core: "WIS", level: 0 }
    },
    arts: {
        a1: { name: "토익", mastery: "m1", seconds: 0, level: 0 },
        a2: { name: "파이썬", mastery: "m2", seconds: 0, level: 0 },
        a3: { name: "헬스", mastery: "m3", seconds: 0, level: 0 },
        a4: { name: "백테스팅", mastery: "m4", seconds: 0, level: 0 }
    }
};

// 현실 상점 아이템
export const SHOP_ITEMS = [
    { name: "유튜브 30분", cost: 500 },
    { name: "배달음식", cost: 3000 },
    { name: "주말 휴식권", cost: 8000 }
];

export const DataManager = {
    load: () => {
        const json = localStorage.getItem(STORAGE_KEY);
        return json ? JSON.parse(json) : JSON.parse(JSON.stringify(DEFAULT_STATE));
    },
    save: (state) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    reset: () => {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    },
    export: (state) => {
        const str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
        const node = document.createElement('a');
        node.href = str;
        node.download = "LLG_Backup.json";
        node.click();
    }
};
