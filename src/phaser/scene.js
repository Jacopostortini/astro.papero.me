import {gameDimensions, powerUps, sceneKeys} from "../constants/gameSettings";
import Phaser from "phaser";

const loadImages = (ctx, key) => {
    for(let i = 0; i < 4; i++){
        ctx.load.image("ship"+i, "./ships/ship"+i+".png");

        if(key===sceneKeys.game){
            ctx.load.image("little"+i, "./littles/little"+i+".png");
            ctx.load.image("shielded"+i, "./shielded/shielded"+i+".png");
        }
    }
    
    if(key !== sceneKeys.ranking){
        ctx.load.image("bullet", "./bullet.png");
        ctx.load.image("bullet-loaded", "./bullet-loaded.png");
    }

    if(key===sceneKeys.lobby && ctx.touchScreen) {
        ctx.load.image("rotate-button", "./rotate-button.png");
        ctx.load.image("shoot-button", "./shoot-button.png");
    }

    if(key === sceneKeys.game){
        for(let i = 0; i < powerUps.length; i++){
            ctx.load.image(powerUps[i], "./powerUps/"+ powerUps[i] +".png");
        }
        for(let i = 1; i <= 3; i++){
            ctx.load.image("block"+i, "./blocks/block"+ i +".png");
        }
    }
}

const velocityFromAngle = (angle, velocity) => {
    return {
        x: velocity * Math.cos(angle*Math.PI/180),
        y: velocity * Math.sin(angle*Math.PI/180)
    }
}

const setInputHandlers = (ctx, key) => {
    const {width} = key === sceneKeys.game ? gameDimensions : ctx;
    if(ctx.currentPlayer === null && key === sceneKeys.game) return;

    ctx.rotationKey = ctx.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    ctx.accelerateLittleKey = ctx.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    ctx.input.keyboard.on("keyup-ENTER", ()=>{
        if(ctx.players[ctx.currentPlayer].state>=2) ctx.shoot();
    });

    if(ctx.touchScreen){
        ctx.input.addPointer(1);

        ctx.input.on("pointerdown", (pointer) => {
            if (pointer.x < width / 2) {
                ctx.rotating = true;
            } else {
                if (ctx.players[ctx.currentPlayer].state >= 2) ctx.shoot();
                else {
                    ctx.accelerating = true;
                }
            }
        });

        ctx.input.on("pointerup", (pointer) => {
            if (pointer.x < width / 2) {
                ctx.rotating = false;
            } else {
                ctx.accelerating = false;
            }
        });
    }
}




export { loadImages, velocityFromAngle, setInputHandlers }