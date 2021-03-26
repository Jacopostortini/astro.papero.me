import Phaser from "phaser";

export default class Bullet extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y) {
        super(scene, x, y, "bullet");
    }

    shoot(x, y, angle, velocity, localId){
        this.body.reset(x, y);
        this.rotation = angle;
        this.setVelocity(velocity.x, velocity.y);
        this.shotBy = localId;
    }

    remove(){
        this.setActive(false);
        this.setVisible(false);
    }

    isOutOfScene(){
        return this.x < 0 || this.y < 0 || this.x > this.scene.cameras.main.width || this.y > this.scene.cameras.main.height;
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if(this.isOutOfScene()){
            this.remove();
        }
    }
}
