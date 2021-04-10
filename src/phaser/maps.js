import {getCenteredCross, getCenteredSquare, getMovingSlalom, getStartingPrisons, getMovingVertical, getMixedOrizontalLine} from "../constants/mapConstants";

const maps = [
    [...getStartingPrisons(), ...getCenteredSquare(5)],
    [...getMovingSlalom(4)],
    [...getCenteredCross(500, 100), ...getCenteredSquare(3)],
    [...getMovingVertical(3), ...getMixedOrizontalLine()]
];

export default (ctx) => {
    const map = maps[ctx.map];
    map.forEach(obj => {
        let o;
       if(obj.killable){
           o = ctx.killableMapObjects.create(obj.position.x, obj.position.y, obj.texture);
       } else {
           o = ctx.notKillableMapObjects.create(obj.position.x, obj.position.y, obj.texture);
       }
       if(obj.velocity) o.setVelocity(obj.velocity.x, obj.velocity.y);
       if(obj.bounce) o.setBounce(obj.bounce);
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