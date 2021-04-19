import {getCenteredCross, getCenteredSquare, getMovingSlalom, getStartingPrisons, /*getMovingVertical,*/ getMixedOrizontalLine} from "../constants/mapConstants";
import {getBodyFromCollision} from "./scene";

const maps = [
    [...getStartingPrisons(), ...getCenteredSquare(5)],
    [...getMovingSlalom(4)],
    [...getCenteredCross(500, 100), ...getCenteredSquare(3)],
    [...getMixedOrizontalLine()]
];

export default (ctx) => {
    const map = maps[ctx.map];
    map.forEach(obj => {
        const o = ctx.matter.add.image(obj.position.x, obj.position.y, obj.texture, null, {...ctx.defaultImageOptions});
        o.killable = obj.killable;
        o.setCollisionCategory(ctx.mapObjectCategory);
        o.setCollidesWith([1, ctx.shipsCategory, ctx.bulletsCategory, ctx.powerUpsCategory, ctx.laserCategory]);
        o.setStatic(true);
        o.setOnCollide(collision => {
            if(!o.body) return;
            const body = getBodyFromCollision(o.body.id, collision);
            if(body.gameObject) {
                if(obj.killable && (body.collisionFilter.category === ctx.bulletsCategory || body.collisionFilter.category === ctx.laserCategory)){
                    console.log(body);
                    console.log(ctx);
                    o.destroy();
                }
            }
        });
    });
};