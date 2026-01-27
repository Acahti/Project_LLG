import { DataManager, SHOP_ITEMS } from './data.js';
import { BattleManager } from './battle.js';

let state = DataManager.load();
let timer = null;
let sessionSec = 0;
let activeSkillId = null; // 변수명 변경 (activeArtId -> activeSkillId)

// --- 1. 통계 계산 및 UI 갱신 ---
function updateGlobalUI() {
    let totalLv = 0;
    
    // 1. Skill 레벨 계산
    for (let sid in state.skills) {
        // 60초 = 1레벨 (테스트용)
        state.skills[sid].level = Math.floor(state.skills[sid].seconds / 60);
    }
    
    // 2. Mastery & Core 초기화
    for (let mid in state.masteries) state.masteries[mid].level = 0;
    for (let cid in state.cores) state.cores[cid].level = 0;

    // 3. 합산 로직 (Skill -> Mastery -> Core)
    for (let sid in state.skills) {
        const skill = state.skills[sid];
        const mastery = state.masteries[skill.mastery];
        const core = state.cores[mastery.core];
        
        mastery.level += skill.level;
        core.level += skill.level;
    }

    for (let cid in state.cores) totalLv += state.cores[cid].level;
    state.totalLevel = totalLv;

    // 직업 결정
    const int = state.cores.INT.level;
    if (int > 100) state.currentJob = "데이터 연금술사";
    else if (int > 10) state.currentJob = "견습 분석가";
    else state.currentJob = "모험가";

    // 상단바 갱신
    document.getElementById('ui-gold').innerText = `${state.gold} G`;
    document.getElementById('ui-job').innerText = `${state.currentJob} (Lv.${totalLv})`;
}

// --- 2. 탭별 렌더링 ---
function renderCharacter() {
    const box = document.getElementById('stats-container');
    box.innerHTML = '';
    
    for (let cid in state.cores) {
        const core = state.cores[cid];
        if (core.level === 0 && cid !== 'INT') continue;
        
        let html = `<div class="card"><h3>${core.name} : Lv.${core.level}</h3>`;
        
        for (let mid in state.masteries) {
            const mastery = state.masteries[mid];
            if (mastery.core !== cid) continue;
            
            html += `<div style="margin-left:10px; color:#aaa; margin-top:5px;">▼ ${mastery.name} (Lv.${mastery.level})</div>`;
            
            for (let sid in state.skills) {
                const skill = state.skills[sid];
                if (skill.mastery !== mid) continue;
                
                html += `<div style="display:flex; justify-content:space-between; margin-left:20px; font-size:10px; margin-top:3px; color:#fff;">
                            <span>- ${skill.name}</span><span>Lv.${skill.level}</span>
                         </div>`;
            }
        }
        html += `</div>`;
        box.innerHTML += html;
    }
}

function renderQuest() {
    const box = document.getElementById('quest-container');
    box.innerHTML = '';
    
    for (let sid in state.skills) {
        const skill = state.skills[sid];
        const btn = document.createElement('button');
        // 버튼 텍스트 수정
        btn.innerHTML = `${skill.name} <span style="font-size:8px">(Lv.${skill.level})</span>`;
        btn.onclick = () => startBattle(sid);
        
        const card = document.createElement('div');
        card.className = 'card'; // 카드 스타일 적용
        card.style.marginBottom = '10px';
        card.appendChild(btn);
        box.appendChild(card);
    }
}

function renderShop() {
    const box = document.getElementById('shop-container');
    box.innerHTML = '';
    SHOP_ITEMS.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.innerHTML = `<span>${item.name}</span> <button class="btn-shop" style="width:auto; padding:8px 15px;">${item.cost} G</button>`;
        
        div.querySelector('button').onclick = () => {
            if (state.gold >= item.cost) {
                if(confirm(`${item.name} 구매하시겠습니까?`)) {
                    state.gold -= item.cost;
                    DataManager.save(state);
                    updateGlobalUI();
                    renderShop(); // 잔액 갱신을 위해 다시 그림
                }
            } else alert("골드가 부족합니다!");
        };
        box.appendChild(div);
    });
}

// --- 3. 전투 시스템 ---
function startBattle(skillId) {
    activeSkillId = skillId;
    sessionSec = 0;
    switchTab('battle');
    
    document.getElementById('battle-quest-name').innerText = state.skills[skillId].name;
    BattleManager.init(); // Phaser 시작

    timer = setInterval(() => {
        sessionSec++;
        const m = Math.floor(sessionSec / 60).toString().padStart(2, '0');
        const s = (sessionSec % 60).toString().padStart(2, '0');
        document.getElementById('battle-timer').innerText = `00:${m}:${s}`;
        document.getElementById('battle-earning').innerText = `예상: ${sessionSec} G`;
    }, 1000);
}

document.getElementById('btn-stop').onclick = () => {
    // 1. 타이머가 없으면(이미 멈췄으면) 무시
    if (!timer) return;

    // 2. 타이머 및 게임 엔진 종료
    clearInterval(timer);
    timer = null;
    BattleManager.destroy(); // Phaser 종료

    // 3. 보상 지급 및 저장
    state.gold += sessionSec;
    state.skills[activeSkillId].seconds += sessionSec;
    DataManager.save(state);
    
    // 4. 알림 메시지
    alert(`수련 종료! ${sessionSec} 골드를 획득했습니다.`);
    
    // 5. [중요] 전투 화면 UI 깨끗하게 초기화 (0으로 되돌리기)
    sessionSec = 0;
    activeSkillId = null;
    document.getElementById('battle-quest-name').innerText = "-";
    document.getElementById('battle-timer').innerText = "00:00:00";
    document.getElementById('battle-earning').innerText = "보상 대기중...";

    // 6. 전체 UI 갱신 후 '퀘스트' 탭으로 이동
    updateGlobalUI();
    switchTab('quest'); // ★ 전투 화면에서 빠져나와 퀘스트 목록으로 보냄
};

// --- 4. 탭 전환 및 초기화 ---
function switchTab(target) {
    document.querySelectorAll('.tab-screen').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab-${target}`).classList.add('active');
    
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    document.querySelector(`.nav-btn[data-target="${target}"]`)?.classList.add('active');

    if (target === 'character') renderCharacter();
    if (target === 'quest') renderQuest();
    if (target === 'shop') renderShop();
}

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.onclick = () => switchTab(btn.dataset.target);
});

// 백업 기능 연결
document.getElementById('btn-export').onclick = () => DataManager.export(state);
document.getElementById('btn-reset').onclick = () => DataManager.reset();
document.getElementById('btn-import').onclick = () => document.getElementById('file-input').click();
document.getElementById('file-input').onchange = (e) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            state = JSON.parse(e.target.result);
            DataManager.save(state);
            location.reload();
        } catch (err) {
            alert("잘못된 파일 형식입니다.");
        }
    };
    reader.readAsText(e.target.files[0]);
};

// 앱 시작
updateGlobalUI();
renderCharacter();
