document.addEventListener('DOMContentLoaded', () => {
    // Get form elements
    const submissionForm = document.getElementById('assignment-form');
    const submissionType = document.getElementById('submission-type');
    const toggleOptions = document.querySelectorAll('.toggle-option');
    const fileUploadContainer = document.getElementById('file-upload-container');
    const textInputContainer = document.getElementById('text-input-container');
    const uploadArea = document.getElementById('upload-area');
    const fileUpload = document.getElementById('file-upload');
    const textInput = document.getElementById('text-input');
    
    // Topic description functionality
    const topicSelect = document.getElementById('topic');
    const topicDescription = document.getElementById('topic-description');
    
    if (topicSelect) {
        // Check if there's a selected topic on page load
        if (topicSelect.selectedIndex > 0) {
            const selectedOption = topicSelect.options[topicSelect.selectedIndex];
            const description = selectedOption.getAttribute('data-description');
            
            if (description) {
                topicDescription.textContent = description;
                topicDescription.style.display = 'block';
            } else {
                fetchTopicDescription(selectedOption.value);
            }
        }
        
        // Add change event listener to topic select
        topicSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const description = selectedOption.getAttribute('data-description');
            
            if (description) {
                topicDescription.textContent = description;
                topicDescription.style.display = 'block';
            } else if (selectedOption.value) {
                fetchTopicDescription(selectedOption.value);
            } else {
                topicDescription.style.display = 'none';
            }
        });
    }
    
    // Function to fetch topic description from API
    function fetchTopicDescription(topicName) {
        if (!topicName) return;
        
        fetch(`/api/topics/${encodeURIComponent(topicName)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.topic && data.topic.description) {
                    // Update the description in the UI
                    topicDescription.textContent = data.topic.description;
                    topicDescription.style.display = 'block';
                    
                    // Also update the data-description attribute on the option
                    const option = topicSelect.querySelector(`option[value="${topicName}"]`);
                    if (option) {
                        option.setAttribute('data-description', data.topic.description);
                    }
                } else {
                    topicDescription.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error fetching topic description:', error);
                topicDescription.style.display = 'none';
            });
    }
    
    // Set default submission type to file
    if (toggleOptions.length > 0) {
        toggleOptions[0].classList.add('active');
        submissionType.value = 'file';
    }
    
    // Toggle between file upload and text input based on selection
    toggleOptions.forEach(option => {
        option.addEventListener('click', () => {
            const value = option.getAttribute('data-value');
            
            // Update active state
            toggleOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            // Update hidden input value
            submissionType.value = value;
            
            // Show/hide appropriate containers
            if (value === 'file') {
                fileUploadContainer.classList.remove('hidden');
                textInputContainer.classList.add('hidden');
                textInput.removeAttribute('required');
                fileUpload.setAttribute('required', '');
            } else if (value === 'text') {
                fileUploadContainer.classList.add('hidden');
                textInputContainer.classList.remove('hidden');
                fileUpload.removeAttribute('required');
                textInput.setAttribute('required', '');
            }
        });
    });
    
    // Handle file upload area interactions
    if (uploadArea) {
        uploadArea.addEventListener('click', () => {
            fileUpload.click();
        });
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            if (e.dataTransfer.files.length) {
                fileUpload.files = e.dataTransfer.files;
                updateFileInfo(e.dataTransfer.files[0]);
            }
        });
        
        fileUpload.addEventListener('change', (e) => {
            if (fileUpload.files.length) {
                updateFileInfo(fileUpload.files[0]);
            }
        });
    }
    
    // Update file information display
    function updateFileInfo(file) {
        const placeholder = uploadArea.querySelector('.upload-placeholder');
        const fileInfo = uploadArea.querySelector('.file-info');
        
        if (file) {
            const fileSize = (file.size / (1024 * 1024)).toFixed(2); // Convert to MB
            const fileIcon = getFileIcon(file.name);
            
            placeholder.innerHTML = `
                <i class="${fileIcon} upload-icon"></i>
                <p>${file.name}</p>
                <span class="file-info">${fileSize} MB</span>
                <button type="button" class="browse-text" onclick="removeFile(event)">Remove</button>
            `;
        } else {
            placeholder.innerHTML = `
                <i class="fas fa-cloud-upload-alt upload-icon"></i>
                <p>Drag & drop your file here or <span class="browse-text">browse</span></p>
                <span class="file-info">Supported formats: PDF, DOC, DOCX, JPG, PNG</span>
            `;
        }
    }
    
    // Get appropriate icon based on file type
    function getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
            return 'fas fa-file-image';
        } else if (ext === 'pdf') {
            return 'fas fa-file-pdf';
        } else if (['doc', 'docx'].includes(ext)) {
            return 'fas fa-file-word';
        } else {
            return 'fas fa-file';
        }
    }
    
    // Form validation
    if (submissionForm) {
        submissionForm.addEventListener('submit', (e) => {
            if (!submissionType.value) {
                e.preventDefault();
                alert('Please select a submission type');
                return;
            }
            
            if (submissionType.value === 'file' && (!fileUpload.files || !fileUpload.files.length)) {
                e.preventDefault();
                alert('Please select a file to upload');
                return;
            }
            
            if (submissionType.value === 'text' && !textInput.value.trim()) {
                e.preventDefault();
                alert('Please enter your assignment text');
                return;
            }
        });
    }
});

// Function to remove selected file
function removeFile(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    const fileUpload = document.getElementById('file-upload');
    const uploadArea = document.getElementById('upload-area');
    const placeholder = uploadArea.querySelector('.upload-placeholder');
    
    fileUpload.value = '';
    
    placeholder.innerHTML = `
        <i class="fas fa-cloud-upload-alt upload-icon"></i>
        <p>Drag & drop your file here or <span class="browse-text">browse</span></p>
        <span class="file-info">Supported formats: PDF, DOC, DOCX, JPG, PNG</span>
    `;
} 