<template>
    <div
        class="c-conference-app app" :class="{
            connected: $s.group.connected,
            'panel-context-collapsed': $s.panels.context.collapsed,
            'chat-hidden': $s.chat.hidden,
            'chat-toggle': chatToggle,
            [`theme-${$s.theme.id}`]: true,
        }"
    >
        <PanelContext>
            <UsersList v-if="$s.group.connected" /><Groups v-else />
        </PanelContext>

        <ConferenceControls />

        <transition @enter="openChat" @leave="closeChat">
            <GroupChat v-if="$s.group.connected && !$s.chat.hidden" ref="chat" />
        </transition>

        <RouterView />

        <GroupControls v-if="$s.group.connected" />

        <Notifications />
    </div>
</template>

<script>
import ConferenceControls from './Controls/Controls.vue'
import GroupChat from './Groups/Group/Chat.vue'
import GroupControls from './Groups/Group/Controls.vue'
import Groups from './Groups/List.vue'
import PanelContext from '@/vue/Elements/PanelContext.vue'
import UsersList from './Users/List/List.vue'

export default {
    components: {ConferenceControls, GroupChat, GroupControls, Groups, PanelContext, UsersList},
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
    // --ctx-panel: 300px;
    --c1-width: var(--space-4);
    --c2-width: var(--space-4);

    // Presence, General Controls, Login Screen
    grid-template-columns: min-content var(--space-4) 1fr;
    height: 100vh;
    overflow: hidden;

    &.connected {
        grid-template-columns: min-content var(--c1-width) min-content 1fr var(--c2-width);

        .c-chat {
            min-width: 200px;
            opacity: 1;
            transition: opacity 150ms;
        }

        &.chat-hidden {
            // Presence, Controls, Conference Space, Conference Controls
            grid-template-columns: min-content var(--c1-width) 1fr var(--c2-width);
        }

        &.chat-toggle {
            // Toggling chat while being active the group
            // Blocks: Presence, Controls, Chat, Conference Space
            grid-template-columns: min-content var(--c1-width) min-content 1fr var(--c2-width);
        }
    }

    &.chat-toggle {
        // Toggling chat while leaving the group
        // Blocks: Presence, Controls, Chat, Login
        grid-template-columns: min-content var(--space-4) min-content 1fr;
        overflow: hidden;
        resize: none;

        .c-chat {
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
