<template>
    <div class="c-admin-group content">
        <header>
            <div class="notice" />
            <div class="title">
                <span v-if="$s.admin.group">{{ $s.admin.group._name }}</span>
                <Icon class="icon icon-regular" name="Group" />
            </div>
        </header>

        <ul class="tabs">
            <RouterLink
                active-class="active-group"
                class="btn btn-menu tab"
                :class="{active: tabId === 'misc'}"
                :to="routeSettings('misc')"
            >
                <Icon v-tip="{content: $t('group settings')}" class="icon-small" name="Pirate" />
            </RouterLink>

            <RouterLink
                active-class="active-group"
                class="btn btn-menu tab"
                :class="{active: tabId === 'access'}"
                :to="routeSettings('access')"
            >
                <Icon v-tip="{content: $t('access')}" class="icon-small" name="Access" />
            </RouterLink>

            <RouterLink
                active-class="active-group"
                class="btn btn-menu tab"
                :class="{active: tabId === 'permissions'}"
                :to="routeSettings('permissions')"
            >
                <Icon v-tip="{content: $t('permissions')}" class="icon-small" name="Operator" />
            </RouterLink>

            <RouterLink
                active-class="active-group"
                class="btn btn-menu tab"
                :class="{active: tabId === 'stats'}"
                :disabled="!$s.group._unsaved"
                :to="routeSettings('stats')"
            >
                <Icon v-tip="{content: $t('connection statistics')}" class="icon-small" name="Stats" />
            </RouterLink>

            <RouterLink
                active-class="active-group"
                class="btn btn-menu tab"
                :class="{active: tabId === 'recordings'}"
                :to="routeSettings('recordings')"
            >
                <Icon v-tip="{content: $t('group recordings')}" class="icon-small" name="Record" />
            </RouterLink>
        </ul>

        <div class="tabs-content">
            <TabMisc v-if="tabId === 'misc'" />
            <TabAccess v-else-if="tabId === 'access'" />
            <TabPermissions v-else-if="tabId === 'permissions'" />
            <Stats v-else-if="tabId === 'stats'" :group-id="groupId" />
            <Recordings v-else-if="tabId === 'recordings'" :group-id="groupId" />

            <div v-if="$route.name === 'admin-groups-settings'" class="actions">
                <button
                    class="btn btn-menu btn-save"
                    @click="saveGroup"
                >
                    <Icon v-tip="{content: $t('store group')}" class="icon-small" name="Save" />
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import {defineComponent} from 'vue'
import Recordings from '@/vue/Admin/Groups/Group/Recordings.vue'
import Stats from '@/vue/Admin/Groups/Group/Stats.vue'
import TabAccess from './TabAccess.vue'
import TabMisc from './TabMisc.vue'
import TabPermissions from './TabPermissions.vue'

export default defineComponent({
    components: {Recordings, Stats, TabAccess, TabMisc, TabPermissions},
    computed: {
        currentGroup: () => this.$m.group.currentGroup(),
        tabId() {
            return this.$route.query.tab || 'misc'
        },
    },
    methods: {
        routeSettings(tabId) {
            return {
                params: {groupId: this.groupId},
                query: {tab: tabId},
                to: 'admin-groups-settings',
            }
        },
        async saveGroup() {
            const group = await this.$m.group.saveGroup(this.groupId, this.$s.admin.group)
            this.$router.push({name: 'admin-groups-settings', params: {groupId: group._name}, query: this.$route.query})
        },
    },
    props: {
        groupId: {
            default: () => null,
            required: false,
            type: String,
        },
    },
})
</script>

<style lang="scss">
.btn-save {
    margin-bottom: var(--spacer-2);
}
</style>
