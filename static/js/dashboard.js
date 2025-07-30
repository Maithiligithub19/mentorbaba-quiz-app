// Dashboard specific functions
async function loadDashboard() {
    try {
        const response = await api.getDashboard();
        const data = response.data;
        
        console.log('Dashboard data:', data); // Debug log
        
        // Update user info
        document.getElementById('userEmail').textContent = data.user.email;
        currentUser = data.user;
        
        // Show admin badge and panel if user is admin
        if (data.user.is_admin) {
            document.getElementById('adminBadge').style.display = 'inline-block';
            document.getElementById('adminPanel').style.display = 'block';
            document.getElementById('regularActions').style.display = 'none';
        }
        
    } catch (error) {
        console.error('Failed to load dashboard:', error);
        showMessage('Failed to load dashboard data', 'error');
    }
}



async function previewQuiz() {
    try {
        const response = await api.getQuestionCount();
        const count = response.data.count;
        
        if (count === 0) {
            showMessage('No questions available. Please upload questions first.', 'error');
            return;
        }
        
        window.location.href = '/quiz-confirm.html';
    } catch (error) {
        console.error('Error checking questions:', error);
        showMessage('Error checking questions', 'error');
    }
}

async function checkAndStartQuiz() {
    try {
        const response = await api.getQuestionCount();
        const count = response.data.count;
        
        if (count === 0) {
            showMessage('No questions available. Please upload questions first.', 'error');
            return;
        }
        
        window.location.href = '/quiz-confirm.html';
    } catch (error) {
        console.error('Error checking questions:', error);
        showMessage('Error checking questions', 'error');
    }
}