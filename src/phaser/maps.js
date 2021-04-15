import {getCenteredCross, getCenteredSquare, getMovingSlalom, getStartingPrisons, getMovingVertical, getMixedOrizontalLine} from "../constants/mapConstants";
import {getBodyFromCollision} from "./scene";

const maps = [
    [...getStartingPrisons(), ...getCenteredSquare(5)],
    [...getMovingSlalom(4)],
    [...getCenteredCross(500, 100), ...getCenteredSquare(3)],
    [...getMovingVertical(3), ...getMixedOrizontalLine()]
];

export default (ctx) => {
    const map = maps[ctx.map];
    map.forEach(obj => {
        const o = ctx.matter.add.image(obj.position.x, obj.position.y, obj.texture, null, {...ctx.defaultImageOptions, restitution: 1});
        if(obj.killable) o.setCollisionCategory(ctx.killableMapObjectCategory);
        else o.setCollisionCategory(ctx.notKillableMapObjectCategory);
        if(obj.velocity) o.setVelocity(obj.velocity.x, obj.velocity.y);
        if(obj.bounce) o.setBounce(obj.bounce);
        ctx.matter.body.setInertia(o.body, Infinity);
        ctx.matter.body.setMass(o.body, Infinity);
        o.setOnCollide(collision => {
            const body = getBodyFromCollision(o.body.id, collision);
            if(body.gameObject) body.gameObject.destroy();
        });
    });
};