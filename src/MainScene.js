import * as Phaser from "phaser";
import io from "socket.io-client";

export default class MainScene extends Phaser.Scene {

    constructor() {
        super({key: "Main"});
        this.angularVelocity = Math.PI*2;
        this.velocity = 200;
        this.players = [];
        this.playerID = null;
        this.socket = io("https://papero.me", {
            path: "/server/astro/socket.io",
            autoConnect: true
        });
        this.socket.on("connect", ()=>{
            console.log("connected")
        });
    }

    preload(){
        this.load.image("ship", "https://labs.phaser.io/assets/sprites/asteroids_ship.png");
        this.socket.on("get-game", (data)=>{
            console.log("get-game",data);
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
            console.log("The players: ", this.players);
            console.log("Your id is", this.playerID)
        });
        this.socket.on("your-id", (id)=>{
            console.log("your-id");
            this.playerID = id;
            let ship = this.physics.add.image(400, 300, "ship");
            ship.setCollideWorldBounds(true);
            this.players.push({
                id,
                ship,
            });
            console.log("The players: ", this.players);
            console.log("Your id is", this.playerID)
        })
    }

    create(){
        this.socket.emit("get-game");
        this.socket.emit("new-player");
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.socket.on("move", (data)=>{
           this.players.forEach(player => {
               if(player.id === data.id){
                   player.ship.rotation = data.rotation;
                   player.ship.x = data.position.x;
                   player.ship.y = data.position.y;
               }
           });
        });
    }

    update(time, delta){
        this.players.forEach(player => {
            if(player.id === this.playerID){
                if(this.keyA.isDown){
                    player.ship.rotation += this.angularVelocity*delta/1000;
                    this.socket.emit("move", {
                        player: this.playerID,
                        rotation: player.ship.rotation,
                        position: {
                            x: player.ship.x,
                            y: player.ship.y
                        }
                    });
                }
            }
            player.ship.setVelocity(this.velocity*Math.cos(player.ship.rotation), this.velocity*Math.sin(player.ship.rotation));
        });
    }
}