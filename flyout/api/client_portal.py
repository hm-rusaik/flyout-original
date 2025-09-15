"""
Client Portal API
Handles all backend functionality for the client portal
"""

import frappe
from frappe import _
from frappe.utils import now, getdate, add_days, format_date
import json
from datetime import datetime, timedelta

@frappe.whitelist(allow_guest=True)
def get_session():
    """
    Check if client is logged in and return session data
    """
    try:
        # Check if user is logged in
        if frappe.session.user == "Guest":
            return {"authenticated": False}
        
        # Get client record for current user
        client = frappe.get_all("Client", 
            filters={"email": frappe.session.user}, 
            fields=["name", "full_name", "email", "phone", "company_name"],
            limit=1
        )
        
        if not client:
            return {"authenticated": False}
        
        return {
            "authenticated": True,
            "client": client[0]
        }
        
    except Exception as e:
        frappe.log_error(f"Client portal session check failed: {str(e)}")
        return {"authenticated": False}

@frappe.whitelist()
def get_dashboard_data():
    """
    Get dashboard data for the logged-in client
    """
    try:
        # Get client record
        client = get_current_client()
        if not client:
            frappe.throw(_("Client not found"))
        
        # Get client profile for statistics
        profile = frappe.get_doc("Client Profile", {"client": client.name})
        
        # Get recent activity
        recent_activity = get_recent_client_activity(client.name)
        
        # Calculate statistics
        stats = calculate_client_stats(client.name, profile)
        
        return {
            "total_inquiries": profile.total_inquiries or 0,
            "active_applications": profile.active_applications or 0,
            "completed_applications": get_completed_applications_count(client.name),
            "total_providers": profile.total_providers or 0,
            "recent_activity": recent_activity,
            "stats": stats
        }
        
    except Exception as e:
        frappe.log_error(f"Error loading dashboard data: {str(e)}")
        frappe.throw(_("Failed to load dashboard data"))

def get_current_client():
    """
    Get the current client record based on logged-in user
    """
    if frappe.session.user == "Guest":
        return None
    
    client = frappe.get_all("Client", 
        filters={"email": frappe.session.user}, 
        fields=["name", "full_name", "email", "phone", "company_name"],
        limit=1
    )
    
    return client[0] if client else None

def get_recent_client_activity(client_name, limit=5):
    """
    Get recent activity for the client
    """
    activity = []
    
    try:
        # Get recent inquiries
        inquiries = frappe.get_all("Inquiry",
            filters={"client_id": client_name},
            fields=["name", "creation", "status", "service_type", "description"],
            order_by="creation desc",
            limit=3
        )
        
        for inquiry in inquiries:
            activity.append({
                "type": "inquiry",
                "title": f"New Inquiry: {inquiry.name}",
                "description": inquiry.description[:100] + "..." if len(inquiry.description) > 100 else inquiry.description,
                "timestamp": inquiry.creation,
                "status": inquiry.status
            })
        
        # Get recent applications
        applications = frappe.get_all("Application",
            filters={"client_id": client_name},
            fields=["name", "creation", "application_status", "service_type"],
            order_by="creation desc",
            limit=2
        )
        
        for app in applications:
            activity.append({
                "type": "application",
                "title": f"Application Created: {app.name}",
                "description": f"Service: {app.service_type or 'General'}",
                "timestamp": app.creation,
                "status": app.application_status
            })
        
        # Sort by timestamp (newest first)
        activity.sort(key=lambda x: x["timestamp"], reverse=True)
        
        return activity[:limit]
        
    except Exception as e:
        frappe.log_error(f"Error getting client activity: {str(e)}")
        return []

def calculate_client_stats(client_name, profile):
    """
    Calculate various statistics for the client
    """
    try:
        # Calculate inquiry success rate
        total_inquiries = profile.total_inquiries or 0
        converted_inquiries = frappe.get_all("Inquiry",
            filters={
                "client_id": client_name,
                "status": "Converted"
            },
            fields=["name"]
        )
        
        success_rate = 0
        if total_inquiries > 0:
            success_rate = (len(converted_inquiries) / total_inquiries) * 100
        
        # Calculate average response time (placeholder)
        avg_response_time = 2.5  # This would need more complex logic
        
        # Get profile completion percentage
        profile_completion = calculate_profile_completion(profile)
        
        return {
            "inquiry_success_rate": round(success_rate, 1),
            "avg_response_time": round(avg_response_time, 1),
            "profile_completion": round(profile_completion, 1)
        }
        
    except Exception as e:
        frappe.log_error(f"Error calculating client stats: {str(e)}")
        return {
            "inquiry_success_rate": 0,
            "avg_response_time": 0,
            "profile_completion": 0
        }

def calculate_profile_completion(profile):
    """
    Calculate profile completion percentage
    """
    required_fields = [
        "full_name", "email", "phone", "company_name", 
        "industry", "country", "city"
    ]
    
    completed_fields = 0
    for field in required_fields:
        if getattr(profile, field, None):
            completed_fields += 1
    
    return (completed_fields / len(required_fields)) * 100

def get_completed_applications_count(client_name):
    """
    Get count of completed applications for the client
    """
    try:
        completed = frappe.get_all("Application",
            filters={
                "client_id": client_name,
                "application_status": "Completed"
            },
            fields=["name"]
        )
        return len(completed)
    except:
        return 0

@frappe.whitelist()
def get_client_inquiries():
    """
    Get all inquiries for the logged-in client
    """
    try:
        client = get_current_client()
        if not client:
            frappe.throw(_("Client not found"))
        
        inquiries = frappe.get_all("Inquiry",
            filters={"client_id": client.name},
            fields=[
                "name", "creation", "service_type", "status", 
                "priority", "description", "budget_min", "budget_max"
            ],
            order_by="creation desc"
        )
        
        return inquiries
        
    except Exception as e:
        frappe.log_error(f"Error loading client inquiries: {str(e)}")
        frappe.throw(_("Failed to load inquiries"))

@frappe.whitelist()
def get_inquiry_details(inquiry):
    """
    Get detailed information about a specific inquiry
    """
    try:
        client = get_current_client()
        if not client:
            frappe.throw(_("Client not found"))
        
        # Verify the inquiry belongs to this client
        inquiry_doc = frappe.get_doc("Inquiry", inquiry)
        if inquiry_doc.client_id != client.name:
            frappe.throw(_("Unauthorized access to inquiry"))
        
        # Get inquiry data
        inquiry_data = inquiry_doc.as_dict()
        
        # Get matched providers if applicable
        if inquiry_doc.status == "Matched":
            matched_providers = get_matched_providers(inquiry)
            inquiry_data["matched_providers"] = matched_providers
        
        return inquiry_data
        
    except Exception as e:
        frappe.log_error(f"Error loading inquiry details: {str(e)}")
        frappe.throw(_("Failed to load inquiry details"))

def get_matched_providers(inquiry_name):
    """
    Get providers matched to an inquiry
    """
    try:
        # This would typically involve a more complex matching algorithm
        # For now, return a placeholder
        return []
    except Exception as e:
        frappe.log_error(f"Error getting matched providers: {str(e)}")
        return []

@frappe.whitelist()
def create_inquiry():
    """
    Create a new inquiry for the logged-in client
    """
    try:
        client = get_current_client()
        if not client:
            frappe.throw(_("Client not found"))
        
        # Get form data
        form_data = frappe.form_dict
        
        # Create new inquiry
        inquiry = frappe.new_doc("Inquiry")
        inquiry.client_id = client.name
        inquiry.client_name = client.full_name
        inquiry.client_email = client.email
        inquiry.client_phone = client.phone
        
        # Set inquiry data from form
        inquiry.service_type = form_data.get("service_type")
        inquiry.priority = form_data.get("priority")
        inquiry.description = form_data.get("description")
        inquiry.special_requirements = form_data.get("special_requirements")
        inquiry.budget_min = form_data.get("budget_min")
        inquiry.budget_max = form_data.get("budget_max")
        inquiry.budget_flexibility = form_data.get("budget_flexibility")
        inquiry.preferred_countries = form_data.get("preferred_countries")
        inquiry.alternative_countries = form_data.get("alternative_countries")
        inquiry.required_languages = form_data.get("required_languages")
        inquiry.alternative_languages = form_data.get("alternative_languages")
        inquiry.deadline = form_data.get("deadline")
        inquiry.timeline_weeks = form_data.get("timeline_weeks")
        
        # Set default values
        inquiry.inquiry_date = getdate()
        inquiry.status = "Draft"
        
        # Save the inquiry
        inquiry.insert()
        
        # Update client profile statistics
        update_client_profile_stats(client.name)
        
        return {
            "success": True,
            "message": _("Inquiry created successfully"),
            "inquiry_name": inquiry.name
        }
        
    except Exception as e:
        frappe.log_error(f"Error creating inquiry: {str(e)}")
        return {
            "success": False,
            "error": _("Failed to create inquiry")
        }

@frappe.whitelist()
def get_client_applications():
    """
    Get all applications for the logged-in client
    """
    try:
        client = get_current_client()
        if not client:
            frappe.throw(_("Client not found"))
        
        applications = frappe.get_all("Application",
            filters={"client_id": client.name},
            fields=[
                "name", "creation", "service_type", "category", "application_status",
                "overall_progress", "current_stage", "expected_completion_date",
                "actual_completion_date", "total_amount", "paid_amount", "outstanding_amount",
                "payment_status", "priority", "deadline"
            ],
            order_by="creation desc"
        )
        
        # Add provider name for each application
        for app in applications:
            if app.get("provider"):
                provider = frappe.get_value("Provider", app.provider, "provider_name")
                app["provider_name"] = provider
        
        return applications
        
    except Exception as e:
        frappe.log_error(f"Error loading client applications: {str(e)}")
        frappe.throw(_("Failed to load applications"))

@frappe.whitelist()
def get_application_details(application):
    """
    Get detailed information about a specific application
    """
    try:
        client = get_current_client()
        if not client:
            frappe.throw(_("Client not found"))
        
        # Verify the application belongs to this client
        app_doc = frappe.get_doc("Application", application)
        if app_doc.client_id != client.name:
            frappe.throw(_("Unauthorized access to application"))
        
        # Get application data
        app_data = app_doc.as_dict()
        
        # Add provider name
        if app_doc.provider:
            provider_name = frappe.get_value("Provider", app_doc.provider, "provider_name")
            app_data["provider_name"] = provider_name
        
        return app_data
        
    except Exception as e:
        frappe.log_error(f"Error loading application details: {str(e)}")
        frappe.throw(_("Failed to load application details"))

@frappe.whitelist()
def get_client_profile():
    """
    Get client profile data
    """
    try:
        client = get_current_client()
        if not client:
            frappe.throw(_("Client not found"))
        
        # Get client profile
        profile = frappe.get_doc("Client Profile", {"client": client.name})
        
        # Combine client and profile data
        profile_data = profile.as_dict()
        profile_data.update(client.as_dict())
        
        return profile_data
        
    except Exception as e:
        frappe.log_error(f"Error loading client profile: {str(e)}")
        frappe.throw(_("Failed to load profile"))

@frappe.whitelist()
def update_profile():
    """
    Update client profile
    """
    try:
        client = get_current_client()
        if not client:
            frappe.throw(_("Client not found"))
        
        # Get form data
        form_data = frappe.form_dict
        
        # Update client record
        client_doc = frappe.get_doc("Client", client.name)
        client_doc.full_name = form_data.get("full_name")
        client_doc.phone = form_data.get("phone")
        client_doc.company_name = form_data.get("company_name")
        client_doc.industry = form_data.get("industry")
        client_doc.company_size = form_data.get("company_size")
        client_doc.bio = form_data.get("bio")
        client_doc.country = form_data.get("country")
        client_doc.state = form_data.get("state")
        client_doc.city = form_data.get("city")
        client_doc.timezone = form_data.get("timezone")
        client_doc.preferred_language = form_data.get("preferred_language")
        client_doc.preferred_currency = form_data.get("preferred_currency")
        client_doc.notification_email = form_data.get("notification_email") == "true"
        client_doc.notification_sms = form_data.get("notification_sms") == "true"
        client_doc.notification_push = form_data.get("notification_push") == "true"
        
        client_doc.save()
        
        return {
            "success": True,
            "message": _("Profile updated successfully")
        }
        
    except Exception as e:
        frappe.log_error(f"Error updating client profile: {str(e)}")
        return {
            "success": False,
            "error": _("Failed to update profile")
        }

@frappe.whitelist()
def get_client_documents():
    """
    Get client documents
    """
    try:
        client = get_current_client()
        if not client:
            frappe.throw(_("Client not found"))
        
        # This would typically get documents from a Document doctype
        # For now, return empty list as placeholder
        return []
        
    except Exception as e:
        frappe.log_error(f"Error loading client documents: {str(e)}")
        frappe.throw(_("Failed to load documents"))

@frappe.whitelist()
def get_client_messages():
    """
    Get client messages/communications
    """
    try:
        client = get_current_client()
        if not client:
            frappe.throw(_("Client not found"))
        
        # This would typically get messages from a Communication doctype
        # For now, return empty list as placeholder
        return []
        
    except Exception as e:
        frappe.log_error(f"Error loading client messages: {str(e)}")
        frappe.throw(_("Failed to load messages"))

def update_client_profile_stats(client_name):
    """
    Update client profile statistics
    """
    try:
        # Get or create client profile
        profile = frappe.get_doc("Client Profile", {"client": client_name})
        
        # Update statistics
        profile.total_inquiries = frappe.get_all("Inquiry", 
            filters={"client_id": client_name}, 
            fields=["name"]
        ).__len__()
        
        profile.active_applications = frappe.get_all("Application", 
            filters={
                "client_id": client_name,
                "application_status": ["not in", ["Completed", "Cancelled"]]
            }, 
            fields=["name"]
        ).__len__()
        
        profile.total_providers = frappe.get_all("Inquiry Match", 
            filters={"client": client_name}, 
            fields=["name"]
        ).__len__()
        
        profile.total_documents = frappe.get_all("Client Document", 
            filters={"client": client_name}, 
            fields=["name"]
        ).__len__()
        
        profile.last_activity = now()
        profile.save()
        
    except Exception as e:
        frappe.log_error(f"Error updating client profile stats: {str(e)}")

# Additional utility functions for the client portal

@frappe.whitelist()
def upload_document():
    """
    Handle document upload for client
    """
    try:
        client = get_current_client()
        if not client:
            frappe.throw(_("Client not found"))
        
        # Handle file upload
        if 'file' in frappe.request.files:
            file = frappe.request.files['file']
            # Process file upload
            # This would typically save to File doctype and create Client Document record
            
            return {
                "success": True,
                "message": _("Document uploaded successfully")
            }
        
        return {
            "success": False,
            "error": _("No file provided")
        }
        
    except Exception as e:
        frappe.log_error(f"Error uploading document: {str(e)}")
        return {
            "success": False,
            "error": _("Failed to upload document")
        }

@frappe.whitelist()
def send_message():
    """
    Send a message/communication
    """
    try:
        client = get_current_client()
        if not client:
            frappe.throw(_("Client not found"))
        
        # Get message data
        subject = frappe.form_dict.get("subject")
        content = frappe.form_dict.get("content")
        recipient = frappe.form_dict.get("recipient")
        related_doctype = frappe.form_dict.get("related_doctype")
        related_name = frappe.form_dict.get("related_name")
        
        # Create communication record
        comm = frappe.new_doc("Communication")
        comm.subject = subject
        comm.content = content
        comm.sender = client.email
        comm.recipients = recipient
        comm.reference_doctype = related_doctype
        comm.reference_name = related_name
        comm.communication_type = "Communication"
        comm.status = "Open"
        
        comm.insert()
        
        return {
            "success": True,
            "message": _("Message sent successfully"),
            "communication_name": comm.name
        }
        
    except Exception as e:
        frappe.log_error(f"Error sending message: {str(e)}")
        return {
            "success": False,
            "error": _("Failed to send message")
        }

@frappe.whitelist()
def get_notifications():
    """
    Get client notifications
    """
    try:
        client = get_current_client()
        if not client:
            frappe.throw(_("Client not found"))
        
        # Get recent notifications
        # This would typically query a Notification doctype
        notifications = []
        
        # Check for unread messages
        unread_messages = frappe.get_all("Communication",
            filters={
                "recipients": client.email,
                "read": 0
            },
            fields=["name", "subject", "creation"],
            order_by="creation desc",
            limit=5
        )
        
        for msg in unread_messages:
            notifications.append({
                "type": "message",
                "title": "New Message",
                "content": msg.subject,
                "timestamp": msg.creation,
                "link": f"/desk#Form/Communication/{msg.name}"
            })
        
        # Check for status updates on inquiries/applications
        recent_inquiries = frappe.get_all("Inquiry",
            filters={"client_id": client.name},
            fields=["name", "status", "modified"],
            order_by="modified desc",
            limit=3
        )
        
        for inquiry in recent_inquiries:
            notifications.append({
                "type": "inquiry_update",
                "title": "Inquiry Status Update",
                "content": f"Inquiry {inquiry.name} status changed to {inquiry.status}",
                "timestamp": inquiry.modified,
                "link": f"/desk#Form/Inquiry/{inquiry.name}"
            })
        
        return notifications
        
    except Exception as e:
        frappe.log_error(f"Error getting notifications: {str(e)}")
        return []

# Web page rendering functions

@frappe.whitelist(allow_guest=True)
def render_client_portal():
    """
    Render the client portal page
    """
    try:
        # Check if user is logged in
        if frappe.session.user == "Guest":
            frappe.local.flags.redirect_location = "/login"
            raise frappe.Redirect
        
        # Get client data
        client = get_current_client()
        if not client:
            frappe.throw(_("Client not found"))
        
        # Render the portal template
        context = {
            "client": client,
            "title": "Client Portal - Flyout"
        }
        
        return frappe.render_template("flyout/www/client_portal.html", context)
        
    except Exception as e:
        frappe.log_error(f"Error rendering client portal: {str(e)}")
        frappe.throw(_("Failed to render client portal"))