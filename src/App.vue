<template>
  <router-view/>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
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
  font-size: 500%;
  margin: 2% 0 0 0;
  color: white;
}

button{
  font-size: 300%;
  padding: 2%;
  border-radius: 10px;
  outline: none;
  color: white;
  background: none;
  border: 2px solid white;
  transition: all 0.5s;

  &:hover{
    background-color: white;
    color: black;
  }
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
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-image: url("./assets/nebula.jpg");
  background-size: cover;
  background-position: center;
}

::-webkit-scrollbar {
  width: 0;
}
</style>
