const sceneKeys = {
    game: "game",
    lobby: "lobby"
}

const gameDimensions = {
    width: 800,
    height: 600
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
    angularVelocity: Math.PI/1200,
    reloadingVelocity: 1/2000,
    bulletVelocity: 200
}

const getVelocity = (angle, mag) => {
    return {
        x: mag * Math.cos(angle),
        y: mag * Math.sin(angle)
    }
}

export { sceneKeys, gameDimensions, defaultSettings, normalizers, getVelocity }