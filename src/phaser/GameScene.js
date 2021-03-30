import * as Phaser from "phaser";
import websocketEvents from "../constants/websocketEvents";
import {gameDimensions, getVelocity, normalizers, sceneKeys} from "../constants/gameSettings";


export default class GameScene extends Phaser.Scene {

    constructor(socket, game) {
        super({key: sceneKeys.game});

        this.socket = socket;
        this.settings = game.settings;
        this.currentPlayer = game.currentPlayer;
        this.settings.maxVelocityLittle = game.settings.velocity+0.5;
        this.settings.accelerationLittle = 0.5;
        this.settings.respawnTime = 5000;
        this.settings.frictionAir = 0.1;
        this.players = {};
        game.players.forEach(player => {
            this.players[player.localId] = player;
            this.players[player.localId].availableBullets = 3;
            this.players[player.localId].state = 2;
        });

/*        this.settings = defaultSettings;
        this.settings.maxVelocityLittle = 2.5;
        this.settings.accelerationLittle = 0.5;
        this.settings.frictionAir = 0.1;
        this.currentPlayer = 0;
        this.players = { //STATE: 0=dead 1=little 2=ship 3=shield(?)
            '0': {
                localId: 0,
                color: 0,
                availableBullets: 3,
                state: 2
            },
            '1': {
                localId: 1,
                color: 1,
                availableBullets: 3,
                state: 2
            },
            '2': {
                localId: 2,
                color: 2,
                availableBullets: 3,
                state: 2
            }
        };*/

        setInterval(() => {
            const availableBullets = Math.min(3, this.players[this.currentPlayer].availableBullets + 1);
            const data = {
                localId: this.currentPlayer,
                availableBullets
            };
            this.socket.emit(websocketEvents.RELOAD, data);
            this.reload(data);
        }, 1/(this.settings.reloadingVelocity * normalizers.reloadingVelocity));
    }

    preload(){

        this.load.image("ship0", "./ships/ship0.png");
        this.load.image("ship1", "./ships/ship1.png");
        this.load.image("ship2", "./ships/ship2.png");
        this.load.image("ship3", "./ships/ship3.png");
        this.load.image("little0", "./little.png");
        this.load.image("little1", "./little.png");
        this.load.image("little2", "./little.png");
        this.load.image("little3", "./little.png");
        this.load.image("bullet", "./bullet.png");

    }

    create(){
        this.createGroups();
        this.createShips();

        this.socket.on(websocketEvents.ROTATE_SHIP, data => this.onShipRotated(data));
        this.socket.on(websocketEvents.MOVE_LITTLE, data => this.onLittleMoved(data));
        this.socket.on(websocketEvents.SHOOT, data => this.createBullet(data));
        this.socket.on(websocketEvents.CHANGE_STATE, data => this.updateState(data));
        this.socket.on(websocketEvents.RELOAD, data => this.reload(data));

        this.rotationKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.accelerateLittleKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.input.keyboard.on("keyup-ENTER", this.shoot, this);
        this.physics.world.on("worldbounds", (bullet)=>{bullet.gameObject.destroy()});
    }

    update(time, delta){
        if(this.rotationKey.isDown) this.rotate(delta);
        if(this.accelerateLittleKey.isDown) this.moveLittle(delta);
        Object.values(this.players).forEach(player => {
            const {x, y} = getVelocity(player.ship.rotation, player.ship.velocityMagnitude);
            player.ship.setVelocity(x, y);
            if(player.state === 1){
                player.ship.velocityMagnitude = Math.max(
                    0, player.ship.velocityMagnitude-this.settings.frictionAir*delta
                );
            }
        });
        //if(this.ships.countActive() <= 1) console.log("game over") //TODO: SETUP END OF THE TURN
    }




    //=============================================================================
    //Creating things
    createGroups(){
        this.ships = this.physics.add.group();
        this.bullets = this.physics.add.group();
    }

    createShips(){
        let index = 0;
        Object.values(this.players).forEach(player => {
            player.ship = this.ships.create(
                (index<2 ? 0.05 : 0.95) * gameDimensions.width,
                ( index%2 === 0 ? 0.05 : 0.95 ) * gameDimensions.height,
                "ship"+player.color
            )

            player.ship.localId = player.localId;
            player.ship.setRotation(-Math.PI / 4  * ( index < 2 ? 1 : 3) * ( ( index % 2 ) * 2 - 1 ));
            player.ship.setCollideWorldBounds(true);
            player.ship.velocityMagnitude = this.settings.velocity*normalizers.velocity;

            if(player.localId===this.currentPlayer){
                this.physics.add.overlap(player.ship, this.bullets, (ship, bullet) => {
                    this.onBulletCollision(ship, bullet);
                });
            }

            index++;
        });

        this.physics.add.collider(this.ships, this.ships);
    }

    createBullet(data){
        const bullet = this.bullets.create(data.position.x, data.position.y, "bullet");
        bullet.rotation = data.rotation;
        const {x, y} = getVelocity(data.rotation, this.settings.bulletVelocity*normalizers.bulletVelocity);
        bullet.setVelocity(x, y);
        bullet.shotBy = data.localId;
        bullet.setCollideWorldBounds(true);
        bullet.body.onWorldBounds = true;
        this.players[data.localId].availableBullets--;
    }






    //=============================================================================
    //Others do things via the websocket
    onShipRotated(data){
        this.players[data.localId].ship.setPosition(data.position.x, data.position.y);
        this.players[data.localId].ship.setRotation(data.rotation);
    }

    onLittleMoved(data){
        this.players[data.localId].ship.setPosition(data.position.x, data.position.y);
        this.players[data.localId].ship.velocityMagnitude = data.velocityMagnitude;
    }



    //=============================================================================
    //Current players does things
    rotate(delta){
        this.players[this.currentPlayer].ship.rotation += delta * this.settings.angularVelocity * normalizers.angularVelocity;
        this.socket.emit(websocketEvents.ROTATE_SHIP, {
            localId: this.currentPlayer,
            rotation: this.players[this.currentPlayer].ship.rotation,
            position: {
                x: this.players[this.currentPlayer].ship.x,
                y: this.players[this.currentPlayer].ship.y
            }
        });
    }

    moveLittle(delta){
        if(this.players[this.currentPlayer].state === 1){
            console.log("move little")
            const ship = this.players[this.currentPlayer].ship;
            const previousMag = ship.velocityMagnitude;
            if(previousMag < this.settings.maxVelocityLittle * normalizers.velocity){
                this.players[this.currentPlayer].ship.velocityMagnitude += delta*this.settings.accelerationLittle;
            } else {
                this.players[this.currentPlayer].ship.velocityMagnitude = this.settings.maxVelocityLittle * normalizers.velocity;
            }

            this.socket.emit(websocketEvents.MOVE_LITTLE, {
                localId: this.currentPlayer,
                position: {
                    x: ship.x,
                    y: ship.y
                },
                velocityMagnitude: this.players[this.currentPlayer].ship.velocityMagnitude
            });
        }
    }

    shoot(){
        if(this.players[this.currentPlayer].availableBullets>0 && this.players[this.currentPlayer].state>=2){
            const ship = this.players[this.currentPlayer].ship;
            const angle = ship.rotation;
            const data = {
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
        console.log("state changed", data);
        this.players[data.localId].state = data.state;
        const ship = this.players[data.localId].ship;
        switch (data.state) {
            case 0:
                this.ships.killAndHide(ship);
                break;
            case 1:
                ship.setTexture("little" + this.players[data.localId].color);
                if(data.localId === this.currentPlayer) {
                    setTimeout(() => {
                        if (this.players[data.localId].state === 1) {
                            this.players[data.localId].state = 2;

                            this.socket.emit(websocketEvents.CHANGE_STATE, {
                                localId: this.currentPlayer,
                                state: 2
                            });
                        }
                    }, this.settings.respawnTime);
                }
                break;
            case 2:
                ship.velocityMagnitude = this.settings.velocity * normalizers.velocity;
                ship.setTexture("ship" + this.players[data.localId].color);
                break;
        }
    }

    onBulletCollision(ship, bullet){
        bullet.destroy();
        const state = this.players[ship.localId].state-1;
        if(state === 0) this.killedBy = bullet.shotBy;
        this.socket.emit(websocketEvents.CHANGE_STATE, {
            localId: ship.localId,
            state
        });
        this.updateState({
            localId: ship.localId,
            state
        });
    }


    reload(data){
        this.players[data.localId].availableBullets = data.availableBullets;
    }


}