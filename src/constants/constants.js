import Phaser from "phaser";

const strings = {
    title: "Cosmos",
    homeView: {
        play: "Play",
        joinGameInputPlaceholder: "Game ID",
        cancelButton: "Cancel",
        joinGameButton: "Join lobby",
        createGameButton: "Create lobby",
        gameAlreadyExists: "This game already exists",
        gameDoesNotExists: "This game doesn't exists"
    },
    gameView: {
        lobby: {
            changeColor: "Change color:",
            totalTurns: "Number of turns:",
            angularVelocity: "Rotation velocity:",
            velocity: "Ship's velocity:",
            reloadingVelocity: "Reloading velocity:",
            bulletVelocity: "Bullet velocity:",
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
        scene,
        fps: 30
    }
}

let baseUrl = "https://papero.me";
const urls = {
    baseUrl: "https://papero.me",
    socketPath: "/server/cosmos/socket.io",
    getLoginInfoUrl: baseUrl+"/user/get_info",
    createLocalAccountUrl: baseUrl+"/auth/local",
    logoutUrl: baseUrl+"/auth/logout",
    getGameStatusUrl: baseUrl+"/server/cosmos/games/status_by_id"
}

export { strings, colors, config, urls }
