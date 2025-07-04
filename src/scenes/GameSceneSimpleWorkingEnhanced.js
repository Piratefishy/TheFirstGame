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
        
        // Handle movement (keyboard + touch)
        this.handleMovement();
        
        // Handle attacking
        this.handleAttack();
        
        // Update wave system
        this.updateWaveSystem();
        
        // Update UI
        this.updateUI();
        
        // Enhanced enemy AI
        this.updateEnemyAI();
        
        // Clean up projectiles that are off screen
        this.projectiles.children.entries.forEach(projectile => {
            if (projectile.active && (projectile.x < -100 || projectile.x > this.cameras.main.width + 100 || 
                                     projectile.y < -100 || projectile.y > this.cameras.main.height + 100)) {
                projectile.destroy();
            }
        });
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

    createProfessionalUI() {
        const { width, height } = this.cameras.main;
        
        // Create professional background panel
        const uiPanel = ProfessionalUI.createGlassCard(this, 280, 120);
        uiPanel.setPosition(16, 16);
        uiPanel.setScrollFactor(0);
        uiPanel.setDepth(100);
        
        // Health bar with professional styling
        this.hpBarBg = this.add.graphics();
        this.hpBarBg.fillStyle(0x000000, 0.8);
        this.hpBarBg.fillRoundedRect(0, 0, 200, 20, 5);
        this.hpBarBg.setPosition(30, 30);
        this.hpBarBg.setScrollFactor(0);
        this.hpBarBg.setDepth(101);
        
        this.hpBarFill = this.add.graphics();
        this.hpBarFill.fillStyle(0x00FF00);
        this.hpBarFill.fillRoundedRect(0, 0, 190, 16, 3);
        this.hpBarFill.setPosition(32, 32);
        this.hpBarFill.setScrollFactor(0);
        this.hpBarFill.setDepth(102);
        
        // Professional text styling
        this.hpText = ProfessionalUI.createProfessionalText(this, 135, 42, '', {
            fontSize: '14px',
            fill: '#FFFFFF',
            glow: '#00FF00'
        });
        this.hpText.setOrigin(0.5, 0.5);
        this.hpText.setScrollFactor(0);
        this.hpText.setDepth(103);
        
        // Class and wave info
        this.classText = ProfessionalUI.createProfessionalText(this, 30, 60, '', {
            fontSize: '12px',
            fill: '#FFD700',
            glow: '#FF8C00'
        });
        this.classText.setScrollFactor(0);
        this.classText.setDepth(103);
        
        this.waveText = ProfessionalUI.createProfessionalText(this, 30, 80, '', {
            fontSize: '12px',
            fill: '#87CEEB',
            glow: '#4682B4'
        });
        this.waveText.setScrollFactor(0);
        this.waveText.setDepth(103);
        
        this.scoreText = ProfessionalUI.createProfessionalText(this, 30, 100, '', {
            fontSize: '12px',
            fill: '#98FB98',
            glow: '#00FF00'
        });
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(103);
        
        // Mobile control instructions
        this.add.text(16, height - 60, 'PC: WASD/Arrows + SPACE | Mobile: Touch & Drag', {
            fontSize: '12px',
            fill: '#CCCCCC',
            fontFamily: 'Arial'
        }).setScrollFactor(0).setDepth(100);
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
        
        if ((this.spaceKey.isDown || this.input.activePointer.isDown) && 
            now - this.lastAttackTime > attackCooldown) {
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
        for (let i = 0; i < this.enemiesInWave; i++) {
            // Spawn enemies at random positions around the player
            const angle = (i / this.enemiesInWave) * Math.PI * 2;
            const distance = 200 + Math.random() * 300;
            const x = this.player.x + Math.cos(angle) * distance;
            const y = this.player.y + Math.sin(angle) * distance;
            
            const enemy = this.physics.add.sprite(x, y, 'enemy_sprite');
            enemy.hp = 50 + (this.currentWave * 10); // Increase HP with waves
            enemy.maxHp = enemy.hp;
            enemy.damage = 15 + (this.currentWave * 5); // Increase damage with waves
            enemy.speed = 50 + (this.currentWave * 5); // Increase speed with waves
            enemy.setCollideWorldBounds(true);
            enemy.setDepth(5);
            
            this.enemies.add(enemy);
        }
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
        
        // Update HP bar width
        const hpPercentage = this.player.hp / this.player.maxHp;
        this.hpBarFill.clear();
        
        // Color based on HP percentage
        let barColor = 0x00FF00; // Green
        if (hpPercentage < 0.5) barColor = 0xFFFF00; // Yellow
        if (hpPercentage < 0.25) barColor = 0xFF0000; // Red
        
        this.hpBarFill.fillStyle(barColor);
        this.hpBarFill.fillRoundedRect(0, 0, 190 * hpPercentage, 16, 3);
        
        // Update other UI elements
        this.classText.setText(`${this.selectedClass.toUpperCase()} WARRIOR`);
        this.waveText.setText(`WAVE: ${this.currentWave}`);
        this.scoreText.setText(`SCORE: ${this.score}`);
    }

    updateEnemyAI() {
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.active) {
                const distanceToPlayer = Phaser.Math.Distance.Between(
                    enemy.x, enemy.y,
                    this.player.x, this.player.y
                );
                
                if (distanceToPlayer > 30) {
                    // Move towards player with some randomness
                    const angle = Phaser.Math.Angle.Between(
                        enemy.x, enemy.y,
                        this.player.x, this.player.y
                    );
                    
                    // Add some random variation to make AI less predictable
                    const randomAngle = angle + (Math.random() - 0.5) * 0.5;
                    
                    enemy.setVelocity(
                        Math.cos(randomAngle) * enemy.speed,
                        Math.sin(randomAngle) * enemy.speed
                    );
                } else {
                    // Stop when close to player
                    enemy.setVelocity(0, 0);
                }
            }
        });
    }

    createMobileControls() {
        // Touch controls for mobile
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
        
        // Restart instruction
        const restartText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 80,
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
        
        // Add restart controls
        this.input.keyboard.once('keydown-R', () => {
            this.scene.restart();
        });
        
        this.input.keyboard.once('keydown-ESC', () => {
            this.scene.start('CharacterSelectionScene');
        });
    }
}
