<template>
    <div class="c-hint">
        <Icon class="item-icon icon-small" name="Info" />
        <div class="explanation">
            {{ text }}
        </div>
    </div>
</template>

<script>
export default {
    props: {
        text: {
            type: String,
            default() {return ''},
        },
    },
}
</script>

<style lang="scss">
.c-hint {
    align-items: center;
    display: flex;

    .icon {
        color: var(--primary-c);
        margin-right: var(--spacer-1);
    }

    .explanation {
        color: var(--grey-7);
        font-size: var(--text-s);
        font-style: italic;
    }
}

</style>
