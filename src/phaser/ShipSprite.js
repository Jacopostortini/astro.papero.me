import Phaser from "phaser";
import {getVelocity} from "../constants/gameSettings";

export default class ShipSprite extends Phaser.Physics.Arcade.Sprite{

    constructor(scene, x, y, angle, texture, socket, localId) {
        super(scene, x, y, texture);

        this.socket = socket;
        this.localId = localId;
        this.availableBullets = 3;
        this.setRotation(angle);

        this.setCollideWorldBounds(true);
        const {x, y} = getVelocity(angle, )
    }
}