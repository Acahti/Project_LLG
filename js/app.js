import { DataManager, SHOP_ITEMS } from './data.js';
import { BattleManager } from './battle.js';

let state = DataManager.load();
let timer = null;
let sessionSec = 0;
let activeArtId = null;

// --- 1. 통계 계산 및 UI 갱신 ---
function updateGlobalUI() {
    // 스탯 재계산
    let totalLv = 0;
    
    // Arts -> Mastery -> Core
    for (let aid in state.arts) state.arts[aid].level = Math.floor(state.arts[aid].seconds / 60);
    
    for (let mid in state.masteries) state.masteries[mid].level = 0;
    for (let cid in state.cores) state.cores[cid].level = 0;

    for (let aid in state.arts) {
        const art = state.arts[aid];
        const mastery = state.masteries[art.mastery];
        const core = state.cores[mastery.core];
        mastery.level += art.level;
        core.level += art.level;
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
            html += `<div style="margin-left:10px; color:#aaa;">▼ ${mastery.name} (Lv.${mastery.level})</div>`;
            for (let aid in state.arts) {
                const art = state.arts[aid];
                if (art.mastery !== mid) continue;
                html += `<div style="display:flex; justify-content:space-between; margin-left:20px; font-size:10px; margin-top:3px;">
                            <span>- ${art.name}</span><span>Lv.${art.level}</span>
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
    for (let aid in state.arts) {
        const art = state.arts[aid];
        const btn = document.createElement('button');
        btn.innerHTML = `${art.name} <span style="font-size:8px">(Lv.${art.level})</span>`;
        btn.onclick = () => startBattle(aid);
        box.appendChild(btn);
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
                if(confirm(`${item.name} 구매?`)) {
                    state.gold -= item.cost;
                    DataManager.save(state);
                    updateGlobalUI();
                    renderShop(); // 잔액 갱신
                }
            } else alert("골드 부족!");
        };
        box.appendChild(div);
    });
}

// --- 3. 전투 시스템 ---
function startBattle(artId) {
    activeArtId = artId;
    sessionSec = 0;
    switchTab('battle');
    
    document.getElementById('battle-quest-name').innerText = state.arts[artId].name;
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
    if (!timer) return;
    clearInterval(timer);
    timer = null;
    BattleManager.destroy(); // Phaser 종료

    state.gold += sessionSec;
    state.arts[activeArtId].seconds += sessionSec;
    DataManager.save(state);
    
    alert(`${sessionSec} 골드 획득!`);
    updateGlobalUI();
    switchTab('character');
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
        state = JSON.parse(e.target.result);
        DataManager.save(state);
        location.reload();
    };
    reader.readAsText(e.target.files[0]);
};

// 앱 시작
updateGlobalUI();
renderCharacter();
