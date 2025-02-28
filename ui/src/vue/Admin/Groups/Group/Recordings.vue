<template>
    <section v-if="recordings.length" class="c-admin-recordings tab-content active">
        <div v-for="rec of recordings" :key="rec.filename" class="recording">
            <div class="actions">
                <button
                    class="btn btn-menu btn-small"
                    @click="deleteRecording(rec)"
                >
                    <Icon v-tip="{content: $t('delete recording')}" class="icon-mini" name="Trash" />
                </button>
                <a
                    class="btn btn-menu btn-small"
                    :download="`${rec.filename}.${rec.extension}`"
                    :href="`/api/recordings/${$s.admin.group._name}/${rec.filename}.${rec.extension}`"
                >
                    <Icon v-tip="{content: $t('download recording')}" class="icon-mini" name="Download" />
                </a>
            </div>
            <video controls :src="`/api/recordings/${$s.admin.group._name}/${rec.filename}.${rec.extension}`" type="video/webm" />
            <div class="info">
                <div class="line">
                    <div class="key ucfl">
                        {{ $t('file') }}
                    </div>
                    <div class="value">
                        {{ rec.filename }}
                    </div>
                </div>

                <div class="line">
                    <div class="key ucfl">
                        {{ $t('type') }}
                    </div>
                    <div class="value">
                        {{ rec.extension }}
                    </div>
                </div>

                <div class="line">
                    <div class="key ucfl">
                        {{ $t('size') }}
                    </div>
                    <div class="value">
                        {{ (rec.size / 1024 / 1024).toFixed(2) }} MB
                    </div>
                </div>

                <div class="line">
                    <div class="key ucfl">
                        {{ $t('modified') }}
                    </div>
                    <div class="value">
                        {{ rec.atime }}
                    </div>
                </div>
            </div>
        </div>
    </section>
    <section v-else class="c-admin-recordings tab-content active no-results">
        <Icon class="icon icon-large" name="Record" />
        <span>{{ $t('no recordings') }}</span>
    </section>
</template>

<script>
export default {
    data() {
        return {
            recordings: [],
        }
    },
    methods: {
        async deleteRecording(rec) {
            this.recordings = await this.app.api.get(`/api/recordings/${this.groupId}/${rec.filename}.${rec.extension}/delete`)
            this.app.notifier.notify({level: 'info', message: this.$t('deleted recording: {recording}', {recording: rec.filename})})
        },
        async loadRecordings(groupId) {
            this.recordings = await this.app.api.get(`/api/recordings/${groupId}`)
        },
    },
    mounted() {
        this.loadRecordings(this.groupId)
    },
    props: {
        groupId: {
            default: () => null,
            required: false,
            type: String,
        },
    },
    watch: {
        groupId(newValue) {
            this.loadRecordings(newValue)
        },
    },
}
</script>

<style lang="scss">
.c-admin-recordings {

    .recording {
        align-items: center;
        background: var(--grey-1);
        display: flex;
        margin-bottom: var(--spacer-1);
        padding: var(--spacer-1);

        video {
            max-height: 90px;
        }

        .actions {
            background: var(--grey-3);
            margin-right: var(--spacer-1);
        }

        .info {
            display: flex;
            flex: 1;
            flex-direction: column;
            justify-content: center;

            .line {
                display: flex;
                font-size: var(--text-s);
                padding: var(--spacer-05) var(--spacer-1);

                .key {
                    color: var(--grey-6);
                    padding-right: var(--spacer-1);
                    text-align: right;
                    width: 75px;
                }

                .value {
                    color: var(--primary-c);
                }
            }
        }
    }
}
</style>
