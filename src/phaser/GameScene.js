import * as Phaser from "phaser";
import websocketEvents from "../constants/websocketEvents";
import {gameDimensions, normalizers, sceneKeys} from "../constants/gameSettings";


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
            this.players[player.localId].lastTimestamp = 0;
        });
        this.updating = 0;

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
        this.socket.on(websocketEvents.SHOOT, data => this.createBullet(data));
        this.socket.on(websocketEvents.CHANGE_STATE, data => this.updateState(data));
        this.socket.on(websocketEvents.RELOAD, data => this.reload(data));

        this.rotationKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.accelerateLittleKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.input.keyboard.on("keyup-ENTER", ()=>{
            if(this.players[this.currentPlayer].state>=2) this.shoot();
        });
        this.physics.world.on("worldbounds", (bullet)=>{bullet.gameObject.destroy()});
    }

    update(time, delta){
        if(this.rotationKey.isDown) this.rotate(delta);
        if(this.accelerateLittleKey.isDown) this.moveLittle(delta);
        const {x, y} = this.physics.velocityFromRotation(
            this.players[this.currentPlayer].ship.rotation,
            this.players[this.currentPlayer].ship.velocityMagnitude
        );
        this.players[this.currentPlayer].ship.setVelocity(x, y);
        if(this.players[this.currentPlayer].state === 1){
            this.players[this.currentPlayer].ship.velocityMagnitude = Math.max(
                0, this.players[this.currentPlayer].ship.velocityMagnitude-this.settings.frictionAir*delta
            );
        }
        if(this.players[this.currentPlayer].state!==0 && this.updating<2){
            this.socket.emit(websocketEvents.ROTATE_SHIP, [
                this.currentPlayer,
                this.players[this.currentPlayer].ship.rotation,
                [this.players[this.currentPlayer].ship.x, this.players[this.currentPlayer].ship.y],
                this.players[this.currentPlayer].ship.velocityMagnitude,
                time
            ]);
        }
        this.updating++;
        this.updating %= 3;
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
                this.physics.add.collider(player.ship, this.ships, (currentShip, ship)=>{
                    if(this.players[this.currentPlayer].state === 1 && this.players[ship.localId].state >= 2){
                        this.killedBy = ship.localId;
                        this.socket.emit(websocketEvents.CHANGE_STATE, {
                            localId: this.currentPlayer,
                            state: 0
                        });
                        this.updateState({
                            localId: this.currentPlayer,
                            state: 0
                        });
                    }
                })
            }

            index++;
        });

        this.physics.add.collider(this.ships, this.ships);
    }

    createBullet(data){
        const {x, y} = this.physics.velocityFromRotation(data.rotation, this.settings.bulletVelocity*normalizers.bulletVelocity);
        const deltaTime = Date.now()-data.timestamp;
        const bullet = this.bullets.create(data.position.x+deltaTime*x/1000, data.position.y+deltaTime*y/1000, "bullet");
        bullet.rotation = data.rotation;
        bullet.setVelocity(x, y);
        bullet.shotBy = data.localId;
        bullet.setCollideWorldBounds(true);
        bullet.body.onWorldBounds = true;
        this.players[data.localId].availableBullets--;
    }






    //=============================================================================
    //Others do things via the websocket
    onShipRotated(data){
        const deltaTime = data[3]-this.players[data[0]].lastTimestamp;
        if(deltaTime<0) return;
        this.players[data[0]].ship.setRotation(data[1]);
        this.players[data[0]].ship.setPosition(data[2][0], data[2][1]);
        /*const {x, y} = this.physics.velocityFromRotation(data[1]);
        const maxXMovement = deltaTime/1000*x;
        if(data[2][0]-this.players[data[0]].x > maxXMovement){
            this.players[data[0]].ship.x += maxXMovement;
        } else {
            this.players[data[0]].ship.x = data[2][0];
        }
        const maxYMovement = deltaTime/1000*y;
        if(data[2][1]-this.players[data[0]].y > maxYMovement){
            this.players[data[0]].ship.y += maxYMovement;
        } else {
            this.players[data[0]].ship.y = data[2][1];
        }*/
        this.players[data[0]].lastTimestamp = data[3];
    }



    //=============================================================================
    //Current players does things
    rotate(delta){
        this.players[this.currentPlayer].ship.rotation += delta * this.settings.angularVelocity * normalizers.angularVelocity;
    }

    moveLittle(delta){
        if(this.players[this.currentPlayer].state === 1){
            const ship = this.players[this.currentPlayer].ship;
            const previousMag = ship.velocityMagnitude;
            if(previousMag < this.settings.maxVelocityLittle * normalizers.velocity){
                this.players[this.currentPlayer].ship.velocityMagnitude += delta*this.settings.accelerationLittle;
            } else {
                this.players[this.currentPlayer].ship.velocityMagnitude = this.settings.maxVelocityLittle * normalizers.velocity;
            }
        }
    }

    shoot(){
        if(this.players[this.currentPlayer].availableBullets>0){
            const ship = this.players[this.currentPlayer].ship;
            const angle = ship.rotation;
            const data = {
                position: {
                    x: ship.x + ship.width*Math.cos(angle),
                    y: ship.y + ship.width*Math.sin(angle)
                },
                rotation: angle,
                localId: this.currentPlayer,
                timestamp: Date.now()
            };
            this.socket.emit(websocketEvents.SHOOT, data);
            this.createBullet(data);
        }
    }


    updateState(data){
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
                            this.updateState({
                                localId: this.currentPlayer,
                                state: 2
                            });
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