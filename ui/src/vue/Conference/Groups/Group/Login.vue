<template>
    <div v-if="currentGroup" class="c-login content" @keypress.enter="login">
        <header>
            <div class="notice">
                <Hint v-if="currentGroup.locked" class="field" :text="$t('Only maintainers may login locked groups')" />
            </div>
            <div class="title">
                <span>{{ $route.params.groupId }}</span>
                <Icon class="icon icon-regular" :name="currentGroup.locked ? 'GroupLocked' : 'Group'" />
            </div>
        </header>
        <div class="panels">
            <section>
                <form>
                    <FieldCheckbox
                        v-if="currentGroup['allow-anonymous'] && false"
                        v-model="anonymousLogin" :label="$t('anonymous login')"
                    />

                    <FieldText
                        v-if="!isListedGroup"
                        v-model="currentGroup.name"
                        :label="$t('group name')"
                        name="groupname"
                        :placeholder="$t('unlisted group')"
                    />

                    <FieldText
                        v-if="!anonymousLogin"
                        v-model="v$.user.username.$model"
                        autocomplete="new-password"
                        :autofocus="$s.login.autofocus && $route.params.groupId"
                        :label="$t('username')"
                        name="username"
                        placeholder="Alice, Bob, Carol..."
                        :validation="v$.user.username"
                    />

                    <FieldText
                        v-model="v$.user.password.$model"
                        autocomplete="new-password"
                        :label="$t('password')"
                        name="pasword"
                        placeholder="Alice, Bob, Carol..."
                        type="password"
                        :validation="v$.user.password"
                    />

                    <div v-if="currentGroup.comment" class="group-comment field">
                        <div class="field-label">
                            {{ $t('about') }} {{ currentGroup.name }}
                        </div>
                        <div class="comment">
                            {{ currentGroup.comment }}
                        </div>
                    </div>

                    <div v-if="currentGroup.contact" class="group-contact">
                        <Icon v-tip="{content: $t('administrator contact')}" class="icon-small" name="Administrator" />
                        {{ currentGroup.contact }}
                    </div>

                    <div class="verify ucfl">
                        <RouterLink :to="{name: 'conference-settings', params: {tabId: 'devices'}}">
                            {{ $t('verify') }}
                        </RouterLink>
                        {{ $t('microphone & video settings') }}
                    </div>

                    <FieldSelect
                        v-model="$s.devices.cam.selected"
                        :disabled="!$s.devices.cam.enabled"
                        :help="$t('select the video device')"
                        :label="$t('camera')"
                        name="video"
                        :options="$s.devices.cam.options"
                    >
                        <template #header>
                            <FieldCheckbox v-model="$s.devices.cam.enabled" />
                        </template>
                    </FieldSelect>

                    <FieldSelect
                        v-model="$s.devices.mic.selected"
                        :disabled="!$s.devices.mic.enabled"
                        :help="$t('select the microphone device')"
                        :label="$t('microphone')"
                        name="audio"
                        :options="$s.devices.mic.options"
                    >
                        <template #header>
                            <FieldCheckbox v-model="$s.devices.mic.enabled" />
                        </template>
                    </FieldSelect>

                    <div v-if="!$s.env.isFirefox" class="media-option">
                        <FieldSelect
                            v-model="$s.devices.audio.selected"
                            :help="$s.env.isFirefox ? `${$s.env.browserName} ${$t('does not support this option')}` : $t('select the microphone device')"
                            :label="$t('audio output')"
                            name="audio"
                            :options="$s.devices.audio.options"
                        />
                    </div>
                </form>
            </section>
            <div class="actions">
                <button
                    class="btn btn-menu"
                    :disabled="btnLoginDisabled"
                    @click="login"
                >
                    <Icon v-tip="{content: currentGroup.locked ? $t('join locked group') : $t('join group')}" class="icon-small" name="Login" />
                </button>
                <button
                    class="btn btn-menu"
                    :disabled="!app.$s.user.username && !app.$s.user.password"
                    @click="clearCredentials"
                >
                    <Icon v-tip="{content: $t('clear credentials')}" class="icon-small" name="Backspace" />
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import {required} from '@vuelidate/validators'
import useVuelidate from '@vuelidate/core'

export default {
    computed: {
        btnLoginDisabled() {
            if (this.busy || !this.$s.user.username || !this.$s.user.password) {
                return true
            }
            // Server validation should not disable the login button.
            const hasErrors = this.v$.$silentErrors.filter((v) => v.$validator !== '$externalResults').length > 0
            return hasErrors
        },
        currentGroup: () => app.$m.group.currentGroup(),
        isListedGroup() {
            return !!app.$s.groups.find((i) => i.name === app.$s.group.name)
        },

    },

    data() {
        return {
            anonymousLogin: false,
            busy: false,
            user: this.$s.user,
            vuelidateExternalResults: {
                user: {
                    password: [],
                    username: [],
                },
            },
        }
    },
    methods: {
        clearCredentials() {
            app.$s.user.username = ''
            app.$s.user.password = ''
            app.store.save()
        },
        async login() {
            this.vuelidateExternalResults.user.username = []
            this.vuelidateExternalResults.user.password = []

            this.busy = true
            try {
                if (this.anonymousLogin) {
                    await this.$m.sfu.connect('', '')
                } else {
                    await this.$m.sfu.connect(this.$s.user.username, this.$s.user.password)
                }

            } catch (err) {
                if (err === 'group is locked') {
                    this.app.notifier.notify({
                        level: 'error',
                        message: this.$t('group {group} is locked; only maintainers may login', {group: this.$s.group.name}),
                    })
                    this.vuelidateExternalResults.user.username = [this.$t('group {group} has been locked')]
                    this.vuelidateExternalResults.user.password = [this.$t('group {group} has been locked')]
                } else if (err === 'not authorised') {
                    const message = this.$t('invalid credentials for group {group}', {group: this.$s.group.name})
                    this.app.notifier.notify({level: 'error', message})
                    this.vuelidateExternalResults.user.username = [message]
                    this.vuelidateExternalResults.user.password = [message]
                    this.v$.$validate()
                }
            }

            this.busy = false
            if (this.v$.$invalid) return

            // Save credentials for the next time.

            this.app.store.save()

            this.$s.group.connected = true
            this.$router.replace({
                name: 'conference-groups-connected',
                params: {groupId: this.$router.currentRoute.value.params.groupId},
            })

        },
    },
    async mounted() {
        this.busy = true
        await this.$m.media.queryDevices()
        this.busy = false
    },
    setup() {
        return {v$: useVuelidate()}
    },
    validations() {
        return  {
            user: {
                password: {required},
                username: {required},
            },
        }
    },
    watch: {
        '$s.devices.cam.enabled'() {
            app.store.save()
        },
        '$s.devices.mic.enabled'() {
            app.store.save()
        },
    },
}
</script>

<style lang="scss">
.c-login {

    .group-comment {

        .comment {
            font-style: italic;
        }
    }

    .group-contact {
        align-items: center;
        color: var(--grey-8);
        display: flex;
        font-family: var(--font-2);

        .icon {
            color: var(--primary-c);
            margin-right: var(--spacer-05);
        }
    }

    .verify {
        margin-top: var(--spacer-2);
    }
}

</style>
