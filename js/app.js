import { DataManager } from './data.js';
import { BattleManager } from './battle.js';
import { AchievementManager } from './achievement.js';
import { LOOT_TABLE, TITLE_DATA, JOB_DATA } from './game_data.js';

// 1. 데이터 로드
let state = DataManager.load();
let timer = null;
let activeQuestId = state.activeQuestId || null;

// ★ [Fix] 초기화 중인지 확인하는 플래그 (자동 저장 방지용)
let isResetting = false;

// UI 상태 변수
let tempEndTime = null; 
let selectedCoreForCreate = null, editingSkillId = null, editingMasteryId = null, editingItemId = null;
let invState = { view: 'portal', category: null, folderId: null };
let editingFolderId = null; 

const RECORD_COLORS = ['#FF5C5C', '#FF9F43', '#FFD700', '#6BCB77', '#4D96FF', '#9D84FF', '#FF85C0', '#777777'];
const RECORD_ICONS = ['menu_book', 'edit', 'article', 'star', 'favorite', 'emoji_events', 'school', 'fitness_center', 'work', 'flight', 'pets', 'restaurant', 'coffee', 'music_note', 'camera_alt', 'palette', 'home', 'shopping_cart', 'lock', 'visibility', 'settings', 'bolt', 'lightbulb', 'local_fire_department'];
let selectedItemColor = RECORD_COLORS[0];
let selectedItemIcon = RECORD_ICONS[0];

// [Safety] 데이터 무결성 검사
const sanitizeState = (s) => {
    if (!s) return; // state가 null이면 중단
    if (!s.settings) s.settings = { theme: 'dark', fontSize: 12 };
    if (!s.unlockedTitles) s.unlockedTitles = ['없음'];
    if (!s.unlockedJobs) s.unlockedJobs = ['무직'];
    if (!s.statistics) s.statistics = { quest: { completed: 0, nightOwl: 0 }, battle: { totalSeconds: 0 }, shop: { purchases: 0, goldSpent: 0 } };
    if (!s.currentTitle) s.currentTitle = '없음';
    if (!s.currentJob) s.currentJob = '무직';
    if (s.activeQuestId) activeQuestId = s.activeQuestId;

    // ★ [New] 일별 기록 & 레거시 스킬 저장소
    if (!s.dailyRecords) s.dailyRecords = {};
    if (!s.legacySkills) s.legacySkills = {}; 
};

const initApp = () => {
    sanitizeState(state);
    
    // 테마 및 폰트 적용
    document.body.className = state.settings.theme + '-theme';
    document.documentElement.style.setProperty('--base-font', state.settings.fontSize + 'px');
    document.getElementById('current-font-size').innerText = state.settings.fontSize;
    
    bindDataEvents();
    
    // ★ [Fix] 하단바 이벤트 리스너를 initApp 내부로 이동 (확실한 실행 보장)
    document.querySelectorAll('.nav-btn').forEach(b => {
        b.onclick = () => switchTab(b.dataset.target);
    });

    updateGlobalUI();

    // [Resume] 전투 복귀 로직
    if (activeQuestId) {
        console.log(`[System] 수련 복귀: ${activeQuestId}`);
        switchTab('battle'); 
        updateBattleUI('battle'); 
        showToast("수련을 이어서 진행합니다.");
    } else {
        renderCharacter();
    }
};

// =============================================================================
// 🧠 [CORE] 핵심 기록 로직 (Time Splitting & Snapshot)
// =============================================================================
function recordActivity(questId, startTime, endTime, isManual = false) {
    const q = state.quests[questId];
    if (!q) return { success: false, msg: "의뢰 정보를 찾을 수 없습니다." };

    const mainSkill = state.skills[q.mainSkillId];
    const subSkill = q.subSkillId ? state.skills[q.subSkillId] : null;
    
    // 1. 전체 수행 시간
    const totalDuration = Math.floor((endTime - startTime) / 1000);
    if (totalDuration < 60) return { success: false, msg: "1분 미만은 기록되지 않습니다." };

    // 2. 날짜별 분할 처리 (자정 넘김 대응)
    let currentCursor = new Date(startTime);
    const endCursor = new Date(endTime);
    
    while (currentCursor < endCursor) {
        const dateKey = currentCursor.toISOString().split('T')[0];
        
        const nextMidnight = new Date(currentCursor);
        nextMidnight.setDate(nextMidnight.getDate() + 1);
        nextMidnight.setHours(0, 0, 0, 0);

        const segmentEnd = new Date(Math.min(endCursor, nextMidnight));
        const segmentSeconds = Math.floor((segmentEnd - currentCursor) / 1000);

        if (segmentSeconds > 0) {
            if (!state.dailyRecords[dateKey]) {
                state.dailyRecords[dateKey] = { logs: [], skillStats: {}, summary: { gold: 0, time: 0 } };
            }
            const dayRecord = state.dailyRecords[dateKey];

            dayRecord.logs.push({
                id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                startTime: currentCursor.getTime(),
                duration: segmentSeconds,
                questName: q.name,
                mainSkillName: mainSkill ? mainSkill.name : '(삭제됨)',
                subSkillName: subSkill ? subSkill.name : null,
                isManual: isManual
            });

            if (mainSkill) {
                dayRecord.skillStats[q.mainSkillId] = (dayRecord.skillStats[q.mainSkillId] || 0) + segmentSeconds;
            }
            if (subSkill) {
                dayRecord.skillStats[q.subSkillId] = (dayRecord.skillStats[q.subSkillId] || 0) + segmentSeconds;
            }

            dayRecord.summary.time += segmentSeconds;
            dayRecord.summary.gold += segmentSeconds; 
        }
        currentCursor = nextMidnight;
    }

    state.gold += totalDuration;
    if (mainSkill) mainSkill.seconds += totalDuration;
    if (subSkill) subSkill.seconds += Math.floor(totalDuration * 0.2);
    
    let lootMsg = "";
    if (!isManual && typeof LOOT_TABLE !== 'undefined') {
        LOOT_TABLE.forEach(loot => {
            if (loot.condition.type === 'min_time' && totalDuration < loot.condition.value) return;
            const chance = loot.dropRate * (1 + Math.min(totalDuration / 3600, 2));
            if (Math.random() < chance) {
                state.inventory.push({ 
                    id: 'loot_' + Date.now() + Math.random(), 
                    type: 'loot', 
                    icon: loot.icon, 
                    name: loot.name, 
                    desc: loot.desc, 
                    folderId: null 
                });
                lootMsg += ` [${loot.name}]`;
            }
        });
    }

    state.statistics.quest.completed++;
    state.statistics.battle.totalSeconds += totalDuration;
    const startHour = new Date(startTime).getHours();
    if (startHour >= 0 && startHour < 6) state.statistics.quest.nightOwl++;

    DataManager.save(state);
    return { success: true, earnedGold: totalDuration, lootMsg: lootMsg };
}

// =============================================================================
// ⚔️ 전투 및 결산 UI 로직
// =============================================================================

window.stopBattleAction = () => {
    if (!activeQuestId) return;
    tempEndTime = Date.now(); 
    updateResultModalUI();
    document.getElementById('modal-battle-result').style.display = 'flex';
    if (timer) { clearInterval(timer); timer = null; }
};

function updateResultModalUI() {
    const startTime = state.activeStartTime;
    const durationSec = Math.floor((tempEndTime - startTime) / 1000);
    const h = Math.floor(durationSec / 3600);
    const m = Math.floor((durationSec % 3600) / 60);
    const s = durationSec % 60;
    
    document.getElementById('result-time-text').innerText = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
    document.getElementById('result-gold-text').innerText = `+ ${durationSec.toLocaleString()} G`;
    document.getElementById('result-end-time').innerText = new Date(tempEndTime).toLocaleTimeString();
}

window.adjustResultTime = (minutes) => {
    const newTime = tempEndTime + (minutes * 60 * 1000);
    if (newTime <= state.activeStartTime) return showToast("시작 시간보다 빠를 수 없습니다.");
    if (newTime > Date.now()) return showToast("미래의 시간으로 설정할 수 없습니다.");
    tempEndTime = newTime;
    updateResultModalUI();
};

window.confirmBattleResult = () => {
    const result = recordActivity(activeQuestId, state.activeStartTime, tempEndTime, false);
    if (result.success) {
        let msg = `수련 완료! +${result.earnedGold}G`;
        if (result.lootMsg) msg += result.lootMsg;
        showToast(msg);
    } else {
        showToast(result.msg);
    }
    activeQuestId = null;
    state.activeQuestId = null;
    state.activeStartTime = null;
    DataManager.save(state);
    closeModal('modal-battle-result');
    updateGlobalUI();
    updateBattleUI('idle');
    switchTab('character');
};

window.openManualRecordModal = () => {
    const sel = document.getElementById('manual-quest-select');
    sel.innerHTML = '';
    let hasQuest = false;
    for(let qid in state.quests) {
        sel.innerHTML += `<option value="${qid}">${state.quests[qid].name}</option>`;
        hasQuest = true;
    }
    if (!hasQuest) return showToast("등록된 의뢰가 없습니다.");
    
    const now = new Date();
    document.getElementById('manual-date').valueAsDate = now;
    document.getElementById('manual-start-time').value = "10:00";
    document.getElementById('manual-duration-min').value = 60;
    
    document.getElementById('modal-manual-record').style.display = 'flex';
};

window.submitManualRecord = () => {
    const qid = document.getElementById('manual-quest-select').value;
    const dateStr = document.getElementById('manual-date').value;
    const timeStr = document.getElementById('manual-start-time').value;
    const durationMin = parseInt(document.getElementById('manual-duration-min').value);

    if (!qid || !dateStr || !timeStr || !durationMin) return showToast("모든 정보를 입력해주세요.");

    const startTime = new Date(`${dateStr}T${timeStr}`).getTime();
    const endTime = startTime + (durationMin * 60 * 1000);

    if (endTime > Date.now()) return showToast("미래의 일은 기록할 수 없습니다.");
    if (state.dailyRecords[dateStr] && state.dailyRecords[dateStr].summary.time + (durationMin*60) > 86400) {
        return showToast("하루 24시간을 초과할 수 없습니다.");
    }

    const result = recordActivity(qid, startTime, endTime, true);
    if (result.success) {
        showToast(`기록되었습니다. (전리품 획득 불가)`);
        closeModal('modal-manual-record');
        updateGlobalUI();
    } else {
        showToast(result.msg);
    }
};

window.startBattle = (id) => {
    if (activeQuestId || timer) return showToast("이미 진행 중인 의뢰가 있습니다.");
    state.activeStartTime = Date.now();
    activeQuestId = id; 
    state.activeQuestId = id;
    DataManager.save(state); 
    switchTab('battle');
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
            const curNow = Date.now();
            const elapsed = Math.floor((curNow - state.activeStartTime) / 1000);
            const h = Math.floor(elapsed / 3600);
            const m = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
            const s = (elapsed % 60).toString().padStart(2, '0');
            timerText.innerText = h > 0 ? `${h}:${m}:${s}` : `00:${m}:${s}`;
            subText.innerHTML = `수련 진행 중... <br><span style="color:var(--gold); font-size:1.2em; font-weight:bold;">+ ${elapsed.toLocaleString()} G</span>`;
        };
        renderTimer();
        btnSelect.style.display = 'none'; btnStop.style.display = 'inline-flex';
        if (!timer) timer = setInterval(renderTimer, 1000);
    } else {
        title.innerText = ""; timerText.innerText = "휴식 중"; subText.innerText = "HP와 의욕을 회복하고 있습니다.";
        btnSelect.style.display = 'inline-flex'; btnStop.style.display = 'none';
        if (timer) { clearInterval(timer); timer = null; }
    }
}

// =============================================================================
// Helper Functions
// =============================================================================
window.showToast = (msg) => { const c = document.getElementById('toast-container'); const d = document.createElement('div'); d.className = 'toast'; d.innerText = msg; c.appendChild(d); setTimeout(() => { d.style.opacity = '0'; setTimeout(() => d.remove(), 400); }, 2500); };
window.openConfirmModal = (title, msg, callback) => { const m = document.getElementById('modal-confirm'); document.getElementById('confirm-title').innerText = title; document.getElementById('confirm-msg').innerText = msg; m.style.display = 'flex'; const b = document.getElementById('btn-confirm-yes'); const nb = b.cloneNode(true); b.parentNode.replaceChild(nb, b); nb.onclick = () => { m.style.display = 'none'; callback(); }; };
window.closeConfirmModal = () => document.getElementById('modal-confirm').style.display = 'none';
window.closeModal = (id) => document.getElementById(id).style.display = 'none';
const closeAllModals = () => document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
window.openSettingsMainModal = () => { closeAllModals(); document.getElementById('modal-settings-main').style.display = 'flex'; };
window.openGeneralSettings = () => { closeAllModals(); document.getElementById('modal-settings-general').style.display = 'flex'; };
window.openThemeSettings = () => { closeAllModals(); document.getElementById('modal-settings-theme').style.display = 'flex'; };
window.openDataSettings = () => { closeAllModals(); document.getElementById('modal-settings-data').style.display = 'flex'; };
window.setTheme = (t) => { state.settings.theme = t; document.body.className = t + '-theme'; DataManager.save(state); showToast("테마가 변경되었습니다."); };
window.adjustFontSize = (d) => { let s = state.settings.fontSize + d; if(s<8) s=8; if(s>16) s=16; state.settings.fontSize = s; document.documentElement.style.setProperty('--base-font', s + 'px'); document.getElementById('current-font-size').innerText = s; DataManager.save(state); };

const bindDataEvents = () => { 
    document.getElementById('btn-reset').onclick = () => openConfirmModal("데이터 초기화", "정말 모든 기록을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.", () => {
        // ★ [Fix] 초기화 플래그 설정 (자동저장 방지)
        isResetting = true;
        DataManager.reset();
    }); 
    document.getElementById('btn-export').onclick = () => { DataManager.export(state); showToast("백업 파일이 생성되었습니다."); }; 
    document.getElementById('btn-import').onclick = () => document.getElementById('file-input').click(); 
    document.getElementById('file-input').onchange = (e) => { const r = new FileReader(); r.onload = (v) => { try { state = JSON.parse(v.target.result); sanitizeState(state); DataManager.save(state); location.reload(); } catch { showToast("파일 형식이 올바르지 않습니다."); } }; if(e.target.files.length) r.readAsText(e.target.files[0]); }; 
};

window.forceRefreshAction = () => { 
    openConfirmModal("강제 새로고침", "데이터를 안전하게 저장하고 앱을 다시 로드합니다.\n진행하시겠습니까?", () => { 
        DataManager.save(state); 
        if ('serviceWorker' in navigator) { navigator.serviceWorker.getRegistrations().then(regs => { for (let r of regs) r.unregister(); }); } 
        setTimeout(() => { window.location.reload(); }, 100); 
    }); 
};

window.openStatisticsModal = () => { const list = document.getElementById('stats-log-list'); if (!list) return; list.innerHTML = ''; const stats = state.statistics; const h = Math.floor(stats.battle.totalSeconds / 3600); const m = Math.floor((stats.battle.totalSeconds % 3600) / 60); const logData = [ { label: "📜 총 의뢰 완료", value: `${stats.quest.completed}회` }, { label: "🌙 심야 수련(00-06)", value: `${stats.quest.nightOwl}회` }, { label: "⚔️ 누적 수련 시간", value: `${h}시간 ${m}분` }, { label: "💰 보상 교환 횟수", value: `${stats.shop.purchases}회` }, { label: "💸 누적 골드 소모", value: `${stats.shop.goldSpent.toLocaleString()} G` } ]; logData.forEach(item => { const div = document.createElement('div'); div.className = 'list-item'; div.style.cssText = 'display:flex; justify-content:space-between; padding:12px; border-bottom:1px solid var(--border); font-size:0.9em; cursor:default;'; div.innerHTML = `<span>${item.label}</span><span style="color:var(--gold); font-weight:bold;">${item.value}</span>`; list.appendChild(div); }); document.getElementById('modal-statistics').style.display = 'flex'; };
function drawRadarChart() { const cvs = document.getElementById('stat-radar'); if (!cvs) return; const ctx = cvs.getContext('2d'), w = cvs.width, h = cvs.height, cx = w/2, cy = h/2, r = w/2 - 40; ctx.clearRect(0,0,w,h); ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border').trim(); ctx.lineWidth = 1; for(let i=1; i<=5; i++) { ctx.beginPath(); for(let j=0; j<5; j++) { const a = (Math.PI*2*j)/5 - Math.PI/2; ctx.lineTo(cx+(r/5)*i*Math.cos(a), cy+(r/5)*i*Math.sin(a)); } ctx.closePath(); ctx.stroke(); } const stats = ['STR','DEX','INT','WIS','VIT']; const levels = stats.map(k => state.cores[k] ? state.cores[k].level : 0); const maxVal = Math.max(20, ...levels) * 1.2; ctx.beginPath(); ctx.fillStyle = 'rgba(77,150,255,0.4)'; ctx.strokeStyle = '#4D96FF'; ctx.lineWidth = 2; stats.forEach((k,i) => { const v = state.cores[k] ? state.cores[k].level : 0; const a = (Math.PI*2*i)/5 - Math.PI/2; ctx.lineTo(cx+(v/maxVal)*r*Math.cos(a), cy+(v/maxVal)*r*Math.sin(a)); }); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#888'; ctx.font = '10px "DungGeunMo"'; ctx.textAlign = 'center'; stats.forEach((k,i) => { const a = (Math.PI*2*i)/5 - Math.PI/2; ctx.fillText(k, cx+(r+20)*Math.cos(a), cy+(r+20)*Math.sin(a)+4); }); }
function updateGlobalUI() { let tl = 0; for(let s in state.skills) state.skills[s].level = Math.floor(state.skills[s].seconds/3600); for(let m in state.masteries) state.masteries[m].level = 0; for(let c in state.cores) state.cores[c].level = 0; for(let s in state.skills) { const sk = state.skills[s]; if(sk.hidden || !sk.mastery) continue; const ma = state.masteries[sk.mastery]; if(!ma) continue; ma.level += sk.level; state.cores[ma.core].level += sk.level; } for(let c in state.cores) tl += state.cores[c].level; state.totalLevel = tl; document.getElementById('ui-gold').innerText = `${state.gold} G`; document.getElementById('header-job-title').innerText = `<${state.currentTitle}>`; document.getElementById('header-job-name').innerText = state.currentJob; document.getElementById('chart-total-level').innerText = `Lv.${tl}`; if (AchievementManager.checkAll(state, window.showToast)) { DataManager.save(state); } drawRadarChart(); }
function renderCharacter() { const list = document.getElementById('stats-list'); list.innerHTML = ''; ['STR','DEX','INT','WIS','VIT'].forEach(cid => { const c = state.cores[cid]; const d = document.createElement('div'); d.className = 'stat-item'; d.innerHTML = `<div class="stat-header" onclick="toggleStat('${cid}')"><span style="color:${c.color}">● ${c.name}</span><span>Lv.${c.level} ▼</span></div><div id="detail-${cid}" class="stat-detail" style="display:none;"></div>`; list.appendChild(d); const box = d.querySelector(`#detail-${cid}`); let has = false; for(let mid in state.masteries) { const m = state.masteries[mid]; if(m.core !== cid) continue; let sh = ''; for(let sid in state.skills) { const s = state.skills[sid]; if(s.mastery !== mid || s.hidden) continue; const skillLevel = Math.floor(s.seconds / 3600); const skillExpPercent = ((s.seconds % 3600) / 3600 * 100).toFixed(1); sh += ` <div class="skill-card"> <div class="skill-header-row"> <span class="skill-name">${s.name}</span> <div class="skill-meta-group"> <span class="skill-lv-badge">Lv.${skillLevel}</span> <button class="btn-skill-edit" onclick="openEditSkillModal('${sid}')"> <span class="material-icons-round" style="font-size:16px;">edit</span> </button> </div> </div> <div class="skill-progress-track"> <div class="skill-progress-fill" style="width: ${skillExpPercent}%"></div> <div class="skill-percent-text">${skillExpPercent}%</div> </div> </div>`; } if(sh || true) { box.innerHTML += `<div class="mastery-header"><span class="mastery-title">${m.name} (Lv.${m.level})</span><button class="btn-edit" onclick="openEditMasteryModal('${mid}')">✎</button></div>${sh || '<div style="font-size:0.8em;color:#555;padding:5px;">스킬 없음</div>'}`; has = true; } } if(!has) box.innerHTML = '<div style="font-size:0.8em;color:#555;padding:10px;">데이터 없음</div>'; }); }
window.toggleStat = (id) => { const e = document.getElementById(`detail-${id}`); e.style.display = e.style.display==='none'?'block':'none'; };
function renderQuest() { const c = document.getElementById('quest-container'); c.innerHTML = ''; let cnt = 0; for(let qid in state.quests) { const q = state.quests[qid]; const ms = state.skills[q.mainSkillId]; if(!ms || ms.hidden) continue; let sub = ''; if(q.subSkillId) { const ss = state.skills[q.subSkillId]; if(ss && !ss.hidden) sub = `<div style="margin-top:4px;"><span class="quest-tag tag-sub">Bonus (20%)</span> ${ss.name}</div>`; } cnt++; c.innerHTML += `<div class="card quest-card"><div class="quest-info"><div class="quest-title">${q.name}</div><div class="quest-sub"><div><span class="quest-tag tag-main">Main (100%)</span> ${ms.name}</div>${sub}</div></div><div style="display:flex;gap:5px;"><button class="btn-sm btn-primary" onclick="startBattle('${qid}')">수락</button><button class="btn-sm" style="background:#333;color:#888;" onclick="confirmDeleteQuest('${qid}')">삭제</button></div></div>`; } document.getElementById('empty-quest-msg').style.display = cnt===0?'block':'none'; }
window.enterCategory = (cat) => { invState.category = cat; invState.folderId = null; invState.view = 'list'; updateInvRender(); };
window.invGoBack = () => { if (invState.folderId) { invState.folderId = null; } else { invState.view = 'portal'; invState.category = null; } updateInvRender(); };
window.enterFolder = (fid) => { invState.folderId = fid; updateInvRender(); };
function updateInvRender() { const portal = document.getElementById('inv-portal-view'); const list = document.getElementById('inv-list-view'); if (invState.view === 'portal') { portal.style.display = 'flex'; list.style.display = 'none'; return; } portal.style.display = 'none'; list.style.display = 'block'; const catName = invState.category === 'loot' ? '전리품 도감' : '기록 보관소'; let folderName = '최상위'; if (invState.folderId) { const f = state.folders.find(x => x.id === invState.folderId); if(f) folderName = f.name; } document.getElementById('inv-current-path').innerText = `${catName} > ${folderName}`; const bar = document.getElementById('inv-action-bar'); bar.innerHTML = ''; if (!invState.folderId) bar.innerHTML += `<div class="chip" onclick="openCreateFolderModal()"><span class="material-icons-round" style="font-size:12px; vertical-align:middle;">create_new_folder</span> 폴더</div>`; if (invState.category === 'record') bar.innerHTML += `<div class="chip active" onclick="openCreateItemModal()"><span class="material-icons-round" style="font-size:12px; vertical-align:middle;">add</span> 기록</div>`; if (invState.folderId) bar.innerHTML += `<div class="chip" onclick="openEditFolderModal('${invState.folderId}')"><span class="material-icons-round" style="font-size:12px; vertical-align:middle;">settings</span> 관리</div>`; const g = document.getElementById('inventory-grid'); g.innerHTML = ''; if (!invState.folderId) { const folders = state.folders.filter(f => f.type === invState.category); folders.forEach(f => { const count = state.inventory.filter(i => (i.type === invState.category || (invState.category==='record'?i.type==='record':i.type!=='record')) && i.folderId === f.id).length; g.innerHTML += `<div class="folder-item" onclick="enterFolder('${f.id}')"><div class="folder-icon-box"><span class="material-icons-round" style="font-size:2em;">folder</span><span class="folder-badge">${count}</span></div><div class="folder-name">${f.name}</div></div>`; }); } const items = state.inventory.filter(i => { const isRecord = i.type === 'record'; const targetCat = invState.category === 'record'; if (targetCat !== isRecord) return false; if (invState.folderId) return i.folderId === invState.folderId; return !i.folderId; }); if (items.length === 0 && (!invState.folderId ? state.folders.filter(f => f.type === invState.category).length === 0 : true)) { g.innerHTML += `<div style="grid-column:1/-1;text-align:center;color:#555;padding:20px;">비어있음</div>`; } items.forEach(i => { const bg = i.type === 'record' ? (i.color || '#4D96FF') : (i.color || 'transparent'); const iconColor = i.type === 'record' ? '#fff' : (i.type==='loot' ? 'var(--gold)' : '#fff'); const frameClass = i.type === 'record' ? 'type-record' : 'type-loot'; g.innerHTML += `<div class="inv-item-container" onclick="openItemDetailModal('${i.id}')"><div class="inv-icon-frame ${frameClass}" style="background:${bg}"><span class="material-icons-round" style="font-size:2em; color:${iconColor}">${i.icon}</span></div><div class="inv-item-name">${i.name}</div></div>`; }); }
window.openItemDetailModal = (id) => { editingItemId = id; const item = state.inventory.find(i => i.id === id); document.getElementById('detail-item-icon').innerText = item.icon; document.getElementById('detail-item-icon').style.color = item.type === 'record' ? 'var(--accent)' : 'var(--gold)'; document.getElementById('detail-item-name').innerText = item.name; document.getElementById('detail-item-type').innerText = item.type === 'record' ? '기록물' : '전리품'; document.getElementById('detail-item-desc').innerText = item.desc || '(내용 없음)'; const select = document.getElementById('detail-move-select'); select.innerHTML = '<option value="">(최상위)</option>'; const folders = state.folders.filter(f => f.type === invState.category); folders.forEach(f => { const selected = item.folderId === f.id ? 'selected' : ''; select.innerHTML += `<option value="${f.id}" ${selected}>${f.name}</option>`; }); const isRecord = item.type === 'record'; const actionGroup = document.getElementById('record-only-actions'); actionGroup.style.display = isRecord ? 'flex' : 'none'; document.getElementById('modal-item-detail').style.display = 'flex'; };
window.openCreateItemModal = () => { editingItemId = null; document.querySelector('#modal-create-item h3').innerText = "새로운 기록"; document.getElementById('new-item-name').value = ''; document.getElementById('new-item-desc').value = ''; const palette = document.getElementById('new-item-color-picker'); palette.innerHTML = ''; selectedItemColor = RECORD_COLORS[0]; RECORD_COLORS.forEach(c => { const div = document.createElement('div'); div.className = `color-option ${c===selectedItemColor?'selected':''}`; div.style.backgroundColor = c; div.onclick = () => { selectedItemColor = c; document.querySelectorAll('.color-option').forEach(e => e.classList.remove('selected')); div.classList.add('selected'); }; palette.appendChild(div); }); const grid = document.getElementById('new-item-icon-picker'); grid.innerHTML = ''; selectedItemIcon = RECORD_ICONS[0]; RECORD_ICONS.forEach(ic => { const div = document.createElement('div'); div.className = `icon-option ${ic===selectedItemIcon?'selected':''}`; div.innerHTML = `<span class="material-icons-round">${ic}</span>`; div.onclick = () => { selectedItemIcon = ic; document.querySelectorAll('.icon-option').forEach(e => e.classList.remove('selected')); div.classList.add('selected'); }; grid.appendChild(div); }); document.getElementById('modal-create-item').style.display='flex'; };
window.openEditItemMode = () => { closeModal('modal-item-detail'); const i = state.inventory.find(x => x.id === editingItemId); document.querySelector('#modal-create-item h3').innerText = "기록 수정"; document.getElementById('new-item-name').value = i.name; document.getElementById('new-item-desc').value = i.desc; selectedItemColor = i.color || RECORD_COLORS[0]; const palette = document.getElementById('new-item-color-picker'); palette.innerHTML = ''; RECORD_COLORS.forEach(c => { const div = document.createElement('div'); div.className = `color-option ${c===selectedItemColor?'selected':''}`; div.style.backgroundColor = c; div.onclick = () => { selectedItemColor = c; renderPaletteSelection(); }; palette.appendChild(div); }); function renderPaletteSelection(){ document.querySelectorAll('.color-option').forEach(e => { e.classList.toggle('selected', e.style.backgroundColor === selectedItemColor || e.style.backgroundColor.replace(/\s/g, '') === 'rgb('+hexToRgb(selectedItemColor)+')'); }); } selectedItemIcon = i.icon || RECORD_ICONS[0]; const grid = document.getElementById('new-item-icon-picker'); grid.innerHTML = ''; RECORD_ICONS.forEach(ic => { const div = document.createElement('div'); div.className = `icon-option ${ic===selectedItemIcon?'selected':''}`; div.innerHTML = `<span class="material-icons-round">${ic}</span>`; div.onclick = () => { selectedItemIcon = ic; document.querySelectorAll('.icon-option').forEach(e => e.classList.remove('selected')); div.classList.add('selected'); }; grid.appendChild(div); }); function renderIconSelection() { document.querySelectorAll('.icon-option').forEach(e => { e.classList.toggle('selected', e.innerText === selectedItemIcon); }); } function hexToRgb(hex) { var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : null; } document.getElementById('modal-create-item').style.display='flex'; };
window.createItemAction = () => { const n = document.getElementById('new-item-name').value.trim(); const d = document.getElementById('new-item-desc').value; if(!n) return showToast("이름을 입력해주세요."); if(editingItemId) { const item = state.inventory.find(x => x.id === editingItemId); item.name = n; item.desc = d; item.icon = selectedItemIcon; item.color = selectedItemColor; showToast("수정되었습니다."); } else { state.inventory.push({ id: 'r'+Date.now(), type: 'record', icon: selectedItemIcon, color: selectedItemColor, name: n, desc: d||'', folderId: invState.folderId }); showToast("기록되었습니다."); } DataManager.save(state); updateInvRender(); closeModal('modal-create-item'); };
window.openCreateFolderModal = () => { editingFolderId = null; document.getElementById('folder-modal-title').innerText = "폴더 생성"; document.getElementById('input-folder-name').value = ""; document.getElementById('folder-delete-zone').style.display = 'none'; document.getElementById('modal-folder-manager').style.display = 'flex'; };
window.openEditFolderModal = (fid) => { editingFolderId = fid; const f = state.folders.find(x => x.id === fid); document.getElementById('folder-modal-title').innerText = "폴더 관리"; document.getElementById('input-folder-name').value = f.name; document.getElementById('folder-delete-zone').style.display = 'block'; document.getElementById('modal-folder-manager').style.display = 'flex'; };
document.getElementById('btn-save-folder').onclick = () => { const name = document.getElementById('input-folder-name').value.trim(); if(!name) return showToast("이름을 입력해주세요."); if (editingFolderId) { const f = state.folders.find(x => x.id === editingFolderId); f.name = name; showToast("수정되었습니다."); } else { state.folders.push({ id: 'f' + Date.now(), name: name, type: invState.category }); showToast("폴더가 생성되었습니다."); } DataManager.save(state); updateInvRender(); closeModal('modal-folder-manager'); };
window.deleteCurrentFolder = () => { const items = state.inventory.filter(i => i.folderId === editingFolderId); if(items.length > 0) return showToast("폴더가 비어있지 않아 삭제할 수 없습니다."); openConfirmModal("폴더 삭제", "정말 삭제하시겠습니까?", () => { state.folders = state.folders.filter(f => f.id !== editingFolderId); DataManager.save(state); invGoBack(); closeModal('modal-folder-manager'); showToast("삭제되었습니다."); }); };
window.moveItemAction = () => { const targetFid = document.getElementById('detail-move-select').value || null; const item = state.inventory.find(i => i.id === editingItemId); item.folderId = targetFid; DataManager.save(state); updateInvRender(); closeModal('modal-item-detail'); showToast("이동되었습니다."); };
window.deleteItemAction = () => { closeModal('modal-item-detail'); openConfirmModal("아이템 삭제", "정말 삭제하시겠습니까?", () => { state.inventory = state.inventory.filter(x => x.id !== editingItemId); DataManager.save(state); updateInvRender(); showToast("삭제되었습니다."); }); };
function renderShop() { const b = document.getElementById('shop-container'); b.innerHTML = ''; state.shopItems.forEach(i => { b.innerHTML += `<div class="card" style="display:flex;justify-content:space-between;align-items:center;"><span>${i.name}</span><div style="display:flex;gap:5px;"><button class="btn-shop btn-sm" onclick="buyItem('${i.id}', ${i.cost})">${i.cost}G</button><button class="btn-sm btn-danger" onclick="confirmDeleteShopItem('${i.id}')">🗑️</button></div></div>`; }); }
window.buyItem = (id, cost) => { if (!state.statistics || !state.statistics.shop) { state.statistics = state.statistics || {}; state.statistics.shop = { purchases: 0, goldSpent: 0 }; } if(state.gold >= cost) { openConfirmModal("구매 확인", "정말 구매하시겠습니까?", () => { state.gold -= cost; state.statistics.shop.purchases += 1; state.statistics.shop.goldSpent += cost; DataManager.save(state); updateGlobalUI(); renderShop(); showToast("구매가 완료되었습니다."); }); } else { showToast("골드가 부족합니다."); } };
window.openEditSkillModal = (sid) => { editingSkillId = sid; const s = state.skills[sid]; document.getElementById('modal-edit-skill').style.display = 'flex'; document.getElementById('edit-skill-name').value = s.name; const sel = document.getElementById('edit-skill-mastery'); sel.innerHTML = ''; for(let mid in state.masteries) sel.innerHTML += `<option value="${mid}" ${mid===s.mastery?'selected':''}>${state.masteries[mid].name}</option>`; };
window.saveSkillEdit = () => { const n = document.getElementById('edit-skill-name').value.trim(); if(!n) return showToast("이름을 입력해주세요."); state.skills[editingSkillId].name = n; state.skills[editingSkillId].mastery = document.getElementById('edit-skill-mastery').value; DataManager.save(state); updateGlobalUI(); renderCharacter(); renderQuest(); closeModal('modal-edit-skill'); showToast("수정되었습니다."); };
window.deleteSkillEdit = () => { openConfirmModal("스킬 삭제", "스킬을 보관함(휴지통)으로 이동하시겠습니까?", () => { state.skills[editingSkillId].hidden = true; DataManager.save(state); updateGlobalUI(); renderCharacter(); renderQuest(); closeModal('modal-edit-skill'); showToast("보관함으로 이동되었습니다."); }); };
window.openEditMasteryModal = (mid) => { editingMasteryId = mid; const m = state.masteries[mid]; document.getElementById('modal-edit-mastery').style.display = 'flex'; document.getElementById('edit-mastery-name').value = m.name; const sel = document.getElementById('edit-mastery-core'); sel.innerHTML = ''; ['STR','DEX','INT','WIS','VIT'].forEach(c => sel.innerHTML += `<option value="${c}" ${c===m.core?'selected':''}>${state.cores[c].name}</option>`); };
window.saveMasteryEdit = () => { const n = document.getElementById('edit-mastery-name').value.trim(); const targetCore = document.getElementById('edit-mastery-core').value; if(!n) return showToast("이름을 입력해주세요."); const isDuplicate = Object.keys(state.masteries).some(mid => mid !== editingMasteryId && state.masteries[mid].name === n && state.masteries[mid].core === targetCore ); if (isDuplicate) { return showToast(`[${targetCore}] 스탯에 이미 '${n}' 마스터리가 존재합니다.`); } state.masteries[editingMasteryId].name = n; state.masteries[editingMasteryId].core = targetCore; DataManager.save(state); updateGlobalUI(); renderCharacter(); closeModal('modal-edit-mastery'); showToast("수정되었습니다."); };
window.deleteMasteryEdit = () => { openConfirmModal("마스터리 삭제", "이 마스터리와 하위 스킬들이 모두 영구적으로 삭제됩니다.\n계속하시겠습니까?", () => { for(let s in state.skills) if(state.skills[s].mastery === editingMasteryId) delete state.skills[s]; delete state.masteries[editingMasteryId]; DataManager.save(state); updateGlobalUI(); renderCharacter(); renderQuest(); closeModal('modal-edit-mastery'); showToast("삭제되었습니다."); }); };
window.openTitleModal=()=>{document.getElementById('modal-title').style.display='flex';switchTitleTab('title');};
window.switchTitleTab = (t) => { document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); document.getElementById(`tab-btn-${t}`).classList.add('active'); const l = document.getElementById('title-list-container'); l.innerHTML = ''; const unlockList = t === 'title' ? state.unlockedTitles : state.unlockedJobs; const currentEquip = t === 'title' ? state.currentTitle : state.currentJob; const refData = t === 'title' ? TITLE_DATA : JOB_DATA; if (unlockList.length === 0) { l.innerHTML = '<div style="padding:15px; text-align:center; color:#888;">획득한 목록이 없습니다.</div>'; return; } unlockList.forEach(name => { const cls = currentEquip === name ? 'active' : ''; const info = refData.find(d => d.name === name); const descText = info ? info.desc : ''; l.innerHTML += ` <div class="list-item ${cls}" onclick="equip${t === 'title' ? 'Title' : 'Job'}('${name}')"> <div style="display:flex; flex-direction:column; gap:3px;"> <span style="font-weight:bold; font-size:1.1em;">${name}</span> <span style="font-size:0.8em; color:#888;">${descText}</span> </div> ${cls ? '<span class="material-icons-round" style="color:var(--gold);">check_circle</span>' : ''} </div>`; }); };
window.equipTitle=(t)=>{state.currentTitle=t;DataManager.save(state);updateGlobalUI();switchTitleTab('title');showToast(`칭호가 [${t}](으)로 변경되었습니다.`);};
window.equipJob=(j)=>{state.currentJob=j;DataManager.save(state);updateGlobalUI();switchTitleTab('job');showToast(`직업이 [${j}](으)로 변경되었습니다.`);};
window.openSkillCreateModal=()=>{ document.getElementById('modal-create-skill').style.display='flex'; selectedCoreForCreate = null; document.querySelectorAll('#core-select-group .chip').forEach(x => x.classList.remove('active')); const g=document.getElementById('core-select-group');g.innerHTML=''; ['STR','DEX','INT','WIS','VIT'].forEach(c=>{ const d=document.createElement('div');d.className='chip';d.innerText=c; d.onclick=()=>{ document.querySelectorAll('.chip').forEach(x=>x.classList.remove('active')); d.classList.add('active');selectedCoreForCreate=c;updateMasterySelect(c); }; g.appendChild(d); }); updateMasterySelect(null); document.getElementById('new-skill-name').value = ''; document.getElementById('new-mastery-input').value = ''; };
function updateMasterySelect(c){const s=document.getElementById('new-mastery-select');s.innerHTML='';if(!c){s.innerHTML='<option value="">-- 스탯을 먼저 선택하세요 --</option>';return;}let has=false;for(let m in state.masteries)if(state.masteries[m].core===c){s.innerHTML+=`<option value="${m}">${state.masteries[m].name}</option>`;has=true;}s.innerHTML+='<option value="NEW">+ 새 마스터리 생성</option>';if(!has)s.value="NEW";checkMasteryInput();}
window.checkMasteryInput=()=>{document.getElementById('new-mastery-input').style.display=document.getElementById('new-mastery-select').value==='NEW'?'block':'none';};
window.createSkillAction = () => { if (!selectedCoreForCreate) return showToast("핵심 스탯(STR, INT 등)을 선택해주세요."); let m = document.getElementById('new-mastery-select').value; if (!m) return showToast("마스터리를 선택해주세요."); const mi = document.getElementById('new-mastery-input').value.trim(); const sn = document.getElementById('new-skill-name').value.trim(); if (m === 'NEW') { if (!mi) return showToast("새로운 마스터리 이름을 입력해주세요."); const masteryExists = Object.values(state.masteries).some(mastery => mastery.name === mi && mastery.core === selectedCoreForCreate); if (masteryExists) return showToast("이미 존재하는 마스터리 이름입니다."); m = 'm' + Date.now(); state.masteries[m] = { name: mi, core: selectedCoreForCreate, level: 0 }; } if (!sn) return showToast("스킬 이름을 입력해주세요."); const skillExists = Object.values(state.skills).some(skill => skill.name === sn && skill.mastery === m && !skill.hidden); if (skillExists) return showToast("이미 존재하는 스킬 이름입니다."); state.skills['s' + Date.now()] = { name: sn, mastery: m, seconds: 0, level: 0, hidden: false }; DataManager.save(state); closeModal('modal-create-skill'); updateGlobalUI(); renderCharacter(); showToast("스킬을 습득했습니다."); };
window.openQuestManager=()=>{const sk=Object.values(state.skills).filter(s=>!s.hidden);if(sk.length===0)return showToast("생성된 스킬이 없습니다.");document.getElementById('modal-create-quest').style.display='flex';const m=document.getElementById('quest-main-skill');const s=document.getElementById('quest-sub-skill');m.innerHTML='';s.innerHTML='<option value="">-- 보너스 없음 --</option>';sk.forEach(k=>{const id=Object.keys(state.skills).find(key=>state.skills[key]===k);const o=`<option value="${id}">${k.name}</option>`;m.innerHTML+=o;s.innerHTML+=o;});};
window.createQuestAction=()=>{const n=document.getElementById('new-quest-name').value.trim();const m=document.getElementById('quest-main-skill').value;const s=document.getElementById('quest-sub-skill').value;if(!n) return showToast("의뢰 이름을 입력해주세요."); if(!m) return showToast("주 목표를 선택해주세요."); state.quests['q'+Date.now()]={name:n,mainSkillId:m,subSkillId:s||null};DataManager.save(state);closeModal('modal-create-quest');renderQuest();showToast("의뢰가 등록되었습니다.");};
window.confirmDeleteQuest = (id) => { if (activeQuestId === id) return showToast("현재 진행 중인 의뢰는 삭제할 수 없습니다."); openConfirmModal("의뢰 삭제", "정말 삭제하시겠습니까?", () => { delete state.quests[id]; DataManager.save(state); renderQuest(); showToast("삭제되었습니다."); }); };
window.confirmDeleteShopItem=(id)=>{openConfirmModal("상품 삭제", "정말 삭제하시겠습니까?", ()=>{state.shopItems=state.shopItems.filter(i=>i.id!==id);DataManager.save(state);renderShop();showToast("삭제되었습니다.");});};
window.openCreateShopItemModal=()=>{document.getElementById('modal-create-shop-item').style.display='flex';};
window.createShopItemAction=()=>{const n=document.getElementById('new-shop-item-name').value;const c=document.getElementById('new-shop-item-cost').value;if(!n)return showToast("입력해주세요.");state.shopItems.push({id:'i'+Date.now(),name:n,cost:c});DataManager.save(state);renderShop();closeModal('modal-create-shop-item');};
window.openRestoreSkillMode=()=>{document.getElementById('modal-restore-skill').style.display='flex';const l=document.getElementById('deleted-skill-list');l.innerHTML='';let c=0;for(let sid in state.skills){const s=state.skills[sid];if(s.hidden){c++;l.innerHTML+=`<div class="list-item"><span style="text-decoration:line-through;color:#888;">${s.name}</span><div style="display:flex;gap:5px;"><button class="btn-sm" onclick="restoreSkill('${sid}')">복구</button><button class="btn-sm btn-danger" onclick="permDeleteSkill('${sid}')">삭제</button></div></div>`;}}if(c===0)l.innerHTML='<div style="text-align:center;padding:20px;color:#888;">비어있음</div>';};
window.restoreSkill=(sid)=>{state.skills[sid].hidden=false;DataManager.save(state);openRestoreSkillMode();renderCharacter();showToast("복구되었습니다.");};
window.permDeleteSkill=(sid)=>{openConfirmModal("영구 삭제", "정말 삭제하시겠습니까?", ()=>{delete state.skills[sid];DataManager.save(state);openRestoreSkillMode();updateGlobalUI();showToast("삭제되었습니다.");});};

const switchTab = (t) => { 
    try {
        document.querySelectorAll('.tab-screen').forEach(e => e.classList.remove('active')); 
        const target = document.getElementById(`tab-${t}`);
        if(target) target.classList.add('active'); 
        
        document.querySelectorAll('.nav-btn').forEach(e => e.classList.remove('active')); 
        const navBtn = document.querySelector(`[data-target="${t}"]`);
        if(navBtn) navBtn.classList.add('active'); 
        
        if(t==='character') renderCharacter(); 
        if(t==='quest') renderQuest(); 
        if(t==='inventory') { invState.view = 'portal'; invState.category = null; invState.folderId = null; updateInvRender(); } 
        if(t==='shop') renderShop(); 
        if (t === 'battle') { requestAnimationFrame(() => updateBattleUI(activeQuestId ? 'battle' : 'idle')); }
    } catch(e) {
        console.error("Tab switch error:", e);
    }
};
window.switchTab = switchTab;

// [방어막] 자동 저장 (단, 초기화 중일 땐 저장 안 함!)
setInterval(() => { 
    if (!isResetting && state && state.totalLevel > 0) { 
        DataManager.save(state); 
    } 
}, 5000);

const saveOnExit = () => { 
    if (!isResetting && state) { 
        DataManager.save(state); 
    } 
};
window.addEventListener('beforeunload', saveOnExit);
window.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { saveOnExit(); } });
window.addEventListener('pagehide', saveOnExit);

initApp();
