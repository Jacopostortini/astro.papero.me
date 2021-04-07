import Phaser from "phaser";
import {gameDimensions, sceneKeys} from "../constants/gameSettings";
import websocketEvents from "../constants/websocketEvents";

export default class RankingScene extends Phaser.Scene {

    constructor(socket, pointsToWin) {
        super({key: sceneKeys.ranking});

        this.socket = socket;
        this.pointsToWin = pointsToWin;

        this.speed = 300;
        this.angularSpeed = 1200;
    }

    init(data){
        this.players = data.players;
        this.timer = data.timer;
        this.bandWidth = gameDimensions.width / (this.pointsToWin+1);
        this.lineHeight = gameDimensions.height / this.players.length;
        this.playersStopped = 0;
    }

    preload(){
        this.load.image("ship0", "./ships/ship0.png");
        this.load.image("ship1", "./ships/ship1.png");
        this.load.image("ship2", "./ships/ship2.png");
        this.load.image("ship3", "./ships/ship3.png");
    }

    create(){
        this.socket.on(websocketEvents.START_TURN, game => {
            this.scene.start(sceneKeys.game, game);
        });

        this.drawFinishLine();

        this.createShips();

        this.setShipsMovements();
        this.scene.pause();
        setTimeout(()=>{
            this.scene.resume();
        }, 1000);

    }

    update(){
        if(this.timer>Date.now()) {
            this.socket.emit(websocketEvents.START_TURN);
            this.scene.pause();
        }
        this.players.forEach(player => {
            const target = this.bandWidth * (player.to+0.5);
            if(
                (player.ship.x >= target && player.ship.body.velocity.x > 0) ||
                (player.ship.x <= target && player.ship.body.velocity.x < 0)
            ) {
                player.ship.setVelocityX(0);
                player.ship.setAngularVelocity(0);
                this.playersStopped++;
            }
        });
        if(this.playersStopped >= this.players.length) {
            this.scene.pause();
            this.socket.emit(websocketEvents.READY_TURN);
        }
    }

    drawFinishLine(){
        const graphics = this.add.graphics();
        const numberOfSquares = 3;
        const squareDim = this.bandWidth / numberOfSquares;
        let x = this.bandWidth * this.pointsToWin;
        let y = 0;
        let currentColor = 0x0
        while( y < gameDimensions.height){
            for(let i = 0; i < numberOfSquares; i++){
                graphics.fillStyle(currentColor, 1.0);
                graphics.fillRect(x+squareDim*i, y, squareDim, squareDim);
                currentColor = currentColor === 0x0 ? 0xCCCCCC : 0x0;
            }

            y += squareDim;
        }
    }

    createShips(){
        this.players.forEach((player, index) => {
            player.ship = this.physics.add.sprite(this.bandWidth * (player.from+0.5), this.lineHeight * (index+0.5), "ship"+player.color);
            const shipScale = Math.min(this.bandWidth, this.lineHeight) * 0.5 / Math.max(player.ship.width, player.ship.height);
            player.ship.setScale(shipScale);
        });
    }

    setShipsMovements(){
        this.players.forEach(player => {
            player.ship.setVelocityX(Math.sign(player.to-player.from) * this.speed);
            if(player.to < player.from){
                player.ship.setAngularVelocity(this.angularSpeed);
            } else if(player.to === player.from) this.playersStopped++;
        });
    }
}