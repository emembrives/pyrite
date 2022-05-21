import {reactive} from 'vue'

const persistantState = reactive({
    devices: {
        audio: {
            enabled: true,
            options: [],
            selected: {id: null, name: ''},
        },
        cam: {
            enabled: true,
            options: [],
            resolution: {id: 'default', name: ''},
            selected: {id: null, name: ''},
        },
        mic: {
            enabled: true,
            options: [],
            selected: {id: null, name: ''},
        },
    },
    language: {id: 'en'},
    loading: true,
    media: {
        accept: {id: 'everything', name: ''},
        upstream: {id: 'normal', name: ''},
    },
    panels: {
        chat: {
            collapsed: false,
        },
        context: {
            collapsed: false,
        },
        settings: {
            collapsed: false,
        },
    },
    theme: {id: 'system'},
    user: {
        data: {
            availability: {id: 'available', name: ''},
            mic: true,
            raisehand: false,
        },
        id: null,
        name: '',
        password: '',
    },
})

/**
 * State is always overwritten by these properties.
 */
const volatileState = {
    admin: {
        authenticated: null,
        group: null,
        groups: [],
        permission: false,
        user: null,
        users: [],
    },
    chat: {
        channel: 'main',
        channels: {
            main: {
                id: 'main',
                messages: [],
                unread: 0,
            },
        },
        width: 350,
    },
    files: {
        playing: [],
    },
    group: {
        connected: false,
        locked: false,
        muted: false,
        name: '',
        recording: false,
    },
    groups: [],
    mediaReady: false,
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
        camera: [],
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
