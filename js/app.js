import { DataManager } from './data.js';
import { BattleManager } from './battle.js';

let state = DataManager.load();
// 상태 변수
let currentCategory = null, currentFolderId = null, editingItemId = null;
let selectedIcon = 'star', selectedColor = '#4A4A4A', selectedShape = 'shape-square';
let timer = null, sessionSec = 0, activeQuestId = null;
let selectedCoreForCreate = null, editingSkillId = null, editingMasteryId = null;

// [필수] 전역 함수 연결 (HTML onclick 동작 보장)
const initGlobal = () => {
    const fns = {
        openSettingsMainModal, openGeneralSettings, openThemeSettings, openDataSettings,
        setTheme, adjustFontSize, enterCategory, exitToPortal, updateInvRender,
        handleInvAdd, openFolderCreateModal, saveItemAction, openItemDetail, openItemEditModal,
        openMoveModal, deleteItemEdit, closeModal, closeConfirmModal, switchTitleTab, equipTitle, equipJob,
        openSkillCreateModal, checkMasteryInput, createSkillAction, toggleStat,
        openEditSkillModal, saveSkillEdit, deleteSkillEdit, openEditMasteryModal,
        saveMasteryEdit, deleteMasteryEdit, openQuestManager, createQuestAction, confirmDeleteQuest,
        startBattle, openRestoreSkillMode, restoreSkill, permDeleteSkill,
        openCreateShopItemModal, createShopItemAction, confirmDeleteShopItem, buyItem
    };
    Object.entries(fns).forEach(([k, v]) => window[k] = v);
};

// [초기화]
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

// [유틸]
window.showToast = (msg) => {
    const c = document.getElementById('toast-container'); const d = document.createElement('div'); d.className = 'toast'; d.innerText = msg; c.appendChild(d);
    setTimeout(() => { d.classList.add('hide'); setTimeout(() => d.remove(), 400); }, 2500);
};
window.openConfirmModal = (t, m, cb) => {
    const el = document.getElementById('modal-confirm');
    document.getElementById('confirm-title').innerText = t; document.getElementById('confirm-msg').innerText = m;
    el.style.display = 'flex';
    const b = document.getElementById('btn-confirm-yes'); const nb = b.cloneNode(true); b.parentNode.replaceChild(nb, b);
    nb.onclick = () => { el.style.display = 'none'; cb(); };
};
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function closeConfirmModal() { document.getElementById('modal-confirm').style.display = 'none'; }

// [설정]
function openSettingsMainModal() { document.getElementById('modal-settings-main').style.display = 'flex'; }
function openGeneralSettings() { closeModal('modal-settings-main'); document.getElementById('modal-settings-general').style.display = 'flex'; }
function openThemeSettings() { closeModal('modal-settings-main'); document.getElementById('modal-settings-theme').style.display = 'flex'; }
function openDataSettings() { closeModal('modal-settings-main'); document.getElementById('modal-settings-data').style.display = 'flex'; }
function setTheme(t) { state.settings.theme = t; document.body.className = t + '-theme'; DataManager.save(state); showToast("테마 변경됨"); }
function adjustFontSize(d) {
    let s = state.settings.fontSize + d; if(s<8) s=8; if(s>16) s=16;
    state.settings.fontSize = s; document.documentElement.style.setProperty('--base-font', s+'px');
    document.getElementById('current-font-size').innerText = s; DataManager.save(state);
}
function bindDataEvents() {
    document.getElementById('btn-reset').onclick = () => openConfirmModal("초기화", "정말 삭제하시겠습니까?", () => DataManager.reset());
    document.getElementById('btn-export').onclick = () => DataManager.export(state);
    document.getElementById('btn-import').onclick = () => document.getElementById('file-input').click();
    document.getElementById('file-input').onchange = (e) => {
        const r = new FileReader(); r.onload = (v) => { try { state = JSON.parse(v.target.result); DataManager.save(state); location.reload(); } catch { showToast("오류"); } };
        if(e.target.files.length) r.readAsText(e.target.files[0]);
    };
}

// [보관함 v10.0: 포털/배지/폴더]
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
    // 필터링
    let list = state.inventory.filter(i => {
        if(i.category !== currentCategory) return false;
        return currentFolderId ? i.parentId === currentFolderId : !i.parentId;
    });
    // 정렬
    list.sort((a,b) => {
        if(a.type==='folder' && b.type!=='folder') return -1;
        if(a.type!=='folder' && b.type==='folder') return 1;
        if(sort==='date_desc') return b.timestamp - a.timestamp;
        if(sort==='date_asc') return a.timestamp - b.timestamp;
        if(sort==='name_asc') return a.name.localeCompare(b.name);
        if(sort==='name_desc') return b.name.localeCompare(a.name);
        return 0;
    });
    // 렌더링
    list.forEach(i => {
        const div = document.createElement('div'); div.className = 'badge-wrapper';
        const isF = i.type==='folder';
        div.innerHTML = `
            <div class="badge-box ${isF?'shape-square':(i.shape||'shape-square')}" style="background:${isF?'#333':i.color}; ${isF?'border:2px dashed var(--accent)':''}">
                <span class="material-icons-round" style="font-size:2.5em; ${isF?'color:var(--accent)':''}">${isF?'folder':i.icon}</span>
            </div>
            <div class="badge-label">${i.name}</div>
        `;
        div.onclick = () => isF ? (currentFolderId=i.id, updateInvRender()) : openItemDetail(i.id);
        grid.appendChild(div);
    });
}
function openItemDetail(id) {
    const i = state.inventory.find(x=>x.id===id); editingItemId=id;
    document.getElementById('detail-badge').className = `badge-box ${i.shape||'shape-square'}`;
    document.getElementById('detail-badge').style.background = i.color;
    document.getElementById('detail-badge').innerHTML = `<span class="material-icons-round" style="font-size:2.5em;">${i.icon}</span>`;
    document.getElementById('detail-name').innerText = i.name;
    document.getElementById('detail-desc').innerText = i.desc || '내용 없음';
    // 권한: 전리품은 수정/삭제 불가
    const isLoot = i.type==='loot';
    document.getElementById('btn-edit-item').style.display = isLoot ? 'none' : 'flex';
    document.getElementById('btn-delete-item').style.display = isLoot ? 'none' : 'flex';
    document.getElementById('modal-item-detail').style.display = 'flex';
}
function handleInvAdd() { openItemEditModal(null); }
function openItemEditModal(id) {
    closeModal('modal-item-detail'); editingItemId = id;
    const modal = document.getElementById('modal-edit-item');
    document.getElementById('shape-section').style.display = currentCategory==='loot'?'block':'none';
    if(id) {
        const i = state.inventory.find(x=>x.id===id);
        document.getElementById('edit-item-name').value = i.name;
        document.getElementById('edit-item-desc').value = i.desc;
        selectedIcon=i.icon; selectedColor=i.color; selectedShape=i.shape||'shape-square';
    } else {
        document.getElementById('edit-item-name').value = '';
        document.getElementById('edit-item-desc').value = '';
        selectedIcon='star'; selectedShape='shape-square';
        selectedColor = currentCategory==='loot' ? '#4A4A4A' : '#E91E63';
    }
    initPickers(); modal.style.display = 'flex';
}
function initPickers() {
    const iGrid = document.getElementById('icon-picker'); iGrid.innerHTML = '';
    ICON_LIST.forEach(ic => {
        const d = document.createElement('div'); d.className = `picker-item ${ic===selectedIcon?'active':''}`;
        d.innerHTML=`<span class="material-icons-round">${ic}</span>`;
        d.onclick=()=>{selectedIcon=ic; initPickers();}; iGrid.appendChild(d);
    });
    const cGrid = document.getElementById('color-picker'); cGrid.innerHTML = '';
    const cols = currentCategory==='loot'?LOOT_COLORS:RECORD_COLORS;
    cols.forEach(c => {
        const d = document.createElement('div'); d.className = `picker-item ${c===selectedColor?'active':''}`;
        d.style.background=c; d.onclick=()=>{selectedColor=c; initPickers();}; cGrid.appendChild(d);
    });
    const sGrid = document.getElementById('shape-picker'); sGrid.innerHTML = '';
    SHAPES.forEach(s => {
        const d = document.createElement('div'); d.className = `picker-item ${s.id===selectedShape?'active':''}`;
        d.innerHTML=`<span class="material-icons-round">${s.i}</span>`;
        d.onclick=()=>{selectedShape=s.id; initPickers();}; sGrid.appendChild(d);
    });
}
function saveItemAction() {
    const n = document.getElementById('edit-item-name').value.trim(); if(!n) return showToast("이름 입력");
    const data = {
        id: editingItemId || 'i'+Date.now(),
        type: currentCategory, category: currentCategory,
        name: n, desc: document.getElementById('edit-item-desc').value,
        icon: selectedIcon, color: selectedColor,
        shape: currentCategory==='loot'?selectedShape:'shape-square',
        parentId: currentFolderId, timestamp: Date.now()
    };
    if(editingItemId) { const idx=state.inventory.findIndex(x=>x.id===editingItemId); state.inventory[idx]=data; }
    else state.inventory.push(data);
    DataManager.save(state); updateInvRender(); closeModal('modal-edit-item'); showToast("저장됨");
}
function deleteItemEdit() {
    openConfirmModal("삭제", "정말 삭제하시겠습니까?", ()=>{
        state.inventory = state.inventory.filter(x=>x.id!==editingItemId);
        DataManager.save(state); updateInvRender(); closeModal('modal-edit-item'); showToast("삭제됨");
    });
}
function openFolderCreateModal() {
    const n = prompt("폴더 이름 입력", "새 폴더"); if(!n) return;
    state.inventory.push({ id:'f'+Date.now(), type:'folder', category: currentCategory, name: n, parentId: null, timestamp: Date.now() });
    DataManager.save(state); updateInvRender();
}
function openMoveModal(id) { // 이동 로직 (단순화: 0=root, 그외 폴더)
    // 실제 구현시엔 전용 모달이 좋으나 여기선 간단히 confirm/prompt 구조 유지
    const item = state.inventory.find(i=>i.id===id);
    const folders = state.inventory.filter(f=>f.type==='folder' && f.category===currentCategory && f.id!==id);
    let msg = "이동할 위치:\n0. 최상위(밖으로)";
    folders.forEach((f,i)=>msg+=`\n${i+1}. ${f.name}`);
    const res = prompt(msg, "0");
    if(res===null) return;
    if(res==='0') item.parentId = null;
    else { const f = folders[parseInt(res)-1]; if(f) item.parentId = f.id; }
    DataManager.save(state); updateInvRender(); closeModal('modal-item-detail'); showToast("이동됨");
}

// --- [캐릭터/퀘스트/전투 (v9.1 유지)] ---
function drawRadarChart() {
    const c = document.getElementById('stat-radar'); if(!c) return;
    const ctx = c.getContext('2d'), w = c.width, h = c.height, cx = w/2, cy = h/2, r = w/2 - 40;
    ctx.clearRect(0,0,w,h); ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
    for(let i=1; i<=5; i++) { ctx.beginPath(); for(let j=0; j<5; j++) { const a = (Math.PI*2*j)/5 - Math.PI/2; ctx.lineTo(cx+(r/5)*i*Math.cos(a), cy+(r/5)*i*Math.sin(a)); } ctx.closePath(); ctx.stroke(); }
    const stats = ['STR','DEX','INT','WIS','VIT'];
    const levels = stats.map(k => state.cores[k].level);
    const maxVal = Math.max(20, ...levels) * 1.2;
    ctx.beginPath(); ctx.fillStyle = 'rgba(77,150,255,0.4)'; ctx.strokeStyle = '#4D96FF'; ctx.lineWidth = 2;
    stats.forEach((k,i) => { const v = state.cores[k].level; const a = (Math.PI*2*i)/5 - Math.PI/2; ctx.lineTo(cx+(v/maxVal)*r*Math.cos(a), cy+(v/maxVal)*r*Math.sin(a)); });
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#888'; ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'center';
    stats.forEach((k,i) => { const a = (Math.PI*2*i)/5 - Math.PI/2; ctx.fillText(k, cx+(r+20)*Math.cos(a), cy+(r+20)*Math.sin(a)+4); });
}
function updateGlobalUI() {
    let tl = 0;
    for(let s in state.skills) state.skills[s].level = Math.floor(state.skills[s].seconds/3600);
    for(let m in state.masteries) state.masteries[m].level = 0;
    for(let c in state.cores) state.cores[c].level = 0;
    for(let s in state.skills) { const k = state.skills[s]; if(k.hidden||!k.mastery)continue; state.masteries[k.mastery].level+=k.level; state.cores[state.masteries[k.mastery].core].level+=k.level; }
    for(let c in state.cores) tl += state.cores[c].level;
    state.totalLevel = tl;
    document.getElementById('ui-gold').innerText = `${state.gold} G`;
    document.getElementById('header-job-title').innerText = `<${state.currentTitle}>`;
    document.getElementById('header-job-name').innerText = state.currentJob;
    document.getElementById('chart-total-level').innerText = `Lv.${tl}`;
    drawRadarChart();
}
function renderCharacter() {
    const l = document.getElementById('stats-list'); l.innerHTML = '';
    ['STR','DEX','INT','WIS','VIT'].forEach(c => {
        const d = document.createElement('div'); d.className = 'stat-item';
        d.innerHTML = `<div class="stat-header" onclick="toggleStat('${c}')"><span style="color:${state.cores[c].color}">● ${state.cores[c].name}</span><span>Lv.${state.cores[c].level} ▼</span></div><div id="detail-${c}" class="stat-detail" style="display:none;"></div>`;
        l.appendChild(d);
        const b = d.querySelector(`#detail-${c}`);
        for(let m in state.masteries) {
            if(state.masteries[m].core !== c) continue;
            let sh = '';
            for(let s in state.skills) if(state.skills[s].mastery === m && !state.skills[s].hidden) sh += `<div class="skill-row"><div style="flex:1">- ${state.skills[s].name} (Lv.${state.skills[s].level})</div><button class="btn-edit" onclick="openEditSkillModal('${s}')">✎</button></div>`;
            b.innerHTML += `<div class="mastery-header"><span class="mastery-title">${state.masteries[m].name}</span><button class="btn-edit" onclick="openEditMasteryModal('${m}')">✎</button></div>${sh||'<div style="font-size:0.8em;color:#555;padding:5px;">없음</div>'}`;
        }
    });
}
function toggleStat(id) { const e = document.getElementById(`detail-${id}`); e.style.display = e.style.display==='none'?'block':'none'; }

function openSkillCreateModal() { document.getElementById('modal-create-skill').style.display='flex'; const g=document.getElementById('core-select-group'); g.innerHTML=''; ['STR','DEX','INT','WIS','VIT'].forEach(c=>{ const d=document.createElement('div'); d.className='chip'; d.innerText=c; d.onclick=()=>{ document.querySelectorAll('.chip').forEach(x=>x.classList.remove('active')); d.classList.add('active'); selectedCoreForCreate=c; updateMasterySelect(c); }; g.appendChild(d); }); updateMasterySelect(null); }
function updateMasterySelect(c) { const s=document.getElementById('new-mastery-select'); s.innerHTML=''; if(!c){s.innerHTML='<option>-- 선택 --</option>'; return;} for(let m in state.masteries) if(state.masteries[m].core===c) s.innerHTML+=`<option value="${m}">${state.masteries[m].name}</option>`; s.innerHTML+='<option value="NEW">+ 생성</option>'; checkMasteryInput(); }
function checkMasteryInput() { document.getElementById('new-mastery-input').style.display=document.getElementById('new-mastery-select').value==='NEW'?'block':'none'; }
function createSkillAction() { if(!selectedCoreForCreate) return; let m=document.getElementById('new-mastery-select').value; if(m==='NEW'){ m='m'+Date.now(); state.masteries[m]={name:document.getElementById('new-mastery-input').value, core:selectedCoreForCreate, level:0}; } state.skills['s'+Date.now()]={name:document.getElementById('new-skill-name').value, mastery:m, seconds:0, level:0, hidden:false}; DataManager.save(state); closeModal('modal-create-skill'); updateGlobalUI(); renderCharacter(); }

function openQuestManager() { document.getElementById('modal-create-quest').style.display='flex'; const m=document.getElementById('quest-main-skill'); m.innerHTML=''; Object.entries(state.skills).filter(([k,v])=>!v.hidden).forEach(([k,v])=>m.innerHTML+=`<option value="${k}">${v.name}</option>`); }
function createQuestAction() { state.quests['q'+Date.now()]={name:document.getElementById('new-quest-name').value, mainSkillId:document.getElementById('quest-main-skill').value, subSkillId:document.getElementById('quest-sub-skill').value}; DataManager.save(state); closeModal('modal-create-quest'); renderQuest(); }
function renderQuest() { const c=document.getElementById('quest-container'); c.innerHTML=''; for(let q in state.quests){ const d=state.quests[q]; const m=state.skills[d.mainSkillId]; if(!m||m.hidden)continue; c.innerHTML+=`<div class="card quest-card"><div class="quest-info"><div class="quest-title">${d.name}</div><div class="quest-sub">Main: ${m.name}</div></div><button class="btn-sm" onclick="startBattle('${q}')">수락</button></div>`; } }
function confirmDeleteQuest(id) { openConfirmModal("삭제", "정말?", ()=>{delete state.quests[id]; DataManager.save(state); renderQuest();}); }

function startBattle(id) { activeQuestId=id; sessionSec=0; document.querySelectorAll('.tab-screen').forEach(s=>s.classList.remove('active')); document.getElementById('tab-battle').classList.add('active'); document.getElementById('battle-quest-name').innerText=state.quests[id].name; BattleManager.init(); timer=setInterval(()=>{sessionSec++; document.getElementById('battle-timer').innerText=`${sessionSec}`;}, 1000); }
document.getElementById('btn-stop').onclick=()=>{ clearInterval(timer); BattleManager.destroy(); const q=state.quests[activeQuestId]; state.skills[q.mainSkillId].seconds+=sessionSec; state.gold+=sessionSec; DataManager.save(state); updateGlobalUI(); showToast("완료"); document.querySelectorAll('.tab-screen').forEach(s=>s.classList.remove('active')); document.getElementById('tab-quest').classList.add('active'); };

function openRestoreSkillMode() { document.getElementById('modal-restore-skill').style.display='flex'; const l=document.getElementById('deleted-skill-list'); l.innerHTML=''; for(let s in state.skills) if(state.skills[s].hidden) l.innerHTML+=`<div class="list-item"><span>${state.skills[s].name}</span><button onclick="restoreSkill('${s}')">복구</button></div>`; }
function restoreSkill(id) { state.skills[id].hidden=false; DataManager.save(state); openRestoreSkillMode(); renderCharacter(); }
function permDeleteSkill(id) { delete state.skills[id]; DataManager.save(state); openRestoreSkillMode(); }

function switchTab(t){ document.querySelectorAll('.tab-screen').forEach(s=>s.classList.remove('active')); document.getElementById(`tab-${t}`).classList.add('active'); document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active')); document.querySelector(`[data-target="${t}"]`).classList.add('active'); if(t==='inventory'){document.getElementById('inventory-portal').style.display='flex'; document.getElementById('inventory-content').style.display='none';} if(t==='character')renderCharacter(); if(t==='quest')renderQuest(); if(t==='shop')renderShop(); }
document.querySelectorAll('.nav-btn').forEach(b=>b.onclick=()=>switchTab(b.dataset.target));

function openCreateShopItemModal() { document.getElementById('modal-create-shop-item').style.display='flex'; }
function createShopItemAction() { state.shopItems.push({id:'i'+Date.now(), name:document.getElementById('new-shop-item-name').value, cost:document.getElementById('new-shop-item-cost').value}); DataManager.save(state); renderShop(); closeModal('modal-create-shop-item'); }
function renderShop() { const c=document.getElementById('shop-container'); c.innerHTML=''; state.shopItems.forEach(i=>c.innerHTML+=`<div class="card"><span>${i.name}</span><button onclick="buyItem('${i.id}',${i.cost})">${i.cost}G</button></div>`); }
function buyItem(id,cost) { if(state.gold>=cost){state.gold-=cost;DataManager.save(state);updateGlobalUI();showToast("구매완료");}else showToast("골드부족"); }

// 편집용 빈 함수들 (연결용)
function openEditSkillModal(id){ editingSkillId=id; document.getElementById('modal-edit-skill').style.display='flex'; }
function saveSkillEdit(){ state.skills[editingSkillId].name=document.getElementById('edit-skill-name').value; DataManager.save(state); updateGlobalUI(); renderCharacter(); closeModal('modal-edit-skill'); }
function deleteSkillEdit(){ state.skills[editingSkillId].hidden=true; DataManager.save(state); updateGlobalUI(); renderCharacter(); closeModal('modal-edit-skill'); }
function openEditMasteryModal(id){ editingMasteryId=id; document.getElementById('modal-edit-mastery').style.display='flex'; }
function saveMasteryEdit(){ state.masteries[editingMasteryId].name=document.getElementById('edit-mastery-name').value; DataManager.save(state); updateGlobalUI(); renderCharacter(); closeModal('modal-edit-mastery'); }
function deleteMasteryEdit(){ delete state.masteries[editingMasteryId]; DataManager.save(state); updateGlobalUI(); renderCharacter(); closeModal('modal-edit-mastery'); }
function openTitleModal(){ document.getElementById('modal-title').style.display='flex'; switchTitleTab('title'); }
function switchTitleTab(t){ const l=document.getElementById('title-list-container'); l.innerHTML=''; (t==='title'?state.unlockedTitles:state.unlockedJobs).forEach(i=>l.innerHTML+=`<div class="list-item" onclick="equip${t==='title'?'Title':'Job'}('${i}')">${i}</div>`); }
function equipTitle(t){ state.currentTitle=t; DataManager.save(state); updateGlobalUI(); }
function equipJob(j){ state.currentJob=j; DataManager.save(state); updateGlobalUI(); }
function confirmDeleteShopItem(id){ state.shopItems=state.shopItems.filter(i=>i.id!==id); DataManager.save(state); renderShop(); }

initApp();
