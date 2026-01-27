import { DataManager, SHOP_ITEMS } from './data.js';
import { BattleManager } from './battle.js';

let state = DataManager.load();
let timer = null;
let sessionSec = 0;
let activeSkillId = null;

// --- [1] 차트 그리기 (HTML5 Canvas) ---
function drawRadarChart() {
    const canvas = document.getElementById('stat-radar');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = w / 2 - 40; // 여백 확보

    // 1. 초기화
    ctx.clearRect(0, 0, w, h);

    // 2. 배경 오각형 그리기 (가이드라인)
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
            const angle = (Math.PI * 2 * j) / 5 - Math.PI / 2;
            const r = (radius / 5) * i;
            ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
        }
        ctx.closePath();
        ctx.stroke();
    }

    // 3. 스탯 데이터 매핑
    const stats = ['INT', 'STR', 'DEX', 'VIT', 'WIS']; // 순서대로
    const maxVal = Math.max(50, ...Object.values(state.cores).map(c => c.level)) * 1.2; // 최대값 기준 스케일링

    // 4. 스탯 영역 그리기
    ctx.beginPath();
    ctx.fillStyle = 'rgba(77, 150, 255, 0.5)'; // 채우기 색
    ctx.strokeStyle = '#4D96FF'; // 테두리 색
    ctx.lineWidth = 3;

    stats.forEach((key, i) => {
        const val = state.cores[key].level;
        const r = (val / maxVal) * radius;
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 5. 텍스트 라벨
    ctx.fillStyle = '#ccc';
    ctx.font = '12px "Press Start 2P"';
    ctx.textAlign = 'center';
    stats.forEach((key, i) => {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const r = radius + 25;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        ctx.fillText(key, x, y + 5);
    });
}

// --- [2] UI 업데이트 및 로직 ---
function updateGlobalUI() {
    let totalLv = 0;
    
    // 레벨 재계산 (Skills -> Mastery -> Core)
    for (let sid in state.skills) state.skills[sid].level = Math.floor(state.skills[sid].seconds / 60);
    
    for (let mid in state.masteries) state.masteries[mid].level = 0;
    for (let cid in state.cores) state.cores[cid].level = 0;

    for (let sid in state.skills) {
        const skill = state.skills[sid];
        // 삭제된(hidden) 스킬도 레벨 합산에는 포함 (노력은 사라지지 않음)
        const mastery = state.masteries[skill.mastery];
        const core = state.cores[mastery.core];
        mastery.level += skill.level;
        core.level += skill.level;
    }

    for (let cid in state.cores) totalLv += state.cores[cid].level;
    state.totalLevel = totalLv;

    // 상단바 갱신
    document.getElementById('ui-gold').innerText = `${state.gold} G`;
    document.getElementById('ui-job').innerText = state.currentTitle;
    document.getElementById('chart-total-level').innerText = `Lv.${totalLv}`;

    drawRadarChart(); // 차트 다시 그리기
}

// 탭 렌더링: 캐릭터
function renderCharacter() {
    const list = document.getElementById('stats-list');
    list.innerHTML = '';

    // 인벤토리 렌더링
    const invGrid = document.getElementById('inventory-grid');
    invGrid.innerHTML = state.inventory.length === 0 ? '<div style="grid-column:1/-1; text-align:center; color:#555;">비어있음</div>' : '';
    state.inventory.forEach(item => {
        invGrid.innerHTML += `<div class="inv-item" title="${item.desc}">${item.icon}</div>`;
    });

    // 스탯 아코디언 생성
    for (let cid in state.cores) {
        const core = state.cores[cid];
        
        // 스탯 카드 (헤더)
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

        // 상세 내용 (마스터리 & 스킬)
        const detailBox = item.querySelector(`#detail-${cid}`);
        for (let mid in state.masteries) {
            const mastery = state.masteries[mid];
            if (mastery.core !== cid) continue;
            
            let hasSkills = false;
            let skillHtml = '';
            
            for (let sid in state.skills) {
                const skill = state.skills[sid];
                if (skill.mastery !== mid) continue;
                // 숨겨진 스킬은 캐릭터 창에서도 흐릿하게 표시하거나 숨김 (여기선 표시하되 (숨김) 태그)
                const hideTag = skill.hidden ? '<span style="color:#555; font-size:8px;">(보관됨)</span>' : '';
                skillHtml += `<div class="skill-row">- ${skill.name} ${hideTag} <span style="float:right">Lv.${skill.level}</span></div>`;
                hasSkills = true;
            }

            if(hasSkills) {
                detailBox.innerHTML += `
                    <div class="mastery-title">${mastery.name} (Lv.${mastery.level})</div>
                    ${skillHtml}
                `;
            }
        }
    }
}

// 스탯 토글 함수 (window 객체에 등록)
window.toggleStat = (id) => {
    const el = document.getElementById(`detail-${id}`);
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

// 탭 렌더링: 퀘스트 (스킬 관리 포함)
function renderQuest() {
    const container = document.getElementById('quest-container');
    container.innerHTML = '';
    
    for (let sid in state.skills) {
        const skill = state.skills[sid];
        if (skill.hidden) continue; // 숨겨진 스킬은 퀘스트 목록에 안 뜸

        const card = document.createElement('div');
        card.className = 'card quest-card';
        card.innerHTML = `
            <div style="flex:1">
                <div class="quest-title">${skill.name} <span style="font-size:8px; color:#888;">Lv.${skill.level}</span></div>
                <div style="font-size:8px; color:#666;">${state.masteries[skill.mastery].name}</div>
            </div>
            <div style="display:flex; gap:5px;">
                <button class="btn-sm" style="background:var(--accent);" onclick="startBattle('${sid}')">수련</button>
                <button class="btn-sm" style="background:#333; color:#555;" onclick="hideSkill('${sid}')">🗑️</button>
            </div>
        `;
        container.appendChild(card);
    }
}

// --- [3] 스킬 관리 (추가/삭제/복구) ---
window.openSkillModal = () => {
    document.getElementById('modal-skill').style.display = 'flex';
    // 마스터리 목록 채우기
    const select = document.getElementById('new-skill-mastery');
    select.innerHTML = '';
    for(let mid in state.masteries) {
        select.innerHTML += `<option value="${mid}">${state.masteries[mid].name} (${state.cores[state.masteries[mid].core].name})</option>`;
    }
};

window.addNewSkill = () => {
    const name = document.getElementById('new-skill-name').value.trim();
    const mid = document.getElementById('new-skill-mastery').value;
    if(!name) return alert("이름을 입력하세요.");

    // 1. 이미 있는지 확인 (복구 로직)
    for(let sid in state.skills) {
        if(state.skills[sid].name === name) {
            state.skills[sid].hidden = false; // 숨김 해제
            state.skills[sid].mastery = mid; // 마스터리 변경 가능
            alert(`[${name}] 스킬을 보관함에서 복구했습니다.`);
            finishSkillUpdate();
            return;
        }
    }

    // 2. 없으면 새로 생성
    const newId = 's' + Date.now();
    state.skills[newId] = {
        name: name,
        mastery: mid,
        seconds: 0,
        level: 0,
        hidden: false
    };
    alert(`[${name}] 스킬이 생성되었습니다.`);
    finishSkillUpdate();
};

function finishSkillUpdate() {
    DataManager.save(state);
    document.getElementById('modal-skill').style.display = 'none';
    document.getElementById('new-skill-name').value = '';
    renderQuest();
    renderCharacter(); // 스탯창에도 반영
}

window.hideSkill = (sid) => {
    if(confirm("이 스킬을 목록에서 숨기시겠습니까? (데이터는 유지되며 언제든 다시 이름으로 복구 가능합니다.)")) {
        state.skills[sid].hidden = true;
        DataManager.save(state);
        renderQuest();
        renderCharacter();
    }
};

// --- [4] 칭호 시스템 ---
window.openTitleModal = () => {
    document.getElementById('modal-title').style.display = 'flex';
    const list = document.getElementById('title-list');
    list.innerHTML = '';
    state.unlockedTitles.forEach(title => {
        const isActive = state.currentTitle === title ? 'active' : '';
        list.innerHTML += `<div class="list-item ${isActive}" onclick="equipTitle('${title}')">${title}</div>`;
    });
};

window.equipTitle = (title) => {
    state.currentTitle = title;
    DataManager.save(state);
    updateGlobalUI();
    document.getElementById('modal-title').style.display = 'none';
};

window.closeModal = (id) => document.getElementById(id).style.display = 'none';


// --- [5] 전투 및 기본 로직 (기존 유지) ---
function startBattle(sid) {
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
        document.getElementById('battle-earning').innerText = `예상: ${sessionSec} G`;
    }, 1000);
}

document.getElementById('btn-stop').onclick = () => {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
    BattleManager.destroy();

    const earnedGold = sessionSec;
    state.gold += earnedGold;
    state.skills[activeSkillId].seconds += sessionSec;

    // 인벤토리 획득 (확률) - 재미 요소 추가
    if (sessionSec > 10 && Math.random() > 0.7) { 
        const items = ["💊 비타민", "📜 고문서", "💎 데이터 조각", "🍫 단백질 쉐이크"];
        const item = items[Math.floor(Math.random() * items.length)];
        state.inventory.push({ icon: item.split(' ')[0], desc: item });
        alert(`수련 종료! ${earnedGold}G 획득!\n[아이템 획득] ${item}`);
    } else {
        alert(`수련 종료! ${earnedGold}G 획득!`);
    }

    // 칭호 획득 로직 (예시)
    if(state.totalLevel >= 10 && !state.unlockedTitles.includes("초보자 탈출")) {
        state.unlockedTitles.push("초보자 탈출");
        alert("🎉 새로운 칭호 획득: [초보자 탈출]");
    }

    // 초기화
    sessionSec = 0;
    activeSkillId = null;
    document.getElementById('battle-quest-name').innerText = "-";
    document.getElementById('battle-timer').innerText = "00:00:00";
    document.getElementById('battle-earning').innerText = "보상 대기중...";

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
    if (target === 'shop') renderShop();
}

window.startBattle = startBattle;
document.querySelectorAll('.nav-btn').forEach(btn => btn.onclick = () => switchTab(btn.dataset.target));

// 백업/복구/초기화 연결
document.getElementById('btn-export').onclick = () => DataManager.export(state);
document.getElementById('btn-reset').onclick = () => DataManager.reset();
document.getElementById('btn-import').onclick = () => document.getElementById('file-input').click();
document.getElementById('file-input').onchange = (e) => {
    const reader = new FileReader();
    reader.onload = (e) => {
        try { state = JSON.parse(e.target.result); DataManager.save(state); location.reload(); }
        catch (err) { alert("파일 오류"); }
    };
    reader.readAsText(e.target.files[0]);
};

// 앱 시작
updateGlobalUI();
renderCharacter();

// 샵 렌더링 함수
function renderShop() {
    const box = document.getElementById('shop-container');
    box.innerHTML = '';
    SHOP_ITEMS.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
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
