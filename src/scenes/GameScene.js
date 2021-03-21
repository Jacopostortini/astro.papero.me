import * as Phaser from "phaser";
import io from "socket.io-client";
import {sceneKeys} from "../constants/constants";

export default class GameScene extends Phaser.Scene {

    constructor() {
        super({settingKey: sceneKeys.game});
        this.angularVelocity = Math.PI*2;
        this.shipVelocity = 200;
        this.bulletVelocity = 500;
        this.players = [];
        this.playerID = null;
        this.socket = io("https://papero.me", {
            path: "/server/astro/socket.io",
            autoConnect: false
        });
        this.socket.on("connect", ()=>{
            console.log("connected")
        });
    }

    preload(){
        this.socket.open();
        this.load.image("ship", "https://labs.phaser.io/assets/sprites/asteroids_ship.png");
        this.load.image("bullet", "https://labs.phaser.io/assets/sprites/bullet.png");
        this.socket.on("get-game", (data)=>{
            for(let id= 0; id < data; id++){
                let ship = this.physics.add.image(0, 0, "ship");
                ship.setCollideWorldBounds(true);
                this.players.push({
                    id,
                    ship,
                });
            }
        })
        this.socket.on("new-player", (id)=> {
            console.log("new-player")
            let ship = this.physics.add.image(400, 300, "ship");
            ship.setCollideWorldBounds(true);
            this.players.push({
                id,
                ship,
            });
        });
        this.socket.on("your-id", (id)=>{
            this.playerID = id;
            this.playerShip = this.physics.add.image(400, 300, "ship");
            this.playerShip.setCollideWorldBounds(true);
        })
    }

    create(){
        this.socket.emit("get-game");
        this.socket.emit("new-player");

        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.input.keyboard.on("keyup-ENTER", ()=>{
            let bullet = this.physics.add.image(this.playerShip.x, this.playerShip.y, "bullet");
            bullet.rotation = this.playerShip.rotation-Math.PI/2;
            let velocityX = this.bulletVelocity*Math.cos(this.playerShip.rotation);
            let velocityY = this.bulletVelocity*Math.sin(this.playerShip.rotation);
            bullet.setVelocity(velocityX, velocityY);
            this.socket.emit("shoot", {
                id: this.playerID,
                rotation: bullet.rotation,
                velocity: {
                    x: velocityX,
                    y: velocityY
                }
            })
        })

        this.socket.on("move", (data)=>{
           this.players.forEach(player => {
               if(player.id === data.id){
                   player.ship.rotation = data.rotation;
                   player.ship.x = data.position.x;
                   player.ship.y = data.position.y;
               }
           });
        });

        this.socket.on("shoot", data => {
            this.players.forEach(player => {
                if(player.id === data.id){
                    let bullet = this.physics.add.image(player.ship.x, player.ship.y, "bullet");
                    bullet.rotation = data.rotation;
                    bullet.setVelocity(data.velocity.x, data.velocity.y);
                }
            })
        })
    }

    update(time, delta){
        this.players.forEach(player => {
            player.ship.setVelocity(this.shipVelocity*Math.cos(player.ship.rotation), this.shipVelocity*Math.sin(player.ship.rotation));
        });
        try {
            this.playerShip.setVelocity(this.shipVelocity*Math.cos(this.playerShip.rotation), this.shipVelocity*Math.sin(this.playerShip.rotation));
        } catch (e) {
            console.log(e);
        }
        if(this.keyA.isDown){
            this.playerShip.rotation += this.angularVelocity*delta/1000;
            this.socket.emit("move", {
                id: this.playerID,
                rotation: this.playerShip.rotation,
                position: {
                    x: this.playerShip.x,
                    y: this.playerShip.y
                }
            });
        }
    }
}