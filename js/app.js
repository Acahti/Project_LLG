import { DataManager } from './data.js';
import { BattleManager } from './battle.js';

let state = DataManager.load();
let timer = null, sessionSec = 0, activeQuestId = null;
let selectedCoreForCreate = null, editingSkillId = null, editingMasteryId = null;

// [1] 전역 함수 연결 (HTML에서 onclick으로 부르는 함수들)
const initGlobal = () => {
    window.openSettingsMainModal = openSettingsMainModal;
    window.openGeneralSettings = openGeneralSettings;
    window.openThemeSettings = openThemeSettings;
    window.openDataSettings = openDataSettings;
    window.setTheme = setTheme;
    window.adjustFontSize = adjustFontSize;
    window.closeModal = closeModal;
    window.closeConfirmModal = closeConfirmModal;
    window.switchTitleTab = switchTitleTab;
    window.equipTitle = equipTitle;
    window.equipJob = equipJob;
    window.openSkillCreateModal = openSkillCreateModal;
    window.checkMasteryInput = checkMasteryInput;
    window.createSkillAction = createSkillAction;
    window.toggleStat = toggleStat;
    window.openEditSkillModal = openEditSkillModal;
    window.saveSkillEdit = saveSkillEdit;
    window.deleteSkillEdit = deleteSkillEdit;
    window.openEditMasteryModal = openEditMasteryModal;
    window.saveMasteryEdit = saveMasteryEdit;
    window.deleteMasteryEdit = deleteMasteryEdit;
    window.openQuestManager = openQuestManager;
    window.createQuestAction = createQuestAction;
    window.confirmDeleteQuest = confirmDeleteQuest;
    window.startBattle = startBattle;
    window.openRestoreSkillMode = openRestoreSkillMode;
    window.restoreSkill = restoreSkill;
    window.permDeleteSkill = permDeleteSkill;
    window.openCreateShopItemModal = openCreateShopItemModal;
    window.createShopItemAction = createShopItemAction;
    window.confirmDeleteShopItem = confirmDeleteShopItem; // ★ 누락되었던 함수 복구
    window.buyItem = buyItem;
    window.openCreateItemModal = openCreateItemModal;
    window.createItemAction = createItemAction;
    window.openTitleModal = openTitleModal;
};

// [2] 앱 초기화
const initApp = () => {
    initGlobal(); // 전역 함수 연결
    
    // 설정값 적용
    if (!state.settings) state.settings = { theme: 'dark', fontSize: 10 };
    document.body.className = state.settings.theme + '-theme';
    document.documentElement.style.setProperty('--base-font', state.settings.fontSize + 'px');
    const fontSpan = document.getElementById('current-font-size');
    if(fontSpan) fontSpan.innerText = state.settings.fontSize;

    bindDataEvents(); // 데이터 버튼 연결
    updateGlobalUI(); // 화면 그리기
    renderCharacter();
};

// [3] 유틸리티
window.showToast = (msg) => {
    const container = document.getElementById('toast-container');
    const div = document.createElement('div');
    div.className = 'toast'; div.innerText = msg;
    container.appendChild(div);
    setTimeout(() => { div.classList.add('hide'); setTimeout(() => div.remove(), 400); }, 2500);
};

window.openConfirmModal = (title, msg, callback) => {
    const modal = document.getElementById('modal-confirm');
    document.getElementById('confirm-title').innerText = title;
    document.getElementById('confirm-msg').innerText = msg;
    modal.style.display = 'flex';
    
    // 기존 버튼 복제하여 이벤트 리스너 초기화
    const oldBtn = document.getElementById('btn-confirm-yes');
    const newBtn = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);
    
    newBtn.onclick = () => { modal.style.display = 'none'; callback(); };
};

function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function closeConfirmModal() { document.getElementById('modal-confirm').style.display = 'none'; }
function closeAllModals() { document.querySelectorAll('.modal').forEach(m => m.style.display = 'none'); }

// [4] 설정 및 테마
function openSettingsMainModal() { closeAllModals(); document.getElementById('modal-settings-main').style.display = 'flex'; }
function openGeneralSettings() { closeAllModals(); document.getElementById('modal-settings-general').style.display = 'flex'; }
function openThemeSettings() { closeAllModals(); document.getElementById('modal-settings-theme').style.display = 'flex'; }
function openDataSettings() { closeAllModals(); document.getElementById('modal-settings-data').style.display = 'flex'; }

function setTheme(theme) {
    state.settings.theme = theme;
    document.body.className = theme + '-theme';
    DataManager.save(state);
    showToast("테마가 변경되었습니다.");
}

function adjustFontSize(delta) {
    let size = state.settings.fontSize + delta;
    if (size < 8) size = 8;
    if (size > 16) size = 16;
    state.settings.fontSize = size;
    document.documentElement.style.setProperty('--base-font', size + 'px');
    document.getElementById('current-font-size').innerText = size;
    DataManager.save(state);
}

// [5] 데이터 관리 이벤트 연결
function bindDataEvents() {
    const btnReset = document.getElementById('btn-reset');
    if(btnReset) btnReset.onclick = () => openConfirmModal("초기화", "정말 모든 데이터를 삭제하시겠습니까?", () => DataManager.reset());
    
    const btnExport = document.getElementById('btn-export');
    if(btnExport) btnExport.onclick = () => { DataManager.export(state); showToast("백업 파일 생성됨"); };
    
    const btnImport = document.getElementById('btn-import');
    if(btnImport) btnImport.onclick = () => document.getElementById('file-input').click();
    
    const fileInput = document.getElementById('file-input');
    if(fileInput) fileInput.onchange = (e) => {
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                state = JSON.parse(evt.target.result);
                DataManager.save(state);
                location.reload();
            } catch { showToast("파일 오류"); }
        };
        if(e.target.files.length) reader.readAsText(e.target.files[0]);
    };
}

// [6] 핵심 로직 (차트, 퀘스트, 전투 등)
function drawRadarChart() {
    const canvas = document.getElementById('stat-radar');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height, cx = w/2, cy = h/2, radius = w/2 - 40;
    
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border').trim();
    ctx.lineWidth = 1;

    for (let i=1; i<=5; i++) {
        ctx.beginPath();
        for (let j=0; j<5; j++) {
            const angle = (Math.PI*2*j)/5 - Math.PI/2;
            ctx.lineTo(cx + (radius/5)*i*Math.cos(angle), cy + (radius/5)*i*Math.sin(angle));
        }
        ctx.closePath(); ctx.stroke();
    }

    const stats = ['STR', 'DEX', 'INT', 'WIS', 'VIT'];
    const levels = stats.map(key => state.cores[key].level);
    const maxVal = Math.max(20, ...levels) * 1.2;

    ctx.beginPath();
    ctx.fillStyle = 'rgba(77, 150, 255, 0.4)';
    ctx.strokeStyle = '#4D96FF';
    ctx.lineWidth = 2;
    stats.forEach((key, i) => {
        const val = state.cores[key].level;
        const angle = (Math.PI*2*i)/5 - Math.PI/2;
        ctx.lineTo(cx + (val/maxVal)*radius*Math.cos(angle), cy + (val/maxVal)*radius*Math.sin(angle));
    });
    ctx.closePath(); ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#888';
    ctx.font = '10px "Press Start 2P"';
    ctx.textAlign = 'center';
    stats.forEach((key, i) => {
        const angle = (Math.PI*2*i)/5 - Math.PI/2;
        ctx.fillText(key, cx + (radius+20)*Math.cos(angle), cy + (radius+20)*Math.sin(angle) + 4);
    });
}

function updateGlobalUI() {
    let totalLv = 0;
    // 레벨 계산
    for (let sid in state.skills) state.skills[sid].level = Math.floor(state.skills[sid].seconds / 3600);
    for (let mid in state.masteries) state.masteries[mid].level = 0;
    for (let cid in state.cores) state.cores[cid].level = 0;

    for (let sid in state.skills) {
        const skill = state.skills[sid];
        if (skill.hidden || !skill.mastery) continue;
        const mastery = state.masteries[skill.mastery];
        if (mastery) {
            mastery.level += skill.level;
            state.cores[mastery.core].level += skill.level;
        }
    }
    for (let cid in state.cores) totalLv += state.cores[cid].level;
    state.totalLevel = totalLv;

    document.getElementById('ui-gold').innerText = `${state.gold} G`;
    document.getElementById('header-job-title').innerText = `<${state.currentTitle}>`;
    document.getElementById('header-job-name').innerText = state.currentJob;
    document.getElementById('chart-total-level').innerText = `Lv.${totalLv}`;
    
    drawRadarChart();
}

function renderCharacter() {
    const list = document.getElementById('stats-list');
    if (!list) return;
    list.innerHTML = '';
    ['STR','DEX','INT','WIS','VIT'].forEach(cid => {
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
            const m = state.masteries[mid];
            if (m.core !== cid) continue;
            
            let skillHtml = '';
            for (let sid in state.skills) {
                const s = state.skills[sid];
                if (s.mastery === mid && !s.hidden) {
                    skillHtml += `
                        <div class="skill-row">
                            <div style="flex:1">- ${s.name} (Lv.${s.level})</div>
                            <button class="btn-edit" onclick="openEditSkillModal('${sid}')">✎</button>
                        </div>`;
                }
            }
            if (skillHtml || true) {
                detailBox.innerHTML += `
                    <div class="mastery-header">
                        <span class="mastery-title">${m.name}</span>
                        <button class="btn-edit" onclick="openEditMasteryModal('${mid}')">✎</button>
                    </div>
                    ${skillHtml || '<div style="color:#555; font-size:0.8em; padding:5px;">스킬 없음</div>'}
                `;
                hasContent = true;
            }
        }
        if (!hasContent) detailBox.innerHTML = '<div style="color:#555; padding:10px;">데이터 없음</div>';
    });
}

function toggleStat(id) {
    const el = document.getElementById(`detail-${id}`);
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

// [7] 스킬/의뢰/아이템 생성 및 수정 로직
function openSkillCreateModal() {
    document.getElementById('modal-create-skill').style.display = 'flex';
    const group = document.getElementById('core-select-group');
    group.innerHTML = '';
    ['STR','DEX','INT','WIS','VIT'].forEach(c => {
        const chip = document.createElement('div');
        chip.className = 'chip'; chip.innerText = c;
        chip.onclick = () => {
            document.querySelectorAll('.chip').forEach(el => el.classList.remove('active'));
            chip.classList.add('active');
            selectedCoreForCreate = c;
            updateMasterySelect(c);
        };
        group.appendChild(chip);
    });
    updateMasterySelect(null);
}

function updateMasterySelect(coreId) {
    const select = document.getElementById('new-mastery-select');
    select.innerHTML = '';
    if (!coreId) { select.innerHTML = '<option>-- 스탯 선택 --</option>'; return; }
    for (let mid in state.masteries) {
        if (state.masteries[mid].core === coreId) {
            select.innerHTML += `<option value="${mid}">${state.masteries[mid].name}</option>`;
        }
    }
    select.innerHTML += '<option value="NEW">+ 새 마스터리</option>';
    checkMasteryInput();
}

function checkMasteryInput() {
    const val = document.getElementById('new-mastery-select').value;
    document.getElementById('new-mastery-input').style.display = val === 'NEW' ? 'block' : 'none';
}

function createSkillAction() {
    if (!selectedCoreForCreate) return showToast("스탯을 선택하세요.");
    let mid = document.getElementById('new-mastery-select').value;
    const mName = document.getElementById('new-mastery-input').value.trim();
    const sName = document.getElementById('new-skill-name').value.trim();
    
    if (mid === 'NEW' && !mName) return showToast("마스터리 이름 입력");
    if (!sName) return showToast("스킬 이름 입력");
    
    if (mid === 'NEW') {
        mid = 'm' + Date.now();
        state.masteries[mid] = { name: mName, core: selectedCoreForCreate, level: 0 };
    }
    state.skills['s' + Date.now()] = { name: sName, mastery: mid, seconds: 0, level: 0, hidden: false };
    DataManager.save(state);
    closeModal('modal-create-skill');
    updateGlobalUI(); renderCharacter();
    showToast("스킬 습득 완료!");
}

function openQuestManager() {
    document.getElementById('modal-create-quest').style.display = 'flex';
    const m = document.getElementById('quest-main-skill');
    const s = document.getElementById('quest-sub-skill');
    m.innerHTML = ''; s.innerHTML = '<option value="">-- 없음 --</option>';
    
    Object.entries(state.skills).forEach(([id, skill]) => {
        if (!skill.hidden) {
            const opt = `<option value="${id}">${skill.name}</option>`;
            m.innerHTML += opt;
            s.innerHTML += opt;
        }
    });
}

function createQuestAction() {
    const name = document.getElementById('new-quest-name').value.trim();
    const main = document.getElementById('quest-main-skill').value;
    const sub = document.getElementById('quest-sub-skill').value;
    if(!name) return showToast("의뢰 이름 입력");
    state.quests['q'+Date.now()] = { name, mainSkillId: main, subSkillId: sub || null };
    DataManager.save(state);
    closeModal('modal-create-quest');
    renderQuest();
}

function renderQuest() {
    const container = document.getElementById('quest-container');
    container.innerHTML = '';
    let count = 0;
    for (let qid in state.quests) {
        const q = state.quests[qid];
        const s = state.skills[q.mainSkillId];
        if (!s || s.hidden) continue;
        count++;
        container.innerHTML += `
            <div class="card quest-card">
                <div class="quest-info">
                    <div class="quest-title">${q.name}</div>
                    <div class="quest-sub">Main: ${s.name}</div>
                </div>
                <div style="display:flex; gap:5px;">
                    <button class="btn-sm" onclick="startBattle('${qid}')">수락</button>
                    <button class="btn-sm" style="background:#444;" onclick="confirmDeleteQuest('${qid}')">삭제</button>
                </div>
            </div>`;
    }
    document.getElementById('empty-quest-msg').style.display = count === 0 ? 'block' : 'none';
}

function confirmDeleteQuest(id) {
    openConfirmModal("삭제", "정말 삭제하시겠습니까?", () => {
        delete state.quests[id];
        DataManager.save(state);
        renderQuest();
    });
}

// [8] 전투 시스템
function startBattle(id) {
    activeQuestId = id; sessionSec = 0;
    switchTab('battle');
    document.getElementById('battle-quest-name').innerText = state.quests[id].name;
    BattleManager.init();
    timer = setInterval(() => {
        sessionSec++;
        document.getElementById('battle-timer').innerText = sessionSec;
    }, 1000);
}

document.getElementById('btn-stop').onclick = () => {
    clearInterval(timer); BattleManager.destroy();
    const q = state.quests[activeQuestId];
    state.skills[q.mainSkillId].seconds += sessionSec;
    if (q.subSkillId) state.skills[q.subSkillId].seconds += Math.floor(sessionSec * 0.2);
    state.gold += sessionSec;
    
    DataManager.save(state); updateGlobalUI();
    switchTab('quest');
    showToast(`완료! +${sessionSec}G`);
};

// [9] 인벤토리 & 상점
function openCreateItemModal() {
    document.getElementById('modal-create-item').style.display = 'flex';
    document.getElementById('new-item-name').value = '';
}
function createItemAction() {
    const name = document.getElementById('new-item-name').value;
    if (!name) return showToast("이름 입력");
    state.inventory.push({
        id: 'i' + Date.now(), type: 'record',
        icon: document.getElementById('new-item-icon').value || '📦',
        name: name,
        desc: document.getElementById('new-item-desc').value
    });
    DataManager.save(state); renderInventory(); closeModal('modal-create-item');
}
function renderInventory() {
    const grid = document.getElementById('inventory-grid');
    grid.innerHTML = state.inventory.length === 0 ? '<div style="padding:20px; color:#555;">비어있음</div>' : '';
    state.inventory.forEach(i => {
        grid.innerHTML += `<div class="inv-item" onclick="showToast('${i.name}: ${i.desc}')">${i.icon}<span class="inv-badge">${i.type}</span></div>`;
    });
}

function openCreateShopItemModal() { document.getElementById('modal-create-shop-item').style.display = 'flex'; }
function createShopItemAction() {
    state.shopItems.push({
        id: 's'+Date.now(),
        name: document.getElementById('new-shop-item-name').value,
        cost: document.getElementById('new-shop-item-cost').value
    });
    DataManager.save(state); renderShop(); closeModal('modal-create-shop-item');
}
function renderShop() {
    const box = document.getElementById('shop-container'); box.innerHTML = '';
    state.shopItems.forEach(i => {
        box.innerHTML += `
            <div class="card" style="display:flex; justify-content:space-between; align-items:center;">
                <span>${i.name}</span>
                <div style="display:flex; gap:5px;">
                    <button class="btn-shop btn-sm" onclick="buyItem('${i.id}', ${i.cost})">${i.cost}G</button>
                    <button class="btn-sm btn-danger" onclick="confirmDeleteShopItem('${i.id}')">🗑️</button>
                </div>
            </div>`;
    });
}
function confirmDeleteShopItem(id) {
    state.shopItems = state.shopItems.filter(i => i.id !== id);
    DataManager.save(state); renderShop();
}
function buyItem(id, cost) {
    if (state.gold >= cost) {
        state.gold -= cost; DataManager.save(state); updateGlobalUI(); renderShop(); showToast("구매 완료");
    } else showToast("골드 부족");
}

// [10] 편집 및 복구 함수들 (오류 방지용)
function openEditSkillModal(id) { editingSkillId = id; document.getElementById('modal-edit-skill').style.display = 'flex'; }
function saveSkillEdit() { state.skills[editingSkillId].name = document.getElementById('edit-skill-name').value; DataManager.save(state); updateGlobalUI(); renderCharacter(); closeModal('modal-edit-skill'); }
function deleteSkillEdit() { state.skills[editingSkillId].hidden = true; DataManager.save(state); updateGlobalUI(); renderCharacter(); closeModal('modal-edit-skill'); }

function openEditMasteryModal(id) { editingMasteryId = id; document.getElementById('modal-edit-mastery').style.display = 'flex'; }
function saveMasteryEdit() { state.masteries[editingMasteryId].name = document.getElementById('edit-mastery-name').value; DataManager.save(state); updateGlobalUI(); renderCharacter(); closeModal('modal-edit-mastery'); }
function deleteMasteryEdit() { delete state.masteries[editingMasteryId]; DataManager.save(state); updateGlobalUI(); renderCharacter(); closeModal('modal-edit-mastery'); }

function openRestoreSkillMode() {
    document.getElementById('modal-restore-skill').style.display = 'flex';
    const list = document.getElementById('deleted-skill-list'); list.innerHTML = '';
    for (let sid in state.skills) {
        if (state.skills[sid].hidden) {
            list.innerHTML += `<div class="list-item"><span>${state.skills[sid].name}</span><button class="btn-sm" onclick="restoreSkill('${sid}')">복구</button></div>`;
        }
    }
}
function restoreSkill(id) { state.skills[id].hidden = false; DataManager.save(state); openRestoreSkillMode(); renderCharacter(); }
function permDeleteSkill(id) { delete state.skills[id]; DataManager.save(state); openRestoreSkillMode(); }

function openTitleModal() { document.getElementById('modal-title').style.display = 'flex'; switchTitleTab('title'); }
function switchTitleTab(type) {
    const list = document.getElementById('title-list-container'); list.innerHTML = '';
    const items = type === 'title' ? state.unlockedTitles : state.unlockedJobs;
    items.forEach(i => list.innerHTML += `<div class="list-item" onclick="equip${type === 'title' ? 'Title' : 'Job'}('${i}')">${i}</div>`);
}
function equipTitle(t) { state.currentTitle = t; DataManager.save(state); updateGlobalUI(); }
function equipJob(j) { state.currentJob = j; DataManager.save(state); updateGlobalUI(); }

// [11] 탭 전환
function switchTab(target) {
    document.querySelectorAll('.tab-screen').forEach(el => el.classList.remove('active'));
    document.getElementById(`tab-${target}`).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.nav-btn[data-target="${target}"]`).classList.add('active');
    if (target === 'character') renderCharacter();
    if (target === 'quest') renderQuest();
    if (target === 'inventory') renderInventory();
    if (target === 'shop') renderShop();
}
document.querySelectorAll('.nav-btn').forEach(btn => btn.onclick = () => switchTab(btn.dataset.target));

// 앱 실행
initApp();
