import * as Phaser from "phaser";
import {sceneKeys} from "../constants/constants";
import mitt from "mitt";

export default class GameScene extends Phaser.Scene {

    constructor() {
        super({key: sceneKeys.game});

        this.angularVelocity = Math.PI*2;
        this.shipVelocity = 200;
        this.bulletVelocity = 500;
        this.players = [];
        this.playerID = null;

        this.emitter = mitt();
    }

    preload(){
        this.load.image("ship", "https://labs.phaser.io/assets/sprites/asteroids_ship.png");
        this.load.image("bullet", "https://labs.phaser.io/assets/sprites/bullet.png");
    }

    create(){

    }

    update(){

    }
}