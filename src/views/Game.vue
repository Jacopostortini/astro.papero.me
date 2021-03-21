<template>
  <Lobby v-if="status === 0 && socket"
         :socket="socket"/>
  <GameScene v-if="status === 1 && socket"
             :socket="socket"/>
</template>

<script>
import GameScene from "../components/gameComponents/GameScene";
import Lobby from "../components/gameComponents/Lobby";
import io from "socket.io-client";
import {urls} from "../constants/constants";
import websocketEvents from "../constants/websocketEvents";
import mitt from "mitt";
window.mitt = window.mitt || mitt();
export default {
  name: 'Game',
  components: {Lobby, GameScene},
  data(){
    return {
      status: 0,
      socket: null,
      emitter: mitt()
    }
  },
  computed: {
    gameId: function(){
      return this.$route.params.gameId;
    }
  },
  mounted() {
    window.mitt.on("*", (type, event)=> {
      console.log(type, event)});
    this.socket = io(urls.baseURL, {
      path: "/server/astro/socket.io",
      autoConnect: true
    });

    this.socket.on("connect", ()=>{
      this.socket.emit(websocketEvents.CONNECT_TO_GAME, {gameId: this.gameId})
    });

    this.socket.on(websocketEvents.STATUS, status => {
      this.status = status;
    });
  }
}
</script>

<style lang="scss" scoped>

</style>
