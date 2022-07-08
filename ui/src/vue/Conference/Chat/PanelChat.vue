<template>
    <div ref="view" class="c-panel-chat" :class="{[$s.env.layout]: true}">
        <Emoji v-if="$s.chat.emoji.active" :onselect="addEmoji" />
        <div ref="messages" class="messages scroller">
            <ChatMessage v-for="(message, index) in sortedMessages" :key="index" :message="message" />
        </div>

        <div v-if="!$s.chat.emoji.active" class="chat-channels">
            <div
                v-for="(channel, key) in $s.chat.channels"
                :key="key" class="chat-channel"
                :class="{active: channel.id === $s.chat.channel}"
                @click="$m.chat.selectChannel(channel)"
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

                <button v-if="channel.id !== 'main'" class="btn btn-icon btn-close" @click.stop="app.$m.chat.closeChannel(channel)">
                    <Icon class="icon icon-tiny" name="Close" />
                </button>
            </div>
        </div>

        <div class="send">
            <textarea
                ref="chatInput"
                v-model="$s.chat.message"
                autofocus
                :placeholder="$t('type /help for help')"
                @keydown.enter="$event.preventDefault()"
                @keyup.enter="sendMessage"
            />
            <button
                class="btn btn-menu"
                :disabled="formattedMessage === ''"
                @click="sendMessage"
            >
                <Icon v-tip="{content: $t('send message')}" class="icon icon-mini" name="Send" />
            </button>
        </div>

        <div class="chat-actions">
            <button class="btn btn-menu" :class="{active: $s.chat.emoji.active}" @click="$s.chat.emoji.active = !$s.chat.emoji.active">
                😼
            </button>
        </div>
    </div>
</template>

<script>
/**
 * Keep in mind that the chat component is destroyed
 * in collapsed state. Non-UI specific logic should be
 * placed in the chat model.
 */
import ChatMessage from './Message.vue'
import Emoji from './Emoji.vue'
import {nextTick} from 'vue'

export default {
    beforeUnmount() {
        this.resizeObserver.disconnect()
    },
    components: {ChatMessage, Emoji},
    computed: {
        channelMessages() {
            if (this.$s.chat.channels[this.$s.chat.channel]) {
                return this.$s.chat.channels[this.$s.chat.channel].messages
            }
            return []
        },
        formattedMessage() {
            return this.$s.chat.message.trim()
        },
        sortedMessages() {
            if (this.$s.chat.channels[this.$s.chat.channel]) {
                const messages = this.$s.chat.channels[this.$s.chat.channel].messages
                return messages.sort((a, b) => a.time - b.time)
            }
            return []
        },
    },
    methods: {
        addEmoji(e, emoji) {
            const message = [...this.$s.chat.message]
            const caretPosition = this.$refs.chatInput.selectionStart
            if (caretPosition >= 0) {
                message.splice(caretPosition, 0, emoji)
            }
            this.$s.chat.message = message.join('')

            if (!e.ctrlKey) {
                this.$s.chat.emoji.active = false
            }
        },
        async sendMessage(e) {
            if (e instanceof KeyboardEvent) {
                // ctrl/shift/meta +enter is next line.
                if (!(e.key === 'Enter' && !e.ctrlKey && !e.shiftKey && !e.metaKey)) {
                    this.$s.chat.message += '\r\n'
                    return false
                }
            }

            this.$m.chat.sendMessage(this.formattedMessage)
            this.$s.chat.message = ''
            this.$s.chat.emoji.active = false
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
    watch: {
        channelMessages: {
            deep: true,
            async handler() {
                await nextTick()
                if (this.$refs.messages) {
                    this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight
                }
            },
        },
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

    .messages {
        background: var(--grey-2);
        flex: 1;
        overflow-x: hidden;
        overflow-y: scroll;

        // padding-top: var(--spacer-2);

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

    .chat-actions {
        background: var(--grey-2);

        .btn-menu {
            background: var(--grey-5);
            height: 30px;

            &.active {
                background: var(--primary-c);
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
