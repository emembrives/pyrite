import {app} from '@/js/app.js'
import {truncate} from 'fs-extra'

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

    app.emit('chat:message', {channelId})
}

export function selectChannel(channel) {
    app.$s.chat.channel = channel.id
    app.$s.chat.channels[channel.id].unread = 0
}

export function eventsz() {

    app.on('disconnected', () => {
        console.log("DISCONNECT")
    })
}

export function unreadMessages() {
    let unread = 0

    for (const channel of Object.values(app.$s.chat.channels)) {
        unread += channel.unread
    }
    return unread
}

