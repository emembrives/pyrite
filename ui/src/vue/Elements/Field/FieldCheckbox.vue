<template>
    <div class="c-field-checkbox field">
        <div class="checkbox-row">
            <div v-if="label" class="field-label">
                {{ label }}
            </div>
            <label class="switch" :class="elementclass" :for="name">

                <input
                    :id="name"
                    :checked="modelValue === toggle[0] ? false : true"
                    :class="elementclass"
                    :disabled="disabled"
                    :name="name"
                    type="checkbox"
                    @change="updateModel($event)"
                >
                <span class="slider" />
            </label>
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
            this.$emit('update:modelValue', event.target.checked ? this.toggle[1] : this.toggle[0])
        },
    },
    props: {
        modelValue: {
            required: true,
            type: [Boolean, String],
        },
        toggle: {
            default: () => [false, true],
            required: false,
            type: Array,
        },
    },
}
</script>

<style lang="scss">
.c-field-checkbox {

    .checkbox-row {
        align-items: flex-start;
        display: flex;
        flex-direction: column;

        label.switch {
            height: calc(var(--spacer-1) * 3);
            margin-right: var(--spacer-1);
            margin-top: var(--spacer-05);
            position: relative;
            user-select: none;
            width: calc(var(--spacer-1) * 5);

            .slider {
                background-color: var(--grey-1);
                border-radius: calc(var(--spacer-1) * 2);
                bottom: 0;
                cursor: pointer;
                left: 0;
                position: absolute;
                right: 0;
                top: 0;

                &::before {
                    background: var(--grey-6);
                    border-radius: 50%;
                    bottom: calc(var(--spacer-1) / 2);
                    content: "";
                    height: calc(var(--spacer-1) * 2);
                    left: calc(var(--spacer-1) / 2);
                    position: absolute;
                    transition: 0.4s;
                    width: calc(var(--spacer-1) * 2);
                }
            }

            input {
                height: 0;
                opacity: 0;
                width: 0;

                + .slider {

                    svg {
                        transition: all 0.5s ease-in-out;
                    }
                }

                &:checked + .slider {
                    background: var(--primary-c);

                    &::before {
                        background: var(--grey-4);
                        transform: translateX(calc(var(--spacer-1) * 2));
                    }
                }
            }
        }
    }
}
</style>
