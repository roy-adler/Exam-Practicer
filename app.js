// Terraform Quiz Application
class QuizApp {
    constructor() {
        this.questions = [];
        this.currentQuiz = [];
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.startTime = null;
        this.timer = null;
        this.isInitialized = false;
        
        // Constants
        this.MIN_QUESTIONS = 5;
        this.MAX_QUESTIONS = 40;
        this.PASS_THRESHOLD = 70;
        this.TIMER_INTERVAL = 1000;
        
        // DOM elements cache
        this.elements = {};
        
        // Bind methods to preserve context
        this.handleStartQuiz = this.handleStartQuiz.bind(this);
        this.handleSample = this.handleSample.bind(this);
        this.handlePrev = this.handlePrev.bind(this);
        this.handleNext = this.handleNext.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleRetry = this.handleRetry.bind(this);
        this.handlePracticeWrong = this.handlePracticeWrong.bind(this);
        this.handleReview = this.handleReview.bind(this);
        this.handleLoadErrors = this.handleLoadErrors.bind(this);
        this.handleExport = this.handleExport.bind(this);
        this.handleReset = this.handleReset.bind(this);
        this.handleFileUpload = this.handleFileUpload.bind(this);
        this.handleChoiceChange = this.handleChoiceChange.bind(this);
        
        this.init();
    }
    
    async init() {
        try {
            console.log('Initializing Quiz Application...');
            this.initializeElements();
            this.attachEventListeners();
            await this.loadQuestions();
            this.isInitialized = true;
            console.log('Application fully initialized!');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }
    
    initializeElements() {
        const elementIds = [
            'introCard', 'quizCard', 'resultCard', 'btnStart', 'btnSample',
            'btnPrev', 'btnNext', 'btnSubmit', 'btnRetry', 'btnPracticeWrong',
            'btnReview', 'btnLoadErrors', 'btnExport', 'btnReset', 'countInput',
            'shuffleChoices', 'showExplain', 'qContainer', 'progressInner',
            'progressLabel', 'liveTimer', 'resultSummary', 'timeTaken',
            'questionCountLabel', 'modeLabel', 'fileInput'
        ];
        
        elementIds.forEach(id => {
            const element = document.getElementById(id);
            if (!element) {
                console.warn(`Element with id '${id}' not found`);
                return;
            }
            this.elements[id] = element;
        });
        
        // Validate critical elements
        const criticalElements = ['introCard', 'quizCard', 'resultCard', 'qContainer'];
        const missingElements = criticalElements.filter(id => !this.elements[id]);
        if (missingElements.length > 0) {
            throw new Error(`Critical elements missing: ${missingElements.join(', ')}`);
        }
    }
    
    attachEventListeners() {
        const eventMap = {
            'btnStart': this.handleStartQuiz,
            'btnSample': this.handleSample,
            'btnPrev': this.handlePrev,
            'btnNext': this.handleNext,
            'btnSubmit': this.handleSubmit,
            'btnRetry': this.handleRetry,
            'btnPracticeWrong': this.handlePracticeWrong,
            'btnReview': this.handleReview,
            'btnLoadErrors': this.handleLoadErrors,
            'btnExport': this.handleExport,
            'btnReset': this.handleReset,
            'fileInput': this.handleFileUpload
        };
        
        Object.entries(eventMap).forEach(([elementId, handler]) => {
            const element = this.elements[elementId];
            if (element) {
                element.addEventListener('click', handler);
                console.log(`Event listener added for ${elementId}`);
            }
        });
        
        // Special handling for file input
        if (this.elements.fileInput) {
            this.elements.fileInput.addEventListener('change', this.handleFileUpload);
        }
    }
    
    async loadQuestions() {
        try {
            const response = await fetch('questions.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            this.questions = await response.json();
            
            if (!Array.isArray(this.questions) || this.questions.length === 0) {
                throw new Error('Invalid questions format or empty questions array');
            }
            
            console.log(`Questions loaded: ${this.questions.length}`);
            
            // Update UI
            if (this.elements.questionCountLabel) {
                this.elements.questionCountLabel.textContent = this.questions.length;
            }
            if (this.elements.btnLoadErrors) {
                this.elements.btnLoadErrors.disabled = true;
            }
            
        } catch (error) {
            console.error('Error loading questions:', error);
            throw new Error('Failed to load questions. Please check if questions.json exists and is valid.');
        }
    }
    
    handleStartQuiz() {
        try {
            const count = this.validateQuestionCount();
            if (count === null) return;
            
            this.startQuiz(count);
        } catch (error) {
            console.error('Error starting quiz:', error);
            this.showError('Failed to start quiz. Please try again.');
        }
    }
    
    validateQuestionCount() {
        const count = parseInt(this.elements.countInput.value);
        if (isNaN(count) || count < this.MIN_QUESTIONS || count > this.MAX_QUESTIONS) {
            this.showError(`Please select between ${this.MIN_QUESTIONS} and ${this.MAX_QUESTIONS} questions.`);
            return null;
        }
        return count;
    }
    
    startQuiz(count) {
        // Clean up any existing state
        this.cleanup();
        
        // Create quiz from questions
        this.currentQuiz = [...this.questions];
        if (this.elements.shuffleChoices.checked) {
            this.currentQuiz = this.shuffleArray(this.currentQuiz);
        }
        this.currentQuiz = this.currentQuiz.slice(0, count);
        
        // Initialize quiz state
        this.currentQuestionIndex = 0;
        this.answers = new Array(this.currentQuiz.length).fill(null);
        this.startTime = Date.now();
        
        // Start timer
        this.startTimer();
        
        // Show quiz
        this.showCard('quizCard');
        this.showQuestion();
    }
    
    handleSample() {
        if (this.elements.countInput) {
            this.elements.countInput.value = 10;
        }
        this.handleStartQuiz();
    }
    
    showQuestion() {
        if (!this.currentQuiz.length || this.currentQuestionIndex >= this.currentQuiz.length) {
            console.error('Invalid question index or quiz state');
            return;
        }
        
        const question = this.currentQuiz[this.currentQuestionIndex];
        const questionNumber = this.currentQuestionIndex + 1;
        
        // Create question HTML
        const choicesHtml = this.createChoicesHTML(question);
        
        this.elements.qContainer.innerHTML = `
            <div class="question">
                <h3>Question ${questionNumber} of ${this.currentQuiz.length}</h3>
                <p>${this.escapeHtml(question.q)}</p>
                <div class="choices">
                    ${choicesHtml}
                </div>
            </div>
        `;
        
        // Update progress and navigation
        this.updateProgress();
        this.updateNavigationButtons();
        
        // Add event listeners to choices
        this.attachChoiceEventListeners();
    }
    
    createChoicesHTML(question) {
        const choices = [...question.choices];
        if (this.elements.shuffleChoices.checked) {
            this.shuffleArray(choices);
        }
        
        return choices.map((choice, index) => {
            const isSelected = this.answers[this.currentQuestionIndex] === index;
            return `
                <label class="choice ${isSelected ? 'selected' : ''}">
                    <input type="radio" name="q${this.currentQuestionIndex}" value="${index}" 
                           ${isSelected ? 'checked' : ''} data-choice-index="${index}">
                    <span>${this.escapeHtml(choice)}</span>
                </label>
            `;
        }).join('');
    }
    
    attachChoiceEventListeners() {
        const choices = this.elements.qContainer.querySelectorAll('.choice input[type="radio"]');
        choices.forEach(choice => {
            choice.addEventListener('change', this.handleChoiceChange);
        });
    }
    
    handleChoiceChange(event) {
        const choiceIndex = parseInt(event.target.dataset.choiceIndex);
        this.selectAnswer(choiceIndex);
    }
    
    selectAnswer(choiceIndex) {
        this.answers[this.currentQuestionIndex] = choiceIndex;
        
        // Update choice styling
        const choices = this.elements.qContainer.querySelectorAll('.choice');
        choices.forEach((choice, index) => {
            choice.classList.toggle('selected', index === choiceIndex);
        });
        
        this.updateProgress();
    }
    
    handlePrev() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.showQuestion();
        }
    }
    
    handleNext() {
        if (this.currentQuestionIndex < this.currentQuiz.length - 1) {
            this.currentQuestionIndex++;
            this.showQuestion();
        }
    }
    
    updateProgress() {
        if (!this.elements.progressInner || !this.elements.progressLabel) return;
        
        const answered = this.answers.filter(answer => answer !== null).length;
        const total = this.currentQuiz.length;
        const percentage = (answered / total) * 100;
        
        this.elements.progressInner.style.width = `${percentage}%`;
        this.elements.progressLabel.textContent = `${answered} / ${total}`;
    }
    
    updateNavigationButtons() {
        if (this.elements.btnPrev) {
            this.elements.btnPrev.disabled = this.currentQuestionIndex === 0;
        }
        if (this.elements.btnNext) {
            this.elements.btnNext.disabled = this.currentQuestionIndex === this.currentQuiz.length - 1;
        }
    }
    
    startTimer() {
        this.stopTimer(); // Clear any existing timer
        
        this.timer = setInterval(() => {
            if (!this.startTime) return;
            
            const elapsed = Date.now() - this.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            
            if (this.elements.liveTimer) {
                this.elements.liveTimer.textContent = 
                    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, this.TIMER_INTERVAL);
    }
    
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    handleSubmit() {
        try {
            this.stopTimer();
            
            const answered = this.answers.filter(answer => answer !== null).length;
            if (answered < this.currentQuiz.length) {
                if (!confirm(`You have ${this.currentQuiz.length - answered} unanswered questions. Submit anyway?`)) {
                    this.startTimer(); // Restart timer if user cancels
                    return;
                }
            }
            
            this.calculateAndShowResults();
            
        } catch (error) {
            console.error('Error submitting quiz:', error);
            this.showError('Failed to submit quiz. Please try again.');
        }
    }
    
    calculateAndShowResults() {
        let correct = 0;
        let wrong = [];
        
        this.currentQuiz.forEach((question, index) => {
            if (this.answers[index] === question.answer) {
                correct++;
            } else if (this.answers[index] !== null) {
                wrong.push(index);
            }
        });
        
        const percentage = Math.round((correct / this.currentQuiz.length) * 100);
        const timeElapsed = Date.now() - this.startTime;
        
        this.showResults(correct, this.currentQuiz.length, percentage, wrong, timeElapsed);
        
        // Store wrong answers for practice
        if (wrong.length > 0) {
            this.storeWrongAnswers(wrong);
        }
    }
    
    storeWrongAnswers(wrong) {
        if (this.elements.btnLoadErrors) {
            this.elements.btnLoadErrors.disabled = false;
        }
        
        try {
            const wrongQuestions = wrong.map(i => this.currentQuiz[i]);
            localStorage.setItem('wrongAnswers', JSON.stringify(wrongQuestions));
        } catch (error) {
            console.warn('Failed to store wrong answers in localStorage:', error);
        }
    }
    
    showResults(correct, total, percentage, wrong, timeElapsed) {
        const minutes = Math.floor(timeElapsed / 60000);
        const seconds = Math.floor((timeElapsed % 60000) / 1000);
        
        if (this.elements.resultSummary) {
            this.elements.resultSummary.innerHTML = `
                <h2>Quiz Complete!</h2>
                <div class="score">
                    <div class="score-circle ${percentage >= this.PASS_THRESHOLD ? 'pass' : 'fail'}">
                        <span class="percentage">${percentage}%</span>
                        <span class="label">${percentage >= this.PASS_THRESHOLD ? 'PASS' : 'FAIL'}</span>
                    </div>
                    <div class="score-details">
                        <p><strong>Correct:</strong> ${correct} / ${total}</p>
                        <p><strong>Wrong:</strong> ${total - correct}</p>
                        <p><strong>Unanswered:</strong> ${total - this.answers.filter(a => a !== null).length}</p>
                    </div>
                </div>
                ${wrong.length > 0 ? `<p><strong>Questions to review:</strong> ${wrong.length}</p>` : ''}
            `;
        }
        
        if (this.elements.timeTaken) {
            this.elements.timeTaken.textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        // Enable/disable buttons
        if (this.elements.btnPracticeWrong) {
            this.elements.btnPracticeWrong.disabled = wrong.length === 0;
        }
        
        // Show results
        this.showCard('resultCard');
    }
    
    handleRetry() {
        this.resetQuiz();
    }
    
    resetQuiz() {
        this.showCard('introCard');
        this.cleanup();
        
        // Reset timer display
        if (this.elements.liveTimer) {
            this.elements.liveTimer.textContent = '00:00';
        }
        
        // Reset mode label
        if (this.elements.modeLabel) {
            this.elements.modeLabel.textContent = 'Mode: Quiz';
        }
    }
    
    handlePracticeWrong() {
        try {
            const wrongQuestions = this.loadWrongAnswers();
            if (wrongQuestions.length === 0) {
                this.showError('No wrong answers to practice!');
                return;
            }
            
            this.startPracticeMode(wrongQuestions);
            
        } catch (error) {
            console.error('Error starting practice mode:', error);
            this.showError('Failed to start practice mode. Please try again.');
        }
    }
    
    loadWrongAnswers() {
        try {
            const wrongAnswers = localStorage.getItem('wrongAnswers');
            return wrongAnswers ? JSON.parse(wrongAnswers) : [];
        } catch (error) {
            console.warn('Failed to load wrong answers from localStorage:', error);
            return [];
        }
    }
    
    startPracticeMode(wrongQuestions) {
        this.cleanup();
        
        this.currentQuiz = wrongQuestions;
        this.currentQuestionIndex = 0;
        this.answers = new Array(this.currentQuiz.length).fill(null);
        this.startTime = Date.now();
        
        this.startTimer();
        this.showCard('quizCard');
        
        if (this.elements.modeLabel) {
            this.elements.modeLabel.textContent = 'Mode: Practice Errors';
        }
        
        this.showQuestion();
    }
    
    handleReview() {
        if (!this.elements.resultSummary) return;
        
        let reviewHtml = '<h2>Quiz Review</h2>';
        
        this.currentQuiz.forEach((question, index) => {
            const userAnswer = this.answers[index];
            const isCorrect = userAnswer === question.answer;
            const userChoice = userAnswer !== null ? question.choices[userAnswer] : 'Not answered';
            const correctChoice = question.choices[question.answer];
            
            reviewHtml += `
                <div class="review-question ${isCorrect ? 'correct' : 'incorrect'}">
                    <h3>Question ${index + 1}</h3>
                    <p><strong>Question:</strong> ${this.escapeHtml(question.q)}</p>
                    <p><strong>Your answer:</strong> ${this.escapeHtml(userChoice)}</p>
                    <p><strong>Correct answer:</strong> ${this.escapeHtml(correctChoice)}</p>
                    ${this.elements.showExplain?.checked ? `<p><strong>Explanation:</strong> ${this.escapeHtml(question.explain || 'No explanation available')}</p>` : ''}
                </div>
            `;
        });
        
        this.elements.resultSummary.innerHTML = reviewHtml;
    }
    
    handleLoadErrors() {
        try {
            const wrongAnswers = this.loadWrongAnswers();
            if (wrongAnswers.length > 0) {
                if (this.elements.countInput) {
                    this.elements.countInput.value = wrongAnswers.length;
                }
                this.handleStartQuiz();
            }
        } catch (error) {
            console.error('Error loading errors:', error);
            this.showError('Failed to load error questions. Please try again.');
        }
    }
    
    handleExport() {
        try {
            const dataStr = JSON.stringify(this.questions, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = 'terraform-questions.json';
            link.click();
            
            // Clean up URL object to prevent memory leaks
            setTimeout(() => URL.revokeObjectURL(url), 100);
            
        } catch (error) {
            console.error('Error exporting questions:', error);
            this.showError('Failed to export questions. Please try again.');
        }
    }
    
    handleReset() {
        if (confirm('This will reset all progress and wrong answers. Continue?')) {
            try {
                localStorage.removeItem('wrongAnswers');
                if (this.elements.btnLoadErrors) {
                    this.elements.btnLoadErrors.disabled = true;
                }
                this.resetQuiz();
            } catch (error) {
                console.error('Error resetting application:', error);
                this.showError('Failed to reset application. Please try again.');
            }
        }
    }
    
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate file
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            this.showError('File too large. Please select a file smaller than 5MB.');
            return;
        }
        
        if (!file.name.toLowerCase().endsWith('.json')) {
            this.showError('Please select a valid JSON file.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const newQuestions = JSON.parse(e.target.result);
                if (Array.isArray(newQuestions) && newQuestions.length > 0) {
                    this.questions = newQuestions;
                    if (this.elements.questionCountLabel) {
                        this.elements.questionCountLabel.textContent = this.questions.length;
                    }
                    this.showSuccess(`Loaded ${this.questions.length} questions from file.`);
                } else {
                    this.showError('Invalid questions file format.');
                }
            } catch (error) {
                console.error('Error parsing questions file:', error);
                this.showError('Error parsing questions file. Please check the file format.');
            }
        };
        
        reader.onerror = () => {
            this.showError('Error reading file. Please try again.');
        };
        
        reader.readAsText(file);
        
        // Reset file input
        event.target.value = '';
    }
    
    showCard(cardId) {
        const cards = ['introCard', 'quizCard', 'resultCard'];
        cards.forEach(id => {
            if (this.elements[id]) {
                this.elements[id].classList.toggle('hidden', id !== cardId);
            }
        });
    }
    
    cleanup() {
        // Stop timer
        this.stopTimer();
        
        // Clear quiz state
        this.currentQuiz = [];
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.startTime = null;
        
        // Clear question container
        if (this.elements.qContainer) {
            this.elements.qContainer.innerHTML = '';
        }
    }
    
    showError(message) {
        console.error(message);
        alert(message);
    }
    
    showSuccess(message) {
        console.log(message);
        alert(message);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    destroy() {
        this.cleanup();
        this.stopTimer();
        
        // Remove event listeners
        Object.values(this.elements).forEach(element => {
            if (element && element.removeEventListener) {
                // Note: We can't easily remove bound event listeners without storing references
                // This is a limitation of the current approach
            }
        });
        
        this.isInitialized = false;
    }
}

// Initialize application when DOM is ready
let quizApp;
document.addEventListener('DOMContentLoaded', () => {
    try {
        quizApp = new QuizApp();
    } catch (error) {
        console.error('Failed to create quiz application:', error);
        document.body.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Error</h1><p>Failed to initialize the quiz application. Please refresh the page.</p></div>';
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (quizApp) {
        quizApp.destroy();
    }
});