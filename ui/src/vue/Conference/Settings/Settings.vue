<template>
    <div class="c-settings content">
        <header>
            <div class="notice" />
            <div class="title">
                <span>{{ $t('settings') }}</span>
                <Icon class="item-icon icon-regular" name="Settings" />
            </div>
        </header>
        <ul class="tabs">
            <RouterLink
                class="btn btn-menu tab"
                :to="{name: settingsRoute, params: {tabId: 'devices'}}"
            >
                <Icon v-tip="{content: $t('devices')}" class="icon-small" name="Webcam" />
            </RouterLink>
            <RouterLink
                class="btn btn-menu tab"
                :to="{name: settingsRoute, params: {tabId: 'media'}}"
            >
                <Icon v-tip="{content: $t('media')}" class="icon-small" name="Media" />
            </RouterLink>
            <RouterLink
                class="btn btn-menu tab"
                :to="{name: settingsRoute, params: {tabId: 'misc'}}"
            >
                <Icon v-tip="{content: $t('miscellaneous')}" class="icon-small" name="Pirate" />
            </RouterLink>
        </ul>

        <div class="tabs-content">
            <TabDevices v-if="$route.params.tabId === 'devices'" />
            <TabMedia v-else-if="$route.params.tabId === 'media'" />
            <TabMisc v-else-if="$route.params.tabId === 'misc'" />

            <div class="actions">
                <button
                    class="btn btn-menu"
                    @click="saveSettings"
                >
                    <Icon v-tip="{content: $t('save settings')}" class="icon-small" name="Save" />
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import TabDevices from './TabDevices.vue'
import TabMedia from './TabMedia.vue'
import TabMisc from './TabMisc.vue'

export default {
    computed: {
        settingsRoute() {
            if (this.$s.group.connected) {
                return 'conference-group-settings'
            } else {
                return 'conference-settings'
            }
        },
    },
    components: {TabDevices, TabMedia, TabMisc},
    methods: {
        saveSettings() {
            this.app.i18n.global.locale = this.$s.language.id
            this.app.logger.debug(`settings language to ${this.$s.language.id}`)
            this.app.store.save()
            this.app.notifier.notify({icon: 'Settings', level: 'info', message: this.$t('Settings saved')})
        },
    },
}
</script>
