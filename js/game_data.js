// [v12.1] 게임 데이터 정의 파일 (칭호 20개 & 직업 20개)

export const TITLE_DATA = [
    // --- 초반 구간 (1 ~ 10시간) ---
    { id: 'title_rookie', name: '신입', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 1 }, desc: '첫 의뢰를 완료한 새내기' },
    { id: 'title_beginner', name: '노력하는 모험가', condition: { type: 'total_level', value: 5 }, desc: '5시간의 노력을 쌓은 자' },
    { id: 'title_owl', name: '야행성 부엉이', condition: { type: 'stat_count', category: 'quest', key: 'nightOwl', value: 5 }, desc: '밤의 공기에 익숙해진 자' },
    { id: 'title_spender', name: '쇼핑 입문자', condition: { type: 'stat_count', category: 'shop', key: 'purchases', value: 5 }, desc: '보상의 맛을 알기 시작함' },
    { id: 'title_runner', name: '시간의 여행자', condition: { type: 'stat_count', category: 'battle', key: 'totalSeconds', value: 36000 }, desc: '누적 10시간 수련 달성' },

    // --- 중반 구간 (20 ~ 50시간) ---
    { id: 'title_worker', name: '성실한 일꾼', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 20 }, desc: '의뢰 완료 20회 돌파' },
    { id: 'title_iron', name: '강철의 의지', condition: { type: 'total_level', value: 25 }, desc: '총 레벨 25 달성' },
    { id: 'title_night_watcher', name: '밤의 파수꾼', condition: { type: 'stat_count', category: 'quest', key: 'nightOwl', value: 25 }, desc: '새벽을 지키는 끈기' },
    { id: 'title_vip', name: '상점 VIP', condition: { type: 'stat_count', category: 'shop', key: 'purchases', value: 20 }, desc: '보상 교환 20회 달성' },
    { id: 'title_limit_breaker', name: '한계를 깨는 자', condition: { type: 'stat_val', key: 'VIT', value: 30 }, desc: 'VIT 30 돌파 (강인한 체력)' },

    // --- 후반 구간 (50 ~ 150시간) ---
    { id: 'title_veteran', name: '전설적인 베테랑', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 50 }, desc: '의뢰 완료 50회 돌파' },
    { id: 'title_hero_init', name: '영웅의 탄생', condition: { type: 'total_level', value: 50 }, desc: '총 레벨 50 달성' },
    { id: 'title_gold_hand', name: '황금의 큰손', condition: { type: 'stat_count', category: 'shop', key: 'goldSpent', value: 50000 }, desc: '누적 50,000G 소모' },
    { id: 'title_night_king', name: '심야의 지배자', condition: { type: 'stat_count', category: 'quest', key: 'nightOwl', value: 50 }, desc: '진정한 밤의 주인' },
    { id: 'title_training_maniac', name: '수련 중독자', condition: { type: 'stat_count', category: 'battle', key: 'totalSeconds', value: 360000 }, desc: '누적 100시간 수련 달성' },

    // --- 엔드 콘텐츠 (200시간 이상) ---
    { id: 'title_master', name: '만능의 통달자', condition: { type: 'total_level', value: 100 }, desc: '총 레벨 100 달성' },
    { id: 'title_destiny', name: '운명을 비트는 자', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 100 }, desc: '의뢰 완료 100회 달성' },
    { id: 'title_transcend', name: '고독한 초월자', condition: { type: 'stat_val', key: 'INT', value: 80 }, desc: '지능(INT) 80 돌파' },
    { id: 'title_legend', name: '신화의 주인공', condition: { type: 'total_level', value: 150 }, desc: '총 레벨 150 달성' },
    { id: 'title_llg_god', name: 'LLG의 정점', condition: { type: 'total_level', value: 200 }, desc: '모든 시간을 정복한 자' }
];

export const JOB_DATA = [
    // --- 1단계: 견습 (스탯 5) ---
    { id: 'job_sword_app', name: '견습 검사', condition: { type: 'stat_val', key: 'STR', value: 5 }, desc: '힘의 기초를 닦음' },
    { id: 'job_vit_app', name: '건강 지망생', condition: { type: 'stat_val', key: 'VIT', value: 5 }, desc: '체력의 중요성을 깨달음' },
    { id: 'job_int_app', name: '학도', condition: { type: 'stat_val', key: 'INT', value: 5 }, desc: '지식의 문턱에 섬' },
    { id: 'job_dex_app', name: '심부름꾼', condition: { type: 'stat_val', key: 'DEX', value: 5 }, desc: '기민함의 시작' },
    { id: 'job_wis_app', name: '철학도', condition: { type: 'stat_val', key: 'WIS', value: 5 }, desc: '지혜를 갈구함' },

    // --- 2단계: 정식 (스탯 20) ---
    { id: 'job_warrior', name: '전사', condition: { type: 'stat_val', key: 'STR', value: 20 }, desc: '강인한 근력의 소유자' },
    { id: 'job_tanker', name: '철인', condition: { type: 'stat_val', key: 'VIT', value: 20 }, desc: '지치지 않는 체력' },
    { id: 'job_wizard', name: '연구원', condition: { type: 'stat_val', key: 'INT', value: 20 }, desc: '논리적인 사고의 달인' },
    { id: 'job_archer', name: '궁수', condition: { type: 'stat_val', key: 'DEX', value: 20 }, desc: '정교한 기술의 숙련자' },
    { id: 'job_priest', name: '설법자', condition: { type: 'stat_val', key: 'WIS', value: 20 }, desc: '통찰력 있는 조언자' },

    // --- 3단계: 숙련 (스탯 45) ---
    { id: 'job_knight', name: '기사', condition: { type: 'stat_val', key: 'STR', value: 45 }, desc: '명예와 힘을 겸비한 자' },
    { id: 'job_guardian', name: '금강불괴', condition: { type: 'stat_val', key: 'VIT', value: 45 }, desc: '어떤 고난도 버텨내는 몸' },
    { id: 'job_scholar', name: '학자', condition: { type: 'stat_val', key: 'INT', value: 45 }, desc: '세상의 이치를 탐구함' },
    { id: 'job_assassin', name: '암살자', condition: { type: 'stat_val', key: 'DEX', value: 45 }, desc: '소리 없는 기술의 정점' },
    { id: 'job_bishop', name: '대주교', condition: { type: 'stat_val', key: 'WIS', value: 45 }, desc: '심안을 가진 현자' },

    // --- 4단계: 전설 (스탯 80) ---
    { id: 'job_paladin', name: '성기사', condition: { type: 'stat_val', key: 'STR', value: 80 }, desc: '신성한 힘의 화신' },
    { id: 'job_immortal', name: '불멸자', condition: { type: 'stat_val', key: 'VIT', value: 80 }, desc: '죽음마저 극복한 육체' },
    { id: 'job_sage', name: '대현자', condition: { type: 'stat_val', key: 'INT', value: 80 }, desc: '모든 진리를 깨우친 자' },
    { id: 'job_shadow', name: '쉐도우 마스터', condition: { type: 'stat_val', key: 'DEX', value: 80 }, desc: '형체조차 남기지 않는 속도' },
    { id: 'job_pope', name: '성황', condition: { type: 'stat_val', key: 'WIS', value: 80 }, desc: '신의 목소리를 듣는 자' }
];

export const LOOT_TABLE = [];
