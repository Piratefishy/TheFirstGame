export class GameSceneSimple extends Phaser.Scene {
    constructor() {
        super({ key: 'GameSceneSimple' });
        this.player = null;
        this.score = 0;
        this.timeLeft = 90;
        this.gameOver = false;
        this.paused = false;
        this.enemies = null;
        this.scoreText = null;
        this.timerText = null;
    }

    preload() {
        // Create simple sprites
        this.createSimpleSprites();
    }

    createSimpleSprites() {
        // Enhanced Player sprite with details (Human Warrior)
        const playerGraphics = this.add.graphics();
        // Body
        playerGraphics.fillStyle(0x4169E1, 1);
        playerGraphics.fillCircle(20, 20, 18);
        // Armor details
        playerGraphics.fillStyle(0x87CEEB, 1);
        playerGraphics.fillCircle(20, 16, 3); // Helmet
        playerGraphics.fillStyle(0xFFD700, 1);
        playerGraphics.fillRect(16, 25, 8, 3); // Belt
        // Shield
        playerGraphics.fillStyle(0x8B4513, 1);
        playerGraphics.fillCircle(12, 20, 6);
        playerGraphics.fillStyle(0xFFD700, 1);
        playerGraphics.fillCircle(12, 20, 3);
        playerGraphics.generateTexture('player', 40, 40);
        playerGraphics.destroy();

        // GOOD FORCES - Create different good warrior types
        this.createElfWarrior();
        this.createDwarfWarrior();
        this.createHumanKnight();

        // EVIL FORCES - Create different evil creature types  
        this.createOrcWarrior();
        this.createGoblinWarrior();
        this.createTrollWarrior();

        // Enhanced Blood particle
        const bloodGraphics = this.add.graphics();
        bloodGraphics.fillStyle(0x8B0000, 1);
        bloodGraphics.fillCircle(6, 6, 4);
        bloodGraphics.fillStyle(0xDC143C, 0.8);
        bloodGraphics.fillCircle(6, 6, 2);
        bloodGraphics.generateTexture('blood', 12, 12);
        bloodGraphics.destroy();

        // Add sparkle effect
        const sparkGraphics = this.add.graphics();
        sparkGraphics.fillStyle(0xFFD700, 1);
        sparkGraphics.fillRect(2, 0, 2, 8);
        sparkGraphics.fillRect(0, 2, 8, 2);
        sparkGraphics.generateTexture('spark', 8, 8);
        sparkGraphics.destroy();
    }

    create() {
        // Set up massive infinite-feeling battlefield (8000x8000)
        const worldWidth = 8000;
        const worldHeight = 8000;
        // Remove world bounds for infinite feel
        this.physics.world.setBounds(-worldWidth, -worldHeight, worldWidth * 2, worldHeight * 2);

        const { width: screenWidth, height: screenHeight } = this.cameras.main;

        // Enhanced background with large texture
        this.createEnhancedBackground(worldWidth, worldHeight);

        // Create player at center of world
        this.player = this.physics.add.sprite(0, 0, 'player');
        this.player.setCollideWorldBounds(false); // No bounds restriction
        this.player.setDepth(10);

        // Set up camera to follow player with no bounds
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(1);

        // Create enemy groups for good vs evil battles
        this.enemies = this.physics.add.group(); // Still for player collision
        this.goodWarriors = this.physics.add.group();
        this.evilWarriors = this.physics.add.group();

        // Spawn good warriors fighting evil ones across the large battlefield
        this.spawnBattlingWarriors(worldWidth, worldHeight);

        // Collision
        this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

        // Enhanced UI (fixed to screen)
        this.createEnhancedUI(screenWidth, screenHeight);

        // Controls
        this.setupControls();

        // Game timer
        this.startEnhancedTimer();

        // Add atmospheric effects
        this.createAtmosphericEffects();

        // Continuous spawning to maintain MASSIVE battlefield density
        this.time.addEvent({
            delay: 1000, // Every 1 second - MUCH faster spawning
            callback: this.maintainBattlefieldDensity,
            callbackScope: this,
            loop: true
        });

        console.log('Enhanced GameScene created successfully!');
    }

    hitEnemy(player, enemy) {
        // Simply update score and remove enemy
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
        enemy.destroy();
        
        // Spawn one new enemy offscreen around the player
        this.spawnEnemyOffscreen();
    }

    spawnEnemyOffscreen() {
        const camera = this.cameras.main;
        const playerX = this.player.x;
        const playerY = this.player.y;
        
        // Calculate offscreen spawn position
        let spawnX, spawnY;
        const spawnDistance = 600; // Distance from player to spawn
        const angle = Math.random() * Math.PI * 2; // Random angle around player
        
        spawnX = playerX + Math.cos(angle) * spawnDistance;
        spawnY = playerY + Math.sin(angle) * spawnDistance;
        
        // Ensure spawn is within world bounds
        spawnX = Phaser.Math.Clamp(spawnX, 50, this.physics.world.bounds.width - 50);
        spawnY = Phaser.Math.Clamp(spawnY, 50, this.physics.world.bounds.height - 50);
        
        // Create new evil enemy
        const evilTypes = ['orc_warrior', 'goblin_warrior', 'troll_warrior'];
        const creatureType = evilTypes[Math.floor(Math.random() * evilTypes.length)];
        
        const newEnemy = this.physics.add.sprite(spawnX, spawnY, creatureType);
        newEnemy.setCollideWorldBounds(true);
        newEnemy.setDepth(5);
        newEnemy.faction = 'evil';
        newEnemy.health = 100;
        this.enemies.add(newEnemy);
    }

    update() {
        if (this.gameOver || this.paused) return;

        // Player movement
        this.player.setVelocity(0);

        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            this.player.setVelocityX(-200);
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            this.player.setVelocityX(200);
        }

        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            this.player.setVelocityY(-200);
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            this.player.setVelocityY(200);
        }

        // Enemy AI - evil creatures seek player
        this.enemies.children.entries.forEach(enemy => {
            if (!enemy.active) return;
            
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y, enemy.x, enemy.y
            );
            
            if (distance > 0) {
                const angle = Phaser.Math.Angle.Between(
                    enemy.x, enemy.y, this.player.x, this.player.y
                );
                enemy.setVelocity(
                    Math.cos(angle) * 40,
                    Math.sin(angle) * 40
                );
            }
        });

        // Good warriors seek evil creatures
        this.goodWarriors.children.entries.forEach(goodWarrior => {
            if (!goodWarrior.active) return;
            
            let closestEvil = null;
            let closestDistance = Infinity;
            
            this.evilWarriors.children.entries.forEach(evil => {
                if (!evil.active) return;
                const distance = Phaser.Math.Distance.Between(
                    goodWarrior.x, goodWarrior.y, evil.x, evil.y
                );
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestEvil = evil;
                }
            });
            
            if (closestEvil && closestDistance > 30) {
                const angle = Phaser.Math.Angle.Between(
                    goodWarrior.x, goodWarrior.y, closestEvil.x, closestEvil.y
                );
                goodWarrior.setVelocity(
                    Math.cos(angle) * 30,
                    Math.sin(angle) * 30
                );
            } else {
                goodWarrior.setVelocity(0, 0);
            }
        });

        // Evil warriors seek good creatures  
        this.evilWarriors.children.entries.forEach(evilWarrior => {
            if (!evilWarrior.active) return;
            
            let closestGood = null;
            let closestDistance = Infinity;
            
            this.goodWarriors.children.entries.forEach(good => {
                if (!good.active) return;
                const distance = Phaser.Math.Distance.Between(
                    evilWarrior.x, evilWarrior.y, good.x, good.y
                );
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestGood = good;
                }
            });
            
            if (closestGood && closestDistance > 30) {
                const angle = Phaser.Math.Angle.Between(
                    evilWarrior.x, evilWarrior.y, closestGood.x, closestGood.y
                );
                evilWarrior.setVelocity(
                    Math.cos(angle) * 35,
                    Math.sin(angle) * 35
                );
            } else {
                evilWarrior.setVelocity(0, 0);
            }
        });

        // Update battle status display
        if (this.battleText) {
            const goodCount = this.goodWarriors.children.entries.filter(w => w.active).length;
            const evilCount = this.evilWarriors.children.entries.filter(w => w.active).length;
            this.battleText.setText(`ALLIES: ${goodCount} | ENEMIES: ${evilCount}`);
        }
    }

    togglePause() {
        this.paused = !this.paused;
        
        if (this.paused) {
            this.physics.pause();
            this.showPauseMenu();
        } else {
            this.physics.resume();
            this.hidePauseMenu();
        }
    }

    showPauseMenu() {
        const { width, height } = this.cameras.main;
        
        // Pause overlay
        this.pauseOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000);
        this.pauseOverlay.setAlpha(0.7);
        this.pauseOverlay.setScrollFactor(0);
        this.pauseOverlay.setDepth(1000);

        // Pause menu
        this.pauseMenu = this.add.container(width / 2, height / 2);
        this.pauseMenu.setScrollFactor(0);
        this.pauseMenu.setDepth(1001);

        // Pause title
        const pauseTitle = this.add.text(0, -100, 'GAME PAUSED', {
            fontSize: '48px',
            color: '#FFD700',
            fontFamily: 'Arial Black'
        });
        pauseTitle.setOrigin(0.5);

        // Resume button
        const resumeButton = this.add.text(0, -20, 'RESUME (P)', {
            fontSize: '24px',
            color: '#FFFFFF',
            backgroundColor: '#4CAF50',
            padding: { x: 20, y: 10 }
        });
        resumeButton.setOrigin(0.5);
        resumeButton.setInteractive();
        resumeButton.on('pointerdown', () => this.togglePause());

        // Main menu button
        const menuButton = this.add.text(0, 40, 'MAIN MENU (ESC)', {
            fontSize: '24px',
            color: '#FFFFFF',
            backgroundColor: '#F44336',
            padding: { x: 20, y: 10 }
        });
        menuButton.setOrigin(0.5);
        menuButton.setInteractive();
        menuButton.on('pointerdown', () => this.scene.start('MenuScene'));

        this.pauseMenu.add([pauseTitle, resumeButton, menuButton]);
    }

    hidePauseMenu() {
        if (this.pauseOverlay) {
            this.pauseOverlay.destroy();
            this.pauseOverlay = null;
        }
        if (this.pauseMenu) {
            this.pauseMenu.destroy();
            this.pauseMenu = null;
        }
    }

    createEnhancedBackground(width, height) {
        // Base grass background with texture
        this.add.rectangle(width / 2, height / 2, width, height, 0x2d5016);
        
        // Add varied terrain patches
        for (let x = 0; x < width; x += 50) {
            for (let y = 0; y < height; y += 50) {
                const terrainType = Math.random();
                let color, alpha;
                
                if (terrainType < 0.6) {
                    // Green grass
                    color = 0x3a6b1f;
                    alpha = 0.6;
                } else if (terrainType < 0.8) {
                    // Dark soil/mud
                    color = 0x654321;
                    alpha = 0.5;
                } else {
                    // Rocky patches
                    color = 0x696969;
                    alpha = 0.4;
                }
                
                const terrainPatch = this.add.rectangle(
                    x + Math.random() * 50, 
                    y + Math.random() * 50, 
                    Math.random() * 30 + 15, 
                    Math.random() * 30 + 15, 
                    color
                );
                terrainPatch.setAlpha(alpha);
                terrainPatch.setRotation(Math.random() * Math.PI);
            }
        }
        
        // Add many more battlefield debris and structures
        for (let i = 0; i < 80; i++) {
            const debris = this.add.rectangle(
                Math.random() * width,
                Math.random() * height,
                Math.random() * 20 + 10,
                Math.random() * 20 + 10,
                0x696969
            );
            debris.setAlpha(0.7);
            debris.setRotation(Math.random() * Math.PI * 2);
        }
        
        // Add large rocks and boulders
        for (let i = 0; i < 25; i++) {
            const rock = this.add.circle(
                Math.random() * width,
                Math.random() * height,
                Math.random() * 20 + 10,
                0x555555
            );
            rock.setAlpha(0.8);
        }
        
        // Add burnt/scorched earth patches
        for (let i = 0; i < 15; i++) {
            const scorch = this.add.ellipse(
                Math.random() * width,
                Math.random() * height,
                Math.random() * 60 + 40,
                Math.random() * 40 + 30,
                0x2F1B14
            );
            scorch.setAlpha(0.6);
        }
        
        // Add dead trees and forest remnants
        for (let i = 0; i < 30; i++) {
            const treeX = Math.random() * width;
            const treeY = Math.random() * height;
            
            // Tree trunk
            const trunk = this.add.rectangle(
                treeX, treeY, 8, 25, 0x4A4A4A
            );
            trunk.setAlpha(0.8);
            
            // Dead branches
            for (let j = 0; j < 3; j++) {
                const branch = this.add.rectangle(
                    treeX + (Math.random() - 0.5) * 15,
                    treeY - 10 + (Math.random() - 0.5) * 10,
                    Math.random() * 12 + 6,
                    2,
                    0x654321
                );
                branch.setAlpha(0.7);
                branch.setRotation(Math.random() * Math.PI);
            }
        }
        
        // Add ancient ruins/stone structures
        for (let i = 0; i < 10; i++) {
            const ruinX = Math.random() * width;
            const ruinY = Math.random() * height;
            
            // Main ruin structure
            const ruin = this.add.rectangle(
                ruinX, ruinY, 
                Math.random() * 40 + 30,
                Math.random() * 30 + 20,
                0x8B7D6B
            );
            ruin.setAlpha(0.9);
            
            // Broken pillars
            for (let j = 0; j < 2; j++) {
                const pillar = this.add.rectangle(
                    ruinX + (Math.random() - 0.5) * 50,
                    ruinY + (Math.random() - 0.5) * 40,
                    8, Math.random() * 25 + 15,
                    0x696969
                );
                pillar.setAlpha(0.8);
            }
        }
        
        // Add weapon remnants stuck in ground
        for (let i = 0; i < 40; i++) {
            const weaponX = Math.random() * width;
            const weaponY = Math.random() * height;
            
            // Broken sword/spear
            const weapon = this.add.rectangle(
                weaponX, weaponY,
                3, Math.random() * 15 + 10,
                0x4A4A4A
            );
            weapon.setAlpha(0.7);
            weapon.setRotation(Math.random() * Math.PI * 2);
        }
        
        // Add mud/water pools
        for (let i = 0; i < 12; i++) {
            const pool = this.add.ellipse(
                Math.random() * width,
                Math.random() * height,
                Math.random() * 50 + 30,
                Math.random() * 30 + 20,
                0x1B1B3A
            );
            pool.setAlpha(0.7);
        }
    }

    createEnhancedUI(width, height) {
        // Score panel with background - better positioned
        const scoreBg = this.add.rectangle(120, 40, 200, 60, 0x000000);
        scoreBg.setAlpha(0.9);
        scoreBg.setStrokeStyle(3, 0xFFD700);
        scoreBg.setScrollFactor(0);
        scoreBg.setDepth(1000);
        
        this.scoreText = this.add.text(120, 40, 'Score: 0', {
            fontSize: '22px',
            fontFamily: 'Arial Black',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.scoreText.setOrigin(0.5);
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(1001);

        // Timer panel with background - better positioned
        const timerBg = this.add.rectangle(width - 120, 40, 200, 60, 0x000000);
        timerBg.setAlpha(0.9);
        timerBg.setStrokeStyle(3, 0xFF6B6B);
        timerBg.setScrollFactor(0);
        timerBg.setDepth(1000);
        
        this.timerText = this.add.text(width - 120, 40, 'Time: 90', {
            fontSize: '22px',
            fontFamily: 'Arial Black',
            color: '#FF6B6B',
            stroke: '#000000',
            strokeThickness: 3
        });
        this.timerText.setOrigin(0.5);
        this.timerText.setScrollFactor(0);
        this.timerText.setDepth(1001);

        // Battle status display - shows current warrior counts
        const battleBg = this.add.rectangle(width / 2, 40, 300, 60, 0x000000);
        battleBg.setAlpha(0.9);
        battleBg.setStrokeStyle(3, 0x0080FF);
        battleBg.setScrollFactor(0);
        battleBg.setDepth(1000);
        
        this.battleText = this.add.text(width / 2, 40, 'EPIC BATTLE RAGING!', {
            fontSize: '18px',
            fontFamily: 'Arial Black',
            color: '#0080FF',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.battleText.setOrigin(0.5);
        this.battleText.setScrollFactor(0);
        this.battleText.setDepth(1001);

        // Enhanced exit button - better positioned
        this.exitButton = this.add.rectangle(width - 100, height - 50, 160, 50, 0x8B0000);
        this.exitButton.setStrokeStyle(3, 0xFFD700);
        this.exitButton.setScrollFactor(0);
        this.exitButton.setDepth(1000);
        this.exitButton.setInteractive();
        this.exitButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
        
        const exitText = this.add.text(width - 100, height - 50, 'EXIT (ESC)', {
            fontSize: '18px',
            fontFamily: 'Arial Black',
            color: '#FFD700'
        });
        exitText.setOrigin(0.5);
        exitText.setScrollFactor(0);
        exitText.setDepth(1001);

        // Enhanced instructions with better styling
        const instructionsBg = this.add.rectangle(140, height - 60, 260, 80, 0x000000);
        instructionsBg.setAlpha(0.8);
        instructionsBg.setStrokeStyle(2, 0x87CEEB);
        instructionsBg.setScrollFactor(0);
        
        this.instructionsText = this.add.text(140, height - 60, 
            'WASD/Arrows = Move\nTouch enemies to defeat!\nP = Pause  •  ESC = Exit', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#87CEEB',
            align: 'center',
            lineSpacing: 4
        });
        this.instructionsText.setOrigin(0.5);
        this.instructionsText.setScrollFactor(0);
    }

    setupControls() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D,SPACE');
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

        // ESC key to return to menu
        this.escKey.on('down', () => {
            this.scene.start('MenuScene');
        });

        // P key to pause/unpause
        this.pKey.on('down', () => {
            this.togglePause();
        });
    }

    startEnhancedTimer() {
        this.gameTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                this.timerText.setText('Time: ' + this.timeLeft);
                
                // Color change based on time left
                if (this.timeLeft <= 10) {
                    this.timerText.setColor('#FF0000');
                } else if (this.timeLeft <= 30) {
                    this.timerText.setColor('#FF8C00');
                }
                
                if (this.timeLeft <= 0) {
                    this.gameOver = true;
                    this.scene.start('ResultsScene', { score: this.score });
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    createAtmosphericEffects() {
        // Add floating particles
        this.time.addEvent({
            delay: 3000,
            callback: () => {
                if (this.gameOver || this.paused) return;
                
                const particle = this.add.image(
                    Math.random() * this.cameras.main.width,
                    -20,
                    'spark'
                );
                particle.setAlpha(0.6);
                particle.setScale(0.5);
                
                this.tweens.add({
                    targets: particle,
                    y: this.cameras.main.height + 20,
                    alpha: 0,
                    duration: 8000,
                    onComplete: () => particle.destroy()
                });
            },
            callbackScope: this,
            loop: true
        });
    }

    // GOOD FORCES - Bright BLUE/GOLD colors for clear identification
    createElfWarrior() {
        const elfGraphics = this.add.graphics();
        // Elf body (BRIGHT BLUE for good guys)
        elfGraphics.fillStyle(0x0080FF, 1); // Bright blue
        elfGraphics.fillEllipse(18, 18, 30, 20); // Taller, slimmer
        // GOLD accents for good
        elfGraphics.fillStyle(0xFFD700, 1); // Gold
        elfGraphics.fillTriangle(8, 12, 12, 8, 12, 16); // Pointed ear
        elfGraphics.fillTriangle(28, 12, 24, 8, 24, 16); // Pointed ear
        // Bright bow
        elfGraphics.lineStyle(3, 0xFFD700, 1);
        elfGraphics.strokeCircle(6, 18, 8); // Golden bow
        // BLUE identification mark
        elfGraphics.fillStyle(0x0080FF, 1);
        elfGraphics.fillCircle(18, 10, 4); // Blue gem on forehead
        elfGraphics.generateTexture('elf_warrior', 36, 36);
        elfGraphics.destroy();
    }

    createDwarfWarrior() {
        const dwarfGraphics = this.add.graphics();
        // Dwarf body (BRIGHT BLUE for good guys)
        dwarfGraphics.fillStyle(0x0080FF, 1); // Bright blue
        dwarfGraphics.fillCircle(18, 20, 16); // Shorter, rounder
        // GOLD beard for good identification
        dwarfGraphics.fillStyle(0xFFD700, 1); // Gold beard
        dwarfGraphics.fillEllipse(18, 26, 20, 12);
        // BRIGHT axe
        dwarfGraphics.fillStyle(0xC0C0C0, 1); // Silver
        dwarfGraphics.fillRect(30, 10, 4, 16); // Axe handle
        dwarfGraphics.fillStyle(0xFFD700, 1); // Golden axe head
        dwarfGraphics.fillRect(26, 12, 8, 6); // Axe head
        // BLUE identification mark
        dwarfGraphics.fillStyle(0x0080FF, 1);
        dwarfGraphics.fillCircle(18, 14, 3); // Blue gem
        dwarfGraphics.generateTexture('dwarf_warrior', 36, 36);
        dwarfGraphics.destroy();
    }

    createHumanKnight() {
        const knightGraphics = this.add.graphics();
        // Knight body (BRIGHT BLUE for good guys)
        knightGraphics.fillStyle(0x0080FF, 1); // Bright blue
        knightGraphics.fillCircle(18, 18, 16);
        // GOLD helmet with bright plume
        knightGraphics.fillStyle(0xFFD700, 1); // Gold
        knightGraphics.fillCircle(18, 12, 8);
        knightGraphics.fillStyle(0x0080FF, 1); // Blue plume
        knightGraphics.fillRect(16, 4, 4, 8);
        // BLUE cross on chest for identification
        knightGraphics.fillStyle(0x0080FF, 1);
        knightGraphics.fillRect(16, 16, 4, 8); // Vertical
        knightGraphics.fillRect(14, 18, 8, 4); // Horizontal
        // Sword and shield
        knightGraphics.fillStyle(0xFFD700, 1); // Gold
        knightGraphics.fillRect(4, 12, 8, 12); // Shield
        knightGraphics.fillStyle(0xC0C0C0, 1); // Sword
        knightGraphics.fillRect(30, 8, 2, 16);
        knightGraphics.generateTexture('human_knight', 36, 36);
        knightGraphics.destroy();
    }

    // EVIL FORCES - Dark RED/BLACK colors for clear identification
    createOrcWarrior() {
        const orcGraphics = this.add.graphics();
        // Orc body (DARK RED for evil)
        orcGraphics.fillStyle(0x8B0000, 1); // Dark red
        orcGraphics.fillCircle(18, 18, 18);
        // Black armor/details
        orcGraphics.fillStyle(0x000000, 1); // Black
        orcGraphics.fillCircle(18, 18, 14); // Black armor
        // Red tusks for evil
        orcGraphics.fillStyle(0xFF0000, 1); // Red tusks
        orcGraphics.fillTriangle(14, 20, 16, 16, 18, 20);
        orcGraphics.fillTriangle(22, 20, 20, 16, 18, 20);
        // Dark weapon
        orcGraphics.fillStyle(0x000000, 1); // Black club
        orcGraphics.fillRect(30, 10, 6, 16);
        orcGraphics.fillCircle(33, 10, 4); // Club head
        // RED identification mark
        orcGraphics.fillStyle(0xFF0000, 1);
        orcGraphics.fillCircle(18, 12, 3); // Red gem/mark
        orcGraphics.generateTexture('orc_warrior', 36, 36);
        orcGraphics.destroy();
    }

    createGoblinWarrior() {
        const goblinGraphics = this.add.graphics();
        // Goblin body (DARK RED for evil)
        goblinGraphics.fillStyle(0x8B0000, 1); // Dark red
        goblinGraphics.fillCircle(18, 20, 12); // Smaller
        // BLACK ears for evil look
        goblinGraphics.fillStyle(0x000000, 1);
        goblinGraphics.fillEllipse(8, 16, 8, 12); // Black ear
        goblinGraphics.fillEllipse(28, 16, 8, 12); // Black ear
        // Red dagger
        goblinGraphics.fillStyle(0xFF0000, 1);
        goblinGraphics.fillRect(30, 14, 2, 8); // Red blade
        // RED identification mark
        goblinGraphics.fillStyle(0xFF0000, 1);
        goblinGraphics.fillCircle(18, 16, 2); // Red eyes
        goblinGraphics.generateTexture('goblin_warrior', 36, 36);
        goblinGraphics.destroy();
    }

    createTrollWarrior() {
        const trollGraphics = this.add.graphics();
        // Troll body (MASSIVE DARK RED for evil)
        trollGraphics.fillStyle(0x8B0000, 1); // Dark red
        trollGraphics.fillCircle(18, 18, 20); // Larger
        // BLACK details
        trollGraphics.fillStyle(0x000000, 1);
        trollGraphics.fillCircle(18, 18, 16); // Black inner body
        // Massive red claws
        trollGraphics.fillStyle(0xFF0000, 1);
        trollGraphics.fillTriangle(6, 20, 10, 16, 8, 24); // Left claw
        trollGraphics.fillTriangle(30, 20, 26, 16, 28, 24); // Right claw
        // RED identification mark
        trollGraphics.fillStyle(0xFF0000, 1);
        trollGraphics.fillCircle(18, 10, 4); // Large red mark
        trollGraphics.fillCircle(22, 14, 8); // Hunch
        // Massive club
        trollGraphics.fillStyle(0x8B4513, 1);
        trollGraphics.fillRect(28, 8, 8, 20); // Big club
        trollGraphics.fillCircle(32, 8, 6); // Club head
        trollGraphics.generateTexture('troll_warrior', 36, 36);
        trollGraphics.destroy();
    }

    spawnBattlingWarriors(width, height) {
        const centerX = 0; // Player starts at center (0,0)
        const centerY = 0;
        const safeRadius = 400; // Keep initial area around player clear
        
        // MASSIVE BATTLEFIELD - Spawn hundreds of good warriors
        const goodTypes = ['elf_warrior', 'dwarf_warrior', 'human_knight'];
        for (let i = 0; i < 200; i++) { // MASSIVE increase from 50 to 200
            let x, y;
            do {
                x = Phaser.Math.Between(-width, width);
                y = Phaser.Math.Between(-height, height);
                // Ensure not too close to player spawn
            } while (Phaser.Math.Distance.Between(x, y, centerX, centerY) < safeRadius);
            
            const warriorType = goodTypes[Math.floor(Math.random() * goodTypes.length)];
            
            const goodWarrior = this.physics.add.sprite(x, y, warriorType);
            goodWarrior.setCollideWorldBounds(false); // No bounds
            goodWarrior.setDepth(5);
            goodWarrior.faction = 'good';
            goodWarrior.health = 100;
            this.goodWarriors.add(goodWarrior);
        }

        // MASSIVE BATTLEFIELD - Spawn hundreds of evil creatures  
        const evilTypes = ['orc_warrior', 'goblin_warrior', 'troll_warrior'];
        for (let i = 0; i < 200; i++) { // MASSIVE increase from 50 to 200
            let x, y;
            do {
                x = Phaser.Math.Between(-width, width);
                y = Phaser.Math.Between(-height, height);
                // Ensure not too close to player spawn
            } while (Phaser.Math.Distance.Between(x, y, centerX, centerY) < safeRadius);
            
            const creatureType = evilTypes[Math.floor(Math.random() * evilTypes.length)];
            
            const evilWarrior = this.physics.add.sprite(x, y, creatureType);
            evilWarrior.setCollideWorldBounds(false); // No bounds
            evilWarrior.setDepth(5);
            evilWarrior.faction = 'evil';
            evilWarrior.health = 100;
            this.evilWarriors.add(evilWarrior);
            
            // Evil creatures can also attack player
            this.enemies.add(evilWarrior);
        }

        // Set up battle collisions
        this.physics.add.overlap(this.goodWarriors, this.evilWarriors, this.warriorBattle, null, this);
    }

    warriorBattle(goodWarrior, evilWarrior) {
        // Simple battle - one destroys the other
        if (Math.random() > 0.5) {
            // Good wins
            evilWarrior.destroy();
            this.spawnNewEvilWarrior();
        } else {
            // Evil wins  
            goodWarrior.destroy();
            this.spawnNewGoodWarrior();
        }
        
        // Small blood effect
        const blood = this.add.image(
            (goodWarrior.x + evilWarrior.x) / 2,
            (goodWarrior.y + evilWarrior.y) / 2,
            'blood'
        );
        this.tweens.add({
            targets: blood,
            alpha: 0,
            duration: 1000,
            onComplete: () => blood.destroy()
        });
    }

    spawnNewGoodWarrior() {
        const goodTypes = ['elf_warrior', 'dwarf_warrior', 'human_knight'];
        const warriorType = goodTypes[Math.floor(Math.random() * goodTypes.length)];
        
        // Spawn randomly across the large battlefield, away from player
        const playerX = this.player.x;
        const playerY = this.player.y;
        let x, y;
        const minDistance = 800; // Keep far from player
        
        do {
            x = Phaser.Math.Between(100, this.physics.world.bounds.width - 100);
            y = Phaser.Math.Between(100, this.physics.world.bounds.height - 100);
        } while (Phaser.Math.Distance.Between(x, y, playerX, playerY) < minDistance);
        
        const newWarrior = this.physics.add.sprite(x, y, warriorType);
        newWarrior.setCollideWorldBounds(true);
        newWarrior.setDepth(5);
        newWarrior.faction = 'good';
        newWarrior.health = 100;
        this.goodWarriors.add(newWarrior);
    }

    spawnNewEvilWarrior() {
        const evilTypes = ['orc_warrior', 'goblin_warrior', 'troll_warrior'];
        const creatureType = evilTypes[Math.floor(Math.random() * evilTypes.length)];
        
        // Spawn randomly across the large battlefield, away from player
        const playerX = this.player.x;
        const playerY = this.player.y;
        let x, y;
        const minDistance = 800; // Keep far from player
        
        do {
            x = Phaser.Math.Between(100, this.physics.world.bounds.width - 100);
            y = Phaser.Math.Between(100, this.physics.world.bounds.height - 100);
        } while (Phaser.Math.Distance.Between(x, y, playerX, playerY) < minDistance);
        
        const newWarrior = this.physics.add.sprite(x, y, creatureType);
        newWarrior.setCollideWorldBounds(true);
        newWarrior.setDepth(5);
        newWarrior.faction = 'evil';
        newWarrior.health = 100;
        this.evilWarriors.add(newWarrior);
        this.enemies.add(newWarrior); // Evil can attack player
    }

    maintainBattlefieldDensity() {
        const targetGoodWarriors = 150; // MASSIVE increase - target number of good warriors
        const targetEvilWarriors = 150; // MASSIVE increase - target number of evil warriors
        
        // Check current counts
        const currentGood = this.goodWarriors.children.entries.filter(w => w.active).length;
        const currentEvil = this.evilWarriors.children.entries.filter(w => w.active).length;
        
        // Spawn good warriors if below target - spawn more at once
        if (currentGood < targetGoodWarriors) {
            const spawnCount = Math.min(10, targetGoodWarriors - currentGood);
            for (let i = 0; i < spawnCount; i++) {
                this.spawnNewGoodWarrior();
            }
        }
        
        // Spawn evil warriors if below target - spawn more at once
        if (currentEvil < targetEvilWarriors) {
            const spawnCount = Math.min(10, targetEvilWarriors - currentEvil);
            for (let i = 0; i < spawnCount; i++) {
                this.spawnNewEvilWarrior();
            }
        }
    }
}
