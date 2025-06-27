export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // Create a simple pixel for buttons and background
        this.load.image('pixel', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    }

    create() {
        const { width, height } = this.cameras.main;

        // Medieval battlefield background
        this.add.rectangle(width / 2, height / 2, width, height, 0x2d5016);
        
        // Add atmospheric medieval elements
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            this.add.rectangle(x, y, 16, 16, 0x8b4513).setAlpha(0.3); // Dirt patches
        }

        // Add some scattered medieval items
        for (let i = 0; i < 8; i++) {
            const x = Phaser.Math.Between(50, width - 50);
            const y = Phaser.Math.Between(100, height - 100);
            const item = this.add.rectangle(x, y, 12, 12, 0x696969).setAlpha(0.6); // Rocks/debris
            item.setRotation(Phaser.Math.Between(0, 360) * Math.PI / 180);
        }

        // Epic Viking title with Nordic styling
        const titleText = this.add.text(width / 2, height / 4, 'VALHALLA\'S CALL', {
            fontSize: '52px',
            fontFamily: 'Arial Black',
            color: '#FFD700',
            stroke: '#8B0000',
            strokeThickness: 4,
            fontStyle: 'bold'
        });
        titleText.setOrigin(0.5);

        // Epic subtitle
        const subtitleText = this.add.text(width / 2, height / 4 + 65, 'The Eternal Battlefield', {
            fontSize: '24px',
            fontFamily: 'Arial Black',
            color: '#CD853F',
            stroke: '#000000',
            strokeThickness: 2,
            fontStyle: 'italic'
        });
        subtitleText.setOrigin(0.5);

        // Dramatic description
        const descText = this.add.text(width / 2, height / 2 - 40, 
            'A mighty spirit has called you to the eternal battlefield.\n' +
            'Take control of a viking warrior and fight for honor and glory!\n' +
            'You have 90 seconds to prove your worth.', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#F5F5DC',
            align: 'center',
            lineSpacing: 8,
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 },
            borderRadius: 10
        });
        descText.setOrigin(0.5);

        // Epic start button
        const startButton = this.createEpicButton(width / 2, height / 2 + 60, 'ENTER THE BATTLEFIELD!', () => {
            this.scene.start('GameScene');
        });

        // Game instructions with viking theme
        const gameInfo = this.add.text(width / 2, height * 0.75, 
            '⚔ Slay enemies with your viking steel\n' +
            '🛡 Avoid being surrounded\n' +
            '👑 Achieve viking honor and status\n' +
            '🏆 Fight your way to Valhalla', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#E6E6FA',
            align: 'center',
            lineSpacing: 8
        });
        gameInfo.setOrigin(0.5);

        // Controls info
        const controlsInfo = this.add.text(width / 2, height * 0.92, 
            'PC: WASD/Arrow Keys = Move, SPACE = Attack\n' +
            'Mobile: Joystick + Attack button', {
            fontSize: '11px',
            fontFamily: 'Arial',
            color: '#A9A9A9',
            align: 'center'
        });
        controlsInfo.setOrigin(0.5);

        // Epic title pulsing animation
        this.tweens.add({
            targets: titleText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Dramatic fade in animations
        [subtitleText, descText, startButton, gameInfo, controlsInfo].forEach((element, index) => {
            element.setAlpha(0);
            this.tweens.add({
                targets: element,
                alpha: 1,
                duration: 1000,
                delay: 300 + (index * 250)
            });
        });

        // Floating particles for atmosphere
        this.createAtmosphericParticles();
    }

    createButton(x, y, text, callback) {
        const button = this.add.container(x, y);

        // Button background
        const bg = this.add.rectangle(0, 0, 200, 50, 0x3498db);
        bg.setStrokeStyle(2, 0x2980b9);

        // Button text
        const buttonText = this.add.text(0, 0, text, {
            fontSize: '20px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        buttonText.setOrigin(0.5);

        button.add([bg, buttonText]);
        button.setSize(200, 50);
        button.setInteractive();

        button.on('pointerdown', callback);
        button.on('pointerover', () => {
            bg.setFillStyle(0x2980b9);
        });
        button.on('pointerout', () => {
            bg.setFillStyle(0x3498db);
        });

        return button;
    }

    createEpicButton(x, y, text, callback) {
        const button = this.add.container(x, y);

        // Epic button background with gradient effect
        const bg = this.add.rectangle(0, 0, 300, 60, 0x8B0000);
        bg.setStrokeStyle(3, 0xFFD700);
        
        // Inner glow effect
        const innerGlow = this.add.rectangle(0, 0, 290, 50, 0xB22222);
        innerGlow.setAlpha(0.7);

        // Button text with epic styling
        const buttonText = this.add.text(0, 0, text, {
            fontSize: '18px',
            fontFamily: 'Arial Black',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2,
            fontStyle: 'bold'
        });
        buttonText.setOrigin(0.5);

        button.add([bg, innerGlow, buttonText]);
        button.setSize(300, 60);
        button.setInteractive();

        button.on('pointerdown', callback);
        button.on('pointerover', () => {
            this.tweens.add({
                targets: [bg, innerGlow],
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 150
            });
            bg.setFillStyle(0xA52A2A);
            buttonText.setColor('#FFFF00');
        });
        button.on('pointerout', () => {
            this.tweens.add({
                targets: [bg, innerGlow],
                scaleX: 1,
                scaleY: 1,
                duration: 150
            });
            bg.setFillStyle(0x8B0000);
            buttonText.setColor('#FFD700');
        });

        return button;
    }

    createAtmosphericParticles() {
        // Create floating embers/dust particles
        const graphics = this.add.graphics();
        graphics.fillStyle(0xFFD700, 0.8);
        graphics.fillCircle(2, 2, 2);
        graphics.generateTexture('ember', 4, 4);
        graphics.destroy();

        // Floating particles for medieval atmosphere
        const particles = this.add.particles(400, 300, 'ember', {
            x: { min: 0, max: 800 },
            y: { min: 0, max: 600 },
            speed: { min: 10, max: 30 },
            scale: { start: 0.5, end: 0 },
            lifespan: 6000,
            frequency: 300,
            alpha: { start: 0.6, end: 0 }
        });
    }
}
