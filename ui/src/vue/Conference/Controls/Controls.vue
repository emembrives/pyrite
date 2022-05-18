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
                v-if="!$s.group.connected && $s.group.name" class="btn btn-menu tooltip"
                :class="{
                    active: ['conference-groups-connected', 'conference-groups-disconnected'].includes($route.name)
                }"
                :data-tooltip="$s.group.locked ? `${$t('current group')} (${$t('locked')})` : $t('current group')"
                :to="{name: 'conference-groups', params: {groupId: $s.group.name}}"
            >
                <Icon v-if="!$s.group.locked" class="icon-small" name="Group" />
                <Icon v-else class="icon-small" name="GroupLocked" />
            </RouterLink>

            <button
                v-if="$s.group.connected && $s.permissions.present"
                class="btn btn-menu tooltip tooltip-left"
                :class="{active: $s.user.data.raisehand}"
                :data-tooltip="$s.user.data.raisehand ? $t('hinting for speaking time') : $t('request speaking time')"
                @click="toggleRaiseHand"
            >
                <Icon class="hand icon-small" :class="{wave: $s.user.data.raisehand}" name="Hand" />
            </button>

            <Context v-if="$s.group.connected && $s.permissions.op" class="mb-1" />

            <button
                v-if="$s.group.connected"
                class="btn btn-menu btn-logout tooltip"
                :data-tooltip="$t('leave group')"
                @click="$m.sfu.disconnect"
            >
                <Icon class="icon-small" name="Logout" />
            </button>

            <button
                v-if="$s.group.connected"
                class="btn btn-menu tooltip btn-collapse"
                :class="{active: !$s.chat.hidden}"
                :data-tooltip="$s.chat.hidden ? $t('show chat panel') : $t('hide chat panel')"
                @click="$s.chat.hidden = !$s.chat.hidden"
            >
                <Icon class="icon-small" :name="$s.chat.hidden ? 'UncollapseHorizontal' : 'CollapseLeft'" />
            </button>
        </div>
    </nav>
</template>

<script>
import Context from './Context.vue'

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
    components: {Context},
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
        bottom: 0;
        position: absolute;
    }
}
</style>
