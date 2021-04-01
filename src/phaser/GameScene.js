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
        this.updateFps = 10;



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

        setInterval(()=>{
            this.socket.emit(websocketEvents.ROTATE_SHIP, [
                this.currentPlayer,
                Number.parseFloat(this.players[this.currentPlayer].ship.rotation.toFixed(1)),
                [
                    Number.parseFloat(this.players[this.currentPlayer].ship.x.toFixed(2)),
                    Number.parseFloat(this.players[this.currentPlayer].ship.y.toFixed(2))
                ],
                this.time.now
            ]);
        }, 1000/this.updateFps);
    }

    update(time, delta){
        if(this.rotationKey.isDown) this.rotate(delta);
        if(this.accelerateLittleKey.isDown) this.moveLittle(delta);
        const {x, y} = this.physics.velocityFromRotation(
            this.players[this.currentPlayer].ship.rotation,
            this.players[this.currentPlayer].ship.velocityMagnitude
        );
        this.players[this.currentPlayer].ship.setVelocity(x, y);
        if (this.players[this.currentPlayer].state === 1) {
            this.players[this.currentPlayer].ship.velocityMagnitude = Math.max(
                0, this.players[this.currentPlayer].ship.velocityMagnitude - this.settings.frictionAir * delta
            );
        }
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
            player.ship.velocityMagnitude = this.settings.velocity*normalizers.velocity;

            if(player.localId===this.currentPlayer){
                player.ship.setCollideWorldBounds(true);
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
        console.log(data);
        const player = this.players[data[0]];
        const deltaTime = (data[3]-player.lastTimestamp)/1000;
        if(deltaTime<=0) return;

        player.ship.setVelocity( ( data[2][0]-player.ship.x ) / deltaTime, ( data[2][1]-player.ship.y ) / deltaTime );
        let deltaTheta = data[1] - Number.parseFloat(player.ship.rotation.toFixed(1));
        deltaTheta = Number.parseFloat(deltaTheta.toFixed(1));

        if(deltaTheta < 0) deltaTheta += 2*Math.PI;
        console.log(Number.parseFloat(player.ship.rotation.toFixed(1)), deltaTheta);
        const angularVelocity = 180 / Math.PI * deltaTheta / deltaTime;
        player.ship.setAngularVelocity(angularVelocity);

        player.lastTimestamp = data[3];
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
                this.ships.remove(ship);
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