<template>
    <section v-if="$s.admin.authenticated && $s.admin.permission" class="c-admin-groups-context presence">
        <div class="actions">
            <button class="btn" :disabled="!$s.admin.group" @click="toggleMarkDelete">
                <Icon
                    v-tip="{content: $s.admin.group && $s.admin.group._delete ? $t('undo mark deletion') : $t('mark for deletion')}"
                    class="item-icon icon-small"
                    name="Minus"
                />
            </button>
            <button class="btn">
                <Icon
                    v-tip="{content: $t('add group')}" class="item-icon icon-small"
                    name="Plus"
                    @click="addGroup"
                />
            </button>
            <button class="btn" :disabled="!deletionGroups.length" @click="deleteGroups">
                <Icon
                    v-tip="{content: `${$tc('confirm deletion of {amount} group | confirm deletion of {amount} groups', {amount: deletionGroups.length})}`}"
                    class="icon-small"
                    name="Trash"
                />
            </button>
            <button class="btn" :disabled="!$s.admin.group" @click="saveGroup">
                <Icon v-tip="{content: $t('store group')}" class="icon-small" name="Save" />
            </button>
        </div>

        <RouterLink
            v-for="group of orderedGroups"
            :key="group._name"
            class="group item"
            :class="{active: $route.params.groupId === group._name}"
            :to="groupLink(group._name)"
        >
            <Icon
                v-tip="{content: `${$t('group')} ${group._name}`}"
                class="item-icon icon-small"
                :class="{
                    delete: group._delete,
                    unsaved: group._unsaved
                }"
                :name="group._delete ? 'Trash' : 'Group'"
            />

            <div class="flex-column">
                <div class="name">
                    {{ group._name }}
                </div>
                <div class="item-properties">
                    <Icon
                        class="icon-tiny"
                        :name="group.public ? 'Eye' : 'EyeClosed'"
                    />
                    <Icon
                        class="icon-tiny"
                        :name="group.locked ? 'Lock' : 'Unlock'"
                    />
                </div>
            </div>
        </RouterLink>
        <div v-if="!orderedGroups.length" class="group item no-presence">
            <Icon class="item-icon icon-small" name="Group" />
            <div class="name">
                {{ $t('no groups yet') }}
            </div>
        </div>
    </section>
</template>

<script>
export default {
    computed: {
        deletionGroups() {
            return this.$s.admin.groups.filter((i) => i._delete)
        },
        /**
         * List the non-public groups at the bottom, so the group list
         * at the upper side is the same as the public group list
         * for users.
         */
        orderedGroups() {
            const groups = this.$s.admin.groups
                .filter((g) => g.public).concat(this.$s.admin.groups.filter((g) => !g.public))
            return groups.sort((a, b) => {
                if ( a._name < b._name) return -1
                if ( a._name > b._name) return 1
                return 0
            })
        },
    },
    data() {
        return {
            selected: null,
        }
    },
    methods: {
        async addGroup() {
            const group = await this.app.api.get('/api/groups/template')
            this.$s.admin.groups.push(group)
            this.toggleSelection(group._name)
        },
        async deleteGroups() {
            this.app.notifier.notify({level: 'info', message: this.$tc('deleting one group | deleting {count} groups', this.deletionGroups.length)})
            const deleteRequests = []
            for (const group of this.deletionGroups) {
                this.$s.admin.groups.splice(this.$s.admin.groups.findIndex((i) => i._name === group._name), 1)
                if (!group._unsaved) {
                    deleteRequests.push(fetch(`/api/groups/${group._name}/delete`))
                }
            }

            await Promise.all(deleteRequests)

            if (this.orderedGroups.length) {
                const groupId = this.orderedGroups[0]._name
                this.$router.push({name: 'admin-groups-settings', params: {groupId, tabId: 'misc'}})
            }
        },
        /**
         * The group link depends on the context, e.g. whether a user
         * may currently be watching the recordings view or group settings.
         */
        groupLink(groupId) {
            if (this.$s.admin.group && this.$s.admin.group._name == groupId) {
                return {name: this.$route.name}
            } else {
                return {name: this.$route.name, params: {groupId, tabId: 'misc'}}
            }
        },
        async loadGroups() {
            this.$s.admin.groups = await this.app.api.get('/api/groups')
        },
        async saveGroup() {
            const groupId = this.$s.admin.group._name
            const group = await this.$m.group.saveGroup(groupId, this.$s.admin.group)

            // Select the next unsaved group to speed up group creation.
            if (this.$s.admin.group._unsaved) {
                const nextGroupIndex = this.orderedGroups.findIndex((g) => g._unsaved)
                if (nextGroupIndex >= 0) {
                    this.toggleSelection(this.orderedGroups[nextGroupIndex]._name)
                }
            } else {
                // Reload the group, which may have been renamed.
                this.$router.push({name: 'admin-groups-settings', params: {groupId: group._name, tabId: 'misc'}})
            }
        },
        async toggleMarkDelete() {
            this.$s.admin.group._delete = !this.$s.admin.group._delete
            for (let group of this.$s.admin.groups) {
                if (group._name == this.$s.admin.group._name) {
                    group._delete = this.$s.admin.group._delete
                }
            }

            const similarStateGroups = this.orderedGroups.filter((i) => i._delete !== this.$s.admin.group._delete)
            if (similarStateGroups.length) {
                this.toggleSelection(similarStateGroups[0]._name)
            }
        },
        toggleSelection(groupId) {
            this.$router.push({name: this.$route.name, params: {groupId}})
        },
    },
    unmounted() {
        this.$s.admin.group = null
    },
}
</script>

<style lang="scss">
.c-admin-groups-context {

    .row {
        color: var(--grey-7);
    }
}
</style>
