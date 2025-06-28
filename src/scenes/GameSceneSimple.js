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
    }

    preload() {
        // Create simple sprites
        this.createSimpleSprites();
    }

    createSimpleSprites() {
        // Player sprite
        const playerGraphics = this.add.graphics();
        playerGraphics.fillStyle(0x4169E1, 1);
        playerGraphics.fillCircle(20, 20, 18);
        playerGraphics.generateTexture('player', 40, 40);
        playerGraphics.destroy();

        // Enemy sprite
        const enemyGraphics = this.add.graphics();
        enemyGraphics.fillStyle(0x8B0000, 1);
        enemyGraphics.fillCircle(18, 18, 16);
        enemyGraphics.generateTexture('enemy', 36, 36);
        enemyGraphics.destroy();

        // Blood particle
        const bloodGraphics = this.add.graphics();
        bloodGraphics.fillStyle(0x8B0000, 1);
        bloodGraphics.fillCircle(6, 6, 4);
        bloodGraphics.generateTexture('blood', 12, 12);
        bloodGraphics.destroy();
    }

    create() {
        const { width, height } = this.cameras.main;

        // Simple background
        this.add.rectangle(width / 2, height / 2, width, height, 0x2d5016);

        // Create player
        this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
        this.player.setCollideWorldBounds(true);

        // Create enemies group
        this.enemies = this.physics.add.group();

        // Spawn a few enemies
        for (let i = 0; i < 5; i++) {
            const enemy = this.physics.add.sprite(
                Phaser.Math.Between(50, width - 50),
                Phaser.Math.Between(50, height - 50),
                'enemy'
            );
            enemy.setCollideWorldBounds(true);
            this.enemies.add(enemy);
        }

        // Collision
        this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);

        // UI
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '24px',
            color: '#FFD700'
        });
        this.scoreText.setScrollFactor(0);

        this.timerText = this.add.text(width - 150, 16, 'Time: 90', {
            fontSize: '24px',
            color: '#FFD700'
        });
        this.timerText.setScrollFactor(0);

        // Exit button
        this.exitButton = this.add.text(width - 150, height - 50, 'ESC = Exit', {
            fontSize: '16px',
            color: '#FF6B6B',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        });
        this.exitButton.setScrollFactor(0);
        this.exitButton.setInteractive();
        this.exitButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });

        // Instructions
        this.instructionsText = this.add.text(16, height - 80, 
            'WASD/Arrows = Move\nTouch enemies to defeat them!\nESC = Return to menu', {
            fontSize: '14px',
            color: '#FFFFFF',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 10, y: 5 }
        });
        this.instructionsText.setScrollFactor(0);

        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D,SPACE');
        this.escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        this.pKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);

        // ESC key to return to menu
        this.escKey.on('down', () => {
            this.scene.start('MenuScene');
        });

        // P key to pause/unpause
        this.pKey.on('down', () => {
            this.togglePause();
        });

        // Game timer
        this.time.addEvent({
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

        console.log('GameScene created successfully!');
    }

    hitEnemy(player, enemy) {
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
        enemy.destroy();
        
        // Spawn new enemy
        const newEnemy = this.physics.add.sprite(
            Phaser.Math.Between(50, this.cameras.main.width - 50),
            Phaser.Math.Between(50, this.cameras.main.height - 50),
            'enemy'
        );
        newEnemy.setCollideWorldBounds(true);
        this.enemies.add(newEnemy);
    }

    update() {
        if (this.gameOver) return;

        // Player movement
        this.player.setVelocity(0);

        if (this.cursors.left.isDown || this.wasd.A.isDown) {
            this.player.setVelocityX(-200);
        } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
            this.player.setVelocityX(200);
        }

        if (this.cursors.up.isDown || this.wasd.W.isDown) {
            this.player.setVelocityY(-200);
        } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
            this.player.setVelocityY(200);
        }

        // Enemy AI - simple movement toward player
        this.enemies.children.entries.forEach(enemy => {
            const distance = Phaser.Math.Distance.Between(
                this.player.x, this.player.y, enemy.x, enemy.y
            );
            
            if (distance > 0) {
                const angle = Phaser.Math.Angle.Between(
                    enemy.x, enemy.y, this.player.x, this.player.y
                );
                enemy.setVelocity(
                    Math.cos(angle) * 50,
                    Math.sin(angle) * 50
                );
            }
        });
    }
}
