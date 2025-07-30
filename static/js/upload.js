// Upload page functions
async function checkAdminAccess() {
    try {
        const response = await api.getCurrentUser();
        if (!response.data.user.is_admin) {
            showMessage('Admin access required to upload questions', 'error');
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 2000);
        }
    } catch (error) {
        console.error('Access check failed:', error);
        window.location.href = '/login.html';
    }
}

async function handleUpload(event) {
    event.preventDefault();
    
    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];
    
    if (!file) {
        showMessage('Please select a file', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        await api.uploadQuestions(file);
        showMessage('Questions uploaded successfully!', 'success');
        fileInput.value = '';
        setTimeout(() => {
            window.location.href = '/dashboard.html';
        }, 2000);
    } catch (error) {
        console.error('Upload failed:', error);
        showMessage(error.response?.data?.error || 'Upload failed', 'error');
    } finally {
        showLoading(false);
    }
}