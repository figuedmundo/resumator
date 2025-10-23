# `create_user.py`

This script allows you to create a new user in the Resumator application's database directly from the command line. It's useful for administrative tasks, testing, or initial setup.

## Prerequisites

Before running this script, ensure you have:

*   Python installed.
*   Access to the Resumator backend's database. The script uses the database configuration defined in the backend application.
*   The necessary Python dependencies installed (e.g., `SQLAlchemy`, `passlib`). These are typically installed with `pip install -r requirements.txt` in the `backend` directory.

## Usage

To create a new user, navigate to the `backend` directory and run the script with the following arguments:

```bash
python create_user.py --username <username> --email <email> --password <password>
```

### Arguments:

*   `--username`: The desired username for the new user. (Required)
*   `--email`: The email address for the new user. This must be unique. (Required)
*   `--password`: The password for the new user. (Required)

## Example

To create a user with username `testuser`, email `test@example.com`, and password `securepassword123`:

```bash
python create_user.py --username testuser --email test@example.com --password securepassword123
```

If the user is created successfully, you will see a confirmation message. If a user with the provided email already exists, an error message will be displayed.
