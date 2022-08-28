<template>
    <div class="c-viewport">
        <div ref="view" class="c-group">
            <router-view v-slot="{ Component }">
                <Transition>
                    <component :is="Component" />
                </Transition>
            </router-view>

            <Stream
                v-for="index in sortedVideoStreams" :key="$s.streams[index].id"
                v-model="$s.streams[index]"
            />

            <Icon v-if="!sortedVideoStreams.length" class="icon logo-animated" name="Logo" />
        </div>
        <div v-if="sortedAudioStreams.length" ref="audio-view" class="c-group-audio">
            <Stream
                v-for="index in sortedAudioStreams" :key="$s.streams[index].id"
                v-model="$s.streams[index]"
            />
        </div>
    </div>
</template>

<script>
import Stream from './Stream/Stream.vue'

export default {
    beforeUnmount() {
        this.resizeObserver.disconnect()
    },
    beforeUpdate() {
        this.itemRefs = []
    },
    computed: {
        sortedAudioStreams() {
            let indexes = Array.from(Array(this.$s.streams.length).keys()).filter((i) => !this.$s.streams[i].hasVideo)
            return indexes.sort((a, b) => {
                if (this.$s.streams[a].username < this.$s.streams[b].username){
                    return -1
                }
                if (this.$s.streams[a].username > this.$s.streams[b].username) {
                    return 1
                }
                return 0
            })
        },
        sortedVideoStreams() {
            let indexes = Array.from(Array(this.$s.streams.length).keys()).filter((i) => this.$s.streams[i].hasVideo)
            return indexes.sort((a, b) => {
                if (this.$s.streams[a].username < this.$s.streams[b].username){
                    return -1
                }
                if (this.$s.streams[a].username > this.$s.streams[b].username) {
                    return 1
                }
                return 0
            })
        },
        streamsCount() {
            // All streams; loading & playing
            return this.$s.streams.length
        },
        streamsPlayingCount() {
            // Recalculate the stream canvas; the aspect-ratio of one
            // the streams may have been changed (see stream loadedmetadata)
            return this.$s.streams.filter((s) => s.playing).length
        },
    },
    components: {Stream},
    data() {
        return {
            // This is not the stream's aspect ratio; but the aspect-ratio / stream
            // container to calculate with. I'm not sure if it may be feasible to
            // calculate with aspect-ratio per stream here.
            aspectRatio: 4 / 3,
            margin: 16,
        }
    },
    async mounted() {
        this.$refs.view.style.setProperty('--stream-margin', `${this.margin}px`)
        this._calcLayout = this.calcLayout.bind(this)
        this.resizeObserver = new ResizeObserver(async() => {
            requestAnimationFrame(this._calcLayout)
        })

        requestAnimationFrame(this._calcLayout)
        this.resizeObserver.observe(this.$refs.view)
        // At this point, the chat history is already loaded and
        // we set the active channel. This circumvents unwanted
        // unread messages (see chat model's onMessage).
        this.$s.chat.channel = 'main'
    },
    methods: {
        /**
         * Optimal space algorithm from Anton Dosov:
         * https://dev.to/antondosov/building-a-video-gallery-just-like-in-zoom-4mam
         * Also, learned from this resource:
         * https://github.com/Alicunde/Videoconference-Dish-CSS-JS
         */
        calcLayout() {
            if (!this.$refs.view) return
            const containerWidth = this.$refs.view.offsetWidth
            const containerHeight = this.$refs.view.offsetHeight
            let layout = {area: 0, cols: 0, height: null, rows: 0, width: null}
            let height, width

            for (let cols = 1; cols <= this.$s.streams.length; cols++) {
                const rows = Math.ceil(this.$s.streams.length / cols)
                const hScale = containerWidth / (cols * this.aspectRatio)
                const vScale = containerHeight / rows

                // Determine which axis is the constraint.
                if (hScale <= vScale) {
                    width = Math.floor((containerWidth - this.margin) / cols) - this.margin
                    height = Math.floor(width / this.aspectRatio) - this.margin
                } else {
                    height = Math.floor((containerHeight - this.margin) / rows) - this.margin
                    width = Math.floor(height * this.aspectRatio) - this.margin
                }

                const area = width * height
                if (area > layout.area) {
                    layout = {area, cols, height, rows, width}
                }
            }

            this.$refs.view.style.setProperty('--stream-width', `${layout.width}px`)
        },
    },
    watch: {
        async streamsCount() {
            requestAnimationFrame(this.calcLayout.bind(this))
        },
        async streamsPlayingCount() {
            requestAnimationFrame(this.calcLayout.bind(this))
        },
    },
}
</script>

<style lang='scss'>
@keyframes show {

    0% {
        opacity: 0;
        transform: scale(0);
    }

    100% {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.c-viewport {
    height: 100%;
    width: 100%;
    display: flex;
    flex-flow: column;

    .c-group {
        align-content: center;
        align-items: center;
        background: var(--grey-1);
        display: flex;
        flex: 1 1 auto;
        flex-flow: row wrap;
        gap: var(--stream-margin);
        justify-content: center;
        width: 100%;

        .c-stream {
            animation: show 0.35s ease-in;
            aspect-ratio: var(--aspect-ratio);
            box-shadow: var(--shadow-l);
            max-width: var(--stream-width);
            width: var(--stream-width);
        }

        .logo-animated {
            height: 30%;
            width: 30%;
        }

        .c-settings {
            background: var(--overlay-c);
            left: 0;
            max-width: 700px;
            position: absolute;
            top: 0;
            width: 100%;
            z-index: 10;
        }
    }

    .c-group-audio {
        align-content: center;
        align-items: center;
        background: var(--grey-1);
        display: flex;
        flex: 0 1 var(--spacer-6);
        flex-flow: row wrap;
        gap: var(--stream-margin);
        justify-content: center;

        .c-stream {
            flex: 1;
            height: var(--spacer-6);
        }
    }
}
</style>
