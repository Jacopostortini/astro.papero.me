import * as Phaser from "phaser";
import io from "socket.io-client";

export default class MainScene extends Phaser.Scene {

    constructor() {
        super({key: "Main"});
        this.socket = io("https://papero.me", {
            path: "/server/astro/",
            autoConnect: true
        });
        this.socket.on("connect", ()=>{
            console.log("connected");
        });
    }

    preload(){
        this.load.image("ship", "https://papero.me/astro/asteroids_ship.png");
    }

    create(){
        this.ship = this.physics.add.image(400, 300, "ship");
        this.ship.setCollideWorldBounds(true);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.socket.on("move", ()=>{
           this.ship.rotation += Math.PI/90;
        });
    }

    update(){
        if(this.keyA.isDown) {
            this.ship.rotation += Math.PI/90;
            this.socket.emit("move");
        }
    }
}