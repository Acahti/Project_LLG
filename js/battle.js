// [v11.6 Fix] Battle Manager - Robust Lifecycle & Rendering
export const BattleManager = {
    game: null,
    scene: null,
    currentMode: 'idle', // 'idle' or 'battle'

    init: (mode = 'idle') => {
        const root = document.getElementById('phaser-root');
        
        // 1. 이미 게임이 실행 중이라면 모드만 변경
        if (BattleManager.game) {
            BattleManager.setMode(mode);
            return;
        }

        // 2. DOM 초기화 (중복 캔버스 방지)
        root.innerHTML = '';

        // 3. 게임 설정
        const config = {
            type: Phaser.AUTO,
            parent: 'phaser-root',
            width: 320,
            height: 200,
            transparent: false, 
            backgroundColor: '#121214', // 기본 배경색 지정
            pixelArt: true,
            scene: { preload: preload, create: create, update: update }
        };

        BattleManager.currentMode = mode;
        BattleManager.game = new Phaser.Game(config);
    },

    setMode: (mode) => {
        BattleManager.currentMode = mode;
        if (BattleManager.scene) {
            BattleManager.scene.changeMode(mode);
        }
    },

    destroy: () => {
        if (BattleManager.game) {
            BattleManager.game.destroy(true);
            BattleManager.game = null;
            BattleManager.scene = null;
        }
    }
};

function preload() {}

function create() {
    BattleManager.scene = this;
    
    // --- 그룹 생성 ---
    this.idleGroup = this.add.group();
    this.battleGroup = this.add.group();

    // ================= [IDLE 모드: 모닥불] =================
    // 1. 밤하늘 배경
    const sky = this.add.rectangle(160, 100, 320, 200, 0x121214);
    this.idleGroup.add(sky);

    // 2. 별 (애니메이션)
    for (let i = 0; i < 20; i++) {
        const star = this.add.rectangle(
            Phaser.Math.Between(10, 310), 
            Phaser.Math.Between(10, 150), 
            2, 2, 0xFFFFFF
        );
        this.tweens.add({
            targets: star,
            alpha: 0.2,
            duration: Phaser.Math.Between(1000, 2000),
            yoyo: true,
            repeat: -1
        });
        this.idleGroup.add(star);
    }

    // 3. 주인공 (휴식)
    const heroIdle = this.add.container(140, 160);
    const hBody = this.add.rectangle(0, 0, 16, 16, 0x4D96FF); 
    const hHead = this.add.rectangle(0, -12, 12, 12, 0xFFCCAA); 
    heroIdle.add([hBody, hHead]);
    this.idleGroup.add(heroIdle);

    // 4. 모닥불
    const log1 = this.add.rectangle(170, 170, 20, 6, 0x8B4513).setRotation(0.2);
    const log2 = this.add.rectangle(170, 170, 20, 6, 0x8B4513).setRotation(-0.2);
    this.idleGroup.add(log1);
    this.idleGroup.add(log2);

    // 불꽃 파티클 (텍스처 자동 생성)
    if (!this.textures.exists('flare')) {
        const g = this.make.graphics({x:0, y:0, add:false});
        g.fillStyle(0xffffff, 1);
        g.fillCircle(4, 4, 4);
        g.generateTexture('flare', 8, 8);
    }

    const fireParticles = this.add.particles(0, 0, 'flare', {
        x: 170, y: 165,
        speed: { min: 10, max: 30 },
        angle: { min: 260, max: 280 },
        scale: { start: 0.5, end: 0 },
        lifespan: 800,
        blendMode: 'ADD',
        frequency: 100,
        tint: [ 0xffaa00, 0xff0000 ]
    });
    this.fireEmitter = fireParticles;
    this.idleGroup.add(fireParticles);


    // ================= [BATTLE 모드: 전투] =================
    // 1. 전투 배경
    const battleBg = this.add.rectangle(160, 100, 320, 200, 0x2a1a1a);
    this.battleGroup.add(battleBg);

    // 2. 바닥
    const floor = this.add.rectangle(160, 190, 320, 40, 0x1a1a1a);
    this.battleGroup.add(floor);

    // 3. 용사 (전투)
    this.heroBattle = this.add.container(80, 170);
    const hbBody = this.add.rectangle(0, 0, 18, 20, 0x4D96FF);
    const hbHead = this.add.rectangle(0, -16, 14, 14, 0xFFCCAA);
    const hbSword = this.add.rectangle(14, 0, 24, 4, 0xCCCCCC);
    this.heroBattle.add([hbBody, hbHead, hbSword]);
    this.battleGroup.add(this.heroBattle);

    // 4. 몬스터 (슬라임)
    this.enemy = this.add.container(240, 175);
    const eBody = this.add.rectangle(0, 0, 30, 20, 0x6BCB77);
    const eEye1 = this.add.rectangle(-6, -4, 4, 4, 0x000000);
    const eEye2 = this.add.rectangle(6, -4, 4, 4, 0x000000);
    this.enemy.add([eBody, eEye1, eEye2]);
    this.battleGroup.add(this.enemy);

    // 전투 애니메이션
    this.attackTween = this.tweens.createTimeline();
    this.attackTween.add({ targets: this.heroBattle, x: 210, duration: 200, ease: 'Power2' });
    this.attackTween.add({ targets: this.enemy, x: 260, alpha: 0.5, duration: 100, yoyo: true, repeat: 1 });
    this.attackTween.add({ targets: this.heroBattle, x: 80, duration: 300, delay: 200 });
    this.attackTween.loop = -1;

    // --- 초기 모드 적용 ---
    this.changeMode = (m) => {
        if (m === 'idle') {
            this.cameras.main.setBackgroundColor('#121214');
            this.idleGroup.setVisible(true);
            this.battleGroup.setVisible(false);
            this.fireEmitter.start();
            if (this.attackTween.isPlaying()) this.attackTween.pause();
            this.heroBattle.x = 80;
        } else {
            this.cameras.main.setBackgroundColor('#2a1a1a');
            this.idleGroup.setVisible(false);
            this.battleGroup.setVisible(true);
            this.fireEmitter.stop();
            this.attackTween.play();
        }
    };

    // 씬 생성 시점에 현재 설정된 모드로 즉시 전환
    this.changeMode(BattleManager.currentMode);
}

function update() {}
