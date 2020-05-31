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

            <div ref="two"
                 class="screen"
                 @click="onMouseClick"
                 @mousemove="onMouseMove">
            </div>

            <v-bottom-sheet persistent
                            hide-overlay
                            no-click-animation
                            :value="true">

                <v-toolbar flat color="transparent">
                    <v-spacer />
                    <v-btn large dark icon
                           class="mx-2"
                           @click="onToggleMute">
                        <v-icon v-if="muted">mdi-music-off</v-icon>
                        <v-icon v-else>mdi-music</v-icon>
                    </v-btn>

                    <v-btn large dark icon
                           class="mx-2"
                           @click="onComposeMessage">
                        <v-icon>mdi-message-text</v-icon>
                    </v-btn>

                    <v-btn dark text
                           target="_blank"
                           href="https://twitter.com/RicoBeti">
                        @RicoBeti
                    </v-btn>
                </v-toolbar>
            </v-bottom-sheet>
        </v-content>

        <v-dialog max-width="500"
                  v-model="messageDialog"
                  @input="onCloseMessageDialog">
            <v-card>
                <v-card-title>
                    <span>
                        How are you holding up?
                    </span>

                    <v-spacer />

                    <v-btn icon
                           @click="onCloseMessageDialog">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>

                <v-card-text class="my-0 py-0">
                    <div>
                        These are challenging times for everyone. How are <strong>YOU</strong> coping with COVID-19?
                        How do <strong>you</strong> feel? Hopeful? Anxious? Tell the world&hellip;
                    </div>

                    <v-form class="mt-5">
                        <v-text-field outlined
                                      autofocus
                                      counter="80"
                                      v-model="message"
                                      label="Your Message"
                                      placeholder="I'm feeling confident things will get better soon."
                                      hint="Your message will be publicly visible." />
                    </v-form>
                </v-card-text>
                <v-card-actions class="mx-1">
                    <v-spacer />
                    <v-btn large text
                           color="accent"
                           :loading="messagePending"
                           :disabled="message.length > 80 && message.length === 0"
                           @click="onSendMessage">
                        Send
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-snackbar bottom right
                    :color="snackbarColor"
                    v-model="snackbar">
            {{ snackbarText }}
            <v-btn icon
                   color="white"
                   @click="snackbar = false">
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </v-snackbar>
    </v-app>
</template>

<script lang="ts">
    import {
        Component,
        Vue,
    } from "vue-property-decorator";

    import Two from "two.js";
    import { Howl } from "howler";

    import {
        db,
        Timestamp,
    } from "@/firebase";

    import * as utils from "@/utils";

    interface Message {
        text: any;
        speed: number;
    }

    class Scene {
        two: Two & any;

        layerBackground!: Two.Group;

        groupWhale!: Two.Group;
        groupWhaleXRay!: Two.Group;

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
        spriteTriangleXRay: any;
        maskTriangle: any;

        soundTheme!: Howl;
        soundTrump!: Howl;

        messages!: Message[];

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

        loadSound(urls: string[]): any {
            return new Promise((resolve, reject) => {
                const howl = new Howl({
                    src: urls,
                    autoplay: false,
                    preload: true,
                    loop: false,
                });

                howl.once("load", () => {
                    resolve(howl);
                });

                howl.once("loaderror", (id: any, message: string) => {
                    reject(new Error(message));
                });
            });
        }

        collidesWithTrump(absoluteX: number, absoluteY: number) {
            const x = absoluteX / this.two.width;
            const y = absoluteY / this.two.height;

            const dx = x - 0.4;
            const dy = y - 0.4;

            return dx * dx + dy * dy < 0.1 * 0.1;
        }

        async load() {
            [
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
                this.spriteTriangleXRay,

                this.soundTheme,
                this.soundTrump,
            ] = await Promise.all([
                this.loadSprite("./assets/background.jpg"),
                this.loadSprite("./assets/planet-top.png", 508, -320),
                this.loadSprite("./assets/planet-left.png", 387, -87),
                this.loadSprite("./assets/planet-right.png", 648, -68),
                this.loadSprite("./assets/planet-bottom.png", 542, 195),
                this.loadSprite("./assets/whale.png", 18, 30),
                this.loadSprite("./assets/whale-xray.png", 18, 30),
                this.loadSprite("./assets/triangle-back.png", -20, -32),
                this.loadSprite("./assets/triangle-bottom.png", -63, 275),
                this.loadSprite("./assets/triangle-front.png", 40, 5),
                this.loadSprite("./assets/xray.jpg", 200),

                this.loadSound([
                    "./assets/sfx/theme.mp3",
                    "./assets/sfx/theme.ogg",
                    "./assets/sfx/theme.webm",
                ]),
                this.loadSound([
                    "./assets/sfx/trump.mp3",
                    "./assets/sfx/trump.ogg",
                    "./assets/sfx/trump.webm",
                ]),
            ]);
        }

        start() {
            this.soundTheme.volume(0.25);
            this.soundTheme.loop(true);
            this.soundTheme.play();

            this.two.clear();

            this.layerBackground = this.two.makeGroup();

            this.groupWhaleXRay = this.two.makeGroup(
                this.spriteTriangleXRay,
                this.spriteWhaleXRay,
            );

            this.groupWhale = this.two.makeGroup(
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

            this.maskTriangle = this.two.makePath(0, 0, 0, 0, 0, 0);
            this.maskTriangle.fill = "#000";

            this.groupWhaleXRay.mask = this.maskTriangle;

            this.messages = [];

            this.two
                .bind("update", (frame: number) => this.onUpdate(frame))
                .bind("resize", () => this.onResize())
                .trigger("resize");

            this.two.play();
        }

        mute() {
            this.soundTheme.stop();
        }

        unmute() {
            this.soundTheme.play();
        }

        showMessage(message: string) {
            const size = Math.random() * 30 + 20;
            const text = this.two.makeText(message, 0, 0, {
                family: "Ubuntu, sans-serif",
                size: size,
                leading: size,
                alignment: "left",
                weight: 900,
            });

            text.translation.x = this.two.width + 50;
            text.translation.y = (this.two.height / 2 * (Math.random() * 1.9 - 0.95));
            text.fill = "#fff";
            text.stroke = "#000";

            this.messages.push({
                text,
                speed: Math.random() * 3 + 2,
            });
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

            this.spriteTriangleXRay.rotation = frame * -0.05;

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

            this.messages = this.messages.filter(m => m.text.translation.x > -this.two.width * 4);
            this.messages.forEach(m => {
                m.text.translation.x -= m.speed;
            });
        }

        onMouseClick(e: MouseEvent) {
            if(this.collidesWithTrump(e.clientX, e.clientY)) {
                if(!this.soundTrump.playing()) {
                    this.soundTrump.play();
                }
            }
        }

        onMouseMove(root: HTMLElement, e: MouseEvent) {
            root.style.cursor = this.collidesWithTrump(e.clientX, e.clientY)
                ? "pointer" : "default";
        }
    }

    export type SnackbarState = "success" | "error";

    @Component
    export default class App extends Vue {
        scene!: Scene;
        initializing = true;
        muted = false;
        messageDialog = false;
        message = "";
        messages: string[] = [];
        messagePending = false;
        snackbar = false;
        snackbarColor: SnackbarState = "success";
        snackbarText = "";

        messageShowInterval = 0;
        cancelMessageSubscription!: any;

        async initialize() {
            this.scene = new Scene(this.$refs.two as HTMLElement);

            await this.scene.load();
            await utils.timeout(1000);

            this.initializing = false;
            this.scene.start();

            db
                .collection("messages")
                .orderBy("createdOn", "desc")
                .limit(20)
                .get()
                .then(snap => {
                    snap.docs.forEach(doc => this.messages.push(doc.data().text));
                });

            this.cancelMessageSubscription = db
                .collection("messages")
                .orderBy("createdOn", "desc")
                .limit(1)
                .onSnapshot(snap => {
                    snap.docs.forEach(doc => this.messages.push(doc.data().text));
                });

            this.messageShowInterval = setInterval(() => this.onShowNextMessage(), 2000);
        }

        showSnackbar(state: SnackbarState, text: string) {
            this.snackbar = true;
            this.snackbarColor = state;
            this.snackbarText = text;
        }

        onToggleMute() {
            if(this.muted) {
                this.scene.unmute();
                this.muted = false;
            } else {
                this.scene.mute();
                this.muted = true;
            }
        }

        onComposeMessage() {
            this.messageDialog = true;
        }

        async onSendMessage() {
            this.messagePending = true;

            try {
                await db
                    .collection("messages")
                    .add({
                        createdOn: Timestamp.now(),
                        text: this.message,
                    });
            } catch(e) {
                console.error(e);
                this.showSnackbar("error", "Your message couldn't be sent, please try again. :-)");
            } finally {
                this.onCloseMessageDialog();
            }
        }

        onCloseMessageDialog() {
            this.messageDialog = false;
            this.messagePending = false;
            this.message = "";
        }

        onShowNextMessage() {
            const message = this.messages.shift();
            if(message) {
                this.scene.showMessage(message);
            }
        }

        onMouseClick(e: MouseEvent) {
            this.scene.onMouseClick(e);
        }

        onMouseMove(e: MouseEvent) {
            this.scene.onMouseMove(this.$refs.two as HTMLElement, e);
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
            clearInterval(this.messageShowInterval);
            this.cancelMessageSubscription();
            this.scene.destroy();
        }
    }
</script>

<style lang="scss">
    html {
        overflow-y: hidden !important;
    }

    .v-dialog.v-bottom-sheet {
        box-shadow: none;
    }

    .screen {
        width: 100%;
        height: 100%;
        background-color: #121212;
        background-image: url("./assets/screen-background.jpg");
        background-size: 100% 100%;
    }
</style>
