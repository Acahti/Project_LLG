import { TITLE_DATA, JOB_DATA } from './game_data.js';

export const AchievementManager = {
    checkAll: (state, showToast) => {
        // [안전장치 1] 데이터가 로드되지 않았다면 즉시 중단 (멈춤 방지)
        if (!state || !state.cores) return false;

        // [안전장치 2] 배열이 없으면 초기화
        if (!state.unlockedTitles) state.unlockedTitles = [];
        if (!state.unlockedJobs) state.unlockedJobs = [];

        let changed = false;

        // 내부 체크 함수
        const checkList = (dataList, unlockList, type) => {
            // dataList가 제대로 로드되지 않았으면 패스
            if (!Array.isArray(dataList)) return;

            dataList.forEach(item => {
                // 이미 획득한 것은 건너뜀
                if (unlockList.includes(item.name)) return;

                try {
                    // 조건 통과 여부 검사
                    if (checkCondition(item.condition, state)) {
                        unlockList.push(item.name);
                        
                        // 메시지 출력
                        const icon = type === 'job' ? '✨' : '🏆';
                        const prefix = type === 'job' ? '직업 전직' : '칭호 획득';
                        showToast(`${icon} ${prefix}: [${item.name}]`);
                        
                        changed = true;
                    }
                } catch (e) {
                    // 에러가 나도 멈추지 않고 로그만 남김 (앱 먹통 방지)
                    console.warn(`[Achievement Skipped] ${item.name} 조건 체크 중 오류:`, e);
                }
            });
        };

        // 칭호와 직업 리스트 체크 실행
        checkList(TITLE_DATA, state.unlockedTitles, 'title');
        checkList(JOB_DATA, state.unlockedJobs, 'job');

        return changed;
    }
};

// 조건 해석기 (0 처리 및 예외 처리 강화)
function checkCondition(cond, state) {
    if (!cond) return true; // 조건 없으면(기본값) 통과

    const currentGold = state.gold || 0;
    const stats = state.statistics || {}; // 통계가 없으면 빈 객체로 처리

    switch (cond.type) {
        // 1. 누적 레벨
        case 'total_level':
            return (state.totalLevel || 0) >= cond.value;

        // 2. 골드 (보유량)
        case 'gold':
            return currentGold >= cond.value;

        // 3. 특정 스탯 단일 수치
        case 'stat_val':
            // [Fix] 키가 'gold'인 경우 cores가 아니라 state.gold를 확인해야 함
            if (cond.key === 'gold') return currentGold >= cond.value;
            // 그 외(STR, INT 등)는 cores에서 확인
            return (state.cores[cond.key]?.level || 0) >= cond.value;

        // 4. 스탯 합계 (하이브리드용)
        case 'stat_sum':
            let sum = 0;
            if (Array.isArray(cond.keys)) {
                cond.keys.forEach(k => sum += (state.cores[k]?.level || 0));
            }
            return sum >= cond.value;

        // 5. 스탯 상한선 (페널티/히든용)
        case 'stat_max':
            // [Fix] '거지' 칭호 등에서 골드 체크 시 버그 수정
            if (cond.key === 'gold') return currentGold <= cond.value;
            return (state.cores[cond.key]?.level || 0) <= cond.value;

        // 6. 통계 카운트 (이상)
        case 'stat_count':
            if (!stats[cond.category]) return false; // 카테고리 없으면 실패
            return (stats[cond.category][cond.key] || 0) >= cond.value;
        
        // 7. 통계 카운트 (이하 - 구두쇠 등)
        case 'stat_count_less':
            // 데이터가 아예 없으면 0이므로 조건(0 <= value) 만족
            if (!stats[cond.category]) return true;
            return (stats[cond.category][cond.key] || 0) <= cond.value;

        // 8. 비율 (나눗셈 안전장치 추가)
        case 'custom_ratio':
            const cat = stats[cond.category];
            // 분모가 될 값이 없거나 0이면 계산 불가 -> false 반환
            const total = cat ? (cat[cond.totalKey] || 0) : 0;
            
            if (total === 0) return false; // [중요] 0으로 나누기 방지
            if (total < cond.min) return false; // 최소 횟수 미달이면 실패

            return ((cat[cond.key] || 0) / total) >= cond.ratio;

        // 9. 스탯 몰빵 (Skew)
        case 'stat_skew':
            // 총레벨 조건 미달이면 실패
            if ((state.totalLevel || 0) < cond.minLevel) return false;
            // 메인 스탯 조건 미달이면 실패
            if ((state.cores[cond.main]?.level || 0) < cond.val) return false;
            
            // 나머지 스탯들이 otherMax보다 크면 실패
            const others = ['STR', 'DEX', 'INT', 'WIS', 'VIT'].filter(k => k !== cond.main);
            return others.every(k => (state.cores[k]?.level || 0) <= cond.otherMax);

        // 10. 스탯 균형 (Balance)
        case 'stat_balance':
            const values = ['STR', 'DEX', 'INT', 'WIS', 'VIT'].map(k => state.cores[k]?.level || 0);
            const min = Math.min(...values);
            const max = Math.max(...values);
            
            if (min < cond.val) return false; // 최소 조건
            if ((max - min) > cond.gap) return false; // 격차 조건
            return true;

        // 11. 수집 개수 (컬렉터)
        case 'count_unlocked':
            const targetList = cond.target === 'job' ? state.unlockedJobs : state.unlockedTitles;
            return (targetList?.length || 0) >= cond.value;

        default:
            return false;
    }
}
