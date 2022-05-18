<template>
    <div ref="panel" class="c-panel-context" :class="{collapsed: $s.panels.context.collapsed}">
        <header>
            <RouterLink
                class="logo tooltip"
                :class="{active: $route.name && $route.name.includes('manager')}"
                :data-tooltip="$route.name.includes('conference-') ? $t('switch to admin') : $t('switch to conference')"
                :to="toggleContext"
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
        </header>
        <slot />
        <button
            class="btn btn-collapse tooltip"
            :class="{active: !$s.panels.context.collapsed}"
            :data-tooltip="$s.panels.context.collapsed ? $t('expand panel') : $t('collapse panel')"
            @click="toggleCollapse"
        >
            <Icon class="icon-small" :name="$s.panels.context.collapsed ? 'UncollapseHorizontal' : 'CollapseLeft'" />
        </button>
    </div>
</template>

<script>
import {defineComponent} from 'vue'

export default defineComponent({
    computed: {
        toggleContext() {
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
    methods: {
        closeContext(el, done) {
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
        toggleCollapse() {
            const space4 = Number(getComputedStyle(document.querySelector('.app')).getPropertyValue('--space-4').replace('px', ''))

            this.$s.panels.context.collapsed = !this.$s.panels.context.collapsed
            this.app.animate({
                duration: 350,
                from: this.$s.panels.context.collapsed ? 300 : space4,
                onFinish: () => {

                },
                onUpdate: v => {
                    this.$refs.panel.style.width = `${Math.floor(v)}px`
                },
                to: this.$s.panels.context.collapsed ? space4 : 300,
            })

        },
    },
})
</script>

<style lang="scss">
.c-panel-context {
    display: flex;
    flex-direction: column;
    position: relative;
    width: 300px;

    .btn-collapse {
        bottom: 0;
        color: var(--grey-6);
        height: var(--space-4);
        position: absolute;
        right: 0;
        width: var(--space-4);
    }

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
    }

    .presence {
        display: flex;
        flex-direction: column;

        .no-presence {

            .icon,
            .name {
                color: var(--grey-5);
            }
        }

        .actions {
            display: flex;

            .btn {
                cursor: pointer;
                margin: 0;
                padding: 0;

                &:disabled {
                    cursor: not-allowed;
                }
            }
        }

        .item {
            color: var(--grey-7);
            display: flex;
            overflow: visible;
            padding: calc(var(--spacer) / 2) var(--spacer);

            &.active {
                color: var(--primary-color);
            }

            .item-icon {
                align-items: center;
                display: flex;
                margin-right: var(--spacer);

                &.delete,
                &.unsaved {
                    color: var(--grey-6);
                }
            }

            .name {
                align-items: center;
                display: flex;
                flex: 1;
                font-family: var(--font-secondary);
                font-weight: 600;
                line-height: 100%;
            }

            .item-properties {
                display: flex;
                margin-top: var(--space-05);
            }
        }
    }

    &.collapsed {

        header {
            padding: 0;

            .logo {
                // display: flex;
                justify-content: center;

                svg {
                    margin: 0;
                }
            }

            .l-name {

                .name,
                .version {
                    display: none;
                }
            }

            .btn-collapse {
                height: 100%;
                width: 100%;
            }
        }

        .presence {

            .item {
                justify-content: center;

                .item-icon {
                    margin: 0;
                }

                .name {
                    display: none;
                }

                .context-menu {
                    display: none;
                }

                .stats {
                    display: none;
                }
            }

            .group-input {
                display: none;
            }
        }
    }
}
</style>
