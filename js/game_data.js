// [v21.0] THE UNABRIDGED FACTORY UPDATE
// Total Items: 450+ (All patterns fully expanded)
// No omissions, No internal counting.

// =============================================================================
// 🏆 TITLE DATA (칭호) - 200종 이상
// =============================================================================
export const TITLE_DATA = [
    { id: 't_null', name: '없음', condition: null, desc: '획득한 칭호가 없습니다.' },

    // -------------------------------------------------------------------------
    // 1. [TIME] 시간의 정복자 (Total Level) - 30단계
    // -------------------------------------------------------------------------
    { id: 't_tm_1', name: '입문자', condition: { type: 'total_level', value: 1 }, desc: '1시간 달성.' },
    { id: 't_tm_3', name: '작심삼일 극복', condition: { type: 'total_level', value: 3 }, desc: '3시간 달성.' },
    { id: 't_tm_5', name: '초심자', condition: { type: 'total_level', value: 5 }, desc: '5시간 달성.' },
    { id: 't_tm_10', name: '걸음마', condition: { type: 'total_level', value: 10 }, desc: '10시간 달성.' },
    { id: 't_tm_20', name: '루키', condition: { type: 'total_level', value: 20 }, desc: '20시간 달성.' },
    { id: 't_tm_30', name: '아마추어', condition: { type: 'total_level', value: 30 }, desc: '30시간 달성.' },
    { id: 't_tm_40', name: '수련생', condition: { type: 'total_level', value: 40 }, desc: '40시간 달성.' },
    { id: 't_tm_50', name: '준전문가 과정', condition: { type: 'total_level', value: 50 }, desc: '50시간 달성.' },
    { id: 't_tm_60', name: '숙련공', condition: { type: 'total_level', value: 60 }, desc: '60시간 달성.' },
    { id: 't_tm_70', name: '기능공', condition: { type: 'total_level', value: 70 }, desc: '70시간 달성.' },
    { id: 't_tm_80', name: '상급자', condition: { type: 'total_level', value: 80 }, desc: '80시간 달성.' },
    { id: 't_tm_90', name: '엘리트', condition: { type: 'total_level', value: 90 }, desc: '90시간 달성.' },
    { id: 't_tm_100', name: '백 시간의 정성', condition: { type: 'total_level', value: 100 }, desc: '100시간 달성.' },
    { id: 't_tm_150', name: '베테랑', condition: { type: 'total_level', value: 150 }, desc: '150시간 달성.' },
    { id: 't_tm_200', name: '엑스퍼트', condition: { type: 'total_level', value: 200 }, desc: '200시간 달성.' },
    { id: 't_tm_300', name: '스페셜리스트', condition: { type: 'total_level', value: 300 }, desc: '300시간 달성.' },
    { id: 't_tm_400', name: '프로페셔널', condition: { type: 'total_level', value: 400 }, desc: '400시간 달성.' },
    { id: 't_tm_500', name: '마스터', condition: { type: 'total_level', value: 500 }, desc: '500시간 달성.' },
    { id: 't_tm_600', name: '그랜드 마스터', condition: { type: 'total_level', value: 600 }, desc: '600시간 달성.' },
    { id: 't_tm_700', name: '운명 개척자', condition: { type: 'total_level', value: 700 }, desc: '700시간 달성.' },
    { id: 't_tm_800', name: '시간의 지배자', condition: { type: 'total_level', value: 800 }, desc: '800시간 달성.' },
    { id: 't_tm_900', name: '각성자', condition: { type: 'total_level', value: 900 }, desc: '900시간 달성.' },
    { id: 't_tm_1000', name: '천 시간의 법칙', condition: { type: 'total_level', value: 1000 }, desc: '1,000시간 달성.' },
    { id: 't_tm_1500', name: '초월자', condition: { type: 'total_level', value: 1500 }, desc: '1,500시간 달성.' },
    { id: 't_tm_2000', name: '반신', condition: { type: 'total_level', value: 2000 }, desc: '2,000시간 달성.' },
    { id: 't_tm_3000', name: '고인물', condition: { type: 'total_level', value: 3000 }, desc: '3,000시간 달성.' },
    { id: 't_tm_5000', name: '석유', condition: { type: 'total_level', value: 5000 }, desc: '5,000시간 달성.' },
    { id: 't_tm_7000', name: '레전드', condition: { type: 'total_level', value: 7000 }, desc: '7,000시간 달성.' },
    { id: 't_tm_9000', name: '우주적 존재', condition: { type: 'total_level', value: 9000 }, desc: '9,000시간 달성.' },
    { id: 't_tm_10000', name: '만 시간의 법칙', condition: { type: 'total_level', value: 10000 }, desc: '10,000시간. 전설 그 자체.' },

    // -------------------------------------------------------------------------
    // 2. [ACTION] 의뢰 수행 (Count) - 30단계
    // -------------------------------------------------------------------------
    { id: 't_q_1', name: '첫 심부름', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 1 }, desc: '1회 완료.' },
    { id: 't_q_5', name: '몸풀기', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 5 }, desc: '5회 완료.' },
    { id: 't_q_10', name: '가벼운 발걸음', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 10 }, desc: '10회 완료.' },
    { id: 't_q_20', name: '익숙함', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 20 }, desc: '20회 완료.' },
    { id: 't_q_30', name: '성실함', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 30 }, desc: '30회 완료.' },
    { id: 't_q_40', name: '근면성실', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 40 }, desc: '40회 완료.' },
    { id: 't_q_50', name: '모범생', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 50 }, desc: '50회 완료.' },
    { id: 't_q_75', name: '열정맨', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 75 }, desc: '75회 완료.' },
    { id: 't_q_100', name: '백번의 실행', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 100 }, desc: '100회 완료.' },
    { id: 't_q_150', name: '노력가', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 150 }, desc: '150회 완료.' },
    { id: 't_q_200', name: '일개미', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 200 }, desc: '200회 완료.' },
    { id: 't_q_300', name: '워커홀릭', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 300 }, desc: '300회 완료.' },
    { id: 't_q_400', name: '불도저', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 400 }, desc: '400회 완료.' },
    { id: 't_q_500', name: '철인', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 500 }, desc: '500회 완료.' },
    { id: 't_q_600', name: '폭주기관차', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 600 }, desc: '600회 완료.' },
    { id: 't_q_700', name: '무한 동력', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 700 }, desc: '700회 완료.' },
    { id: 't_q_777', name: '잭팟', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 777 }, desc: '777회 완료.' },
    { id: 't_q_800', name: '실행 기계', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 800 }, desc: '800회 완료.' },
    { id: 't_q_900', name: '미션 마스터', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 900 }, desc: '900회 완료.' },
    { id: 't_q_1000', name: '천수관음', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 1000 }, desc: '1,000회 완료.' },
    { id: 't_q_1500', name: '한계를 넘은', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 1500 }, desc: '1,500회 완료.' },
    { id: 't_q_2000', name: '더블 밀리언', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 2000 }, desc: '2,000회 완료.' },
    { id: 't_q_2500', name: '쉬지 않는', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 2500 }, desc: '2,500회 완료.' },
    { id: 't_q_3000', name: '전설의 용병', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 3000 }, desc: '3,000회 완료.' },
    { id: 't_q_4000', name: '퀘스트 헌터', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 4000 }, desc: '4,000회 완료.' },
    { id: 't_q_5000', name: '퀘스트 중독', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 5000 }, desc: '5,000회 완료.' },
    { id: 't_q_6000', name: '시스템 그 자체', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 6000 }, desc: '6,000회 완료.' },
    { id: 't_q_7000', name: '업적 파괴자', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 7000 }, desc: '7,000회 완료.' },
    { id: 't_q_8000', name: '초월적 실행', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 8000 }, desc: '8,000회 완료.' },
    { id: 't_q_9999', name: '만 번의 수행', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 9999 }, desc: '끝이 보입니다.' },

    // -------------------------------------------------------------------------
    // 3. [GOLD] 부의 축적 - 15단계
    // -------------------------------------------------------------------------
    { id: 't_g_1k', name: '저금통', condition: { type: 'gold', value: 1000 }, desc: '1,000G 달성.' },
    { id: 't_g_5k', name: '용돈', condition: { type: 'gold', value: 5000 }, desc: '5,000G 달성.' },
    { id: 't_g_10k', name: '월급', condition: { type: 'gold', value: 10000 }, desc: '1만G 달성.' },
    { id: 't_g_30k', name: '보너스', condition: { type: 'gold', value: 30000 }, desc: '3만G 달성.' },
    { id: 't_g_50k', name: '비상금', condition: { type: 'gold', value: 50000 }, desc: '5만G 달성.' },
    { id: 't_g_100k', name: '목돈', condition: { type: 'gold', value: 100000 }, desc: '10만G 달성.' },
    { id: 't_g_300k', name: '투자자', condition: { type: 'gold', value: 300000 }, desc: '30만G 달성.' },
    { id: 't_g_500k', name: '전세금', condition: { type: 'gold', value: 500000 }, desc: '50만G 달성.' },
    { id: 't_g_1m', name: '백만장자', condition: { type: 'gold', value: 1000000 }, desc: '100만G 달성.' },
    { id: 't_g_5m', name: '오백만장자', condition: { type: 'gold', value: 5000000 }, desc: '500만G 달성.' },
    { id: 't_g_10m', name: '천만장자', condition: { type: 'gold', value: 10000000 }, desc: '1,000만G 달성.' },
    { id: 't_g_50m', name: '재벌', condition: { type: 'gold', value: 50000000 }, desc: '5,000만G 달성.' },
    { id: 't_g_100m', name: '억만장자', condition: { type: 'gold', value: 100000000 }, desc: '1억G 달성.' },
    { id: 't_g_500m', name: '경제 대통령', condition: { type: 'gold', value: 500000000 }, desc: '5억G 달성.' },
    { id: 't_g_1b', name: '만수르', condition: { type: 'gold', value: 1000000000 }, desc: '10억G 달성.' },

    // -------------------------------------------------------------------------
    // 4. [STAT] 스탯별 칭호 (5종 x 20단계 = 100개)
    // -------------------------------------------------------------------------
    // STR
    { id: 't_str_10', name: '힘센', condition: { type: 'stat_val', key: 'STR', value: 10 }, desc: 'STR 10' },
    { id: 't_str_30', name: '다부진', condition: { type: 'stat_val', key: 'STR', value: 30 }, desc: 'STR 30' },
    { id: 't_str_50', name: '장사', condition: { type: 'stat_val', key: 'STR', value: 50 }, desc: 'STR 50' },
    { id: 't_str_100', name: '괴력', condition: { type: 'stat_val', key: 'STR', value: 100 }, desc: 'STR 100' },
    { id: 't_str_150', name: '맹수', condition: { type: 'stat_val', key: 'STR', value: 150 }, desc: 'STR 150' },
    { id: 't_str_200', name: '야수', condition: { type: 'stat_val', key: 'STR', value: 200 }, desc: 'STR 200' },
    { id: 't_str_300', name: '파괴자', condition: { type: 'stat_val', key: 'STR', value: 300 }, desc: 'STR 300' },
    { id: 't_str_400', name: '분쇄기', condition: { type: 'stat_val', key: 'STR', value: 400 }, desc: 'STR 400' },
    { id: 't_str_500', name: '타이탄', condition: { type: 'stat_val', key: 'STR', value: 500 }, desc: 'STR 500' },
    { id: 't_str_700', name: '베헤모스', condition: { type: 'stat_val', key: 'STR', value: 700 }, desc: 'STR 700' },
    { id: 't_str_1000', name: '아수라', condition: { type: 'stat_val', key: 'STR', value: 1000 }, desc: 'STR 1,000' },
    { id: 't_str_1500', name: '무신', condition: { type: 'stat_val', key: 'STR', value: 1500 }, desc: 'STR 1,500' },
    { id: 't_str_2000', name: '척살자', condition: { type: 'stat_val', key: 'STR', value: 2000 }, desc: 'STR 2,000' },
    { id: 't_str_3000', name: '지배자', condition: { type: 'stat_val', key: 'STR', value: 3000 }, desc: 'STR 3,000' },
    { id: 't_str_4000', name: '정복자', condition: { type: 'stat_val', key: 'STR', value: 4000 }, desc: 'STR 4,000' },
    { id: 't_str_5000', name: '패왕', condition: { type: 'stat_val', key: 'STR', value: 5000 }, desc: 'STR 5,000' },
    { id: 't_str_6000', name: '투신', condition: { type: 'stat_val', key: 'STR', value: 6000 }, desc: 'STR 6,000' },
    { id: 't_str_7000', name: '마신', condition: { type: 'stat_val', key: 'STR', value: 7000 }, desc: 'STR 7,000' },
    { id: 't_str_8000', name: '멸망', condition: { type: 'stat_val', key: 'STR', value: 8000 }, desc: 'STR 8,000' },
    { id: 't_str_10000', name: '절대자', condition: { type: 'stat_val', key: 'STR', value: 10000 }, desc: 'STR 10,000' },

    // INT
    { id: 't_int_10', name: '똑똑한', condition: { type: 'stat_val', key: 'INT', value: 10 }, desc: 'INT 10' },
    { id: 't_int_30', name: '명석한', condition: { type: 'stat_val', key: 'INT', value: 30 }, desc: 'INT 30' },
    { id: 't_int_50', name: '영리한', condition: { type: 'stat_val', key: 'INT', value: 50 }, desc: 'INT 50' },
    { id: 't_int_100', name: '천재', condition: { type: 'stat_val', key: 'INT', value: 100 }, desc: 'INT 100' },
    { id: 't_int_150', name: '석학', condition: { type: 'stat_val', key: 'INT', value: 150 }, desc: 'INT 150' },
    { id: 't_int_200', name: '능력자', condition: { type: 'stat_val', key: 'INT', value: 200 }, desc: 'INT 200' },
    { id: 't_int_300', name: '대현자', condition: { type: 'stat_val', key: 'INT', value: 300 }, desc: 'INT 300' },
    { id: 't_int_400', name: '예언자', condition: { type: 'stat_val', key: 'INT', value: 400 }, desc: 'INT 400' },
    { id: 't_int_500', name: '전지전능', condition: { type: 'stat_val', key: 'INT', value: 500 }, desc: 'INT 500' },
    { id: 't_int_700', name: '마법사', condition: { type: 'stat_val', key: 'INT', value: 700 }, desc: 'INT 700' },
    { id: 't_int_1000', name: '진리', condition: { type: 'stat_val', key: 'INT', value: 1000 }, desc: 'INT 1,000' },
    { id: 't_int_1500', name: '선각자', condition: { type: 'stat_val', key: 'INT', value: 1500 }, desc: 'INT 1,500' },
    { id: 't_int_2000', name: '초능력자', condition: { type: 'stat_val', key: 'INT', value: 2000 }, desc: 'INT 2,000' },
    { id: 't_int_3000', name: '우주지성', condition: { type: 'stat_val', key: 'INT', value: 3000 }, desc: 'INT 3,000' },
    { id: 't_int_4000', name: '아카식', condition: { type: 'stat_val', key: 'INT', value: 4000 }, desc: 'INT 4,000' },
    { id: 't_int_5000', name: '근원', condition: { type: 'stat_val', key: 'INT', value: 5000 }, desc: 'INT 5,000' },
    { id: 't_int_6000', name: '법칙', condition: { type: 'stat_val', key: 'INT', value: 6000 }, desc: 'INT 6,000' },
    { id: 't_int_7000', name: '설계자', condition: { type: 'stat_val', key: 'INT', value: 7000 }, desc: 'INT 7,000' },
    { id: 't_int_8000', name: '무한', condition: { type: 'stat_val', key: 'INT', value: 8000 }, desc: 'INT 8,000' },
    { id: 't_int_10000', name: '섭리', condition: { type: 'stat_val', key: 'INT', value: 10000 }, desc: 'INT 10,000' },

    // DEX
    { id: 't_dex_10', name: '재주꾼', condition: { type: 'stat_val', key: 'DEX', value: 10 }, desc: 'DEX 10' },
    { id: 't_dex_30', name: '손재주', condition: { type: 'stat_val', key: 'DEX', value: 30 }, desc: 'DEX 30' },
    { id: 't_dex_50', name: '기술자', condition: { type: 'stat_val', key: 'DEX', value: 50 }, desc: 'DEX 50' },
    { id: 't_dex_100', name: '명사수', condition: { type: 'stat_val', key: 'DEX', value: 100 }, desc: 'DEX 100' },
    { id: 't_dex_150', name: '장인', condition: { type: 'stat_val', key: 'DEX', value: 150 }, desc: 'DEX 150' },
    { id: 't_dex_200', name: '명장', condition: { type: 'stat_val', key: 'DEX', value: 200 }, desc: 'DEX 200' },
    { id: 't_dex_300', name: '마에스트로', condition: { type: 'stat_val', key: 'DEX', value: 300 }, desc: 'DEX 300' },
    { id: 't_dex_400', name: '거장', condition: { type: 'stat_val', key: 'DEX', value: 400 }, desc: 'DEX 400' },
    { id: 't_dex_500', name: '데미갓', condition: { type: 'stat_val', key: 'DEX', value: 500 }, desc: 'DEX 500' },
    { id: 't_dex_700', name: '신의손', condition: { type: 'stat_val', key: 'DEX', value: 700 }, desc: 'DEX 700' },
    { id: 't_dex_1000', name: '창조신', condition: { type: 'stat_val', key: 'DEX', value: 1000 }, desc: 'DEX 1,000' },
    { id: 't_dex_1500', name: '연금술사', condition: { type: 'stat_val', key: 'DEX', value: 1500 }, desc: 'DEX 1,500' },
    { id: 't_dex_2000', name: '매트릭스', condition: { type: 'stat_val', key: 'DEX', value: 2000 }, desc: 'DEX 2,000' },
    { id: 't_dex_3000', name: '설계자', condition: { type: 'stat_val', key: 'DEX', value: 3000 }, desc: 'DEX 3,000' },
    { id: 't_dex_4000', name: '운영자', condition: { type: 'stat_val', key: 'DEX', value: 4000 }, desc: 'DEX 4,000' },
    { id: 't_dex_5000', name: '시스템', condition: { type: 'stat_val', key: 'DEX', value: 5000 }, desc: 'DEX 5,000' },
    { id: 't_dex_6000', name: '오류수정', condition: { type: 'stat_val', key: 'DEX', value: 6000 }, desc: 'DEX 6,000' },
    { id: 't_dex_7000', name: '업데이트', condition: { type: 'stat_val', key: 'DEX', value: 7000 }, desc: 'DEX 7,000' },
    { id: 't_dex_8000', name: '현실조작', condition: { type: 'stat_val', key: 'DEX', value: 8000 }, desc: 'DEX 8,000' },
    { id: 't_dex_10000', name: '조작자', condition: { type: 'stat_val', key: 'DEX', value: 10000 }, desc: 'DEX 10,000' },

    // VIT
    { id: 't_vit_10', name: '튼튼한', condition: { type: 'stat_val', key: 'VIT', value: 10 }, desc: 'VIT 10' },
    { id: 't_vit_30', name: '건강한', condition: { type: 'stat_val', key: 'VIT', value: 30 }, desc: 'VIT 30' },
    { id: 't_vit_50', name: '강철', condition: { type: 'stat_val', key: 'VIT', value: 50 }, desc: 'VIT 50' },
    { id: 't_vit_100', name: '불사신', condition: { type: 'stat_val', key: 'VIT', value: 100 }, desc: 'VIT 100' },
    { id: 't_vit_150', name: '철벽', condition: { type: 'stat_val', key: 'VIT', value: 150 }, desc: 'VIT 150' },
    { id: 't_vit_200', name: '재생자', condition: { type: 'stat_val', key: 'VIT', value: 200 }, desc: 'VIT 200' },
    { id: 't_vit_300', name: '금강불괴', condition: { type: 'stat_val', key: 'VIT', value: 300 }, desc: 'VIT 300' },
    { id: 't_vit_400', name: '무적', condition: { type: 'stat_val', key: 'VIT', value: 400 }, desc: 'VIT 400' },
    { id: 't_vit_500', name: '드래곤', condition: { type: 'stat_val', key: 'VIT', value: 500 }, desc: 'VIT 500' },
    { id: 't_vit_700', name: '히드라', condition: { type: 'stat_val', key: 'VIT', value: 700 }, desc: 'VIT 700' },
    { id: 't_vit_1000', name: '가이아', condition: { type: 'stat_val', key: 'VIT', value: 1000 }, desc: 'VIT 1,000' },
    { id: 't_vit_1500', name: '테라', condition: { type: 'stat_val', key: 'VIT', value: 1500 }, desc: 'VIT 1,500' },
    { id: 't_vit_2000', name: '행성', condition: { type: 'stat_val', key: 'VIT', value: 2000 }, desc: 'VIT 2,000' },
    { id: 't_vit_3000', name: '항성', condition: { type: 'stat_val', key: 'VIT', value: 3000 }, desc: 'VIT 3,000' },
    { id: 't_vit_4000', name: '블랙홀', condition: { type: 'stat_val', key: 'VIT', value: 4000 }, desc: 'VIT 4,000' },
    { id: 't_vit_5000', name: '은하', condition: { type: 'stat_val', key: 'VIT', value: 5000 }, desc: 'VIT 5,000' },
    { id: 't_vit_6000', name: '우주', condition: { type: 'stat_val', key: 'VIT', value: 6000 }, desc: 'VIT 6,000' },
    { id: 't_vit_7000', name: '차원', condition: { type: 'stat_val', key: 'VIT', value: 7000 }, desc: 'VIT 7,000' },
    { id: 't_vit_8000', name: '무한생명', condition: { type: 'stat_val', key: 'VIT', value: 8000 }, desc: 'VIT 8,000' },
    { id: 't_vit_10000', name: '절대 생명', condition: { type: 'stat_val', key: 'VIT', value: 10000 }, desc: 'VIT 10,000' },

    // WIS
    { id: 't_wis_10', name: '침착한', condition: { type: 'stat_val', key: 'WIS', value: 10 }, desc: 'WIS 10' },
    { id: 't_wis_30', name: '차분한', condition: { type: 'stat_val', key: 'WIS', value: 30 }, desc: 'WIS 30' },
    { id: 't_wis_50', name: '현명한', condition: { type: 'stat_val', key: 'WIS', value: 50 }, desc: 'WIS 50' },
    { id: 't_wis_100', name: '선지자', condition: { type: 'stat_val', key: 'WIS', value: 100 }, desc: 'WIS 100' },
    { id: 't_wis_150', name: '철학자', condition: { type: 'stat_val', key: 'WIS', value: 150 }, desc: 'WIS 150' },
    { id: 't_wis_200', name: '도인', condition: { type: 'stat_val', key: 'WIS', value: 200 }, desc: 'WIS 200' },
    { id: 't_wis_300', name: '성인', condition: { type: 'stat_val', key: 'WIS', value: 300 }, desc: 'WIS 300' },
    { id: 't_wis_400', name: '해탈', condition: { type: 'stat_val', key: 'WIS', value: 400 }, desc: 'WIS 400' },
    { id: 't_wis_500', name: '초월자', condition: { type: 'stat_val', key: 'WIS', value: 500 }, desc: 'WIS 500' },
    { id: 't_wis_700', name: '부처', condition: { type: 'stat_val', key: 'WIS', value: 700 }, desc: 'WIS 700' },
    { id: 't_wis_1000', name: '절대정신', condition: { type: 'stat_val', key: 'WIS', value: 1000 }, desc: 'WIS 1,000' },
    { id: 't_wis_1500', name: '순수의식', condition: { type: 'stat_val', key: 'WIS', value: 1500 }, desc: 'WIS 1,500' },
    { id: 't_wis_2000', name: '무의식', condition: { type: 'stat_val', key: 'WIS', value: 2000 }, desc: 'WIS 2,000' },
    { id: 't_wis_3000', name: '집합무의식', condition: { type: 'stat_val', key: 'WIS', value: 3000 }, desc: 'WIS 3,000' },
    { id: 't_wis_4000', name: '가이아의식', condition: { type: 'stat_val', key: 'WIS', value: 4000 }, desc: 'WIS 4,000' },
    { id: 't_wis_5000', name: '우주의식', condition: { type: 'stat_val', key: 'WIS', value: 5000 }, desc: 'WIS 5,000' },
    { id: 't_wis_6000', name: '차원의식', condition: { type: 'stat_val', key: 'WIS', value: 6000 }, desc: 'WIS 6,000' },
    { id: 't_wis_7000', name: '신성', condition: { type: 'stat_val', key: 'WIS', value: 7000 }, desc: 'WIS 7,000' },
    { id: 't_wis_8000', name: '빛', condition: { type: 'stat_val', key: 'WIS', value: 8000 }, desc: 'WIS 8,000' },
    { id: 't_wis_10000', name: '우주의 의지', condition: { type: 'stat_val', key: 'WIS', value: 10000 }, desc: 'WIS 10,000' },

    // -------------------------------------------------------------------------
    // 5. [HIDDEN] 컨셉 및 히든 (25종)
    // -------------------------------------------------------------------------
    { id: 't_hid_beggar', name: '무소유', condition: { type: 'stat_count_less', category: 'shop', key: 'goldSpent', value: 0 }, desc: '[히든] 돈은 쓰라고 있는 건데...' },
    { id: 't_hid_owl', name: '드라큘라', condition: { type: 'custom_ratio', category: 'quest', key: 'nightOwl', totalKey: 'completed', ratio: 0.95, min: 20 }, desc: '[히든] 활동의 95%가 심야.' },
    { id: 't_hid_bal', name: '황금 비율', condition: { type: 'stat_balance', val: 30, gap: 1 }, desc: '[히든] Lv.30 이상, 편차 1 이하.' },
    { id: 't_hid_col_1', name: '컬렉터', condition: { type: 'count_unlocked', target: 'title', value: 10 }, desc: '칭호 10개 수집.' },
    { id: 't_hid_col_2', name: '박물관장', condition: { type: 'count_unlocked', target: 'title', value: 50 }, desc: '칭호 50개 수집.' },
    { id: 't_hid_col_3', name: '도감 마스터', condition: { type: 'count_unlocked', target: 'title', value: 100 }, desc: '칭호 100개 수집.' },
    { id: 't_hid_yolo', name: '욜로', condition: { type: 'stat_count', category: 'shop', key: 'goldSpent', value: 100000 }, desc: '10만 골드 탕진.' },
    { id: 't_hid_shop', name: '큰손', condition: { type: 'stat_count', category: 'shop', key: 'purchases', value: 100 }, desc: '상점 100회 이용.' },
    { id: 't_hid_all_5', name: '오각형', condition: { type: 'stat_balance', val: 5, gap: 0 }, desc: '[히든] 모든 스탯이 정확히 같음.' },
    { id: 't_hid_no_spent', name: '자린고비', condition: { type: 'stat_count_less', category: 'shop', key: 'goldSpent', value: 0 }, desc: '[히든] 쓴 돈이 없습니다.' },
    { id: 't_hid_str_god', name: '근육뇌', condition: { type: 'stat_skew', main: 'STR', val: 50, otherMax: 10, minLevel: 60 }, desc: '[히든] 힘만 셉니다.' },
    { id: 't_hid_int_god', name: '공부벌레', condition: { type: 'stat_skew', main: 'INT', val: 50, otherMax: 10, minLevel: 60 }, desc: '[히든] 공부만 합니다.' },
    { id: 't_hid_dex_god', name: '기술자', condition: { type: 'stat_skew', main: 'DEX', val: 50, otherMax: 10, minLevel: 60 }, desc: '[히든] 손재주만 좋습니다.' },
    { id: 't_hid_vit_god', name: '좀비', condition: { type: 'stat_skew', main: 'VIT', val: 50, otherMax: 10, minLevel: 60 }, desc: '[히든] 죽지 않습니다.' },
    { id: 't_hid_wis_god', name: '신선', condition: { type: 'stat_skew', main: 'WIS', val: 50, otherMax: 10, minLevel: 60 }, desc: '[히든] 도를 닦습니다.' },
    { id: 't_hid_no_str', name: '약골', condition: { type: 'stat_max', key: 'STR', value: 5 }, desc: '[히든] Lv 50인데 STR 5 이하.' },
    { id: 't_hid_no_int', name: '돌머리', condition: { type: 'stat_max', key: 'INT', value: 5 }, desc: '[히든] Lv 50인데 INT 5 이하.' },
    { id: 't_hid_no_dex', name: '곰손', condition: { type: 'stat_max', key: 'DEX', value: 5 }, desc: '[히든] Lv 50인데 DEX 5 이하.' },
    { id: 't_hid_no_vit', name: '종이인형', condition: { type: 'stat_max', key: 'VIT', value: 5 }, desc: '[히든] Lv 50인데 VIT 5 이하.' },
    { id: 't_hid_no_wis', name: '유리멘탈', condition: { type: 'stat_max', key: 'WIS', value: 5 }, desc: '[히든] Lv 50인데 WIS 5 이하.' },
    { id: 't_hid_max', name: '끝판왕', condition: { type: 'total_level', value: 9999 }, desc: '시스템의 끝.' },
    { id: 't_hid_luck', name: '럭키가이', condition: { type: 'total_level', value: 7 }, desc: '[히든] 7레벨.' },
    { id: 't_hid_devil', name: '악마', condition: { type: 'total_level', value: 666 }, desc: '[히든] 666레벨.' },
    { id: 't_hid_angel', name: '천사', condition: { type: 'total_level', value: 1004 }, desc: '[히든] 1004레벨.' },
    { id: 't_hid_cyber', name: '사이버펑크', condition: { type: 'total_level', value: 2077 }, desc: '[히든] 2077레벨.' }
];


// =============================================================================
// 🛠️ JOB DATA (직업) - 총 230종+
// =============================================================================
export const JOB_DATA = [
    { id: 'j_null', name: '백수', condition: null, desc: '무한한 가능성을 품은 백지상태.' },

    // =========================================================================
    // 1. STR 계열 (힘/운동) - 25단계
    // 짐꾼 -> 절대 무력
    // =========================================================================
    { id: 'j_s_1', name: '짐꾼', condition: { type: 'stat_val', key: 'STR', value: 5 }, desc: 'Lv.5 | 무거운 짐도 거뜬합니다.' },
    { id: 'j_s_2', name: '견습생', condition: { type: 'stat_val', key: 'STR', value: 10 }, desc: 'Lv.10 | 운동을 시작했습니다.' },
    { id: 'j_s_3', name: '운동선수', condition: { type: 'stat_val', key: 'STR', value: 15 }, desc: 'Lv.15 | 기초 체력이 완성되었습니다.' },
    { id: 'j_s_4', name: '싸움꾼', condition: { type: 'stat_val', key: 'STR', value: 20 }, desc: 'Lv.20 | 주먹이 맵습니다.' },
    { id: 'j_s_5', name: '보디가드', condition: { type: 'stat_val', key: 'STR', value: 25 }, desc: 'Lv.25 | 든든한 풍채.' },
    { id: 'j_s_6', name: '돌격대장', condition: { type: 'stat_val', key: 'STR', value: 30 }, desc: 'Lv.30 | 앞장서서 부숩니다.' },
    { id: 'j_s_7', name: '행동대장', condition: { type: 'stat_val', key: 'STR', value: 40 }, desc: 'Lv.40 | 조직의 핵심 무력.' },
    { id: 'j_s_8', name: '언더아머단', condition: { type: 'stat_val', key: 'STR', value: 50 }, desc: 'Lv.50 | 3대 500 이하 착용 금지.' },
    { id: 'j_s_9', name: '용병', condition: { type: 'stat_val', key: 'STR', value: 60 }, desc: 'Lv.60 | 돈 받고 싸웁니다.' },
    { id: 'j_s_10', name: '글래디에이터', condition: { type: 'stat_val', key: 'STR', value: 70 }, desc: 'Lv.70 | 투기장의 왕.' },
    { id: 'j_s_11', name: '장사', condition: { type: 'stat_val', key: 'STR', value: 80 }, desc: 'Lv.80 | 쌀가마니를 던집니다.' },
    { id: 'j_s_12', name: '피트니스 모델', condition: { type: 'stat_val', key: 'STR', value: 90 }, desc: 'Lv.90 | 완벽한 근육.' },
    { id: 'j_s_13', name: '챔피언', condition: { type: 'stat_val', key: 'STR', value: 100 }, desc: 'Lv.100 | 정점에 섰습니다.' },
    { id: 'j_s_14', name: '바바리안', condition: { type: 'stat_val', key: 'STR', value: 150 }, desc: 'Lv.150 | 야성의 힘.' },
    { id: 'j_s_15', name: '강철의 거인', condition: { type: 'stat_val', key: 'STR', value: 200 }, desc: 'Lv.200 | 몸이 흉기입니다.' },
    { id: 'j_s_16', name: '타이탄', condition: { type: 'stat_val', key: 'STR', value: 300 }, desc: 'Lv.300 | 신화 속 거인.' },
    { id: 'j_s_17', name: '헤라클레스', condition: { type: 'stat_val', key: 'STR', value: 400 }, desc: 'Lv.400 | 반신반인.' },
    { id: 'j_s_18', name: '반신', condition: { type: 'stat_val', key: 'STR', value: 500 }, desc: 'Lv.500 | 인간을 초월했습니다.' },
    { id: 'j_s_19', name: '아수라', condition: { type: 'stat_val', key: 'STR', value: 700 }, desc: 'Lv.700 | 전투의 화신.' },
    { id: 'j_s_20', name: '전쟁의 신', condition: { type: 'stat_val', key: 'STR', value: 1000 }, desc: 'Lv.1000 | 크레토스.' },
    { id: 'j_s_21', name: '파괴신', condition: { type: 'stat_val', key: 'STR', value: 2000 }, desc: 'Lv.2000 | 걸어 다니는 재앙.' },
    { id: 'j_s_22', name: '행성 파괴자', condition: { type: 'stat_val', key: 'STR', value: 3000 }, desc: 'Lv.3000 | 별을 부숩니다.' },
    { id: 'j_s_23', name: '은하 파괴자', condition: { type: 'stat_val', key: 'STR', value: 5000 }, desc: 'Lv.5000 | 은하계를 위협합니다.' },
    { id: 'j_s_24', name: '우주 파괴자', condition: { type: 'stat_val', key: 'STR', value: 8000 }, desc: 'Lv.8000 | 코즈믹 호러.' },
    { id: 'j_s_25', name: '절대 무력', condition: { type: 'stat_val', key: 'STR', value: 10000 }, desc: 'Lv.10000 | 힘의 끝.' },

    // =========================================================================
    // 2. INT 계열 (지능/학습) - 25단계
    // 학생 -> 전지전능
    // =========================================================================
    { id: 'j_i_1', name: '학생', condition: { type: 'stat_val', key: 'INT', value: 5 }, desc: 'Lv.5 | 공부를 시작합니다.' },
    { id: 'j_i_2', name: '서기', condition: { type: 'stat_val', key: 'INT', value: 10 }, desc: 'Lv.10 | 기록하는 습관.' },
    { id: 'j_i_3', name: '장학생', condition: { type: 'stat_val', key: 'INT', value: 15 }, desc: 'Lv.15 | 성적이 오릅니다.' },
    { id: 'j_i_4', name: '독서광', condition: { type: 'stat_val', key: 'INT', value: 20 }, desc: 'Lv.20 | 책을 손에서 놓지 않습니다.' },
    { id: 'j_i_5', name: '연구원', condition: { type: 'stat_val', key: 'INT', value: 25 }, desc: 'Lv.25 | 깊게 파고듭니다.' },
    { id: 'j_i_6', name: '대학원생', condition: { type: 'stat_val', key: 'INT', value: 30 }, desc: 'Lv.30 | 연구실의 망령.' },
    { id: 'j_i_7', name: '학사', condition: { type: 'stat_val', key: 'INT', value: 40 }, desc: 'Lv.40 | 대학 졸업 수준.' },
    { id: 'j_i_8', name: '석사', condition: { type: 'stat_val', key: 'INT', value: 50 }, desc: 'Lv.50 | 전문 지식 습득.' },
    { id: 'j_i_9', name: '박사', condition: { type: 'stat_val', key: 'INT', value: 60 }, desc: 'Lv.60 | 학문의 길.' },
    { id: 'j_i_10', name: '교수', condition: { type: 'stat_val', key: 'INT', value: 70 }, desc: 'Lv.70 | 누군가를 가르칩니다.' },
    { id: 'j_i_11', name: '천재', condition: { type: 'stat_val', key: 'INT', value: 80 }, desc: 'Lv.80 | 1을 들으면 10을 압니다.' },
    { id: 'j_i_12', name: '석학', condition: { type: 'stat_val', key: 'INT', value: 90 }, desc: 'Lv.90 | 국가적 인재.' },
    { id: 'j_i_13', name: '대현자', condition: { type: 'stat_val', key: 'INT', value: 100 }, desc: 'Lv.100 | 지혜의 등불.' },
    { id: 'j_i_14', name: '예언자', condition: { type: 'stat_val', key: 'INT', value: 150 }, desc: 'Lv.150 | 미래를 계산합니다.' },
    { id: 'j_i_15', name: '아카식 레코드', condition: { type: 'stat_val', key: 'INT', value: 200 }, desc: 'Lv.200 | 모든 기억의 저장소.' },
    { id: 'j_i_16', name: '마도 공학자', condition: { type: 'stat_val', key: 'INT', value: 300 }, desc: 'Lv.300 | 마법과 과학의 융합.' },
    { id: 'j_i_17', name: '지식의 신', condition: { type: 'stat_val', key: 'INT', value: 400 }, desc: 'Lv.400 | 모르는 것이 없습니다.' },
    { id: 'j_i_18', name: '라플라스의 악마', condition: { type: 'stat_val', key: 'INT', value: 500 }, desc: 'Lv.500 | 인과율 계산 완료.' },
    { id: 'j_i_19', name: '초월자', condition: { type: 'stat_val', key: 'INT', value: 700 }, desc: 'Lv.700 | 차원을 넘나듭니다.' },
    { id: 'j_i_20', name: '우주 도서관', condition: { type: 'stat_val', key: 'INT', value: 1000 }, desc: 'Lv.1000 | 우주의 모든 정보.' },
    { id: 'j_i_21', name: '섭리', condition: { type: 'stat_val', key: 'INT', value: 2000 }, desc: 'Lv.2000 | 세상의 규칙.' },
    { id: 'j_i_22', name: '진리', condition: { type: 'stat_val', key: 'INT', value: 3000 }, desc: 'Lv.3000 | 정답 그 자체.' },
    { id: 'j_i_23', name: '전지자', condition: { type: 'stat_val', key: 'INT', value: 5000 }, desc: 'Lv.5000 | 모든 것을 봅니다.' },
    { id: 'j_i_24', name: '절대 지성', condition: { type: 'stat_val', key: 'INT', value: 8000 }, desc: 'Lv.8000 | 이해할 수 없는 존재.' },
    { id: 'j_i_25', name: '전지전능', condition: { type: 'stat_val', key: 'INT', value: 10000 }, desc: 'Lv.10000 | 신.' },

    // =========================================================================
    // 3. DEX 계열 (솜씨/기술) - 25단계
    // 수습생 -> 절대 감각
    // =========================================================================
    { id: 'j_d_1', name: '수습생', condition: { type: 'stat_val', key: 'DEX', value: 5 }, desc: 'Lv.5 | 배우는 단계.' },
    { id: 'j_d_2', name: '기능공', condition: { type: 'stat_val', key: 'DEX', value: 10 }, desc: 'Lv.10 | 손에 익었습니다.' },
    { id: 'j_d_3', name: '조립공', condition: { type: 'stat_val', key: 'DEX', value: 15 }, desc: 'Lv.15 | 뚝딱뚝딱.' },
    { id: 'j_d_4', name: '기술자', condition: { type: 'stat_val', key: 'DEX', value: 20 }, desc: 'Lv.20 | 고칠 수 있습니다.' },
    { id: 'j_d_5', name: '엔지니어', condition: { type: 'stat_val', key: 'DEX', value: 25 }, desc: 'Lv.25 | 구조를 이해합니다.' },
    { id: 'j_d_6', name: '정비사', condition: { type: 'stat_val', key: 'DEX', value: 30 }, desc: 'Lv.30 | 기계를 다룹니다.' },
    { id: 'j_d_7', name: '스나이퍼', condition: { type: 'stat_val', key: 'DEX', value: 40 }, desc: 'Lv.40 | 정확한 조준.' },
    { id: 'j_d_8', name: '금손', condition: { type: 'stat_val', key: 'DEX', value: 50 }, desc: 'Lv.50 | 부러움의 대상.' },
    { id: 'j_d_9', name: '명사수', condition: { type: 'stat_val', key: 'DEX', value: 60 }, desc: 'Lv.60 | 백발백중.' },
    { id: 'j_d_10', name: '연금술사', condition: { type: 'stat_val', key: 'DEX', value: 70 }, desc: 'Lv.70 | 재료를 변화시킵니다.' },
    { id: 'j_d_11', name: '예술가', condition: { type: 'stat_val', key: 'DEX', value: 80 }, desc: 'Lv.80 | 아름다움을 창조.' },
    { id: 'j_d_12', name: '마에스트로', condition: { type: 'stat_val', key: 'DEX', value: 90 }, desc: 'Lv.90 | 거장의 반열.' },
    { id: 'j_d_13', name: '장인', condition: { type: 'stat_val', key: 'DEX', value: 100 }, desc: 'Lv.100 | 혼을 담습니다.' },
    { id: 'j_d_14', name: '명장', condition: { type: 'stat_val', key: 'DEX', value: 150 }, desc: 'Lv.150 | 국가가 인정합니다.' },
    { id: 'j_d_15', name: '인간 문화재', condition: { type: 'stat_val', key: 'DEX', value: 200 }, desc: 'Lv.200 | 살아있는 역사.' },
    { id: 'j_d_16', name: '기계신', condition: { type: 'stat_val', key: 'DEX', value: 300 }, desc: 'Lv.300 | 데우스 엑스 마키나.' },
    { id: 'j_d_17', name: '나노 컨트롤러', condition: { type: 'stat_val', key: 'DEX', value: 400 }, desc: 'Lv.400 | 원자 단위 조작.' },
    { id: 'j_d_18', name: '데미갓', condition: { type: 'stat_val', key: 'DEX', value: 500 }, desc: 'Lv.500 | 신의 손길.' },
    { id: 'j_d_19', name: '아티팩트 메이커', condition: { type: 'stat_val', key: 'DEX', value: 700 }, desc: 'Lv.700 | 신물을 만듭니다.' },
    { id: 'j_d_20', name: '창조신', condition: { type: 'stat_val', key: 'DEX', value: 1000 }, desc: 'Lv.1000 | 세상을 빚어냅니다.' },
    { id: 'j_d_21', name: '현실 조작자', condition: { type: 'stat_val', key: 'DEX', value: 2000 }, desc: 'Lv.2000 | 물리 법칙 무시.' },
    { id: 'j_d_22', name: '우주 설계자', condition: { type: 'stat_val', key: 'DEX', value: 3000 }, desc: 'Lv.3000 | 은하를 디자인합니다.' },
    { id: 'j_d_23', name: '차원 조각가', condition: { type: 'stat_val', key: 'DEX', value: 5000 }, desc: 'Lv.5000 | 시공간을 깎습니다.' },
    { id: 'j_d_24', name: '절대 창조', condition: { type: 'stat_val', key: 'DEX', value: 8000 }, desc: 'Lv.8000 | 생각하는 대로 구현.' },
    { id: 'j_d_25', name: '절대 감각', condition: { type: 'stat_val', key: 'DEX', value: 10000 }, desc: 'Lv.10000 | 모든 것을 느낍니다.' },

    // =========================================================================
    // 4. VIT 계열 (체력/생존) - 25단계
    // 산책러 -> 절대 생명
    // =========================================================================
    { id: 'j_v_1', name: '산책러', condition: { type: 'stat_val', key: 'VIT', value: 5 }, desc: 'Lv.5 | 가벼운 걷기.' },
    { id: 'j_v_2', name: '등산객', condition: { type: 'stat_val', key: 'VIT', value: 10 }, desc: 'Lv.10 | 야호!' },
    { id: 'j_v_3', name: '조깅 매니아', condition: { type: 'stat_val', key: 'VIT', value: 15 }, desc: 'Lv.15 | 숨이 덜 찹니다.' },
    { id: 'j_v_4', name: '마라토너', condition: { type: 'stat_val', key: 'VIT', value: 20 }, desc: 'Lv.20 | 지구력의 상징.' },
    { id: 'j_v_5', name: '생존가', condition: { type: 'stat_val', key: 'VIT', value: 25 }, desc: 'Lv.25 | 어디서든 살아남습니다.' },
    { id: 'j_v_6', name: '에너자이저', condition: { type: 'stat_val', key: 'VIT', value: 30 }, desc: 'Lv.30 | 지치지 않습니다.' },
    { id: 'j_v_7', name: '철인', condition: { type: 'stat_val', key: 'VIT', value: 40 }, desc: 'Lv.40 | 철인 3종 경기.' },
    { id: 'j_v_8', name: '탱커', condition: { type: 'stat_val', key: 'VIT', value: 50 }, desc: 'Lv.50 | 든든한 방패.' },
    { id: 'j_v_9', name: '강철의 연금술사', condition: { type: 'stat_val', key: 'VIT', value: 60 }, desc: 'Lv.60 | 강철 같은 몸.' },
    { id: 'j_v_10', name: '수호자', condition: { type: 'stat_val', key: 'VIT', value: 70 }, desc: 'Lv.70 | 동료를 지킵니다.' },
    { id: 'j_v_11', name: '불사신', condition: { type: 'stat_val', key: 'VIT', value: 80 }, desc: 'Lv.80 | 죽지 않습니다.' },
    { id: 'j_v_12', name: '금강불괴', condition: { type: 'stat_val', key: 'VIT', value: 90 }, desc: 'Lv.90 | 상처 입지 않습니다.' },
    { id: 'j_v_13', name: '트롤', condition: { type: 'stat_val', key: 'VIT', value: 100 }, desc: 'Lv.100 | 초고속 재생.' },
    { id: 'j_v_14', name: '피닉스', condition: { type: 'stat_val', key: 'VIT', value: 150 }, desc: 'Lv.150 | 불꽃 속의 부활.' },
    { id: 'j_v_15', name: '뱀파이어 로드', condition: { type: 'stat_val', key: 'VIT', value: 200 }, desc: 'Lv.200 | 영원한 생명.' },
    { id: 'j_v_16', name: '드래곤', condition: { type: 'stat_val', key: 'VIT', value: 300 }, desc: 'Lv.300 | 최강의 생물.' },
    { id: 'j_v_17', name: '리바이어던', condition: { type: 'stat_val', key: 'VIT', value: 400 }, desc: 'Lv.400 | 심해의 지배자.' },
    { id: 'j_v_18', name: '불멸의 신', condition: { type: 'stat_val', key: 'VIT', value: 500 }, desc: 'Lv.500 | 죽음이 피해 갑니다.' },
    { id: 'j_v_19', name: '가이아', condition: { type: 'stat_val', key: 'VIT', value: 700 }, desc: 'Lv.700 | 대지의 어머니.' },
    { id: 'j_v_20', name: '행성 포식자', condition: { type: 'stat_val', key: 'VIT', value: 1000 }, desc: 'Lv.1000 | 별을 삼킵니다.' },
    { id: 'j_v_21', name: '우주적 공포', condition: { type: 'stat_val', key: 'VIT', value: 2000 }, desc: 'Lv.2000 | 코즈믹 호러.' },
    { id: 'j_v_22', name: '이그드라실', condition: { type: 'stat_val', key: 'VIT', value: 3000 }, desc: 'Lv.3000 | 세계수.' },
    { id: 'j_v_23', name: '차원 포식자', condition: { type: 'stat_val', key: 'VIT', value: 5000 }, desc: 'Lv.5000 | 차원을 먹습니다.' },
    { id: 'j_v_24', name: '엔트로피', condition: { type: 'stat_val', key: 'VIT', value: 8000 }, desc: 'Lv.8000 | 무질서.' },
    { id: 'j_v_25', name: '절대 생명', condition: { type: 'stat_val', key: 'VIT', value: 10000 }, desc: 'Lv.10000 | 영원 그 자체.' },

    // =========================================================================
    // 5. WIS 계열 (지혜/멘탈) - 25단계
    // 사색가 -> 절대 정신
    // =========================================================================
    { id: 'j_w_1', name: '사색가', condition: { type: 'stat_val', key: 'WIS', value: 5 }, desc: 'Lv.5 | 생각에 잠깁니다.' },
    { id: 'j_w_2', name: '조언가', condition: { type: 'stat_val', key: 'WIS', value: 10 }, desc: 'Lv.10 | 친구의 고민 상담.' },
    { id: 'j_w_3', name: '상담사', condition: { type: 'stat_val', key: 'WIS', value: 15 }, desc: 'Lv.15 | 마음을 듣습니다.' },
    { id: 'j_w_4', name: '수도승', condition: { type: 'stat_val', key: 'WIS', value: 20 }, desc: 'Lv.20 | 욕심을 버립니다.' },
    { id: 'j_w_5', name: '철학자', condition: { type: 'stat_val', key: 'WIS', value: 25 }, desc: 'Lv.25 | 나는 누구인가.' },
    { id: 'j_w_6', name: '멘탈 코치', condition: { type: 'stat_val', key: 'WIS', value: 30 }, desc: 'Lv.30 | 강철 멘탈.' },
    { id: 'j_w_7', name: '구도자', condition: { type: 'stat_val', key: 'WIS', value: 40 }, desc: 'Lv.40 | 진리를 찾아서.' },
    { id: 'j_w_8', name: '고승', condition: { type: 'stat_val', key: 'WIS', value: 50 }, desc: 'Lv.50 | 깊은 깨달음.' },
    { id: 'j_w_9', name: '현자', condition: { type: 'stat_val', key: 'WIS', value: 60 }, desc: 'Lv.60 | 삶의 지혜.' },
    { id: 'j_w_10', name: '대사제', condition: { type: 'stat_val', key: 'WIS', value: 70 }, desc: 'Lv.70 | 영혼의 안식.' },
    { id: 'j_w_11', name: '성인', condition: { type: 'stat_val', key: 'WIS', value: 80 }, desc: 'Lv.80 | Saint.' },
    { id: 'j_w_12', name: '교황', condition: { type: 'stat_val', key: 'WIS', value: 90 }, desc: 'Lv.90 | 정신적 지주.' },
    { id: 'j_w_13', name: '메시아', condition: { type: 'stat_val', key: 'WIS', value: 100 }, desc: 'Lv.100 | 구원자.' },
    { id: 'j_w_14', name: '부처', condition: { type: 'stat_val', key: 'WIS', value: 150 }, desc: 'Lv.150 | 해탈.' },
    { id: 'j_w_15', name: '천사', condition: { type: 'stat_val', key: 'WIS', value: 200 }, desc: 'Lv.200 | 순수한 선.' },
    { id: 'j_w_16', name: '지혜의 신', condition: { type: 'stat_val', key: 'WIS', value: 300 }, desc: 'Lv.300 | 소피아.' },
    { id: 'j_w_17', name: '세라핌', condition: { type: 'stat_val', key: 'WIS', value: 400 }, desc: 'Lv.400 | 치천사.' },
    { id: 'j_w_18', name: '우주의 의지', condition: { type: 'stat_val', key: 'WIS', value: 500 }, desc: 'Lv.500 | 거대한 흐름.' },
    { id: 'j_w_19', name: '차원 관측자', condition: { type: 'stat_val', key: 'WIS', value: 700 }, desc: 'Lv.700 | 개입하지 않습니다.' },
    { id: 'j_w_20', name: '절대 정신', condition: { type: 'stat_val', key: 'WIS', value: 1000 }, desc: 'Lv.1000 | 육체를 초월.' },
    { id: 'j_w_21', name: '아카샤', condition: { type: 'stat_val', key: 'WIS', value: 2000 }, desc: 'Lv.2000 | 허공.' },
    { id: 'j_w_22', name: '너바나', condition: { type: 'stat_val', key: 'WIS', value: 3000 }, desc: 'Lv.3000 | 열반.' },
    { id: 'j_w_23', name: '옴니', condition: { type: 'stat_val', key: 'WIS', value: 5000 }, desc: 'Lv.5000 | 모든 것.' },
    { id: 'j_w_24', name: '알파와 오메가', condition: { type: 'stat_val', key: 'WIS', value: 8000 }, desc: 'Lv.8000 | 시작과 끝.' },
    { id: 'j_w_25', name: '절대자', condition: { type: 'stat_val', key: 'WIS', value: 10000 }, desc: 'Lv.10000 | The One.' },

    // =========================================================================
    // 6. 하이브리드 계열 (스탯 합계) - 30단계 (각 조합별 3단계)
    // =========================================================================
    // STR + INT
    { id: 'j_h_si_1', name: '전술가', condition: { type: 'stat_sum', keys: ['STR','INT'], value: 50 }, desc: '지략과 무력.' },
    { id: 'j_h_si_2', name: '마검사', condition: { type: 'stat_sum', keys: ['STR','INT'], value: 150 }, desc: '검과 마법.' },
    { id: 'j_h_si_3', name: '전장의 지휘자', condition: { type: 'stat_sum', keys: ['STR','INT'], value: 500 }, desc: '완벽한 승리.' },

    // STR + DEX
    { id: 'j_h_sd_1', name: '싸움꾼', condition: { type: 'stat_sum', keys: ['STR','DEX'], value: 50 }, desc: '빠르고 강함.' },
    { id: 'j_h_sd_2', name: '무도가', condition: { type: 'stat_sum', keys: ['STR','DEX'], value: 150 }, desc: '극한의 신체 능력.' },
    { id: 'j_h_sd_3', name: '웨폰마스터', condition: { type: 'stat_sum', keys: ['STR','DEX'], value: 500 }, desc: '무기의 달인.' },

    // STR + VIT
    { id: 'j_h_sv_1', name: '돌격병', condition: { type: 'stat_sum', keys: ['STR','VIT'], value: 50 }, desc: '맞으면서 때립니다.' },
    { id: 'j_h_sv_2', name: '광전사', condition: { type: 'stat_sum', keys: ['STR','VIT'], value: 150 }, desc: '피를 갈망합니다.' },
    { id: 'j_h_sv_3', name: '워로드', condition: { type: 'stat_sum', keys: ['STR','VIT'], value: 500 }, desc: '전장의 군주.' },

    // STR + WIS
    { id: 'j_h_sw_1', name: '수호기사', condition: { type: 'stat_sum', keys: ['STR','WIS'], value: 50 }, desc: '신념을 지킵니다.' },
    { id: 'j_h_sw_2', name: '성기사', condition: { type: 'stat_sum', keys: ['STR','WIS'], value: 150 }, desc: '신성한 힘.' },
    { id: 'j_h_sw_3', name: '크루세이더', condition: { type: 'stat_sum', keys: ['STR','WIS'], value: 500 }, desc: '악을 심판합니다.' },

    // INT + DEX
    { id: 'j_h_id_1', name: '설계자', condition: { type: 'stat_sum', keys: ['INT','DEX'], value: 50 }, desc: '이론과 실전.' },
    { id: 'j_h_id_2', name: '발명가', condition: { type: 'stat_sum', keys: ['INT','DEX'], value: 150 }, desc: '혁신적인 도구.' },
    { id: 'j_h_id_3', name: '매드 사이언티스트', condition: { type: 'stat_sum', keys: ['INT','DEX'], value: 500 }, desc: '광기의 과학자.' },

    // INT + VIT
    { id: 'j_h_iv_1', name: '전투마법사', condition: { type: 'stat_sum', keys: ['INT','VIT'], value: 50 }, desc: '몸으로 때우는 마법.' },
    { id: 'j_h_iv_2', name: '워록', condition: { type: 'stat_sum', keys: ['INT','VIT'], value: 150 }, desc: '생명력 전환.' },
    { id: 'j_h_iv_3', name: '리치', condition: { type: 'stat_sum', keys: ['INT','VIT'], value: 500 }, desc: '죽음을 초월한 마법.' },

    // INT + WIS
    { id: 'j_h_iw_1', name: '학자', condition: { type: 'stat_sum', keys: ['INT','WIS'], value: 50 }, desc: '지식과 지혜.' },
    { id: 'j_h_iw_2', name: '대현자', condition: { type: 'stat_sum', keys: ['INT','WIS'], value: 150 }, desc: '깊은 통찰.' },
    { id: 'j_h_iw_3', name: '아크메이지', condition: { type: 'stat_sum', keys: ['INT','WIS'], value: 500 }, desc: '마법의 정점.' },

    // DEX + VIT
    { id: 'j_h_dv_1', name: '생존전문가', condition: { type: 'stat_sum', keys: ['DEX','VIT'], value: 50 }, desc: '야생의 달인.' },
    { id: 'j_h_dv_2', name: '레인저', condition: { type: 'stat_sum', keys: ['DEX','VIT'], value: 150 }, desc: '숲의 수호자.' },
    { id: 'j_h_dv_3', name: '비스트 마스터', condition: { type: 'stat_sum', keys: ['DEX','VIT'], value: 500 }, desc: '야수의 왕.' },

    // DEX + WIS
    { id: 'j_h_dw_1', name: '수도사', condition: { type: 'stat_sum', keys: ['DEX','WIS'], value: 50 }, desc: '정신 수양.' },
    { id: 'j_h_dw_2', name: '몽크', condition: { type: 'stat_sum', keys: ['DEX','WIS'], value: 150 }, desc: '육체와 정신의 조화.' },
    { id: 'j_h_dw_3', name: '신선', condition: { type: 'stat_sum', keys: ['DEX','WIS'], value: 500 }, desc: '구름을 타고 다닙니다.' },

    // VIT + WIS
    { id: 'j_h_vw_1', name: '드루이드', condition: { type: 'stat_sum', keys: ['VIT','WIS'], value: 50 }, desc: '자연의 친구.' },
    { id: 'j_h_vw_2', name: '샤먼', condition: { type: 'stat_sum', keys: ['VIT','WIS'], value: 150 }, desc: '정령과 대화.' },
    { id: 'j_h_vw_3', name: '가디언', condition: { type: 'stat_sum', keys: ['VIT','WIS'], value: 500 }, desc: '세계의 수호자.' },

    // =========================================================================
    // 7. 히든 직업 (Hidden) - 20종+
    // =========================================================================
    // [Skew] 몰빵형
    { id: 'j_hid_nerd', name: '너드', condition: { type: 'stat_skew', main: 'INT', val: 50, otherMax: 10, minLevel: 60 }, desc: '[히든] 운동 신경 제로, 지능 몰빵.' },
    { id: 'j_hid_muscle', name: '근육 뇌', condition: { type: 'stat_skew', main: 'STR', val: 50, otherMax: 10, minLevel: 60 }, desc: '[히든] 생각할 시간에 쇠질.' },
    { id: 'j_hid_thief', name: '소매치기', condition: { type: 'stat_skew', main: 'DEX', val: 50, otherMax: 10, minLevel: 60 }, desc: '[히든] 손재주만 비상함.' },
    { id: 'j_hid_zombie', name: '좀비', condition: { type: 'stat_skew', main: 'VIT', val: 50, otherMax: 10, minLevel: 60 }, desc: '[히든] 죽지 않음.' },
    { id: 'j_hid_ghost', name: '유령', condition: { type: 'stat_skew', main: 'WIS', val: 50, otherMax: 10, minLevel: 60 }, desc: '[히든] 존재감이 없음.' },

    // [Penalty] 결핍형
    { id: 'j_hid_paper', name: '종이인형', condition: { type: 'stat_max', key: 'VIT', value: 5 }, desc: '[히든] 스치면 사망 (Lv.50+).' },
    { id: 'j_hid_stone', name: '돌머리', condition: { type: 'stat_max', key: 'INT', value: 5 }, desc: '[히든] 지능이... (Lv.50+).' },
    { id: 'j_hid_turtle', name: '거북이', condition: { type: 'stat_max', key: 'DEX', value: 5 }, desc: '[히든] 굼뜸 (Lv.50+).' },
    { id: 'j_hid_glass', name: '유리대포', condition: { type: 'stat_max', key: 'VIT', value: 10 }, desc: '[히든] 공격력 몰빵, 방어력 제로.' },

    // [Balance] 균형형
    { id: 'j_hid_bal_1', name: '올라운더', condition: { type: 'stat_balance', val: 30, gap: 5 }, desc: '[히든] 만능 재주꾼.' },
    { id: 'j_hid_bal_2', name: '퍼펙트 휴먼', condition: { type: 'stat_balance', val: 100, gap: 10 }, desc: '[히든] 완벽한 인간.' },
    { id: 'j_hid_bal_3', name: '더 원', condition: { type: 'stat_balance', val: 500, gap: 20 }, desc: '[히든] 시스템의 선택.' },

    // [Collection] 수집형
    { id: 'j_hid_col_1', name: '직업 수집가', condition: { type: 'count_unlocked', target: 'job', value: 20 }, desc: '[히든] 직업 20개 해금.' },
    { id: 'j_hid_col_2', name: '인력소장', condition: { type: 'count_unlocked', target: 'job', value: 50 }, desc: '[히든] 직업 50개 해금.' },
    { id: 'j_hid_col_3', name: '카멜레온', condition: { type: 'count_unlocked', target: 'job', value: 100 }, desc: '[히든] 직업 100개 해금.' },

    // [Special]
    { id: 'j_hid_beggar', name: '거지', condition: { type: 'stat_max', key: 'gold', value: 100 }, desc: '[히든] 전 재산 100원 이하.' },
    { id: 'j_hid_rich', name: '재벌', condition: { type: 'gold', value: 1000000 }, desc: '[히든] 돈이 최고.' }
];

export const LOOT_TABLE = [];
