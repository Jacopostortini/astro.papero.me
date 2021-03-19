<template>
  <div class="wrapper">
    <div class="home">
      <h1>{{strings.title}}</h1>
      <div>
        <button>{{strings.createButton}}</button>
        <button @click="showPopup=true">{{strings.joinButton}}</button>
      </div>
    </div>
    <div class="popup-background" v-if="showPopup" @click="showPopup=false"/>
    <JoinGameInput :show="showPopup"/>
  </div>
</template>

<script>
import {strings} from "../constants/constants";
import JoinGameInput from "../components/homeComponents/JoinGameInput";

export default {
  name: 'Game',
  components: {JoinGameInput},
  data() {
    return {
      strings: strings.homeView,
      showPopup: false
    }
  }
}
</script>

<style lang="scss" scoped>

.wrapper{
  width: 100%;
  height: 100%;
  background-image: url("https://labs.phaser.io/assets/skies/nebula.jpg");
  background-size: cover;
  background-position: center;

  .home {
    display: flex;
    flex-flow: column;
    justify-content: space-between;
    height: 60%;

    h1 {
      margin-top: 2%;
      font-size: 500%;
    }

    div {
      display: flex;
      flex-flow: row;
      justify-content: space-evenly;
      align-items: center;

      button{

      }
    }
  }
}
</style>
