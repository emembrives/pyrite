import {app} from '@/js/app.js'
import {watch} from 'vue'

export function _events() {

    watch(app.$s.panels.chat, ({collapsed}) => {
        if (!collapsed) {
            app.$s.chat.channels[app.$s.chat.channel].unread= 0
        }
    })

    app.on('channel', ({action, channelId, channel = null}) => {
        app.logger.debug('switch chat channel to ', channelId)
        if (action === 'switch') {
            if (!app.$s.chat.channels[channelId]) {
                app.$s.chat.channels[channelId] = channel
            }

            selectChannel(channelId)
        }
    })

    app.on('disconnected', () => {
        app.$s.chat.channels.main.messages = []
        app.$s.chat.channels.main.unread = 0
    })

    // User left; clean up the channel.
    app.on('user', ({action, user}) => {
        if (action === 'del' && app.$s.chat.channels[user.id]) {
            // Change the active to-be-deleted channel to main
            if (app.$s.chat.channel === user.id) {
                selectChannel('main')
            }
            delete app.$s.chat.channels[user.id]
        }
    })
}

export function closeChannel(channel) {
    selectChannel('main')
    delete app.$s.chat.channels[channel.id]
}

export function clearChat() {
    app.logger.debug('clearing chat from remote')
    app.$s.chat.channels.main.messages = []
}

/**
 * Galene SFU message handler
 * @param {*} sourceId
 * @param {*} destinationId
 * @param {*} nick
 * @param {*} time
 * @param {*} privileged
 * @param {*} history
 * @param {*} kind
 * @param {*} message
 */
export async function onMessage(sourceId, destinationId, nick, time, privileged, history, kind, message) {
    if (!kind) kind = 'default'
    let channelId
    // Incoming message for the main channel
    if (!destinationId) {
        channelId = 'main'
        app.$s.chat.channels.main.messages.push({kind, message, nick, time})
    }
    // This is a private message
    else if (destinationId && sourceId) {
        channelId = sourceId
        const activeUser = app.$s.users.find((user) => user.id === sourceId)
        if (activeUser) {
            if (!app.$s.chat.channels[sourceId]) {
                app.$s.chat.channels[sourceId] = {
                    id: sourceId,
                    messages: [],
                    name: nick,
                    unread: 0,
                }
            }

            app.$s.chat.channels[sourceId].messages.push({kind, message, nick, time})
        }
    }

    // Notify user of a new message when the channel is not visible yet.
    if (channelId !== app.$s.chat.channel || app.$s.panels.chat.collapsed) {
        app.$s.chat.channels[channelId].unread += 1
    }

}

export function selectChannel(channel) {
    if (typeof channel === 'string') {
        channel = app.$s.chat.channels[channel]
    }
    app.$s.chat.channel = channel.id
    channel.unread = 0
}

export function sendMessage(message) {
    const isCommand = (message[0] === '/')
    let me = false

    if (isCommand) {
        if (message.length > 1 && message[1] === '/') {
            message = message.slice(1)
            me = false
        } else {
            let cmd, rest
            let space = message.indexOf(' ')
            if (space < 0) {
                cmd = message.slice(1)
                rest = ''
            } else {
                cmd = message.slice(1, space)
                rest = message.slice(space + 1)
            }

            message = ''

            if (cmd === 'me') {
                message = rest
                me = true
            } else {
                let c = app.$m.sfu.commands[cmd]
                if (!c) {
                    app.notifier.notify({
                        level: 'error',
                        message: `Uknown command /${cmd}, type /help for help`,
                    })
                    return
                }
                if (c.predicate) {
                    const message = c.predicate()
                    if (message) {
                        app.notifier.notify({level: 'error', message})
                        return
                    }
                }
                try {
                    c.f(cmd, rest)
                } catch (e) {
                    app.notifier.notify({level: 'error', message: e})
                }
                return
            }
        }
    }

    // Sending to the main channel uses an empty string;
    // a direct message uses the user (connection) id.
    if (app.$s.chat.channel === 'main') {
        app.$m.sfu.connection.chat(me ? 'me' : '', '', message)
    } else {
        // A direct message is not replayed locally through
        // onChat, so we need to add the message ourselves.
        app.$m.sfu.connection.chat(me ? 'me' : '', app.$s.chat.channel, message)
        app.$s.chat.channels[app.$s.chat.channel].messages.push({
            kind: 'default',
            message,
            nick: app.$s.user.username,
            time: Date.now(),
        })
    }
}

export function unreadMessages() {
    let unread = 0

    for (const channel of Object.values(app.$s.chat.channels)) {
        unread += channel.unread
    }
    return unread
}

