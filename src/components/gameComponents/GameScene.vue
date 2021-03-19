<template>
  <div/>
</template>

<script>
import Phaser from "phaser";
import {config} from "../../constants/constants";

export default {
  name: "GameScene",
  mounted(){
    new Phaser.Game(config);
  }
}
</script>

<style scoped>
canvas{
  position: fixed;
  top: 0;
  left: 0;
}

</style>