<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4">Applications</h2>
    <div class="bg-white shadow rounded-lg p-4">
      <!-- Loading state -->
      <div v-if="$resources.applications.loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p class="mt-2 text-gray-600">Loading applications...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="$resources.applications.error" class="text-center py-8">
        <div class="text-red-600 mb-2">Error loading applications</div>
        <div class="text-gray-600">{{ $resources.applications.error }}</div>
        <Button @click="$resources.applications.fetch()" class="mt-4">Retry</Button>
      </div>

      <!-- Data loaded state -->
      <div v-else>
        <div class="flex justify-between items-center mb-4">
          <p class="text-gray-600">Review and manage client applications</p>
          <Button @click="$resources.applications.fetch()" :loading="$resources.applications.loading">
            Refresh
          </Button>
        </div>

        <!-- Empty state -->
        <div v-if="!applications.length" class="text-center py-8">
          <div class="text-gray-400 mb-2">No applications found</div>
          <div class="text-gray-600">New applications will appear here when submitted.</div>
        </div>

        <!-- Applications table -->
        <div v-else class="mt-4">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Type</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="application in applications" :key="application.name">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ application.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ application.customer_name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ application.service_type || 'N/A' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(application.creation) }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(application.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ application.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Button @click="viewApplication(application)" size="sm" variant="outline">View</Button>
                  <Button 
                    v-if="application.status === 'Under Review'" 
                    @click="approveApplication(application)" 
                    size="sm" 
                    class="ml-2" 
                    :loading="approvingApplication === application.name"
                  >
                    Approve
                  </Button>
                  <Button 
                    v-if="application.status === 'Under Review'" 
                    @click="rejectApplication(application)" 
                    size="sm" 
                    variant="outline"
                    class="ml-2" 
                    :loading="rejectingApplication === application.name"
                  >
                    Reject
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Button } from 'frappe-ui'

export default {
  name: 'ApplicationView',
  components: {
    Button
  },
  data() {
    return {
      approvingApplication: null,
      rejectingApplication: null
    }
  },
  resources: {
    applications: {
      url: 'frappe.client.get_list',
      params: {
        doctype: 'Opportunity',
        fields: ['name', 'customer_name', 'status', 'service_type', 'creation', 'modified'],
        filters: { status: ['in', ['Draft', 'Under Review', 'Approved', 'Rejected']] },
        order_by: 'creation desc'
      },
      auto: true
    },
    approveApplication: {
      url: 'frappe.client.set_value',
      makeParams(values) {
        return {
          doctype: 'Opportunity',
          name: values.application,
          fieldname: 'status',
          value: 'Approved'
        }
      },
      onSuccess() {
        this.$resources.applications.fetch()
        this.approvingApplication = null
      }
    },
    rejectApplication: {
      url: 'frappe.client.set_value',
      makeParams(values) {
        return {
          doctype: 'Opportunity',
          name: values.application,
          fieldname: 'status',
          value: 'Rejected'
        }
      },
      onSuccess() {
        this.$resources.applications.fetch()
        this.rejectingApplication = null
      }
    }
  },
  computed: {
    applications() {
      return this.$resources.applications.data || []
    }
  },
  methods: {
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    },
    getStatusClass(status) {
      const statusClasses = {
        'Draft': 'bg-gray-100 text-gray-800',
        'Under Review': 'bg-yellow-100 text-yellow-800',
        'Approved': 'bg-green-100 text-green-800',
        'Rejected': 'bg-red-100 text-red-800'
      }
      return statusClasses[status] || 'bg-gray-100 text-gray-800'
    },
    viewApplication(application) {
      // Navigate to application detail view or open modal
      console.log('Viewing application:', application)
      // TODO: Implement application detail view
    },
    approveApplication(application) {
      this.approvingApplication = application.name
      this.$resources.approveApplication.submit({ application: application.name })
    },
    rejectApplication(application) {
      this.rejectingApplication = application.name
      this.$resources.rejectApplication.submit({ application: application.name })
    }
  }
}
</script>
