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

    // const PI = Math.PI;
    // const TAU = Math.PI * 2.0;

    class Scene {
        two: Two & any;

        layerBackground!: Two.Group;
        layerOverlay!: Two.Group;

        groupWhale!: Two.Group;
        groupWhaleXRay!: Two.Group;

        spriteDebugOverlay: any;
        spriteBackground: any;
        spriteWhale: any;
        spriteWhaleXRay: any;
        spritePlanetTop: any;
        spritePlanetLeft: any;
        spritePlanetRight: any;
        spritePlanetBottom: any;
        spriteTriangleBack: any;
        spriteTriangleBottom: any;
        spriteTriangleFront: any;

        maskTriangle: any;

        loadSprite(url: string, x: number = 0, y: number = 0) {
            const capture: any = {
                texture: null,
            };

            return new Promise((resolve, reject) => {
                capture.texture = new (Two as any).Texture(url, () => {
                    try {
                        const sprite = this.two.makeSprite(capture.texture);

                        sprite.scale = 1.0;
                        sprite.width = capture.texture.width;
                        sprite.height = capture.texture.height;
                        sprite.translation.set(x, y);

                        resolve(sprite);
                    } catch(e) {
                        reject(e);
                    }
                });
            });
        }

        async initialize() {
            [
                this.spriteDebugOverlay,
                this.spriteBackground,
                this.spritePlanetTop,
                this.spritePlanetLeft,
                this.spritePlanetRight,
                this.spritePlanetBottom,
                this.spriteWhale,
                this.spriteWhaleXRay,
                this.spriteTriangleBack,
                this.spriteTriangleBottom,
                this.spriteTriangleFront,
            ] = await Promise.all([
                this.loadSprite("./assets/debug-overlay.jpg"),
                this.loadSprite("./assets/background.jpg"),
                this.loadSprite("./assets/planet-top.png", 508, -320),
                this.loadSprite("./assets/planet-left.png", 387, -87),
                this.loadSprite("./assets/planet-right.png", 648, -68),
                this.loadSprite("./assets/planet-bottom.png", 542, 195),
                this.loadSprite("./assets/whale.png", 18, 30),
                this.loadSprite("./assets/whale-xray.png", 18, 30),
                this.loadSprite("./assets/triangle-back.png", -20, -32), // -170, -32
                this.loadSprite("./assets/triangle-bottom.png", -63, 275), // -33, 275
                this.loadSprite("./assets/triangle-front.png", 40, 5), // 70, 5
            ]);

            this.two.clear();

            this.layerBackground = this.two.makeGroup();
            this.layerOverlay = this.two.makeGroup();

            this.groupWhale = this.two.makeGroup();
            this.groupWhaleXRay = this.two.makeGroup(this.spriteWhaleXRay);
            this.groupWhale.add(
                this.spriteWhale,
                this.groupWhaleXRay,
            );

            this.layerBackground.add(
                this.spriteBackground,
                this.spritePlanetTop,
                this.spritePlanetLeft,
                this.spritePlanetRight,
                this.spritePlanetBottom,

                this.spriteTriangleBack,
                this.spriteTriangleBottom,
                this.groupWhale,
                this.spriteTriangleFront,
            );

            this.layerOverlay.add(this.spriteDebugOverlay);

            this.spriteDebugOverlay.opacity = 0.0;

            this.maskTriangle = this.two.makePath(420, -300, 210, 230, 680, 310);
            this.maskTriangle.fill = "#000";

            this.groupWhaleXRay.mask = this.maskTriangle;

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
            const whaleTriangleTranslationX = Math.sin(frame * 0.001) * 0.05;
            const whaleTriangleTranslationY = Math.cos(frame * 0.01) * 0.10;
            const whaleTriangleRotation = Math.sin(frame * 0.02) * 0.025;

            this.groupWhale.translation.x += whaleTriangleTranslationX;
            this.groupWhale.translation.y += whaleTriangleTranslationY;
            this.groupWhale.rotation = whaleTriangleRotation;

            // this.spriteTriangleBack.translation.x += whaleTriangleTranslationX;
            this.spriteTriangleBack.translation.y += whaleTriangleTranslationY;
            // this.spriteTriangleBack.rotation = whaleTriangleRotation;

            // this.spriteTriangleBottom.translation.x += whaleTriangleTranslationX;
            this.spriteTriangleBottom.translation.y += whaleTriangleTranslationY;
            // this.spriteTriangleBottom.rotation = whaleTriangleRotation;

            // this.spriteTriangleFront.translation.x += whaleTriangleTranslationX;
            this.spriteTriangleFront.translation.y += whaleTriangleTranslationY;
            // this.spriteTriangleFront.rotation = whaleTriangleRotation;

            this.spriteTriangleBack.translation.x = 40 + this.groupWhale.translation.x - 90 + Math.cos(frame * 0.01) * 140;
            this.spriteTriangleBottom.translation.x = 40 + this.groupWhale.translation.x + 50 + Math.cos(frame * 0.01) * 140;
            this.spriteTriangleFront.translation.x = 40 + this.groupWhale.translation.x + 150 + Math.cos(frame * 0.01) * 140;

            this.maskTriangle.translation.set(0, 0);
            this.maskTriangle.vertices[0].set(this.spriteTriangleFront.translation.x - 122, this.spriteTriangleFront.translation.y - 300);
            this.maskTriangle.vertices[1].set(this.spriteTriangleFront.translation.x - 330, this.spriteTriangleFront.translation.y + 218);
            this.maskTriangle.vertices[2].set(this.spriteTriangleFront.translation.x + 150, this.spriteTriangleFront.translation.y + 295);

            this.spritePlanetTop.translation.x += Math.cos(frame * 0.01 + 200) * 0.02;
            this.spritePlanetTop.translation.y += Math.sin(frame * 0.01 + 200) * 0.05;
            this.spritePlanetTop.rotation = Math.sin(frame * 0.02 + 200) * 0.1;

            this.spritePlanetLeft.translation.x += Math.cos(frame * 0.01 + 400) * 0.02;
            this.spritePlanetLeft.translation.y += Math.sin(frame * 0.01 + 400) * 0.05;
            this.spritePlanetLeft.rotation = Math.sin(frame * 0.01 + 400) * 0.5;

            this.spritePlanetRight.translation.x += Math.cos(frame * 0.01 + 600) * 0.02;
            this.spritePlanetRight.translation.y += Math.sin(frame * 0.01 + 600) * 0.03;
            this.spritePlanetRight.rotation = Math.sin(frame * 0.01 + 600) * 0.05;

            this.spritePlanetBottom.translation.x += Math.cos(frame * 0.01 + 800) * 0.02;
            this.spritePlanetBottom.translation.y += Math.sin(frame * 0.01 + 800) * 0.05;
            this.spritePlanetBottom.rotation += 0.002;
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

        async initialize() {
            this.scene = new Scene(this.$refs.two as HTMLElement);

            await this.scene.initialize();
            await utils.timeout(1000);

            this.initializing = false;
            this.scene.start();
        }

        mounted() {
            this.$nextTick(async () => {
                try {
                    await this.initialize();
                } catch(e) {
                    // HACK: Simplify debugging due to insufficient error handling in Two.js.
                    console.error(e);
                    location.reload();
                }
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
