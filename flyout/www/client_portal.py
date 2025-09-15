"""
Web page configuration for Client Portal
"""

import frappe
from frappe import _

def get_context(context):
    """
    Get context data for the client portal page
    """
    try:
        # Check if user is logged in
        if frappe.session.user == "Guest":
            frappe.local.flags.redirect_location = "/login"
            raise frappe.Redirect
        
        # Get client data
        client = frappe.get_all("Client", 
            filters={"email": frappe.session.user}, 
            fields=["name", "full_name", "email", "phone", "company_name"],
            limit=1
        )
        
        if not client:
            frappe.throw(_("Client not found"))
        
        # Set context data
        context.client = client[0]
        context.title = "Client Portal - Flyout"
        context.no_cache = 1
        
        return context
        
    except frappe.Redirect:
        raise
    except Exception as e:
        frappe.log_error(f"Error in client portal context: {str(e)}")
        frappe.throw(_("Failed to load client portal"))

# Page configuration
no_cache = 1
no_sitemap = 1