<template>
  <div class="settings">
    <div class="admin-reserved">
      <span>{{strings.gameView.lobby.adminSettings}}</span>
      <SingleSetting :game="game"
                     :socket="socket"
                     :min="1"
                     :max="10"
                     :label="strings.gameView.lobby.totalTurns"
                     setting-key="totalTurns"
                     :event="websocketEvents.SET_TOTAL_TURNS"/>
      <SingleSetting :game="game"
                     :socket="socket"
                     :min="1"
                     :max="4"
                     :label="strings.gameView.lobby.velocity"
                     setting-key="velocity"
                     :event="websocketEvents.SET_VELOCITY"/>
      <SingleSetting :game="game"
                     :socket="socket"
                     :min="1"
                     :max="4"
                     :label="strings.gameView.lobby.angularVelocity"
                     setting-key="angularVelocity"
                     :event="websocketEvents.SET_ANGULAR_VELOCITY"/>
      <SingleSetting :game="game"
                     :socket="socket"
                     :min="1"
                     :max="4"
                     :label="strings.gameView.lobby.reloadingVelocity"
                     setting-key="reloadingVelocity"
                     :event="websocketEvents.SET_RELOADING_VELOCITY"/>
      <SingleSetting :game="game"
                     :socket="socket"
                     :min="1"
                     :max="4"
                     :label="strings.gameView.lobby.bulletVelocity"
                     setting-key="bulletVelocity"
                     :event="websocketEvents.SET_BULLET_VELOCITY"/>
      <button :disabled="!isAdmin" @click="startGame">{{strings.gameView.lobby.startGame}}</button>
      <div class="not-admin" v-if="!isAdmin"/>
    </div>
  </div>
</template>

<script>
import {strings} from "../../../constants/constants";
import websocketEvents from "../../../constants/websocketEvents";
import SingleSetting from "./SingleSetting";

export default {
  name: "GameSettings",
  components: { SingleSetting },
  props: {
    game: Object,
    socket: Object
  },
  data(){
    return {
      strings,
      websocketEvents
    }
  },
  computed: {
    isAdmin: function(){
      return this.game.currentPlayer === this.game.admin;
    }
  },
  methods: {
    startGame(){
      this.socket.emit(websocketEvents.START_GAME);
    }
  }
}
</script>

<style lang="scss" scoped>


.settings{
  grid-area: settings;
  display: flex;
  flex-flow: column;
  min-width: 90%;
  height: 95%;
  @media (max-width: 751px) {
    height: 500px;
  }
  overflow-y: scroll;
  margin-left: 10px;
  margin-top: -40px;

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
      font-size: 150%;
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

</style>