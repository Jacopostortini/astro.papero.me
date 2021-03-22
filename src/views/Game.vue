<template>
  <UserHamburgerMenu :show="showHamburgerMenu"
                     :src="require('@/assets/hamburger_icon_dark.png')"
                     :auto-login="true"
                     @toggle-show="showHamburgerMenu=$event"/>
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
import UserHamburgerMenu from "../components/UserHamburgerMenu";
export default {
  name: 'Game',
  components: {UserHamburgerMenu, Lobby, GameScene},
  data(){
    return {
      status: 0,
      socket: null,
      showHamburgerMenu: true
    }
  },
  computed: {
    gameId: function(){
      return this.$route.params.gameId;
    }
  },
  mounted() {
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
  },
  /*beforeRouteEnter(to, from, next){

  }*/
}
</script>

<style lang="scss" scoped>

</style>
