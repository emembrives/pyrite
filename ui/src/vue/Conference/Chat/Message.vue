<template>
    <div class="message" :class="{command: !message.nick, [message.kind]: true}">
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
                <template v-for="(msgModel, index) in messageModel" :key="index">
                    <span v-if="msgModel.type === 'text'" class="text">{{ msgModel.value }}</span>
                    <span v-else-if="msgModel.type === 'emoji'" class="emoji">{{ msgModel.value }}</span>
                    <a
                        v-else-if="msgModel.type === 'url'" class="url"
                        :href="msgModel.value"
                        target="_blank"
                    >{{ msgModel.value }}</a>
                </template>
            </section>
        </template>
    </div>
</template>

<script>
const urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/ig

export default {
    computed: {
        messageModel() {
            let messageData = []
            let textBlock = {type: 'text', value: ''}

            // Spread takes care of properly separating most special symbols
            // with multiple characters(e.g. emoji characters)
            let _message = [...this.message.message]
            for (const char of _message) {
                if (app.$m.chat.emojiLookup.has(char.codePointAt(0))) {
                    if (textBlock.value.length) {
                        messageData.push(textBlock)
                        textBlock = {type: 'text', value: ''}
                    }

                    messageData.push({type: 'emoji', value: char})
                } else {
                    textBlock.value = textBlock.value + char
                }
            }
            // Flush blocks.
            if (textBlock.value.length) {
                messageData.push(textBlock)
            }

            for (const [index, block] of messageData.entries()) {
                if (block.type !== 'text') continue
                const nodes = block.value.split(urlRegex).filter((i) => (!['http', 'https'].includes(i)))
                const replaceBlocks = []
                for (const node of nodes) {
                    if (node.match(urlRegex)) {
                        replaceBlocks.push({type: 'url', value: node})
                    } else {
                        replaceBlocks.push({type: 'text', value: node})
                    }
                }
                messageData.splice(index, 1, replaceBlocks)
            }

            return messageData.flat()
        },
    },
    methods: {
        formatTime(ts) {
            const date = new Date(ts)
            return date.toLocaleTimeString()
        },
    },
    props: {
        message: {
            type: Object,
            required: true,
        },
    },
}
</script>
