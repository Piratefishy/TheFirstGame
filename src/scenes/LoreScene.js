export class LoreScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LoreScene' });
        this.currentPage = 0;
        this.lorePages = [
            {
                title: "THE AWAKENING",
                content: "In the mists of time, when the nine realms trembled with the clash of steel and the cries of warriors, an ancient spirit stirred from its eternal slumber.\n\nYou are Valkyrion, a primordial god of war and honor, whose essence has wandered the battlefields since the beginning of time. For countless ages, you have watched mortals fight and die, their valor feeding your very existence.\n\nBut now, something has changed. The eternal battlefield of Midgard calls to you with unprecedented urgency..."
            },
            {
                title: "THE ETERNAL BATTLEFIELD",
                content: "This is no ordinary battleground. Here, time flows differently, and the fallen rise again to fight eternal wars. The soil is soaked with the blood of ten thousand conflicts, each drop containing the memories of heroes and villains alike.\n\nLightning splits the crimson sky, and ancient magic crackles through the air. Portals from other realms tear open randomly, spilling forth creatures of shadow and flame. The very earth pulses with supernatural energy.\n\nIt is here that warriors prove their worth for entry into Valhalla..."
            },
            {
                title: "THE POSSESSION",
                content: "As Valkyrion, you possess the unique ability to inhabit the body of any fallen warrior, bringing them back from the brink of death with your divine power.\n\nWhen you take control, the warrior's strength multiplies tenfold. Their blade becomes wreathed in spectral fire, their armor gleams with otherworldly protection, and their battle cry can shatter the resolve of armies.\n\nBut your time in mortal form is limited. You have exactly ninety seconds to prove the warrior's worth before your spirit must return to the ethereal realm..."
            },
            {
                title: "THE CHALLENGE",
                content: "The Allfather has issued a challenge to all gods and spirits of war: Take mortal form and prove your mastery of battle. Slay as many enemies as possible in the span of mortal time.\n\nThose who succeed will be granted greater power and dominion over the realms of war. Those who fail will be cast into the void, their essence scattered to the winds.\n\nThe enemies you face are not mere mortals. They are revenants, dark warriors, shadow beasts, and worse - all drawn to this battlefield by the same supernatural forces that summoned you.\n\nYour legend begins now, Valkyrion. Show the nine realms the true meaning of war..."
            },
            {
                title: "THE WARRIORS' CODE",
                content: "Remember these sacred truths, mighty Valkyrion:\n\n• Every enemy slain feeds your power and extends your legend\n• The battlefield itself will aid those who fight with honor\n• Portals of darkness spawn the most dangerous foes, but offer the greatest rewards\n• Lightning strikes herald the arrival of champion enemies\n• The warrior's spirit grows stronger with each victory\n\nFight with courage, strike with precision, and may your blade never dull. The halls of Valhalla await your glorious return..."
            }
        ];
    }

    preload() {
        this.createLoreTextures();
    }

    create() {
        const { width, height } = this.cameras.main;

        // Epic lore background
        this.createCinematicBackground(width, height);
        
        // Main content area
        this.createContentArea(width, height);
        
        // Navigation
        this.createNavigation(width, height);
        
        // Display first page
        this.displayCurrentPage();
        
        // Atmospheric effects
        this.createAtmosphericEffects(width, height);
    }

    createLoreTextures() {
        // Parchment background
        const parchmentGraphics = this.add.graphics();
        parchmentGraphics.fillGradientStyle(0xF4E4BC, 0xF4E4BC, 0xE6D3A3, 0xE6D3A3, 1);
        parchmentGraphics.fillRect(0, 0, 600, 400);
        
        // Add aging effects
        parchmentGraphics.fillStyle(0xD2B48C, 0.3);
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 600;
            const y = Math.random() * 400;
            parchmentGraphics.fillCircle(x, y, Math.random() * 3);
        }
        
        // Border decoration
        parchmentGraphics.lineStyle(4, 0x8B4513, 1);
        parchmentGraphics.strokeRect(0, 0, 600, 400);
        
        parchmentGraphics.generateTexture('parchment', 600, 400);
        parchmentGraphics.destroy();

        // Rune decorations
        const runeGraphics = this.add.graphics();
        runeGraphics.lineStyle(3, 0x8B0000, 1);
        
        // Draw runic symbols
        runeGraphics.moveTo(10, 5).lineTo(10, 25).lineTo(20, 15).moveTo(10, 5).lineTo(0, 15);
        runeGraphics.moveTo(30, 5).lineTo(30, 25).moveTo(25, 10).lineTo(35, 10).moveTo(25, 20).lineTo(35, 20);
        runeGraphics.moveTo(45, 5).lineTo(55, 25).moveTo(55, 5).lineTo(45, 25);
        
        runeGraphics.generateTexture('runes', 60, 30);
        runeGraphics.destroy();

        // Navigation button
        const btnGraphics = this.add.graphics();
        btnGraphics.fillStyle(0x8B0000, 1);
        btnGraphics.fillRoundedRect(0, 0, 120, 40, 8);
        btnGraphics.lineStyle(2, 0xFFD700, 1);
        btnGraphics.strokeRoundedRect(0, 0, 120, 40, 8);
        btnGraphics.generateTexture('lore_button', 120, 40);
        btnGraphics.destroy();
    }

    createCinematicBackground(width, height) {
        // Dark mystical background
        this.add.rectangle(width / 2, height / 2, width, height, 0x0D1B2A);
        
        // Add mystical fog effects
        for (let i = 0; i < 15; i++) {
            const fog = this.add.rectangle(
                Math.random() * width,
                Math.random() * height,
                Math.random() * 200 + 100,
                Math.random() * 100 + 50,
                0x415A77
            );
            fog.setAlpha(0.1 + Math.random() * 0.2);
            fog.setRotation(Math.random() * Math.PI);
            
            // Animate fog
            this.tweens.add({
                targets: fog,
                x: fog.x + (Math.random() - 0.5) * 200,
                alpha: fog.alpha * 0.5,
                duration: 8000 + Math.random() * 4000,
                repeat: -1,
                yoyo: true,
                ease: 'Sine.easeInOut'
            });
        }

        // Lightning effect in background
        this.time.addEvent({
            delay: 3000 + Math.random() * 5000,
            callback: this.createLightningFlash.bind(this),
            callbackScope: this,
            loop: true
        });
    }

    createContentArea(width, height) {
        // Main parchment background
        this.parchment = this.add.image(width / 2, height / 2, 'parchment');
        this.parchment.setScale(Math.min(width / 700, height / 500));

        // Title area
        this.titleText = this.add.text(width / 2, height * 0.25, '', {
            fontSize: '32px',
            fontFamily: 'Arial Black',
            color: '#8B0000',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center',
            fontStyle: 'bold'
        });
        this.titleText.setOrigin(0.5);

        // Content text area
        this.contentText = this.add.text(width / 2, height / 2, '', {
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#2F1B14',
            align: 'center',
            lineSpacing: 8,
            wordWrap: { width: 500, useAdvancedWrap: true }
        });
        this.contentText.setOrigin(0.5);

        // Decorative runes
        this.add.image(width / 2 - 250, height * 0.25, 'runes').setScale(0.8).setAlpha(0.7);
        this.add.image(width / 2 + 250, height * 0.25, 'runes').setScale(0.8).setAlpha(0.7).setFlipX(true);
    }

    createNavigation(width, height) {
        // Previous button
        this.prevButton = this.add.container(width * 0.15, height * 0.85);
        const prevBg = this.add.image(0, 0, 'lore_button');
        const prevText = this.add.text(0, 0, 'PREVIOUS', {
            fontSize: '14px',
            fontFamily: 'Arial Black',
            color: '#FFD700'
        });
        prevText.setOrigin(0.5);
        this.prevButton.add([prevBg, prevText]);
        this.prevButton.setSize(120, 40);
        this.prevButton.setInteractive();
        this.prevButton.on('pointerdown', () => this.previousPage());

        // Next button
        this.nextButton = this.add.container(width * 0.85, height * 0.85);
        const nextBg = this.add.image(0, 0, 'lore_button');
        const nextText = this.add.text(0, 0, 'NEXT', {
            fontSize: '14px',
            fontFamily: 'Arial Black',
            color: '#FFD700'
        });
        nextText.setOrigin(0.5);
        this.nextButton.add([nextBg, nextText]);
        this.nextButton.setSize(120, 40);
        this.nextButton.setInteractive();
        this.nextButton.on('pointerdown', () => this.nextPage());

        // Back to menu button
        this.backButton = this.add.container(width / 2, height * 0.92);
        const backBg = this.add.image(0, 0, 'lore_button').setTint(0x2E7D32);
        const backText = this.add.text(0, 0, 'BACK TO MENU', {
            fontSize: '12px',
            fontFamily: 'Arial Black',
            color: '#FFD700'
        });
        backText.setOrigin(0.5);
        this.backButton.add([backBg, backText]);
        this.backButton.setSize(120, 40);
        this.backButton.setInteractive();
        this.backButton.on('pointerdown', () => this.scene.start('MenuScene'));

        // Page indicator
        this.pageIndicator = this.add.text(width / 2, height * 0.85, '', {
            fontSize: '14px',
            fontFamily: 'Arial',
            color: '#8B4513'
        });
        this.pageIndicator.setOrigin(0.5);

        this.updateNavigation();
    }

    createAtmosphericEffects(width, height) {
        // Floating mystical particles
        const particleGraphics = this.add.graphics();
        particleGraphics.fillStyle(0xFFD700, 0.8);
        particleGraphics.fillCircle(2, 2, 2);
        particleGraphics.generateTexture('mystical_particle', 4, 4);
        particleGraphics.destroy();

        // Mystical particles floating around
        const particles = this.add.particles(width / 2, height / 2, 'mystical_particle', {
            x: { min: width * 0.2, max: width * 0.8 },
            y: { min: height * 0.2, max: height * 0.8 },
            speed: { min: 5, max: 15 },
            scale: { start: 0.3, end: 0 },
            lifespan: 8000,
            frequency: 500,
            alpha: { start: 0.6, end: 0 }
        });

        // Ambient sound waves (visual)
        this.time.addEvent({
            delay: 2000,
            callback: this.createSoundWave.bind(this),
            callbackScope: this,
            loop: true
        });
    }

    displayCurrentPage() {
        const page = this.lorePages[this.currentPage];
        
        // Fade out current content
        this.tweens.add({
            targets: [this.titleText, this.contentText],
            alpha: 0,
            duration: 300,
            onComplete: () => {
                // Update content
                this.titleText.setText(page.title);
                this.contentText.setText(page.content);
                
                // Fade in new content
                this.tweens.add({
                    targets: [this.titleText, this.contentText],
                    alpha: 1,
                    duration: 500
                });
            }
        });

        this.updateNavigation();
    }

    updateNavigation() {
        this.prevButton.setVisible(this.currentPage > 0);
        this.nextButton.setVisible(this.currentPage < this.lorePages.length - 1);
        
        this.pageIndicator.setText(`${this.currentPage + 1} / ${this.lorePages.length}`);
        
        // Update button text for last page
        if (this.currentPage === this.lorePages.length - 1) {
            this.nextButton.setVisible(false);
        }
    }

    previousPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.displayCurrentPage();
        }
    }

    nextPage() {
        if (this.currentPage < this.lorePages.length - 1) {
            this.currentPage++;
            this.displayCurrentPage();
        }
    }

    createLightningFlash() {
        const flash = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0xE0E6FF
        );
        flash.setAlpha(0.3);

        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 200,
            onComplete: () => flash.destroy()
        });
    }

    createSoundWave() {
        const wave = this.add.graphics();
        wave.lineStyle(2, 0x87CEEB, 0.5);
        wave.strokeCircle(this.cameras.main.width / 2, this.cameras.main.height / 2, 50);

        this.tweens.add({
            targets: wave,
            scaleX: 3,
            scaleY: 3,
            alpha: 0,
            duration: 2000,
            onComplete: () => wave.destroy()
        });
    }
}
