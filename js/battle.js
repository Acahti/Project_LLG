export const BattleManager = {
    game: null,
    currentMode: 'idle',

    init: (mode = 'idle') => {
        if (BattleManager.game) {
            try { BattleManager.game.destroy(true); } catch (e) {}
            BattleManager.game = null;
        }

        const root = document.getElementById('phaser-root');
        if (root) root.innerHTML = '';

        const config = {
            type: Phaser.AUTO,
            parent: 'phaser-root',
            width: 320,
            height: 200,
            backgroundColor: '#121214',
            pixelArt: true,
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: 320,
                height: 200
            },
            scene: { preload: preload, create: create, update: update }
        };

        BattleManager.currentMode = mode;
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

function preload() {
    // 이미지가 있다면 여기서 로드 (지금은 도형이라 비워둠)
}

function create() {
    const mode = BattleManager.currentMode;
    
    // ================= [IDLE 모드] =================
    if (mode === 'idle') {
        this.cameras.main.setBackgroundColor('#121214');
        
        // [배경] 별
        for (let i = 0; i < 40; i++) {
            const x = Phaser.Math.Between(0, 320);
            const y = Phaser.Math.Between(0, 150);
            const star = this.add.rectangle(x, y, 2, 2, 0xFFFFFF);
            this.tweens.add({
                targets: star, alpha: 0.2, duration: Phaser.Math.Between(1000, 3000),
                yoyo: true, repeat: -1
            });
        }

        // [배경] 모닥불
        this.add.rectangle(160, 180, 24, 6, 0x8B4513).setRotation(0.2);
        this.add.rectangle(160, 180, 24, 6, 0x8B4513).setRotation(-0.2);
        
        if (!this.textures.exists('flare')) {
            const g = this.make.graphics({x:0, y:0, add:false});
            g.fillStyle(0xffaa00, 1);
            g.fillCircle(4,4,4);
            g.generateTexture('flare', 8, 8);
        }
        this.add.particles(0, 0, 'flare', {
            x: 160, y: 175,
            speed: { min: 20, max: 50 },
            angle: { min: 260, max: 280 },
            scale: { start: 0.6, end: 0 },
            blendMode: 'ADD',
            lifespan: 800,
            frequency: 80,
            quantity: 2
        });

        // ★ [수정] 관절 캐릭터 (변수에 정확히 담기!)
        const player = this.add.container(130, 170);

        // 1. 그림자
        const shadow = this.add.ellipse(0, 15, 30, 8, 0x000000, 0.5);
        
        // 2. 무기 (변수 weapon에 저장)
        const weapon = this.add.rectangle(12, 5, 6, 30, 0xCCCCCC);
        weapon.setOrigin(0.5, 1);
        weapon.rotation = 0.5;

        // 3. 몸통 (변수 body에 저장)
        const body = this.add.rectangle(0, 0, 20, 24, 0x4D96FF);

        // 4. 머리 (변수 head에 저장)
        const head = this.add.circle(0, -18, 10, 0xFFCCAA);

        // 5. 합체
        player.add([shadow, weapon, body, head]);

        // ★ [애니메이션] 이제 변수가 있으니 에러가 안 납니다
        this.tweens.add({
            targets: [body, head, weapon], // body, head가 정의되어야 작동함
            y: '+=2', 
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    } 
    // ================= [BATTLE 모드] =================
    else {
        this.cameras.main.setBackgroundColor('#2a1a1a');
        this.add.rectangle(160, 195, 330, 30, 0x111111);

        // ★ [수정] 전투 캐릭터
        const player = this.add.container(80, 170);

        const shadow = this.add.ellipse(0, 15, 40, 10, 0x000000, 0.3);
        
        // 무기 (전투 자세)
        const weapon = this.add.rectangle(12, 5, 6, 30, 0xDDDDDD);
        weapon.setOrigin(0.5, 1);
        weapon.angle = -20; 

        // 몸통
        const body = this.add.rectangle(0, 0, 20, 24, 0x4D96FF);

        // 머리
        const head = this.add.circle(0, -18, 10, 0xFFCCAA);

        player.add([shadow, weapon, body, head]);

        // 기본 숨쉬기 (빠르게)
        this.tweens.add({
            targets: [body, head, weapon],
            y: '+=2',
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 적 (슬라임)
        const enemy = this.add.container(240, 180);
        const eBody = this.add.rectangle(0, 0, 32, 24, 0x6BCB77);
        const eEye1 = this.add.rectangle(-6, -4, 4, 4, 0x000000);
        const eEye2 = this.add.rectangle(6, -4, 4, 4, 0x000000);
        enemy.add([eBody, eEye1, eEye2]);

        // ★ 전투 액션 루프
        this.time.addEvent({
            delay: 1500,
            loop: true,
            callback: () => {
                // 1. 무기 휘두르기
                this.tweens.add({
                    targets: weapon, // weapon 변수가 있어서 작동함
                    angle: { from: -20, to: 100 },
                    duration: 150,
                    yoyo: true,
                    ease: 'Back.easeOut'
                });

                // 2. 몸통 돌진
                this.tweens.add({
                    targets: [body, head, weapon],
                    x: '+=15',
                    duration: 100,
                    yoyo: true,
                    ease: 'Sine.easeOut'
                });

                // 3. 적 피격
                this.tweens.add({
                    targets: enemy,
                    alpha: 0.4,
                    scaleX: 0.8,
                    scaleY: 1.2,
                    duration: 80,
                    yoyo: true,
                    delay: 100
                });
            }
        });
    }
}

function update() {}
