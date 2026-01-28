import { TITLE_DATA, JOB_DATA } from './game_data.js';

export const AchievementManager = {
    // 모든 업적(칭호, 직업) 체크 및 해금 처리
    checkAll: (state, showToast) => {
        let changed = false;

        // 1. 칭호 체크
        TITLE_DATA.forEach(title => {
            if (!state.unlockedTitles.includes(title.name)) {
                if (checkCondition(title.condition, state)) {
                    state.unlockedTitles.push(title.name);
                    showToast(`🎉 칭호 획득: [${title.name}]`);
                    changed = true;
                }
            }
        });

        // 2. 직업 체크
        JOB_DATA.forEach(job => {
            if (!state.unlockedJobs.includes(job.name)) {
                if (checkCondition(job.condition, state)) {
                    state.unlockedJobs.push(job.name);
                    showToast(`✨ 직업 해금: [${job.name}]`);
                    changed = true;
                }
            }
        });

        return changed;
    }
};

// 내부 로직: 조건식 해석기
function checkCondition(cond, state) {
    if (!cond) return true;

    switch (cond.type) {
        case 'total_level':
            return state.totalLevel >= cond.value;

        case 'stat_val': // STR, DEX 등 확인
            return state.cores[cond.key].level >= cond.value;

        case 'stat_count': // statistics 통계 확인
            if (!state.statistics || !state.statistics[cond.category]) return false;
            return state.statistics[cond.category][cond.key] >= cond.value;

        case 'skill_level': // 특정 스킬 레벨 확인
            const skill = Object.values(state.skills).find(s => s.name === cond.skillName);
            return skill && skill.level >= cond.value;

        default:
            return false;
    }
}
