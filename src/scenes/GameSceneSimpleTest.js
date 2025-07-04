export class GameSceneSimpleTest extends Phaser.Scene {
    constructor() {
        super({ key: 'GameSceneSimpleTest' });
    }

    init(data) {
        console.log('GameSceneSimpleTest: init() called with data:', data);
        this.sceneData = data;
    }

    preload() {
        console.log('GameSceneSimpleTest: preload()');
        // No assets needed for simple test
    }

    create() {
        console.log('GameSceneSimpleTest: create() started');
        
        try {
            const { width, height } = this.cameras.main;
            
            // Simple dark background
            this.cameras.main.setBackgroundColor('#001122');
            
            // Success message
            this.add.text(width / 2, height / 2 - 50, 'GAME STARTED!', {
                fontSize: '48px',
                fill: '#00FF00',
                fontFamily: 'Arial Bold'
            }).setOrigin(0.5);
            
            // Show selected character
            const selectedClass = this.sceneData?.selectedClass || 'unknown';
            this.add.text(width / 2, height / 2, `Playing as: ${selectedClass}`, {
                fontSize: '24px',
                fill: '#FFFFFF',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
            
            // Instructions
            this.add.text(width / 2, height / 2 + 50, 'Press SPACE to return to menu', {
                fontSize: '16px',
                fill: '#AAAAAA',
                fontFamily: 'Arial'
            }).setOrigin(0.5);
            
            // Input handler
            this.input.keyboard.on('keydown-SPACE', () => {
                this.scene.start('MenuScene');
            });
            
            console.log('GameSceneSimpleTest: create() completed successfully');
            
        } catch (error) {
            console.error('Error in GameSceneSimpleTest create():', error);
            
            // Fallback display
            this.add.text(400, 300, 'GAME SCENE ERROR', {
                fontSize: '32px',
                fill: '#FF0000'
            }).setOrigin(0.5);
        }
    }
}
