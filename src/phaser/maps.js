import {getCenteredCross, getCenteredSquare, getNotKillableSlalom, getStartingPrisons, getMixedCross} from "../constants/mapConstants";

const maps = [
    [...getStartingPrisons(), ...getCenteredSquare(5)],
    [...getNotKillableSlalom(4)],
    [...getCenteredCross(300, 100), ...getCenteredSquare(3)],
    [...getMixedCross()]
];

export default (ctx) => {
    const map = maps[3];
    ctx.killableMapObjects = ctx.physics.add.staticGroup();
    ctx.notKillableMapObjects = ctx.physics.add.staticGroup();
    map.forEach(obj => {
       if(obj.killable){
           ctx.killableMapObjects.create(obj.position.x, obj.position.y, obj.texture);
       } else {
           ctx.notKillableMapObjects.create(obj.position.x, obj.position.y, obj.texture);
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