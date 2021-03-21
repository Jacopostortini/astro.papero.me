<template>
  <div id="game"></div>
</template>

<script>
import Phaser from "phaser";
import {config} from "../../constants/constants";
import GameScene from "../../scenes/GameScene";
import mitt from "mitt";

export default {
  name: "GameScene",
  props: {
    socket: Object,
  },
  data(){
    return {
      emitter: mitt()
    }
  },
  mounted(){
    let parent = document.getElementById("game");
    new Phaser.Game(
        config(
            new GameScene(),
            parent,
            800,
            600
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