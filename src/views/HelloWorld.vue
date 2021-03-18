<template>
  <div class="hello">

  </div>
</template>

<script>
import * as Phaser from "phaser";
import MainScene from "../MainScene";
export default {
  name: 'HelloWorld',
  setup(){
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      physics: {
        default: 'arcade'
      },
      scene: [ MainScene ]
    }

    new Phaser.Game(config);
  }
}
</script>

<style scoped>

</style>
