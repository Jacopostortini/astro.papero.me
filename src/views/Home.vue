<template>
  <div class="wrapper">
    <UserHamburgerMenu :show="showHamburgerMenu"
                       :src="require('@/assets/hamburger_icon_dark.png')"
                       @toggle-show="showHamburgerMenu=$event"/>
    <div class="home">
      <img src="../assets/title.png">


      <div class="buttons-container" v-if="choice===null">
        <button @click="choice='join'">{{strings.homeView.joinGameButton}}</button>
        <button @click="choice='create'">{{strings.homeView.createGameButton}}</button>
      </div>


      <form @submit.prevent="play" v-if="choice!==null">
        <span @click="choice=null">&#8617;</span>
        <input :placeholder="strings.homeView.joinGameInputPlaceholder" v-model="input" required>
        <button>{{ strings.homeView.play }}</button>
      </form>


    </div>


    <div class="popup-background" v-if="showPopup" @click="showPopup=false">
      <div>
        <p>{{popupMessage}}</p>
        <div>
          <button @click="confirm">{{ confirmButton }}</button>
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
      input: "",
      choice: null,
      confirmButton: ""
    }
  },
  methods: {
    play(){
      axios
          .get(urls.getGameStatusUrl, {params: {gameId: this.input.toLowerCase()}})
          .then(response => {
            if(response.data){
              if(this.choice==="join"){
                this.$router.push({name: "Game", params: {gameId: this.input}});
              } else if (this.choice==="create"){
                this.popupMessage = strings.homeView.gameAlreadyExists;
                this.confirmButton = strings.homeView.joinGameButton;
                this.showPopup = true;
              }
            } else {
              if(this.choice==="join"){
                this.popupMessage = strings.homeView.gameDoesNotExists;
                this.confirmButton = strings.homeView.createGameButton;
                this.showPopup = true;
              } else if(this.choice==="create"){
                this.$router.push({name: "Game", params: {gameId: this.input}});
              }
            }
          });
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
    justify-content: space-between;
    height: 100%;
    align-items: center;

    img{
      margin-top: 10px;
      width: 50%;
    }




    .buttons-container{
      display: flex;
      flex-flow: row;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      height: 100%;
      width: 100%;

      button{
        margin: 10px;
      }
    }

    form {
      position: relative;
      display: flex;
      flex-flow: column;
      justify-content: space-evenly;
      align-items: center;
      height: 70%;
      width: 50%;
      @media (max-width: 750px){
        width: 80%;
      }

      span{
        position: absolute;
        font-size: 300%;
        top: 10%;
        left: 10%;
        color: white;
        transition: all 0.5s;
        cursor: pointer;

        &:hover{
          transform: scale(1.3);
        }
      }

      input{
        background: none;
        outline: none;
        border: none;
        border-bottom: 2px solid white;
        font-size: 250%;
        text-align: center;
        color: white;
        width: 50%;
        @media (max-width: 750px){
          width: 80%;
        }
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
