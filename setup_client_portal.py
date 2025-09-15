#!/usr/bin/env python3
"""
Setup script for Client Portal
This script configures the client portal in Frappe
"""

import frappe
from frappe import _

def setup_client_portal():
    """
    Setup the client portal configuration
    """
    try:
        print("Setting up Client Portal...")
        
        # Create web page routes
        create_web_pages()
        
        # Configure permissions
        configure_permissions()
        
        # Create client portal settings
        create_portal_settings()
        
        print("✅ Client Portal setup completed successfully!")
        
    except Exception as e:
        print(f"❌ Error setting up client portal: {str(e)}")
        raise

def create_web_pages():
    """
    Create web page configurations for the client portal
    """
    print("Creating web page configurations...")
    
    # Client Portal main page
    if not frappe.db.exists("Web Page", "client-portal"):
        web_page = frappe.new_doc("Web Page")
        web_page.title = "Client Portal"
        web_page.route = "client-portal"
        web_page.published = 1
        web_page.template_path = "flyout/www/client_portal.html"
        web_page.insert()
        print("✅ Created client portal web page")
    
    # Client Login page
    if not frappe.db.exists("Web Page", "client-login"):
        web_page = frappe.new_doc("Web Page")
        web_page.title = "Client Login"
        web_page.route = "client-login"
        web_page.published = 1
        web_page.template_path = "flyout/www/client_login.html"
        web_page.insert()
        print("✅ Created client login web page")

def configure_permissions():
    """
    Configure permissions for client portal access
    """
    print("Configuring permissions...")
    
    # Get or create Client role
    if not frappe.db.exists("Role", "Client"):
        role = frappe.new_doc("Role")
        role.role_name = "Client"
        role.desk_access = 0  # No desk access for clients
        role.insert()
        print("✅ Created Client role")
    
    # Set permissions for Client doctype
    client_perms = [
        {
            "role": "Client",
            "read": 1,
            "write": 1,
            "create": 0,
            "delete": 0,
            "submit": 0,
            "cancel": 0,
            "amend": 0
        }
    ]
    
    # Update Client doctype permissions
    if frappe.db.exists("DocType", "Client"):
        client_doctype = frappe.get_doc("DocType", "Client")
        client_doctype.permissions = []
        
        for perm in client_perms:
            perm_doc = frappe.new_doc("DocPerm")
            perm_doc.update(perm)
            perm_doc.parent = "Client"
            perm_doc.parentfield = "permissions"
            perm_doc.parenttype = "DocType"
            client_doctype.permissions.append(perm_doc)
        
        client_doctype.save()
        print("✅ Updated Client doctype permissions")
    
    # Set permissions for Inquiry doctype
    inquiry_perms = [
        {
            "role": "Client",
            "read": 1,
            "write": 1,
            "create": 1,
            "delete": 0,
            "submit": 0,
            "cancel": 0,
            "amend": 0
        }
    ]
    
    if frappe.db.exists("DocType", "Inquiry"):
        inquiry_doctype = frappe.get_doc("DocType", "Inquiry")
        inquiry_doctype.permissions = []
        
        for perm in inquiry_perms:
            perm_doc = frappe.new_doc("DocPerm")
            perm_doc.update(perm)
            perm_doc.parent = "Inquiry"
            perm_doc.parentfield = "permissions"
            perm_doc.parenttype = "DocType"
            inquiry_doctype.permissions.append(perm_doc)
        
        inquiry_doctype.save()
        print("✅ Updated Inquiry doctype permissions")
    
    # Set permissions for Application doctype
    application_perms = [
        {
            "role": "Client",
            "read": 1,
            "write": 0,
            "create": 0,
            "delete": 0,
            "submit": 0,
            "cancel": 0,
            "amend": 0
        }
    ]
    
    if frappe.db.exists("DocType", "Application"):
        application_doctype = frappe.get_doc("DocType", "Application")
        application_doctype.permissions = []
        
        for perm in application_perms:
            perm_doc = frappe.new_doc("DocPerm")
            perm_doc.update(perm)
            perm_doc.parent = "Application"
            perm_doc.parentfield = "permissions"
            perm_doc.parenttype = "DocType"
            application_doctype.permissions.append(perm_doc)
        
        application_doctype.save()
        print("✅ Updated Application doctype permissions")

def create_portal_settings():
    """
    Create client portal settings
    """
    print("Creating portal settings...")
    
    # Create portal settings document if it doesn't exist
    if not frappe.db.exists("Client Portal Settings"):
        settings = frappe.new_doc("Client Portal Settings")
        settings.portal_name = "Flyout Client Portal"
        settings.enable_client_portal = 1
        settings.enable_new_registrations = 1
        settings.require_email_verification = 1
        settings.enable_social_login = 1
        settings.insert()
        print("✅ Created client portal settings")
    
    # Create default email templates
    create_email_templates()

def create_email_templates():
    """
    Create default email templates for client portal
    """
    print("Creating email templates...")
    
    templates = [
        {
            "name": "Client Portal Welcome",
            "subject": "Welcome to Flyout Client Portal",
            "content": """
                <h2>Welcome to Flyout Client Portal!</h2>
                <p>Dear {{ client_name }},</p>
                <p>Thank you for registering with Flyout. Your client portal account has been created successfully.</p>
                <p>You can now:</p>
                <ul>
                    <li>Submit new service inquiries</li>
                    <li>Track your application progress</li>
                    <li>Communicate with providers</li>
                    <li>Manage your documents</li>
                </ul>
                <p><a href="{{ portal_url }}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Access Your Portal</a></p>
                <p>If you have any questions, please don't hesitate to contact us.</p>
                <p>Best regards,<br>The Flyout Team</p>
            """
        },
        {
            "name": "Inquiry Confirmation",
            "subject": "Your Inquiry Has Been Received",
            "content": """
                <h2>Inquiry Confirmation</h2>
                <p>Dear {{ client_name }},</p>
                <p>We have received your inquiry ({{ inquiry_id }}) and our team is reviewing it.</p>
                <p><strong>Inquiry Details:</strong></p>
                <ul>
                    <li>Service Type: {{ service_type }}</li>
                    <li>Priority: {{ priority }}</li>
                    <li>Description: {{ description }}</li>
                </ul>
                <p>We will match you with suitable providers within 24 hours and notify you of the progress.</p>
                <p>You can track your inquiry status in your client portal.</p>
                <p>Best regards,<br>The Flyout Team</p>
            """
        },
        {
            "name": "Application Status Update",
            "subject": "Application Status Update",
            "content": """
                <h2>Application Status Update</h2>
                <p>Dear {{ client_name }},</p>
                <p>We wanted to inform you that the status of your application ({{ application_id }}) has been updated.</p>
                <p><strong>New Status:</strong> {{ new_status }}</p>
                <p><strong>Current Progress:</strong> {{ progress }}%</p>
                <p>You can view more details and track the progress in your client portal.</p>
                <p><a href="{{ portal_url }}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Application</a></p>
                <p>Best regards,<br>The Flyout Team</p>
            """
        }
    ]
    
    for template_data in templates:
        if not frappe.db.exists("Email Template", template_data["name"]):
            template = frappe.new_doc("Email Template")
            template.template_name = template_data["name"]
            template.subject = template_data["subject"]
            template.response = template_data["content"]
            template.insert()
            print(f"✅ Created email template: {template_data['name']}")

def create_client_portal_menu():
    """
    Create client portal navigation menu
    """
    print("Creating portal menu...")
    
    # Create portal menu items
    menu_items = [
        {"label": "Dashboard", "route": "/client-portal", "icon": "fa-tachometer-alt", "order": 1},
        {"label": "My Inquiries", "route": "/client-portal#inquiries", "icon": "fa-question-circle", "order": 2},
        {"label": "Applications", "route": "/client-portal#applications", "icon": "fa-file-alt", "order": 3},
        {"label": "New Inquiry", "route": "/client-portal#new-inquiry", "icon": "fa-plus-circle", "order": 4},
        {"label": "Documents", "route": "/client-portal#documents", "icon": "fa-folder", "order": 5},
        {"label": "Messages", "route": "/client-portal#messages", "icon": "fa-envelope", "order": 6},
        {"label": "Profile", "route": "/client-portal#profile", "icon": "fa-user", "order": 7},
    ]
    
    # Store menu configuration in site config
    portal_menu = {
        "client_portal_menu": menu_items
    }
    
    # Update site configuration
    site_config = frappe.get_site_config()
    site_config.update(portal_menu)
    
    print("✅ Created client portal menu")

def create_sample_client():
    """
    Create a sample client for testing
    """
    print("Creating sample client...")
    
    if not frappe.db.exists("Client", "sample@flyout.com"):
        client = frappe.new_doc("Client")
        client.full_name = "Sample Client"
        client.email = "sample@flyout.com"
        client.phone = "+1234567890"
        client.company_name = "Sample Company"
        client.industry = "Technology"
        client.company_size = "11-50"
        client.country = "United States"
        client.city = "New York"
        client.account_status = "active"
        client.verification_status = "fully_verified"
        client.insert()
        
        # Create client profile
        profile = frappe.new_doc("Client Profile")
        profile.client = client.name
        profile.client_name = client.full_name
        profile.email = client.email
        profile.phone = client.phone
        profile.status = "Active"
        profile.portal_enabled = 1
        profile.insert()
        
        print("✅ Created sample client for testing")

if __name__ == "__main__":
    # Run the setup
    setup_client_portal()
    print("\n🎉 Client Portal setup completed!")
    print("\nNext steps:")
    print("1. Restart your Frappe bench: bench restart")
    print("2. Access the client portal at: http://your-site/client-portal")
    print("3. Test with sample client: sample@flyout.com")
    print("4. Configure additional settings as needed")