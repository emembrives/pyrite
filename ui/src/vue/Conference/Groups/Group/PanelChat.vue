<template>
    <div ref="view" class="c-panel-chat" :class="{[$s.env.layout]: true}">
        <div ref="messages" class="messages scroller">
            <div
                v-for="message of sortedMessages" :key="message.message"
                class="message"
                :class="{command: !message.nick, [message.kind]: true}"
            >
                <template v-if="message.kind === 'me'">
                    <div class="text">
                        {{ message.nick }} {{ $t(message.message) }}...
                    </div>
                    <div class="time">
                        {{ formatTime(message.time) }}
                    </div>
                </template>

                <template v-else>
                    <header v-if="message.nick">
                        <div class="author">
                            {{ message.nick }}
                        </div><div class="time">
                            {{ formatTime(message.time) }}
                        </div>
                    </header>
                    <section>
                        <div v-for="msg of formatMessage(message.message)" :key="msg.id">
                            {{ msg }}
                        </div>
                    </section>
                </template>
            </div>
        </div>
        <div class="chat-channels">
            <div
                v-for="(channel, key) in $s.chat.channels"
                :key="key" class="chat-channel"
                :class="{active: channel.id === $s.chat.channel}"
                @click="selectChannel(channel)"
            >
                <div class="channel-name">
                    <Icon class="icon icon-mini" :icon-props="{unread: channel.unread}" name="Chat" />
                </div>
                <span v-if="key === 'main'" class="ucfl">
                    {{ $t('general') }}
                </span>
                <span v-else>
                    {{ channel.name }}
                </span>

                <button v-if="channel.id !== 'main'" class="btn btn-icon btn-close" @click.stop="closeChannel(channel)">
                    <Icon class="icon icon-tiny" name="Close" />
                </button>
            </div>
        </div>
        <div class="send">
            <textarea
                v-model="rawMessage"
                autofocus
                :placeholder="$t('type /help for help')"
                @keydown.enter="$event.preventDefault()"
                @keyup.enter="sendMessage"
            />
            <button
                class="btn btn-menu"
                :disabled="rawMessage === ''"
                @click="sendMessage"
            >
                <Icon v-tip="{content: $t('send message')}" class="icon icon-mini" name="Send" />
            </button>
        </div>
    </div>
</template>

<script>
import {nextTick} from 'vue'

export default {
    beforeUnmount() {
        this.resizeObserver.disconnect()
    },
    computed: {
        sortedMessages() {
            const messages = this.$s.chat.channels[this.$s.chat.channel].messages
            return messages.sort((a, b) => a.time - b.time)
        },
    },
    created() {
        this.app.on('chat:message', async({channelId}) => {
            if (channelId === this.$s.chat.channel) {
                // A message was added to the active channel; update the chat scroller.
                await nextTick()
                if (this.$refs.messages) {
                    this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight
                }
            } else {
                // User is currently watching another channel; bump unread.
                this.$s.chat.channels[channelId].unread += 1
            }
        })
        // User left; clean up the channel.
        this.app.on('user', ({action, user}) => {
            if (action === 'del' && this.$s.chat.channels[user.id]) {
                // Change the active to-be-deleted channel to main
                if (this.$s.chat.channel === user.id) {
                    this.switchChannel('main')
                }
                delete this.$s.chat.channels[user.id]
            }
        })

        this.app.on('channel', ({action, channelId, channel = null}) => {
            this.app.logger.debug('switch chat channel to ', channelId)
            if (action === 'switch') {
                if (!this.$s.chat.channels[channelId]) {
                    this.$s.chat.channels[channelId] = channel
                }

                this.switchChannel(channelId)
            }
        })
    },
    data() {
        return {
            rawMessage: '',
        }
    },
    methods: {
        async closeChannel(channel) {
            // Return to the main channel when closing a direct user channel.
            this.switchChannel('main')
            delete this.$s.chat.channels[channel.id]
        },
        formatMessage(message) {
            return message.split('\n')
        },
        formatTime(ts) {
            const date = new Date(ts)
            return date.toLocaleTimeString()
        },
        selectChannel(channel) {
            this.$s.chat.channel = channel.id
            this.$s.chat.channels[channel.id].unread = 0
        },
        async sendMessage(e) {
            this.rawMessage = this.rawMessage.trim()

            if(e instanceof KeyboardEvent) {
                // ctrl/shift/meta +enter is next line.
                if (!(e.key === 'Enter' && !e.ctrlKey && !e.shiftKey && !e.metaKey)) {
                    this.rawMessage += '\r\n'
                    return false
                }
            }

            if (this.rawMessage === '') {
                return false
            }

            let me, message

            if(this.rawMessage[0] === '/') {
                if(this.rawMessage.length > 1 && this.rawMessage[1] === '/') {
                    message = this.rawMessage.slice(1)
                    me = false
                } else {
                    let cmd, rest
                    let space = this.rawMessage.indexOf(' ')
                    if(space < 0) {
                        cmd = this.rawMessage.slice(1)
                        rest = ''
                    } else {
                        cmd = this.rawMessage.slice(1, space)
                        rest = this.rawMessage.slice(space + 1)
                    }

                    this.rawMessage = ''

                    if(cmd === 'me') {
                        message = rest
                        me = true
                    } else {
                        let c = this.$m.sfu.commands[cmd]
                        if(!c) {
                            this.app.notifier.notify({
                                level: 'error',
                                message: `Uknown command /${cmd}, type /help for help`,
                            })
                            return
                        }
                        if(c.predicate) {
                            const message = c.predicate()
                            if(message) {
                                this.app.notifier.notify({level: 'error', message})
                                return
                            }
                        }
                        try {
                            c.f(cmd, rest)
                        } catch(e) {
                            this.app.notifier.notify({level: 'error', message: e})
                        }
                        return
                    }
                }
            } else {
                message = this.rawMessage
                me = false
            }

            // Sending to the main channel uses an empty string;
            // a direct message uses the user (connection) id.
            if (this.$s.chat.channel === 'main') {
                this.$m.sfu.connection.chat(me ? 'me' : '', '', message)
            } else {
                // A direct message is not replayed locally through
                // onChat, so we need to add the message ourselves.
                this.$m.sfu.connection.chat(me ? 'me' : '', this.$s.chat.channel, message)
            }

            // Adjust the chat window scroller
            await nextTick()
            this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight
            this.rawMessage = ''
        },
        switchChannel(name) {
            this.$s.chat.channel = name
            this.$s.chat.channels[name].unread = 0
        },
    },
    mounted() {
        // Keep track of the user-set width of the chat-window, so
        // we can restore it after toggling the chat window.
        this.resizeObserver = new ResizeObserver(async() => {
            this.$s.chat.width = parseInt(this.$refs.view.style.width.replace('px', ''))
        })

        this.resizeObserver.observe(this.$refs.view)

        this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight
    },
}
</script>

<style lang="scss">
.c-panel-chat {
    border-left: var(--border) solid var(--grey-4);
    display: flex;
    flex-direction: column;
    height: 100vh;
    min-width: 375px;

    .chat-channels {
        background: var(--grey-3);
        border-bottom: var(--border) solid var(--grey-4);
        display: flex;
        height: var(--spacer-8);
        width: 100%;

        .chat-channel {
            background: var(--grey-3);
            border: var(--border) solid var(--grey-4);
            color: var(--grey-6);
            display: flex;
            font-family: var(--font-2);
            margin: var(--spacer-1);
            padding: var(--spacer-1);
            user-select: none;

            .author {
                font-family: var(--font-1);
            }

            .channel-name {
                align-items: center;
                display: flex;

                .icon {
                    margin-right: var(--spacer-1);
                }
            }

            &:hover {
                cursor: pointer;
            }

            &.active {
                background: var(--grey-2);
                color: var(--primary-c);
            }

            .btn-close {
                margin-left: var(--spacer-1);
            }
        }
    }

    .messages {
        background: var(--grey-2);
        flex: 1;
        overflow-x: hidden;
        overflow-y: scroll;
        padding-top: var(--spacer-2);

        .message {
            margin-bottom: var(--spacer-4);
            margin-left: var(--spacer-1);
            margin-right: var(--spacer-1);
            padding: var(--spacer-2);
            position: relative;

            &.default {
                background: var(--grey-4);
                border-radius: var(--spacer-2);
                color: var(--grey-7);

                &::before {
                    background: var(--grey-4);
                    bottom: -20px;
                    clip-path: polygon(20% 0, 100% 0, 0 100%);
                    content: "";
                    display: block;
                    height: 20px;
                    left: 12px;
                    position: absolute;
                    width: 20px;
                }

                & header {
                    align-items: center;
                    color: var(--primary-c);
                    display: flex;
                    font-family: var(--font-2);
                    font-size: var(--text-s);
                    font-weight: 600;
                    justify-content: space-between;
                    margin-bottom: var(--spacer-05);

                    .author {
                        text-transform: uppercase;
                    }

                    .time {
                        font-size: var(--text-xs);
                    }
                }

                & section {
                    overflow: hidden;
                }
            }

            &.command {
                background: var(--grey-3);
                color: var(--grey-6);
                font-size: var(--text-s);
            }

            &.me {
                background: var(--grey-3);
                color: var(--grey-7);
                display: flex;
                font-family: var(--font-2);
                font-size: var(--text-s);
                font-style: italic;
                margin-left: 0;
                margin-right: 0;
                padding: var(--spacer-2) var(--spacer-3);

                .text {
                    flex: 1;

                    &::first-letter {
                        text-transform: uppercase;
                    }
                }

                .time {
                    align-self: flex-end;
                    color: var(--grey-5);
                }
            }
        }
    }

    .send {
        background: var(--grey-3);
        display: flex;
        padding-bottom: var(--border);

        button {
            align-items: center;
            background: var(--grey-2);
            display: flex;
            height: var(--spacer-8);
            justify-content: center;
            padding: 0;
            width: var(--spacer-6);

            &:not([disabled]):hover {
                cursor: pointer;
            }
        }

        textarea {
            background: var(--grey-1);
            border: none;
            color: var(--primary-c);
            flex: 1;
            font-family: var(--font-2);
            height: var(--spacer-8);
            margin: 0;
            outline: none;
            overflow-y: hidden;
            padding: var(--spacer-1);

            &::placeholder {
                color: var(--grey-7);
            }
        }
    }

    &.tablet {
        position: absolute;
        right: var(--spacer-8);
        z-index: 1000;

        .messages {
            background: var(--overlay-c);
        }
    }
}
</style>
