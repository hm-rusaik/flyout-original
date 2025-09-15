# Flyout Client Portal - Complete Setup Guide

## Overview

The Flyout Client Portal is a comprehensive web-based interface that allows clients to:
- Submit new service inquiries
- Track application progress
- Manage documents
- Communicate with providers
- View dashboard analytics
- Update profile settings

## Architecture

### Frontend Components
- **HTML Templates**: Responsive web pages with Bootstrap 5
- **JavaScript**: Dynamic functionality and API integration
- **CSS**: Custom styling with modern design principles

### Backend Components
- **Python API**: Frappe whitelisted methods for data operations
- **Database Integration**: Direct integration with existing doctypes
- **Authentication**: Integrated with Frappe's authentication system

### Key Doctypes Integrated
- **Client**: Main client authentication and profile data
- **Client Profile**: Extended profile with dashboard metrics
- **Inquiry**: Service inquiries with detailed requirements
- **Application**: Converted inquiries with workflow tracking

## File Structure

```
flyout/
├── www/
│   ├── client_portal.html          # Main portal interface
│   ├── client_portal.py            # Portal page configuration
│   └── client_login.html           # Client login page
├── public/
│   └── js/
│       └── client_portal.js        # Frontend functionality
├── api/
│   └── client_portal.py            # Backend API methods
└── setup_client_portal.py          # Setup and configuration script
```

## Installation & Setup

### Prerequisites
- Frappe/ERPNext instance running
- Flyout app installed
- Existing Client, Client Profile, Inquiry, and Application doctypes

### Step 1: Copy Files
Copy all the created files to their respective locations in your Frappe app:

```bash
# Copy web pages
cp client_portal.html /path/to/frappe-bench/apps/flyout/flyout/www/
cp client_login.html /path/to/frappe-bench/apps/flyout/flyout/www/
cp client_portal.py /path/to/frappe-bench/apps/flyout/flyout/www/

# Copy JavaScript
cp client_portal.js /path/to/frappe-bench/apps/flyout/flyout/public/js/

# Copy API
cp client_portal.py /path/to/frappe-bench/apps/flyout/flyout/api/

# Copy setup script
cp setup_client_portal.py /path/to/frappe-bench/apps/flyout/
```

### Step 2: Run Setup Script
Execute the setup script to configure the portal:

```bash
cd /path/to/frappe-bench/apps/flyout
python setup_client_portal.py
```

### Step 3: Restart Frappe
Restart your Frappe bench to apply changes:

```bash
cd /path/to/frappe-bench
bench restart
```

### Step 4: Verify Installation
Access the client portal at: `http://your-site/client-portal`

## Usage Instructions

### For Clients

#### 1. Access the Portal
- Navigate to `/client-portal`
- If not logged in, you'll be redirected to the login page
- Use your existing Frappe user credentials

#### 2. Dashboard Overview
- View key metrics (total inquiries, active applications, etc.)
- See recent activity timeline
- Check quick statistics and progress indicators

#### 3. Submit New Inquiry
- Click "New Inquiry" in the navigation
- Fill out the comprehensive inquiry form:
  - Service type and priority
  - Detailed description and requirements
  - Budget information
  - Location preferences
  - Timeline expectations
- Submit the form to create a new inquiry

#### 4. Manage Inquiries
- View all your inquiries in a table format
- Check status, priority, and creation date
- Click on any inquiry to view detailed information
- Track matched providers and conversion status

#### 5. Track Applications
- View applications converted from inquiries
- Monitor progress percentages and current stages
- See provider assignments and completion dates
- Access detailed application information

#### 6. Profile Management
- Update personal information
- Configure notification preferences
- View account statistics
- Manage security settings

### For Administrators

#### Managing Client Access
1. Create new clients through the ERPNext desk
2. Assign the "Client" role to users
3. Configure portal permissions as needed

#### Monitoring Portal Usage
- Check client activity logs
- Monitor inquiry submission rates
- Track application conversions
- Review client engagement metrics

#### Customizing the Portal
- Modify HTML templates for branding
- Update JavaScript for additional features
- Extend API methods for new functionality
- Configure email templates for notifications

## API Endpoints

### Authentication
- `GET /api/method/flyout.api.client_portal.get_session` - Check client session

### Dashboard
- `GET /api/method/flyout.api.client_portal.get_dashboard_data` - Get dashboard metrics

### Inquiries
- `GET /api/method/flyout.api.client_portal.get_client_inquiries` - List client inquiries
- `GET /api/method/flyout.api.client_portal.get_inquiry_details` - Get inquiry details
- `POST /api/method/flyout.api.client_portal.create_inquiry` - Create new inquiry

### Applications
- `GET /api/method/flyout.api.client_portal.get_client_applications` - List applications
- `GET /api/method/flyout.api.client_portal.get_application_details` - Get application details

### Profile
- `GET /api/method/flyout.api.client_portal.get_client_profile` - Get profile data
- `POST /api/method/flyout.api.client_portal.update_profile` - Update profile

### Utilities
- `GET /api/method/flyout.api.client_portal.get_client_documents` - Get documents
- `GET /api/method/flyout.api.client_portal.get_client_messages` - Get messages
- `GET /api/method/flyout.api.client_portal.get_notifications` - Get notifications

## Customization Guide

### Modifying the Interface
1. Edit `client_portal.html` for layout changes
2. Update `client_portal.js` for functionality
3. Modify CSS styles in the HTML files

### Adding New Features
1. Create new API endpoints in `client_portal.py`
2. Add corresponding JavaScript functions
3. Update the HTML interface as needed

### Changing Permissions
1. Modify the permission setup in `setup_client_portal.py`
2. Run the setup script again
3. Restart Frappe bench

## Troubleshooting

### Common Issues

#### 1. Portal Not Loading
- Check Frappe logs: `tail -f logs/frappe.log`
- Verify file permissions
- Ensure all files are in correct locations

#### 2. Authentication Issues
- Verify client role assignments
- Check user permissions
- Ensure session management is working

#### 3. API Errors
- Check API method permissions
- Verify doctype access rights
- Review error logs for specific issues

#### 4. JavaScript Errors
- Check browser console for errors
- Verify asset compilation
- Ensure proper file loading

### Debug Mode
Enable debug mode for detailed error messages:
```bash
bench set-config developer_mode 1
bench restart
```

## Security Considerations

### Authentication
- All API methods require authentication
- Session validation on each request
- CSRF token validation for forms

### Data Access
- Clients can only access their own data
- Proper permission checks on all operations
- Input validation and sanitization

### Privacy
- Personal information is protected
- Secure file upload handling
- Encrypted data transmission

## Performance Optimization

### Caching
- Implement browser caching for static assets
- Use Frappe's caching mechanisms for API responses
- Consider Redis for session management

### Database Optimization
- Add appropriate indexes on frequently queried fields
- Optimize query performance
- Implement pagination for large datasets

### Frontend Optimization
- Minimize JavaScript file sizes
- Implement lazy loading for large components
- Use efficient DOM manipulation techniques

## Future Enhancements

### Planned Features
1. **Real-time Notifications**: WebSocket integration for live updates
2. **Mobile App**: Native mobile application
3. **Advanced Analytics**: Detailed reporting and insights
4. **Multi-language Support**: Internationalization
5. **Document Management**: Advanced file handling and versioning
6. **Payment Integration**: Online payment processing
7. **Chat Support**: Real-time customer support chat

### API Extensions
- Webhook support for external integrations
- REST API for mobile applications
- GraphQL endpoint for flexible queries
- Bulk operations for efficiency

## Support

For technical support or questions:
1. Check the troubleshooting section
2. Review Frappe documentation
3. Contact your system administrator
4. Submit issues through appropriate channels

## License

This client portal is part of the Flyout application and follows the same licensing terms.

---

**Last Updated**: September 2025
**Version**: 1.0.0
**Compatibility**: Frappe v14+, ERPNext v14+