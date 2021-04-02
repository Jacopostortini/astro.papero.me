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
      try {
        let av = [];
        let used = [];
        this.players.forEach(player => {
          used.push(player.color);
        })
        for (let i = 0; i < colors.length; i++) {
          if (!used.includes(i)) av.push(i);
        }
        return av;
      } catch (e) {
        return colors;
      }
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
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-top: 20px;
  position: relative;

  p{
    font-size: 150%;
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