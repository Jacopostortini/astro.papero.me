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
        const o = ctx.matter.create(obj.position.x, obj.position.y, obj.texture, null, {...ctx.defaultImageOptions, restitution: 1});
        if(obj.killable) o.setCollisionCategory(ctx.killableMapObjectCategory);
        else o.setCollisionCategory(ctx.notKillableMapObjectCategory);
        if(obj.velocity) o.setVelocity(obj.velocity.x, obj.velocity.y);
        if(obj.bounce) o.setBounce(obj.bounce);
        ctx.matter.body.setInertia(o.body, Infinity);
    });
};