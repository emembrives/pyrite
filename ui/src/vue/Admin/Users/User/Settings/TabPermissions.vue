<template>
    <section class="c-admin-user-tab-permissions tab-content active">
        <div class="group">
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
            v-for="group of $s.admin.groups"
            :key="group._name"
            class="group item"
        >
            <div class="group-name" @click="toggleGroup(group._name)">
                {{ group._name }}
            </div>

            <div class="categories">
                <div v-for="category of categories" :key="`${group._name}-${category}`" class="category">
                    <input
                        :id="`${group._name}`"
                        v-model="$s.admin.user.groups[category]"
                        type="checkbox"
                        :value="group._name"
                    >
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
            let allSelected = true
            const groups = []
            for(const group of this.$s.admin.groups) {
                groups.push(group._name)
                if (!this.$s.admin.user.groups[category].includes(group._name)) {
                    allSelected = false
                }
            }

            if (allSelected) {
                this.$s.admin.user.groups[category].splice(0, this.$s.admin.user.groups[category].length)
            } else {
                this.$s.admin.user.groups[category].splice(0, this.$s.admin.user.groups[category].length, ...groups)
            }
        },
        toggleGroup(groupName) {
            const allSelected = this.categories.filter((c) => this.$s.admin.user.groups[c].includes(groupName)).length === 3

            for (const category of this.categories) {
                if (allSelected) {
                    this.$s.admin.user.groups[category].splice(this.$s.admin.user.groups[category].indexOf(groupName), 1)
                } else {
                    if (!this.$s.admin.user.groups[category].includes(groupName)) {
                        this.$s.admin.user.groups[category].push(groupName)
                    }
                }
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

<style lang="scss">
.c-admin-user-tab-permissions {

    .group {
        align-items: center;
        display: flex;
        padding: var(--spacer-1) 0;

        .group-name {
            color: var(--grey-8);
            cursor: pointer;
            flex: 1;
            user-select: none;

            &:hover {
                color: var(--primary-c);
            }
        }

        .categories {
            align-items: center;
            display: flex;
            flex: 2;

            .category {
                align-items: center;
                display: flex;
                justify-content: center;
                margin: 0 var(--spacer-1);
                width: 75px;

                svg {
                    width: calc(var(--spacer-2) + 21px);

                    &:hover {
                        color: var(--primary-c);
                    }
                }

                input {
                    margin-right: 0;
                }
            }
        }
    }
}
</style>
