import Phaser from "phaser";

const strings = {
    title: "Star Wars",
    homeView: {
        joinButton: "Join game",
        createButton: "Create game",
        joinGameInputPlaceholder: "Game ID"
    },
    gameView: {
        lobby: {
            changeColor: "Change color:",
            totalTurns: "Number of turns:",
            angularVelocity: "Rotation velocity:",
            velocity: "Ship's velocity:",
            reloadingVelocity: "Reloading velocity:",
            joinLobby: "Join",
            startGame: "Start",
            adminSettings: "Game settings",
            shareTheLink: "Copy link",
            copyTag: "Copy tag",
        }
    }
}

const colors = ["green", "red", "violet", "blue"];

const config = (scene, parent, width, height) => {
    return {
        type: Phaser.AUTO,
        physics: {
            default: 'arcade'
        },
        canvasStyle: "border: 2px solid white",
        transparent: true,
        parent,
        width,
        height,
        scene
    }
}

const urls = {
    baseURL: "https://papero.me"
}

const sceneKeys = {
    game: "game",
    lobby: "lobby"
}

export { strings, colors, config, urls, sceneKeys }
