import { DataManager, SHOP_ITEMS } from './data.js';
import { BattleManager } from './battle.js';

let state = DataManager.load();
let timer = null;
let sessionSec = 0;
let activeSkillId = null;
let selectedCoreForCreate = null; // 스킬 생성 시 선택한 스탯

// --- [1] 차트 그리기 ---
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
    const stats = ['INT','STR','DEX','VIT','WIS'];
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

    // 텍스트
    ctx.fillStyle = '#888'; ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'center';
    stats.forEach((key,i) => {
        const angle = (Math.PI*2*i)/5 - Math.PI/2;
        const x = cx + (radius+20)*Math.cos(angle);
        const y = cy + (radius+20)*Math.sin(angle);
        ctx.fillText(key, x, y+4);
    });
}

// --- [2] UI 업데이트 ---
function updateGlobalUI() {
    let totalLv = 0;
    
    // 레벨 계산
    for (let sid in state.skills) state.skills[sid].level = Math.floor(state.skills[sid].seconds / 60);
    for (let mid in state.masteries) state.masteries[mid].level = 0;
    for (let cid in state.cores) state.cores[cid].level = 0;

    for (let sid in state.skills) {
        const skill = state.skills[sid];
        if(!skill.mastery || !state.masteries[skill.mastery]) continue; // 안전장치
        
        const mastery = state.masteries[skill.mastery];
        const core = state.cores[mastery.core];
        mastery.level += skill.level;
        core.level += skill.level;
    }

    for (let cid in state.cores) totalLv += state.cores[cid].level;
    state.totalLevel = totalLv;

    document.getElementById('ui-gold').innerText = `${state.gold} G`;
    document.getElementById('ui-job').innerText = state.currentTitle;
    document.getElementById('chart-total-level').innerText = `Lv.${totalLv}`;
    drawRadarChart();
}

// 렌더링: 캐릭터
function renderCharacter() {
    const list = document.getElementById('stats-list');
    list.innerHTML = '';

    for (let cid in state.cores) {
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
                skillHtml += `<div class="skill-row"><span>- ${skill.name}</span><span>Lv.${skill.level}</span></div>`;
            }

            if(skillHtml) {
                detailBox.innerHTML += `<div class="mastery-title">${mastery.name} (Lv.${mastery.level})</div>${skillHtml}`;
                hasContent = true;
            }
        }
        if(!hasContent) detailBox.innerHTML = '<div style="color:#555; font-size:9px; padding:5px;">아직 수련한 기술이 없습니다.</div>';
    }
}
window.toggleStat = (id) => {
    const el = document.getElementById(`detail-${id}`);
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

// 렌더링: 의뢰 (스킬)
function renderQuest() {
    const container = document.getElementById('quest-container');
    container.innerHTML = '';
    let count = 0;

    for (let sid in state.skills) {
        const skill = state.skills[sid];
        if (skill.hidden) continue;
        count++;

        const card = document.createElement('div');
        card.className = 'card quest-card';
        card.innerHTML = `
            <div class="quest-info">
                <div class="quest-title">${skill.name} <span style="color:var(--accent)">Lv.${skill.level}</span></div>
                <div class="quest-sub">${state.masteries[skill.mastery].name} / ${state.cores[state.masteries[skill.mastery].core].name}</div>
            </div>
            <button class="btn-sm" style="background:var(--accent);" onclick="startBattle('${sid}')">수락 (수련)</button>
        `;
        container.appendChild(card);
    }
    document.getElementById('empty-quest-msg').style.display = count === 0 ? 'block' : 'none';
}

// 렌더링: 인벤토리
function renderInventory() {
    const grid = document.getElementById('inventory-grid');
    grid.innerHTML = state.inventory.length === 0 ? '<div style="grid-column:1/-1; text-align:center; color:#555; padding:20px;">보관함이 비었습니다.</div>' : '';
    state.inventory.forEach(item => {
        grid.innerHTML += `<div class="inv-item" title="${item.desc}">${item.icon}</div>`;
    });
}

// 렌더링: 상점
function renderShop() {
    const box = document.getElementById('shop-container');
    box.innerHTML = '';
    SHOP_ITEMS.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card';
        div.style.display = 'flex'; justify-content: 'space-between'; align-items: 'center';
        div.innerHTML = `<span>${item.name}</span> <button class="btn-shop" style="width:auto; padding:8px 15px;">${item.cost} G</button>`;
        div.querySelector('button').onclick = () => {
            if (state.gold >= item.cost) {
                if(confirm(`${item.name} 구매?`)) {
                    state.gold -= item.cost;
                    DataManager.save(state);
                    updateGlobalUI();
                    renderShop();
                }
            } else alert("골드 부족!");
        };
        box.appendChild(div);
    });
}

// --- [3] 스킬 관리 로직 (대개편) ---

window.openSkillManager = () => document.getElementById('modal-skill-manager').style.display = 'flex';

// 모드 1: 신규 생성
window.openCreateSkillMode = () => {
    document.getElementById('modal-skill-manager').style.display = 'none';
    document.getElementById('modal-create-skill').style.display = 'flex';
    
    // 코어 칩 생성
    const chipGroup = document.getElementById('core-select-group');
    chipGroup.innerHTML = '';
    selectedCoreForCreate = null;
    
    for(let cid in state.cores) {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.innerText = cid;
        chip.onclick = () => {
            document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
            chip.classList.add('active');
            selectedCoreForCreate = cid;
            updateMasterySelect(cid);
        };
        chipGroup.appendChild(chip);
    }
    updateMasterySelect(null);
};

function updateMasterySelect(coreId) {
    const select = document.getElementById('new-mastery-select');
    select.innerHTML = '';
    
    if(!coreId) {
        select.innerHTML = '<option value="">-- 스탯을 먼저 고르세요 --</option>';
        return;
    }

    // 기존 마스터리 목록
    let count = 0;
    for(let mid in state.masteries) {
        if(state.masteries[mid].core === coreId) {
            select.innerHTML += `<option value="${mid}">${state.masteries[mid].name}</option>`;
            count++;
        }
    }
    select.innerHTML += '<option value="NEW_MASTERY">+ 새 마스터리 생성</option>';
    if(count === 0) select.value = "NEW_MASTERY"; // 없으면 바로 새생성 선택
    checkMasteryInput();
}

window.checkMasteryInput = () => {
    const val = document.getElementById('new-mastery-select').value;
    const input = document.getElementById('new-mastery-input');
    input.style.display = val === 'NEW_MASTERY' ? 'block' : 'none';
};

window.createSkillAction = () => {
    if(!selectedCoreForCreate) return alert("1. 핵심 스탯을 선택하세요.");
    
    let mid = document.getElementById('new-mastery-select').value;
    const masteryInput = document.getElementById('new-mastery-input').value.trim();
    const skillName = document.getElementById('new-skill-name').value.trim();

    if(!mid) return alert("2. 마스터리를 선택하세요.");
    if(mid === 'NEW_MASTERY' && !masteryInput) return alert("새 마스터리 이름을 입력하세요.");
    if(!skillName) return alert("3. 스킬 이름을 입력하세요.");

    // 마스터리 생성 로직
    if(mid === 'NEW_MASTERY') {
        mid = 'm' + Date.now();
        state.masteries[mid] = { name: masteryInput, core: selectedCoreForCreate, level: 0 };
    }

    // 스킬 생성 로직
    const newSid = 's' + Date.now();
    state.skills[newSid] = {
        name: skillName,
        mastery: mid,
        seconds: 0,
        level: 0,
        hidden: false
    };

    DataManager.save(state);
    alert(`[${state.cores[selectedCoreForCreate].name}] 계열의 [${skillName}] 기술을 습득했습니다!`);
    
    closeModal('modal-create-skill');
    // 입력창 초기화
    document.getElementById('new-mastery-input').value = '';
    document.getElementById('new-skill-name').value = '';
    
    updateGlobalUI();
    renderQuest();
    renderCharacter();
};

// 모드 2: 복구/삭제 관리
window.openRestoreSkillMode = () => {
    document.getElementById('modal-skill-manager').style.display = 'none';
    document.getElementById('modal-restore-skill').style.display = 'flex';
    
    const list = document.getElementById('deleted-skill-list');
    list.innerHTML = '';
    let count = 0;

    // 현재 사용중인 스킬 + 삭제된 스킬 모두 표시
    for(let sid in state.skills) {
        const skill = state.skills[sid];
        const item = document.createElement('div');
        item.className = 'list-item';
        
        // 상태에 따라 버튼 다르게
        if(skill.hidden) { // 삭제된 상태 -> 복구 버튼
            item.innerHTML = `
                <span style="color:#666; text-decoration:line-through;">${skill.name}</span>
                <button class="btn-sm" style="width:auto;" onclick="restoreSkill('${sid}')">복구</button>
            `;
        } else { // 사용중 상태 -> 삭제 버튼
            item.innerHTML = `
                <span>${skill.name}</span>
                <button class="btn-sm btn-danger" style="width:auto;" onclick="deleteSkill('${sid}')">삭제</button>
            `;
        }
        list.appendChild(item);
        count++;
    }
    if(count === 0) list.innerHTML = '<div style="padding:10px; color:#555; text-align:center;">생성된 스킬이 없습니다.</div>';
};

window.deleteSkill = (sid) => {
    state.skills[sid].hidden = true;
    DataManager.save(state);
    openRestoreSkillMode(); // 목록 갱신
    renderQuest(); // 뒤쪽 화면 갱신
};

window.restoreSkill = (sid) => {
    state.skills[sid].hidden = false;
    DataManager.save(state);
    openRestoreSkillMode(); // 목록 갱신
    renderQuest();
};


// --- [4] 기타 모달 ---
window.openSettingsModal = () => document.getElementById('modal-settings').style.display = 'flex';
window.openTitleModal = () => {
    document.getElementById('modal-title').style.display = 'flex';
    const list = document.getElementById('title-list');
    list.innerHTML = '';
    state.unlockedTitles.forEach(t => {
        const cls = state.currentTitle === t ? 'active' : '';
        list.innerHTML += `<div class="list-item ${cls}" onclick="equipTitle('${t}')">${t}</div>`;
    });
};
window.equipTitle = (t) => {
    state.currentTitle = t;
    DataManager.save(state);
    updateGlobalUI();
    closeModal('modal-title');
};
window.closeModal = (id) => document.getElementById(id).style.display = 'none';


// --- [5] 전투 ---
window.startBattle = (sid) => {
    activeSkillId = sid;
    sessionSec = 0;
    switchTab('battle');
    document.getElementById('battle-quest-name').innerText = state.skills[sid].name;
    BattleManager.init();
    timer = setInterval(() => {
        sessionSec++;
        const m = Math.floor(sessionSec / 60).toString().padStart(2, '0');
        const s = (sessionSec % 60).toString().padStart(2, '0');
        document.getElementById('battle-timer').innerText = `00:${m}:${s}`;
        document.getElementById('battle-earning').innerText = `보상: ${sessionSec} G`;
    }, 1000);
};

document.getElementById('btn-stop').onclick = () => {
    if (!timer) return;
    clearInterval(timer); timer = null; BattleManager.destroy();
    
    state.gold += sessionSec;
    state.skills[activeSkillId].seconds += sessionSec;
    
    // 인벤토리 랜덤 드랍
    if (sessionSec > 60 && Math.random() > 0.5) {
        const loots = [
            {icon:"📜", name:"고대 문서"}, {icon:"💎", name:"마나석"}, 
            {icon:"💊", name:"회복약"}, {icon:"🥩", name:"고기"}
        ];
        const loot = loots[Math.floor(Math.random()*loots.length)];
        state.inventory.push({ icon: loot.icon, desc: loot.name });
        alert(`전투 종료! ${sessionSec}G 획득!\n[전리품] ${loot.name}`);
    } else {
        alert(`전투 종료! ${sessionSec}G 획득!`);
    }

    sessionSec = 0; activeSkillId = null;
    document.getElementById('battle-quest-name').innerText = "-";
    document.getElementById('battle-timer').innerText = "00:00:00";
    
    DataManager.save(state);
    updateGlobalUI();
    switchTab('quest');
};

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

window.startBattle = startBattle; // 전역 등록
document.querySelectorAll('.nav-btn').forEach(btn => btn.onclick = () => switchTab(btn.dataset.target));

// 설정 버튼 연결
document.getElementById('btn-export').onclick = () => DataManager.export(state);
document.getElementById('btn-reset').onclick = () => DataManager.reset();
document.getElementById('btn-import').onclick = () => document.getElementById('file-input').click();
document.getElementById('file-input').onchange = (e) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        try { state = JSON.parse(e.target.result); DataManager.save(state); location.reload(); }
        catch { alert("파일 오류"); }
    };
    reader.readAsText(e.target.files[0]);
};

// 시작
updateGlobalUI();
renderCharacter();
