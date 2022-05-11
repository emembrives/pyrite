<template>
    <div class="c-header">
        <header>
            <RouterLink
                class="logo tooltip"
                :class="{active: $route.name && $route.name.includes('manager')}"
                :data-tooltip="$route.name.includes('conference-') ? $t('switch to admin') : $t('switch to conference')"
                :to="toggleAdminConference"
            >
                <Icon class="icon" name="Logo" />
                <div class="l-name">
                    <div class="name">
                        PYRITE
                    </div>
                    <div class="version">
                        {{ version }}
                    </div>
                </div>
            </RouterLink>

            <button
                class="btn btn-collapse tooltip"
                :class="{active: !$s.chat.hidden}"
                :data-tooltip="$s.chat.hidden ? $t('show chat') : $t('hide chat')"
                @click="$s.chat.hidden = !$s.chat.hidden"
            >
                <Icon class="icon-small" name="collapseLeft" />
            </button>
        </header>
        <slot />
    </div>
</template>

<script>
import {defineComponent} from 'vue'

export default defineComponent({
    computed: {
        toggleAdminConference() {
            if (this.$route.name === 'conference-splash') {
                return {name: 'admin-groups-settings'}
            } else if (this.$route.name === 'conference-groups-connected') {
                return {name: 'admin-groups-settings'}
            } else if (this.$route.name === 'conference-groups-disconnected') {
                // Use the selected group with the group in admin.
                const groupId = this.$route.params.groupId
                return {name: 'admin-groups-settings', params: {groupId, tabId: 'misc'}}
            } else if (this.$route.name.startsWith('admin-group')) {
                const groupId = this.$route.params.groupId

                if (!groupId) {
                    return {name: 'conference-splash'}
                } else {
                    if (!this.$s.group.connected) {
                        return {name: 'conference-groups-disconnected', params: {groupId}}
                    } else {
                        return {name: 'conference-groups-connected', params: {groupId}}
                    }
                }
            }
            return {name: 'conference-main'}
        },
    },
    data() {
        return {
            version: import.meta.env.VITE_VERSION,
        }
    },
})
</script>

<style lang="scss">
.c-header {
    display: flex;
    flex-direction: column;

    header {
        align-items: center;
        background: var(--grey-2);
        border-bottom: var(--border) solid var(--grey-4);
        display: flex;
        font-weight: bold;
        height: var(--space-4);
        margin-bottom: var(--spacer);
        padding-right: var(--spacer);
        position: relative;

        .logo {
            align-items: center;
            color: var(--primary-color);
            display: flex;
            flex: 1;
            font-family: var(--font-secondary);
            justify-content: flex-start;

            svg {
                color: var(--primary-color);
                margin-right: var(--spacer);
            }

            &.no-back-link:hover {
                cursor: not-allowed;
            }

            .icon {
                height: 50px;
                transform: scale(1.25);
                width: 50px;
            }
        }

        .l-name {

            .name {
                width: 100%;
            }

            .version {
                bottom: 0;
                color: var(--grey-7);
                font-family: var(--font-secondary);
                font-size: var(--text-xs);
                font-style: italic;
                position: absolute;
            }
        }

        .btn-collapse {

        }
    }
}
</style>
