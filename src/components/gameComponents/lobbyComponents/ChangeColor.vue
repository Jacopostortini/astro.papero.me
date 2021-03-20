<template>
  <div class="change-color">
    <p>{{strings.gameView.lobby.changeColor}}</p>
    <div class="colors-wrapper">
      <div v-for="color in availableColors"
           :key="color"
           class="color-available"
           @click="changeColor(color)"
           :style="{backgroundColor: colors[color]}"/>
    </div>
  </div>
</template>

<script>
import {strings, colors} from "../../../constants/constants";
import websocketEvents from "../../../constants/websocketEvents";

export default {
  name: "ChangeColor",
  props: {
    socket: Object,
    players: Array
  },
  data(){
    return {
      strings,
      colors,
    }
  },
  computed: {
    availableColors: function(){
      let av = [];
      for(let i = 0; i < colors.length; i++){
        if (!this.players.includes(i)) av.push(i);
      }
      return av;
    }
  },
  methods: {
    changeColor(color){
      this.socket.emit(websocketEvents.CHANGE_COLOR, color);
    }
  }
}
</script>

<style lang="scss" scoped>

.change-color{
  display: flex;
  flex-flow: row;
  justify-content: flex-start;
  align-items: center;
  width: 100%;
  position: relative;

  p{
    font-size: 200%;
    color: white;
  }

  .colors-wrapper{
    display: flex;
    flex-wrap: wrap;

    .color-available{
      border-radius: 10px;
      width: 40px;
      height: 40px;
      margin: 20px;
    }
  }

}

</style>