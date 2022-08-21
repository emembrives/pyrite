<template>
    <div class="c-field-radio-group field">
        <div class="checkbox-row">
            <div v-if="label" class="field-label">
                {{ label }}
            </div>
        </div>
        <div class="options">
            <div v-for="option in options" :key="option[0]" class="option">
                <input
                    :id="option[0]"
                    :checked="option[0] === modelValue"
                    name="same"
                    type="radio"
                    :value="option[0]"
                    @input="updateModel($event)"
                >
                <label :for="option[0]">{{ option[1] }}</label>
            </div>
        </div>
        <div v-if="help && !invalidFieldValue" class="help">
            {{ help }}
        </div>
    </div>
</template>

<script>
import Field from './field'

export default {

    emits: ['update:modelValue'],
    extends: Field,
    methods: {
        updateModel: function(event) {
            this.$emit('update:modelValue', event.target.value)
        },
    },
    props: {
        modelValue: {
            required: true,
            type: String,
        },
        options: {
            required: true,
            type: Array,
        },
    },
}
</script>

<style lang="scss">
.c-field-radio-group {

    .options {

        .option {

            label {
                color: var(--grey-7);
            }

            input:checked + label {
                color: var(--grey-8);
            }
        }
    }
}
</style>
