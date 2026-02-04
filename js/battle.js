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
                autoCenter: Phaser.ScH,ale.CENTER_BOT // 중앙 정렬
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

create: function() {
    // 모드 확인
    const mode = BattleManager.currentMode;
    
    // ================= [IDLE 모드: 모닥불 휴식] =================
    if (mode === 'idle') {
        // 1. 배경 연출 (기존 코드 유지 - 밤하늘 & 별)
        this.cameras.main.setBackgroundColor('#121214');
        
        for (let i = 0; i < 40; i++) {
            const x = Phaser.Math.Between(0, 320);
            const y = Phaser.Math.Between(0, 150);
            const star = this.add.rectangle(x, y, 2, 2, 0xFFFFFF);
            this.tweens.add({
                targets: star, alpha: 0.2, duration: Phaser.Math.Between(1000, 3000),
                yoyo: true, repeat: -1
            });
        }

        // 2. 모닥불 연출 (기존 코드 유지)
        const log1 = this.add.rectangle(160, 180, 24, 6, 0x8B4513).setRotation(0.2);
        const log2 = this.add.rectangle(160, 180, 24, 6, 0x8B4513).setRotation(-0.2);
        
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

        // 3. ★ 주인공 (관절 캐릭터로 교체) - 모닥불 옆에 서 있음
        const player = this.add.container(130, 170); // 위치 설정

        // [그림자]
        const shadow = this.add.ellipse(0, 15, 30, 8, 0x000000, 0.5);
        
        // [무기] (등에 멘 것처럼 혹은 손에 든 상태)
        const weapon = this.add.rectangle(12, 5, 6, 30, 0xCCCCCC);
        weapon.setOrigin(0.5, 1); // 손잡이 기준
        weapon.rotation = 0.5; // 편안하게 들고 있음

        // [몸통] (갑옷)
        const body = this.add.rectangle(0, 0, 20, 24, 0x4D96FF);

        // [머리] (얼굴)
        const head = this.add.circle(0, -18, 10, 0xFFCCAA);

        // 합체! (그림자는 움직임에서 제외하기 위해 컨테이너에 넣되, 애니메이션 타겟에선 뺄 예정)
        player.add([shadow, weapon, body, head]);

        // [애니메이션] 숨쉬기 (Idle)
        // 몸, 머리, 무기가 천천히 위아래로 움직임
        this.tweens.add({
            targets: [body, head, weapon],
            y: '+=2', // 2픽셀 내려감
            duration: 1500, // 천천히
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    } 
    // ================= [BATTLE 모드: 전투] =================
    else {
        // 1. 배경 연출 (기존 코드 유지)
        this.cameras.main.setBackgroundColor('#2a1a1a');
        this.add.rectangle(160, 195, 330, 30, 0x111111); // 바닥

        // 2. ★ 주인공 (관절 캐릭터로 교체)
        const player = this.add.container(80, 170); // 왼쪽 배치

        // [그림자]
        const shadow = this.add.ellipse(0, 15, 40, 10, 0x000000, 0.3);

        // [무기] (전투 자세)
        const weapon = this.add.rectangle(12, 5, 6, 30, 0xDDDDDD);
        weapon.setOrigin(0.5, 1); // ★ 핵심: 회전축을 손잡이 끝으로
        weapon.angle = -20; // 전투 준비 자세 (뒤로 살짝 뺌)

        // [몸통]
        const body = this.add.rectangle(0, 0, 20, 24, 0x4D96FF);

        // [머리]
        const head = this.add.circle(0, -18, 10, 0xFFCCAA);

        player.add([shadow, weapon, body, head]);

        // [기본 애니메이션] 거친 숨소리 (전투 중이라 조금 빠름)
        this.tweens.add({
            targets: [body, head, weapon],
            y: '+=2',
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 3. 적 (슬라임 - 기존 코드 유지)
        const enemy = this.add.container(240, 180);
        enemy.add(this.add.rectangle(0, 0, 32, 24, 0x6BCB77)); // Body
        enemy.add(this.add.rectangle(-6, -4, 4, 4, 0x000000)); // Eye
        enemy.add(this.add.rectangle(6, -4, 4, 4, 0x000000)); // Eye

        // 4. ★ 전투 액션 시스템 (공격 -> 타격 -> 복귀)
        this.time.addEvent({
            delay: 1500, // 1.5초마다 공격
            loop: true,
            callback: () => {
                // A. 무기 휘두르기 (Rotation)
                this.tweens.add({
                    targets: weapon,
                    angle: { from: -20, to: 100 }, // 뒤에서 앞으로 쾅!
                    duration: 150, // 빠르게
                    yoyo: true, // 다시 제자리로
                    ease: 'Back.easeOut' // 튕기는 느낌
                });

                // B. 몸통 돌진 (Lunge) - 박진감 추가
                this.tweens.add({
                    targets: [body, head, weapon], // 그림자는 제자리에 (디테일!)
                    x: '+=15', // 앞으로 쑥 나감
                    duration: 100,
                    yoyo: true,
                    ease: 'Sine.easeOut'
                });

                // C. 적 피격 효과 (타이밍 맞춰서)
                this.tweens.add({
                    targets: enemy,
                    alpha: 0.4, // 깜빡
                    scaleX: 0.8, // 찌그러짐
                    scaleY: 1.2,
                    duration: 80,
                    yoyo: true,
                    delay: 100 // 칼이 닿는 시간 고려
                });
            }
        });
    }
}
function update() {}
