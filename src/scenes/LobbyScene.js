import * as Phaser from "phaser";
import {colors, sceneKeys} from "../constants/constants";
import mitt from "mitt";
import websocketEvents from "../constants/websocketEvents";

export default class LobbyScene extends Phaser.Scene {

    constructor(players, currentPlayer) {
        super({key: sceneKeys.lobby});
        this.shipVelocity = 200;
        this.players = {};
        players.forEach(player => {
            this.players[player.localId+""] = player;
        })
        this.currentPlayer = currentPlayer;
        this.emitter = mitt();
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

    createNewShip(color){
        let x = Phaser.Math.Between(0, this.width);
        let y = Phaser.Math.Between(0, this.height);
        let ship = this.physics.add.image(x, y, "ship"+color);
        let angle = Phaser.Math.Between(Math.PI/4, Math.PI*3/4);
        ship.setVelocity(this.shipVelocity*Math.cos(angle), this.shipVelocity*Math.sin(angle));
        ship.rotation = angle;
        ship.setCollideWorldBounds(true);
        ship.setBounce(1, 1);
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
            player.ship = this.createNewShip(player.color);
            /*if(player.localId===this.currentPlayer) {
                let particle = this.add.particles("particle");
                let emitter = particle.createEmitter({
                    speed: 100,
                    scale: {start: 0.3, end: 0},
                    blendMode: "ADD"
                });
                emitter.startFollow(this.ships[player.localId+""]);
            }*/
        });

        this.emitter.on(websocketEvents.LOBBY_MODIFIED, game => {
            this.currentPlayer = game.currentPlayer;
            this.shipVelocity = game.settings.velocity;
            let previousIds = this.players.keys();
            let newIds = [];
            game.players.forEach(newPlayer => {
                newIds.push(newPlayer.localId);
                if( previousIds.includes(newPlayer.localId+"") &&
                    this.players[newPlayer.localId+""].color !== newPlayer.color){

                    this.players[newPlayer.localId+""].color = newPlayer.color;
                    this.players[newPlayer.localId+""].ship.setTexture("ship"+newPlayer.color);

                } else if( !previousIds.includes(newPlayer.localId+"") ){
                    this.players[newPlayer.localId+""] = newPlayer;
                    this.players[newPlayer.localId+""].ship = this.createNewShip(newPlayer.color);
                }
            });
/*            let difference = previousIds.filter(x => !newIds.includes(x));
            difference.forEach(id => {
                this.
            })*/
        });
    }

    update(){
        this.players.forEach(player =>{
            let {x, y} = player.ship.body.velocity;
            player.ship.rotation = this.getAngle(x, y);
            player.ship.setVelocity(
                this.shipVelocity*Math.cos(player.ship.rotation),
                this.shipVelocity*Math.sin(player.ship.rotation));
        })
    }
}