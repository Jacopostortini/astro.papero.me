import * as Phaser from "phaser";
import io from "socket.io-client";

export default class MainScene extends Phaser.Scene {

    constructor() {
        super({key: "Main"});
        this.angularVelocity = Math.PI*2;
        this.velocity = 200;
        this.socket = io("https://papero.me", {
            path: "/server/astro/socket.io",
            autoConnect: true
        });
        this.socket.on("connect", ()=>{
            console.log("connected");
        });
    }

    preload(){
        this.load.image("ship", "http://labs.phaser.io/assets/sprites/asteroids_ship.png");
        this.socket.emit("get-game", (data)=>{
           this.players = [];
           for(let i= 0; i < data.players.length; i++){
               this.players.push({
                   id: data.players[i].id,
                   position: data.players[i].position,
                   rotation: data.players[i].rotation
               });
           }
            this.socket.emit("new-player");
        });
    }

    create(){
        this.players.forEach((player)=>{
            player.ship = this.physics.add.image(player.position.x, player.position.y, "ship");
            player.ship.rotation = player.rotation;
            player.ship.setCollideWorldBounds(true);
        })
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.socket.on("move", (data)=>{
           this.players.forEach(player => {
               if(player.id === data.id){
                   player.ship.rotation = data.rotation;
                   player.ship.x  = data.position.x;
                   player.ship.y = data.position.y;
               }
           });
        });
        this.socket.on("new-player", (id)=> {
            this.playerID = id;
            this.players.push({
                id: id,
                position: {
                    x: 300,
                    y: 400
                },
                rotation: 0
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
            player.ship.setVelocity(this.velocity*Math.cos(player.ship.rotation), player.velocity*Math.sin(player.ship.rotation));
        });
    }
}