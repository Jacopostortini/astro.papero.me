<template>
  <div class="wrapper">
    <UserHamburgerMenu :show="showHamburgerMenu"
                       :src="require('@/assets/hamburger_icon_dark.png')"
                       :logged="logged"
                       :username="username"
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
import {strings, urls} from "../constants/constants";
import JoinGameInput from "../components/homeComponents/JoinGameInput";
import UserHamburgerMenu from "../components/UserHamburgerMenu";
import axios from "axios";

export default {
  name: 'Game',
  components: {JoinGameInput, UserHamburgerMenu},
  data() {
    return {
      strings: strings,
      showPopup: false,
      showHamburgerMenu: false,
      logged: false,
      username: null
    }
  },
  mounted() {
    axios.get(urls.getLoginInfoUrl)
        .then(response => {
          if(response.data) {
            this.logged = response.data.google_signed_in;
            this.username = response.data.username;
          }
        })
        .catch(() => {
          location.href = location.origin+"/error?from="+location.pathname;
        });
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
