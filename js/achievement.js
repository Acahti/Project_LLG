import { TITLE_DATA, JOB_DATA } from './game_data.js';

export const AchievementManager = {
    checkAll: (state, showToast) => {
        let changed = false;

        const checkList = (dataList, unlockList, type) => {
            dataList.forEach(item => {
                if (!unlockList.includes(item.name)) {
                    if (checkCondition(item.condition, state)) {
                        unlockList.push(item.name);
                        // 타입에 따라 메시지 다르게
                        const icon = type === 'job' ? '✨' : '🏆';
                        const prefix = type === 'job' ? '직업 전직' : '칭호 획득';
                        showToast(`${icon} ${prefix}: [${item.name}]`);
                        changed = true;
                    }
                }
            });
        };

        checkList(TITLE_DATA, state.unlockedTitles, 'title');
        checkList(JOB_DATA, state.unlockedJobs, 'job');

        return changed;
    }
};

function checkCondition(cond, state) {
    if (!cond) return true; // 기본값
    const currentGold = state.gold || 0;
    const stats = state.statistics;

    switch (cond.type) {
        // [기본] 누적 레벨
        case 'total_level':
            return state.totalLevel >= cond.value;

        // [기본] 특정 스탯 수치
        case 'stat_val':
            if (cond.key === 'gold') return currentGold >= cond.value;
            return state.cores[cond.key].level >= cond.value;

        // [기본] 통계 카운트 (의뢰 횟수 등)
        case 'stat_count':
            if (!stats || !stats[cond.category]) return false;
            return stats[cond.category][cond.key] >= cond.value;
        
        // [New] 특정 통계 '미만' (예: 구두쇠 - 골드는 많은데 쓴 돈이 적음)
        case 'stat_count_less':
            if (!stats || !stats[cond.category]) return true; // 기록 없으면 0이니까 통과
            return stats[cond.category][cond.key] <= cond.value;

        // [기본] 비율 조건
        case 'custom_ratio':
            const cat = stats[cond.category];
            if (!cat || cat[cond.totalKey] < cond.min) return false;
            return (cat[cond.key] / cat[cond.totalKey]) >= cond.ratio;

        // [기본] 스탯 몰빵 (Skew)
        case 'stat_skew':
            if (state.totalLevel < cond.minLevel) return false;
            if (state.cores[cond.main].level < cond.val) return false;
            const others = ['STR', 'DEX', 'INT', 'WIS', 'VIT'].filter(k => k !== cond.main);
            return others.every(k => state.cores[k].level <= cond.otherMax);

        // [New] 스탯 균형 (Balance) - 모든 스탯이 일정 수치 이상 + 편차 적음
        case 'stat_balance':
            const values = ['STR', 'DEX', 'INT', 'WIS', 'VIT'].map(k => state.cores[k].level);
            const min = Math.min(...values);
            const max = Math.max(...values);
            // 1. 모든 스탯이 최소치(val) 이상이어야 함
            if (min < cond.val) return false;
            // 2. 최대와 최소의 차이가 gap 이하여야 함 (균형)
            if ((max - min) > cond.gap) return false;
            return true;

        default:
            return false;
    }
}
