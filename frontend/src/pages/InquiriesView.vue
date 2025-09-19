<template>
  <div>
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Inquiries</h1>
      <p class="mt-1 text-sm text-gray-500">Manage and respond to new customer inquiries</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Total Inquiries</p>
            <p class="text-2xl font-semibold text-gray-900">{{ inquiries.length }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">New</p>
            <p class="text-2xl font-semibold text-gray-900">{{ newInquiriesCount }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-500">Open</p>
            <p class="text-2xl font-semibold text-gray-900">{{ openInquiriesCount }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Card -->
    <div class="bg-white shadow rounded-lg">
      <!-- Card Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">All Inquiries</h3>
          <Button @click="$resources.inquiries.fetch()" :loading="$resources.inquiries.loading" icon-left="refresh-cw">
            Refresh
          </Button>
        </div>
      </div>

      <!-- Card Content -->
      <div class="p-6">
        <!-- Loading state -->
        <div v-if="$resources.inquiries.loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Loading inquiries...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="$resources.inquiries.error" class="text-center py-12">
          <div class="text-red-600 mb-2">
            <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="text-red-600 font-medium mb-2">Error loading inquiries</div>
          <div class="text-gray-600 mb-4">{{ $resources.inquiries.error }}</div>
          <Button @click="$resources.inquiries.fetch()" variant="outline">Retry</Button>
        </div>

        <!-- Data loaded state -->
        <div v-else>
          <!-- Empty state -->
          <div v-if="!inquiries.length" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900">No inquiries</h3>
            <p class="mt-1 text-sm text-gray-500">New inquiries will appear here when submitted.</p>
          </div>

          <!-- Inquiries table -->
          <div v-else class="overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="inquiry in inquiries" :key="inquiry.name" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ inquiry.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ inquiry.client_name }}</div>
                    <div class="text-sm text-gray-500">{{ inquiry.client_email }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(inquiry.inquiry_date) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getStatusClass(inquiry.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ inquiry.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button @click="viewInquiry(inquiry)" size="sm" variant="outline">View</Button>
                    <Button 
                      v-if="inquiry.status === 'Draft' || inquiry.status === 'Open'" 
                      @click="acceptInquiry(inquiry)" 
                      size="sm" 
                      class="ml-2" 
                      :loading="acceptingInquiry === inquiry.name"
                    >
                      Accept
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Button } from 'frappe-ui'

export default {
  name: 'InquiriesView',
  components: {
    Button
  },
  data() {
    return {
      acceptingInquiry: null
    }
  },
  resources: {
    inquiries: {
      url: 'frappe.client.get_list',
      params: {
        doctype: 'Inquiry',
        fields: ['name', 'client_name', 'client_email', 'client_phone', 'status', 'inquiry_date', 'priority', 'preferred_countries', 'description'],
        filters: { status: ['in', ['Draft', 'Open', 'New']] },
        order_by: 'inquiry_date desc'
      },
      auto: true
    },
    acceptInquiry: {
      url: 'frappe.client.set_value',
      makeParams(values) {
        return {
          doctype: 'Inquiry',
          name: values.inquiry,
          fieldname: 'status',
          value: 'Accepted'
        }
      },
      onSuccess() {
        this.$resources.inquiries.fetch()
        this.acceptingInquiry = null
      }
    }
  },
  computed: {
    inquiries() {
      return this.$resources.inquiries.data || []
    },
    newInquiriesCount() {
      return this.inquiries.filter(inquiry => inquiry.status === 'Draft').length
    },
    openInquiriesCount() {
      return this.inquiries.filter(inquiry => inquiry.status === 'Open').length
    }
  },
  methods: {
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString()
    },
    getStatusClass(status) {
      const statusClasses = {
        'Open': 'bg-yellow-100 text-yellow-800',
        'Draft': 'bg-green-100 text-green-800',
        'New': 'bg-blue-100 text-blue-800',
        'Accepted': 'bg-purple-100 text-purple-800',
        'Qualified': 'bg-indigo-100 text-indigo-800'
      }
      return statusClasses[status] || 'bg-gray-100 text-gray-800'
    },
    viewInquiry(inquiry) {
      console.log("Viewing inquiry:", inquiry.name)
      console.log("Router push with params:", { name: 'InquiryDetail', params: { id: inquiry.name } })
      this.$router.push({ name: 'InquiryDetail', params: { id: inquiry.name } })
    },
    acceptInquiry(inquiry) {
      this.acceptingInquiry = inquiry.name
      this.$resources.acceptInquiry.submit({ inquiry: inquiry.name })
    }
  }
}
</script>
