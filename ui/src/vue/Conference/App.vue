<template>
    <div
        class="c-conference-app app" :class="{
            connected: $s.group.connected,
            'panel-context-collapsed': $s.panels.context.collapsed,
            'panel-chat-collapsed': $s.panels.chat.collapsed,
            'panel-chat-toggle': chatToggle,
            [`theme-${$s.theme.id}`]: true,
        }"
    >
        <PanelContext>
            <UsersContext v-if="$s.group.connected" /><Groups v-else />
        </PanelContext>

        <ConferenceControls />
        <RouterView />

        <transition @enter="openChat" @leave="closeChat">
            <PanelChat v-if="$s.group.connected && !$s.panels.chat.collapsed" ref="chat" />
        </transition>

        <GroupControls v-if="$s.group.connected" />

        <Notifications />
    </div>
</template>

<script>
import ConferenceControls from './Controls/Controls.vue'
import GroupControls from './Groups/Group/Controls.vue'
import Groups from './Groups/Context.vue'
import PanelChat from './Groups/Group/PanelChat.vue'
import PanelContext from '@/vue/Elements/PanelContext.vue'
import UsersContext from './Users/Context.vue'

export default {
    components: {ConferenceControls, GroupControls, Groups, PanelChat, PanelContext, UsersContext},
    data() {
        return {
            chatToggle: false,
        }
    },
    methods: {
        async closeChat(el, done) {
            el.style.width = `${this.$s.chat.width}px`
            this.chatToggle = true
            this.app.animate({
                duration: 350,
                from: this.$s.chat.width,
                onFinish: () => {
                    this.chatToggle = false
                    done()
                },
                onUpdate: v => {
                    el.style.width = `${Math.floor(v)}px`
                },
                to: 0,
            })
        },
        async openChat(el, done) {
            el.style.width = '0px'
            this.chatToggle = true
            this.app.animate({
                duration: 350,
                from: 0,
                onFinish: () => {
                    this.chatToggle = false
                    done()
                },
                onUpdate: v => {
                    el.style.width = `${Math.floor(v)}px`
                },
                to: this.$s.chat.width,
            })
        },
    },
    mounted() {
        const themeColor = getComputedStyle(document.querySelector('.app')).getPropertyValue('--grey-4')
        document.querySelector('meta[name="theme-color"]').content = themeColor
    },
}
</script>

<style lang="scss">
.c-conference-app {
    height: 100vh;
    width: 100vw;

    &.panel-chat-toggle {
        overflow: hidden;
        resize: none;

        .c-panel-chat {
            min-width: auto;
            opacity: 0.75;

            * {
                overflow: auto;
                overflow-x: hidden;
                resize: none;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }
}
</style>
