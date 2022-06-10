<template>
    <div ref="view" class="c-group">
        <router-view v-slot="{ Component }">
            <Transition>
                <component :is="Component" />
            </Transition>
        </router-view>

        <Stream
            v-for="(description, index) in $s.streams" :key="description.id"
            :ref="el => { if (el) { streamsRef[index] = el } else {streamsRef.splice(index, 1)}}"
            v-model="$s.streams[index]"
        />

        <Icon v-if="!$s.streams.length" class="icon logo-animated" name="Logo" />
    </div>
</template>

<script>
import {nextTick} from 'vue'

import Stream from './Stream/Stream.vue'
/**
 * Optimized grid-layout thanks to https://github.com/salbatore
 * See: https://alicunde.github.io/Videoconference-Dish-CSS-JS/
 */
export default {
    computed: {
        streamsCount() {
            // All streams; loading & playing
            return this.$s.streams.length
        },
        streamsPlayingCount() {
            // Only playing streams
            return this.$s.streams.filter((s) => s.playing).length
        },
    },
    components: {Stream},
    beforeUnmount() {
        this.resizeObserver.disconnect()
    },
    beforeUpdate() {
        this.itemRefs = []
    },
    async mounted() {
        this.resizeObserver = new ResizeObserver(async() => {
            requestAnimationFrame(this.setView.bind(this))
        })

        this.resizeObserver.observe(this.$refs.view)
        this.setView()
        // At this point, the chat history is already loaded and
        // we set the active channel. This circumvents unwanted
        // unread messages (see chat model's onMessage).
        app.$s.chat.channel = 'main'
    },
    methods: {
        area(increment, streamCount, width, height, margin = 8) {
            let i = 0
            let w = 0

            let h = increment * 0.75 + (margin * 2)
            while (i < (streamCount)) {
                if ((w + increment) > width) {
                    w = 0
                    h = h + (increment * 0.75) + (margin * 2)
                }
                w = w + increment + (margin * 2)
                i++
            }
            if (h > height) return false
            else return increment
        },
        setView() {
            if (!this.$refs.view) return
            const margin = 8

            // Dimensions
            const width = this.$refs.view.offsetWidth - (margin * 2)
            const height = this.$refs.view.offsetHeight - (margin * 2)

            let max = 0

            let i = 1
            while (i < 5000) {
                let w = this.area(i, this.streamsRef.length, width, height, margin)
                if (w === false) {
                    max =  i - 1
                    break
                }
                i++
            }

            if (max > width) {
                max = width
            } else {
                max = max - (margin * 2)
            }
            this.streamDimensions(max, margin)
        },
        streamDimensions(width, margin) {
            for (const streamRef of this.streamsRef) {
                // While disconnecting, the DOM node may be gone.
                if (!streamRef.$refs.root) continue

                let aspectRatio
                if (streamRef.modelValue.settings.video && streamRef.modelValue.settings.video.aspectRatio) {
                    aspectRatio = 1 / streamRef.modelValue.settings.video.aspectRatio
                } else if (streamRef.$refs.media.videoHeight) {
                    aspectRatio = streamRef.$refs.media.videoHeight / streamRef.$refs.media.videoWidth
                } else {
                    aspectRatio = 0.75
                }

                streamRef.$refs.root.style.width = width + 'px'
                streamRef.$refs.root.style.margin = margin + 'px'
                streamRef.$refs.root.style.height = (width * aspectRatio) + 'px'
            }
        },
    },
    data() {
        return {
            streamsRef: [],
        }
    },
    watch: {
        async streamsCount() {
            await nextTick()
            this.setView()
            await nextTick()
        },
        async streamsPlayingCount() {
            await nextTick()
            this.setView()
            await nextTick()
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

.c-group {
    align-content: center;
    align-items: center;
    background: var(--grey-1);
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    overflow: hidden;
    position: relative;

    .c-stream {
        animation: show 0.4s ease;
        box-shadow: var(--shadow-l);
        position: relative;
    }

    .logo-animated {
        height: 30%;
        width: 30%;
    }

    .c-settings {
        background: var(--overlay-c);
        left: 0;
        max-width: 100%;
        max-width: 700px;
        position: absolute;
        top: 0;
        width: 100%;
        z-index: 10;
    }
}
</style>
