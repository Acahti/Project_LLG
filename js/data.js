const STORAGE_KEY = 'LLG_DATA_V12_FINAL';

// [v12.0] 초기 데이터 구조 (통계 변수 추가)
const DEFAULT_STATE = {
    gold: 0,
    totalLevel: 0,
    currentTitle: "없음",
    currentJob: "무직",
    unlockedTitles: ["없음"],
    unlockedJobs: ["무직"],
    
    inventory: [], 
    folders: [],   

    cores: {
        STR: { name: "힘 (STR)", level: 0, color: "#FF5C5C" },
        DEX: { name: "솜씨 (DEX)", level: 0, color: "#6BCB77" },
        INT: { name: "지능 (INT)", level: 0, color: "#4D96FF" },
        WIS: { name: "지혜 (WIS)", level: 0, color: "#FFD700" },
        VIT: { name: "체력 (VIT)", level: 0, color: "#FF9F43" }
    },
    
    // [v12.0 New] 유저 행동 통계 (로그 대신 카운트)
    statistics: {
        quest: {
            completed: 0,   // 의뢰 완료 횟수
            nightOwl: 0     // 밤샘(00~06시) 수행 횟수
        },
        battle: {
            totalSeconds: 0 // 누적 수련 시간(초)
        },
        shop: {
            purchases: 0,   // 구매 횟수
            goldSpent: 0    // 쓴 돈
        }
    },

    masteries: {}, 
    skills: {}, 
    quests: {}, 
    shopItems: [
        { id: 'item1', name: "유튜브 30분", cost: 500 },
        { id: 'item2', name: "배달음식", cost: 3000 },
        { id: 'item3', name: "주말 휴식권", cost: 8000 }
    ],
    
    settings: {
        theme: 'dark',
        fontSize: 12
    }
};

export const DataManager = {
    load: () => {
        const json = localStorage.getItem(STORAGE_KEY);
        if(!json) return JSON.parse(JSON.stringify(DEFAULT_STATE));
        
        const data = JSON.parse(json);
        const defaults = DEFAULT_STATE.cores;
        
        // 데이터 마이그레이션
        if (!data.cores) data.cores = {};
        ['STR', 'DEX', 'INT', 'WIS', 'VIT'].forEach(key => {
            if (!data.cores[key]) data.cores[key] = JSON.parse(JSON.stringify(defaults[key]));
        });

        // [v12.0] 통계 데이터 마이그레이션 (기존 유저 대응)
        if (!data.statistics) {
            data.statistics = JSON.parse(JSON.stringify(DEFAULT_STATE.statistics));
        }

        if(!data.quests) data.quests = {};
        if(!data.shopItems) data.shopItems = DEFAULT_STATE.shopItems;
        if(!data.settings) data.settings = { theme: 'dark', fontSize: 12 };
        if(!data.folders) data.folders = [];
        
        if (data.inventory) {
            data.inventory.forEach((item, idx) => {
                if (!item.id) item.id = 'inv_' + Date.now() + '_' + idx;
            });
        }

        return data;
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
        node.download = `LLG_Backup_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(node);
        node.click();
        document.body.removeChild(node);
    }
};
