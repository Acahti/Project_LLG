import { TITLE_DATA, JOB_DATA } from './game_data.js';

export const AchievementManager = {
    checkAll: (state, showToast) => {
        // 안전장치: 데이터가 로드되지 않았다면 중단
        if (!state || !state.cores) return false;

        // 초기화: unlocked 리스트가 없으면 생성
        if (!state.unlockedTitles) state.unlockedTitles = [];
        if (!state.unlockedJobs) state.unlockedJobs = [];

        let changed = false;

        const checkList = (dataList, unlockList, type) => {
            dataList.forEach(item => {
                // 이미 획득했으면 패스
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
                    console.warn(`[Achievement Error] ${item.name} 체크 중 오류:`, e);
                }
            });
        };

        checkList(TITLE_DATA, state.unlockedTitles, 'title');
        checkList(JOB_DATA, state.unlockedJobs, 'job');

        return changed;
    }
};

function checkCondition(cond, state) {
    if (!cond) return true; // 조건 없으면 무조건 통과 (기본값)

    const currentGold = state.gold || 0;
    const stats = state.statistics || {}; // 통계 없으면 빈 객체 취급

    switch (cond.type) {
        // [기본] 누적 레벨
        case 'total_level':
            return (state.totalLevel || 0) >= cond.value;

        // [기본] 골드
        case 'gold':
            return currentGold >= cond.value;

        // [기본] 특정 스탯 단일 수치
        case 'stat_val':
            return (state.cores[cond.key]?.level || 0) >= cond.value;

        // [New] 특정 스탯들의 합계
        case 'stat_sum':
            let sum = 0;
            if (Array.isArray(cond.keys)) {
                cond.keys.forEach(k => sum += (state.cores[k]?.level || 0));
            }
            return sum >= cond.value;

        // [New] 특정 스탯의 상한선 (페널티)
        case 'stat_max':
            return (state.cores[cond.key]?.level || 0) <= cond.value;

        // [기본] 통계 카운트
        case 'stat_count':
            if (!stats[cond.category]) return false;
            return (stats[cond.category][cond.key] || 0) >= cond.value;
        
        // [기본] 통계 카운트 (미만)
        case 'stat_count_less':
            // 통계가 아예 없으면 0이니까 조건(0원 소비 등) 만족으로 간주
            if (!stats[cond.category]) return true;
            return (stats[cond.category][cond.key] || 0) <= cond.value;

        // [기본] 비율
        case 'custom_ratio':
            const cat = stats[cond.category];
            if (!cat || (cat[cond.totalKey] || 0) < cond.min) return false;
            return ((cat[cond.key] || 0) / cat[cond.totalKey]) >= cond.ratio;

        // [기본] 비율 (낮을수록 좋음 - 아침형 인간 등)
        case 'custom_ratio_low':
            const catLow = stats[cond.category];
            if (!catLow || (catLow[cond.totalKey] || 0) < cond.min) return false;
            return ((catLow[cond.key] || 0) / catLow[cond.totalKey]) <= cond.ratio;

        // [기본] 몰빵 (Skew)
        case 'stat_skew':
            if ((state.totalLevel || 0) < cond.minLevel) return false;
            if ((state.cores[cond.main]?.level || 0) < cond.val) return false;
            const others = ['STR', 'DEX', 'INT', 'WIS', 'VIT'].filter(k => k !== cond.main);
            return others.every(k => (state.cores[k]?.level || 0) <= cond.otherMax);

        // [기본] 균형 (Balance)
        case 'stat_balance':
            const values = ['STR', 'DEX', 'INT', 'WIS', 'VIT'].map(k => state.cores[k]?.level || 0);
            const min = Math.min(...values);
            const max = Math.max(...values);
            if (min < cond.val) return false;
            if ((max - min) > cond.gap) return false;
            return true;

        // [New] 수집 개수 (컬렉터용)
        case 'count_unlocked':
            const targetList = cond.target === 'job' ? state.unlockedJobs : state.unlockedTitles;
            return (targetList?.length || 0) >= cond.value;

        default: return false;
    }
}
