<template>
  <div class="wrapper">
    <UserHamburgerMenu :show="showHamburgerMenu"
                       :src="require('@/assets/hamburger_icon_dark.png')"
                       @toggle-show="showHamburgerMenu=$event"/>
    <div class="home">
      <h1>{{strings.title}}</h1>
      <form @submit.prevent="play">
        <input :placeholder="strings.homeView.joinGameInputPlaceholder" v-model="input" required>
        <button>{{ strings.homeView.play }}</button>
      </form>
    </div>
    <div class="popup-background" v-if="showPopup" @click="showPopup=false">
      <div>
        <p>{{popupMessage}}</p>
        <div>
          <button @click="confirm">{{ strings.homeView.confirmButton }}</button>
          <button @click="showPopup=false">{{ strings.homeView.cancelButton }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {strings, urls} from "../constants/constants";
import UserHamburgerMenu from "../components/UserHamburgerMenu";
import axios from "axios";
import store from "../store";


export default {
  name: 'Game',
  components: {UserHamburgerMenu},
  data() {
    return {
      strings: strings,
      showHamburgerMenu: false,
      showPopup: false,
      popupMessage: "",
      input: ""
    }
  },
  methods: {
    play(){
      //TODO: Logic for checking existence
      this.popupMessage = "Do you want to join the game with ID "+this.input;
      this.showPopup = true
    },
    confirm(){
      this.$router.push({name: "Game", params: {gameId: this.input}})
    }
  },
  beforeRouteEnter(to, from, next){
    if (store.state.logged === -1 || store.state.username === "") {
      axios.get(urls.getLoginInfoUrl)
          .then(response => {
            if (response.data) {
              store.dispatch("setLogged", response.data.google_signed_in);
              store.dispatch("setUsername", response.data.username);
              next();
            } else {
              store.dispatch("setLogged", false);
              store.dispatch("setUsername", null);
              next();
            }
          })
          .catch(() => {
            location.href = location.origin + "/error?from=" + location.pathname;
          });
    } else next();
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
    justify-content: flex-start;
    height: 100%;

    form {
      display: flex;
      flex-flow: column;
      justify-content: space-evenly;
      align-items: center;
      height: 100%;

      input{
        background: none;
        outline: none;
        border: none;
        border-bottom: 2px solid white;
        font-size: 250%;
        text-align: center;
        width: 20%;
        color: white;
      }
    }
  }

  .popup-background{

    div{
      display: flex;
      flex-flow: column;
      color: white;
      font-size: 150%;

      div{
        display: flex;
        flex-flow: row;
        justify-content: space-evenly;
        align-items: center;

        button{
          font-size: 100%;
        }
      }
    }
  }
}
</style>
