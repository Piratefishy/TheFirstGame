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
        // Create ultra-detailed animated warrior sprites
        this.createAnimatedVikingSprite('player', 40, 40, 0x4169E1, true);
        this.createAnimatedVikingSprite('enemy', 36, 36, 0x8B0000, false);
        this.createAnimatedVikingSprite('evil_warrior', 36, 36, 0x8B0000, false);
        this.createAnimatedVikingSprite('good_warrior', 36, 36, 0x228B22, false);
        this.createAnimatedVikingSprite('elite_warrior', 38, 38, 0x4B0082, false);
        
        // Realistic weapons with shine effects
        this.createRealisticSwordSprite('sword', 24, 12, 0xFFD700, 0xFFFFFF);
        this.createRealisticSwordSprite('sword_evil', 26, 12, 0x8B0000, 0x696969);
        this.createRealisticAxeSprite('battleaxe', 24, 18, 0x8B4513, 0xC0C0C0);
        this.createRealisticShieldSprite('viking_shield', 32, 32, 0xFFD700, 0x8B0000);
        
        // Intense particle effects
        this.createBloodSplatterSprite('blood', 12, 12, 0x8b0000);
        this.createExplosionSprite('explosion', 32, 32);
        this.createLightningSprite('lightning', 16, 64);
        this.createFireballSprite('fireball', 20, 20);
        this.createSmokeCloudSprite('smoke', 24, 24);
        this.createSparkShowerSprite('spark', 8, 8);
        
        // Enhanced combat effects
        this.createEpicSlashEffect('slash_effect', 80, 80);
        this.createEpicRageAura('rage_aura', 120, 120);
        this.createImpactRing('impact_ring', 60, 60);
        
        // Battlefield environmental effects
        this.createBattlefieldGrass('battlefield_grass', 64, 64);
        this.createMuddyGround('muddy_ground', 64, 64);
        this.createCraterTexture('crater', 48, 48);
        this.createCorpseTexture('corpse', 32, 24);
        
        // Weather and atmosphere
        this.createStormCloud('storm_cloud', 96, 32);
        this.createRainDropSprite('rain_drop', 4, 12);
        this.createAshParticleSprite('ash_particle', 6, 6);
        this.createWarFogSprite('war_fog', 60, 60);
        
        // Portal and energy effects
        this.createPortalVortexSprite('portal_vortex', 120, 120);
        this.createEnergyRingSprite('energy_ring', 80, 80);
        this.createPowerCoreSprite('power_core', 40, 40);
        this.createEnergyParticleSprite('energy_particle', 8, 8);
        
        // Mobile UI
        this.createRoundButton('joystick-base', 80, 0x34495e, 0.6);
        this.createRoundButton('joystick-thumb', 30, 0x4a90e2, 0.8);
        this.createRoundButton('attack-button', 60, 0xe74c3c, 0.8);
    }

    create() {
        const { width, height } = this.cameras.main;

        // Create infinite battlefield world (much larger than screen)
        this.worldSize = 2000; // 2000x2000 pixel battlefield
        this.physics.world.setBounds(0, 0, this.worldSize, this.worldSize);

        // Generate medieval battlefield terrain
        this.generateBattlefield();

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
        
        // Create ongoing NPC battles
        this.createNPCBattles();

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

        // === ANIMATED SPRITE SYSTEM ===
        this.setupAnimatedSprites();
        
        // === HEAVY ATMOSPHERIC EFFECTS ===
        this.setupHeavyAtmosphere();
        
        // === COMPLEX SPAWN PORTALS ===
        this.setupComplexSpawnPortals();
    }

    update() {
        if (this.gameOver) {
            return;
        }

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
            this.performAttack();
        }

        // Update enemies AI (including evil warriors that attack player)
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.active) {
                if (enemy.faction === 'evil') {
                    // Evil warriors have enhanced AI
                    this.updateEnemyAI(enemy);
                } else {
                    // Regular enemies
                    this.updateEnemyAI(enemy);
                }
            }
        });
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

    startGameTimer() {
        this.gameTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    updateTimer() {
        this.timeLeft--;
        
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timerText.setText(`Time: ${minutes}:${seconds.toString().padStart(2, '0')}`);

        // Change color when time is running out
        if (this.timeLeft <= 10) {
            this.timerText.setColor('#ff0000');
        } else if (this.timeLeft <= 30) {
            this.timerText.setColor('#ffff00');
        }

        // Game over when time runs out
        if (this.timeLeft <= 0) {
            this.endGame();
        }
    }

    generateBattlefield() {
        // Create realistic battlefield terrain with mixed textures
        for (let x = 0; x < this.worldSize; x += 64) {
            for (let y = 0; y < this.worldSize; y += 64) {
                // Mix different ground types for realistic battlefield
                const terrainType = Phaser.Math.Between(0, 100);
                let terrain;
                
                if (terrainType < 60) {
                    terrain = this.add.image(x + 32, y + 32, 'battlefield_grass');
                } else if (terrainType < 85) {
                    terrain = this.add.image(x + 32, y + 32, 'muddy_ground');
                } else {
                    terrain = this.add.image(x + 32, y + 32, 'crater');
                }
                terrain.setDepth(-10);
            }
        }

        // Add realistic battlefield debris and structures
        const numStructures = 50;
        for (let i = 0; i < numStructures; i++) {
            const x = Phaser.Math.Between(100, this.worldSize - 100);
            const y = Phaser.Math.Between(100, this.worldSize - 100);
            const structureType = Phaser.Math.Between(0, 6);
            
            let structure;
            switch (structureType) {
                case 0:
                    // Abandoned tent
                    structure = this.add.image(x, y, 'tent');
                    structure.setDepth(-3);
                    structure.setTint(Phaser.Math.Between(0x666666, 0x999999));
                    break;
                case 1:
                    // Campfire (some still burning)
                    structure = this.add.image(x, y, 'campfire');
                    structure.setDepth(-2);
                    if (Phaser.Math.Between(0, 100) < 30) {
                        // Add fire particles to some campfires
                        const fireParticles = this.add.particles(x, y - 10, 'fire', {
                            speed: { min: 10, max: 30 },
                            scale: { start: 0.6, end: 0 },
                            lifespan: 1000,
                            frequency: 200
                        });
                        fireParticles.setDepth(3);
                    }
                    break;
                case 2:
                    // Corpses
                    structure = this.add.image(x, y, 'corpse');
                    structure.setDepth(-1);
                    structure.setRotation(Phaser.Math.Between(0, 360) * Math.PI / 180);
                    break;
                case 3:
                    // Broken weapons
                    structure = this.add.image(x, y, 'broken_sword');
                    structure.setDepth(-2);
                    structure.setRotation(Phaser.Math.Between(0, 360) * Math.PI / 180);
                    break;
                case 4:
                    // Broken shields
                    structure = this.add.image(x, y, 'broken_shield');
                    structure.setDepth(-2);
                    structure.setRotation(Phaser.Math.Between(0, 360) * Math.PI / 180);
                    break;
                case 5:
                    // Armor pieces
                    structure = this.add.image(x, y, 'armor');
                    structure.setDepth(-2);
                    structure.setTint(0x888888);
                    break;
                case 6:
                    // Weapons still usable
                    const weaponType = Phaser.Math.Between(0, 2);
                    if (weaponType === 0) {
                        structure = this.add.image(x, y, 'sword_good');
                    } else if (weaponType === 1) {
                        structure = this.add.image(x, y, 'sword_evil');
                    } else {
                        structure = this.add.image(x, y, 'axe');
                    }
                    structure.setDepth(-2);
                    structure.setRotation(Phaser.Math.Between(0, 360) * Math.PI / 180);
                    break;
            }
        }
        
        // Add battlefield banners and flags
        const numBanners = 12;
        for (let i = 0; i < numBanners; i++) {
            const x = Phaser.Math.Between(200, this.worldSize - 200);
            const y = Phaser.Math.Between(200, this.worldSize - 200);
            
            // Banner pole
            const pole = this.add.rectangle(x, y, 4, 60, 0x8B4513);
            pole.setDepth(1);
            
            // Banner flag (torn and battle-worn)
            const flagColor = Phaser.Math.Between(0, 100) < 50 ? 0x228B22 : 0x8B0000; // Good vs Evil
            const flag = this.add.rectangle(x + 15, y - 20, 30, 20, flagColor);
            flag.setDepth(2);
            flag.setAlpha(0.8);
            
            // Make flag flutter
            this.tweens.add({
                targets: flag,
                scaleX: { from: 1, to: 0.9 },
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
    }

    spawnInitialEnemies() {
        // Spawn enemies in a circle around player, but not too close
        const numEnemies = 8;
        const minDistance = 200;
        const maxDistance = 400;
        
        for (let i = 0; i < numEnemies; i++) {
            const angle = (i / numEnemies) * Math.PI * 2;
            const distance = Phaser.Math.Between(minDistance, maxDistance);
            
            const x = this.player.x + Math.cos(angle) * distance;
            const y = this.player.y + Math.sin(angle) * distance;
            
            // Make sure enemies stay within world bounds
            const clampedX = Phaser.Math.Clamp(x, 50, this.worldSize - 50);
            const clampedY = Phaser.Math.Clamp(y, 50, this.worldSize - 50);
            
            this.createEnemy(clampedX, clampedY);
        }
    }

    spawnEnemyNearPlayer() {
        if (this.gameOver) return;
        
        // Simple enemy spawning
        const spawnDistance = 300;
        const angle = Phaser.Math.Between(0, 360) * Math.PI / 180;
        
        const x = this.player.x + Math.cos(angle) * spawnDistance;
        const y = this.player.y + Math.sin(angle) * spawnDistance;
        
        // Make sure enemy spawns within world bounds
        const clampedX = Phaser.Math.Clamp(x, 50, this.worldSize - 50);
        const clampedY = Phaser.Math.Clamp(y, 50, this.worldSize - 50);
        
        this.createEnemy(clampedX, clampedY);
    }

    createEnemy(x, y) {
        const enemy = this.physics.add.sprite(x, y, 'enemy');
        enemy.setSize(24, 24);
        enemy.health = 1;
        enemy.speed = Phaser.Math.Between(90, 140);
        enemy.setDepth(8);
        
        this.enemies.add(enemy);
        return enemy;
    }

    updateEnemyAI(enemy) {
        // Simple AI: move towards player
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
        enemy.setVelocity(
            Math.cos(angle) * enemy.speed,
            Math.sin(angle) * enemy.speed
        );
    }

    performAttack() {
        if (!this.canAttack) return;
        
        this.canAttack = false;
        
        // Simple but effective attack effects
        const slashEffect = this.add.image(this.player.x, this.player.y, 'slash_effect');
        slashEffect.setDepth(15);
        slashEffect.setAlpha(0.8);
        slashEffect.setRotation(Phaser.Math.Between(0, 360) * Math.PI / 180);
        
        const rageAura = this.add.image(this.player.x, this.player.y, 'rage_aura');
        rageAura.setDepth(4);
        rageAura.setAlpha(0.5);
        
        // Animate effects
        this.tweens.add({
            targets: slashEffect,
            scaleX: { from: 0.5, to: 2 },
            scaleY: { from: 0.5, to: 2 },
            alpha: { from: 0.8, to: 0 },
            duration: 300,
            onComplete: () => slashEffect.destroy()
        });
        
        this.tweens.add({
            targets: rageAura,
            scaleX: { from: 1, to: 2.5 },
            scaleY: { from: 1, to: 2.5 },
            alpha: { from: 0.5, to: 0 },
            duration: 400,
            onComplete: () => rageAura.destroy()
        });

        // Basic screen effects
        this.cameras.main.shake(200, 0.02);

        // Check for enemies in range
        this.enemies.children.entries.forEach(enemy => {
            if (enemy.active) {
                const distance = Phaser.Math.Distance.Between(
                    this.player.x, this.player.y, 
                    enemy.x, enemy.y
                );
                
                if (distance <= this.attackRange) {
                    this.hitEnemy(enemy);
                }
            }
        });

        // Reset attack cooldown
        this.time.delayedCall(this.attackCooldown, () => {
            this.canAttack = true;
        });
    }

    hitEnemy(enemy) {
        // Enhanced blood particle effect
        this.bloodParticles.emitParticleAt(enemy.x, enemy.y, 15);
        
        // Screen shake with more impact
        this.cameras.main.shake(150, 0.015);
        
        // Destroy enemy with death effect
        this.tweens.add({
            targets: enemy,
            scaleX: 0,
            scaleY: 0,
            rotation: Math.PI,
            duration: 200,
            onComplete: () => enemy.destroy()
        });
        
        // Add score
        this.score += 10;
        this.scoreText.setText('Enemies Killed: ' + Math.floor(this.score / 10));
    }

    playerHitEnemy(player, enemy) {
        // Player takes damage when touched by enemy
        this.cameras.main.shake(250, 0.025);
        
        // Blood effect on player
        this.bloodParticles.emitParticleAt(player.x, player.y, 8);
        
        // Knockback effect with more force
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
        player.setVelocity(
            Math.cos(angle) * 400,
            Math.sin(angle) * 400
        );
        
        // Flash player red
        player.setTint(0xff0000);
        this.time.delayedCall(200, () => {
            player.clearTint();
        });
        
        // Remove some score as penalty
        this.score = Math.max(0, this.score - 5);
        this.scoreText.setText('Enemies Killed: ' + Math.floor(this.score / 10));
    }

    endGame() {
        this.gameOver = true;
        this.physics.pause();
        
        if (this.gameTimer) {
            this.gameTimer.remove();
        }
        
        // Start results scene with score
        this.scene.start('ResultsScene', { score: this.score });
    }

    createColoredSquare(key, width, height, color, alpha = 1) {
        this.add.graphics()
            .fillStyle(color, alpha)
            .fillRect(0, 0, width, height)
            .generateTexture(key, width, height)
            .destroy();
    }

    createMobileControls() {
        // Check if mobile
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            // Virtual joystick for movement (fixed to camera)
            const joystickBase = this.add.image(100, 450, 'joystick-base');
            joystickBase.setAlpha(0.7);
            joystickBase.setScrollFactor(0); // Fixed to camera
            joystickBase.setDepth(101);
            
            const joystickThumb = this.add.image(100, 450, 'joystick-thumb');
            joystickThumb.setInteractive();
            joystickThumb.setScrollFactor(0); // Fixed to camera
            joystickThumb.setDepth(102);
            
            this.joystick = {
                base: joystickBase,
                thumb: joystickThumb,
                force: 0,
                forceX: 0,
                forceY: 0
            };
            
            // Joystick drag logic
            this.input.setDraggable(joystickThumb);
            
            joystickThumb.on('drag', (pointer, dragX, dragY) => {
                const distance = Phaser.Math.Distance.Between(joystickBase.x, joystickBase.y, dragX, dragY);
                const maxDistance = 35;
                
                if (distance <= maxDistance) {
                    joystickThumb.x = dragX;
                    joystickThumb.y = dragY;
                } else {
                    const angle = Phaser.Math.Angle.Between(joystickBase.x, joystickBase.y, dragX, dragY);
                    joystickThumb.x = joystickBase.x + Math.cos(angle) * maxDistance;
                    joystickThumb.y = joystickBase.y + Math.sin(angle) * maxDistance;
                }
                
                // Calculate force
                const deltaX = joystickThumb.x - joystickBase.x;
                const deltaY = joystickThumb.y - joystickBase.y;
                this.joystick.force = Math.min(distance / maxDistance, 1);
                this.joystick.forceX = (deltaX / maxDistance);
                this.joystick.forceY = (deltaY / maxDistance);
            });
            
            joystickThumb.on('dragend', () => {
                // Return to center
                this.tweens.add({
                    targets: joystickThumb,
                    x: joystickBase.x,
                    y: joystickBase.y,
                    duration: 100
                });
                
                this.joystick.force = 0;
                this.joystick.forceX = 0;
                this.joystick.forceY = 0;
            });

            // Attack button (fixed to camera)
            this.attackButton = this.add.image(700, 450, 'attack-button');
            this.attackButton.setInteractive();
            this.attackButton.setAlpha(0.8);
            this.attackButton.setScrollFactor(0); // Fixed to camera
            this.attackButton.setDepth(101);
            
            // Sword icon on attack button
            const swordIcon = this.add.image(700, 450, 'sword');
            swordIcon.setScrollFactor(0);
            swordIcon.setDepth(102);
            swordIcon.setScale(1.5);

            // Attack touch events
            this.attackPressed = false;

            this.attackButton.on('pointerdown', () => { 
                this.attackPressed = true;
                this.attackButton.setScale(0.9);
                swordIcon.setScale(1.3);
            });
            this.attackButton.on('pointerup', () => { 
                this.attackPressed = false;
                this.attackButton.setScale(1);
                swordIcon.setScale(1.5);
            });
            this.attackButton.on('pointerout', () => { 
                this.attackPressed = false;
                this.attackButton.setScale(1);
                swordIcon.setScale(1.5);
            });
        }
    }

    createWarriorSprite(key, width, height, color) {
        const graphics = this.add.graphics();
        
        // Viking warrior shape
        graphics.fillStyle(color);
        graphics.fillCircle(width/2, height/3, width/4); // Head
        graphics.fillRect(width/2 - width/6, height/3, width/3, height/2); // Body
        graphics.fillRect(width/2 - width/8, height/3 + height/2, width/4, height/4); // Legs
        
        // Helmet horns (if viking)
        if (color === 0x4a90e2) {
            graphics.fillStyle(0x8B4513);
            graphics.fillTriangle(width/2 - width/4, height/3 - width/8, 
                                width/2 - width/5, height/3 - width/4, 
                                width/2 - width/6, height/3);
            graphics.fillTriangle(width/2 + width/4, height/3 - width/8, 
                                width/2 + width/5, height/3 - width/4, 
                                width/2 + width/6, height/3);
        }
        
        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }

    createShieldSprite(key, width, height, color) {
        const graphics = this.add.graphics();
        graphics.fillStyle(color);
        graphics.fillCircle(width/2, height/2, width/2);
        graphics.lineStyle(2, 0x8B4513);
        graphics.strokeCircle(width/2, height/2, width/2);
        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }

    createSwordSprite(key, width, height, color) {
        const graphics = this.add.graphics();
        // Blade
        graphics.fillStyle(0xC0C0C0);
        graphics.fillRect(width/4, 0, width/2, height * 0.8);
        // Handle
        graphics.fillStyle(color);
        graphics.fillRect(width/3, height * 0.8, width/3, height * 0.2);
        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }

    createBloodSprite(key, width, height, color) {
        const graphics = this.add.graphics();
        graphics.fillStyle(color);
        graphics.fillCircle(width/2, height/2, width/2);
        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }

    createGrassTexture(key, width, height) {
        const graphics = this.add.graphics();
        // Base grass
        graphics.fillStyle(0x228B22);
        graphics.fillRect(0, 0, width, height);
        
        // Grass details
        for (let i = 0; i < 20; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const grassColor = Phaser.Math.Between(0x006400, 0x32CD32);
            graphics.fillStyle(grassColor);
            graphics.fillRect(x, y, 2, 2);
        }
        
        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }

    createDirtTexture(key, width, height) {
        const graphics = this.add.graphics();
        graphics.fillStyle(0x8B4513);
        graphics.fillRect(0, 0, width, height);
        
        // Dirt details
        for (let i = 0; i < 15; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            graphics.fillStyle(0x654321);
            graphics.fillRect(x, y, 3, 3);
        }
        
        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }

    createRockTexture(key, width, height) {
        const graphics = this.add.graphics();
        graphics.fillStyle(0x696969);
        graphics.fillCircle(width/2, height/2, width/2);
        
        // Rock highlights
        graphics.fillStyle(0x808080);
        graphics.fillCircle(width/3, height/3, width/6);
        
        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }

    createSkullTexture(key, width, height) {
        const graphics = this.add.graphics();
        // Skull
        graphics.fillStyle(0xF5F5DC);
        graphics.fillCircle(width/2, height/2, width/2);
        
        // Eye sockets
        graphics.fillStyle(0x000000);
        graphics.fillCircle(width/3, height/2 - height/6, width/8);
        graphics.fillCircle(width * 2/3, height/2 - height/6, width/8);
        
        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }

    createRoundButton(key, size, color, alpha = 1) {
        const graphics = this.add.graphics();
        graphics.fillStyle(color, alpha);
        graphics.fillCircle(size/2, size/2, size/2);
        graphics.lineStyle(2, 0x000000, 0.3);
        graphics.strokeCircle(size/2, size/2, size/2);
        graphics.generateTexture(key, size, size);
        graphics.destroy();
    }

    createAtmosphereEffects() {
        // Simple dust particles
        const dustGraphics = this.add.graphics();
        dustGraphics.fillStyle(0xD2B48C, 0.6);
        dustGraphics.fillCircle(2, 2, 2);
        dustGraphics.generateTexture('dust', 4, 4);
        dustGraphics.destroy();

        // Basic dust particles
        this.battleDust = this.add.particles(0, 0, 'dust', {
            x: { min: 0, max: this.worldSize },
            y: { min: 0, max: this.worldSize },
            speed: { min: 10, max: 30 },
            scale: { start: 0.8, end: 0.2 },
            lifespan: 6000,
            frequency: 1000,
            alpha: { start: 0.4, end: 0 }
        });
        this.battleDust.setDepth(5);

        // Simple ember effect
        const emberGraphics = this.add.graphics();
        emberGraphics.fillStyle(0xFF6600, 0.8);
        emberGraphics.fillCircle(1, 1, 1);
        emberGraphics.generateTexture('ember', 2, 2);
        emberGraphics.destroy();

        // Basic embers
        this.emberParticles = this.add.particles(0, 0, 'ember', {
            x: { min: 0, max: this.worldSize },
            y: { min: 0, max: this.worldSize },
            speed: { min: 5, max: 20 },
            scale: { start: 1, end: 0 },
            lifespan: 8000,
            frequency: 2000,
            alpha: { start: 0.6, end: 0 }
        });
        this.emberParticles.setDepth(6);
    }

    setupAnimatedSprites() {
        // Setup for animated sprites (player and enemies)
        
        // Player animations
        this.anims.create({
            key: 'player_idle',
            frames: [{ key: 'player', frame: 0 }],
            frameRate: 10
        });
        this.anims.create({
            key: 'player_run',
            frames: this.anims.generateFrameNumbers('player', { start: 1, end: 4 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'player_attack',
            frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: 0
        });
        this.anims.create({
            key: 'player_hit',
            frames: [{ key: 'player', frame: 9 }],
            frameRate: 10,
            repeat: 0
        });
        this.anims.create({
            key: 'player_die',
            frames: this.anims.generateFrameNumbers('player', { start: 10, end: 13 }),
            frameRate: 5,
            repeat: 0
        });

        // Enemy animations (similar to player)
        this.anims.create({
            key: 'enemy_idle',
            frames: [{ key: 'enemy', frame: 0 }],
            frameRate: 10
        });
        this.anims.create({
            key: 'enemy_run',
            frames: this.anims.generateFrameNumbers('enemy', { start: 1, end: 4 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'enemy_attack',
            frames: this.anims.generateFrameNumbers('enemy', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: 0
        });
        this.anims.create({
            key: 'enemy_hit',
            frames: [{ key: 'enemy', frame: 9 }],
            frameRate: 10,
            repeat: 0
        });
        this.anims.create({
            key: 'enemy_die',
            frames: this.anims.generateFrameNumbers('enemy', { start: 10, end: 13 }),
            frameRate: 5,
            repeat: 0
        });
        
        // Play idle animation for player
        this.player.anims.play('player_idle');
    }

    updateSpriteAnimations() {
        // Make player sprite "breathe" and react to movement
        if (this.player && !this.gameOver) {
            const isMoving = this.player.body.velocity.x !== 0 || this.player.body.velocity.y !== 0;
            
            if (isMoving) {
                this.player.play('player_walk', true);
                // Add slight scale variation when moving
                this.player.setScale(1 + Math.sin(this.time.now * 0.01) * 0.05);
            } else {
                this.player.stop();
                // Breathing effect when idle
                this.player.setScale(1 + Math.sin(this.time.now * 0.003) * 0.02);
            }
        }

        // Animate all enemies
        if (this.enemies) {
            this.enemies.children.entries.forEach(enemy => {
                if (enemy.active) {
                    const isMoving = enemy.body.velocity.x !== 0 || enemy.body.velocity.y !== 0;
                    if (isMoving) {
                        enemy.play('enemy_walk', true);
                    } else {
                        enemy.stop();
                        enemy.setScale(1 + Math.sin(this.time.now * 0.004 + enemy.x * 0.001) * 0.03);
                    }
                }
            });
        }

        // Animate NPC warriors
        if (this.npcWarriors) {
            this.npcWarriors.children.entries.forEach(warrior => {
                if (warrior.active) {
                    warrior.play('warrior_battle', true);
                    warrior.setScale(1 + Math.sin(this.time.now * 0.005 + warrior.y * 0.001) * 0.04);
                }
            });
        }
    }

    setupHeavyAtmosphere() {
        // War fog that moves across battlefield
        this.warFogLayer = this.add.group();
        this.createMovingWarFog();

        // Lightning strikes
        this.lightningSystem = this.add.group();
        this.setupLightningStorms();

        // Sound wave effects for battle cries
        this.soundWaveSystem = this.add.group();
        this.setupSoundWaves();

        // Heavy rain during intense moments
        this.rainSystem = this.add.group();
        this.setupBattleRain();

        // Atmospheric timer for dynamic effects
        this.time.addEvent({
            delay: 2000,
            callback: this.updateHeavyAtmosphere,
            callbackScope: this,
            loop: true
        });
    }

    createMovingWarFog() {
        for (let i = 0; i < 8; i++) {
            const fogCloud = this.add.image(
                Phaser.Math.Between(-200, 2200),
                Phaser.Math.Between(-200, 2200),
                'war_fog'
            );
            fogCloud.setAlpha(0.3);
            fogCloud.setScale(Phaser.Math.FloatBetween(1.5, 3));
            fogCloud.setDepth(1);
            
            // Gentle drifting motion
            this.tweens.add({
                targets: fogCloud,
                x: fogCloud.x + Phaser.Math.Between(-300, 300),
                y: fogCloud.y + Phaser.Math.Between(-300, 300),
                duration: Phaser.Math.Between(15000, 25000),
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1
            });

            this.warFogLayer.add(fogCloud);
        }
    }

    setupLightningStorms() {
        this.time.addEvent({
            delay: Phaser.Math.Between(8000, 15000),
            callback: this.createLightningStrike,
            callbackScope: this,
            loop: true
        });
    }

    createLightningStrike() {
        const x = this.player.x + Phaser.Math.Between(-400, 400);
        const y = this.player.y + Phaser.Math.Between(-400, 400);

        // Lightning bolt
        const lightning = this.add.image(x, y, 'lightning');
        lightning.setScale(2, 4);
        lightning.setAlpha(0);
        lightning.setDepth(10);
        lightning.setRotation(Phaser.Math.FloatBetween(-0.2, 0.2));

        // Flash effect
        this.tweens.add({
            targets: lightning,
            alpha: 1,
            duration: 100,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                lightning.destroy();
            }
        });

        // Screen flash
        this.cameras.main.flash(200, 255, 255, 255, false, (camera, progress) => {
            if (progress === 1) {
                // Thunder sound effect position marker
                this.createSoundWave(x, y, 200);
            }
        });

        // Shake the camera
        this.cameras.main.shake(300, 0.02);
    }

    setupSoundWaves() {
        // Create sound waves on various battle events
    }

    createSoundWave(x, y, radius) {
        const soundWave = this.add.circle(x, y, 10, 0xFFFFFF, 0.6);
        soundWave.setDepth(8);

        this.tweens.add({
            targets: soundWave,
            radius: radius,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => {
                soundWave.destroy();
            }
        });

        this.soundWaveSystem.add(soundWave);
    }

    setupBattleRain() {
        // Intensity-based rain system
        this.rainDrops = [];
        for (let i = 0; i < 50; i++) {
            this.createRainDrop();
        }
    }

    createRainDrop() {
        const drop = this.add.image(
            Phaser.Math.Between(-100, 2100),
            -50,
            'rain_drop'
        );
        drop.setScale(0.5);
        drop.setAlpha(0.7);
        drop.setDepth(2);

        this.tweens.add({
            targets: drop,
            y: 2050,
            duration: Phaser.Math.Between(1000, 2000),
            ease: 'Linear',
            onComplete: () => {
                drop.y = -50;
                drop.x = Phaser.Math.Between(-100, 2100);
            }
        });

        this.rainDrops.push(drop);
    }

    updateHeavyAtmosphere() {
        // Adjust atmosphere based on combat intensity
        const combatIntensity = Math.min(this.enemies.children.entries.length / 10, 1);
        
        // More fog during intense combat
        if (combatIntensity > 0.7 && this.warFogLayer.children.size < 15) {
            this.createMovingWarFog();
        }

        // Increase lightning frequency during high intensity
        if (combatIntensity > 0.8 && Math.random() < 0.3) {
            this.createLightningStrike();
        }

        // Add ash particles during heavy combat
        if (combatIntensity > 0.6) {
            this.createAshStorm();
        }
    }

    createAshStorm() {
        const ashParticles = this.add.particles(
            this.player.x + Phaser.Math.Between(-300, 300),
            this.player.y - 400,
            'ash_particle',
            {
                speed: { min: 20, max: 60 },
                scale: { start: 1, end: 0.3 },
                lifespan: 4000,
                gravityY: 30,
                frequency: 50,
                quantity: 3
            }
        );
        ashParticles.setDepth(4);

        // Remove after a while
        this.time.delayedCall(5000, () => {
            ashParticles.destroy();
        });
    }

    // === COMPLEX SPAWN PORTALS ===
    setupComplexSpawnPortals() {
        this.spawnPortals = this.add.group();
        this.createInitialSpawnPortals();

        // Portal activity timer
        this.time.addEvent({
            delay: 3000,
            callback: this.updateSpawnPortals,
            callbackScope: this,
            loop: true
        });
    }

    createInitialSpawnPortals() {
        // Create 4 major spawn portals around the battlefield
        const portalPositions = [
            { x: 200, y: 200 },
            { x: 1800, y: 200 },
            { x: 200, y: 1800 },
            { x: 1800, y: 1800 }
        ];

        portalPositions.forEach((pos, index) => {
            this.createComplexSpawnPortal(pos.x, pos.y, index);
        });
    }

    createComplexSpawnPortal(x, y, portalId) {
        const portal = this.add.group();

        // Portal base - dark energy vortex
        const base = this.add.image(x, y, 'portal_vortex');
        base.setScale(1.5);
        base.setDepth(1);
        base.setAlpha(0.8);

        // Spinning energy rings
        const ring1 = this.add.image(x, y, 'energy_ring');
        ring1.setScale(1);
        ring1.setDepth(2);
        ring1.setTint(0xFF4500);

        const ring2 = this.add.image(x, y, 'energy_ring');
        ring2.setScale(1.3);
        ring2.setDepth(2);
        ring2.setTint(0x8B0000);

        const ring3 = this.add.image(x, y, 'energy_ring');
        ring3.setScale(0.7);
        ring3.setDepth(3);
        ring3.setTint(0xFFD700);

        // Rotation animations
        this.tweens.add({
            targets: ring1,
            rotation: Math.PI * 2,
            duration: 3000,
            repeat: -1,
            ease: 'Linear'
        });

        this.tweens.add({
            targets: ring2,
            rotation: -Math.PI * 2,
            duration: 4000,
            repeat: -1,
            ease: 'Linear'
        });

        this.tweens.add({
            targets: ring3,
            rotation: Math.PI * 2,
            duration: 2000,
            repeat: -1,
            ease: 'Linear'
        });

        // Pulsing energy core
        const core = this.add.image(x, y, 'power_core');
        core.setScale(0.5);
        core.setDepth(4);

        this.tweens.add({
            targets: core,
            scaleX: 0.8,
            scaleY: 0.8,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Particle effects around portal
        const portalParticles = this.add.particles(x, y, 'energy_particle', {
            speed: { min: 50, max: 100 },
            scale: { start: 0.5, end: 0 },
            lifespan: 2000,
            quantity: 2,
            frequency: 200,
            emitZone: { type: 'edge', source: new Phaser.Geom.Circle(0, 0, 60), quantity: 12 }
        });
        portalParticles.setDepth(3);

        // Lightning emanating from portal
        this.time.addEvent({
            delay: Phaser.Math.Between(2000, 5000),
            callback: () => this.createPortalLightning(x, y),
            callbackScope: this,
            loop: true
        });

        // Add all elements to portal group
        portal.addMultiple([base, ring1, ring2, ring3, core, portalParticles]);
        portal.portalId = portalId;
        portal.x = x;
        portal.y = y;
        portal.spawnCooldown = 0;

        this.spawnPortals.add(portal);
    }

    createPortalLightning(portalX, portalY) {
        // Create branching lightning from portal
        for (let i = 0; i < 3; i++) {
            const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
            const distance = Phaser.Math.Between(100, 200);
            const endX = portalX + Math.cos(angle) * distance;
            const endY = portalY + Math.sin(angle) * distance;

            const lightning = this.add.image(portalX, portalY, 'lightning');
            lightning.setScale(0.5, distance / 64);
            lightning.setOrigin(0.5, 0);
            lightning.setRotation(angle + Math.PI/2);
            lightning.setDepth(5);
            lightning.setTint(0xFF4500);

            this.tweens.add({
                targets: lightning,
                alpha: 0,
                duration: 300,
                onComplete: () => lightning.destroy()
            });
        }
    }

    updateSpawnPortals() {
        this.spawnPortals.children.entries.forEach(portal => {
            // Spawn enemies from portals based on game intensity
            const distanceToPlayer = Phaser.Math.Distance.Between(
                portal.x, portal.y, this.player.x, this.player.y
            );

            // Spawn more frequently from closer portals
            if (distanceToPlayer < 600 && Math.random() < 0.4) {
                this.spawnEnemyFromPortal(portal.x, portal.y);
                
                // Portal activation effect
                this.createPortalActivation(portal.x, portal.y);
            }
        });
    }

    spawnEnemyFromPortal(x, y) {
        // Create enemy with dramatic spawn effect
        const spawnX = x + Phaser.Math.Between(-50, 50);
        const spawnY = y + Phaser.Math.Between(-50, 50);

        // Spawn effect
        const spawnEffect = this.add.particles(spawnX, spawnY, 'energy_particle', {
            speed: { min: 80, max: 150 },
            scale: { start: 1, end: 0 },
            lifespan: 800,
            quantity: 20
        });
        spawnEffect.setDepth(6);

        // Screen shake
        this.cameras.main.shake(100, 0.01);

        // Delay enemy appearance for dramatic effect
        this.time.delayedCall(300, () => {
            if (!this.gameOver) {
                const enemy = this.enemies.create(spawnX, spawnY, 'enemy');
                enemy.setCollideWorldBounds(true);
                enemy.setDepth(2);
                enemy.setBounce(0.2);
                enemy.health = 1;
                enemy.lastAttack = 0;
                enemy.speed = Phaser.Math.Between(30, 60);

                // Make enemy slightly larger and more threatening
                enemy.setScale(1.1);
                enemy.setTint(0xFF6666);

                spawnEffect.destroy();
            }
        });
    }

    createPortalActivation(x, y) {
        // Intense activation effect
        const activationRing = this.add.image(x, y, 'impact_ring');
        activationRing.setScale(0.1);
        activationRing.setDepth(7);
        activationRing.setAlpha(0.8);

        this.tweens.add({
            targets: activationRing,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => activationRing.destroy()
        });

        // Sound wave
        this.createSoundWave(x, y, 150);
    }

    // === ATMOSPHERIC AND PORTAL SPRITES ===
    
    createWarFogSprite(key, width, height) {
        const graphics = this.add.graphics();
        
        // Dense fog with swirling patterns
        graphics.fillStyle(0x808080, 0.4);
        graphics.fillCircle(width/2, height/2, width/2);
        
        // Swirling patterns for depth
        for (let i = 0; i < 8; i++) {
            const x = Phaser.Math.Between(5, width - 5);
            const y = Phaser.Math.Between(5, height - 5);
            graphics.fillStyle(0x696969, 0.3);
            graphics.fillCircle(x, y, Phaser.Math.Between(3, 12));
        }
        
        // Additional wispy details
        for (let i = 0; i < 15; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            graphics.fillStyle(0x778899, 0.2);
            graphics.fillCircle(x, y, Phaser.Math.Between(1, 4));
        }
        
        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }

    createRainDropSprite(key, width, height) {
        const graphics = this.add.graphics();
        
        // Teardrop shape
        graphics.fillStyle(0x87CEEB, 0.8);
        graphics.fillEllipse(width/2, height/2, width, height);
        
        // Highlight for realism
        graphics.fillStyle(0xFFFFFF, 0.4);
        graphics.fillEllipse(width/2 - 1, height/2 - 2, width/3, height/4);
        
        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }

    createAshParticleSprite(key, width, height) {
        const graphics = this.add.graphics();
        
        // Dark ash with irregular shape
        graphics.fillStyle(0x696969, 0.7);
        graphics.fillCircle(width/2, height/2, width/2);
        
        // Add some texture
        graphics.fillStyle(0x2F2F2F, 0.5);
        graphics.fillCircle(width/2 + 1, height/2 - 1, width/3);
        
        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }

    createPortalVortexSprite(key, width, height) {
        const graphics = this.add.graphics();
        
        // Dark vortex center
        graphics.fillStyle(0x000000, 0.9);
        graphics.fillCircle(width/2, height/2, width/2);
        
        // Spiraling energy
        const spirals = 8;
        for (let i = 0; i < spirals; i++) {
            const angle = (i / spirals) * Math.PI * 2;
            const spiral = 3;
            
            for (let r = 10; r < width/2; r += 8) {
                const spiralAngle = angle + (r / width) * Math.PI * spiral;
                const x = width/2 + Math.cos(spiralAngle) * r;
                const y = height/2 + Math.sin(spiralAngle) * r;
                
                const intensity = 1 - (r / (width/2));
                graphics.fillStyle(0x4B0082, intensity * 0.6);
                graphics.fillCircle(x, y, 3 * intensity);
            }
        }
        
        // Outer glow
        graphics.fillStyle(0x8B0000, 0.3);
        graphics.fillCircle(width/2, height/2, width/1.8);
        
        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }

    createEnergyRingSprite(key, width, height) {
        const graphics = this.add.graphics();
        
        // Outer ring
        graphics.lineStyle(4, 0xFFD700, 0.8);
        graphics.strokeCircle(width/2, height/2, width/2 - 2);
        
        // Inner ring
        graphics.lineStyle(2, 0xFFFFFF, 0.6);
        graphics.strokeCircle(width/2, height/2, width/2 - 6);
        
        // Energy nodes around the ring
        const nodes = 12;
        for (let i = 0; i < nodes; i++) {
            const angle = (i / nodes) * Math.PI * 2;
            const x = width/2 + Math.cos(angle) * (width/2 - 2);
            const y = height/2 + Math.sin(angle) * (width/2 - 2);
            
            graphics.fillStyle(0xFF4500, 0.9);
            graphics.fillCircle(x, y, 3);
            
            graphics.fillStyle(0xFFFFFF, 0.7);
            graphics.fillCircle(x, y, 1);
        }
        
        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }

    createPowerCoreSprite(key, width, height) {
        const graphics = this.add.graphics();
        
        // Core energy
        graphics.fillStyle(0xFFFFFF, 0.9);
        graphics.fillCircle(width/2, height/2, width/2);
        
        // Energy layers
        graphics.fillStyle(0xFFD700, 0.7);
        graphics.fillCircle(width/2, height/2, width/2.5);
        
        graphics.fillStyle(0xFF4500, 0.5);
        graphics.fillCircle(width/2, height/2, width/3);
        
        graphics.fillStyle(0x8B0000, 0.3);
        graphics.fillCircle(width/2, height/2, width/4);
        
        // Central bright spot
        graphics.fillStyle(0xFFFFFF, 1);
        graphics.fillCircle(width/2, height/2, width/6);
        
        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }

    createEnergyParticleSprite(key, width, height) {
        const graphics = this.add.graphics();
        
        // Bright energy particle
        graphics.fillStyle(0xFFFFFF, 0.9);
        graphics.fillCircle(width/2, height/2, width/2);
        
        // Energy glow
        graphics.fillStyle(0x87CEEB, 0.6);
        graphics.fillCircle(width/2, height/2, width/1.5);
        
        // Outer aura
        graphics.fillStyle(0x4169E1, 0.3);
        graphics.fillCircle(width/2, height/2, width/1.2);
        
        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }
}
