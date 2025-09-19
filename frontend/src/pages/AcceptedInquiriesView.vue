<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4">Accepted Inquiries</h2>
    <div class="bg-white shadow rounded-lg p-4">
      <!-- Loading state -->
      <div v-if="$resources.acceptedInquiries.loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p class="mt-2 text-gray-600">Loading accepted inquiries...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="$resources.acceptedInquiries.error" class="text-center py-8">
        <div class="text-red-600 mb-2">Error loading accepted inquiries</div>
        <div class="text-gray-600">{{ $resources.acceptedInquiries.error }}</div>
        <Button @click="$resources.acceptedInquiries.fetch()" class="mt-4">Retry</Button>
      </div>

      <!-- Data loaded state -->
      <div v-else>
        <div class="flex justify-between items-center mb-4">
          <p class="text-gray-600">View and manage accepted inquiries</p>
          <Button @click="$resources.acceptedInquiries.fetch()" :loading="$resources.acceptedInquiries.loading">
            Refresh
          </Button>
        </div>

        <!-- Empty state -->
        <div v-if="!acceptedInquiries.length" class="text-center py-8">
          <div class="text-gray-400 mb-2">No accepted inquiries found</div>
          <div class="text-gray-600">Accepted inquiries will appear here.</div>
        </div>

        <!-- Accepted inquiries table -->
        <div v-else class="mt-4">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accepted Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="inquiry in acceptedInquiries" :key="inquiry.name">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ inquiry.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ inquiry.client_name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(inquiry.inquiry_date) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ inquiry.selected_provider || 'Unassigned' }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(inquiry.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ inquiry.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Button @click="viewInquiry(inquiry)" size="sm" variant="outline">View</Button>
                  <Button @click="convertToDeal(inquiry)" size="sm" class="ml-2" :loading="convertingInquiry === inquiry.name">
                    Convert to Deal
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
  name: 'AcceptedInquiriesView',
  components: {
    Button
  },
  data() {
    return {
      convertingInquiry: null
    }
  },
  resources: {
    acceptedInquiries: {
      url: 'frappe.client.get_list',
      params: {
        doctype: 'Inquiry',
        fields: ['name', 'client_name', 'client_email', 'client_phone', 'status', 'selected_provider', 'inquiry_date', 'modified', 'priority', 'preferred_countries'],
        filters: { status: ['in', ['Accepted', 'Qualified']] },
        order_by: 'modified desc'
      },
      auto: true
    },
    convertToDeal: {
      url: 'frappe.client.set_value',
      makeParams(values) {
        return {
          doctype: 'Inquiry',
          name: values.inquiry,
          fieldname: 'status',
          value: 'Converted'
        }
      },
      onSuccess() {
        this.$resources.acceptedInquiries.fetch()
        this.convertingInquiry = null
      }
    }
  },
  computed: {
    acceptedInquiries() {
      return this.$resources.acceptedInquiries.data || []
    }
  },
  methods: {
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    },
    getStatusClass(status) {
      const statusClasses = {
        'Accepted': 'bg-purple-100 text-purple-800',
        'Qualified': 'bg-blue-100 text-blue-800',
        'Converted': 'bg-green-100 text-green-800'
      }
      return statusClasses[status] || 'bg-gray-100 text-gray-800'
    },
    viewInquiry(inquiry) {
      this.$router.push({ name: 'InquiryDetail', params: { id: inquiry.name } })
    },
    convertToDeal(inquiry) {
      this.convertingInquiry = inquiry.name
      this.$resources.convertToDeal.submit({ inquiry: inquiry.name })
    }
  }
}
</script>
