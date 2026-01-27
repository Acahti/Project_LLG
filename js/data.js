const STORAGE_KEY = 'LLG_DATA_V9_ROLLBACK'; 

const DEFAULT_STATE = {
    gold: 0, totalLevel: 0, currentTitle: "모험가", currentJob: "무직",
    unlockedTitles: ["모험가"], unlockedJobs: ["무직"], inventory: [],
    cores: {
        STR: { name: "힘 (STR)", level: 0, color: "#FF5C5C" },
        DEX: { name: "솜씨 (DEX)", level: 0, color: "#6BCB77" },
        INT: { name: "지능 (INT)", level: 0, color: "#4D96FF" },
        WIS: { name: "지혜 (WIS)", level: 0, color: "#FFD700" },
        VIT: { name: "체력 (VIT)", level: 0, color: "#FF9F43" }
    },
    masteries: {}, skills: {}, quests: {}, shopItems: [],
    settings: { theme: 'dark', fontSize: 10 }
};

export const DataManager = {
    load: () => {
        const json = localStorage.getItem(STORAGE_KEY);
        if(!json) return JSON.parse(JSON.stringify(DEFAULT_STATE));
        let data = JSON.parse(json);
        if (!data.cores) data = JSON.parse(JSON.stringify(DEFAULT_STATE)); // 깨진 데이터 방지
        return data;
    },
    save: (state) => localStorage.setItem(STORAGE_KEY, JSON.stringify(state)),
    reset: () => { localStorage.removeItem(STORAGE_KEY); location.reload(); },
    export: (state) => {
        const str = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
        const node = document.createElement('a'); node.href = str;
        node.download = `LLG_Backup.json`; document.body.appendChild(node);
        node.click(); document.body.removeChild(node);
    }
};
