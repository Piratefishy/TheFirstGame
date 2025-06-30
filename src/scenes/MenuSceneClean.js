export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // Create clean, modern menu elements
        this.createMenuBackground();
        this.createButtonSprites();
        this.createParticleEffects();
    }

    create() {
        const { width, height } = this.cameras.main;

        // Clean background
        this.createCleanBackground(width, height);
        
        // Atmospheric particles (subtle)
        this.createSubtleParticles(width, height);
        
        // Main title
        this.createMainTitle(width, height);
        
        // Clean menu buttons
        this.createMenuButtons(width, height);
        
        // Subtle atmospheric effects
        this.createAtmosphericEffects(width, height);

        console.log('Clean MenuScene created successfully!');
    }

    createMenuBackground() {
        // Clean gradient background
        const bgGraphics = this.add.graphics();
        bgGraphics.fillGradientStyle(0x1a1a2e, 0x16213e, 0x0f3460, 0x533483, 1);
        bgGraphics.fillRect(0, 0, 800, 600);
        bgGraphics.generateTexture('menu_bg', 800, 600);
        bgGraphics.destroy();
    }

    createButtonSprites() {
        // Modern button design
        const btnGraphics = this.add.graphics();
        btnGraphics.fillStyle(0x2C3E50, 1);
        btnGraphics.fillRoundedRect(0, 0, 250, 50, 8);
        btnGraphics.lineStyle(2, 0xE74C3C, 1);
        btnGraphics.strokeRoundedRect(0, 0, 250, 50, 8);
        btnGraphics.generateTexture('menu_button', 250, 50);
        btnGraphics.destroy();

        // Hover button
        const btnHoverGraphics = this.add.graphics();
        btnHoverGraphics.fillStyle(0xE74C3C, 1);
        btnHoverGraphics.fillRoundedRect(0, 0, 250, 50, 8);
        btnHoverGraphics.lineStyle(2, 0xFFD700, 1);
        btnHoverGraphics.strokeRoundedRect(0, 0, 250, 50, 8);
        btnHoverGraphics.generateTexture('menu_button_hover', 250, 50);
        btnHoverGraphics.destroy();
    }

    createParticleEffects() {
        // Simple ember particle
        const emberGraphics = this.add.graphics();
        emberGraphics.fillStyle(0xFF6B35, 1);
        emberGraphics.fillCircle(2, 2, 2);
        emberGraphics.generateTexture('ember', 4, 4);
        emberGraphics.destroy();
        
        // Simple spark
        const sparkGraphics = this.add.graphics();
        sparkGraphics.fillStyle(0xFFD700, 1);
        sparkGraphics.fillRect(1, 0, 1, 3);
        sparkGraphics.fillRect(0, 1, 3, 1);
        sparkGraphics.generateTexture('spark', 3, 3);
        sparkGraphics.destroy();
    }

    createCleanBackground(width, height) {
        // Clean gradient background
        this.add.image(width / 2, height / 2, 'menu_bg');
        
        // Subtle overlay
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000);
        overlay.setAlpha(0.3);
    }

    createSubtleParticles(width, height) {
        // Subtle floating embers
        this.emberParticles = this.add.particles(0, 0, 'ember', {
            x: { min: 0, max: width },
            y: height + 10,
            speedY: { min: -50, max: -20 },
            speedX: { min: -10, max: 10 },
            scale: { start: 0.5, end: 0.1 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 8000,
            frequency: 500
        });
    }

    createMainTitle(width, height) {
        // Main title
        const titleText = this.add.text(width / 2, height / 4, "VALHALLA'S CALL", {
            fontSize: '48px',
            fontFamily: 'Arial Black',
            color: '#FFD700',
            stroke: '#8B0000',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 4, fill: true }
        });
        titleText.setOrigin(0.5);

        // Subtitle
        const subtitleText = this.add.text(width / 2, height / 4 + 60, "Enter the Eternal Battlefield", {
            fontSize: '18px',
            fontFamily: 'Arial',
            color: '#CCCCCC',
            style: 'italic'
        });
        subtitleText.setOrigin(0.5);

        // Animate title
        this.tweens.add({
            targets: titleText,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createMenuButtons(width, height) {
        const buttonY = height / 2 + 50;
        const buttonSpacing = 70;

        // Start Game Button
        this.createButton(width / 2, buttonY, 'START BATTLE', () => {
            this.scene.start('GameSceneSimple');
        });

        // Lore Button
        this.createButton(width / 2, buttonY + buttonSpacing, 'TALES OF VALHALLA', () => {
            this.scene.start('LoreScene');
        });

        // Instructions
        const instructionText = this.add.text(width / 2, height - 80, 
            'WASD/Arrow Keys: Move • SPACE: Attack • ESC: Pause/Exit', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#999999',
            align: 'center'
        });
        instructionText.setOrigin(0.5);
    }

    createButton(x, y, text, callback) {
        // Button background
        const button = this.add.image(x, y, 'menu_button');
        button.setOrigin(0.5);
        button.setInteractive();

        // Button text
        const buttonText = this.add.text(x, y, text, {
            fontSize: '18px',
            fontFamily: 'Arial Black',
            color: '#FFFFFF'
        });
        buttonText.setOrigin(0.5);

        // Hover effects
        button.on('pointerover', () => {
            button.setTexture('menu_button_hover');
            buttonText.setColor('#FFD700');
            this.tweens.add({
                targets: [button, buttonText],
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100
            });
        });

        button.on('pointerout', () => {
            button.setTexture('menu_button');
            buttonText.setColor('#FFFFFF');
            this.tweens.add({
                targets: [button, buttonText],
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
        });

        button.on('pointerdown', () => {
            this.tweens.add({
                targets: [button, buttonText],
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 100,
                yoyo: true,
                onComplete: callback
            });
        });

        return { button, buttonText };
    }

    createAtmosphericEffects(width, height) {
        // Subtle sparks occasionally
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                const sparkX = Math.random() * width;
                const sparkY = Math.random() * height;
                
                const spark = this.add.particles(sparkX, sparkY, 'spark', {
                    speed: { min: 20, max: 60 },
                    scale: { start: 0.8, end: 0 },
                    alpha: { start: 0.8, end: 0 },
                    lifespan: 1000,
                    quantity: 3
                });

                this.time.delayedCall(1000, () => {
                    spark.destroy();
                });
            },
            callbackScope: this,
            loop: true
        });
    }
}
