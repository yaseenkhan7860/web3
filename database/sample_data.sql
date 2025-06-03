-- Insert sample assignments
INSERT INTO assignments (student_name, phone_number, college, location, topic, file_url, file_type)
VALUES 
  ('Alex Chen', '555-123-4567', 'University of Technology', 'San Francisco', 'Web Development', 'https://example.com/files/assignment1.pdf', 'pdf'),
  ('Maria Garcia', '555-987-6543', 'State University', 'Chicago', 'Machine Learning', 'https://example.com/files/assignment2.jpg', 'image'),
  ('James Wilson', '555-456-7890', 'Tech Institute', 'New York', 'Mobile App Development', NULL, 'text');

-- Insert text content for the text-based assignment
UPDATE assignments 
SET text_content = 'This is a sample text submission for the Mobile App Development assignment. It includes details about the app architecture, user interface design, and implementation strategy.'
WHERE student_name = 'James Wilson'; 