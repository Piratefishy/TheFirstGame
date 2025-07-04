export class GameSceneTest extends Phaser.Scene {
    constructor() {
        super({ key: 'GameSceneTest' });
    }

    init(data) {
        console.log('GameSceneTest: init() called with data:', data);
        this.sceneData = data;
    }

    create() {
        console.log('GameSceneTest: Starting create() method...');
        
        try {
            // Get selected class
            let selectedClass = 'archer'; // Default
            let selectedWeapon = 'bow';   // Default
            
            if (this.sceneData && this.sceneData.selectedClass) {
                selectedClass = this.sceneData.selectedClass;
                selectedWeapon = this.sceneData.selectedWeapon;
            }
            
            console.log('Selected class:', selectedClass, 'weapon:', selectedWeapon);
            
            // Simple background
            this.add.rectangle(400, 300, 800, 600, 0x228B22);
            
            // Simple player
            this.player = this.add.rectangle(400, 300, 20, 20, 0x0000FF);
            
            // Simple text
            this.add.text(50, 50, `Playing as: ${selectedClass}`, {
                fontSize: '24px',
                fill: '#FFFFFF'
            });
            
            this.add.text(50, 100, 'Test scene loaded successfully!', {
                fontSize: '18px',
                fill: '#00FF00'
            });
            
            // Simple controls
            this.cursors = this.input.keyboard.createCursorKeys();
            
            console.log('GameSceneTest: Created successfully!');
            
        } catch (error) {
            console.error('Error in GameSceneTest:', error);
        }
    }
    
    update() {
        // Simple movement
        if (this.cursors.left.isDown) {
            this.player.x -= 2;
        }
        if (this.cursors.right.isDown) {
            this.player.x += 2;
        }
        if (this.cursors.up.isDown) {
            this.player.y -= 2;
        }
        if (this.cursors.down.isDown) {
            this.player.y += 2;
        }
    }
}
