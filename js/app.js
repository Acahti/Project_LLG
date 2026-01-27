import { DataManager, SHOP_ITEMS } from './data.js';
import { BattleManager } from './battle.js';

let state = DataManager.load();
let timer = null;
let sessionSec = 0;
let activeQuestId = null;
let selectedCoreForCreate = null;

// --- [1] 세련된 알림 시스템 (Toast) ---
function showToast(msg) {
    const container = document.getElementById('toast-container');
    const div = document.createElement('div');
    div.className = 'toast';
    div.innerText = msg;
    container.appendChild(div);

    // 2.5초 뒤 사라짐
    setTimeout(() => {
        div.classList.add('hide');
        div.addEventListener('animationend', () => div.remove());
    }, 2500);
}

// [신규] 커스텀 확인창 (Confirm Modal)
window.openConfirmModal = (msg, callback) => {
    const modal = document.getElementById('modal-confirm');
    document.getElementById('confirm-msg').innerText = msg;
    modal.style.display = 'flex';
    
    // 기존 이벤트 제거 후 새 이벤트 연결 (중복 방지)
    const btnYes = document.getElementById('btn-confirm-yes');
    const newBtnYes = btnYes.cloneNode(true);
    btnYes.parentNode.replaceChild(newBtnYes, btnYes);
    
    newBtnYes.onclick = () => {
        modal.style.display = 'none';
        callback();
    };
};
window.closeConfirmModal = () => document.getElementById('modal-confirm').style.display = 'none';


// --- [2] 차트 및 UI ---
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
    const maxVal = Math.max(20, ...Object.values(state.cores).map(c=>c.level)) * 1.2;

    ctx.beginPath();
    ctx.fillStyle = 'rgba(77,150,255,0.4)'; ctx.strokeStyle = '#4D96FF'; ctx.lineWidth = 2;
    stats.forEach((key,i) => {
        const val = state.cores[key].level;
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

// --- [3] 렌더링 함수들 ---
function renderCharacter() {
    const list = document.getElementById('stats-list');
    list.innerHTML = '';
    const order = ['STR', 'DEX', 'INT', 'WIS', 'VIT'];
    
    order.forEach(cid => {
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
        if(!hasContent) detailBox.innerHTML = '<div style="color:#555; font-size:9px; padding:5px;">기록 없음</div>';
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
        const linkedSkill = state.skills[quest.linkedSkillId];
        if (!linkedSkill || linkedSkill.hidden) continue;
        count++;
        const percent = Math.floor((linkedSkill.seconds % 3600) / 3600 * 100);
        const card = document.createElement('div');
        card.className = 'card quest-card';
        card.innerHTML = `
            <div class="quest-info">
                <div class="quest-title">${quest.name}</div>
                <div class="quest-sub"><span style="color:var(--accent)">${linkedSkill.name}</span> (Lv.${linkedSkill.level})</div>
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
        // 토스트로 내용 보여주기
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

// --- [4] 신분(칭호/직업) 관리 (탭 분리) ---
window.openTitleModal = () => {
    document.getElementById('modal-title').style.display = 'flex';
    switchTitleTab('title'); // 기본 탭
};
window.switchTitleTab = (tabName) => {
    // 탭 버튼 스타일 활성화
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-btn-${tabName}`).classList.add('active');

    const list = document.getElementById('title-list-container');
    list.innerHTML = '';

    if (tabName === 'title') {
        // 칭호 목록 렌더링
        if(state.unlockedTitles.length === 0) list.innerHTML = '<div style="padding:10px; color:#555;">획득한 칭호가 없습니다.</div>';
        state.unlockedTitles.forEach(t => {
            const cls = state.currentTitle === t ? 'active' : '';
            list.innerHTML += `<div class="list-item ${cls}" onclick="equipTitle('${t}')">
                <span>${t}</span>${cls ? '<span class="material-icons-round" style="font-size:14px;">check</span>' : ''}
            </div>`;
        });
    } else {
        // 직업 목록 렌더링
        if(state.unlockedJobs.length === 0) list.innerHTML = '<div style="padding:10px; color:#555;">해금된 직업이 없습니다.</div>';
        state.unlockedJobs.forEach(j => {
            const cls = state.currentJob === j ? 'active' : '';
            list.innerHTML += `<div class="list-item ${cls}" onclick="equipJob('${j}')">
                <span>${j}</span>${cls ? '<span class="material-icons-round" style="font-size:14px;">check</span>' : ''}
            </div>`;
        });
    }
};
window.equipTitle = (t) => { 
    state.currentTitle = t; DataManager.save(state); updateGlobalUI(); 
    switchTitleTab('title'); // 리프레시
    showToast(`칭호 변경: [${t}]`);
};
window.equipJob = (j) => { 
    state.currentJob = j; DataManager.save(state); updateGlobalUI(); 
    switchTitleTab('job'); // 리프레시
    showToast(`직업 변경: [${j}]`);
};


// --- [5] 인벤토리 생성 (모달 적용) ---
window.openCreateItemModal = () => {
    document.getElementById('modal-create-item').style.display = 'flex';
    document.getElementById('new-item-name').value = '';
    document.getElementById('new-item-desc').value = '';
};
window.createItemAction = () => {
    const name = document.getElementById('new-item-name').value.trim();
    const desc = document.getElementById('new-item-desc').value.trim();
    const icon = document.getElementById('new-item-icon').value.trim() || '📦';
    
    if(!name) return showToast("이름을 입력하세요.");
    
    state.inventory.push({ type: 'record', icon: icon, name: name, desc: desc || '설명 없음' });
    DataManager.save(state); 
    renderInventory();
    closeModal('modal-create-item');
    showToast("기록이 추가되었습니다.");
};

// --- [6] 삭제 로직 (Confirm Modal 사용) ---
window.confirmDeleteQuest = (qid) => {
    openConfirmModal("이 의뢰를 삭제하시겠습니까?", () => {
        delete state.quests[qid];
        DataManager.save(state);
        renderQuest();
        showToast("의뢰가 삭제되었습니다.");
    });
};
window.confirmDeleteShopItem = (itemId) => {
    openConfirmModal("이 상품을 삭제하시겠습니까?", () => {
        state.shopItems = state.shopItems.filter(item => item.id !== itemId);
        DataManager.save(state);
        renderShop();
        showToast("상품이 삭제되었습니다.");
    });
};

// --- [7] 기타 기본 로직 ---
// 스탯/스킬 생성 관련은 기존 유지하되 alert -> showToast 교체
window.openSkillCreateModal = () => { /* 기존 코드 유지 */ document.getElementById('modal-create-skill').style.display = 'flex'; /* ... */ };
window.createSkillAction = () => {
    // ... (유효성 검사 alert -> showToast로 변경)
    if(!selectedCoreForCreate) return showToast("스탯을 선택하세요.");
    let mid = document.getElementById('new-mastery-select').value;
    const mInput = document.getElementById('new-mastery-input').value.trim();
    const sName = document.getElementById('new-skill-name').value.trim();

    if(mid === 'NEW_MASTERY' && !mInput) return showToast("마스터리 이름을 입력하세요.");
    if(!sName) return showToast("스킬 이름을 입력하세요.");

    if(mid === 'NEW_MASTERY') {
        mid = 'm' + Date.now();
        state.masteries[mid] = { name: mInput, core: selectedCoreForCreate, level: 0 };
    }
    const newSid = 's' + Date.now();
    state.skills[newSid] = { name: sName, mastery: mid, seconds: 0, level: 0, hidden: false };
    
    DataManager.save(state);
    closeModal('modal-create-skill');
    updateGlobalUI(); renderCharacter();
    showToast(`스킬 습득: [${sName}]`);
};

// 퀘스트 생성
window.openQuestManager = () => {
    const availableSkills = Object.values(state.skills).filter(s => !s.hidden);
    if(availableSkills.length === 0) return showToast("생성된 스킬이 없습니다.");
    document.getElementById('modal-create-quest').style.display = 'flex';
    const select = document.getElementById('quest-skill-select');
    select.innerHTML = '';
    availableSkills.forEach(s => select.innerHTML += `<option value="${Object.keys(state.skills).find(k=>state.skills[k]===s)}">${s.name} (Lv.${s.level})</option>`);
};
window.createQuestAction = () => {
    const qName = document.getElementById('new-quest-name').value.trim();
    const sid = document.getElementById('quest-skill-select').value;
    if(!qName) return showToast("의뢰 이름을 입력하세요.");
    const qid = 'q' + Date.now();
    state.quests[qid] = { name: qName, linkedSkillId: sid };
    DataManager.save(state);
    closeModal('modal-create-quest');
    renderQuest();
    showToast("의뢰가 게시되었습니다.");
};

// 업적 체크
function checkAchievements() {
    let updated = false;
    if (state.cores.STR.level >= 10 && !state.unlockedJobs.includes("전사")) { state.unlockedJobs.push("전사"); showToast("직업 해금: 전사"); updated=true; }
    // ... 추가 조건들
    if(updated) DataManager.save(state);
}

// 전투
window.startBattle = (qid) => {
    activeQuestId = qid; 
    const quest = state.quests[qid];
    sessionSec = 0;
    switchTab('battle');
    document.getElementById('battle-quest-name').innerText = quest.name;
    document.getElementById('battle-earning').innerText = `전투 중...`;
    BattleManager.init();
    timer = setInterval(() => {
        sessionSec++;
        const m = Math.floor(sessionSec / 60).toString().padStart(2, '0');
        const s = (sessionSec % 60).toString().padStart(2, '0');
        document.getElementById('battle-timer').innerText = `00:${m}:${s}`;
    }, 1000);
};

document.getElementById('btn-stop').onclick = () => {
    if (!timer) return;
    clearInterval(timer); timer = null; BattleManager.destroy();
    
    const quest = state.quests[activeQuestId];
    const skill = state.skills[quest.linkedSkillId];
    state.gold += sessionSec;
    skill.seconds += sessionSec; 

    let msg = `의뢰 완료! (+${sessionSec}G)`;
    if (sessionSec > 60 && Math.random() > 0.7) {
        const loots = ["💎 마나석", "📜 고대 문서", "💊 체력 포션"];
        const lootName = loots[Math.floor(Math.random()*loots.length)];
        state.inventory.push({ type: 'loot', icon: '🎁', name: lootName, desc: '전리품' });
        msg += `\n[전리품] ${lootName}`;
    }
    showToast(msg);

    sessionSec = 0; activeQuestId = null;
    document.getElementById('battle-quest-name').innerText = "-";
    document.getElementById('battle-timer').innerText = "00:00:00";
    
    DataManager.save(state); updateGlobalUI(); switchTab('quest');
};

// 공통
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

// 스킬 관리 모달
window.openSkillManager = () => document.getElementById('modal-skill-manager').style.display = 'flex';
window.openRestoreSkillMode = () => {
    document.getElementById('modal-skill-manager').style.display = 'none';
    document.getElementById('modal-restore-skill').style.display = 'flex';
    const list = document.getElementById('deleted-skill-list');
    list.innerHTML = '';
    for(let sid in state.skills) {
        const skill = state.skills[sid];
        const item = document.createElement('div');
        item.className = 'list-item';
        if(skill.hidden) {
            item.innerHTML = `<span style="text-decoration:line-through; color:#666; font-size:9px;">${skill.name}</span>
                <div style="display:flex; gap:5px;">
                    <button class="btn-sm" style="width:auto" onclick="restoreSkill('${sid}')">복구</button>
                    <button class="btn-sm btn-danger" style="width:auto" onclick="permanentDeleteSkill('${sid}')">삭제</button>
                </div>`;
        } else {
            item.innerHTML = `<span>${skill.name}</span><button class="btn-sm btn-danger" style="width:auto" onclick="softDeleteSkill('${sid}')">보관</button>`;
        }
        list.appendChild(item);
    }
};
window.softDeleteSkill = (sid) => { state.skills[sid].hidden = true; DataManager.save(state); openRestoreSkillMode(); renderQuest(); };
window.restoreSkill = (sid) => { state.skills[sid].hidden = false; DataManager.save(state); openRestoreSkillMode(); renderQuest(); };
window.permanentDeleteSkill = (sid) => {
    openConfirmModal("정말 영구 삭제하시겠습니까?", () => {
        delete state.skills[sid]; DataManager.save(state); openRestoreSkillMode(); renderQuest(); updateGlobalUI();
        showToast("영구 삭제되었습니다.");
    });
};

// 설정 및 기타
window.openSettingsModal = () => document.getElementById('modal-settings').style.display = 'flex';
window.openCreateShopItemModal = () => document.getElementById('modal-create-shop-item').style.display = 'flex';
window.createShopItemAction = () => { /* 기존 로직 + showToast */ const name=document.getElementById('new-shop-item-name').value; const cost=document.getElementById('new-shop-item-cost').value; if(!name) return showToast("상품명 입력"); state.shopItems.push({id:'i'+Date.now(), name, cost}); DataManager.save(state); renderShop(); closeModal('modal-create-shop-item'); };

document.getElementById('btn-export').onclick = () => DataManager.export(state);
document.getElementById('btn-reset').onclick = () => { openConfirmModal("정말 초기화하시겠습니까?", () => { DataManager.reset(); }); }; // reset은 confirm 내부 처리가 아니라 DataManager에서 처리하거나 여기서 처리.

updateGlobalUI(); renderCharacter();
