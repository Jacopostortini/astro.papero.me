import Phaser from "phaser";
import websocketEvents from "../constants/websocketEvents";
import {defaultSettings, normalizers, sceneKeys} from "../constants/gameSettings";
import {detectTouchScreen} from "../constants/constants";

export default class LobbyScene extends Phaser.Scene {

    constructor(socket) {
        super({key: sceneKeys.lobby});
        this.socket = socket;
        this.lobby = {
            players: [],
            currentPlayer: null,
            settings: defaultSettings
        }

        this.touchScreen = detectTouchScreen();

        this.ships = {};
        this.availableBullets = 3;
        let interval;
        const handler = () => {
            this.availableBullets = this.availableBullets>=3 ? this.availableBullets : this.availableBullets+1;
            clearInterval(interval)
            interval = setInterval(handler, 1/(this.lobby.settings.reloadingVelocity*normalizers.reloadingVelocity));
        }
        interval = setInterval(handler, 1/(this.lobby.settings.reloadingVelocity*normalizers.reloadingVelocity));
    }

    preload(){

        //load images
        this.width = this.sys.game.canvas.width;
        this.height = this.sys.game.canvas.height;

        this.load.image("ship0", "./ships/ship0.png");
        this.load.image("ship1", "./ships/ship1.png");
        this.load.image("ship2", "./ships/ship2.png");
        this.load.image("ship3", "./ships/ship3.png");
        this.load.image("bullet", "./bullet.png");
        if(this.touchScreen) {
            this.load.image("rotate-button", "./rotate-button.png");
            this.load.image("shoot-button", "./shoot-button.png");
        }

        const onresize = () => {
            const parent = document.getElementById("players-wrapper");
            const height = Math.min(parent.offsetWidth, parent.offsetHeight);
            const width = window.innerWidth>750 ? height : window.innerWidth*0.8
            this.game.scale.resize(width, height);
            this.physics.world.setBounds(0, 0, width, height);
        };
        window.addEventListener("resize", onresize);
        this.events.on("destroy", ()=>{
            window.removeEventListener("resize", onresize);
        });

    }

    create(){
        //Event lobby-modified
        this.socket.emit(websocketEvents.LOBBY_MODIFIED);
        this.socket.on(websocketEvents.LOBBY_MODIFIED, game => this.onLobbyModified(game));

        //Setting up rotation and shooting
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.input.keyboard.on("keyup-ENTER", ()=>{
            if(this.availableBullets>0) this.createBullet();
        });

        if(this.touchScreen) {
            this.add.image(0, this.height/2, "rotate-button").setOrigin(0, 0.5);
            this.add.image(this.width, this.height/2, "shoot-button").setOrigin(1, 0.5);

            this.input.addPointer(1);
            this.input.on("pointerup", (pointer) => {
                if(pointer.x<this.width/2){
                    this.rotating = false;
                }
            });
            this.input.on("pointerdown", (pointer) => {
                if(pointer.x<this.width/2){
                    this.rotating = true;
                } else {
                    if(this.availableBullets>0) this.createBullet();
                }
            })
        }

        this.onLobbyModified({ //TODO: CHANGE HERE
            settings: defaultSettings,
            currentPlayer: 0,
            players: [
                {
                    localId: 0,
                    color: 0
                }
            ]
        })
    }

    update(time, delta){
        if(Array.isArray(this.lobby.players) && this.lobby.players.length>0) {
            this.lobby.players.forEach(player => {
                const {x, y} = this.ships[player.localId].body.velocity;
                this.ships[player.localId].angle = this.getAngle(x, y);
            });
        }
        if(this.lobby.currentPlayer!==null && (this.keySpace.isDown || this.rotating)){
            this.ships[this.lobby.currentPlayer].angle += this.lobby.settings.angularVelocity* normalizers.angularVelocity * delta;
            const {x, y} = this.physics.velocityFromAngle(this.ships[this.lobby.currentPlayer].angle, this.lobby.settings.velocity* normalizers.velocity);
            this.ships[this.lobby.currentPlayer].setVelocity(x, y);
        }
    }

    getAngle(x, y){
        let angle;
        if(x!==0) {
            angle = Math.atan(y / x) * 180 / Math.PI;
            angle = x < 0 ? angle + 180 : angle;
        } else if(y>=0) angle = 90;
        else if(y<0) angle = -90;
        return angle;
    }

    createNewShip(color){
        const posX = Phaser.Math.Between(0, this.width);
        const posY = Phaser.Math.Between(0, this.height);
        const ship = this.physics.add.image(posX, posY, "ship"+color);
        const angle = Phaser.Math.Between(45, 135);
        const {x, y} = this.physics.velocityFromAngle(angle, this.lobby.settings.velocity*normalizers.velocity)
        ship.setVelocity(x, y);
        ship.angle = angle;
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


    onLobbyModified(game){
        const currentlyPlayingIds = [];
        game.players.forEach(player => {currentlyPlayingIds.push(player.localId)});

        const previousPlayingIds = [];
        this.lobby.players.forEach(player => {previousPlayingIds.push(player.localId)});

        this.lobby = {...game};

        const newShips = {};
        const oldShips = {...this.ships};
        currentlyPlayingIds.forEach(id => {
            if(previousPlayingIds.includes(id)){
                newShips[id] = this.ships[id];
                const {x, y} = this.physics.velocityFromAngle(newShips[id].angle, this.lobby.settings.velocity * normalizers.velocity);
                newShips[id].setVelocity(x, y);
                newShips[id].setTexture("ship"+this.findPlayerById(id).color);
            } else {
                newShips[id] = this.createNewShip(this.findPlayerById(id).color);
            }
        });
        const idsToRemove = previousPlayingIds.filter(x => !currentlyPlayingIds.includes(x));
        idsToRemove.forEach(id => {oldShips[id].destroy()});

        this.ships = newShips;
    }

    createBullet(){
        const bullet = this.physics.add.image(
            this.ships[this.lobby.currentPlayer].x,
            this.ships[this.lobby.currentPlayer].y,
            "bullet"
        );
        bullet.angle = this.ships[this.lobby.currentPlayer].angle;
        const {x, y} = this.physics.velocityFromAngle(bullet.angle, this.lobby.settings.bulletVelocity*normalizers.bulletVelocity);
        bullet.setVelocity(x, y);
        this.availableBullets--;
    }
}