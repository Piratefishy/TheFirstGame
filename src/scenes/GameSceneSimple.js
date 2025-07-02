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
        
        // Object pooling system for performance
        this.warriorPool = {
            available: [],
            inUse: [],
            maxSize: 500 // Maximum warriors in pool
        };
        
        // Performance tracking
        this.performanceMode = 'balanced'; // 'high', 'balanced', 'performance'
        this.visibleWarriors = [];
        this.lastCullingUpdate = 0;
    }

    preload() {
        // Create enhanced sprites and damage system
        this.createSimpleSprites();
        this.createAdvancedDamageSystem();
    }

    createSimpleSprites() {
        // Create animated sprite sheets for all character types
        this.createEnhancedAnimatedPlayer();
        
        // GOOD FORCES - Create specialized warrior classes with enhanced graphics
        this.createEnhancedElfWarrior();      // Archer
        this.createEnhancedHumanKnight();     // Swordsman, Shield warrior  
        this.createEnhancedDwarfWarrior();    // Dual wielder, Axeman, Dual axes

        // EVIL FORCES - Create specialized creature classes with enhanced graphics
        this.createEnhancedOrcWarrior();     // Berserker
        this.createEnhancedGoblinWarrior();  // Assassin
        this.createEnhancedTrollWarrior();   // Tank

        // Enhanced Blood particle with multiple variations
        const bloodGraphics = this.add.graphics();
        bloodGraphics.fillStyle(0x8B0000, 1);
        bloodGraphics.fillCircle(8, 8, 6);
        bloodGraphics.fillStyle(0xDC143C, 0.8);
        bloodGraphics.fillCircle(8, 8, 4);
        bloodGraphics.fillStyle(0xFF0000, 0.6);
        bloodGraphics.fillCircle(8, 8, 2);
        bloodGraphics.generateTexture('blood', 16, 16);
        bloodGraphics.destroy();

        // Enhanced sparkle effect with multiple colors
        const sparkGraphics = this.add.graphics();
        sparkGraphics.fillStyle(0xFFD700, 1);
        sparkGraphics.fillRect(3, 0, 3, 12);
        sparkGraphics.fillRect(0, 3, 12, 3);
        sparkGraphics.fillStyle(0xFFFFFF, 0.8);
        sparkGraphics.fillRect(4, 1, 1, 10);
        sparkGraphics.fillRect(1, 4, 10, 1);
        sparkGraphics.generateTexture('spark', 12, 12);
        sparkGraphics.destroy();

        // Damage number effects
        this.createDamageEffects();
    }

    create() {
        console.log('GameSceneSimple: Starting create() method...');
        
        // Get selected class from character selection screen
        const selectedClass = this.registry.get('selectedClass');
        const selectedWeapon = this.registry.get('selectedWeapon');
        
        console.log('Selected class:', selectedClass, 'Selected weapon:', selectedWeapon);
        
        if (!selectedClass) {
            console.log('No class selected, redirecting to CharacterSelectionScene');
            // If no class selected, go back to selection screen
            this.scene.start('CharacterSelectionScene');
            return;
        }

        try {
            console.log('Initializing systems...');
            
            // Initialize all enhanced systems
            this.initializeCharacterClasses();
            this.createAdvancedCombatSounds();
            this.optimizePerformanceForMassiveBattles();
            
            // Set up player with selected class
            this.playerClass = selectedClass;
            this.playerWeapon = selectedWeapon;
            
            console.log('Setting up world...');
            
            // Set up massive infinite-feeling battlefield (8000x8000)
            const worldWidth = 4000; // Reduced size for better performance
            const worldHeight = 4000;
            // Remove world bounds for infinite feel
            this.physics.world.setBounds(-worldWidth, -worldHeight, worldWidth * 2, worldHeight * 2);

            const { width: screenWidth, height: screenHeight } = this.cameras.main;

            console.log('Creating background...');
            // Enhanced background with large texture
            this.createEnhancedBackground(worldWidth, worldHeight);

            console.log('Creating player...');
            // Create player with selected class
            this.createPlayerWithSelectedClass();

            // Set up camera to follow player with no bounds
            this.cameras.main.startFollow(this.player);
            this.cameras.main.setZoom(1);

            console.log('Creating warrior groups...');
            // Create enemy groups for good vs evil battles
            this.enemies = this.physics.add.group(); // Still for player collision
            this.goodWarriors = this.physics.add.group();
            this.evilWarriors = this.physics.add.group();

            console.log('Spawning initial warriors...');
            // Spawn good warriors fighting evil ones across the large battlefield
            this.spawnBattlingWarriors(worldWidth, worldHeight);

            // Collision
            this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

            console.log('Creating UI...');
            // Enhanced UI (fixed to screen)
            this.createEnhancedUI(screenWidth, screenHeight);

            console.log('Setting up controls...');
            // Controls
            this.setupControls();

            console.log('Starting timer...');
            // Game timer
            this.startEnhancedTimer();

            console.log('Creating effects...');
            // Add atmospheric effects
            this.createAtmosphericEffects();
            this.createMassiveBattleEffects();

            // Smart warrior density management (using new culling system)
            this.time.addEvent({
                delay: 2000, // Every 2 seconds - slower for stability
                callback: this.maintainWarriorDensityAroundPlayer,
                callbackScope: this,
                loop: true
            });

            // Performance optimization timer
            this.time.addEvent({
                delay: 3000, // Every 3 seconds - slower for stability
                callback: this.updatePerformanceOptimization,
                callbackScope: this,
                loop: true
            });

            console.log('GameSceneSimple: Successfully created all systems!');
        } catch (error) {
            console.error('Error in GameSceneSimple create():', error);
            // Fallback - go back to menu
            this.scene.start('MenuScene');
        }
    }

    hitEnemy(player, enemy) {
        // This function now only handles collision/pushing, not damage
        // Damage is handled by the auto-attack system
        
        // Push apart slightly to prevent units from overlapping
        const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
        player.setVelocity(
            player.body.velocity.x + Math.cos(angle) * 20,
            player.body.velocity.y + Math.sin(angle) * 20
        );
        
        // Also push the enemy away slightly
        enemy.setVelocity(
            enemy.body.velocity.x - Math.cos(angle) * 15,
            enemy.body.velocity.y - Math.sin(angle) * 15
        );
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
        
        // Spawn enemy from OPPOSITE faction to player
        let enemyClasses, enemyFaction;
        if (this.playerFaction === 'good') {
            // If player is good, spawn evil enemies
            enemyClasses = ['berserker', 'assassin', 'tank'];
            enemyFaction = 'evil';
        } else {
            // If player is evil, spawn good enemies
            enemyClasses = ['archer', 'swordsman', 'dual_wielder', 'shield_warrior', 'axeman', 'dual_axe'];
            enemyFaction = 'good';
        }
        
        const enemyClass = enemyClasses[Math.floor(Math.random() * enemyClasses.length)];
        const enemyData = this.characterClasses[enemyClass];
        
        const newEnemy = this.physics.add.sprite(spawnX, spawnY, enemyData.sprite);
        newEnemy.setCollideWorldBounds(false);
        newEnemy.setDepth(5);
        newEnemy.faction = enemyFaction;
        newEnemy.className = enemyClass;
        newEnemy.health = enemyData.hp;
        newEnemy.maxHealth = enemyData.hp;
        newEnemy.damage = enemyData.damage;
        newEnemy.play(enemyData.anim);
        
        this.enemies.add(newEnemy);
        
        // Add to appropriate group
        if (enemyFaction === 'good') {
            this.goodWarriors.add(newEnemy);
        } else {
            this.evilWarriors.add(newEnemy);
        }
    }

    update() {
        if (this.gameOver || this.paused) return;

        // Player movement with multiple input methods
        this.updatePlayerMovement();
        
        // Player auto-attack system (no attack button needed)
        this.updatePlayerAutoAttack();

        // Update warrior visibility and culling (smart performance)
        this.updateWarriorVisibilityAndCulling();

        // Update only visible warriors AI for performance
        this.updateVisibleWarriorAI();

        // Update health bars only for visible warriors
        this.updateVisibleWarriorHealthBars();
    }
    
    updatePlayerMovement() {
        const speed = this.playerSpeed || 100;
        let moveX = 0;
        let moveY = 0;
        
        // Desktop controls (WASD/Arrow keys)
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
        
        // Mobile joystick controls
        if (this.joystickVector && (Math.abs(this.joystickVector.x) > 0.1 || Math.abs(this.joystickVector.y) > 0.1)) {
            moveX = this.joystickVector.x;
            moveY = this.joystickVector.y;
        }
        
        // Touch/pointer movement
        if (this.pointerDown && this.targetX !== undefined && this.targetY !== undefined) {
            const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.targetX, this.targetY);
            if (distance > 20) { // Dead zone
                const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.targetX, this.targetY);
                moveX = Math.cos(angle);
                moveY = Math.sin(angle);
            }
        }
        
        // Apply movement
        this.player.setVelocity(moveX * speed, moveY * speed);
    }

    // ============== AUTO-ATTACK SYSTEM ==============
    
    findNearestEnemyInRange() {
        if (!this.player || !this.player.active || !this.enemies) return null;
        
        let nearestEnemy = null;
        let nearestDistance = this.player.range;
        
        this.enemies.children.entries.forEach(enemy => {
            if (!enemy.active || enemy.faction === this.player.faction) return;
            
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );
            
            if (distance <= nearestDistance) {
                nearestEnemy = enemy;
                nearestDistance = distance;
            }
        });
        
        return nearestEnemy;
    }
    
    updatePlayerAutoAttack() {
        if (!this.player || !this.player.active) return;
        
        const currentTime = this.time.now;
        
        // Check if attack is off cooldown
        if (currentTime - this.player.lastAttackTime < this.player.attackCooldown) {
            return;
        }
        
        // Find nearest enemy in range
        const target = this.findNearestEnemyInRange();
        if (!target) return;
        
        // Perform attack
        this.performPlayerAttack(target);
        this.player.lastAttackTime = currentTime;
    }
    
    performPlayerAttack(target) {
        if (!target || !target.active || !this.player) return;
        
        // Apply damage using the advanced damage system
        const damageDealt = this.applyAdvancedDamage(this.player, target, this.playerWeapon || 'physical');
        
        // Create visual effects
        this.createAdvancedWeaponEffects(this.player, target, this.playerWeapon || 'physical');
        this.createDamageNumber(target.x, target.y - 20, damageDealt, '#FF4444');
        
        // Create attack feedback for player
        this.createAttackFeedback(this.player, target);
        
        // Check if enemy is killed
        if (target.health <= 0) {
            this.score += 10;
            this.scoreText.setText('Score: ' + this.score);
            this.createDeathEffect(target);
            this.destroyWarriorWithHealthBar(target);
            this.spawnEnemyOffscreen();
        }
    }
    
    createAttackFeedback(attacker, target) {
        // Create a brief visual effect showing the attack
        const attackLine = this.add.graphics();
        attackLine.lineStyle(3, 0xFFFFFF, 0.8);
        attackLine.lineBetween(attacker.x, attacker.y, target.x, target.y);
        attackLine.setDepth(5);
        
        // Fade out the attack line
        this.tweens.add({
            targets: attackLine,
            alpha: 0,
            duration: 100,
            onComplete: () => {
                attackLine.destroy();
            }
        });
        
        // Add screen shake for more impact
        this.cameras.main.shake(50, 0.01);
    }

    // ============== MASSIVE BATTLEFIELD SPAWNING SYSTEM ==============
    
    spawnBattlingWarriors(worldWidth, worldHeight) {
        console.log('Spawning optimized initial warriors...');
        
        // Start with more warriors for immediate action
        const initialWarriors = 40; // Increased for more immediate action
        
        // Create battle clusters around player
        for (let cluster = 0; cluster < 4; cluster++) {
            const clusterAngle = (cluster / 4) * Math.PI * 2;
            const clusterDistance = 300 + Math.random() * 200;
            const clusterX = this.player.x + Math.cos(clusterAngle) * clusterDistance;
            const clusterY = this.player.y + Math.sin(clusterAngle) * clusterDistance;
            
            // Mixed factions in each cluster for immediate combat
            for (let i = 0; i < 10; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 100;
                const x = clusterX + Math.cos(angle) * distance;
                const y = clusterY + Math.sin(angle) * distance;
                
                // 50/50 mix of good and evil for instant combat
                const faction = Math.random() < 0.5 ? 'good' : 'evil';
                const warrior = this.createWarriorFromPool(x, y, faction);
                
                // Set warriors to be looking for combat immediately
                warrior.aiState = 'seek';
                warrior.lastStateChange = this.time.now;
            }
        }
        
        console.log(`Spawned ${initialWarriors} initial warriors in combat clusters!`);
    }

    spawnBattleCluster(centerX, centerY, faction, clusterSize = 25) {
        const spreadRadius = 100; // Smaller spread for initial setup
        
        for (let i = 0; i < clusterSize; i++) {
            // Skip if we've reached max capacity
            if (this.goodWarriorCount + this.evilWarriorCount >= this.totalWarriorsTarget) {
                break;
            }
            
            const angle = (i / clusterSize) * Math.PI * 2 + Math.random() * 0.5;
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
            
            // Check capacity limits per side
            if (warriorFaction === 'good' && this.goodWarriorCount >= this.maxWarriorsPerSide) {
                warriorFaction = 'evil';
            } else if (warriorFaction === 'evil' && this.evilWarriorCount >= this.maxWarriorsPerSide) {
                warriorFaction = 'good';
            }
            
            this.createNPCWarrior(x, y, warriorFaction);
        }
    }

    createNPCWarrior(x, y, faction) {
        // Use the new smart pooling system
        return this.createWarriorFromPool(x, y, faction);
    }

    maintainBattlefieldDensity() {
        if (this.gameOver || this.paused) return;
        
        const currentGoodCount = this.goodWarriors.children.entries.filter(w => w.active).length;
        const currentEvilCount = this.evilWarriors.children.entries.filter(w => w.active).length;
        const totalActive = currentGoodCount + currentEvilCount;
        
        // Maintain manageable density
        const targetDensity = 300; // Much smaller target for performance
        const spawnRadius = 800; // Distance from player to spawn new warriors
        
        if (totalActive < targetDensity) {
            const toSpawn = Math.min(5, targetDensity - totalActive); // Spawn up to 5 at once
            
            for (let i = 0; i < toSpawn; i++) {
                // Spawn around player but not too close
                const angle = Math.random() * Math.PI * 2;
                const distance = spawnRadius + Math.random() * 400;
                const spawnX = this.player.x + Math.cos(angle) * distance;
                const spawnY = this.player.y + Math.sin(angle) * distance;
                
                // Determine faction (maintain balance, but prefer enemy faction to player)
                let faction;
                if (currentGoodCount < currentEvilCount) {
                    faction = 'good';
                } else if (currentEvilCount < currentGoodCount) {
                    faction = 'evil';
                } else {
                    // Spawn opposite to player faction for more combat
                    faction = this.playerFaction === 'good' ? 'evil' : 'good';
                }
                
                this.createNPCWarrior(spawnX, spawnY, faction);
            }
        }
        
        // Update battle intensity display
        this.updateBattleIntensity(totalActive);
    }

    applyAdvancedDamage(attacker, target, weaponType = 'physical') {
        if (!attacker || !target || !target.active) return 0;
        
        // Get base damage
        const baseDamage = attacker.damage || 20;
        
        // Get class effectiveness multiplier
        let effectiveness = 1.0;
        if (attacker.className && target.className) {
            // Use appropriate damage matrix
            const damageMatrix = (attacker === this.player) ? 
                this.damageMatrix : this.npcDamageMatrix;
            
            effectiveness = damageMatrix[attacker.className]?.[target.className] || 1.0;
        }
        
        // Apply weapon type bonus
        const weaponBonus = this.damageTypes[weaponType]?.multiplier || 1.0;
        
        // Calculate final damage with randomization
        const randomFactor = 0.8 + Math.random() * 0.4; // 80%-120%
        const finalDamage = Math.floor(baseDamage * effectiveness * weaponBonus * randomFactor);
        
        // Apply damage
        target.health -= finalDamage;
        
        // Create visual effects
        this.createAdvancedDamageEffect(target, finalDamage, effectiveness);
        
        // Update health bar
        this.updateWarriorHealthBar(target);
        
        // Sound effects based on damage effectiveness
        if (effectiveness > 1.3) {
            // Critical hit sound would go here
            this.cameras.main.shake(200, 0.02);
        } else if (effectiveness < 0.8) {
            // Weak hit sound would go here
        }
        
        return finalDamage;
    }

    initializeCharacterClasses() {
        // Simplified character class definitions that work
        this.characterClasses = {
            'archer': { hp: 70, damage: 20, speed: 130, range: 100, cooldown: 900, sprite: 'elf_1', anim: 'elf_walk' },
            'swordsman': { hp: 100, damage: 25, speed: 95, range: 55, cooldown: 1100, sprite: 'knight_1', anim: 'knight_walk' },
            'dual_wielder': { hp: 90, damage: 30, speed: 85, range: 65, cooldown: 800, sprite: 'dwarf_1', anim: 'dwarf_walk' },
            'shield_warrior': { hp: 100, damage: 25, speed: 95, range: 55, cooldown: 1100, sprite: 'knight_1', anim: 'knight_walk' },
            'axeman': { hp: 90, damage: 30, speed: 85, range: 65, cooldown: 800, sprite: 'dwarf_1', anim: 'dwarf_walk' },
            'dual_axe': { hp: 90, damage: 30, speed: 85, range: 65, cooldown: 800, sprite: 'dwarf_1', anim: 'dwarf_walk' },
            
            'berserker': { hp: 110, damage: 28, speed: 80, range: 70, cooldown: 900, sprite: 'orc_1', anim: 'orc_walk' },
            'assassin': { hp: 60, damage: 22, speed: 150, range: 50, cooldown: 600, sprite: 'goblin_1', anim: 'goblin_walk' },
            'tank': { hp: 150, damage: 40, speed: 60, range: 80, cooldown: 1500, sprite: 'troll_1', anim: 'troll_walk' }
        };
    }

    createEnhancedBackground(worldWidth, worldHeight) {
        // Create a massive, detailed battlefield background
        
        // Base terrain with varied textures
        const terrainGraphics = this.add.graphics();
        
        // Create grassland base
        terrainGraphics.fillStyle(0x228B22, 1);
        terrainGraphics.fillRect(-worldWidth, -worldHeight, worldWidth * 2, worldHeight * 2);
        
        // Add dirt patches and battle scars
        for (let i = 0; i < 100; i++) {
            const x = -worldWidth + Math.random() * worldWidth * 2;
            const y = -worldHeight + Math.random() * worldHeight * 2;
            const size = 20 + Math.random() * 100;
            
            terrainGraphics.fillStyle(0x8B4513, 0.6); // Brown dirt
            terrainGraphics.fillCircle(x, y, size);
        }
        
        // Add blood-stained ground
        for (let i = 0; i < 50; i++) {
            const x = -worldWidth + Math.random() * worldWidth * 2;
            const y = -worldHeight + Math.random() * worldHeight * 2;
            const size = 10 + Math.random() * 40;
            
            terrainGraphics.fillStyle(0x8B0000, 0.4); // Dark red blood
            terrainGraphics.fillCircle(x, y, size);
        }
        
        // Add scattered rocks and debris
        for (let i = 0; i < 200; i++) {
            const x = -worldWidth + Math.random() * worldWidth * 2;
            const y = -worldHeight + Math.random() * worldHeight * 2;
            const size = 3 + Math.random() * 12;
            
            terrainGraphics.fillStyle(0x696969, 0.8); // Grey rocks
            terrainGraphics.fillCircle(x, y, size);
        }
        
        // Add larger battlefield structures
        for (let i = 0; i < 20; i++) {
            const x = -worldWidth + Math.random() * worldWidth * 2;
            const y = -worldHeight + Math.random() * worldHeight * 2;
            const width = 30 + Math.random() * 80;
            const height = 20 + Math.random() * 50;
            
            terrainGraphics.fillStyle(0x654321, 0.7); // Brown structures
            terrainGraphics.fillRect(x, y, width, height);
        }
        
        terrainGraphics.setDepth(-1);
    }

    updateBattleIntensity(totalWarriors) {
        // Update the battle intensity display
        let intensity = 'LOW';
        let intensityColor = '#00FF00';
        
        if (totalWarriors > 3000) {
            intensity = 'EXTREME';
            intensityColor = '#FF0000';
        } else if (totalWarriors > 2500) {
            intensity = 'VERY HIGH';
            intensityColor = '#FF4500';
        } else if (totalWarriors > 2000) {
            intensity = 'HIGH';
            intensityColor = '#FFA500';
        } else if (totalWarriors > 1500) {
            intensity = 'MEDIUM';
            intensityColor = '#FFFF00';
        }
        
        if (this.battleIntensityText) {
            this.battleIntensityText.setText(`Battle Intensity: ${intensity} (${totalWarriors} warriors)`);
            this.battleIntensityText.setColor(intensityColor);
        }
    }

    enhanceWarriorVisuals(warrior) {
        // Add enhanced visual effects to warriors
        
        // Add faction glow
        const factionColor = warrior.faction === 'good' ? 0x0000FF : 0xFF0000;
        warrior.setTint(factionColor);
        
        // Add class-specific particle effects
        if (warrior.className === 'elf') {
            // Nature magic particles around elves
            const natureParticle = this.add.image(
                warrior.x + (Math.random() - 0.5) * 40,
                warrior.y + (Math.random() - 0.5) * 40,
                'spark'
            );
            natureParticle.setTint(0x00FF00);
            natureParticle.setScale(0.3);
            natureParticle.setAlpha(0.6);
            natureParticle.setDepth(5);
            
            this.tweens.add({
                targets: natureParticle,
                y: natureParticle.y - 20,
                alpha: 0,
                duration: 1000,
                onComplete: () => natureParticle.destroy()
            });
        } else if (warrior.className === 'orc') {
            // Rage aura for orcs
            if (Math.random() < 0.1) {
                const rageParticle = this.add.image(
                    warrior.x + (Math.random() - 0.5) * 30,
                    warrior.y + (Math.random() - 0.5) * 30,
                    'blood'
                );
                rageParticle.setTint(0xFF4500);
                rageParticle.setScale(0.4);
                rageParticle.setAlpha(0.7);
                rageParticle.setDepth(5);
                
                this.tweens.add({
                    targets: rageParticle,
                    scale: rageParticle.scaleX * 2,
                    alpha: 0,
                    duration: 800,
                    onComplete: () => rageParticle.destroy()
                });
            }
        }
    }

    // ============== PAUSE FUNCTIONALITY ==============
    
    togglePause() {
        this.paused = !this.paused;
        if (this.paused) {
            this.physics.pause();
            this.gameTimer.paused = true;
            
            // Show pause overlay
            if (!this.pauseOverlay) {
                this.pauseOverlay = this.add.rectangle(
                    this.cameras.main.width / 2,
                    this.cameras.main.height / 2,
                    this.cameras.main.width,
                    this.cameras.main.height,
                    0x000000,
                    0.7
                );
                this.pauseOverlay.setScrollFactor(0);
                this.pauseOverlay.setDepth(2000);
                
                this.pauseText = this.add.text(
                    this.cameras.main.width / 2,
                    this.cameras.main.height / 2,
                    'GAME PAUSED\n\nPress P to Resume',
                    {
                        fontSize: '32px',
                        fontFamily: 'Arial Black',
                        color: '#FFD700',
                        align: 'center',
                        stroke: '#000000',
                        strokeThickness: 4
                    }
                );
                this.pauseText.setOrigin(0.5);
                this.pauseText.setScrollFactor(0);
                this.pauseText.setDepth(2001);
            } else {
                this.pauseOverlay.setVisible(true);
                this.pauseText.setVisible(true);
            }
        } else {
            this.physics.resume();
            this.gameTimer.paused = false;
            
            if (this.pauseOverlay) {
                this.pauseOverlay.setVisible(false);
                this.pauseText.setVisible(false);
            }
        }
    }

    createAdvancedCombatSounds() {
        // Create sound effect representations (visual since we can't play actual sounds in this context)
        
        this.combatSounds = {
            'sword_clash': { volume: 0.8, pitch: 1.0 },
            'arrow_hit': { volume: 0.6, pitch: 1.2 },
            'axe_chop': { volume: 1.0, pitch: 0.8 },
            'shield_block': { volume: 0.7, pitch: 0.9 },
            'critical_hit': { volume: 1.0, pitch: 1.5 },
            'death_scream': { volume: 0.9, pitch: 0.7 }
        };
    }

    createMassiveBattleEffects() {
        // Create ambient battle atmosphere effects
        
        // Dust clouds from battles
        for (let i = 0; i < 5; i++) {
            const dust = this.add.image(
                this.player.x + (Math.random() - 0.5) * 400,
                this.player.y + (Math.random() - 0.5) * 400,
                'blood'
            );
            dust.setTint(0x8B4513); // Brown dust
            dust.setScale(1 + Math.random() * 1);
            dust.setAlpha(0.2);
            dust.setDepth(1);
            
            this.tweens.add({
                targets: dust,
                x: dust.x + (Math.random() - 0.5) * 100,
                y: dust.y + (Math.random() - 0.5) * 100,
                alpha: 0,
                scale: dust.scaleX * 1.5,
                duration: 5000 + Math.random() * 3000,
                repeat: -1,
                yoyo: true
            });
        }
        
        // Battle banners and flags
        for (let i = 0; i < 3; i++) {
            const banner = this.add.rectangle(
                this.player.x + (Math.random() - 0.5) * 500,
                this.player.y + (Math.random() - 0.5) * 500,
                8, 30,
                Math.random() < 0.5 ? 0x0000FF : 0xFF0000 // Blue or red banners
            );
            banner.setAlpha(0.8);
            banner.setDepth(2);
            
            // Banner waving animation
            this.tweens.add({
                targets: banner,
                rotation: banner.rotation + 0.2,
                duration: 2000,
                repeat: -1,
                yoyo: true
            });
        }
    }

    optimizePerformanceForMassiveBattles() {
        // Performance optimization system for handling 4000+ warriors
        
        this.performanceSettings = {
            maxVisibleWarriors: 200, // Only render warriors near camera
            cullingDistance: 600,     // Distance beyond which warriors are culled
            updateFrequency: 60,      // Update AI every 60ms instead of every frame
            maxParticles: 100,        // Limit particle effects
            lodDistance: 300          // Distance for Level of Detail reduction
        };
        
        // Implement object pooling for warriors
        this.warriorPool = {
            available: [],
            inUse: []
        };
        
        // Create performance monitoring
        this.performanceMetrics = {
            frameRate: 60,
            warriorCount: 0,
            particleCount: 0,
            lastOptimization: 0
        };
    }

    updatePerformanceOptimization() {
        const currentTime = this.time.now;
        
        // Only optimize every 2 seconds
        if (currentTime - this.performanceMetrics.lastOptimization < 2000) return;
        
        this.performanceMetrics.lastOptimization = currentTime;
        
        // Count active warriors
        const totalWarriors = this.goodWarriors.children.entries.length + 
                              this.evilWarriors.children.entries.length;
        this.performanceMetrics.warriorCount = totalWarriors;
        
        // Cull distant warriors (make them invisible but keep them active)
        [...this.goodWarriors.children.entries, ...this.evilWarriors.children.entries].forEach(warrior => {
            if (!warrior.active) return;
            
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y, warrior.x, warrior.y
            );
            
            if (distance > this.performanceSettings.cullingDistance) {
                warrior.setVisible(false);
                // Reduce AI update frequency for distant warriors
                warrior.aiUpdateDelay = 200; // Update every 200ms instead of 60ms
            } else {
                warrior.setVisible(true);
                warrior.aiUpdateDelay = 60;
                
                // Apply Level of Detail
                if (distance > this.performanceSettings.lodDistance) {
                    warrior.setScale(0.8); // Smaller at distance
                } else {
                    warrior.setScale(1.0);
                }
            }
        });
        
        // Adjust quality based on warrior count
        if (totalWarriors > 3500) {
            this.performanceSettings.maxParticles = 50;
        } else if (totalWarriors > 3000) {
            this.performanceSettings.maxParticles = 75;
        } else {
            this.performanceSettings.maxParticles = 100;
        }
    }

    createAdvancedWeaponEffects(attacker, target, weaponType) {
        // Create weapon-specific visual effects
        
        switch (weaponType) {
            case 'piercing': // Arrows, daggers
                // Create arrow trail
                const arrowTrail = this.add.graphics();
                arrowTrail.lineStyle(2, 0xFFD700, 0.8);
                arrowTrail.lineBetween(attacker.x, attacker.y, target.x, target.y);
                arrowTrail.setDepth(6);
                
                this.tweens.add({
                    targets: arrowTrail,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => arrowTrail.destroy()
                });
                
                // Piercing effect
                const pierce = this.add.image(target.x, target.y, 'spark');
                pierce.setTint(0x00FFFF);
                pierce.setScale(0.5);
                pierce.setDepth(7);
                
                this.tweens.add({
                    targets: pierce,
                    scale: 1.5,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => pierce.destroy()
                });
                break;
                
            case 'slashing': // Swords
                // Create sword slash arc
                const slash = this.add.graphics();
                slash.lineStyle(4, 0xC0C0C0, 0.9);
                const angle = Phaser.Math.Angle.Between(attacker.x, attacker.y, target.x, target.y);
                slash.arc(attacker.x, attacker.y, 40, angle - 0.5, angle + 0.5);
                slash.setDepth(6);
                
                this.tweens.add({
                    targets: slash,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => slash.destroy()
                });
                break;
                
            case 'crushing': // Hammers, axes
                // Create impact shockwave
                const shockwave = this.add.graphics();
                shockwave.lineStyle(3, 0xFFFF00, 0.8);
                shockwave.strokeCircle(target.x, target.y, 20);
                shockwave.setDepth(6);
                
                this.tweens.add({
                    targets: shockwave,
                    scaleX: 3,
                    scaleY: 3,
                    alpha: 0,
                    duration: 400,
                    onComplete: () => shockwave.destroy()
                });
                
                // Screen shake for heavy weapons
                this.cameras.main.shake(150, 0.015);
                break;
        }
    }

    // ============== MISSING CORE FUNCTIONS ==============
    
    createDamageEffects() {
        // Create damage number textures for different damage types
        const damageColors = [
            { color: 0xFF0000, name: 'critical' },  // Red for critical hits
            { color: 0xFFFFFF, name: 'normal' },    // White for normal damage
            { color: 0xFFFF00, name: 'reduced' },   // Yellow for reduced damage
            { color: 0x00FF00, name: 'heal' }       // Green for healing
        ];

        damageColors.forEach(damage => {
            const graphics = this.add.graphics();
            graphics.fillStyle(damage.color, 1);
            graphics.fillRect(0, 0, 24, 16);
            graphics.generateTexture(`damage_${damage.name}`, 24, 16);
            graphics.destroy();
        });
    }

    createAdvancedDamageSystem() {
        // Initialize damage matrix for class effectiveness
        this.damageMatrix = {
            'Elf Archer': {
                'elf': 0.8, 'knight': 0.9, 'dwarf': 0.9,
                'orc': 1.3, 'goblin': 1.4, 'troll': 0.7
            },
            'Human Knight': {
                'elf': 0.9, 'knight': 0.8, 'dwarf': 0.9,
                'orc': 1.2, 'goblin': 1.1, 'troll': 1.3
            },
            'Dwarf Berserker': {
                'elf': 0.9, 'knight': 0.9, 'dwarf': 0.8,
                'orc': 1.4, 'goblin': 1.2, 'troll': 1.1
            }
        };

        // NPC vs NPC damage matrix
        this.npcDamageMatrix = {
            'elf': { 'orc': 1.2, 'goblin': 1.3, 'troll': 0.8, 'elf': 0.3, 'knight': 0.3, 'dwarf': 0.3 },
            'knight': { 'orc': 1.1, 'goblin': 1.0, 'troll': 1.4, 'elf': 0.3, 'knight': 0.3, 'dwarf': 0.3 },
            'dwarf': { 'orc': 1.3, 'goblin': 1.1, 'troll': 1.2, 'elf': 0.3, 'knight': 0.3, 'dwarf': 0.3 },
            'orc': { 'elf': 1.1, 'knight': 1.0, 'dwarf': 0.9, 'orc': 0.4, 'goblin': 0.4, 'troll': 0.4 },
            'goblin': { 'elf': 1.0, 'knight': 0.9, 'dwarf': 0.8, 'orc': 0.4, 'goblin': 0.4, 'troll': 0.4 },
            'troll': { 'elf': 1.2, 'knight': 0.8, 'dwarf': 1.0, 'orc': 0.4, 'goblin': 0.4, 'troll': 0.4 }
        };

        // Damage types
        this.damageTypes = {
            'physical': { multiplier: 1.0, color: 0xFFFFFF },
            'piercing': { multiplier: 1.2, color: 0x00FFFF },
            'slashing': { multiplier: 1.1, color: 0xFF6600 },
            'crushing': { multiplier: 1.3, color: 0x8B0000 }
        };
    }

    createEnhancedAnimatedPlayer() {
        // Create player animation frames
        for (let frame = 1; frame <= 2; frame++) {
            const graphics = this.add.graphics();
            
            // Basic player sprite
            graphics.fillStyle(0x4169E1, 1); // Blue
            graphics.fillCircle(20, 20, 16);
            graphics.fillStyle(0x87CEEB, 1);
            graphics.fillRect(16, 16, 8, 8);
            graphics.fillStyle(0xFFD700, 1);
            graphics.fillCircle(20, 20, 4);
            
            // Slight movement for frame 2
            if (frame === 2) {
                graphics.x += 1;
                graphics.y += 1;
            }
            
            graphics.generateTexture(`player_${frame}`, 40, 40);
            graphics.destroy();
        }
        
        this.anims.create({
            key: 'player_walk',
            frames: [{ key: 'player_1' }, { key: 'player_2' }],
            frameRate: 6,
            repeat: -1
        });
    }

    createEnhancedElfWarrior() {
        // Elf warrior sprite
        const graphics = this.add.graphics();
        graphics.fillStyle(0x0080FF, 1); // Blue for good
        graphics.fillEllipse(18, 18, 30, 20);
        graphics.fillStyle(0xFFD700, 1);
        graphics.fillTriangle(8, 12, 12, 8, 12, 16);
        graphics.fillTriangle(28, 12, 24, 8, 24, 16);
        graphics.generateTexture('elf_1', 36, 36);
        graphics.destroy();
        
        this.anims.create({
            key: 'elf_walk',
            frames: [{ key: 'elf_1' }],
            frameRate: 6,
            repeat: -1
        });
    }

    createEnhancedHumanKnight() {
        // Knight sprite
        const graphics = this.add.graphics();
        graphics.fillStyle(0x0080FF, 1); // Blue for good
        graphics.fillCircle(18, 18, 16);
        graphics.fillStyle(0xFFD700, 1);
        graphics.fillCircle(18, 12, 8); // Helmet
        graphics.fillStyle(0xC0C0C0, 1);
        graphics.fillRect(30, 8, 2, 16); // Sword
        graphics.generateTexture('knight_1', 36, 36);
        graphics.destroy();
        
        this.anims.create({
            key: 'knight_walk',
            frames: [{ key: 'knight_1' }],
            frameRate: 6,
            repeat: -1
        });
    }

    createEnhancedDwarfWarrior() {
        // Dwarf sprite
        const graphics = this.add.graphics();
        graphics.fillStyle(0x0080FF, 1); // Blue for good
        graphics.fillCircle(18, 20, 16);
        graphics.fillStyle(0xFFD700, 1);
        graphics.fillEllipse(18, 26, 20, 12); // Beard
        graphics.fillStyle(0xC0C0C0, 1);
        graphics.fillRect(30, 10, 4, 16); // Axe
        graphics.generateTexture('dwarf_1', 36, 36);
        graphics.destroy();
        
        this.anims.create({
            key: 'dwarf_walk',
            frames: [{ key: 'dwarf_1' }],
            frameRate: 6,
            repeat: -1
        });
    }

    createEnhancedOrcWarrior() {
        // Orc sprite
        const graphics = this.add.graphics();
        graphics.fillStyle(0x8B0000, 1); // Red for evil
        graphics.fillCircle(18, 18, 18);
        graphics.fillStyle(0xFF0000, 1);
        graphics.fillTriangle(14, 20, 16, 16, 18, 20); // Tusks
        graphics.fillTriangle(22, 20, 20, 16, 18, 20);
        graphics.fillStyle(0x000000, 1);
        graphics.fillRect(30, 10, 6, 16); // Club
        graphics.generateTexture('orc_1', 36, 36);
        graphics.destroy();
        
        this.anims.create({
            key: 'orc_walk',
            frames: [{ key: 'orc_1' }],
            frameRate: 4,
            repeat: -1
        });
    }

    createEnhancedGoblinWarrior() {
        // Goblin sprite
        const graphics = this.add.graphics();
        graphics.fillStyle(0x8B0000, 1); // Red for evil
        graphics.fillCircle(18, 20, 12);
        graphics.fillStyle(0x000000, 1);
        graphics.fillEllipse(8, 16, 8, 12); // Large ears
        graphics.fillEllipse(28, 16, 8, 12);
        graphics.fillStyle(0xFF0000, 1);
        graphics.fillRect(30, 14, 2, 8); // Dagger
        graphics.generateTexture('goblin_1', 36, 36);
        graphics.destroy();
        
        this.anims.create({
            key: 'goblin_walk',
            frames: [{ key: 'goblin_1' }],
            frameRate: 8,
            repeat: -1
        });
    }

    createEnhancedTrollWarrior() {
        // Troll sprite
        const graphics = this.add.graphics();
        graphics.fillStyle(0x8B0000, 1); // Red for evil
        graphics.fillCircle(18, 18, 20); // Larger
        graphics.fillStyle(0xFF0000, 1);
        graphics.fillTriangle(6, 20, 10, 16, 8, 24); // Claws
        graphics.fillTriangle(30, 20, 26, 16, 28, 24);
        graphics.fillStyle(0x8B4513, 1);
        graphics.fillRect(28, 8, 8, 20); // Big club
        graphics.generateTexture('troll_1', 36, 36);
        graphics.destroy();
        
        this.anims.create({
            key: 'troll_walk',
            frames: [{ key: 'troll_1' }],
            frameRate: 2,
            repeat: -1
        });
    }

    createPlayerWithSelectedClass() {
        // Create player sprite
        this.player = this.physics.add.sprite(0, 0, 'player_1');
        this.player.setCollideWorldBounds(false);
        this.player.setDepth(10);
        this.player.faction = 'good'; // Default faction
        this.playerFaction = 'good';
        this.playerSpeed = 100;
        
        // Set player stats based on selected class with proper attack properties
        let classStats;
        if (this.playerClass === 'Elf Archer') {
            classStats = { hp: 80, damage: 25, speed: 140, range: 120, cooldown: 800 };
            this.player.className = 'archer';
        } else if (this.playerClass === 'Human Knight') {
            classStats = { hp: 120, damage: 30, speed: 100, range: 60, cooldown: 1000 };
            this.player.className = 'swordsman';
        } else if (this.playerClass === 'Dwarf Berserker') {
            classStats = { hp: 110, damage: 35, speed: 90, range: 70, cooldown: 700 };
            this.player.className = 'berserker';
        } else {
            // Fallback
            classStats = { hp: 100, damage: 25, speed: 100, range: 60, cooldown: 1000 };
            this.player.className = 'swordsman';
        }
        
        // Apply stats to player
        this.player.health = classStats.hp;
        this.player.maxHealth = classStats.hp;
        this.player.damage = classStats.damage;
        this.player.range = classStats.range;
        this.player.attackCooldown = classStats.cooldown;
        this.player.lastAttackTime = 0;
        this.playerSpeed = classStats.speed;
        
        this.player.play('player_walk');
    }

    createEnhancedUI(screenWidth, screenHeight) {
        // Score panel
        const scoreBg = this.add.rectangle(120, 40, 200, 60, 0x000000);
        scoreBg.setAlpha(0.9);
        scoreBg.setScrollFactor(0);
        scoreBg.setDepth(1000);
        
        this.scoreText = this.add.text(120, 40, 'Score: 0', {
            fontSize: '22px',
            fontFamily: 'Arial Black',
            color: '#FFD700'
        });
        this.scoreText.setOrigin(0.5);
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(1001);

        // Timer panel
        const timerBg = this.add.rectangle(screenWidth - 120, 40, 200, 60, 0x000000);
        timerBg.setAlpha(0.9);
        timerBg.setScrollFactor(0);
        timerBg.setDepth(1000);
        
        this.timerText = this.add.text(screenWidth - 120, 40, 'Time: 90', {
            fontSize: '22px',
            fontFamily: 'Arial Black',
            color: '#FF6B6B'
        });
        this.timerText.setOrigin(0.5);
        this.timerText.setScrollFactor(0);
        this.timerText.setDepth(1001);

        // Battle intensity display
        this.battleIntensityText = this.add.text(screenWidth / 2, 40, 'BATTLE STARTING...', {
            fontSize: '18px',
            fontFamily: 'Arial Black',
            color: '#0080FF'
        });
        this.battleIntensityText.setOrigin(0.5);
        this.battleIntensityText.setScrollFactor(0);
        this.battleIntensityText.setDepth(1001);
    }

    setupControls() {
        // Traditional controls for desktop
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D,SPACE');
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

        this.escKey.on('down', () => {
            this.scene.start('MenuScene');
        });

        this.pKey.on('down', () => {
            this.togglePause();
        });
        
        // Mobile-friendly touch controls
        this.setupMobileControls();
    }
    
    setupMobileControls() {
        // Enable pointer (touch/mouse) movement
        this.input.on('pointerdown', (pointer) => {
            this.pointerDown = true;
            this.targetX = pointer.worldX;
            this.targetY = pointer.worldY;
        });
        
        this.input.on('pointermove', (pointer) => {
            if (this.pointerDown) {
                this.targetX = pointer.worldX;
                this.targetY = pointer.worldY;
            }
        });
        
        this.input.on('pointerup', () => {
            this.pointerDown = false;
        });
        
        // Add virtual joystick for mobile (simple implementation)
        this.createVirtualJoystick();
    }
    
    createVirtualJoystick() {
        // Simple virtual joystick (will be improved later)
        this.joystickBase = this.add.circle(100, this.cameras.main.height - 100, 40, 0x444444, 0.5);
        this.joystickBase.setScrollFactor(0);
        this.joystickBase.setDepth(2000);
        
        this.joystickKnob = this.add.circle(100, this.cameras.main.height - 100, 20, 0x888888, 0.8);
        this.joystickKnob.setScrollFactor(0);
        this.joystickKnob.setDepth(2001);
        
        this.joystickKnob.setInteractive();
        this.input.setDraggable(this.joystickKnob);
        
        this.input.on('drag', (pointer, gameObject) => {
            if (gameObject === this.joystickKnob) {
                const distance = Phaser.Math.Distance.Between(
                    this.joystickBase.x, this.joystickBase.y,
                    pointer.x, pointer.y
                );
                
                if (distance <= 40) {
                    gameObject.x = pointer.x;
                    gameObject.y = pointer.y;
                } else {
                    const angle = Phaser.Math.Angle.Between(
                        this.joystickBase.x, this.joystickBase.y,
                        pointer.x, pointer.y
                    );
                    gameObject.x = this.joystickBase.x + Math.cos(angle) * 40;
                    gameObject.y = this.joystickBase.y + Math.sin(angle) * 40;
                }
                
                // Calculate movement vector
                this.joystickVector = {
                    x: (gameObject.x - this.joystickBase.x) / 40,
                    y: (gameObject.y - this.joystickBase.y) / 40
                };
            }
        });
        
        this.input.on('dragend', (pointer, gameObject) => {
            if (gameObject === this.joystickKnob) {
                gameObject.x = this.joystickBase.x;
                gameObject.y = this.joystickBase.y;
                this.joystickVector = { x: 0, y: 0 };
            }
        });
        
        this.joystickVector = { x: 0, y: 0 };
    }

    startEnhancedTimer() {
        this.gameTimer = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                this.timerText.setText('Time: ' + this.timeLeft);
                
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
        // Simple atmospheric effects
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
                particle.setScrollFactor(0);
                
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

    updateAllWarriorAI() {
        // Simple AI update - will be expanded
        const currentTime = this.time.now;
        
        [...this.goodWarriors.children.entries, ...this.evilWarriors.children.entries].forEach(warrior => {
            if (!warrior.active) return;
            
            // Basic AI movement
            if (Math.random() < 0.1) {
                const angle = Math.random() * Math.PI * 2;
                warrior.setVelocity(
                    Math.cos(angle) * (warrior.speed || 50),
                    Math.sin(angle) * (warrior.speed || 50)
                );
            }
        });
    }

    updateVisibleWarriorAI() {
        // Update AI more frequently for active combat
        const currentTime = this.time.now;
        
        this.visibleWarriors.forEach(warrior => {
            if (!warrior.active || !warrior.needsAIUpdate) return;
            
            // More frequent AI updates for active combat (every 50-150ms)
            if (!warrior.lastAIUpdate) warrior.lastAIUpdate = 0;
            if (currentTime - warrior.lastAIUpdate < 50 + Math.random() * 100) return;
            
            warrior.lastAIUpdate = currentTime;
            this.updateSingleWarriorAI(warrior);
        });
    }
    
    updateSingleWarriorAI(warrior) {
        if (!warrior || !warrior.active) return;
        
        // More aggressive AI - always looking for combat
        const currentTime = this.time.now;
        
        // Find nearest enemy
        const nearestEnemy = this.findNearestEnemy(warrior);
        
        if (nearestEnemy) {
            const distance = Phaser.Math.Distance.Between(
                warrior.x, warrior.y, nearestEnemy.x, nearestEnemy.y
            );
            
            // Different behavior based on class
            this.executeClassSpecificBehavior(warrior, nearestEnemy, distance);
        } else {
            // No enemy found - patrol aggressively looking for combat
            this.executePatrolBehavior(warrior);
        }
    }
    
    findNearestEnemy(warrior) {
        const enemyFaction = warrior.faction === 'good' ? 'evil' : 'good';
        const searchRadius = warrior.attackRange * 3; // Search 3x attack range
        
        let nearestEnemy = null;
        let nearestDistance = Infinity;
        
        // Check visible warriors first for performance
        for (let other of this.visibleWarriors) {
            if (other.faction === enemyFaction && other.active) {
                const distance = Phaser.Math.Distance.Between(
                    warrior.x, warrior.y, other.x, other.y
                );
                
                if (distance < searchRadius && distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestEnemy = other;
                }
            }
        }
        
        return nearestEnemy;
    }
    
    executeClassSpecificBehavior(warrior, enemy, distance) {
        const attackRange = warrior.attackRange || 60;
        const currentTime = this.time.now;
        
        // Class-specific AI behavior
        switch (warrior.className) {
            case 'archer':
                this.executeArcherBehavior(warrior, enemy, distance, attackRange);
                break;
            case 'swordsman':
            case 'shield_warrior':
                this.executeMeleeBehavior(warrior, enemy, distance, attackRange);
                break;
            case 'dual_wielder':
            case 'axeman':
            case 'dual_axe':
                this.executeAggressiveMeleeBehavior(warrior, enemy, distance, attackRange);
                break;
            case 'berserker':
                this.executeBerserkerBehavior(warrior, enemy, distance, attackRange);
                break;
            case 'assassin':
                this.executeAssassinBehavior(warrior, enemy, distance, attackRange);
                break;
            case 'tank':
                this.executeTankBehavior(warrior, enemy, distance, attackRange);
                break;
            default:
                this.executeMeleeBehavior(warrior, enemy, distance, attackRange);
        }
    }
    
    executeArcherBehavior(warrior, enemy, distance, attackRange) {
        if (distance > attackRange) {
            // Move closer but maintain distance
            const optimalDistance = attackRange * 0.8;
            if (distance > optimalDistance) {
                this.moveTowardTarget(warrior, enemy, 0.6);
            }
        } else if (distance < attackRange * 0.5) {
            // Too close - back away while shooting
            this.moveAwayFromTarget(warrior, enemy, 0.8);
            this.attemptRangedAttack(warrior, enemy);
        } else {
            // Perfect range - shoot and strafe
            this.strafeAroundTarget(warrior, enemy);
            this.attemptRangedAttack(warrior, enemy);
        }
    }
    
    executeMeleeBehavior(warrior, enemy, distance, attackRange) {
        if (distance > attackRange) {
            // Charge toward enemy
            this.moveTowardTarget(warrior, enemy, 1.0);
        } else {
            // In range - attack and move tactically
            this.attemptMeleeAttack(warrior, enemy);
            if (Math.random() < 0.3) {
                this.circleAroundTarget(warrior, enemy);
            }
        }
    }
    
    executeAggressiveMeleeBehavior(warrior, enemy, distance, attackRange) {
        // Dual wielders are more aggressive
        if (distance > attackRange * 1.2) {
            this.moveTowardTarget(warrior, enemy, 1.2); // Faster approach
        } else {
            this.attemptMeleeAttack(warrior, enemy);
            // More aggressive positioning
            if (Math.random() < 0.5) {
                this.moveTowardTarget(warrior, enemy, 0.8);
            }
        }
    }
    
    executeBerserkerBehavior(warrior, enemy, distance, attackRange) {
        // Always charge, very aggressive
        if (distance > attackRange) {
            this.moveTowardTarget(warrior, enemy, 1.3); // Very fast
        } else {
            this.attemptMeleeAttack(warrior, enemy);
            // Berserkers never back down
            this.moveTowardTarget(warrior, enemy, 0.5);
        }
    }
    
    executeAssassinBehavior(warrior, enemy, distance, attackRange) {
        // Hit and run tactics
        if (distance > attackRange) {
            this.moveTowardTarget(warrior, enemy, 1.1); // Fast approach
        } else {
            this.attemptMeleeAttack(warrior, enemy);
            // Hit and run - back away after attack
            if (warrior.lastAttackTime && this.time.now - warrior.lastAttackTime < 500) {
                this.moveAwayFromTarget(warrior, enemy, 1.0);
            }
        }
    }
    
    executeTankBehavior(warrior, enemy, distance, attackRange) {
        // Slow but steady advance
        if (distance > attackRange) {
            this.moveTowardTarget(warrior, enemy, 0.7); // Slower movement
        } else {
            this.attemptMeleeAttack(warrior, enemy);
            // Hold ground
            warrior.setVelocity(0, 0);
        }
    }
    
    findAndAttackNearbyEnemy(warrior) {
        const range = warrior.attackRange || 60;
        const enemyFaction = warrior.faction === 'good' ? 'evil' : 'good';
        
        // Check only nearby warriors for performance
        for (let other of this.visibleWarriors) {
            if (other.faction === enemyFaction && other.active) {
                const distance = Phaser.Math.Distance.Between(
                    warrior.x, warrior.y, other.x, other.y
                );
                
                if (distance < range) {
                    this.performSimpleCombat(warrior, other);
                    break; // Only attack one target
                }
            }
        }
    }
    
    performSimpleCombat(attacker, target) {
        // Simple damage system
        const damage = (attacker.damage || 20) + Math.random() * 10;
        target.health -= damage;
        
        // Create simple damage effect
        this.createSimpleDamageEffect(target, damage);
        
        if (target.health <= 0) {
            this.handleWarriorDeath(target);
        }
    }
    
    createSimpleDamageEffect(target, damage) {
        // Simple damage number
        const damageText = this.add.text(
            target.x, target.y - 20,
            Math.floor(damage).toString(),
            { fontSize: '12px', color: '#ff0000' }
        );
        damageText.setDepth(10);
        
        this.tweens.add({
            targets: damageText,
            y: damageText.y - 30,
            alpha: 0,
            duration: 800,
            onComplete: () => damageText.destroy()
        });
    }
    
    handleWarriorDeath(warrior) {
        // Simple death effect
        const deathEffect = this.add.circle(warrior.x, warrior.y, 15, 0xff0000, 0.6);
        deathEffect.setDepth(8);
        
        this.tweens.add({
            targets: deathEffect,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 500,
            onComplete: () => deathEffect.destroy()
        });
        
        // Return warrior to pool instead of destroying
        this.returnWarriorToPool(warrior);
    }

    updateVisibleWarriorHealthBars() {
        // Only update health bars for visible warriors
        // This is a placeholder - health bars will be optimized separately
    }

    // ============== SMART WARRIOR POOLING SYSTEM ==============
    
    createWarriorFromPool(x, y, faction, className = null) {
        let warrior;
        
        // Try to get warrior from pool
        if (this.warriorPool.available.length > 0) {
            warrior = this.warriorPool.available.pop();
            warrior.setActive(true);
            warrior.setVisible(true);
            warrior.setPosition(x, y);
        } else {
            // Create new warrior if pool is empty
            warrior = this.createFreshWarrior(x, y, faction, className);
        }
        
        // Setup warrior properties
        this.setupWarriorProperties(warrior, faction, className);
        
        // Move to in-use pool
        this.warriorPool.inUse.push(warrior);
        
        return warrior;
    }
    
    createFreshWarrior(x, y, faction, className = null) {
        // Determine class if not specified
        if (!className) {
            const availableClasses = faction === 'good' 
                ? ['archer', 'swordsman', 'dual_wielder', 'shield_warrior', 'axeman', 'dual_axe']
                : ['berserker', 'assassin', 'tank'];
            className = availableClasses[Math.floor(Math.random() * availableClasses.length)];
        }
        
        const classData = this.characterClasses[className];
        const warrior = this.physics.add.sprite(x, y, classData.sprite);
        
        // Basic setup
        warrior.setCollideWorldBounds(false);
        warrior.setDepth(5);
        warrior.setScale(0.8 + Math.random() * 0.4);
        
        return warrior;
    }
    
    setupWarriorProperties(warrior, faction, className = null) {
        if (!className) {
            const availableClasses = faction === 'good' 
                ? ['archer', 'swordsman', 'dual_wielder', 'shield_warrior', 'axeman', 'dual_axe']
                : ['berserker', 'assassin', 'tank'];
            className = availableClasses[Math.floor(Math.random() * availableClasses.length)];
        }
        
        const classData = this.characterClasses[className];
        
        // Set properties
        warrior.faction = faction;
        warrior.className = className;
        warrior.health = classData.hp + Math.floor(Math.random() * 10);
        warrior.maxHealth = warrior.health;
        warrior.damage = classData.damage + Math.floor(Math.random() * 5);
        warrior.speed = (classData.speed || 60) + Math.random() * 30;
        warrior.attackRange = classData.range || 40;
        warrior.attackCooldown = classData.cooldown || 1500;
        
        // AI states
        warrior.aiState = 'patrol';
        warrior.target = null;
        warrior.lastAttackTime = 0;
        warrior.lastStateChange = this.time.now;
        warrior.patrolAngle = Math.random() * Math.PI * 2;
        warrior.lastPosition = { x: warrior.x, y: warrior.y };
        warrior.stuckCounter = 0;
        warrior.isVisible = true;
        warrior.lastVisibilityCheck = 0;
        
        // Play animation
        warrior.play(classData.anim);
        
        // Set faction tint
        warrior.setTint(faction === 'good' ? 0x90EE90 : 0xFF6B6B);
        
        // Add to appropriate group
        if (faction === 'good') {
            this.goodWarriors.add(warrior);
        } else {
            this.evilWarriors.add(warrior);
        }
    }
    
    returnWarriorToPool(warrior) {
        if (!warrior) return;
        
        // Remove from in-use pool
        const index = this.warriorPool.inUse.indexOf(warrior);
        if (index > -1) {
            this.warriorPool.inUse.splice(index, 1);
        }
        
        // Deactivate and hide
        warrior.setActive(false);
        warrior.setVisible(false);
        warrior.setVelocity(0, 0);
        
        // Reset properties
        warrior.target = null;
        warrior.aiState = 'patrol';
        
        // Return to available pool if there's space
        if (this.warriorPool.available.length < this.warriorPool.maxSize) {
            this.warriorPool.available.push(warrior);
        } else {
            // Destroy if pool is full
            warrior.destroy();
        }
    }

    // ============== SMART CULLING SYSTEM ==============
    
    updateWarriorVisibilityAndCulling() {
        const currentTime = this.time.now;
        
        // Only update culling every 100ms for performance
        if (currentTime - this.lastCullingUpdate < 100) return;
        this.lastCullingUpdate = currentTime;
        
        const playerX = this.player.x;
        const playerY = this.player.y;
        const visibilityRadius = 600; // Warriors beyond this are hidden
        const updateRadius = 400;     // Only warriors within this get AI updates
        const removeRadius = 1200;    // Warriors beyond this are returned to pool
        
        this.visibleWarriors = [];
        
        [...this.goodWarriors.children.entries, ...this.evilWarriors.children.entries].forEach(warrior => {
            if (!warrior.active) return;
            
            const distance = Phaser.Math.Distance.Between(playerX, playerY, warrior.x, warrior.y);
            
            if (distance > removeRadius) {
                // Too far - return to pool
                this.returnWarriorToPool(warrior);
            } else if (distance > visibilityRadius) {
                // Hide but keep active
                warrior.setVisible(false);
                warrior.isVisible = false;
                warrior.needsAIUpdate = false;
            } else {
                // Visible range
                warrior.setVisible(true);
                warrior.isVisible = true;
                warrior.needsAIUpdate = distance < updateRadius;
                
                if (warrior.needsAIUpdate) {
                    this.visibleWarriors.push(warrior);
                }
            }
        });
        
        // Spawn new warriors if we're below target
        this.maintainWarriorDensityAroundPlayer();
    }
    
    maintainWarriorDensityAroundPlayer() {
        const activeWarriors = this.warriorPool.inUse.length;
        const targetActiveWarriors = this.getTargetWarriorCount();
        
        if (activeWarriors < targetActiveWarriors) {
            const toSpawn = Math.min(3, targetActiveWarriors - activeWarriors);
            
            for (let i = 0; i < toSpawn; i++) {
                this.spawnWarriorNearPlayer();
            }
        }
    }
    
    getTargetWarriorCount() {
        switch (this.performanceMode) {
            case 'high': return 100;      // Reduced from 400
            case 'balanced': return 50;   // Reduced from 200  
            case 'performance': return 25; // Reduced from 100
            default: return 50;
        }
    }
    
    spawnWarriorNearPlayer() {
        if (!this.player) return; // Safety check
        
        const angle = Math.random() * Math.PI * 2;
        const distance = 400 + Math.random() * 400; // Spawn between 400-800 units from player
        const x = this.player.x + Math.cos(angle) * distance;
        const y = this.player.y + Math.sin(angle) * distance;
        
        // Determine faction (prefer opposite to player for more action)
        const faction = Math.random() < 0.7 
            ? (this.playerFaction === 'good' ? 'evil' : 'good')
            : this.playerFaction;
        
        this.createWarriorFromPool(x, y, faction);
    }

    // ============== TACTICAL MOVEMENT FUNCTIONS ==============
    
    moveTowardTarget(warrior, target, speedMultiplier = 1.0) {
        const angle = Phaser.Math.Angle.Between(warrior.x, warrior.y, target.x, target.y);
        const speed = (warrior.speed || 60) * speedMultiplier;
        
        warrior.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
    }
    
    moveAwayFromTarget(warrior, target, speedMultiplier = 1.0) {
        const angle = Phaser.Math.Angle.Between(target.x, target.y, warrior.x, warrior.y);
        const speed = (warrior.speed || 60) * speedMultiplier;
        
        warrior.setVelocity(
            Math.cos(angle) * speed,
            Math.sin(angle) * speed
        );
    }
    
    strafeAroundTarget(warrior, target) {
        const angleToTarget = Phaser.Math.Angle.Between(warrior.x, warrior.y, target.x, target.y);
        const strafeAngle = angleToTarget + Math.PI * 0.5; // 90 degrees offset
        const speed = (warrior.speed || 60) * 0.7;
        
        warrior.setVelocity(
            Math.cos(strafeAngle) * speed,
            Math.sin(strafeAngle) * speed
        );
    }
    
    circleAroundTarget(warrior, target) {
        if (!warrior.circleDirection) {
            warrior.circleDirection = Math.random() < 0.5 ? 1 : -1;
        }
        
        const angleToTarget = Phaser.Math.Angle.Between(warrior.x, warrior.y, target.x, target.y);
        const circleAngle = angleToTarget + (Math.PI * 0.3 * warrior.circleDirection);
        const speed = (warrior.speed || 60) * 0.6;
        
        warrior.setVelocity(
            Math.cos(circleAngle) * speed,
            Math.sin(circleAngle) * speed
        );
    }
    
    executePatrolBehavior(warrior) {
        // Aggressive patrol - looking for enemies
        if (!warrior.patrolTarget || Math.random() < 0.1) {
            // Set new patrol direction toward potential combat
            warrior.patrolAngle = Math.random() * Math.PI * 2;
            warrior.patrolTarget = {
                x: warrior.x + Math.cos(warrior.patrolAngle) * 200,
                y: warrior.y + Math.sin(warrior.patrolAngle) * 200
            };
        }
        
        // Move toward patrol target with some randomness
        const speed = (warrior.speed || 60) * 0.8;
        warrior.setVelocity(
            Math.cos(warrior.patrolAngle) * speed + (Math.random() - 0.5) * 20,
            Math.sin(warrior.patrolAngle) * speed + (Math.random() - 0.5) * 20
        );
    }
    
    // ============== COMBAT FUNCTIONS ==============
    
    attemptRangedAttack(warrior, target) {
        const currentTime = this.time.now;
        const cooldown = warrior.attackCooldown || 1000;
        
        if (!warrior.lastAttackTime) warrior.lastAttackTime = 0;
        
        if (currentTime - warrior.lastAttackTime > cooldown) {
            warrior.lastAttackTime = currentTime;
            this.executeRangedAttack(warrior, target);
        }
    }
    
    attemptMeleeAttack(warrior, target) {
        const currentTime = this.time.now;
        const cooldown = warrior.attackCooldown || 1500;
        
        if (!warrior.lastAttackTime) warrior.lastAttackTime = 0;
        
        if (currentTime - warrior.lastAttackTime > cooldown) {
            warrior.lastAttackTime = currentTime;
            this.executeMeleeAttack(warrior, target);
        }
    }
    
    executeRangedAttack(warrior, target) {
        // Create arrow/projectile effect
        this.createProjectileEffect(warrior, target);
        
        // Apply damage after slight delay (projectile travel time)
        this.time.delayedCall(200, () => {
            if (target.active) {
                this.performCombatDamage(warrior, target, 'piercing');
            }
        });
    }
    
    executeMeleeAttack(warrior, target) {
        // Immediate melee attack
        this.createMeleeEffect(warrior, target);
        this.performCombatDamage(warrior, target, 'slashing');
    }
    
    createProjectileEffect(attacker, target) {
        // Create arrow trail
        const arrow = this.add.graphics();
        arrow.lineStyle(2, 0xFFD700, 0.9);
        arrow.lineBetween(attacker.x, attacker.y, target.x, target.y);
        arrow.setDepth(6);
        
        this.tweens.add({
            targets: arrow,
            alpha: 0,
            duration: 300,
            onComplete: () => arrow.destroy()
        });
    }
    
    createMeleeEffect(attacker, target) {
        // Create slash effect
        const slash = this.add.graphics();
        slash.lineStyle(3, 0xFFFFFF, 0.8);
        const angle = Phaser.Math.Angle.Between(attacker.x, attacker.y, target.x, target.y);
        slash.arc(target.x, target.y, 30, angle - 0.3, angle + 0.3);
        slash.setDepth(6);
        
        this.tweens.add({
            targets: slash,
            alpha: 0,
            duration: 200,
            onComplete: () => slash.destroy()
        });
    }
    
    performCombatDamage(attacker, target, weaponType) {
        if (!attacker || !target || !target.active) return;
        
        const baseDamage = attacker.damage || 20;
        const damage = baseDamage + Math.random() * 10;
        
        target.health -= damage;
        
        // Create damage effect
        this.createSimpleDamageEffect(target, damage);
        
        if (target.health <= 0) {
            this.handleWarriorDeath(target);
        }
    }

    createDamageNumber(x, y, damage, color = '#FF4444') {
        // Create floating damage number
        const damageText = this.add.text(x, y, Math.round(damage).toString(), {
            fontSize: '16px',
            fontFamily: 'Arial Black',
            color: color,
            stroke: '#000000',
            strokeThickness: 2
        });
        
        damageText.setOrigin(0.5);
        damageText.setDepth(100);
        
        // Animate the damage number
        this.tweens.add({
            targets: damageText,
            y: y - 40,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => {
                damageText.destroy();
            }
        });
    }
}  // Close the GameSceneSimple class
