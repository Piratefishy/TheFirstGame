export class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.player = null;
        this.cursors = null;
        this.wasd = null;
        this.score = 0;
        this.scoreText = null;
        this.enemies = null;
        this.gameOver = false;
        this.timeLeft = 90; // 90 seconds (1 minute and 30 seconds)
        this.timerText = null;
        this.gameTimer = null;
        
        // Mobile touch controls
        this.mobileControls = null;
        this.joystick = null;
        this.attackButton = null;
        
        // Attack system
        this.canAttack = true;
        this.attackCooldown = 300; // milliseconds
        this.attackRange = 80;
        
        // Particle effects
        this.bloodParticles = null;
        this.hitEffects = null;
    }

    preload() {
        // Create simple placeholder sprites for now - we'll enhance these later
        this.createPlayerSprite();
        this.createEnemySprites();
        this.createWeaponSprites();
        this.createParticleSprites();
        this.createUISprites();
    }

    createPlayerSprite() {
        const graphics = this.add.graphics();
        graphics.fillStyle(0x4169E1, 1);
        graphics.fillCircle(20, 20, 18);
        graphics.fillStyle(0xFFD700, 1);
        graphics.fillCircle(20, 15, 4); // Head
        graphics.fillStyle(0x8B4513, 1);
        graphics.fillRect(16, 25, 8, 12); // Body
        graphics.generateTexture('player', 40, 40);
        graphics.destroy();
    }

    createEnemySprites() {
        // Enemy sprite
        const enemyGraphics = this.add.graphics();
        enemyGraphics.fillStyle(0x8B0000, 1);
        enemyGraphics.fillCircle(18, 18, 16);
        enemyGraphics.fillStyle(0x696969, 1);
        enemyGraphics.fillCircle(18, 13, 3); // Head
        enemyGraphics.fillStyle(0x654321, 1);
        enemyGraphics.fillRect(14, 22, 8, 10); // Body
        enemyGraphics.generateTexture('enemy', 36, 36);
        enemyGraphics.destroy();

        // Copy for different warrior types
        this.textures.addCanvas('evil_warrior', enemyGraphics.canvas);
        this.textures.addCanvas('good_warrior', enemyGraphics.canvas);
        this.textures.addCanvas('elite_warrior', enemyGraphics.canvas);
    }

    createWeaponSprites() {
        // Sword
        const swordGraphics = this.add.graphics();
        swordGraphics.fillStyle(0xC0C0C0, 1);
        swordGraphics.fillRect(10, 2, 4, 20);
        swordGraphics.fillStyle(0xFFD700, 1);
        swordGraphics.fillRect(8, 0, 8, 4);
        swordGraphics.generateTexture('sword', 24, 24);
        swordGraphics.destroy();
    }

    createParticleSprites() {
        // Blood particle
        const bloodGraphics = this.add.graphics();
        bloodGraphics.fillStyle(0x8B0000, 1);
        bloodGraphics.fillCircle(6, 6, 4);
        bloodGraphics.generateTexture('blood', 12, 12);
        bloodGraphics.destroy();

        // Spark particle
        const sparkGraphics = this.add.graphics();
        sparkGraphics.fillStyle(0xFFD700, 1);
        sparkGraphics.fillRect(2, 0, 2, 8);
        sparkGraphics.fillRect(0, 2, 8, 2);
        sparkGraphics.generateTexture('spark', 8, 8);
        sparkGraphics.destroy();

        // Explosion particle
        const explosionGraphics = this.add.graphics();
        explosionGraphics.fillStyle(0xFF4500, 1);
        explosionGraphics.fillCircle(16, 16, 12);
        explosionGraphics.fillStyle(0xFFD700, 0.8);
        explosionGraphics.fillCircle(16, 16, 8);
        explosionGraphics.generateTexture('explosion', 32, 32);
        explosionGraphics.destroy();
    }

    createUISprites() {
        // Mobile joystick base
        const joystickGraphics = this.add.graphics();
        joystickGraphics.fillStyle(0x333333, 0.6);
        joystickGraphics.fillCircle(40, 40, 35);
        joystickGraphics.lineStyle(3, 0x666666, 0.8);
        joystickGraphics.strokeCircle(40, 40, 35);
        joystickGraphics.generateTexture('joystick-base', 80, 80);
        joystickGraphics.destroy();

        // Mobile joystick thumb
        const thumbGraphics = this.add.graphics();
        thumbGraphics.fillStyle(0x777777, 0.9);
        thumbGraphics.fillCircle(15, 15, 12);
        thumbGraphics.lineStyle(2, 0x999999, 1);
        thumbGraphics.strokeCircle(15, 15, 12);
        thumbGraphics.generateTexture('joystick-thumb', 30, 30);
        thumbGraphics.destroy();

        // Attack button
        const attackBtnGraphics = this.add.graphics();
        attackBtnGraphics.fillStyle(0xe74c3c, 0.8);
        attackBtnGraphics.fillCircle(30, 30, 25);
        attackBtnGraphics.lineStyle(3, 0xFFD700, 1);
        attackBtnGraphics.strokeCircle(30, 30, 25);
        attackBtnGraphics.generateTexture('attack-button', 60, 60);
        attackBtnGraphics.destroy();
    }

    create() {
        const { width, height } = this.cameras.main;

        // Create infinite battlefield world (much larger than screen)
        this.worldSize = 2000; // 2000x2000 pixel battlefield
        this.physics.world.setBounds(0, 0, this.worldSize, this.worldSize);

        // Generate simple battlefield terrain
        this.createSimpleTerrain();

        // Player (Viking warrior)
        this.player = this.physics.add.sprite(this.worldSize / 2, this.worldSize / 2, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.setSize(28, 28);
        this.player.setDepth(10); // Make sure player is on top

        // Camera follows player for infinite battlefield feel
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, this.worldSize, this.worldSize);
        this.cameras.main.setZoom(1.2); // Slightly zoomed in for better view

        // Enemies group
        this.enemies = this.physics.add.group();
        
        // NPC warriors fighting each other
        this.goodWarriors = this.physics.add.group();
        this.evilWarriors = this.physics.add.group();
        this.neutralWarriors = this.physics.add.group();
        
        // Spawn initial enemies across the battlefield
        this.spawnInitialEnemies();
        
        // Create ongoing NPC battles with realistic AI
        this.createRealisticNPCBattles();

        // Collision between player and enemies
        this.physics.add.overlap(this.player, this.enemies, this.playerHitEnemy, null, this);

        // Enhanced particle system for blood effects
        this.bloodParticles = this.add.particles(0, 0, 'blood', {
            speed: { min: 80, max: 200 },
            scale: { start: 1.2, end: 0 },
            lifespan: 800,
            emitting: false,
            gravityY: 100
        });
        this.bloodParticles.setDepth(5);

        // Spark particles for weapon clashes
        this.sparkParticles = this.add.particles(0, 0, 'spark', {
            speed: { min: 50, max: 150 },
            scale: { start: 0.8, end: 0 },
            lifespan: 600,
            emitting: false
        });
        this.sparkParticles.setDepth(6);

        // Create ongoing battlefield with NPCs fighting
        this.createActiveBattlefield();

        // UI Setup (fixed to camera)
        this.setupUI();
        this.createEnhancedUI();

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D,SPACE');

        // Mobile controls
        this.createMobileControls();

        // Start game timer
        this.startGameTimer();

        // Enemy spawning timer - spawn around player constantly
        this.time.addEvent({
            delay: 1500,
            callback: this.spawnEnemyNearPlayer,
            callbackScope: this,
            loop: true
        });

        // Atmosphere effects
        this.createAtmosphereEffects();

        // === AAA QUALITY SYSTEMS ===
        this.setupAnimatedSprites();
        this.setupHeavyAtmosphere();
        this.setupComplexSpawnPortals();
        
        // === ADVANCED VISUAL SYSTEMS ===
        this.createCinematicLighting();
        this.createAdvancedParticleEffects();
        this.createRealisticWeatherSystem();
        this.createAdvancedCombatEffects();

        // === ADVANCED VISUAL EFFECTS FOR AAA QUALITY ===
    
        this.createCinematicLighting();
        this.createAdvancedParticleEffects();
        this.createRealisticWeatherSystem();
        
        // NEW: Advanced atmospheric effects
        this.createAdvancedAtmosphericEffects();
        
        // Initialize performance optimization
        this.initializePerformanceOptimization();
        
        // Initialize dynamic difficulty
        this.lastBossSpawn = 0;

        // === PERFORMANCE OPTIMIZATION SYSTEM ===
    
        this.initializePerformanceOptimization();
    }

    update() {
        if (this.gameOver) {
            return;
        }

        // Update advanced atmospheric effects
        this.updateAdvancedEffects();

        // Player movement (top-down)
        let velocityX = 0;
        let velocityY = 0;
        const speed = 200;

        // Keyboard controls
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            velocityX = -speed;
        }
        else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            velocityX = speed;
        }

        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            velocityY = -speed;
        }
        else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            velocityY = speed;
        }

        // Mobile joystick control
        if (this.joystick && this.joystick.force > 0.1) {
            velocityX = this.joystick.forceX * speed * 2;
            velocityY = this.joystick.forceY * speed * 2;
        }

        // Apply movement
        this.player.setVelocity(velocityX, velocityY);

        // Attack
        if (this.wasd.SPACE.isDown || this.attackPressed) {
            this.performAttackEnhanced();
        }

        // Update enemies AI (including evil warriors that attack player)
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.active) {
                if (enemy.isBoss) {
                    // Enhanced boss AI
                    this.updateBossEnemyAI(enemy);
                } else if (enemy.faction === 'evil') {
                    // Evil warriors have enhanced AI
                    this.updateEnemyAI(enemy);
                } else {
                    // Regular enemies
                    this.updateEnemyAI(enemy);
                }
            }
        });
        
        // Update dynamic difficulty
        this.updateDynamicDifficulty();

        // Update enhanced UI
        if (this.updateEnhancedUI) {
            this.updateEnhancedUI();
        }

        // Update performance optimization
        this.monitorPerformance();

        // Update dynamic difficulty
        this.updateDynamicDifficulty();
    }

    setupUI() {
        // UI is now fixed to camera (scrolls with view)
        
        // Score (fixed position on screen)
        this.scoreText = this.add.text(20, 20, 'Enemies Killed: 0', {
            fontSize: '22px',
            fontFamily: 'Arial Black',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 6 },
            borderRadius: 5
        });
        this.scoreText.setScrollFactor(0); // Fixed to camera
        this.scoreText.setDepth(100);

        // Timer (fixed position on screen)
        this.timerText = this.add.text(580, 20, 'Time: 1:30', {
            fontSize: '22px',
            fontFamily: 'Arial Black',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 6 },
            borderRadius: 5
        });
        this.timerText.setOrigin(1, 0);
        this.timerText.setScrollFactor(0); // Fixed to camera
        this.timerText.setDepth(100);

        // War cry instructions
        const instructions = this.add.text(400, 70, 'TO VALHALLA! SLAY ALL ENEMIES!', {
            fontSize: '18px',
            fontFamily: 'Arial Black',
            color: '#ffdd44',
            backgroundColor: '#8B0000',
            padding: { x: 12, y: 6 },
            borderRadius: 8
        });
        instructions.setOrigin(0.5, 0);
        instructions.setScrollFactor(0);
        instructions.setDepth(100);

        // Fade out instructions after 4 seconds
        this.time.delayedCall(4000, () => {
            this.tweens.add({
                targets: instructions,
                alpha: 0,
                duration: 1500
            });
        });
    }

    createEnhancedUI() {
        // Enhanced UI with more information and better styling
        
        // Main UI container
        this.uiContainer = this.add.container(0, 0);
        this.uiContainer.setScrollFactor(0);
        this.uiContainer.setDepth(1000);
        
        // Score panel with epic styling
        this.createScorePanel();
        
        // Timer panel with countdown effects
        this.createTimerPanel();
        
        // Health/status panel
        this.createStatusPanel();
        
        // Mini-map system
        this.createMiniMap();
        
        // Dynamic status messages
        this.createStatusMessages();
    }

    createScorePanel() {
        // Epic score background
        const scoreBg = this.add.rectangle(120, 35, 220, 50, 0x1A1A1A);
        scoreBg.setStrokeStyle(3, 0xFFD700);
        scoreBg.setScrollFactor(0);
        scoreBg.setDepth(999);
        
        // Inner decoration
        const scoreInner = this.add.rectangle(120, 35, 210, 40, 0x8B0000);
        scoreInner.setAlpha(0.6);
        scoreInner.setScrollFactor(0);
        scoreInner.setDepth(999);
        
        // Score text with enhanced styling
        this.scoreText = this.add.text(120, 25, 'Enemies Slain: 0', {
            fontSize: '16px',
            fontFamily: 'Arial Black',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        });
        this.scoreText.setOrigin(0.5);
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(1000);
        
        // Kill streak indicator
        this.killStreakText = this.add.text(120, 45, '', {
            fontSize: '12px',
            fontFamily: 'Arial Black',
            color: '#FF6347',
            stroke: '#000000',
            strokeThickness: 1
        });
        this.killStreakText.setOrigin(0.5);
        this.killStreakText.setScrollFactor(0);
        this.killStreakText.setDepth(1000);
    }

    createTimerPanel() {
        // Timer background with epic styling
        const timerBg = this.add.rectangle(680, 35, 200, 50, 0x1A1A1A);
        timerBg.setStrokeStyle(3, 0xFF4500);
        timerBg.setScrollFactor(0);
        timerBg.setDepth(999);
        
        const timerInner = this.add.rectangle(680, 35, 190, 40, 0x2F1B14);
        timerInner.setAlpha(0.6);
        timerInner.setScrollFactor(0);
        timerInner.setDepth(999);
        
        // Timer text
        this.timerText = this.add.text(680, 25, 'Time: 1:30', {
            fontSize: '16px',
            fontFamily: 'Arial Black',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        });
        this.timerText.setOrigin(0.5);
        this.timerText.setScrollFactor(0);
        this.timerText.setDepth(1000);
        
        // Time warning
        this.timeWarning = this.add.text(680, 45, '', {
            fontSize: '11px',
            fontFamily: 'Arial Black',
            color: '#FF0000',
            stroke: '#000000',
            strokeThickness: 1
        });
        this.timeWarning.setOrigin(0.5);
        this.timeWarning.setScrollFactor(0);
        this.timeWarning.setDepth(1000);
    }

    createStatusPanel() {
        // Status panel for various information
        const statusBg = this.add.rectangle(400, 35, 180, 50, 0x1A1A1A);
        statusBg.setStrokeStyle(2, 0x4682B4);
        statusBg.setScrollFactor(0);
        statusBg.setDepth(999);
        
        // Spirit power indicator
        this.spiritPowerText = this.add.text(400, 25, 'SPIRIT POWER', {
            fontSize: '12px',
            fontFamily: 'Arial Black',
            color: '#87CEEB',
            stroke: '#000000',
            strokeThickness: 1
        });
        this.spiritPowerText.setOrigin(0.5);
        this.spiritPowerText.setScrollFactor(0);
        this.spiritPowerText.setDepth(1000);
        
        // Battle intensity
        this.battleIntensityText = this.add.text(400, 45, 'Intensity: LOW', {
            fontSize: '10px',
            fontFamily: 'Arial',
            color: '#FFA500',
            stroke: '#000000',
            strokeThickness: 1
        });
        this.battleIntensityText.setOrigin(0.5);
        this.battleIntensityText.setScrollFactor(0);
        this.battleIntensityText.setDepth(1000);
    }

    createMiniMap() {
        // Simple mini-map in corner
        const mapSize = 120;
        const mapBg = this.add.rectangle(730, 130, mapSize, mapSize, 0x000000);
        mapBg.setStrokeStyle(2, 0xFFD700);
        mapBg.setAlpha(0.7);
        mapBg.setScrollFactor(0);
        mapBg.setDepth(998);
        
        this.miniMapContainer = this.add.container(730, 130);
        this.miniMapContainer.setScrollFactor(0);
        this.miniMapContainer.setDepth(999);
        
        // Player dot
        this.playerDot = this.add.rectangle(0, 0, 4, 4, 0x00FF00);
        this.miniMapContainer.add(this.playerDot);
        
        // Mini-map title
        const mapTitle = this.add.text(730, 70, 'BATTLEFIELD', {
            fontSize: '10px',
            fontFamily: 'Arial Black',
            color: '#FFD700',
            stroke: '#000000',
            strokeThickness: 1
        });
        mapTitle.setOrigin(0.5);
        mapTitle.setScrollFactor(0);
        mapTitle.setDepth(1000);
    }

    createStatusMessages() {
        // Area for dynamic status messages
        this.statusMessageY = 200;
        this.activeMessages = [];
    }

    updateEnhancedUI() {
        // Update kill streak
        const killCount = Math.floor(this.score / 10);
        if (killCount >= 5) {
            this.killStreakText.setText(`${killCount} Kill Streak!`);
            this.killStreakText.setVisible(true);
        } else {
            this.killStreakText.setVisible(false);
        }
        
        // Update battle intensity
        const enemyCount = this.enemies.children.entries.length;
        let intensity = 'LOW';
        let intensityColor = '#00FF00';
        
        if (enemyCount > 10) {
            intensity = 'HIGH';
            intensityColor = '#FF0000';
        } else if (enemyCount > 5) {
            intensity = 'MEDIUM';
            intensityColor = '#FFA500';
        }
        
        this.battleIntensityText.setText(`Intensity: ${intensity}`);
        this.battleIntensityText.setColor(intensityColor);
        
        // Update mini-map
        if (this.playerDot) {
            const mapScale = 100 / this.worldSize;
            const mapX = (this.player.x - this.worldSize / 2) * mapScale;
            const mapY = (this.player.y - this.worldSize / 2) * mapScale;
            this.playerDot.setPosition(mapX, mapY);
        }
        
        // Update time warnings
        if (this.timeLeft <= 10) {
            this.timeWarning.setText('TIME RUNNING OUT!');
            this.timeWarning.setVisible(true);
            
            // Pulse effect
            this.tweens.add({
                targets: this.timeWarning,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 200,
                yoyo: true,
                repeat: 0
            });
        } else if (this.timeLeft <= 30) {
            this.timeWarning.setText('Final moments!');
            this.timeWarning.setVisible(true);
        } else {
            this.timeWarning.setVisible(false);
        }
    }

    createDynamicMessage(text, color = '#FFD700', duration = 2000) {
        const message = this.add.text(400, this.statusMessageY, text, {
            fontSize: '16px',
            fontFamily: 'Arial Black',
            color: color,
            stroke: '#000000',
            strokeThickness: 2,
            backgroundColor: '#000000',
            padding: { x: 15, y: 8 },
            borderRadius: 8
        });
        message.setOrigin(0.5);
        message.setScrollFactor(0);
        message.setDepth(1001);
        
        // Animate in
        message.setAlpha(0);
        this.tweens.add({
            targets: message,
            alpha: 1,
            y: this.statusMessageY + 20,
            duration: 300,
            ease: 'Back'
        });
        
        // Animate out
        this.time.delayedCall(duration, () => {
            this.tweens.add({
                targets: message,
                alpha: 0,
                y: this.statusMessageY - 20,
                duration: 300,
                onComplete: () => message.destroy()
            });
        });
        
        this.statusMessageY += 40;
        if (this.statusMessageY > 400) {
            this.statusMessageY = 200;
        }
    }

    // ================== REALISTIC NPC BATTLE SYSTEM ================== //

    createRealisticNPCBattles() {
        // Create battlefield groups
        this.goodWarriors = this.physics.add.group();
        this.evilWarriors = this.physics.add.group();
        this.battlefieldProps = this.add.group();
        
        // Create multiple battle clusters across the map
        this.createBattleCluster(300, 300, 'good');
        this.createBattleCluster(1500, 400, 'evil');
        this.createBattleCluster(800, 1200, 'good');
        this.createBattleCluster(1200, 800, 'evil');
        this.createBattleCluster(600, 1600, 'mixed');
        
        // Add collision between warrior factions
        this.physics.add.overlap(this.goodWarriors, this.evilWarriors, this.npcWarriorClash, null, this);
        
        // NPC battle timer
        this.time.addEvent({
            delay: 1000,
            callback: this.updateNPCBattles,
            callbackScope: this,
            loop: true
        });
    }

    createBattleCluster(centerX, centerY, faction) {
        const clusterSize = 6;
        const spreadRadius = 80;
        
        for (let i = 0; i < clusterSize; i++) {
            const angle = (i / clusterSize) * Math.PI * 2;
            const distance = Math.random() * spreadRadius;
            const x = centerX + Math.cos(angle) * distance;
            const y = centerY + Math.sin(angle) * distance;
            
            // Determine warrior faction
            let warriorFaction;
            if (faction === 'mixed') {
                warriorFaction = Math.random() < 0.5 ? 'good' : 'evil';
            } else {
                warriorFaction = faction;
            }
            
            this.createNPCWarrior(x, y, warriorFaction);
        }
    }

    createNPCWarrior(x, y, faction) {
        const spriteKey = faction === 'good' ? 'good_warrior' : 'evil_warrior';
        const warrior = this.physics.add.sprite(x, y, spriteKey);
        
        warrior.setCollideWorldBounds(true);
        warrior.setSize(24, 24);
        warrior.setDepth(8);
        
        // Warrior properties
        warrior.faction = faction;
        warrior.health = 2;
        warrior.attackCooldown = 0;
        warrior.speed = Phaser.Math.Between(40, 80);
        warrior.battleState = 'searching'; // searching, fighting, wounded
        warrior.target = null;
        warrior.lastAttackTime = 0;
        
        // Add to appropriate group
        if (faction === 'good') {
            this.goodWarriors.add(warrior);
            warrior.setTint(0x90EE90); // Light green tint
        } else {
            this.evilWarriors.add(warrior);
            warrior.setTint(0xFF6B6B); // Light red tint
        }
        
        // Random battle animations
        this.time.delayedCall(Math.random() * 2000, () => {
            this.animateNPCWarrior(warrior);
        });
        
        return warrior;
    }

    animateNPCWarrior(warrior) {
        if (!warrior.active) return;
        
        // Random movement and battle poses
        this.tweens.add({
            targets: warrior,
            scaleX: 1 + Math.sin(this.time.now * 0.002 + warrior.x * 0.001) * 0.1,
            scaleY: 1 + Math.cos(this.time.now * 0.003 + warrior.y * 0.001) * 0.1,
            duration: 1000 + Math.random() * 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    updateNPCBattles() {
        // Update good warriors
        this.goodWarriors.children.entries.forEach(warrior => {
            if (warrior.active) {
                this.updateNPCWarriorAI(warrior);
            }
        });
        
        // Update evil warriors
        this.evilWarriors.children.entries.forEach(warrior => {
            if (warrior.active) {
                this.updateNPCWarriorAI(warrior);
            }
        });
    }

    updateNPCWarriorAI(warrior) {
        const currentTime = this.time.now;
        
        switch (warrior.battleState) {
            case 'searching':
                this.npcSearchForTarget(warrior);
                break;
            case 'fighting':
                this.npcFightTarget(warrior, currentTime);
                break;
            case 'wounded':
                this.npcRecover(warrior);
                break;
        }
        
        // Random movement for realism
        if (Math.random() < 0.1) {
            const moveAngle = Math.random() * Math.PI * 2;
            const moveDistance = 20;
            const newX = warrior.x + Math.cos(moveAngle) * moveDistance;
            const newY = warrior.y + Math.sin(moveAngle) * moveDistance;
            
            warrior.setVelocity(
                (newX - warrior.x) * 0.5,
                (newY - warrior.y) * 0.5
            );
        }
    }

    npcSearchForTarget(warrior) {
        const enemyGroup = warrior.faction === 'good' ? this.evilWarriors : this.goodWarriors;
        let closestEnemy = null;
        let closestDistance = 150;
        
        enemyGroup.children.entries.forEach(enemy => {
            if (enemy.active) {
                const distance = Phaser.Math.Distance.Between(warrior.x, warrior.y, enemy.x, enemy.y);
                if (distance < closestDistance) {
                    closestEnemy = enemy;
                    closestDistance = distance;
                }
            }
        });
        
        if (closestEnemy) {
            warrior.target = closestEnemy;
            warrior.battleState = 'fighting';
        }
    }

    npcFightTarget(warrior, currentTime) {
        if (!warrior.target || !warrior.target.active) {
            warrior.target = null;
            warrior.battleState = 'searching';
            return;
        }
        
        const distance = Phaser.Math.Distance.Between(warrior.x, warrior.y, warrior.target.x, warrior.target.y);
        
        if (distance > 200) {
            // Target too far, search for new one
            warrior.target = null;
            warrior.battleState = 'searching';
            return;
        }
        
        // Move towards target
        const angle = Phaser.Math.Angle.Between(warrior.x, warrior.y, warrior.target.x, warrior.target.y);
        warrior.setVelocity(
            Math.cos(angle) * warrior.speed,
            Math.sin(angle) * warrior.speed
        );
        
        // Attack if close enough and cooldown is ready
        if (distance < 40 && currentTime - warrior.lastAttackTime > 1500) {
            this.npcWarriorAttack(warrior, warrior.target);
            warrior.lastAttackTime = currentTime;
        }
    }

    npcRecover(warrior) {
        warrior.setVelocity(0, 0);
        
        // Recover after random time
        if (Math.random() < 0.02) {
            warrior.battleState = 'searching';
            warrior.clearTint();
            if (warrior.faction === 'good') {
                warrior.setTint(0x90EE90);
            } else {
                warrior.setTint(0xFF6B6B);
            }
        }
    }

    npcWarriorAttack(attacker, target) {
        // Create attack effect
        const attackEffect = this.add.image(attacker.x, attacker.y, 'slash_effect');
        attackEffect.setScale(0.7);
        attackEffect.setAlpha(0.6);
        attackEffect.setRotation(Math.random() * Math.PI * 2);
        
        this.tweens.add({
            targets: attackEffect,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 300,
            onComplete: () => attackEffect.destroy()
        });
        
        // Damage target
        target.health--;
        
        if (target.health <= 0) {
            this.npcWarriorDeath(target);
        } else {
            // Target becomes wounded
            target.battleState = 'wounded';
            target.setTint(0x888888);
            
            // Blood effect
            this.bloodParticles.emitParticleAt(target.x, target.y, 5);
        }
    }

    npcWarriorDeath(warrior) {
        // Death effect
        const deathParticles = this.add.particles(warrior.x, warrior.y, 'blood', {
            speed: { min: 60, max: 120 },
            scale: { start: 1, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 1500,
            quantity: 10
        });
        
        this.time.delayedCall(1500, () => {
            deathParticles.destroy();
        });
        
        // Spin and fade death animation
        this.tweens.add({
            targets: warrior,
            rotation: Math.PI * 2,
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            duration: 800,
            onComplete: () => {
                warrior.destroy();
                
                // Respawn after some time
                this.time.delayedCall(5000, () => {
                    this.respawnNPCWarrior(warrior.faction);
                });
            }
        });
    }

    respawnNPCWarrior(faction) {
        // Respawn at random battle location
        const spawnPoints = [
            { x: 300, y: 300 },
            { x: 1500, y: 400 },
            { x: 800, y: 1200 },
            { x: 1200, y: 800 },
            { x: 600, y: 1600 }
        ];
        
        const spawnPoint = Phaser.Utils.Array.GetRandom(spawnPoints);
        const offsetX = (Math.random() - 0.5) * 100;
        const offsetY = (Math.random() - 0.5) * 100;
        
        this.createNPCWarrior(
            spawnPoint.x + offsetX,
            spawnPoint.y + offsetY,
            faction
        );
    }

    npcWarriorClash(goodWarrior, evilWarrior) {
        // Visual clash effect when NPCs meet
        if (Math.random() < 0.1) { // Don't trigger too often
            this.sparkParticles.emitParticleAt(
                (goodWarrior.x + evilWarrior.x) / 2,
                (goodWarrior.y + evilWarrior.y) / 2,
                8
            );
        }
    }

    // === PERFORMANCE OPTIMIZATION SYSTEM ===
    
    initializePerformanceOptimization() {
        // Performance monitoring
        this.performanceStats = {
            lastFrameTime: 0,
            frameCount: 0,
            avgFps: 60,
            particleCount: 0,
            maxParticles: 500
        };
        
        // Dynamic quality adjustment
        this.qualityLevel = 'high'; // high, medium, low
        
        // Performance monitoring timer
        this.time.addEvent({
            delay: 1000,
            callback: this.monitorPerformance,
            callbackScope: this,
            loop: true
        });
    }

    monitorPerformance() {
        const currentFps = this.sys.game.loop.actualFps;
        this.performanceStats.avgFps = (this.performanceStats.avgFps + currentFps) / 2;
        
        // Adjust quality based on performance
        if (this.performanceStats.avgFps < 30 && this.qualityLevel === 'high') {
            this.adjustQuality('medium');
        } else if (this.performanceStats.avgFps < 20 && this.qualityLevel === 'medium') {
            this.adjustQuality('low');
        } else if (this.performanceStats.avgFps > 50 && this.qualityLevel === 'medium') {
            this.adjustQuality('high');
        }
    }

    adjustQuality(newLevel) {
        this.qualityLevel = newLevel;
        
        switch (newLevel) {
            case 'low':
                this.performanceStats.maxParticles = 200;
                this.reduceEffects();
                this.createDynamicMessage('Performance Mode: LOW', '#FF6347');
                break;
            case 'medium':
                this.performanceStats.maxParticles = 350;
                this.createDynamicMessage('Performance Mode: MEDIUM', '#FFA500');
                break;
            case 'high':
                this.performanceStats.maxParticles = 500;
                this.createDynamicMessage('Performance Mode: HIGH', '#00FF00');
                break;
        }
    }

    reduceEffects() {
        // Reduce particle systems for better performance
        if (this.dustEmitter) {
            this.dustEmitter.setConfig({ frequency: 300 });
        }
        if (this.windParticles) {
            this.windParticles.setConfig({ frequency: 600 });
        }
    }

    // === EPIC BOSS ENEMY SYSTEM ===
    
    spawnBossEnemy() {
        // Spawn epic boss enemy every 45 seconds
        if (this.gameOver) return;
        
        const bossX = this.player.x + (Math.random() - 0.5) * 400;
        const bossY = this.player.y + (Math.random() - 0.5) * 400;
        
        const boss = this.physics.add.sprite(bossX, bossY, 'elite_warrior');
        boss.setCollideWorldBounds(true);
        boss.setSize(32, 32);
        boss.setDepth(12);
        boss.setScale(1.5);
        
        // Boss properties
        boss.health = 5;
        boss.speed = 120;
        boss.attackDamage = 2;
        boss.isBoss = true;
        boss.lastAttackTime = 0;
        
        // Epic boss appearance effect
        const bossSpawn = this.add.particles(bossX, bossY, 'energy_particle', {
            speed: { min: 100, max: 200 },
            scale: { start: 1.5, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 1500,
            quantity: 30,
            tint: 0x8B0082
        });
        
        this.time.delayedCall(1500, () => {
            bossSpawn.destroy();
        });
        
        // Boss visual effects
        boss.setTint(0x8B0082);
        
        // Pulsing aura effect
        this.tweens.add({
            targets: boss,
            scaleX: 1.6,
            scaleY: 1.6,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        this.enemies.add(boss);
        
        // Boss announcement
        this.createDynamicMessage('ELITE WARRIOR APPEARS!', '#8B0082', 3000);
        
        // Epic music cue (visual representation)
        this.cameras.main.flash(300, 139, 0, 139, false);
    }

    updateBossEnemyAI(boss) {
        if (!boss.active || !boss.isBoss) return;
        
        const currentTime = this.time.now;
        
        // Enhanced AI for boss
        const distanceToPlayer = Phaser.Math.Distance.Between(
            boss.x, boss.y, this.player.x, this.player.y
        );
        
        if (distanceToPlayer > 200) {
            // Charge towards player
            const angle = Phaser.Math.Angle.Between(boss.x, boss.y, this.player.x, this.player.y);
            boss.setVelocity(
                Math.cos(angle) * boss.speed * 1.2,
                Math.sin(angle) * boss.speed * 1.2
            );
        } else {
            // Circle around player
            const circleAngle = currentTime * 0.002;
            const circleRadius = 150;
            const targetX = this.player.x + Math.cos(circleAngle) * circleRadius;
            const targetY = this.player.y + Math.sin(circleAngle) * circleRadius;
            
            const angle = Phaser.Math.Angle.Between(boss.x, boss.y, targetX, targetY);
            boss.setVelocity(
                Math.cos(angle) * boss.speed,
                Math.sin(angle) * boss.speed
            );
        }
        
        // Boss special attack
        if (distanceToPlayer < 100 && currentTime - boss.lastAttackTime > 2000) {
            this.bossSpecialAttack(boss);
            boss.lastAttackTime = currentTime;
        }
    }

    bossSpecialAttack(boss) {
        // Epic boss attack with shockwave
        const shockwaveGraphics = this.add.graphics();
        shockwaveGraphics.lineStyle(6, 0x8B0082, 0.8);
        shockwaveGraphics.strokeCircle(0, 0, 30);
        shockwaveGraphics.setPosition(boss.x, boss.y);
        
        this.tweens.add({
            targets: shockwaveGraphics,
            scaleX: 8,
            scaleY: 8,
            alpha: 0,
            duration: 800,
            onComplete: () => shockwaveGraphics.destroy()
        });
        
        // Screen shake
        this.cameras.main.shake(400, 0.03);
        
        // Check if player is hit by shockwave
        const distanceToPlayer = Phaser.Math.Distance.Between(
            boss.x, boss.y, this.player.x, this.player.y
        );
        
        if (distanceToPlayer < 150) {
            this.playerHitByBoss(boss);
        }
    }

    playerHitByBoss(boss) {
        // Enhanced damage from boss
        this.cameras.main.shake(350, 0.035);
        
        // Enhanced blood effect
        this.bloodParticles.emitParticleAt(this.player.x, this.player.y, 20);
        
        // Stronger knockback
        const angle = Phaser.Math.Angle.Between(boss.x, boss.y, this.player.x, this.player.y);
        this.player.setVelocity(
            Math.cos(angle) * 600,
            Math.sin(angle) * 600
        );
        
        // Flash player red longer
        this.player.setTint(0xff0000);
        this.time.delayedCall(400, () => {
            this.player.clearTint();
        });
        
        // Larger score penalty
        this.score = Math.max(0, this.score - 15);
        this.scoreText.setText('Enemies Killed: ' + Math.floor(this.score / 10));
        
        this.createDynamicMessage('HIT BY ELITE!', '#FF0000', 1500);
    }

    hitBossEnemy(boss) {
        boss.health--;
        
        // Enhanced boss hit effects
        this.bloodParticles.emitParticleAt(boss.x, boss.y, 30);
        
        // Boss hit reaction
        boss.setTint(0xFF0000);
        this.time.delayedCall(200, () => {
            boss.setTint(0x8B0082);
        });
        
        if (boss.health <= 0) {
            // Epic boss death
            this.createBossDeathEffect(boss);
            
            // Bonus score for boss kill
            this.score += 50;
            this.scoreText.setText('Enemies Killed: ' + Math.floor(this.score / 10));
            
            this.createDynamicMessage('ELITE DEFEATED! +5 KILLS!', '#FFD700', 3000);
            
            boss.destroy();
        } else {
            this.createDynamicMessage(`ELITE WOUNDED! ${boss.health} HP LEFT`, '#FFA500', 1000);
        }
    }

    createBossDeathEffect(boss) {
        // Massive explosion effect
        const deathExplosion = this.add.particles(boss.x, boss.y, 'explosion', {
            speed: { min: 150, max: 300 },
            scale: { start: 2, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 2000,
            quantity: 40,
            tint: 0x8B0082
        });
        
        // Screen flash
        this.cameras.main.flash(500, 139, 0, 139, false);
        
        // Major screen shake
        this.cameras.main.shake(600, 0.04);
        
        this.time.delayedCall(2000, () => {
            deathExplosion.destroy();
        });
    }

    // === DYNAMIC DIFFICULTY SYSTEM ===
    
    updateDynamicDifficulty() {
        const killCount = Math.floor(this.score / 10);
        const timeElapsed = 90 - this.timeLeft;
        
        // Adjust spawn rate based on performance
        let spawnMultiplier = 1;
        if (killCount > 10) spawnMultiplier = 1.2;
        if (killCount > 20) spawnMultiplier = 1.4;
        if (timeElapsed > 45) spawnMultiplier = 1.3; // Final rush
        
        // Boss spawn timing
        if (timeElapsed > 30 && timeElapsed % 15 === 0 && !this.lastBossSpawn) {
            this.spawnBossEnemy();
            this.lastBossSpawn = timeElapsed;
        }
        
        return spawnMultiplier;
    }

    spawnInitialEnemies() {
        // Spawn enemies around the battlefield
        for (let i = 0; i < 15; i++) {
            const x = Phaser.Math.Between(100, this.worldSize - 100);
            const y = Phaser.Math.Between(100, this.worldSize - 100);
            
            // Don't spawn too close to player
            const distanceToPlayer = Phaser.Math.Distance.Between(
                x, y, this.worldSize / 2, this.worldSize / 2
            );
            
            if (distanceToPlayer > 200) {
                const enemy = this.physics.add.sprite(x, y, 'enemy');
                enemy.setCollideWorldBounds(true);
                enemy.setSize(24, 24);
                enemy.health = 30;
                enemy.setTint(0x8B0000);
                this.enemies.add(enemy);
            }
        }
    }

    createActiveBattlefield() {
        // Add scattered battlefield debris
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, this.worldSize);
            const y = Phaser.Math.Between(0, this.worldSize);
            
            const debris = this.add.rectangle(x, y, 
                Phaser.Math.Between(8, 16), 
                Phaser.Math.Between(8, 16), 
                0x696969
            );
            debris.setAlpha(0.6);
            debris.setRotation(Math.random() * Math.PI * 2);
        }
        
        // Add some larger battlefield structures
        for (let i = 0; i < 10; i++) {
            const x = Phaser.Math.Between(100, this.worldSize - 100);
            const y = Phaser.Math.Between(100, this.worldSize - 100);
            
            const structure = this.add.rectangle(x, y, 
                Phaser.Math.Between(32, 64), 
                Phaser.Math.Between(20, 40), 
                0x654321
            );
            structure.setAlpha(0.7);
        }
    }

    createSimpleTerrain() {
        // Create simple grass texture
        const terrainGraphics = this.add.graphics();
        terrainGraphics.fillStyle(0x2d5016, 1);
        terrainGraphics.fillRect(0, 0, 64, 64);
        
        // Add some texture variation
        for (let i = 0; i < 20; i++) {
            terrainGraphics.fillStyle(0x3a6b1f, 0.5);
            terrainGraphics.fillRect(
                Math.random() * 64,
                Math.random() * 64,
                Math.random() * 8,
                Math.random() * 8
            );
        }
        
        terrainGraphics.generateTexture('grass', 64, 64);
        terrainGraphics.destroy();
        
        // Create battlefield background
        for (let x = 0; x < this.worldSize; x += 64) {
            for (let y = 0; y < this.worldSize; y += 64) {
                this.add.image(x + 32, y + 32, 'grass').setAlpha(0.8);
            }
        }
    }

    createMobileControls() {
        // Only create mobile controls if on mobile device
        if (this.sys.game.device.input.touch) {
            // Mobile joystick
            this.joystick = this.add.image(100, this.cameras.main.height - 100, 'joystick-base');
            this.joystick.setScrollFactor(0);
            this.joystick.setDepth(1000);
            this.joystick.setAlpha(0.7);

            this.joystickThumb = this.add.image(100, this.cameras.main.height - 100, 'joystick-thumb');
            this.joystickThumb.setScrollFactor(0);
            this.joystickThumb.setDepth(1001);

            // Attack button
            this.attackButton = this.add.image(this.cameras.main.width - 80, this.cameras.main.height - 100, 'attack-button');
            this.attackButton.setScrollFactor(0);
            this.attackButton.setDepth(1000);
            this.attackButton.setInteractive();
            this.attackButton.setAlpha(0.8);

            this.attackButton.on('pointerdown', () => {
                this.performAttack();
            });
        }
    }

    startGameTimer() {
        this.gameTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                if (this.timeLeft <= 0) {
                    this.gameOver = true;
                    this.scene.start('ResultsScene', { score: this.score });
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    spawnEnemyNearPlayer() {
        if (this.gameOver) return;

        // Spawn enemy at random position around player
        const angle = Math.random() * Math.PI * 2;
        const distance = Phaser.Math.Between(300, 500);
        const x = this.player.x + Math.cos(angle) * distance;
        const y = this.player.y + Math.sin(angle) * distance;

        // Make sure it's within world bounds
        const clampedX = Phaser.Math.Clamp(x, 50, this.worldSize - 50);
        const clampedY = Phaser.Math.Clamp(y, 50, this.worldSize - 50);

        const enemy = this.physics.add.sprite(clampedX, clampedY, 'enemy');
        enemy.setCollideWorldBounds(true);
        enemy.setSize(24, 24);
        enemy.health = 30;
        enemy.setTint(0x8B0000);
        this.enemies.add(enemy);
    }

    createAtmosphereEffects() {
        // Add floating dust particles
        this.time.addEvent({
            delay: 2000,
            callback: () => {
                if (this.gameOver) return;
                
                const dust = this.add.particles(
                    this.player.x + Phaser.Math.Between(-400, 400),
                    this.player.y + Phaser.Math.Between(-300, 300),
                    'spark',
                    {
                        speed: { min: 10, max: 30 },
                        scale: { start: 0.2, end: 0 },
                        alpha: { start: 0.4, end: 0 },
                        lifespan: 3000,
                        quantity: 5
                    }
                );
                
                this.time.delayedCall(3000, () => dust.destroy());
            },
            callbackScope: this,
            loop: true
        });
    }

    performAttack() {
        if (!this.canAttack || this.gameOver) return;

        this.canAttack = false;
        
        // Find enemies within attack range
        const attackRange = 80;
        this.enemies.children.entries.forEach(enemy => {
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y, enemy.x, enemy.y
            );
            
            if (distance <= attackRange) {
                // Damage enemy
                enemy.health -= 20;
                
                // Blood effect
                this.bloodParticles.emitParticleAt(enemy.x, enemy.y, 10);
                
                // Screen shake
                this.cameras.main.shake(200, 0.01);
                
                if (enemy.health <= 0) {
                    // Enemy defeated
                    this.score += 10;
                    enemy.destroy();
                }
            }
        });

        // Attack cooldown
        this.time.delayedCall(this.attackCooldown, () => {
            this.canAttack = true;
        });
    }

    playerHitEnemy(player, enemy) {
        if (this.gameOver) return;

        // Player takes damage when hitting enemy
        this.bloodParticles.emitParticleAt(player.x, player.y, 5);
        
        // Screen flash red
        this.cameras.main.flash(200, 255, 0, 0, false);
        
        // Screen shake
        this.cameras.main.shake(300, 0.02);
        
        // Push player back
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
        player.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);
        
        // Reduce score for getting hit
        this.score = Math.max(0, this.score - 5);
    }
}
