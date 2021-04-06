<template>
  <div class="resize__main-panel">
    <div v-if="!ready">
      <p>{{strings.gameView.resize.disclaimer}}</p>
      <button @click="readyUp">{{strings.gameView.resize.readyUpButton}}</button>
    </div>
    <div v-else-if="ready">
      <p>{{strings.gameView.resize.playerReady}}{{points}}</p>
    </div>
  </div>
</template>

<script>
import websocketEvents from "../../constants/websocketEvents";
import {strings} from "../../constants/constants";

export default {
  name: "ResizeComponent",
  props: {
    socket: Object
  },
  data(){
    return {
      strings: strings,
      ready: false,
      width: 0,
      height: 0,
      points: ""
    }
  },
  computed: {
    checkDimensions: function() {
      return this.width > this.height;
    }
  },
  methods: {
    readyUp(){
      this.socket.emit(websocketEvents.READY_UP);
      this.ready = true;
    }
  },
  mounted() {

    setInterval(()=>{
      if(this.points.length >= 3) {
        this.points = "";
      } else {
        this.points += ".";
      }
    }, 1000);

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    if(this.checkDimensions) this.readyUp();

    window.addEventListener("resize", () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      if(this.checkDimensions) this.readyUp();
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

    button{
      font-size: 150%;
    }
  }
}
</style>