import { ProfessionalUI } from '../utils/ProfessionalUI.js';

export class CharacterSelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterSelectionScene' });
        this.selectedClass = null;
        this.selectedWeapon = null;
        this.characterClasses = {};
        this.isTransitioning = false;
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

        // Create title with professional styling
        ProfessionalUI.createProfessionalText(this, width / 2, 80, 'Choose Your Warrior', {
            fontSize: '48px',
            fontFamily: 'Arial Black',
            fill: '#FFD700',
            stroke: '#8B4513',
            strokeThickness: 3,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000000',
                blur: 8,
                fill: true
            }
        }).setOrigin(0.5).setDepth(100);

        // Create class selection area
        this.createClassSelection(width, height);

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
        // Professional battlefield background using new UI system
        const bgElements = ProfessionalUI.createGradientBackground(this, width, height, {
            topLeft: 0x0a0a0a,     // Deep black
            topRight: 0x1a1a2e,    // Dark blue-grey  
            bottomLeft: 0x533483,  // Purple
            bottomRight: 0x0f3460  // Deep blue
        });
        
        // Add atmospheric particles
        this.atmosphericParticles = ProfessionalUI.createAtmosphericParticles(this, width, height, 'embers');
        this.atmosphericParticles.setDepth(1);
    }

    createClassSelection(width, height) {
        // Mobile-first design
        const isMobile = width < 768;
        
        // Create scrollable container for character cards
        this.createScrollableClassCards(width, height, isMobile);

        // Weapon info panel - mobile friendly
        this.createMobileWeaponPanel(width, height, isMobile);
    }

    createScrollableClassCards(width, height, isMobile) {
        // Card dimensions - larger for vertical layout
        const cardWidth = isMobile ? width * 0.85 : 500;
        const cardHeight = isMobile ? 80 : 100;
        const cardSpacing = isMobile ? 10 : 15;
        
        // Create scroll container
        const scrollAreaHeight = height - 280; // Leave space for title, weapon panel, and start button
        this.scrollContainer = this.add.container(0, 0).setDepth(50);
        
        // Create mask for scrolling area
        const maskShape = this.add.graphics();
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(0, 120, width, scrollAreaHeight);
        const mask = maskShape.createGeometryMask();
        this.scrollContainer.setMask(mask);
        
        // All character classes in order
        const allClasses = [
            { type: 'good', title: '⚔️ Noble Warrior Classes', classes: ['archer', 'swordsman', 'dual_wielder', 'shield_warrior', 'axeman', 'dual_axe'] },
            { type: 'evil', title: '💀 Evil Creature Classes', classes: ['berserker', 'assassin', 'tank'] }
        ];
        
        let currentY = 140;
        
        allClasses.forEach(category => {
            // Category title
            const titleColor = category.type === 'good' ? '#4CAF50' : '#F44336';
            const categoryTitle = this.add.text(width / 2, currentY, category.title, {
                fontSize: isMobile ? '16px' : '20px',
                fontFamily: 'Arial Bold',
                fill: titleColor,
                stroke: '#000000',
                strokeThickness: 1
            }).setOrigin(0.5).setDepth(100);
            
            this.scrollContainer.add(categoryTitle);
            currentY += isMobile ? 35 : 45;
            
            // Create vertical card stack
            category.classes.forEach(className => {
                this.createVerticalCard(
                    className, 
                    width / 2, 
                    currentY, 
                    cardWidth, 
                    cardHeight, 
                    category.type === 'good', 
                    isMobile,
                    this.scrollContainer
                );
                currentY += cardHeight + cardSpacing;
            });
            
            currentY += isMobile ? 20 : 30; // Extra space between categories
        });
        
        // Store scroll properties
        this.scrollAreaHeight = scrollAreaHeight;
        this.contentHeight = currentY - 140;
        this.scrollPosition = 0;
        this.maxScroll = Math.max(0, this.contentHeight - scrollAreaHeight);
        
        // Add scroll controls for mobile
        if (isMobile && this.maxScroll > 0) {
            this.addScrollControls(width, height);
        }
        
        // Add touch/wheel scrolling
        this.addScrollInput();
    }

    createVerticalCard(className, x, y, cardWidth, cardHeight, isGood, isMobile, container) {
        const classData = this.characterClasses[className];
        
        // Modern card container
        const cardContainer = this.add.container(x, y).setDepth(50);
        
        // Card background with modern styling
        const bgColor = isGood ? 0x2E7D32 : 0xC62828;
        const borderColor = isGood ? 0x4CAF50 : 0xF44336;
        
        const cardBg = this.add.graphics();
        cardBg.fillStyle(bgColor, 0.9);
        cardBg.fillRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 8);
        cardBg.lineStyle(2, borderColor, 1);
        cardBg.strokeRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 8);
        
        // Glass effect overlay
        cardBg.fillStyle(0xFFFFFF, 0.1);
        cardBg.fillRoundedRect(-cardWidth/2 + 2, -cardHeight/2 + 2, cardWidth - 4, cardHeight/3, 6);
        
        cardContainer.add(cardBg);

        // Class name and info in horizontal layout
        const nameSize = isMobile ? '14px' : '18px';
        const infoSize = isMobile ? '10px' : '12px';
        
        const classTitle = this.add.text(-cardWidth/2 + 10, -cardHeight/2 + 10, 
            this.capitalizeWords(className.replace('_', ' ')), {
            fontSize: nameSize,
            fontFamily: 'Arial Bold',
            fill: '#FFFFFF'
        }).setOrigin(0, 0);
        
        // Stats in compact horizontal format
        const statsText = `❤️${classData.hp} ⚔️${classData.damage} ⚡${classData.speed}`;
        const classStats = this.add.text(-cardWidth/2 + 10, cardHeight/2 - 15, statsText, {
            fontSize: infoSize,
            fontFamily: 'Arial',
            fill: '#DDDDDD'
        }).setOrigin(0, 1);
        
        // Weapon info on the right
        const weaponText = `🗡️ ${this.capitalizeWords(classData.weapon.replace('_', ' '))}`;
        const weaponInfo = this.add.text(cardWidth/2 - 10, 0, weaponText, {
            fontSize: infoSize,
            fontFamily: 'Arial',
            fill: '#FFD700'
        }).setOrigin(1, 0.5);
        
        cardContainer.add([classTitle, classStats, weaponInfo]);
        
        // Touch area for selection
        const touchArea = this.add.rectangle(0, 0, cardWidth, cardHeight, 0x000000, 0);
        touchArea.setInteractive();
        cardContainer.add(touchArea);
        
        // Hover/touch effects
        touchArea.on('pointerover', () => {
            if (this.selectedClass !== className) {
                this.tweens.add({
                    targets: cardContainer,
                    scaleX: 1.02,
                    scaleY: 1.02,
                    duration: 150,
                    ease: 'Power1'
                });
                
                cardBg.clear();
                cardBg.fillStyle(borderColor, 0.4);
                cardBg.fillRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 8);
                cardBg.lineStyle(3, borderColor, 1);
                cardBg.strokeRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 8);
            }
        });

        touchArea.on('pointerout', () => {
            if (this.selectedClass !== className) {
                this.tweens.add({
                    targets: cardContainer,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100,
                    ease: 'Power1'
                });
                
                cardBg.clear();
                cardBg.fillStyle(bgColor, 0.9);
                cardBg.fillRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 8);
                cardBg.lineStyle(2, borderColor, 1);
                cardBg.strokeRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 8);
                cardBg.fillStyle(0xFFFFFF, 0.1);
                cardBg.fillRoundedRect(-cardWidth/2 + 2, -cardHeight/2 + 2, cardWidth - 4, cardHeight/3, 6);
            }
        });

        touchArea.on('pointerdown', () => {
            this.selectVerticalClass(className, { cardContainer, cardBg, cardWidth, cardHeight, bgColor, borderColor });
        });
        
        // Store reference for selection
        cardContainer.className = className;
        cardContainer.cardBg = cardBg;
        cardContainer.cardWidth = cardWidth;
        cardContainer.cardHeight = cardHeight;
        cardContainer.bgColor = bgColor;
        cardContainer.borderColor = borderColor;
        
        container.add(cardContainer);
    }

    addScrollControls(width, height) {
        // Only add if there's content to scroll
        if (this.maxScroll <= 0) return;
        
        // Scroll indicators
        const scrollUpBtn = this.add.text(width - 30, 140, '▲', {
            fontSize: '20px',
            fill: '#FFD700',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(300).setInteractive();
        
        const scrollDownBtn = this.add.text(width - 30, height - 160, '▼', {
            fontSize: '20px',
            fill: '#FFD700',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(300).setInteractive();
        
        scrollUpBtn.on('pointerdown', () => this.scrollUp());
        scrollDownBtn.on('pointerdown', () => this.scrollDown());
        
        this.scrollUpBtn = scrollUpBtn;
        this.scrollDownBtn = scrollDownBtn;
        this.updateScrollButtons();
    }

    addScrollInput() {
        // Mouse wheel support
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            if (this.maxScroll > 0) {
                if (deltaY > 0) {
                    this.scrollDown();
                } else {
                    this.scrollUp();
                }
            }
        });

        // Touch swipe support
        let startY = 0;
        this.input.on('pointerdown', (pointer) => {
            startY = pointer.y;
        });

        this.input.on('pointerup', (pointer) => {
            if (this.maxScroll > 0) {
                const deltaY = pointer.y - startY;
                if (Math.abs(deltaY) > 30) { // Minimum swipe distance
                    if (deltaY > 0) {
                        this.scrollUp();
                    } else {
                        this.scrollDown();
                    }
                }
            }
        });
    }

    scrollUp() {
        if (this.scrollPosition > 0) {
            this.scrollPosition = Math.max(0, this.scrollPosition - 100);
            this.updateScrollPosition();
        }
    }

    scrollDown() {
        if (this.scrollPosition < this.maxScroll) {
            this.scrollPosition = Math.min(this.maxScroll, this.scrollPosition + 100);
            this.updateScrollPosition();
        }
    }

    updateScrollPosition() {
        this.scrollContainer.y = -this.scrollPosition;
        this.updateScrollButtons();
    }

    updateScrollButtons() {
        if (this.scrollUpBtn) {
            this.scrollUpBtn.setAlpha(this.scrollPosition > 0 ? 1 : 0.3);
        }
        if (this.scrollDownBtn) {
            this.scrollDownBtn.setAlpha(this.scrollPosition < this.maxScroll ? 1 : 0.3);
        }
    }

    selectVerticalClass(className, cardData) {
        console.log('Selecting class:', className);
        
        // Clear previous selection by iterating through scroll container children
        if (this.scrollContainer) {
            this.scrollContainer.list.forEach(child => {
                if (child.className && child !== cardData.cardContainer) {
                    child.setScale(1);
                    if (child.cardBg) {
                        // Reset to normal style
                        child.cardBg.clear();
                        child.cardBg.fillStyle(child.bgColor, 0.9);
                        child.cardBg.fillRoundedRect(-child.cardWidth/2, -child.cardHeight/2, child.cardWidth, child.cardHeight, 8);
                        child.cardBg.lineStyle(2, child.borderColor, 1);
                        child.cardBg.strokeRoundedRect(-child.cardWidth/2, -child.cardHeight/2, child.cardWidth, child.cardHeight, 8);
                        child.cardBg.fillStyle(0xFFFFFF, 0.1);
                        child.cardBg.fillRoundedRect(-child.cardWidth/2 + 2, -child.cardHeight/2 + 2, child.cardWidth - 4, child.cardHeight/3, 6);
                    }
                }
            });
        }

        // Select new class
        this.selectedClass = className;
        this.selectedWeapon = this.characterClasses[className].weapon;
        
        // Highlight selected card
        cardData.cardContainer.setScale(1.05);
        cardData.cardBg.clear();
        cardData.cardBg.fillStyle(0xFFD700, 0.3);
        cardData.cardBg.fillRoundedRect(-cardData.cardWidth/2, -cardData.cardHeight/2, cardData.cardWidth, cardData.cardHeight, 8);
        cardData.cardBg.lineStyle(4, 0xFFD700, 1);
        cardData.cardBg.strokeRoundedRect(-cardData.cardWidth/2, -cardData.cardHeight/2, cardData.cardWidth, cardData.cardHeight, 8);
        
        // Show weapon info
        if (this.weaponPanel) {
            this.weaponPanel.setVisible(true);
            const weaponData = this.characterClasses[className];
            if (this.weaponInfo) {
                this.weaponInfo.setText(`${this.capitalizeWords(weaponData.weapon.replace('_', ' '))}\nDamage: ${weaponData.damage} | Speed: ${weaponData.attackSpeed}`);
            }
        }
        
        // Show start button overlaid on the selected card
        this.showStartButtonOnCard(cardData.cardContainer);
        
        console.log('Class selected successfully:', this.selectedClass);
    }

    createMobileCard(className, x, y, cardWidth, cardHeight, isGood, isMobile) {
        const classData = this.characterClasses[className];
        
        // Modern card container
        const cardContainer = this.add.container(x, y).setDepth(50);
        
        // Card background with modern styling
        const bgColor = isGood ? 0x2E7D32 : 0xC62828;
        const borderColor = isGood ? 0x4CAF50 : 0xF44336;
        
        const cardBg = this.add.graphics();
        cardBg.fillStyle(bgColor, 0.9);
        cardBg.fillRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 8);
        cardBg.lineStyle(2, borderColor, 1);
        cardBg.strokeRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 8);
        
        // Glass effect overlay
        cardBg.fillStyle(0xFFFFFF, 0.1);
        cardBg.fillRoundedRect(-cardWidth/2 + 2, -cardHeight/2 + 2, cardWidth - 4, cardHeight/3, 6);
        
        cardContainer.add(cardBg);

        // Class name - mobile optimized
        const nameSize = isMobile ? '11px' : '14px';
        const className_display = className.replace('_', ' ').toUpperCase();
        const nameText = this.add.text(0, -cardHeight/2 + (isMobile ? 12 : 16), className_display, {
            fontSize: nameSize,
            fontFamily: 'Arial Bold',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);
        cardContainer.add(nameText);

        // Compact stats for mobile
        const statSize = isMobile ? '8px' : '10px';
        const statsY = isMobile ? -8 : -5;
        
        const hpText = this.add.text(0, statsY, `💚 ${classData.hp}`, {
            fontSize: statSize,
            fontFamily: 'Arial',
            fill: '#4CAF50'
        }).setOrigin(0.5);
        
        const dmgText = this.add.text(0, statsY + (isMobile ? 10 : 12), `⚔️ ${classData.damage}`, {
            fontSize: statSize,
            fontFamily: 'Arial',
            fill: '#FF9800'
        }).setOrigin(0.5);
        
        const spdText = this.add.text(0, statsY + (isMobile ? 20 : 24), `⚡ ${classData.speed}`, {
            fontSize: statSize,
            fontFamily: 'Arial',
            fill: '#2196F3'
        }).setOrigin(0.5);
        
        cardContainer.add([hpText, dmgText, spdText]);

        // Touch area for mobile-friendly interaction
        const touchArea = this.add.rectangle(0, 0, cardWidth + 10, cardHeight + 10, 0x000000, 0);
        touchArea.setInteractive();
        cardContainer.add(touchArea);
        
        // Modern hover/selection effects
        touchArea.on('pointerover', () => {
            this.tweens.add({
                targets: cardContainer,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100,
                ease: 'Power1'
            });
            
            cardBg.clear();
            cardBg.fillStyle(borderColor, 0.4);
            cardBg.fillRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 8);
            cardBg.lineStyle(3, borderColor, 1);
            cardBg.strokeRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 8);
        });

        touchArea.on('pointerout', () => {
            if (this.selectedClass !== className) {
                this.tweens.add({
                    targets: cardContainer,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100,
                    ease: 'Power1'
                });
                
                cardBg.clear();
                cardBg.fillStyle(bgColor, 0.9);
                cardBg.fillRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 8);
                cardBg.lineStyle(2, borderColor, 1);
                cardBg.strokeRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 8);
                cardBg.fillStyle(0xFFFFFF, 0.1);
                cardBg.fillRoundedRect(-cardWidth/2 + 2, -cardHeight/2 + 2, cardWidth - 4, cardHeight/3, 6);
            }
        });

        touchArea.on('pointerdown', () => {
            this.selectMobileClass(className, { cardContainer, cardBg, cardWidth, cardHeight, bgColor, borderColor });
        });
        
        // Store reference for selection
        cardContainer.className = className;
        cardContainer.cardBg = cardBg;
        cardContainer.cardWidth = cardWidth;
        cardContainer.cardHeight = cardHeight;
        cardContainer.bgColor = bgColor;
        cardContainer.borderColor = borderColor;
    }

    createMobileWeaponPanel(width, height, isMobile) {
        const panelY = height - (isMobile ? 80 : 100);
        const panelWidth = isMobile ? width * 0.95 : 400;
        
        // Modern weapon info container
        this.weaponPanel = this.add.container(width / 2, panelY).setDepth(200);
        
        const weaponBg = this.add.graphics();
        weaponBg.fillStyle(0x1A1A2E, 0.95);
        weaponBg.fillRoundedRect(-panelWidth/2, -25, panelWidth, 50, 10);
        weaponBg.lineStyle(2, 0xFFD700, 1);
        weaponBg.strokeRoundedRect(-panelWidth/2, -25, panelWidth, 50, 10);
        
        this.weaponTitle = this.add.text(0, -10, '🗡️ Weapon Selected', {
            fontSize: isMobile ? '12px' : '14px',
            fontFamily: 'Arial Bold',
            fill: '#FFD700'
        }).setOrigin(0.5);
        
        this.weaponInfo = this.add.text(0, 8, '', {
            fontSize: isMobile ? '10px' : '12px',
            fontFamily: 'Arial',
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);
        
        this.weaponPanel.add([weaponBg, this.weaponTitle, this.weaponInfo]);
        this.weaponPanel.setVisible(false);
        
        // Modern start button
        this.createMobileStartButton(width, height, isMobile);
    }

    createMobileStartButton(width, height, isMobile) {
        const buttonY = height - (isMobile ? 35 : 45); // Move button higher up
        const buttonWidth = isMobile ? width * 0.9 : 350; // Make wider
        const buttonHeight = isMobile ? 50 : 60; // Make taller
        
        this.startButtonContainer = this.add.container(width / 2, buttonY).setDepth(250);
        
        // Modern button background
        this.startButtonBg = this.add.graphics();
        this.updateStartButton(false, buttonWidth, buttonHeight); // Initially disabled
        
        this.startText = this.add.text(0, 0, 'Select a Warrior First', {
            fontSize: isMobile ? '16px' : '18px', // Larger text
            fontFamily: 'Arial Bold',
            fill: '#999999'
        }).setOrigin(0.5);
        
        this.startButtonContainer.add([this.startButtonBg, this.startText]);
        
        // Touch area - larger for easier clicking
        const startTouchArea = this.add.rectangle(0, 0, buttonWidth + 40, buttonHeight + 20, 0x000000, 0);
        startTouchArea.setInteractive();
        this.startButtonContainer.add(startTouchArea);
        
        // Make the default button invisible since we'll use card overlay
        this.startButtonContainer.setVisible(false);
        
        // Add hover effect for better feedback
        startTouchArea.on('pointerover', () => {
            if (this.selectedClass) {
                this.startButtonContainer.setScale(1.05);
            }
        });
        
        startTouchArea.on('pointerout', () => {
            this.startButtonContainer.setScale(1);
        });
        
        startTouchArea.on('pointerdown', () => {
            if (this.selectedClass) {
                this.startGame();
            } else {
                // Visual feedback for disabled button
                this.tweens.add({
                    targets: this.startButtonContainer,
                    scaleX: 0.95,
                    scaleY: 0.95,
                    duration: 100,
                    yoyo: true,
                    ease: 'Power1'
                });
            }
        });
    }

    updateStartButton(enabled, width, height) {
        this.startButtonBg.clear();
        
        if (enabled) {
            this.startButtonBg.fillStyle(0x4CAF50, 1);
            this.startButtonBg.fillRoundedRect(-width/2, -height/2, width, height, 12);
            this.startButtonBg.lineStyle(3, 0x66BB6A, 1);
            this.startButtonBg.strokeRoundedRect(-width/2, -height/2, width, height, 12);
            
            // Glow effect
            this.startButtonBg.lineStyle(1, 0x81C784, 0.8);
            this.startButtonBg.strokeRoundedRect(-width/2 + 2, -height/2 + 2, width - 4, height - 4, 10);
        } else {
            this.startButtonBg.fillStyle(0x666666, 1);
            this.startButtonBg.fillRoundedRect(-width/2, -height/2, width, height, 12);
            this.startButtonBg.lineStyle(2, 0x999999, 1);
            this.startButtonBg.strokeRoundedRect(-width/2, -height/2, width, height, 12);
        }
    }

    selectMobileClass(className, cardData) {
        // Clear previous selection
        if (this.selectedCardContainer) {
            const oldCard = this.selectedCardContainer;
            oldCard.cardBg.clear();
            oldCard.cardBg.fillStyle(oldCard.bgColor, 0.9);
            oldCard.cardBg.fillRoundedRect(-oldCard.cardWidth/2, -oldCard.cardHeight/2, oldCard.cardWidth, oldCard.cardHeight, 8);
            oldCard.cardBg.lineStyle(2, oldCard.borderColor, 1);
            oldCard.cardBg.strokeRoundedRect(-oldCard.cardWidth/2, -oldCard.cardHeight/2, oldCard.cardWidth, oldCard.cardHeight, 8);
            oldCard.cardBg.fillStyle(0xFFFFFF, 0.1);
            oldCard.cardBg.fillRoundedRect(-oldCard.cardWidth/2 + 2, -oldCard.cardHeight/2 + 2, oldCard.cardWidth - 4, oldCard.cardHeight/3, 6);
            
            this.tweens.add({
                targets: oldCard,
                scaleX: 1,
                scaleY: 1,
                duration: 150
            });
        }

        // Set new selection
        this.selectedClass = className;
        this.selectedWeapon = this.characterClasses[className].weapon;
        this.selectedCardContainer = cardData.cardContainer;
        
        // Update selected card appearance
        const { cardContainer, cardBg, cardWidth, cardHeight, borderColor } = cardData;
        
        cardBg.clear();
        cardBg.fillStyle(0xFFD700, 0.3);
        cardBg.fillRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 8);
        cardBg.lineStyle(4, 0xFFD700, 1);
        cardBg.strokeRoundedRect(-cardWidth/2, -cardHeight/2, cardWidth, cardHeight, 8);
        
        // Glow effect for selection
        cardBg.lineStyle(2, 0xFFFFFF, 0.8);
        cardBg.strokeRoundedRect(-cardWidth/2 + 3, -cardHeight/2 + 3, cardWidth - 6, cardHeight - 6, 5);
        
        this.tweens.add({
            targets: cardContainer,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 150,
            ease: 'Back.easeOut'
        });

        // Show weapon info
        this.weaponPanel.setVisible(true);
        const weaponName = this.selectedWeapon.replace('_', ' ');
        const classData = this.characterClasses[className];
        this.weaponInfo.setText(`${this.capitalizeWords(weaponName)} | Range: ${classData.attackRange} | Speed: ${classData.attackSpeed}x`);

        // Enable start button
        const isMobile = this.cameras.main.width < 900;
        const buttonWidth = isMobile ? this.cameras.main.width * 0.8 : 300;
        const buttonHeight = isMobile ? 40 : 50;
        
        this.updateStartButton(true, buttonWidth, buttonHeight);
        this.startText.setText('🏺 Start Battle!');
        this.startText.setStyle({ fill: '#FFFFFF' });
        
        console.log(`Selected class: ${className} with weapon: ${this.selectedWeapon}`);
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
        // This method is now replaced by selectMobileClass for better mobile UX
        this.selectMobileClass(className, cardElement);
    }

    startGame() {
        console.log('=== STARTING GAME ===');
        console.log('CharacterSelectionScene: startGame called');
        console.log('Selected class:', this.selectedClass);
        console.log('Selected weapon:', this.selectedWeapon);
        console.log('Character classes available:', Object.keys(this.characterClasses));
        
        // Double check we have a valid class
        if (!this.selectedClass || !this.characterClasses[this.selectedClass]) {
            console.error('No valid class selected, cannot start game');
            console.log('Available classes:', Object.keys(this.characterClasses));
            // Show error message to user
            this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 20, 
                'Please select a class first!', {
                fontSize: '18px',
                fill: '#FF0000'
            }).setOrigin(0.5).setDepth(200);
            return;
        }

        // Prevent multiple clicks
        if (this.isTransitioning) {
            console.log('Already transitioning, ignoring click');
            return;
        }
        console.log('Setting transitioning flag...');
        this.isTransitioning = true;

        // Disable the button during transition
        if (this.startButtonContainer) {
            // Find the touch area (which is interactive)
            const touchArea = this.startButtonContainer.list.find(child => child.input);
            if (touchArea) {
                touchArea.setInteractive(false);
            }
        }
        if (this.startText) {
            this.startText.setText('Starting...');
        }

        // Store selection in all possible places for reliability
        const selectionData = {
            selectedClass: this.selectedClass,
            selectedWeapon: this.selectedWeapon
        };

        // Store in global registry 
        this.registry.set('selectedClass', this.selectedClass);
        this.registry.set('selectedWeapon', this.selectedWeapon);

        // Store in game registry (Phaser's global data store)
        this.game.registry.set('selectedClass', this.selectedClass);
        this.game.registry.set('selectedWeapon', this.selectedWeapon);
        
        console.log('Data stored in registries, starting transition...');
        console.log('Global registry check:', this.registry.get('selectedClass'));

        // Add a small delay to ensure everything is properly set
        this.time.delayedCall(100, () => {
            console.log('=== SCENE TRANSITION ===');
            console.log('Starting GameSceneSimpleFast with scene data...');
            console.log('Selection data to pass:', selectionData);
            
            try {
                // ULTRA SIMPLE TEST: Just destroy current scene and go black
                console.log('ULTRA SIMPLE TEST: Destroying character selection...');
                
                // Clear the screen immediately for visual feedback
                this.cameras.main.setBackgroundColor('#000000');
                this.children.removeAll(true);
                
                // Add simple test text
                this.add.text(400, 300, 'LOADING GAME...', {
                    fontSize: '32px',
                    fill: '#FFFFFF',
                    fontFamily: 'Arial'
                }).setOrigin(0.5).setDepth(1000);
                
                // Force scene change after a moment
                this.time.delayedCall(500, () => {
                    console.log('Starting GameSceneSimpleWorkingEnhanced...');
                    this.scene.start('GameSceneSimpleWorkingEnhanced', selectionData);
                });
                
            } catch (error) {
                console.error('Error starting GameSceneSimpleFast:', error);
                console.error('Error stack:', error.stack);
                this.isTransitioning = false;
                if (this.startButtonContainer) {
                    const touchArea = this.startButtonContainer.list.find(child => child.input);
                    if (touchArea) {
                        touchArea.setInteractive(true);
                    }
                }
                if (this.startText) {
                    this.startText.setText('Start Battle!');
                }
            }
        });
    }

    showStartButtonOnCard(cardContainer) {
        // Remove any existing start button overlay
        if (this.cardStartButton) {
            this.cardStartButton.destroy();
        }
        
        // Create a start button overlay on the selected card
        const cardX = cardContainer.x;
        const cardY = cardContainer.y;
        
        this.cardStartButton = this.add.container(cardX, cardY).setDepth(400);
        
        // Semi-transparent overlay
        const overlay = this.add.rectangle(0, 20, cardContainer.cardWidth * 0.9, 35, 0x000000, 0.8);
        
        // Start button background
        const buttonBg = this.add.rectangle(0, 20, cardContainer.cardWidth * 0.8, 30, 0x4CAF50, 1);
        buttonBg.setStrokeStyle(2, 0xFFD700);
        
        // Start button text
        const buttonText = this.add.text(0, 20, '⚔️ START BATTLE!', {
            fontSize: '14px',
            fontFamily: 'Arial Bold',
            fill: '#FFFFFF'
        }).setOrigin(0.5);
        
        // Make it interactive
        const touchArea = this.add.rectangle(0, 20, cardContainer.cardWidth * 0.9, 35, 0x000000, 0);
        touchArea.setInteractive();
        
        // Add pulsing animation
        this.tweens.add({
            targets: buttonBg,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Click handler
        touchArea.on('pointerdown', () => {
            console.log('=== CARD START BUTTON CLICKED ===');
            console.log('Selected class:', this.selectedClass);
            console.log('Selected weapon:', this.selectedWeapon);
            console.log('Is transitioning:', this.isTransitioning);
            
            if (!this.selectedClass) {
                console.error('No selected class when button clicked!');
                return;
            }
            
            try {
                console.log('Calling startGame()...');
                this.startGame();
            } catch (error) {
                console.error('Error calling startGame:', error);
            }
        });
        
        this.cardStartButton.add([overlay, buttonBg, buttonText, touchArea]);
        
        console.log('Start button overlay created on card at:', cardX, cardY);
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
