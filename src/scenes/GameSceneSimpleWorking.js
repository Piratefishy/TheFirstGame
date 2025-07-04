import { ProfessionalUI } from '../utils/ProfessionalUI.js';

export class GameSceneSimpleWorking extends Phaser.Scene {
    constructor() {
        super({ key: 'GameSceneSimpleWorking' });
        this.player = null;
        this.enemies = null;
        this.cursors = null;
        this.projectiles = null;
        this.score = 0;
        this.gameOver = false;
        
        // Wave system for progressive difficulty
        this.currentWave = 1;
        this.enemiesInWave = 5;
        this.enemiesKilledInWave = 0;
        this.waveStartTime = 0;
        this.waveInProgress = false;
        
        // Touch controls
        this.touchStart = null;
        this.touchDirection = null;
        
        // Mobile-specific controls
        this.mobileAttackPressed = false;
        this.movementPointerId = null;
        this.mobileElements = null;
        this.lowHealthWarning = null;
        
        // Combat system
        this.lastAttackTime = 0;
        this.attackCooldown = 500;
    }

    init(data) {
        console.log('GameSceneSimpleWorking: init() called with data:', data);
        this.sceneData = data;
        this.selectedClass = data?.selectedClass || 'archer';
        this.selectedWeapon = data?.selectedWeapon || 'bow';
    }

    preload() {
        console.log('GameSceneSimpleWorking: preload()');
        
        // Create professional character sprites
        this.createCharacterSprites();
        
        // Create weapon and effect sprites
        this.createWeaponSprites();
        
        // Create UI elements
        this.createUISprites();
    }

    createCharacterSprites() {
        // Player sprites based on class
        const playerColors = {
            archer: { main: 0x228B22, accent: 0x32CD32 },
            swordsman: { main: 0x4169E1, accent: 0x6495ED },
            dual_wielder: { main: 0xFF6347, accent: 0xFF7F50 },
            shield_warrior: { main: 0x2F4F4F, accent: 0x708090 },
            axeman: { main: 0x8B4513, accent: 0xCD853F },
            dual_axe: { main: 0x800080, accent: 0x9370DB },
            berserker: { main: 0x8B0000, accent: 0xFF0000 },
            assassin: { main: 0x2F2F2F, accent: 0x696969 },
            tank: { main: 0x556B2F, accent: 0x9ACD32 }
        };

        const colors = playerColors[this.selectedClass] || playerColors.archer;
        
        // Create player sprite
        const playerGraphics = this.add.graphics();
        playerGraphics.fillStyle(colors.main);
        playerGraphics.fillCircle(16, 16, 14);
        playerGraphics.fillStyle(colors.accent);
        playerGraphics.fillCircle(16, 16, 10);
        playerGraphics.fillStyle(0xFFFFFF);
        playerGraphics.fillCircle(16, 12, 3); // Eyes
        playerGraphics.fillCircle(16, 20, 2); // Mouth
        playerGraphics.generateTexture('player_sprite', 32, 32);
        playerGraphics.destroy();

        // Create enemy sprites
        const enemyGraphics = this.add.graphics();
        enemyGraphics.fillStyle(0x8B0000);
        enemyGraphics.fillCircle(12, 12, 10);
        enemyGraphics.fillStyle(0xFF0000);
        enemyGraphics.fillCircle(12, 12, 7);
        enemyGraphics.fillStyle(0xFFFF00);
        enemyGraphics.fillCircle(12, 9, 2); // Evil eyes
        enemyGraphics.fillCircle(12, 15, 1); // Mouth
        enemyGraphics.generateTexture('enemy_sprite', 24, 24);
        enemyGraphics.destroy();
    }

    createWeaponSprites() {
        // Simple projectile sprite
        const projectileGraphics = this.add.graphics();
        projectileGraphics.fillStyle(0xFFD700);
        projectileGraphics.fillCircle(4, 4, 3);
        projectileGraphics.generateTexture('projectile', 8, 8);
        projectileGraphics.destroy();
    }

    createUISprites() {
        // Health bar background
        const hpBgGraphics = this.add.graphics();
        hpBgGraphics.fillStyle(0x000000, 0.7);
        hpBgGraphics.fillRoundedRect(0, 0, 200, 30, 5);
        hpBgGraphics.generateTexture('hp_bg', 200, 30);
        hpBgGraphics.destroy();

        // Health bar fill
        const hpFillGraphics = this.add.graphics();
        hpFillGraphics.fillStyle(0x00FF00);
        hpFillGraphics.fillRoundedRect(0, 0, 190, 20, 3);
        hpFillGraphics.generateTexture('hp_fill', 190, 20);
        hpFillGraphics.destroy();
    }

    create() {
        console.log('GameSceneSimpleWorking: create() started');
        
        try {
            const { width, height } = this.cameras.main;
            
            // Simple background with better graphics
            this.cameras.main.setBackgroundColor('#2d5016');
            
            // Add battlefield texture
            const bg = this.add.graphics();
            bg.fillStyle(0x2d5016);
            bg.fillRect(0, 0, width, height);
            
            // Add some grass texture
            for (let i = 0; i < 100; i++) {
                const x = Phaser.Math.Between(0, width);
                const y = Phaser.Math.Between(0, height);
                bg.fillStyle(0x228B22, 0.3);
                bg.fillCircle(x, y, Phaser.Math.Between(2, 5));
            }
            
            // Create player with new sprite
            this.player = this.physics.add.sprite(width/2, height/2, 'player_sprite');
            this.player.setCollideWorldBounds(true);
            this.player.body.setSize(28, 28);
            
            // Player stats based on selected class
            const playerStats = this.getPlayerStats(this.selectedClass);
            this.player.hp = playerStats.hp;
            this.player.maxHp = playerStats.hp;
            this.player.damage = playerStats.damage;
            this.player.speed = playerStats.speed;
            this.player.attackRange = playerStats.attackRange;
            this.player.attackSpeed = playerStats.attackSpeed;
            
            // Camera follow player
            this.cameras.main.startFollow(this.player);
            
            // Create enemies group
            this.enemies = this.physics.add.group();
            
            // Create projectiles group
            this.projectiles = this.physics.add.group();
            
            // Initialize wave system
            this.waveStartTime = this.time.now;
            this.waveInProgress = true;
            this.spawnWaveEnemies();
            
            // Controls
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasd = this.input.keyboard.addKeys('W,S,A,D');
            this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
            
            // Touch controls for mobile
            this.createMobileControls();
            
            // Combat systems
            this.physics.add.overlap(this.player, this.enemies, this.playerHitEnemy, null, this);
            this.physics.add.overlap(this.projectiles, this.enemies, this.projectileHitEnemy, null, this);
            
            // Enhanced UI with professional styling
            this.createProfessionalUI();
            
            console.log('✅ GameSceneSimpleWorking: Created successfully!');
            
        } catch (error) {
            console.error('❌ ERROR in GameSceneSimpleWorking:', error);
            
            // Show error
            this.add.text(400, 300, 'SIMPLE GAME ERROR: ' + error.message, {
                fontSize: '16px',
                fill: '#FF0000'
            }).setOrigin(0.5);
        }
    }

    update() {
        if (!this.player || !this.player.active || this.gameOver) return;
        
        // Performance optimization: batch operations
        const now = this.time.now;
        
        // Handle movement (keyboard + touch)
        this.handleMovement();
        
        // Handle attacking
        this.handleAttack();
        
        // Update wave system (less frequent)
        if (now % 100 === 0) { // Check every 100ms instead of every frame
            this.updateWaveSystem();
        }
        
        // Update UI (less frequent for performance)
        if (now % 200 === 0) { // Update UI every 200ms
            this.updateUI();
        }
        
        // Enhanced enemy AI (optimized)
        this.updateEnemyAI();
        
        // Optimized projectile cleanup
        this.cleanupProjectiles();
    }

    cleanupProjectiles() {
        // Performance: cleanup in batches
        const { width, height } = this.cameras.main;
        const projectilesToDestroy = [];
        
        this.projectiles.children.entries.forEach(projectile => {
            if (projectile.active && 
                (projectile.x < -100 || projectile.x > width + 100 || 
                 projectile.y < -100 || projectile.y > height + 100)) {
                projectilesToDestroy.push(projectile);
            }
        });
        
        // Batch destroy for performance
        projectilesToDestroy.forEach(p => p.destroy());
    }

    getPlayerStats(className) {
        const stats = {
            archer: { hp: 80, damage: 25, speed: 120, attackRange: 200, attackSpeed: 1.5 },
            swordsman: { hp: 120, damage: 35, speed: 100, attackRange: 60, attackSpeed: 1.0 },
            dual_wielder: { hp: 100, damage: 30, speed: 110, attackRange: 50, attackSpeed: 2.0 },
            shield_warrior: { hp: 150, damage: 20, speed: 80, attackRange: 45, attackSpeed: 0.8 },
            axeman: { hp: 120, damage: 40, speed: 90, attackRange: 70, attackSpeed: 1.2 },
            dual_axe: { hp: 110, damage: 35, speed: 105, attackRange: 65, attackSpeed: 1.8 },
            berserker: { hp: 140, damage: 45, speed: 130, attackRange: 80, attackSpeed: 2.5 },
            assassin: { hp: 70, damage: 50, speed: 150, attackRange: 40, attackSpeed: 3.0 },
            tank: { hp: 200, damage: 30, speed: 60, attackRange: 50, attackSpeed: 0.6 }
        };
        
        return stats[className] || stats.archer;
    }

    createEnhancedUI() {
        // Use ProfessionalUI for better styling
        this.createProfessionalUI();
    }

    createProfessionalUI() {
        const { width, height } = this.cameras.main;
        
        // Mobile detection for adaptive UI
        const isMobile = width < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Adaptive sizing for mobile
        const uiScale = isMobile ? 1.4 : 1.0;
        const panelWidth = isMobile ? Math.min(350, width - 32) : 280;
        const panelHeight = isMobile ? 140 : 120;
        
        // Create professional background panel
        const uiPanel = ProfessionalUI.createGlassCard(this, panelWidth, panelHeight);
        uiPanel.setPosition(16, 16);
        uiPanel.setScrollFactor(0);
        uiPanel.setDepth(100);
        
        // Health bar with mobile-friendly sizing
        const hpBarWidth = isMobile ? Math.min(280, width - 80) : 200;
        const hpBarHeight = isMobile ? 28 : 20;
        
        this.hpBarBg = this.add.graphics();
        this.hpBarBg.fillStyle(0x000000, 0.8);
        this.hpBarBg.fillRoundedRect(0, 0, hpBarWidth, hpBarHeight, 5);
        this.hpBarBg.setPosition(30, 30);
        this.hpBarBg.setScrollFactor(0);
        this.hpBarBg.setDepth(101);
        
        this.hpBarFill = this.add.graphics();
        this.hpBarFill.fillStyle(0x00FF00);
        this.hpBarFill.fillRoundedRect(0, 0, hpBarWidth - 10, hpBarHeight - 8, 3);
        this.hpBarFill.setPosition(35, 34);
        this.hpBarFill.setScrollFactor(0);
        this.hpBarFill.setDepth(102);
        
        // Professional text styling with mobile optimization
        const textSize = isMobile ? 16 : 14;
        this.hpText = ProfessionalUI.createProfessionalText(this, 30 + hpBarWidth/2, 44, '', {
            fontSize: textSize + 'px',
            fill: '#FFFFFF',
            glow: '#00FF00'
        });
        this.hpText.setOrigin(0.5, 0.5);
        this.hpText.setScrollFactor(0);
        this.hpText.setDepth(103);
        
        // Class and wave info with larger mobile text
        const infoSize = isMobile ? 14 : 12;
        const infoSpacing = isMobile ? 25 : 20;
        
        this.classText = ProfessionalUI.createProfessionalText(this, 30, 30 + hpBarHeight + 15, '', {
            fontSize: infoSize + 'px',
            fill: '#FFD700',
            glow: '#FF8C00'
        });
        this.classText.setScrollFactor(0);
        this.classText.setDepth(103);
        
        this.waveText = ProfessionalUI.createProfessionalText(this, 30, 30 + hpBarHeight + 15 + infoSpacing, '', {
            fontSize: infoSize + 'px',
            fill: '#87CEEB',
            glow: '#4682B4'
        });
        this.waveText.setScrollFactor(0);
        this.waveText.setDepth(103);
        
        this.scoreText = ProfessionalUI.createProfessionalText(this, 30, 30 + hpBarHeight + 15 + (infoSpacing * 2), '', {
            fontSize: infoSize + 'px',
            fill: '#98FB98',
            glow: '#00FF00'
        });
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(103);
        
        // Mobile control instructions - better positioned
        const controlsY = isMobile ? height - 140 : height - 60;
        const controlsSize = isMobile ? 14 : 12;
        this.add.text(16, controlsY, isMobile ? 'Touch & Drag to Move | Tap Attack Button' : 'PC: WASD/Arrows + SPACE | Mobile: Touch & Drag', {
            fontSize: controlsSize + 'px',
            fill: '#CCCCCC',
            fontFamily: 'Arial'
        }).setScrollFactor(0).setDepth(100);
        
        // Add mobile-specific controls
        if (isMobile) {
            this.createMobileHUD();
        }
    }

    createMobileHUD() {
        const { width, height } = this.cameras.main;
        
        // Virtual joystick area indicator (left side)
        const joystickRadius = 60;
        const joystickX = 80;
        const joystickY = height - 80;
        
        // Joystick background
        const joystickBg = this.add.graphics();
        joystickBg.fillStyle(0x000000, 0.3);
        joystickBg.fillCircle(joystickX, joystickY, joystickRadius);
        joystickBg.lineStyle(3, 0xFFFFFF, 0.5);
        joystickBg.strokeCircle(joystickX, joystickY, joystickRadius);
        joystickBg.setScrollFactor(0);
        joystickBg.setDepth(90);
        
        // Joystick center dot
        const joystickCenter = this.add.graphics();
        joystickCenter.fillStyle(0xFFFFFF, 0.7);
        joystickCenter.fillCircle(joystickX, joystickY, 10);
        joystickCenter.setScrollFactor(0);
        joystickCenter.setDepth(91);
        
        // Attack button (right side)
        const attackRadius = 55;
        const attackX = width - 80;
        const attackY = height - 80;
        
        const attackButton = this.add.graphics();
        attackButton.fillStyle(0xFF6B35, 0.8);
        attackButton.fillCircle(attackX, attackY, attackRadius);
        attackButton.lineStyle(4, 0xFFD700, 1);
        attackButton.strokeCircle(attackX, attackY, attackRadius);
        attackButton.setScrollFactor(0);
        attackButton.setDepth(90);
        attackButton.setInteractive(new Phaser.Geom.Circle(attackX, attackY, attackRadius), Phaser.Geom.Circle.Contains);
        
        // Attack button text
        const attackText = this.add.text(attackX, attackY, '⚔️', {
            fontSize: '32px',
            fill: '#FFFFFF'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(91);
        
        // Mobile attack functionality
        this.mobileAttackPressed = false;
        
        attackButton.on('pointerdown', () => {
            this.mobileAttackPressed = true;
            attackButton.setTint(0x00FF00);
            attackText.setScale(1.2);
            
            // Haptic feedback simulation
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        });
        
        attackButton.on('pointerup', () => {
            this.mobileAttackPressed = false;
            attackButton.clearTint();
            attackText.setScale(1.0);
        });
        
        // Store mobile elements for cleanup
        this.mobileElements = {
            joystickBg,
            joystickCenter,
            attackButton,
            attackText
        };
    }

    handleMovement() {
        this.player.setVelocity(0);
        
        let moveX = 0;
        let moveY = 0;
        
        // Keyboard controls
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            moveX = -1;
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            moveX = 1;
        }
        
        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            moveY = -1;
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            moveY = 1;
        }
        
        // Touch controls
        if (this.touchDirection) {
            const magnitude = Math.sqrt(this.touchDirection.x * this.touchDirection.x + this.touchDirection.y * this.touchDirection.y);
            if (magnitude > 20) {
                moveX = this.touchDirection.x / magnitude;
                moveY = this.touchDirection.y / magnitude;
            }
        }
        
        // Apply movement
        if (moveX !== 0 || moveY !== 0) {
            this.player.setVelocityX(moveX * this.player.speed);
            this.player.setVelocityY(moveY * this.player.speed);
        }
    }

    handleAttack() {
        const now = this.time.now;
        const attackCooldown = Math.floor(1000 / this.player.attackSpeed);
        
        // Check for attack input (keyboard, mouse, or mobile button)
        const shouldAttack = this.spaceKey.isDown || 
                           this.input.activePointer.isDown || 
                           this.mobileAttackPressed;
        
        if (shouldAttack && now - this.lastAttackTime > attackCooldown) {
            this.lastAttackTime = now;
            this.performAttack();
        }
    }

    performAttack() {
        // Find nearest enemy within attack range
        let nearestEnemy = null;
        let nearestDistance = this.player.attackRange;
        
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.active) {
                const distance = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y,
                    enemy.x, enemy.y
                );
                
                if (distance < nearestDistance) {
                    nearestEnemy = enemy;
                    nearestDistance = distance;
                }
            }
        });
        
        if (nearestEnemy) {
            // Create projectile towards enemy
            const projectile = this.physics.add.sprite(this.player.x, this.player.y, 'projectile');
            projectile.setDepth(10);
            projectile.damage = this.player.damage;
            
            // Calculate direction and velocity
            const angle = Phaser.Math.Angle.Between(
                this.player.x, this.player.y,
                nearestEnemy.x, nearestEnemy.y
            );
            
            const speed = 300;
            projectile.setVelocity(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed
            );
            
            this.projectiles.add(projectile);
            
            // Add visual effect
            this.createAttackEffect(this.player.x, this.player.y);
        }
    }

    createAttackEffect(x, y) {
        // Simple attack effect
        const effect = this.add.graphics();
        effect.fillStyle(0xFFFF00, 0.8);
        effect.fillCircle(x, y, 15);
        effect.setDepth(15);
        
        // Fade out effect
        this.tweens.add({
            targets: effect,
            alpha: 0,
            scale: 2,
            duration: 200,
            ease: 'Power2',
            onComplete: () => effect.destroy()
        });
    }

    updateWaveSystem() {
        if (!this.waveInProgress) return;
        
        // Check if all enemies in current wave are defeated
        const aliveEnemies = this.enemies.children.entries.filter(enemy => enemy.active);
        
        if (aliveEnemies.length === 0) {
            this.waveInProgress = false;
            this.currentWave++;
            this.enemiesInWave = Math.floor(this.currentWave * 1.5) + 3; // Progressive difficulty
            this.score += this.currentWave * 100;
            
            // Start next wave after a delay
            this.time.delayedCall(2000, () => {
                this.spawnWaveEnemies();
                this.waveInProgress = true;
            });
            
            // Show wave complete message
            this.showWaveCompleteMessage();
        }
    }

    spawnWaveEnemies() {
        // Performance: limit max enemies on screen for mobile
        const isMobile = this.cameras.main.width < 768;
        const maxEnemies = isMobile ? Math.min(this.enemiesInWave, 8) : this.enemiesInWave;
        
        for (let i = 0; i < maxEnemies; i++) {
            // Spawn enemies at optimized positions around the player
            const angle = (i / maxEnemies) * Math.PI * 2;
            const distance = 200 + Math.random() * 300;
            const x = this.player.x + Math.cos(angle) * distance;
            const y = this.player.y + Math.sin(angle) * distance;
            
            const enemy = this.physics.add.sprite(x, y, 'enemy_sprite');
            
            // Optimized enemy stats calculation
            const waveMultiplier = Math.min(this.currentWave, 10); // Cap growth for performance
            enemy.hp = 50 + (waveMultiplier * 10);
            enemy.maxHp = enemy.hp;
            enemy.damage = 15 + (waveMultiplier * 5);
            enemy.speed = Math.min(50 + (waveMultiplier * 5), 150); // Cap speed
            
            enemy.setCollideWorldBounds(true);
            enemy.setDepth(5);
            
            this.enemies.add(enemy);
        }
        
        console.log(`Wave ${this.currentWave}: Spawned ${maxEnemies} enemies (Mobile: ${isMobile})`);
    }

    showWaveCompleteMessage() {
        const message = ProfessionalUI.createProfessionalText(
            this, 
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2,
            `WAVE ${this.currentWave - 1} COMPLETE!`,
            {
                fontSize: '32px',
                fill: '#FFD700',
                glow: '#FF8C00'
            }
        );
        message.setOrigin(0.5);
        message.setScrollFactor(0);
        message.setDepth(200);
        
        // Animate message
        this.tweens.add({
            targets: message,
            alpha: 0,
            y: message.y - 50,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => message.destroy()
        });
    }

    updateUI() {
        // Update HP text and bar
        this.hpText.setText(`${this.player.hp}/${this.player.maxHp}`);
        
        // Update HP bar width with mobile consideration
        const hpPercentage = this.player.hp / this.player.maxHp;
        const isMobile = this.cameras.main.width < 768;
        const hpBarWidth = isMobile ? Math.min(280, this.cameras.main.width - 80) : 200;
        
        this.hpBarFill.clear();
        
        // Color based on HP percentage with smooth transitions
        let barColor = 0x00FF00; // Green
        if (hpPercentage < 0.6) barColor = 0x9ACD32; // Yellow-green
        if (hpPercentage < 0.4) barColor = 0xFFFF00; // Yellow
        if (hpPercentage < 0.2) barColor = 0xFF4500; // Orange-red
        if (hpPercentage < 0.1) barColor = 0xFF0000; // Red
        
        this.hpBarFill.fillStyle(barColor);
        this.hpBarFill.fillRoundedRect(0, 0, (hpBarWidth - 10) * hpPercentage, isMobile ? 20 : 16, 3);
        
        // Update other UI elements
        this.classText.setText(`${this.selectedClass.toUpperCase()} WARRIOR`);
        this.waveText.setText(`WAVE: ${this.currentWave}`);
        this.scoreText.setText(`SCORE: ${this.score}`);
        
        // Add low health warning for mobile
        if (isMobile && hpPercentage < 0.25 && !this.lowHealthWarning) {
            this.createLowHealthWarning();
        } else if (hpPercentage >= 0.25 && this.lowHealthWarning) {
            this.lowHealthWarning.destroy();
            this.lowHealthWarning = null;
        }
    }

    createLowHealthWarning() {
        const { width, height } = this.cameras.main;
        
        this.lowHealthWarning = this.add.text(width/2, height - 200, '⚠️ LOW HEALTH!', {
            fontSize: '20px',
            fill: '#FF0000',
            fontFamily: 'Arial Bold',
            stroke: '#FFFFFF',
            strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0).setDepth(150);
        
        // Pulsing effect
        this.tweens.add({
            targets: this.lowHealthWarning,
            alpha: 0.3,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    updateEnemyAI() {
        // Performance optimization: only update active enemies
        const activeEnemies = this.enemies.children.entries.filter(enemy => enemy.active);
        
        // Limit AI updates for performance on mobile
        const maxEnemiesPerFrame = activeEnemies.length > 10 ? 5 : activeEnemies.length;
        
        for (let i = 0; i < Math.min(maxEnemiesPerFrame, activeEnemies.length); i++) {
            const enemy = activeEnemies[i];
            
            // Cache distance calculation
            const distanceToPlayer = Phaser.Math.Distance.Between(
                enemy.x, enemy.y,
                this.player.x, this.player.y
            );
            
            if (distanceToPlayer > 30) {
                // More efficient movement calculation
                const moveSpeed = enemy.speed || 50;
                
                if (distanceToPlayer < 200) {
                    // Direct movement when close
                    this.physics.moveToObject(enemy, this.player, moveSpeed);
                } else {
                    // Optimized movement with less calculation when far
                    const angle = Phaser.Math.Angle.Between(
                        enemy.x, enemy.y,
                        this.player.x, this.player.y
                    );
                    
                    enemy.setVelocity(
                        Math.cos(angle) * moveSpeed * 0.8, // Slightly slower when far
                        Math.sin(angle) * moveSpeed * 0.8
                    );
                }
            } else {
                // Stop when close to player
                enemy.setVelocity(0, 0);
            }
        }
    }

    createMobileControls() {
        // Enhanced touch controls for mobile
        const isMobile = this.cameras.main.width < 768;
        
        if (!isMobile) {
            // Simple touch controls for desktop/tablet
            this.input.on('pointerdown', (pointer) => {
                this.touchStart = { x: pointer.x, y: pointer.y };
            });

            this.input.on('pointermove', (pointer) => {
                if (this.touchStart && pointer.isDown) {
                    const deltaX = pointer.x - this.touchStart.x;
                    const deltaY = pointer.y - this.touchStart.y;
                    
                    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
                        this.touchDirection = { x: deltaX, y: deltaY };
                    }
                }
            });

            this.input.on('pointerup', () => {
                this.touchStart = null;
                this.touchDirection = null;
            });
        } else {
            // Advanced mobile touch controls with zones
            const { width, height } = this.cameras.main;
            const leftZone = width * 0.4;
            const rightZone = width * 0.6;
            
            this.input.on('pointerdown', (pointer) => {
                if (pointer.x < leftZone) {
                    // Left side - movement control
                    this.touchStart = { x: pointer.x, y: pointer.y };
                    this.movementPointerId = pointer.id;
                } else if (pointer.x > rightZone && pointer.y > height * 0.5) {
                    // Right side bottom - attack (handled by attack button)
                    // This is handled by the attack button
                }
            });

            this.input.on('pointermove', (pointer) => {
                if (this.touchStart && pointer.id === this.movementPointerId && pointer.isDown) {
                    const deltaX = pointer.x - this.touchStart.x;
                    const deltaY = pointer.y - this.touchStart.y;
                    
                    // More sensitive movement for mobile
                    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                        this.touchDirection = { x: deltaX * 1.2, y: deltaY * 1.2 };
                        
                        // Visual feedback for movement
                        if (this.mobileElements && this.mobileElements.joystickCenter) {
                            const maxDistance = 30;
                            const distance = Math.min(maxDistance, Math.sqrt(deltaX * deltaX + deltaY * deltaY) * 0.5);
                            const angle = Math.atan2(deltaY, deltaX);
                            
                            this.mobileElements.joystickCenter.x = 80 + Math.cos(angle) * distance;
                            this.mobileElements.joystickCenter.y = height - 80 + Math.sin(angle) * distance;
                        }
                    }
                }
            });

            this.input.on('pointerup', (pointer) => {
                if (pointer.id === this.movementPointerId) {
                    this.touchStart = null;
                    this.touchDirection = null;
                    this.movementPointerId = null;
                    
                    // Reset joystick visual
                    if (this.mobileElements && this.mobileElements.joystickCenter) {
                        this.mobileElements.joystickCenter.x = 80;
                        this.mobileElements.joystickCenter.y = height - 80;
                    }
                }
            });
        }
    }

    playerHitEnemy(player, enemy) {
        // Player takes damage
        player.hp -= enemy.damage;
        
        // Visual feedback
        player.setTint(0xff0000);
        this.time.delayedCall(100, () => {
            if (player.active) player.clearTint();
        });
        
        // Check if player died
        if (player.hp <= 0) {
            this.gameOver = true;
            this.showGameOverScreen();
        }
    }

    projectileHitEnemy(projectile, enemy) {
        // Damage enemy
        enemy.hp -= projectile.damage;
        
        // Visual feedback
        enemy.setTint(0xff0000);
        this.time.delayedCall(150, () => {
            if (enemy.active) enemy.clearTint();
        });
        
        // Destroy projectile
        projectile.destroy();
        
        // Check if enemy died
        if (enemy.hp <= 0) {
            enemy.destroy();
            this.score += 10;
            
            // Add death effect
            this.createDeathEffect(enemy.x, enemy.y);
        }
    }

    createDeathEffect(x, y) {
        // Create explosion effect
        const explosion = this.add.graphics();
        explosion.fillStyle(0xFF4500, 0.8);
        explosion.fillCircle(x, y, 20);
        explosion.setDepth(15);
        
        // Animate explosion
        this.tweens.add({
            targets: explosion,
            alpha: 0,
            scale: 2,
            duration: 300,
            ease: 'Power2',
            onComplete: () => explosion.destroy()
        });
        
        // Add sparks
        for (let i = 0; i < 8; i++) {
            const spark = this.add.graphics();
            spark.fillStyle(0xFFD700, 0.9);
            spark.fillCircle(x, y, 3);
            spark.setDepth(16);
            
            const angle = (i / 8) * Math.PI * 2;
            const distance = 50;
            
            this.tweens.add({
                targets: spark,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: 0,
                scale: 0.5,
                duration: 400,
                ease: 'Power2',
                onComplete: () => spark.destroy()
            });
        }
    }

    showGameOverScreen() {
        // Create game over overlay
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.8);
        overlay.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
        overlay.setScrollFactor(0);
        overlay.setDepth(300);
        
        // Game over text
        const gameOverText = ProfessionalUI.createProfessionalText(
            this,
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 50,
            'GAME OVER',
            {
                fontSize: '48px',
                fill: '#FF0000',
                glow: '#8B0000'
            }
        );
        gameOverText.setOrigin(0.5);
        gameOverText.setScrollFactor(0);
        gameOverText.setDepth(301);
        
        // Final score
        const finalScoreText = ProfessionalUI.createProfessionalText(
            this,
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 20,
            `Final Score: ${this.score}`,
            {
                fontSize: '24px',
                fill: '#FFD700',
                glow: '#FF8C00'
            }
        );
        finalScoreText.setOrigin(0.5);
        finalScoreText.setScrollFactor(0);
        finalScoreText.setDepth(301);
        
        // Wave reached
        const waveText = ProfessionalUI.createProfessionalText(
            this,
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 60,
            `Wave Reached: ${this.currentWave}`,
            {
                fontSize: '20px',
                fill: '#87CEEB',
                glow: '#4682B4'
            }
        );
        waveText.setOrigin(0.5);
        waveText.setScrollFactor(0);
        waveText.setDepth(301);
        
        // Restart instruction
        const restartText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 120,
            'Press R to restart or ESC to return to menu',
            {
                fontSize: '16px',
                fill: '#FFFFFF',
                fontFamily: 'Arial'
            }
        );
        restartText.setOrigin(0.5);
        restartText.setScrollFactor(0);
        restartText.setDepth(301);
        
        // Mobile restart button
        const restartButton = ProfessionalUI.createGlassCard(this, 200, 50);
        restartButton.setPosition(this.cameras.main.width / 2 - 100, this.cameras.main.height / 2 + 160);
        restartButton.setScrollFactor(0);
        restartButton.setDepth(301);
        restartButton.setInteractive();
        
        const restartButtonText = ProfessionalUI.createProfessionalText(
            this,
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 185,
            'RESTART',
            {
                fontSize: '18px',
                fill: '#FFFFFF',
                glow: '#00FF00'
            }
        );
        restartButtonText.setOrigin(0.5);
        restartButtonText.setScrollFactor(0);
        restartButtonText.setDepth(302);
        
        // Add restart controls
        this.input.keyboard.once('keydown-R', () => {
            this.scene.restart();
        });
        
        this.input.keyboard.once('keydown-ESC', () => {
            this.scene.start('CharacterSelectionScene');
        });
        
        // Mobile restart
        restartButton.on('pointerdown', () => {
            this.scene.restart();
        });
    }
}
