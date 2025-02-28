<template>
    <div v-click-outside="toggleSelect.bind(this)" class="c-field-select field">
        <div class="label-container">
            <label class="field-label uc" :for="`${uniqueId}-${name}`">{{ label }}</label>
            <slot class="label-extra" name="header" />
        </div>

        <div class="input-container">
            <div class="button-wrapper">
                <input
                    v-if="options && options.length"
                    :id="`${uniqueId}-${name}`"
                    ref="input"
                    v-model="searchQuery"
                    autocomplete="off"
                    :disabled="disabled"
                    :placeholder="currentOption"
                    :readonly="!search"
                    @click="handleEvent(null, null, false)"
                    @input="handleEvent(null, 'query', false)"
                    @keydown.down="handleEvent(null, 'down', false)"
                    @keydown.page-down="handleEvent(null, 'page-down', false)"
                    @keydown.page-up="handleEvent(null, 'page-up', false)"
                    @keydown.up="handleEvent(null, 'up', false)"
                    @keyup.enter="handleEvent(null, 'enter', true)"
                    @keyup.escape="active = false"
                >

                <slot class="button" name="button" />
            </div>

            <div
                ref="options"
                class="options"
                :class="{active}"
            >
                <div
                    v-for="option in options"
                    :id="`${uniqueId}-option-${option.id}`"
                    :key="option.id"
                    class="option"
                    :class="{selected: searchSelected.id === option.id}"
                    @click="handleEvent(option, null, true)"
                >
                    {{ option.name }}
                </div>
            </div>
        </div>
        <div v-if="searchSelected.help" class="help ucfl">
            {{ searchSelected.help }}
        </div>
        <div v-else-if="help" class="help ucfl">
            {{ help }}
        </div>
    </div>
</template>

<script>
import Field from './field'

export default {
    beforeMount() {
        this.uniqueId = Math.random().toString(36).substr(2, 9)
    },
    computed: {
        currentOption() {
            if (this.modelValue && this.modelValue.id) {
                const currentOption = this.options.find((o) => o.id === this.modelValue.id)

                if (currentOption) {
                    return this.$t(currentOption.name)
                }
            }
            return this.placeholder
        },
    },
    data: function() {
        return {
            active: false,
            searchQuery: '',
            searchSelected: this.modelValue,
            selectedOption: null,
        }
    },
    emits: ['update:modelValue'],
    extends: Field,
    methods: {
        emptySelectOption: function() {
            // Handle syncing an empty option to the model.
            let emptyOption = {id: null, name: null}
            // Use the first option to determine additional keys.
            if (this.options.length) {
                for (let key of Object.keys(this.options[0])) {
                    emptyOption[key] = null
                }
            }
            return emptyOption
        },
        handleEvent(option, keyModifier, updateModel) {
            this.active = true

            if (option) {
                // Option click select.
                this.selectedOption = option
            } else if (keyModifier) {
                this.navigate(keyModifier)
            } else {
                // Click/focus.
                if (!this.searchSelected.id) this.selectedOption = this.options[0]
                else this.selectedOption = this.searchSelected
            }

            if (this.selectedOption) {
                this.searchSelected = this.selectedOption
                if (updateModel) {
                    this.searchQuery = ''
                    this.active = false
                    this.searchPlaceholder = this.selectedOption.name
                    this.$emit('update:modelValue', {...this.selectedOption})
                } else {
                    this.active = true
                }
            }
        },
        navigate(keyModifier) {
            if (keyModifier === 'enter') {
                if (!this.searchSelected.id) this.selectedOption = this.options[0]
                else {
                    this.selectedOption = this.searchSelected
                }
            } else if (['up', 'down', 'page-down', 'page-up'].includes(keyModifier)) {
                if (!this.searchSelected.id) this.selectedOption = this.options[0]
                else {
                    const itemIndex = this.options.findIndex((i) => i.id === this.searchSelected.id)
                    if (keyModifier === 'down' && this.options.length > itemIndex) {
                        this.selectedOption = this.options[itemIndex + 1]
                    } else if (keyModifier === 'up' && itemIndex > 0) {
                        this.selectedOption = this.options[itemIndex - 1]
                    } else if (keyModifier === 'page-down') {
                        if (this.options.length >= itemIndex + 5) {
                            this.selectedOption = this.options[itemIndex + 5]
                        }
                    } else if (keyModifier === 'page-up') {
                        if (this.options.length >= itemIndex - 5 && (itemIndex - 5) >= 0) {
                            this.selectedOption = this.options[itemIndex - 5]
                        }
                    }
                }
            } else if (keyModifier === 'query') {
                this.selectedOption = this.options[0]
            }
        },

        toggleSelect(e, vClickOutside, active) {
            if (typeof vClickOutside === 'object' && !active) {
                this.active = false
                return
            }

            if (active !== undefined) this.active = active
            else this.active = !this.active
        },
        updateModel: function(event) {
            let value = event.target.value
            if (!value) {
                this.$emit('update:modelValue', this.emptySelectOption())
            } else {
                for (const option of this.options) {
                    if (option.id === value) {
                        this.$emit('update:modelValue', {...option})
                    }
                }
            }
        },
    },
    props: {
        disabled: {
            default: () => false,
            type: Boolean,
        },
        empty: {
            default: 'no options available',
            type: String,
        },
        idfield: {
            default: () => 'id',
            type: String,
        },
        modelValue: {
            required: true,
            type:Object,
        },
        options: {
            default: () => [],
            type: Array,
        },
        placeholder: {
            default: () => '...',
            type: String,
        },
        search: {
            default: false,
            type: Boolean,
        },
    },
    updated() {
        const input = this.$refs.input
        const options = this.$refs.options

        let selected
        if (this.searchSelected.id) {
            for (const childNode of options.childNodes) {
                if (`#${this.uniqueId}-option-${this.searchSelected.id}` === childNode.id) {
                    selected = childNode
                }
            }
        }

        if (selected) {
            options.scrollTop = selected.offsetTop - input.offsetHeight - selected.offsetHeight
        }
    },
}
</script>

<style lang="scss">
.c-field-select {
    max-width: 350px;
    width: 100%;

    .input-container {
        display: flex;
        flex-direction: column;
        position: relative;
        width: 100%;

        .button-wrapper {
            border-bottom: var(--border) solid var(--grey-5);
            display: flex;
            z-index: 1000;

            input {
                background: none;
                border: 0;
                font-size: 1rem;
                height: var(--spacer-4);
                outline: none;
                text-transform: capitalize;
                user-select: none;
                width: 100%;

                &::placeholder {
                    color: var(--grey-7);
                    font-style: italic;
                }

                &:hover {
                    cursor: pointer;
                }

                &[disabled] {

                    &::placeholder {
                        color: var(--grey-5);
                    }

                    &:hover {
                        cursor: not-allowed;
                    }
                }
            }
        }

        .options {
            border: 1px solid transparent;
            margin-top: calc(var(--spacer-4) + 4px);
            max-height: 0;
            max-width: inherit;
            overflow-y: hidden;
            position: absolute;
            transition: all 0.3s ease;
            width: inherit;
            z-index: 100000;

            &.active {
                background: var(--grey-4);
                border: var(--border) solid var(--grey-5);
                box-shadow: 0 0 var(--spacer-1) var(--spacer-05) var(--grey-2);
                max-height: 200px;
                overflow-y: scroll;
            }

            .option {
                color: var(--grey-6);
                padding: var(--spacer-1);
                text-align: left;
                text-transform: capitalize;
                user-select: none;
                width: inherit;

                &.selected {
                    background: var(--grey-4);
                    color: var(--primary-c);
                }

                &:hover {
                    background: var(--grey-4);
                    color: var(--primary-c);
                    cursor: pointer;
                }
            }
        }
    }
}
</style>
