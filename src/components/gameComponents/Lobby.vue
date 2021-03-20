<template>
  <div class="lobby">
    <h1>{{gameId}}</h1>
    <div class="settings" v-if="game.currentPlayer!==null">
      <ChangeColor :socket="socket" :players="game.players"/>
      <div class="admin-reserved">
        <span>{{strings.gameView.lobby.adminSettings}}</span>
        <SetTotalTurns :game="game"
                       :socket="socket"/>
        <button :disabled="!isAdmin">{{strings.gameView.lobby.startGame}}</button>
        <div class="not-admin" v-if="!isAdmin"/>
      </div>
    </div>
    <button class="join-button" v-else>{{strings.gameView.lobby.joinLobby}}</button>
    <div id="players-wrapper"/>
  </div>
</template>

<script>
import * as Phaser from "phaser";
import {config, strings} from "../../constants/constants";
import LobbyScene from "../../scenes/LobbyScene";
import ChangeColor from "./lobbyComponents/ChangeColor";
import SetTotalTurns from "./lobbyComponents/SetTotalTurns";
//import websocketEvents from "../../constants/websocketEvents";
export default {
  name: "Lobby",
  components: {SetTotalTurns, ChangeColor},
  props: {
    socket: Object
  },
  data(){
    return{
      strings,
      game: {
        players: [0,1],
        admin: 0,
        currentPlayer: 1,
        totalTurns: 5
      }
    }
  },
  mounted() {
    let parent = document.getElementById("players-wrapper");
    new Phaser.Game(
        config(
            new LobbyScene(this.socket, this.game.players, this.game.currentPlayer),
            parent,
            parent.offsetWidth,
            parent.offsetHeight
        ));

/*    this.socket.on(websocketEvents.LOBBY_MODIFIED, (game)=>{
      this.game = game;
    });*/
  },
  computed: {
    gameId: function () {
      return this.$route.params.gameId;
    },
    isAdmin: function (){
      return this.game.admin === this.game.currentPlayer;
    }
  }

}
</script>

<style lang="scss" scoped>

.lobby{
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-rows: 20% 70%;
  grid-template-columns: 30% 40% 30%;
  grid-template-areas: "title title title" "settings phaser infos";
  justify-items: center;

  h1{
    grid-area: title;
  }

  .settings{
    grid-area: settings;
    display: flex;
    flex-flow: column;

    .admin-reserved{
      position: relative;
      margin-top: 20%;
      border: 1px solid white;
      padding: 2% 2% 5% 2%;

      span{
        position: absolute;
        top: -40px;
        left: 0;
        color: white;
        font-size: 200%;
      }

      .not-admin{
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background-color: rgba(0,0,0,0.4);
      }
    }
  }

  .join-button{
    grid-area: settings;
    height: fit-content;
    align-self: center;
  }

  #players-wrapper{
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: row;
    justify-content: center;
    align-items: center;
    grid-area: phaser;
  }
}

</style>