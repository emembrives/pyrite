import '@/js/lib/helpers.js'
import '@/scss/app.scss'

import "@fontsource/oswald"
import "@fontsource/roboto"

import * as modelChat from './models/chat.js'
import * as modelGroup from './models/group.js'
import * as modelMedia from './models/media.js'
import * as modelSFU from './models/sfu/sfu.js'
import * as modelUser from './models/user.js'

import animate from './lib/animate.js'
import Api from './lib/api.js'
import App from '@/vue/Elements/App.vue'
import ButtonGroup from '@/vue/Elements/ButtonGroup.vue'
import ContextInput from '@/vue/Elements/Context/ContextInput.vue'
import ContextSelect from '@/vue/Elements/Context/ContextSelect.vue'
import {createApp} from 'vue'
import {createI18n} from 'vue-i18n'
import env from './lib/env.js'
import EventEmitter from 'eventemitter3'
import FieldCheckbox from '@/vue/Elements/Field/FieldCheckbox.vue'
import FieldFile from '@/vue/Elements/Field/FieldFile.vue'
import FieldMultiSelect from '@/vue/Elements/Field/FieldMultiSelect.vue'
import FieldNumber from '@/vue/Elements/Field/FieldNumber.vue'
import FieldSelect from '@/vue/Elements/Field/FieldSelect.vue'
import FieldSlider from '@/vue/Elements/Field/FieldSlider.vue'
import FieldText from '@/vue/Elements/Field/FieldText.vue'
import Hint from '@/vue/Elements/Hint.vue'
import Icon from '@/vue/Elements/Icon/Icon.vue'
import localeFR from './locales/fr.js'
import localeNL from './locales/nl.js'
import Logger from './lib/logger.js'
import Notifications from '@/vue/Elements/Notifications.vue'
import Notifier from './lib/notifier.js'
import router from './router/router.js'
import SoundMeter from '@/vue/Elements/SoundMeter.vue'
import Store from './lib/store.js'
import VueTippy from 'vue-tippy'

class Pyrite extends EventEmitter {

    constructor() {
        super()

        this.logger = new Logger(this)
        this.api = new Api()

        this.logger.setLevel('debug')

        this.animate = animate

        this.logger.debug('loading store')
        this.store = new Store()
        // Usage on the import level (e.g. define computed properties)
        // still requires separate model imports.
        this.$m = {
            chat: modelChat,
            group: modelGroup,
            media: modelMedia,
            sfu: modelSFU,
            user: modelUser,
        }

        this.$s = this.store.load()
        env(this.$s.env)

        this.i18n = createI18n({
            formatFallbackMessages: true,
            locale: this.$s.language.id,
            messages: {
                fr: localeFR,
                nl: localeNL,
            },
            silentFallbackWarn: true,
            silentTranslationWarn: true,
        })

        this.$t = this.i18n.global.t
        this.notifier = Notifier(this)
        this.init()
    }

    async adminContext() {
        const context = await this.api.get('/api/context')
        Object.assign(this.$s.admin, context)
    }

    async init() {
        await this.adminContext()
        this.router = router(this)
        this.router.beforeResolve((to, from, next) => {
            // All admin routes are authenticated. Redirect to the admin
            // login if the authentication flag is unset.
            if ((to.name && to.name !== 'admin-login' && to.name.startsWith('admin')) && !this.$s.admin.authenticated) {
                next({name: 'admin-login'})
                return
            }

            if (!this.$s.group.connected) {
                // Navigating groups will change the internally used groupId;
                // but only when not connected to a group already.
                if (to.name === 'conference-groups-disconnected') {
                    this.$s.group.name = to.params.groupId
                }
            } else if (to.name === 'admin-group') {
                this.$s.admin.group._name = to.params.groupId
            }
            next()
        })
        this.vm = createApp(App)

        Object.assign(this.vm.config.globalProperties, {
            $m: this.$m,
            $s: this.$s,
            app: this,
        })

        this.vm.component('ButtonGroup', ButtonGroup)
        this.vm.component('Notifications', Notifications)
        this.vm.component('Icon', Icon)
        this.vm.component('ContextInput', ContextInput)
        this.vm.component('ContextSelect', ContextSelect)
        this.vm.component('FieldCheckbox', FieldCheckbox)
        this.vm.component('FieldFile', FieldFile)
        this.vm.component('FieldMultiSelect', FieldMultiSelect)
        this.vm.component('FieldNumber', FieldNumber)
        this.vm.component('FieldSelect', FieldSelect)
        this.vm.component('FieldSlider', FieldSlider)
        this.vm.component('FieldText', FieldText)
        this.vm.component('Hint', Hint)
        this.vm.component('SoundMeter', SoundMeter)

        this.vm.directive('click-outside', {
            beforeMount(el, binding) {
                el.clickOutsideEvent = function(event) {
                    if ((el === event.target) || !el.contains(event.target)) {
                        binding.value(event, el)
                    }
                }
                document.body.addEventListener('click', el.clickOutsideEvent)
            },
            unmounted(el) {
                document.body.removeEventListener('click', el.clickOutsideEvent)
            },
        })

        this.vm.use(VueTippy, {

            component: 'tip',
            defaultProps: {
                allowHTML: true,
                appendTo: () => {
                    return document.querySelector('.app')
                },
                delay: [750, 100],
            },
            directive: 'tip',
            interactive: true,
        }),
        this.vm.use(this.router).use(this.i18n)
        this.vm.mount('#app')
    }

}

export let app = new Pyrite()

for (const model of Object.values(app.$m)) {
    if (model._events) model._events()
}
