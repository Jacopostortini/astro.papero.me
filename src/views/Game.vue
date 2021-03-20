<template>
  <Lobby v-if="status === 0"
         :socket="socket"/>
  <GameScene v-if="status === 1"/>
</template>

<script>
import GameScene from "../components/gameComponents/GameScene";
import Lobby from "../components/gameComponents/Lobby";
import io from "socket.io-client";
import {urls} from "../constants/constants";
import websocketEvents from "../constants/websocketEvents";
export default {
  name: 'Game',
  components: {Lobby, GameScene},
  data(){
    return {
      status: 0,
      socket: null
    }
  },
  mounted() {
    this.socket = io(urls.baseURL, {
      path: "/server/astro/socket.io",
      autoConnect: false
    });

    this.socket.on(websocketEvents.STATUS, status => {
      this.status = status;
    })
  }
}
</script>

<style lang="scss" scoped>

</style>
