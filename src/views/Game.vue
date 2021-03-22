<template>
  <UserHamburgerMenu :show="showHamburgerMenu"
                     :src="require('@/assets/hamburger_icon_dark.png')"
                     :logged="logged"
                     :username="username"
                     @toggle-show="showHamburgerMenu=$event"/>
  <Lobby v-if="status === 0 && socket && settedUp"
         :socket="socket"/>
  <GameScene v-if="status === 1 && socket && settedUp"
             :socket="socket"/>
</template>

<script>
import GameScene from "../components/gameComponents/GameScene";
import Lobby from "../components/gameComponents/Lobby";
import io from "socket.io-client";
import {urls} from "../constants/constants";
import websocketEvents from "../constants/websocketEvents";
import UserHamburgerMenu from "../components/UserHamburgerMenu";
import axios from "axios";
export default {
  name: 'Game',
  components: {UserHamburgerMenu, Lobby, GameScene},
  data(){
    return {
      status: 0,
      socket: null,
      showHamburgerMenu: false,
      logged: false,
      username: null,
      settedUp: false
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

    const createLocalAccount = ()=>{
      axios
          .get(urls.createLocalAccountUrl)
          .then((response) => {
            this.logged = false;
            this.username = response.data.username;
            this.settedUp = true;
          })
          .catch(() => {
            location.href = location.origin+"/error?from="+location.pathname;
          });
    }
    axios.get(urls.getLoginInfoUrl)
        .then(response => {
          if(!response.data) createLocalAccount();
          else {
            this.logged = response.data.google_signed_in;
            this.username = response.data.username;
            this.settedUp = true;
          }
        })
        .catch(() => {
          location.href = location.origin+"/error?from="+location.pathname;
        });
  }
}
</script>

<style lang="scss" scoped>

</style>
