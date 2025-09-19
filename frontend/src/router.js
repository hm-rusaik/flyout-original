import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/pages/Home.vue'),
    meta: { title: 'Home' }
  },
  {
    path: '/inquiries',
    name: 'Inquiries',
    component: () => import('@/pages/InquiriesView.vue'),
    meta: { title: 'Inquiries' }
  },
  {
    path: '/accepted-inquiries',
    name: 'AcceptedInquiries',
    component: () => import('@/pages/AcceptedInquiriesView.vue'),
    meta: { title: 'Accepted Inquiries' }
  },
  {
    path: '/inquiry/:id',
    name: 'InquiryDetail',
    component: () => import('@/pages/InquiryDetailView.vue'),
    meta: { title: 'Inquiry Details' }
  },
  {
    path: '/application',
    name: 'Application',
    component: () => import('@/pages/ApplicationView.vue'),
    meta: { title: 'Applications' }
  },
  {
    path: '/team-management',
    name: 'TeamManagement',
    component: () => import('@/pages/TeamManagementView.vue'),
    meta: { title: 'Team Management' }
  },
]

let router = createRouter({
  history: createWebHistory('/frontend'),
  routes,
})

// Update page title based on route meta
router.beforeEach((to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - Provider Portal` : 'Provider Portal'
  next()
})

export default router
