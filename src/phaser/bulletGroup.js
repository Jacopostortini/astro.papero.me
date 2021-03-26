import * as Phaser from "phaser";
import Bullet from "./bullet";

export default class BulletGroup extends Phaser.Physics.Arcade.Group {

    constructor(scene) {
        super(scene.physics.world, scene);

        this.createMultiple({
            classType: Bullet,
            frameQuantity: 30,
            active: false,
            visible: false
        })
    }

    shoot(x, y, angle, velocity, localId){
        let bullet = this.getFirstDead(false);
        if(bullet){
            bullet.shoot(x, y, angle, velocity, localId);
        }
    }

}
