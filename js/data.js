const STORAGE_KEY = 'LLG_DATA_V9_FINAL';

// 초기 데이터
const DEFAULT_STATE = {
    gold: 0,
    totalLevel: 0,
    currentTitle: "모험가",
    currentJob: "무직",
    unlockedTitles: ["모험가"],
    unlockedJobs: ["무직"],
    
    // [v10.9] 보관함 구조 개선
    inventory: [], // { id, type, icon, name, desc, folderId }
    folders: [],   // { id, name, type } (type: 'loot' or 'record')

    // 5대 스탯
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
    ],
    
    settings: {
        theme: 'dark',
        fontSize: 10
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

        if(!data.quests) data.quests = {};
        if(!data.shopItems) data.shopItems = DEFAULT_STATE.shopItems;
        if(!data.settings) data.settings = { theme: 'dark', fontSize: 10 };

        // [v10.9] 폴더 시스템 호환성
        if(!data.folders) data.folders = [];
        if (data.inventory) {
            data.inventory.forEach((item, idx) => {
                if (!item.id) item.id = 'inv_' + Date.now() + '_' + idx;
                // 기존 아이템은 folderId undefined 상태 -> Root로 간주
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
