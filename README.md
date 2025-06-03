# YVIX Assignment Submission Portal

A web application for students to submit assignments and for HR staff to review them. Built with Flask and Supabase.

## Features

- **Student Assignment Submission:**
  - Simple form to enter personal information
  - Support for multiple submission types (file upload or text)
  - File uploads support PDF, DOC, DOCX, JPG, and PNG formats

- **HR Admin Portal:**
  - Secure login with hardcoded credentials (email: yvixownerzlogin@yvix.com, password: 1plus1isequaltofive)
  - View all submitted assignments
  - Filter and search assignments by topic, type, student name, or college
  - View detailed assignment information including file previews

## Project Structure

```
yvix-portal/
├── app.py                  # Main Flask application
├── static/                 # Static assets
│   ├── css/
│   │   └── styles.css      # Main stylesheet
│   ├── js/
│   │   ├── main.js         # JavaScript for student submission page
│   │   └── admin.js        # JavaScript for admin dashboard
│   └── images/
│       └── logo.jpg        # YVIX logo
├── templates/              # HTML templates
│   ├── index.html          # Student submission page
│   ├── admin_login.html    # HR login page
│   └── admin_dashboard.html # HR dashboard
└── database/               # Database scripts
    └── schema.sql          # Database schema
```

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- Supabase account and project

### Installation

1. Clone this repository:
   ```
   git clone <repository-url>
   cd yvix-portal
   ```

2. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Create a `.env` file with the following content:
   ```
   SECRET_KEY=your_secret_key_here
   SUPABASE_URL=https://cijnocuczxxuuffuhgkh.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpam5vY3Vjenh4dXVmZnVoZ2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4OTE2NDcsImV4cCI6MjA2NDQ2NzY0N30.wyNah3PCmrn7-cY8qAFiBph-pXDuwrmfdtXALUimD5Q
   ```

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL script in `database/schema.sql` to create the required tables and policies

3. Create a storage bucket named `student-documents` for file uploads:
   - Go to Storage in the Supabase dashboard
   - Create a new bucket named `student-documents`
   - Set the bucket's privacy to public

### Running the Application

1. Start the Flask server:
   ```
   python app.py
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

## HR Portal Access

Use the following credentials to access the HR portal:

- **Email:** yvixownerzlogin@yvix.com
- **Password:** 1plus1isequaltofive

## License

This project is licensed under the MIT License. 