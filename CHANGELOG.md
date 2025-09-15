# Changelog

All notable changes to the Flyout app will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.4] - 2025-09-10

### Fixed
- **Doctype Permissions**: Fixed read-only issue by adding proper permissions to all 31 main doctypes
  - Added System Manager, Administrator, and Client role permissions
  - Client-related doctypes now have specific Client role permissions
  - Standard doctypes have appropriate role-based access control
- **User Access**: Doctypes are no longer read-only and can be properly accessed and modified
- **Role-Based Security**: Implemented proper permission structure for different user roles

### Technical
- Automated permission fixing script processed all 61 doctypes
- Child tables (30) correctly maintained empty permissions
- Main doctypes (31) now have comprehensive role-based permissions
- Client portal functionality now fully accessible to appropriate roles

## [0.0.3] - 2025-09-10

### Added
- **Missing Client Portal Doctypes**: Added 5 critical doctypes for client portal functionality
  - `Client Profile` - Enhanced client profile management with dashboard integration
  - `Client Application Summary` - Application tracking and progress monitoring
  - `Client Communication Summary` - Communication history and messaging
  - `Client Document Summary` - Document management and organization
  - `Client Provider Summary` - Provider relationship and service tracking

### Fixed
- Complete doctype coverage for client portal system
- All 61 doctypes now included in repository (was missing 5)
- Enhanced data model for comprehensive client management

## [0.0.2] - 2025-09-10

### Added
- **Client Portal System**: Complete web-based client interface
- **API Layer**: Comprehensive backend API for client portal operations
  - `flyout/api/client_portal.py` - Server-side API methods for client operations
- **Frontend Components**: Modern web interface with responsive design
  - `flyout/public/js/client_portal.js` - Client-side JavaScript functionality
  - `flyout/www/client_portal.html` - Main portal interface
  - `flyout/www/client_login.html` - Client authentication page
  - `flyout/www/client_portal.py` - Web page configuration
- **Setup & Configuration**: Automated portal setup system
  - `setup_client_portal.py` - Complete portal configuration script
  - `CLIENT_PORTAL_README.md` - Comprehensive documentation
- **Enhanced MANIFEST.in**: Improved file inclusion for APIs and web components

### Features
- **Client Dashboard**: Real-time metrics and activity overview
- **Inquiry Management**: Submit and track service inquiries
- **Application Tracking**: Monitor application progress and status
- **Profile Management**: Client profile updates and settings
- **Document Management**: Upload and organize required documents
- **Messaging System**: Communication with service providers
- **Authentication**: Secure client login and session management
- **Responsive Design**: Mobile-friendly interface
- **API Endpoints**: RESTful API for all client operations

### Technical Improvements
- Updated MANIFEST.in to include API, JavaScript, and web files
- Enhanced packaging for complete app distribution
- Added comprehensive setup scripts for easy deployment

## [0.0.1] - 2025-01-01

### Added
- Initial release of Flyout app
- Client management system with profiles and applications
- Service provider management
- Agreement management with templates and statuses
- Application tracking with stages and status updates
- Inquiry management and matching system
- Document management for required paperwork
- Payment tracking and terms management
- System configuration and customization tools
- Comprehensive DocType structure for migration services
- Modern Python packaging with pyproject.toml
- Installation scripts and documentation
- Pre-commit hooks for code quality
- Comprehensive test structure

### Features
- **Client Management**: Handle client profiles, applications, and communications
- **Provider Services**: Manage service providers and their service offerings
- **Agreement System**: Create, track, and manage service agreements
- **Application Workflow**: Track application stages from inquiry to completion
- **Document Tracking**: Organize and monitor required documents
- **Payment Management**: Handle payment schedules and terms
- **System Customization**: Custom fields, forms, and property setters
- **Audit Logging**: Track changes and maintain audit trails

### Technical
- Built on Frappe Framework v14+
- Python 3.10+ compatibility
- Modern packaging with flit_core
- Comprehensive MANIFEST.in for proper file inclusion
- Pre-commit hooks for code quality
- ESLint and Prettier for JavaScript formatting
- Ruff for Python linting and formatting

### Documentation
- Comprehensive README with installation instructions
- Developer contributing guidelines
- Installation script for easy deployment
- Feature documentation and usage examples

