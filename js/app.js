import { DataManager, SHOP_ITEMS } from './data.js';
import { BattleManager } from './battle.js';

let state = DataManager.load();
let timer = null;
let sessionSec = 0;
let activeSkillId = null;
let selectedCoreForCreate = null;

// --- [1] 차트 및 UI ---
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

    // 데이터 그리기 (순서: STR, DEX, INT, WIS, VIT)
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
    
    // 레벨 계산
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

    // 상단바 갱신 (칭호 + 직업)
    document.getElementById('ui-gold').innerText = `${state.gold} G`;
    document.getElementById('header-job-title').innerText = `<${state.currentTitle}>`;
    document.getElementById('header-job-name').innerText = state.currentJob;
    document.getElementById('chart-total-level').innerText = `Lv.${totalLv}`;
    
    checkAchievements(); // ★ 조건 체크 실행
    drawRadarChart();
}

// --- [2] 렌더링 함수들 ---
function renderCharacter() {
    const list = document.getElementById('stats-list');
    list.innerHTML = '';

    // 순서대로 그리기 (STR -> DEX...)
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
                
                // [추가] 퍼센트 계산 (3600초 기준)
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
        if(!hasContent) detailBox.innerHTML = '<div style="color:#555; font-size:9px; padding:5px;">수련 기록 없음</div>';
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

    for (let sid in state.skills) {
        const skill = state.skills[sid];
        if (skill.hidden) continue;
        count++;

        const percent = Math.floor((skill.seconds % 3600) / 3600 * 100);

        const card = document.createElement('div');
        card.className = 'card quest-card';
        card.innerHTML = `
            <div class="quest-info">
                <div class="quest-title">${skill.name} <span style="color:var(--accent)">Lv.${skill.level}</span> <span style="font-size:8px; color:#666">(${percent}%)</span></div>
                <div class="quest-sub">${state.masteries[skill.mastery].name} / ${state.cores[state.masteries[skill.mastery].core].name}</div>
            </div>
            <button class="btn-sm" style="background:var(--accent);" onclick="startBattle('${sid}')">수락</button>
        `;
        container.appendChild(card);
    }
    document.getElementById('empty-quest-msg').style.display = count === 0 ? 'block' : 'none';
}

function renderInventory() {
    const grid = document.getElementById('inventory-grid');
    grid.innerHTML = state.inventory.length === 0 ? '<div style="grid-column:1/-1; text-align:center; color:#555; padding:20px;">비어있음</div>' : '';
    
    state.inventory.forEach((item, idx) => {
        // 전리품은 배경색 다르게 표시 가능
        const bg = item.type === 'record' ? '#222' : '#111'; 
        const badge = item.type === 'record' ? '<span class="inv-badge" style="color:#6BCB77">기록</span>' : '';
        
        grid.innerHTML += `
            <div class="inv-item" style="background:${bg}" onclick="alert('[${item.name}]\\n${item.desc}')">
                ${item.icon} ${badge}
            </div>`;
    });
}

function renderShop() {
    const box = document.getElementById('shop-container');
    box.innerHTML = '';
    SHOP_ITEMS.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card';
        div.style.display = 'flex'; div.style.justifyContent = 'space-between'; div.style.alignItems = 'center';
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

// --- [3] 조건(Achievement) 시스템 (사용자 정의 구역) ---
function checkAchievements() {
    let updated = false;

    // 예시 1: STR 10 이상 -> '전사' 직업 해금
    if (state.cores.STR.level >= 10 && !state.unlockedJobs.includes("전사")) {
        state.unlockedJobs.push("전사");
        alert("🎉 직업 해금: [전사]\n조건: 힘(STR) Lv.10 달성");
        updated = true;
    }

    // 예시 2: INT 10 이상 -> '학자' 직업 해금
    if (state.cores.INT.level >= 10 && !state.unlockedJobs.includes("학자")) {
        state.unlockedJobs.push("학자");
        alert("🎉 직업 해금: [학자]\n조건: 지능(INT) Lv.10 달성");
        updated = true;
    }

    // 예시 3: 총 레벨 100 달성 -> '고인물' 칭호
    if (state.totalLevel >= 100 && !state.unlockedTitles.includes("고인물")) {
        state.unlockedTitles.push("고인물");
        alert("🏆 칭호 획득: [고인물]\n조건: 총 레벨 100 달성");
        updated = true;
    }

    if(updated) DataManager.save(state);
}

// --- [4] 인벤토리 아이템 생성 (기록) ---
window.openCreateItemModal = () => {
    const name = prompt("기록할 아이템의 이름은? (예: 읽은 책 제목)");
    if(!name) return;
    const desc = prompt("상세 설명? (예: 감상평, 공부한 챕터)");
    if(!desc) return;
    const icon = prompt("아이콘 이모지 하나만 입력하세요 (예: 📕, 💻)", "📕");

    state.inventory.push({
        type: 'record',
        icon: icon || '📦',
        name: name,
        desc: desc || '설명 없음'
    });
    DataManager.save(state);
    renderInventory();
};

// --- [5] 스킬 관리 모달 ---
window.openSkillManager = () => document.getElementById('modal-skill-manager').style.display = 'flex';
window.openCreateSkillMode = () => {
    document.getElementById('modal-skill-manager').style.display = 'none';
    document.getElementById('modal-create-skill').style.display = 'flex';
    const chipGroup = document.getElementById('core-select-group');
    chipGroup.innerHTML = '';
    selectedCoreForCreate = null;
    
    // 순서대로 칩 생성
    ['STR','DEX','INT','WIS','VIT'].forEach(cid => {
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
    });
    updateMasterySelect(null);
};

function updateMasterySelect(coreId) {
    const select = document.getElementById('new-mastery-select');
    select.innerHTML = '';
    if(!coreId) { select.innerHTML = '<option value="">-- 스탯 선택 필요 --</option>'; return; }
    
    let count = 0;
    for(let mid in state.masteries) {
        if(state.masteries[mid].core === coreId) {
            select.innerHTML += `<option value="${mid}">${state.masteries[mid].name}</option>`;
            count++;
        }
    }
    select.innerHTML += '<option value="NEW_MASTERY">+ 새 마스터리 생성</option>';
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

    if(!mid) return alert("마스터리를 선택하세요.");
    if(mid === 'NEW_MASTERY' && !mInput) return alert("마스터리 이름을 입력하세요.");
    if(!sName) return alert("스킬 이름을 입력하세요.");

    if(mid === 'NEW_MASTERY') {
        mid = 'm' + Date.now();
        state.masteries[mid] = { name: mInput, core: selectedCoreForCreate, level: 0 };
    }
    state.skills['s'+Date.now()] = { name: sName, mastery: mid, seconds: 0, level: 0, hidden: false };
    
    DataManager.save(state);
    closeModal('modal-create-skill');
    updateGlobalUI(); renderQuest(); renderCharacter();
};

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
            item.innerHTML = `<span style="text-decoration:line-through; color:#666">${skill.name}</span><button class="btn-sm" style="width:auto" onclick="restoreSkill('${sid}')">복구</button>`;
        } else {
            item.innerHTML = `<span>${skill.name}</span><button class="btn-sm btn-danger" style="width:auto" onclick="deleteSkill('${sid}')">삭제</button>`;
        }
        list.appendChild(item);
    }
};
window.deleteSkill = (sid) => { state.skills[sid].hidden = true; DataManager.save(state); openRestoreSkillMode(); renderQuest(); };
window.restoreSkill = (sid) => { state.skills[sid].hidden = false; DataManager.save(state); openRestoreSkillMode(); renderQuest(); };

// --- [6] 기타 설정 및 칭호/직업 변경 ---
window.openSettingsModal = () => document.getElementById('modal-settings').style.display = 'flex';
window.openTitleModal = () => {
    document.getElementById('modal-title').style.display = 'flex';
    
    // 칭호 목록
    const tList = document.getElementById('title-list');
    tList.innerHTML = '<div style="font-size:9px; color:#aaa; margin-bottom:5px;">칭호 (Title)</div>';
    state.unlockedTitles.forEach(t => {
        const cls = state.currentTitle === t ? 'active' : '';
        tList.innerHTML += `<div class="list-item ${cls}" onclick="equipTitle('${t}')">${t}</div>`;
    });

    // 직업 목록
    tList.innerHTML += '<div style="font-size:9px; color:#aaa; margin-top:15px; margin-bottom:5px;">직업 (Job)</div>';
    state.unlockedJobs.forEach(j => {
        const cls = state.currentJob === j ? 'active' : '';
        tList.innerHTML += `<div class="list-item ${cls}" onclick="equipJob('${j}')">${j}</div>`;
    });
};
window.equipTitle = (t) => { state.currentTitle = t; DataManager.save(state); updateGlobalUI(); closeModal('modal-title'); };
window.equipJob = (j) => { state.currentJob = j; DataManager.save(state); updateGlobalUI(); closeModal('modal-title'); };
window.closeModal = (id) => document.getElementById(id).style.display = 'none';

// --- [7] 전투 ---
window.startBattle = (sid) => {
    activeSkillId = sid; sessionSec = 0;
    switchTab('battle');
    document.getElementById('battle-quest-name').innerText = state.skills[sid].name;
    BattleManager.init();
    timer = setInterval(() => {
        sessionSec++;
        const m = Math.floor(sessionSec / 60).toString().padStart(2, '0');
        const s = (sessionSec % 60).toString().padStart(2, '0');
        document.getElementById('battle-timer').innerText = `00:${m}:${s}`;
        document.getElementById('battle-earning').innerText = `수익: ${sessionSec} G`;
    }, 1000);
};

document.getElementById('btn-stop').onclick = () => {
    if (!timer) return;
    clearInterval(timer); timer = null; BattleManager.destroy();
    
    state.gold += sessionSec;
    state.skills[activeSkillId].seconds += sessionSec;

    // [전리품 획득 로직]
    // 60초 이상 수련 시 확률적으로 드랍
    if (sessionSec > 60 && Math.random() > 0.7) {
        const loots = ["💎 마나석", "📜 고대 문서", "💊 체력 포션"];
        const lootName = loots[Math.floor(Math.random()*loots.length)];
        state.inventory.push({ type: 'loot', icon: '🎁', name: lootName, desc: '수련 중 발견한 전리품' });
        alert(`전투 종료! ${sessionSec}G 획득!\n[전리품 발견] ${lootName}`);
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

window.startBattle = startBattle;
document.querySelectorAll('.nav-btn').forEach(btn => btn.onclick = () => switchTab(btn.dataset.target));

// 설정 버튼
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
