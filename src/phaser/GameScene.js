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
        this.settings.maxVelocityLittle = game.settings.velocity+0.2;
        this.settings.accelerationLittle = 0.4;
        this.settings.respawnTime = 8000;
        this.settings.frictionAir = 0.1;
        this.players = {};
        game.players.forEach(player => {
            this.players[player.localId] = player;
            this.players[player.localId].availableBullets = 3;
            this.players[player.localId].lastTimestamp = 0;
        });

        this.updateFps = 15;
        this.touchScreen = detectTouchScreen();
        
        Phaser.Physics.Arcade.Group.prototype.killAll = function () {
            while(this.countActive()>0){
                this.getFirstAlive().setActive(false).setVisible(false);
            }
        }

        Phaser.Physics.Arcade.Group.prototype.enableAll = function () {
            while(this.countActive()<3){
                this.getFirstDead().setActive(true).setVisible(true);
            }
        }
    }

    preload(){

        this.load.image("ship0", "./ships/ship0.png");
        this.load.image("ship1", "./ships/ship1.png");
        this.load.image("ship2", "./ships/ship2.png");
        this.load.image("ship3", "./ships/ship3.png");
        this.load.image("little0", "./littles/little0.png");
        this.load.image("little1", "./littles/little1.png");
        this.load.image("little2", "./littles/little2.png");
        this.load.image("little3", "./littles/little3.png");
        this.load.image("bullet", "./bullet.png");
        this.load.image("bullet-loaded", "./bullet-loaded.png");

    }

    create(){
        this.createGroups();
        this.createShips();

        this.socket.on(websocketEvents.UPDATE_SHIP, data => this.updateShip(data));
        this.socket.on(websocketEvents.SHOOT, data => this.createBullet(data));
        this.socket.on(websocketEvents.CHANGE_STATE, data => this.updateState(data));
        this.socket.on(websocketEvents.RELOAD, data => this.reload(data));

        this.setKeyInputHandlers();
        if(this.touchScreen) this.setTouchInputHandlers();

        this.physics.world.on("worldbounds", (bullet)=>{bullet.gameObject.destroy()});

        this.setReloadInterval();
        this.setUpdateShipInterval();

        this.setOnDestroy();
    }

    update(time, delta){
        if(this.currentPlayer) {
            if (this.rotationKey.isDown || this.rotating) this.rotate(delta);
            if (this.accelerateLittleKey.isDown || this.accelerating) this.moveLittle(delta);

            this.setCurrentPlayerNewVelocity();
            if (this.players[this.currentPlayer].state === 1) this.decelerateLittle(delta);
        }

        Object.values(this.players).forEach(player => {
            const topLeft = player.ship.getTopLeft();
            const bottomLeft = player.ship.getBottomLeft();
            const centerLeft = {
                x: (topLeft.x + bottomLeft.x) / 2,
                y: (topLeft.y + bottomLeft.y) / 2
            }
            player.bulletsLoaded.children.iterate((bullet, index)=>{
                const {x, y} = this.getLoadedBulletPosition(index, topLeft, bottomLeft, centerLeft, player);
                bullet.x = x;
                bullet.y = y;

            });
           if(player.localId!==this.currentPlayer){
               player.ship.autonomyTime -= delta;
               if(player.ship.autonomyTime<0) {
                   player.ship.setVelocity(0);
                   player.ship.setAngularVelocity(0);
               }
           }
        });
    }




    //=============================================================================
    //Creating things
    createGroups(){
        this.ships = this.physics.add.group();
        this.bullets = this.physics.add.group();
    }

    createShips(){
        let index = 0;
        const textures = ["", "little", "ship"];
        Object.values(this.players).forEach(player => {
            player.ship = this.ships.create(
                (index<2 ? 0.05 : 0.95) * gameDimensions.width,
                ( index%2 === 0 ? 0.05 : 0.95 ) * gameDimensions.height,
                textures[player.state]+player.color
            );
            
            if(player.state === 0) {
                this.ships.killAndHide(player.ship);
                this.ships.remove(player.ship);
            }

            player.bulletsLoaded = this.physics.add.group({
                key: "bullet-loaded",
                quantity: 3,
                visible: player.state!==0,
                active: player.state!==0
            });

            player.ship.localId = player.localId;
            player.ship.setAngle(-45  * ( index < 2 ? 1 : 3) * ( ( index % 2 ) * 2 - 1 ));
            player.ship.velocityMagnitude = this.settings.velocity*normalizers.velocity;
            player.ship.autonomyTime = 0;
            player.ship.setCollideWorldBounds(true);

            if(player.localId===this.currentPlayer){
                this.physics.add.overlap(player.ship, this.bullets, (ship, bullet) => {
                    this.onBulletCollision(ship, bullet);
                });
                this.physics.add.collider(player.ship, this.ships, (currentShip, ship)=>{
                    if(this.players[this.currentPlayer].state === 1 && this.players[ship.localId].state >= 2){
                        const data = {
                            localId: this.currentPlayer,
                            state: 0,
                            killedBy: ship.localId
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
        const bullet = this.bullets.create(data.position.x, data.position.y, "bullet");
        bullet.angle = data.angle;
        bullet.setVelocity(x, y);
        bullet.shotBy = data.localId;
        bullet.setCollideWorldBounds(true);
        bullet.body.onWorldBounds = true;
        this.players[data.localId].availableBullets--;
        this.players[data.localId].bulletsLoaded.getFirstAlive().setActive(false).setVisible(false);
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
        const currentPlayer = this.players[this.currentPlayer];
        if(currentPlayer.state === 1){
            const ship = currentPlayer.ship;
            const previousMag = ship.velocityMagnitude;
            if(previousMag < this.settings.maxVelocityLittle * normalizers.velocity){
                currentPlayer.ship.velocityMagnitude += delta*this.settings.accelerationLittle;
            } else {
                currentPlayer.ship.velocityMagnitude = this.settings.maxVelocityLittle * normalizers.velocity;
            }
        }
    }

    shoot(){
        const currentPlayer = this.players[this.currentPlayer];
        if(currentPlayer.availableBullets>0){
            const ship = currentPlayer.ship;
            const angle = ship.angle;
            const data = {
                position: {
                    x: ship.x + ship.width*Math.cos(angle * Math.PI / 180),
                    y: ship.y + ship.height*Math.sin(angle * Math.PI / 180)
                },
                angle: angle,
                localId: this.currentPlayer
            };
            this.socket.emit(websocketEvents.SHOOT, data);
            this.createBullet(data);
        }
    }


    updateState(data){
        this.players[data.localId].state = data.state;
        const player = this.players[data.localId];
        switch (data.state) {
            case 0:
                this.ships.killAndHide(player.ship);
                this.ships.remove(player.ship);
                break;
            case 1:
                player.ship.setTexture("little" + this.players[data.localId].color);
                this.players[data.localId].bulletsLoaded.killAll();
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
                player.ship.velocityMagnitude = this.settings.velocity * normalizers.velocity;
                player.ship.setTexture("ship" + this.players[data.localId].color);
                player.bulletsLoaded.enableAll();
                break;
        }
    }

    onBulletCollision(ship, bullet){
        bullet.destroy();
        const state = this.players[ship.localId].state-1;
        const data = {
            localId: ship.localId,
            state
        };
        if(state === 0) {
            data.killedBy = bullet.shotBy;
            clearInterval(this.reloadInterval);
            clearInterval(this.updateShipInterval);
        }
        this.socket.emit(websocketEvents.CHANGE_STATE, data);
        this.updateState(data);
    }


    reload(data){
        this.players[data.localId].availableBullets = data.availableBullets;
        try{
            while(this.players[data.localId].bulletsLoaded.countActive() < data.availableBullets){
                this.players[data.localId].bulletsLoaded.getFirstDead().setActive(true).setVisible(true);
            }
        } catch (e) {
            console.error(e);
        }
    }


    //=============================================================================
    //Game loop functions
    setCurrentPlayerNewVelocity(){
        const {x, y} = this.physics.velocityFromAngle(
            this.players[this.currentPlayer].ship.angle,
            this.players[this.currentPlayer].ship.velocityMagnitude
        );
        this.players[this.currentPlayer].ship.setVelocity(x, y);
    }

    decelerateLittle(delta){
        this.players[this.currentPlayer].ship.velocityMagnitude = Math.max(
            0, this.players[this.currentPlayer].ship.velocityMagnitude - this.settings.frictionAir * delta
        );
    }

    getLoadedBulletPosition(index, topLeft, bottomLeft, centerLeft, player){
        switch (index){
            case 0:
                return {
                    x: bottomLeft.x - (player.ship.width/4)*Math.cos(player.ship.rotation),
                    y: bottomLeft.y - (player.ship.height/4)*Math.sin(player.ship.rotation)
                };
            case 1:
                return{
                    x: topLeft.x - (player.ship.width/4)*Math.cos(player.ship.rotation),
                    y: topLeft.y - (player.ship.height/4)*Math.sin(player.ship.rotation)
                };
            case 2:
                return {
                    x: centerLeft.x - (player.ship.width/4)*Math.cos(player.ship.rotation),
                    y: centerLeft.y - (player.ship.height/4)*Math.sin(player.ship.rotation)
                };
        }
    }



    //=============================================================================
    //On create setup

    setKeyInputHandlers(){
        if(!this.currentPlayer) return;

        this.rotationKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.accelerateLittleKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.input.keyboard.on("keyup-ENTER", ()=>{
            if(this.players[this.currentPlayer].state>=2) this.shoot();
        });
    }

    setTouchInputHandlers(){
        if(!this.currentPlayer) return;

        this.input.addPointer(1);
        this.input.on("pointerup", (pointer) => {
            if (pointer.x < gameDimensions.width / 2) {
                this.rotating = false;
            } else {
                this.accelerating = false;
            }
        });
        this.input.on("pointerdown", (pointer) => {
            if (pointer.x < gameDimensions.width / 2) {
                this.rotating = true;
            } else {
                if (this.players[this.currentPlayer].state >= 2) this.shoot();
                else {
                    this.accelerating = true;
                }
            }
        });
    }

    setUpdateShipInterval(){
        if(!this.currentPlayer) return;

        const currentPlayer = this.players[this.currentPlayer];
        this.updateShipInterval = setInterval(()=>{
            this.socket.emit(websocketEvents.UPDATE_SHIP, [
                this.currentPlayer,
                Number.parseInt(currentPlayer.ship.angle),
                [
                    Number.parseFloat(currentPlayer.ship.x.toFixed(2)),
                    Number.parseFloat(currentPlayer.ship.y.toFixed(2))
                ],
                this.time.now
            ]);
        }, 1000/this.updateFps);
    }

    setReloadInterval(){
        if(!this.currentPlayer) return;

        this.reloadInterval = setInterval(() => {
            if(this.players[this.currentPlayer].state<2) return;
            const availableBullets = Math.min(3, this.players[this.currentPlayer].availableBullets + 1);
            const data = {
                localId: this.currentPlayer,
                availableBullets
            };
            this.socket.emit(websocketEvents.RELOAD, data);
            this.reload(data);
        }, 1/(this.settings.reloadingVelocity * normalizers.reloadingVelocity));
    }

    setOnDestroy(){
        if(!this.currentPlayer) return;

        this.events.on("destroy", ()=>{
            clearInterval(this.updateShipInterval);
            clearInterval(this.reloadInterval);
        });
    }
}