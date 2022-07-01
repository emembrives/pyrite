<template>
    <RouterView />
</template>

<script>
import {defineComponent} from 'vue'

export default defineComponent({
    mounted() {
        let displayMode = 'browser'
        const mqStandAlone = '(display-mode: standalone)'
        if (navigator.standalone || window.matchMedia(mqStandAlone).matches) {
            displayMode = 'standalone'
        }

        // The title in standalone modus is set by the manifest name.
        if (displayMode === 'browser') {
            document.title = 'Pyrite Video'
        }
    },
})
</script>

<style lang="scss">
.app {
    align-items: stretch;
    background: var(--grey-1);
    display: flex;
    height: 100vh;
    overflow: hidden;
}
</style>

