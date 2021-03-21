import { createApp } from 'vue'
import App from './App.vue'
import router from "./router";
import Clipboard from "v-clipboard3";

createApp(App)
    .use(router)
    .use(Clipboard)
    .mount('#app');
