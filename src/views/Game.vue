<template>
  <UserHamburgerMenu :show="showHamburgerMenu"
                     :src="require('@/assets/hamburger_icon_dark.png')"
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
import axios from "axios";
import store from "../store";
export default {
  name: 'Game',
  components: {UserHamburgerMenu, Lobby, GameScene},
  data(){
    return {
      status: 0,
      socket: null,
      showHamburgerMenu: false
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
  beforeRouteEnter(to, from, next) {
    const createLocalAccount = () => {
      axios
          .get(urls.createLocalAccountUrl)
          .then((response) => {
            store.dispatch("setLogged", false);
            store.dispatch("setUsername", response.data.username);
            next();
          })
          .catch(() => {
            location.href = location.origin + "/error?from=" + location.pathname;
          });
    }
    if (store.state.logged === -1 || store.state.username === "") {
      axios.get(urls.getLoginInfoUrl)
          .then(response => {
            if (!response.data) createLocalAccount();
            else {
              store.dispatch("setLogged", response.data.google_signed_in);
              store.dispatch("setUsername", response.data.username);
              next();
            }
          })
          .catch(() => {
            location.href = location.origin + "/error?from=" + location.pathname;
          });
    } else if(store.state.username === null && store.state.logged === false){
      createLocalAccount();
    } else next();
  }
}
</script>

<style lang="scss" scoped>

</style>
