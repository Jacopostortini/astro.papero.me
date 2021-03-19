<template>
  <router-view/>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
html{
  width: 100%;
  height: 100%;
}

body{
  margin: 0;
  width: 100%;
  height: 100%;
}

h1{
  margin: 0;
  color: white;
}

button{
  font-family: serif;
  font-size: 300%;
  padding: 2%;
  border-radius: 10px;
  outline: none;
  border-width: 1px;
  font-weight: bolder;
  color: white;
  background-image: url("https://labs.phaser.io/assets/skies/space3.png");
  background-size: 200px;
  background-position: bottom center;
}

.popup-background{
  z-index: 2;
  background-color: rgba(0,0,0,0.7);
  position: fixed;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
}

#app {
  width: 100%;
  height: 100%;
  font-family: serif, Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
