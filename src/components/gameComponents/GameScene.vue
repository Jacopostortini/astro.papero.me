<template>
  <div id="game"></div>
</template>

<script>
import Phaser from "phaser";
import {config} from "../../constants/constants";
import GameScene from "../../scenes/GameScene";
import websocketEvents from "../../constants/websocketEvents";

export default {
  name: "GameScene",
  props: {
    socket: Object,
  },
  mounted(){
    this.socket.on(websocketEvents.GAME_MODIFIED, game =>{
      let parent = document.getElementById("game");
      new Phaser.Game(
          config(
              new GameScene(this.socket, game),
              parent,
              800,
              600
          ));
    });
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