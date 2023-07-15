import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import SvgIcon from "@jamescoyle/vue-icon";

const app = createApp(App);

app.use(createPinia());

app.component("SvgIcon", SvgIcon);

app.mount("#app");
