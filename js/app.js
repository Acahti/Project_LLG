import { DataManager } from './data.js';
import { BattleManager } from './battle.js';

let state = DataManager.load();
let timer = null, sessionSec = 0, activeQuestId = null;
let selectedCoreForCreate = null, editingSkillId = null, editingMasteryId = null, editingItemId = null;

// [초기화] 설정 적용
if(!state.settings) state.settings = { theme: 'dark', fontSize: 10 };
const initApp = () => {
    document.body.className = state.settings.theme + '-theme';
    document.documentElement.style.setProperty('--base-font', state.settings.fontSize + 'px');
    document.getElementById('current-font-size').innerText = state.settings.fontSize;
    bindDataEvents();
    updateGlobalUI();
    renderCharacter();
};

// [유틸] 알림 & 모달
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

// [설정] 메뉴 & 기능
window.openSettingsMainModal = () => { closeAllModals(); document.getElementById('modal-settings-main').style.display = 'flex'; };
window.openGeneralSettings = () => { closeAllModals(); document.getElementById('modal-settings-general').style.display = 'flex'; };
window.openThemeSettings = () => { closeAllModals(); document.getElementById('modal-settings-theme').style.display = 'flex'; };
window.openDataSettings = () => { closeAllModals(); document.getElementById('modal-settings-data').style.display = 'flex'; };

window.setTheme = (t) => {
    state.settings.theme = t; document.body.className = t + '-theme';
    DataManager.save(state); showToast("테마가 변경되었습니다.");
};
window.adjustFontSize = (d) => {
    let s = state.settings.fontSize + d; if(s<8) s=8; if(s>16) s=16;
    state.settings.fontSize = s;
    document.documentElement.style.setProperty('--base-font', s + 'px');
    document.getElementById('current-font-size').innerText = s;
    DataManager.save(state);
};

const bindDataEvents = () => {
    document.getElementById('btn-reset').onclick = () => openConfirmModal("데이터 초기화", "정말 모든 기록을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.", () => DataManager.reset());
    document.getElementById('btn-export').onclick = () => { DataManager.export(state); showToast("백업 파일이 생성되었습니다."); };
    document.getElementById('btn-import').onclick = () => document.getElementById('file-input').click();
    document.getElementById('file-input').onchange = (e) => {
        const r = new FileReader();
        r.onload = (v) => { try { state = JSON.parse(v.target.result); DataManager.save(state); location.reload(); } catch { showToast("파일 형식이 올바르지 않습니다."); } };
        if(e.target.files.length) r.readAsText(e.target.files[0]);
    };
};

// [코어] UI 업데이트
function drawRadarChart() {
    const cvs = document.getElementById('stat-radar'); if (!cvs) return;
    const ctx = cvs.getContext('2d'), w = cvs.width, h = cvs.height, cx = w/2, cy = h/2, r = w/2 - 40;
    ctx.clearRect(0,0,w,h);
    // Grid
    ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border').trim(); ctx.lineWidth = 1;
    for(let i=1; i<=5; i++) {
        ctx.beginPath();
        for(let j=0; j<5; j++) {
            const a = (Math.PI*2*j)/5 - Math.PI/2;
            ctx.lineTo(cx+(r/5)*i*Math.cos(a), cy+(r/5)*i*Math.sin(a));
        }
        ctx.closePath(); ctx.stroke();
    }
    // Data
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
    // Labels
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
    checkAchievements(); drawRadarChart();
}

function checkAchievements() {
    let u = false;
    if(state.cores.STR.level >= 10 && !state.unlockedJobs.includes("전사")) { state.unlockedJobs.push("전사"); showToast("직업 해금: [전사]"); u=true; }
    if(state.totalLevel >= 50 && !state.unlockedTitles.includes("중수")) { state.unlockedTitles.push("중수"); showToast("칭호 획득: [중수]"); u=true; }
    if(u) DataManager.save(state);
}

// [렌더링]
function renderCharacter() {
    const list = document.getElementById('stats-list'); list.innerHTML = '';
    ['STR','DEX','INT','WIS','VIT'].forEach(cid => {
        const c = state.cores[cid];
        const d = document.createElement('div'); d.className = 'stat-item';
        d.innerHTML = `<div class="stat-header" onclick="toggleStat('${cid}')"><span style="color:${c.color}">● ${c.name}</span><span>Lv.${c.level} ▼</span></div><div id="detail-${cid}" class="stat-detail" style="display:none;"></div>`;
        list.appendChild(d);
        const box = d.querySelector(`#detail-${cid}`);
        let has = false;
        for(let mid in state.masteries) {
            const m = state.masteries[mid]; if(m.core !== cid) continue;
            let sh = '';
            for(let sid in state.skills) {
                const s = state.skills[sid]; if(s.mastery !== mid || s.hidden) continue;
                sh += `<div class="skill-row"><div style="flex:1">- ${s.name} (Lv.${s.level})</div><button class="btn-edit" onclick="openEditSkillModal('${sid}')">✎</button></div>`;
            }
            if(sh || true) {
                box.innerHTML += `<div class="mastery-header"><span class="mastery-title">${m.name} (Lv.${m.level})</span><button class="btn-edit" onclick="openEditMasteryModal('${mid}')">✎</button></div>${sh || '<div style="font-size:0.8em;color:#555;padding:5px;">스킬 없음</div>'}`;
                has = true;
            }
        }
        if(!has) box.innerHTML = '<div style="font-size:0.8em;color:#555;padding:10px;">데이터 없음</div>';
    });
}
window.toggleStat = (id) => { const e = document.getElementById(`detail-${id}`); e.style.display = e.style.display==='none'?'block':'none'; };

function renderQuest() {
    const c = document.getElementById('quest-container'); c.innerHTML = ''; let cnt = 0;
    for(let qid in state.quests) {
        const q = state.quests[qid]; const ms = state.skills[q.mainSkillId]; if(!ms || ms.hidden) continue;
        let sub = ''; if(q.subSkillId) { const ss = state.skills[q.subSkillId]; if(ss && !ss.hidden) sub = `<div style="margin-top:4px;"><span class="quest-tag tag-sub">Bonus (20%)</span> ${ss.name}</div>`; }
        cnt++;
        c.innerHTML += `<div class="card quest-card"><div class="quest-info"><div class="quest-title">${q.name}</div><div class="quest-sub"><div><span class="quest-tag tag-main">Main (100%)</span> ${ms.name}</div>${sub}</div></div><div style="display:flex;gap:5px;"><button class="btn-sm btn-primary" onclick="startBattle('${qid}')">수락</button><button class="btn-sm" style="background:#333;color:#888;" onclick="confirmDeleteQuest('${qid}')">삭제</button></div></div>`;
    }
    document.getElementById('empty-quest-msg').style.display = cnt===0?'block':'none';
}

function renderInventory() {
    const g = document.getElementById('inventory-grid'); g.innerHTML = state.inventory.length===0?'<div style="grid-column:1/-1;text-align:center;color:#555;padding:20px;">비어있음</div>':'';
    state.inventory.forEach(i => {
        g.innerHTML += `<div class="inv-item" style="background:${i.type==='record'?'var(--bg-panel)':'rgba(0,0,0,0.2)'}" onclick="openEditItemModal('${i.id}')">${i.icon}<span class="inv-badge">${i.type==='record'?'기록':'템'}</span></div>`;
    });
}

function renderShop() {
    const b = document.getElementById('shop-container'); b.innerHTML = '';
    state.shopItems.forEach(i => {
        b.innerHTML += `<div class="card" style="display:flex;justify-content:space-between;align-items:center;"><span>${i.name}</span><div style="display:flex;gap:5px;"><button class="btn-shop btn-sm" onclick="buyItem('${i.id}', ${i.cost})">${i.cost}G</button><button class="btn-sm btn-danger" onclick="confirmDeleteShopItem('${i.id}')">🗑️</button></div></div>`;
    });
}
window.buyItem = (id, cost) => {
    if(state.gold >= cost) openConfirmModal("구매", "정말 구매하시겠습니까?", () => { state.gold -= cost; DataManager.save(state); updateGlobalUI(); renderShop(); showToast("구매가 완료되었습니다."); });
    else showToast("골드가 부족합니다.");
};

// [편집] 로직
window.openEditSkillModal = (sid) => {
    editingSkillId = sid; const s = state.skills[sid];
    document.getElementById('modal-edit-skill').style.display = 'flex';
    document.getElementById('edit-skill-name').value = s.name;
    const sel = document.getElementById('edit-skill-mastery'); sel.innerHTML = '';
    for(let mid in state.masteries) sel.innerHTML += `<option value="${mid}" ${mid===s.mastery?'selected':''}>${state.masteries[mid].name}</option>`;
};
window.saveSkillEdit = () => {
    const n = document.getElementById('edit-skill-name').value.trim(); if(!n) return showToast("이름을 입력해주세요.");
    state.skills[editingSkillId].name = n; state.skills[editingSkillId].mastery = document.getElementById('edit-skill-mastery').value;
    DataManager.save(state); updateGlobalUI(); renderCharacter(); renderQuest(); closeModal('modal-edit-skill'); showToast("수정되었습니다.");
};
window.deleteSkillEdit = () => {
    openConfirmModal("스킬 삭제", "스킬을 보관함(휴지통)으로 이동하시겠습니까?", () => { state.skills[editingSkillId].hidden = true; DataManager.save(state); updateGlobalUI(); renderCharacter(); renderQuest(); closeModal('modal-edit-skill'); showToast("보관함으로 이동되었습니다."); });
};

window.openEditMasteryModal = (mid) => {
    editingMasteryId = mid; const m = state.masteries[mid];
    document.getElementById('modal-edit-mastery').style.display = 'flex';
    document.getElementById('edit-mastery-name').value = m.name;
    const sel = document.getElementById('edit-mastery-core'); sel.innerHTML = '';
    ['STR','DEX','INT','WIS','VIT'].forEach(c => sel.innerHTML += `<option value="${c}" ${c===m.core?'selected':''}>${state.cores[c].name}</option>`);
};
window.saveMasteryEdit = () => {
    const n = document.getElementById('edit-mastery-name').value.trim(); if(!n) return showToast("이름을 입력해주세요.");
    state.masteries[editingMasteryId].name = n; state.masteries[editingMasteryId].core = document.getElementById('edit-mastery-core').value;
    DataManager.save(state); updateGlobalUI(); renderCharacter(); closeModal('modal-edit-mastery'); showToast("수정되었습니다.");
};
window.deleteMasteryEdit = () => {
    openConfirmModal("마스터리 삭제", "이 마스터리와 하위 스킬들이 모두 영구적으로 삭제됩니다.\n계속하시겠습니까?", () => {
        for(let s in state.skills) if(state.skills[s].mastery === editingMasteryId) delete state.skills[s];
        delete state.masteries[editingMasteryId]; DataManager.save(state); updateGlobalUI(); renderCharacter(); renderQuest(); closeModal('modal-edit-mastery'); showToast("삭제되었습니다.");
    });
};

window.openEditItemModal = (id) => {
    editingItemId = id; const i = state.inventory.find(x => x.id === id);
    document.getElementById('modal-edit-item').style.display = 'flex';
    document.getElementById('edit-item-name').value = i.name;
    document.getElementById('edit-item-desc').value = i.desc;
    document.getElementById('edit-item-icon').value = i.icon;
};
window.saveItemEdit = () => {
    const n = document.getElementById('edit-item-name').value.trim(); if(!n) return showToast("이름을 입력해주세요.");
    const i = state.inventory.find(x => x.id === editingItemId);
    i.name = n; i.desc = document.getElementById('edit-item-desc').value; i.icon = document.getElementById('edit-item-icon').value;
    DataManager.save(state); renderInventory(); closeModal('modal-edit-item'); showToast("수정되었습니다.");
};
window.deleteItemEdit = () => {
    openConfirmModal("아이템 삭제", "정말 삭제하시겠습니까?", () => {
        state.inventory = state.inventory.filter(x => x.id !== editingItemId); DataManager.save(state); renderInventory(); closeModal('modal-edit-item'); showToast("삭제되었습니다.");
    });
};

// [기타] 생성 및 네비게이션
window.openTitleModal=()=>{document.getElementById('modal-title').style.display='flex';switchTitleTab('title');};
window.switchTitleTab=(t)=>{document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));document.getElementById(`tab-btn-${t}`).classList.add('active');const l=document.getElementById('title-list-container');l.innerHTML='';const it=t==='title'?state.unlockedTitles:state.unlockedJobs;const c=t==='title'?state.currentTitle:state.currentJob;if(it.length===0)l.innerHTML='<div style="padding:10px;color:#888;">목록이 없습니다.</div>';it.forEach(i=>{const cls=c===i?'active':'';l.innerHTML+=`<div class="list-item ${cls}" onclick="equip${t==='title'?'Title':'Job'}('${i}')"><span>${i}</span>${cls?'<span class="material-icons-round" style="font-size:14px;">check</span>':''}</div>`});};
window.equipTitle=(t)=>{state.currentTitle=t;DataManager.save(state);updateGlobalUI();switchTitleTab('title');showToast(`칭호가 [${t}](으)로 변경되었습니다.`);};
window.equipJob=(j)=>{state.currentJob=j;DataManager.save(state);updateGlobalUI();switchTitleTab('job');showToast(`직업이 [${j}](으)로 변경되었습니다.`);};

window.openSkillCreateModal=()=>{document.getElementById('modal-create-skill').style.display='flex';const g=document.getElementById('core-select-group');g.innerHTML='';['STR','DEX','INT','WIS','VIT'].forEach(c=>{const d=document.createElement('div');d.className='chip';d.innerText=c;d.onclick=()=>{document.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));d.classList.add('active');selectedCoreForCreate=c;updateMasterySelect(c);};g.appendChild(d);});updateMasterySelect(null);};
function updateMasterySelect(c){const s=document.getElementById('new-mastery-select');s.innerHTML='';if(!c){s.innerHTML='<option>-- 스탯 선택 --</option>';return;}for(let m in state.masteries)if(state.masteries[m].core===c)s.innerHTML+=`<option value="${m}">${state.masteries[m].name}</option>`;s.innerHTML+='<option value="NEW">+ 새 마스터리 생성</option>';checkMasteryInput();}
window.checkMasteryInput=()=>{document.getElementById('new-mastery-input').style.display=document.getElementById('new-mastery-select').value==='NEW'?'block':'none';};
window.createSkillAction=()=>{if(!selectedCoreForCreate)return showToast("스탯을 선택해주세요.");let m=document.getElementById('new-mastery-select').value;const mi=document.getElementById('new-mastery-input').value.trim();const sn=document.getElementById('new-skill-name').value.trim();if(m==='NEW'&&!mi)return showToast("마스터리 이름을 입력해주세요.");if(!sn)return showToast("스킬 이름을 입력해주세요.");if(m==='NEW'){m='m'+Date.now();state.masteries[m]={name:mi,core:selectedCoreForCreate,level:0};}state.skills['s'+Date.now()]={name:sn,mastery:m,seconds:0,level:0,hidden:false};DataManager.save(state);closeModal('modal-create-skill');updateGlobalUI();renderCharacter();showToast("스킬을 습득했습니다.");};

window.openQuestManager=()=>{const sk=Object.values(state.skills).filter(s=>!s.hidden);if(sk.length===0)return showToast("생성된 스킬이 없습니다.");document.getElementById('modal-create-quest').style.display='flex';const m=document.getElementById('quest-main-skill');const s=document.getElementById('quest-sub-skill');m.innerHTML='';s.innerHTML='<option value="">-- 보너스 없음 --</option>';sk.forEach(k=>{const id=Object.keys(state.skills).find(key=>state.skills[key]===k);const o=`<option value="${id}">${k.name}</option>`;m.innerHTML+=o;s.innerHTML+=o;});};
window.createQuestAction=()=>{const n=document.getElementById('new-quest-name').value.trim();const m=document.getElementById('quest-main-skill').value;const s=document.getElementById('quest-sub-skill').value;if(!n)return showToast("의뢰 이름을 입력해주세요.");if(!m)return showToast("주 목표를 선택해주세요.");state.quests['q'+Date.now()]={name:n,mainSkillId:m,subSkillId:s||null};DataManager.save(state);closeModal('modal-create-quest');renderQuest();showToast("의뢰가 등록되었습니다.");};
window.confirmDeleteQuest=(id)=>{openConfirmModal("의뢰 삭제", "정말 삭제하시겠습니까?", ()=>{delete state.quests[id];DataManager.save(state);renderQuest();showToast("삭제되었습니다.");});};
window.confirmDeleteShopItem=(id)=>{openConfirmModal("상품 삭제", "정말 삭제하시겠습니까?", ()=>{state.shopItems=state.shopItems.filter(i=>i.id!==id);DataManager.save(state);renderShop();showToast("삭제되었습니다.");});};

window.startBattle=(id)=>{activeQuestId=id;sessionSec=0;switchTab('battle');document.getElementById('battle-quest-name').innerText=state.quests[id].name;document.getElementById('battle-earning').innerText="수련 진행 중...";BattleManager.init();timer=setInterval(()=>{sessionSec++;const m=Math.floor(sessionSec/60).toString().padStart(2,'0'),s=(sessionSec%60).toString().padStart(2,'0');document.getElementById('battle-timer').innerText=`00:${m}:${s}`;},1000);};
document.getElementById('btn-stop').onclick=()=>{if(!timer)return;clearInterval(timer);timer=null;BattleManager.destroy();const q=state.quests[activeQuestId];const ms=state.skills[q.mainSkillId];state.gold+=sessionSec;if(ms)ms.seconds+=sessionSec;if(q.subSkillId){const ss=state.skills[q.subSkillId];if(ss)ss.seconds+=Math.floor(sessionSec*0.2);}let msg=`완료! (+${sessionSec}G)`;if(sessionSec>60&&Math.random()>0.7){const lid='l'+Date.now();state.inventory.push({id:lid,type:'loot',icon:'🎁',name:'전리품',desc:'수련 보상'});msg+=' [전리품 획득!]';}showToast(msg);sessionSec=0;activeQuestId=null;document.getElementById('battle-quest-name').innerText="-";document.getElementById('battle-timer').innerText="00:00:00";DataManager.save(state);updateGlobalUI();switchTab('quest');};

window.openCreateShopItemModal=()=>{document.getElementById('modal-create-shop-item').style.display='flex';};
window.createShopItemAction=()=>{const n=document.getElementById('new-shop-item-name').value;const c=document.getElementById('new-shop-item-cost').value;if(!n)return showToast("입력해주세요.");state.shopItems.push({id:'i'+Date.now(),name:n,cost:c});DataManager.save(state);renderShop();closeModal('modal-create-shop-item');};
window.openCreateItemModal=()=>{document.getElementById('modal-create-item').style.display='flex';document.getElementById('new-item-name').value='';};
window.createItemAction=()=>{const n=document.getElementById('new-item-name').value;const d=document.getElementById('new-item-desc').value;const i=document.getElementById('new-item-icon').value;if(!n)return showToast("입력해주세요.");state.inventory.push({id:'r'+Date.now(),type:'record',icon:i||'📦',name:n,desc:d||''});DataManager.save(state);renderInventory();closeModal('modal-create-item');showToast("기록되었습니다.");};

// 복구(휴지통)
window.openRestoreSkillMode=()=>{document.getElementById('modal-restore-skill').style.display='flex';const l=document.getElementById('deleted-skill-list');l.innerHTML='';let c=0;for(let sid in state.skills){const s=state.skills[sid];if(s.hidden){c++;l.innerHTML+=`<div class="list-item"><span style="text-decoration:line-through;color:#888;">${s.name}</span><div style="display:flex;gap:5px;"><button class="btn-sm" onclick="restoreSkill('${sid}')">복구</button><button class="btn-sm btn-danger" onclick="permDeleteSkill('${sid}')">삭제</button></div></div>`;}}if(c===0)l.innerHTML='<div style="text-align:center;padding:20px;color:#888;">비어있음</div>';};
window.restoreSkill=(sid)=>{state.skills[sid].hidden=false;DataManager.save(state);openRestoreSkillMode();renderCharacter();showToast("복구되었습니다.");};
window.permDeleteSkill=(sid)=>{openConfirmModal("영구 삭제", "정말 삭제하시겠습니까?", ()=>{delete state.skills[sid];DataManager.save(state);openRestoreSkillMode();updateGlobalUI();showToast("삭제되었습니다.");});};

function switchTab(t){document.querySelectorAll('.tab-screen').forEach(e=>e.classList.remove('active'));document.getElementById(`tab-${t}`).classList.add('active');document.querySelectorAll('.nav-btn').forEach(e=>e.classList.remove('active'));document.querySelector(`[data-target="${t}"]`).classList.add('active');if(t==='character')renderCharacter();if(t==='quest')renderQuest();if(t==='inventory')renderInventory();if(t==='shop')renderShop();}
document.querySelectorAll('.nav-btn').forEach(b=>b.onclick=()=>switchTab(b.dataset.target));

initApp();
