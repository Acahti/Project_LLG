import { DataManager } from './data.js';
import { BattleManager } from './battle.js';

let state = DataManager.load();
let timer = null;
let sessionSec = 0;
let activeQuestId = null;
let selectedCoreForCreate = null;

// [1] 알림 & 모달 시스템
window.showToast = (msg) => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'toast';
    div.innerText = msg;
    container.appendChild(div);
    setTimeout(() => {
        div.classList.add('hide');
        div.addEventListener('animationend', () => div.remove());
    }, 2500);
};

window.openConfirmModal = (msg, callback) => {
    const modal = document.getElementById('modal-confirm');
    document.getElementById('confirm-msg').innerText = msg;
    modal.style.display = 'flex';
    
    const btnYes = document.getElementById('btn-confirm-yes');
    const newBtnYes = btnYes.cloneNode(true);
    btnYes.parentNode.replaceChild(newBtnYes, btnYes);
    
    newBtnYes.onclick = () => {
        modal.style.display = 'none';
        callback();
    };
};
window.closeConfirmModal = () => document.getElementById('modal-confirm').style.display = 'none';

// [2] 차트 및 UI 업데이트
function drawRadarChart() {
    const canvas = document.getElementById('stat-radar');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const cx = w/2, cy = h/2, radius = w/2 - 40;

    ctx.clearRect(0,0,w,h);
    
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
    for (let i=1; i<=5; i++) {
        ctx.beginPath();
        for (let j=0; j<5; j++) {
            const angle = (Math.PI*2*j)/5 - Math.PI/2;
            const r = (radius/5)*i;
            ctx.lineTo(cx+r*Math.cos(angle), cy+r*Math.sin(angle));
        }
        ctx.closePath(); ctx.stroke();
    }

    const stats = ['STR','DEX','INT','WIS','VIT'];
    const levels = stats.map(key => state.cores[key] ? state.cores[key].level : 0);
    const maxVal = Math.max(20, ...levels) * 1.2;

    ctx.beginPath();
    ctx.fillStyle = 'rgba(77,150,255,0.4)'; ctx.strokeStyle = '#4D96FF'; ctx.lineWidth = 2;
    stats.forEach((key,i) => {
        const val = state.cores[key] ? state.cores[key].level : 0;
        const r = (val/maxVal)*radius;
        const angle = (Math.PI*2*i)/5 - Math.PI/2;
        ctx.lineTo(cx+r*Math.cos(angle), cy+r*Math.sin(angle));
    });
    ctx.closePath(); ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#888'; ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'center';
    stats.forEach((key,i) => {
        const angle = (Math.PI*2*i)/5 - Math.PI/2;
        const x = cx + (radius+20)*Math.cos(angle);
        const y = cy + (radius+20)*Math.sin(angle);
        ctx.fillText(key, x, y+4);
    });
}

function updateGlobalUI() {
    let totalLv = 0;
    
    // 레벨 재계산
    for (let sid in state.skills) state.skills[sid].level = Math.floor(state.skills[sid].seconds / 3600);
    for (let mid in state.masteries) state.masteries[mid].level = 0;
    for (let cid in state.cores) state.cores[cid].level = 0;

    for (let sid in state.skills) {
        const skill = state.skills[sid];
        if(!skill.mastery || !state.masteries[skill.mastery]) continue;
        const mastery = state.masteries[skill.mastery];
        const core = state.cores[mastery.core];
        mastery.level += skill.level;
        core.level += skill.level;
    }

    for (let cid in state.cores) totalLv += state.cores[cid].level;
    state.totalLevel = totalLv;

    document.getElementById('ui-gold').innerText = `${state.gold} G`;
    document.getElementById('header-job-title').innerText = `<${state.currentTitle}>`;
    document.getElementById('header-job-name').innerText = state.currentJob;
    document.getElementById('chart-total-level').innerText = `Lv.${totalLv}`;
    
    checkAchievements();
    drawRadarChart();
}

// [3] 렌더링 함수들
function renderCharacter() {
    const list = document.getElementById('stats-list');
    list.innerHTML = '';
    const order = ['STR', 'DEX', 'INT', 'WIS', 'VIT'];
    
    order.forEach(cid => {
        if (!state.cores[cid]) return;
        const core = state.cores[cid];
        const item = document.createElement('div');
        item.className = 'stat-item';
        item.innerHTML = `
            <div class="stat-header" onclick="toggleStat('${cid}')">
                <span style="color:${core.color}">● ${core.name}</span>
                <span>Lv.${core.level} ▼</span>
            </div>
            <div id="detail-${cid}" class="stat-detail" style="display:none;"></div>
        `;
        list.appendChild(item);

        const detailBox = item.querySelector(`#detail-${cid}`);
        let hasContent = false;
        for (let mid in state.masteries) {
            const mastery = state.masteries[mid];
            if (mastery.core !== cid) continue;
            let skillHtml = '';
            for (let sid in state.skills) {
                const skill = state.skills[sid];
                if (skill.mastery !== mid || skill.hidden) continue;
                const percent = Math.floor((skill.seconds % 3600) / 3600 * 100);
                skillHtml += `
                    <div class="skill-row">
                        <span>- ${skill.name}</span>
                        <span style="color:#aaa;">Lv.${skill.level} (${percent}%)</span>
                    </div>`;
            }
            if(skillHtml) {
                detailBox.innerHTML += `<div class="mastery-title">${mastery.name} (Lv.${mastery.level})</div>${skillHtml}`;
                hasContent = true;
            }
        }
        if(!hasContent) detailBox.innerHTML = '<div style="color:#555; font-size:9px; padding:5px;">스킬 없음</div>';
    });
}
window.toggleStat = (id) => {
    const el = document.getElementById(`detail-${id}`);
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

function renderQuest() {
    const container = document.getElementById('quest-container');
    container.innerHTML = '';
    let count = 0;
    
    for (let qid in state.quests) {
        const quest = state.quests[qid];
        const mainSkill = state.skills[quest.mainSkillId];
        
        // 메인 스킬이 없으면 표시 안 함
        if (!mainSkill || mainSkill.hidden) continue;
        
        // 서브 스킬 정보 가져오기
        let subSkillInfo = '';
        if (quest.subSkillId) {
            const subSkill = state.skills[quest.subSkillId];
            if (subSkill && !subSkill.hidden) {
                subSkillInfo = `<div style="margin-top:4px;"><span class="quest-tag tag-sub">Bonus (20%)</span> ${subSkill.name}</div>`;
            }
        }

        count++;
        const card = document.createElement('div');
        card.className = 'card quest-card';
        card.innerHTML = `
            <div class="quest-info">
                <div class="quest-title">${quest.name}</div>
                <div class="quest-sub">
                    <div><span class="quest-tag tag-main">Main (100%)</span> ${mainSkill.name}</div>
                    ${subSkillInfo}
                </div>
            </div>
            <div style="display:flex; gap:5px;">
                <button class="btn-sm" style="background:var(--accent);" onclick="startBattle('${qid}')">수락</button>
                <button class="btn-sm" style="background:#333; color:#aaa;" onclick="confirmDeleteQuest('${qid}')">삭제</button>
            </div>
        `;
        container.appendChild(card);
    }
    document.getElementById('empty-quest-msg').style.display = count === 0 ? 'block' : 'none';
}

function renderInventory() {
    const grid = document.getElementById('inventory-grid');
    grid.innerHTML = state.inventory.length === 0 ? '<div style="grid-column:1/-1; text-align:center; color:#555; padding:20px;">비어있음</div>' : '';
    state.inventory.forEach(item => {
        const bg = item.type === 'record' ? '#222' : '#111'; 
        const badge = item.type === 'record' ? '<span class="inv-badge" style="color:#6BCB77">기록</span>' : '';
        grid.innerHTML += `<div class="inv-item" style="background:${bg}" onclick="showToast('[${item.name}] ${item.desc}')">${item.icon} ${badge}</div>`;
    });
}

function renderShop() {
    const box = document.getElementById('shop-container');
    box.innerHTML = '';
    state.shopItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card';
        div.style.display = 'flex'; div.style.justifyContent = 'space-between'; div.style.alignItems = 'center';
        div.innerHTML = `
            <div style="flex:1"><span>${item.name}</span></div>
            <div style="display:flex; gap:5px; align-items:center;">
                <button class="btn-shop" style="width:auto; padding:8px 12px;">${item.cost} G</button>
                <button class="btn-sm btn-danger" style="width:auto; padding:8px;" onclick="confirmDeleteShopItem('${item.id}')">🗑️</button>
            </div>
        `;
        div.querySelector('.btn-shop').onclick = () => {
            if (state.gold >= item.cost) {
                openConfirmModal(`'${item.name}' 구매하시겠습니까?`, () => {
                    state.gold -= item.cost;
                    DataManager.save(state);
                    updateGlobalUI();
                    renderShop();
                    showToast("구매 완료!");
                });
            } else showToast("골드가 부족합니다!");
        };
        box.appendChild(div);
    });
}

// [4] 모달 로직 (탭, 스킬 생성 등)
window.openTitleModal = () => { document.getElementById('modal-title').style.display = 'flex'; switchTitleTab('title'); };
window.switchTitleTab = (tabName) => {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-btn-${tabName}`).classList.add('active');
    const list = document.getElementById('title-list-container');
    list.innerHTML = '';
    const items = tabName === 'title' ? state.unlockedTitles : state.unlockedJobs;
    const current = tabName === 'title' ? state.currentTitle : state.currentJob;
    
    if(items.length === 0) list.innerHTML = '<div style="padding:10px; color:#555;">없음</div>';
    items.forEach(item => {
        const cls = current === item ? 'active' : '';
        list.innerHTML += `<div class="list-item ${cls}" onclick="equip${tabName === 'title' ? 'Title' : 'Job'}('${item}')"><span>${item}</span>${cls?'✔':''}</div>`;
    });
};
window.equipTitle = (t) => { state.currentTitle = t; DataManager.save(state); updateGlobalUI(); switchTitleTab('title'); showToast(`칭호: [${t}]`); };
window.equipJob = (j) => { state.currentJob = j; DataManager.save(state); updateGlobalUI(); switchTitleTab('job'); showToast(`직업: [${j}]`); };

window.confirmDeleteQuest = (qid) => { openConfirmModal("삭제하시겠습니까?", () => { delete state.quests[qid]; DataManager.save(state); renderQuest(); showToast("삭제됨"); }); };
window.confirmDeleteShopItem = (itemId) => { openConfirmModal("삭제하시겠습니까?", () => { state.shopItems = state.shopItems.filter(i=>i.id!==itemId); DataManager.save(state); renderShop(); showToast("삭제됨"); }); };

// 스킬 생성
window.openSkillCreateModal = () => {
    document.getElementById('modal-create-skill').style.display = 'flex';
    const chipGroup = document.getElementById('core-select-group');
    chipGroup.innerHTML = '';
    selectedCoreForCreate = null;
    ['STR','DEX','INT','WIS','VIT'].forEach(cid => {
        const chip = document.createElement('div');
        chip.className = 'chip'; chip.innerText = cid;
        chip.onclick = () => {
            document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
            chip.classList.add('active'); selectedCoreForCreate = cid; updateMasterySelect(cid);
        };
        chipGroup.appendChild(chip);
    });
    updateMasterySelect(null);
};
function updateMasterySelect(coreId) {
    const select = document.getElementById('new-mastery-select'); select.innerHTML = '';
    if(!coreId) { select.innerHTML = '<option value="">-- 선택 --</option>'; return; }
    for(let mid in state.masteries) { if(state.masteries[mid].core === coreId) select.innerHTML += `<option value="${mid}">${state.masteries[mid].name}</option>`; }
    select.innerHTML += '<option value="NEW_MASTERY">+ 새 마스터리</option>';
    checkMasteryInput();
}
window.checkMasteryInput = () => { const val = document.getElementById('new-mastery-select').value; document.getElementById('new-mastery-input').style.display = val==='NEW_MASTERY'?'block':'none'; };

window.createSkillAction = () => {
    if(!selectedCoreForCreate) return showToast("스탯을 선택하세요.");
    let mid = document.getElementById('new-mastery-select').value;
    const mInput = document.getElementById('new-mastery-input').value.trim();
    const sName = document.getElementById('new-skill-name').value.trim();
    if(mid === 'NEW_MASTERY' && !mInput) return showToast("마스터리 이름 입력");
    if(!sName) return showToast("스킬 이름 입력");
    if(mid === 'NEW_MASTERY') { mid = 'm' + Date.now(); state.masteries[mid] = { name: mInput, core: selectedCoreForCreate, level: 0 }; }
    state.skills['s'+Date.now()] = { name: sName, mastery: mid, seconds: 0, level: 0, hidden: false };
    DataManager.save(state); closeModal('modal-create-skill'); updateGlobalUI(); renderCharacter(); showToast("스킬 습득!");
};

// [의뢰 생성 - 주/부 스킬]
window.openQuestManager = () => {
    const skills = Object.values(state.skills).filter(s => !s.hidden);
    if(skills.length === 0) return showToast("스킬이 없습니다.");
    
    document.getElementById('modal-create-quest').style.display = 'flex';
    const mainSelect = document.getElementById('quest-main-skill');
    const subSelect = document.getElementById('quest-sub-skill');
    
    mainSelect.innerHTML = '';
    subSelect.innerHTML = '<option value="">-- 선택 안함 (없음) --</option>';
    
    skills.forEach(s => {
        const sid = Object.keys(state.skills).find(k=>state.skills[k]===s);
        const opt = `<option value="${sid}">${s.name} (Lv.${s.level})</option>`;
        mainSelect.innerHTML += opt;
        subSelect.innerHTML += opt;
    });
};

window.createQuestAction = () => {
    const name = document.getElementById('new-quest-name').value.trim();
    const mainSid = document.getElementById('quest-main-skill').value;
    const subSid = document.getElementById('quest-sub-skill').value;
    
    if(!name) return showToast("의뢰 이름을 입력하세요.");
    if(!mainSid) return showToast("주 목표 스킬을 선택하세요.");
    
    state.quests['q'+Date.now()] = { 
        name, 
        mainSkillId: mainSid, 
        subSkillId: subSid || null 
    };
    DataManager.save(state); closeModal('modal-create-quest'); renderQuest(); showToast("의뢰가 등록되었습니다.");
};

function checkAchievements() {
    let updated = false;
    if (state.cores.STR.level >= 10 && !state.unlockedJobs.includes("전사")) { state.unlockedJobs.push("전사"); showToast("직업 해금: 전사"); updated=true; }
    if(updated) DataManager.save(state);
}

// 전투 (보상 100% / 20%)
window.startBattle = (qid) => {
    activeQuestId = qid; 
    const quest = state.quests[qid];
    sessionSec = 0; switchTab('battle');
    document.getElementById('battle-quest-name').innerText = quest.name;
    document.getElementById('battle-earning').innerText = "수련 중...";
    BattleManager.init();
    timer = setInterval(() => {
        sessionSec++;
        const m = Math.floor(sessionSec / 60).toString().padStart(2, '0');
        const s = (sessionSec % 60).toString().padStart(2, '0');
        document.getElementById('battle-timer').innerText = `00:${m}:${s}`;
    }, 1000);
};

document.getElementById('btn-stop').onclick = () => {
    if (!timer) return; clearInterval(timer); timer = null; BattleManager.destroy();
    
    const quest = state.quests[activeQuestId];
    const mainSkill = state.skills[quest.mainSkillId];
    
    state.gold += sessionSec;
    
    // 주 스킬 100%
    if(mainSkill) mainSkill.seconds += sessionSec;
    
    // 부 스킬 20%
    let subMsg = "";
    if (quest.subSkillId) {
        const subSkill = state.skills[quest.subSkillId];
        if (subSkill) {
            const bonusSec = Math.floor(sessionSec * 0.2);
            subSkill.seconds += bonusSec;
            subMsg = `\n[Bonus] ${subSkill.name} +${bonusSec}초`;
        }
    }
    
    let msg = `완료! (+${sessionSec}G)${subMsg}`;
    showToast(msg);
    sessionSec = 0; activeQuestId = null;
    document.getElementById('battle-quest-name').innerText = "-"; 
    document.getElementById('battle-timer').innerText = "00:00:00";
    DataManager.save(state); updateGlobalUI(); switchTab('quest');
};

// [백업 오류 수정]
document.getElementById('btn-import').onclick = () => document.getElementById('file-input').click();
document.getElementById('file-input').onchange = (e) => {
    const reader = new FileReader();
    reader.onload = (evt) => { 
        try { 
            state = JSON.parse(evt.target.result); 
            DataManager.save(state); 
            location.reload(); 
        } catch { showToast("파일 오류!"); } 
    };
    if(e.target.files.length > 0) reader.readAsText(e.target.files[0]);
};

// [초기화 UI 수정]
document.getElementById('btn-reset').onclick = () => openConfirmModal("모든 데이터를 초기화하시겠습니까?", () => DataManager.reset());

// 기타 탭 전환 등 기존 코드 유지
function switchTab(target) {
    document.querySelectorAll('.tab-screen').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab-${target}`).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    document.querySelector(`.nav-btn[data-target="${target}"]`)?.classList.add('active');
    if (target === 'character') renderCharacter();
    if (target === 'quest') renderQuest();
    if (target === 'inventory') renderInventory();
    if (target === 'shop') renderShop();
}
document.querySelectorAll('.nav-btn').forEach(btn => btn.onclick = () => switchTab(btn.dataset.target));
window.closeModal = (id) => document.getElementById(id).style.display = 'none';

window.openSkillManager = () => document.getElementById('modal-skill-manager').style.display = 'flex';
window.openRestoreSkillMode = () => { /* 기존 코드 복붙 */ document.getElementById('modal-skill-manager').style.display = 'none'; document.getElementById('modal-restore-skill').style.display = 'flex'; const list = document.getElementById('deleted-skill-list'); list.innerHTML = ''; for(let sid in state.skills) { const s = state.skills[sid]; const item = document.createElement('div'); item.className = 'list-item'; if(s.hidden) { item.innerHTML = `<span style="text-decoration:line-through;color:#666;font-size:9px;">${s.name}</span><div style="display:flex;gap:5px;"><button class="btn-sm" onclick="restoreSkill('${sid}')">복구</button><button class="btn-sm btn-danger" onclick="permDeleteSkill('${sid}')">삭제</button></div>`; } else { item.innerHTML = `<span>${s.name}</span><button class="btn-sm btn-danger" onclick="softDeleteSkill('${sid}')">보관</button>`; } list.appendChild(item); } };
window.softDeleteSkill = (sid) => { state.skills[sid].hidden = true; DataManager.save(state); openRestoreSkillMode(); renderQuest(); };
window.restoreSkill = (sid) => { state.skills[sid].hidden = false; DataManager.save(state); openRestoreSkillMode(); renderQuest(); };
window.permDeleteSkill = (sid) => { openConfirmModal("영구 삭제?", () => { delete state.skills[sid]; DataManager.save(state); openRestoreSkillMode(); updateGlobalUI(); showToast("삭제됨"); }); };

window.openSettingsModal = () => document.getElementById('modal-settings').style.display = 'flex';
window.openCreateShopItemModal = () => document.getElementById('modal-create-shop-item').style.display = 'flex';
window.createShopItemAction = () => { const n=document.getElementById('new-shop-item-name').value; const c=document.getElementById('new-shop-item-cost').value; if(!n)return showToast("입력하세요"); state.shopItems.push({id:'i'+Date.now(),name:n,cost:c}); DataManager.save(state); renderShop(); closeModal('modal-create-shop-item'); };
window.openCreateItemModal = () => { document.getElementById('modal-create-item').style.display = 'flex'; document.getElementById('new-item-name').value = ''; };
window.createItemAction = () => { const n = document.getElementById('new-item-name').value; const d = document.getElementById('new-item-desc').value; const i = document.getElementById('new-item-icon').value; if(!n) return showToast("이름 입력"); state.inventory.push({ type: 'record', icon: i||'📦', name: n, desc: d||'' }); DataManager.save(state); renderInventory(); closeModal('modal-create-item'); showToast("기록됨"); };

updateGlobalUI(); renderCharacter();
