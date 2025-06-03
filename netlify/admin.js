// Configuration
const API_URL = 'https://python-web-p5sz.onrender.com'; // The deployed Flask API URL on Render
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the login page
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        // Login page functionality
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const statusMessage = document.getElementById('status-message');
            
            // Demo credentials check (for Netlify static site)
            if (email === 'admin@example.com' && password === 'admin123') {
                // Show success message
                statusMessage.className = 'message success';
                statusMessage.innerHTML = '<i class="fas fa-check-circle"></i> Login successful!';
                statusMessage.style.display = 'flex';
                
                // Store login state
                localStorage.setItem('yvixAdminLoggedIn', 'true');
                
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    window.location.href = 'admin_dashboard.html';
                }, 1000);
            } else {
                // Show error message
                statusMessage.className = 'message error';
                statusMessage.innerHTML = '<i class="fas fa-exclamation-circle"></i> Invalid email or password';
                statusMessage.style.display = 'flex';
            }
        });
    }
    
    // Check if we're on the dashboard page
    const dashboardContainer = document.querySelector('.dashboard-container');
    
    if (dashboardContainer) {
        // Check if user is logged in
        const isLoggedIn = localStorage.getItem('yvixAdminLoggedIn') === 'true';
        
        if (!isLoggedIn) {
            // Redirect to login page if not logged in
            window.location.href = 'admin_login.html';
            return;
        }
        
        // Handle logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('yvixAdminLoggedIn');
                window.location.href = 'index.html';
            });
        }
        
        // Load mock data for dashboard
        loadMockAssignments();
        
        // Auto-hide flash messages after a few seconds
        const flashMessages = document.querySelectorAll('.message');
        flashMessages.forEach(message => {
            setTimeout(() => {
                message.style.opacity = '0';
                setTimeout(() => {
                    message.style.display = 'none';
                }, 500);
            }, 4000);
        });
        
        // Multi-select functionality
        const selectAllCheckbox = document.getElementById('select-all-checkbox');
        if (selectAllCheckbox) {
            const assignmentCheckboxes = document.querySelectorAll('.assignment-checkbox');
            const bulkDownloadBtn = document.getElementById('bulk-download-btn');
            const bulkDeleteBtn = document.getElementById('bulk-delete-btn');
            
            // Function to update bulk action buttons state
            function updateBulkActionButtons() {
                const checkedBoxes = document.querySelectorAll('.assignment-checkbox:checked');
                if (bulkDownloadBtn) bulkDownloadBtn.disabled = checkedBoxes.length === 0;
                if (bulkDeleteBtn) bulkDeleteBtn.disabled = checkedBoxes.length === 0;
            }
            
            // Select all checkbox functionality
            selectAllCheckbox.addEventListener('change', function() {
                assignmentCheckboxes.forEach(checkbox => {
                    checkbox.checked = this.checked;
                });
                updateBulkActionButtons();
            });
            
            // Individual checkbox functionality
            assignmentCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    // If any checkbox is unchecked, uncheck the "select all" checkbox
                    if (!this.checked) {
                        selectAllCheckbox.checked = false;
                    } else {
                        // Check if all checkboxes are checked
                        const allChecked = Array.from(assignmentCheckboxes).every(cb => cb.checked);
                        selectAllCheckbox.checked = allChecked;
                    }
                    updateBulkActionButtons();
                });
            });
            
            // Bulk download functionality
            if (bulkDownloadBtn) {
                bulkDownloadBtn.addEventListener('click', function() {
                    const selectedIds = Array.from(document.querySelectorAll('.assignment-checkbox:checked')).map(cb => cb.getAttribute('data-id'));
                    if (selectedIds.length > 0) {
                        alert(`Would download ${selectedIds.length} assignments (mock functionality)`);
                    }
                });
            }
            
            // Bulk delete functionality
            if (bulkDeleteBtn) {
                bulkDeleteBtn.addEventListener('click', function() {
                    const selectedIds = Array.from(document.querySelectorAll('.assignment-checkbox:checked')).map(cb => cb.getAttribute('data-id'));
                    if (selectedIds.length > 0) {
                        if (confirm(`Are you sure you want to delete ${selectedIds.length} selected assignment(s)?`)) {
                            // Mock deletion
                            selectedIds.forEach(id => {
                                const checkbox = document.querySelector(`.assignment-checkbox[data-id="${id}"]`);
                                if (checkbox) {
                                    const row = checkbox.closest('tr');
                                    if (row) {
                                        row.remove();
                                    }
                                }
                            });
                            
                            // Update bulk action buttons
                            updateBulkActionButtons();
                            
                            // Show success message
                            showStatusMessage(`Successfully deleted ${selectedIds.length} assignment(s)`, 'success');
                        }
                    }
                });
            }
        }
    }
});

// Function to load mock assignments for the dashboard
function loadMockAssignments() {
    const assignmentsTable = document.querySelector('.assignments-table tbody');
    
    if (!assignmentsTable) return;
    
    const mockAssignments = [
        {
            id: 'c2b64577-e3a1-4819-b090-257c2895dcb9',
            student_name: 'John Doe',
            topic: 'Cloud Computing',
            submission_date: '2025-06-01',
            type: 'file',
            filename: 'cloud_assignment.pdf'
        },
        {
            id: '7f8d9e10-a11b-12c3-d45e-6789f0123456',
            student_name: 'Jane Smith',
            topic: 'Python Developer',
            submission_date: '2025-06-02',
            type: 'text',
            content: 'Python development assignment content...'
        },
        {
            id: 'abc12345-6789-def0-1234-56789abcdef0',
            student_name: 'Alex Johnson',
            topic: 'Meme',
            submission_date: '2025-06-03',
            type: 'file',
            filename: 'meme_project.zip'
        }
    ];
    
    // Clear existing rows
    assignmentsTable.innerHTML = '';
    
    // Add mock assignments to the table
    mockAssignments.forEach(assignment => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>
                <input type="checkbox" class="assignment-checkbox" data-id="${assignment.id}">
            </td>
            <td>${assignment.student_name}</td>
            <td>${assignment.topic}</td>
            <td>${assignment.submission_date}</td>
            <td>${assignment.type === 'file' ? assignment.filename : 'Text submission'}</td>
            <td>
                <div class="table-actions">
                    <button class="view-btn" data-id="${assignment.id}" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="download-btn" data-id="${assignment.id}" title="Download">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="delete-btn" data-id="${assignment.id}" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        assignmentsTable.appendChild(row);
        
        // Add event listeners to the buttons
        const viewBtn = row.querySelector('.view-btn');
        const downloadBtn = row.querySelector('.download-btn');
        const deleteBtn = row.querySelector('.delete-btn');
        
        viewBtn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            alert(`Viewing assignment ${id} (mock functionality)`);
        });
        
        downloadBtn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            alert(`Downloading assignment ${id} (mock functionality)`);
        });
        
        deleteBtn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this assignment?')) {
                const row = this.closest('tr');
                row.remove();
                showStatusMessage('Assignment deleted successfully!', 'success');
            }
        });
    });
}

// Helper function to show status messages
function showStatusMessage(message, type) {
    const statusMessage = document.getElementById('status-message');
    if (!statusMessage) return;
    
    statusMessage.textContent = message;
    statusMessage.className = `message ${type}`;
    statusMessage.style.display = 'block';
    
    // Hide the message after a few seconds
    setTimeout(() => {
        statusMessage.style.opacity = '0';
        setTimeout(() => {
            statusMessage.style.display = 'none';
            statusMessage.style.opacity = '1';
        }, 500);
    }, 4000);
}

// Get filter elements
const topicFilter = document.getElementById('topic-filter');
const submissionFilter = document.getElementById('submission-filter');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

// Get modal elements
const modal = document.getElementById('assignment-modal');
const closeModal = document.querySelector('.close-modal');
const assignmentDetails = document.getElementById('assignment-details');

// Add event listeners for filters
topicFilter.addEventListener('change', filterAssignments);
submissionFilter.addEventListener('change', filterAssignments);
searchBtn.addEventListener('click', filterAssignments);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        filterAssignments();
    }
});

// Add event listeners for view buttons
const viewButtons = document.querySelectorAll('.view-btn');
viewButtons.forEach(button => {
    button.addEventListener('click', () => {
        const assignmentId = button.getAttribute('data-id');
        viewAssignmentDetails(assignmentId);
    });
});

// Close modal when clicking the X
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close modal when clicking outside of it
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Filter assignments based on selected filters and search term
function filterAssignments() {
    const topic = topicFilter.value;
    const type = submissionFilter.value;
    const searchTerm = searchInput.value.toLowerCase();
    
    const rows = document.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const rowTopic = row.getAttribute('data-topic');
        const rowType = row.getAttribute('data-type');
        const studentName = row.querySelector('td:first-child').textContent.toLowerCase();
        const college = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
        
        let showRow = true;
        
        // Apply topic filter
        if (topic !== 'all' && rowTopic !== topic) {
            showRow = false;
        }
        
        // Apply type filter
        if (type !== 'all' && rowType !== type) {
            showRow = false;
        }
        
        // Apply search filter
        if (searchTerm && !studentName.includes(searchTerm) && !college.includes(searchTerm)) {
            showRow = false;
        }
        
        // Show or hide row
        row.style.display = showRow ? '' : 'none';
    });
}

// View assignment details
function viewAssignmentDetails(assignmentId) {
    // In a real application, this would make an AJAX request to get the details
    // For this example, we'll simulate it with a fetch request
    
    fetch(`/api/assignments/${assignmentId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayAssignmentDetails(data);
            modal.style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching assignment details:', error);
            alert('Error loading assignment details. Please try again.');
        });
}

// Display assignment details in the modal
function displayAssignmentDetails(assignment) {
    let content = `
        <div class="assignment-detail">
            <h3>Student Information</h3>
            <p><strong>Name:</strong> ${assignment.student_name}</p>
            <p><strong>Phone:</strong> ${assignment.phone_number}</p>
            <p><strong>College:</strong> ${assignment.college}</p>
            <p><strong>Location:</strong> ${assignment.location}</p>
            
            <h3>Assignment Information</h3>
            <p><strong>Topic:</strong> ${assignment.topic}</p>
            <p><strong>Submission Type:</strong> ${assignment.file_type}</p>
            <p><strong>Submitted:</strong> ${new Date(assignment.created_at).toLocaleString()}</p>
    `;
    
    // Display content based on submission type
    if (assignment.file_type === 'text') {
        content += `
            <div class="text-content">
                <h3>Assignment Text</h3>
                <div class="text-box">
                    <p>${assignment.text_content}</p>
                </div>
            </div>
        `;
    } else {
        content += `
            <div class="file-content">
                <h3>Assignment File</h3>
                <p><a href="${assignment.file_url}" target="_blank" class="file-link">View/Download File</a></p>
                
                ${assignment.file_type === 'image' ? 
                    `<div class="image-preview">
                        <img src="${assignment.file_url}" alt="Assignment Image">
                    </div>` : ''}
            </div>
        `;
    }
    
    content += `</div>`;
    
    assignmentDetails.innerHTML = content;
} 