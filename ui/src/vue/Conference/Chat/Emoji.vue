<template>
    <div class="c-emoji">
        <div
            v-for="emoji of $s.chat.emoji.list" :key="emoji"
            className="emoji"
            @click="onselect($event, emoji)"
        >
            {{ emoji }}
        </div>
    </div>
</template>

<script>
export default {
    props: {
        onselect: {
            required: true,
            type: Function,
        },
    },
}
</script>

<style lang="scss">
.c-emoji {
    align-items: center;
    display: grid;
    flex-wrap: wrap;
    grid-template-columns: repeat(auto-fill, minmax(30px, 40px));
    justify-content: center;
    overflow-y: scroll;

    .emoji {
        cursor: pointer;
        font-size: var(--text-xl);
        text-align: center;
        user-select: none;

        &:hover {
            background: var(--primary-c);
        }
    }
}

</style>
