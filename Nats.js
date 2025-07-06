document.addEventListener('DOMContentLoaded', () => {
    const currentUser = sessionStorage.getItem('loggedInUser');

    // Auth Guard: If no user is logged in, redirect to login page
    if (!currentUser) {
        window.location.href = 'login.html';
        return; // Stop executing script
    }

    const uploadForm = document.getElementById('uploadForm');
    const photoInput = document.getElementById('photoInput');
    const photoGallery = document.getElementById('photoGallery');
    const userInfo = document.getElementById('userInfo');
    const STORAGE_KEY = `natsPhotos_${currentUser}`;

    /**
     * Sets up the user interface for the logged-in user.
     */
    function setupUI() {
        // Display user info and logout button
        userInfo.innerHTML = `
            <svg class="user-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            <span>Welcome, ${currentUser}!</span>
            <button id="logoutButton">Logout</button>
        `;

        // Add event listener for the logout button
        document.getElementById('logoutButton').addEventListener('click', () => {
            sessionStorage.removeItem('loggedInUser');
            window.location.href = 'login.html';
        });
    }

    /**
     * Loads photos from localStorage and displays them in the gallery.
     */
    function loadPhotos() {
        const photos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        photos.forEach(photoData => displayPhoto(photoData));
    }

    /**
     * Creates and appends a photo element to the gallery.
     * @param {string} photoData - The Base64 encoded image data.
     */
    function displayPhoto(photoData) {
        const photoItem = document.createElement('div');
        photoItem.classList.add('photo-item');

        const img = document.createElement('img');
        img.src = photoData;
        img.alt = 'User uploaded photo';

        const exportButton = document.createElement('button');
        exportButton.classList.add('export-btn');
        exportButton.innerHTML = '&#x21E9;'; // Unicode for a downward arrow
        exportButton.title = 'Export to device';

        exportButton.addEventListener('click', (e) => {
            // Prevent other click events on the photo item from firing
            e.stopPropagation();
            const link = document.createElement('a');
            link.href = photoData;
            link.download = `Nats_Photo_${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-btn');
        deleteButton.innerHTML = '&times;'; // A nice 'x' character
        deleteButton.title = 'Delete photo';

        deleteButton.addEventListener('click', () => {
            handleDelete(photoData, photoItem);
        });

        photoItem.appendChild(img);
        photoItem.appendChild(exportButton);
        photoItem.appendChild(deleteButton);
        photoGallery.appendChild(photoItem);
    }

    /**
     * Handles deleting a photo from storage and the view.
     * @param {string} photoDataToDelete The Base64 data of the photo to delete.
     * @param {HTMLElement} photoElement The gallery item element to remove.
     */
    function handleDelete(photoDataToDelete, photoElement) {
        // Ask for confirmation before deleting
        if (!confirm('Are you sure you want to delete this photo?')) {
            return;
        }

        let photos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        const updatedPhotos = photos.filter(p => p !== photoDataToDelete);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPhotos));

        photoElement.remove();
    }

    /**
     * Saves a new photo to localStorage.
     * @param {string} photoData - The Base64 encoded image data.
     */
    function savePhoto(photoData) {
        const photos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        photos.push(photoData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
    }

    /**
     * Handles the form submission for uploading a photo.
     * @param {Event} event - The form submission event.
     */
    function handleUpload(event) {
        event.preventDefault();
        const uploadButton = document.getElementById('uploadButton');
        const buttonText = uploadButton.querySelector('.button-text');
        const spinner = uploadButton.querySelector('.spinner');

        const files = photoInput.files;
        if (files.length === 0) {
            alert('Please select one or more files to upload.');
            return;
        }

        // Show spinner and disable button
        uploadButton.disabled = true;
        buttonText.classList.add('hidden');
        spinner.classList.remove('hidden');

        let filesProcessed = 0;

        // Loop through all selected files
        for (const file of files) {
            // Use FileReader to convert each image to a Base64 string
            const reader = new FileReader();

            reader.onload = function(e) {
                const photoData = e.target.result;
                savePhoto(photoData);
                displayPhoto(photoData);

                filesProcessed++;
                // When all files are processed, hide the spinner and reset the form
                if (filesProcessed === files.length) {
                    uploadButton.disabled = false;
                    buttonText.classList.remove('hidden');
                    spinner.classList.add('hidden');
                    uploadForm.reset();
                }
            };

            reader.readAsDataURL(file);
        }
    }

    // Attach event listener to the form
    uploadForm.addEventListener('submit', handleUpload);

    // Setup the user interface
    setupUI();

    // Initial load of photos from storage
    loadPhotos();
});