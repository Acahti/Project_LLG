import { DataManager } from './data.js';
import { BattleManager } from './battle.js';

let state = DataManager.load();
let timer = null, sessionSec = 0, activeQuestId = null;
let selectedCoreForCreate = null, editingSkillId = null, editingMasteryId = null;

// 초기화
const initApp = () => {
    if(!state.settings) state.settings = { theme: 'dark', fontSize: 10 };
    document.body.className = state.settings.theme + '-theme';
    document.documentElement.style.setProperty('--base-font', state.settings.fontSize + 'px');
    document.getElementById('current-font-size').innerText = state.settings.fontSize;
    
    // [Fix] 초기화 버튼 이벤트 연결 보장
    setTimeout(() => {
        bindDataEvents();
        document.querySelectorAll('.nav-btn').forEach(b => b.onclick = () => switchTab(b.dataset.target));
    }, 0);

    updateGlobalUI();
    renderCharacter();
};

// 기본 기능
window.showToast = (msg) => { const c = document.getElementById('toast-container'); const d = document.createElement('div'); d.className='toast'; d.innerText=msg; c.appendChild(d); setTimeout(()=>d.remove(), 2500); };
window.openConfirmModal = (t, m, cb) => { const el = document.getElementById('modal-confirm'); document.getElementById('confirm-title').innerText=t; document.getElementById('confirm-msg').innerText=m; el.style.display='flex'; const b = document.getElementById('btn-confirm-yes'); const nb = b.cloneNode(true); b.parentNode.replaceChild(nb, b); nb.onclick=()=>{el.style.display='none'; cb();}; };
function closeModal(id) { document.getElementById(id).style.display='none'; }
function closeAllModals() { document.querySelectorAll('.modal').forEach(m=>m.style.display='none'); }
window.closeModal = closeModal; window.closeConfirmModal = () => document.getElementById('modal-confirm').style.display='none';

// 설정
window.openSettingsMainModal = () => { closeAllModals(); document.getElementById('modal-settings-main').style.display='flex'; };
window.openGeneralSettings = () => { closeAllModals(); document.getElementById('modal-settings-general').style.display='flex'; };
window.openThemeSettings = () => { closeAllModals(); document.getElementById('modal-settings-theme').style.display='flex'; };
window.openDataSettings = () => { closeAllModals(); document.getElementById('modal-settings-data').style.display='flex'; };
window.setTheme = (t) => { state.settings.theme=t; document.body.className=t+'-theme'; DataManager.save(state); };
window.adjustFontSize = (d) => { let s=state.settings.fontSize+d; if(s<8)s=8; if(s>16)s=16; state.settings.fontSize=s; document.documentElement.style.setProperty('--base-font', s+'px'); document.getElementById('current-font-size').innerText=s; DataManager.save(state); };

function bindDataEvents() {
    document.getElementById('btn-reset').onclick = () => window.openConfirmModal("초기화", "모든 데이터를 삭제하시겠습니까?", () => DataManager.reset());
    document.getElementById('btn-export').onclick = () => DataManager.export(state);
    document.getElementById('btn-import').onclick = () => document.getElementById('file-input').click();
    document.getElementById('file-input').onchange = (e) => { const r = new FileReader(); r.onload = (v) => { try { state=JSON.parse(v.target.result); DataManager.save(state); location.reload(); } catch { window.showToast("오류"); } }; if(e.target.files.length) r.readAsText(e.target.files[0]); };
}

// 탭 전환
function switchTab(t) {
    document.querySelectorAll('.tab-screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`tab-${t}`).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`.nav-btn[data-target="${t}"]`).classList.add('active');
    if(t==='character') renderCharacter();
    if(t==='quest') renderQuest();
    if(t==='inventory') renderInventory();
    if(t==='shop') renderShop();
}

// 로직 함수들
function updateGlobalUI() {
    let tl = 0; for(let s in state.skills) state.skills[s].level = Math.floor(state.skills[s].seconds/3600);
    for(let m in state.masteries) state.masteries[m].level = 0;
    for(let c in state.cores) state.cores[c].level = 0;
    for(let s in state.skills) { const k=state.skills[s]; if(!k.hidden && k.mastery) { state.masteries[k.mastery].level += k.level; state.cores[state.masteries[k.mastery].core].level += k.level; } }
    for(let c in state.cores) tl += state.cores[c].level;
    document.getElementById('ui-gold').innerText = `${state.gold} G`;
    document.getElementById('header-job-title').innerText = `<${state.currentTitle}>`;
    document.getElementById('header-job-name').innerText = state.currentJob;
    document.getElementById('chart-total-level').innerText = `Lv.${tl}`;
    drawRadarChart();
}

function drawRadarChart() {
    const c = document.getElementById('stat-radar'); if(!c) return; const ctx = c.getContext('2d'), w=c.width, h=c.height, cx=w/2, cy=h/2, r=w/2-40;
    ctx.clearRect(0,0,w,h); ctx.strokeStyle='#333'; ctx.lineWidth=1;
    for(let i=1;i<=5;i++){ ctx.beginPath(); for(let j=0;j<5;j++){ const a=(Math.PI*2*j)/5-Math.PI/2; ctx.lineTo(cx+(r/5)*i*Math.cos(a), cy+(r/5)*i*Math.sin(a)); } ctx.closePath(); ctx.stroke(); }
    const stats=['STR','DEX','INT','WIS','VIT']; const vals=stats.map(k=>state.cores[k].level); const max=Math.max(20, ...vals)*1.2;
    ctx.beginPath(); ctx.fillStyle='rgba(77,150,255,0.4)'; ctx.strokeStyle='#4D96FF'; ctx.lineWidth=2;
    stats.forEach((k,i)=>{ const v=state.cores[k].level; const a=(Math.PI*2*i)/5-Math.PI/2; ctx.lineTo(cx+(v/max)*r*Math.cos(a), cy+(v/max)*r*Math.sin(a)); });
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#888'; ctx.font='12px Noto Sans KR'; ctx.textAlign='center';
    stats.forEach((k,i)=>{ const a=(Math.PI*2*i)/5-Math.PI/2; ctx.fillText(k, cx+(r+20)*Math.cos(a), cy+(r+20)*Math.sin(a)+4); });
}

function renderCharacter() {
    const l = document.getElementById('stats-list'); l.innerHTML='';
    ['STR','DEX','INT','WIS','VIT'].forEach(c => {
        const d = document.createElement('div'); d.className='stat-item';
        d.innerHTML = `<div class="stat-header" onclick="window.toggleStat('${c}')"><span style="color:${state.cores[c].color}">● ${state.cores[c].name}</span><span>Lv.${state.cores[c].level} ▼</span></div><div id="detail-${c}" class="stat-detail" style="display:none;"></div>`;
        l.appendChild(d);
        const b = d.querySelector(`#detail-${c}`);
        let has = false;
        for(let m in state.masteries) {
            if(state.masteries[m].core !== c) continue;
            let sh = '';
            for(let s in state.skills) if(state.skills[s].mastery===m && !state.skills[s].hidden) sh += `<div class="skill-row"><div style="flex:1">- ${state.skills[s].name} (Lv.${state.skills[s].level})</div><button class="btn-edit" onclick="window.openEditSkillModal('${s}')">✎</button></div>`;
            b.innerHTML += `<div class="mastery-header"><span class="mastery-title">${state.masteries[m].name}</span><button class="btn-edit" onclick="window.openEditMasteryModal('${m}')">✎</button></div>${sh||'<div style="color:#555;font-size:0.8em;padding:5px;">스킬 없음</div>'}`;
            has = true;
        }
        if(!has) b.innerHTML = '<div style="color:#555;padding:10px;text-align:center;">스킬 없음</div>'; // [Fix] 스킬 없음 중앙 정렬
    });
}
window.toggleStat = (id) => { const e=document.getElementById(`detail-${id}`); e.style.display=e.style.display==='none'?'block':'none'; };

// 스킬
window.openSkillCreateModal = () => {
    document.getElementById('modal-create-skill').style.display='flex';
    const g=document.getElementById('core-select-group'); g.innerHTML='';
    ['STR','DEX','INT','WIS','VIT'].forEach(c=>{ const d=document.createElement('div'); d.className='chip'; d.innerText=c; d.onclick=()=>{ document.querySelectorAll('.chip').forEach(x=>x.classList.remove('active')); d.classList.add('active'); selectedCoreForCreate=c; window.updateMasterySelect(c); }; g.appendChild(d); });
    window.updateMasterySelect(null);
};
window.updateMasterySelect = (c) => {
    const s=document.getElementById('new-mastery-select'); s.innerHTML='';
    if(!c){ s.innerHTML='<option>-- 스탯 선택 --</option>'; return; }
    for(let m in state.masteries) if(state.masteries[m].core===c) s.innerHTML+=`<option value="${m}">${state.masteries[m].name}</option>`;
    s.innerHTML+='<option value="NEW">+ 새 마스터리</option>';
    window.checkMasteryInput();
};
window.checkMasteryInput = () => { document.getElementById('new-mastery-input').style.display = document.getElementById('new-mastery-select').value==='NEW'?'block':'none'; };
window.createSkillAction = () => {
    if(!selectedCoreForCreate) return window.showToast("스탯을 선택하세요.");
    let m = document.getElementById('new-mastery-select').value;
    if(m==='NEW') { m='m'+Date.now(); state.masteries[m]={name:document.getElementById('new-mastery-input').value, core:selectedCoreForCreate, level:0}; }
    state.skills['s'+Date.now()]={name:document.getElementById('new-skill-name').value, mastery:m, seconds:0, level:0, hidden:false};
    DataManager.save(state); closeModal('modal-create-skill'); updateGlobalUI(); renderCharacter();
};

// 나머지 기능 (단순화)
window.openQuestManager=()=>{document.getElementById('modal-create-quest').style.display='flex'; const m=document.getElementById('quest-main-skill'); m.innerHTML=''; Object.entries(state.skills).forEach(([k,v])=>{if(!v.hidden)m.innerHTML+=`<option value="${k}">${v.name}</option>`}); };
window.createQuestAction=()=>{state.quests['q'+Date.now()]={name:document.getElementById('new-quest-name').value, mainSkillId:document.getElementById('quest-main-skill').value}; DataManager.save(state); closeModal('modal-create-quest'); window.renderQuest();};
window.renderQuest=()=>{const c=document.getElementById('quest-container'); c.innerHTML=''; let cnt=0; for(let q in state.quests){cnt++; c.innerHTML+=`<div class="card quest-card"><div class="quest-info">${state.quests[q].name}</div><button class="btn-sm" onclick="window.startBattle('${q}')">수락</button></div>`;} document.getElementById('empty-quest-msg').style.display=cnt?'none':'block';};
window.startBattle=(id)=>{document.getElementById('tab-battle').classList.add('active'); activeQuestId=id; BattleManager.init(); timer=setInterval(()=>{sessionSec++; document.getElementById('battle-timer').innerText=sessionSec;},1000);};
document.getElementById('btn-stop').onclick=()=>{clearInterval(timer); const q=state.quests[activeQuestId]; state.skills[q.mainSkillId].seconds+=sessionSec; state.gold+=sessionSec; DataManager.save(state); updateGlobalUI(); window.switchTab('quest');};

window.openCreateItemModal=()=>{document.getElementById('modal-create-item').style.display='flex';};
window.createItemAction=()=>{state.inventory.push({id:'i'+Date.now(), name:document.getElementById('new-item-name').value, desc:document.getElementById('new-item-desc').value, icon:document.getElementById('new-item-icon').value}); DataManager.save(state); window.renderInventory(); closeModal('modal-create-item');};
window.renderInventory=()=>{const g=document.getElementById('inventory-grid'); g.innerHTML=''; state.inventory.forEach(i=>g.innerHTML+=`<div class="inv-item">${i.icon}</div>`);};

window.openCreateShopItemModal=()=>{document.getElementById('modal-create-shop-item').style.display='flex';};
window.createShopItemAction=()=>{state.shopItems.push({id:'s'+Date.now(), name:document.getElementById('new-shop-item-name').value, cost:document.getElementById('new-shop-item-cost').value}); DataManager.save(state); window.renderShop(); closeModal('modal-create-shop-item');};
window.renderShop=()=>{const c=document.getElementById('shop-container'); c.innerHTML=''; state.shopItems.forEach(i=>c.innerHTML+=`<div class="card" style="display:flex;justify-content:space-between;"><span>${i.name}</span><button class="btn-sm" onclick="window.buyItem('${i.id}',${i.cost})">${i.cost}G</button></div>`);};
window.buyItem=(id,c)=>{if(state.gold>=c){state.gold-=c; DataManager.save(state); updateGlobalUI(); window.renderShop();}else window.showToast("골드 부족");};

// 복구 & 편집 (단순 연결)
window.openEditSkillModal=(id)=>{editingSkillId=id;document.getElementById('modal-edit-skill').style.display='flex';};
window.saveSkillEdit=()=>{state.skills[editingSkillId].name=document.getElementById('edit-skill-name').value; DataManager.save(state); updateGlobalUI(); renderCharacter(); closeModal('modal-edit-skill');};
window.deleteSkillEdit=()=>{state.skills[editingSkillId].hidden=true; DataManager.save(state); updateGlobalUI(); renderCharacter(); closeModal('modal-edit-skill');};
window.openRestoreSkillMode=()=>{document.getElementById('modal-restore-skill').style.display='flex'; const l=document.getElementById('deleted-skill-list'); l.innerHTML=''; for(let s in state.skills) if(state.skills[s].hidden) l.innerHTML+=`<div class="list-item">${state.skills[s].name}<button onclick="window.restoreSkill('${s}')">복구</button></div>`;};
window.restoreSkill=(id)=>{state.skills[id].hidden=false; DataManager.save(state); window.openRestoreSkillMode(); renderCharacter();};

initApp();
