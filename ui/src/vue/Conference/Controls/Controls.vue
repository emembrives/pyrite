<template>
    <nav class="c-general-controls">
        <div class="navigational-controls">
            <RouterLink
                class="btn btn-menu"
                :class="{active: $route.name === 'conference-settings'}"
                :to="settingsRoute"
            >
                <Icon v-tip="{content: $t('settings')}" class="icon-small" name="Settings" />
            </RouterLink>
            <RouterLink
                class="btn btn-menu"
                :class="{
                    active: ['conference-groups-connected', 'conference-groups-disconnected'].includes($route.name)
                }"
                :disabled="(!$s.group.name && !$s.group.connected) ? true : null"
                :to="groupRoute"
            >
                <Icon
                    v-tip="{content: $s.group.locked ? `${$t('current group')} (${$t('locked')})` : $t('current group')}"
                    class="icon-small" :name="$s.group.locked ? 'GroupLocked' : 'Group'"
                />
            </RouterLink>

            <button
                v-if="$s.group.connected"
                v-tip="{content: $t('leave group')}"
                class="btn btn-menu btn-logout"
                @click="$m.sfu.disconnect"
            >
                <Icon class="icon-small" name="Logout" />
            </button>

            <button
                v-if="$s.group.connected && $s.permissions.present"
                class="btn btn-menu"
                :class="{active: $s.user.data.raisehand}"
                @click="toggleRaiseHand"
            >
                <Icon
                    v-tip="{content: $s.user.data.raisehand ? $t('hinting for speaking time') : $t('request speaking time')}" class="hand icon-small"
                    :class="{wave: $s.user.data.raisehand}"
                    name="Hand"
                />
            </button>

            <ContextMenu v-if="$s.group.connected && $s.permissions.op" />
        </div>
        <button
            v-if="$s.env.layout === 'desktop'"
            class="btn btn-collapse"
            :class="{active: !$s.panels.context.collapsed}"
            @click="toggleCollapse"
        >
            <Icon
                v-tip="{content: $s.panels.context.collapsed ? $t('expand panel') : $t('collapse panel')}"
                class="icon-small" :name="$s.panels.context.collapsed ? 'ExpandRight' : 'CollapseLeft'"
            />
        </button>
    </nav>
</template>

<script>
import ContextMenu from './ContextMenu.vue'

export default {
    computed: {
        groupRoute() {
            if (this.$s.group.name) {
                return {name: 'conference-groups', params: {groupId: this.$s.group.name}}
            } else {
                return {name: 'conference-main'}
            }
        },
        settingsRoute() {
            if (!this.$s.group.connected) {
                return {name: 'conference-settings', params: {tabId: 'misc'}}
            }

            if (this.$router.currentRoute.value.name ===  'conference-group-settings') {
                return {groupId: this.$s.group.name, name: 'conference-groups-connected'}
            } else {
                return {name: 'conference-group-settings', params: {tabId: 'misc'}}
            }
        },
    },
    components: {ContextMenu},
    methods: {
        toggleCollapse() {
            this.$s.panels.context.collapsed = !this.$s.panels.context.collapsed
            app.store.save()
        },
        toggleRaiseHand() {
            this.$m.sfu.connection.userAction('setdata', this.$m.sfu.connection.id, {raisehand: !this.$s.user.data.raisehand})
            if (!this.$s.user.data.raisehand) {
                this.app.notifier.message('raisehand', {source: this.$s.user.name}, null, {chat: true, notification: false})
            }
        },
    },
}
</script>

<style lang="scss">
.c-general-controls {
    background: var(--grey-4);
    border-left: var(--border) solid var(--grey-4);
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .btn-collapse {
        color: var(--grey-6);
        height: var(--spacer-8);
        width: var(--spacer-8);
    }
}
</style>
