<template>
  <div class="lobby">
    <h1>{{gameId}}</h1>

    <GameSettings  v-if="game.currentPlayer!==null"
                   :game="game"
                   :socket="socket"/>

    <button class="join-button" v-else @click="joinGame">{{strings.gameView.lobby.joinLobby}}</button>

    <div id="players-wrapper"/>

    <div class="infos">
      <ChangeColor :socket="socket" :players="game.players"/>
      <CopyInformation :msg="strings.gameView.lobby.shareTheLink" :info="link"/>
      <CopyInformation :msg="strings.gameView.lobby.copyTag" :info="gameId"/>
    </div>
  </div>
</template>

<script>
//import * as Phaser from "phaser";
import {/*config,*/ strings} from "../../constants/constants";
//import LobbyScene from "../../scenes/LobbyScene";
import ChangeColor from "./lobbyComponents/ChangeColor";
import CopyInformation from "./lobbyComponents/CopyInformation";
import websocketEvents from "../../constants/websocketEvents";
import GameSettings from "./lobbyComponents/GameSettings";
export default {
  name: "Lobby",
  components: {GameSettings, CopyInformation, ChangeColor},
  props: {
    socket: Object
  },
  data(){
    return {
      strings,
      websocketEvents,
      game: {
        players: [
          {
            localId: 0,
            color: 0
          },
          {
            localId: 1,
            color: 1
          }
        ],
        admin: 0,
        currentPlayer: 1,
        settings: {
          totalTurns: 5,
          velocity: 2,
          angularVelocity: 2,
          reloadingVelocity: 2
        }
      }
      /*game: {
        settings: {}
      }*/
    }
  },
  mounted() {
    /*let parent = document.getElementById("players-wrapper");
    new Phaser.Game(
        config(
            new LobbyScene(this.game.players, this.game.currentPlayer),
            parent,
            Math.min(parent.offsetWidth, parent.offsetHeight),
            Math.min(parent.offsetWidth, parent.offsetHeight)
        ));*/
    this.socket.on(websocketEvents.LOBBY_MODIFIED, (game)=>{
      console.log(game);
      this.game = game;
      this.emitter.emit(websocketEvents.LOBBY_MODIFIED, game);
    });
  },
  computed: {
    gameId: function () {
      return this.$route.params.gameId;
    },
    isAdmin: function (){
      return this.game.admin === this.game.currentPlayer;
    },
    link: function(){
      return window.location.href;
    }
  },
  methods: {
    joinGame(){
      this.socket.emit(websocketEvents.JOIN_GAME);
    }
  }

}
</script>

<style lang="scss" scoped>

.lobby{
  width: 100%;
  height: 100%;
  display: grid;
  justify-items: center;
  @media (min-width: 751px) {
    grid-template-rows: 20% 80%;
    grid-template-columns: 30% 40% 30%;
    grid-template-areas: "title title title" "settings phaser infos";
  }
  @media (max-width: 751px) {
    grid-template-rows: auto 300px auto auto;
    grid-template-columns: 1fr;
    grid-template-areas: "title" "phaser" "infos" "settings";
    overflow: scroll;
  }

  h1{
    grid-area: title;
  }

  .join-button{
    grid-area: settings;
    height: fit-content;
    align-self: center;
  }

  #players-wrapper{
    width: 80%;
    height: 80%;
    display: flex;
    flex-flow: row;
    grid-area: phaser;
    margin-top: 20px;
    justify-content: center;
    align-items: center;
  }

  .infos{
    grid-area: infos;
    width: 100%;
    height: 80%;
    display: flex;
    flex-flow: column;
    justify-content: space-evenly;
  }
}

</style>