<template>
    <label class="c-field-file">
        <Icon v-tip="{content: tooltip}" class="icon icon-small" name="Play" />
        <input
            ref="input"
            :accept="accept"
            type="file"
            @change="previewFiles"
            @click="resetInput"
        >
    </label>
</template>

<script>
import Field from './field'

export default {
    data() {
        return {
            files: this.modelValue,
            visible: false,
        }
    },
    emits: ['file', 'update:modelValue'],
    extends: Field,
    methods: {
        previewFiles(event) {
            const files = event.target.files
            for (let i = 0; i < files.length; i++) {
                this.$emit('file', files[i])
                this.files.push(files[i].name)
                this.$emit('update:modelValue', [...this.files])
            }
        },
        resetInput(e) {
            // Used to undo the action that is triggered by
            // adding one or more files.
            if (this.modelValue.length) {
                e.preventDefault()
                this.$refs.input.value = ''
                this.$emit('file', null)
                this.files = []
                this.$emit('update:modelValue', [...this.files])
            }
        },
    },
    props: {
        accept: {
            default: () => '',
            required: true,
            type: String,
        },
        modelValue: {
            required: true,
            type:Object,
        },
        tooltip: {
            default: () => '',
            required: false,
            type: String,
        },
    },
}
</script>

<style lang="scss">
.c-field-file {
    align-items: center;
    display: flex;
    height: var(--spacer-8);
    justify-content: center;
    left: 0;
    position: absolute;
    width: var(--spacer-8);

    input {
        color: var(--grey-6);
        height: var(--spacer-8);
        left: 0;
        opacity: 0;
        outline: none;
        position: absolute;
        width: 0;

        &::-webkit-file-upload-button {
            outline: none;
            visibility: hidden;
        }

        &:hover {
            cursor: pointer;
        }
    }
}
</style>
