export const BattleManager = {
    game: null,
    currentMode: 'idle',

    // [v11.7 Fix] 무조건 파괴 후 재생성 (안정성 최우선)
    init: (mode = 'idle') => {
        // 1. 기존 게임이 있다면 가차없이 파괴
        if (BattleManager.game) {
            try {
                BattleManager.game.destroy(true);
            } catch (e) { console.warn("Game destroy warning", e); }
            BattleManager.game = null;
        }

        // 2. DOM 잔여물 청소
        const root = document.getElementById('phaser-root');
        if (root) root.innerHTML = '';

        // 3. 새 설정으로 게임 생성
        const config = {
            type: Phaser.AUTO,
            parent: 'phaser-root',
            width: 320,
            height: 200,
            backgroundColor: '#121214',
            pixelArt: true,
            scene: { preload: preload, create: create, update: update }
        };

        BattleManager.currentMode = mode;
        setTimeout(() => {
            BattleManager.game = new Phaser.Game(config);
        }, 50); // 아주 짧은 딜레이로 DOM 렌더링 후 실행 보장
    },

    destroy: () => {
        if (BattleManager.game) {
            BattleManager.game.destroy(true);
            BattleManager.game = null;
        }
    }
};

function preload() {}

function create() {
    // 모드 확인
    const mode = BattleManager.currentMode;
    const bgGroup = this.add.group();
    
    // ================= [IDLE 모드] =================
    if (mode === 'idle') {
        // 배경: 밤하늘
        this.cameras.main.setBackgroundColor('#121214');
        
        // 별 (랜덤)
        for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(0, 320);
            const y = Phaser.Math.Between(0, 150);
            const star = this.add.rectangle(x, y, 2, 2, 0xFFFFFF);
            this.tweens.add({
                targets: star, alpha: 0.2, duration: Phaser.Math.Between(1000, 3000),
                yoyo: true, repeat: -1
            });
        }

        // 모닥불 (도형)
        const log1 = this.add.rectangle(160, 180, 24, 6, 0x8B4513).setRotation(0.2);
        const log2 = this.add.rectangle(160, 180, 24, 6, 0x8B4513).setRotation(-0.2);
        
        // 불꽃 파티클 (텍스처 즉석 생성)
        if (!this.textures.exists('flare')) {
            const g = this.make.graphics({x:0, y:0, add:false});
            g.fillStyle(0xffaa00, 1);
            g.fillCircle(4,4,4);
            g.generateTexture('flare', 8, 8);
        }
        const particles = this.add.particles(0, 0, 'flare', {
            x: 160, y: 175,
            speed: { min: 20, max: 50 },
            angle: { min: 260, max: 280 },
            scale: { start: 0.6, end: 0 },
            blendMode: 'ADD',
            lifespan: 800,
            frequency: 80,
            quantity: 2
        });

        // 주인공 (앉음)
        const hero = this.add.container(130, 175);
        hero.add(this.add.rectangle(0, 0, 14, 14, 0x4D96FF)); // Body
        hero.add(this.add.rectangle(0, -10, 10, 10, 0xFFCCAA)); // Head
    } 
    // ================= [BATTLE 모드] =================
    else {
        // 배경: 전투
        this.cameras.main.setBackgroundColor('#2a1a1a');
        
        // 바닥
        this.add.rectangle(160, 195, 320, 30, 0x111111);

        // 주인공 (전투)
        const hero = this.add.container(80, 175);
        hero.add(this.add.rectangle(0, 0, 16, 20, 0x4D96FF));
        hero.add(this.add.rectangle(0, -14, 12, 12, 0xFFCCAA));
        hero.add(this.add.rectangle(12, 0, 24, 4, 0xDDDDDD)); // Sword

        // 적 (슬라임)
        const enemy = this.add.container(240, 180);
        enemy.add(this.add.rectangle(0, 0, 32, 24, 0x6BCB77)); // Body
        enemy.add(this.add.rectangle(-6, -4, 4, 4, 0x000000)); // Eye
        enemy.add(this.add.rectangle(6, -4, 4, 4, 0x000000)); // Eye

        // 전투 애니메이션
        this.tweens.add({
            targets: hero,
            x: 210, duration: 200, yoyo: true, hold: 50, repeat: -1, repeatDelay: 500
        });
        this.tweens.add({
            targets: enemy,
            x: 245, alpha: 0.7, duration: 100, yoyo: true, repeat: -1, repeatDelay: 500, delay: 200
        });
    }
}

function update() {}
