<template>
  <transition name="transition">
    <form class="join-game-input" v-show="show" @submit.prevent="">
      <input :placeholder="strings.homeView.joinGameInputPlaceholder" v-model="gameId">
      <button @click="submitForm">Join</button>
    </form>
  </transition>
</template>

<script>
import {strings} from "../../constants/constants";

export default {
  name: "JoinGameInput",
  props: {
    show: Boolean
  },
  data(){
    return {
      strings,
      gameId: ""
    }
  },
  methods: {
    submitForm(){
      this.$router.push({name: "Game", params: {gameId: this.gameId}});
    }
  }
}
</script>

<style lang="scss" scoped>

.transition-enter-active, .transition-leave-active{
  transition: all 0.5s;
}

.transition-enter-from, .transition-leave-to{
  transform: scale(0);
}


form{
  position: fixed;
  top: 30%;
  left: 35%;
  $bkg-col: rgba(50, 50, 255, 0.5);
  background-color: $bkg-col;
  width: 30%;
  height: 40%;
  box-shadow: inset 0 -3em 3em $bkg-col,
              0 0  0 2px $bkg-col,
              0.3em 0.3em 1em $bkg-col;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  z-index: 3;

  input{
    background-color: transparent;
    font-size: 300%;
    max-width: 80%;
    margin-bottom: 10%;
    outline: none;
    border: none;
    text-align: center;
    color: white;
    font-weight: lighter;
    border-bottom: 2px solid white;
  }

}
</style>