// Terraform Quiz Application
let questions = [];
let currentQuiz = [];
let currentQuestionIndex = 0;
let answers = [];
let startTime = null;
let timer = null;

// DOM elements
let introCard, quizCard, resultCard, btnStart, btnSample, btnPrev, btnNext, btnSubmit, btnRetry, btnPracticeWrong, btnReview, btnLoadErrors, btnExport, btnReset, countInput, shuffleChoices, showExplain, qContainer, progressInner, progressLabel, liveTimer, resultSummary, timeTaken, questionCountLabel, modeLabel, fileInput;

// Initialize DOM elements
function initializeElements() {
    console.log('Initializing DOM elements...');
    
    introCard = document.getElementById('introCard');
    quizCard = document.getElementById('quizCard');
    resultCard = document.getElementById('resultCard');
    btnStart = document.getElementById('btnStart');
    btnSample = document.getElementById('btnSample');
    btnPrev = document.getElementById('btnPrev');
    btnNext = document.getElementById('btnNext');
    btnSubmit = document.getElementById('btnSubmit');
    btnRetry = document.getElementById('btnRetry');
    btnPracticeWrong = document.getElementById('btnPracticeWrong');
    btnReview = document.getElementById('btnReview');
    btnLoadErrors = document.getElementById('btnLoadErrors');
    btnExport = document.getElementById('btnExport');
    btnReset = document.getElementById('btnReset');
    countInput = document.getElementById('countInput');
    shuffleChoices = document.getElementById('shuffleChoices');
    showExplain = document.getElementById('showExplain');
    qContainer = document.getElementById('qContainer');
    progressInner = document.getElementById('progressInner');
    progressLabel = document.getElementById('progressLabel');
    liveTimer = document.getElementById('liveTimer');
    resultSummary = document.getElementById('resultSummary');
    timeTaken = document.getElementById('timeTaken');
    questionCountLabel = document.getElementById('questionCountLabel');
    modeLabel = document.getElementById('modeLabel');
    fileInput = document.getElementById('fileInput');
    
    console.log('DOM elements initialized:', {
        introCard: !!introCard,
        quizCard: !!quizCard,
        resultCard: !!resultCard,
        btnStart: !!btnStart,
        qContainer: !!qContainer
    });
    
    // Add event listeners
    if (btnStart) {
        btnStart.addEventListener('click', startQuiz);
        console.log('Start button event listener added');
    } else {
        console.error('Start button not found!');
    }
    
    if (btnSample) btnSample.addEventListener('click', loadSample);
    if (btnPrev) btnPrev.addEventListener('click', previousQuestion);
    if (btnNext) btnNext.addEventListener('click', nextQuestion);
    if (btnSubmit) btnSubmit.addEventListener('click', submitQuiz);
    if (btnRetry) btnRetry.addEventListener('click', resetQuiz);
    if (btnPracticeWrong) btnPracticeWrong.addEventListener('click', practiceWrong);
    if (btnReview) btnReview.addEventListener('click', reviewQuiz);
    if (btnLoadErrors) btnLoadErrors.addEventListener('click', loadErrors);
    if (btnExport) btnExport.addEventListener('click', exportQuestions);
    if (btnReset) btnReset.addEventListener('click', resetAll);
    if (fileInput) fileInput.addEventListener('change', handleFileUpload);
}

// Load questions on page load
window.addEventListener('load', async () => {
    console.log('Page loaded, initializing...');
    
    // Wait a bit to ensure DOM is fully ready
    setTimeout(async () => {
        try {
            initializeElements();
            
            const response = await fetch('questions.json');
            questions = await response.json();
            console.log('Questions loaded:', questions.length);
            
            if (questionCountLabel) {
                questionCountLabel.textContent = questions.length;
            }
            if (btnLoadErrors) {
                btnLoadErrors.disabled = true;
            }
        } catch (error) {
            console.error('Error loading questions:', error);
            alert('Failed to load questions. Please check if questions.json exists.');
        }
    }, 100);
});

function startQuiz() {
    const count = parseInt(countInput.value);
    if (count < 5 || count > 40) {
        alert('Please select between 5 and 40 questions.');
        return;
    }
    
    // Create quiz from questions
    currentQuiz = [...questions];
    if (shuffleChoices.checked) {
        currentQuiz = shuffleArray(currentQuiz);
    }
    currentQuiz = currentQuiz.slice(0, count);
    
    // Initialize quiz state
    currentQuestionIndex = 0;
    answers = new Array(currentQuiz.length).fill(null);
    startTime = Date.now();
    
    // Start timer
    startTimer();
    
    // Show quiz
    introCard.classList.add('hidden');
    quizCard.classList.remove('hidden');
    resultCard.classList.add('hidden');
    
    showQuestion();
}

function loadSample() {
    countInput.value = 10;
    startQuiz();
}

function showQuestion() {
    const question = currentQuiz[currentQuestionIndex];
    const questionNumber = currentQuestionIndex + 1;
    
    // Create question HTML
    let choicesHtml = '';
    const choices = [...question.choices];
    
    if (shuffleChoices.checked) {
        shuffleArray(choices);
    }
    
    choices.forEach((choice, index) => {
        const isSelected = answers[currentQuestionIndex] === index;
        choicesHtml += `
            <label class="choice ${isSelected ? 'selected' : ''}">
                <input type="radio" name="q${currentQuestionIndex}" value="${index}" 
                       ${isSelected ? 'checked' : ''} onchange="selectAnswer(${index})">
                <span>${choice}</span>
            </label>
        `;
    });
    
    qContainer.innerHTML = `
        <div class="question">
            <h3>Question ${questionNumber} of ${currentQuiz.length}</h3>
            <p>${question.q}</p>
            <div class="choices">
                ${choicesHtml}
            </div>
        </div>
    `;
    
    // Update progress
    updateProgress();
    
    // Update navigation buttons
    btnPrev.disabled = currentQuestionIndex === 0;
    btnNext.disabled = currentQuestionIndex === currentQuiz.length - 1;
}

function selectAnswer(choiceIndex) {
    answers[currentQuestionIndex] = choiceIndex;
    
    // Update choice styling
    const choices = qContainer.querySelectorAll('.choice');
    choices.forEach((choice, index) => {
        choice.classList.toggle('selected', index === choiceIndex);
    });
    
    updateProgress();
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
}

function nextQuestion() {
    if (currentQuestionIndex < currentQuiz.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    }
}

function updateProgress() {
    const answered = answers.filter(answer => answer !== null).length;
    const total = currentQuiz.length;
    const percentage = (answered / total) * 100;
    
    progressInner.style.width = `${percentage}%`;
    progressLabel.textContent = `${answered} / ${total}`;
}

function startTimer() {
    timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        liveTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function submitQuiz() {
    clearInterval(timer);
    
    const answered = answers.filter(answer => answer !== null).length;
    if (answered < currentQuiz.length) {
        if (!confirm(`You have ${currentQuiz.length - answered} unanswered questions. Submit anyway?`)) {
            return;
        }
    }
    
    // Calculate results
    let correct = 0;
    let wrong = [];
    
    currentQuiz.forEach((question, index) => {
        if (answers[index] === question.answer) {
            correct++;
        } else if (answers[index] !== null) {
            wrong.push(index);
        }
    });
    
    const percentage = Math.round((correct / currentQuiz.length) * 100);
    const timeElapsed = Date.now() - startTime;
    const minutes = Math.floor(timeElapsed / 60000);
    const seconds = Math.floor((timeElapsed % 60000) / 1000);
    
    // Show results
    showResults(correct, currentQuiz.length, percentage, wrong, timeElapsed);
    
    // Store wrong answers for practice
    if (wrong.length > 0) {
        btnLoadErrors.disabled = false;
        localStorage.setItem('wrongAnswers', JSON.stringify(wrong.map(i => currentQuiz[i])));
    }
}

function showResults(correct, total, percentage, wrong, timeElapsed) {
    const minutes = Math.floor(timeElapsed / 60000);
    const seconds = Math.floor((timeElapsed % 60000) / 1000);
    
    resultSummary.innerHTML = `
        <h2>Quiz Complete!</h2>
        <div class="score">
            <div class="score-circle ${percentage >= 70 ? 'pass' : 'fail'}">
                <span class="percentage">${percentage}%</span>
                <span class="label">${percentage >= 70 ? 'PASS' : 'FAIL'}</span>
            </div>
            <div class="score-details">
                <p><strong>Correct:</strong> ${correct} / ${total}</p>
                <p><strong>Wrong:</strong> ${total - correct}</p>
                <p><strong>Unanswered:</strong> ${total - answers.filter(a => a !== null).length}</p>
            </div>
        </div>
        ${wrong.length > 0 ? `<p><strong>Questions to review:</strong> ${wrong.length}</p>` : ''}
    `;
    
    timeTaken.textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Enable/disable buttons
    btnPracticeWrong.disabled = wrong.length === 0;
    
    // Show results
    quizCard.classList.add('hidden');
    resultCard.classList.remove('hidden');
}

function resetQuiz() {
    introCard.classList.remove('hidden');
    quizCard.classList.add('hidden');
    resultCard.classList.add('hidden');
    
    // Reset state
    currentQuiz = [];
    currentQuestionIndex = 0;
    answers = [];
    startTime = null;
    clearInterval(timer);
    liveTimer.textContent = '00:00';
}

function practiceWrong() {
    const wrongQuestions = JSON.parse(localStorage.getItem('wrongAnswers') || '[]');
    if (wrongQuestions.length === 0) {
        alert('No wrong answers to practice!');
        return;
    }
    
    currentQuiz = wrongQuestions;
    currentQuestionIndex = 0;
    answers = new Array(currentQuiz.length).fill(null);
    startTime = Date.now();
    
    startTimer();
    
    introCard.classList.add('hidden');
    quizCard.classList.remove('hidden');
    resultCard.classList.add('hidden');
    
    modeLabel.textContent = 'Mode: Practice Errors';
    showQuestion();
}

function reviewQuiz() {
    let reviewHtml = '<h2>Quiz Review</h2>';
    
    currentQuiz.forEach((question, index) => {
        const userAnswer = answers[index];
        const isCorrect = userAnswer === question.answer;
        const userChoice = userAnswer !== null ? question.choices[userAnswer] : 'Not answered';
        const correctChoice = question.choices[question.answer];
        
        reviewHtml += `
            <div class="review-question ${isCorrect ? 'correct' : 'incorrect'}">
                <h3>Question ${index + 1}</h3>
                <p><strong>Question:</strong> ${question.q}</p>
                <p><strong>Your answer:</strong> ${userChoice}</p>
                <p><strong>Correct answer:</strong> ${correctChoice}</p>
                ${showExplain.checked ? `<p><strong>Explanation:</strong> ${question.explain}</p>` : ''}
            </div>
        `;
    });
    
    resultSummary.innerHTML = reviewHtml;
}

function loadErrors() {
    const wrongAnswers = localStorage.getItem('wrongAnswers');
    if (wrongAnswers) {
        const questions = JSON.parse(wrongAnswers);
        if (questions.length > 0) {
            countInput.value = questions.length;
            startQuiz();
        }
    }
}

function exportQuestions() {
    const dataStr = JSON.stringify(questions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'terraform-questions.json';
    link.click();
    URL.revokeObjectURL(url);
}

function resetAll() {
    if (confirm('This will reset all progress and wrong answers. Continue?')) {
        localStorage.removeItem('wrongAnswers');
        btnLoadErrors.disabled = true;
        resetQuiz();
    }
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const newQuestions = JSON.parse(e.target.result);
                if (Array.isArray(newQuestions) && newQuestions.length > 0) {
                    questions = newQuestions;
                    questionCountLabel.textContent = questions.length;
                    alert(`Loaded ${questions.length} questions from file.`);
                } else {
                    alert('Invalid questions file format.');
                }
            } catch (error) {
                alert('Error parsing questions file.');
            }
        };
        reader.readAsText(file);
    }
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}