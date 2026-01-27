const STORAGE_KEY = 'LLG_DATA_V4_FINAL';

// 초기 데이터 (완전 빈 상태)
const DEFAULT_STATE = {
    gold: 0,
    totalLevel: 0,
    currentTitle: "모험가",
    unlockedTitles: ["모험가"],
    inventory: [], 
    
    // 코어 스탯은 구조상 필요하므로 유지
    cores: {
        INT: { name: "지능 (INT)", level: 0, color: "#4D96FF" },
        STR: { name: "힘 (STR)", level: 0, color: "#FF5C5C" },
        WIS: { name: "지혜 (WIS)", level: 0, color: "#FFD700" },
        DEX: { name: "솜씨 (DEX)", level: 0, color: "#6BCB77" },
        VIT: { name: "체력 (VIT)", level: 0, color: "#FF9F43" }
    },
    
    masteries: {}, // 빈 객체
    skills: {}     // 빈 객체
};

export const SHOP_ITEMS = [
    { name: "유튜브 30분", cost: 500 },
    { name: "배달음식", cost: 3000 },
    { name: "주말 휴식권", cost: 8000 }
];

export const DataManager = {
    load: () => {
        const json = localStorage.getItem(STORAGE_KEY);
        if(!json) return JSON.parse(JSON.stringify(DEFAULT_STATE));
        const data = JSON.parse(json);
        // 마이그레이션 로직
        if(!data.masteries) data.masteries = {};
        if(!data.skills) data.skills = {};
        return data;
    },
    save: (state) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    reset: () => {
        if(confirm("정말 초기화하시겠습니까? 모든 기록이 사라집니다.")) {
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        }
    },
    export: (state) => {
        const str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
        const node = document.createElement('a');
        node.href = str;
        node.download = `LLG_Backup_${new Date().toISOString().slice(0,10)}.json`;
        node.click();
    }
};
