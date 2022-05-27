<template>
    <div ref="panel" class="c-panel-context" :class="{collapsed: $s.panels.context.collapsed}">
        <header>
            <RouterLink
                v-if="!$s.group.connected"
                class="logo tooltip"
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
            <span v-else class="logo tooltip">
                <Icon class="icon" name="Logo" />
                <div class="l-name">
                    <div class="name">
                        PYRITE
                    </div>
                    <div class="version">
                        {{ version }}
                    </div>
                </div>
            </span>
        </header>
        <slot />
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
                if (this.$s.group.connected) {
                    const groupId = this.$s.group.name
                    return {name: 'conference-groups-connected', params: {groupId}}
                } else {
                    const groupId = this.$route.params.groupId

                    if (!groupId) {
                        return {name: 'conference-splash'}
                    } else {
                        return {name: 'conference-groups-disconnected', params: {groupId}}
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
    },
    watch: {
        '$s.panels.context.collapsed': function() {
            const space4 = Number(getComputedStyle(document.querySelector('.app')).getPropertyValue('--space-4').replace('px', ''))
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
    min-width: var(--space-4);
    position: relative;
    width: 300px;

    header {
        align-items: center;
        background: var(--grey-2);
        border-bottom: var(--border) solid var(--grey-4);
        display: flex;
        font-weight: bold;
        height: var(--space-4);
        padding-right: var(--spacer);
        position: relative;

        a.logo {
            cursor: pointer;
        }

        span.logo {
            cursor: default;
        }

        .logo {
            align-items: center;
            color: var(--primary-color);
            display: flex;
            font-family: var(--font-2);
            justify-content: flex-start;

            svg {
                color: var(--primary-color);
                margin-right: var(--spacer);
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
                font-family: var(--font-2);
                font-size: var(--text-xs);
                font-style: italic;
                position: absolute;
            }
        }
    }

    .presence {
        display: flex;
        flex: 1;
        flex-direction: column;

        .no-presence {

            .icon,
            .name {
                color: var(--grey-5);
            }
        }

        .actions {
            background: var(--grey-2);
            border-bottom: var(--border) solid var(--grey-4);
            display: flex;
            gap: var(--spacer);
            height: var(--space-4);
            justify-content: center;

            .btn {
                background: var(--grey-3);
                cursor: pointer;
                height: var(--space-3);
                margin: var(--spacer) 0;
                width: var(--space-3);

                &:disabled {
                    cursor: not-allowed;
                }
            }
        }

        .item {
            align-items: center;
            color: var(--grey-7);
            display: flex;
            height: var(--space-4);
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
                font-family: var(--font-2);
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
        width: var(--space-4);

        header {
            padding: 0;

            .logo {
                flex: 1;
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
        }

        .presence {

            .actions {
                align-items: center;
                background: none;
                flex-direction: column;
                gap: 2px;
                height: auto;
                padding: 4px;

                .btn {
                    height: 28px;
                    margin: 0;
                    width: 100%;
                }
            }

            .item {
                justify-content: center;

                &.active {

                    .item-icon {
                        color: var(--primary-color);
                    }
                }

                .item-icon {
                    margin: 0;
                }

                .name {
                    display: none;
                }

                .context-menu {
                    margin-right: var(--spacer);
                    position: absolute;
                    right: 0;
                    width: var(--spacer);

                    svg {
                        height: var(--space-1);
                        width: var(--space-1);
                    }
                }

                .stats {
                    display: none;
                }

                .item-properties {
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
