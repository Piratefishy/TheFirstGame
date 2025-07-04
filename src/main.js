import Phaser from 'phaser';
import { MenuScene } from './scenes/MenuSceneClean.js';
// import { GameScene } from './scenes/GameScene.js'; // Temporarily disabled due to syntax errors
import { CharacterSelectionScene } from './scenes/CharacterSelectionScene.js';
import { GameSceneSimple } from './scenes/GameSceneSimple.js';
import { GameSceneSimpleMinimal } from './scenes/GameSceneSimpleMinimal.js';
import { GameSceneSimpleFast } from './scenes/GameSceneSimpleFast.js';
import { GameSceneSimpleTest } from './scenes/GameSceneSimpleTest.js';
import { GameSceneSimpleWorking } from './scenes/GameSceneSimpleWorking.js';
import { GameSceneSimpleWorkingEnhanced } from './scenes/GameSceneSimpleWorkingEnhanced.js';
import { ResultsScene } from './scenes/ResultsScene.js';
import { LoreScene } from './scenes/LoreScene.js';

// Mobile configuration
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    backgroundColor: '#2d5016', // Battlefield color
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        min: {
            width: 320,
            height: 240
        },
        max: {
            width: 1920,
            height: 1080
        }
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // No gravity for top-down
            debug: false
        }
    },
    input: {
        activePointers: isMobile ? 3 : 1 // Support for multi-touch on mobile
    },
    scene: [MenuScene, LoreScene, CharacterSelectionScene, GameSceneSimpleWorkingEnhanced, GameSceneSimpleWorking, GameSceneSimpleTest, GameSceneSimpleFast, GameSceneSimpleMinimal, GameSceneSimple, ResultsScene]
};

// Start the game
const game = new Phaser.Game(config);

// Export to global scope for debugging
window.game = game;
