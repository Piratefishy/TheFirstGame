export class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        // Create AAA quality menu sprites
        this.createCinematicBackground();
        this.createEpicUIElements();
        this.createParticleEffects();
        this.createAudioVisualElements();
    }

    create() {
        const { width, height } = this.cameras.main;

        // === AAA QUALITY CINEMATIC MENU ===
        this.createPhotorealisticBackground(width, height);
        this.createCinematicLighting(width, height);
        this.createDynamicParticleEffects(width, height);
        
        // Epic Viking title with cinematic presentation
        this.createCinematicTitle(width, height);
        
        // Enhanced menu with lore integration
        this.createEnhancedMenu(width, height);
        
        // CREATE MAIN MENU BUTTONS
        this.createMainMenuButtons(width, height);
        
        // Background audio-visual ambience
        this.createAmbientEffects(width, height);
        
        // Animated elements
        this.createAnimatedElements(width, height);
    }

    createCinematicBackground() {
        const graphics = this.add.graphics();
        
        // Epic battlefield background texture
        graphics.fillStyle(0x1a1a1a, 1);
        graphics.fillRect(0, 0, 800, 600);
        graphics.generateTexture('cinematic_bg', 800, 600);
        graphics.destroy();
        
        // Mountain silhouettes
        const mountainGraphics = this.add.graphics();
        mountainGraphics.fillStyle(0x2F2F2F, 0.8);
        mountainGraphics.fillTriangle(0, 400, 200, 200, 400, 400);
        mountainGraphics.fillTriangle(300, 400, 500, 150, 700, 400);
        mountainGraphics.fillTriangle(600, 400, 800, 250, 800, 400);
        mountainGraphics.generateTexture('mountains', 800, 600);
        mountainGraphics.destroy();
        
        // Burning sky texture
        const skyGraphics = this.add.graphics();
        skyGraphics.fillGradientStyle(0xFF4500, 0xFF4500, 0x8B0000, 0x8B0000, 1);
        skyGraphics.fillRect(0, 0, 800, 300);
        skyGraphics.generateTexture('burning_sky', 800, 300);
        skyGraphics.destroy();
    }

    createEpicUIElements() {
        // Ornate Viking-style button
        const btnGraphics = this.add.graphics();
        btnGraphics.fillStyle(0x8B0000, 1);
        btnGraphics.fillRoundedRect(0, 0, 280, 60, 10);
        btnGraphics.lineStyle(4, 0xFFD700, 1);
        btnGraphics.strokeRoundedRect(0, 0, 280, 60, 10);
        
        // Inner decoration
        btnGraphics.fillStyle(0xA52A2A, 0.8);
        btnGraphics.fillRoundedRect(8, 8, 264, 44, 6);
        
        // Rune-like decorations
        btnGraphics.fillStyle(0xFFD700, 1);
        btnGraphics.fillRect(20, 25, 15, 3);
        btnGraphics.fillRect(245, 25, 15, 3);
        btnGraphics.fillTriangle(27, 20, 27, 30, 35, 25);
        btnGraphics.fillTriangle(253, 20, 253, 30, 245, 25);
        
        btnGraphics.generateTexture('epic_button', 280, 60);
        btnGraphics.destroy();
        
        // Decorative frame
        const frameGraphics = this.add.graphics();
        frameGraphics.lineStyle(6, 0xFFD700, 0.8);
        frameGraphics.strokeRoundedRect(0, 0, 500, 300, 15);
        frameGraphics.lineStyle(3, 0x8B0000, 1);
        frameGraphics.strokeRoundedRect(6, 6, 488, 288, 12);
        frameGraphics.generateTexture('decorative_frame', 500, 300);
        frameGraphics.destroy();
    }

    createParticleEffects() {
        // Ember particles
        const emberGraphics = this.add.graphics();
        emberGraphics.fillStyle(0xFF6600, 1);
        emberGraphics.fillCircle(2, 2, 2);
        emberGraphics.fillStyle(0xFFD700, 0.8);
        emberGraphics.fillCircle(2, 2, 1);
        emberGraphics.generateTexture('menu_ember', 4, 4);
        emberGraphics.destroy();
        
        // Ash particles
        const ashGraphics = this.add.graphics();
        ashGraphics.fillStyle(0x696969, 0.6);
        ashGraphics.fillCircle(1, 1, 1);
        ashGraphics.generateTexture('menu_ash', 2, 2);
        ashGraphics.destroy();
        
        // Snowflake/sparkle
        const sparkleGraphics = this.add.graphics();
        sparkleGraphics.fillStyle(0xFFFFFF, 0.9);
        sparkleGraphics.fillRect(1, 0, 1, 4);
        sparkleGraphics.fillRect(0, 1, 4, 1);
        sparkleGraphics.generateTexture('menu_sparkle', 4, 4);
        sparkleGraphics.destroy();
    }

    createAudioVisualElements() {
        // Sound wave visualization
        const waveGraphics = this.add.graphics();
        waveGraphics.lineStyle(2, 0x87CEEB, 0.6);
        for (let i = 0; i < 50; i++) {
            const x = i * 4;
            const y = 10 + Math.sin(i * 0.3) * 8;
            if (i === 0) {
                waveGraphics.moveTo(x, y);
            } else {
                waveGraphics.lineTo(x, y);
            }
        }
        waveGraphics.strokePath();
        waveGraphics.generateTexture('sound_wave', 200, 20);
        waveGraphics.destroy();
    }



    createPhotorealisticBackground(width, height) {
        // Base background with deep night sky
        this.add.rectangle(width / 2, height / 2, width, height, 0x0A0A15);
        
        // Add cinematic background
        this.add.image(width / 2, height / 2, 'cinematic_bg').setScale(width / 800, height / 600);
        
        // Burning sky at horizon
        const burningSky = this.add.image(width / 2, height * 0.3, 'burning_sky');
        burningSky.setScale(width / 800, 1);
        burningSky.setAlpha(0.7);
        
        // Mountain silhouettes
        const mountains = this.add.image(width / 2, height * 0.6, 'mountains');
        mountains.setScale(width / 800, height / 600);
        mountains.setAlpha(0.8);
        
        // Animated burning horizon effect
        this.tweens.add({
            targets: burningSky,
            alpha: 0.5,
            duration: 3000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createCinematicLighting(width, height) {
        // Dramatic lighting overlay
        const lightingGraphics = this.add.graphics();
        
        // Create radial gradient for dramatic lighting
        for (let i = 0; i < 100; i++) {
            const alpha = 0.1 - (i / 100) * 0.1;
            const radius = i * 8;
            lightingGraphics.fillStyle(0xFFD700, alpha);
            lightingGraphics.fillCircle(width / 2, height * 0.2, radius);
        }
        
        // Lightning flash effect
        this.time.addEvent({
            delay: 4000 + Math.random() * 6000,
            callback: () => {
                const flash = this.add.rectangle(width / 2, height / 2, width, height, 0xE0E6FF);
                flash.setAlpha(0.4);
                this.tweens.add({
                    targets: flash,
                    alpha: 0,
                    duration: 150,
                    onComplete: () => flash.destroy()
                });
            },
            callbackScope: this,
            loop: true
        });
    }

    createDynamicParticleEffects(width, height) {
        // Multiple particle systems for immersion
        
        // Falling ash from burning sky
        const ashParticles = this.add.particles(width / 2, 0, 'menu_ash', {
            x: { min: 0, max: width },
            y: { min: -20, max: 0 },
            speedY: { min: 20, max: 40 },
            speedX: { min: -10, max: 10 },
            scale: { start: 0.3, end: 0.1 },
            alpha: { start: 0.6, end: 0 },
            lifespan: 8000,
            frequency: 100
        });
        
        // Floating embers
        const emberParticles = this.add.particles(0, height, 'menu_ember', {
            x: { min: 0, max: width },
            y: { min: height * 0.7, max: height },
            speedY: { min: -30, max: -10 },
            speedX: { min: -5, max: 5 },
            scale: { start: 0.5, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 6000,
            frequency: 200
        });
        
        // Magical sparkles
        const sparkleParticles = this.add.particles(width / 2, height / 2, 'menu_sparkle', {
            x: { min: width * 0.2, max: width * 0.8 },
            y: { min: height * 0.2, max: height * 0.8 },
            speed: { min: 10, max: 30 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.9, end: 0 },
            lifespan: 4000,
            frequency: 300
        });
    }

    createCinematicTitle(width, height) {
        // Main title with epic effects
        const titleContainer = this.add.container(width / 2, height / 4);
        
        // Title shadow for depth
        const titleShadow = this.add.text(2, 2, 'VALHALLA\'S CALL', {
            fontSize: '58px',
            fontFamily: 'Arial Black',
            color: '#000000',
            fontStyle: 'bold'
        });
        titleShadow.setOrigin(0.5);
        titleShadow.setAlpha(0.6);
        
        // Main title
        const titleText = this.add.text(0, 0, 'VALHALLA\'S CALL', {
            fontSize: '58px',
            fontFamily: 'Arial Black',
            color: '#FFD700',
            stroke: '#8B0000',
            strokeThickness: 4,
            fontStyle: 'bold'
        });
        titleText.setOrigin(0.5);
        
        // Title glow effect
        const titleGlow = this.add.text(0, 0, 'VALHALLA\'S CALL', {
            fontSize: '58px',
            fontFamily: 'Arial Black',
            color: '#FFFF88',
            fontStyle: 'bold'
        });
        titleGlow.setOrigin(0.5);
        titleGlow.setAlpha(0.3);
        titleGlow.setScale(1.05);
        
        titleContainer.add([titleShadow, titleGlow, titleText]);
        
        // Epic pulsing animation
        this.tweens.add({
            targets: titleContainer,
            scaleX: 1.08,
            scaleY: 1.08,
            duration: 2500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Subtitle with atmospheric styling
        const subtitleText = this.add.text(width / 2, height / 4 + 75, 'The Eternal Battlefield Awaits', {
            fontSize: '26px',
            fontFamily: 'Arial Black',
            color: '#CD853F',
            stroke: '#000000',
            strokeThickness: 2,
            fontStyle: 'italic'
        });
        subtitleText.setOrigin(0.5);
        
        // Breathing animation for subtitle
        this.tweens.add({
            targets: subtitleText,
            alpha: 0.7,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    createEnhancedMenu(width, height) {
        // Decorative frame around menu area
        const menuFrame = this.add.image(width / 2, height / 2 + 50, 'decorative_frame');
        menuFrame.setScale(0.8);
        menuFrame.setAlpha(0.2);
        
        // Menu description with enhanced styling
        const descText = this.add.text(width / 2, height / 2 - 40, 
            'The ancient gods have summoned a mighty spirit to possess\n' +
            'a fallen warrior on the eternal battlefield of Midgard.\n\n' +
            'You have but 90 seconds to prove your divine might\n' +
            'and earn your place among the legends of Valhalla.', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#F5F5DC',
            align: 'center',
            lineSpacing: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: { x: 25, y: 15 },
            borderRadius: 12
        });
        descText.setOrigin(0.5);
        descText.setAlpha(0);
        
        // Fade in the description
        this.tweens.add({
            targets: descText,
            alpha: 0.9,
            duration: 1200,
            delay: 800
        });
        
        return { menuFrame, descText };
    }

    createAmbientEffects(width, height) {
        // Ambient sound wave visualizations
        this.time.addEvent({
            delay: 3000,
            callback: () => {
                const wave = this.add.image(
                    Math.random() * width,
                    Math.random() * height,
                    'sound_wave'
                );
                wave.setAlpha(0.3);
                wave.setRotation(Math.random() * Math.PI * 2);
                
                this.tweens.add({
                    targets: wave,
                    scaleX: 2,
                    scaleY: 2,
                    alpha: 0,
                    duration: 2000,
                    onComplete: () => wave.destroy()
                });
            },
            callbackScope: this,
            loop: true
        });
        
        // Floating runes effect
        this.time.addEvent({
            delay: 5000,
            callback: () => {
                const rune = this.add.rectangle(
                    -20,
                    Math.random() * height,
                    8, 8,
                    0xFFD700
                );
                rune.setAlpha(0.6);
                
                this.tweens.add({
                    targets: rune,
                    x: width + 20,
                    rotation: Math.PI * 2,
                    duration: 8000,
                    onComplete: () => rune.destroy()
                });
            },
            callbackScope: this,
            loop: true
        });
    }

    createAnimatedElements(width, height) {
        // Animated atmospheric elements
        for (let i = 0; i < 5; i++) {
            const mist = this.add.rectangle(
                Math.random() * width,
                height * 0.7 + Math.random() * 100,
                Math.random() * 150 + 100,
                30,
                0x696969
            );
            mist.setAlpha(0.1);
            
            this.tweens.add({
                targets: mist,
                x: mist.x + (Math.random() - 0.5) * 200,
                alpha: 0.05,
                duration: 6000 + Math.random() * 4000,
                repeat: -1,
                yoyo: true,
                ease: 'Sine.easeInOut'
            });
        }
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

    createMainMenuButtons(width, height) {
        // Epic start button
        const startButton = this.createEpicButton(width / 2, height / 2 + 40, 'ENTER THE BATTLEFIELD!', () => {
            this.scene.start('GameSceneSimple');
        });

        // Lore button
        const loreButton = this.createEpicButton(width / 2, height / 2 + 120, 'TALES OF VALHALLA', () => {
            this.scene.start('LoreScene');
        });

        // Game instructions with viking theme
        const gameInfo = this.add.text(width / 2, height * 0.8, 
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

        // Dramatic fade in animations for buttons and info
        [startButton, loreButton, gameInfo, controlsInfo].forEach((element, index) => {
            element.setAlpha(0);
            this.tweens.add({
                targets: element,
                alpha: 1,
                duration: 1000,
                delay: 500 + (index * 300)
            });
        });

        return { startButton, loreButton, gameInfo, controlsInfo };
    }
}
