const STORAGE_KEY = 'LLG_DATA_V5_FINAL';

// 초기 데이터
const DEFAULT_STATE = {
    gold: 0,
    totalLevel: 0,
    
    // [수정] 칭호와 직업 분리
    currentTitle: "초심자",
    currentJob: "무직",
    
    unlockedTitles: ["초심자"],
    unlockedJobs: ["무직"],
    
    inventory: [], // { type: 'loot'|'record', icon: "📘", name: "제목", desc: "설명" }
    
    // [수정] RPG 불문율 스탯 순서 (STR -> DEX -> INT -> WIS -> VIT)
    cores: {
        STR: { name: "힘 (STR)", level: 0, color: "#FF5C5C" },    // 빨강
        DEX: { name: "솜씨 (DEX)", level: 0, color: "#6BCB77" }, // 초록
        INT: { name: "지능 (INT)", level: 0, color: "#4D96FF" }, // 파랑
        WIS: { name: "지혜 (WIS)", level: 0, color: "#FFD700" }, // 노랑
        VIT: { name: "체력 (VIT)", level: 0, color: "#FF9F43" }  // 주황
    },
    
    masteries: {}, 
    skills: {}     
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
        
        // 마이그레이션: 구버전 데이터가 있다면 스탯 순서 재정렬을 위해 새 객체에 덮어씌움
        if(!data.unlockedJobs) data.unlockedJobs = ["무직"];
        if(!data.currentJob) data.currentJob = "무직";
        
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
