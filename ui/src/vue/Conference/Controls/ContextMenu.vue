<template>
    <div v-click-outside="toggleMenu" class="c-general-context context-menu" :class="{active}">
        <button class="btn btn-menu no-feedback">
            <Icon class="icon icon-small" name="Menu" @click="toggleMenu" />
        </button>
        <div v-show="active" class="context-actions">
            <button
                v-if="$s.permissions.record"
                class="action"
                @click="toggleRecording()"
            >
                <Icon class="icon icon-mini" name="Record" />
                <span v-if="$s.group.recording" class="ucfl">{{ $t('stop recording') }}</span>
                <span v-else class="ucfl">{{ $t('start recording') }}</span>
            </button>

            <button v-if="$s.permissions.op" class="action" @click="muteAllUsers">
                <Icon class="icon icon-mini" name="MicMute" /><span class="ucfl">{{ $t('mute participants') }}</span>
            </button>

            <ContextInput
                v-if="$s.permissions.op" v-model="lock"
                :revert="$s.group.locked"
                :submit="toggleLockGroup"
            />

            <button v-if="$s.permissions.op" class="action" @click="clearChat">
                <Icon class="icon icon-mini" name="ChatRemove" /><span class="ucfl">{{ $t('clear chat') }}</span>
            </button>

            <ContextInput v-if="$s.permissions.op" v-model="warning" :submit="sendNotification" />
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            active: false,
            lock: {
                icon: () => this.$s.group.locked ? 'Unlock' : 'Lock',
                title: () => this.$s.group.locked ? this.$t('unlock group') : this.$t('lock group'),
            },
            warning: {icon: 'Megafone', title: this.$t('send notification')},
        }
    },
    methods: {
        clearChat() {
            this.$m.sfu.connection.groupAction('clearchat')
            this.toggleMenu()
        },
        muteAllUsers() {
            this.$m.sfu.connection.userMessage('mute', null, null)
            this.active = false
        },
        sendNotification(text) {
            this.$m.sfu.connection.userMessage('notification', null, text)
        },
        toggleLockGroup(text) {
            if (this.$s.group.locked) {
                this.$m.sfu.connection.groupAction('unlock')
            } else {
                this.$m.sfu.connection.groupAction('lock', text)
            }
        },
        toggleMenu(e, forceState) {
            // The v-click-outside
            if (typeof forceState === 'object') {
                this.active = false
            } else {
                this.active = !this.active
            }

            // Undo input action context state when there is no text yet...
            if (!this.active && this.warning.message === '') {
                this.warning.input = false
            }
        },
        toggleRecording() {
            if (this.$s.group.recording) {
                this.$m.sfu.connection.groupAction('unrecord')
            } else {
                this.$m.sfu.connection.groupAction('record')
            }
        },

    },
}
</script>

