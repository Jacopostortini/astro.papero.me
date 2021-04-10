import * as Phaser from "phaser";
import websocketEvents from "../constants/websocketEvents";
import {gameDimensions, normalizers, powerUps, sceneKeys} from "../constants/gameSettings";
import {detectTouchScreen} from "../constants/constants";
import _ from "lodash";
import createMap from "../phaser/maps";


export default class GameScene extends Phaser.Scene {

    setUpGame(game){
        this.timer = game.timer;
        this.settings = game.settings;
        this.currentPlayer = game.currentPlayer;
        this.admin = game.admin;
        this.map = game.map;
        this.settings.maxVelocityLittle = game.settings.velocity+0.2;
        this.settings.accelerationLittle = 0.4;
        this.settings.respawnTime = 8000;
        this.settings.frictionAir = 0.1;
        this.settings.powerUpVelocity = 20;
        this.settings.powerUpAngularVelocity = 20;
        this.players = {};
        game.players.forEach(player => {
            this.players[player.localId] = _.cloneDeep(player);
            this.players[player.localId].availableBullets = 3;
            this.players[player.localId].lastTimestamp = 0;
        });
    }

    constructor(socket, game) {
        super({key: sceneKeys.game});

        this.socket = socket;
        this.setUpGame(game);

        this.updateFps = 10;
        this.touchScreen = detectTouchScreen();
        this.powerUpIds = 0;
        
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

        this.socket.on(websocketEvents.UPDATE_SHIP, data => this.updateShip(data));
        this.socket.on(websocketEvents.SHOOT, data => this.createBullet(data));
        this.socket.on(websocketEvents.CHANGE_STATE, data => this.updateState(data));
        this.socket.on(websocketEvents.RELOAD, data => this.reload(data));
        this.socket.on(websocketEvents.POWER_UP, data => this.powerUpEvent(data));
        this.socket.on(websocketEvents.END_TURN, data => {
            setTimeout(()=>{
                this.clearIntervals();
                this.scene.start(sceneKeys.ranking, _.cloneDeep(data));
            }, 2000);
        });
    }

    init(game){
        if(Object.entries(game).length>0) this.setUpGame(game);
        else {
            if(this.timer > Date.now()){
                this.scene.start(sceneKeys.ranking, _.cloneDeep({
                    players: _.cloneDeep(this.players),
                    timer: this.timer
                }));
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

        this.load.image("block1", "./blocks/block1.png");
        this.load.image("block2", "./blocks/block2.png");
        this.load.image("block3", "./blocks/block3.png");

        this.load.image("laser", "./powerUps/laser.png");
        this.load.image("reverse", "./powerUps/reverse.png");
    }

    create(){
        this.createGroups();
        this.createShips();
        createMap(this);

        this.setKeyInputHandlers();
        if(this.touchScreen) this.setTouchInputHandlers();

        this.physics.world.on("worldbounds", (bullet)=>{bullet.gameObject.destroy()});

        this.setReloadInterval();
        this.setUpdateShipInterval();
        if(this.admin === this.currentPlayer) this.setPowerUpInterval();

        this.setOnDestroy();
    }

    update(time, delta){
        if(this.currentPlayer !== null) {
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
        this.ships = this.physics.add.group({
            collideWorldBounds: true
        });
        this.bullets = this.physics.add.group({
            collideWorldBounds: true
        });
        this.powerUps = this.physics.add.group({
            collideWorldBounds: true,
            bounceX: 1,
            bounceY: 1
        });
        this.killableMapObjects = this.physics.add.staticGroup();
        this.notKillableMapObjects = this.physics.add.staticGroup();

        this.physics.add.collider(this.powerUps, this.powerUps);
    }

    createShips(){
        const order = [0, 3, 2, 1];
        let index = 0;
        const textures = ["", "little", "ship"];
        Object.values(this.players).forEach(player => {
            player.ship = this.ships.create(
                (order[index]<2 ? 30 : gameDimensions.width-30),
                ( order[index]%2 === 0 ? 30 : gameDimensions.height-30 ),
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
            player.ship.setAngle(-45  * ( order[index] < 2 ? 1 : 3) * ( ( order[index] % 2 ) * 2 - 1 ));
            player.ship.velocityMagnitude = this.settings.velocity*normalizers.velocity;
            player.ship.autonomyTime = 0;

            if(player.localId===this.currentPlayer){
                this.physics.add.overlap(player.ship, this.bullets, (ship, bullet) => {
                    this.onBulletCollision(ship, bullet);
                });

                this.physics.add.overlap(player.ship, this.powerUps, (ship, powerUp)=>{
                    this.onPowerUpOverlap(powerUp, ship);
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
        bullet.body.onWorldBounds = true;
        this.players[data.localId].availableBullets--;
        const firstAlive = this.players[data.localId].bulletsLoaded.getFirstAlive();
        if(firstAlive){
            firstAlive.setActive(false).setVisible(false);
        }
    }

    createPowerUp(data){
        const powerUp = this.powerUps.create(data.position.x, data.position.y, data.powerUp);
        const {x, y} = this.physics.velocityFromAngle(data.angle, this.settings.powerUpVelocity);
        powerUp.setVelocity(x, y);
        powerUp.setAngularVelocity(this.settings.powerUpAngularVelocity);
        powerUp.id = data.id;
        powerUp.powerUp = data.powerUp;
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

    powerUpEvent(data){
        if(data.type === "create") this.createPowerUp(data);

        else if(data.type === "get") {
            this.powerUps.children.iterate(child => {
                if(child.id === data.id) {
                    this.powerUps.remove(child);
                    child.destroy();
                }
            });
            if(data.powerUp === "reverse") this.settings.angularVelocity *= -1;
        }
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
                this.players[data.localId].bulletsLoaded.killAll();
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
            this.clearIntervals(false);
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
            console.log(e);
        }
    }

    onPowerUpOverlap(ship, powerUp){
        if(this.players[ship.localId].state < 2 ) return;
        const data = {
            type: "get",
            localId: ship.localId,
            powerUp: powerUp.powerUp,
            id: powerUp.id
        }
        this.socket.emit(websocketEvents.POWER_UP, data);
        this.powerUpEvent(data);
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
        if(this.currentPlayer === null) return;

        this.rotationKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.accelerateLittleKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.input.keyboard.on("keyup-ENTER", ()=>{
            if(this.players[this.currentPlayer].state>=2) this.shoot();
        });
    }

    setTouchInputHandlers(){
        if(this.currentPlayer === null) return;

        this.input.addPointer(1);

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

        this.input.on("pointerup", (pointer) => {
            if (pointer.x < gameDimensions.width / 2) {
                this.rotating = false;
            } else {
                this.accelerating = false;
            }
        });
    }

    setUpdateShipInterval(){
        if(this.currentPlayer === null) return;

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
        if(this.currentPlayer === null) return;

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

    setPowerUpInterval(){
        this.powerUpInterval = setInterval(()=>{
            if(Math.random()<0.5) return;
            const data = {
                type: "create",
                powerUp: powerUps[Math.floor(Math.random()*powerUps.length)],
                position: {
                    x: Phaser.Math.FloatBetween(0, gameDimensions.width),
                    y: Phaser.Math.FloatBetween(0, gameDimensions.height)
                },
                angle: Phaser.Math.FloatBetween(0, 360),
                id: ++this.powerUpIds
            }
            this.socket.emit(websocketEvents.POWER_UP, data);
            this.powerUpEvent(data);
        }, 5000);
    }

    setOnDestroy(){
        if(this.currentPlayer === null) return;

        this.events.on("destroy", ()=>{
            this.clearIntervals(true);
        });
    }

    clearIntervals(powerUp){
        clearInterval(this.updateShipInterval);
        clearInterval(this.reloadInterval);
        if(powerUp) clearInterval(this.powerUpInterval);
    }
}