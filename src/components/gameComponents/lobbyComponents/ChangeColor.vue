<template>
  <div class="change-color">
    <p>{{strings.gameView.lobby.changeColor}}</p>
    <div class="colors-wrapper">
      <img v-for="color in availableColors"
           :key="color"
           class="color-available"
           @click="changeColor(color)"
           :src="require('@/assets/ships/ship'+color+'.png')"/>
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
        return colors.keys();
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
      width: 40px;
      height: auto;
      margin: 20px;
      transform: rotate(-45deg);
    }
  }

}

</style>