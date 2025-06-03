// Configuration
const API_URL = 'https://python-web-p5sz.onrender.com';

// DOM Elements
const notificationArea = document.getElementById('notification-area');
const logoutLink = document.getElementById('logout-link');
const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
const dashboardSections = document.querySelectorAll('.dashboard-section');
const assignmentsList = document.getElementById('assignments-list');
const topicsList = document.getElementById('topics-list');
const searchAssignments = document.getElementById('search-assignments');
const filterTopic = document.getElementById('filter-topic');
const selectAllCheckbox = document.getElementById('select-all');
const downloadSelectedBtn = document.getElementById('download-selected');
const deleteSelectedBtn = document.getElementById('delete-selected');
const selectedCountDisplay = document.getElementById('selected-count');
const addTopicBtn = document.getElementById('add-topic-btn');

// Modals
const assignmentModal = document.getElementById('assignment-modal');
const topicModal = document.getElementById('topic-modal');
const confirmModal = document.getElementById('confirm-modal');
const closeModalBtns = document.querySelectorAll('.close-modal');
const topicForm = document.getElementById('topic-form');
const confirmMessage = document.getElementById('confirm-message');
const confirmCancelBtn = document.getElementById('confirm-cancel');
const confirmProceedBtn = document.getElementById('confirm-proceed');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const token = localStorage.getItem('admin_token');
    if (!token) {
        window.location.href = 'admin.html';
        return;
    }
    
    // Initialize dashboard
    setupMobileOptimizations();
    loadAssignments();
    loadTopics();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Logout
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            window.location.href = 'admin.html';
        });
    }
    
    // Sidebar navigation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            showSection(targetId);
            
            // Update active state
            sidebarLinks.forEach(l => l.parentElement.classList.remove('active'));
            link.parentElement.classList.add('active');
        });
    });
    
    // Search assignments
    if (searchAssignments) {
        searchAssignments.addEventListener('input', debounce(() => {
            loadAssignments();
        }, 300));
    }
    
    // Filter by topic
    if (filterTopic) {
        filterTopic.addEventListener('change', () => {
            loadAssignments();
        });
    }
    
    // Select all assignments
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', () => {
            const checkboxes = assignmentsList.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
            });
            updateSelectedCount();
        });
    }
    
    // Download selected
    if (downloadSelectedBtn) {
        downloadSelectedBtn.addEventListener('click', downloadSelectedAssignments);
    }
    
    // Delete selected
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', () => {
            const selectedIds = getSelectedAssignmentIds();
            if (selectedIds.length > 0) {
                showConfirmModal(
                    `Are you sure you want to delete ${selectedIds.length} assignment(s)?`,
                    deleteSelectedAssignments
                );
            }
        });
    }
    
    // Add topic button
    if (addTopicBtn) {
        addTopicBtn.addEventListener('click', () => {
            document.getElementById('topic-modal-title').textContent = 'Add Topic';
            document.getElementById('topic-id').value = '';
            document.getElementById('topic-name').value = '';
            document.getElementById('topic-description-input').value = '';
            showModal(topicModal);
        });
    }
    
    // Topic form submission
    if (topicForm) {
        topicForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveTopicChanges();
        });
    }
    
    // Close modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            hideModal(modal);
        });
    });
    
    // Confirm modal buttons
    if (confirmCancelBtn) {
        confirmCancelBtn.addEventListener('click', () => {
            hideModal(confirmModal);
        });
    }
}

// Mobile Optimizations
function setupMobileOptimizations() {
    // Fix for iOS input zoom issues
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
        document.addEventListener('focus', function(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
                viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0');
            }
        }, true);
        
        document.addEventListener('blur', function() {
            viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }, true);
    }
    
    // Handle responsive dashboard
    if (window.innerWidth <= 768) {
        document.body.classList.add('mobile-view');
    }
    
    window.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
            document.body.classList.add('mobile-view');
        } else {
            document.body.classList.remove('mobile-view');
        }
    });
}

// Load Assignments
async function loadAssignments() {
    if (!assignmentsList) return;
    
    assignmentsList.innerHTML = '<tr class="loading-row"><td colspan="6">Loading assignments...</td></tr>';
    
    try {
        // In a real app, this would fetch from the API with search and filter params
        // For demo purposes, we'll create some mock data
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
        
        const searchTerm = searchAssignments ? searchAssignments.value.toLowerCase() : '';
        const topicFilter = filterTopic ? filterTopic.value : '';
        
        const mockAssignments = [
            {
                id: 'c2b64577-e3a1-4819-b090-257c2895dcb9',
                student_name: 'John Smith',
                topic: 'Cloud Computing',
                submission_type: 'file',
                file_name: 'cloud_assignment.pdf',
                text_content: '',
                created_at: '2025-06-01T10:30:00Z'
            },
            {
                id: 'a1c54567-d2b1-4719-a080-146b1784cca8',
                student_name: 'Emily Johnson',
                topic: 'python developer',
                submission_type: 'text',
                file_name: '',
                text_content: 'This is my python developer assignment submission...',
                created_at: '2025-06-02T14:15:00Z'
            },
            {
                id: 'b3d65487-f4c2-4919-c070-358d3996ddb7',
                student_name: 'Michael Brown',
                topic: 'meme',
                submission_type: 'file',
                file_name: 'funny_meme.jpg',
                text_content: '',
                created_at: '2025-06-03T09:45:00Z'
            }
        ];
        
        // Filter assignments based on search and topic filter
        const filteredAssignments = mockAssignments.filter(assignment => {
            const matchesSearch = searchTerm === '' || 
                assignment.student_name.toLowerCase().includes(searchTerm) ||
                assignment.topic.toLowerCase().includes(searchTerm);
                
            const matchesTopic = topicFilter === '' || assignment.topic === topicFilter;
            
            return matchesSearch && matchesTopic;
        });
        
        if (filteredAssignments.length === 0) {
            assignmentsList.innerHTML = '<tr><td colspan="6">No assignments found.</td></tr>';
            return;
        }
        
        // Render assignments
        assignmentsList.innerHTML = '';
        filteredAssignments.forEach(assignment => {
            const row = document.createElement('tr');
            row.dataset.id = assignment.id;
            
            const date = new Date(assignment.created_at);
            const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
            
            row.innerHTML = `
                <td>
                    <input type="checkbox" class="assignment-checkbox" data-id="${assignment.id}">
                </td>
                <td>${assignment.student_name}</td>
                <td>${assignment.topic}</td>
                <td>
                    ${assignment.submission_type === 'file' 
                        ? `<span class="file-badge"><i class="fas fa-file"></i> File</span>` 
                        : `<span class="text-badge"><i class="fas fa-keyboard"></i> Text</span>`}
                </td>
                <td>${formattedDate}</td>
                <td>
                    <button class="action-btn view-btn" data-id="${assignment.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn delete-btn" data-id="${assignment.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            assignmentsList.appendChild(row);
        });
        
        // Add event listeners to checkboxes
        const checkboxes = assignmentsList.querySelectorAll('.assignment-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateSelectedCount);
        });
        
        // Add event listeners to view buttons
        const viewButtons = assignmentsList.querySelectorAll('.view-btn');
        viewButtons.forEach(button => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-id');
                viewAssignmentDetails(id);
            });
        });
        
        // Add event listeners to delete buttons
        const deleteButtons = assignmentsList.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-id');
                showConfirmModal(
                    'Are you sure you want to delete this assignment?',
                    () => deleteAssignment(id)
                );
            });
        });
        
    } catch (error) {
        console.error('Error loading assignments:', error);
        assignmentsList.innerHTML = '<tr><td colspan="6">Failed to load assignments. Please try again.</td></tr>';
        showNotification('Failed to load assignments', 'error');
    }
}

// Load Topics
async function loadTopics() {
    if (!topicsList) return;
    
    topicsList.innerHTML = '<tr class="loading-row"><td colspan="4">Loading topics...</td></tr>';
    
    try {
        // In a real app, this would fetch from the API
        // For demo purposes, we'll create some mock data
        await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay
        
        const mockTopics = [
            {
                id: '1',
                name: 'Cloud Computing',
                description: 'Topics related to Cloud Computing.',
                created_at: '2025-05-15T08:00:00Z'
            },
            {
                id: '2',
                name: 'python developer',
                description: 'Topics related to python develoddper.',
                created_at: '2025-05-20T10:30:00Z'
            },
            {
                id: '3',
                name: 'meme',
                description: 'meme',
                created_at: '2025-05-25T14:45:00Z'
            }
        ];
        
        // Also populate the filter dropdown
        if (filterTopic) {
            // Keep the first "All Topics" option
            filterTopic.innerHTML = '<option value="">All Topics</option>';
            
            mockTopics.forEach(topic => {
                const option = document.createElement('option');
                option.value = topic.name;
                option.textContent = topic.name;
                filterTopic.appendChild(option);
            });
        }
        
        if (mockTopics.length === 0) {
            topicsList.innerHTML = '<tr><td colspan="4">No topics found.</td></tr>';
            return;
        }
        
        // Render topics
        topicsList.innerHTML = '';
        mockTopics.forEach(topic => {
            const row = document.createElement('tr');
            row.dataset.id = topic.id;
            
            const date = new Date(topic.created_at);
            const formattedDate = date.toLocaleDateString();
            
            row.innerHTML = `
                <td>${topic.name}</td>
                <td>${topic.description}</td>
                <td>${formattedDate}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${topic.id}" data-name="${topic.name}" data-description="${topic.description}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" data-id="${topic.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            topicsList.appendChild(row);
        });
        
        // Add event listeners to edit buttons
        const editButtons = topicsList.querySelectorAll('.edit-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-id');
                const name = button.getAttribute('data-name');
                const description = button.getAttribute('data-description');
                
                document.getElementById('topic-modal-title').textContent = 'Edit Topic';
                document.getElementById('topic-id').value = id;
                document.getElementById('topic-name').value = name;
                document.getElementById('topic-description-input').value = description;
                
                showModal(topicModal);
            });
        });
        
        // Add event listeners to delete buttons
        const deleteButtons = topicsList.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-id');
                showConfirmModal(
                    'Are you sure you want to delete this topic?',
                    () => deleteTopic(id)
                );
            });
        });
        
    } catch (error) {
        console.error('Error loading topics:', error);
        topicsList.innerHTML = '<tr><td colspan="4">Failed to load topics. Please try again.</td></tr>';
        showNotification('Failed to load topics', 'error');
    }
}

// View Assignment Details
async function viewAssignmentDetails(id) {
    const assignmentDetails = document.getElementById('assignment-details');
    if (!assignmentDetails) return;
    
    assignmentDetails.innerHTML = '<div class="loading">Loading assignment details...</div>';
    showModal(assignmentModal);
    
    try {
        // In a real app, this would fetch from the API
        // For demo purposes, we'll create some mock data
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        
        // Find the assignment by ID (in a real app, this would come from the API)
        const mockAssignments = [
            {
                id: 'c2b64577-e3a1-4819-b090-257c2895dcb9',
                student_name: 'John Smith',
                phone_number: '555-123-4567',
                college: 'Tech University',
                location: 'New York, NY',
                topic: 'Cloud Computing',
                submission_type: 'file',
                file_name: 'cloud_assignment.pdf',
                file_url: '#',
                text_content: '',
                created_at: '2025-06-01T10:30:00Z'
            },
            {
                id: 'a1c54567-d2b1-4719-a080-146b1784cca8',
                student_name: 'Emily Johnson',
                phone_number: '555-987-6543',
                college: 'State College',
                location: 'Chicago, IL',
                topic: 'python developer',
                submission_type: 'text',
                file_name: '',
                file_url: '',
                text_content: 'This is my python developer assignment submission. I have created a web application using Flask and deployed it to Heroku. The application includes user authentication, database integration, and responsive design. I used SQLAlchemy for the ORM and Bootstrap for the frontend. The code is well-documented and follows PEP 8 style guidelines.',
                created_at: '2025-06-02T14:15:00Z'
            },
            {
                id: 'b3d65487-f4c2-4919-c070-358d3996ddb7',
                student_name: 'Michael Brown',
                phone_number: '555-456-7890',
                college: 'Community College',
                location: 'Los Angeles, CA',
                topic: 'meme',
                submission_type: 'file',
                file_name: 'funny_meme.jpg',
                file_url: '#',
                text_content: '',
                created_at: '2025-06-03T09:45:00Z'
            }
        ];
        
        const assignment = mockAssignments.find(a => a.id === id);
        
        if (!assignment) {
            assignmentDetails.innerHTML = '<div class="error-message">Assignment not found</div>';
            return;
        }
        
        const date = new Date(assignment.created_at);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        
        let submissionContent = '';
        if (assignment.submission_type === 'file') {
            submissionContent = `
                <div class="file-preview">
                    <div class="file-icon">
                        <i class="fas ${getFileIcon(assignment.file_name)}"></i>
                    </div>
                    <div class="file-info">
                        <h4>${assignment.file_name}</h4>
                        <a href="${assignment.file_url}" class="download-link" target="_blank">
                            <i class="fas fa-download"></i> Download File
                        </a>
                    </div>
                </div>
            `;
        } else {
            submissionContent = `
                <div class="text-submission">
                    <pre>${assignment.text_content}</pre>
                </div>
            `;
        }
        
        assignmentDetails.innerHTML = `
            <div class="assignment-detail-grid">
                <div class="detail-section">
                    <h3>Student Information</h3>
                    <div class="detail-row">
                        <span class="detail-label">Name:</span>
                        <span class="detail-value">${assignment.student_name}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Phone:</span>
                        <span class="detail-value">${assignment.phone_number}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">College:</span>
                        <span class="detail-value">${assignment.college}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Location:</span>
                        <span class="detail-value">${assignment.location}</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>Assignment Information</h3>
                    <div class="detail-row">
                        <span class="detail-label">Topic:</span>
                        <span class="detail-value">${assignment.topic}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Submission Type:</span>
                        <span class="detail-value">${assignment.submission_type === 'file' ? 'File Upload' : 'Text Submission'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Date Submitted:</span>
                        <span class="detail-value">${formattedDate}</span>
                    </div>
                </div>
            </div>
            
            <div class="submission-content">
                <h3>Submission Content</h3>
                ${submissionContent}
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading assignment details:', error);
        assignmentDetails.innerHTML = '<div class="error-message">Failed to load assignment details. Please try again.</div>';
    }
}

// Helper Functions
function showSection(sectionId) {
    dashboardSections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.querySelector(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

function updateSelectedCount() {
    const checkboxes = assignmentsList.querySelectorAll('.assignment-checkbox:checked');
    const count = checkboxes.length;
    
    selectedCountDisplay.textContent = `${count} selected`;
    
    // Enable/disable bulk action buttons
    downloadSelectedBtn.disabled = count === 0;
    deleteSelectedBtn.disabled = count === 0;
}

function getSelectedAssignmentIds() {
    const checkboxes = assignmentsList.querySelectorAll('.assignment-checkbox:checked');
    return Array.from(checkboxes).map(checkbox => checkbox.getAttribute('data-id'));
}

function downloadSelectedAssignments() {
    const selectedIds = getSelectedAssignmentIds();
    if (selectedIds.length === 0) return;
    
    // In a real app, this would trigger a download from the API
    showNotification(`Downloading ${selectedIds.length} assignment(s)...`, 'success');
    
    // Simulate download completion
    setTimeout(() => {
        showNotification(`Successfully downloaded ${selectedIds.length} assignment(s)`, 'success');
    }, 2000);
}

function deleteSelectedAssignments() {
    const selectedIds = getSelectedAssignmentIds();
    if (selectedIds.length === 0) return;
    
    // In a real app, this would send a delete request to the API
    showNotification(`Deleting ${selectedIds.length} assignment(s)...`, 'info');
    
    // Simulate deletion
    setTimeout(() => {
        // Remove rows from the table
        selectedIds.forEach(id => {
            const row = assignmentsList.querySelector(`tr[data-id="${id}"]`);
            if (row) {
                row.remove();
            }
        });
        
        // Update counts and reset select all
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = false;
        }
        updateSelectedCount();
        
        showNotification(`Successfully deleted ${selectedIds.length} assignment(s)`, 'success');
        hideModal(confirmModal);
    }, 1000);
}

function deleteAssignment(id) {
    // In a real app, this would send a delete request to the API
    showNotification('Deleting assignment...', 'info');
    
    // Simulate deletion
    setTimeout(() => {
        // Remove row from the table
        const row = assignmentsList.querySelector(`tr[data-id="${id}"]`);
        if (row) {
            row.remove();
        }
        
        showNotification('Assignment deleted successfully', 'success');
        hideModal(confirmModal);
    }, 1000);
}

function saveTopicChanges() {
    const id = document.getElementById('topic-id').value;
    const name = document.getElementById('topic-name').value;
    const description = document.getElementById('topic-description-input').value;
    
    if (!name || !description) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // In a real app, this would send a save request to the API
    showNotification(id ? 'Updating topic...' : 'Creating topic...', 'info');
    
    // Simulate API call
    setTimeout(() => {
        hideModal(topicModal);
        loadTopics(); // Reload topics
        showNotification(id ? 'Topic updated successfully' : 'Topic created successfully', 'success');
    }, 1000);
}

function deleteTopic(id) {
    // In a real app, this would send a delete request to the API
    showNotification('Deleting topic...', 'info');
    
    // Simulate deletion
    setTimeout(() => {
        // Remove row from the table
        const row = topicsList.querySelector(`tr[data-id="${id}"]`);
        if (row) {
            row.remove();
        }
        
        showNotification('Topic deleted successfully', 'success');
        hideModal(confirmModal);
        
        // Also update the filter dropdown
        if (filterTopic) {
            const option = filterTopic.querySelector(`option[value="${id}"]`);
            if (option) {
                option.remove();
            }
        }
    }, 1000);
}

function showModal(modal) {
    if (!modal) return;
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function hideModal(modal) {
    if (!modal) return;
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function showConfirmModal(message, onConfirm) {
    if (!confirmModal || !confirmMessage || !confirmProceedBtn) return;
    
    confirmMessage.textContent = message;
    
    // Remove previous event listener
    const newConfirmBtn = confirmProceedBtn.cloneNode(true);
    confirmProceedBtn.parentNode.replaceChild(newConfirmBtn, confirmProceedBtn);
    
    // Add new event listener
    newConfirmBtn.addEventListener('click', onConfirm);
    
    showModal(confirmModal);
}

function showNotification(message, type) {
    if (!notificationArea) return;
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${getNotificationIcon(type)}"></i>
        </div>
        <div class="notification-message">${message}</div>
        <button class="notification-close">&times;</button>
    `;
    
    notificationArea.appendChild(notification);
    
    // Add close button event
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return 'fa-check-circle';
        case 'error':
            return 'fa-exclamation-circle';
        case 'warning':
            return 'fa-exclamation-triangle';
        case 'info':
        default:
            return 'fa-info-circle';
    }
}

function getFileIcon(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
        case 'pdf':
            return 'fa-file-pdf';
        case 'doc':
        case 'docx':
            return 'fa-file-word';
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
            return 'fa-file-image';
        case 'txt':
            return 'fa-file-alt';
        default:
            return 'fa-file';
    }
}

// Utility function for debouncing
function debounce(func, delay) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
} 