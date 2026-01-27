const STORAGE_KEY = 'LLG_DATA_V6_FINAL';

// 초기 데이터
const DEFAULT_STATE = {
    gold: 0,
    totalLevel: 0,
    currentTitle: "모험가",
    currentJob: "무직",
    
    unlockedTitles: ["모험가"],
    unlockedJobs: ["무직"],
    
    inventory: [], 
    
    // [1] 스탯 (불변)
    cores: {
        STR: { name: "힘 (STR)", level: 0, color: "#FF5C5C" },
        DEX: { name: "솜씨 (DEX)", level: 0, color: "#6BCB77" },
        INT: { name: "지능 (INT)", level: 0, color: "#4D96FF" },
        WIS: { name: "지혜 (WIS)", level: 0, color: "#FFD700" },
        VIT: { name: "체력 (VIT)", level: 0, color: "#FF9F43" }
    },
    
    masteries: {}, 
    skills: {}, // 스킬 (성장하는 대상)
    quests: {}, // [신규] 퀘스트 (수행하는 행동)

    // [신규] 유저가 커스텀 가능한 상점 아이템 (기본값 제공)
    shopItems: [
        { id: 'item1', name: "유튜브 30분", cost: 500 },
        { id: 'item2', name: "배달음식", cost: 3000 },
        { id: 'item3', name: "주말 휴식권", cost: 8000 }
    ]
};

export const DataManager = {
    load: () => {
        const json = localStorage.getItem(STORAGE_KEY);
        if(!json) return JSON.parse(JSON.stringify(DEFAULT_STATE));
        const data = JSON.parse(json);
        
        // 마이그레이션
        if(!data.quests) data.quests = {};
        if(!data.shopItems) data.shopItems = DEFAULT_STATE.shopItems;
        
        return data;
    },
    save: (state) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    reset: () => {
        if(confirm("정말 초기화하시겠습니까?")) {
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
