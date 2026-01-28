export const BattleManager = {
    game: null,
    currentMode: 'idle',

    // [v11.8 Fix] 화면 꽉 차게 스케일링 설정 추가
    init: (mode = 'idle') => {
        // 1. 기존 게임이 있다면 파괴
        if (BattleManager.game) {
            try {
                BattleManager.game.destroy(true);
            } catch (e) { console.warn("Game destroy warning", e); }
            BattleManager.game = null;
        }

        // 2. DOM 청소
        const root = document.getElementById('phaser-root');
        if (root) root.innerHTML = '';

        // 3. 게임 설정 (스케일링 추가)
        const config = {
            type: Phaser.AUTO,
            parent: 'phaser-root', // 여기에 캔버스가 들어감
            width: 320,
            height: 200,
            backgroundColor: '#121214',
            pixelArt: true, // 도트가 흐릿해지지 않게 설정
            
            // [핵심 수정] 화면 크기에 맞춰 늘리기
            scale: {
                mode: Phaser.Scale.FIT, // 부모 div에 맞춰 비율 유지하며 꽉 채움
                autoCenter: Phaser.Scale.CENTER_BOTH, // 중앙 정렬
                width: 320,
                height: 200
            },
            
            scene: { preload: preload, create: create, update: update }
        };

        BattleManager.currentMode = mode;
        // 약간의 딜레이로 DOM 렌더링 확보
        setTimeout(() => {
            BattleManager.game = new Phaser.Game(config);
        }, 50); 
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
    
    // ================= [IDLE 모드] =================
    if (mode === 'idle') {
        // 배경: 밤하늘
        this.cameras.main.setBackgroundColor('#121214');
        
        // 별 (랜덤)
        for (let i = 0; i < 40; i++) {
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

        // 주인공 (앉음 - 뒷모습 느낌)
        const hero = this.add.container(130, 175);
        hero.add(this.add.rectangle(0, 0, 14, 14, 0x4D96FF)); // Body
        hero.add(this.add.rectangle(0, -10, 10, 10, 0xFFCCAA)); // Head
    } 
    // ================= [BATTLE 모드] =================
    else {
        // 배경: 전투 (약간 붉은끼)
        this.cameras.main.setBackgroundColor('#2a1a1a');
        
        // 바닥 (꽉 채우기 위해 너비 넉넉하게)
        this.add.rectangle(160, 195, 330, 30, 0x111111);

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

        // 전투 애니메이션 (타격감)
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
