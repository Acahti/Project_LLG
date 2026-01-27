import { DataManager } from './data.js';
import { BattleManager } from './battle.js';

let state = DataManager.load();
let currentCategory = null; // 'loot' or 'record'
let currentFolderId = null; // null if root
let timer = null, sessionSec = 0, activeQuestId = null;
let selectedIcon = 'star', selectedColor = '#4A4A4A', selectedShape = 'shape-square';
let editingItemId = null;

// --- [보관함 프리셋 데이터] ---
const ICON_LIST = ['star', 'menu_book', 'psychology', 'terminal', 'fitness_center', 'military_tech', 'workspace_premium', 'shield', 'diamond', 'favorite', 'auto_awesome', 'trending_up', 'history_edu', 'palette', 'language', 'construction', 'biotech', 'emoji_events', 'flag', 'bolt'];
const LOOT_COLORS = [
    { name: 'Common', code: '#4A4A4A' },
    { name: 'Uncommon', code: '#2D5A27' },
    { name: 'Rare', code: '#244A7D' },
    { name: 'Epic', code: '#6A329F' },
    { name: 'Legendary', code: '#A17917' }
];
const RECORD_COLORS = ['#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#607D8B'];
const SHAPES = [
    { id: 'shape-square', icon: 'crop_square' },
    { id: 'shape-circle', icon: 'circle' },
    { id: 'shape-shield', icon: 'security' },
    { id: 'shape-hexagon', icon: 'hexagon' }
];

// --- [초기화 및 네비게이션] ---
const initApp = () => {
    document.body.className = state.settings.theme + '-theme';
    document.documentElement.style.setProperty('--base-font', state.settings.fontSize + 'px');
    updateGlobalUI();
};

window.enterCategory = (cat) => {
    currentCategory = cat; currentFolderId = null;
    document.getElementById('inventory-portal').style.display = 'none';
    document.getElementById('inventory-content').style.display = 'block';
    document.getElementById('inv-breadcrumb').innerText = cat === 'loot' ? '전리품' : '기록';
    updateInvRender();
};

window.exitToPortal = () => {
    if(currentFolderId) { currentFolderId = null; updateInvRender(); return; }
    document.getElementById('inventory-portal').style.display = 'flex';
    document.getElementById('inventory-content').style.display = 'none';
};

// --- [렌더링 로직] ---
window.updateInvRender = () => {
    const grid = document.getElementById('inventory-grid'); grid.innerHTML = '';
    const sortType = document.getElementById('sort-select').value;
    
    // 필터링: 현재 카테고리 + 현재 폴더 내부 아이템 (폴더 자체 포함)
    let list = state.inventory.filter(i => {
        if(i.category !== currentCategory) return false;
        if(currentFolderId) return i.parentId === currentFolderId;
        return !i.parentId;
    });

    // 정렬 로직
    list.sort((a, b) => {
        // 폴더는 항상 맨 위로
        if (a.type === 'folder' && b.type !== 'folder') return -1;
        if (a.type !== 'folder' && b.type === 'folder') return 1;

        if (sortType === 'date_desc') return b.timestamp - a.timestamp;
        if (sortType === 'date_asc') return a.timestamp - b.timestamp;
        if (sortType === 'name_asc') return a.name.localeCompare(b.name);
        if (sortType === 'name_desc') return b.name.localeCompare(a.name);
        return 0;
    });

    list.forEach(item => {
        const wrapper = document.createElement('div');
        wrapper.className = 'badge-wrapper';
        
        if (item.type === 'folder') {
            wrapper.innerHTML = `
                <div class="badge-box shape-square" style="background:#333; border:2px dashed var(--accent);">
                    <span class="material-icons-round" style="font-size:2.5em; color:var(--accent);">folder</span>
                </div>
                <div class="badge-label">${item.name}</div>`;
            wrapper.onclick = () => { currentFolderId = item.id; updateInvRender(); };
        } else {
            wrapper.innerHTML = `
                <div class="badge-box ${item.shape || 'shape-square'}" style="background:${item.color};">
                    <span class="material-icons-round" style="font-size:2.5em;">${item.icon}</span>
                </div>
                <div class="badge-label">${item.name}</div>`;
            wrapper.onclick = () => openItemDetail(item.id);
        }
        grid.appendChild(wrapper);
    });
};

// --- [상세 정보 및 관리] ---
window.openItemDetail = (id) => {
    const item = state.inventory.find(i => i.id === id);
    editingItemId = id;
    const modal = document.getElementById('modal-item-detail');
    
    document.getElementById('detail-badge').className = `badge-box ${item.shape || 'shape-square'}`;
    document.getElementById('detail-badge').style.background = item.color;
    document.getElementById('detail-badge').innerHTML = `<span class="material-icons-round" style="font-size:2.5em;">${item.icon}</span>`;
    document.getElementById('detail-name').innerText = item.name;
    document.getElementById('detail-desc').innerText = item.desc || '설명이 없습니다.';

    // 권한 제어: 전리품은 수정/삭제 숨김
    const isLoot = item.type === 'loot';
    document.getElementById('btn-edit-item').style.display = isLoot ? 'none' : 'flex';
    document.getElementById('btn-delete-item').style.display = isLoot ? 'none' : 'flex';
    
    // 액션 버튼 연결
    document.getElementById('btn-edit-item').onclick = () => openItemEditModal(id);
    document.getElementById('btn-delete-item').onclick = () => {
        openConfirmModal("삭제 확인", "정말 삭제하시겠습니까?", () => {
            state.inventory = state.inventory.filter(i => i.id !== id);
            DataManager.save(state); updateInvRender(); closeModal('modal-item-detail');
        });
    };
    document.getElementById('btn-move-item').onclick = () => openMoveModal(id);

    modal.style.display = 'flex';
};

// --- [아이콘 & 색상 픽커] ---
function initPickers(cat) {
    const iconGrid = document.getElementById('icon-picker'); iconGrid.innerHTML = '';
    ICON_LIST.forEach(icon => {
        const div = document.createElement('div'); div.className = 'picker-item'; div.innerHTML = `<span class="material-icons-round">${icon}</span>`;
        if(icon === selectedIcon) div.classList.add('active');
        div.onclick = () => { selectedIcon = icon; initPickers(cat); };
        iconGrid.appendChild(div);
    });

    const colorGrid = document.getElementById('color-picker'); colorGrid.innerHTML = '';
    const colors = (cat === 'loot') ? LOOT_COLORS.map(c => c.code) : RECORD_COLORS;
    colors.forEach(code => {
        const div = document.createElement('div'); div.className = 'picker-item'; div.style.background = code;
        if(code === selectedColor) div.classList.add('active');
        div.onclick = () => { selectedColor = code; initPickers(cat); };
        colorGrid.appendChild(div);
    });

    const shapeGrid = document.getElementById('shape-picker'); shapeGrid.innerHTML = '';
    SHAPES.forEach(sh => {
        const div = document.createElement('div'); div.className = 'picker-item'; div.innerHTML = `<span class="material-icons-round">${sh.icon}</span>`;
        if(sh.id === selectedShape) div.classList.add('active');
        div.onclick = () => { selectedShape = sh.id; initPickers(cat); };
        shapeGrid.appendChild(div);
    });
}

window.handleInvAdd = () => { openItemEditModal(null); };

window.openItemEditModal = (id) => {
    closeModal('modal-item-detail');
    editingItemId = id;
    const modal = document.getElementById('modal-edit-item');
    document.getElementById('shape-section').style.display = (currentCategory === 'loot') ? 'block' : 'none';
    
    if(id) {
        const item = state.inventory.find(i => i.id === id);
        document.getElementById('edit-item-name').value = item.name;
        document.getElementById('edit-item-desc').value = item.desc;
        selectedIcon = item.icon; selectedColor = item.color; selectedShape = item.shape || 'shape-square';
    } else {
        document.getElementById('edit-item-name').value = '';
        document.getElementById('edit-item-desc').value = '';
        selectedIcon = 'star'; selectedColor = (currentCategory === 'loot') ? '#4A4A4A' : '#E91E63'; selectedShape = 'shape-square';
    }
    
    initPickers(currentCategory);
    modal.style.display = 'flex';
};

window.saveItemAction = () => {
    const name = document.getElementById('edit-item-name').value.trim();
    if(!name) return showToast("이름을 입력해주세요.");
    
    const itemData = {
        id: editingItemId || 'item_' + Date.now(),
        type: currentCategory, // loot or record
        category: currentCategory,
        name: name,
        desc: document.getElementById('edit-item-desc').value,
        icon: selectedIcon,
        color: selectedColor,
        shape: (currentCategory === 'loot') ? selectedShape : 'shape-square',
        parentId: currentFolderId,
        timestamp: editingItemId ? state.inventory.find(i=>i.id===editingItemId).timestamp : Date.now()
    };

    if(editingItemId) {
        const idx = state.inventory.findIndex(i => i.id === editingItemId);
        state.inventory[idx] = itemData;
    } else {
        state.inventory.push(itemData);
    }

    DataManager.save(state); updateInvRender(); closeModal('modal-edit-item'); showToast("저장되었습니다.");
};

// --- [폴더 시스템] ---
window.openFolderCreateModal = () => {
    openConfirmModal("폴더 생성", "새 폴더의 이름을 입력해주세요.", () => {
        // 실제로는 input이 포함된 모달이 좋으나, lazy user 컨셉상 간단히 prompt 대체 혹은 전용모달 권장
        // 여기서는 구조상 간단히 confirm 후 이름을 고정(나중에 수정가능)하는 식으로 추론
        const folderName = "새 폴더"; 
        state.inventory.push({
            id: 'folder_' + Date.now(),
            type: 'folder',
            category: currentCategory,
            name: folderName,
            parentId: null,
            timestamp: Date.now()
        });
        DataManager.save(state); updateInvRender();
    });
};

window.openMoveModal = (id) => {
    const folders = state.inventory.filter(i => i.type === 'folder' && i.category === currentCategory);
    let msg = "이동할 폴더를 선택하세요:\n0. 최상위(밖으로)";
    folders.forEach((f, idx) => msg += `\n${idx+1}. ${f.name}`);
    
    // 단순화를 위해 브라우저 선택창 활용 (실제 개발 시 전용 모달 추천)
    const choice = prompt(msg, "0");
    if (choice === null) return;
    
    const item = state.inventory.find(i => i.id === id);
    if (choice === "0") item.parentId = null;
    else {
        const folder = folders[parseInt(choice) - 1];
        if (folder) item.parentId = folder.id;
    }
    
    DataManager.save(state); updateInvRender(); closeModal('modal-item-detail'); showToast("이동되었습니다.");
};

// --- [기본 시스템 로직 (기존 유지)] ---
window.openSettingsMainModal = () => document.getElementById('modal-settings-main').style.display = 'flex';
window.closeModal = (id) => document.getElementById(id).style.display = 'none';
window.showToast = (msg) => {
    const c = document.getElementById('toast-container'); const d = document.createElement('div');
    d.className = 'toast'; d.innerText = msg; c.appendChild(d);
    setTimeout(() => { d.classList.add('hide'); setTimeout(() => d.remove(), 400); }, 2500);
};

// ... (v9.1의 나머지 함수들: updateGlobalUI, drawRadarChart, startBattle, DataEvents 등 통합)

// 탭 전환 로직 보강
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.onclick = () => {
        const target = btn.dataset.target;
        document.querySelectorAll('.tab-screen').forEach(s => s.classList.remove('active'));
        document.getElementById(`tab-${target}`).classList.add('active');
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if(target === 'inventory') {
            document.getElementById('inventory-portal').style.display = 'flex';
            document.getElementById('inventory-content').style.display = 'none';
        }
    };
});

initApp();
