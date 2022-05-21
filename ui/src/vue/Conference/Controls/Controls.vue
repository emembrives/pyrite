<template>
    <nav class="c-general-controls">
        <div class="navigational-controls">
            <RouterLink
                v-if="!$s.group.connected"
                class="btn btn-menu tooltip"
                :class="{active: $route.name === 'conference-settings'}"
                :data-tooltip="$t('settings')"
                :to="{name: 'conference-settings', params: {tabId: 'misc'}}"
            >
                <Icon class="icon-small" name="Settings" />
            </RouterLink>
            <RouterLink
                v-else
                class="btn btn-menu tooltip"
                :class="{active: $route.name === 'conference-group-settings'}"
                :data-tooltip="$t('settings')"
                :to="settingsRoute"
            >
                <Icon class="icon-small" name="Settings" />
            </RouterLink>
            <RouterLink
                v-if="($s.group.name && !$s.group.connected) || $s.group.connected"
                class="btn btn-menu tooltip"
                :class="{
                    active: ['conference-groups-connected', 'conference-groups-disconnected'].includes($route.name)
                }"
                :data-tooltip="$s.group.locked ? `${$t('current group')} (${$t('locked')})` : $t('current group')"
                :to="$s.group.name ? {name: 'conference-groups', params: {groupId: $s.group.name}} : {name: 'conference-main'}"
            >
                <Icon v-if="!$s.group.locked" class="icon-small" name="Group" />
                <Icon v-else class="icon-small" name="GroupLocked" />
            </RouterLink>
            <button
                v-else
                class="btn btn-menu btn-logout tooltip"
                :data-tooltip="$t('current group')"
                :disabled="true"
            >
                <Icon class="icon-small" name="Group" />
            </button>

            <button
                v-if="$s.group.connected"
                class="btn btn-menu btn-logout tooltip"
                :data-tooltip="$t('leave group')"
                @click="$m.sfu.disconnect"
            >
                <Icon class="icon-small" name="Logout" />
            </button>

            <button
                v-if="$s.group.connected && $s.permissions.present"
                class="btn btn-menu tooltip tooltip-right"
                :class="{active: $s.user.data.raisehand}"
                :data-tooltip="$s.user.data.raisehand ? $t('hinting for speaking time') : $t('request speaking time')"
                @click="toggleRaiseHand"
            >
                <Icon class="hand icon-small" :class="{wave: $s.user.data.raisehand}" name="Hand" />
            </button>

            <ContextMenu v-if="$s.group.connected && $s.permissions.op" />
        </div>
        <button
            class="btn btn-collapse tooltip"
            :class="{active: !$s.panels.context.collapsed}"
            :data-tooltip="$s.panels.context.collapsed ? $t('expand panel') : $t('collapse panel')"
            @click="toggleCollapse"
        >
            <Icon class="icon-small" :name="$s.panels.context.collapsed ? 'ExpandRight' : 'CollapseLeft'" />
        </button>
    </nav>
</template>

<script>
import ContextMenu from './ContextMenu.vue'

export default {
    computed: {
        settingsRoute() {
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
        height: var(--space-4);
        width: var(--space-4);
    }
}
</style>
