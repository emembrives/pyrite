<template>
    <nav class="c-admin-controls">
        <div class="navigational-controls">
            <RouterLink
                class="btn btn-menu tooltip"
                :class="{active: $route.name.startsWith('admin-users')}"
                :data-tooltip="$t('people')"
                :to="userRoute('admin-users-settings')"
            >
                <Icon class="icon-small" name="User" />
            </RouterLink>

            <RouterLink
                active-class="active-group"
                class="btn btn-menu tooltip"
                :class="{active: $route.name === 'admin-groups-settings'}"
                :data-tooltip="$t('groups')"
                :to="groupRoute('admin-groups-settings')"
            >
                <Icon class="icon-small" name="Group" />
            </RouterLink>

            <button
                v-if="$s.admin.authenticated && $s.admin.permission"
                class="btn btn-menu btn-logout tooltip"
                :data-tooltip="$t('log out')"
                @click="logout"
            >
                <Icon class="icon-small" name="Logout" />
            </button>
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
export default {
    methods: {
        groupRoute(name) {
            if (this.$s.admin.group) {
                return {name, params: {groupId: this.$s.admin.group._name, tabId: 'misc'}}
            } else {
                return {name, params: {tabId: 'misc'}}
            }
        },
        async logout() {
            const context = await this.app.api.get('/api/logout')
            Object.assign(this.$s.admin, context)
            this.$router.push({name: 'admin-login'})
        },
        toggleCollapse() {
            this.$s.panels.context.collapsed = !this.$s.panels.context.collapsed
            app.store.save()
        },
        userRoute(name) {
            if (this.$s.admin.user) {
                return {name, params: {tabId: 'misc', userId: this.$s.admin.user.id}}
            } else {
                return {name: 'admin-users-settings'}
            }
        },
    },
}
</script>

<style lang="scss">
.c-admin-controls {
    background: var(--grey-4);
    display: flex;
    flex-direction: column;
    height: 100vh;
    justify-content: space-between;

    .btn-collapse {
        color: var(--grey-6);
        height: var(--spacer-8);
        width: var(--spacer-8);
    }
}
</style>
