const STORAGE_KEY = 'LLG_DATA_V3_FINAL';

// 초기 데이터
const DEFAULT_STATE = {
    gold: 0,
    totalLevel: 0,
    currentTitle: "입문자",
    unlockedTitles: ["입문자"],
    inventory: [], // { name: "아이콘", desc: "설명" }
    
    // 5대 스탯 (오각형)
    cores: {
        INT: { name: "지능 (INT)", level: 0, color: "#4D96FF" }, // 파랑
        STR: { name: "힘 (STR)", level: 0, color: "#FF5C5C" },   // 빨강
        WIS: { name: "지혜 (WIS)", level: 0, color: "#FFD700" }, // 노랑
        DEX: { name: "솜씨 (DEX)", level: 0, color: "#6BCB77" }, // 초록
        VIT: { name: "체력 (VIT)", level: 0, color: "#FF9F43" }  // 주황
    },
    
    masteries: {
        m1: { name: "언어학", core: "INT", level: 0 },
        m2: { name: "개발", core: "INT", level: 0 },
        m3: { name: "근력", core: "STR", level: 0 },
        m4: { name: "투자", core: "WIS", level: 0 },
        m5: { name: "유산소", core: "VIT", level: 0 },
        m6: { name: "기술", core: "DEX", level: 0 }
    },
    
    skills: {
        // hidden: true면 목록에서 숨김 (삭제 상태)
        s1: { name: "토익", mastery: "m1", seconds: 0, level: 0, hidden: false },
        s2: { name: "파이썬", mastery: "m2", seconds: 0, level: 0, hidden: false },
        s3: { name: "스쿼트", mastery: "m3", seconds: 0, level: 0, hidden: false },
        s4: { name: "러닝", mastery: "m5", seconds: 0, level: 0, hidden: false }
    }
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
        // 마이그레이션 (구버전 호환)
        if(!data.cores.DEX) data.cores.DEX = DEFAULT_STATE.cores.DEX;
        if(!data.cores.VIT) data.cores.VIT = DEFAULT_STATE.cores.VIT;
        if(!data.inventory) data.inventory = [];
        if(!data.unlockedTitles) data.unlockedTitles = ["입문자"];
        
        return data;
    },
    save: (state) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    reset: () => {
        if(confirm("모든 데이터를 초기화하시겠습니까?")) {
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
