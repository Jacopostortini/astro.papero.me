import * as Phaser from "phaser";
import {gameDimensions, sceneKeys} from "../constants/constants";
import websocketEvents from "../constants/websocketEvents";

export default class GameScene extends Phaser.Scene {

    constructor(socket, game) {
        super({key: sceneKeys.game});

        this.socket = socket;
        this.settings = game.settings;
        this.currentPlayer = game.currentPlayer;
        this.maxVelocityLittle = game.settings.velocity+0.5;

        this.players = {};
        game.players.forEach(player => {
            this.players[player.localId] = player;
            this.players[player.localId].availableBullets = 3;
        });

        this.normalizers = {
            velocity: 100,
            angularVelocity: Math.PI/1200,
            reloadingVelocity: 1/2000,
            bulletVelocity: 200
        }
    }

    preload(){

        this.textures.addBase64("ship0", require("@/assets/ships/ship0.png"));
        this.textures.addBase64("ship1", require("@/assets/ships/ship1.png"));
        this.textures.addBase64("ship2", require("@/assets/ships/ship2.png"));
        this.textures.addBase64("ship3", require("@/assets/ships/ship3.png"));

        this.textures.addBase64("bullet", require("@/assets/bullet.png"));

    }

    create(){
        this.setupNewShips();

        this.socket.on(websocketEvents.MOVE_BIG, data => this.onBigMoved(data));
        this.socket.on(websocketEvents.MOVE_LITTLE, data => this.onLittleMoved(data));
        this.socket.on(websocketEvents.SHOOT, data => this.createBullet(data));
        this.socket.on(websocketEvents.CHANGE_STATE, data => this.updateState(data));
        this.socket.on(websocketEvents.RELOAD, data => this.reload(data));

        this.rotationKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.input.keyboard.on("keyup-ENTER", this.shoot, this);

    }

    update(time, delta){
        if(this.rotationKey.isDown) this.moveBig(delta);
    }

    getVelocity(angle, mag){
        return {
            x: Math.cos(angle)*mag,
            y: Math.sin(angle)*mag
        }
    }

    setupNewShips(){
        Object.keys(this.players).forEach((key, index) => {
            this.players[key].ship = this.physics.add.image(
                (index<2 ? 0.05 : 0.95) * gameDimensions.width,
                ( index%2 === 0 ? 0.05 : 0.95 ) * gameDimensions.height,
                "ship"+this.players[key].color
            );
            this.players[key].ship.rotation = -Math.PI / 4  * ( index < 2 ? 1 : 3) * ( ( index % 2 ) * 2 - 1 );
            this.players[key].ship.localId = key;
            let {x, y} = this.getVelocity(this.players[key].ship.rotation, this.settings.velocity*this.normalizers.velocity);
            this.players[key].ship.setVelocity(x, y);
            this.players[key].ship.setCollideWorldBounds(true);
        });
        console.log(this.players);
    }

    onBigMoved(data){
        this.players[data.localId].ship.setPosition(data.position.x, data.position.y);
        this.players[data.localId].ship.setRotation(data.rotation);
        let {x, y} = this.getVelocity(data.rotation, this.settings.velocity * this.normalizers.velocity);
        this.players[data.localId].ship.setVelocity(x, y);
    }

    moveBig(delta){
        this.players[this.currentPlayer].ship.rotation += delta * this.settings.angularVelocity * this.normalizers.angularVelocity;
        let {x, y} = this.getVelocity(
            this.players[this.currentPlayer].ship.rotation,
            this.settings.velocity * this.normalizers.velocity
        );
        this.players[this.currentPlayer].ship.setVelocity(x, y);
        this.socket.emit(websocketEvents.MOVE_BIG, {
            localId: this.currentPlayer,
            rotation: this.players[this.currentPlayer].ship.rotation,
            position: {
                x: this.players[this.currentPlayer].ship.x,
                y: this.players[this.currentPlayer].ship.y
            }
        });
    }


    onLittleMoved(data){
        this.players[data.localId].ship.setPosition(data.position.x, data.position.y);
        this.players[data.localId].ship.setRotation(data.rotation);
        let {x, y} = this.getVelocity(data.rotation, this.maxVelocityLittle*this.normalizers.velocity);
        this.players[data.localId].ship.setMaxVelocity(x, y);
        this.players[data.localId].ship.setAcceleration(data.acceleration.x, data.acceleration.y);
    }

    moveLittle(){

    }


    createBullet(data){
        let bullet = this.physics.add.image(data.position.x, data.position.y, "bullet");
        bullet.rotation = data.rotation;
        let {x, y} = this.getVelocity(data.rotation, this.settings.bulletVelocity*this.normalizers.bulletVelocity);
        bullet.setVelocity(x, y);
        bullet.shotBy = data.localId;
        this.players[data.localId].availableBullets--;
    }

    shoot(){
        if(this.players[this.currentPlayer].availableBullets>0){
            let ship = this.players[this.currentPlayer].ship;
            let angle = ship.rotation;
            let data = {
                position: {
                    x: ship.x + ship.width*Math.cos(angle),
                    y: ship.y + ship.width*Math.sin(angle)
                },
                rotation: angle,
                localId: this.currentPlayer
            };
            this.socket.emit(websocketEvents.SHOOT, data);
            this.createBullet(data);
        }
    }


    updateState(data){
        this.players[data.localId].state = data.state;
    }

    onCollision(ship, bullet){
        bullet.destroy();
        ship.destroy();
        /*this.socket.emit(websocketEvents.CHANGE_STATE, {
            localId: ship.localId,
            state: --this.players[ship.localId].state
        })*/
    }


    reload(data){
        this.players[data.localId].availableBullets = data.availableBullets;
    }


}