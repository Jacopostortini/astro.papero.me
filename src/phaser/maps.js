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
        const o = ctx.matter.add.image(obj.position.x, obj.position.y, obj.texture, null, {...ctx.defaultImageOptions});
        o.setCollisionCategory(ctx.mapObjectCategory);
        if(obj.velocity) o.setVelocity(obj.velocity.x, obj.velocity.y);
        if(obj.bounce) o.setBounce(obj.bounce);
        o.setCollidesWith([1, ctx.shipsCategory, ctx.bulletsCategory]);
        ctx.matter.body.setInertia(o.body, Infinity);
        ctx.matter.body.setMass(o.body, Infinity);
        o.setOnCollide(collision => {
            const body = getBodyFromCollision(o.body.id, collision);
            if(body.gameObject) {
                if(obj.killable && body.collisionFilter.category === ctx.bulletsCategory){
                    o.destroy();
                }
            }
        });
    });
};