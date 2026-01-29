import { TITLE_DATA, JOB_DATA } from './game_data.js';

export const AchievementManager = {
    checkAll: (state, showToast) => {
        let changed = false;

        const checkList = (dataList, unlockList, type) => {
            dataList.forEach(item => {
                if (!unlockList.includes(item.name)) {
                    if (checkCondition(item.condition, state)) {
                        unlockList.push(item.name);
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
    if (!cond) return true;
    const currentGold = state.gold || 0;
    const stats = state.statistics;

    switch (cond.type) {
        // [기본] 누적 레벨 / 골드
        case 'total_level': return state.totalLevel >= cond.value;
        case 'gold': return currentGold >= cond.value;

        // [기본] 특정 스탯 단일 수치
        case 'stat_val': return state.cores[cond.key].level >= cond.value;

        // [New] 특정 스탯들의 합계 (하이브리드 직업용: 예 STR+INT)
        case 'stat_sum':
            let sum = 0;
            cond.keys.forEach(k => sum += state.cores[k].level);
            return sum >= cond.value;

        // [New] 특정 스탯의 상한선 (페널티 조건: 예 STR 10 미만)
        case 'stat_max':
            return state.cores[cond.key].level <= cond.value;

        // [기본] 통계 카운트
        case 'stat_count':
            if (!stats || !stats[cond.category]) return false;
            return stats[cond.category][cond.key] >= cond.value;
        
        // [기본] 통계 카운트 (미만)
        case 'stat_count_less':
            if (!stats || !stats[cond.category]) return true;
            return stats[cond.category][cond.key] <= cond.value;

        // [기본] 비율
        case 'custom_ratio':
            const cat = stats[cond.category];
            if (!cat || cat[cond.totalKey] < cond.min) return false;
            return (cat[cond.key] / cat[cond.totalKey]) >= cond.ratio;

        // [기본] 몰빵 (Skew)
        case 'stat_skew':
            if (state.totalLevel < cond.minLevel) return false;
            if (state.cores[cond.main].level < cond.val) return false;
            const others = ['STR', 'DEX', 'INT', 'WIS', 'VIT'].filter(k => k !== cond.main);
            return others.every(k => state.cores[k].level <= cond.otherMax);

        // [기본] 균형 (Balance)
        case 'stat_balance':
            const values = ['STR', 'DEX', 'INT', 'WIS', 'VIT'].map(k => state.cores[k].level);
            const min = Math.min(...values);
            const max = Math.max(...values);
            if (min < cond.val) return false;
            if ((max - min) > cond.gap) return false;
            return true;

        // [New] 수집 개수 (컬렉터용)
        case 'count_unlocked':
            const targetList = cond.target === 'job' ? state.unlockedJobs : state.unlockedTitles;
            return targetList.length >= cond.value;

        default: return false;
    }
}
