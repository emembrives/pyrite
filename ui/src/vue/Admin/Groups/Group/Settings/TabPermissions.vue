<template>
    <section class="c-admin-group-tab-permissions tab-content permissions active">
        <div class="permission-group">
            <div class="group-name" />
            <div class="categories">
                <div class="category" @click="toggleCategory('op')">
                    <Icon v-tip="{content: $t('operator permission')}" class="icon-small" name="Operator" />
                </div>
                <div class="category" @click="toggleCategory('presenter')">
                    <Icon v-tip="{content: $t('presenter permission')}" class="icon-small" name="Present" />
                </div>
                <div class="category" @click="toggleCategory('other')">
                    <Icon v-tip="{content: $t('misc permission')}" class="icon-small" name="OtherPermissions" />
                </div>
            </div>
        </div>

        <div
            v-for="user of $s.admin.users"
            :key="user.name"
            class="permission-group item"
        >
            <div class="group-name" @click="toggleUser(user.name)">
                {{ user.name }}
            </div>

            <div class="categories">
                <div v-for="category of categories" :key="category" class="category">
                    <input v-model="$s.admin.group._permissions[category]" type="checkbox" :value="user.name">
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import {defineComponent} from 'vue'

export default defineComponent({
    data() {
        return {
            // (!) Config directives; not the same as permissions from $s.permissions
            categories: ['op', 'presenter', 'other'],
        }
    },
    methods: {
        async loadGroups() {
            this.$s.admin.groups = await this.app.api.get('/api/groups')
        },
        toggleCategory(category) {
            const allSelected = !this.$s.admin.users.some((i) => !this.$s.admin.group._permissions[category].includes(i.name))
            if (allSelected) {
                this.$s.admin.group._permissions[category] = []
            } else {
                this.$s.admin.group._permissions[category] = this.$s.admin.users.map((i) => i.name)
            }
        },
        toggleUser(username) {
            const allSelected = this.categories.every((c) => this.$s.admin.group._permissions[c].includes(username))
            if (allSelected) {
                for (const category of this.categories) {
                    const userIndex = this.$s.admin.group._permissions[category].indexOf(username)
                    this.$s.admin.group._permissions[category].splice(userIndex, 1)
                }
            } else {
                for (const category of this.categories) {
                    if (!this.$s.admin.group._permissions[category].includes(username)) {
                        this.$s.admin.group._permissions[category].push(username)
                    }
                }
            }
            for (const category of this.categories) {
                this.$s.admin.group._permissions[category].includes(username)
            }
        },
    },
    async mounted() {
        if (this.$s.admin.authenticated && this.$s.admin.permission) {
            this.loadGroups()
        }
    },

})
</script>
