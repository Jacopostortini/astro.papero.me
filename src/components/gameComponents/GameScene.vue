<template>
  <div id="game"></div>
</template>

<script>
import Phaser from "phaser";
import {config} from "../../constants/constants";
import GameScene from "../../phaser/GameScene";
import {gameDimensions} from "../../constants/gameSettings";

export default {
  name: "GameScene",
  props: {
    socket: Object,
  },
  mounted(){
    const parent = document.getElementById("game");
      new Phaser.Game(
          config(
              new GameScene(this.socket),
              parent,
              gameDimensions.width,
              gameDimensions.height
          ));
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