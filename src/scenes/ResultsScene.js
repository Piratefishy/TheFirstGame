export class ResultsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ResultsScene' });
        this.finalScore = 0;
    }

    init(data) {
        this.finalScore = data.score || 0;
    }

    preload() {
        // Recreate simple sprites
        this.createColoredSquare('pixel', 1, 1, 0xffffff);
        this.createColoredSquare('button-bg', 200, 50, 0x3498db);
    }

    create() {
        const { width, height } = this.cameras.main;

        // Epic medieval background
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a1a);

        // Add atmospheric background elements
        this.createMedievalBackground(width, height);

        // Epic title
        const titleText = this.add.text(width / 2, height * 0.12, 'BATTLE RESULTS', {
            fontSize: '42px',
            fontFamily: 'Arial Black',
            color: '#FFD700',
            stroke: '#8B0000',
            strokeThickness: 4,
            fontStyle: 'bold'
        });
        titleText.setOrigin(0.5);

        // Score section
        this.createScoreDisplay(width, height);

        // Ranking section
        this.createVikingRankingDisplay(width, height);

        // Action buttons
        this.createEpicActionButtons(width, height);

        // Celebration effects for high scores
        const enemiesKilled = Math.floor(this.finalScore / 10);
        if (enemiesKilled >= 10) {
            this.createVictoryEffects(width, height);
        }
    }

    createScoreDisplay(width, height) {
        // Epic score background
        const scoreBg = this.add.rectangle(width / 2, height * 0.35, width * 0.85, 140, 0x2C1810);
        scoreBg.setStrokeStyle(4, 0xFFD700);

        // Inner decoration
        const innerDecor = this.add.rectangle(width / 2, height * 0.35, width * 0.8, 130, 0x1A0F08);
        innerDecor.setAlpha(0.8);

        // Score label with viking theme
        const scoreLabel = this.add.text(width / 2, height * 0.29, 'Enemies Sent to Hel', {
            fontSize: '22px',
            fontFamily: 'Arial Black',
            color: '#CD853F',
            stroke: '#000000',
            strokeThickness: 2
        });
        scoreLabel.setOrigin(0.5);

        const enemiesKilled = Math.floor(this.finalScore / 10);
        const scoreValue = this.add.text(width / 2, height * 0.38, enemiesKilled.toString(), {
            fontSize: '56px',
            fontFamily: 'Arial Black',
            color: '#FF4500',
            stroke: '#8B0000',
            strokeThickness: 3,
            fontStyle: 'bold'
        });
        scoreValue.setOrigin(0.5);

        // Epic animated score counter
        this.tweens.addCounter({
            from: 0,
            to: enemiesKilled,
            duration: 2500,
            ease: 'Power2',
            onUpdate: (tween) => {
                const value = Math.floor(tween.getValue());
                scoreValue.setText(value.toString());
            }
        });

        // Add weapon icons around score
        this.createWeaponDecorations(width / 2, height * 0.35);
    }

    createRankingDisplay(width, height) {
        const rank = this.calculateRank(this.finalScore);
        
        // Rank background
        const rankBg = this.add.rectangle(width / 2, height * 0.55, width * 0.8, 100, 0x27ae60);
        rankBg.setStrokeStyle(3, rank.color);

        // Rank titel
        const rankTitle = this.add.text(width / 2, height * 0.52, rank.title, {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        rankTitle.setOrigin(0.5);

        // Rank beskrivelse
        const rankDesc = this.add.text(width / 2, height * 0.58, rank.description, {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#ecf0f1'
        });
        rankDesc.setOrigin(0.5);

        // Næste rank info
        if (rank.nextRankScore) {
            const nextRankText = this.add.text(width / 2, height * 0.65, 
                `Næste rank: ${rank.nextRankScore - this.finalScore} skade mere`, {
                fontSize: '14px',
                fontFamily: 'Arial',
                color: '#f39c12'
            });
            nextRankText.setOrigin(0.5);
        }
    }

    createActionButtons(width, height) {
        // Play again button
        const playAgainButton = this.createButton(width / 2 - 120, height * 0.8, 'PLAY AGAIN', () => {
            this.scene.start('GameScene');
        }, 0x27ae60);

        // Main menu button
        const menuButton = this.createButton(width / 2 + 120, height * 0.8, 'MAIN MENU', () => {
            this.scene.start('MenuScene');
        }, 0x3498db);

        // Animations for buttons
        this.time.delayedCall(500, () => {
            this.tweens.add({
                targets: [playAgainButton, menuButton],
                y: height * 0.8,
                from: height + 100,
                duration: 600,
                ease: 'Back'
            });
        });
    }

    createButton(x, y, text, callback, color = 0x3498db) {
        const button = this.add.container(x, y);

        // Button background
        const bg = this.add.rectangle(0, 0, 200, 50, color);
        bg.setStrokeStyle(2, Phaser.Display.Color.GetColor32(
            Phaser.Display.Color.IntegerToRGB(color).r - 20,
            Phaser.Display.Color.IntegerToRGB(color).g - 20,
            Phaser.Display.Color.IntegerToRGB(color).b - 20
        ));

        // Button text
        const buttonText = this.add.text(0, 0, text, {
            fontSize: '16px',
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
            this.tweens.add({
                targets: button,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100
            });
        });
        button.on('pointerout', () => {
            this.tweens.add({
                targets: button,
                scaleX: 1,
                scaleY: 1,
                duration: 100
            });
        });

        return button;
    }

    calculateRank(score) {
        const ranks = [
            { title: 'REKRUT', description: 'Første gang på krigsmarken', color: 0x95a5a6, minScore: 0 },
            { title: 'SOLDAT', description: 'Viser potentiale', color: 0x7f8c8d, minScore: 30, nextRankScore: 60 },
            { title: 'KRIGER', description: 'Erfaren i kamp', color: 0xf39c12, minScore: 60, nextRankScore: 100 },
            { title: 'VETERAN', description: 'Frygtindgydende på slagmarken', color: 0xe67e22, minScore: 100, nextRankScore: 150 },
            { title: 'ELITE KRIGER', description: 'Mester af krig', color: 0xe74c3c, minScore: 150, nextRankScore: 250 },
            { title: 'KRIGENS LEGENDE', description: 'Legendarisk kriger', color: 0x9b59b6, minScore: 250, nextRankScore: 400 },
            { title: 'DØDSBRINGER', description: 'Umulig at stoppe', color: 0x8e44ad, minScore: 400, nextRankScore: null }
        ];

        for (let i = ranks.length - 1; i >= 0; i--) {
            if (score >= ranks[i].minScore) {
                return ranks[i];
            }
        }

        return ranks[0];
    }

    createCelebrationEffect(width, height) {
        // Stjerne partikler
        this.createColoredSquare('star', 8, 8, 0xf1c40f);
        
        const particles = this.add.particles(width / 2, height / 2, 'star', {
            speed: { min: 100, max: 200 },
            scale: { start: 1, end: 0 },
            lifespan: 2000,
            frequency: 100,
            emitZone: { source: new Phaser.Geom.Circle(0, 0, 50) }
        });

        // Stop after 3 seconds
        this.time.delayedCall(3000, () => {
            particles.stop();
        });
    }

    createColoredSquare(key, width, height, color, alpha = 1) {
        this.add.graphics()
            .fillStyle(color, alpha)
            .fillRect(0, 0, width, height)
            .generateTexture(key, width, height)
            .destroy();
    }

    createMedievalBackground(width, height) {
        // Dark medieval atmosphere
        for (let i = 0; i < 25; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(8, 20);
            this.add.rectangle(x, y, size, size, 0x2F1B14).setAlpha(0.4);
        }

        // Add flame effects
        this.createFlameParticles(width, height);
    }

    createFlameParticles(width, height) {
        // Create fire particle texture
        this.createColoredSquare('flame', 6, 6, 0xFF4500);
        
        // Fire particles for atmosphere
        const fireParticles = this.add.particles(width / 2, height + 50, 'flame', {
            x: { min: 0, max: width },
            speed: { min: 20, max: 60 },
            scale: { start: 1, end: 0 },
            lifespan: 3000,
            frequency: 200,
            alpha: { start: 0.8, end: 0 }
        });
    }

    createWeaponDecorations(centerX, centerY) {
        // Create simple weapon sprites for decoration
        const weapons = [
            { x: centerX - 120, y: centerY - 20, rotation: -45 },
            { x: centerX + 120, y: centerY - 20, rotation: 45 },
            { x: centerX - 120, y: centerY + 20, rotation: 45 },
            { x: centerX + 120, y: centerY + 20, rotation: -45 }
        ];

        weapons.forEach(weapon => {
            const sword = this.add.rectangle(weapon.x, weapon.y, 20, 4, 0xC0C0C0);
            sword.setRotation(weapon.rotation * Math.PI / 180);
            sword.setAlpha(0.6);
        });
    }

    createVikingRankingDisplay(width, height) {
        const enemiesKilled = Math.floor(this.finalScore / 10);
        const rank = this.calculateVikingRank(enemiesKilled);
        
        // Epic rank background
        const rankBg = this.add.rectangle(width / 2, height * 0.58, width * 0.85, 120, 0x8B0000);
        rankBg.setStrokeStyle(4, rank.color);

        // Inner decoration
        const innerRank = this.add.rectangle(width / 2, height * 0.58, width * 0.8, 110, 0x660000);
        innerRank.setAlpha(0.8);

        // Rank title with epic styling
        const rankTitle = this.add.text(width / 2, height * 0.54, rank.title, {
            fontSize: '32px',
            fontFamily: 'Arial Black',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 3,
            fontStyle: 'bold'
        });
        rankTitle.setOrigin(0.5);

        // Rank description
        const rankDesc = this.add.text(width / 2, height * 0.62, rank.description, {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#F5DEB3',
            stroke: '#000000',
            strokeThickness: 1
        });
        rankDesc.setOrigin(0.5);

        // Next rank progression
        if (rank.nextRankKills) {
            const nextRankText = this.add.text(width / 2, height * 0.67, 
                `Next rank: ${rank.nextRankKills - enemiesKilled} more enemies`, {
                fontSize: '14px',
                fontFamily: 'Arial',
                color: '#FFB347',
                fontStyle: 'italic'
            });
            nextRankText.setOrigin(0.5);
        }
    }

    calculateVikingRank(kills) {
        const ranks = [
            { title: 'PEASANT', description: 'Taking up your first fight', color: 0x8B4513, minKills: 0 },
            { title: 'WARRIOR', description: 'Shows courage on the battlefield', color: 0xCD853F, minKills: 3, nextRankKills: 8 },
            { title: 'BERSERKER', description: 'Fights with raging fury', color: 0xDC143C, minKills: 8, nextRankKills: 15 },
            { title: 'JARL', description: 'Leads other warriors', color: 0x4169E1, minKills: 15, nextRankKills: 25 },
            { title: 'THANE', description: 'Loyal servant of the king', color: 0x9932CC, minKills: 25, nextRankKills: 40 },
            { title: 'VIKING HERO', description: 'Legendary throughout the North', color: 0xFF6347, minKills: 40, nextRankKills: 60 },
            { title: 'EINHERJAR', description: 'Chosen for Odin\'s hall', color: 0xFFD700, minKills: 60, nextRankKills: null }
        ];

        for (let i = ranks.length - 1; i >= 0; i--) {
            if (kills >= ranks[i].minKills) {
                return ranks[i];
            }
        }

        return ranks[0];
    }

    createEpicActionButtons(width, height) {
        // Epic "Fight Again" button
        const fightAgainButton = this.createEpicButton(width / 2 - 140, height * 0.82, 'FIGHT AGAIN!', () => {
            this.scene.start('GameScene');
        }, 0x8B0000);

        // Return to hall button
        const returnButton = this.createEpicButton(width / 2 + 140, height * 0.82, 'RETURN TO HALL', () => {
            this.scene.start('MenuScene');
        }, 0x4682B4);

        // Epic entrance animations
        this.time.delayedCall(1000, () => {
            this.tweens.add({
                targets: [fightAgainButton, returnButton],
                y: height * 0.82,
                from: height + 100,
                duration: 800,
                ease: 'Back'
            });
        });
    }

    createEpicButton(x, y, text, callback, color = 0x8B0000) {
        const button = this.add.container(x, y);

        // Epic button background
        const bg = this.add.rectangle(0, 0, 240, 55, color);
        bg.setStrokeStyle(3, 0xFFD700);
        
        // Inner glow
        const innerGlow = this.add.rectangle(0, 0, 230, 45, color + 0x222222);
        innerGlow.setAlpha(0.7);

        // Button text with viking styling
        const buttonText = this.add.text(0, 0, text, {
            fontSize: '14px',
            fontFamily: 'Arial Black',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2,
            fontStyle: 'bold'
        });
        buttonText.setOrigin(0.5);

        button.add([bg, innerGlow, buttonText]);
        button.setSize(240, 55);
        button.setInteractive();

        button.on('pointerdown', callback);
        button.on('pointerover', () => {
            this.tweens.add({
                targets: button,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 150
            });
            bg.setFillStyle(color + 0x333333);
        });
        button.on('pointerout', () => {
            this.tweens.add({
                targets: button,
                scaleX: 1,
                scaleY: 1,
                duration: 150
            });
            bg.setFillStyle(color);
        });

        return button;
    }

    createVictoryEffects(width, height) {
        // Epic victory particles
        this.createColoredSquare('star', 8, 8, 0xFFD700);
        
        const victoryParticles = this.add.particles(width / 2, height / 2, 'star', {
            speed: { min: 150, max: 300 },
            scale: { start: 1.5, end: 0 },
            lifespan: 3000,
            frequency: 80,
            emitZone: { source: new Phaser.Geom.Circle(0, 0, 80) }
        });

        // Victory text
        const victoryText = this.add.text(width / 2, height * 0.15, 'GLORIOUS VICTORY!', {
            fontSize: '24px',
            fontFamily: 'Arial Black',
            color: '#FFD700',
            stroke: '#8B0000',
            strokeThickness: 2
        });
        victoryText.setOrigin(0.5);
        victoryText.setAlpha(0);

        this.tweens.add({
            targets: victoryText,
            alpha: 1,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 1000,
            yoyo: true,
            repeat: 2
        });

        // Stop particles after 4 seconds
        this.time.delayedCall(4000, () => {
            victoryParticles.stop();
        });
    }
}
