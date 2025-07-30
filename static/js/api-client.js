// API Client for QuizXMentor

class QuizAPI {
    async apiCall(endpoint, options = {}) {
        const response = await fetch(`/api${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'API call failed');
        }
        
        return data;
    }

    async register(email, password) {
        return this.apiCall('/register', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async login(email, password) {
        return this.apiCall('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async logout() {
        return this.apiCall('/logout', { method: 'POST' });
    }

    async getCurrentUser() {
        const result = await this.apiCall('/user');
        return { data: result };
    }

    async uploadQuestions(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            const errorObj = new Error(error.error || 'Upload failed');
            errorObj.response = { data: error };
            throw errorObj;
        }
        
        return { data: await response.json() };
    }

    async getQuestions() {
        return this.apiCall('/questions');
    }

    async getQuestionCount() {
        const result = await this.apiCall('/questions/count');
        return { data: result };
    }

    async submitQuiz(answers) {
        return this.apiCall('/quiz/submit', {
            method: 'POST',
            body: JSON.stringify({ answers })
        });
    }

    async getDashboard() {
        const result = await this.apiCall('/dashboard');
        return { data: result };
    }
}

const api = new QuizAPI();

// Authentication Functions
async function handleRegister(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;

    try {
        await api.register(email, password);
        showMessage('Registration successful! Please login.', 'success');
        setTimeout(() => window.location.href = '/login.html', 1500);
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;

    try {
        await api.login(email, password);
        showMessage('Login successful!', 'success');
        setTimeout(() => window.location.href = '/dashboard.html', 1500);
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

async function handleLogout() {
    try {
        await api.logout();
        showMessage('Logout successful!', 'success');
        setTimeout(() => window.location.href = '/index.html', 1500);
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Dashboard Functions
async function loadDashboard() {
    try {
        const data = await api.getDashboard();
        const userEmailEl = document.getElementById('userEmail');
        if (userEmailEl) userEmailEl.textContent = data.user.email;
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Upload Functions
async function handleUpload(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    showLoading(true);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Upload failed');
        }
        
        showMessage('Questions uploaded successfully! Redirecting to quiz confirmation...', 'success');
        setTimeout(() => window.location.href = '/quiz-confirm.html', 1500);
    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Proceed to quiz with existing questions
async function proceedToQuiz() {
    try {
        const count = await api.getQuestionCount();
        if (count.count === 0) {
            showMessage('No questions found. Please upload questions first.', 'error');
            return;
        }
        
        showMessage('Proceeding to quiz...', 'success');
        setTimeout(() => window.location.href = '/quiz.html', 1000);
    } catch (error) {
        showMessage('Please upload questions first.', 'error');
    }
}

// Quiz Functions
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = {};

// Always redirect to upload page first
async function checkAndStartQuiz() {
    showMessage('Please upload questions to start a new quiz.', 'error');
    setTimeout(() => window.location.href = '/upload.html', 1500);
}

// Start quiz on quiz page
async function startQuiz() {
    try {
        const count = await api.getQuestionCount();
        if (count.count === 0) {
            showMessage('No questions available. Please upload questions first.', 'error');
            setTimeout(() => window.location.href = '/upload.html', 2000);
            return;
        }
        
        const data = await api.getQuestions();
        currentQuestions = data.questions;
        currentQuestionIndex = 0;
        userAnswers = {};
        
        displayQuestion();
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

function displayQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        submitQuiz();
        return;
    }

    const question = currentQuestions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === currentQuestions.length - 1;
    
    const questionHTML = `
        <div class="question-container">
            <h3>Question ${currentQuestionIndex + 1} of ${currentQuestions.length}</h3>
            <p>${question.question}</p>
            <div class="options">
                <label><input type="radio" name="answer" value="A"> ${question.option_a}</label>
                <label><input type="radio" name="answer" value="B"> ${question.option_b}</label>
                <label><input type="radio" name="answer" value="C"> ${question.option_c}</label>
                <label><input type="radio" name="answer" value="D"> ${question.option_d}</label>
            </div>
            <div class="navigation">
                <button onclick="previousQuestion()" class="nav-btn-large" ${currentQuestionIndex === 0 ? 'disabled' : ''}>Previous</button>
                ${isLastQuestion ? 
                    '<button onclick="confirmSubmit()" class="nav-btn-large submit-btn">Submit Quiz</button>' : 
                    '<button onclick="nextQuestion()" class="nav-btn-large">Next</button>'
                }
            </div>
        </div>
    `;
    
    document.getElementById('quizContainer').innerHTML = questionHTML;
    
    if (userAnswers[question.id]) {
        document.querySelector(`input[value="${userAnswers[question.id]}"]`).checked = true;
    }
}

function nextQuestion() {
    saveCurrentAnswer();
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        confirmSubmit();
    }
}

function previousQuestion() {
    saveCurrentAnswer();
    currentQuestionIndex--;
    displayQuestion();
}

function saveCurrentAnswer() {
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    if (selectedOption) {
        const questionId = currentQuestions[currentQuestionIndex].id;
        userAnswers[questionId] = selectedOption.value;
    }
}

function confirmSubmit() {
    saveCurrentAnswer();
    submitQuiz();
}

async function submitQuiz() {
    showLoading(true);
    
    try {
        const result = await api.submitQuiz(userAnswers);
        showLoading(false);
        localStorage.setItem('quizResults', JSON.stringify(result));
        window.location.href = `/result.html?score=${result.score}&total=${result.total}&percentage=${result.percentage}`;
    } catch (error) {
        showLoading(false);
        showMessage(error.message, 'error');
    }
}

// Results Functions
function loadResults() {
    const urlParams = new URLSearchParams(window.location.search);
    const score = parseInt(urlParams.get('score')) || 0;
    const total = parseInt(urlParams.get('total')) || 0;
    const percentage = parseFloat(urlParams.get('percentage')) || 0;
    const incorrect = total - score;
    
    document.getElementById('score').textContent = score;
    document.getElementById('total').textContent = total;
    document.getElementById('percentage').textContent = percentage;
    document.getElementById('incorrect').textContent = incorrect;
    

}



// Utility Functions - now using common.js
// showMessage function moved to common.js

async function checkAuth() {
    try {
        await api.getCurrentUser();
    } catch (error) {
        window.location.href = '/login.html';
    }
}

// Timer variables
let quizTimer;
let timeLeft = 30;
let questionTimers = {}; // Store remaining time for each question

// Load quiz confirmation
async function loadQuizConfirmation() {
    try {
        const count = await api.getQuestionCount();
        if (count.count === 0) {
            showMessage('No questions available. Please upload questions first.', 'error');
            setTimeout(() => window.location.href = '/upload.html', 2000);
            return;
        }
        
        // Check if elements exist before setting textContent
        const totalQuestionsEl = document.getElementById('totalQuestions');
        const totalTimeEl = document.getElementById('totalTime');
        
        if (totalQuestionsEl) totalQuestionsEl.textContent = count.count;
        if (totalTimeEl) totalTimeEl.textContent = Math.ceil((count.count * 30) / 60);
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

function startQuizFromConfirmation() {
    window.location.href = '/quiz.html';
}

async function startQuizWithTimer() {
    try {
        const count = await api.getQuestionCount();
        if (count.count === 0) {
            showMessage('No questions available. Please upload questions first.', 'error');
            setTimeout(() => window.location.href = '/upload.html', 2000);
            return;
        }
        
        const data = await api.getQuestions();
        currentQuestions = data.questions;
        currentQuestionIndex = 0;
        userAnswers = {};
        questionTimers = {}; // Reset question timers
        
        displayQuestionWithTimer();
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

function displayQuestionWithTimer() {
    if (currentQuestionIndex >= currentQuestions.length) {
        submitQuiz();
        return;
    }

    const question = currentQuestions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === currentQuestions.length - 1;
    
    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    
    const questionHTML = `
        <div class="question-container">
            <h3>Question ${currentQuestionIndex + 1} of ${currentQuestions.length}</h3>
            <p>${question.question}</p>
            <div class="options">
                <label><input type="radio" name="answer" value="A" onchange="saveCurrentAnswer()"> ${question.option_a}</label>
                <label><input type="radio" name="answer" value="B" onchange="saveCurrentAnswer()"> ${question.option_b}</label>
                <label><input type="radio" name="answer" value="C" onchange="saveCurrentAnswer()"> ${question.option_c}</label>
                <label><input type="radio" name="answer" value="D" onchange="saveCurrentAnswer()"> ${question.option_d}</label>
            </div>
            <div class="navigation">
                <button onclick="previousQuestionWithTimer()" class="nav-btn-large" ${currentQuestionIndex === 0 ? 'disabled' : ''}>Previous</button>
                ${isLastQuestion ? 
                    '<button onclick="confirmSubmit()" class="nav-btn-large submit-btn">Submit Quiz</button>' : 
                    '<button onclick="nextQuestionWithTimer()" class="nav-btn-large">Next</button>'
                }
            </div>
        </div>
    `;
    
    document.getElementById('quizContainer').innerHTML = questionHTML;
    
    if (userAnswers[question.id]) {
        document.querySelector(`input[value="${userAnswers[question.id]}"]`).checked = true;
    }
    
    startQuestionTimer();
}

function startQuestionTimer() {
    const questionId = currentQuestions[currentQuestionIndex].id;
    
    // Use stored time or default to 30 seconds
    timeLeft = questionTimers[questionId] || 30;
    const timerElement = document.getElementById('timer');
    
    // Check if timer element exists (only on quiz page)
    if (!timerElement) return;
    
    if (quizTimer) clearInterval(quizTimer);
    
    quizTimer = setInterval(() => {
        timeLeft--;
        questionTimers[questionId] = timeLeft; // Store remaining time
        timerElement.textContent = timeLeft;
        
        if (timeLeft <= 10) {
            timerElement.classList.add('warning');
        } else {
            timerElement.classList.remove('warning');
        }
        
        if (timeLeft <= 0) {
            clearInterval(quizTimer);
            autoAdvanceQuestion();
        }
    }, 1000);
}

function autoAdvanceQuestion() {
    saveCurrentAnswer();
    
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestionWithTimer();
    } else {
        submitQuiz();
    }
}

function nextQuestionWithTimer() {
    const questionId = currentQuestions[currentQuestionIndex].id;
    questionTimers[questionId] = timeLeft; // Save current timer state
    clearInterval(quizTimer);
    saveCurrentAnswer();
    if (currentQuestionIndex < currentQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestionWithTimer();
    }
}

function previousQuestionWithTimer() {
    const questionId = currentQuestions[currentQuestionIndex].id;
    questionTimers[questionId] = timeLeft; // Save current timer state
    clearInterval(quizTimer);
    saveCurrentAnswer();
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestionWithTimer();
    }
}

function confirmQuitQuiz() {
    if (confirm('Are you sure you want to quit the quiz? Your progress will be lost.')) {
        clearInterval(quizTimer);
        window.location.href = '/dashboard.html';
    }
}

// Load answers page
function loadAnswers() {
    const results = JSON.parse(localStorage.getItem('quizResults') || '{}');
    if (results.results) {
        displayQuizAnswers(results.results);
    } else {
        document.getElementById('answersContainer').innerHTML = '<p>No quiz data found. Please take a quiz first.</p>';
    }
}

function displayQuizAnswers(results) {
    const container = document.getElementById('answersContainer');
    let html = '';
    
    results.forEach((result, index) => {
        const statusIcon = result.is_correct ? '✅' : '❌';
        const borderColor = result.is_correct ? '#28a745' : '#dc3545';
        
        html += `
            <div class="question-review" style="background: var(--white); padding: 2rem; margin: 1rem 0; border-radius: 10px; border-left: 4px solid ${borderColor};">
                <h3>${statusIcon} Question ${index + 1}</h3>
                <p style="font-weight: 600; margin: 1rem 0;">${result.question}</p>
                <div style="margin: 1rem 0;">
                    <p><strong>A:</strong> ${result.options.A}</p>
                    <p><strong>B:</strong> ${result.options.B}</p>
                    <p><strong>C:</strong> ${result.options.C}</p>
                    <p><strong>D:</strong> ${result.options.D}</p>
                </div>
                <p><strong>Your Answer:</strong> ${result.selected} - ${result.options[result.selected]}</p>
                <p style="background: var(--light-teal); color: white; padding: 0.5rem 1rem; border-radius: 5px; display: inline-block;"><strong>Correct Answer: ${result.correct}</strong></p>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Clean up timer when leaving page
window.addEventListener('beforeunload', function() {
    if (quizTimer) {
        clearInterval(quizTimer);
    }
});