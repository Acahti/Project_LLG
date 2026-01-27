const STORAGE_KEY = 'LLG_DATA_V7_FINAL_FIXED'; 

// 초기 데이터
const DEFAULT_STATE = {
    gold: 0,
    totalLevel: 0,
    currentTitle: "모험가",
    currentJob: "무직",
    unlockedTitles: ["모험가"],
    unlockedJobs: ["무직"],
    inventory: [], 
    
    // 5대 스탯 정의
    cores: {
        STR: { name: "힘 (STR)", level: 0, color: "#FF5C5C" },
        DEX: { name: "솜씨 (DEX)", level: 0, color: "#6BCB77" },
        INT: { name: "지능 (INT)", level: 0, color: "#4D96FF" },
        WIS: { name: "지혜 (WIS)", level: 0, color: "#FFD700" },
        VIT: { name: "체력 (VIT)", level: 0, color: "#FF9F43" }
    },
    
    masteries: {}, 
    skills: {}, 
    quests: {}, 
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
        const defaults = DEFAULT_STATE.cores;
        
        // 데이터 마이그레이션 (없는 스탯 자동 복구)
        if (!data.cores) data.cores = {};
        ['STR', 'DEX', 'INT', 'WIS', 'VIT'].forEach(key => {
            if (!data.cores[key]) {
                data.cores[key] = JSON.parse(JSON.stringify(defaults[key]));
            }
        });

        if(!data.quests) data.quests = {};
        if(!data.shopItems) data.shopItems = DEFAULT_STATE.shopItems;
        
        return data;
    },
    save: (state) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },
    reset: () => {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    },
    // [중요 수정] 백업 저장 기능 개선 (아이폰 대응)
    export: (state) => {
        const str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
        const node = document.createElement('a');
        node.href = str;
        node.download = `LLG_Backup_${new Date().toISOString().slice(0,10)}.json`;
        
        // DOM에 붙였다가 클릭 후 제거해야 모바일/보안 브라우저에서 작동함
        document.body.appendChild(node);
        node.click();
        document.body.removeChild(node);
    }
};
