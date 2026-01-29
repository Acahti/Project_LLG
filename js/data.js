const STORAGE_KEY = 'LLG_DATA_V12_FINAL';

// [v20.0] 심플 스타트 버전
// 1. 예시 데이터 최소화: INT(지능) - 언어능력 - 문해력 - 독서하기 (단일 루트)
// 2. 상점 밸런스 패치: 유튜브 30분 = 1800 Gold (1초 노동 = 1초 보상, 1:1 비율 적용)
const DEFAULT_STATE = {
    gold: 0,
    totalLevel: 0,
    currentTitle: "없음",
    currentJob: "무직",
    unlockedTitles: ["없음"],
    unlockedJobs: ["무직"],
    
    inventory: [], 
    folders: [],    
    activeStartTime: null, 

    // [1단계] Core: 스탯판은 형태 유지를 위해 5개 다 둡니다. (데이터는 INT만 들어감)
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

    // [2단계] Mastery: 분야
    masteries: {
        // 딱 하나만 남김: INT 계열의 '언어능력'
        'm_lang': { name: "언어능력", core: "INT", level: 0 }
    },
    
    // [3단계] Skill: 세부 능력
    skills: {
        // 딱 하나만 남김: 언어능력 하위의 '문해력'
        's_literacy': { name: "문해력", mastery: "m_lang", seconds: 0, hidden: false }
    },
    
    // [4단계] Quest: 행동
    quests: {
        // 딱 하나만 남김: 문해력을 올리는 '독서하기'
        'q_read': { name: "독서하기", mainSkillId: "s_literacy", subSkillId: null }
    },
    
    // 상점: 1초 = 1골드 가치 반영
    shopItems: [
        { id: 'item1', name: "유튜브 30분", cost: 1800 }, // 30분(1800초) 일해야 30분 놀 수 있음 (1:1)
        { id: 'item2', name: "배달음식", cost: 3000 },    // 약 50분 독서 후 보상
        { id: 'item3', name: "주말 휴식권", cost: 8000 }  // 약 2시간 15분 독서 후 보상
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
        if (!data.unlockedTitles) data.unlockedTitles = ["없음"];
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
