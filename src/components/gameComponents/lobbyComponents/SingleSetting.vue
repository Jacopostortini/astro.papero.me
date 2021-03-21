<template>
  <div class="setter">
    <p>{{label}}</p>
    <div>
      <span>{{value}}</span>
      <div>
        <div class="arrow up" @click="increase"/>
        <div class="arrow down" @click="decrease"/>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SingleSetting",
  props: {
    min: Number,
    max: Number,
    game: Object,
    settingKey: String,
    event: String,
    socket: Object,
    label: String
  },
  computed: {
    value: function(){
      return this.game.settings[this.settingKey];
    }
  },
  methods: {
    increase(){
      if(this.value<this.max) this.socket.emit(this.event, this.value+1);
    },
    decrease(){
      if(this.value>this.min) this.socket.emit(this.event, this.value-1);
    }
  }
}
</script>

<style lang="scss" scoped>

.setter{
  display: flex;
  justify-content: space-between;
  align-items: center;

  p{
    color: white;
    font-size: 150%;
    margin-right: 20px;
  }

  div{
    display: flex;
    justify-content: space-evenly;
    align-items: center;

    span{
      width: 50px;
      height: 50px;
      background-color: transparent;
      border: 2px solid white;
      color: white;
      font-size: 250%;
      outline: none;
      text-align: center;
      user-select: none;
      margin: 10px;
    }

    div{
      display: flex;
      flex-flow: column;
      justify-content: space-between;
      align-items: center;
      margin-left: 5%;
      height: 30%;

      .arrow{
        width: 10px;
        height: 10px;
        border-top: 2px solid white;
        border-left: 2px solid white;
        transition: all 0.5s;

        &.down{
          transform: rotate(-135deg);

          &:hover{
            transform: translateY(10px) rotate(-135deg) scale(1.5);
          }
        }

        &.up{
          transform: rotate(45deg);

          &:hover{
            transform: translateY(-10px) rotate(45deg) scale(1.5);
          }
        }
      }
    }
  }

}

</style>