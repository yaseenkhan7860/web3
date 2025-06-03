// Configuration
const API_URL = 'https://python-web-p5sz.onrender.com'; // The deployed Flask API URL on Render

// DOM Elements
const assignmentForm = document.getElementById('assignment-form');
const topicSelect = document.getElementById('topic');
const topicDescription = document.getElementById('topic-description');
const submissionTypeInput = document.getElementById('submission-type');
const textSubmission = document.getElementById('text-submission');
const fileSubmission = document.getElementById('file-submission');
const toggleOptions = document.querySelectorAll('.toggle-option');
const fileUpload = document.getElementById('file-upload');
const filePreview = document.getElementById('file-preview');
const statusMessage = document.getElementById('status-message');

// Load topics when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadTopics();
    setupMobileOptimizations();
});

// Event Listeners
topicSelect.addEventListener('change', showTopicDescription);
toggleOptions.forEach(option => {
    option.addEventListener('click', toggleSubmissionType);
});
fileUpload.addEventListener('change', handleFileUpload);
assignmentForm.addEventListener('submit', submitAssignment);

// Functions
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
    
    // Improve mobile touch targets
    if (window.innerWidth <= 768) {
        const touchTargets = document.querySelectorAll('a, button, .toggle-option, input[type="file"]');
        touchTargets.forEach(target => {
            if (target.style.minHeight !== '44px') {
                target.style.minHeight = '44px';
            }
        });
    }
    
    // Handle orientation change
    window.addEventListener('orientationchange', function() {
        setTimeout(function() {
            window.scrollTo(0, 0);
        }, 300);
    });
}

async function loadTopics() {
    try {
        const response = await fetch(`${API_URL}/api/topics`);
        if (!response.ok) {
            throw new Error('Failed to load topics');
        }
        
        const topics = await response.json();
        
        // Add topics to select dropdown
        topics.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic.name;
            option.textContent = topic.name;
            option.setAttribute('data-description', topic.description || '');
            topicSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading topics:', error);
        showMessage('Failed to load topics. Please try again later.', 'error');
    }
}

function showTopicDescription() {
    const selectedOption = topicSelect.options[topicSelect.selectedIndex];
    const description = selectedOption.getAttribute('data-description');
    
    if (description) {
        topicDescription.textContent = description;
        topicDescription.style.display = 'block';
    } else {
        topicDescription.style.display = 'none';
    }
}

function toggleSubmissionType() {
    const type = this.getAttribute('data-value');
    
    // Update active state
    toggleOptions.forEach(option => {
        option.classList.remove('active');
    });
    this.classList.add('active');
    
    // Update hidden input
    submissionTypeInput.value = type;
    
    // Show/hide appropriate sections
    if (type === 'text') {
        textSubmission.style.display = 'block';
        fileSubmission.style.display = 'none';
    } else {
        textSubmission.style.display = 'none';
        fileSubmission.style.display = 'block';
    }
}

function handleFileUpload() {
    const file = fileUpload.files[0];
    
    if (!file) {
        filePreview.innerHTML = '';
        return;
    }
    
    // Check file type
    const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
        showMessage('Invalid file type. Please upload a PDF, DOC, DOCX, JPG, JPEG, or PNG file.', 'error');
        fileUpload.value = '';
        filePreview.innerHTML = '';
        return;
    }
    
    // Check file size (max 16MB)
    if (file.size > 16 * 1024 * 1024) {
        showMessage('File is too large. Maximum size is 16MB.', 'error');
        fileUpload.value = '';
        filePreview.innerHTML = '';
        return;
    }
    
    // Show file preview
    filePreview.innerHTML = `
        <div class="selected-file">
            <i class="fas ${getFileIcon(fileExtension)}"></i>
            <span>${file.name}</span>
            <small>${formatFileSize(file.size)}</small>
        </div>
    `;
}

function getFileIcon(extension) {
    switch (extension) {
        case '.pdf':
            return 'fa-file-pdf';
        case '.doc':
        case '.docx':
            return 'fa-file-word';
        case '.jpg':
        case '.jpeg':
        case '.png':
            return 'fa-file-image';
        default:
            return 'fa-file';
    }
}

function formatFileSize(bytes) {
    if (bytes < 1024) {
        return bytes + ' bytes';
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(2) + ' KB';
    } else {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
}

async function submitAssignment(event) {
    event.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Show loading state
    const submitBtn = assignmentForm.querySelector('.submit-btn');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;
    
    try {
        const formData = new FormData(assignmentForm);
        
        // Handle file upload
        if (submissionTypeInput.value === 'file' && fileUpload.files.length > 0) {
            formData.append('file_upload', fileUpload.files[0]);
        }
        
        // Send form data to API
        const response = await fetch(`${API_URL}/submit-assignment`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Failed to submit assignment');
        }
        
        // Show success message
        showMessage('Assignment submitted successfully!', 'success');
        
        // Reset form
        assignmentForm.reset();
        filePreview.innerHTML = '';
        topicDescription.style.display = 'none';
        
        // Reset submission type to text
        submissionTypeInput.value = 'text';
        toggleOptions.forEach(option => {
            option.classList.remove('active');
            if (option.getAttribute('data-value') === 'text') {
                option.classList.add('active');
            }
        });
        textSubmission.style.display = 'block';
        fileSubmission.style.display = 'none';
        
    } catch (error) {
        console.error('Error submitting assignment:', error);
        showMessage('Failed to submit assignment. Please try again.', 'error');
    } finally {
        // Reset button state
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    }
}

function validateForm() {
    // Check required fields
    const requiredFields = assignmentForm.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
        } else {
            field.classList.remove('error');
        }
    });
    
    // Check submission type
    if (submissionTypeInput.value === 'text') {
        const textContent = document.getElementById('text-content').value.trim();
        if (!textContent) {
            isValid = false;
            document.getElementById('text-content').classList.add('error');
            showMessage('Please enter your submission text.', 'error');
        }
    } else if (submissionTypeInput.value === 'file') {
        if (!fileUpload.files.length) {
            isValid = false;
            fileUpload.parentElement.classList.add('error');
            showMessage('Please select a file to upload.', 'error');
        }
    }
    
    if (!isValid) {
        showMessage('Please fill in all required fields.', 'error');
    }
    
    return isValid;
}

function showMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `message ${type}`;
    statusMessage.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        statusMessage.style.opacity = '0';
        setTimeout(() => {
            statusMessage.style.display = 'none';
            statusMessage.style.opacity = '1';
        }, 500);
    }, 5000);
    
    // Scroll to message
    statusMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
} 