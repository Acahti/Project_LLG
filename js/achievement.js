import { TITLE_DATA, JOB_DATA } from './game_data.js';

export const AchievementManager = {
    checkAll: (state, showToast) => {
        if (!state || !state.cores) return false;
        if (!state.unlockedTitles) state.unlockedTitles = [];
        if (!state.unlockedJobs) state.unlockedJobs = [];

        let changed = false;

        const checkList = (dataList, unlockList, type) => {
            if (!Array.isArray(dataList)) return;
            dataList.forEach(item => {
                if (unlockList.includes(item.name)) return;
                try {
                    if (checkCondition(item.condition, state)) {
                        unlockList.push(item.name);
                        const icon = type === 'job' ? '✨' : '🏆';
                        const prefix = type === 'job' ? '직업 전직' : '칭호 획득';
                        showToast(`${icon} ${prefix}: [${item.name}]`);
                        changed = true;
                    }
                } catch (e) {
                    console.warn(`[Check Error] ${item.name}:`, e);
                }
            });
        };

        checkList(TITLE_DATA, state.unlockedTitles, 'title');
        checkList(JOB_DATA, state.unlockedJobs, 'job');

        return changed;
    }
};

function checkCondition(cond, state) {
    if (!cond) return true; 

    // [핵심 수정] 모든 조건에 대해 '최소 레벨'이 설정되어 있다면 우선 검사
    // 레벨 0인 신규 유저가 '거지(골드 100이하)' 등을 획득하는 참사 방지
    const currentLevel = state.totalLevel || 0;
    if (cond.minLevel && currentLevel < cond.minLevel) return false;

    const currentGold = state.gold || 0;
    const stats = state.statistics || {};

    switch (cond.type) {
        case 'total_level': return currentLevel >= cond.value;
        case 'gold': return currentGold >= cond.value;
        
        case 'stat_val':
            if (cond.key === 'gold') return currentGold >= cond.value;
            return (state.cores[cond.key]?.level || 0) >= cond.value;

        case 'stat_sum':
            let sum = 0;
            if (Array.isArray(cond.keys)) cond.keys.forEach(k => sum += (state.cores[k]?.level || 0));
            return sum >= cond.value;

        case 'stat_max': // 페널티 조건 (특정 스탯 이하)
            if (cond.key === 'gold') return currentGold <= cond.value;
            return (state.cores[cond.key]?.level || 0) <= cond.value;

        case 'stat_count':
            if (!stats[cond.category]) return false;
            return (stats[cond.category][cond.key] || 0) >= cond.value;
        
        case 'stat_count_less':
            if (!stats[cond.category]) return true;
            return (stats[cond.category][cond.key] || 0) <= cond.value;

        case 'custom_ratio':
            const cat = stats[cond.category];
            const total = cat ? (cat[cond.totalKey] || 0) : 0;
            if (total === 0) return false;
            if (total < cond.min) return false;
            return ((cat[cond.key] || 0) / total) >= cond.ratio;

        case 'stat_skew':
            // stat_skew는 내부적으로 minLevel을 가지고 있었으나, 
            // 위에서 전역으로 처리했으므로 여기선 값만 비교하면 됨
            if ((state.cores[cond.main]?.level || 0) < cond.val) return false;
            const others = ['STR', 'DEX', 'INT', 'WIS', 'VIT'].filter(k => k !== cond.main);
            return others.every(k => (state.cores[k]?.level || 0) <= cond.otherMax);

        case 'stat_balance':
            const values = ['STR', 'DEX', 'INT', 'WIS', 'VIT'].map(k => state.cores[k]?.level || 0);
            const min = Math.min(...values);
            const max = Math.max(...values);
            if (min < cond.val) return false;
            if ((max - min) > cond.gap) return false;
            return true;

        case 'count_unlocked':
            const targetList = cond.target === 'job' ? state.unlockedJobs : state.unlockedTitles;
            return (targetList?.length || 0) >= cond.value;

        default: return false;
    }
}
