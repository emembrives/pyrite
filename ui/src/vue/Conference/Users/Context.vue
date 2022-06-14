<template>
    <section class="c-users-context presence">
        <div
            v-for="user of sortedUsers"
            :key="user.id"
            class="user item"
        >
            <Icon
                v-tip="{content: `${$t('user')} ${user.username}`}"
                class="icon item-icon icon-small"
                :class="className(user)"
                :name="user.data.raisehand ? 'Hand' : 'User'"
            />

            <div class="name">
                <div v-if="user.username" class="username">
                    {{ user.username }}
                </div>
                <div v-else class="username">
                    '(anon)'
                </div>
                <div v-if="$s.users[0].id === user.id" class="username">
                    (you)
                </div>

                <div class="status">
                    <Icon v-if="user.data.mic" class="icon icon-mini" name="Mic" />
                    <Icon v-else class="icon icon-mini error" name="MicMute" />
                </div>

                <div class="permissions">
                    <span v-if="user.permissions.present">
                        <Icon v-tip="{content: $t('presenter role')}" class="icon icon-mini" name="Present" />
                    </span>
                    <span v-if="user.permissions.op">
                        <Icon v-tip="{content: $t('operator role')}" class="icon icon-mini" name="Operator" />
                    </span>
                </div>
            </div>

            <ContextMenu v-if="user.username !== 'RECORDING'" :user="user" />
        </div>
    </section>
</template>

<script>
import ContextMenu from './ContextMenu.vue'

export default {
    components: {ContextMenu},
    computed: {
        sortedUsers() {
            const users = [...this.$s.users]
            users.sort(function(a, b) {
                const aLowerName = a.username.toLowerCase()
                const bLowerName = b.username.toLowerCase()
                if (aLowerName < bLowerName) return -1
                else if (aLowerName > bLowerName) return +1
                else if (a.username < b.username) return -1
                else if (a.username > b.username) return +1
                return 0
            })
            return users
        },
    },
    methods: {
        className(user) {
            const classes = {}
            if (user.data.raisehand) {
                classes.hand = true
            }
            if (user.data.availability) {
                if (user.data.availability.id === 'away') {
                    classes.away = true
                } else if (user.data.availability.id === 'busy') {
                    classes.busy = true
                }
            }

            return classes
        },
    },
}
</script>

<style lang="scss">
.c-users-context.presence {

    .user {
        font-family: var(--font-2);

        .item-icon {

            &.away {
                color: var(--warning-color);
            }

            &.busy {
                color: var(--error-color);
            }

            &.hand {
                animation-duration: 2.5s;
                animation-iteration-count: infinite;
                animation-name: wave-animation;
                transform-origin: center bottom;
            }
        }

        .name {
            display: flex;
            height: 100%;
            margin-bottom: 0;

            .permissions {
                align-items: center;
                display: flex;
                height: 100%;
                justify-content: center;
                margin-left: calc(var(--spacer-1) / 2);

                .status {
                    align-items: center;
                    display: flex;
                    height: 100%;
                    margin-right: var(--spacer-1);
                }

                span {
                    display: flex;
                }
            }
        }
    }
}
</style>
