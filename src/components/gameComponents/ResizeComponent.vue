<template>
  <div class="resize__main-panel">
    <div v-if="!bigEnough && !ready">
      <p>
        {{strings.gameView.resize.firstDisclaimer}}
        <br>
        <strong>{{ gameDimensions.width }}px by {{ gameDimensions.height }}px</strong>
      </p>
      <p>
        {{strings.gameView.resize.currentDimension}}
        <br>
        <strong>{{ width }}px by {{ height }}px</strong>
      </p>
    </div>
    <div v-else-if="!bigEnough && ready">
      <p>
        <strong style="color: red">Warning!</strong>
        <br>
        {{strings.gameView.resize.secondDisclaimer}}
      </p>
    </div>
    <div v-else-if="bigEnough">
      <p>{{strings.gameView.resize.playerReady}}{{points}}</p>
    </div>
  </div>
</template>

<script>
import {gameDimensions} from "../../constants/gameSettings";
import websocketEvents from "../../constants/websocketEvents";
import {strings} from "../../constants/constants";

export default {
  name: "ResizeComponent",
  props: {
    socket: Object
  },
  data(){
    return {
      gameDimensions: gameDimensions,
      strings: strings,
      ready: false,
      bigEnough: false,
      width: 0,
      height: 0,
      points: ""
    }
  },
  methods: {
    checkDimensions(){
        this.bigEnough = this.width>=gameDimensions.width && this.height>=gameDimensions.height;
    }
  },
  mounted() {
    setInterval(()=>{
      if(this.points.length >= 3) {
        this.points = "";
      } else {
        this.points += ".";
      }
    }, 1000)
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.checkDimensions();
    if(this.bigEnough) {
      this.socket.emit(websocketEvents.READY_UP);
      this.ready = true;
    }
    window.addEventListener("resize", () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.checkDimensions();
      if(this.bigEnough){
        if(!this.ready){
          this.socket.emit(websocketEvents.READY_UP);
          this.ready = true;
        }
      }
    });
  }
}
</script>

<style lang="scss" scoped>

.resize__main-panel{
  width: 100%;
  height: 100%;

  div{
    height: 100%;
    display: flex;
    flex-flow: column;
    align-items: center;
    justify-content: space-evenly;
    padding: 0 5% 0 5%;

    p{
      margin: 0;
      color: white;
      font-size: 150%;
    }
  }
}
</style>