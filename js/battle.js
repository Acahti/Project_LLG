// [v11.5 Fix] Battle Manager - Lifecycle & Rendering Fix
export const BattleManager = {
    game: null,
    scene: null,
    mode: 'idle', 

    init: (mode = 'idle') => {
        const root = document.getElementById('phaser-root');
        
        // 1. 이미 게임이 실행 중이라면 모드만 변경하고 종료
        if (BattleManager.game) {
            BattleManager.setMode(mode);
            return;
        }

        // 2. DOM 안전장치: 혹시 모를 중복 캔버스 제거
        root.innerHTML = '';

        // 3. 게임 설정
        const config = {
            type: Phaser.AUTO,
            parent: 'phaser-root',
            width: 320,
            height: 200,
            transparent: true, // 배경 투명 허용 (CSS 배경색 사용)
            pixelArt: true,    // 도트 그래픽 선명하게
            scene: { preload: preload, create: create, update: update }
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
        if (BattleManager.game) {
            BattleManager.game.destroy(true);
            BattleManager.game = null;
            BattleManager.scene = null;
            document.getElementById('phaser-root').innerHTML = ''; // DOM 잔여물 제거
        }
    }
};

function preload() {}

function create() {
    BattleManager.scene = this;
    this.mode = BattleManager.mode;

    // --- 그룹 생성 ---
    this.idleGroup = this.add.group();
    this.battleGroup = this.add.group();

    // ================= [IDLE 모드: 모닥불] =================
    // 1. 밤하늘 배경 (Graphics 사용)
    const sky = this.add.graphics();
    sky.fillStyle(0x121214, 1);
    sky.fillRect(0, 0, 320, 200);
    this.idleGroup.add(sky);

    // 2. 별 (반짝임)
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

    // 3. 주인공 (앉아있는 모습)
    const heroIdle = this.add.container(140, 160);
    const hBody = this.add.rectangle(0, 0, 16, 16, 0x4D96FF); // 파란 갑옷
    const hHead = this.add.rectangle(0, -12, 12, 12, 0xFFCCAA); // 얼굴
    heroIdle.add([hBody, hHead]);
    this.idleGroup.add(heroIdle);

    // 4. 모닥불 (장작 + 불꽃)
    const log1 = this.add.rectangle(170, 170, 20, 6, 0x8B4513).setRotation(0.2);
    const log2 = this.add.rectangle(170, 170, 20, 6, 0x8B4513).setRotation(-0.2);
    this.idleGroup.add(log1);
    this.idleGroup.add(log2);

    // 불꽃 파티클 (텍스처 없이 도형으로 처리)
    const fireParticles = this.add.particles(0, 0, 'flare', {
        x: 170, y: 165,
        speed: { min: 10, max: 40 },
        angle: { min: 260, max: 280 },
        scale: { start: 0.6, end: 0 },
        lifespan: 800,
        blendMode: 'ADD',
        frequency: 100,
        quantity: 1,
        tint: [ 0xffaa00, 0xff0000 ]
    });
    
    // 파티클용 텍스처 즉석 생성
    if (!this.textures.exists('flare')) {
        const g = this.make.graphics({x:0, y:0, add:false});
        g.fillStyle(0xffffff, 1);
        g.fillCircle(4, 4, 4);
        g.generateTexture('flare', 8, 8);
    }
    
    this.fireEmitter = fireParticles;
    this.idleGroup.add(fireParticles);


    // ================= [BATTLE 모드: 전투] =================
    // 1. 붉은 배경
    const battleBg = this.add.rectangle(160, 100, 320, 200, 0x2a1a1a);
    this.battleGroup.add(battleBg);

    // 2. 바닥
    const floor = this.add.rectangle(160, 190, 320, 40, 0x1a1a1a);
    this.battleGroup.add(floor);

    // 3. 용사 (전투 태세)
    this.heroBattle = this.add.container(80, 170);
    const hbBody = this.add.rectangle(0, 0, 18, 20, 0x4D96FF);
    const hbHead = this.add.rectangle(0, -16, 14, 14, 0xFFCCAA);
    const hbSword = this.add.rectangle(14, 0, 24, 4, 0xCCCCCC); // 검
    this.heroBattle.add([hbBody, hbHead, hbSword]);
    this.battleGroup.add(this.heroBattle);

    // 4. 몬스터 (슬라임)
    this.enemy = this.add.container(240, 175);
    const eBody = this.add.rectangle(0, 0, 30, 20, 0x6BCB77); // 초록 슬라임
    const eEye1 = this.add.rectangle(-6, -4, 4, 4, 0x000000);
    const eEye2 = this.add.rectangle(6, -4, 4, 4, 0x000000);
    this.enemy.add([eBody, eEye1, eEye2]);
    this.battleGroup.add(this.enemy);

    // 전투 애니메이션 (트윈)
    this.attackTween = this.tweens.createTimeline();
    this.attackTween.add({
        targets: this.heroBattle,
        x: 210, // 돌진
        duration: 200,
        ease: 'Power2'
    });
    this.attackTween.add({
        targets: this.enemy,
        x: 260, // 넉백
        alpha: 0.5,
        duration: 100,
        yoyo: true,
        repeat: 1
    });
    this.attackTween.add({
        targets: this.heroBattle,
        x: 80, // 복귀
        duration: 300,
        delay: 200
    });
    this.attackTween.loop = -1;

    // --- 초기 상태 설정 ---
    this.idleGroup.setVisible(false);
    this.battleGroup.setVisible(false);
    
    // 모드 전환 함수 정의
    this.changeMode = (m) => {
        if (m === 'idle') {
            this.idleGroup.setVisible(true);
            this.battleGroup.setVisible(false);
            this.fireEmitter.start();
            if (this.attackTween.isPlaying()) this.attackTween.pause();
            this.heroBattle.x = 80; // 위치 초기화
        } else {
            this.idleGroup.setVisible(false);
            this.battleGroup.setVisible(true);
            this.fireEmitter.stop();
            this.attackTween.play();
        }
    };

    // 최초 실행
    this.changeMode(BattleManager.mode);
}

function update() {}
