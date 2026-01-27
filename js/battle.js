let game = null;

class BattleScene extends Phaser.Scene {
    constructor() { super({ key: 'BattleScene' }); }

    create() {
        // 1. 배경 (우주 효과)
        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000).setOrigin(0);
        
        this.stars = this.add.group();
        for (let i = 0; i < 100; i++) {
            let star = this.add.rectangle(
                Phaser.Math.Between(0, this.scale.width),
                Phaser.Math.Between(0, this.scale.height),
                2, 2, 0xffffff
            );
            this.stars.add(star);
        }

        // 2. 캐릭터 (중앙에서 회전)
        this.player = this.add.rectangle(this.scale.width/2, this.scale.height/2, 40, 40, 0x4D96FF);
        
        // 3. 파티클 효과 (궤적)
        this.particles = this.add.particles(0, 0, 'flare', {
            speed: 100,
            scale: { start: 1, end: 0 },
            blendMode: 'ADD'
        });

        this.add.text(10, 10, "SYSTEM: TRAINING ACTIVE", { fontSize: '10px', color: '#00ff00' });
    }

    update() {
        // 캐릭터 회전
        this.player.rotation += 0.05;

        // 별 흐르는 효과
        this.stars.children.iterate((star) => {
            star.y += 2;
            if (star.y > this.scale.height) {
                star.y = 0;
                star.x = Phaser.Math.Between(0, this.scale.width);
            }
        });
    }
}

export const BattleManager = {
    init: () => {
        if (game) return;
        const config = {
            type: Phaser.AUTO,
            parent: 'phaser-root',
            width: window.innerWidth > 400 ? 360 : window.innerWidth - 40,
            height: 300,
            backgroundColor: '#000',
            scene: BattleScene
        };
        game = new Phaser.Game(config);
    },
    destroy: () => {
        if (game) {
            game.destroy(true);
            game = null;
        }
    }
};
