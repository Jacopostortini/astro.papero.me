<template>
  <div class="copy-information">
    <button @click="startAnimation" v-clipboard="info">{{msg}}</button>
    <transition name="info">
      <span class="copied" v-if="showInfo">{{info}}</span>
    </transition>
  </div>
</template>

<script>
export default {
  name: "CopyInformation",
  props: {
    msg: String,
    info: String
  },
  data(){
    return {
      duration: 1,
      showInfo: false
    }
  },
  methods: {
    startAnimation(){
      setTimeout(()=>{this.showInfo=false}, this.duration*1000);
      this.showInfo = true;
    }
  }
}
</script>

<style lang="scss" scoped>

.copy-information{
  color: white;
  width: 80%;
  font-size: 50%;
  position: relative;
  text-align: center;

  .copied{
    position: absolute;
    font-size: 180%;
    left: 50%;
    transform: translateX(-50%) scale(1.5) translateY(-20px);
  }

  .info-enter-active, .info-leave-active{
    transition: all 0.5s;
  }
  .info-enter-from{
    transform: translateX(-50%) scale(1) translateY(0);
  }
  .info-leave-to{
    transform: translateX(-50%) scale(1.5) translateY(-20px) rotateX(90deg);
  }

}
</style>