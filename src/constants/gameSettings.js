const sceneKeys = {
    game: "game",
    lobby: "lobby"
}

const gameDimensions = {
    width: 600,
    height: 400
}

const defaultSettings = {
    totalTurns: 5,
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

export { sceneKeys, gameDimensions, defaultSettings, normalizers }