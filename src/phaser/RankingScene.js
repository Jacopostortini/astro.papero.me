import Phaser from "phaser";
import {gameDimensions, sceneKeys} from "../constants/gameSettings";
import websocketEvents from "../constants/websocketEvents";
import _ from "lodash";
import {loadImages} from "./scene";

export default class RankingScene extends Phaser.Scene {

    constructor(socket, pointsToWin) {
        super({
            key: sceneKeys.ranking,
            physics: {
                default: "arcade",
                arcade: {
                    debug: false,
                    gravity: {x: 0, y: 0}
                }
            }
        });

        this.socket = socket;
        this.pointsToWin = pointsToWin;

        this.speed = 300;
        this.angularSpeed = 1200;
        this.socket.on(websocketEvents.START_TURN, game => {
            console.log("Starting turn")
            this.scene.start(sceneKeys.game, _.cloneDeep(game));
        });
    }

    init(data){
        console.log("Ranking scene init", _.cloneDeep(data))
        this.players = _.cloneDeep(data.players);
        this.timer = data.timer ? data.timer : Infinity;
        this.bandWidth = gameDimensions.width / (this.pointsToWin+1);
        this.lineHeight = gameDimensions.height / this.players.length;
        this.playersStopped = 0;
        this.ready = false;
    }

    preload(){
        console.log("Ranking scene preload")
        loadImages(this, sceneKeys.ranking);
    }

    create(){
        console.log("Ranking scene create")
        this.drawFinishLine();

        this.createShips();

        this.setShipsMovements();

        this.timerText = this.add.text(gameDimensions.width/2, 20, ((this.timer-Date.now())/1000).toFixed(0), {fontSize: 30});
        this.timerText.setOrigin(0.5);
        this.scene.pause();
        setTimeout(()=>{
            this.scene.resume();
        }, 1000);

    }

    update(){
        const text = this.timer===Infinity ? "Game over (F5 to restart)" : ((this.timer-Date.now())/1000).toFixed(0);
        this.timerText.setText(text);
        if(this.timer<Date.now()) {
            console.log("timeout");
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
        if(this.playersStopped >= this.players.length && !this.ready) {
            this.ready = true;
            setTimeout(()=>{
                console.log("Ready turn")
                this.socket.emit(websocketEvents.READY_TURN);
            }, 1000);
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