import { createApp } from 'vue'
import App from './App.vue'
import router from "./router";
import store from "./store";
import Clipboard from "v-clipboard3";

createApp(App)
    .use(router)
    .use(store)
    .use(Clipboard)
    .mount('#app');
