// Professional UI Components for TheFirstGame
// Making it look like it cost millions to develop instead of a child's Paint project

export class ProfessionalUI {
    
    /**
     * Creates professional text with advanced styling and shadow effects
     */
    static createProfessionalText(scene, x, y, text, options = {}) {
        const defaultOptions = {
            fontSize: '24px',
            fontFamily: 'Arial Black',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: {
                offsetX: 3,
                offsetY: 3,
                color: '#000000',
                blur: 8,
                fill: true
            }
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        // Create the text with advanced styling
        const textObject = scene.add.text(x, y, text, finalOptions);
        
        // Add glow effect for extra professionalism
        if (options.glow) {
            const glowText = scene.add.text(x, y, text, {
                ...finalOptions,
                fill: options.glow,
                stroke: options.glow,
                strokeThickness: 6
            });
            glowText.setDepth((textObject.depth || 0) - 1);
            glowText.setAlpha(0.3);
        }
        
        return textObject;
    }
    
    // Create beautiful gradient backgrounds
    static createGradientBackground(scene, width, height, colors = null) {
        const graphics = scene.add.graphics();
        
        // Default professional color scheme
        if (!colors) {
            colors = {
                topLeft: 0x0a0a0a,     // Deep black
                topRight: 0x1a1a2e,    // Dark blue-grey
                bottomLeft: 0x16213e,  // Steel blue
                bottomRight: 0x0f3460  // Deep blue
            };
        }
        
        // Create smooth gradient
        graphics.fillGradientStyle(
            colors.topLeft, colors.topRight, 
            colors.bottomLeft, colors.bottomRight, 1
        );
        graphics.fillRect(0, 0, width, height);
        
        // Add subtle texture overlay
        const overlay = scene.add.graphics();
        overlay.fillStyle(0x000000, 0.1);
        
        // Create noise pattern for texture
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = Math.random() * 2;
            overlay.fillRect(x, y, size, size);
        }
        
        return { background: graphics, overlay: overlay };
    }
    
    // Create professional card with glass effect
    static createGlassCard(scene, width, height, color = 0x1a1a2e) {
        const graphics = scene.add.graphics();
        
        // Main card background with rounded corners
        graphics.fillStyle(color, 0.8);
        graphics.fillRoundedRect(0, 0, width, height, 12);
        
        // Glossy top highlight
        graphics.fillStyle(0xffffff, 0.1);
        graphics.fillRoundedRect(2, 2, width - 4, height / 3, 10);
        
        // Border with gradient effect
        graphics.lineStyle(2, 0x4a90e2, 0.8);
        graphics.strokeRoundedRect(0, 0, width, height, 12);
        
        // Inner border for depth
        graphics.lineStyle(1, 0xffffff, 0.2);
        graphics.strokeRoundedRect(1, 1, width - 2, height - 2, 11);
        
        return graphics;
    }
    
    // Create professional button with hover states
    static createProfessionalButton(scene, width, height, text, config = {}) {
        const container = scene.add.container(0, 0);
        
        // Default config
        const defaultConfig = {
            baseColor: 0x2c3e50,
            hoverColor: 0x3498db,
            pressedColor: 0x2980b9,
            textColor: '#ecf0f1',
            fontSize: '16px',
            borderColor: 0x4a90e2
        };
        
        const finalConfig = { ...defaultConfig, ...config };
        
        // Button states
        const states = {
            normal: this.createButtonState(scene, width, height, finalConfig.baseColor, finalConfig.borderColor),
            hover: this.createButtonState(scene, width, height, finalConfig.hoverColor, finalConfig.borderColor),
            pressed: this.createButtonState(scene, width, height, finalConfig.pressedColor, finalConfig.borderColor)
        };
        
        // Add to container
        container.add(states.normal);
        states.hover.setVisible(false);
        states.pressed.setVisible(false);
        container.add(states.hover);
        container.add(states.pressed);
        
        // Text
        const buttonText = scene.add.text(0, 0, text, {
            fontSize: finalConfig.fontSize,
            fontFamily: 'Arial Black',
            fill: finalConfig.textColor,
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);
        
        container.add(buttonText);
        
        // Make interactive
        const hitArea = scene.add.rectangle(0, 0, width, height, 0x000000, 0);
        hitArea.setInteractive();
        container.add(hitArea);
        
        // States management
        let currentState = 'normal';
        
        const showState = (state) => {
            states.normal.setVisible(state === 'normal');
            states.hover.setVisible(state === 'hover');
            states.pressed.setVisible(state === 'pressed');
            currentState = state;
        };
        
        // Hover effects
        hitArea.on('pointerover', () => {
            if (currentState !== 'pressed') {
                showState('hover');
                scene.tweens.add({
                    targets: container,
                    scaleX: 1.05,
                    scaleY: 1.05,
                    duration: 200,
                    ease: 'Power2'
                });
            }
        });
        
        hitArea.on('pointerout', () => {
            if (currentState !== 'pressed') {
                showState('normal');
                scene.tweens.add({
                    targets: container,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 200,
                    ease: 'Power2'
                });
            }
        });
        
        hitArea.on('pointerdown', () => {
            showState('pressed');
            scene.tweens.add({
                targets: container,
                scaleX: 0.98,
                scaleY: 0.98,
                duration: 100,
                ease: 'Power2'
            });
        });
        
        hitArea.on('pointerup', () => {
            showState('hover');
            scene.tweens.add({
                targets: container,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 100,
                ease: 'Power2'
            });
        });
        
        return { container, hitArea, text: buttonText, showState };
    }
    
    static createButtonState(scene, width, height, fillColor, borderColor) {
        const graphics = scene.add.graphics();
        
        // Main button background
        graphics.fillStyle(fillColor, 0.9);
        graphics.fillRoundedRect(0, 0, width, height, 8);
        
        // Highlight
        graphics.fillStyle(0xffffff, 0.1);
        graphics.fillRoundedRect(2, 2, width - 4, height / 2, 6);
        
        // Border
        graphics.lineStyle(2, borderColor, 0.8);
        graphics.strokeRoundedRect(0, 0, width, height, 8);
        
        // Inner shadow
        graphics.lineStyle(1, 0x000000, 0.2);
        graphics.strokeRoundedRect(1, height - 2, width - 2, 1, 0);
        
        return graphics;
    }
    
    /**
     * Creates glass-effect panels with modern styling
     */
    static createGlassPanel(scene, x, y, width, height, options = {}) {
        const { 
            backgroundColor = 0x1a1a2e,
            borderColor = 0xFFD700,
            alpha = 0.85,
            borderWidth = 2,
            cornerRadius = 12
        } = options;
        
        const container = scene.add.container(x, y);
        
        // Main panel with glass effect
        const panel = scene.add.graphics();
        panel.fillStyle(backgroundColor, alpha);
        panel.fillRoundedRect(-width/2, -height/2, width, height, cornerRadius);
        
        // Glowing border
        panel.lineStyle(borderWidth, borderColor, 1);
        panel.strokeRoundedRect(-width/2, -height/2, width, height, cornerRadius);
        
        // Inner highlight for glass effect
        const highlight = scene.add.graphics();
        highlight.lineStyle(1, 0xFFFFFF, 0.3);
        highlight.strokeRoundedRect(-width/2 + 2, -height/2 + 2, width - 4, height * 0.3, cornerRadius);
        
        // Gloss effect overlay
        const gloss = scene.add.graphics();
        gloss.fillGradientStyle(0xFFFFFF, 0xFFFFFF, 0xFFFFFF, 0x000000, 0.2, 0.1, 0.0, 0.0);
        gloss.fillRoundedRect(-width/2, -height/2, width, height * 0.4, cornerRadius);
        
        container.add([panel, highlight, gloss]);
        return container;
    }

    /**
     * Creates animated buttons with hover and click effects
     */
    static createAnimatedButton(scene, x, y, width, height, text, options = {}) {
        const {
            backgroundColor = 0x27AE60,
            hoverColor = 0x2ECC71,
            clickColor = 0x1E8449,
            textColor = '#FFFFFF',
            fontSize = '18px',
            onClick = () => {}
        } = options;
        
        const container = scene.add.container(x, y);
        
        // Button background with gradient
        const background = scene.add.graphics();
        this.drawButtonBackground(background, width, height, backgroundColor);
        
        // Button text with styling
        const buttonText = this.createProfessionalText(scene, 0, 0, text, {
            fontSize: fontSize,
            fontFamily: 'Arial Black',
            fill: textColor,
            stroke: '#000000',
            strokeThickness: 1
        });
        buttonText.setOrigin(0.5);
        
        // Shine effect
        const shine = scene.add.graphics();
        shine.fillGradientStyle(0xFFFFFF, 0xFFFFFF, 0x000000, 0x000000, 0.3, 0.1, 0.0, 0.0);
        shine.fillRoundedRect(-width/2, -height/2, width, height * 0.3, 8);
        
        container.add([background, shine, buttonText]);
        container.setInteractive(new Phaser.Geom.Rectangle(-width/2, -height/2, width, height), Phaser.Geom.Rectangle.Contains);
        
        // Professional hover effects
        container.on('pointerover', () => {
            background.clear();
            this.drawButtonBackground(background, width, height, hoverColor);
            
            scene.tweens.add({
                targets: container,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 150,
                ease: 'Power2'
            });
            
            // Add glow effect
            const glow = scene.add.graphics();
            glow.fillStyle(hoverColor, 0.3);
            glow.fillRoundedRect(-width/2 - 5, -height/2 - 5, width + 10, height + 10, 12);
            glow.setDepth(container.depth - 1);
            container.glowEffect = glow;
        });
        
        container.on('pointerout', () => {
            background.clear();
            this.drawButtonBackground(background, width, height, backgroundColor);
            
            scene.tweens.add({
                targets: container,
                scaleX: 1,
                scaleY: 1,
                duration: 150,
                ease: 'Power2'
            });
            
            if (container.glowEffect) {
                container.glowEffect.destroy();
                container.glowEffect = null;
            }
        });
        
        container.on('pointerdown', () => {
            background.clear();
            this.drawButtonBackground(background, width, height, clickColor);
            
            scene.tweens.add({
                targets: container,
                scaleX: 0.95,
                scaleY: 0.95,
                duration: 100,
                yoyo: true,
                ease: 'Power2',
                onComplete: onClick
            });
        });
        
        return container;
    }

    static drawButtonBackground(graphics, width, height, color) {
        // Main button background
        graphics.fillStyle(color, 1);
        graphics.fillRoundedRect(-width/2, -height/2, width, height, 8);
        
        // Golden border
        graphics.lineStyle(2, 0xFFD700, 1);
        graphics.strokeRoundedRect(-width/2, -height/2, width, height, 8);
        
        // Inner shadow
        graphics.lineStyle(1, 0x000000, 0.3);
        graphics.strokeRoundedRect(-width/2 + 1, -height/2 + 1, width - 2, height - 2, 7);
    }

    /**
     * Creates atmospheric particle effects
     */
    static createAtmosphericParticles(scene, width, height, type = 'embers') {
        const particleConfigs = {
            embers: {
                x: { min: 0, max: width },
                y: height + 20,
                speedY: { min: -100, max: -40 },
                speedX: { min: -30, max: 30 },
                scale: { start: 0.4, end: 0.1 },
                alpha: { start: 0.9, end: 0 },
                lifespan: 8000,
                frequency: 1200,
                tint: [0xFF6B35, 0xFF8C42, 0xFFD23F, 0xFF4757]
            },
            magic: {
                x: { min: 0, max: width },
                y: { min: 0, max: height },
                speedY: { min: -50, max: 50 },
                speedX: { min: -50, max: 50 },
                scale: { start: 0.2, end: 0.5 },
                alpha: { start: 1, end: 0 },
                lifespan: 4000,
                frequency: 800,
                tint: [0x9B59B6, 0x8E44AD, 0x3498DB, 0x2ECC71]
            },
            battlefield: {
                x: { min: -50, max: width + 50 },
                y: height + 10,
                speedY: { min: -60, max: -20 },
                speedX: { min: -15, max: 15 },
                scale: { start: 0.2, end: 0.05 },
                alpha: { start: 0.6, end: 0 },
                lifespan: 10000,
                frequency: 1500,
                tint: [0x8B4513, 0xA0522D, 0x654321]
            }
        };
        
        const config = particleConfigs[type] || particleConfigs.embers;
        
        // Create multiple particle textures for variety
        const textures = ['particle_1', 'particle_2', 'particle_3'];
        textures.forEach((textureName, index) => {
            const graphics = scene.add.graphics();
            graphics.fillStyle(0xFFFFFF, 1);
            
            switch(index) {
                case 0:
                    graphics.fillCircle(4, 4, 3);
                    break;
                case 1:
                    graphics.fillRect(2, 2, 4, 4);
                    break;
                case 2:
                    graphics.fillTriangle(4, 1, 1, 7, 7, 7);
                    break;
            }
            
            graphics.generateTexture(textureName, 8, 8);
            graphics.destroy();
        });
        
        // Use random texture
        const randomTexture = textures[Math.floor(Math.random() * textures.length)];
        return scene.add.particles(0, 0, randomTexture, config);
    }

    /**
     * Creates professional character selection cards
     */
    static createCharacterCard(scene, x, y, characterData, options = {}) {
        const {
            width = 220,
            height = 140,
            isSelected = false,
            isGood = true
        } = options;
        
        const container = scene.add.container(x, y);
        
        // Card background with faction-based colors
        const backgroundColor = isSelected ? 
            (isGood ? 0x2E86AB : 0xA23B72) : 
            (isGood ? 0x064663 : 0x5D1A37);
            
        const borderColor = isSelected ? 0xFF6B35 : (isGood ? 0x4A90E2 : 0xE74C3C);
        
        const cardPanel = this.createGlassPanel(scene, 0, 0, width, height, {
            backgroundColor,
            borderColor,
            alpha: 0.9,
            borderWidth: isSelected ? 3 : 2
        });
        
        // Character portrait (enhanced)
        const portrait = scene.add.graphics();
        const portraitColor = characterData.color || (isGood ? 0x4169E1 : 0xDC143C);
        
        // Main portrait circle
        portrait.fillStyle(portraitColor, 1);
        portrait.fillCircle(0, -30, 28);
        
        // Portrait details
        portrait.fillStyle(0xFFFFFF, 0.8);
        portrait.fillCircle(-8, -35, 4); // Eyes
        portrait.fillCircle(8, -35, 4);
        portrait.fillStyle(0x000000, 1);
        portrait.fillCircle(-8, -35, 2);
        portrait.fillCircle(8, -35, 2);
        
        // Weapon indicator
        portrait.lineStyle(3, 0xFFD700, 1);
        portrait.strokeCircle(0, -30, 30);
        
        portrait.setDepth(2);
        
        // Character name with enhanced styling
        const nameText = this.createProfessionalText(scene, 0, -65, characterData.name, {
            fontSize: '16px',
            fontFamily: 'Arial Black',
            fill: borderColor,
            stroke: '#000000',
            strokeThickness: 2,
            glow: isSelected ? borderColor : null
        });
        nameText.setOrigin(0.5);
        nameText.setDepth(2);
        
        // Enhanced stats display
        const statsContainer = scene.add.container(0, 15);
        const stats = [
            { label: 'HP', value: characterData.hp, color: '#E74C3C' },
            { label: 'DMG', value: characterData.damage, color: '#F39C12' },
            { label: 'SPD', value: characterData.speed, color: '#2ECC71' }
        ];
        
        stats.forEach((stat, index) => {
            const statBg = scene.add.rectangle(-60 + index * 40, 0, 35, 25, 0x000000, 0.6);
            statBg.setStrokeStyle(1, Phaser.Display.Color.HexStringToColor(stat.color).color, 1);
            
            const statText = scene.add.text(-60 + index * 40, -6, stat.label, {
                fontSize: '10px',
                fontFamily: 'Arial Black',
                fill: stat.color
            });
            statText.setOrigin(0.5);
            
            const valueText = scene.add.text(-60 + index * 40, 6, stat.value.toString(), {
                fontSize: '12px',
                fontFamily: 'Arial Black',
                fill: '#FFFFFF'
            });
            valueText.setOrigin(0.5);
            
            statsContainer.add([statBg, statText, valueText]);
        });
        statsContainer.setDepth(2);
        
        // Weapon display with icon
        const weaponBg = this.createGlassPanel(scene, 0, 55, width - 20, 25, {
            backgroundColor: 0x000000,
            borderColor: 0xFFD700,
            alpha: 0.7
        });
        
        const weaponText = this.createProfessionalText(scene, 0, 55, characterData.weapon, {
            fontSize: '12px',
            fontFamily: 'Arial Black',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 1
        });
        weaponText.setOrigin(0.5);
        weaponText.setDepth(3);
        
        container.add([cardPanel, portrait, nameText, statsContainer, weaponBg, weaponText]);
        
        // Enhanced interaction area
        container.setInteractive(new Phaser.Geom.Rectangle(-width/2, -height/2, width, height), Phaser.Geom.Rectangle.Contains);
        
        // Selection animation
        if (isSelected) {
            scene.tweens.add({
                targets: container,
                scaleX: 1.02,
                scaleY: 1.02,
                duration: 1000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        
        return container;
    }

    /**
     * Creates professional health bars with animations
     */
    static createHealthBar(scene, x, y, width, height, maxValue, currentValue, options = {}) {
        const {
            backgroundColor = 0x660000,
            healthColor = 0x00AA00,
            lowHealthColor = 0xFF0000,
            criticalHealthColor = 0xFF4444,
            borderColor = 0xFFFFFF,
            showText = true,
            animated = true
        } = options;
        
        const container = scene.add.container(x, y);
        
        // Background with gradient
        const background = scene.add.graphics();
        background.fillGradientStyle(backgroundColor, backgroundColor, 0x000000, 0x000000, 0.8, 0.6, 0.4, 0.2);
        background.fillRoundedRect(-width/2, -height/2, width, height, 3);
        background.lineStyle(1, borderColor, 0.8);
        background.strokeRoundedRect(-width/2, -height/2, width, height, 3);
        
        // Health bar with dynamic color
        const healthPercent = Math.max(0, currentValue / maxValue);
        let currentHealthColor = healthColor;
        
        if (healthPercent < 0.15) currentHealthColor = criticalHealthColor;
        else if (healthPercent < 0.3) currentHealthColor = lowHealthColor;
        
        const healthBar = scene.add.graphics();
        healthBar.fillStyle(currentHealthColor, 0.9);
        healthBar.fillRoundedRect(-width/2, -height/2, width * healthPercent, height, 3);
        
        // Health bar shine effect
        const shine = scene.add.graphics();
        shine.fillGradientStyle(0xFFFFFF, 0xFFFFFF, currentHealthColor, currentHealthColor, 0.4, 0.2, 0.1, 0.0);
        shine.fillRoundedRect(-width/2, -height/2, width * healthPercent, height * 0.4, 3);
        
        container.add([background, healthBar, shine]);
        
        if (showText) {
            const healthText = this.createProfessionalText(scene, 0, 0, `${Math.round(currentValue)}/${maxValue}`, {
                fontSize: '11px',
                fontFamily: 'Arial Black',
                fill: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 1
            });
            healthText.setOrigin(0.5);
            container.add(healthText);
        }
        
        // Update method with smooth animations
        container.updateHealth = (newValue, animate = animated) => {
            const newPercent = Math.max(0, newValue / maxValue);
            let newColor = healthColor;
            
            if (newPercent < 0.15) newColor = criticalHealthColor;
            else if (newPercent < 0.3) newColor = lowHealthColor;
            
            if (animate) {
                // Smooth health bar animation
                scene.tweens.add({
                    targets: { percent: healthPercent },
                    percent: newPercent,
                    duration: 300,
                    ease: 'Power2',
                    onUpdate: (tween) => {
                        const currentPercent = tween.getValue();
                        healthBar.clear();
                        healthBar.fillStyle(newColor, 0.9);
                        healthBar.fillRoundedRect(-width/2, -height/2, width * currentPercent, height, 3);
                        
                        shine.clear();
                        shine.fillGradientStyle(0xFFFFFF, 0xFFFFFF, newColor, newColor, 0.4, 0.2, 0.1, 0.0);
                        shine.fillRoundedRect(-width/2, -height/2, width * currentPercent, height * 0.4, 3);
                    }
                });
                
                // Flash effect on damage
                if (newValue < currentValue) {
                    const flash = scene.add.rectangle(0, 0, width, height, 0xFF0000, 0.5);
                    container.add(flash);
                    
                    scene.tweens.add({
                        targets: flash,
                        alpha: 0,
                        duration: 200,
                        onComplete: () => flash.destroy()
                    });
                }
            } else {
                healthBar.clear();
                healthBar.fillStyle(newColor, 0.9);
                healthBar.fillRoundedRect(-width/2, -height/2, width * newPercent, height, 3);
                
                shine.clear();
                shine.fillGradientStyle(0xFFFFFF, 0xFFFFFF, newColor, newColor, 0.4, 0.2, 0.1, 0.0);
                shine.fillRoundedRect(-width/2, -height/2, width * newPercent, height * 0.4, 3);
            }
            
            if (showText) {
                container.list[container.list.length - 1].setText(`${Math.round(newValue)}/${maxValue}`);
            }
        };
        
        return container;
    }

    // Create animated title with professional effects
    static createAnimatedTitle(scene, x, y, text, config = {}) {
        const defaultConfig = {
            fontSize: '48px',
            fontFamily: 'Arial Black',
            fill: '#FFD700',
            stroke: '#8B4513',
            strokeThickness: 4,
            shadow: {
                offsetX: 4,
                offsetY: 4,
                color: '#000000',
                blur: 12,
                fill: true
            }
        };
        
        const finalConfig = { ...defaultConfig, ...config };
        
        // Create the title
        const title = scene.add.text(x, y, text, finalConfig);
        title.setOrigin(0.5);
        
        // Add subtle glow effect
        const glow = scene.add.text(x, y, text, {
            ...finalConfig,
            fill: '#FFFFFF',
            stroke: '#FFD700',
            strokeThickness: 8
        });
        glow.setOrigin(0.5);
        glow.setAlpha(0.2);
        glow.setDepth((title.depth || 0) - 1);
        
        // Breathing animation
        scene.tweens.add({
            targets: [title, glow],
            scaleX: 1.02,
            scaleY: 1.02,
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
        
        // Subtle glow pulse
        scene.tweens.add({
            targets: glow,
            alpha: 0.4,
            duration: 3000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
        
        return { title, glow };
    }
    
    // Create professional health bar with smooth animations
    static createProfessionalHealthBar(scene, x, y, width, height, config = {}) {
        const container = scene.add.container(x, y);
        
        const defaultConfig = {
            backgroundColor: 0x2c3e50,
            borderColor: 0x34495e,
            healthColor: 0xe74c3c,
            lowHealthColor: 0xf39c12,
            criticalHealthColor: 0xe74c3c,
            textColor: '#ecf0f1'
        };
        
        const finalConfig = { ...defaultConfig, ...config };
        
        // Background
        const bg = scene.add.graphics();
        bg.fillStyle(finalConfig.backgroundColor, 0.8);
        bg.fillRoundedRect(-width/2, -height/2, width, height, 4);
        bg.lineStyle(1, finalConfig.borderColor, 1);
        bg.strokeRoundedRect(-width/2, -height/2, width, height, 4);
        container.add(bg);
        
        // Health bar
        const healthBar = scene.add.graphics();
        container.add(healthBar);
        
        // Text
        const healthText = scene.add.text(0, 0, '100/100', {
            fontSize: '12px',
            fontFamily: 'Arial',
            fill: finalConfig.textColor,
            stroke: '#000000',
            strokeThickness: 1
        });
        healthText.setOrigin(0.5);
        container.add(healthText);
        
        // Update function
        container.updateHealth = (current, max) => {
            const percentage = current / max;
            const barWidth = (width - 4) * percentage;
            
            // Choose color based on health
            let color = finalConfig.healthColor;
            if (percentage <= 0.25) {
                color = finalConfig.criticalHealthColor;
            } else if (percentage <= 0.5) {
                color = finalConfig.lowHealthColor;
            }
            
            // Redraw health bar with smooth animation
            healthBar.clear();
            healthBar.fillStyle(color, 0.9);
            healthBar.fillRoundedRect(-width/2 + 2, -height/2 + 2, barWidth, height - 4, 2);
            
            // Add glow effect for low health
            if (percentage <= 0.3) {
                healthBar.lineStyle(2, 0xff0000, 0.6);
                healthBar.strokeRoundedRect(-width/2 + 2, -height/2 + 2, barWidth, height - 4, 2);
            }
            
            // Update text
            healthText.setText(`${Math.ceil(current)}/${max}`);
            
            // Pulse animation for critical health
            if (percentage <= 0.2) {
                scene.tweens.add({
                    targets: container,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 300,
                    ease: 'Power2',
                    yoyo: true
                });
            }
        };
        
        return container;
    }
    
    // Create enhanced particle systems for atmospheric effects
    static createAdvancedParticles(scene, x, y, type, config = {}) {
        let particleConfig = {};
        
        switch (type) {
            case 'battle_embers':
                // Create ember texture if it doesn't exist
                if (!scene.textures.exists('battle_ember')) {
                    const graphics = scene.add.graphics();
                    graphics.fillStyle(0xff6b35, 1);
                    graphics.fillCircle(4, 4, 3);
                    graphics.fillStyle(0xffd700, 0.8);
                    graphics.fillCircle(4, 4, 2);
                    graphics.generateTexture('battle_ember', 8, 8);
                    graphics.destroy();
                }
                
                particleConfig = {
                    x: { min: x - 50, max: x + 50 },
                    y: y + 20,
                    speedY: { min: -80, max: -30 },
                    speedX: { min: -20, max: 20 },
                    scale: { start: 0.8, end: 0.1 },
                    alpha: { start: 0.9, end: 0 },
                    lifespan: 3000,
                    frequency: 200,
                    rotate: { min: 0, max: 360 }
                };
                break;
                
            case 'magical_sparkles':
                // Create sparkle texture if it doesn't exist
                if (!scene.textures.exists('magical_sparkle')) {
                    const graphics = scene.add.graphics();
                    graphics.fillStyle(0x4a90e2, 1);
                    graphics.fillRect(2, 0, 2, 8);
                    graphics.fillRect(0, 2, 8, 2);
                    graphics.fillStyle(0xffffff, 0.8);
                    graphics.fillRect(3, 1, 1, 6);
                    graphics.fillRect(1, 3, 6, 1);
                    graphics.generateTexture('magical_sparkle', 8, 8);
                    graphics.destroy();
                }
                
                particleConfig = {
                    x: { min: x - 100, max: x + 100 },
                    y: { min: y - 100, max: y + 100 },
                    speed: { min: 20, max: 60 },
                    scale: { start: 0.6, end: 0 },
                    alpha: { start: 1, end: 0 },
                    lifespan: 2000,
                    frequency: 400,
                    rotate: { min: 0, max: 360 }
                };
                break;
                
            case 'floating_dust':
                // Create dust texture if it doesn't exist
                if (!scene.textures.exists('floating_dust')) {
                    const graphics = scene.add.graphics();
                    graphics.fillStyle(0x8b7355, 0.6);
                    graphics.fillCircle(2, 2, 1.5);
                    graphics.generateTexture('floating_dust', 4, 4);
                    graphics.destroy();
                }
                
                particleConfig = {
                    x: { min: 0, max: scene.cameras.main.width },
                    y: scene.cameras.main.height + 10,
                    speedY: { min: -15, max: -5 },
                    speedX: { min: -5, max: 5 },
                    scale: { start: 0.5, end: 0.2 },
                    alpha: { start: 0.3, end: 0 },
                    lifespan: 8000,
                    frequency: 1000
                };
                break;
        }
        
        // Override with custom config
        const finalConfig = { ...particleConfig, ...config };
        
        const textureKey = type === 'battle_embers' ? 'battle_ember' : 
                          type === 'magical_sparkles' ? 'magical_sparkle' : 'floating_dust';
        
        return scene.add.particles(x, y, textureKey, finalConfig);
    }
    
    /**
     * Creates sparkle particle effects for magical atmosphere
     */
    static createSparkleEffect(scene, config = {}) {
        const defaultConfig = {
            x: 400,
            y: 300,
            count: 15,
            colors: [0xFFFFFF, 0xFFD700],
            speed: 30
        };
        
        const finalConfig = { ...defaultConfig, ...config };
        
        // Create sparkle texture if it doesn't exist
        if (!scene.textures.exists('sparkle')) {
            const graphics = scene.add.graphics();
            graphics.fillStyle(0xFFFFFF, 1);
            graphics.fillCircle(4, 4, 3);
            graphics.fillStyle(0xFFD700, 0.8);
            graphics.fillCircle(4, 4, 2);
            graphics.generateTexture('sparkle', 8, 8);
            graphics.destroy();
        }
        
        const particles = scene.add.particles(finalConfig.x, finalConfig.y, 'sparkle', {
            speed: { min: finalConfig.speed, max: finalConfig.speed * 2 },
            scale: { start: 0.3, end: 0 },
            blendMode: 'ADD',
            lifespan: 2000,
            quantity: 1,
            frequency: 300,
            tint: finalConfig.colors,
            alpha: { start: 1, end: 0 },
            emitZone: { 
                type: 'random',
                source: new Phaser.Geom.Circle(0, 0, 200)
            }
        });
        
        return particles;
    }

    // Create professional loading screen
    static createLoadingScreen(scene, text = 'Loading...') {
        const { width, height } = scene.cameras.main;
        
        const container = scene.add.container(width / 2, height / 2);
        container.setDepth(10000);
        
        // Background overlay
        const overlay = scene.add.rectangle(0, 0, width, height, 0x000000, 0.8);
        overlay.setOrigin(0.5);
        container.add(overlay);
        
        // Loading text with glow
        const loadingText = this.createProfessionalText(scene, 0, -50, text, {
            fontSize: '32px',
            glow: '#4a90e2'
        });
        loadingText.setOrigin(0.5);
        container.add(loadingText);
        
        // Animated loading bar
        const barBg = scene.add.graphics();
        barBg.fillStyle(0x2c3e50, 0.8);
        barBg.fillRoundedRect(-150, 0, 300, 20, 10);
        barBg.lineStyle(2, 0x4a90e2, 1);
        barBg.strokeRoundedRect(-150, 0, 300, 20, 10);
        container.add(barBg);
        
        const loadingBar = scene.add.graphics();
        container.add(loadingBar);
        
        // Animated progress
        let progress = 0;
        const progressTween = scene.tweens.add({
            targets: { value: 0 },
            value: 100,
            duration: 3000,
            ease: 'Power2',
            onUpdate: (tween) => {
                progress = tween.getValue();
                const barWidth = (progress / 100) * 296;
                
                loadingBar.clear();
                loadingBar.fillStyle(0x4a90e2, 0.9);
                loadingBar.fillRoundedRect(-148, 2, barWidth, 16, 8);
                
                // Add glow effect
                if (progress > 0) {
                    loadingBar.lineStyle(1, 0x74b9ff, 0.8);
                    loadingBar.strokeRoundedRect(-148, 2, barWidth, 16, 8);
                }
            }
        });
        
        // Spinning dots animation
        const dots = scene.add.text(0, 50, '●●●', {
            fontSize: '24px',
            fill: '#4a90e2'
        });
        dots.setOrigin(0.5);
        container.add(dots);
        
        scene.tweens.add({
            targets: dots,
            angle: 360,
            duration: 2000,
            repeat: -1,
            ease: 'Linear'
        });
        
        // Sparkle effects
        const sparkles = this.createAdvancedParticles(scene, 0, 0, 'magical_sparkles', {
            x: { min: -100, max: 100 },
            y: { min: -100, max: 100 },
            frequency: 200
        });
        container.add(sparkles);
        
        return { container, progressTween, setProgress: (value) => progress = value };
    }
    
    // Create professional modal dialog
    static createModalDialog(scene, title, content, buttons = []) {
        const { width, height } = scene.cameras.main;
        
        const container = scene.add.container(width / 2, height / 2);
        container.setDepth(9999);
        
        // Background overlay
        const overlay = scene.add.rectangle(0, 0, width, height, 0x000000, 0.7);
        overlay.setOrigin(0.5);
        overlay.setInteractive();
        container.add(overlay);
        
        // Modal background
        const modalBg = this.createGlassCard(scene, 400, 300, 0x2c3e50);
        modalBg.x = -200;
        modalBg.y = -150;
        container.add(modalBg);
        
        // Title
        const titleText = this.createProfessionalText(scene, 0, -100, title, {
            fontSize: '24px',
            glow: '#4a90e2'
        });
        titleText.setOrigin(0.5);
        container.add(titleText);
        
        // Content
        const contentText = scene.add.text(0, -20, content, {
            fontSize: '16px',
            fontFamily: 'Arial',
            fill: '#ecf0f1',
            align: 'center',
            wordWrap: { width: 350 }
        });
        contentText.setOrigin(0.5);
        container.add(contentText);
        
        // Buttons
        let buttonY = 80;
        const buttonSpacing = 120;
        const startX = -(buttons.length - 1) * buttonSpacing / 2;
        
        buttons.forEach((buttonConfig, index) => {
            const buttonX = startX + index * buttonSpacing;
            const button = this.createProfessionalButton(scene, 100, 40, buttonConfig.text, {
                baseColor: buttonConfig.color || 0x3498db
            });
            
            button.container.x = buttonX;
            button.container.y = buttonY;
            
            button.hitArea.on('pointerup', () => {
                if (buttonConfig.callback) {
                    buttonConfig.callback();
                }
                container.destroy();
            });
            
            container.add(button.container);
        });
        
        // Entrance animation
        container.setScale(0.5);
        container.setAlpha(0);
        
        scene.tweens.add({
            targets: container,
            scaleX: 1,
            scaleY: 1,
            alpha: 1,
            duration: 300,
            ease: 'Back.easeOut'
        });
        
        return container;
    }
}
