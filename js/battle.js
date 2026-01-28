// [v11.4] High-Quality Retro Battle & Idle Visuals
export const BattleManager = {
    game: null,
    scene: null,
    mode: 'idle', 

    init: (mode = 'idle') => {
        if (BattleManager.game) {
            BattleManager.setMode(mode);
            return;
        }

        const config = {
            type: Phaser.AUTO,
            parent: 'phaser-root',
            width: 320,
            height: 200, // Retro resolution
            pixelArt: true, // Enable pixel art mode
            backgroundColor: '#121214',
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
        }
    }
};

function preload() {}

function create() {
    BattleManager.scene = this;
    this.mode = BattleManager.mode;

    // --- Common Graphics ---
    // Create a simple ground texture
    const groundG = this.make.graphics();
    groundG.fillStyle(0x333333, 1);
    groundG.fillRect(0, 0, 320, 2);
    groundG.generateTexture('ground', 320, 2);

    // --- IDLE GROUP (Campfire) ---
    this.idleGroup = this.add.group();
    
    // 1. Starry Sky (Procedural)
    for (let i = 0; i < 30; i++) {
        const star = this.add.rectangle(
            Phaser.Math.Between(0, 320), 
            Phaser.Math.Between(0, 150), 
            1, 1, 0xFFFFFF
        );
        this.tweens.add({
            targets: star,
            alpha: 0.2,
            duration: Phaser.Math.Between(500, 1500),
            yoyo: true,
            repeat: -1
        });
        this.idleGroup.add(star);
    }

    // 2. Simple Hero Sitting (Geometric)
    const heroIdle = this.add.graphics();
    heroIdle.fillStyle(0x4D96FF, 1); // Blue body
    heroIdle.fillRect(130, 160, 14, 14); // Body
    heroIdle.fillStyle(0xFFCCAA, 1); // Face
    heroIdle.fillRect(132, 150, 10, 10); // Head
    this.idleGroup.add(heroIdle);

    // 3. Campfire Logs
    const logs = this.add.graphics();
    logs.fillStyle(0x8B4513, 1);
    logs.fillRect(150, 170, 20, 6);
    logs.fillRect(155, 165, 10, 10);
    this.idleGroup.add(logs);

    // 4. Fire Particles
    const fireParticles = this.add.particles(0, 0, 'flare', {
        x: 160, y: 170,
        speed: { min: 10, max: 30 },
        angle: { min: 260, max: 280 },
        scale: { start: 0.4, end: 0 },
        blendMode: 'ADD',
        lifespan: 800,
        frequency: 100,
        tint: [ 0xffaa00, 0xff0000 ] // Yellow to Red
    });
    
    // Create 'flare' texture programmatically if not exists
    if (!this.textures.exists('flare')) {
        const t = this.textures.createCanvas('flare', 8, 8);
        const c = t.getSourceImage().getContext('2d');
        c.fillStyle = '#fff'; c.beginPath(); c.arc(4,4,4,0,Math.PI*2); c.fill();
        t.refresh();
    }
    this.fireEmitter = fireParticles;
    this.idleGroup.add(fireParticles);


    // --- BATTLE GROUP ---
    this.battleGroup = this.add.group();
    
    // 1. Background (Dark Reddish)
    this.battleBg = this.add.rectangle(160, 100, 320, 200, 0x2a1a1a);
    this.battleGroup.add(this.battleBg);
    
    // 2. Floor
    const floor = this.add.image(160, 180, 'ground');
    this.battleGroup.add(floor);

    // 3. Hero Sprite (Simple Shapes)
    this.heroContainer = this.add.container(80, 170);
    const hBody = this.add.rectangle(0, -10, 16, 20, 0x4D96FF);
    const hHead = this.add.rectangle(0, -24, 12, 12, 0xFFCCAA);
    const hSword = this.add.rectangle(12, -10, 20, 4, 0xCCCCCC);
    this.heroContainer.add([hBody, hHead, hSword]);
    this.battleGroup.add(this.heroContainer);

    // 4. Enemy Sprite (Slime)
    this.enemyContainer = this.add.container(240, 175);
    const eBody = this.add.ellipse(0, -10, 30, 20, 0x6BCB77); // Green Slime
    const eEye1 = this.add.rectangle(-6, -14, 4, 4, 0x000000);
    const eEye2 = this.add.rectangle(6, -14, 4, 4, 0x000000);
    this.enemyContainer.add([eBody, eEye1, eEye2]);
    this.battleGroup.add(this.enemyContainer);

    this.battleGroup.setVisible(false);

    // --- ANIMATIONS ---
    // Idle Animation (Breathing)
    this.tweens.add({
        targets: [this.heroContainer, this.enemyContainer],
        y: '+=2',
        duration: 1000,
        yoyo: true,
        repeat: -1
    });

    // Battle Loop Animation
    this.attackTween = this.tweens.createTimeline();
    this.attackTween.add({
        targets: this.heroContainer,
        x: 220, // Dash to enemy
        duration: 200,
        ease: 'Power2'
    });
    this.attackTween.add({
        targets: this.enemyContainer,
        x: 250, // Knockback
        alpha: 0.5,
        duration: 50,
        yoyo: true,
        repeat: 1
    });
    this.attackTween.add({
        targets: this.heroContainer,
        x: 80, // Return
        duration: 300,
        delay: 200
    });
    this.attackTween.loop = -1; // Infinite loop

    // --- Mode Switching ---
    this.changeMode = (m) => {
        this.mode = m;
        if (m === 'idle') {
            this.idleGroup.setVisible(true);
            this.battleGroup.setVisible(false);
            this.fireEmitter.start();
            if(this.attackTween.isPlaying()) this.attackTween.pause();
        } else {
            this.idleGroup.setVisible(false);
            this.battleGroup.setVisible(true);
            this.fireEmitter.stop();
            this.attackTween.play();
        }
    };

    this.changeMode(this.mode);
}

function update() {}
