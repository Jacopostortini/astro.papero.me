<template>
  <transition name="transition">
    <div class="join-game-input" v-show="show">
      <input :placeholder="strings.homeView.joinGameInputPlaceholder">
    </div>
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
      strings
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


div{
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