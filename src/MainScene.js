import * as Phaser from "phaser";
import io from "socket.io-client";

export default class MainScene extends Phaser.Scene {

    constructor() {
        super({key: "Main"});
        this.angularSpeed = Math.PI*4;
        this.socket = io("https://papero.me", {
            path: "/server/astro/socket.io",
            autoConnect: true
        });
        this.socket.on("connect", ()=>{
            console.log("connected");
        });
    }

    preload(){
        this.load.image("ship", "./asteroids_ship.png");
    }

    create(){
        this.ship = this.physics.add.image(400, 300, "ship");
        this.ship.setCollideWorldBounds(true);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.socket.on("move", (data)=>{
           this.ship.rotation = data;
        });
    }

    update(time, delta){
        if(this.keyA.isDown) {
            this.ship.rotation += this.angularSpeed*delta/1000;
            this.socket.emit("move", this.ship.rotation);
        }
    }
}