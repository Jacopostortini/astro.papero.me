import {getCenteredSquare, getNotKillableSlalom, getStartingPrisons} from "../constants/mapConstants";

const maps = [
    [...getStartingPrisons(), ...getCenteredSquare(5)],
    [...getNotKillableSlalom(4, 0.5)]
];

export default (ctx) => {
    const map = maps[1];
    ctx.killableMapObjects = ctx.physics.add.staticGroup();
    ctx.notKillableMapObjects = ctx.physics.add.staticGroup();
    map.forEach(obj => {
       if(obj.killable){
           const o = ctx.killableMapObjects.create(obj.position.x, obj.position.y, obj.texture);
           if(obj.scale){
               o.setScale(obj.scale.x, obj.scale.y);
           }
       } else {
           /*const o = */ctx.notKillableMapObjects.create(obj.position.x, obj.position.y, obj.texture);
           if(obj.scale){
               //o.setScale(obj.scale.x, obj.scale.y);
           }
       }
    });
    ctx.physics.add.collider(ctx.killableMapObjects, ctx.ships);
    ctx.physics.add.collider(ctx.notKillableMapObjects, ctx.ships);
    ctx.physics.add.overlap(ctx.killableMapObjects, ctx.bullets, (obj, bullet) => {
        obj.destroy();
        bullet.destroy();
    });
    ctx.physics.add.overlap(ctx.notKillableMapObjects, ctx.bullets, (obj, bullet) => {
        bullet.destroy();
    });
};