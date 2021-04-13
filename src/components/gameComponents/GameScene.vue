<template>
  <div id="game"></div>
</template>

<script>
import Phaser from "phaser";
import {config} from "../../constants/constants";
import GameScene from "../../phaser/GameScene";
import {gameDimensions} from "../../constants/gameSettings";
import websocketEvents from "../../constants/websocketEvents";
import RankingScene from "../../phaser/RankingScene";

export default {
  name: "GameScene",
  props: {
    socket: Object,
  },
  mounted(){
    this.socket.on(websocketEvents.GAME_MODIFIED, game => {
      const parent = document.getElementById("game");
      console.log(game);
      new Phaser.Game(
          config(
              [new GameScene(this.socket, game), new RankingScene(this.socket, game.settings.pointsToWin)],
              parent,
              gameDimensions.width,
              gameDimensions.height,
              Phaser.Scale.FIT,
              "matter"
          ));
    });
    this.socket.emit(websocketEvents.GAME_MODIFIED);
  }
}
</script>

<style scoped>

#game{
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

</style>