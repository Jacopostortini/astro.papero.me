import * as Phaser from "phaser";
import {colors, sceneKeys} from "../constants/constants";
import mitt from "mitt";
import websocketEvents from "../constants/websocketEvents";

window.mitt = window.mitt || mitt();
export default class LobbyScene extends Phaser.Scene {

    constructor() {
        super({key: sceneKeys.lobby});
        this.lobby = {
            players: [],
            currentPlayer: null,
            settings: {
                totalTurns: 5,
                velocity: 2,
                angularVelocity: 2,
                reloadingVelocity: 2
            }
        }
        this.ships = {};
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
        let x = 10//Phaser.Math.Between(0, this.width);
        let y = 10//Phaser.Math.Between(0, this.height);
        let ship = this.physics.add.image(x, y, "ship"+color);
        //let angle = 1//Phaser.Math.Between(Math.PI/4, Math.PI*3/4);
        //ship.setVelocity(this.lobby.settings.velocity*Math.cos(angle), this.lobby.settings.velocity*Math.sin(angle));
        //ship.rotation = angle;
        ship.setCollideWorldBounds(true);
        ship.setBounce(1, 1);
        console.log("newly created ship", ship);
        return ship;
    }

    findPlayerById(id){
        for(let i = 0; i < this.lobby.players.length; i++){
            if(this.lobby.players[i].localId === id) return this.lobby.players[i];
        }
        return null;
    }

    preload(){

        //load images
        this.width = this.sys.game.canvas.width;
        this.height = this.sys.game.canvas.height;
        colors.forEach((value, index) => {
            this.load.image("ship"+index, require("@/assets/ship"+index+".png"))
        });
        this.load.image('particle', 'https://labs.phaser.io/assets/particles/red.png');

    }

    create(){
        window.mitt.on(websocketEvents.LOBBY_MODIFIED, game => {
            let currentlyPlayingIds = [];
            game.players.forEach(player => {currentlyPlayingIds.push(player.localId)});

            let previousPlayingIds = [];
            this.lobby.players.forEach(player => {previousPlayingIds.push(player.localId)});

            this.lobby = game;

            let newShips = {};
            currentlyPlayingIds.forEach(id => {
                if(previousPlayingIds.includes(id)){
                    newShips[id] = this.ships[id];
                } else {
                    newShips[id] = this.createNewShip(this.findPlayerById(id).color);
                }
            });

            this.ships = newShips;
            this.lobby.settings.velocity *= 100;
            this.lobby.settings.angularVelocity *= 100;
            this.lobby.settings.reloadingVelocity *= 100;
        });
    }

    update(){
        /*if(Array.isArray(this.lobby.players) && this.lobby.players.length>0) {
            this.lobby.players.forEach(player => {
                let {x, y} = this.ships[player.localId].body.velocity;
                this.ships[player.localId].rotation = this.getAngle(x, y);
                this.ships[player.localId].setVelocity(
                    this.lobby.velocity * Math.cos(this.ships[player.localId].rotation),
                    this.lobby.velocity * Math.sin(this.ships[player.localId].rotation)
                );
            });
        }*/
    }
}