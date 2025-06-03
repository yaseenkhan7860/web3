document.addEventListener('DOMContentLoaded', () => {
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
}); 