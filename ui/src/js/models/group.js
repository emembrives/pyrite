import {app} from '@/js/app.js'

export function currentGroup() {
    const currentGroup = app.$s.groups.find((i) => i.name === app.$s.group.name)
    // Assume hidden group; use selected group fields as placeholders.
    if (!currentGroup) {
        return app.$s.group
    }

    return currentGroup
}

export async function saveGroup(groupId, data) {
    const group = await app.api.post(`/api/groups/${encodeURIComponent(groupId)}`, data)

    if (group._name === group._newName) {
        app.notifier.notify({level: 'info', message: app.$t('group {group} stored', {group: group._name})})
        app.$s.admin.groups[app.$s.admin.groups.findIndex((g) => g._name === group._name)] = group
    } else {
        const groupIndex = app.$s.admin.groups.findIndex((g) => g._name === group._name)
        group._name = group._newName
        app.$s.admin.groups[groupIndex] = group

        app.notifier.notify({
            level: 'info',
            message: app.$t('group {oldgroup} renamed to {newgroup}', {
                newgroup: group._name,
                oldgroup: group._newName,
            }),
        })
    }

    return group
}

