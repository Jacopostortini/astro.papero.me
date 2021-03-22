<template>
  <div class="wrapper">
    <UserHamburgerMenu :show="showHamburgerMenu"
                       :src="require('@/assets/hamburger_icon_dark.png')"
                       :auto-login="false"
                       @toggle-show="showHamburgerMenu=$event"/>
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
import UserHamburgerMenu from "../components/UserHamburgerMenu";

export default {
  name: 'Game',
  components: {JoinGameInput, UserHamburgerMenu},
  data() {
    return {
      strings: strings,
      showPopup: false,
      showHamburgerMenu: false
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
