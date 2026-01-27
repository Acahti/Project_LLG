import { DataManager } from './data.js';
import { BattleManager } from './battle.js';

let state = DataManager.load();
let timer = null, sessionSec = 0, activeQuestId = null;
let selectedCoreForCreate = null, editingSkillId = null, editingMasteryId = null;

// [필수] 전역 함수 연결
const initGlobal = () => {
    const fns = {
        openSettingsMainModal, openGeneralSettings, openThemeSettings, openDataSettings,
        setTheme, adjustFontSize,
        closeModal, closeConfirmModal, switchTitleTab, equipTitle, equipJob,
        openSkillCreateModal, checkMasteryInput, createSkillAction, toggleStat,
        openEditSkillModal, saveSkillEdit, deleteSkillEdit, openEditMasteryModal,
        saveMasteryEdit, deleteMasteryEdit, openQuestManager, createQuestAction, confirmDeleteQuest,
        startBattle, openRestoreSkillMode, restoreSkill, permDeleteSkill,
        openCreateShopItemModal, createShopItemAction, confirmDeleteShopItem, buyItem,
        openCreateItemModal, createItemAction
    };
    Object.entries(fns).forEach(([k, v]) => window[k] = v);
};

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
function closeAllModals() { document.querySelectorAll('.modal').forEach(m => m.style.display = 'none'); }

// [설정]
function openSettingsMainModal() { closeAllModals(); document.getElementById('modal-settings-main').style.display = 'flex'; }
function openGeneralSettings() { closeAllModals(); document.getElementById('modal-settings-general').style.display = 'flex'; }
function openThemeSettings() { closeAllModals(); document.getElementById('modal-settings-theme').style.display = 'flex'; }
function openDataSettings() { closeAllModals(); document.getElementById('modal-settings-data').style.display = 'flex'; }
function setTheme(t) { state.settings.theme = t; document.body.className = t + '-theme'; DataManager.save(state); showToast("테마가 변경되었습니다."); }
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

// [핵심 로직]
function drawRadarChart() {
    const c = document.getElementById('stat-radar'); if(!c) return;
    const ctx = c.getContext('2d'), w = c.width, h = c.height, cx = w/2, cy = h/2, r = w/2 - 40;
    ctx.clearRect(0,0,w,h); ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border').trim(); ctx.lineWidth = 1;
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

function openQuestManager() { document.getElementById('modal-create-quest').style.display='flex'; const m=document.getElementById('quest-main-skill'); const s=document.getElementById('quest-sub-skill'); m.innerHTML=''; s.innerHTML='<option value="">-- 보너스 없음 --</option>'; Object.entries(state.skills).filter(([k,v])=>!v.hidden).forEach(([k,v])=>{const opt=`<option value="${k}">${v.name}</option>`; m.innerHTML+=opt; s.innerHTML+=opt;}); }
function createQuestAction() { state.quests['q'+Date.now()]={name:document.getElementById('new-quest-name').value, mainSkillId:document.getElementById('quest-main-skill').value, subSkillId:document.getElementById('quest-sub-skill').value}; DataManager.save(state); closeModal('modal-create-quest'); renderQuest(); }
function renderQuest() { const c=document.getElementById('quest-container'); c.innerHTML=''; for(let q in state.quests){ const d=state.quests[q]; const m=state.skills[d.mainSkillId]; if(!m||m.hidden)continue; c.innerHTML+=`<div class="card quest-card"><div class="quest-info"><div class="quest-title">${d.name}</div><div class="quest-sub">Main: ${m.name}</div></div><button class="btn-sm" onclick="startBattle('${q}')">수락</button></div>`; } }
function confirmDeleteQuest(id) { openConfirmModal("삭제", "정말 삭제하시겠습니까?", ()=>{delete state.quests[id]; DataManager.save(state); renderQuest();}); }

function startBattle(id) { activeQuestId=id; sessionSec=0; document.querySelectorAll('.tab-screen').forEach(s=>s.classList.remove('active')); document.getElementById('tab-battle').classList.add('active'); document.getElementById('battle-quest-name').innerText=state.quests[id].name; BattleManager.init(); timer=setInterval(()=>{sessionSec++; document.getElementById('battle-timer').innerText=`${sessionSec}`;}, 1000); }
document.getElementById('btn-stop').onclick=()=>{ clearInterval(timer); BattleManager.destroy(); const q=state.quests[activeQuestId]; state.skills[q.mainSkillId].seconds+=sessionSec; state.gold+=sessionSec; if(q.subSkillId)state.skills[q.subSkillId].seconds+=Math.floor(sessionSec*0.2); DataManager.save(state); updateGlobalUI(); showToast("완료"); document.querySelectorAll('.tab-screen').forEach(s=>s.classList.remove('active')); document.getElementById('tab-quest').classList.add('active'); };

// 보관함 (v9.1 심플 버전)
function openCreateItemModal() { document.getElementById('modal-create-item').style.display='flex'; document.getElementById('new-item-name').value=''; }
function createItemAction() { const n=document.getElementById('new-item-name').value; if(!n)return showToast("이름 입력"); state.inventory.push({type:'record', icon:document.getElementById('new-item-icon').value||'📦', name:n, desc:document.getElementById('new-item-desc').value}); DataManager.save(state); renderInventory(); closeModal('modal-create-item'); showToast("기록됨"); }
function renderInventory() { const g=document.getElementById('inventory-grid'); g.innerHTML=state.inventory.length===0?'<div style="grid-column:1/-1;text-align:center;color:#555;padding:20px;">비어있음</div>':''; state.inventory.forEach(i=>{ g.innerHTML+=`<div class="inv-item" onclick="showToast('${i.name}: ${i.desc}')">${i.icon}<span class="inv-badge">${i.type==='record'?'기록':'템'}</span></div>`; }); }

function switchTab(t){ document.querySelectorAll('.tab-screen').forEach(s=>s.classList.remove('active')); document.getElementById(`tab-${t}`).classList.add('active'); document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active')); document.querySelector(`[data-target="${t}"]`).classList.add('active'); if(t==='character')renderCharacter(); if(t==='quest')renderQuest(); if(t==='inventory')renderInventory(); if(t==='shop')renderShop(); }
document.querySelectorAll('.nav-btn').forEach(b=>b.onclick=()=>switchTab(b.dataset.target));

function openCreateShopItemModal() { document.getElementById('modal-create-shop-item').style.display='flex'; }
function createShopItemAction() { state.shopItems.push({id:'i'+Date.now(), name:document.getElementById('new-shop-item-name').value, cost:document.getElementById('new-shop-item-cost').value}); DataManager.save(state); renderShop(); closeModal('modal-create-shop-item'); }
function renderShop() { const c=document.getElementById('shop-container'); c.innerHTML=''; state.shopItems.forEach(i=>c.innerHTML+=`<div class="card" style="display:flex;justify-content:space-between;"><span>${i.name}</span><button class="btn-sm btn-shop" onclick="buyItem('${i.id}',${i.cost})">${i.cost}G</button><button class="btn-sm btn-danger" onclick="confirmDeleteShopItem('${i.id}')">🗑️</button></div>`); }
function buyItem(id,cost) { if(state.gold>=cost){state.gold-=cost;DataManager.save(state);updateGlobalUI();showToast("구매완료");}else showToast("골드부족"); }
function confirmDeleteShopItem(id){ state.shopItems=state.shopItems.filter(i=>i.id!==id); DataManager.save(state); renderShop(); }

function openEditSkillModal(id){ editingSkillId=id; document.getElementById('modal-edit-skill').style.display='flex'; }
function saveSkillEdit(){ state.skills[editingSkillId].name=document.getElementById('edit-skill-name').value; DataManager.save(state); updateGlobalUI(); renderCharacter(); closeModal('modal-edit-skill'); }
function deleteSkillEdit(){ state.skills[editingSkillId].hidden=true; DataManager.save(state); updateGlobalUI(); renderCharacter(); closeModal('modal-edit-skill'); }
function openEditMasteryModal(id){ editingMasteryId=id; document.getElementById('modal-edit-mastery').style.display='flex'; }
function saveMasteryEdit(){ state.masteries[editingMasteryId].name=document.getElementById('edit-mastery-name').value; DataManager.save(state); updateGlobalUI(); renderCharacter(); closeModal('modal-edit-mastery'); }
function deleteMasteryEdit(){ delete state.masteries[editingMasteryId]; DataManager.save(state); updateGlobalUI(); renderCharacter(); closeModal('modal-edit-mastery'); }
function openRestoreSkillMode() { document.getElementById('modal-restore-skill').style.display='flex'; const l=document.getElementById('deleted-skill-list'); l.innerHTML=''; for(let s in state.skills) if(state.skills[s].hidden) l.innerHTML+=`<div class="list-item"><span>${state.skills[s].name}</span><button onclick="restoreSkill('${s}')">복구</button></div>`; }
function restoreSkill(id) { state.skills[id].hidden=false; DataManager.save(state); openRestoreSkillMode(); renderCharacter(); }
function openTitleModal(){ document.getElementById('modal-title').style.display='flex'; switchTitleTab('title'); }
function switchTitleTab(t){ const l=document.getElementById('title-list-container'); l.innerHTML=''; (t==='title'?state.unlockedTitles:state.unlockedJobs).forEach(i=>l.innerHTML+=`<div class="list-item" onclick="equip${t==='title'?'Title':'Job'}('${i}')">${i}</div>`); }
function equipTitle(t){ state.currentTitle=t; DataManager.save(state); updateGlobalUI(); }
function equipJob(j){ state.currentJob=j; DataManager.save(state); updateGlobalUI(); }

initApp();
