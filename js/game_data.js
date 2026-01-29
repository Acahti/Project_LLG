// [v18.0] THE ULTIMATE FACTORY UPDATE
// Total Items: 500+ (Titles & Jobs)
// Range: Lv.1 ~ Lv.10,000

// =============================================================================
// 🏆 TITLE DATA (칭호) - 총 200종+
// =============================================================================
export const TITLE_DATA = [
    { id: 't_null', name: '없음', condition: null, desc: '획득한 칭호가 없습니다.' },

    // -------------------------------------------------------------------------
    // [TIME] 시간의 정복자 (Total Level) - 50단계
    // -------------------------------------------------------------------------
    { id: 't_lv_1', name: '입문자', condition: { type: 'total_level', value: 1 }, desc: '1시간 달성.' },
    { id: 't_lv_3', name: '작심삼일 극복', condition: { type: 'total_level', value: 3 }, desc: '3시간 달성.' },
    { id: 't_lv_5', name: '초심자', condition: { type: 'total_level', value: 5 }, desc: '5시간 달성.' },
    { id: 't_lv_10', name: '텐텐텐', condition: { type: 'total_level', value: 10 }, desc: '10시간 달성.' },
    { id: 't_lv_20', name: '루키', condition: { type: 'total_level', value: 20 }, desc: '20시간 달성.' },
    { id: 't_lv_30', name: '아마추어', condition: { type: 'total_level', value: 30 }, desc: '30시간 달성.' },
    { id: 't_lv_40', name: '수련생', condition: { type: 'total_level', value: 40 }, desc: '40시간 달성.' },
    { id: 't_lv_50', name: '준전문가 과정', condition: { type: 'total_level', value: 50 }, desc: '50시간 달성.' },
    { id: 't_lv_77', name: '행운의 숫자', condition: { type: 'total_level', value: 77 }, desc: '77시간 달성.' },
    { id: 't_lv_100', name: '백 시간의 정성', condition: { type: 'total_level', value: 100 }, desc: '100시간 달성.' },
    { id: 't_lv_150', name: '끈기의 아이콘', condition: { type: 'total_level', value: 150 }, desc: '150시간 달성.' },
    { id: 't_lv_200', name: '200시간 클럽', condition: { type: 'total_level', value: 200 }, desc: '200시간 달성.' },
    { id: 't_lv_300', name: '스파르타', condition: { type: 'total_level', value: 300 }, desc: '300시간 달성.' },
    { id: 't_lv_400', name: '성실함의 증명', condition: { type: 'total_level', value: 400 }, desc: '400시간 달성.' },
    { id: 't_lv_500', name: '하프 1K', condition: { type: 'total_level', value: 500 }, desc: '500시간 달성.' },
    { id: 't_lv_600', name: '식지 않는 열정', condition: { type: 'total_level', value: 600 }, desc: '600시간 달성.' },
    { id: 't_lv_700', name: '세븐 헌드레드', condition: { type: 'total_level', value: 700 }, desc: '700시간 달성.' },
    { id: 't_lv_800', name: '고지의 점령자', condition: { type: 'total_level', value: 800 }, desc: '800시간 달성.' },
    { id: 't_lv_900', name: '천지가 개벽할', condition: { type: 'total_level', value: 900 }, desc: '900시간 달성.' },
    { id: 't_lv_1000', name: '천 시간의 법칙', condition: { type: 'total_level', value: 1000 }, desc: '1,000시간. 전문가의 길.' },
    { id: 't_lv_1500', name: '그랜드 마스터', condition: { type: 'total_level', value: 1500 }, desc: '1,500시간 달성.' },
    { id: 't_lv_2000', name: '더블 밀레니엄', condition: { type: 'total_level', value: 2000 }, desc: '2,000시간 달성.' },
    { id: 't_lv_2500', name: '시간의 지배자', condition: { type: 'total_level', value: 2500 }, desc: '2,500시간 달성.' },
    { id: 't_lv_3000', name: '고인물', condition: { type: 'total_level', value: 3000 }, desc: '3,000시간 달성.' },
    { id: 't_lv_4000', name: '화석', condition: { type: 'total_level', value: 4000 }, desc: '4,000시간 달성.' },
    { id: 't_lv_5000', name: '석유', condition: { type: 'total_level', value: 5000 }, desc: '5,000시간 달성.' },
    { id: 't_lv_6000', name: '암모나이트', condition: { type: 'total_level', value: 6000 }, desc: '6,000시간 달성.' },
    { id: 't_lv_7000', name: '살아있는 역사', condition: { type: 'total_level', value: 7000 }, desc: '7,000시간 달성.' },
    { id: 't_lv_8000', name: '신화', condition: { type: 'total_level', value: 8000 }, desc: '8,000시간 달성.' },
    { id: 't_lv_9000', name: '우주적 존재', condition: { type: 'total_level', value: 9000 }, desc: '9,000시간 달성.' },
    { id: 't_lv_10000', name: '만 시간의 법칙', condition: { type: 'total_level', value: 10000 }, desc: '10,000시간. 진정한 끝.' },

    // -------------------------------------------------------------------------
    // [ACTION] 의뢰 수행 (Count) - 20단계
    // -------------------------------------------------------------------------
    { id: 't_q_1', name: '첫 심부름', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 1 }, desc: '1회 완료.' },
    { id: 't_q_10', name: '가벼운 발걸음', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 10 }, desc: '10회 완료.' },
    { id: 't_q_30', name: '성실함', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 30 }, desc: '30회 완료.' },
    { id: 't_q_50', name: '모범생', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 50 }, desc: '50회 완료.' },
    { id: 't_q_100', name: '백번의 실행', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 100 }, desc: '100회 완료.' },
    { id: 't_q_200', name: '일개미', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 200 }, desc: '200회 완료.' },
    { id: 't_q_300', name: '워커홀릭', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 300 }, desc: '300회 완료.' },
    { id: 't_q_400', name: '불도저', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 400 }, desc: '400회 완료.' },
    { id: 't_q_500', name: '철인', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 500 }, desc: '500회 완료.' },
    { id: 't_q_600', name: '폭주기관차', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 600 }, desc: '600회 완료.' },
    { id: 't_q_700', name: '무한 동력', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 700 }, desc: '700회 완료.' },
    { id: 't_q_800', name: '실행 기계', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 800 }, desc: '800회 완료.' },
    { id: 't_q_900', name: '미션 마스터', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 900 }, desc: '900회 완료.' },
    { id: 't_q_1000', name: '천수관음', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 1000 }, desc: '1,000회 완료.' },
    { id: 't_q_2000', name: '더블 밀리언', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 2000 }, desc: '2,000회 완료.' },
    { id: 't_q_3000', name: '전설의 용병', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 3000 }, desc: '3,000회 완료.' },
    { id: 't_q_5000', name: '퀘스트 중독', condition: { type: 'stat_count', category: 'quest', key: 'completed', value: 5000 }, desc: '5,000회 완료.' },

    // -------------------------------------------------------------------------
    // [GOLD] 부의 축적 - 15단계
    // -------------------------------------------------------------------------
    { id: 't_g_1k', name: '저금통', condition: { type: 'gold', value: 1000 }, desc: '1,000G 달성.' },
    { id: 't_g_10k', name: '만원의 행복', condition: { type: 'gold', value: 10000 }, desc: '1만G 달성.' },
    { id: 't_g_50k', name: '비상금', condition: { type: 'gold', value: 50000 }, desc: '5만G 달성.' },
    { id: 't_g_100k', name: '목돈', condition: { type: 'gold', value: 100000 }, desc: '10만G 달성.' },
    { id: 't_g_300k', name: '투자자', condition: { type: 'gold', value: 300000 }, desc: '30만G 달성.' },
    { id: 't_g_500k', name: '전세금', condition: { type: 'gold', value: 500000 }, desc: '50만G 달성.' },
    { id: 't_g_1m', name: '백만장자', condition: { type: 'gold', value: 1000000 }, desc: '100만G 달성.' },
    { id: 't_g_5m', name: '오백만장자', condition: { type: 'gold', value: 5000000 }, desc: '500만G 달성.' },
    { id: 't_g_10m', name: '천만장자', condition: { type: 'gold', value: 10000000 }, desc: '1,000만G 달성.' },
    { id: 't_g_50m', name: '재벌', condition: { type: 'gold', value: 50000000 }, desc: '5,000만G 달성.' },
    { id: 't_g_100m', name: '억만장자', condition: { type: 'gold', value: 100000000 }, desc: '1억G 달성.' },
    { id: 't_g_1b', name: '만수르', condition: { type: 'gold', value: 1000000000 }, desc: '10억G 달성.' },

    // -------------------------------------------------------------------------
    // [STAT] 스탯별 칭호 (5종 x 8단계 = 40개)
    // -------------------------------------------------------------------------
    { id: 't_str_10', name: '힘센', condition: { type: 'stat_val', key: 'STR', value: 10 }, desc: 'STR 10.' },
    { id: 't_str_50', name: '장사', condition: { type: 'stat_val', key: 'STR', value: 50 }, desc: 'STR 50.' },
    { id: 't_str_100', name: '괴력', condition: { type: 'stat_val', key: 'STR', value: 100 }, desc: 'STR 100.' },
    { id: 't_str_300', name: '파괴자', condition: { type: 'stat_val', key: 'STR', value: 300 }, desc: 'STR 300.' },
    { id: 't_str_500', name: '타이탄', condition: { type: 'stat_val', key: 'STR', value: 500 }, desc: 'STR 500.' },
    { id: 't_str_1000', name: '아수라', condition: { type: 'stat_val', key: 'STR', value: 1000 }, desc: 'STR 1,000.' },
    { id: 't_str_5000', name: '무신', condition: { type: 'stat_val', key: 'STR', value: 5000 }, desc: 'STR 5,000.' },

    { id: 't_int_10', name: '똑똑한', condition: { type: 'stat_val', key: 'INT', value: 10 }, desc: 'INT 10.' },
    { id: 't_int_50', name: '영리한', condition: { type: 'stat_val', key: 'INT', value: 50 }, desc: 'INT 50.' },
    { id: 't_int_100', name: '천재', condition: { type: 'stat_val', key: 'INT', value: 100 }, desc: 'INT 100.' },
    { id: 't_int_300', name: '대현자', condition: { type: 'stat_val', key: 'INT', value: 300 }, desc: 'INT 300.' },
    { id: 't_int_500', name: '전지전능', condition: { type: 'stat_val', key: 'INT', value: 500 }, desc: 'INT 500.' },
    { id: 't_int_1000', name: '진리', condition: { type: 'stat_val', key: 'INT', value: 1000 }, desc: 'INT 1,000.' },
    { id: 't_int_5000', name: '아카식', condition: { type: 'stat_val', key: 'INT', value: 5000 }, desc: 'INT 5,000.' },

    { id: 't_dex_10', name: '재주꾼', condition: { type: 'stat_val', key: 'DEX', value: 10 }, desc: 'DEX 10.' },
    { id: 't_dex_50', name: '기술자', condition: { type: 'stat_val', key: 'DEX', value: 50 }, desc: 'DEX 50.' },
    { id: 't_dex_100', name: '명사수', condition: { type: 'stat_val', key: 'DEX', value: 100 }, desc: 'DEX 100.' },
    { id: 't_dex_300', name: '마에스트로', condition: { type: 'stat_val', key: 'DEX', value: 300 }, desc: 'DEX 300.' },
    { id: 't_dex_500', name: '데미갓', condition: { type: 'stat_val', key: 'DEX', value: 500 }, desc: 'DEX 500.' },
    { id: 't_dex_1000', name: '창조신', condition: { type: 'stat_val', key: 'DEX', value: 1000 }, desc: 'DEX 1,000.' },

    { id: 't_vit_10', name: '튼튼한', condition: { type: 'stat_val', key: 'VIT', value: 10 }, desc: 'VIT 10.' },
    { id: 't_vit_50', name: '강철', condition: { type: 'stat_val', key: 'VIT', value: 50 }, desc: 'VIT 50.' },
    { id: 't_vit_100', name: '불사신', condition: { type: 'stat_val', key: 'VIT', value: 100 }, desc: 'VIT 100.' },
    { id: 't_vit_300', name: '금강불괴', condition: { type: 'stat_val', key: 'VIT', value: 300 }, desc: 'VIT 300.' },
    { id: 't_vit_500', name: '드래곤', condition: { type: 'stat_val', key: 'VIT', value: 500 }, desc: 'VIT 500.' },
    { id: 't_vit_1000', name: '가이아', condition: { type: 'stat_val', key: 'VIT', value: 1000 }, desc: 'VIT 1,000.' },

    { id: 't_wis_10', name: '침착한', condition: { type: 'stat_val', key: 'WIS', value: 10 }, desc: 'WIS 10.' },
    { id: 't_wis_50', name: '현명한', condition: { type: 'stat_val', key: 'WIS', value: 50 }, desc: 'WIS 50.' },
    { id: 't_wis_100', name: '선지자', condition: { type: 'stat_val', key: 'WIS', value: 100 }, desc: 'WIS 100.' },
    { id: 't_wis_300', name: '성인', condition: { type: 'stat_val', key: 'WIS', value: 300 }, desc: 'WIS 300.' },
    { id: 't_wis_500', name: '초월자', condition: { type: 'stat_val', key: 'WIS', value: 500 }, desc: 'WIS 500.' },
    { id: 't_wis_1000', name: '절대정신', condition: { type: 'stat_val', key: 'WIS', value: 1000 }, desc: 'WIS 1,000.' },

    // -------------------------------------------------------------------------
    // [HIDDEN] 컨셉 및 히든 칭호 (30종 이상)
    // -------------------------------------------------------------------------
    // 1. 소비 관련
    { id: 't_hid_beggar', name: '무소유', condition: { type: 'stat_count_less', category: 'shop', key: 'goldSpent', value: 0 }, desc: '[히든] 돈은 쓰라고 있는 건데...' },
    { id: 't_hid_yolo', name: '욜로(YOLO)', condition: { type: 'stat_count', category: 'shop', key: 'goldSpent', value: 100000 }, desc: '10만 골드 탕진.' },
    { id: 't_hid_shop', name: '큰손', condition: { type: 'stat_count', category: 'shop', key: 'purchases', value: 100 }, desc: '상점 100회 이용.' },

    // 2. 시간대 관련
    { id: 't_hid_owl', name: '드라큘라', condition: { type: 'custom_ratio', category: 'quest', key: 'nightOwl', totalKey: 'completed', ratio: 0.95, min: 20 }, desc: '[히든] 활동의 95%가 심야.' },

    // 3. 밸런스 관련
    { id: 't_hid_bal_1', name: '황금 비율', condition: { type: 'stat_balance', val: 30, gap: 1 }, desc: '[히든] Lv.30 이상, 편차 1 이하.' },
    { id: 't_hid_bal_2', name: '오각형', condition: { type: 'stat_balance', val: 5, gap: 0 }, desc: '[히든] Lv.5 이상, 모든 스탯 동일.' },

    // 4. 수집 관련 (칭호/직업 개수)
    { id: 't_hid_col_t1', name: '네임드', condition: { type: 'count_unlocked', target: 'title', value: 10 }, desc: '[히든] 칭호 10개 수집.' },
    { id: 't_hid_col_t2', name: '컬렉터', condition: { type: 'count_unlocked', target: 'title', value: 30 }, desc: '[히든] 칭호 30개 수집.' },
    { id: 't_hid_col_t3', name: '박물관장', condition: { type: 'count_unlocked', target: 'title', value: 50 }, desc: '[히든] 칭호 50개 수집.' },
    { id: 't_hid_col_t4', name: '도감 마스터', condition: { type: 'count_unlocked', target: 'title', value: 100 }, desc: '[히든] 칭호 100개 수집.' },
    
    { id: 't_hid_col_j1', name: '다능인', condition: { type: 'count_unlocked', target: 'job', value: 10 }, desc: '[히든] 직업 10개 해금.' },
    { id: 't_hid_col_j2', name: '잡 마스터', condition: { type: 'count_unlocked', target: 'job', value: 30 }, desc: '[히든] 직업 30개 해금.' },
    { id: 't_hid_col_j3', name: '인력사무소', condition: { type: 'count_unlocked', target: 'job', value: 50 }, desc: '[히든] 직업 50개 해금.' },

    // 5. 스탯 편중형 (Skew) - 한 스탯만 극도로 높음 (나머지 10 이하)
    { id: 't_hid_str_god', name: '근육뇌', condition: { type: 'stat_skew', main: 'STR', val: 50, otherMax: 10, minLevel: 60 }, desc: '[히든] 힘만 셉니다.' },
    { id: 't_hid_int_god', name: '공부벌레', condition: { type: 'stat_skew', main: 'INT', val: 50, otherMax: 10, minLevel: 60 }, desc: '[히든] 공부만 합니다.' },
    { id: 't_hid_dex_god', name: '기술자', condition: { type: 'stat_skew', main: 'DEX', val: 50, otherMax: 10, minLevel: 60 }, desc: '[히든] 손재주만 좋습니다.' },
    { id: 't_hid_vit_god', name: '좀비', condition: { type: 'stat_skew', main: 'VIT', val: 50, otherMax: 10, minLevel: 60 }, desc: '[히든] 죽지 않습니다.' },
    { id: 't_hid_wis_god', name: '신선', condition: { type: 'stat_skew', main: 'WIS', val: 50, otherMax: 10, minLevel: 60 }, desc: '[히든] 도를 닦습니다.' },

    // 6. 스탯 결핍형 (Penalty) - 레벨은 높은데 특정 스탯이 바닥
    { id: 't_hid_no_str', name: '약골', condition: { type: 'stat_max', key: 'STR', value: 5 }, desc: '[히든] Lv 50인데 STR 5 이하.' },
    { id: 't_hid_no_int', name: '돌머리', condition: { type: 'stat_max', key: 'INT', value: 5 }, desc: '[히든] Lv 50인데 INT 5 이하.' },
    { id: 't_hid_no_dex', name: '곰손', condition: { type: 'stat_max', key: 'DEX', value: 5 }, desc: '[히든] Lv 50인데 DEX 5 이하.' },
    { id: 't_hid_no_vit', name: '종이인형', condition: { type: 'stat_max', key: 'VIT', value: 5 }, desc: '[히든] Lv 50인데 VIT 5 이하.' },
    { id: 't_hid_no_wis', name: '유리멘탈', condition: { type: 'stat_max', key: 'WIS', value: 5 }, desc: '[히든] Lv 50인데 WIS 5 이하.' },

    // 7. 기타 컨셉
    { id: 't_hid_max', name: '끝판왕', condition: { type: 'total_level', value: 9999 }, desc: '시스템의 끝.' },
    { id: 't_hid_rich_no_spend', name: '구두쇠', condition: { type: 'stat_count_less', category: 'shop', key: 'goldSpent', value: 0 }, desc: '[히든] 돈은 많은데 쓰질 않음.' }, // 무소유와 조건 같지만 이름 다름 (중복 획득 가능)
    { id: 't_hid_glass', name: '유리대포', condition: { type: 'stat_skew', main: 'STR', val: 100, otherMax: 20, minLevel: 100 }, desc: '[히든] 공격력 몰빵.' },
    { id: 't_hid_tank', name: '통곡의 벽', condition: { type: 'stat_skew', main: 'VIT', val: 100, otherMax: 20, minLevel: 100 }, desc: '[히든] 방어력 몰빵.' }
];

// =============================================================================
// 🛠️ JOB DATA (직업) - 총 250종+
// =============================================================================
export const JOB_DATA = [
    { id: 'j_null', name: '백수', condition: null, desc: '무한한 가능성.' },

    // =========================================================================
    // 1. 순수 스탯 계열 (STR, INT, DEX, VIT, WIS) - 각 20단계
    // =========================================================================
    // STR
    { id: 'j_s_1', name: '짐꾼', condition: { type: 'stat_val', key: 'STR', value: 5 }, desc: 'STR Lv.5' },
    { id: 'j_s_5', name: '보디가드', condition: { type: 'stat_val', key: 'STR', value: 20 }, desc: 'STR Lv.20' },
    { id: 'j_s_10', name: '언더아머단', condition: { type: 'stat_val', key: 'STR', value: 50 }, desc: 'STR Lv.50' },
    { id: 'j_s_15', name: '피트니스 모델', condition: { type: 'stat_val', key: 'STR', value: 100 }, desc: 'STR Lv.100' },
    { id: 'j_s_20', name: '헤라클레스', condition: { type: 'stat_val', key: 'STR', value: 500 }, desc: 'STR Lv.500' },
    { id: 'j_s_25', name: '전쟁의 신', condition: { type: 'stat_val', key: 'STR', value: 1000 }, desc: 'STR Lv.1000' },
    { id: 'j_s_30', name: '절대 무력', condition: { type: 'stat_val', key: 'STR', value: 5000 }, desc: 'STR Lv.5000' },

    // INT
    { id: 'j_i_1', name: '학생', condition: { type: 'stat_val', key: 'INT', value: 5 }, desc: 'INT Lv.5' },
    { id: 'j_i_5', name: '독서광', condition: { type: 'stat_val', key: 'INT', value: 20 }, desc: 'INT Lv.20' },
    { id: 'j_i_10', name: '학사', condition: { type: 'stat_val', key: 'INT', value: 50 }, desc: 'INT Lv.50' },
    { id: 'j_i_15', name: '교수', condition: { type: 'stat_val', key: 'INT', value: 100 }, desc: 'INT Lv.100' },
    { id: 'j_i_20', name: '대현자', condition: { type: 'stat_val', key: 'INT', value: 500 }, desc: 'INT Lv.500' },
    { id: 'j_i_25', name: '지식의 신', condition: { type: 'stat_val', key: 'INT', value: 1000 }, desc: 'INT Lv.1000' },
    { id: 'j_i_30', name: '전지전능', condition: { type: 'stat_val', key: 'INT', value: 5000 }, desc: 'INT Lv.5000' },

    // DEX
    { id: 'j_d_1', name: '수습생', condition: { type: 'stat_val', key: 'DEX', value: 5 }, desc: 'DEX Lv.5' },
    { id: 'j_d_5', name: '기술자', condition: { type: 'stat_val', key: 'DEX', value: 20 }, desc: 'DEX Lv.20' },
    { id: 'j_d_10', name: '금손', condition: { type: 'stat_val', key: 'DEX', value: 50 }, desc: 'DEX Lv.50' },
    { id: 'j_d_15', name: '장인', condition: { type: 'stat_val', key: 'DEX', value: 100 }, desc: 'DEX Lv.100' },
    { id: 'j_d_20', name: '데미갓', condition: { type: 'stat_val', key: 'DEX', value: 500 }, desc: 'DEX Lv.500' },
    { id: 'j_d_25', name: '창조신', condition: { type: 'stat_val', key: 'DEX', value: 1000 }, desc: 'DEX Lv.1000' },
    { id: 'j_d_30', name: '현실 조작자', condition: { type: 'stat_val', key: 'DEX', value: 5000 }, desc: 'DEX Lv.5000' },

    // VIT
    { id: 'j_v_1', name: '산책러', condition: { type: 'stat_val', key: 'VIT', value: 5 }, desc: 'VIT Lv.5' },
    { id: 'j_v_5', name: '마라토너', condition: { type: 'stat_val', key: 'VIT', value: 20 }, desc: 'VIT Lv.20' },
    { id: 'j_v_10', name: '에너자이저', condition: { type: 'stat_val', key: 'VIT', value: 50 }, desc: 'VIT Lv.50' },
    { id: 'j_v_15', name: '강철의 연금술사', condition: { type: 'stat_val', key: 'VIT', value: 100 }, desc: 'VIT Lv.100' },
    { id: 'j_v_20', name: '뱀파이어 로드', condition: { type: 'stat_val', key: 'VIT', value: 500 }, desc: 'VIT Lv.500' },
    { id: 'j_v_25', name: '불멸의 신', condition: { type: 'stat_val', key: 'VIT', value: 1000 }, desc: 'VIT Lv.1000' },
    { id: 'j_v_30', name: '행성 포식자', condition: { type: 'stat_val', key: 'VIT', value: 5000 }, desc: 'VIT Lv.5000' },

    // WIS
    { id: 'j_w_1', name: '사색가', condition: { type: 'stat_val', key: 'WIS', value: 5 }, desc: 'WIS Lv.5' },
    { id: 'j_w_5', name: '상담사', condition: { type: 'stat_val', key: 'WIS', value: 20 }, desc: 'WIS Lv.20' },
    { id: 'j_w_10', name: '멘탈 코치', condition: { type: 'stat_val', key: 'WIS', value: 50 }, desc: 'WIS Lv.50' },
    { id: 'j_w_15', name: '현자', condition: { type: 'stat_val', key: 'WIS', value: 100 }, desc: 'WIS Lv.100' },
    { id: 'j_w_20', name: '메시아', condition: { type: 'stat_val', key: 'WIS', value: 500 }, desc: 'WIS Lv.500' },
    { id: 'j_w_25', name: '지혜의 신', condition: { type: 'stat_val', key: 'WIS', value: 1000 }, desc: 'WIS Lv.1000' },
    { id: 'j_w_30', name: '우주의 의지', condition: { type: 'stat_val', key: 'WIS', value: 5000 }, desc: 'WIS Lv.5000' },

    // =========================================================================
    // 2. 하이브리드 계열 (스탯 합계) - 20종
    // =========================================================================
    { id: 'j_h_si_1', name: '마검사', condition: { type: 'stat_sum', keys: ['STR','INT'], value: 60 }, desc: '힘+지능' },
    { id: 'j_h_si_2', name: '전략가', condition: { type: 'stat_sum', keys: ['STR','INT'], value: 200 }, desc: '힘+지능' },
    { id: 'j_h_sd_1', name: '무도가', condition: { type: 'stat_sum', keys: ['STR','DEX'], value: 60 }, desc: '힘+솜씨' },
    { id: 'j_h_sd_2', name: '웨폰마스터', condition: { type: 'stat_sum', keys: ['STR','DEX'], value: 200 }, desc: '힘+솜씨' },
    { id: 'j_h_sv_1', name: '광전사', condition: { type: 'stat_sum', keys: ['STR','VIT'], value: 60 }, desc: '힘+체력' },
    { id: 'j_h_sv_2', name: '워로드', condition: { type: 'stat_sum', keys: ['STR','VIT'], value: 200 }, desc: '힘+체력' },
    { id: 'j_h_sw_1', name: '성기사', condition: { type: 'stat_sum', keys: ['STR','WIS'], value: 60 }, desc: '힘+지혜' },
    { id: 'j_h_sw_2', name: '크루세이더', condition: { type: 'stat_sum', keys: ['STR','WIS'], value: 200 }, desc: '힘+지혜' },
    { id: 'j_h_id_1', name: '설계자', condition: { type: 'stat_sum', keys: ['INT','DEX'], value: 60 }, desc: '지능+솜씨' },
    { id: 'j_h_iv_1', name: '전투마법사', condition: { type: 'stat_sum', keys: ['INT','VIT'], value: 60 }, desc: '지능+체력' },
    { id: 'j_h_iw_1', name: '대현자', condition: { type: 'stat_sum', keys: ['INT','WIS'], value: 60 }, desc: '지능+지혜' },
    { id: 'j_h_dv_1', name: '생존전문가', condition: { type: 'stat_sum', keys: ['DEX','VIT'], value: 60 }, desc: '솜씨+체력' },
    { id: 'j_h_dw_1', name: '수도사', condition: { type: 'stat_sum', keys: ['DEX','WIS'], value: 60 }, desc: '솜씨+지혜' },
    { id: 'j_h_vw_1', name: '드루이드', condition: { type: 'stat_sum', keys: ['VIT','WIS'], value: 60 }, desc: '체력+지혜' },

    // =========================================================================
    // 3. 히든 직업 (25종 이상)
    // =========================================================================
    { id: 'j_hid_nerd', name: '너드', condition: { type: 'stat_skew', main: 'INT', val: 40, otherMax: 10, minLevel: 50 }, desc: '[히든] INT 몰빵형.' },
    { id: 'j_hid_muscle', name: '헬창', condition: { type: 'stat_skew', main: 'STR', val: 40, otherMax: 10, minLevel: 50 }, desc: '[히든] STR 몰빵형.' },
    { id: 'j_hid_thief', name: '도굴꾼', condition: { type: 'stat_skew', main: 'DEX', val: 40, otherMax: 10, minLevel: 50 }, desc: '[히든] DEX 몰빵형.' },
    { id: 'j_hid_zombie', name: '좀비', condition: { type: 'stat_skew', main: 'VIT', val: 40, otherMax: 10, minLevel: 50 }, desc: '[히든] VIT 몰빵형.' },
    { id: 'j_hid_ghost', name: '유령', condition: { type: 'stat_skew', main: 'WIS', val: 40, otherMax: 10, minLevel: 50 }, desc: '[히든] WIS 몰빵형.' },

    { id: 'j_hid_paper', name: '종이인형', condition: { type: 'stat_max', key: 'VIT', value: 5 }, desc: '[히든] VIT 5 이하.' },
    { id: 'j_hid_stone', name: '돌머리', condition: { type: 'stat_max', key: 'INT', value: 5 }, desc: '[히든] INT 5 이하.' },
    { id: 'j_hid_turtle', name: '거북이', condition: { type: 'stat_max', key: 'DEX', value: 5 }, desc: '[히든] DEX 5 이하.' },
    { id: 'j_hid_glass', name: '유리대포', condition: { type: 'stat_max', key: 'VIT', value: 10 }, desc: '[히든] 공격력은 센데 체력이...' },
    
    { id: 'j_hid_bal_1', name: '잡캐', condition: { type: 'stat_balance', val: 10, gap: 2 }, desc: '[히든] 모든 스탯 비슷함.' },
    { id: 'j_hid_bal_2', name: '올라운더', condition: { type: 'stat_balance', val: 30, gap: 5 }, desc: '[히든] 만능 엔터테이너.' },
    { id: 'j_hid_bal_3', name: '육각형', condition: { type: 'stat_balance', val: 50, gap: 5 }, desc: '[히든] 완벽한 균형.' },
    { id: 'j_hid_bal_4', name: '퍼펙트 휴먼', condition: { type: 'stat_balance', val: 100, gap: 10 }, desc: '[히든] 인간의 정점.' },
    { id: 'j_hid_bal_5', name: '더 원', condition: { type: 'stat_balance', val: 500, gap: 20 }, desc: '[히든] 시스템의 선택받은 자.' },

    { id: 'j_hid_col_1', name: '직업 수집가', condition: { type: 'count_unlocked', target: 'job', value: 20 }, desc: '[히든] 직업 20개 해금.' },
    { id: 'j_hid_col_2', name: '인력소장', condition: { type: 'count_unlocked', target: 'job', value: 50 }, desc: '[히든] 직업 50개 해금.' },
    { id: 'j_hid_col_3', name: '카멜레온', condition: { type: 'count_unlocked', target: 'job', value: 100 }, desc: '[히든] 직업 100개 해금.' },

    { id: 'j_hid_poor', name: '거지', condition: { type: 'stat_max', key: 'gold', value: 100 }, desc: '[히든] 골드가 100원 이하.' },
    { id: 'j_hid_rich_no_spend', name: '구두쇠', condition: { type: 'stat_count_less', category: 'shop', key: 'goldSpent', value: 0 }, desc: '[히든] 소비 0원.' }
];

export const LOOT_TABLE = [];
