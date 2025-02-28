<template>
    <div v-click-outside="toggleMenu" class="c-user-context context-menu" :class="{active}">
        <Icon class="icon icon-small" name="Menu" @click="toggleMenu" />
        <div v-if="active" class="context-actions">
            <button
                v-if="user.id !== $s.user.id" class="action"
                @click="activateUserChat"
            >
                <Icon class="icon icon-mini" name="Chat" />{{ `${$t('chat with')} ${user.username}` }}
            </button>
            <button v-if="user.id !== $s.user.id && $s.permissions.op" class="action" @click="muteUser">
                <Icon class="icon icon-mini" name="Mic" />{{ $t('mute microphone') }}
            </button>

            <ContextInput
                v-if="user.id !== $s.user.id && $s.permissions.op" v-model="kick"
                :required="false"
                :submit="kickUser"
            />

            <button v-if="user.id !== $s.user.id && $s.permissions.op" class="action" @click="toggleOperator">
                <template v-if="user.permissions.op">
                    <Icon class="icon icon-mini" name="Operator" />{{ $t('remove operator role') }}
                </template>
                <template v-else>
                    <Icon class="icon icon-mini" name="Operator" />{{ $t('add operator role') }}
                </template>
            </button>
            <button v-if="user.id !== $s.user.id && $s.permissions.op" class="action" @click="togglePresenter">
                <template v-if="user.permissions.present">
                    <Icon class="icon icon-mini" name="Present" />{{ $t('remove presenter role') }}
                </template>
                <template v-else>
                    <Icon class="icon icon-mini" name="Present" />{{ $t('add presenter role') }}
                </template>
            </button>
            <ContextInput v-if="$s.permissions.op && user.id !== $s.user.id" v-model="warning" :submit="sendNotification" />
            <ContextSelect
                v-if="user.id === $s.user.id" v-model="$s.user.data.availability"
                icon="Present"
                :options="statusOptions"
                :submit="setAvailability"
                :title="$t('change status')"
            />
        </div>
    </div>
</template>

<script>
export default {
    data(){
        return {
            active: false,
            kick: {icon: 'Logout', title: `${this.$t('remove')} ${this.user.username}`},
            statusOptions: [
                {id: 'available', name: this.$t('available')},
                {id: 'away', name: this.$t('unavailable')},
                {id: 'busy', name: this.$t('do not disturb')},
            ],
            warning: {icon: 'Megafone', title: this.$t('send notification')},
        }
    },
    methods: {
        activateUserChat() {

            this.app.emit('channel', {
                action: 'switch',
                channel: {
                    id: this.user.id,
                    messages: [],
                    name: this.user.username,
                    unread: 0,
                },
                channelId: this.user.id,
            })
            this.$s.panels.chat.collapsed = false
            this.toggleMenu()
        },
        kickUser(text) {
            this.app.notifier.message('kicked', {dir: 'source', target: this.user.username})
            this.$m.sfu.connection.userAction('kick', this.user.id, text)
            this.toggleMenu()
        },
        muteUser() {
            this.app.notifier.message('mute', {dir: 'source', target: this.user.username})
            this.$m.sfu.connection.userMessage('mute', this.user.id, null)
            this.toggleMenu()
        },
        sendNotification(message) {
            this.app.notifier.message('notification', {dir: 'source', message, target: this.user.username})
            this.$m.sfu.connection.userMessage('notification', this.user.id, message)
            this.toggleMenu()
        },
        setAvailability(availability) {
            this.$m.sfu.connection.userAction('setdata', this.$m.sfu.connection.id, {availability})
        },
        toggleMenu(e, forceState) {
            // The v-click-outside
            if (typeof forceState === 'object') {
                this.active = false
                return
            }

            this.active = !this.active
        },
        toggleOperator() {
            let action
            if (this.user.permissions.op) action = 'unop'
            else action = 'op'

            this.app.notifier.message(action, {dir: 'source', target: this.user.username})
            this.$m.sfu.connection.userAction(action, this.user.id)
            this.toggleMenu()
        },
        togglePresenter() {
            let action
            if (this.user.permissions.present) action = 'unpresent'
            else action = 'present'

            this.app.notifier.message(action, {dir: 'source', target: this.user.username})
            this.$m.sfu.connection.userAction(action, this.user.id)
            this.toggleMenu()
        },
    },
    props: {
        user: {
            required: true,
            type: Object,
        },
    },
}
</script>
