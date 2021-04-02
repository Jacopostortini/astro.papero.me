export default {
    QUIT_GAME: "quit-game",
    KICK_PLAYER: "kick-from-game",
    GET_GAME: "get-game",
    END_GAME: "end-game",
    RESTART_GAME: "restart-game",

    CONNECT_TO_GAME: "connect-to-game", // -> status a me + lobby modified se status 0
    STATUS: "status", //number

    LOBBY_MODIFIED: "lobby-modified", //{players: [], currentPlayer: 0, totalTurns: 5, admin: 0}
    JOIN_GAME: "join-game",
    CHANGE_COLOR: "change-color", //number -> lobbyModified a tutti
    SET_TOTAL_TURNS: "set-total-turns", //number -> lobbyModified a tutti
    SET_VELOCITY: "set-velocity", //number -> lobbyModified a tutti
    SET_ANGULAR_VELOCITY: "set-angular-velocity", //number -> lobbyModified a tutti
    SET_RELOADING_VELOCITY: "set-reloading-velocity", //number -> lobbyModified a tutti
    SET_BULLET_VELOCITY: "set-bullet-velocity", //number -> lobbyModified a tutti

    START_GAME: "start-game",
    GAME_MODIFIED: "game-modified",
    UPDATE_SHIP: "update-ship",
    SHOOT: "shoot",
    CHANGE_STATE: "change-state",
    RELOAD: "reload"

}