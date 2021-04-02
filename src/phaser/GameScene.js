import * as Phaser from "phaser";
import websocketEvents from "../constants/websocketEvents";
import {gameDimensions, normalizers, sceneKeys} from "../constants/gameSettings";
import {detectTouchScreen} from "../constants/constants";


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

        this.updateFps = 15;
        this.touchScreen = detectTouchScreen();

        this.reloadInterval = setInterval(() => {
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

        this.socket.on(websocketEvents.UPDATE_SHIP, data => this.updateShip(data));
        this.socket.on(websocketEvents.SHOOT, data => this.createBullet(data));
        this.socket.on(websocketEvents.CHANGE_STATE, data => this.updateState(data));
        this.socket.on(websocketEvents.RELOAD, data => this.reload(data));

        this.rotationKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.accelerateLittleKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.input.keyboard.on("keyup-ENTER", ()=>{
            if(this.players[this.currentPlayer].state>=2) this.shoot();
        });
        this.physics.world.on("worldbounds", (bullet)=>{bullet.gameObject.destroy()});

        if(this.touchScreen){
            this.input.addPointer(1);
            this.input.on("pointerup", (pointer) => {
                if(pointer.x<gameDimensions.width/2){
                    this.rotating = false;
                } else {
                    this.accelerating = false;
                }
            });
            this.input.on("pointerdown", (pointer) => {
                if(pointer.x<gameDimensions.width/2){
                    this.rotating = true;
                } else {
                    if(this.players[this.currentPlayer].state >= 2){
                        if(this.availableBullets>0) this.shoot();
                    } else {
                        this.accelerating = true;
                    }
                }
            });
        }


        this.updateShipInterval = setInterval(()=>{
            this.socket.emit(websocketEvents.UPDATE_SHIP, [
                this.currentPlayer,
                Number.parseInt(this.players[this.currentPlayer].ship.angle),
                [
                    Number.parseFloat(this.players[this.currentPlayer].ship.x.toFixed(2)),
                    Number.parseFloat(this.players[this.currentPlayer].ship.y.toFixed(2))
                ],
                this.time.now
            ]);
        }, 1000/this.updateFps);
    }

    update(time, delta){
        if(this.rotationKey.isDown || this.rotating) this.rotate(delta);
        if(this.accelerateLittleKey.isDown || this.accelerating) this.moveLittle(delta);
        const {x, y} = this.physics.velocityFromAngle(
            this.players[this.currentPlayer].ship.angle,
            this.players[this.currentPlayer].ship.velocityMagnitude
        );
        this.players[this.currentPlayer].ship.setVelocity(x, y);
        if (this.players[this.currentPlayer].state === 1) {
            this.players[this.currentPlayer].ship.velocityMagnitude = Math.max(
                0, this.players[this.currentPlayer].ship.velocityMagnitude - this.settings.frictionAir * delta
            );
        }
        Object.values(this.players).forEach(player => {
           if(player.localId!==this.currentPlayer){
               player.ship.autonomyTime -= delta;
               if(player.ship.autonomyTime<0) {
                   player.ship.setVelocity(0);
                   player.ship.setAngularVelocity(0);
               }
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
            player.ship.setAngle(-45  * ( index < 2 ? 1 : 3) * ( ( index % 2 ) * 2 - 1 ));
            player.ship.velocityMagnitude = this.settings.velocity*normalizers.velocity;
            player.ship.autonomyTime = 0;

            if(player.localId===this.currentPlayer){
                player.ship.setCollideWorldBounds(true);
                this.physics.add.overlap(player.ship, this.bullets, (ship, bullet) => {
                    this.onBulletCollision(ship, bullet);
                });
                this.physics.add.collider(player.ship, this.ships, (currentShip, ship)=>{
                    if(this.players[this.currentPlayer].state === 1 && this.players[ship.localId].state >= 2){
                        this.killedBy = ship.localId;
                        const data = {
                            localId: this.currentPlayer,
                            state: 0
                        };
                        this.socket.emit(websocketEvents.CHANGE_STATE, data);
                        this.updateState(data);
                    }
                });
            }

            index++;
        });

        this.physics.add.collider(this.ships, this.ships);
    }

    createBullet(data){
        const {x, y} = this.physics.velocityFromAngle(data.angle, this.settings.bulletVelocity*normalizers.bulletVelocity);
        const deltaTime = Date.now()-data.timestamp;
        const bullet = this.bullets.create(data.position.x+deltaTime*x/1000, data.position.y+deltaTime*y/1000, "bullet");
        bullet.angle = data.angle;
        bullet.setVelocity(x, y);
        bullet.shotBy = data.localId;
        bullet.setCollideWorldBounds(true);
        bullet.body.onWorldBounds = true;
        this.players[data.localId].availableBullets--;
    }






    //=============================================================================
    //Others do things via the websocket
    updateShip(data){
        const player = this.players[data[0]];
        const deltaTime = (data[3]-player.lastTimestamp)/1000;
        if(deltaTime<=0) return;

        let deltaTheta = data[1] - Number.parseInt(player.ship.angle);

        if(deltaTheta < -10) deltaTheta += 360;
        else if(deltaTheta < 0) deltaTheta = 0;
        const angularVelocity = deltaTheta / deltaTime;
        player.ship.setAngularVelocity(angularVelocity);

        player.ship.setVelocity( ( data[2][0]-player.ship.x ) / deltaTime, ( data[2][1]-player.ship.y ) / deltaTime );

        player.lastTimestamp = data[3];
        player.ship.autonomyTime = deltaTime*1000;
    }



    //=============================================================================
    //Current players does things
    rotate(delta){
        this.players[this.currentPlayer].ship.angle += delta * this.settings.angularVelocity * normalizers.angularVelocity;
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
            const angle = ship.angle;
            const data = {
                position: {
                    x: ship.x + ship.width*Math.cos(angle * Math.PI / 180),
                    y: ship.y + ship.width*Math.sin(angle * Math.PI / 180)
                },
                angle: angle,
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
                this.ships.remove(ship);
                clearInterval(this.reloadInterval);
                clearInterval(this.updateShipInterval);
                break;
            case 1:
                ship.setTexture("little" + this.players[data.localId].color);
                if(data.localId === this.currentPlayer) {
                    setTimeout(() => {
                        if (this.players[data.localId].state === 1) {
                            const data = {
                                localId: this.currentPlayer,
                                state: 2
                            };
                            this.updateState(data);
                            this.socket.emit(websocketEvents.CHANGE_STATE, data);
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
        const data = {
            localId: ship.localId,
            state
        };
        this.socket.emit(websocketEvents.CHANGE_STATE, data);
        this.updateState(data);
    }


    reload(data){
        this.players[data.localId].availableBullets = data.availableBullets;
    }
}