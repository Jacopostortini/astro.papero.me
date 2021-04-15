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
        ctx.load.json("shapes", "./shapes.json");

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
        if(key === sceneKeys.game){
            if(ctx.players[ctx.currentPlayer].state>=2) ctx.shoot();
        } else if(key === sceneKeys.lobby) ctx.shoot();
    });

    if(ctx.touchScreen){
        ctx.input.addPointer(1);

        ctx.input.on("pointerdown", (pointer) => {
            if (pointer.x < width / 2) {
                ctx.rotating = true;
            } else {
                if(key === sceneKeys.game){
                    if(ctx.players[ctx.currentPlayer].state>=2) ctx.shoot();
                    else ctx.accelerating = true;
                } else if(key === sceneKeys.lobby) ctx.shoot();
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

const createBulletsLoadedObject = (ctx) => {
    const obj = {
        gameObjects: [],
        killAll() {
            this.gameObjects.forEach(bullet => {
                bullet.setVisible(false);
                bullet.setActive(false);
            });
        },
        enableAll() {
            this.gameObjects.forEach(bullet => {
                bullet.setVisible(true);
                bullet.setActive(true);
            });
        },
        enableFirstDead() {
            for (let i = 0; i < this.gameObjects.length; i++) {
                const o = this.gameObjects[i];
                if (!o.visible && !o.active) {
                    o.setVisible(true);
                    o.setActive(true);
                    return;
                }
            }
        },
        killFirstAlive() {
            for (let i = 0; i < this.gameObjects.length; i++) {
                const o = this.gameObjects[i];
                if (o.visible && o.active) {
                    o.setVisible(false);
                    o.setActive(false);
                    return;
                }
            }
        },
        enableTo(number){
            this.killAll();
            for(let i = 0; i < number; i++) this.enableFirstDead();
        }
    }

    for(let i = 0; i < ctx.maxBullets; i++){
        const bulletLoaded = ctx.matter.add.image(0, 0, "bullet-loaded", null, ctx.defaultImageOptions);
        bulletLoaded.setCollidesWith([]);
        obj.gameObjects.push(bulletLoaded);
    }

    return obj;
}

const getBodyFromCollision = (localId, collision) => {
    if(!collision.bodyA.gameObject) return collision.bodyA;
    if(collision.bodyA.gameObject.localId === localId) return collision.bodyB;
    else return collision.bodyA;
}




export { loadImages, velocityFromAngle, setInputHandlers, createBulletsLoadedObject, getBodyFromCollision }