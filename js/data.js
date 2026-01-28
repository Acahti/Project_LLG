const STORAGE_KEY = 'LLG_DATA_V12_FINAL';

// [v12.6] 초기 데이터 구조 (3600초 = 1레벨 기준)
const DEFAULT_STATE = {
    gold: 0,
    totalLevel: 0,
    currentTitle: "없음",
    currentJob: "무직",
    unlockedTitles: ["없음"],
    unlockedJobs: ["무직"],
    
    inventory: [], 
    folders: [],   
    activeStartTime: null, // [v12.5] 전투 시작 타임스탬프

    cores: {
        STR: { name: "힘 (STR)", level: 0, color: "#FF5C5C" },
        DEX: { name: "솜씨 (DEX)", level: 0, color: "#6BCB77" },
        INT: { name: "지능 (INT)", level: 0, color: "#4D96FF" },
        WIS: { name: "지혜 (WIS)", level: 0, color: "#FFD700" },
        VIT: { name: "체력 (VIT)", level: 0, color: "#FF9F43" }
    },
    
    statistics: {
        quest: { completed: 0, nightOwl: 0 },
        battle: { totalSeconds: 0 },
        shop: { purchases: 0, goldSpent: 0 }
    },

    masteries: {}, 
    skills: {}, 
    quests: {}, 
    shopItems: [
        { id: 'item1', name: "유튜브 30분", cost: 500 },
        { id: 'item2', name: "배달음식", cost: 3000 },
        { id: 'item3', name: "주말 휴식권", cost: 8000 }
    ],
    
    settings: { theme: 'dark', fontSize: 12 }
};

export const DataManager = {
    load: () => {
        const json = localStorage.getItem(STORAGE_KEY);
        if(!json) return JSON.parse(JSON.stringify(DEFAULT_STATE));
        const data = JSON.parse(json);
        if (!data.statistics) data.statistics = JSON.parse(JSON.stringify(DEFAULT_STATE.statistics));
        if (!data.cores) data.cores = JSON.parse(JSON.stringify(DEFAULT_STATE.cores));
        if (!data.unlockedTitles) data.unlockedTitles = ["없음", "신입"];
        if (!data.unlockedJobs) data.unlockedJobs = ["무직"];
        return data;
    },
    save: (state) => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); },
    reset: () => { localStorage.removeItem(STORAGE_KEY); location.reload(); },
    export: (state) => {
        const str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
        const node = document.createElement('a');
        node.href = str; node.download = `LLG_Backup_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(node); node.click(); document.body.removeChild(node);
    }
};
