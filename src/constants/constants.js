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
            pointsToWin: "Points to win:",
            angularVelocity: "Rotation velocity:",
            velocity: "Ship's velocity:",
            reloadingVelocity: "Reloading velocity:",
            bulletVelocity: "Bullet velocity:",
            joinLobby: "Join",
            startGame: "Start",
            shareTheLink: "Copy link",
            copyTag: "Copy tag",
        },
        resize: {
            disclaimer: "In order for you to enjoy the game you should change the orientation of the device or enlarge your window",
            readyUpButton: "Ignore and get ready",
            playerReady: "Waiting for other players to be ready",
        }
    }
}

const colors = ["green", "red", "white", "orange"];

const config = (scene, parent, width, height, scaleMode=0, defaultPhysics = "arcade") => {
    return {
        type: Phaser.AUTO,
        physics: {
            default: defaultPhysics,
            arcade: {
                debug: true
            },
            matter: {
                debug: true
            }
        },
        canvasStyle:
            "border: 2px solid white;" +
            "max-width: 98vw;" +
            "max-height: 90%;",
        transparent: true,
        parent,
        width,
        height,
        scene,
        scaleMode
    }
}

const detectTouchScreen = ()=>{
    try{
        document.createEvent("TouchEvent");
        return true;
    } catch (e) {
        return false;
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

export { strings, colors, config, detectTouchScreen, urls }
