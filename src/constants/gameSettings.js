const sceneKeys = {
    game: "game",
    lobby: "lobby",
    ranking: "ranking"
}

const gameDimensions = {
    width: 900,
    height: 640
}

const defaultSettings = {
    pointsToWin: 5,
    velocity: 2,
    angularVelocity: 2,
    reloadingVelocity: 2,
    bulletVelocity: 2
}

const normalizers = {
    velocity: 100,
    angularVelocity: 0.15,
    reloadingVelocity: 1/2000,
    bulletVelocity: 200
}

const powerUps = ["laser", "reverse"];

export { sceneKeys, gameDimensions, defaultSettings, normalizers, powerUps }