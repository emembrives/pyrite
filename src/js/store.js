import {reactive} from 'vue'

const persistantState = reactive({
    audio: {id: null, name: ''},
    language: {id: 'en'},
    loading: true,
    localMute: false,
    permissions: {},
    present: '', // '', mike or 'both'
    request: {id: 'everything', name: 'Everything'},
    resolution: {id: 'default', name: 'Default'},
    send: {id: 'normal', name: 'Normal'},
    title: '',
    user: {
        id: null,
        name: '',
        password: '',
    },
    video: {id: null, name: ''},
})

/**
 * State is always overwritten by these properties.
 */
const volatileState = {
    chat: {
        channel: 'main',
        channels: {
            main: {
                id: 'main',
                messages: [],
                name: 'General',
                unread: 0,
            },
        },
        hidden: false,
        width: 350,
    },
    devices: {
        audio: [],
        video: [],
    },
    group: {
        connected: false,
        name: '',
    },
    mediaReady: false,

    muted: false,
    notifications: [],
    permissions: {
        op: false,
        // Assume present permission before connecting,
        // so send can be modified in Settings.
        present: true,
        record: false,
    },
    streams: [],
    upMedia: {
        audio: [],
        local: [],
        screenshare: [],
        video: [],
    },
    users: [],
}

class Store {

    load() {
        let restoredState
        try {
            restoredState = JSON.parse(localStorage.getItem('store'))
        } catch (err) {
            restoredState = {}
        }

        Object.assign(persistantState, {...restoredState, ...volatileState})
        return persistantState
    }

    save() {
        localStorage.setItem('store', JSON.stringify(persistantState))
    }
}

export default Store
