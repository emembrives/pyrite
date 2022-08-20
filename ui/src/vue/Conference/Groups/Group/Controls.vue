<template>
    <nav class="c-room-controls">
        <div class="group-controls">
            <button
                class="btn btn-menu"
                :class="{active: !$s.panels.chat.collapsed}"
                @click="toggleChat"
            >
                <Icon
                    v-tip="{content: $s.panels.chat.collapsed ? $t('show chat panel') : $t('hide chat panel')}"
                    class="icon-small"
                    :class="{active: $s.panels.chat.collapsed}"
                    :icon-props="{unread: unreadMessages}"
                    name="Chat"
                />
            </button>
            <button
                v-if="$s.permissions.present"
                class="btn btn-menu"
                :class="{active: $s.devices.mic.enabled, error: !$s.devices.mic.enabled}"
                @click="toggleMicrophone"
            >
                <Icon
                    v-tip="{content: `${$t('switch microphone')} ${$s.devices.mic.enabled ? $t('off') : $t('on')}`}"
                    class="icon-small" :name="$s.devices.mic.enabled ? 'Mic' : 'MicMute'"
                />
            </button>

            <button
                v-if="$s.permissions.present"
                class="btn btn-menu"
                :class="{active: $s.devices.cam.enabled, error: !$s.devices.cam.enabled}"
                :disabled="!$s.mediaReady"
                @click="toggleCam"
            >
                <Icon
                    v-tip="{content: `${$t('switch camera')} ${$s.devices.cam.enabled ? $t('off') : $t('on')}`}"
                    class="icon-small"
                    name="Webcam"
                />
            </button>

            <button
                v-if="$s.permissions.present"
                class="btn btn-menu"
                :class="{active: $s.upMedia.screenshare.length}"
                @click="toggleScreenshare"
            >
                <Icon
                    v-tip="{content: `${$t('switch screensharing')} ${$s.upMedia.screenshare.length ? $t('off') : $t('on')}`}"
                    class="icon-small"
                    name="ScreenShare"
                />
            </button>

            <button
                v-if="$s.permissions.present"
                class="btn btn-menu"
                :class="{active: $s.upMedia.video.length}"
            >
                <FieldFile
                    v-model="$s.files.playing"
                    :accept="fileMediaAccept"
                    :tooltip="filePlayTooltip"
                    @file="togglePlayFile"
                />
            </button>

            <button
                v-tip="{content: `${volume.value}% ${$t('audio volume')}`}"
                class="btn btn-menu no-feedback"
            >
                <FieldSlider v-model="volume" />
            </button>
        </div>
    </nav>
</template>

<script>
import {nextTick} from 'vue'
import {unreadMessages} from '@/js/models/chat.js'

export default {
    computed: {
        fileMediaAccept() {
            if (this.$s.env.isFirefox) {
                return '.mp4'
            } else {
                // Chromium supports at least these 3 formats:
                return '.mp4,.mkv,.webm'
            }
        },
        filePlayTooltip() {
            if (this.$s.files.playing.length) {
                return this.$t('streaming video file')
            }
            let formats = []
            if (this.$s.env.isFirefox) {
                formats.push('.mp4')
            } else {
                formats.push('.mp4', 'webm', 'mkv')
            }
            return this.$t('stream video file ({formats})', {formats: formats.join(',')})
        },
        unreadMessages,
    },
    data() {
        return {
            volume: {
                locked: null,
                value: 100,
            },
        }
    },
    methods: {
        toggleCam() {
            this.$s.devices.cam.enabled = !this.$s.devices.cam.enabled
            this.app.logger.debug(`switching cam stream: ${this.$s.devices.cam.enabled}`)
            this.$m.sfu.delUpMediaKind('camera')
            this.$m.media.getUserMedia(this.$s.devices)
        },
        async toggleChat() {
            // Don't do a collapse animation while emoji is active; this is
            // too heavy due to the 1800+ items grid layout.
            this.$s.chat.emoji.active = false
            await nextTick()
            this.$s.panels.chat.collapsed = !this.$s.panels.chat.collapsed
            this.app.store.save()
        },
        toggleMicrophone() {
            this.$m.sfu.muteMicrophone(this.$s.devices.mic.enabled)
        },
        togglePlayFile(file) {
            if (file) {
                this.$m.sfu.addFileMedia(file)
            } else {
                this.$s.files.playing = []
                this.$m.sfu.delUpMediaKind('video')
            }
        },
        async toggleScreenshare() {
            if (this.$s.upMedia.screenshare.length) {
                this.app.logger.debug('turn screenshare stream off')
                this.$m.sfu.delUpMedia(this.$m.media.screenStream)
            } else {
                this.app.logger.debug('turn screenshare stream on')
                const stream = await this.$m.sfu.addShareMedia()
                this.$m.media.setScreenStream(stream)
            }
        },
    },
    watch: {
        '$s.devices.mic.enabled'(enabled) {
            this.$m.sfu.connection.userAction('setdata', this.$m.sfu.connection.id, {mic: enabled})
        },
        volume(volume) {
            for (const description of this.$s.streams) {
                // Only downstreams have volume control:
                if (description.direction === 'down' && !description.volume.locked) {
                    description.volume = volume
                }
            }
        },
    },
}
</script>

<style lang="scss">
.c-room-controls {
    background: var(--grey-4);
    border-left: var(--border) solid var(--grey-4);
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .hand {

        &.wave {
            animation-duration: 2.5s;
            animation-iteration-count: infinite;
            animation-name: wave-animation;
            transform-origin: center bottom;
        }
    }
}
</style>
