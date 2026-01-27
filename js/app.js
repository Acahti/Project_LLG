import { DataManager } from './data.js';
import { BattleManager } from './battle.js';

let state = DataManager.load();
let timer = null;
let sessionSec = 0;
let activeQuestId = null; // 실행 중인 퀘스트 ID
let selectedCoreForCreate = null;

// --- [1] UI 업데이트 ---
function drawRadarChart() {
    const canvas = document.getElementById('stat-radar');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const cx = w/2, cy = h/2, radius = w/2 - 40;

    ctx.clearRect(0,0,w,h);
    // 가이드라인
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
    // 데이터
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
    
    // 레벨 재계산 (Skills -> Mastery -> Core)
    // 퀘스트는 단지 스킬에 시간을 더해주는 역할일 뿐, 레벨 계산은 스킬 기준
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

// --- [2] 렌더링: 캐릭터 (스킬 관리 포함) ---
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
                        <button class="btn-sm btn-danger" style="width:auto; padding:2px 6px; margin-left:5px;" onclick="deleteSkill('${sid}')">x</button>
                    </div>`;
            }
            if(skillHtml) {
                detailBox.innerHTML += `<div class="mastery-title">${mastery.name} (Lv.${mastery.level})</div>${skillHtml}`;
                hasContent = true;
            }
        }
        if(!hasContent) detailBox.innerHTML = '<div style="color:#555; font-size:9px; padding:5px;">등록된 스킬이 없습니다.</div>';
    });
}
window.toggleStat = (id) => {
    const el = document.getElementById(`detail-${id}`);
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

// --- [3] 렌더링: 의뢰 (퀘스트) ---
function renderQuest() {
    const container = document.getElementById('quest-container');
    container.innerHTML = '';
    let count = 0;

    for (let qid in state.quests) {
        const quest = state.quests[qid];
        const linkedSkill = state.skills[quest.linkedSkillId];
        
        // 연결된 스킬이 삭제되었으면 퀘스트도 표시 안 함 (또는 경고 표시)
        if (!linkedSkill || linkedSkill.hidden) continue;

        count++;
        const percent = Math.floor((linkedSkill.seconds % 3600) / 3600 * 100);

        const card = document.createElement('div');
        card.className = 'card quest-card';
        card.innerHTML = `
            <div class="quest-info">
                <div class="quest-title">${quest.name}</div>
                <div class="quest-sub">
                    성장: <span style="color:var(--accent)">${linkedSkill.name}</span> (Lv.${linkedSkill.level})
                </div>
            </div>
            <div style="display:flex; gap:5px;">
                <button class="btn-sm" style="background:var(--accent);" onclick="startBattle('${qid}')">수락</button>
                <button class="btn-sm" style="background:#333; color:#aaa;" onclick="deleteQuest('${qid}')">삭제</button>
            </div>
        `;
        container.appendChild(card);
    }
    document.getElementById('empty-quest-msg').style.display = count === 0 ? 'block' : 'none';
}

// --- [4] 렌더링: 상점 (관리 기능 추가) ---
function renderShop() {
    const box = document.getElementById('shop-container');
    box.innerHTML = '';
    
    state.shopItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card';
        div.style.display = 'flex'; div.style.justifyContent = 'space-between'; div.style.alignItems = 'center';
        div.innerHTML = `
            <div style="flex:1">
                <span>${item.name}</span>
            </div>
            <div style="display:flex; gap:5px; align-items:center;">
                <button class="btn-shop" style="width:auto; padding:8px 12px;">${item.cost} G</button>
                <button class="btn-sm btn-danger" style="width:auto; padding:8px;" onclick="deleteShopItem('${item.id}')">🗑️</button>
            </div>
        `;
        // 구매 버튼
        div.querySelector('.btn-shop').onclick = () => {
            if (state.gold >= item.cost) {
                if(confirm(`'${item.name}' 구매하시겠습니까?`)) {
                    state.gold -= item.cost;
                    DataManager.save(state);
                    updateGlobalUI();
                    renderShop();
                }
            } else alert("골드가 부족합니다!");
        };
        box.appendChild(div);
    });
}

// --- [5] 모달 & 생성 로직 ---

// [내 정보] 스킬 생성 모달
window.openSkillCreateModal = () => {
    document.getElementById('modal-create-skill').style.display = 'flex';
    // 코어 선택 칩 초기화
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

// [내 정보] 스킬 삭제
window.deleteSkill = (sid) => {
    if(confirm(`스킬 '${state.skills[sid].name}'을(를) 삭제하시겠습니까?\n(이 스킬을 사용하는 의뢰들도 수행할 수 없게 됩니다.)`)) {
        state.skills[sid].hidden = true;
        DataManager.save(state);
        renderCharacter();
        renderQuest(); // 의뢰 목록도 갱신
    }
};

function updateMasterySelect(coreId) {
    const select = document.getElementById('new-mastery-select'); select.innerHTML = '';
    if(!coreId) { select.innerHTML = '<option value="">-- 스탯 선택 --</option>'; return; }
    
    let count = 0;
    for(let mid in state.masteries) {
        if(state.masteries[mid].core === coreId) { select.innerHTML += `<option value="${mid}">${state.masteries[mid].name}</option>`; count++; }
    }
    select.innerHTML += '<option value="NEW_MASTERY">+ 새 마스터리</option>';
    if(count === 0) select.value = "NEW_MASTERY";
    checkMasteryInput();
}
window.checkMasteryInput = () => {
    const val = document.getElementById('new-mastery-select').value;
    document.getElementById('new-mastery-input').style.display = val === 'NEW_MASTERY' ? 'block' : 'none';
};

window.createSkillAction = () => {
    if(!selectedCoreForCreate) return alert("스탯을 선택하세요.");
    let mid = document.getElementById('new-mastery-select').value;
    const mInput = document.getElementById('new-mastery-input').value.trim();
    const sName = document.getElementById('new-skill-name').value.trim();

    if(mid === 'NEW_MASTERY' && !mInput) return alert("마스터리 이름을 입력하세요.");
    if(!sName) return alert("스킬 이름을 입력하세요.");

    if(mid === 'NEW_MASTERY') {
        mid = 'm' + Date.now();
        state.masteries[mid] = { name: mInput, core: selectedCoreForCreate, level: 0 };
    }
    const newSid = 's' + Date.now();
    state.skills[newSid] = { name: sName, mastery: mid, seconds: 0, level: 0, hidden: false };
    
    DataManager.save(state);
    closeModal('modal-create-skill');
    updateGlobalUI(); renderCharacter();
    // 입력창 초기화
    document.getElementById('new-mastery-input').value = '';
    document.getElementById('new-skill-name').value = '';
};


// [의뢰] 퀘스트 생성 모달
window.openQuestManager = () => {
    // 스킬이 하나도 없으면 경고
    const availableSkills = Object.values(state.skills).filter(s => !s.hidden);
    if(availableSkills.length === 0) return alert("생성된 스킬이 없습니다.\n먼저 [내 정보] 탭에서 스킬을 생성해주세요.");
    
    document.getElementById('modal-create-quest').style.display = 'flex';
    
    const select = document.getElementById('quest-skill-select');
    select.innerHTML = '';
    for(let sid in state.skills) {
        const skill = state.skills[sid];
        if(!skill.hidden) {
            select.innerHTML += `<option value="${sid}">${skill.name} (Lv.${skill.level})</option>`;
        }
    }
};

window.createQuestAction = () => {
    const qName = document.getElementById('new-quest-name').value.trim();
    const sid = document.getElementById('quest-skill-select').value;
    
    if(!qName) return alert("의뢰 이름을 입력하세요.");
    if(!sid) return alert("성장시킬 스킬을 선택하세요.");

    const qid = 'q' + Date.now();
    state.quests[qid] = {
        name: qName,
        linkedSkillId: sid
    };
    
    DataManager.save(state);
    closeModal('modal-create-quest');
    document.getElementById('new-quest-name').value = '';
    renderQuest();
};

window.deleteQuest = (qid) => {
    if(confirm("이 의뢰를 삭제하시겠습니까?")) {
        delete state.quests[qid];
        DataManager.save(state);
        renderQuest();
    }
};


// [상점] 아이템 생성 및 삭제
window.openCreateShopItemModal = () => document.getElementById('modal-create-shop-item').style.display = 'flex';

window.createShopItemAction = () => {
    const name = document.getElementById('new-shop-item-name').value.trim();
    const cost = parseInt(document.getElementById('new-shop-item-cost').value);
    
    if(!name) return alert("상품 이름을 입력하세요.");
    if(isNaN(cost) || cost < 0) return alert("올바른 가격을 입력하세요.");

    state.shopItems.push({
        id: 'item' + Date.now(),
        name: name,
        cost: cost
    });
    
    DataManager.save(state);
    closeModal('modal-create-shop-item');
    document.getElementById('new-shop-item-name').value = '';
    document.getElementById('new-shop-item-cost').value = '';
    renderShop();
};

window.deleteShopItem = (itemId) => {
    if(confirm("이 상품을 진열대에서 치우겠습니까?")) {
        state.shopItems = state.shopItems.filter(item => item.id !== itemId);
        DataManager.save(state);
        renderShop();
    }
};


// --- [6] 공통 및 기타 ---
function renderInventory() {
    const grid = document.getElementById('inventory-grid');
    grid.innerHTML = state.inventory.length === 0 ? '<div style="grid-column:1/-1; text-align:center; color:#555;">비어있음</div>' : '';
    state.inventory.forEach(item => {
        const bg = item.type === 'record' ? '#222' : '#111'; 
        const badge = item.type === 'record' ? '<span class="inv-badge" style="color:#6BCB77">기록</span>' : '';
        grid.innerHTML += `<div class="inv-item" style="background:${bg}" onclick="alert('[${item.name}]\\n${item.desc}')">${item.icon} ${badge}</div>`;
    });
}
window.openCreateItemModal = () => {
    const name = prompt("기록할 아이템 이름"); if(!name) return;
    const desc = prompt("설명"); if(!desc) return;
    const icon = prompt("아이콘", "📕");
    state.inventory.push({ type: 'record', icon: icon||'📦', name: name, desc: desc||'' });
    DataManager.save(state); renderInventory();
};

function checkAchievements() {
    let updated = false;
    if (state.cores.STR.level >= 10 && !state.unlockedJobs.includes("전사")) { state.unlockedJobs.push("전사"); alert("직업 해금: 전사"); updated=true; }
    // ... 추가 조건들
    if(updated) DataManager.save(state);
}

// 전투 시작
window.startBattle = (qid) => {
    activeQuestId = qid; 
    const quest = state.quests[qid];
    const skill = state.skills[quest.linkedSkillId];
    
    sessionSec = 0;
    switchTab('battle');
    document.getElementById('battle-quest-name').innerText = quest.name;
    document.getElementById('battle-earning').innerText = `성장 중: ${skill.name}`; // 스킬 이름 표시
    
    BattleManager.init();
    timer = setInterval(() => {
        sessionSec++;
        const m = Math.floor(sessionSec / 60).toString().padStart(2, '0');
        const s = (sessionSec % 60).toString().padStart(2, '0');
        document.getElementById('battle-timer').innerText = `00:${m}:${s}`;
    }, 1000);
};

// 전투 종료
document.getElementById('btn-stop').onclick = () => {
    if (!timer) return;
    clearInterval(timer); timer = null; BattleManager.destroy();
    
    const quest = state.quests[activeQuestId];
    const skill = state.skills[quest.linkedSkillId];

    state.gold += sessionSec;
    skill.seconds += sessionSec; // 연결된 스킬에 경험치(시간) 부여

    alert(`의뢰 완료!\n[${quest.name}]\n보상: ${sessionSec}G\n성장: ${skill.name} (+${sessionSec}초)`);

    sessionSec = 0; activeQuestId = null;
    document.getElementById('battle-quest-name').innerText = "-";
    document.getElementById('battle-timer').innerText = "00:00:00";
    
    DataManager.save(state);
    updateGlobalUI();
    switchTab('quest');
};

// 탭 전환
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

// 모달 & 설정
window.closeModal = (id) => document.getElementById(id).style.display = 'none';
window.openSettingsModal = () => document.getElementById('modal-settings').style.display = 'flex';
window.openTitleModal = () => { /* 칭호 모달 로직 동일 */ document.getElementById('modal-title').style.display = 'flex'; /* ... */ }; 
/* 칭호/직업 선택 로직 동일 */

document.getElementById('btn-export').onclick = () => DataManager.export(state);
document.getElementById('btn-reset').onclick = () => DataManager.reset();
document.getElementById('btn-import').onclick = () => document.getElementById('file-input').click();
document.getElementById('file-input').onchange = (e) => {
    const reader = new FileReader();
    reader.onload = (e) => { try { state = JSON.parse(e.target.result); DataManager.save(state); location.reload(); } catch { alert("파일 오류"); } };
    reader.readAsText(e.target.files[0]);
};

// 초기 실행
updateGlobalUI(); renderCharacter();
