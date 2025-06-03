from flask import Flask, render_template, request, jsonify, redirect, url_for, session, flash, send_file
import os
from supabase import create_client, Client, PostgrestAPIError
from dotenv import load_dotenv
import time
import uuid
from werkzeug.utils import secure_filename
import json
import zipfile
import io
import requests
from datetime import datetime
from flask_cors import CORS

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

# Configure Flask app
app.secret_key = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# Initialize Supabase client with proper URL format
supabase_url = 'https://cijnocuczxxuuffuhgkh.supabase.co'
supabase_key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpam5vY3Vjenh4dXVmZnVoZ2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4OTE2NDcsImV4cCI6MjA2NDQ2NzY0N30.wyNah3PCmrn7-cY8qAFiBph-pXDuwrmfdtXALUimD5Q'
supabase: Client = create_client(supabase_url, supabase_key)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'}

# Helper function to check allowed file extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Helper function to determine file type
def get_file_type(filename):
    ext = filename.rsplit('.', 1)[1].lower()
    if ext in ['jpg', 'jpeg', 'png']:
        return 'image'
    elif ext == 'pdf':
        return 'pdf'
    else:
        return 'doc'

# Create tables if they don't exist
def initialize_database():
    try:
        # Try to create topics table if it doesn't exist by querying it
        supabase.table('topics').select('count(*)').execute()
        
        # Check if there are any topics, if not, add default ones
        topics_result = supabase.table('topics').select('*').execute()
        if not topics_result.data:
            print("No topics found. Adding default topics...")
            # Add default topics
            default_topics = [
                {'name': 'Web Development', 'description': 'Topics related to web technologies, frameworks, and best practices for building web applications.'},
                {'name': 'Mobile App Development', 'description': 'Topics covering native and cross-platform mobile application development for iOS and Android.'},
                {'name': 'Machine Learning', 'description': 'Topics on algorithms, models, and applications of machine learning and artificial intelligence.'},
                {'name': 'Data Science', 'description': 'Topics related to data analysis, visualization, and extracting insights from large datasets.'},
                {'name': 'Cybersecurity', 'description': 'Topics covering network security, encryption, threat analysis, and security best practices.'},
                {'name': 'Cloud Computing', 'description': 'Topics on cloud platforms, services, architecture, and deployment strategies.'},
                {'name': 'Other', 'description': 'Any other technology topic not covered in the main categories.'}
            ]
            
            # Try to insert topics one by one to avoid batch errors
            for topic in default_topics:
                try:
                    supabase.table('topics').insert(topic).execute()
                except Exception as e:
                    if 'duplicate key' in str(e).lower():
                        print(f"Topic '{topic['name']}' already exists.")
                    else:
                        print(f"Error adding topic '{topic['name']}': {e}")
            
            print("Default topics added successfully.")
    except PostgrestAPIError as e:
        # If we get a 42P01 error, the table doesn't exist
        # Unfortunately, we can't create it through the API
        print(f"Error initializing database: {e}")
        print("Please create the 'topics' table in your Supabase dashboard with the following columns:")
        print("- id: uuid (primary key)")
        print("- name: text (unique)")
        print("- description: text")
        print("- created_at: timestamp with time zone")
        print("- updated_at: timestamp with time zone")
        print("And make sure to set RLS policies to allow all operations.")

# Function to fix RLS policies
def fix_rls_policies():
    try:
        # Since we can't use direct SQL with the Supabase client,
        # we'll use a simpler approach by just inserting a test topic and then deleting it
        # This will help identify if we have write access
        
        # Try to insert a test topic
        test_topic = {
            'name': f'Test Topic {uuid.uuid4()}'
        }
        
        result = supabase.table('topics').insert(test_topic).execute()
        
        # If successful, delete the test topic
        if result.data and len(result.data) > 0:
            test_id = result.data[0]['id']
            supabase.table('topics').delete().eq('id', test_id).execute()
            return True, "Database permissions verified successfully"
        
        return False, "Could not verify database permissions"
    except Exception as e:
        print(f"Error checking database permissions: {e}")
        return False, str(e)

@app.route('/admin/fix-rls', methods=['GET'])
def admin_fix_rls():
    if 'admin_id' not in session:
        flash('Please login to access this feature', 'error')
        return redirect(url_for('admin_login'))
    
    success, message = fix_rls_policies()
    
    if success:
        flash('Database permissions verified successfully', 'success')
    else:
        # If we can't fix it automatically, provide instructions
        error_msg = f"Could not fix database permissions automatically: {message}. Please go to your Supabase dashboard and update the RLS policies for the 'topics' table to allow all operations."
        flash(error_msg, 'error')
    
    return redirect(url_for('admin_dashboard'))

def verify_topics_table():
    """
    Verifies that the topics table has the correct schema and adds a description column if missing.
    This function can't directly alter the table schema through the Supabase client, but it can
    check if topics have descriptions and log information for manual fixes.
    """
    try:
        # Check if topics table exists and has data
        topics_result = supabase.table('topics').select('*').limit(1).execute()
        
        if topics_result.data:
            # Check if any topic has a description field
            sample_topic = topics_result.data[0]
            if 'description' not in sample_topic:
                print("WARNING: Topics table does not have a description column.")
                print("Please add a description column to the topics table in your Supabase dashboard.")
                print("SQL command: ALTER TABLE public.topics ADD COLUMN IF NOT EXISTS description TEXT;")
                return False
            return True
        else:
            print("Topics table exists but has no data.")
            return True
    except Exception as e:
        print(f"Error verifying topics table: {e}")
        return False

# Initialize database on startup
try:
    initialize_database()
    # Verify topics table schema
    verify_topics_table()
    # We'll skip the automatic fix_rls_policies call since it's now optional
except Exception as e:
    print(f"Error during initialization: {e}")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit')
def submit_assignment_page():
    try:
        # Get all topics
        topics_result = supabase.table('topics').select('*').order('name').execute()
        topics = topics_result.data
        
        # Log topics and their descriptions for debugging
        for topic in topics:
            print(f"Topic: {topic.get('name')}, Description: {topic.get('description')}")
        
        return render_template('submit_assignment.html', topics=topics)
    except Exception as e:
        print(f"Error loading topics: {e}")
        # If there's an error, try to initialize the database again
        initialize_database()
        # Try again after initialization
        try:
            topics_result = supabase.table('topics').select('*').order('name').execute()
            topics = topics_result.data
            # Log topics and their descriptions after initialization
            for topic in topics:
                print(f"Topic after init: {topic.get('name')}, Description: {topic.get('description')}")
        except:
            topics = []
        
        return render_template('submit_assignment.html', topics=topics)

@app.route('/submit-assignment', methods=['POST'])
def submit_assignment():
    try:
        # Get form data
        student_name = request.form.get('student_name')
        phone_number = request.form.get('phone_number')
        college = request.form.get('college')
        location = request.form.get('location')
        topic = request.form.get('topic')
        submission_type = request.form.get('submission_type')
        
        # Prepare assignment data
        assignment_data = {
            'student_name': student_name,
            'phone_number': phone_number,
            'college': college,
            'location': location,
            'topic': topic
        }
        
        # Handle file upload or text submission
        if submission_type == 'file':
            if 'file_upload' not in request.files:
                flash('No file part', 'error')
                return redirect(url_for('submit_assignment_page'))
            
            file = request.files['file_upload']
            
            if file.filename == '':
                flash('No selected file', 'error')
                return redirect(url_for('submit_assignment_page'))
            
            if file and allowed_file(file.filename):
                # Generate a unique filename
                file_ext = file.filename.rsplit('.', 1)[1].lower()
                filename = f"{str(uuid.uuid4())}.{file_ext}"
                file_path = f"assignments/{filename}"
                
                # Upload to Supabase Storage
                file_content = file.read()
                supabase.storage.from_('student-documents').upload(file_path, file_content)
                
                # Get public URL
                file_url = supabase.storage.from_('student-documents').get_public_url(file_path)
                
                # Update assignment data
                assignment_data['file_url'] = file_url
                assignment_data['file_type'] = get_file_type(file.filename)
            else:
                flash('File type not allowed', 'error')
                return redirect(url_for('submit_assignment_page'))
        else:  # Text submission
            text_content = request.form.get('text_content')
            if not text_content:
                flash('Text content cannot be empty', 'error')
                return redirect(url_for('submit_assignment_page'))
            
            # Update assignment data
            assignment_data['text_content'] = text_content
            assignment_data['file_type'] = 'text'
        
        # Insert assignment data into Supabase
        result = supabase.table('assignments').insert(assignment_data).execute()
        
        # Check if insertion was successful
        if result.data:
            flash('Assignment submitted successfully!', 'success')
        else:
            flash('Error submitting assignment. Please try again.', 'error')
        
        return redirect(url_for('submit_assignment_page'))
    
    except Exception as e:
        print(f"Error: {e}")
        flash('An error occurred. Please try again.', 'error')
        return redirect(url_for('submit_assignment_page'))

@app.route('/admin')
def admin_login():
    if 'admin_id' in session:
        return redirect(url_for('admin_dashboard'))
    return render_template('admin_login.html')

@app.route('/admin/login', methods=['POST'])
def admin_login_post():
    email = request.form.get('email')
    password = request.form.get('password')
    
    # Check if credentials match the hardcoded admin
    if email == 'yvixownerzlogin@yvix.com' and password == '1plus1isequaltofive':
        session['admin_id'] = 'admin'
        flash('Login successful', 'success')
        return redirect(url_for('admin_dashboard'))
    else:
        flash('Invalid email or password', 'error')
        return redirect(url_for('admin_login'))

@app.route('/admin/dashboard')
def admin_dashboard():
    if 'admin_id' not in session:
        flash('Please login to access the dashboard', 'error')
        return redirect(url_for('admin_login'))
    
    error_message = None
    assignments = []
    topics = []
    
    # Get all assignments
    try:
        assignments_result = supabase.table('assignments').select('*').order('created_at', desc=True).execute()
        assignments = assignments_result.data
    except Exception as e:
        print(f"Error fetching assignments: {e}")
        flash('Error loading assignments', 'error')
        
    # Get all topics
    try:
        topics_result = supabase.table('topics').select('*').order('name').execute()
        topics = topics_result.data
        
        # If no topics exist yet, create default topics
        if not topics:
            default_topics = [
                {'name': 'Web Development', 'description': 'Topics related to web technologies, frameworks, and best practices for building web applications.'},
                {'name': 'Mobile App Development', 'description': 'Topics covering native and cross-platform mobile application development for iOS and Android.'},
                {'name': 'Machine Learning', 'description': 'Topics on algorithms, models, and applications of machine learning and artificial intelligence.'},
                {'name': 'Data Science', 'description': 'Topics related to data analysis, visualization, and extracting insights from large datasets.'},
                {'name': 'Cybersecurity', 'description': 'Topics covering network security, encryption, threat analysis, and security best practices.'},
                {'name': 'Cloud Computing', 'description': 'Topics on cloud platforms, services, architecture, and deployment strategies.'},
                {'name': 'Other', 'description': 'Any other technology topic not covered in the main categories.'}
            ]
            supabase.table('topics').insert(default_topics).execute()
            topics_result = supabase.table('topics').select('*').order('name').execute()
            topics = topics_result.data
    except PostgrestAPIError as e:
        # If topics table doesn't exist, initialize the database
        if '42P01' in str(e):
            error_message = "Topics table doesn't exist. Initializing database..."
            print(error_message)
            try:
                initialize_database()
                topics_result = supabase.table('topics').select('*').order('name').execute()
                topics = topics_result.data
                error_message = None  # Clear error if successful
            except Exception as init_error:
                error_message = f"Failed to initialize database: {str(init_error)}"
                print(error_message)
        else:
            error_message = f"Error fetching topics: {str(e)}"
            print(error_message)
    except Exception as e:
        error_message = f"Unexpected error: {str(e)}"
        print(error_message)
    
    return render_template(
        'admin_dashboard.html', 
        assignments=assignments, 
        topics=topics, 
        csrf_token=generate_csrf_token(),
        error_message=error_message
    )

@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_id', None)
    flash('Logged out successfully', 'success')
    return redirect(url_for('admin_login'))

@app.route('/api/assignments/<assignment_id>')
def get_assignment(assignment_id):
    if 'admin_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        result = supabase.table('assignments').select('*').eq('id', assignment_id).execute()
        
        if not result.data:
            return jsonify({'error': 'Assignment not found'}), 404
        
        return jsonify(result.data[0])
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': 'Error fetching assignment'}), 500

# Generate CSRF token
def generate_csrf_token():
    if 'csrf_token' not in session:
        session['csrf_token'] = str(uuid.uuid4())
    return session['csrf_token']

# Topic management routes
@app.route('/admin/topics/add', methods=['POST'])
def add_topic():
    if 'admin_id' not in session:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    try:
        data = request.json
        name = data.get('name')
        description = data.get('description', '')
        
        if not name:
            return jsonify({'success': False, 'message': 'Topic name is required'}), 400
        
        # Check if topic already exists
        try:
            existing = supabase.table('topics').select('*').eq('name', name).execute()
            if existing.data:
                return jsonify({'success': False, 'message': 'Topic already exists'}), 400
        except PostgrestAPIError as e:
            # If topics table doesn't exist, initialize the database
            if '42P01' in str(e):
                initialize_database()
            else:
                return jsonify({'success': False, 'message': f'Database error: {str(e)}'}), 500
        
        # Insert new topic
        try:
            result = supabase.table('topics').insert({'name': name, 'description': description}).execute()
            
            if result.data:
                return jsonify({'success': True, 'topic_id': result.data[0]['id']})
            else:
                return jsonify({'success': False, 'message': 'Failed to add topic'}), 500
        except PostgrestAPIError as e:
            # Check if it's an RLS policy error
            if '42501' in str(e) and 'violates row-level security policy' in str(e):
                # Try to fix RLS policies and try again
                try:
                    # Fix RLS policies
                    success, _ = fix_rls_policies()
                    
                    if success:
                        # Try insert again
                        result = supabase.table('topics').insert({'name': name, 'description': description}).execute()
                        
                        if result.data:
                            return jsonify({'success': True, 'topic_id': result.data[0]['id']})
                        else:
                            return jsonify({'success': False, 'message': 'Failed to add topic after fixing policies'}), 500
                    else:
                        return jsonify({'success': False, 'message': 'Failed to fix database permissions'}), 500
                except Exception as policy_error:
                    return jsonify({'success': False, 'message': f'Error fixing policies: {str(policy_error)}'}), 500
            else:
                return jsonify({'success': False, 'message': f'Error adding topic: {str(e)}'}), 500
        except Exception as e:
            return jsonify({'success': False, 'message': f'Error adding topic: {str(e)}'}), 500
    
    except Exception as e:
        print(f"Error adding topic: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/admin/topics/update', methods=['POST'])
def update_topic():
    if 'admin_id' not in session:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    try:
        data = request.json
        topic_id = data.get('id')
        name = data.get('name')
        description = data.get('description', '')
        
        if not topic_id or not name:
            return jsonify({'success': False, 'message': 'Topic ID and name are required'}), 400
        
        # Check if topics table exists
        try:
            # Check if topic already exists with this name
            existing = supabase.table('topics').select('*').eq('name', name).not_.eq('id', topic_id).execute()
            if existing.data:
                return jsonify({'success': False, 'message': 'Another topic with this name already exists'}), 400
        except PostgrestAPIError as e:
            # If topics table doesn't exist, initialize the database
            if '42P01' in str(e):
                initialize_database()
                return jsonify({'success': False, 'message': 'Database was just initialized. Please try again.'}), 500
            else:
                return jsonify({'success': False, 'message': f'Database error: {str(e)}'}), 500
        
        # Update topic
        try:
            result = supabase.table('topics').update({'name': name, 'description': description}).eq('id', topic_id).execute()
            
            if result.data:
                # Also update all assignments with this topic
                old_name = result.data[0].get('name')
                if old_name:
                    try:
                        supabase.table('assignments').update({'topic': name}).eq('topic', old_name).execute()
                    except Exception as e:
                        print(f"Error updating assignments: {e}")
                
                return jsonify({'success': True})
            else:
                return jsonify({'success': False, 'message': 'Failed to update topic'}), 500
        except Exception as e:
            return jsonify({'success': False, 'message': f'Error updating topic: {str(e)}'}), 500
    
    except Exception as e:
        print(f"Error updating topic: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/admin/topics/delete', methods=['POST'])
def delete_topic():
    if 'admin_id' not in session:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    try:
        data = request.json
        topic_id = data.get('id')
        
        if not topic_id:
            return jsonify({'success': False, 'message': 'Topic ID is required'}), 400
        
        # Check if topics table exists
        try:
            # Get the topic name before deletion
            topic = supabase.table('topics').select('*').eq('id', topic_id).execute()
            if not topic.data:
                return jsonify({'success': False, 'message': 'Topic not found'}), 404
            
            topic_name = topic.data[0]['name']
        except PostgrestAPIError as e:
            # If topics table doesn't exist, initialize the database
            if '42P01' in str(e):
                initialize_database()
                return jsonify({'success': False, 'message': 'Database was just initialized. Please try again.'}), 500
            else:
                return jsonify({'success': False, 'message': f'Database error: {str(e)}'}), 500
        
        # Check if there are assignments with this topic
        try:
            assignments = supabase.table('assignments').select('id').eq('topic', topic_name).execute()
            if assignments.data:
                # Update assignments to use "Other" topic
                supabase.table('assignments').update({'topic': 'Other'}).eq('topic', topic_name).execute()
        except Exception as e:
            print(f"Error updating assignments: {e}")
        
        # Delete the topic
        try:
            result = supabase.table('topics').delete().eq('id', topic_id).execute()
            
            if result.data:
                return jsonify({'success': True})
            else:
                return jsonify({'success': False, 'message': 'Failed to delete topic'}), 500
        except Exception as e:
            return jsonify({'success': False, 'message': f'Error deleting topic: {str(e)}'}), 500
    
    except Exception as e:
        print(f"Error deleting topic: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/topics/<topic_name>')
def get_topic_details(topic_name):
    try:
        result = supabase.table('topics').select('*').eq('name', topic_name).execute()
        
        if not result.data:
            return jsonify({'success': False, 'message': 'Topic not found'}), 404
        
        return jsonify({'success': True, 'topic': result.data[0]})
    except Exception as e:
        print(f"Error fetching topic details: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/admin/update-topics-schema', methods=['GET'])
def update_topics_schema():
    if 'admin_id' not in session:
        flash('Please login to access this feature', 'error')
        return redirect(url_for('admin_login'))
    
    try:
        # Get all topics
        topics_result = supabase.table('topics').select('*').execute()
        topics = topics_result.data
        
        updated_count = 0
        for topic in topics:
            # Check if description is missing or None
            if 'description' not in topic or topic['description'] is None:
                # Update with a default description
                default_description = f"Topics related to {topic['name']}."
                try:
                    supabase.table('topics').update({'description': default_description}).eq('id', topic['id']).execute()
                    updated_count += 1
                except Exception as e:
                    print(f"Error updating topic {topic['name']}: {e}")
        
        if updated_count > 0:
            flash(f'Updated {updated_count} topics with default descriptions', 'success')
        else:
            flash('All topics already have descriptions', 'success')
        
        return redirect(url_for('admin_dashboard'))
    except Exception as e:
        flash(f'Error updating topics: {str(e)}', 'error')
        return redirect(url_for('admin_dashboard'))

@app.route('/admin/assignments/download', methods=['POST'])
def download_assignments():
    if 'admin_id' not in session:
        flash('Please login to access this feature', 'error')
        return redirect(url_for('admin_login'))
    
    try:
        # Get assignment IDs from the request
        assignment_ids = json.loads(request.form.get('assignment_ids', '[]'))
        
        if not assignment_ids:
            flash('No assignments selected', 'error')
            return redirect(url_for('admin_dashboard'))
        
        # Get assignment data from Supabase
        assignments = []
        for assignment_id in assignment_ids:
            result = supabase.table('assignments').select('*').eq('id', assignment_id).execute()
            if result.data:
                assignments.append(result.data[0])
        
        if not assignments:
            flash('No assignments found', 'error')
            return redirect(url_for('admin_dashboard'))
        
        # Create a ZIP file in memory
        memory_file = io.BytesIO()
        with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zf:
            for assignment in assignments:
                # Create a folder for each assignment
                folder_name = f"{assignment['student_name']}_{assignment['id'][:8]}"
                
                # Create a text file with assignment details
                details = f"""Assignment Details:
Student Name: {assignment.get('student_name', 'N/A')}
Phone Number: {assignment.get('phone_number', 'N/A')}
College: {assignment.get('college', 'N/A')}
Location: {assignment.get('location', 'N/A')}
Topic: {assignment.get('topic', 'N/A')}
Submission Type: {assignment.get('file_type', 'N/A')}
Submission Date: {assignment.get('created_at', 'N/A')}
"""
                zf.writestr(f"{folder_name}/assignment_details.txt", details)
                
                # Add the submitted content
                if assignment.get('file_type') == 'text':
                    # For text submissions, add the text content
                    if assignment.get('text_content'):
                        zf.writestr(f"{folder_name}/submission.txt", assignment['text_content'])
                else:
                    # For file submissions, download the file
                    if assignment.get('file_url'):
                        try:
                            file_url = assignment['file_url']
                            response = requests.get(file_url)
                            if response.status_code == 200:
                                # Extract the file extension from the URL
                                file_extension = os.path.splitext(file_url)[1]
                                if not file_extension:
                                    # Default to .pdf if no extension found
                                    file_extension = '.pdf'
                                
                                # Save the file in the ZIP
                                zf.writestr(f"{folder_name}/submission{file_extension}", response.content)
                        except Exception as e:
                            print(f"Error downloading file: {e}")
                            # Add an error note instead
                            zf.writestr(f"{folder_name}/download_error.txt", f"Failed to download file: {str(e)}")
        
        # Reset the file pointer to the beginning
        memory_file.seek(0)
        
        # Create a timestamp for the filename
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # Return the ZIP file as a download
        return send_file(
            memory_file,
            mimetype='application/zip',
            as_attachment=True,
            download_name=f"assignments_{timestamp}.zip"
        )
    
    except Exception as e:
        print(f"Error downloading assignments: {e}")
        flash(f'Error downloading assignments: {str(e)}', 'error')
        return redirect(url_for('admin_dashboard'))

@app.route('/admin/assignments/delete', methods=['POST'])
def delete_assignments():
    if 'admin_id' not in session:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    try:
        # Get assignment IDs from the request
        data = request.json
        assignment_ids = data.get('assignment_ids', [])
        
        if not assignment_ids:
            return jsonify({'success': False, 'message': 'No assignments selected'}), 400
        
        # Delete each assignment
        deleted_count = 0
        for assignment_id in assignment_ids:
            try:
                # Check if the assignment exists and get its file URL if it has one
                result = supabase.table('assignments').select('*').eq('id', assignment_id).execute()
                
                if result.data:
                    assignment = result.data[0]
                    
                    # If there's a file, try to delete it from storage
                    if assignment.get('file_url') and assignment.get('file_type') != 'text':
                        try:
                            # Extract the file path from the URL
                            file_path = assignment['file_url'].split('/')[-1]
                            if file_path:
                                supabase.storage.from_('student-documents').remove([f"assignments/{file_path}"])
                        except Exception as file_error:
                            print(f"Error deleting file: {file_error}")
                    
                    # Delete the assignment from the database
                    supabase.table('assignments').delete().eq('id', assignment_id).execute()
                    deleted_count += 1
            except Exception as e:
                print(f"Error deleting assignment {assignment_id}: {e}")
        
        if deleted_count > 0:
            return jsonify({'success': True, 'message': f'Successfully deleted {deleted_count} assignment(s)'})
        else:
            return jsonify({'success': False, 'message': 'No assignments were deleted'}), 400
    
    except Exception as e:
        print(f"Error deleting assignments: {e}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/api/topics', methods=['GET'])
def get_topics():
    try:
        # Get all topics
        topics_result = supabase.table('topics').select('*').order('name').execute()
        topics = topics_result.data
        
        return jsonify(topics)
    except Exception as e:
        print(f"Error fetching topics: {e}")
        return jsonify({'error': 'Error fetching topics'}), 500

if __name__ == '__main__':
    app.run(debug=True) 