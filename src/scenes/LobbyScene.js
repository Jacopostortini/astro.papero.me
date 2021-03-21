import * as Phaser from "phaser";
import {colors, sceneKeys} from "../constants/constants";

export default class LobbyScene extends Phaser.Scene {

    constructor(socket, players, currentPlayer) {
        super({settingKey: sceneKeys.lobby});
        this.shipVelocity = 200;
        this.socket = socket;
        this.players = players;
        this.currentPlayer = currentPlayer;
        this.ships = [];
    }

    getAngle(x, y){
        let angle;
        if(x!==0) {
            angle = Math.atan(y / x);
            angle = x < 0 ? angle + Math.PI : angle;
        } else if(y>=0) angle = Math.PI / 2;
        else if(y<0) angle = -Math.PI / 2;
        return angle;
    }

    preload(){
        this.width = this.sys.game.canvas.width;
        this.height = this.sys.game.canvas.height;

        colors.forEach((value, index) => {
            this.load.image("ship"+index, require("@/assets/ship"+index+".png"))
        });
        this.load.image('particle', 'https://labs.phaser.io/assets/particles/red.png');
    }

    create(){
        this.players.forEach(player => {
            let x = Phaser.Math.Between(0, this.width);
            let y = Phaser.Math.Between(0, this.height)
            this.ships[player] = this.physics.add.image(x, y, "ship"+player);
            let angle = Phaser.Math.Between(Math.PI/4, Math.PI*3/4);
            this.ships[player].setVelocity(this.shipVelocity*Math.cos(angle), this.shipVelocity*Math.sin(angle));
            this.ships[player].rotation = angle;
            this.ships[player].setCollideWorldBounds(true);
            this.ships[player].setBounce(1, 1);
            if(player===this.currentPlayer) {
                let particle = this.add.particles("particle");
                let emitter = particle.createEmitter({
                    speed: 100,
                    scale: {start: 0.3, end: 0},
                    blendMode: "ADD"
                });
                emitter.startFollow(this.ships[player]);
            }
        });
    }

    update(){
        this.ships.forEach(ship =>{
            let {x, y} = ship.body.velocity;
            ship.rotation = this.getAngle(x, y);
        })
    }
}