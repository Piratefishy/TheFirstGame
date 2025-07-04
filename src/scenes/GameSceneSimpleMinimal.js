export class GameSceneSimpleMinimal extends Phaser.Scene {
    constructor() {
        super({ key: 'GameSceneSimpleMinimal' });
    }

    init(data) {
        console.log('GameSceneSimpleMinimal: init() called with data:', data);
        this.sceneData = data;
    }

    preload() {
        console.log('GameSceneSimpleMinimal: preload() called');
        // Create simple colored rectangles as sprites
        this.load.image('player_placeholder', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    }

    create() {
        console.log('GameSceneSimpleMinimal: Starting create() method...');
        
        try {
            // Get selected class data
            let selectedClass = 'archer'; // Default
            let selectedWeapon = 'bow';   // Default
            
            if (this.sceneData && this.sceneData.selectedClass) {
                selectedClass = this.sceneData.selectedClass;
                selectedWeapon = this.sceneData.selectedWeapon;
            }
            
            console.log('Selected class:', selectedClass, 'weapon:', selectedWeapon);
            
            // Store for later use
            this.playerSelectedClass = selectedClass;
            this.playerSelectedWeapon = selectedWeapon;
            
            // Create simple world
            const worldWidth = 1600;
            const worldHeight = 1200;
            this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
            
            // Simple background
            this.add.rectangle(worldWidth/2, worldHeight/2, worldWidth, worldHeight, 0x228B22);
            
            console.log('Creating player...');
            
            // Create simple player
            this.player = this.add.rectangle(400, 300, 20, 20, 0x0000FF);
            this.physics.add.existing(this.player);
            this.player.body.setCollideWorldBounds(true);
            
            // Player properties
            this.player.hp = 100;
            this.player.maxHp = 100;
            this.player.className = selectedClass;
            this.player.weapon = selectedWeapon;
            this.player.faction = 'good';
            
            console.log('Player created successfully');
            
            // Simple camera following
            this.cameras.main.startFollow(this.player);
            this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
            
            // Simple controls
            this.cursors = this.input.keyboard.createCursorKeys();
            this.wasd = this.input.keyboard.addKeys('W,S,A,D');
            
            // Simple UI
            this.add.text(50, 50, `Playing as: ${selectedClass}`, {
                fontSize: '24px',
                fill: '#FFFFFF',
                backgroundColor: '#000000',
                padding: { x: 10, y: 10 }
            }).setScrollFactor(0);
            
            this.add.text(50, 100, 'WASD/Arrow keys to move', {
                fontSize: '18px',
                fill: '#FFFFFF',
                backgroundColor: '#000000',
                padding: { x: 10, y: 10 }
            }).setScrollFactor(0);
            
            console.log('GameSceneSimpleMinimal: Created successfully!');
            
        } catch (error) {
            console.error('Error in GameSceneSimpleMinimal create():', error);
            // Show error on screen
            this.add.text(400, 300, `ERROR: ${error.message}`, {
                fontSize: '24px',
                fill: '#FF0000',
                backgroundColor: '#FFFFFF',
                padding: { x: 20, y: 20 }
            }).setOrigin(0.5);
        }
    }
    
    update() {
        try {
            if (!this.player || !this.player.body) return;
            
            // Simple movement
            const speed = 200;
            
            if (this.cursors.left.isDown || this.wasd.A.isDown) {
                this.player.body.setVelocityX(-speed);
            } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
                this.player.body.setVelocityX(speed);
            } else {
                this.player.body.setVelocityX(0);
            }
            
            if (this.cursors.up.isDown || this.wasd.W.isDown) {
                this.player.body.setVelocityY(-speed);
            } else if (this.cursors.down.isDown || this.wasd.S.isDown) {
                this.player.body.setVelocityY(speed);
            } else {
                this.player.body.setVelocityY(0);
            }
            
        } catch (error) {
            console.error('Error in update:', error);
        }
    }
}
