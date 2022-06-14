<template>
    <div
        ref="root" class="c-stream"
        :class="{
            'audio': modelValue.hasAudio && !modelValue.hasVideo,
            'loading': !modelValue.playing
        }"
        @mouseout="toggleStreamBar(false)"
        @mouseover="toggleStreamBar(true)"
    >
        <video
            ref="media"
            :autoplay="true"
            class="media"
            :class="{'media-failed': mediaFailed, mirror: modelValue.mirror}"
            :muted="modelValue.direction === 'up'"
            :playsinline="true"
        />

        <Transition name="loading-transition">
            <div v-if="!modelValue.playing" class="loading-container">
                <Icon class="spinner" name="Spinner" />
            </div>
            <div v-else-if="!modelValue.hasVideo" class="media-container">
                <Icon name="Logo" />
            </div>
        </Transition>

        <Reports v-if="stats.visible" :description="modelValue" @click="toggleStats" />

        <div v-if="controls && modelValue.playing" class="user-info">
            <SoundMeter
                v-if="audioEnabled" class="soundmeter"
                orientation="vertical"
                :stream="stream"
                :stream-id="stream.id"
            />
            <div
                v-if="audioEnabled && modelValue.direction === 'down'" key=""
                v-tip="{content: `${volume.value}% ${$t('audio volume')}, ${$t('double click to')} ${volume.locked ? $t('unlock') : $t('lock')}`}"
                class="volume-slider"
            >
                <FieldSlider v-model="volume" />
            </div>
            <div class="user" :class="{'has-audio': audioEnabled}">
                {{ modelValue.username }}
            </div>
        </div>
        <div class="stream-options" :class="{active: bar.active}">
            <button
                v-if="pip.enabled" class="btn btn-menu small"
                @click="setPip"
            >
                <Icon v-tip="{content: $t('picture-in-picture')}" class="icon-mini" name="Pip" />
            </button>
            <button class="btn btn-menu small" @click="setFullscreen">
                <Icon v-tip="{content: $t('fullscreen')}" class="icon-mini" name="Fullscreen" />
            </button>
            <button
                v-if="hasSettings" class="btn btn-menu small"
                :class="{active: stats.visibe}"
                @click="toggleStats"
            >
                <Icon v-tip="{content: $t('stream info')}" class="icon-mini" name="Info" />
            </button>
        </div>
    </div>
</template>

<script>
import {nextTick} from 'vue'
import Reports from './Reports.vue'

export default {
    beforeUnmount() {
        this.app.logger.debug(`unmounting ${this.modelValue.direction} stream ${this.modelValue.id}`)
        if (this.$refs.media.src) {
            URL.revokeObjectURL(this.$refs.media.src)
        } else {
            this.$refs.media.srcObject = null
        }
    },
    components: {Reports},
    computed: {
        /**
         * Audio toggle for down streams that have audio.
         */
        audioEnabled() {
            return !!(this.modelValue.hasAudio && this.stream)
        },
        fullscreenEnabled() {
            if (this.$refs.media) {
                return this.$refs.media.requestFullscreen
            }
            return false
        },
        hasSettings() {
            // Firefox MediaStream settings are empty.
            // See https://bugzilla.mozilla.org/show_bug.cgi?id=1537986
            return (
                Object.keys(this.modelValue.settings.audio).length ||
                Object.keys(this.modelValue.settings.video).length
            )
        },
        pipEnabled() {
            if (this.$refs.media) {
                return this.$refs.media.requestPictureInPicture
            }
            return false
        },
        volume: {
            get() { return this.modelValue.volume },
            set(volume) { this.$emit('update:modelValue', {...this.modelValue, volume}) },
        },
    },
    data() {
        return {
            bar: {
                active: false,
            },
            media: null,
            mediaFailed: false,
            muted: false,
            pip: {
                active: false,
                enabled: false,
            },
            stats: {
                visible: false,
            },
            stream: null,
            type: 'video',
        }
    },
    emits: ['update:modelValue'],
    methods: {
        async loadSettings() {
            this.app.logger.debug('loading stream settings')
            const settings = {audio: {}, video: {}}

            const audioTracks = this.stream.getAudioTracks()

            if (audioTracks.length) {
                settings.audio = audioTracks[0].getSettings()
            }

            const videoTracks = this.stream.getVideoTracks()
            if (videoTracks.length) {
                settings.video = videoTracks[0].getSettings()
            }

            await nextTick()
            this.$emit('update:modelValue', {...this.modelValue, settings})
        },
        /**
         * Handle mounting a remote 'down' stream.
         */
        async mountDownstream() {
            this.glnStream = this.$m.sfu.connection.down[this.modelValue.id]

            if (!this.glnStream) {
                this.app.logger.debug(`no sfu stream on mounting stream ${this.modelValue.id}`)
                return
            } else {
                this.app.logger.debug(`mount downstream ${this.modelValue.id}`)
            }

            this.stream = this.glnStream.stream

            // No need for further setup; this is an existing stream.
            if (this.$m.sfu.connection.down[this.modelValue.id].stream) {
                this.$refs.media.srcObject = this.$m.sfu.connection.down[this.modelValue.id].stream
                await this.playStream()
                return
            }

            this.glnStream.ondowntrack = (track) => {
                if (!this.stream) {
                    this.stream = this.glnStream.stream
                }

                this.app.logger.debug(`downstream ondowntrack/${this.glnStream.id}`)
                // An incoming audio-track; enable volume controls.
                if (track.kind === 'audio') {
                    this.app.logger.debug(`stream ondowntrack - enable audio controls`)
                    this.$emit('update:modelValue', {...this.modelValue, hasAudio: true})
                } else if (track.kind === 'video') {
                    this.$emit('update:modelValue', {...this.modelValue, hasVideo: true})
                }
            }

            this.glnStream.onclose = () => {
                this.$m.sfu.delMedia(this.glnStream.id)
            }

            this.glnStream.onstatus = async(status) => {
                if (['connected', 'completed'].includes(status)) {

                    this.$refs.media.srcObject = this.stream
                    // Firefox doesn't have a working setSinkId
                    // See https://bugzilla.mozilla.org/show_bug.cgi?id=1498512
                    if (this.audioEnabled && this.$refs.media.setSinkId) {
                        this.app.logger.debug(`set stream sink: ${this.$s.devices.audio.selected.id}`)
                        this.$refs.media.setSinkId(this.$s.devices.audio.selected.id)
                    }

                    await this.playStream()
                }
            }
        },
        async mountUpstream() {
            // Mute local streams, so people don't hear themselves talk.
            if (!this.muted) {
                this.toggleMuteVolume()
            }
            this.app.logger.debug(`mount upstream ${this.modelValue.id}`)

            if (!this.modelValue.src) {
                // Local media stream from a device.
                this.glnStream = this.$m.sfu.connection.up[this.modelValue.id]
                this.stream = this.glnStream.stream
                this.$refs.media.srcObject = this.stream
                await this.playStream()
            } else {
                // Local media stream playing from a file...
                if (this.modelValue.src instanceof File) {
                    const url = URL.createObjectURL(this.modelValue.src)
                    this.$refs.media.src = url

                    if (this.$refs.media.captureStream) {
                        this.stream = this.$refs.media.captureStream()
                    } else if (this.$refs.media.mozCaptureStream) {
                        this.stream = this.$refs.media.mozCaptureStream()
                    }

                    this.glnStream = this.$m.sfu.connection.up[this.modelValue.id]
                    this.glnStream.userdata.play = true

                    this.stream.onaddtrack = (e) => {
                        const track = e.track

                        if (track.kind === 'audio') {
                            this.$emit('update:modelValue', {...this.modelValue, hasAudio: true})
                        } else if (track.kind === 'video') {
                            this.$emit('update:modelValue', {...this.modelValue, hasVideo: true})
                        }

                        this.glnStream.pc.addTrack(track, this.stream)
                    }

                    // Previously handled by `glnStream.onclose`, but that event doesn't seem to be
                    // triggered here. TODO: Checkout later if glnStream can be used instead.
                    this.stream.onremovetrack = () => {
                        if (this.$refs.media && this.$refs.media.src) {
                            this.$m.sfu.delUpMedia(this.glnStream)
                            this.$s.files.playing = []
                        }
                    }

                    this.glnStream.onstatus = async(status) => {
                        if (status === 'connected') {
                            await this.loadSettings()
                        }
                    }

                } else if (this.modelValue.src instanceof MediaStream) {
                    // Local MediaStream (not part of Galene); e.g. Webcam test
                    this.stream = this.modelValue.src
                    this.$refs.media.srcObject = this.stream
                } else {
                    throw new Error('invalid Stream source type')
                }
            }

            // A local stream that's not networked (e.g. cam preview in settings)
            if (!this.glnStream) return

            this.glnStream.stream = this.stream
        },
        async playStream() {
            try {
                await this.$refs.media.play()
                await this.loadSettings()
                this.$emit('update:modelValue', {...this.modelValue, playing: true})
            } catch (message) {
                this.app.logger.warn(`stream ${this.glnStream.id} terminated (play failed)`)
                this.$m.sfu.delMedia(this.glnStream.id)
            }
        },
        setFullscreen() {
            this.$refs.media.requestFullscreen()
        },
        setPip() {
            if (this.pip.active) {
                document.exitPictureInPicture()
            } else {
                this.$refs.media.requestPictureInPicture()
            }
        },
        toggleMuteVolume() {
            this.muted = !this.muted
            this.$refs.media.muted = this.muted
        },
        toggleStats() {
            this.stats.visible = !this.stats.visible
        },
        toggleStreamBar(active) {
            this.bar.active = active
        },
    },
    mounted() {
        // Firefox doesn't support this API (yet).
        if (this.$refs.media.requestPictureInPicture) {
            this.pip.enabled = true

            this.$refs.media.addEventListener('enterpictureinpicture', () => { this.pip.active = true })
            this.$refs.media.addEventListener('leavepictureinpicture', () => { this.pip.active = false })
        }

        this.muted = this.$refs.media.muted

        if (this.modelValue.direction === 'up') this.mountUpstream()
        else this.mountDownstream()

    },
    props: {
        controls: {
            default() {return true},
            type: Boolean,
        },
        modelValue: {
            required: true,
            type: Object,
        },
    },
    watch: {
        'modelValue.volume.value'(value) {
            this.$refs.media.volume = value / 100
        },
    },
}
</script>

<style lang="scss">
.loading-transition-enter-active,
.loading-transition-leave-active {
    transition: opacity 0.5s;
}

.loading-transition-enter,
.loading-transition-leave-to {
    opacity: 0;
}

@keyframes spinner {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.c-stream {
    background: var(--grey-3);
    border: 2px solid var(--grey-4);
    display: flex;
    flex-direction: column;
    justify-items: center;
    overflow: hidden;
    position: relative;

    video {
        border: none;
        max-height: 100%;
        object-fit: cover;
        opacity: 1;
        transition: opacity 0.3s;

        &.loading {
            opacity: 0;
        }
    }

    &.audio {
        // No video-track; just use it to play audio, but show a
        // branding icon to indicate this is audio-only.

        .media {
            display: none;
        }
    }

    .media-container,
    .loading-container {
        align-items: center;
        aspect-ratio: 4 / 3;
        background: var(--grey-2);
        display: flex;
        height: 100%;
        justify-content: center;
        object-fit: cover;
        position: absolute;
        width: 100%;

        .icon {
            filter: drop-shadow(3px 5px 2px rgb(0 0 0 / 40%));
            height: 50%;
            width: 50%;
        }

        .spinner {
            animation-duration: 0.75s;
            animation-iteration-count: infinite;
            animation-name: spinner;
        }
    }

    .loading-container {

        .icon {
            color: var(--primary-c);
        }
    }

    .user-info {
        align-items: center;
        background: hsl(var(--grey-h) var(--grey-s) var(--light-1) / var(--alpha-2));
        bottom: 0;
        display: flex;
        min-width: 0;
        position: absolute;
        transition: all 0.5s ease;

        .soundmeter,
        .volume-slider {
            background: hsl(var(--grey-h) var(--grey-s) var(--light-8) / var(--alpha-2));
        }

        .soundmeter {
            border: none;
            height: var(--spacer-6);
            margin: 0;
            width: 8px;
        }

        .volume-slider {

            .track {
                background: none;
            }
        }

        .user {
            align-items: center;
            color: var(--primary-c);
            display: flex;
            flex: 1;
            font-family: var(--font-2);
            font-size: var(--text-s);
            font-weight: 600;
            height: var(--spacer-6);
            margin-left: var(--spacer-1);
            margin-right: var(--spacer-1);
            text-align: right;
            text-transform: uppercase;
            user-select: none;
        }
    }

    .stream-options {
        background: var(--grey-1);
        bottom: 0;
        display: flex;
        position: absolute;
        right: 0;
        transform: translateY(var(--spacer-6));
        transition: 0.3s ease-in-out;

        button {
            color: var(--grey-8);
        }

        &.active {
            // min-width: 100%;
            transform: translateY(0);

            .buttons {
                display: flex;
            }
        }
    }
}
</style>
