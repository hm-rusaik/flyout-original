<template>
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Inquiry Details</h1>
          <p class="mt-1 text-sm text-gray-500">View and manage inquiry information</p>
        </div>
        <div class="flex space-x-2">
          <Button @click="goBack" variant="outline" icon-left="arrow-left">Back</Button>
          <Button @click="$resources.inquiry.fetch()" :loading="$resources.inquiry.loading" icon-left="refresh-cw">
            Refresh
          </Button>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="$resources.inquiry.loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-gray-600">Loading inquiry details...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="$resources.inquiry.error" class="text-center py-12">
      <div class="text-red-600 mb-2">
        <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <div class="text-red-600 font-medium mb-2">Error loading inquiry</div>
      <div class="text-gray-600 mb-4">{{ $resources.inquiry.error }}</div>
      <Button @click="$resources.inquiry.fetch()" variant="outline">Retry</Button>
    </div>

    <!-- Inquiry details -->
    <div v-else-if="inquiry" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main information -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Basic Information -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Basic Information</h3>
          </div>
          <div class="p-6">
            <dl class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <dt class="text-sm font-medium text-gray-500">Inquiry ID</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ inquiry.name }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Status</dt>
                <dd class="mt-1">
                  <span :class="getStatusClass(inquiry.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ inquiry.status }}
                  </span>
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Priority</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ inquiry.priority || 'Not set' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Inquiry Date</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDate(inquiry.inquiry_date) }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Client Information -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Client Information</h3>
          </div>
          <div class="p-6">
            <dl class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
              <div>
                <dt class="text-sm font-medium text-gray-500">Client Name</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ inquiry.client_name }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Client ID</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ inquiry.client_id }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Email</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ inquiry.client_email }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Phone</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ inquiry.client_phone || 'Not provided' }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Service Requirements -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Service Requirements</h3>
          </div>
          <div class="p-6">
            <dl class="space-y-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">Description</dt>
                <dd class="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{{ inquiry.description || 'No description provided' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Preferred Countries</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ inquiry.preferred_countries || 'Not specified' }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Required Languages</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ inquiry.required_languages || 'Not specified' }}</dd>
              </div>
              <div v-if="inquiry.special_requirements">
                <dt class="text-sm font-medium text-gray-500">Special Requirements</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ inquiry.special_requirements }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Budget Information -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Budget Information</h3>
          </div>
          <div class="p-6">
            <dl class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
              <div>
                <dt class="text-sm font-medium text-gray-500">Minimum Budget</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatCurrency(inquiry.budget_min, inquiry.currency) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Maximum Budget</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatCurrency(inquiry.budget_max, inquiry.currency) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Budget Flexibility</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ inquiry.budget_flexibility || 'Not specified' }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Actions -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Actions</h3>
          </div>
          <div class="p-6 space-y-3">
            <Button 
              v-if="inquiry.status === 'Draft' || inquiry.status === 'Open'" 
              @click="acceptInquiry" 
              class="w-full" 
              :loading="$resources.acceptInquiry?.loading"
            >
              Accept Inquiry
            </Button>
            <Button 
              v-if="inquiry.status === 'Accepted'" 
              @click="convertToDeal" 
              class="w-full" 
              :loading="$resources.convertToDeal.loading"
            >
              Convert to Deal
            </Button>
            <Button @click="editInquiry" variant="outline" class="w-full">
              Edit Inquiry
            </Button>
          </div>
        </div>

        <!-- Status History -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Status History</h3>
          </div>
          <div class="p-6">
            <dl class="space-y-3">
              <div>
                <dt class="text-sm font-medium text-gray-500">Created</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDateTime(inquiry.creation) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Last Modified</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDateTime(inquiry.modified) }}</dd>
              </div>
              <div v-if="inquiry.conversion_date">
                <dt class="text-sm font-medium text-gray-500">Conversion Date</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ formatDateTime(inquiry.conversion_date) }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Assignment Information -->
        <div v-if="inquiry.selected_provider" class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Assignment</h3>
          </div>
          <div class="p-6">
            <dl class="space-y-3">
              <div>
                <dt class="text-sm font-medium text-gray-500">Assigned Provider</dt>
                <dd class="mt-1 text-sm text-gray-900">{{ inquiry.selected_provider }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- Conversion Notes -->
        <div v-if="inquiry.conversion_notes" class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Conversion Notes</h3>
          </div>
          <div class="p-6">
            <p class="text-sm text-gray-900 whitespace-pre-wrap">{{ inquiry.conversion_notes }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Button } from 'frappe-ui'

export default {
  name: 'InquiryDetailView',
  components: {
    Button
  },
  data() {
    return {
      inquiryId: this.$route.params.id
    }
  },
 resources: {
  inquiry: {
    url: 'frappe.client.get',
    makeParams() {
      console.log("🔎 Params for inquiry:", {
        doctype: 'Inquiry',
        name: this.inquiryId
      })
      return {
        doctype: 'Inquiry',
        name: this.inquiryId
      }
    },
    auto: true,
    transform(data) {
      return data.message
    }
  },
},
  computed: {
    inquiry() {
      return this.$resources.inquiry.data || {}
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1)
    },
    formatDate(dateString) {
      if (!dateString) return 'Not set'
      return new Date(dateString).toLocaleDateString()
    },
    formatDateTime(dateString) {
      if (!dateString) return 'Not set'
      return new Date(dateString).toLocaleString()
    },
    formatCurrency(amount, currency) {
      if (!amount || amount === 0) return 'Not specified'
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD'
      }).format(amount)
    },
    getStatusClass(status) {
      const statusClasses = {
        'Open': 'bg-yellow-100 text-yellow-800',
        'Draft': 'bg-green-100 text-green-800',
        'New': 'bg-blue-100 text-blue-800',
        'Accepted': 'bg-purple-100 text-purple-800',
        'Qualified': 'bg-indigo-100 text-indigo-800',
        'Converted': 'bg-green-100 text-green-800'
      }
      return statusClasses[status] || 'bg-gray-100 text-gray-800'
    },
    acceptInquiry() {
      this.$resources.acceptInquiry.submit()
    },
    convertToDeal() {
      this.$resources.convertToDeal.submit()
    },
    editInquiry() {
      // TODO: Implement edit functionality
      console.log('Edit inquiry:', this.inquiry)
    }
  }
}
</script>
