<template>
    <div class="c-field-slider">
        <Icon
            v-if="modelValue.locked" class="icon icon-tiny locked"
            name="Lock"
            @click="onClick(false)"
        />
        <div ref="track" class="track" @click="onClick(true)">
            <div ref="thumb" class="thumb" :style="{ marginTop: `${marginTop}px`}" />
        </div>
    </div>
</template>

<script>
export default {
    computed: {
        marginTop() {
            const thumbY = this.track.height - (this.track.height) * (this.modelValue.value / 100)  - this.thumb.height
            if (thumbY > this.track.height) {
                return this.track.height - this.thumb.height
            } else if (thumbY - this.thumb.height < 0) {
                return 0
            } else {
                return thumbY
            }
        },
        positionToValue() {
            return 100 - Math.trunc((this.thumb.y / this.track.height) * 100)
        },
    },
    data() {
        return {
            drag: {
                y: null,
            },
            thumb: {
                height: null,
                width: null,
                y: null,
            },
            track: {
                height: null,
                y: null,
            },
            value: null,
        }
    },
    emits: ['update:modelValue'],
    methods: {
        onClick(doubleClick) {
            // Locked feature is disabled:
            if (this.modelValue.locked === null) return

            if (doubleClick) {
                // Simulate double-click in order to toggle locking a channel.
                if (!this.timeoutId) {
                    this.timeoutId = setTimeout(() => { this.timeoutId = null }, 500)
                } else {
                    clearTimeout(this.timeoutId)
                    this.timeoutId = null
                    this.$emit('update:modelValue', {
                        locked: !this.modelValue.locked,
                        value:  this.modelValue.value,
                    })
                }
            } else {
                this.$emit('update:modelValue', {
                    locked: !this.modelValue.locked,
                    value:  this.modelValue.value,
                })
            }
        },
        setPosition() {
            if (
                this.drag.y >= this.track.y + this.thumb.height &&
                this.drag.y <= (this.track.y  + this.track.height - this.thumb.height)
            ) {
                this.thumb.y = this.drag.y - this.track.y
            } else if (this.drag.y < this.track.y + this.thumb.height) {
                this.thumb.y = 0
            } else if (this.drag.y > this.track.y + this.thumb.height) {
                this.thumb.y = this.track.height
            }
        },
    },
    mounted() {
        this.track.height = this.$refs.track.offsetHeight
        this.track.y = this.$refs.track.getBoundingClientRect().top + document.documentElement.scrollTop

        this.thumb.height =  this.$refs.thumb.offsetHeight
        this.thumb.width = this.$refs.thumb.offsetWidth

        this.$refs.track.addEventListener("mousedown", (e) => {
            document.body.style.cursor = 'ns-resize'
            this.drag.y = e.pageY
            this.down = true
            this.setPosition()
            this.$emit('update:modelValue', {
                locked: this.modelValue.locked,
                value: this.positionToValue,
            })

        })

        this.mouseMove = (e) => {
            if (!this.down) return
            this.track.y = this.$refs.track.getBoundingClientRect().top + document.documentElement.scrollTop
            this.drag.y = e.pageY
            this.setPosition()
            this.$emit('update:modelValue', {
                locked: this.modelValue.locked,
                value: this.positionToValue,
            })
        }
        this.mouseUp = () => {
            document.body.style.cursor = 'default'
            this.down = false
        }

        document.addEventListener('mousemove', this.mouseMove)
        document.addEventListener('mouseup', this.mouseUp)
    },
    unmounted() {
        document.removeEventListener('mousemove', this.mouseMove)
        document.removeEventListener('mouseup', this.mouseUp)
    },
    props: {
        modelValue: {
            required: true,
            type: Object,
        },
    },
}
</script>

<style lang="scss">
.c-field-slider {
    height: var(--spacer-6);
    outline: none;
    overflow: hidden;

    .track {
        background: var(--grey-2);
        height: var(--spacer-6);
        overflow: visible;
        position: relative;
        width: 8px;

        &:hover {
            cursor: ns-resize;
        }
    }

    .thumb {
        background: var(--primary-c);
        border-radius: 8px;
        height: 8px;
        position: absolute;
        width: 8px;
    }

    .icon.locked {
        bottom: 0;
        color: var(--primary-c);
        margin-bottom: -18px;
        margin-left: -3px;

        // margin-top: calc(-2 * var(--spacer-2));
        position: absolute;
        z-index: 1000;

        &:hover {
            cursor: pointer;
        }
    }
}
</style>
