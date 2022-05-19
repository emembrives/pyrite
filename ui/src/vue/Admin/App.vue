<template>
    <div class="c-admin-app app" :class="`theme-${$s.theme.id}`">
        <PanelContext>
            <UsersList v-if="$route.name.startsWith('admin-users')" />
            <GroupsList v-else />
        </PanelContext>
        <Controls />
        <RouterView />
        <Notifications />
    </div>
</template>

<script>
import Controls from './Controls.vue'
import GroupsList from './Groups/List.vue'
import PanelContext from '@/vue/Elements/PanelContext.vue'
import UsersList from './Users/List.vue'

export default {
    components: {Controls, GroupsList, PanelContext, UsersList},
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
.c-admin-app {
    // Tone down greys to keep it clean...
    --grey-h: 0;
    --grey-s: 5%;
    --primary-color-h: 0;
    --primary-color-s: 40%;
    --primary-color: hsl(var(--primary-color-h) var(--primary-color-s) 65%);

    grid-template-columns: min-content var(--space-4) 1fr;
}
</style>
