// 저장소 키값 (버전 변경 시 키를 바꾸면 초기화된 상태로 시작합니다)
const STORAGE_KEY = 'LLG_DATA_V20_SIMPLE';

// [v20.0] 심플 스타트 기본 상태
// 특징: 예시 데이터 최소화 & 상점 밸런스 (1초=1골드) 적용
const DEFAULT_STATE = {
    // 1. 기본 자산 및 신분
    gold: 0,
    totalLevel: 0,
    currentTitle: "없음",
    currentJob: "무직",
    unlockedTitles: ["없음"],
    unlockedJobs: ["무직"],
    
    // 2. 인벤토리 및 폴더
    inventory: [], 
    folders: [],     
    
    // 3. 상태 관리 변수
    activeStartTime: null, 
    activeQuestId: null,

    // 4. [Core] 핵심 스탯 (5종 형태 유지)
    cores: {
        STR: { name: "힘 (STR)", level: 0, color: "#FF5C5C" },
        DEX: { name: "솜씨 (DEX)", level: 0, color: "#6BCB77" },
        INT: { name: "지능 (INT)", level: 0, color: "#4D96FF" }, // 초기 데이터는 여기에 집중
        WIS: { name: "지혜 (WIS)", level: 0, color: "#FFD700" },
        VIT: { name: "체력 (VIT)", level: 0, color: "#FF9F43" }
    },
    
    // 5. [Mastery] 마스터리 (분야)
    masteries: {
        // [심플] INT 계열의 '언어능력' 하나만 존재
        'm_lang': { name: "언어능력", core: "INT", level: 0 }
    },
    
    // 6. [Skill] 스킬 (세부 능력)
    skills: {
        // [심플] 언어능력 하위의 '문해력' 하나만 존재
        's_literacy': { name: "문해력", mastery: "m_lang", seconds: 0, hidden: false }
    },
    
    // 7. [Quest] 의뢰 (행동)
    quests: {
        // [심플] 문해력을 올리는 '독서하기' 하나만 존재
        'q_read': { name: "독서하기", mainSkillId: "s_literacy", subSkillId: null }
    },
    
    // 8. [Shop] 상점 아이템 (1초 = 1G 밸런스)
    shopItems: [
        { id: 'item1', name: "유튜브 30분", cost: 1800 }, // 30분(1800초) 일해야 30분 놂
        { id: 'item2', name: "배달음식", cost: 3000 },    // 약 50분 독서 후 보상
        { id: 'item3', name: "주말 휴식권", cost: 8000 }  // 약 2시간 15분 독서 후 보상
    ],
    
    // 9. 설정 및 통계
    settings: { theme: 'dark', fontSize: 12 },
    statistics: {
        quest: { completed: 0, nightOwl: 0 },
        battle: { totalSeconds: 0 },
        shop: { purchases: 0, goldSpent: 0 }
    },

    // 10. [필수] 로그 시스템 데이터 (초기값 빈 객체)
    dailyRecords: {}, // 일별 로그 및 통계
    legacySkills: {}  // 삭제된 스킬 명부
};

export const DataManager = {
    KEY: STORAGE_KEY,

    // 데이터 불러오기 (Load)
    load: () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return DataManager.getInitialState();
            
            const data = JSON.parse(raw);
            
            // [Migration] 구버전 데이터 호환성 검사 및 보정
            if (!data.statistics) data.statistics = JSON.parse(JSON.stringify(DEFAULT_STATE.statistics));
            if (!data.cores) data.cores = JSON.parse(JSON.stringify(DEFAULT_STATE.cores));
            if (!data.unlockedTitles) data.unlockedTitles = ["없음"];
            if (!data.unlockedJobs) data.unlockedJobs = ["무직"];
            if (!data.dailyRecords) data.dailyRecords = {};
            if (!data.legacySkills) data.legacySkills = {};
            
            return data;
        } catch (e) {
            console.error("데이터 로드 실패:", e);
            return DataManager.getInitialState();
        }
    },

    // 데이터 저장하기 (Save)
    save: (state) => {
        try {
            if (!state) return;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error("데이터 저장 실패:", e);
        }
    },

    // 데이터 초기화 (Reset)
    reset: () => {
        localStorage.removeItem(STORAGE_KEY);
        // 캐시 무시하고 강제 새로고침
        window.location.reload(true);
    },

    // 파일로 내보내기 (Export)
    export: (state) => {
        const str = JSON.stringify(state, null, 2); // 보기 좋게 들여쓰기 적용
        const blob = new Blob([str], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `LLG_Backup_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    // 초기 상태 반환 (Deep Copy)
    getInitialState: () => {
        return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
};
