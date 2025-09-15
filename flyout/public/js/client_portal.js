/**
 * Client Portal JavaScript
 * Handles all client-side functionality for the client portal
 */

// Global variables
let currentClient = null;
let currentView = 'dashboard';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeClientPortal();
});

/**
 * Initialize the client portal
 */
async function initializeClientPortal() {
    try {
        // Check if user is logged in
        const session = await checkClientSession();
        if (!session.authenticated) {
            showLoginForm();
            return;
        }

        currentClient = session.client;
        updateUIWithClientData();
        loadDashboardData();
        
    } catch (error) {
        console.error('Error initializing client portal:', error);
        showError('Failed to initialize portal. Please refresh the page.');
    }
}

/**
 * Check client session
 */
async function checkClientSession() {
    try {
        const response = await fetch('/api/method/flyout.api.client_portal.get_session');
        const data = await response.json();
        
        if (data.message && data.message.authenticated) {
            return data.message;
        }
        
        return { authenticated: false };
    } catch (error) {
        console.error('Session check failed:', error);
        return { authenticated: false };
    }
}

/**
 * Update UI with client data
 */
function updateUIWithClientData() {
    if (currentClient) {
        document.getElementById('userName').textContent = currentClient.full_name || 'Client';
        document.getElementById('clientName').textContent = currentClient.full_name || 'Client';
    }
}

/**
 * Load dashboard data
 */
async function loadDashboardData() {
    try {
        const response = await fetch('/api/method/flyout.api.client_portal.get_dashboard_data');
        const data = await response.json();
        
        if (data.message) {
            updateDashboardMetrics(data.message);
            updateRecentActivity(data.message.recent_activity);
            updateQuickStats(data.message.stats);
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showError('Failed to load dashboard data');
    }
}

/**
 * Update dashboard metrics
 */
function updateDashboardMetrics(data) {
    document.getElementById('totalInquiries').textContent = data.total_inquiries || 0;
    document.getElementById('activeApplications').textContent = data.active_applications || 0;
    document.getElementById('completedApplications').textContent = data.completed_applications || 0;
    document.getElementById('totalProviders').textContent = data.total_providers || 0;
}

/**
 * Update recent activity
 */
function updateRecentActivity(activities) {
    const activityContainer = document.getElementById('recentActivity');
    
    if (!activities || activities.length === 0) {
        activityContainer.innerHTML = '<p class="text-muted">No recent activity</p>';
        return;
    }

    const activityHTML = activities.map(activity => `
        <div class="d-flex align-items-center mb-3 pb-3 border-bottom">
            <div class="flex-shrink-0">
                <div class="user-avatar me-3" style="width: 32px; height: 32px; font-size: 14px;">
                    <i class="fas fa-${getActivityIcon(activity.type)}"></i>
                </div>
            </div>
            <div class="flex-grow-1">
                <h6 class="mb-1">${activity.title}</h6>
                <p class="text-muted mb-1 small">${activity.description}</p>
                <small class="text-muted">${formatDate(activity.timestamp)}</small>
            </div>
            <div class="flex-shrink-0">
                <span class="status-badge status-${activity.status.toLowerCase()}">
                    ${activity.status}
                </span>
            </div>
        </div>
    `).join('');

    activityContainer.innerHTML = activityHTML;
}

/**
 * Update quick stats
 */
function updateQuickStats(stats) {
    document.getElementById('inquirySuccessRate').textContent = `${stats.inquiry_success_rate || 0}%`;
    document.getElementById('avgResponseTime').textContent = `${stats.avg_response_time || 0} days`;
    document.getElementById('profileCompletion').textContent = `${stats.profile_completion || 0}%`;
    
    // Update progress bars
    document.getElementById('successRateBar').style.width = `${stats.inquiry_success_rate || 0}%`;
    document.getElementById('profileCompletionBar').style.width = `${stats.profile_completion || 0}%`;
}

/**
 * Get activity icon
 */
function getActivityIcon(type) {
    const icons = {
        'inquiry': 'question-circle',
        'application': 'file-alt',
        'message': 'envelope',
        'document': 'folder',
        'status_change': 'sync'
    };
    return icons[type] || 'circle';
}

/**
 * Format date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString();
}

/**
 * Navigation functions
 */
function showDashboard() {
    setActiveNavLink('dashboard');
    document.getElementById('mainContent').innerHTML = document.getElementById('dashboardView').outerHTML;
    currentView = 'dashboard';
    loadDashboardData();
}

function showInquiries() {
    setActiveNavLink('inquiries');
    currentView = 'inquiries';
    loadInquiriesView();
}

function showApplications() {
    setActiveNavLink('applications');
    currentView = 'applications';
    loadApplicationsView();
}

function showNewInquiry() {
    setActiveNavLink('new-inquiry');
    currentView = 'new-inquiry';
    loadNewInquiryForm();
}

function showDocuments() {
    setActiveNavLink('documents');
    currentView = 'documents';
    loadDocumentsView();
}

function showMessages() {
    setActiveNavLink('messages');
    currentView = 'messages';
    loadMessagesView();
}

function showProfile() {
    setActiveNavLink('profile');
    currentView = 'profile';
    loadProfileView();
}

/**
 * Set active navigation link
 */
function setActiveNavLink(view) {
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Find and activate the corresponding nav link
    const linkMap = {
        'dashboard': 0,
        'inquiries': 1,
        'applications': 2,
        'new-inquiry': 3,
        'documents': 4,
        'messages': 5,
        'profile': 6
    };
    
    if (linkMap[view] !== undefined) {
        navLinks[linkMap[view]].classList.add('active');
    }
}

/**
 * Load inquiries view
 */
async function loadInquiriesView() {
    try {
        const response = await fetch('/api/method/flyout.api.client_portal.get_client_inquiries');
        const data = await response.json();
        
        if (data.message) {
            renderInquiriesList(data.message);
        }
    } catch (error) {
        console.error('Error loading inquiries:', error);
        showError('Failed to load inquiries');
    }
}

/**
 * Render inquiries list
 */
function renderInquiriesList(inquiries) {
    const content = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>My Inquiries</h2>
            <button class="btn btn-primary" onclick="showNewInquiry()">
                <i class="fas fa-plus me-2"></i>New Inquiry
            </button>
        </div>

        <div class="row">
            <div class="col-12">
                <div class="dashboard-card">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Inquiry ID</th>
                                    <th>Service Type</th>
                                    <th>Status</th>
                                    <th>Priority</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${inquiries.map(inquiry => `
                                    <tr class="inquiry-card">
                                        <td><strong>${inquiry.name}</strong></td>
                                        <td>${inquiry.service_type || 'General'}</td>
                                        <td>
                                            <span class="status-badge status-${inquiry.status.toLowerCase().replace(' ', '-')}">
                                                ${inquiry.status}
                                            </span>
                                        </td>
                                        <td>
                                            <span class="badge bg-${getPriorityColor(inquiry.priority)}">
                                                ${inquiry.priority}
                                            </span>
                                        </td>
                                        <td>${formatDate(inquiry.creation)}</td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary" onclick="viewInquiry('${inquiry.name}')">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('mainContent').innerHTML = content;
}

/**
 * Get priority color
 */
function getPriorityColor(priority) {
    const colors = {
        'Low': 'secondary',
        'Medium': 'warning',
        'High': 'danger',
        'Urgent': 'dark'
    };
    return colors[priority] || 'secondary';
}

/**
 * Load new inquiry form
 */
function loadNewInquiryForm() {
    const content = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Submit New Inquiry</h2>
            <button class="btn btn-outline-secondary" onclick="showDashboard()">
                <i class="fas fa-arrow-left me-2"></i>Back to Dashboard
            </button>
        </div>

        <div class="row">
            <div class="col-lg-8">
                <div class="dashboard-card">
                    <form id="newInquiryForm">
                        <!-- Basic Information -->
                        <h5 class="mb-3">Basic Information</h5>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="serviceType" class="form-label">Service Type *</label>
                                <select class="form-select" id="serviceType" required>
                                    <option value="">Select Service Type</option>
                                    <option value="Immigration">Immigration</option>
                                    <option value="Visa">Visa</option>
                                    <option value="Education">Education</option>
                                    <option value="Work Permit">Work Permit</option>
                                    <option value="Business Setup">Business Setup</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="priority" class="form-label">Priority *</label>
                                <select class="form-select" id="priority" required>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                    <option value="High">High</option>
                                    <option value="Urgent">Urgent</option>
                                </select>
                            </div>
                        </div>

                        <!-- Description -->
                        <div class="mb-3">
                            <label for="description" class="form-label">Description *</label>
                            <textarea class="form-control" id="description" rows="4" required 
                                placeholder="Please describe your inquiry in detail..."></textarea>
                        </div>

                        <!-- Special Requirements -->
                        <div class="mb-3">
                            <label for="specialRequirements" class="form-label">Special Requirements</label>
                            <textarea class="form-control" id="specialRequirements" rows="3" 
                                placeholder="Any special requirements or preferences..."></textarea>
                        </div>

                        <!-- Budget Information -->
                        <h5 class="mb-3">Budget Information</h5>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="budgetMin" class="form-label">Minimum Budget</label>
                                <div class="input-group">
                                    <span class="input-group-text">$</span>
                                    <input type="number" class="form-control" id="budgetMin" min="0">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label for="budgetMax" class="form-label">Maximum Budget</label>
                                <div class="input-group">
                                    <span class="input-group-text">$</span>
                                    <input type="number" class="form-control" id="budgetMax" min="0">
                                </div>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="budgetFlexibility" class="form-label">Budget Flexibility</label>
                            <select class="form-select" id="budgetFlexibility">
                                <option value="Somewhat Flexible">Somewhat Flexible</option>
                                <option value="Strict">Strict</option>
                                <option value="Very Flexible">Very Flexible</option>
                            </select>
                        </div>

                        <!-- Location Preferences -->
                        <h5 class="mb-3">Location Preferences</h5>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="preferredCountry" class="form-label">Preferred Country</label>
                                <input type="text" class="form-control" id="preferredCountry" 
                                    placeholder="e.g., Canada, Australia, UK">
                            </div>
                            <div class="col-md-6">
                                <label for="alternativeCountries" class="form-label">Alternative Countries</label>
                                <input type="text" class="form-control" id="alternativeCountries" 
                                    placeholder="Comma-separated list">
                            </div>
                        </div>

                        <!-- Language Requirements -->
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="requiredLanguages" class="form-label">Required Languages</label>
                                <input type="text" class="form-control" id="requiredLanguages" 
                                    placeholder="e.g., English, French">
                            </div>
                            <div class="col-md-6">
                                <label for="alternativeLanguages" class="form-label">Alternative Languages</label>
                                <input type="text" class="form-control" id="alternativeLanguages" 
                                    placeholder="Comma-separated list">
                            </div>
                        </div>

                        <!-- Timeline -->
                        <h5 class="mb-3">Timeline</h5>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="deadline" class="form-label">Expected Deadline</label>
                                <input type="date" class="form-control" id="deadline">
                            </div>
                            <div class="col-md-6">
                                <label for="timelineWeeks" class="form-label">Expected Timeline (Weeks)</label>
                                <input type="number" class="form-control" id="timelineWeeks" min="1" step="0.5">
                            </div>
                        </div>

                        <!-- Submit Button -->
                        <div class="d-flex justify-content-end">
                            <button type="button" class="btn btn-outline-secondary me-2" onclick="showDashboard()">
                                Cancel
                            </button>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-paper-plane me-2"></i>Submit Inquiry
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Sidebar with help information -->
            <div class="col-lg-4">
                <div class="dashboard-card mb-3">
                    <h6 class="mb-3">
                        <i class="fas fa-lightbulb me-2"></i>Tips for a Successful Inquiry
                    </h6>
                    <ul class="list-unstyled">
                        <li class="mb-2">
                            <i class="fas fa-check text-success me-2"></i>
                            Be as detailed as possible in your description
                        </li>
                        <li class="mb-2">
                            <i class="fas fa-check text-success me-2"></i>
                            Include your budget range if applicable
                        </li>
                        <li class="mb-2">
                            <i class="fas fa-check text-success me-2"></i>
                            Specify your preferred timeline
                        </li>
                        <li class="mb-2">
                            <i class="fas fa-check text-success me-2"></i>
                            Mention any special requirements
                        </li>
                    </ul>
                </div>

                <div class="dashboard-card">
                    <h6 class="mb-3">
                        <i class="fas fa-clock me-2"></i>What Happens Next?
                    </h6>
                    <ol class="list-unstyled">
                        <li class="mb-2">
                            <strong>1.</strong> We review your inquiry within 24 hours
                        </li>
                        <li class="mb-2">
                            <strong>2.</strong> Match you with suitable providers
                        </li>
                        <li class="mb-2">
                            <strong>3.</strong> Providers submit proposals
                        </li>
                        <li class="mb-2">
                            <strong>4.</strong> You choose the best option
                        </li>
                    </ol>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('mainContent').innerHTML = content;
    
    // Add form submission handler
    document.getElementById('newInquiryForm').addEventListener('submit', submitNewInquiry);
}

/**
 * Submit new inquiry
 */
async function submitNewInquiry(event) {
    event.preventDefault();
    
    const formData = {
        service_type: document.getElementById('serviceType').value,
        priority: document.getElementById('priority').value,
        description: document.getElementById('description').value,
        special_requirements: document.getElementById('specialRequirements').value,
        budget_min: document.getElementById('budgetMin').value,
        budget_max: document.getElementById('budgetMax').value,
        budget_flexibility: document.getElementById('budgetFlexibility').value,
        preferred_countries: document.getElementById('preferredCountry').value,
        alternative_countries: document.getElementById('alternativeCountries').value,
        required_languages: document.getElementById('requiredLanguages').value,
        alternative_languages: document.getElementById('alternativeLanguages').value,
        deadline: document.getElementById('deadline').value,
        timeline_weeks: document.getElementById('timelineWeeks').value
    };

    try {
        const response = await fetch('/api/method/flyout.api.client_portal.create_inquiry', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (data.message && data.message.success) {
            showSuccess('Inquiry submitted successfully!');
            setTimeout(() => showInquiries(), 2000);
        } else {
            showError(data.message?.error || 'Failed to submit inquiry');
        }
    } catch (error) {
        console.error('Error submitting inquiry:', error);
        showError('Failed to submit inquiry. Please try again.');
    }
}

/**
 * View inquiry details
 */
async function viewInquiry(inquiryId) {
    try {
        const response = await fetch(`/api/method/flyout.api.client_portal.get_inquiry_details?inquiry=${inquiryId}`);
        const data = await response.json();
        
        if (data.message) {
            renderInquiryDetails(data.message);
        }
    } catch (error) {
        console.error('Error loading inquiry details:', error);
        showError('Failed to load inquiry details');
    }
}

/**
 * Render inquiry details
 */
function renderInquiryDetails(inquiry) {
    const content = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Inquiry Details - ${inquiry.name}</h2>
            <button class="btn btn-outline-secondary" onclick="showInquiries()">
                <i class="fas fa-arrow-left me-2"></i>Back to List
            </button>
        </div>

        <div class="row">
            <div class="col-lg-8">
                <div class="dashboard-card mb-3">
                    <h5 class="mb-3">Basic Information</h5>
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Service Type:</strong> ${inquiry.service_type || 'General'}</p>
                            <p><strong>Priority:</strong> <span class="badge bg-${getPriorityColor(inquiry.priority)}">${inquiry.priority}</span></p>
                            <p><strong>Status:</strong> <span class="status-badge status-${inquiry.status.toLowerCase().replace(' ', '-')}">${inquiry.status}</span></p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Date:</strong> ${formatDate(inquiry.creation)}</p>
                            <p><strong>Budget:</strong> $${inquiry.budget_min || 0} - $${inquiry.budget_max || 'Not specified'}</p>
                            <p><strong>Timeline:</strong> ${inquiry.timeline_weeks || 'Not specified'} weeks</p>
                        </div>
                    </div>
                </div>

                <div class="dashboard-card mb-3">
                    <h5 class="mb-3">Description</h5>
                    <p>${inquiry.description || 'No description provided'}</p>
                    
                    ${inquiry.special_requirements ? `
                        <h6 class="mt-3 mb-2">Special Requirements</h6>
                        <p>${inquiry.special_requirements}</p>
                    ` : ''}
                </div>

                ${inquiry.service_requests && inquiry.service_requests.length > 0 ? `
                    <div class="dashboard-card mb-3">
                        <h5 class="mb-3">Service Requests</h5>
                        <ul class="list-unstyled">
                            ${inquiry.service_requests.map(request => `
                                <li class="mb-2">
                                    <i class="fas fa-check-circle text-success me-2"></i>
                                    ${request.service_name}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}

                ${inquiry.documents && inquiry.documents.length > 0 ? `
                    <div class="dashboard-card mb-3">
                        <h5 class="mb-3">Attached Documents</h5>
                        <div class="row">
                            ${inquiry.documents.map(doc => `
                                <div class="col-md-6 mb-2">
                                    <div class="d-flex align-items-center">
                                        <i class="fas fa-file-alt me-2"></i>
                                        <span>${doc.file_name}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>

            <div class="col-lg-4">
                <div class="dashboard-card mb-3">
                    <h6 class="mb-3">Inquiry Timeline</h6>
                    <div class="timeline">
                        <div class="timeline-item">
                            <div class="timeline-marker"></div>
                            <div class="timeline-content">
                                <h6>Inquiry Submitted</h6>
                                <p class="text-muted">${formatDate(inquiry.creation)}</p>
                            </div>
                        </div>
                        ${inquiry.matched_date ? `
                            <div class="timeline-item">
                                <div class="timeline-marker bg-success"></div>
                                <div class="timeline-content">
                                    <h6>Providers Matched</h6>
                                    <p class="text-muted">${formatDate(inquiry.matched_date)}</p>
                                </div>
                            </div>
                        ` : ''}
                        ${inquiry.conversion_date ? `
                            <div class="timeline-item">
                                <div class="timeline-marker bg-primary"></div>
                                <div class="timeline-content">
                                    <h6>Converted to Application</h6>
                                    <p class="text-muted">${formatDate(inquiry.conversion_date)}</p>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>

                ${inquiry.status === 'Matched' ? `
                    <div class="dashboard-card">
                        <h6 class="mb-3">Matched Providers</h6>
                        <div id="matchedProviders">
                            <!-- Matched providers will be loaded here -->
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    document.getElementById('mainContent').innerHTML = content;
}

/**
 * Load applications view
 */
async function loadApplicationsView() {
    try {
        const response = await fetch('/api/method/flyout.api.client_portal.get_client_applications');
        const data = await response.json();
        
        if (data.message) {
            renderApplicationsList(data.message);
        }
    } catch (error) {
        console.error('Error loading applications:', error);
        showError('Failed to load applications');
    }
}

/**
 * Render applications list
 */
function renderApplicationsList(applications) {
    const content = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>My Applications</h2>
        </div>

        <div class="row">
            <div class="col-12">
                <div class="dashboard-card">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Application ID</th>
                                    <th>Service Type</th>
                                    <th>Status</th>
                                    <th>Progress</th>
                                    <th>Provider</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${applications.map(app => `
                                    <tr>
                                        <td><strong>${app.name}</strong></td>
                                        <td>${app.service_type || 'General'}</td>
                                        <td>
                                            <span class="badge bg-${getApplicationStatusColor(app.application_status)}">
                                                ${app.application_status}
                                            </span>
                                        </td>
                                        <td>
                                            <div class="progress" style="width: 80px;">
                                                <div class="progress-bar" style="width: ${app.overall_progress || 0}%"></div>
                                            </div>
                                            <small class="text-muted">${app.overall_progress || 0}%</small>
                                        </td>
                                        <td>${app.provider_name || 'Not assigned'}</td>
                                        <td>${formatDate(app.creation)}</td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary" onclick="viewApplication('${app.name}')">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('mainContent').innerHTML = content;
}

/**
 * Get application status color
 */
function getApplicationStatusColor(status) {
    const colors = {
        'New': 'primary',
        'In Progress': 'warning',
        'Under Review': 'info',
        'Approved': 'success',
        'Rejected': 'danger',
        'Completed': 'success'
    };
    return colors[status] || 'secondary';
}

/**
 * View application details
 */
async function viewApplication(applicationId) {
    try {
        const response = await fetch(`/api/method/flyout.api.client_portal.get_application_details?application=${applicationId}`);
        const data = await response.json();
        
        if (data.message) {
            renderApplicationDetails(data.message);
        }
    } catch (error) {
        console.error('Error loading application details:', error);
        showError('Failed to load application details');
    }
}

/**
 * Render application details
 */
function renderApplicationDetails(application) {
    const content = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Application Details - ${application.name}</h2>
            <button class="btn btn-outline-secondary" onclick="showApplications()">
                <i class="fas fa-arrow-left me-2"></i>Back to List
            </button>
        </div>

        <div class="row">
            <div class="col-lg-8">
                <!-- Application Progress -->
                <div class="dashboard-card mb-3">
                    <h5 class="mb-3">Application Progress</h5>
                    <div class="mb-3">
                        <div class="d-flex justify-content-between mb-2">
                            <span>Overall Progress</span>
                            <strong>${application.overall_progress || 0}%</strong>
                        </div>
                        <div class="progress" style="height: 10px;">
                            <div class="progress-bar bg-primary" style="width: ${application.overall_progress || 0}%"></div>
                        </div>
                    </div>
                    
                    ${application.current_stage ? `
                        <p><strong>Current Stage:</strong> ${application.current_stage}</p>
                    ` : ''}
                </div>

                <!-- Application Stages -->
                ${application.application_stages && application.application_stages.length > 0 ? `
                    <div class="dashboard-card mb-3">
                        <h5 class="mb-3">Process Stages</h5>
                        <div class="list-group">
                            ${application.application_stages.map(stage => `
                                <div class="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="mb-1">${stage.stage_name}</h6>
                                        <small class="text-muted">${stage.description || ''}</small>
                                    </div>
                                    <div class="text-end">
                                        ${stage.completed ? 
                                            '<i class="fas fa-check-circle text-success"></i>' : 
                                            '<i class="fas fa-clock text-warning"></i>'
                                        }
                                        <br>
                                        <small class="text-muted">${stage.completion_date || 'Pending'}</small>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- Application Details -->
                <div class="dashboard-card mb-3">
                    <h5 class="mb-3">Application Details</h5>
                    <div class="row">
                        <div class="col-md-6">
                            <p><strong>Service Type:</strong> ${application.service_type || 'General'}</p>
                            <p><strong>Category:</strong> ${application.category || 'Not specified'}</p>
                            <p><strong>Priority:</strong> <span class="badge bg-${getPriorityColor(application.priority)}">${application.priority}</span></p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Expected Completion:</strong> ${formatDate(application.expected_completion_date)}</p>
                            <p><strong>Actual Completion:</strong> ${formatDate(application.actual_completion_date) || 'Not completed'}</p>
                            <p><strong>Provider:</strong> ${application.provider_name || 'Not assigned'}</p>
                        </div>
                    </div>
                    
                    ${application.application_description ? `
                        <h6 class="mt-3 mb-2">Description</h6>
                        <p>${application.application_description}</p>
                    ` : ''}
                    
                    ${application.special_requirements ? `
                        <h6 class="mt-3 mb-2">Special Requirements</h6>
                        <p>${application.special_requirements}</p>
                    ` : ''}
                </div>

                <!-- Documents -->
                ${application.application_documents && application.application_documents.length > 0 ? `
                    <div class="dashboard-card mb-3">
                        <h5 class="mb-3">Required Documents</h5>
                        <div class="row">
                            ${application.application_documents.map(doc => `
                                <div class="col-md-6 mb-2">
                                    <div class="d-flex align-items-center">
                                        <i class="fas fa-${doc.uploaded ? 'check-circle text-success' : 'times-circle text-danger'} me-2"></i>
                                        <span>${doc.document_name}</span>
                                        ${doc.uploaded ? '<span class="badge bg-success ms-auto">Uploaded</span>' : '<span class="badge bg-warning ms-auto">Pending</span>'}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>

            <div class="col-lg-4">
                <!-- Fee Summary -->
                <div class="dashboard-card mb-3">
                    <h6 class="mb-3">Fee Summary</h6>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Total Amount:</span>
                        <strong>$${application.total_amount || 0}</strong>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Paid Amount:</span>
                        <strong>$${application.paid_amount || 0}</strong>
                    </div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>Outstanding:</span>
                        <strong class="${application.outstanding_amount > 0 ? 'text-danger' : 'text-success'}">
                            $${application.outstanding_amount || 0}
                        </strong>
                    </div>
                    <hr>
                    <div class="d-flex justify-content-between">
                        <span>Payment Status:</span>
                        <span class="badge bg-${getPaymentStatusColor(application.payment_status)}">
                            ${application.payment_status}
                        </span>
                    </div>
                </div>

                <!-- Communication -->
                <div class="dashboard-card mb-3">
                    <h6 class="mb-3">Recent Communications</h6>
                    <div id="applicationCommunications">
                        ${application.application_communications && application.application_communications.length > 0 ? 
                            application.application_communications.slice(0, 3).map(comm => `
                                <div class="mb-2 pb-2 border-bottom">
                                    <small class="text-muted">${formatDate(comm.communication_date)}</small>
                                    <p class="mb-1">${comm.subject}</p>
                                    <small class="text-muted">${comm.communication_type}</small>
                                </div>
                            `).join('') : 
                            '<p class="text-muted">No recent communications</p>'
                        }
                    </div>
                    <button class="btn btn-sm btn-outline-primary w-100 mt-2" onclick="showApplicationMessages('${application.name}')">
                        View All Messages
                    </button>
                </div>

                <!-- Actions -->
                <div class="dashboard-card">
                    <h6 class="mb-3">Quick Actions</h6>
                    <div class="d-grid gap-2">
                        <button class="btn btn-outline-primary" onclick="sendMessage('${application.name}')">
                            <i class="fas fa-envelope me-2"></i>Send Message
                        </button>
                        <button class="btn btn-outline-secondary" onclick="uploadDocument('${application.name}')">
                            <i class="fas fa-upload me-2"></i>Upload Document
                        </button>
                        ${application.outstanding_amount > 0 ? `
                            <button class="btn btn-outline-success" onclick="makePayment('${application.name}')">
                                <i class="fas fa-credit-card me-2"></i>Make Payment
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('mainContent').innerHTML = content;
}

/**
 * Get payment status color
 */
function getPaymentStatusColor(status) {
    const colors = {
        'Pending': 'warning',
        'Partial': 'info',
        'Paid': 'success',
        'Overdue': 'danger'
    };
    return colors[status] || 'secondary';
}

/**
 * Load documents view
 */
async function loadDocumentsView() {
    try {
        const response = await fetch('/api/method/flyout.api.client_portal.get_client_documents');
        const data = await response.json();
        
        if (data.message) {
            renderDocumentsList(data.message);
        }
    } catch (error) {
        console.error('Error loading documents:', error);
        showError('Failed to load documents');
    }
}

/**
 * Render documents list
 */
function renderDocumentsList(documents) {
    const content = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>My Documents</h2>
            <button class="btn btn-primary" onclick="uploadNewDocument()">
                <i class="fas fa-upload me-2"></i>Upload Document
            </button>
        </div>

        <div class="row">
            <div class="col-12">
                <div class="dashboard-card">
                    <div class="table-responsive">
                        <table class="table table-hover">
                            <thead>
                                <tr>
                                    <th>Document Name</th>
                                    <th>Type</th>
                                    <th>Size</th>
                                    <th>Upload Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${documents.map(doc => `
                                    <tr>
                                        <td>
                                            <i class="fas fa-file-alt me-2"></i>
                                            <strong>${doc.file_name}</strong>
                                        </td>
                                        <td>${doc.document_type || 'General'}</td>
                                        <td>${formatFileSize(doc.file_size)}</td>
                                        <td>${formatDate(doc.upload_date)}</td>
                                        <td>
                                            <span class="badge bg-${getDocumentStatusColor(doc.status)}">
                                                ${doc.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button class="btn btn-sm btn-outline-primary me-1" onclick="downloadDocument('${doc.name}')">
                                                <i class="fas fa-download"></i>
                                            </button>
                                            <button class="btn btn-sm btn-outline-danger" onclick="deleteDocument('${doc.name}')">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('mainContent').innerHTML = content;
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get document status color
 */
function getDocumentStatusColor(status) {
    const colors = {
        'Active': 'success',
        'Pending': 'warning',
        'Expired': 'danger',
        'Archived': 'secondary'
    };
    return colors[status] || 'secondary';
}

/**
 * Load messages view
 */
async function loadMessagesView() {
    try {
        const response = await fetch('/api/method/flyout.api.client_portal.get_client_messages');
        const data = await response.json();
        
        if (data.message) {
            renderMessagesList(data.message);
        }
    } catch (error) {
        console.error('Error loading messages:', error);
        showError('Failed to load messages');
    }
}

/**
 * Render messages list
 */
function renderMessagesList(messages) {
    const content = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Messages</h2>
            <button class="btn btn-primary" onclick="composeNewMessage()">
                <i class="fas fa-plus me-2"></i>New Message
            </button>
        </div>

        <div class="row">
            <div class="col-12">
                <div class="dashboard-card">
                    <div class="list-group">
                        ${messages.map(message => `
                            <div class="list-group-item list-group-item-action">
                                <div class="d-flex w-100 justify-content-between">
                                    <h6 class="mb-1">${message.subject}</h6>
                                    <small class="text-muted">${formatDate(message.creation)}</small>
                                </div>
                                <p class="mb-1">${message.content.substring(0, 100)}${message.content.length > 100 ? '...' : ''}</p>
                                <div class="d-flex justify-content-between align-items-center">
                                    <small class="text-muted">
                                        <i class="fas fa-user me-1"></i>${message.sender_name}
                                    </small>
                                    <div>
                                        ${!message.read ? '<span class="badge bg-primary">New</span>' : ''}
                                        <button class="btn btn-sm btn-outline-primary ms-2" onclick="viewMessage('${message.name}')">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('mainContent').innerHTML = content;
}

/**
 * Load profile view
 */
async function loadProfileView() {
    try {
        const response = await fetch('/api/method/flyout.api.client_portal.get_client_profile');
        const data = await response.json();
        
        if (data.message) {
            renderProfileView(data.message);
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showError('Failed to load profile');
    }
}

/**
 * Render profile view
 */
function renderProfileView(profile) {
    const content = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Profile Settings</h2>
            <button class="btn btn-primary" onclick="saveProfile()">
                <i class="fas fa-save me-2"></i>Save Changes
            </button>
        </div>

        <div class="row">
            <div class="col-lg-8">
                <div class="dashboard-card mb-3">
                    <h5 class="mb-3">Basic Information</h5>
                    <form id="profileForm">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="fullName" class="form-label">Full Name *</label>
                                <input type="text" class="form-control" id="fullName" value="${profile.full_name || ''}" required>
                            </div>
                            <div class="col-md-6">
                                <label for="email" class="form-label">Email *</label>
                                <input type="email" class="form-control" id="email" value="${profile.email || ''}" required>
                            </div>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="phone" class="form-label">Phone</label>
                                <input type="tel" class="form-control" id="phone" value="${profile.phone || ''}">
                            </div>
                            <div class="col-md-6">
                                <label for="companyName" class="form-label">Company Name</label>
                                <input type="text" class="form-control" id="companyName" value="${profile.company_name || ''}">
                            </div>
                        </div>

                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="industry" class="form-label">Industry</label>
                                <input type="text" class="form-control" id="industry" value="${profile.industry || ''}">
                            </div>
                            <div class="col-md-6">
                                <label for="companySize" class="form-label">Company Size</label>
                                <select class="form-select" id="companySize">
                                    <option value="">Select Size</option>
                                    <option value="1-10" ${profile.company_size === '1-10' ? 'selected' : ''}>1-10 employees</option>
                                    <option value="11-50" ${profile.company_size === '11-50' ? 'selected' : ''}>11-50 employees</option>
                                    <option value="51-200" ${profile.company_size === '51-200' ? 'selected' : ''}>51-200 employees</option>
                                    <option value="201-1000" ${profile.company_size === '201-1000' ? 'selected' : ''}>201-1000 employees</option>
                                    <option value="1000+" ${profile.company_size === '1000+' ? 'selected' : ''}>1000+ employees</option>
                                </select>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="bio" class="form-label">Bio</label>
                            <textarea class="form-control" id="bio" rows="3">${profile.bio || ''}</textarea>
                        </div>
                    </form>
                </div>

                <div class="dashboard-card mb-3">
                    <h5 class="mb-3">Location Information</h5>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="country" class="form-label">Country</label>
                            <input type="text" class="form-control" id="country" value="${profile.country || ''}">
                        </div>
                        <div class="col-md-6">
                            <label for="state" class="form-label">State/Province</label>
                            <input type="text" class="form-control" id="state" value="${profile.state || ''}">
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="city" class="form-label">City</label>
                            <input type="text" class="form-control" id="city" value="${profile.city || ''}">
                        </div>
                        <div class="col-md-6">
                            <label for="timezone" class="form-label">Timezone</label>
                            <input type="text" class="form-control" id="timezone" value="${profile.timezone || ''}">
                        </div>
                    </div>
                </div>

                <div class="dashboard-card mb-3">
                    <h5 class="mb-3">Preferences</h5>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label for="preferredLanguage" class="form-label">Preferred Language</label>
                            <input type="text" class="form-control" id="preferredLanguage" value="${profile.preferred_language || ''}">
                        </div>
                        <div class="col-md-6">
                            <label for="preferredCurrency" class="form-label">Preferred Currency</label>
                            <input type="text" class="form-control" id="preferredCurrency" value="${profile.preferred_currency || ''}">
                        </div>
                    </div>

                    <div class="mb-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="notificationEmail" ${profile.notification_email ? 'checked' : ''}>
                            <label class="form-check-label" for="notificationEmail">
                                Email Notifications
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="notificationSMS" ${profile.notification_sms ? 'checked' : ''}>
                            <label class="form-check-label" for="notificationSMS">
                                SMS Notifications
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="notificationPush" ${profile.notification_push ? 'checked' : ''}>
                            <label class="form-check-label" for="notificationPush">
                                Push Notifications
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-4">
                <!-- Profile Summary -->
                <div class="dashboard-card mb-3">
                    <h6 class="mb-3">Profile Summary</h6>
                    <div class="text-center mb-3">
                        <div class="user-avatar mx-auto mb-2" style="width: 80px; height: 80px; font-size: 24px;">
                            <i class="fas fa-user"></i>
                        </div>
                        <h5>${profile.full_name || 'Client'}</h5>
                        <p class="text-muted">${profile.email || ''}</p>
                    </div>
                    
                    <div class="mb-3">
                        <div class="d-flex justify-content-between mb-2">
                            <span>Profile Completion</span>
                            <strong>${profile.profile_completion || 0}%</strong>
                        </div>
                        <div class="progress" style="height: 8px;">
                            <div class="progress-bar" style="width: ${profile.profile_completion || 0}%"></div>
                        </div>
                    </div>
                </div>

                <!-- Account Settings -->
                <div class="dashboard-card mb-3">
                    <h6 class="mb-3">Account Settings</h6>
                    <div class="d-grid gap-2">
                        <button class="btn btn-outline-primary" onclick="changePassword()">
                            <i class="fas fa-key me-2"></i>Change Password
                        </button>
                        <button class="btn btn-outline-secondary" onclick="manageTwoFactor()">
                            <i class="fas fa-shield-alt me-2"></i>Two-Factor Auth
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteAccount()">
                            <i class="fas fa-user-times me-2"></i>Delete Account
                        </button>
                    </div>
                </div>

                <!-- Statistics -->
                <div class="dashboard-card">
                    <h6 class="mb-3">Account Statistics</h6>
                    <div class="row text-center">
                        <div class="col-6 mb-2">
                            <div class="metric-value" style="font-size: 1.5rem;">${profile.total_inquiries || 0}</div>
                            <div class="metric-label" style="font-size: 0.75rem;">Inquiries</div>
                        </div>
                        <div class="col-6 mb-2">
                            <div class="metric-value" style="font-size: 1.5rem;">${profile.active_applications || 0}</div>
                            <div class="metric-label" style="font-size: 0.75rem;">Applications</div>
                        </div>
                        <div class="col-6">
                            <div class="metric-value" style="font-size: 1.5rem;">${profile.total_providers || 0}</div>
                            <div class="metric-label" style="font-size: 0.75rem;">Providers</div>
                        </div>
                        <div class="col-6">
                            <div class="metric-value" style="font-size: 1.5rem;">${profile.total_documents || 0}</div>
                            <div class="metric-label" style="font-size: 0.75rem;">Documents</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('mainContent').innerHTML = content;
}

/**
 * Save profile
 */
async function saveProfile() {
    const formData = {
        full_name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        company_name: document.getElementById('companyName').value,
        industry: document.getElementById('industry').value,
        company_size: document.getElementById('companySize').value,
        bio: document.getElementById('bio').value,
        country: document.getElementById('country').value,
        state: document.getElementById('state').value,
        city: document.getElementById('city').value,
        timezone: document.getElementById('timezone').value,
        preferred_language: document.getElementById('preferredLanguage').value,
        preferred_currency: document.getElementById('preferredCurrency').value,
        notification_email: document.getElementById('notificationEmail').checked,
        notification_sms: document.getElementById('notificationSMS').checked,
        notification_push: document.getElementById('notificationPush').checked
    };

    try {
        const response = await fetch('/api/method/flyout.api.client_portal.update_profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (data.message && data.message.success) {
            showSuccess('Profile updated successfully!');
        } else {
            showError(data.message?.error || 'Failed to update profile');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showError('Failed to update profile. Please try again.');
    }
}

/**
 * Utility functions
 */
function showSuccess(message) {
    // Create and show success notification
    const alert = document.createElement('div');
    alert.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3';
    alert.style.zIndex = '9999';
    alert.innerHTML = `
        <i class="fas fa-check-circle me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alert);
    
    setTimeout(() => alert.remove(), 5000);
}

function showError(message) {
    // Create and show error notification
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 end-0 m-3';
    alert.style.zIndex = '9999';
    alert.innerHTML = `
        <i class="fas fa-exclamation-circle me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alert);
    
    setTimeout(() => alert.remove(), 5000);
}

function showLoginForm() {
    // Redirect to login page or show login modal
    window.location.href = '/login';
}

function logout() {
    // Implement logout functionality
    window.location.href = '/logout';
}

// Placeholder functions for additional features
function showNotifications() {
    showInfo('Notifications feature coming soon!');
}

function showApplicationMessages(applicationId) {
    showInfo('Application messages feature coming soon!');
}

function sendMessage(applicationId) {
    showInfo('Send message feature coming soon!');
}

function uploadDocument(applicationId) {
    showInfo('Document upload feature coming soon!');
}

function makePayment(applicationId) {
    showInfo('Payment feature coming soon!');
}

function uploadNewDocument() {
    showInfo('New document upload feature coming soon!');
}

function downloadDocument(documentId) {
    showInfo('Document download feature coming soon!');
}

function deleteDocument(documentId) {
    showInfo('Document deletion feature coming soon!');
}

function composeNewMessage() {
    showInfo('Compose message feature coming soon!');
}

function viewMessage(messageId) {
    showInfo('View message feature coming soon!');
}

function changePassword() {
    showInfo('Change password feature coming soon!');
}

function manageTwoFactor() {
    showInfo('Two-factor authentication feature coming soon!');
}

function deleteAccount() {
    showInfo('Account deletion feature coming soon!');
}

function showInfo(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-info alert-dismissible fade show position-fixed top-0 end-0 m-3';
    alert.style.zIndex = '9999';
    alert.innerHTML = `
        <i class="fas fa-info-circle me-2"></i>${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alert);
    
    setTimeout(() => alert.remove(), 5000);
}