import { DataManager } from './data.js';
import { BattleManager } from './battle.js';

let state = DataManager.load();
let currentCategory = null, currentFolderId = null, editingItemId = null;
let timer = null, sessionSec = 0, activeQuestId = null;
let selectedIcon = 'star', selectedColor = '#4A4A4A', selectedShape = 'shape-square';
let editingSkillId = null, editingMasteryId = null, selectedCoreForCreate = null;

// --- [전역 참조 설정] ---
const initGlobal = () => {
    const funcs = {
        openSettingsMainModal, openGeneralSettings, openThemeSettings, openDataSettings,
        setTheme, adjustFontSize, enterCategory, exitToPortal, updateInvRender,
        handleInvAdd, openFolderCreateModal, saveItemAction, openItemDetail,
        closeModal, closeConfirmModal, switchTitleTab, equipTitle, equipJob,
        openSkillCreateModal, checkMasteryInput, createSkillAction, toggleStat,
        openEditSkillModal, saveSkillEdit, deleteSkillEdit, openEditMasteryModal,
        saveMasteryEdit, deleteMasteryEdit, openQuestManager, createQuestAction,
        openRestoreSkillMode, restoreSkill, permDeleteSkill
    };
    Object.entries(funcs).forEach(([name, fn]) => window[name] = fn);
};

// --- [초기화] ---
const initApp = () => {
    initGlobal();
    if(!state.settings) state.settings = { theme: 'dark', fontSize: 10 };
    document.body.className = state.settings.theme + '-theme';
    document.documentElement.style.setProperty('--base-font', state.settings.fontSize + 'px');
    document.getElementById('current-font-size').innerText = state.settings.fontSize;
    bindDataEvents();
    updateGlobalUI();
    renderCharacter();
};

// --- [시스템 알림] ---
window.showToast = (msg) => {
    const c = document.getElementById('toast-container');
    const d = document.createElement('div'); d.className = 'toast'; d.innerText = msg;
    c.appendChild(d);
    setTimeout(() => { d.classList.add('hide'); setTimeout(() => d.remove(), 400); }, 2500);
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
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function closeConfirmModal() { document.getElementById('modal-confirm').style.display = 'none'; }

// --- [설정 로직] ---
function openSettingsMainModal() { document.getElementById('modal-settings-main').style.display = 'flex'; }
function openGeneralSettings() { closeModal('modal-settings-main'); document.getElementById('modal-settings-general').style.display = 'flex'; }
function openThemeSettings() { closeModal('modal-settings-main'); document.getElementById('modal-settings-theme').style.display = 'flex'; }
function openDataSettings() { closeModal('modal-settings-main'); document.getElementById('modal-settings-data').style.display = 'flex'; }

function setTheme(t) { state.settings.theme = t; document.body.className = t + '-theme'; DataManager.save(state); showToast("테마 변경 완료"); }
function adjustFontSize(d) {
    state.settings.fontSize = Math.max(8, Math.min(16, state.settings.fontSize + d));
    document.documentElement.style.setProperty('--base-font', state.settings.fontSize + 'px');
    document.getElementById('current-font-size').innerText = state.settings.fontSize;
    DataManager.save(state);
}

// --- [보관함(인벤토리) 핵심 로직] ---
const ICON_LIST = ['star', 'menu_book', 'psychology', 'terminal', 'fitness_center', 'military_tech', 'workspace_premium', 'shield', 'diamond', 'favorite', 'auto_awesome', 'trending_up', 'history_edu', 'palette', 'language', 'construction', 'biotech', 'emoji_events', 'flag', 'bolt'];
const LOOT_COLORS = ['#4A4A4A', '#2D5A27', '#244A7D', '#6A329F', '#A17917'];
const RECORD_COLORS = ['#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#00BCD4', '#4CAF50', '#FFC107', '#FF9800', '#795548'];
const SHAPES = [{id:'shape-square', i:'crop_square'}, {id:'shape-circle', i:'circle'}, {id:'shape-shield', i:'security'}, {id:'shape-hexagon', i:'hexagon'}];

function enterCategory(cat) {
    currentCategory = cat; currentFolderId = null;
    document.getElementById('inventory-portal').style.display = 'none';
    document.getElementById('inventory-content').style.display = 'block';
    document.getElementById('inv-breadcrumb').innerText = cat === 'loot' ? '전리품' : '기록';
    updateInvRender();
}
function exitToPortal() {
    if(currentFolderId) { currentFolderId = null; updateInvRender(); return; }
    document.getElementById('inventory-portal').style.display = 'flex';
    document.getElementById('inventory-content').style.display = 'none';
}
function updateInvRender() {
    const grid = document.getElementById('inventory-grid'); grid.innerHTML = '';
    const sort = document.getElementById('sort-select').value;
    let list = state.inventory.filter(i => i.category === currentCategory && (currentFolderId ? i.parentId === currentFolderId : !i.parentId));
    list.sort((a,b) => {
        if(a.type==='folder' && b.type!=='folder') return -1;
        if(a.type!=='folder' && b.type==='folder') return 1;
        if(sort==='date_desc') return b.timestamp - a.timestamp;
        if(sort==='name_asc') return a.name.localeCompare(b.name);
        return 0;
    });
    list.forEach(i => {
        const div = document.createElement('div'); div.className = 'badge-wrapper';
        const isF = i.type==='folder';
        div.innerHTML = `<div class="badge-box ${isF?'shape-square':i.shape}" style="background:${isF?'#333':i.color}; ${isF?'border:2px dashed var(--accent)':''}"><span class="material-icons-round" style="font-size:2.5em;">${isF?'folder':i.icon}</span></div><div class="badge-label">${i.name}</div>`;
        div.onclick = () => isF ? (currentFolderId=i.id, updateInvRender()) : openItemDetail(i.id);
        grid.appendChild(div);
    });
}
function openItemDetail(id) {
    const i = state.inventory.find(x=>x.id===id); editingItemId=id;
    document.getElementById('detail-badge').className = `badge-box ${i.shape}`;
    document.getElementById('detail-badge').style.background = i.color;
    document.getElementById('detail-badge').innerHTML = `<span class="material-icons-round" style="font-size:2.5em;">${i.icon}</span>`;
    document.getElementById('detail-name').innerText = i.name;
    document.getElementById('detail-desc').innerText = i.desc || '내용 없음';
    document.getElementById('btn-edit-item').style.display = i.type==='loot'?'none':'flex';
    document.getElementById('btn-delete-item').style.display = i.type==='loot'?'none':'flex';
    document.getElementById('modal-item-detail').style.display = 'flex';
}
function handleInvAdd() {
    editingItemId = null; selectedIcon='star'; selectedShape='shape-square';
    selectedColor = currentCategory==='loot'?'#4A4A4A':'#E91E63';
    document.getElementById('edit-item-name').value = '';
    document.getElementById('edit-item-desc').value = '';
    initPickers(); document.getElementById('modal-edit-item').style.display = 'flex';
}
function initPickers() {
    const iGrid = document.getElementById('icon-picker'); iGrid.innerHTML = '';
    ICON_LIST.forEach(ic => {
        const d = document.createElement('div'); d.className = `picker-item ${ic===selectedIcon?'active':''}`; d.innerHTML=`<span class="material-icons-round">${ic}</span>`;
        d.onclick=()=>{selectedIcon=ic; initPickers();}; iGrid.appendChild(d);
    });
    const cGrid = document.getElementById('color-picker'); cGrid.innerHTML = '';
    const cols = currentCategory==='loot'?LOOT_COLORS:RECORD_COLORS;
    cols.forEach(c => {
        const d = document.createElement('div'); d.className = `picker-item ${c===selectedColor?'active':''}`; d.style.background=c;
        d.onclick=()=>{selectedColor=c; initPickers();}; cGrid.appendChild(d);
    });
    const sGrid = document.getElementById('shape-picker'); sGrid.innerHTML = '';
    document.getElementById('shape-section').style.display = currentCategory==='loot'?'block':'none';
    SHAPES.forEach(s => {
        const d = document.createElement('div'); d.className = `picker-item ${s.id===selectedShape?'active':''}`; d.innerHTML=`<span class="material-icons-round">${s.i}</span>`;
        d.onclick=()=>{selectedShape=s.id; initPickers();}; sGrid.appendChild(d);
    });
}
function saveItemAction() {
    const n = document.getElementById('edit-item-name').value.trim(); if(!n) return showToast("이름 입력");
    const data = { id: editingItemId||'i'+Date.now(), type: currentCategory, category: currentCategory, name: n, desc: document.getElementById('edit-item-desc').value, icon: selectedIcon, color: selectedColor, shape: currentCategory==='loot'?selectedShape:'shape-square', parentId: currentFolderId, timestamp: Date.now() };
    if(editingItemId) { const idx=state.inventory.findIndex(x=>x.id===editingItemId); state.inventory[idx]=data; }
    else state.inventory.push(data);
    DataManager.save(state); updateInvRender(); closeModal('modal-edit-item'); showToast("저장 완료");
}
function openFolderCreateModal() {
    const n = prompt("폴더 이름을 입력하세요", "새 폴더"); if(!n) return;
    state.inventory.push({ id:'f'+Date.now(), type:'folder', category: currentCategory, name: n, parentId: null, timestamp: Date.now() });
    DataManager.save(state); updateInvRender();
}

// --- [캐릭터 & 차트 로직] ---
function drawRadarChart() {
    const cvs = document.getElementById('stat-radar'); if (!cvs) return;
    const ctx = cvs.getContext('2d'), w = cvs.width, h = cvs.height, cx = w/2, cy = h/2, r = w/2 - 40;
    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
    for(let i=1; i<=5; i++) {
        ctx.beginPath();
        for(let j=0; j<5; j++) {
            const a = (Math.PI*2*j)/5 - Math.PI/2;
            ctx.lineTo(cx+(r/5)*i*Math.cos(a), cy+(r/5)*i*Math.sin(a));
        }
        ctx.closePath(); ctx.stroke();
    }
    const stats = ['STR','DEX','INT','WIS','VIT'];
    const levels = stats.map(k => state.cores[k]?.level || 0);
    const maxVal = Math.max(20, ...levels) * 1.2;
    ctx.beginPath(); ctx.fillStyle = 'rgba(77,150,255,0.4)'; ctx.strokeStyle = '#4D96FF'; ctx.lineWidth = 2;
    stats.forEach((k,i) => {
        const v = state.cores[k]?.level || 0; const a = (Math.PI*2*i)/5 - Math.PI/2;
        ctx.lineTo(cx+(v/maxVal)*r*Math.cos(a), cy+(v/maxVal)*r*Math.sin(a));
    });
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#888'; ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'center';
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
    drawRadarChart();
}
function renderCharacter() {
    const list = document.getElementById('stats-list'); list.innerHTML = '';
    ['STR','DEX','INT','WIS','VIT'].forEach(cid => {
        const c = state.cores[cid]; const d = document.createElement('div'); d.className = 'stat-item';
        d.innerHTML = `<div class="stat-header" onclick="toggleStat('${cid}')"><span style="color:${c.color}">● ${c.name}</span><span>Lv.${c.level} ▼</span></div><div id="detail-${cid}" class="stat-detail" style="display:none;"></div>`;
        list.appendChild(d);
        const box = d.querySelector(`#detail-${cid}`);
        for(let mid in state.masteries) {
            const m = state.masteries[mid]; if(m.core !== cid) continue;
            let sh = '';
            for(let sid in state.skills) {
                const s = state.skills[sid]; if(s.mastery !== mid || s.hidden) continue;
                sh += `<div class="skill-row"><div style="flex:1">- ${s.name} (Lv.${s.level})</div><button class="btn-edit" onclick="openEditSkillModal('${sid}')">✎</button></div>`;
            }
            box.innerHTML += `<div class="mastery-header"><span class="mastery-title">${m.name}</span><button class="btn-edit" onclick="openEditMasteryModal('${mid}')">✎</button></div>${sh || '<div style="font-size:0.8em;color:#555;">비어있음</div>'}`;
        }
    });
}
function toggleStat(id) { const e = document.getElementById(`detail-${id}`); e.style.display = e.style.display==='none'?'block':'none'; }

// --- [전투 & 의뢰] ---
window.startBattle = (id) => {
    activeQuestId = id; sessionSec = 0; 
    document.querySelectorAll('.tab-screen').forEach(s => s.classList.remove('active'));
    document.getElementById('tab-battle').classList.add('active');
    document.getElementById('battle-quest-name').innerText = state.quests[id].name;
    BattleManager.init();
    timer = setInterval(() => { sessionSec++; document.getElementById('battle-timer').innerText = `00:${Math.floor(sessionSec/60).toString().padStart(2,'0')}:${(sessionSec%60).toString().padStart(2,'0')}`; }, 1000);
};
document.getElementById('btn-stop').onclick = () => {
    clearInterval(timer); BattleManager.destroy();
    const q = state.quests[activeQuestId]; state.skills[q.mainSkillId].seconds += sessionSec; state.gold += sessionSec;
    if(q.subSkillId) state.skills[q.subSkillId].seconds += Math.floor(sessionSec * 0.2);
    DataManager.save(state); updateGlobalUI(); 
    document.getElementById('tab-battle').classList.remove('active');
    document.getElementById('tab-quest').classList.add('active');
    showToast(`수련 완료! +${sessionSec}G`);
};

// --- [데이터 이벤트] ---
const bindDataEvents = () => {
    document.getElementById('btn-reset').onclick = () => openConfirmModal("초기화", "모든 기록을 삭제하시겠습니까?", () => DataManager.reset());
    document.getElementById('btn-export').onclick = () => DataManager.export(state);
    document.getElementById('btn-import').onclick = () => document.getElementById('file-input').click();
    document.getElementById('file-input').onchange = (e) => {
        const r = new FileReader(); r.onload = (v) => { state = JSON.parse(v.target.result); DataManager.save(state); location.reload(); };
        r.readAsText(e.target.files[0]);
    };
};

// --- [탭 전환] ---
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.onclick = () => {
        const t = btn.dataset.target;
        document.querySelectorAll('.tab-screen').forEach(s => s.classList.remove('active'));
        document.getElementById(`tab-${t}`).classList.add('active');
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if(t==='inventory') { document.getElementById('inventory-portal').style.display = 'flex'; document.getElementById('inventory-content').style.display = 'none'; }
        if(t==='character') renderCharacter();
        if(t==='quest') renderQuest();
    };
});

// --- [나머지 함수 (v9.1 동일 복구)] ---
function openSkillCreateModal() { document.getElementById('modal-create-skill').style.display='flex'; const g=document.getElementById('core-select-group'); g.innerHTML=''; ['STR','DEX','INT','WIS','VIT'].forEach(c=>{ const d=document.createElement('div'); d.className='chip'; d.innerText=c; d.onclick=()=>{ document.querySelectorAll('.chip').forEach(x=>x.classList.remove('active')); d.classList.add('active'); selectedCoreForCreate=c; updateMasterySelect(c); }; g.appendChild(d); }); updateMasterySelect(null); }
function updateMasterySelect(c) { const s=document.getElementById('new-mastery-select'); s.innerHTML=''; if(!c){s.innerHTML='<option>-- 선택 --</option>'; return;} for(let m in state.masteries) if(state.masteries[m].core===c) s.innerHTML+=`<option value="${m}">${state.masteries[m].name}</option>`; s.innerHTML+='<option value="NEW">+ 새 마스터리</option>'; checkMasteryInput(); }
function checkMasteryInput() { document.getElementById('new-mastery-input').style.display=document.getElementById('new-mastery-select').value==='NEW'?'block':'none'; }
function createSkillAction() { if(!selectedCoreForCreate) return; let m=document.getElementById('new-mastery-select').value; if(m==='NEW'){ m='m'+Date.now(); state.masteries[m]={name:document.getElementById('new-mastery-input').value, core:selectedCoreForCreate, level:0}; } state.skills['s'+Date.now()]={name:document.getElementById('new-skill-name').value, mastery:m, seconds:0, level:0, hidden:false}; DataManager.save(state); closeModal('modal-create-skill'); updateGlobalUI(); renderCharacter(); }
function renderQuest() { const c=document.getElementById('quest-container'); c.innerHTML=''; for(let qid in state.quests){ const q=state.quests[qid]; const ms=state.skills[q.mainSkillId]; if(!ms||ms.hidden)continue; c.innerHTML+=`<div class="card quest-card"><div class="quest-info"><div class="quest-title">${q.name}</div><div class="quest-sub">Main: ${ms.name}</div></div><button class="btn-sm" onclick="startBattle('${qid}')">수락</button></div>`; } }
function openQuestManager() { document.getElementById('modal-create-quest').style.display='flex'; const m=document.getElementById('quest-main-skill'); m.innerHTML=''; Object.entries(state.skills).filter(([id,s])=>!s.hidden).forEach(([id,s])=>m.innerHTML+=`<option value="${id}">${s.name}</option>`); }
function createQuestAction() { state.quests['q'+Date.now()]={name:document.getElementById('new-quest-name').value, mainSkillId:document.getElementById('quest-main-skill').value, subSkillId:null}; DataManager.save(state); closeModal('modal-create-quest'); renderQuest(); }
function openRestoreSkillMode() { document.getElementById('modal-restore-skill').style.display='flex'; const l=document.getElementById('deleted-skill-list'); l.innerHTML=''; for(let sid in state.skills) if(state.skills[sid].hidden) l.innerHTML+=`<div class="list-item"><span>${state.skills[sid].name}</span><button onclick="restoreSkill('${sid}')">복구</button></div>`; }
function restoreSkill(sid) { state.skills[sid].hidden=false; DataManager.save(state); openRestoreSkillMode(); renderCharacter(); }

initApp();
