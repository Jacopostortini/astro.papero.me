<template>
  <div class="set-total-turns">
    <p>{{strings.gameView.lobby.totalTurns}}</p>
    <span>{{game.totalTurns}}</span>
    <div>
      <div class="arrow up" @click="increaseTurns"/>
      <div class="arrow down" @click="decreaseTurns"/>
    </div>
  </div>
</template>

<script>
import {strings} from "../../../constants/constants";
import websocketEvents from "../../../constants/websocketEvents";

export default {
  name: "SetTotalTurns",
  props: {
    game: Object,
    socket: Object
  },
  data(){
    return {
      strings
    }
  },
  computed: {
    isAdmin: function (){
      return this.game.admin === this.game.currentPlayer;
    }
  },
  methods: {
    increaseTurns(){
      if(this.game.totalTurns<10 && this.isAdmin) this.socket.emit(websocketEvents.SET_TOTAL_TURNS, this.game.totalTurns+1);
    },
    decreaseTurns(){
      if(this.game.totalTurns>1 && this.isAdmin) this.socket.emit(websocketEvents.SET_TOTAL_TURNS, this.game.totalTurns-1);
    }
  }
}
</script>

<style lang="scss" scoped>

.set-total-turns{
  display: flex;
  justify-content: flex-start;
  align-items: center;

  p{
    color: white;
    font-size: 200%;
    margin-right: 20px;
  }

  span{
    width: 50px;
    height: 50px;
    background-color: transparent;
    border: 2px solid white;
    color: white;
    font-size: 250%;
    outline: none;
    text-align: center;
    user-select: none;
  }

  div{
    display: flex;
    flex-flow: column;
    justify-content: space-between;
    align-items: center;
    margin-left: 5%;
    height: 30%;

    .arrow{
      width: 10px;
      height: 10px;
      border-top: 2px solid white;
      border-left: 2px solid white;
      transition: all 0.5s;

      &.down{
        transform: rotate(-135deg);

        &:hover{
          transform: translateY(10px) rotate(-135deg) scale(1.5);
        }
      }

      &.up{
        transform: rotate(45deg);

        &:hover{
          transform: translateY(-10px) rotate(45deg) scale(1.5);
        }
      }
    }
  }

}

</style>