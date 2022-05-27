<template>
    <section class="c-groups-context presence">
        <div class="actions">
            <div class="custom-group">
                <Icon class="custom-group-icon icon-small" name="Group" />
                <input
                    v-model="$s.group.name" class="js-custom-group"
                    placeholder="..."
                    @focus="updateRoute"
                >
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
            <Icon v-if="!group.locked" class="item-icon icon-small" name="Group" />
            <Icon v-else class="item-icon icon-small" name="GroupLocked" />

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
                if (this.$router.currentRoute.value.name === 'conference-groups-disconnected') {
                    this.app.logger.debug(`updating group route: ${this.$s.group.name}`)
                    this.updateRoute()
                }
            },
        },
    },
}
</script>

<style lang="scss">
.c-groups-context {

    .actions {

        .custom-group {
            align-items: center;
            display: flex;
            flex: 1;
            height: var(--space-4);
            padding: calc(var(--spacer) / 2) var(--spacer);

            .custom-group-icon {
                align-items: center;
                display: flex;
                margin-right: var(--spacer);
            }

            input {
                background: none;
                border: none;
                color: var(--grey-7);
                flex: 1;
                font-family: var(--font-2);
                font-weight: 600;
                padding: var(--spacer) 0;

                &:active,
                &:focus-visible,
                &:focus {
                    border: none;
                    color: var(--primary-color);
                    outline: none;
                }
            }
        }
    }

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
