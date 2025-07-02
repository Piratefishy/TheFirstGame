export class CharacterSelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterSelectionScene' });
        this.selectedClass = null;
        this.selectedWeapon = null;
        this.characterClasses = {};
    }

    preload() {
        this.createSelectionUI();
    }

    create() {
        const { width, height } = this.cameras.main;

        // Initialize character classes (same as GameScene)
        this.initializeCharacterClasses();

        // Create beautiful background
        this.createBackground(width, height);

        // Create title
        this.add.text(width / 2, 80, 'Choose Your Warrior', {
            fontSize: '48px',
            fontFamily: 'serif',
            fill: '#FFD700',
            stroke: '#8B4513',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 5, fill: true }
        }).setOrigin(0.5).setDepth(100);

        // Create class selection area
        this.createClassSelection(width, height);

        // Create weapon selection area (initially hidden)
        this.createWeaponSelection(width, height);

        // Create start button (initially disabled)
        this.createStartButton(width, height);

        // Add atmospheric effects
        this.createAtmosphericEffects(width, height);
    }

    createSelectionUI() {
        // Create class card backgrounds
        const cardGraphics = this.add.graphics();
        cardGraphics.fillStyle(0x2C3E50, 0.9);
        cardGraphics.fillRoundedRect(0, 0, 200, 120, 10);
        cardGraphics.lineStyle(3, 0xFFD700, 1);
        cardGraphics.strokeRoundedRect(0, 0, 200, 120, 10);
        cardGraphics.generateTexture('class_card', 200, 120);
        cardGraphics.destroy();

        // Selected class card
        const selectedCardGraphics = this.add.graphics();
        selectedCardGraphics.fillStyle(0x8B4513, 0.9);
        selectedCardGraphics.fillRoundedRect(0, 0, 200, 120, 10);
        selectedCardGraphics.lineStyle(3, 0xFF6B35, 1);
        selectedCardGraphics.strokeRoundedRect(0, 0, 200, 120, 10);
        selectedCardGraphics.generateTexture('class_card_selected', 200, 120);
        selectedCardGraphics.destroy();

        // Start button
        const startBtnGraphics = this.add.graphics();
        startBtnGraphics.fillStyle(0x27AE60, 1);
        startBtnGraphics.fillRoundedRect(0, 0, 200, 50, 8);
        startBtnGraphics.lineStyle(2, 0xFFD700, 1);
        startBtnGraphics.strokeRoundedRect(0, 0, 200, 50, 8);
        startBtnGraphics.generateTexture('start_button', 200, 50);
        startBtnGraphics.destroy();

        // Disabled start button
        const startBtnDisabledGraphics = this.add.graphics();
        startBtnDisabledGraphics.fillStyle(0x7F8C8D, 1);
        startBtnDisabledGraphics.fillRoundedRect(0, 0, 200, 50, 8);
        startBtnDisabledGraphics.lineStyle(2, 0x95A5A6, 1);
        startBtnDisabledGraphics.strokeRoundedRect(0, 0, 200, 50, 8);
        startBtnDisabledGraphics.generateTexture('start_button_disabled', 200, 50);
        startBtnDisabledGraphics.destroy();
    }

    createBackground(width, height) {
        // Dark battlefield background
        const bgGraphics = this.add.graphics();
        bgGraphics.fillGradientStyle(0x1a1a2e, 0x16213e, 0x0f3460, 0x533483, 1);
        bgGraphics.fillRect(0, 0, width, height);

        // Add subtle texture overlay
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000);
        overlay.setAlpha(0.3);
    }

    createClassSelection(width, height) {
        const startY = 150;
        const cardSpacing = 220;
        
        // Good classes - top row
        const goodClasses = ['archer', 'swordsman', 'dual_wielder', 'shield_warrior', 'axeman', 'dual_axe'];
        
        this.add.text(width / 2, startY - 30, 'Good Warrior Classes', {
            fontSize: '24px',
            fontFamily: 'serif',
            fill: '#4A90E2',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(100);

        goodClasses.forEach((className, index) => {
            const x = (width / 2) - ((goodClasses.length - 1) * cardSpacing / 2) + (index * cardSpacing);
            this.createClassCard(className, x, startY, true);
        });

        // Evil classes - bottom row  
        const evilClasses = ['berserker', 'assassin', 'tank'];
        const evilStartY = startY + 200;
        
        this.add.text(width / 2, evilStartY - 30, 'Evil Creature Classes', {
            fontSize: '24px',
            fontFamily: 'serif',
            fill: '#E74C3C',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setDepth(100);

        evilClasses.forEach((className, index) => {
            const x = (width / 2) - ((evilClasses.length - 1) * cardSpacing / 2) + (index * cardSpacing);
            this.createClassCard(className, x, evilStartY, false);
        });
    }

    createClassCard(className, x, y, isGood) {
        const classData = this.characterClasses[className];
        
        // Card background
        const card = this.add.image(x, y, 'class_card').setDepth(50);
        card.setInteractive();
        
        // Class name
        const nameColor = isGood ? '#4A90E2' : '#E74C3C';
        this.add.text(x, y - 40, this.capitalizeFirstLetter(className.replace('_', ' ')), {
            fontSize: '14px',
            fontFamily: 'serif',
            fill: nameColor,
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5).setDepth(60);

        // Stats display
        const statsText = `HP: ${classData.hp}\nDMG: ${classData.damage}\nSPD: ${classData.speed}`;
        this.add.text(x, y - 10, statsText, {
            fontSize: '10px',
            fontFamily: 'serif',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5).setDepth(60);

        // Weapon display
        this.add.text(x, y + 25, `Weapon: ${classData.weapon.replace('_', ' ')}`, {
            fontSize: '9px',
            fontFamily: 'serif',
            fill: '#FFD700'
        }).setOrigin(0.5).setDepth(60);

        // Click handler
        card.on('pointerdown', () => {
            this.selectClass(className, card);
        });

        // Hover effects
        card.on('pointerover', () => {
            card.setTint(0xFFD700);
            this.tweens.add({
                targets: card,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 200,
                ease: 'Power2'
            });
        });

        card.on('pointerout', () => {
            if (this.selectedClass !== className) {
                card.clearTint();
                this.tweens.add({
                    targets: card,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200,
                    ease: 'Power2'
                });
            }
        });

        // Store reference
        card.className = className;
    }

    createWeaponSelection(width, height) {
        // This will be shown when a class is selected
        this.weaponArea = this.add.container(width / 2, height - 120);
        this.weaponArea.setVisible(false);
        
        const weaponBg = this.add.rectangle(0, 0, width - 100, 100, 0x2C3E50, 0.8);
        weaponBg.setStrokeStyle(2, 0xFFD700);
        this.weaponArea.add(weaponBg);

        this.weaponTitle = this.add.text(0, -35, 'Weapon Selected', {
            fontSize: '18px',
            fontFamily: 'serif',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.weaponArea.add(this.weaponTitle);

        this.weaponInfo = this.add.text(0, 0, '', {
            fontSize: '14px',
            fontFamily: 'serif',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        this.weaponArea.add(this.weaponInfo);
    }

    createStartButton(width, height) {
        this.startButton = this.add.image(width / 2, height - 50, 'start_button_disabled');
        this.startButton.setDepth(100);
        this.startButton.setInteractive();
        
        this.startText = this.add.text(width / 2, height - 50, 'Select a Class First', {
            fontSize: '16px',
            fontFamily: 'serif',
            fill: '#95A5A6'
        }).setOrigin(0.5).setDepth(101);

        this.startButton.on('pointerdown', () => {
            if (this.selectedClass) {
                this.startGame();
            }
        });
    }

    createAtmosphericEffects(width, height) {
        // Create ember particles for atmosphere
        this.emberParticles = this.add.particles(0, 0, 'ember', {
            x: { min: 0, max: width },
            y: height + 10,
            speedY: { min: -50, max: -20 },
            speedX: { min: -10, max: 10 },
            scale: { start: 0.5, end: 0.1 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 8000,
            frequency: 800
        });
    }

    selectClass(className, cardElement) {
        // Clear previous selection
        if (this.selectedClassCard) {
            this.selectedClassCard.setTexture('class_card');
            this.selectedClassCard.clearTint();
            this.selectedClassCard.setScale(1);
        }

        // Set new selection
        this.selectedClass = className;
        this.selectedWeapon = this.characterClasses[className].weapon;
        this.selectedClassCard = cardElement;
        
        // Update card appearance
        cardElement.setTexture('class_card_selected');
        cardElement.setTint(0xFF6B35);
        cardElement.setScale(1.05);

        // Show weapon info
        this.weaponArea.setVisible(true);
        const weaponName = this.selectedWeapon.replace('_', ' ');
        const classData = this.characterClasses[className];
        this.weaponInfo.setText(`${this.capitalizeWords(weaponName)}\nRange: ${classData.attackRange}\nSpeed: ${classData.attackSpeed}x`);

        // Enable start button
        this.startButton.setTexture('start_button');
        this.startText.setText('Start Battle!');
        this.startText.setStyle({ fill: '#FFFFFF' });

        // Add start button hover effect
        this.startButton.on('pointerover', () => {
            this.startButton.setTint(0x2ECC71);
        });
        this.startButton.on('pointerout', () => {
            this.startButton.clearTint();
        });
    }

    startGame() {
        if (!this.selectedClass) return;

        // Store selection in registry for GameScene to use
        this.registry.set('selectedClass', this.selectedClass);
        this.registry.set('selectedWeapon', this.selectedWeapon);

        // Transition to game
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameSceneSimple');
        });
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    capitalizeWords(string) {
        return string.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }

    initializeCharacterClasses() {
        // Same character classes as GameScene
        this.characterClasses = {
            // GOOD WARRIOR CLASSES
            archer: {
                sprite: 'elf_1',
                anim: 'elf_walk',
                hp: 80,
                damage: 25,
                speed: 120,
                weapon: 'bow',
                special: 'ranged_attack',
                attackRange: 200,
                attackSpeed: 1.5
            },
            swordsman: {
                sprite: 'knight_1',
                anim: 'knight_walk',
                hp: 120,
                damage: 35,
                speed: 100,
                weapon: 'two_hand_sword',
                special: 'heavy_strike',
                attackRange: 60,
                attackSpeed: 1.0
            },
            dual_wielder: {
                sprite: 'dwarf_1',
                anim: 'dwarf_walk',
                hp: 100,
                damage: 30,
                speed: 110,
                weapon: 'dual_swords',
                special: 'flurry_attack',
                attackRange: 50,
                attackSpeed: 2.0
            },
            shield_warrior: {
                sprite: 'knight_1',
                anim: 'knight_walk',
                hp: 150,
                damage: 20,
                speed: 80,
                weapon: 'sword_and_shield',
                special: 'shield_bash',
                attackRange: 45,
                attackSpeed: 0.8,
                defense: 0.3
            },
            axeman: {
                sprite: 'dwarf_1',
                anim: 'dwarf_walk',
                hp: 130,
                damage: 40,
                speed: 90,
                weapon: 'two_hand_axe',
                special: 'cleave_attack',
                attackRange: 65,
                attackSpeed: 0.8
            },
            dual_axe: {
                sprite: 'dwarf_1',
                anim: 'dwarf_walk',
                hp: 110,
                damage: 35,
                speed: 105,
                weapon: 'dual_axes',
                special: 'whirlwind',
                attackRange: 55,
                attackSpeed: 1.8
            },
            
            // EVIL CREATURE CLASSES
            berserker: {
                sprite: 'orc_1',
                anim: 'orc_walk',
                hp: 140,
                damage: 45,
                speed: 130,
                weapon: 'brutal_axe',
                special: 'rage_mode',
                attackRange: 50,
                attackSpeed: 2.5,
                rageBonus: 1.5
            },
            assassin: {
                sprite: 'goblin_1',
                anim: 'goblin_walk',
                hp: 70,
                damage: 50,
                speed: 150,
                weapon: 'poison_daggers',
                special: 'stealth_strike',
                attackRange: 40,
                attackSpeed: 3.0,
                critChance: 0.3
            },
            tank: {
                sprite: 'troll_1',
                anim: 'troll_walk',
                hp: 200,
                damage: 30,
                speed: 60,
                weapon: 'massive_club',
                special: 'ground_slam',
                attackRange: 80,
                attackSpeed: 0.6,
                defense: 0.4
            }
        };
    }
}
