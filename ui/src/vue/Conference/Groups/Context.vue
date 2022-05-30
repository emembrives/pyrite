<template>
    <section class="c-groups-context presence" :class="{collapsed: $s.panels.context.collapsed}">
        <div class="actions">
            <div
                class="group item unlisted-group"
                :class="{active: $route.name !== 'conference-splash' && !isListedGroup}"
                @click="toggleUnlisted"
            >
                <button>
                    <Icon v-tip="{content: $t('join unlisted group')}" class="icon-small item-icon" name="Incognito" />
                </button>
                <div v-if="isListedGroup || !$s.group.name" class="name">
                    {{ $t('unlisted-group') }}
                </div>
                <div v-else class="name">
                    {{ $s.group.name }}
                </div>
            </div>
        </div>
        <RouterLink
            v-for="group of $s.groups"
            :key="group.name"
            class="group item"
            :class="{active: $s.group.name === group.name}"
            :to="groupLink(group.name)"
            @click="setAutofocus"
        >
            <button>
                <Icon
                    v-tip="{content: `${$t('group')}: ${group.name} (${group.clientCount})`}"
                    class="icon-small"
                    :name="group.locked ? 'GroupLocked' : 'Group'"
                />
            </button>

            <div class="name">
                {{ group.name }}
            </div>

            <div class="stats" :class="{active: group.clientCount > 0}">
                {{ group.clientCount }}
                <Icon class="icon-small" name="User" />
            </div>
        </RouterLink>
        <div v-if="!$s.groups.length" class="group item no-presence">
            <Icon class="item-icon icon-small" name="Group" />
            <div class="name">
                {{ $t('no public groups') }}
            </div>
        </div>
    </section>
</template>

<script>
export default {
    computed: {
        isListedGroup() {
            return !!app.$s.groups.find((i) => i.name === app.$s.group.name)
        },
    },
    methods: {
        groupLink(groupId) {
            if (this.$s.group && this.$s.group.name === groupId) {
                return {name: 'conference-splash'}
            } else {
                return {name: 'conference-groups', params: {groupId}}
            }
        },
        async pollGroups() {
            this.$s.groups = await this.app.api.get('/api/groups/public')
            for (const group of this.$s.groups) {
                if (group.name === this.$s.group.name) {
                    Object.assign(this.$s.group, group)
                }
            }
        },
        setAutofocus() {
            this.$s.login.autofocus = true
        },
        toggleUnlisted() {
            if (!this.$s.group.name || this.isListedGroup) {
                this.$s.group.name = this.$t('unlisted-group')
            } else if (!this.isListedGroup) {
                this.$s.group.name = ''
            }
        },
        updateRoute() {
            this.$s.login.autofocus = false

            if (this.$s.group.name) {
                // Assume unlocked, when there are no public groups
                this.$s.group.locked = this.$s.groups.find((i) => i.name === this.$s.group.name)?.locked || false

                // Update the group route when the user sets the group name.
                this.$router.replace({name: 'conference-groups', params: {groupId: this.$s.group.name}})
            } else {
                // By default show the splash page when emptying the group input.
                this.$router.replace({name: 'conference-splash'})
            }
        },
    },
    async mounted() {
        this.intervalId = setInterval(this.pollGroups, 3000)
        this.pollGroups()
    },
    unmounted() {
        clearInterval(this.intervalId)
    },
    watch: {
        /**
         * Note that the behaviour is that using the custom group
         * input does NOT trigger the 'user-groups-disconnected' view,
         * while using the listed groups selection does. This is
         * intended behaviour to keep the history clean.
         */
        '$s.group.name': {
            immediate: false,
            handler() {

                this.app.logger.debug(`updating group route: ${this.$s.group.name}`)
                this.updateRoute()

            },
        },
    },
}
</script>

<style lang="scss">
.c-groups-context {

    .group {

        .stats {
            align-items: center;
            display: flex;
            transition: all 0.25s ease-in;

            &.active {
                color: var(--grey-8);
            }
        }
    }

    .custom-group {
        padding-left: 0;
    }
}
</style>
