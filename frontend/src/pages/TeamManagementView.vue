<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4">Team Management</h2>
    <div class="bg-white shadow rounded-lg p-4">
      <!-- Loading state -->
      <div v-if="$resources.teamMembers.loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p class="mt-2 text-gray-600">Loading team members...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="$resources.teamMembers.error" class="text-center py-8">
        <div class="text-red-600 mb-2">Error loading team members</div>
        <div class="text-gray-600">{{ $resources.teamMembers.error }}</div>
        <Button @click="$resources.teamMembers.fetch()" class="mt-4">Retry</Button>
      </div>

      <!-- Data loaded state -->
      <div v-else>
        <div class="flex justify-between items-center mb-4">
          <p class="text-gray-600">Manage your team members and their roles</p>
          <div class="space-x-2">
            <Button @click="$resources.teamMembers.fetch()" :loading="$resources.teamMembers.loading">
              Refresh
            </Button>
            <Button @click="showAddMemberDialog = true" icon-left="plus">
              Add Member
            </Button>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="!teamMembers.length" class="text-center py-8">
          <div class="text-gray-400 mb-2">No team members found</div>
          <div class="text-gray-600">Add team members to get started.</div>
        </div>

        <!-- Team members table -->
        <div v-else class="mt-4">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="member in teamMembers" :key="member.name">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ member.full_name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ member.email }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ member.role }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(member.enabled)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ member.enabled ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Button @click="editMember(member)" size="sm" variant="outline">Edit</Button>
                  <Button 
                    @click="toggleMemberStatus(member)" 
                    size="sm" 
                    :variant="member.enabled ? 'outline' : 'subtle'"
                    class="ml-2" 
                    :loading="togglingMember === member.name"
                  >
                    {{ member.enabled ? 'Deactivate' : 'Activate' }}
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Add Member Dialog -->
    <Dialog title="Add Team Member" v-model="showAddMemberDialog">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input v-model="newMember.full_name" type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input v-model="newMember.email" type="email" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select v-model="newMember.role" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="Member">Member</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
          </select>
        </div>
      </div>
      <template #actions>
        <Button @click="showAddMemberDialog = false" variant="outline">Cancel</Button>
        <Button @click="addMember" :loading="$resources.addMember.loading">Add Member</Button>
      </template>
    </Dialog>
  </div>
</template>

<script>
import { Button, Dialog } from 'frappe-ui'

export default {
  name: 'TeamManagementView',
  components: {
    Button,
    Dialog
  },
  data() {
    return {
      showAddMemberDialog: false,
      togglingMember: null,
      newMember: {
        full_name: '',
        email: '',
        role: 'Member'
      }
    }
  },
  resources: {
    teamMembers: {
      url: 'frappe.client.get_list',
      params: {
        doctype: 'User',
        fields: ['name', 'full_name', 'email', 'enabled', 'role_profile_name as role'],
        filters: { 
          user_type: 'System User',
          name: ['!=', 'Administrator']
        },
        order_by: 'full_name asc'
      },
      auto: true
    },
    toggleMemberStatus: {
      url: 'frappe.client.set_value',
      makeParams(values) {
        return {
          doctype: 'User',
          name: values.member,
          fieldname: 'enabled',
          value: values.enabled
        }
      },
      onSuccess() {
        this.$resources.teamMembers.fetch()
        this.togglingMember = null
      }
    },
    addMember: {
      url: 'frappe.client.insert',
      makeParams(values) {
        return {
          doc: {
            doctype: 'User',
            email: values.email,
            first_name: values.full_name.split(' ')[0],
            last_name: values.full_name.split(' ').slice(1).join(' '),
            role_profile_name: values.role,
            enabled: 1,
            user_type: 'System User',
            send_welcome_email: 1
          }
        }
      },
      onSuccess() {
        this.$resources.teamMembers.fetch()
        this.showAddMemberDialog = false
        this.newMember = { full_name: '', email: '', role: 'Member' }
      }
    }
  },
  computed: {
    teamMembers() {
      return this.$resources.teamMembers.data || []
    }
  },
  methods: {
    getStatusClass(enabled) {
      return enabled 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    },
    editMember(member) {
      // Navigate to member edit view or open modal
      console.log('Editing member:', member)
      // TODO: Implement member edit functionality
    },
    toggleMemberStatus(member) {
      this.togglingMember = member.name
      this.$resources.toggleMemberStatus.submit({ 
        member: member.name, 
        enabled: !member.enabled 
      })
    },
    addMember() {
      this.$resources.addMember.submit(this.newMember)
    }
  }
}
</script>
