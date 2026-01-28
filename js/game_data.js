// [v12.0] 게임 데이터 정의 파일 (기획 데이터)
// 조건(condition) 타입 정의:
// - 'stat_val': 5대 스탯 (STR, DEX 등) 확인
// - 'total_level': 총 레벨 확인
// - 'stat_count': 누적 통계치 확인 (statistics 객체)
// - 'skill_level': 특정 스킬의 레벨 확인

export const TITLE_DATA = [
    {
        id: 'title_novice',
        name: '초심자',
        condition: { type: 'total_level', value: 5 },
        desc: '총 레벨 5 달성'
    },
    {
        id: 'title_night_owl',
        name: '밤의 지배자',
        condition: { type: 'stat_count', category: 'quest', key: 'nightOwl', value: 5 },
        desc: '밤(00~06시)에 의뢰 5회 수행'
    },
    {
        id: 'title_rich',
        name: '큰손',
        condition: { type: 'stat_count', category: 'shop', key: 'purchases', value: 10 },
        desc: '상점 이용 10회 달성'
    },
    {
        id: 'title_training_fanatic',
        name: '수련광',
        condition: { type: 'stat_count', category: 'battle', key: 'totalSeconds', value: 3600 },
        desc: '누적 수련 시간 1시간 돌파'
    }
];

export const JOB_DATA = [
    {
        id: 'job_warrior',
        name: '전사',
        condition: { type: 'stat_val', key: 'STR', value: 10 },
        desc: 'STR 10 이상'
    },
    {
        id: 'job_wizard',
        name: '마법사',
        condition: { type: 'stat_val', key: 'INT', value: 10 },
        desc: 'INT 10 이상'
    },
    {
        id: 'job_rogue',
        name: '도적',
        condition: { type: 'stat_val', key: 'DEX', value: 10 },
        desc: 'DEX 10 이상'
    }
];

// 전리품 드랍 테이블 (확률 0.0 ~ 1.0)
export const LOOT_TABLE = [
    {
        id: 'loot_coin',
        name: '오래된 동전',
        icon: 'monetization_on',
        desc: '어디선가 주운 동전',
        dropRate: 0.5, // 50%
        condition: null // 무조건 드랍 가능
    },
    {
        id: 'loot_gem',
        name: '빛나는 파편',
        icon: 'diamond',
        desc: '반짝이는 보석 조각',
        dropRate: 0.1, // 10%
        condition: { type: 'min_time', value: 60 } // 60초 이상 수련 시에만
    }
];
