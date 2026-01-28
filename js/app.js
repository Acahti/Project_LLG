import { DataManager } from './data.js';
import { BattleManager } from './battle.js';

let state = DataManager.load();
let timer = null, sessionSec = 0, activeQuestId = null;
let selectedCoreForCreate = null, editingSkillId = null, editingMasteryId = null, editingItemId = null;

// [v10.9] 보관함 상태 관리 변수
let invState = {
    view: 'portal', // 'portal' or 'list'
    category: null, // 'loot' or 'record'
    folderId: null  // null(Root) or folderId
};
let editingFolderId = null; // 폴더 수정용 임시 변수

// [초기화]
if(!state.settings) state.settings = { theme: 'dark', fontSize: 10 };
const initApp = () => {
    document.body.className = state.settings.theme + '-theme';
    document.documentElement.style.setProperty('--base-font', state.settings.fontSize + 'px');
    document.getElementById('current-font-size').innerText = state.settings.fontSize;
    bindDataEvents();
    updateGlobalUI();
    renderCharacter();
};

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

// [v10.9] 보관함(Inventory) 로직 리뉴얼
window.enterCategory = (cat) => {
    invState.category = cat;
    invState.folderId = null;
    invState.view = 'list';
    updateInvRender();
};
window.invGoBack = () => {
    if (invState.folderId) {
        invState.folderId = null; // 폴더에서 루트로
    } else {
        invState.view = 'portal'; // 루트에서 포털로
        invState.category = null;
    }
    updateInvRender();
};
window.enterFolder = (fid) => {
    invState.folderId = fid;
    updateInvRender();
};

function updateInvRender() {
    const portal = document.getElementById('inv-portal-view');
    const list = document.getElementById('inv-list-view');
    
    if (invState.view === 'portal') {
        portal.style.display = 'flex';
        list.style.display = 'none';
        return;
    }
    
    portal.style.display = 'none';
    list.style.display = 'block';
    
    // Header & Title
    const catName = invState.category === 'loot' ? '전리품 도감' : '기록 보관소';
    let folderName = '최상위';
    if (invState.folderId) {
        const f = state.folders.find(x => x.id === invState.folderId);
        if(f) folderName = f.name;
    }
    document.getElementById('inv-current-path').innerText = `${catName} > ${folderName}`;
    
    // Action Bar (Buttons)
    const bar = document.getElementById('inv-action-bar');
    bar.innerHTML = '';
    
    // 1. 폴더 생성 버튼 (루트에서만 가능, 누구나 가능)
    if (!invState.folderId) {
        bar.innerHTML += `<div class="chip" onclick="openCreateFolderModal()"><span class="material-icons-round" style="font-size:12px; vertical-align:middle;">create_new_folder</span> 폴더 추가</div>`;
    }
    // 2. 아이템 생성 버튼 (기록 카테고리만 가능)
    if (invState.category === 'record') {
        bar.innerHTML += `<div class="chip active" onclick="openCreateItemModal()"><span class="material-icons-round" style="font-size:12px; vertical-align:middle;">add</span> 기록 추가</div>`;
    }
    // 3. 폴더 관리 버튼 (폴더 내부 진입 시)
    if (invState.folderId) {
        bar.innerHTML += `<div class="chip" onclick="openEditFolderModal('${invState.folderId}')"><span class="material-icons-round" style="font-size:12px; vertical-align:middle;">settings</span> 폴더 관리</div>`;
    }
    
    // Grid Rendering
    const g = document.getElementById('inventory-grid');
    g.innerHTML = '';
    
    // Render Folders (Only in Root)
    if (!invState.folderId) {
        const folders = state.folders.filter(f => f.type === invState.category);
        folders.forEach(f => {
            // 폴더 내 아이템 수 계산
            const count = state.inventory.filter(i => (i.type === invState.category || (invState.category==='record'?i.type==='record':i.type!=='record')) && i.folderId === f.id).length;
            g.innerHTML += `
            <div class="folder-item" onclick="enterFolder('${f.id}')">
                <span class="material-icons-round" style="font-size:2em;">folder</span>
                <div class="folder-name">${f.name}</div>
                <span class="folder-badge">${count}</span>
            </div>`;
        });
    }
    
    // Render Items
    // Loot 카테고리는 type이 'loot'이거나 record가 아닌 것들, Record는 type='record'
    const items = state.inventory.filter(i => {
        const isRecord = i.type === 'record';
        const targetCat = invState.category === 'record'; // true if we are in record section
        
        // 카테고리 매칭: Record탭이면 Record타입만, Loot탭이면 Loot타입(혹은 기타)
        if (targetCat !== isRecord) return false;
        
        // 폴더 매칭
        if (invState.folderId) return i.folderId === invState.folderId; // 특정 폴더
        return !i.folderId; // 루트
    });
    
    if (items.length === 0 && (!invState.folderId ? state.folders.filter(f => f.type === invState.category).length === 0 : true)) {
        g.innerHTML += `<div style="grid-column:1/-1;text-align:center;color:#555;padding:20px;">비어있음</div>`;
    }
    
    items.forEach(i => {
        g.innerHTML += `
        <div class="inv-item" style="background:${i.type==='record'?'var(--bg-panel)':'rgba(0,0,0,0.2)'}" onclick="openItemDetailModal('${i.id}')">
            <span style="font-size:1.5em">${i.icon}</span>
            <span class="inv-badge">${i.type==='record'?'기록':'템'}</span>
        </div>`;
    });
}

// [v10.9] 폴더/아이템 모달 기능
window.openCreateFolderModal = () => {
    editingFolderId = null;
    document.getElementById('folder-modal-title').innerText = "폴더 생성";
    document.getElementById('input-folder-name').value = "";
    document.getElementById('folder-delete-zone').style.display = 'none';
    document.getElementById('modal-folder-manager').style.display = 'flex';
};
window.openEditFolderModal = (fid) => {
    editingFolderId = fid;
    const f = state.folders.find(x => x.id === fid);
    document.getElementById('folder-modal-title').innerText = "폴더 관리";
    document.getElementById('input-folder-name').value = f.name;
    document.getElementById('folder-delete-zone').style.display = 'block';
    document.getElementById('modal-folder-manager').style.display = 'flex';
};
document.getElementById('btn-save-folder').onclick = () => {
    const name = document.getElementById('input-folder-name').value.trim();
    if(!name) return showToast("이름을 입력해주세요.");
    
    if (editingFolderId) { // 수정
        const f = state.folders.find(x => x.id === editingFolderId);
        f.name = name;
        showToast("수정되었습니다.");
    } else { // 생성
        state.folders.push({
            id: 'f' + Date.now(),
            name: name,
            type: invState.category
        });
        showToast("폴더가 생성되었습니다.");
    }
    DataManager.save(state);
    updateInvRender();
    closeModal('modal-folder-manager');
};
window.deleteCurrentFolder = () => {
    // 내용물 확인
    const items = state.inventory.filter(i => i.folderId === editingFolderId);
    if(items.length > 0) return showToast("폴더가 비어있지 않아 삭제할 수 없습니다.");
    
    openConfirmModal("폴더 삭제", "정말 삭제하시겠습니까?", () => {
        state.folders = state.folders.filter(f => f.id !== editingFolderId);
        DataManager.save(state);
        invGoBack(); // 상위로 이동
        closeModal('modal-folder-manager');
        showToast("삭제되었습니다.");
    });
};

window.openItemDetailModal = (id) => {
    editingItemId = id;
    const item = state.inventory.find(i => i.id === id);
    
    document.getElementById('detail-item-icon').innerText = item.icon;
    document.getElementById('detail-item-name').innerText = item.name;
    document.getElementById('detail-item-desc').innerText = item.desc || '(설명 없음)';
    
    // 이동 옵션 (현재 카테고리의 폴더들 + 루트)
    const select = document.getElementById('detail-move-select');
    select.innerHTML = '<option value="">(최상위)</option>';
    const folders = state.folders.filter(f => f.type === invState.category);
    folders.forEach(f => {
        const selected = item.folderId === f.id ? 'selected' : '';
        select.innerHTML += `<option value="${f.id}" ${selected}>${f.name}</option>`;
    });
    
    // 기록물이 아니면 수정/삭제 버튼 숨김
    const isRecord = item.type === 'record';
    document.getElementById('record-only-actions').style.display = isRecord ? 'block' : 'none';
    
    document.getElementById('modal-item-detail').style.display = 'flex';
};
window.moveItemAction = () => {
    const targetFid = document.getElementById('detail-move-select').value || null; // 빈 문자열이면 null(루트)
    const item = state.inventory.find(i => i.id === editingItemId);
    item.folderId = targetFid;
    DataManager.save(state);
    updateInvRender();
    closeModal('modal-item-detail');
    showToast("이동되었습니다.");
};
window.openEditItemMode = () => {
    // 상세창 닫고 기존 수정창 열기
    closeModal('modal-item-detail');
    openEditItemModal(editingItemId); 
};
window.deleteItemAction = () => {
    // 상세창 닫고 삭제 로직 (기존 로직 활용을 위해 재호출)
    closeModal('modal-item-detail');
    openConfirmModal("아이템 삭제", "정말 삭제하시겠습니까?", () => {
        state.inventory = state.inventory.filter(x => x.id !== editingItemId); 
        DataManager.save(state); 
        updateInvRender(); 
        showToast("삭제되었습니다.");
    });
};


function renderShop() {
    const b = document.getElementById('shop-container'); b.innerHTML = '';
    state.shopItems.forEach(i => {
        b.innerHTML += `<div class="card" style="display:flex;justify-content:space-between;align-items:center;"><span>${i.name}</span><div style="display:flex;gap:5px;"><button class="btn-shop btn-sm" onclick="buyItem('${i.id}', ${i.cost})">${i.cost}G</button><button class="btn-sm btn-danger" onclick="confirmDeleteShopItem('${i.id}')">🗑️</button></div></div>`;
    });
}
window.buyItem = (id, cost) => {
    if(state.gold >= cost) openConfirmModal("구매 확인", "정말 구매하시겠습니까?", () => { 
        state.gold -= cost; 
        // [v10.9] 구매 시 루트 Loot로 들어감
        state.inventory.push({
            id: 'buy_'+Date.now(),
            type: 'loot', // or 'shop_item' handled as loot
            name: state.shopItems.find(x=>x.id===id).name,
            icon: '🛍️',
            desc: '상점에서 구매함',
            folderId: null
        });
        DataManager.save(state); updateGlobalUI(); renderShop(); showToast("구매 완료! 보관함을 확인하세요."); 
    });
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

// 아이템 수정 로직 (기존 함수 재활용, 완료 시 렌더링만 변경)
window.openEditItemModal = (id) => {
    editingItemId = id; const i = state.inventory.find(x => x.id === id);
    document.getElementById('modal-create-item').style.display = 'flex'; // 재활용
    // UI 텍스트 변경 (추가 -> 수정) hack
    document.querySelector('#modal-create-item h3').innerText = "기록 수정";
    document.getElementById('new-item-name').value = i.name;
    document.getElementById('new-item-desc').value = i.desc;
    document.getElementById('new-item-icon').value = i.icon;
};
// window.saveItemEdit 대신 createItemAction을 분기처리하여 사용
// (기존 코드 단순화를 위해 createItemAction 수정)

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
document.getElementById('btn-stop').onclick=()=>{if(!timer)return;clearInterval(timer);timer=null;BattleManager.destroy();const q=state.quests[activeQuestId];const ms=state.skills[q.mainSkillId];state.gold+=sessionSec;if(ms)ms.seconds+=sessionSec;if(q.subSkillId){const ss=state.skills[q.subSkillId];if(ss)ss.seconds+=Math.floor(sessionSec*0.2);}
    let msg=`완료! (+${sessionSec}G)`;
    // [v10.9] 전리품 획득 시 folderId: null (루트) 로 생성
    if(sessionSec>60&&Math.random()>0.7){
        const lid='l'+Date.now();
        state.inventory.push({id:lid,type:'loot',icon:'🎁',name:'전리품',desc:'수련 보상', folderId:null});
        msg+=' [전리품 획득!]';
    }
    showToast(msg);sessionSec=0;activeQuestId=null;document.getElementById('battle-quest-name').innerText="-";document.getElementById('battle-timer').innerText="00:00:00";DataManager.save(state);updateGlobalUI();switchTab('quest');
};

window.openCreateShopItemModal=()=>{document.getElementById('modal-create-shop-item').style.display='flex';};
window.createShopItemAction=()=>{const n=document.getElementById('new-shop-item-name').value;const c=document.getElementById('new-shop-item-cost').value;if(!n)return showToast("입력해주세요.");state.shopItems.push({id:'i'+Date.now(),name:n,cost:c});DataManager.save(state);renderShop();closeModal('modal-create-shop-item');};

window.openCreateItemModal=()=>{
    // 초기화 및 모달 열기
    editingItemId = null;
    document.querySelector('#modal-create-item h3').innerText = "기록 추가";
    document.getElementById('new-item-name').value = '';
    document.getElementById('new-item-desc').value = '';
    document.getElementById('new-item-icon').value = '📕';
    document.getElementById('modal-create-item').style.display='flex';
};

window.createItemAction=()=>{
    const n=document.getElementById('new-item-name').value;
    const d=document.getElementById('new-item-desc').value;
    const i=document.getElementById('new-item-icon').value;
    if(!n)return showToast("입력해주세요.");

    if(editingItemId) { // 수정
        const item = state.inventory.find(x => x.id === editingItemId);
        item.name = n; item.desc = d; item.icon = i;
        showToast("수정되었습니다.");
    } else { // 생성
        // 현재 폴더 위치에 생성
        state.inventory.push({
            id:'r'+Date.now(),
            type:'record',
            icon:i||'📦',
            name:n,
            desc:d||'', 
            folderId: invState.folderId
        });
        showToast("기록되었습니다.");
    }
    DataManager.save(state);
    updateInvRender();
    closeModal('modal-create-item');
};

window.openRestoreSkillMode=()=>{document.getElementById('modal-restore-skill').style.display='flex';const l=document.getElementById('deleted-skill-list');l.innerHTML='';let c=0;for(let sid in state.skills){const s=state.skills[sid];if(s.hidden){c++;l.innerHTML+=`<div class="list-item"><span style="text-decoration:line-through;color:#888;">${s.name}</span><div style="display:flex;gap:5px;"><button class="btn-sm" onclick="restoreSkill('${sid}')">복구</button><button class="btn-sm btn-danger" onclick="permDeleteSkill('${sid}')">삭제</button></div></div>`;}}if(c===0)l.innerHTML='<div style="text-align:center;padding:20px;color:#888;">비어있음</div>';};
window.restoreSkill=(sid)=>{state.skills[sid].hidden=false;DataManager.save(state);openRestoreSkillMode();renderCharacter();showToast("복구되었습니다.");};
window.permDeleteSkill=(sid)=>{openConfirmModal("영구 삭제", "정말 삭제하시겠습니까?", ()=>{delete state.skills[sid];DataManager.save(state);openRestoreSkillMode();updateGlobalUI();showToast("삭제되었습니다.");});};

function switchTab(t){
    document.querySelectorAll('.tab-screen').forEach(e=>e.classList.remove('active'));
    document.getElementById(`tab-${t}`).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(e=>e.classList.remove('active'));
    document.querySelector(`[data-target="${t}"]`).classList.add('active');
    
    if(t==='character') renderCharacter();
    if(t==='quest') renderQuest();
    if(t==='inventory') {
        // [v10.9] 탭 전환 시 포털 상태로 리셋? 아니면 유지? -> 포털로 리셋이 깔끔함
        invState.view = 'portal';
        invState.category = null;
        invState.folderId = null;
        updateInvRender();
    }
    if(t==='shop') renderShop();
}
document.querySelectorAll('.nav-btn').forEach(b=>b.onclick=()=>switchTab(b.dataset.target));

initApp();
