const sceneKeys = {
    game: "game",
    lobby: "lobby",
    ranking: "ranking"
}

const gameDimensions = {
    width: 1100,
    height: 640
}

const defaultSettings = {
    pointsToWin: 5,
    velocity: 2,
    angularVelocity: 2,
    reloadingVelocity: 2,
    bulletVelocity: 2
}

const arcadeNormalizers = {
    velocity: 100,
    angularVelocity: 0.15,
    reloadingVelocity: 1/2000,
    bulletVelocity: 200
}

const matterNormalizers = {
    velocity: 100,
    angularVelocity: 0.15,
    reloadingVelocity: 1/2000,
    bulletVelocity: 200
}

const powerUps = ["laser", "reverse", "shield", "reload"];

export { sceneKeys, gameDimensions, defaultSettings, arcadeNormalizers, matterNormalizers, powerUps }