import { ProfessionalUI } from '../utils/ProfessionalUI.js';

export class GameSceneSimpleFast extends Phaser.Scene {
    constructor() {
        super({ key: 'GameSceneSimpleFast' });
        this.player = null;
        this.score = 0;
        this.gameOver = false;
        this.enemies = null;
        this.characterClasses = {};
        this.effectsPool = [];
        this.particleSystemsPool = [];
        this.audioContext = null;
        
        // Wave system for progressive difficulty
        this.currentWave = 1;
        this.enemiesInWave = 5;
        this.enemiesKilledInWave = 0;
        this.waveStartTime = 0;
    }

    init(data) {
        console.log('GameSceneSimpleFast: init() called with data:', data);
        this.sceneData = data;
        
        // Add error handling to prevent scene crashes
        this.scene.setActive(true);
        this.scene.setVisible(true);
    }

    preload() {
        try {
            // Create professional sprites with enhanced graphics
            this.createProfessionalSprites();
            
            // Create professional UI textures FIRST
            this.createProfessionalUITextures();
            
            // Create visual effects
            this.createVisualEffects();
            
            // Initialize audio context for better sound
            this.initializeAudio();
        } catch (error) {
            console.error('Error in GameSceneSimpleFast preload:', error);
            // Don't let preload errors crash the scene
        }
    }

    createProfessionalSprites() {
        // Professional warrior sprite creation with AAA-quality graphics
        console.log('Creating professional warrior sprites...');
        
        const classSprites = {
            // Noble Good Classes with professional artwork
            archer: { 
                baseColor: 0x228B22, 
                accentColor: 0x32CD32, 
                size: 14, 
                weapon: 'bow',
                detail: { eyes: 0xFFFFFF, armor: 0x4B5320 }
            },      
            swordsman: { 
                baseColor: 0x4169E1, 
                accentColor: 0x6495ED, 
                size: 15, 
                weapon: 'sword',
                detail: { eyes: 0xFFFFFF, armor: 0x2F4F4F }
            },   
            dual_wielder: { 
                baseColor: 0x8B4513, 
                accentColor: 0xCD853F, 
                size: 14, 
                weapon: 'dual_swords',
                detail: { eyes: 0xFFFFFF, armor: 0x654321 }
            }, 
            shield_warrior: { 
                baseColor: 0x2E86C1, 
                accentColor: 0x5DADE2, 
                size: 16, 
                weapon: 'shield',
                detail: { eyes: 0xFFFFFF, armor: 0x1C4E80 }
            }, 
            axeman: { 
                baseColor: 0x5D6D7E, 
                accentColor: 0x85929E, 
                size: 15, 
                weapon: 'axe',
                detail: { eyes: 0xFFFFFF, armor: 0x2C3E50 }
            },      
            dual_axe: { 
                baseColor: 0x34495E, 
                accentColor: 0x5D6D7E, 
                size: 16, 
                weapon: 'dual_axes',
                detail: { eyes: 0xFFFFFF, armor: 0x212F3C }
            },    
            
            // Menacing Evil Classes with dark, intimidating designs
            berserker: { 
                baseColor: 0xE74C3C, 
                accentColor: 0xF1948A, 
                size: 18, 
                weapon: 'rage_axe',
                detail: { eyes: 0xFF0000, armor: 0x922B21 }
            },   
            assassin: { 
                baseColor: 0x9B59B6, 
                accentColor: 0xBB8FCE, 
                size: 12, 
                weapon: 'poison_daggers',
                detail: { eyes: 0x8E44AD, armor: 0x633974 }
            },    
            tank: { 
                baseColor: 0x95A5A6, 
                accentColor: 0xBDC3C7, 
                size: 20, 
                weapon: 'massive_club',
                detail: { eyes: 0xFF6B6B, armor: 0x566573 }
            }         
        };

        Object.keys(classSprites).forEach(className => {
            this.createDetailedWarriorSprite(className, classSprites[className]);
        });

        // Enhanced blood effects with better visual impact
        this.createEnhancedBloodEffects();
        
        // Professional sparkle and impact effects
        this.createProfessionalEffects();
        
        // Create UI elements with professional styling
        this.createProfessionalUITextures();
    }
    
    createDetailedWarriorSprite(className, config) {
        // Create a detailed, professional-looking warrior sprite
        const size = config.size;
        const canvas = document.createElement('canvas');
        canvas.width = size * 2;
        canvas.height = size * 2;
        const ctx = canvas.getContext('2d');
        
        // Enhanced rendering with better graphics
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Body gradient
        const bodyGradient = ctx.createRadialGradient(size, size, 0, size, size, size);
        bodyGradient.addColorStop(0, this.hexToRgba(config.accentColor, 1));
        bodyGradient.addColorStop(0.7, this.hexToRgba(config.baseColor, 1));
        bodyGradient.addColorStop(1, this.hexToRgba(this.darkenColor(config.baseColor, 0.4), 1));
        
        // Draw main body with shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillStyle = bodyGradient;
        ctx.beginPath();
        ctx.arc(size, size, size * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        // Armor details
        ctx.shadowColor = 'transparent';
        ctx.fillStyle = this.hexToRgba(config.detail.armor, 0.8);
        ctx.beginPath();
        ctx.arc(size, size * 0.7, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes with glow effect
        ctx.fillStyle = this.hexToRgba(config.detail.eyes, 1);
        ctx.beginPath();
        ctx.arc(size - size * 0.3, size * 0.6, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(size + size * 0.3, size * 0.6, size * 0.1, 0, Math.PI * 2);
        ctx.fill();
        
        // Weapon indicator (simplified but visible)
        ctx.strokeStyle = this.hexToRgba(0xFFD700, 1);
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        switch(config.weapon) {
            case 'bow':
                ctx.arc(size, size + size * 0.5, size * 0.4, 0, Math.PI);
                break;
            case 'sword':
                ctx.moveTo(size, size - size * 0.5);
                ctx.lineTo(size, size + size * 0.5);
                break;
            case 'dual_swords':
                ctx.moveTo(size - size * 0.3, size - size * 0.3);
                ctx.lineTo(size - size * 0.3, size + size * 0.5);
                ctx.moveTo(size + size * 0.3, size - size * 0.3);
                ctx.lineTo(size + size * 0.3, size + size * 0.5);
                break;
            case 'shield':
                ctx.arc(size - size * 0.6, size, size * 0.3, 0, Math.PI * 2);
                break;
            case 'axe':
                ctx.moveTo(size, size + size * 0.5);
                ctx.lineTo(size, size - size * 0.2);
                ctx.arc(size, size - size * 0.2, size * 0.2, 0, Math.PI);
                break;
        }
        ctx.stroke();
        
        // Create texture from canvas
        const texture = this.textures.createCanvas(`${className}_enhanced`, canvas.width, canvas.height);
        texture.getCanvas().getContext('2d').drawImage(canvas, 0, 0);
        texture.refresh();
        
        console.log(`Created enhanced sprite for ${className}`);
    }
    
    createEnhancedBloodEffects() {
        // Multi-layered blood effect with realistic splatter
        ['blood_small', 'blood_medium', 'blood_large'].forEach((type, index) => {
            const size = 8 + (index * 6);
            const graphics = this.add.graphics();
            
            // Blood core
            graphics.fillStyle(0x8B0000, 1);
            graphics.fillCircle(size, size, size * 0.8);
            
            // Blood splatter
            graphics.fillStyle(0xDC143C, 0.8);
            graphics.fillCircle(size, size, size * 0.6);
            
            // Highlights for 3D effect
            graphics.fillStyle(0xFF0000, 0.6);
            graphics.fillCircle(size, size, size * 0.3);
            
            // Small splatter dots around main blood
            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 / 5) * i;
                const distance = size * 1.2;
                const x = size + Math.cos(angle) * distance;
                const y = size + Math.sin(angle) * distance;
                
                graphics.fillStyle(0x8B0000, 0.4);
                graphics.fillCircle(x, y, size * 0.15);
            }
            
            graphics.generateTexture(type, size * 2, size * 2);
            graphics.destroy();
        });
    }
    
    createProfessionalEffects() {
        // High-quality sparkle effect with multiple layers
        const sparkGraphics = this.add.graphics();
        
        // Outer glow
        sparkGraphics.fillStyle(0xFFD700, 0.3);
        sparkGraphics.fillRect(0, 0, 16, 16);
        
        // Main sparkle core
        sparkGraphics.fillStyle(0xFFFFFF, 1);
        sparkGraphics.fillRect(6, 0, 4, 16);
        sparkGraphics.fillRect(0, 6, 16, 4);
        
        // Inner bright core
        sparkGraphics.fillStyle(0xFFD700, 1);
        sparkGraphics.fillRect(7, 1, 2, 14);
        sparkGraphics.fillRect(1, 7, 14, 2);
        
        sparkGraphics.generateTexture('professional_spark', 16, 16);
        sparkGraphics.destroy();
        
        // Professional impact effect
        const impactGraphics = this.add.graphics();
        
        // Radial gradient effect
        const colors = [0xFFFFFF, 0xFFD700, 0xFF8C00, 0xFF4500];
        colors.forEach((color, index) => {
            const alpha = 1 - (index * 0.2);
            const radius = 20 - (index * 4);
            
            impactGraphics.fillStyle(color, alpha);
            impactGraphics.fillCircle(24, 24, radius);
        });
        
        impactGraphics.generateTexture('professional_impact', 48, 48);
        impactGraphics.destroy();
    }
    
    createProfessionalUITextures() {
        // Professional health bar components
        const healthBarGraphics = this.add.graphics();
        
        // Health bar background with glass effect
        healthBarGraphics.fillStyle(0x2C3E50, 0.9);
        healthBarGraphics.fillRoundedRect(0, 0, 200, 24, 6);
        
        // Inner border
        healthBarGraphics.lineStyle(1, 0x34495E, 1);
        healthBarGraphics.strokeRoundedRect(1, 1, 198, 22, 5);
        
        // Glass highlight
        healthBarGraphics.fillStyle(0xFFFFFF, 0.1);
        healthBarGraphics.fillRoundedRect(2, 2, 196, 8, 4);
        
        healthBarGraphics.generateTexture('professional_health_bg', 200, 24);
        healthBarGraphics.destroy();
        
        // Health fill with gradient
        const healthFillGraphics = this.add.graphics();
        
        // Create gradient effect
        healthFillGraphics.fillGradientStyle(0x27AE60, 0x2ECC71, 0x16A085, 0x1ABC9C, 1);
        healthFillGraphics.fillRoundedRect(0, 0, 196, 20, 4);
        
        healthFillGraphics.generateTexture('professional_health_fill', 196, 20);
        healthFillGraphics.destroy();
    }

    createVisualEffects() {
        console.log('Creating visual effects...');
        // Create basic blood effect texture
        const bloodGraphics = this.add.graphics();
        bloodGraphics.fillStyle(0x8B0000, 1);
        bloodGraphics.fillCircle(8, 8, 6);
        bloodGraphics.generateTexture('blood', 16, 16);
        bloodGraphics.destroy();
        
        console.log('Visual effects created');
    }
    
    initializeAudio() {
        console.log('Initializing audio...');
        // Basic audio initialization - no actual audio needed for now
        console.log('Audio initialized');
    }

    // Helper functions for professional graphics
    hexToRgba(hex, alpha) {
        const r = (hex >> 16) & 255;
        const g = (hex >> 8) & 255;
        const b = hex & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Helper functions for color manipulation
    darkenColor(color, factor) {
        const r = Math.floor(((color >> 16) & 255) * (1 - factor));
        const g = Math.floor(((color >> 8) & 255) * (1 - factor));
        const b = Math.floor((color & 255) * (1 - factor));
        return (r << 16) | (g << 8) | b;
    }

    lightenColor(color, factor) {
        const r = Math.min(255, Math.floor(((color >> 16) & 255) * (1 + factor)));
        const g = Math.min(255, Math.floor(((color >> 8) & 255) * (1 + factor)));
        const b = Math.min(255, Math.floor((color & 255) * (1 + factor)));
        return (r << 16) | (g << 8) | b;
    }

    create() {
        console.log('GameSceneSimpleFast: Starting create() method...');
        
        try {
            // Get selected class from multiple sources
            let selectedClass = 'archer';
            let selectedWeapon = 'bow';
            
            if (this.sceneData && this.sceneData.selectedClass) {
                selectedClass = this.sceneData.selectedClass;
                selectedWeapon = this.sceneData.selectedWeapon;
                console.log('✓ Got class data from scene init:', selectedClass, selectedWeapon);
            } else if (this.game && this.game.registry) {
                selectedClass = this.game.registry.get('selectedClass') || 'archer';
                selectedWeapon = this.game.registry.get('selectedWeapon') || 'bow';
                console.log('✓ Got class data from game registry:', selectedClass, selectedWeapon);
            } else {
                console.log('⚠ Using default class:', selectedClass, selectedWeapon);
            }
            
            this.playerSelectedClass = selectedClass;
            this.playerSelectedWeapon = selectedWeapon;
            
            console.log('✓ Player class set:', this.playerSelectedClass);
            
            // Initialize character classes
            console.log('1. Initializing character classes...');
            this.initializeCharacterClasses();
            console.log('✓ Character classes initialized');
            
            // Setup world
            console.log('2. Setting up world...');
            const worldSize = 2000;
            this.physics.world.setBounds(-worldSize, -worldSize, worldSize * 2, worldSize * 2);
            
            // Simple background
            this.add.rectangle(0, 0, worldSize * 2, worldSize * 2, 0x228B22);
            console.log('✓ World and background created');
            
            // Create player
            console.log('3. Creating player...');
            this.createFastPlayer();
            console.log('✓ Player created successfully');
            
            // Setup camera
            console.log('4. Setting up camera...');
            this.cameras.main.startFollow(this.player);
            this.cameras.main.setBounds(-worldSize, -worldSize, worldSize * 2, worldSize * 2);
            console.log('✓ Camera setup complete');
            
            // Create groups
            console.log('5. Creating physics groups...');
            this.enemies = this.physics.add.group();
            this.goodWarriors = this.physics.add.group();
            this.evilWarriors = this.physics.add.group();
            console.log('✓ Physics groups created');
            
            // Create professional UI
            console.log('6. Creating professional UI...');
            this.createProfessionalUI();
            console.log('✓ Professional UI created');
            
            // Controls
            console.log('7. Setting up controls...');
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasd = this.input.keyboard.addKeys('W,S,A,D');
            console.log('✓ Keyboard controls setup');
            
            // Add mobile controls
            console.log('8. Adding mobile controls...');
            this.createMobileControls();
            console.log('✓ Mobile controls added');
            
            // Create some test enemies
            console.log('9. Creating test enemies...');
            this.createTestEnemies();
            console.log('✓ Test enemies created');
            
            // Initialize wave system
            console.log('9.5. Initializing wave system...');
            this.waveStartTime = this.time.now;
            console.log('✓ Wave system initialized');
            
            // Setup combat
            console.log('10. Setting up combat system...');
            this.setupCombat();
            console.log('✓ Combat system ready');
            
            console.log('🎉 GameSceneSimpleFast: Created successfully!');
            
        } catch (error) {
            console.error('❌ CRITICAL ERROR in GameSceneSimpleFast:', error);
            console.error('Stack:', error.stack);
            console.log('📋 Attempting fallback to character selection...');
            this.scene.start('CharacterSelectionScene');
        }
    }

    initializeCharacterClasses() {
        this.characterClasses = {
            archer: { hp: 80, damage: 25, speed: 120, attackRange: 200, attackSpeed: 1.5 },
            swordsman: { hp: 120, damage: 35, speed: 100, attackRange: 60, attackSpeed: 1.0 },
            dual_wielder: { hp: 100, damage: 30, speed: 110, attackRange: 50, attackSpeed: 2.0 },
            shield_warrior: { hp: 150, damage: 20, speed: 80, attackRange: 45, attackSpeed: 0.8 },
            axeman: { hp: 130, damage: 40, speed: 90, attackRange: 65, attackSpeed: 0.8 },
            dual_axe: { hp: 110, damage: 35, speed: 105, attackRange: 55, attackSpeed: 1.8 },
            berserker: { hp: 140, damage: 45, speed: 130, attackRange: 50, attackSpeed: 2.5 },
            assassin: { hp: 70, damage: 50, speed: 150, attackRange: 40, attackSpeed: 3.0 },
            tank: { hp: 200, damage: 30, speed: 60, attackRange: 80, attackSpeed: 0.6 }
        };
    }

    createFastPlayer() {
        const classData = this.characterClasses[this.playerSelectedClass];
        
        // Create player sprite - using the enhanced texture name
        this.player = this.physics.add.sprite(0, 0, this.playerSelectedClass + '_enhanced');
        this.player.setScale(2);
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.1);
        
        // Set properties
        this.player.className = this.playerSelectedClass;
        this.player.faction = 'good';
        this.player.maxHp = classData.hp;
        this.player.hp = classData.hp;
        this.player.damage = classData.damage;
        this.player.attackRange = classData.attackRange;
        this.player.attackCooldown = Math.floor(1000 / classData.attackSpeed);
        this.player.lastAttackTime = 0;
        
        this.player.setDepth(10);
        this.playerSpeed = classData.speed;
        
        console.log('Fast player created:', this.playerSelectedClass);
    }



    createProfessionalUI() {
        console.log('Creating professional UI...');
        
        try {
            // Ensure we have the required textures
            if (!this.textures.exists('professional_health_bg') || !this.textures.exists('professional_health_fill')) {
                console.warn('Professional UI textures missing, creating basic fallback');
                this.createBasicProfessionalUI();
                return;
            }
            
            // Create gradient background overlay for UI area
            const uiBackground = ProfessionalUI.createGradientBackground(this, 800, 150);
            if (uiBackground && uiBackground.background) {
                uiBackground.background.setPosition(0, 0);
                uiBackground.background.setScrollFactor(0);
                uiBackground.background.setDepth(900);
                uiBackground.background.setAlpha(0.8);
            }
            
            // Professional animated title
            this.gameTitle = ProfessionalUI.createAnimatedTitle(this, 400, 30, 'THE FIRST GAME', {
                fontSize: '32px',
                fill: '#FFD700',
                glow: '#FF8C00'
            });
            this.gameTitle.setScrollFactor(0);
            this.gameTitle.setDepth(1005);
            
            // Professional health bar with glass effect
            this.playerHealthBarContainer = ProfessionalUI.createGlassPanel(this, 140, 105, 240, 50, {
                backgroundColor: 0x2C3E50,
                borderColor: 0x3498DB,
                alpha: 0.9
            });
            this.playerHealthBarContainer.setScrollFactor(0);
            this.playerHealthBarContainer.setDepth(1000);
            
            // Health bar background
            this.playerHealthBg = this.add.image(140, 105, 'professional_health_bg');
            this.playerHealthBg.setScrollFactor(0);
            this.playerHealthBg.setDepth(1001);
            
            // Health fill bar
            this.playerHealthBar = this.add.image(42, 105, 'professional_health_fill');
            this.playerHealthBar.setScrollFactor(0);
            this.playerHealthBar.setDepth(1002);
            this.playerHealthBar.setOrigin(0, 0.5);
            
            // Health text with professional styling
            this.playerHealthText = ProfessionalUI.createProfessionalText(this, 140, 105, 
                `HP: ${this.player.hp}/${this.player.maxHp}`, {
                fontSize: '14px',
                fill: '#FFFFFF',
                glow: '#3498DB'
            });
            this.playerHealthText.setOrigin(0.5);
            this.playerHealthText.setScrollFactor(0);
            this.playerHealthText.setDepth(1003);
            
            // Score display with glass panel
            this.scoreContainer = ProfessionalUI.createGlassPanel(this, 690, 105, 180, 50, {
                backgroundColor: 0x8E44AD,
                borderColor: 0xBB8FCE,
                alpha: 0.9
            });
            this.scoreContainer.setScrollFactor(0);
            this.scoreContainer.setDepth(1000);
            
            this.scoreText = ProfessionalUI.createProfessionalText(this, 690, 105, `Score: ${this.score}`, {
                fontSize: '18px',
                fill: '#FFFFFF',
                glow: '#BB8FCE'
            });
            this.scoreText.setOrigin(0.5);
            this.scoreText.setScrollFactor(0);
            this.scoreText.setDepth(1003);
            
            // Class display
            this.classContainer = ProfessionalUI.createGlassPanel(this, 400, 105, 200, 50, {
                backgroundColor: 0x27AE60,
                borderColor: 0x2ECC71,
                alpha: 0.9
            });
            this.classContainer.setScrollFactor(0);
            this.classContainer.setDepth(1000);
            
            this.classText = ProfessionalUI.createProfessionalText(this, 400, 105, 
                `Class: ${this.playerSelectedClass.replace('_', ' ').toUpperCase()}`, {
                fontSize: '14px',
                fill: '#FFFFFF',
                glow: '#2ECC71'
            });
            this.classText.setOrigin(0.5);
            this.classText.setScrollFactor(0);
            this.classText.setDepth(1003);
            
            // Create professional particle systems for atmosphere
            this.createAtmosphericParticles();
            
            console.log('Professional UI created successfully!');
            
        } catch (error) {
            console.error('Error creating professional UI, falling back to basic UI:', error);
            this.createBasicFallbackUI();
        }
    }
    
    createBasicProfessionalUI() {
        console.log('Creating basic professional UI...');
        
        // Create simple but professional looking UI without custom textures
        
        // Animated title
        this.gameTitle = ProfessionalUI.createAnimatedTitle(this, 400, 30, 'THE FIRST GAME', {
            fontSize: '32px',
            fill: '#FFD700',
            glow: '#FF8C00'
        });
        this.gameTitle.setScrollFactor(0);
        this.gameTitle.setDepth(1005);
        
        // Health bar with graphics
        const healthBarBg = this.add.graphics();
        healthBarBg.fillStyle(0x2C3E50, 0.9);
        healthBarBg.fillRoundedRect(20, 80, 200, 20, 5);
        healthBarBg.lineStyle(2, 0x3498DB, 1);
        healthBarBg.strokeRoundedRect(20, 80, 200, 20, 5);
        healthBarBg.setScrollFactor(0);
        healthBarBg.setDepth(1000);
        
        this.playerHealthBar = this.add.graphics();
        this.playerHealthBar.setScrollFactor(0);
        this.playerHealthBar.setDepth(1001);
        this.updateHealthBar();
        
        // Health text
        this.playerHealthText = ProfessionalUI.createProfessionalText(this, 120, 90, 
            `HP: ${this.player.hp}/${this.player.maxHp}`, {
            fontSize: '14px',
            fill: '#FFFFFF',
            glow: '#3498DB'
        });
        this.playerHealthText.setOrigin(0.5);
        this.playerHealthText.setScrollFactor(0);
        this.playerHealthText.setDepth(1003);
        
        // Score display
        const scoreBg = this.add.graphics();
        scoreBg.fillStyle(0x8E44AD, 0.9);
        scoreBg.fillRoundedRect(600, 80, 180, 30, 5);
        scoreBg.lineStyle(2, 0xBB8FCE, 1);
        scoreBg.strokeRoundedRect(600, 80, 180, 30, 5);
        scoreBg.setScrollFactor(0);
        scoreBg.setDepth(1000);
        
        this.scoreText = ProfessionalUI.createProfessionalText(this, 690, 95, `Score: ${this.score}`, {
            fontSize: '18px',
            fill: '#FFFFFF',
            glow: '#BB8FCE'
        });
        this.scoreText.setOrigin(0.5);
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(1003);
        
        // Class display
        const classBg = this.add.graphics();
        classBg.fillStyle(0x27AE60, 0.9);
        classBg.fillRoundedRect(300, 80, 200, 30, 5);
        classBg.lineStyle(2, 0x2ECC71, 1);
        classBg.strokeRoundedRect(300, 80, 200, 30, 5);
        classBg.setScrollFactor(0);
        classBg.setDepth(1000);
        
        this.classText = ProfessionalUI.createProfessionalText(this, 400, 95, 
            `Class: ${this.playerSelectedClass.replace('_', ' ').toUpperCase()}`, {
            fontSize: '14px',
            fill: '#FFFFFF',
            glow: '#2ECC71'
        });
        this.classText.setOrigin(0.5);
        this.classText.setScrollFactor(0);
        this.classText.setDepth(1003);
        
        // Create atmospheric particles
        this.createAtmosphericParticles();
        
        console.log('Basic professional UI created successfully!');
    }
    
    updateHealthBar() {
        if (this.playerHealthBar && this.player) {
            this.playerHealthBar.clear();
            
            const healthPercent = this.player.hp / this.player.maxHp;
            const barWidth = 196 * healthPercent;
            
            // Health fill with color based on health level
            let healthColor = 0x27AE60; // Green
            if (healthPercent < 0.3) {
                healthColor = 0xE74C3C; // Red
            } else if (healthPercent < 0.6) {
                healthColor = 0xF39C12; // Orange
            }
            
            this.playerHealthBar.fillStyle(healthColor, 1);
            this.playerHealthBar.fillRoundedRect(22, 82, barWidth, 16, 3);
        }
    }

    // Helper functions for professional graphics
    hexToRgba(hex, alpha) {
        const r = (hex >> 16) & 255;
        const g = (hex >> 8) & 255;
        const b = hex & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Helper functions for color manipulation
    darkenColor(color, factor) {
        const r = Math.floor(((color >> 16) & 255) * (1 - factor));
        const g = Math.floor(((color >> 8) & 255) * (1 - factor));
        const b = Math.floor((color & 255) * (1 - factor));
        return (r << 16) | (g << 8) | b;
    }

    lightenColor(color, factor) {
        const r = Math.min(255, Math.floor(((color >> 16) & 255) * (1 + factor)));
        const g = Math.min(255, Math.floor(((color >> 8) & 255) * (1 + factor)));
        const b = Math.min(255, Math.floor((color & 255) * (1 + factor)));
        return (r << 16) | (g << 8) | b;
    }

    create() {
        console.log('GameSceneSimpleFast: Starting create() method...');
        
        try {
            // Get selected class from multiple sources
            let selectedClass = 'archer';
            let selectedWeapon = 'bow';
            
            if (this.sceneData && this.sceneData.selectedClass) {
                selectedClass = this.sceneData.selectedClass;
                selectedWeapon = this.sceneData.selectedWeapon;
                console.log('✓ Got class data from scene init:', selectedClass, selectedWeapon);
            } else if (this.game && this.game.registry) {
                selectedClass = this.game.registry.get('selectedClass') || 'archer';
                selectedWeapon = this.game.registry.get('selectedWeapon') || 'bow';
                console.log('✓ Got class data from game registry:', selectedClass, selectedWeapon);
            } else {
                console.log('⚠ Using default class:', selectedClass, selectedWeapon);
            }
            
            this.playerSelectedClass = selectedClass;
            this.playerSelectedWeapon = selectedWeapon;
            
            console.log('✓ Player class set:', this.playerSelectedClass);
            
            // Initialize character classes
            console.log('1. Initializing character classes...');
            this.initializeCharacterClasses();
            console.log('✓ Character classes initialized');
            
            // Setup world
            console.log('2. Setting up world...');
            const worldSize = 2000;
            this.physics.world.setBounds(-worldSize, -worldSize, worldSize * 2, worldSize * 2);
            
            // Simple background
            this.add.rectangle(0, 0, worldSize * 2, worldSize * 2, 0x228B22);
            console.log('✓ World and background created');
            
            // Create player
            console.log('3. Creating player...');
            this.createFastPlayer();
            console.log('✓ Player created successfully');
            
            // Setup camera
            console.log('4. Setting up camera...');
            this.cameras.main.startFollow(this.player);
            this.cameras.main.setBounds(-worldSize, -worldSize, worldSize * 2, worldSize * 2);
            console.log('✓ Camera setup complete');
            
            // Create groups
            console.log('5. Creating physics groups...');
            this.enemies = this.physics.add.group();
            this.goodWarriors = this.physics.add.group();
            this.evilWarriors = this.physics.add.group();
            console.log('✓ Physics groups created');
            
            // Create professional UI
            console.log('6. Creating professional UI...');
            this.createProfessionalUI();
            console.log('✓ Professional UI created');
            
            // Controls
            console.log('7. Setting up controls...');
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasd = this.input.keyboard.addKeys('W,S,A,D');
            console.log('✓ Keyboard controls setup');
            
            // Add mobile controls
            console.log('8. Adding mobile controls...');
            this.createMobileControls();
            console.log('✓ Mobile controls added');
            
            // Create some test enemies
            console.log('9. Creating test enemies...');
            this.createTestEnemies();
            console.log('✓ Test enemies created');
            
            // Initialize wave system
            console.log('9.5. Initializing wave system...');
            this.waveStartTime = this.time.now;
            console.log('✓ Wave system initialized');
            
            // Setup combat
            console.log('10. Setting up combat system...');
            this.setupCombat();
            console.log('✓ Combat system ready');
            
            console.log('🎉 GameSceneSimpleFast: Created successfully!');
            
        } catch (error) {
            console.error('❌ CRITICAL ERROR in GameSceneSimpleFast:', error);
            console.error('Stack:', error.stack);
            console.log('📋 Attempting fallback to character selection...');
            this.scene.start('CharacterSelectionScene');
        }
    }

    initializeCharacterClasses() {
        this.characterClasses = {
            archer: { hp: 80, damage: 25, speed: 120, attackRange: 200, attackSpeed: 1.5 },
            swordsman: { hp: 120, damage: 35, speed: 100, attackRange: 60, attackSpeed: 1.0 },
            dual_wielder: { hp: 100, damage: 30, speed: 110, attackRange: 50, attackSpeed: 2.0 },
            shield_warrior: { hp: 150, damage: 20, speed: 80, attackRange: 45, attackSpeed: 0.8 },
            axeman: { hp: 130, damage: 40, speed: 90, attackRange: 65, attackSpeed: 0.8 },
            dual_axe: { hp: 110, damage: 35, speed: 105, attackRange: 55, attackSpeed: 1.8 },
            berserker: { hp: 140, damage: 45, speed: 130, attackRange: 50, attackSpeed: 2.5 },
            assassin: { hp: 70, damage: 50, speed: 150, attackRange: 40, attackSpeed: 3.0 },
            tank: { hp: 200, damage: 30, speed: 60, attackRange: 80, attackSpeed: 0.6 }
        };
    }

    createFastPlayer() {
        const classData = this.characterClasses[this.playerSelectedClass];
        
        // Create player sprite - using the enhanced texture name
        this.player = this.physics.add.sprite(0, 0, this.playerSelectedClass + '_enhanced');
        this.player.setScale(2);
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.1);
        
        // Set properties
        this.player.className = this.playerSelectedClass;
        this.player.faction = 'good';
        this.player.maxHp = classData.hp;
        this.player.hp = classData.hp;
        this.player.damage = classData.damage;
        this.player.attackRange = classData.attackRange;
        this.player.attackCooldown = Math.floor(1000 / classData.attackSpeed);
        this.player.lastAttackTime = 0;
        
        this.player.setDepth(10);
        this.playerSpeed = classData.speed;
        
        console.log('Fast player created:', this.playerSelectedClass);
    }



    createProfessionalUI() {
        console.log('Creating professional UI...');
        
        try {
            // Ensure we have the required textures
            if (!this.textures.exists('professional_health_bg') || !this.textures.exists('professional_health_fill')) {
                console.warn('Professional UI textures missing, creating basic fallback');
                this.createBasicProfessionalUI();
                return;
            }
            
            // Create gradient background overlay for UI area
            const uiBackground = ProfessionalUI.createGradientBackground(this, 800, 150);
            if (uiBackground && uiBackground.background) {
                uiBackground.background.setPosition(0, 0);
                uiBackground.background.setScrollFactor(0);
                uiBackground.background.setDepth(900);
                uiBackground.background.setAlpha(0.8);
            }
            
            // Professional animated title
            this.gameTitle = ProfessionalUI.createAnimatedTitle(this, 400, 30, 'THE FIRST GAME', {
                fontSize: '32px',
                fill: '#FFD700',
                glow: '#FF8C00'
            });
            this.gameTitle.setScrollFactor(0);
            this.gameTitle.setDepth(1005);
            
            // Professional health bar with glass effect
            this.playerHealthBarContainer = ProfessionalUI.createGlassPanel(this, 140, 105, 240, 50, {
                backgroundColor: 0x2C3E50,
                borderColor: 0x3498DB,
                alpha: 0.9
            });
            this.playerHealthBarContainer.setScrollFactor(0);
            this.playerHealthBarContainer.setDepth(1000);
            
            // Health bar background
            this.playerHealthBg = this.add.image(140, 105, 'professional_health_bg');
            this.playerHealthBg.setScrollFactor(0);
            this.playerHealthBg.setDepth(1001);
            
            // Health fill bar
            this.playerHealthBar = this.add.image(42, 105, 'professional_health_fill');
            this.playerHealthBar.setScrollFactor(0);
            this.playerHealthBar.setDepth(1002);
            this.playerHealthBar.setOrigin(0, 0.5);
            
            // Health text with professional styling
            this.playerHealthText = ProfessionalUI.createProfessionalText(this, 140, 105, 
                `HP: ${this.player.hp}/${this.player.maxHp}`, {
                fontSize: '14px',
                fill: '#FFFFFF',
                glow: '#3498DB'
            });
            this.playerHealthText.setOrigin(0.5);
            this.playerHealthText.setScrollFactor(0);
            this.playerHealthText.setDepth(1003);
            
            // Score display with glass panel
            this.scoreContainer = ProfessionalUI.createGlassPanel(this, 690, 105, 180, 50, {
                backgroundColor: 0x8E44AD,
                borderColor: 0xBB8FCE,
                alpha: 0.9
            });
            this.scoreContainer.setScrollFactor(0);
            this.scoreContainer.setDepth(1000);
            
            this.scoreText = ProfessionalUI.createProfessionalText(this, 690, 105, `Score: ${this.score}`, {
                fontSize: '18px',
                fill: '#FFFFFF',
                glow: '#BB8FCE'
            });
            this.scoreText.setOrigin(0.5);
            this.scoreText.setScrollFactor(0);
            this.scoreText.setDepth(1003);
            
            // Class display
            this.classContainer = ProfessionalUI.createGlassPanel(this, 400, 105, 200, 50, {
                backgroundColor: 0x27AE60,
                borderColor: 0x2ECC71,
                alpha: 0.9
            });
            this.classContainer.setScrollFactor(0);
            this.classContainer.setDepth(1000);
            
            this.classText = ProfessionalUI.createProfessionalText(this, 400, 105, 
                `Class: ${this.playerSelectedClass.replace('_', ' ').toUpperCase()}`, {
                fontSize: '14px',
                fill: '#FFFFFF',
                glow: '#2ECC71'
            });
            this.classText.setOrigin(0.5);
            this.classText.setScrollFactor(0);
            this.classText.setDepth(1003);
            
            // Create professional particle systems for atmosphere
            this.createAtmosphericParticles();
            
            console.log('Professional UI created successfully!');
            
        } catch (error) {
            console.error('Error creating professional UI, falling back to basic UI:', error);
            this.createBasicFallbackUI();
        }
    }
    
    createBasicProfessionalUI() {
        console.log('Creating basic professional UI...');
        
        // Create simple but professional looking UI without custom textures
        
        // Animated title
        this.gameTitle = ProfessionalUI.createAnimatedTitle(this, 400, 30, 'THE FIRST GAME', {
            fontSize: '32px',
            fill: '#FFD700',
            glow: '#FF8C00'
        });
        this.gameTitle.setScrollFactor(0);
        this.gameTitle.setDepth(1005);
        
        // Health bar with graphics
        const healthBarBg = this.add.graphics();
        healthBarBg.fillStyle(0x2C3E50, 0.9);
        healthBarBg.fillRoundedRect(20, 80, 200, 20, 5);
        healthBarBg.lineStyle(2, 0x3498DB, 1);
        healthBarBg.strokeRoundedRect(20, 80, 200, 20, 5);
        healthBarBg.setScrollFactor(0);
        healthBarBg.setDepth(1000);
        
        this.playerHealthBar = this.add.graphics();
        this.playerHealthBar.setScrollFactor(0);
        this.playerHealthBar.setDepth(1001);
        this.updateHealthBar();
        
        // Health text
        this.playerHealthText = ProfessionalUI.createProfessionalText(this, 120, 90, 
            `HP: ${this.player.hp}/${this.player.maxHp}`, {
            fontSize: '14px',
            fill: '#FFFFFF',
            glow: '#3498DB'
        });
        this.playerHealthText.setOrigin(0.5);
        this.playerHealthText.setScrollFactor(0);
        this.playerHealthText.setDepth(1003);
        
        // Score display
        const scoreBg = this.add.graphics();
        scoreBg.fillStyle(0x8E44AD, 0.9);
        scoreBg.fillRoundedRect(600, 80, 180, 30, 5);
        scoreBg.lineStyle(2, 0xBB8FCE, 1);
        scoreBg.strokeRoundedRect(600, 80, 180, 30, 5);
        scoreBg.setScrollFactor(0);
        scoreBg.setDepth(1000);
        
        this.scoreText = ProfessionalUI.createProfessionalText(this, 690, 95, `Score: ${this.score}`, {
            fontSize: '18px',
            fill: '#FFFFFF',
            glow: '#BB8FCE'
        });
        this.scoreText.setOrigin(0.5);
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(1003);
        
        // Class display
        const classBg = this.add.graphics();
        classBg.fillStyle(0x27AE60, 0.9);
        classBg.fillRoundedRect(300, 80, 200, 30, 5);
        classBg.lineStyle(2, 0x2ECC71, 1);
        classBg.strokeRoundedRect(300, 80, 200, 30, 5);
        classBg.setScrollFactor(0);
        classBg.setDepth(1000);
        
        this.classText = ProfessionalUI.createProfessionalText(this, 400, 95, 
            `Class: ${this.playerSelectedClass.replace('_', ' ').toUpperCase()}`, {
            fontSize: '14px',
            fill: '#FFFFFF',
            glow: '#2ECC71'
        });
        this.classText.setOrigin(0.5);
        this.classText.setScrollFactor(0);
        this.classText.setDepth(1003);
        
        // Create atmospheric particles
        this.createAtmosphericParticles();
        
        console.log('Basic professional UI created successfully!');
    }
    
    updateHealthBar() {
        if (this.playerHealthBar && this.player) {
            this.playerHealthBar.clear();
            
            const healthPercent = this.player.hp / this.player.maxHp;
            const barWidth = 196 * healthPercent;
            
            // Health fill with color based on health level
            let healthColor = 0x27AE60; // Green
            if (healthPercent < 0.3) {
                healthColor = 0xE74C3C; // Red
            } else if (healthPercent < 0.6) {
                healthColor = 0xF39C12; // Orange
            }
            
            this.playerHealthBar.fillStyle(healthColor, 1);
            this.playerHealthBar.fillRoundedRect(22, 82, barWidth, 16, 3);
        }
    }

    // Helper functions for professional graphics
    hexToRgba(hex, alpha) {
        const r = (hex >> 16) & 255;
        const g = (hex >> 8) & 255;
        const b = hex & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Helper functions for color manipulation
    darkenColor(color, factor) {
        const r = Math.floor(((color >> 16) & 255) * (1 - factor));
        const g = Math.floor(((color >> 8) & 255) * (1 - factor));
        const b = Math.floor((color & 255) * (1 - factor));
        return (r << 16) | (g << 8) | b;
    }

    lightenColor(color, factor) {
        const r = Math.min(255, Math.floor(((color >> 16) & 255) * (1 + factor)));
        const g = Math.min(255, Math.floor(((color >> 8) & 255) * (1 + factor)));
        const b = Math.min(255, Math.floor((color & 255) * (1 + factor)));
        return (r << 16) | (g << 8) | b;
    }

    create() {
        console.log('GameSceneSimpleFast: Starting create() method...');
        
        try {
            // Get selected class from multiple sources
            let selectedClass = 'archer';
            let selectedWeapon = 'bow';
            
            if (this.sceneData && this.sceneData.selectedClass) {
                selectedClass = this.sceneData.selectedClass;
                selectedWeapon = this.sceneData.selectedWeapon;
                console.log('✓ Got class data from scene init:', selectedClass, selectedWeapon);
            } else if (this.game && this.game.registry) {
                selectedClass = this.game.registry.get('selectedClass') || 'archer';
                selectedWeapon = this.game.registry.get('selectedWeapon') || 'bow';
                console.log('✓ Got class data from game registry:', selectedClass, selectedWeapon);
            } else {
                console.log('⚠ Using default class:', selectedClass, selectedWeapon);
            }
            
            this.playerSelectedClass = selectedClass;
            this.playerSelectedWeapon = selectedWeapon;
            
            console.log('✓ Player class set:', this.playerSelectedClass);
            
            // Initialize character classes
            console.log('1. Initializing character classes...');
            this.initializeCharacterClasses();
            console.log('✓ Character classes initialized');
            
            // Setup world
            console.log('2. Setting up world...');
            const worldSize = 2000;
            this.physics.world.setBounds(-worldSize, -worldSize, worldSize * 2, worldSize * 2);
            
            // Simple background
            this.add.rectangle(0, 0, worldSize * 2, worldSize * 2, 0x228B22);
            console.log('✓ World and background created');
            
            // Create player
            console.log('3. Creating player...');
            this.createFastPlayer();
            console.log('✓ Player created successfully');
            
            // Setup camera
            console.log('4. Setting up camera...');
            this.cameras.main.startFollow(this.player);
            this.cameras.main.setBounds(-worldSize, -worldSize, worldSize * 2, worldSize * 2);
            console.log('✓ Camera setup complete');
            
            // Create groups
            console.log('5. Creating physics groups...');
            this.enemies = this.physics.add.group();
            this.goodWarriors = this.physics.add.group();
            this.evilWarriors = this.physics.add.group();
            console.log('✓ Physics groups created');
            
            // Create professional UI
            console.log('6. Creating professional UI...');
            this.createProfessionalUI();
            console.log('✓ Professional UI created');
            
            // Controls
            console.log('7. Setting up controls...');
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasd = this.input.keyboard.addKeys('W,S,A,D');
            console.log('✓ Keyboard controls setup');
            
            // Add mobile controls
            console.log('8. Adding mobile controls...');
            this.createMobileControls();
            console.log('✓ Mobile controls added');
            
            // Create some test enemies
            console.log('9. Creating test enemies...');
            this.createTestEnemies();
            console.log('✓ Test enemies created');
            
            // Initialize wave system
            console.log('9.5. Initializing wave system...');
            this.waveStartTime = this.time.now;
            console.log('✓ Wave system initialized');
            
            // Setup combat
            console.log('10. Setting up combat system...');
            this.setupCombat();
            console.log('✓ Combat system ready');
            
            console.log('🎉 GameSceneSimpleFast: Created successfully!');
            
        } catch (error) {
            console.error('❌ CRITICAL ERROR in GameSceneSimpleFast:', error);
            console.error('Stack:', error.stack);
            console.log('📋 Attempting fallback to character selection...');
            this.scene.start('CharacterSelectionScene');
        }
    }

    initializeCharacterClasses() {
        this.characterClasses = {
            archer: { hp: 80, damage: 25, speed: 120, attackRange: 200, attackSpeed: 1.5 },
            swordsman: { hp: 120, damage: 35, speed: 100, attackRange: 60, attackSpeed: 1.0 },
            dual_wielder: { hp: 100, damage: 30, speed: 110, attackRange: 50, attackSpeed: 2.0 },
            shield_warrior: { hp: 150, damage: 20, speed: 80, attackRange: 45, attackSpeed: 0.8 },
            axeman: { hp: 130, damage: 40, speed: 90, attackRange: 65, attackSpeed: 0.8 },
            dual_axe: { hp: 110, damage: 35, speed: 105, attackRange: 55, attackSpeed: 1.8 },
            berserker: { hp: 140, damage: 45, speed: 130, attackRange: 50, attackSpeed: 2.5 },
            assassin: { hp: 70, damage: 50, speed: 150, attackRange: 40, attackSpeed: 3.0 },
            tank: { hp: 200, damage: 30, speed: 60, attackRange: 80, attackSpeed: 0.6 }
        };
    }

    createFastPlayer() {
        const classData = this.characterClasses[this.playerSelectedClass];
        
        // Create player sprite - using the enhanced texture name
        this.player = this.physics.add.sprite(0, 0, this.playerSelectedClass + '_enhanced');
        this.player.setScale(2);
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.1);
        
        // Set properties
        this.player.className = this.playerSelectedClass;
        this.player.faction = 'good';
        this.player.maxHp = classData.hp;
        this.player.hp = classData.hp;
        this.player.damage = classData.damage;
        this.player.attackRange = classData.attackRange;
        this.player.attackCooldown = Math.floor(1000 / classData.attackSpeed);
        this.player.lastAttackTime = 0;
        
        this.player.setDepth(10);
        this.playerSpeed = classData.speed;
        
        console.log('Fast player created:', this.playerSelectedClass);
    }



    createProfessionalUI() {
        console.log('Creating professional UI...');
        
        try {
            // Ensure we have the required textures
            if (!this.textures.exists('professional_health_bg') || !this.textures.exists('professional_health_fill')) {
                console.warn('Professional UI textures missing, creating basic fallback');
                this.createBasicProfessionalUI();
                return;
            }
            
            // Create gradient background overlay for UI area
            const uiBackground = ProfessionalUI.createGradientBackground(this, 800, 150);
            if (uiBackground && uiBackground.background) {
                uiBackground.background.setPosition(0, 0);
                uiBackground.background.setScrollFactor(0);
                uiBackground.background.setDepth(900);
                uiBackground.background.setAlpha(0.8);
            }
            
            // Professional animated title
            this.gameTitle = ProfessionalUI.createAnimatedTitle(this, 400, 30, 'THE FIRST GAME', {
                fontSize: '32px',
                fill: '#FFD700',
                glow: '#FF8C00'
            });
            this.gameTitle.setScrollFactor(0);
            this.gameTitle.setDepth(1005);
            
            // Professional health bar with glass effect
            this.playerHealthBarContainer = ProfessionalUI.createGlassPanel(this, 140, 105, 240, 50, {
                backgroundColor: 0x2C3E50,
                borderColor: 0x3498DB,
                alpha: 0.9
            });
            this.playerHealthBarContainer.setScrollFactor(0);
            this.playerHealthBarContainer.setDepth(1000);
            
            // Health bar background
            this.playerHealthBg = this.add.image(140, 105, 'professional_health_bg');
            this.playerHealthBg.setScrollFactor(0);
            this.playerHealthBg.setDepth(1001);
            
            // Health fill bar
            this.playerHealthBar = this.add.image(42, 105, 'professional_health_fill');
            this.playerHealthBar.setScrollFactor(0);
            this.playerHealthBar.setDepth(1002);
            this.playerHealthBar.setOrigin(0, 0.5);
            
            // Health text with professional styling
            this.playerHealthText = ProfessionalUI.createProfessionalText(this, 140, 105, 
                `HP: ${this.player.hp}/${this.player.maxHp}`, {
                fontSize: '14px',
                fill: '#FFFFFF',
                glow: '#3498DB'
            });
            this.playerHealthText.setOrigin(0.5);
            this.playerHealthText.setScrollFactor(0);
            this.playerHealthText.setDepth(1003);
            
            // Score display with glass panel
            this.scoreContainer = ProfessionalUI.createGlassPanel(this, 690, 105, 180, 50, {
                backgroundColor: 0x8E44AD,
                borderColor: 0xBB8FCE,
                alpha: 0.9
            });
            this.scoreContainer.setScrollFactor(0);
            this.scoreContainer.setDepth(1000);
            
            this.scoreText = ProfessionalUI.createProfessionalText(this, 690, 105, `Score: ${this.score}`, {
                fontSize: '18px',
                fill: '#FFFFFF',
                glow: '#BB8FCE'
            });
            this.scoreText.setOrigin(0.5);
            this.scoreText.setScrollFactor(0);
            this.scoreText.setDepth(1003);
            
            // Class display
            this.classContainer = ProfessionalUI.createGlassPanel(this, 400, 105, 200, 50, {
                backgroundColor: 0x27AE60,
                borderColor: 0x2ECC71,
                alpha: 0.9
            });
            this.classContainer.setScrollFactor(0);
            this.classContainer.setDepth(1000);
            
            this.classText = ProfessionalUI.createProfessionalText(this, 400, 105, 
                `Class: ${this.playerSelectedClass.replace('_', ' ').toUpperCase()}`, {
                fontSize: '14px',
                fill: '#FFFFFF',
                glow: '#2ECC71'
            });
            this.classText.setOrigin(0.5);
            this.classText.setScrollFactor(0);
            this.classText.setDepth(1003);
            
            // Create professional particle systems for atmosphere
            this.createAtmosphericParticles();
            
            console.log('Professional UI created successfully!');
            
        } catch (error) {
            console.error('Error creating professional UI, falling back to basic UI:', error);
            this.createBasicFallbackUI();
        }
    }
    
    createBasicProfessionalUI() {
        console.log('Creating basic professional UI...');
        
        // Create simple but professional looking UI without custom textures
        
        // Animated title
        this.gameTitle = ProfessionalUI.createAnimatedTitle(this, 400, 30, 'THE FIRST GAME', {
            fontSize: '32px',
            fill: '#FFD700',
            glow: '#FF8C00'
        });
        this.gameTitle.setScrollFactor(0);
        this.gameTitle.setDepth(1005);
        
        // Health bar with graphics
        const healthBarBg = this.add.graphics();
        healthBarBg.fillStyle(0x2C3E50, 0.9);
        healthBarBg.fillRoundedRect(20, 80, 200, 20, 5);
        healthBarBg.lineStyle(2, 0x3498DB, 1);
        healthBarBg.strokeRoundedRect(20, 80, 200, 20, 5);
        healthBarBg.setScrollFactor(0);
        healthBarBg.setDepth(1000);
        
        this.playerHealthBar = this.add.graphics();
        this.playerHealthBar.setScrollFactor(0);
        this.playerHealthBar.setDepth(1001);
        this.updateHealthBar();
        
        // Health text
        this.playerHealthText = ProfessionalUI.createProfessionalText(this, 120, 90, 
            `HP: ${this.player.hp}/${this.player.maxHp}`, {
            fontSize: '14px',
            fill: '#FFFFFF',
            glow: '#3498DB'
        });
        this.playerHealthText.setOrigin(0.5);
        this.playerHealthText.setScrollFactor(0);
        this.playerHealthText.setDepth(1003);
        
        // Score display
        const scoreBg = this.add.graphics();
        scoreBg.fillStyle(0x8E44AD, 0.9);
        scoreBg.fillRoundedRect(600, 80, 180, 30, 5);
        scoreBg.lineStyle(2, 0xBB8FCE, 1);
        scoreBg.strokeRoundedRect(600, 80, 180, 30, 5);
        scoreBg.setScrollFactor(0);
        scoreBg.setDepth(1000);
        
        this.scoreText = ProfessionalUI.createProfessionalText(this, 690, 95, `Score: ${this.score}`, {
            fontSize: '18px',
            fill: '#FFFFFF',
            glow: '#BB8FCE'
        });
        this.scoreText.setOrigin(0.5);
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(1003);
        
        // Class display
        const classBg = this.add.graphics();
        classBg.fillStyle(0x27AE60, 0.9);
        classBg.fillRoundedRect(300, 80, 200, 30, 5);
        classBg.lineStyle(2, 0x2ECC71, 1);
        classBg.strokeRoundedRect(300, 80, 200, 30, 5);
        classBg.setScrollFactor(0);
        classBg.setDepth(1000);
        
        this.classText = ProfessionalUI.createProfessionalText(this, 400, 95, 
            `Class: ${this.playerSelectedClass.replace('_', ' ').toUpperCase()}`, {
            fontSize: '14px',
            fill: '#FFFFFF',
            glow: '#2ECC71'
        });
        this.classText.setOrigin(0.5);
        this.classText.setScrollFactor(0);
        this.classText.setDepth(1003);
        
        // Create atmospheric particles
        this.createAtmosphericParticles();
        
        console.log('Basic professional UI created successfully!');
    }
    
    updateHealthBar() {
        if (this.playerHealthBar && this.player) {
            this.playerHealthBar.clear();
            
            const healthPercent = this.player.hp / this.player.maxHp;
            const barWidth = 196 * healthPercent;
            
            // Health fill with color based on health level
            let healthColor = 0x27AE60; // Green
            if (healthPercent < 0.3) {
                healthColor = 0xE74C3C; // Red
            } else if (healthPercent < 0.6) {
                healthColor = 0xF39C12; // Orange
            }
            
            this.playerHealthBar.fillStyle(healthColor, 1);
            this.playerHealthBar.fillRoundedRect(22, 82, barWidth, 16, 3);
        }
    }

    // Helper functions for professional graphics
    hexToRgba(hex, alpha) {
        const r = (hex >> 16) & 255;
        const g = (hex >> 8) & 255;
        const b = hex & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // Helper functions for color manipulation
    darkenColor(color, factor) {
        const r = Math.floor(((color >> 16) & 255) * (1 - factor));
        const g = Math.floor(((color >> 8) & 255) * (1 - factor));
        const b = Math.floor((color & 255) * (1 - factor));
        return (r << 16) | (g << 8) | b;
    }

    lightenColor(color, factor) {
        const r = Math.min(255, Math.floor(((color >> 16) & 255) * (1 + factor)));
        const g = Math.min(255, Math.floor(((color >> 8) & 255) * (1 + factor)));
        const b = Math.min(255, Math.floor((color & 255) * (1 + factor)));
        return (r << 16) | (g << 8) | b;
    }

    create() {
        console.log('GameSceneSimpleFast: Starting create() method...');
        
        try {
            // Get selected class from multiple sources
            let selectedClass = 'archer';
            let selectedWeapon = 'bow';
            
            if (this.sceneData && this.sceneData.selectedClass) {
                selectedClass = this.sceneData.selectedClass;
                selectedWeapon = this.sceneData.selectedWeapon;
                console.log('✓ Got class data from scene init:', selectedClass, selectedWeapon);
            } else if (this.game && this.game.registry) {
                selectedClass = this.game.registry.get('selectedClass') || 'archer';
                selectedWeapon = this.game.registry.get('selectedWeapon') || 'bow';
                console.log('✓ Got class data from game registry:', selectedClass, selectedWeapon);
            } else {
                console.log('⚠ Using default class:', selectedClass, selectedWeapon);
            }
            
            this.playerSelectedClass = selectedClass;
            this.playerSelectedWeapon = selectedWeapon;
            
            console.log('✓ Player class set:', this.playerSelectedClass);
            
            // Initialize character classes
            console.log('1. Initializing character classes...');
            this.initializeCharacterClasses();
            console.log('✓ Character classes initialized');
            
            // Setup world
            console.log('2. Setting up world...');
            const worldSize = 2000;
            this.physics.world.setBounds(-worldSize, -worldSize, worldSize * 2, worldSize * 2);
            
            // Simple background
            this.add.rectangle(0, 0, worldSize * 2, worldSize * 2, 0x228B22);
            console.log('✓ World and background created');
            
            // Create player
            console.log('3. Creating player...');
            this.createFastPlayer();
            console.log('✓ Player created successfully');
            
            // Setup camera
            console.log('4. Setting up camera...');
            this.cameras.main.startFollow(this.player);
            this.cameras.main.setBounds(-worldSize, -worldSize, worldSize * 2, worldSize * 2);
            console.log('✓ Camera setup complete');
            
            // Create groups
            console.log('5. Creating physics groups...');
            this.enemies = this.physics.add.group();
            this.goodWarriors = this.physics.add.group();
            this.evilWarriors = this.physics.add.group();
            console.log('✓ Physics groups created');
            
            // Create professional UI
            console.log('6. Creating professional UI...');
            this.createProfessionalUI();
            console.log('✓ Professional UI created');
            
            // Controls
            console.log('7. Setting up controls...');
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasd = this.input.keyboard.addKeys('W,S,A,D');
            console.log('✓ Keyboard controls setup');
            
            // Add mobile controls
            console.log('8. Adding mobile controls...');
            this.createMobileControls();
            console.log('✓ Mobile controls added');
            
            // Create some test enemies
            console.log('9. Creating test enemies...');
            this.createTestEnemies();
            console.log('✓ Test enemies created');
            
            // Initialize wave system
            console.log('9.5. Initializing wave system...');
            this.waveStartTime = this.time.now;
            console.log('✓ Wave system initialized');
            
            // Setup combat
            console.log('10. Setting up combat system...');
            this.setupCombat();
            console.log('✓ Combat system ready');
            
            console.log('🎉 GameSceneSimpleFast: Created successfully!');
            
        } catch (error) {
            console.error('❌ CRITICAL ERROR in GameSceneSimpleFast:', error);
            console.error('Stack:', error.stack);
            console.log('📋 Attempting fallback to character selection...');
            this.scene.start('CharacterSelectionScene');
        }
    }

    initializeCharacterClasses() {
        this.characterClasses = {
            archer: { hp: 80, damage: 25, speed: 120, attackRange: 200, attackSpeed: 1.5 },
            swordsman: { hp: 120, damage: 35, speed: 100, attackRange: 60, attackSpeed: 1.0 },
            dual_wielder: { hp: 100, damage: 30, speed: 110, attackRange: 50, attackSpeed: 2.0 },
            shield_warrior: { hp: 150, damage: 20, speed: 80, attackRange: 45, attackSpeed: 0.8 },
            axeman: { hp: 130, damage: 40, speed: 90, attackRange: 65, attackSpeed: 0.8 },
            dual_axe: { hp: 110, damage: 35, speed: 105, attackRange: 55, attackSpeed: 1.8 },
            berserker: { hp: 140, damage: 45, speed: 130, attackRange: 50, attackSpeed: 2.5 },
            assassin: { hp: 70, damage: 50, speed: 150, attackRange: 40, attackSpeed: 3.0 },
            tank: { hp: 200, damage: 30, speed: 60, attackRange: 80, attackSpeed: 0.6 }
        };
    }

    createFastPlayer() {
        const classData = this.characterClasses[this.playerSelectedClass];
        
        // Create player sprite - using the enhanced texture name
        this.player = this.physics.add.sprite(0, 0, this.playerSelectedClass + '_enhanced');
        this.player.setScale(2);
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.1);
        
        // Set properties
        this.player.className = this.playerSelectedClass;
        this.player.faction = 'good';
        this.player.maxHp = classData.hp;
        this.player.hp = classData.hp;
        this.player.damage = classData.damage;
        this.player.attackRange = classData.attackRange;
        this.player.attackCooldown = Math.floor(1000 / classData.attackSpeed);
        this.player.lastAttackTime = 0;
        
        this.player.setDepth(10);
        this.playerSpeed = classData.speed;
        
        console.log('Fast player created:', this.playerSelectedClass);
    }



    createProfessionalUI() {
        console.log('Creating professional UI...');
        
        try {
            // Ensure we have the required textures
            if (!this.textures.exists('professional_health_bg') || !this.textures.exists('professional_health_fill')) {
                console.warn('Professional UI textures missing, creating basic fallback');
                this.createBasicProfessionalUI();
                return;
            }
            
            // Create gradient background overlay for UI area
            const uiBackground = ProfessionalUI.createGradientBackground(this, 800, 150);
            if (uiBackground && uiBackground.background) {
                uiBackground.background.setPosition(0, 0);
                uiBackground.background.setScrollFactor(0);
                uiBackground.background.setDepth(900);
                uiBackground.background.setAlpha(0.8);
            }
            
            // Professional animated title
            this.gameTitle = ProfessionalUI.createAnimatedTitle(this, 400, 30, 'THE FIRST GAME', {
                fontSize: '32px',
                fill: '#FFD700',
                glow: '#FF8C00'
            });
            this.gameTitle.setScrollFactor(0);
            this.gameTitle.setDepth(1005);
            
            // Professional health bar with glass effect
            this.playerHealthBarContainer = ProfessionalUI.createGlassPanel(this, 140, 105, 240, 50, {
                backgroundColor: 0x2C3E50,
                borderColor: 0x3498DB,
                alpha: 0.9
            });
            this.playerHealthBarContainer.setScrollFactor(0);
            this.playerHealthBarContainer.setDepth(1000);
            
            // Health bar background
            this.playerHealthBg = this.add.image(140, 105, 'professional_health_bg');
            this.playerHealthBg.setScrollFactor(0);
            this.playerHealthBg.setDepth(1001);
            
            // Health fill bar
            this.playerHealthBar = this.add.image(42, 105, 'professional_health_fill');
            this.playerHealthBar.setScrollFactor(0);
            this.playerHealthBar.setDepth(1002);
            this.playerHealthBar.setOrigin(0, 0.5);
            
            // Health text with professional styling
            this.playerHealthText = ProfessionalUI.createProfessionalText(this, 140, 105, 
                `HP: ${this.player.hp}/${this.player.maxHp}`, {
                fontSize: '14px',
                fill: '#FFFFFF',
                glow: '#3498DB'
            });
            this.playerHealthText.setOrigin(0.5);
            this.playerHealthText.setScrollFactor(0);
            this.playerHealthText.setDepth(1003);
            
            // Score display with glass panel
            this.scoreContainer = ProfessionalUI.createGlassPanel(this, 690, 105, 180, 50, {
                backgroundColor: 0x8E44AD,
                borderColor: 0xBB8FCE,
                alpha: 0.9
            });
            this.scoreContainer.setScrollFactor(0);
            this.scoreContainer.setDepth(1000);
            
            this.scoreText = ProfessionalUI.createProfessionalText(this, 690, 105, `Score: ${this.score}`, {
                fontSize: '18px',
                fill: '#FFFFFF',
                glow: '#BB8FCE'
            });
            this.scoreText.setOrigin(0.5);
            this.scoreText.setScrollFactor(0);
            this.scoreText.setDepth(1003);
            
            // Class display
            this.classContainer = ProfessionalUI.createGlassPanel(this, 400, 105, 200, 50, {
                backgroundColor: 0x27AE60,
                borderColor: 0x2ECC71,
                alpha: 0.9
            });
            this.classContainer.setScrollFactor(0);
            this.classContainer.setDepth(1000);
            
            this.classText = ProfessionalUI.createProfessionalText(this, 400, 105, 
                `Class: ${this.playerSelectedClass.replace('_', ' ').toUpperCase()}`, {
                fontSize: '14px',
                fill: '#FFFFFF',
                glow: '#2ECC71'
            });
            this.classText.setOrigin(0.5);
            this.classText.setScrollFactor(0);
            this.classText.setDepth(1003);
            
            // Create professional particle systems for atmosphere
            this.createAtmosphericParticles();
            
            console.log('Professional UI created successfully!');
            
        } catch (error) {
            console.error('Error creating professional UI, falling back to basic UI:', error);
            this.createBasicFallbackUI();
        }
    }
    
    createBasicProfessionalUI() {
        console.log('Creating basic professional UI...');
        
        // Create simple but professional looking UI without custom textures
        
        // Animated title
        this.gameTitle = ProfessionalUI.createAnimatedTitle(this, 400, 30, 'THE FIRST GAME', {
            fontSize: '32px',
            fill: '#FFD700',
            glow: '#FF8C00'
        });
        this.gameTitle.setScrollFactor(0);
        this.gameTitle.setDepth(1005);
        
        // Health bar with graphics
        const healthBarBg = this.add.graphics();
        healthBarBg.fillStyle(0x2C3E50, 0.9);
        healthBarBg.fillRoundedRect(20, 80, 200, 20, 5);
        healthBarBg.lineStyle(2, 0x3498DB, 1);
        healthBarBg.strokeRoundedRect(20, 80, 200, 20, 5);
        healthBarBg.setScrollFactor(0);
        healthBarBg.setDepth(1000);
        
        this.playerHealthBar = this.add.graphics();
        this.playerHealthBar.setScrollFactor(0);
        this.playerHealthBar.setDepth(1001);
        this.updateHealthBar();
        
        // Health text
        this.playerHealthText = ProfessionalUI.createProfessionalText(this, 120, 90, 
            `HP: ${this.player.hp}/${this.player.maxHp}`, {
            fontSize: '14px',
            fill: '#FFFFFF',
            glow: '#3498DB'
        });
        this.playerHealthText.setOrigin(0.5);
        this.playerHealthText.setScrollFactor(0);
        this.playerHealthText.setDepth(1003);
        
        // Score display
        const scoreBg = this.add.graphics();
        scoreBg.fillStyle(0x8E44AD, 0.9);
        scoreBg.fillRoundedRect(600, 80, 180, 30, 5);
        scoreBg.lineStyle(2, 0xBB8FCE, 1);
        scoreBg.strokeRoundedRect(600, 80, 180, 30, 5);
        scoreBg.setScrollFactor(0);
        scoreBg.setDepth(1000);
        
        this.scoreText = ProfessionalUI.createProfessionalText(this, 690, 95, `Score: ${this.score}`, {
            fontSize: '18px',
            fill: '#FFFFFF',
            glow: '#BB8FCE'
        });
        this.scoreText.setOrigin(0.5);
        this.scoreText.setScrollFactor(0);
        this.scoreText.setDepth(1003);
        
        // Class display
        const classBg = this.add.graphics();
        classBg.fillStyle(0x27AE60, 0.9);
        classBg.fillRoundedRect(300, 80, 200, 30, 5);
        classBg.lineStyle(2, 0x2ECC71, 1);
        classBg.strokeRoundedRect(300, 80, 200, 30, 5);
        classBg.setScrollFactor(0);
        classBg.setDepth(1000);
        
        this.classText = ProfessionalUI.createProfessionalText(this, 400, 95, 
            `Class: ${this.playerSelectedClass.replace('_', ' ').toUpperCase()}`, {
            fontSize: '14px',
            fill: '#FFFFFF',
            glow: '#2ECC71'
        });
        this.classText.setOrigin(0.5);
        this.classText.setScrollFactor(0);
        this.classText.setDepth(1003);
        
        // Create atmospheric particles
        this.createAtmosphericParticles();
        
        console.log('Basic professional UI created successfully!');
    }
    
    updateHealthBar() {
        if (this.playerHealthBar && this.player) {
            this.playerHealthBar.clear();
            
            const healthPercent = this.player.hp / this.player.maxHp;
            const barWidth = 196 * healthPercent;
            
            // Health fill with color based on health level
            let healthColor = 0x27AE60; // Green
            if (healthPercent < 0.3) {
                healthColor = 0xE74C3C; // Red
            } else if (healthPercent < 0.6) {
                healthColor = 0xF39C12; // Orange
            }
            
            this.playerHealthBar.fillStyle(healthColor, 1);
            this.playerHealthBar.fillRoundedRect(22, 82, barWidth, 16, 3);
        }
    }
    
    update(time, delta) {
        if (this.gameOver || !this.player) return;

        // Player movement
        this.updatePlayerMovement();
        
        // Auto-attack system
        this.updateAutoAttack(time);
        
        // Update health bar
        this.updateHealthBar();
        
        // Simple AI for enemies
        this.updateSimpleAI();
    }

    updatePlayerMovement() {
        const speed = this.playerSpeed;
        this.player.body.setVelocity(0);

        // Keyboard controls
        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            this.player.body.setVelocityX(-speed);
        }
        if (this.cursors.right.isDown || this.wasd.D.isDown) {
            this.player.body.setVelocityX(speed);
        }
        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            this.player.body.setVelocityY(-speed);
        }
        if (this.cursors.down.isDown || this.wasd.S.isDown) {
            this.player.body.setVelocityY(speed);
        }

        // Touch controls
        if (this.touchDirection) {
            const touchSpeed = speed * 0.5;
            this.player.body.setVelocityX(this.touchDirection.x * touchSpeed / 100);
            this.player.body.setVelocityY(this.touchDirection.y * touchSpeed / 100);
        }
    }

    updateAutoAttack(time) {
        if (time - this.player.lastAttackTime < this.player.attackCooldown) return;

        // Find nearest enemy in range
        let nearestEnemy = null;
        let nearestDistance = this.player.attackRange;

        this.enemies.children.entries.forEach(enemy => {
            if (!enemy.active) return;
            
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                enemy.x, enemy.y
            );

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestEnemy = enemy;
            }
        });

        if (nearestEnemy) {
            this.attackEnemy(nearestEnemy);
            this.player.lastAttackTime = time;
        }
    }

    attackEnemy(enemy) {
        const damage = this.player.damage;
        enemy.hp -= damage;

        // Enhanced visual feedback
        this.createEnhancedDamageEffect(enemy, damage);
        
        // Screen shake for impact feedback
        this.cameras.main.shake(100, 0.01);
        
        // Create weapon trail effect
        this.createWeaponTrailEffect(this.player, enemy);
        
        // Update score with animation
        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);
        
        // Animate score increase
        this.tweens.add({
            targets: this.scoreText,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 150,
            yoyo: true,
            ease: 'Power2'
        });

        if (enemy.hp <= 0) {
            this.killEnemy(enemy);
        }
    }

    createEnhancedDamageEffect(target, damage) {
        // Enhanced blood splatter effect
        const blood = this.add.image(target.x, target.y, 'blood');
        blood.setDepth(20);
        blood.setTint(Phaser.Display.Color.GetColor(255, Math.random() * 100, Math.random() * 100));
        
        // Blood animation with physics
        this.tweens.add({
            targets: blood,
            alpha: 0,
            y: target.y - 30,
            x: target.x + (Math.random() - 0.5) * 30,
            rotation: Math.random() * Math.PI * 2,
            duration: 500,
            onComplete: () => blood.destroy()
        });

        // Critical hit detection (30% chance)
        const isCritical = Math.random() < 0.3;
        const finalDamage = isCritical ? damage * 1.5 : damage;
        
        // Enhanced damage number with color coding
        const damageColor = isCritical ? '#FFD700' : '#FF0000';
        const damageText = this.add.text(target.x, target.y - 20, 
            isCritical ? `${Math.round(finalDamage)} CRIT!` : Math.round(finalDamage).toString(), {
            fontSize: isCritical ? '20px' : '16px',
            fill: damageColor,
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 2
        });
        damageText.setOrigin(0.5);
        damageText.setDepth(21);

        // Enhanced damage text animation
        this.tweens.add({
            targets: damageText,
            alpha: 0,
            y: damageText.y - (isCritical ? 60 : 40),
            scaleX: isCritical ? 1.5 : 1,
            scaleY: isCritical ? 1.5 : 1,
            duration: isCritical ? 1000 : 800,
            ease: 'Power2.easeOut',
            onComplete: () => damageText.destroy()
        });
    }

    createWeaponTrailEffect(attacker, target) {
        // Create weapon trail based on weapon type
        const weaponType = this.playerSelectedWeapon || 'sword';
        
        const trail = this.add.graphics();
        trail.setDepth(15);
        
        switch(weaponType) {
            case 'bow':
                // Arrow trail
                trail.lineStyle(3, 0xFFD700, 0.8);
                trail.lineBetween(attacker.x, attacker.y, target.x, target.y);
                break;
            case 'sword':
            case 'two_hand_sword':
                // Sword slash arc
                trail.lineStyle(4, 0xC0C0C0, 0.9);
                const angle = Phaser.Math.Angle.Between(attacker.x, attacker.y, target.x, target.y);
                trail.arc(attacker.x, attacker.y, 50, angle - 0.5, angle + 0.5);
                break;
            case 'axe':
            case 'two_hand_axe':
                // Heavy impact effect
                trail.fillStyle(0xFF8C00, 0.7);
                trail.fillCircle(target.x, target.y, 25);
                break;
            default:
                // Default melee effect
                trail.lineStyle(3, 0xFFFFFF, 0.7);
                trail.lineBetween(attacker.x, attacker.y, target.x, target.y);
        }
        
        this.tweens.add({
            targets: trail,
            alpha: 0,
            duration: 300,
            onComplete: () => trail.destroy()
        });
    }

    killEnemy(enemy) {
        enemy.destroy();
        this.score += 50;
        this.enemiesKilledInWave++;
        
        // Update score with wave bonus
        const waveBonus = this.currentWave * 10;
        this.score += waveBonus;
        this.scoreText.setText(`Score: ${this.score}`);
        
        // Create score popup for wave bonus
        if (waveBonus > 0) {
            const bonusText = this.add.text(enemy.x, enemy.y - 40, `+${waveBonus} Wave Bonus!`, {
                fontSize: '12px',
                fill: '#00FF00',
                fontStyle: 'bold'
            });
            bonusText.setOrigin(0.5);
            bonusText.setDepth(25);
            
            this.tweens.add({
                targets: bonusText,
                alpha: 0,
                y: bonusText.y - 30,
                duration: 1000,
                onComplete: () => bonusText.destroy()
            });
        }
        
        // Check if wave is complete
        if (this.enemiesKilledInWave >= this.enemiesInWave) {
            this.startNextWave();
        } else {
            // Spawn new enemy to maintain wave count
            this.time.delayedCall(1000, () => {
                if (!this.gameOver) {
                    this.spawnNewEnemy();
                }
            });
        }
    }

    startNextWave() {
        this.currentWave++;
        this.enemiesKilledInWave = 0;
        this.enemiesInWave = Math.min(15, 5 + this.currentWave); // Cap at 15 enemies
        this.waveStartTime = this.time.now;
        
        // Display wave announcement
        this.showWaveAnnouncement();
        
        // Spawn wave enemies with delay
        for (let i = 0; i < this.enemiesInWave; i++) {
            this.time.delayedCall(i * 500, () => {
                if (!this.gameOver) {
                    this.spawnNewEnemy();
                }
            });
        }
    }

    showWaveAnnouncement() {
        const waveText = this.add.text(400, 200, `WAVE ${this.currentWave}`, {
            fontSize: '48px',
            fill: '#FFD700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 3
        });
        waveText.setOrigin(0.5);
        waveText.setScrollFactor(0);
        waveText.setDepth(2000);
        
        // Wave announcement animation
        waveText.setScale(0);
        this.tweens.add({
            targets: waveText,
            scaleX: 1,
            scaleY: 1,
            duration: 500,
            ease: 'Back.easeOut'
        });
        
        this.tweens.add({
            targets: waveText,
            alpha: 0,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 2000,
            delay: 1000,
            onComplete: () => waveText.destroy()
        });
        
        // Update wave display in UI
        if (this.classText) {
            const originalText = this.classText.text;
            this.classText.setText(`WAVE ${this.currentWave} - ${this.enemiesInWave} ENEMIES`);
            
            // Reset to original text after 3 seconds
            this.time.delayedCall(3000, () => {
                if (this.classText) {
                    this.classText.setText(originalText);
                }
            });
        }
    }

    spawnNewEnemy() {
        const enemyClasses = ['berserker', 'assassin', 'tank'];
        const enemyClass = enemyClasses[Math.floor(Math.random() * enemyClasses.length)];
        const enemyData = this.characterClasses[enemyClass];
        
        // Spawn away from player
        const spawnDistance = 300 + Math.random() * 200; // Variable spawn distance
        const angle = Math.random() * Math.PI * 2;
        const x = this.player.x + Math.cos(angle) * spawnDistance;
        const y = this.player.y + Math.sin(angle) * spawnDistance;
        
        const enemy = this.physics.add.sprite(x, y, enemyClass + '_enhanced');
        enemy.setScale(1.5);
        enemy.setDepth(5);
        
        enemy.className = enemyClass;
        enemy.faction = 'evil';
        
        // Scale enemy stats based on current wave
        const waveMultiplier = 1 + (this.currentWave - 1) * 0.15; // 15% increase per wave
        enemy.hp = Math.floor(enemyData.hp * waveMultiplier);
        enemy.maxHp = enemy.hp;
        enemy.damage = Math.floor(enemyData.damage * waveMultiplier);
        enemy.attackRange = enemyData.attackRange;
        enemy.attackCooldown = Math.max(500, Math.floor(1000 / enemyData.attackSpeed));
        enemy.lastAttackTime = 0;
        
        // Add visual indicator for stronger enemies
        if (this.currentWave > 3) {
            enemy.setTint(0xFFB6C1); // Pink tint for veteran enemies
        }
        if (this.currentWave > 6) {
            enemy.setScale(1.7); // Larger size for elite enemies
            enemy.setTint(0xFF4500); // Orange red for elite
        }
        
        this.enemies.add(enemy);
        this.evilWarriors.add(enemy);
        
        // Add spawn effect
        this.createSpawnEffect(enemy.x, enemy.y);
    }

    createSpawnEffect(x, y) {
        // Create dramatic spawn portal effect
        const portal = this.add.graphics();
        portal.setDepth(4);
        
        // Draw portal rings
        for (let i = 0; i < 3; i++) {
            const radius = 20 + (i * 15);
            const alpha = 0.8 - (i * 0.2);
            portal.lineStyle(3, 0x8B0000, alpha);
            portal.strokeCircle(x, y, radius);
        }
        
        // Animate portal expansion and fade
        this.tweens.add({
            targets: portal,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 800,
            ease: 'Power2.easeOut',
            onComplete: () => portal.destroy()
        });
        
        // Add particle burst
        for (let i = 0; i < 8; i++) {
            const particle = this.add.image(x, y, 'professional_spark');
            particle.setDepth(6);
            particle.setTint(0x8B0000);
            
            const angle = (Math.PI * 2 / 8) * i;
            const distance = 40;
            
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * distance,
                y: y + Math.sin(angle) * distance,
                alpha: 0,
                duration: 600,
                ease: 'Power2.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }

    updateSimpleAI() {
        // Simple AI for enemies - move towards player
        this.enemies.children.entries.forEach(enemy => {
            if (!enemy.active || !this.player) return;
            
            const distance = Phaser.Math.Distance.Between(
                enemy.x, enemy.y,
                this.player.x, this.player.y
            );
            
            if (distance > 30) { // Move towards player if not too close
                const speed = 60;
                const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, this.player.x, this.player.y);
                
                enemy.body.setVelocity(
                    Math.cos(angle) * speed,
                    Math.sin(angle) * speed
                );
            } else {
                enemy.body.setVelocity(0, 0);
            }
        });
    }

    setupCombat() {
        // Player vs enemy collision
        this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
            // This will be handled in update loop for auto-attack
        });
    }

    createMobileControls() {
        // Simple touch controls
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

    createTestEnemies() {
        const enemyClasses = ['berserker', 'assassin', 'tank'];
        
        for (let i = 0; i < 10; i++) {
            const enemyClass = enemyClasses[Math.floor(Math.random() * enemyClasses.length)];
            const enemyData = this.characterClasses[enemyClass];
            
            const x = Phaser.Math.Between(-500, 500);
            const y = Phaser.Math.Between(-500, 500);
            
            const enemy = this.physics.add.sprite(x, y, enemyClass + '_enhanced');
            enemy.setScale(1.5);
            enemy.setDepth(5);
            
            enemy.className = enemyClass;
            enemy.faction = 'evil';
            enemy.hp = enemyData.hp;
            enemy.maxHp = enemyData.hp;
            enemy.damage = enemyData.damage;
            enemy.attackRange = enemyData.attackRange;
            enemy.attackCooldown = Math.floor(1000 / enemyData.attackSpeed);
            enemy.lastAttackTime = 0;
            
            this.enemies.add(enemy);
            this.evilWarriors.add(enemy);
        }
    }
}