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
        let x = Phaser.Math.Between(0, this.width);
        let y = Phaser.Math.Between(0, this.height);
        let ship = this.physics.add.image(x, y, "ship"+color);
        let angle = Phaser.Math.Between(Math.PI/4, Math.PI*3/4);
        ship.setVelocity(this.shipVelocity*Math.cos(angle), this.shipVelocity*Math.sin(angle));
        ship.rotation = angle;
        ship.setCollideWorldBounds(true);
        ship.setBounce(1, 1);
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
            console.log("lobby modified in phaser", game);
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

            console.log(this.ships, this.lobby)
        });
    }

    update(){
        if(Array.isArray(this.lobby.players)) {
            this.lobby.players.forEach(player => {
                let ship = this.ships[player.localId]
                let {x, y} = ship.body.velocity;
                ship.rotation = this.getAngle(x, y);
                ship.setVelocity(
                    this.lobby.velocity * Math.cos(ship.rotation),
                    this.lobby.velocity * Math.sin(ship.rotation));
            });
        }
    }
}