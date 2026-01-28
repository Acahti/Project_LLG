// [v11.3] Battle & Idle Visual Manager
export const BattleManager = {
    game: null,
    scene: null,
    mode: 'idle', // 'idle' or 'battle'

    init: (mode = 'idle') => {
        if (BattleManager.game) {
            BattleManager.setMode(mode);
            return;
        }

        const config = {
            type: Phaser.AUTO,
            parent: 'phaser-root',
            width: 320,
            height: 240, // 레트로 비율
            backgroundColor: '#121214',
            scene: {
                preload: preload,
                create: create,
                update: update
            }
        };

        BattleManager.game = new Phaser.Game(config);
        BattleManager.mode = mode;
    },

    setMode: (mode) => {
        BattleManager.mode = mode;
        if (BattleManager.scene) {
            BattleManager.scene.changeMode(mode);
        }
    },

    destroy: () => {
        // 게임 인스턴스는 유지하되 모드만 변경하는 것이 성능상 좋음
        // 여기서는 완전 종료가 필요하다면 사용
        if (BattleManager.game) {
            BattleManager.game.destroy(true);
            BattleManager.game = null;
        }
    }
};

function preload() {}

function create() {
    BattleManager.scene = this;
    this.mode = BattleManager.mode;

    // 1. 모닥불 (Idle) 그룹
    this.idleGroup = this.add.group();
    
    // 장작 그리기
    const graphics = this.add.graphics();
    graphics.fillStyle(0x8B4513, 1); // 갈색
    graphics.fillRect(140, 180, 40, 10);
    graphics.fillRect(155, 170, 10, 30);
    graphics.rotation = 0.1;
    this.idleGroup.add(graphics);

    // 불꽃 파티클
    const particles = this.add.particles(0, 0, 'flare', {
        x: 160,
        y: 180,
        speed: { min: 20, max: 50 },
        angle: { min: 260, max: 280 },
        scale: { start: 0.5, end: 0 },
        blendMode: 'ADD',
        lifespan: 1000,
        frequency: 100,
        quantity: 2
    });
    
    // 파티클 텍스처를 코드로 생성 (원형)
    const texture = this.textures.createCanvas('flare', 10, 10);
    const context = texture.getSourceImage().getContext('2d');
    context.fillStyle = '#FF5C5C';
    context.beginPath();
    context.arc(5, 5, 5, 0, Math.PI * 2);
    context.fill();
    texture.refresh();

    this.fireEmitter = particles;
    this.idleGroup.add(particles);

    // 2. 전투 (Battle) 그룹
    this.battleGroup = this.add.group();
    const monster = this.add.text(160, 120, '⚔️', { fontSize: '40px' }).setOrigin(0.5);
    this.battleGroup.add(monster);
    this.battleGroup.setVisible(false);

    // 초기 모드 설정
    this.changeMode = (m) => {
        this.mode = m;
        if (m === 'idle') {
            this.cameras.main.setBackgroundColor('#121214'); // 어두운 배경
            this.idleGroup.setVisible(true);
            this.battleGroup.setVisible(false);
            this.fireEmitter.start();
        } else {
            this.cameras.main.setBackgroundColor('#2a1a1a'); // 붉은 기운 배경
            this.idleGroup.setVisible(false);
            this.battleGroup.setVisible(true);
            this.fireEmitter.stop(); // 불 끄기
        }
    };

    // 최초 실행
    this.changeMode(this.mode);
}

function update() {
    if (this.mode === 'battle') {
        // 전투 중 흔들림 효과 등
        this.battleGroup.getChildren()[0].rotation = Math.sin(this.time.now / 200) * 0.2;
    }
}
