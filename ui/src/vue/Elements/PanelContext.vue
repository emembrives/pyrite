<template>
    <div ref="panel" class="c-panel-context" :class="{collapsed: $s.panels.context.collapsed}">
        <header>
            <RouterLink
                v-if="!$s.group.connected"
                v-tip="{content: $route.name.includes('conference-') ? $t('switch to admin') : $t('switch to conference')}"
                class="logo"
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
            <span v-else class="logo">
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
        '$s.env.layout': function(layout) {
            if (layout === 'tablet') {
                this.$s.panels.context.collapsed = true
            }
        },
        '$s.panels.context.collapsed': function() {
            const space4 = Number(getComputedStyle(document.querySelector('.app')).getPropertyValue('--spacer-8').replace('px', ''))
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
    min-width: var(--spacer-8);
    position: relative;
    width: 300px;

    header {
        align-items: center;
        background: var(--grey-2);
        border-bottom: var(--border) solid var(--grey-4);
        display: flex;
        font-weight: bold;
        height: var(--spacer-8);
        padding-right: var(--spacer-1);
        position: relative;

        a.logo {
            cursor: pointer;
        }

        span.logo {
            cursor: default;
        }

        .logo {
            align-items: center;
            color: var(--primary-c);
            display: flex;
            flex: 1;
            font-family: var(--font-2);
            height: 100%;
            justify-content: flex-start;

            svg {
                color: var(--primary-c);
                margin-right: var(--spacer-1);
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
                bottom: var(--spacer-1);
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
            background: var(--grey-3);
            border-bottom: var(--border) solid var(--grey-4);
            display: flex;
            gap: var(--spacer-1);
            height: var(--spacer-8);
            padding: 0 var(--spacer-1);

            .btn {
                background: var(--grey-2);
                border: var(--border) solid var(--grey-4);
                border-radius: 50%;
                cursor: pointer;
                height: var(--spacer-6);
                margin: var(--spacer-1) 0;
                width: var(--spacer-6);

                &:disabled {
                    cursor: not-allowed;
                }

                &:hover {
                    background: var(--grey-4);
                }
            }
        }

        .item {
            align-items: center;
            color: var(--grey-7);
            cursor: pointer;
            display: flex;
            height: var(--spacer-8);
            overflow: visible;
            padding: calc(var(--spacer-1) / 2) var(--spacer-1);
            width: 100%;

            &.active {
                color: var(--primary-c);
            }

            .item-icon {
                align-items: center;
                display: flex;
                margin-right: var(--spacer-1);

                &.delete,
                &.unsaved {
                    color: var(--grey-4);
                }
            }

            .flex-column {
                flex: 1;
                justify-content: center;

                .item-properties {
                    font-size: var(--text-s);
                }
            }

            .name {
                align-items: center;
                display: flex;
                flex: 1;
                font-family: var(--font-2);
                font-weight: 600;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }

    &.collapsed {
        width: var(--spacer-8);

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
                flex-flow: row wrap;
                gap: 2px;
                height: var(--spacer-8);
                padding: 2px;

                .btn {
                    height: auto;
                    margin: 0;
                    padding: 4px;
                    width: auto;

                    svg {
                        height: var(--spacer-2);
                        width: var(--spacer-2);
                    }
                }
            }

            .item {
                justify-content: center;

                &.active {

                    .item-icon {
                        color: var(--primary-c);
                    }
                }

                .flex-column {
                    display: none;
                }

                .item-icon {
                    margin: 0;
                }

                .name {
                    position: relative;

                    .username {
                        display: none;
                    }

                    .permissions {
                        display: none;
                    }

                    .status {
                        position: absolute;
                        right: var(--spacer-1);
                        top: var(--spacer-4);

                        svg {
                            height: var(--spacer-2);
                            width: var(--spacer-2);
                        }
                    }
                }

                .context-menu {
                    margin-right: var(--spacer-1);
                    position: absolute;
                    right: 0;
                    width: var(--spacer-1);

                    svg {
                        height: var(--spacer-2);
                        width: var(--spacer-2);
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
