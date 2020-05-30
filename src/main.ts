/*
 * WHALE IN SPACE | NASA SPACE APPS COVID-19 CHALLENGE
 * Copyright (c) 2020 by SilentByte <https://silentbyte.com/>
 */

import Vue from "vue";
import App from "@/App.vue";
import vuetify from "@/plugins/vuetify";

Vue.config.productionTip = false;

new Vue({
    vuetify,
    render: h => h(App),
}).$mount("#app");
