/*
 * WHALE IN SPACE | NASA SPACE APPS COVID-19 CHALLENGE
 * Copyright (c) 2020 by SilentByte <https://silentbyte.com/>
 */

import Vue from "vue";
import Vuetify from "vuetify/lib";

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        options: {
            customProperties: true,
        },
        themes: {
            light: {
                primary: "#546e7a",
                background: "#121212",
                secondary: "#424242",
                accent: "#f57c00",
                error: "#ff5252",
                info: "#2196f3",
                success: "#4caf50",
                warning: "#ffc107",
            },
        },
    },
});
