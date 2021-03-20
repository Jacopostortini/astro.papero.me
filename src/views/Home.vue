<template>
  <div class="wrapper">
    <div class="home">
      <h1>{{strings.title}}</h1>
      <div>
        <button>{{strings.homeView.createButton}}</button>
        <button @click="showPopup=true">{{strings.homeView.joinButton}}</button>
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
      strings: strings,
      showPopup: false
    }
  }
}
</script>

<style lang="scss" scoped>

.wrapper{
  width: 100%;
  height: 100%;

  .home {
    display: flex;
    flex-flow: column;
    justify-content: space-between;
    height: 60%;

    div {
      display: flex;
      flex-flow: row;
      justify-content: space-evenly;
      align-items: center;
    }
  }
}
</style>
