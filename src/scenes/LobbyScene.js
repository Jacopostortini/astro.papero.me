import * as Phaser from "phaser";
import {colors, sceneKeys} from "../constants/constants";
import websocketEvents from "../constants/websocketEvents";

export default class LobbyScene extends Phaser.Scene {

    constructor(socket) {
        super({key: sceneKeys.lobby});
        this.socket = socket;
        this.lobby = {
            players: [],
            currentPlayer: null,
            settings: {
                totalTurns: 5,
                velocity: 2,
                angularVelocity: 2,
                reloadingVelocity: 2,
                bulletVelocity: 2
            }
        }
/*        this.lobby = {
            players: [
                {
                    localId: 0,
                    color: 0
                },
                {
                    localId: 1,
                    color: 1
                }
            ],
            admin: 0,
            currentPlayer: 1,
            settings: {
                totalTurns: 5,
                velocity: 2,
                angularVelocity: 2,
                reloadingVelocity: 2,
                bulletVelocity: 2
            }
        }*/
        this.normalizers = {
            velocity: 100,
            angularVelocity: Math.PI/1200,
            reloadingVelocity: 1/2000,
            bulletVelocity: 200
        }
        this.ships = {};
        this.availableBullets = 3;
        let interval;
        let handler = () => {
            this.availableBullets = this.availableBullets>=3 ? this.availableBullets : this.availableBullets+1;
            clearInterval(interval)
            interval = setInterval(handler, 2000/this.lobby.settings.reloadingVelocity);
        }
        interval = setInterval(handler, 2000/this.lobby.settings.reloadingVelocity);
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

    createNewShip(color, bounce){
        let x = Phaser.Math.Between(0, this.width);
        let y = Phaser.Math.Between(0, this.height);
        let ship = this.physics.add.image(x, y, "ship"+color);
        let angle = Phaser.Math.Between(Math.PI/4, Math.PI*3/4);
        ship.setVelocity(
            this.lobby.settings.velocity*this.normalizers.velocity*Math.cos(angle),
            this.lobby.settings.velocity*this.normalizers.velocity*Math.sin(angle)
        );
        ship.rotation = angle;
        ship.setCollideWorldBounds(true);
        if(bounce) ship.setBounce(1, 1);
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
            this.load.image("ship"+index, require("@/assets/ships/ship"+index+".png"));
        });
        this.textures.addBase64("bullet", require("@/assets/bullet.png"));

        window.addEventListener('resize', () => {
            let parent = document.getElementById("players-wrapper");
            let dim = Math.min(parent.offsetWidth, parent.offsetHeight);
            this.game.scale.resize(dim, dim);
        });

    }

    create(){
        //this.ships["0"] = this.createNewShip(0, true)
        //this.ships["1"] = this.createNewShip(1, false)

        //Event lobby-modified
        this.socket.on(websocketEvents.LOBBY_MODIFIED, game => {
            let currentlyPlayingIds = [];
            game.players.forEach(player => {currentlyPlayingIds.push(player.localId)});

            let previousPlayingIds = [];
            this.lobby.players.forEach(player => {previousPlayingIds.push(player.localId)});

            this.lobby = {...game};

            let newShips = {};
            currentlyPlayingIds.forEach(id => {
                if(previousPlayingIds.includes(id)){
                    newShips[id] = this.ships[id];
                    newShips[id].setVelocity(
                        this.lobby.settings.velocity* this.normalizers.velocity * Math.cos(newShips[id].rotation),
                        this.lobby.settings.velocity* this.normalizers.velocity * Math.sin(newShips[id].rotation)
                    );
                    newShips[id].setTexture("ship"+this.findPlayerById(id).color);
                } else {
                    newShips[id] = this.createNewShip(this.findPlayerById(id).color, id!==game.currentPlayer);
                }
            });

            this.ships = newShips;
        });

        //Setting up rotation and shooting
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.input.keyboard.on("keyup-ENTER", ()=>{
            if(this.availableBullets>0){
                let bullet = this.physics.add.image(
                    this.ships[this.lobby.currentPlayer].x,
                    this.ships[this.lobby.currentPlayer].y,
                    "bullet"
                );
                bullet.rotation = this.ships[this.lobby.currentPlayer].rotation;
                bullet.setVelocity(
                    this.lobby.settings.bulletVelocity*this.normalizers.bulletVelocity*Math.cos(bullet.rotation),
                    this.lobby.settings.bulletVelocity*this.normalizers.bulletVelocity*Math.sin(bullet.rotation)
                );
                this.availableBullets--;
            }
        });
    }

    update(time, delta){
        if(Array.isArray(this.lobby.players) && this.lobby.players.length>0) {
            this.lobby.players.forEach(player => {
                if(player.localId !== this.lobby.currentPlayer) {
                    let {x, y} = this.ships[player.localId].body.velocity;
                    this.ships[player.localId].rotation = this.getAngle(x, y);
                }
            });
        }
        if(this.lobby.currentPlayer!==null && this.keySpace.isDown){
            this.ships[this.lobby.currentPlayer].rotation += this.lobby.settings.angularVelocity* this.normalizers.angularVelocity *delta;
            this.ships[this.lobby.currentPlayer].setVelocity(
                this.lobby.settings.velocity* this.normalizers.velocity * Math.cos(this.ships[this.lobby.currentPlayer].rotation),
                this.lobby.settings.velocity* this.normalizers.velocity * Math.sin(this.ships[this.lobby.currentPlayer].rotation)
            );
        }
    }
}