<template>
    <div class="c-admin-app app" :class="`theme-${$s.theme.id}`">
        <PanelContext>
            <UsersContext v-if="$route.name.startsWith('admin-users')" />
            <GroupsContext v-else />
        </PanelContext>
        <Controls />
        <RouterView />
        <Notifications />
    </div>
</template>

<script>
import Controls from './Controls.vue'
import GroupsContext from './Groups/Context.vue'
import PanelContext from '@/vue/Elements/PanelContext.vue'
import UsersContext from './Users/Context.vue'

export default {
    components: {Controls, GroupsContext, PanelContext, UsersContext},
    data() {
        return {
            version: import.meta.env.VITE_VERSION,
        }
    },
    mounted() {
        const themeColor = getComputedStyle(document.querySelector('.app')).getPropertyValue('--grey-4')
        document.querySelector('meta[name="theme-color"]').content = themeColor
    },
}
</script>

<style lang="scss">
.app.c-admin-app {
    // Tone down greys to keep it clean
    --grey-h: 0;
    --grey-s: 5%;
    --primary-h: 0;
    --primary-s: 40%;
    --primary-c: hsl(var(--primary-h) var(--primary-s) 65%);

    grid-template-columns: min-content var(--spacer-8) 1fr;
}
</style>
