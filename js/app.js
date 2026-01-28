import { DataManager } from './data.js';
import { BattleManager } from './battle.js';
import { AchievementManager } from './achievement.js';
import { LOOT_TABLE } from './game_data.js';

let state = DataManager.load(); //
let timer = null, sessionSec = 0, activeQuestId = null;
let selectedCoreForCreate = null, editingSkillId = null, editingMasteryId = null, editingItemId = null;

let invState = { view: 'portal', category: null, folderId: null };
let editingFolderId = null; 

// 기록물 관련 상수
const RECORD_COLORS = ['#FF5C5C', '#FF9F43', '#FFD700', '#6BCB77', '#4D96FF', '#9D84FF', '#FF85C0', '#777777'];
const RECORD_ICONS = ['menu_book', 'edit', 'article', 'star', 'favorite', 'emoji_events', 'school', 'fitness_center', 'work', 'flight', 'pets', 'restaurant', 'coffee', 'music_note', 'camera_alt', 'palette', 'home', 'shopping_cart', 'lock', 'visibility', 'settings', 'bolt', 'lightbulb', 'local_fire_department'];
let selectedItemColor = RECORD_COLORS[0];
let selectedItemIcon = RECORD_ICONS[0];

if(!state.settings) state.settings = { theme: 'dark', fontSize: 12 };

const initApp = () => {
    document.body.className = state.settings.theme + '-theme';
    document.documentElement.style.setProperty('--base-font', state.settings.fontSize + 'px');
    document.getElementById('current-font-size').innerText = state.settings.fontSize;
    bindDataEvents();
    updateGlobalUI();
    renderCharacter();
};

// --- 공통 유틸리티 ---
window.showToast = (msg) => {
    const c = document.getElementById('toast-container');
    const d = document.createElement('div'); d.className = 'toast'; d.innerText = msg;
    c.appendChild(d);
    setTimeout(() => { d.style.opacity = '0'; setTimeout(() => d.remove(), 400); }, 2500);
};

window.openConfirmModal = (title, msg, callback) => {
    const m = document.getElementById('modal-confirm');
    document.getElementById('confirm-title').innerText = title;
    document.getElementById('confirm-msg').innerText = msg;
    m.style.display = 'flex';
    const b = document.getElementById('btn-confirm-yes');
    const nb = b.cloneNode(true); b.parentNode.replaceChild(nb, b);
    nb.onclick = () => { m.style.display = 'none'; callback(); };
};
window.closeConfirmModal = () => document.getElementById('modal-confirm').style.display = 'none';
window.closeModal = (id) => document.getElementById(id).style.display = 'none';
const closeAllModals = () => document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');

// --- 설정 및 데이터 관리 ---
window.openSettingsMainModal = () => { closeAllModals(); document.getElementById('modal-settings-main').style.display = 'flex'; };
window.openDataSettings = () => { closeAllModals(); document.getElementById('modal-settings-data').style.display = 'flex'; };

window.forceRefreshAction = () => {
    openConfirmModal("강제 새로고침", "앱의 캐시를 비우고 다시 로드합니다. 저장 데이터는 유지됩니다.", () => {
        DataManager.save(state);
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(regs => { for (let r of regs) r.unregister(); });
        }
        setTimeout(() => { window.location.reload(); }, 100);
    });
}; //

window.openStatisticsModal = () => {
    const list = document.getElementById('stats-log-list');
    if (!list) return;
    list.innerHTML = '';
    const stats = state.statistics || { quest: { completed: 0, nightOwl: 0 }, battle: { totalSeconds: 0 }, shop: { purchases: 0, goldSpent: 0 } };
    const h = Math.floor(stats.battle.totalSeconds / 3600);
    const m = Math.floor((stats.battle.totalSeconds % 3600) / 60);
    const logData = [
        { label: "📜 총 의뢰 완료", value: `${stats.quest.completed}회` },
        { label: "🌙 심야 수련(00-06)", value: `${stats.quest.nightOwl}회` },
        { label: "⚔️ 누적 수련 시간", value: `${h}시간 ${m}분` },
        { label: "💰 보상 교환 횟수", value: `${stats.shop.purchases}회` },
        { label: "💸 누적 골드 소모", value: `${stats.shop.goldSpent.toLocaleString()} G` }
    ];
    logData.forEach(item => {
        const div = document.createElement('div');
        div.className = 'list-item';
        div.style.cssText = 'display:flex; justify-content:space-between; padding:12px; border-bottom:1px solid var(--border); font-size:0.9em; cursor:default;';
        div.innerHTML = `<span>${item.label}</span><span style="color:var(--gold); font-weight:bold;">${item.value}</span>`;
        list.appendChild(div);
    });
    document.getElementById('modal-statistics').style.display = 'flex';
}; //

// --- UI 렌더링 ---
function drawRadarChart() {
    const cvs = document.getElementById('stat-radar'); if (!cvs) return;
    const ctx = cvs.getContext('2d'), w = cvs.width, h = cvs.height, cx = w/2, cy = h/2, r = w/2 - 40;
    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border').trim(); ctx.lineWidth = 1;
    for(let i=1; i<=5; i++) {
        ctx.beginPath();
        for(let j=0; j<5; j++) {
            const a = (Math.PI*2*j)/5 - Math.PI/2;
            ctx.lineTo(cx+(r/5)*i*Math.cos(a), cy+(r/5)*i*Math.sin(a));
        }
        ctx.closePath(); ctx.stroke();
    }
    const stats = ['STR','DEX','INT','WIS','VIT'];
    const levels = stats.map(k => state.cores[k] ? state.cores[k].level : 0);
    const maxVal = Math.max(20, ...levels) * 1.2;
    ctx.beginPath(); 
    ctx.fillStyle = 'rgba(77,150,255,0.4)'; ctx.strokeStyle = '#4D96FF'; ctx.lineWidth = 2;
    stats.forEach((k,i) => {
        const v = state.cores[k] ? state.cores[k].level : 0;
        const a = (Math.PI*2*i)/5 - Math.PI/2;
        ctx.lineTo(cx+(v/maxVal)*r*Math.cos(a), cy+(v/maxVal)*r*Math.sin(a));
    });
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#888'; ctx.font = '10px "DungGeunMo"'; ctx.textAlign = 'center';
    stats.forEach((k,i) => {
        const a = (Math.PI*2*i)/5 - Math.PI/2;
        ctx.fillText(k, cx+(r+20)*Math.cos(a), cy+(r+20)*Math.sin(a)+4);
    });
}

function updateGlobalUI() {
    let tl = 0;
    for(let s in state.skills) state.skills[s].level = Math.floor(state.skills[s].seconds/3600);
    for(let m in state.masteries) state.masteries[m].level = 0;
    for(let c in state.cores) state.cores[c].level = 0;
    for(let s in state.skills) {
        const sk = state.skills[s]; if(sk.hidden || !sk.mastery) continue;
        const ma = state.masteries[sk.mastery]; if(!ma) continue;
        ma.level += sk.level; state.cores[ma.core].level += sk.level;
    }
    for(let c in state.cores) tl += state.cores[c].level;
    state.totalLevel = tl;
    document.getElementById('ui-gold').innerText = `${state.gold} G`;
    document.getElementById('header-job-title').innerText = `<${state.currentTitle}>`;
    document.getElementById('header-job-name').innerText = state.currentJob;
    document.getElementById('chart-total-level').innerText = `Lv.${tl}`;
    AchievementManager.checkAll(state, window.showToast); //
    drawRadarChart();
}

function renderCharacter() {
    const list = document.getElementById('stats-list'); 
    if (!list) return;
    list.innerHTML = '';

    ['STR','DEX','INT','WIS','VIT'].forEach(cid => {
        const c = state.cores[cid];
        const d = document.createElement('div'); d.className = 'stat-item';
        d.innerHTML = `
            <div class="stat-header" onclick="toggleStat('${cid}')">
                <span style="color:${c.color}">● ${c.name}</span>
                <span>Lv.${c.level} ▼</span>
            </div>
            <div id="detail-${cid}" class="stat-detail" style="display:none;"></div>
        `;
        list.appendChild(d);

        const box = d.querySelector(`#detail-${cid}`);
        let hasSkills = false;

        for (let mid in state.masteries) {
            const m = state.masteries[mid]; if (m.core !== cid) continue;
            let skillHtml = '';
            for (let sid in state.skills) {
                const s = state.skills[sid]; if (s.mastery !== mid || s.hidden) continue;
                
                const skillLevel = Math.floor(s.seconds / 3600);
                const skillExpPercent = ((s.seconds % 3600) / 3600 * 100).toFixed(1);
                
                // [v12.7 Fix] 세련된 경험치 바 디자인 적용
                skillHtml += `
                <div class="skill-row-container">
                    <div class="skill-main-info">
                        <span class="skill-name-text">${s.name}</span>
                        <div class="skill-lv-section">
                            <span class="skill-lv-label">Lv.</span>
                            <span class="skill-lv-value">${skillLevel}</span>
                        </div>
                    </div>
                    <div class="skill-progress-area">
                        <div class="skill-progress-track">
                            <div class="skill-progress-fill" style="width: ${skillExpPercent}%"></div>
                            <span class="skill-exp-percent-text">${skillExpPercent}%</span>
                        </div>
                        <button class="btn-edit-mini" onclick="openEditSkillModal('${sid}')">
                            <span class="material-icons-round" style="font-size: 16px;">edit</span>
                        </button>
                    </div>
                </div>`;
            }

            if (skillHtml) {
                box.innerHTML += `
                    <div class="mastery-header">
                        <span class="mastery-title">${m.name} (Lv.${m.level})</span>
                        <button class="btn-edit-mini" onclick="openEditMasteryModal('${mid}')">✎</button>
                    </div>
                    ${skillHtml}
                `;
                hasSkills = true;
            }
        }
        if (!hasSkills) box.innerHTML = '<div style="font-size:0.8em;color:#555;padding:10px;">데이터 없음</div>';
    });
} //

// --- 의뢰 및 전투 로직 ---
window.startBattle = (id) => {
    if (activeQuestId || timer) return showToast("이미 진행 중인 의뢰가 있습니다.");
    state.activeStartTime = Date.now(); //
    activeQuestId = id; sessionSec = 0;
    DataManager.save(state); switchTab('battle');
};

window.stopBattleAction = () => {
    if (!activeQuestId) return;
    const endTimeMs = Date.now();
    const startTimeMs = state.activeStartTime || endTimeMs;
    const totalElapsedSec = Math.floor((endTimeMs - startTimeMs) / 1000); //
    
    if (timer) { clearInterval(timer); timer = null; }
    
    const q = state.quests[activeQuestId];
    if (!q) return;
    const ms = state.skills[q.mainSkillId];

    // 심야 구간(00-06시) 겹침 계산
    const getNightOverlapSeconds = (sMs, eMs) => {
        const start = new Date(sMs); const end = new Date(eMs); let overlapSec = 0;
        const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const nightStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0).getTime();
            const nightEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 6, 0, 0).getTime();
            const actualOverlapStart = Math.max(sMs, nightStart);
            const actualOverlapEnd = Math.min(eMs, nightEnd);
            if (actualOverlapEnd > actualOverlapStart) overlapSec += (actualOverlapEnd - actualOverlapStart) / 1000;
        }
        return Math.floor(overlapSec);
    };

    const nightActiveSeconds = getNightOverlapSeconds(startTimeMs, endTimeMs);
    let isSuccess = false, isNightSuccess = false;

    if (totalElapsedSec >= 60) { //
        isSuccess = true; state.statistics.quest.completed++;
        if (nightActiveSeconds >= 60) { isNightSuccess = true; state.statistics.quest.nightOwl++; }
    }

    state.gold += totalElapsedSec;
    if (ms) ms.seconds += totalElapsedSec;
    if (q.subSkillId) { const ss = state.skills[q.subSkillId]; if (ss) ss.seconds += Math.floor(totalElapsedSec * 0.2); }
    state.statistics.battle.totalSeconds += totalElapsedSec;

    let msg = `완료! (+${totalElapsedSec.toLocaleString()}G)`;
    if (!isSuccess) msg = `수련 종료 (1분 미만은 의뢰 미인정)`;
    else if (isNightSuccess) msg += ` 🌙 심야 수련 인정!`;

    // 전리품 드랍 체크
    if (typeof LOOT_TABLE !== 'undefined') {
        LOOT_TABLE.forEach(loot => {
            let condMet = true;
            if (loot.condition && loot.condition.type === 'min_time' && totalElapsedSec < loot.condition.value) condMet = false;
            if (condMet && Math.random() < loot.dropRate) {
                state.inventory.push({ id: 'loot_' + Date.now() + Math.random(), type: 'loot', icon: loot.icon, name: loot.name, desc: loot.desc, folderId: null });
                msg += ` [${loot.name} 획득!]`;
            }
        });
    }

    showToast(msg); sessionSec = 0; activeQuestId = null; state.activeStartTime = null;
    DataManager.save(state); updateGlobalUI(); updateBattleUI('idle');
};

function updateBattleUI(mode) {
    const title = document.getElementById('battle-quest-name');
    const timerText = document.getElementById('battle-timer');
    const subText = document.getElementById('battle-earning');
    const btnSelect = document.getElementById('btn-select-quest');
    const btnStop = document.getElementById('btn-stop');
    BattleManager.init(mode);
    if (mode === 'battle') {
        const q = state.quests[activeQuestId];
        title.innerText = q ? q.name : '알 수 없는 의뢰';
        const renderTimer = () => {
            const elapsed = Math.floor((Date.now() - state.activeStartTime) / 1000); //
            const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const s = (elapsed % 60).toString().padStart(2, '0');
            timerText.innerText = `00:${m}:${s}`;
        };
        renderTimer();
        subText.innerText = "수련 진행 중..."; btnSelect.style.display = 'none'; btnStop.style.display = 'inline-flex';
        if (!timer) timer = setInterval(renderTimer, 1000);
    } else {
        title.innerText = ""; timerText.innerText = "휴식 중"; subText.innerText = "HP와 의욕을 회복하고 있습니다.";
        btnSelect.style.display = 'inline-flex'; btnStop.style.display = 'none';
        if (timer) { clearInterval(timer); timer = null; }
    }
}

// --- 기타 이벤트 바인딩 (이전 동일) ---
const bindDataEvents = () => {
    document.getElementById('btn-reset').onclick = () => openConfirmModal("데이터 초기화", "정말 삭제하시겠습니까?", () => DataManager.reset());
    document.getElementById('btn-export').onclick = () => { DataManager.export(state); showToast("백업 생성 완료."); };
    document.getElementById('btn-import').onclick = () => document.getElementById('file-input').click();
    document.getElementById('file-input').onchange = (e) => {
        const r = new FileReader();
        r.onload = (v) => { try { state = JSON.parse(v.target.result); DataManager.save(state); location.reload(); } catch { showToast("실패."); } };
        if(e.target.files.length) r.readAsText(e.target.files[0]);
    };
};

const switchTab = (t) => {
    document.querySelectorAll('.tab-screen').forEach(e => e.classList.remove('active'));
    document.getElementById(`tab-${t}`).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(e => e.classList.remove('active'));
    document.querySelector(`[data-target="${t}"]`).classList.add('active');
    if(t==='character') renderCharacter();
    if (t === 'battle') requestAnimationFrame(() => updateBattleUI(activeQuestId ? 'battle' : 'idle'));
};
window.switchTab = switchTab;
document.querySelectorAll('.nav-btn').forEach(b => b.onclick = () => switchTab(b.dataset.target));

// 생략된 상점/기록물 로직은 v12.0~12.2 버전과 동일하게 유지

initApp();
