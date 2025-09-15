# Flyout

Sri Lanka's Migration Hub - A comprehensive Frappe application for managing migration services, client applications, agreements, and service providers.

## Features

- **Client Management**: Handle client profiles and applications
- **Service Provider Management**: Manage service providers and their offerings  
- **Agreement Management**: Create and track service agreements
- **Application Tracking**: Monitor application stages and status
- **Inquiry Management**: Handle client inquiries and matching services
- **Document Management**: Organize and track required documents
- **Payment Tracking**: Monitor payment schedules and terms

## Installation

### Prerequisites

- Frappe Framework v14 or higher
- Python 3.10 or higher

### Install from GitHub

You can install this app using the [bench](https://github.com/frappe/bench) CLI:

```bash
# Get the app from repository
bench get-app https://github.com/ravanaindustries/flyout.git

# Install the app on your site
bench --site [your-site-name] install-app flyout

# Restart your bench
bench restart
```

### Install from local directory

If you have the source code locally:

```bash
# Get the app from local path
bench get-app /path/to/flyout

# Install the app on your site  
bench --site [your-site-name] install-app flyout

# Restart your bench
bench restart
```

### Quick Install Script

For convenience, you can use the included installation script:

```bash
# Make the script executable (if not already)
chmod +x install.sh

# Run the installation script
./install.sh [your-site-name]
```

## Configuration

After installation, you can access the Flyout app through your Frappe site. The app will add new modules and doctypes to your system:

- **Flyout Module**: Main module containing all migration-related doctypes
- **Client Management**: Client, Client Profile, Application doctypes
- **Service Management**: Service Master, Service Types, Provider doctypes  
- **Agreement Management**: Agreement Enhanced, Agreement Template, Agreement Status
- **System Configuration**: System Config, Custom Field, Property Setter

## Usage

1. **Setup Service Types**: Define the types of migration services offered
2. **Register Service Providers**: Add providers who offer migration services
3. **Configure System Settings**: Set up system-wide configurations
4. **Manage Client Applications**: Process client applications and inquiries
5. **Create Agreements**: Generate and manage service agreements
6. **Track Progress**: Monitor application stages and payment schedules

## Development

### Contributing

This app uses `pre-commit` for code formatting and linting. Please [install pre-commit](https://pre-commit.com/#installation) and enable it for this repository:

```bash
cd apps/flyout
pre-commit install
```

Pre-commit is configured to use the following tools for checking and formatting your code:

- ruff
- eslint
- prettier
- pyupgrade
### CI

This app can use GitHub Actions for CI. The following workflows are configured:

- CI: Installs this app and runs unit tests on every push to `develop` branch.
- Linters: Runs [Frappe Semgrep Rules](https://github.com/frappe/semgrep-rules) and [pip-audit](https://pypi.org/project/pip-audit/) on every pull request.


### License

agpl-3.0
