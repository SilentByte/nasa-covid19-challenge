<!--
    WHALE IN SPACE | NASA SPACE APPS COVID-19 CHALLENGE
    Copyright (c) 2020 by SilentByte <https://silentbyte.com/>
-->

<!--suppress JSUnusedGlobalSymbols -->
<template>
    <v-app>
        <v-content>
            <v-overlay color="background"
                       opacity="1"
                       :value="initializing">
                <v-layout column class="text-center">
                    <v-progress-circular indeterminate
                                         size="60" />
                </v-layout>
            </v-overlay>
            <div ref="two" class="screen"></div>
        </v-content>
    </v-app>
</template>

<script lang="ts">
    import {
        Component,
        Vue,
    } from "vue-property-decorator";

    import Two from "two.js";
    import * as utils from "@/utils";

    const PI = Math.PI;
    const TAU = Math.PI * 2.0;

    class Scene {
        two: Two & any;

        layerBackground!: Two.Group;
        layerForeground!: Two.Group;
        layerOverlay!: Two.Group;

        groupWhale!: Two.Group;

        spriteDebugOverlay: any;
        spriteBackground: any;
        spriteWhale: any;
        spriteWhaleXRay: any;

        loadSprite(url: string, x: number = 0, y: number = 0) {
            const capture: any = {
                texture: null,
            };

            return new Promise((resolve) => {
                capture.texture = new (Two as any).Texture(url, () => {
                    const sprite = this.two.makeSprite(capture.texture);

                    sprite.scale = 1.0;
                    sprite.width = capture.texture.width;
                    sprite.height = capture.texture.height;
                    sprite.translation.set(x, y);

                    resolve(sprite);
                });
            });
        }

        async initialize() {
            [
                this.spriteDebugOverlay,
                this.spriteBackground,
                this.spriteWhale,
                this.spriteWhaleXRay,
            ] = await Promise.all([
                this.loadSprite("./assets/debug-overlay.jpg"),
                this.loadSprite("./assets/background.jpg"),
                this.loadSprite("./assets/whale.png", 18, 30),
                this.loadSprite("./assets/whale-xray.png", 342, 232),
            ]);

            this.two.clear();

            this.layerBackground = this.two.makeGroup();
            this.layerForeground = this.two.makeGroup();
            this.layerOverlay = this.two.makeGroup();

            this.groupWhale = this.two.makeGroup();
            this.groupWhale.add(this.spriteWhale);

            this.layerBackground.add(this.spriteBackground);
            this.layerForeground.add(this.groupWhale);
            this.layerOverlay.add(this.spriteDebugOverlay);

            this.spriteDebugOverlay.opacity = 0.0;

            this.two
                .bind("update", (frame: number) => this.onUpdate(frame))
                .bind("resize", () => this.onResize())
                .trigger("resize");
        }

        start() {
            this.two.play();
        }

        onResize() {
            this.two.scene.scale = Math.min(this.two.width / 1920, this.two.height / 1080);
            this.two.scene.translation.set(this.two.width / 2, this.two.height / 2);
        }

        onUpdate(frame: number) {
            this.groupWhale.translation.y = Math.cos(frame * 0.02) * 5;
            this.groupWhale.rotation = Math.sin(frame * 0.02) * 0.025;
        }

        constructor(element: HTMLElement) {
            this.two = new Two({
                autostart: false,
                fullscreen: true,
                type: Two.Types.webgl,
            });

            this.two.appendTo(element);
        }

        destroy() {
            this.two.clear();
        }
    }

    @Component
    export default class App extends Vue {
        scene!: Scene;
        initializing = true;

        mounted() {
            this.$nextTick(async () => {
                this.scene = new Scene(this.$refs.two as HTMLElement);

                await this.scene.initialize();
                await utils.timeout(1000);

                this.initializing = false;
                this.scene.start();
            });
        }

        beforeDestroy() {
            this.scene.destroy();
        }
    }
</script>

<style lang="scss">
    html {
        overflow-y: hidden !important;
    }

    .screen {
        width: 100%;
        height: 100%;
        background-color: #121212;
    }
</style>
