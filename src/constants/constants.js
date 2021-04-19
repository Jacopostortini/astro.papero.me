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
            disclaimer2: "Attention! If you switch tab during the game, you will be excluded from the current turn!",
            readyUpButton: "Ready up",
            playerReady: "Waiting for other players to be ready",
        }
    }
}

const colors = ["green", "red", "white", "orange"];

const config = (scene, parent, width, height, scaleMode=0) => {
    return {
        type: Phaser.AUTO,
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

const removeFromArray = (array, index) => {
    const a = array.slice(0, index);
    const b = array.slice(index+1, array.length);
    return a.concat(b);
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

export { strings, colors, config, detectTouchScreen, removeFromArray, urls }
