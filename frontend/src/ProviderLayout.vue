<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Mobile menu button -->
    <div class="lg:hidden fixed top-4 left-4 z-50">
      <Button 
        @click="sidebarOpen = !sidebarOpen" 
        variant="outline" 
        size="sm"
        :aria-label="sidebarOpen ? 'Close sidebar' : 'Open sidebar'"
        aria-expanded="false"
        aria-controls="sidebar"
      >
        <span class="sr-only">{{ sidebarOpen ? 'Close sidebar' : 'Open sidebar' }}</span>
        <svg v-if="!sidebarOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </Button>
    </div>

    <!-- Sidebar -->
    <div 
      id="sidebar"
      :class="[
        'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:transform-none',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
      role="navigation"
      aria-label="Main navigation"
    >
      <div class="p-6 border-b border-gray-200">
        <h1 class="text-xl font-semibold text-gray-900">Provider Portal</h1>
      </div>
      <nav class="p-4" aria-label="Main menu">
        <div class="space-y-1">
          <router-link
            to="/inquiries"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            active-class="bg-blue-50 text-blue-700"
            @click="sidebarOpen = false"
          >
            <svg class="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
            </svg>
            Inquiries
          </router-link>
          <router-link
            to="/accepted-inquiries"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            active-class="bg-blue-50 text-blue-700"
            @click="sidebarOpen = false"
          >
            <svg class="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Accepted Inquiries
          </router-link>
          <router-link
            to="/application"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            active-class="bg-blue-50 text-blue-700"
            @click="sidebarOpen = false"
          >
            <svg class="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            Applications
          </router-link>
          <router-link
            to="/team-management"
            class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            active-class="bg-blue-50 text-blue-700"
            @click="sidebarOpen = false"
          >
            <svg class="mr-3 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
            </svg>
            Team Management
          </router-link>
        </div>
      </nav>
    </div>

    <!-- Overlay for mobile -->
    <div 
      v-if="sidebarOpen" 
      class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
      @click="sidebarOpen = false"
      aria-hidden="true"
    ></div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden lg:ml-0">
      <!-- Header -->
      <header class="bg-white border-b border-gray-200">
        <div class="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 class="text-xl font-semibold text-gray-900">{{ currentPageTitle }}</h1>
          <div class="flex items-center space-x-4">
            <!-- User menu -->
            <Dropdown :options="userMenuOptions" placement="right">
              <template v-slot="{ toggle }">
                <button
                  @click="toggle"
                  class="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    PU
                  </div>
                  <span class="hidden md:block text-gray-700 font-medium">Provider User</span>
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </template>
            </Dropdown>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
        <div class="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { Button, Dropdown } from 'frappe-ui'

export default {
  name: 'ProviderLayout',
  components: {
    Button,
    Dropdown
  },
  data() {
    return {
      sidebarOpen: false
    }
  },
  computed: {
    currentPageTitle() {
      // Get the current route's meta title or a default
      return this.$route.meta.title || 'Provider Dashboard';
    },
    userMenuOptions() {
      return [
        {
          label: 'Profile',
          icon: 'user',
          onClick: () => console.log('Profile clicked')
        },
        {
          label: 'Settings',
          icon: 'settings',
          onClick: () => console.log('Settings clicked')
        },
        {
          label: 'Logout',
          icon: 'log-out',
          onClick: () => console.log('Logout clicked')
        }
      ]
    }
  },
  watch: {
    $route() {
      // Close sidebar on route change for mobile
      this.sidebarOpen = false
    }
  }
};
</script>

<style scoped>
/* Add any specific styles for the layout here */
.router-link-exact-active {
  @apply bg-gray-200 text-gray-900;
}
</style>
