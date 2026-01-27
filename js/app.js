import { DataManager } from './data.js';
import { BattleManager } from './battle.js';

let state = DataManager.load();
let timer = null;
let sessionSec = 0;
let activeQuestId = null;
let selectedCoreForCreate = null;
// 수정 모달을 위한 임시 변수
let editingSkillId = null;
let editingMasteryId = null;

// --- [1] 알림 & 모달 시스템 ---
window.showToast = (msg) => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'toast'; div.innerText = msg;
    container.appendChild(div);
    setTimeout(() => { div.classList.add('hide'); div.addEventListener('animationend', () => div.remove()); }, 2500);
};

window.openConfirmModal = (msg, callback) => {
    const modal = document.getElementById('modal-confirm');
    document.getElementById('confirm-msg').innerText = msg;
    modal.style.display = 'flex';
    const btnYes = document.getElementById('btn-confirm-yes');
    const newBtnYes = btnYes.cloneNode(true);
    btnYes.parentNode.replaceChild(newBtnYes, btnYes);
    newBtnYes.onclick = () => { modal.style.display = 'none'; callback(); };
};
window.closeConfirmModal = () => document.getElementById('modal-confirm').style.display = 'none';
window.closeModal = (id) => document.getElementById(id).style.display = 'none';

// --- [2] 차트 및 UI 업데이트 ---
function drawRadarChart() {
    const canvas = document.getElementById('stat-radar');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height, cx = w/2, cy = h/2, radius = w/2 - 40;
    ctx.clearRect(0,0,w,h);
    
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1;
    for (let i=1; i<=5; i++) {
        ctx.beginPath();
        for (let j=0; j<5; j++) {
            const angle = (Math.PI*2*j)/5 - Math.PI/2;
            ctx.lineTo(cx+(radius/5)*i*Math.cos(angle), cy+(radius/5)*i*Math.sin(angle));
        }
        ctx.closePath(); ctx.stroke();
    }

    const stats = ['STR','DEX','INT','WIS','VIT'];
    const levels = stats.map(key => state.cores[key] ? state.cores[key].level : 0);
    const maxVal = Math.max(20, ...levels) * 1.2;

    ctx.beginPath(); ctx.fillStyle = 'rgba(77,150,255,0.4)'; ctx.strokeStyle = '#4D96FF'; ctx.lineWidth = 2;
    stats.forEach((key,i) => {
        const val = state.cores[key] ? state.cores[key].level : 0;
        const angle = (Math.PI*2*i)/5 - Math.PI/2;
        ctx.lineTo(cx+(val/maxVal)*radius*Math.cos(angle), cy+(val/maxVal)*radius*Math.sin(angle));
    });
    ctx.closePath(); ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#888'; ctx.font = '10px "Press Start 2P"'; ctx.textAlign = 'center';
    stats.forEach((key,i) => {
        const angle = (Math.PI*2*i)/5 - Math.PI/2;
        ctx.fillText(key, cx+(radius+20)*Math.cos(angle), cy+(radius+20)*Math.sin(angle)+4);
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
    checkAchievements(); drawRadarChart();
}

// --- [3] 렌더링: 캐릭터 (수정 버튼 추가됨) ---
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
            
            // [수정] 마스터리 헤더에 수정 버튼 추가
            let skillHtml = '';
            for (let sid in state.skills) {
                const skill = state.skills[sid];
                if (skill.mastery !== mid || skill.hidden) continue;
                const percent = Math.floor((skill.seconds % 3600) / 3600 * 100);
                
                // [수정] 스킬 행에 수정 버튼 추가
                skillHtml += `
                    <div class="skill-row">
                        <div style="flex:1">
                            <span>- ${skill.name}</span> <span style="color:#aaa;">Lv.${skill.level} (${percent}%)</span>
                        </div>
                        <button class="btn-edit" onclick="openEditSkillModal('${sid}')">✎</button>
                    </div>`;
            }
            
            if(skillHtml || true) { // 마스터리는 비어있어도 보여줌 (수정을 위해)
                detailBox.innerHTML += `
                    <div class="mastery-header">
                        <span class="mastery-title">${mastery.name} (Lv.${mastery.level})</span>
                        <button class="btn-edit" onclick="openEditMasteryModal('${mid}')">✎</button>
                    </div>
                    ${skillHtml || '<div style="color:#555;font-size:9px;padding:5px;">스킬 없음</div>'}
                `;
                hasContent = true;
            }
        }
        if(!hasContent) detailBox.innerHTML = '<div style="color:#555; font-size:9px; padding:5px;">데이터 없음</div>';
    });
}
window.toggleStat = (id) => {
    const el = document.getElementById(`detail-${id}`);
    el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

// --- [4] 스킬 & 마스터리 수정 로직 (핵심) ---

// 1. 스킬 수정
window.openEditSkillModal = (sid) => {
    editingSkillId = sid;
    const skill = state.skills[sid];
    
    document.getElementById('modal-edit-skill').style.display = 'flex';
    document.getElementById('edit-skill-name').value = skill.name;
    
    // 마스터리 이동 선택지 구성
    const select = document.getElementById('edit-skill-mastery');
    select.innerHTML = '';
    for(let mid in state.masteries) {
        const m = state.masteries[mid];
        const selected = (mid === skill.mastery) ? 'selected' : '';
        // 어느 스탯 소속인지 표시해주면 좋음
        select.innerHTML += `<option value="${mid}" ${selected}>${m.name} (${m.core})</option>`;
    }
};

window.saveSkillEdit = () => {
    if(!editingSkillId) return;
    const name = document.getElementById('edit-skill-name').value.trim();
    const mid = document.getElementById('edit-skill-mastery').value;
    
    if(!name) return showToast("이름을 입력하세요.");
    
    state.skills[editingSkillId].name = name;
    state.skills[editingSkillId].mastery = mid;
    
    DataManager.save(state);
    updateGlobalUI(); renderCharacter(); renderQuest(); // 이름 바뀌었으니 퀘스트도 갱신
    closeModal('modal-edit-skill');
    showToast("스킬 정보가 수정되었습니다.");
};

window.deleteSkillEdit = () => {
    if(!editingSkillId) return;
    openConfirmModal("이 스킬을 보관함(삭제)으로 보내시겠습니까?", () => {
        state.skills[editingSkillId].hidden = true;
        DataManager.save(state);
        updateGlobalUI(); renderCharacter(); renderQuest();
        closeModal('modal-edit-skill');
        showToast("스킬이 삭제되었습니다.");
    });
};

// 2. 마스터리 수정
window.openEditMasteryModal = (mid) => {
    editingMasteryId = mid;
    const mastery = state.masteries[mid];
    
    document.getElementById('modal-edit-mastery').style.display = 'flex';
    document.getElementById('edit-mastery-name').value = mastery.name;
    
    // 코어 스탯 이동 선택지
    const select = document.getElementById('edit-mastery-core');
    select.innerHTML = '';
    ['STR','DEX','INT','WIS','VIT'].forEach(cid => {
        const selected = (cid === mastery.core) ? 'selected' : '';
        select.innerHTML += `<option value="${cid}" ${selected}>${state.cores[cid].name}</option>`;
    });
};

window.saveMasteryEdit = () => {
    if(!editingMasteryId) return;
    const name = document.getElementById('edit-mastery-name').value.trim();
    const core = document.getElementById('edit-mastery-core').value;
    
    if(!name) return showToast("이름을 입력하세요.");
    
    state.masteries[editingMasteryId].name = name;
    state.masteries[editingMasteryId].core = core;
    
    DataManager.save(state);
    updateGlobalUI(); renderCharacter();
    closeModal('modal-edit-mastery');
    showToast("마스터리 정보가 수정되었습니다.");
};

window.deleteMasteryEdit = () => {
    if(!editingMasteryId) return;
    const mName = state.masteries[editingMasteryId].name;
    
    openConfirmModal(`⚠️ 경고: [${mName}] 마스터리를 삭제하면\n소속된 모든 스킬도 함께 사라집니다.\n정말 삭제하시겠습니까?`, () => {
        // 1. 소속 스킬들 찾아서 완전 삭제 (Hard Delete)
        for(let sid in state.skills) {
            if(state.skills[sid].mastery === editingMasteryId) {
                delete state.skills[sid];
            }
        }
        // 2. 마스터리 삭제
        delete state.masteries[editingMasteryId];
        
        // 3. 연결된 퀘스트 정리 (혹시 모르니)
        // (퀘스트는 skillId를 참조하므로 스킬이 삭제되면 자동으로 렌더링에서 빠지긴 함)
        
        DataManager.save(state);
        updateGlobalUI(); renderCharacter(); renderQuest();
        closeModal('modal-edit-mastery');
        showToast("마스터리와 하위 스킬이 모두 삭제되었습니다.");
    });
};

// --- [5] 나머지 렌더링 및 기능 (기존 유지) ---
function renderQuest() {
    const container = document.getElementById('quest-container'); container.innerHTML = ''; let count = 0;
    for (let qid in state.quests) {
        const quest = state.quests[qid];
        const mainSkill = state.skills[quest.mainSkillId];
        if (!mainSkill || mainSkill.hidden) continue;
        let subInfo = '';
        if (quest.subSkillId) { const s = state.skills[quest.subSkillId]; if(s && !s.hidden) subInfo = `<div style="margin-top:4px;"><span class="quest-tag tag-sub">Bonus</span> ${s.name}</div>`; }
        count++;
        container.innerHTML += `<div class="card quest-card"><div class="quest-info"><div class="quest-title">${quest.name}</div><div class="quest-sub"><div><span class="quest-tag tag-main">Main</span> ${mainSkill.name}</div>${subInfo}</div></div><div style="display:flex;gap:5px;"><button class="btn-sm" style="background:var(--accent);" onclick="startBattle('${qid}')">수락</button><button class="btn-sm" style="background:#333;color:#aaa;" onclick="confirmDeleteQuest('${qid}')">삭제</button></div></div>`;
    }
    document.getElementById('empty-quest-msg').style.display = count === 0 ? 'block' : 'none';
}

function renderInventory() {
    const grid = document.getElementById('inventory-grid'); grid.innerHTML = state.inventory.length===0?'<div style="grid-column:1/-1;text-align:center;color:#555;padding:20px;">비어있음</div>':'';
    state.inventory.forEach(i => grid.innerHTML += `<div class="inv-item" style="background:${i.type==='record'?'#222':'#111'}" onclick="showToast('[${i.name}] ${i.desc}')">${i.icon}</div>`);
}
function renderShop() {
    const box = document.getElementById('shop-container'); box.innerHTML = '';
    state.shopItems.forEach(i => {
        const div=document.createElement('div'); div.className='card'; div.style.display='flex';div.style.justifyContent='space-between';div.style.alignItems='center';
        div.innerHTML=`<div style="flex:1"><span>${i.name}</span></div><div style="display:flex;gap:5px;"><button class="btn-shop" style="width:auto;padding:8px;">${i.cost} G</button><button class="btn-sm btn-danger" style="width:auto;padding:8px;" onclick="confirmDeleteShopItem('${i.id}')">🗑️</button></div>`;
        div.querySelector('.btn-shop').onclick=()=>{ if(state.gold>=i.cost){openConfirmModal(`구매?`,()=>{state.gold-=i.cost;DataManager.save(state);updateGlobalUI();showToast("구매완료");});}else showToast("돈부족");};
        box.appendChild(div);
    });
}

// 모달 & 생성 로직
window.openTitleModal=()=>{document.getElementById('modal-title').style.display='flex';switchTitleTab('title');};
window.switchTitleTab=(t)=>{document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));document.getElementById(`tab-btn-${t}`).classList.add('active');const l=document.getElementById('title-list-container');l.innerHTML='';const it=t==='title'?state.unlockedTitles:state.unlockedJobs;const c=t==='title'?state.currentTitle:state.currentJob;if(it.length===0)l.innerHTML='<div style="padding:10px;color:#555;">없음</div>';it.forEach(i=>{const cls=c===i?'active':'';l.innerHTML+=`<div class="list-item ${cls}" onclick="equip${t==='title'?'Title':'Job'}('${i}')"><span>${i}</span>${cls?'✔':''}</div>`});};
window.equipTitle=(t)=>{state.currentTitle=t;DataManager.save(state);updateGlobalUI();switchTitleTab('title');showToast(`칭호:${t}`);};
window.equipJob=(j)=>{state.currentJob=j;DataManager.save(state);updateGlobalUI();switchTitleTab('job');showToast(`직업:${j}`);};
window.confirmDeleteQuest=(id)=>{openConfirmModal("삭제?",()=>{delete state.quests[id];DataManager.save(state);renderQuest();showToast("삭제됨");});};
window.confirmDeleteShopItem=(id)=>{openConfirmModal("삭제?",()=>{state.shopItems=state.shopItems.filter(i=>i.id!==id);DataManager.save(state);renderShop();showToast("삭제됨");});};
window.openSkillCreateModal=()=>{document.getElementById('modal-create-skill').style.display='flex';updateMasterySelect(null);const g=document.getElementById('core-select-group');g.innerHTML='';['STR','DEX','INT','WIS','VIT'].forEach(c=>{const d=document.createElement('div');d.className='chip';d.innerText=c;d.onclick=()=>{document.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));d.classList.add('active');selectedCoreForCreate=c;updateMasterySelect(c);};g.appendChild(d);});};
function updateMasterySelect(c){const s=document.getElementById('new-mastery-select');s.innerHTML='';if(!c){s.innerHTML='<option>--선택--</option>';return;}for(let m in state.masteries)if(state.masteries[m].core===c)s.innerHTML+=`<option value="${m}">${state.masteries[m].name}</option>`;s.innerHTML+='<option value="NEW">+새로생성</option>';checkMasteryInput();}
window.checkMasteryInput=()=>{document.getElementById('new-mastery-input').style.display=document.getElementById('new-mastery-select').value==='NEW'?'block':'none';};
window.createSkillAction=()=>{if(!selectedCoreForCreate)return showToast("스탯선택");let m=document.getElementById('new-mastery-select').value;const mi=document.getElementById('new-mastery-input').value.trim();const sn=document.getElementById('new-skill-name').value.trim();if(m==='NEW'&&!mi)return showToast("마스터리명입력");if(!sn)return showToast("스킬명입력");if(m==='NEW'){m='m'+Date.now();state.masteries[m]={name:mi,core:selectedCoreForCreate,level:0};}state.skills['s'+Date.now()]={name:sn,mastery:m,seconds:0,level:0,hidden:false};DataManager.save(state);closeModal('modal-create-skill');updateGlobalUI();renderCharacter();showToast("습득완료");};
window.openQuestManager=()=>{const sk=Object.values(state.skills).filter(s=>!s.hidden);if(sk.length===0)return showToast("스킬없음");document.getElementById('modal-create-quest').style.display='flex';const m=document.getElementById('quest-main-skill');const s=document.getElementById('quest-sub-skill');m.innerHTML='';s.innerHTML='<option value="">--없음--</option>';sk.forEach(k=>{const id=Object.keys(state.skills).find(key=>state.skills[key]===k);const o=`<option value="${id}">${k.name}</option>`;m.innerHTML+=o;s.innerHTML+=o;});};
window.createQuestAction=()=>{const n=document.getElementById('new-quest-name').value.trim();const m=document.getElementById('quest-main-skill').value;const s=document.getElementById('quest-sub-skill').value;if(!n)return showToast("이름입력");state.quests['q'+Date.now()]={name:n,mainSkillId:m,subSkillId:s||null};DataManager.save(state);closeModal('modal-create-quest');renderQuest();showToast("등록됨");};
function checkAchievements(){let u=false;if(state.cores.STR.level>=10&&!state.unlockedJobs.includes("전사")){state.unlockedJobs.push("전사");showToast("직업해금:전사");u=true;}if(u)DataManager.save(state);}
window.startBattle=(id)=>{activeQuestId=id;sessionSec=0;switchTab('battle');document.getElementById('battle-quest-name').innerText=state.quests[id].name;document.getElementById('battle-earning').innerText="수련중...";BattleManager.init();timer=setInterval(()=>{sessionSec++;const m=Math.floor(sessionSec/60).toString().padStart(2,'0'),s=(sessionSec%60).toString().padStart(2,'0');document.getElementById('battle-timer').innerText=`00:${m}:${s}`;},1000);};
document.getElementById('btn-stop').onclick=()=>{if(!timer)return;clearInterval(timer);timer=null;BattleManager.destroy();const q=state.quests[activeQuestId];const ms=state.skills[q.mainSkillId];state.gold+=sessionSec;if(ms)ms.seconds+=sessionSec;if(q.subSkillId){const ss=state.skills[q.subSkillId];if(ss)ss.seconds+=Math.floor(sessionSec*0.2);}let msg=`완료(+${sessionSec}G)`;if(sessionSec>60&&Math.random()>0.7){state.inventory.push({type:'loot',icon:'🎁',name:'전리품',desc:'보상'});msg+=' [전리품]';}showToast(msg);sessionSec=0;activeQuestId=null;document.getElementById('battle-quest-name').innerText="-";document.getElementById('battle-timer').innerText="00:00:00";DataManager.save(state);updateGlobalUI();switchTab('quest');};
document.getElementById('btn-export').onclick=()=>{try{DataManager.export(state);showToast("백업생성");}catch(e){showToast("오류");}};
document.getElementById('btn-import').onclick=()=>{document.getElementById('file-input').click();};
document.getElementById('file-input').onchange=(e)=>{const r=new FileReader();r.onload=(v)=>{try{state=JSON.parse(v.target.result);DataManager.save(state);location.reload();}catch{showToast("파일오류");}};if(e.target.files.length)r.readAsText(e.target.files[0]);};
document.getElementById('btn-reset').onclick=()=>{openConfirmModal("초기화?",()=>DataManager.reset());};
function switchTab(t){document.querySelectorAll('.tab-screen').forEach(e=>e.classList.remove('active'));document.getElementById(`tab-${t}`).classList.add('active');document.querySelectorAll('.nav-btn').forEach(e=>e.classList.remove('active'));document.querySelector(`.nav-btn[data-target="${t}"]`)?.classList.add('active');if(t==='character')renderCharacter();if(t==='quest')renderQuest();if(t==='inventory')renderInventory();if(t==='shop')renderShop();}
document.querySelectorAll('.nav-btn').forEach(b=>b.onclick=()=>switchTab(b.dataset.target));
window.openCreateItemModal=()=>{document.getElementById('modal-create-item').style.display='flex';document.getElementById('new-item-name').value='';};
window.createItemAction=()=>{const n=document.getElementById('new-item-name').value;const d=document.getElementById('new-item-desc').value;const i=document.getElementById('new-item-icon').value;if(!n)return showToast("이름입력");state.inventory.push({type:'record',icon:i||'📦',name:n,desc:d||''});DataManager.save(state);renderInventory();closeModal('modal-create-item');showToast("기록됨");};
window.openCreateShopItemModal=()=>{document.getElementById('modal-create-shop-item').style.display='flex';};
window.createShopItemAction=()=>{const n=document.getElementById('new-shop-item-name').value;const c=document.getElementById('new-shop-item-cost').value;if(!n)return showToast("입력");state.shopItems.push({id:'i'+Date.now(),name:n,cost:c});DataManager.save(state);renderShop();closeModal('modal-create-shop-item');};

// --- [6] 관리 기능 (기존 Manager 모달 내용도 유지하되, 리스트에서 바로 접근하므로 필요성 낮아짐) ---
window.openSkillManager = () => document.getElementById('modal-skill-manager').style.display = 'flex';
window.openRestoreSkillMode = () => {
    document.getElementById('modal-skill-manager').style.display = 'none';
    document.getElementById('modal-restore-skill').style.display = 'flex';
    const list = document.getElementById('deleted-skill-list'); list.innerHTML = '';
    for(let sid in state.skills) {
        const s = state.skills[sid];
        if(s.hidden) {
            list.innerHTML += `<div class="list-item"><span style="text-decoration:line-through;color:#666;">${s.name}</span><div style="display:flex;gap:5px;"><button class="btn-sm" onclick="restoreSkill('${sid}')">복구</button><button class="btn-sm btn-danger" onclick="permDeleteSkill('${sid}')">삭제</button></div></div>`;
        }
    }
};
window.restoreSkill=(sid)=>{state.skills[sid].hidden=false;DataManager.save(state);openRestoreSkillMode();renderCharacter();};
window.permDeleteSkill=(sid)=>{openConfirmModal("영구삭제?",()=>{delete state.skills[sid];DataManager.save(state);openRestoreSkillMode();updateGlobalUI();showToast("삭제됨");});};

updateGlobalUI(); renderCharacter();
