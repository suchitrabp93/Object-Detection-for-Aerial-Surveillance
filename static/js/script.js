// Function to handle drag-and-drop
function setupDragAndDrop() {
    const dropArea = document.querySelector('.upload-box');
    
    dropArea.addEventListener('dragover', (event) => {
        event.preventDefault();
        dropArea.classList.add('dragging');
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('dragging');
    });

    dropArea.addEventListener('drop', (event) => {
        event.preventDefault();
        dropArea.classList.remove('dragging');
        
        let files = event.dataTransfer.files;
        if (files.length > 0) {
            document.getElementById('file-input').files = files; // Update the file input
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupDragAndDrop();
});

async function uploadFile(event) {
    event.preventDefault();
    let fileInput = document.getElementById('file-input');
    let formData = new FormData();
    formData.append('file', fileInput.files[0]);

    try {
        let response = await fetch('/predict', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            let blob = await response.blob();
            let url = URL.createObjectURL(blob);
            console.log("Image URL:", url);  // Log the image URL
            let resultImage = document.getElementById('result-image');
            resultImage.src = url;
            let resultContainer = document.getElementById('result-container');
            resultContainer.classList.remove('hidden');  // Show the result container
            document.getElementById('result').textContent = ''; // Clear any previous error message
        } else {
            let error = await response.json();
            console.log("Error:", error);
            document.getElementById('result').textContent = error.error;
            document.getElementById('result-container').classList.add('hidden'); // Hide the result container if there's an error
        }
    } catch (error) {
        console.log("Upload error:", error);
        document.getElementById('result').textContent = 'An error occurred during the upload process.';
        document.getElementById('result-container').classList.add('hidden'); // Hide the result container if there's an error
    }
}
