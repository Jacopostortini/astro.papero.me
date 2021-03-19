import Phaser from "phaser";
import GameScene from "../scenes/GameScene";

const strings = {
    homeView: {
        title: "Star Wars",
        joinButton: "Join game",
        createButton: "Create game",
        joinGameInputPlaceholder: "Game ID"
    }
}
const config = {
    parent: "app",
    type: Phaser.AUTO,
    width: window.innerWidth*0.95,
    height: window.innerHeight*0.95,
    physics: {
        default: 'arcade'
    },
    scene: GameScene
}

const sceneKeys = {
    game: "game"
}

export { config, sceneKeys, strings }
