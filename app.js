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
        this.MAX_QUESTIONS = 500;
        this.PASS_THRESHOLD = 70;
        this.TIMER_INTERVAL = 1000;

        // Difficulty levels
        this.DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'];

        // Focus areas will be loaded dynamically from the generated focus-areas.json file
        this.FOCUS_AREAS = [];

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
        this.handleBalancedFocusChange = this.handleBalancedFocusChange.bind(this);

        this.init();
    }

    async init() {
        try {
            console.log('Initializing Quiz Application...');
            this.initializeElements();
            this.attachEventListeners();
            await this.loadFocusAreas();
            await this.loadQuestions();
            this.isInitialized = true;
            console.log('Application fully initialized!');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    async loadFocusAreas() {
        try {
            console.log('🔍 Loading focus areas...');
            const response = await fetch('exam-questions/focus-areas.json', { cache: 'no-store' });
            
            if (!response.ok) {
                throw new Error(`Failed to load focus areas: HTTP ${response.status}`);
            }

            const focusAreas = await response.json();
            
            if (!Array.isArray(focusAreas)) {
                throw new Error('Invalid focus areas format - expected array');
            }

            this.FOCUS_AREAS = focusAreas;
            console.log(`✅ Loaded ${focusAreas.length} focus areas:`, focusAreas);
            
        } catch (error) {
            console.warn('⚠️ Failed to load focus areas, using fallback:', error.message);
            // Fallback to extracting focus areas from questions when they're loaded
            this.FOCUS_AREAS = [];
        }
    }

    initializeElements() {
        const elementIds = [
            'introCard', 'quizCard', 'resultCard', 'btnStart', 'btnSample',
            'btnPrev', 'btnNext', 'btnSubmit', 'btnRetry', 'btnPracticeWrong',
            'btnReview', 'btnLoadErrors', 'btnExport', 'btnReset', 'countInput',
            'shuffleChoices', 'showExplain', 'balancedFocus', 'focusInfo', 'availableFocusAreas', 'qContainer', 'progressInner',
            'progressLabel', 'liveTimer', 'resultSummary', 'timeTaken',
            'questionCountLabel', 'modeLabel', 'fileInput', 'loadingIndicator',
            'errorBoundary', 'balancedModeWarning'
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

        // Special handling for balanced focus checkbox
        if (this.elements.balancedFocus) {
            this.elements.balancedFocus.addEventListener('change', this.handleBalancedFocusChange);
        }
    }

    /// <summary>
    /// Loads all JSON files listed in exam-questions/index.json (generated at build time),
    /// normalizes them, and shows the main menu. Shows errors on failure.
    /// </summary>
    async loadQuestions() {
        try {
            this.showLoading(true);
            console.log('🚀 Starting to load questions...');

            const base = 'exam-questions/';
            console.log(`📁 Loading index from: ${base}index.json`);
            
            const idx = await fetch(base + 'index.json', { cache: 'no-store' });
            if (!idx.ok) throw new Error(`Cannot load ${base}index.json (${idx.status})`);

            const files = await idx.json(); // e.g. ["set1.json","set2.json"]
            console.log(`📋 Found ${files.length} question files:`, files);
            
            if (!Array.isArray(files) || files.length === 0) {
                throw new Error('index.json is empty or invalid.');
            }

            console.log(`🔄 Loading ${files.length} question files...`);
            const rs = await Promise.all(files.map(f => fetch(base + f, { cache: 'no-store' })));
            
            // Check for any failed requests
            const bad = rs.find(r => !r.ok);
            if (bad) throw new Error(`Failed to load ${bad.url} (${bad.status})`);

            console.log(`✅ All files loaded successfully, parsing JSON...`);
            const jsons = await Promise.all(rs.map(r => r.json()));
            const raw = jsons.flat();
            
            if (raw.length === 0) throw new Error('Loaded files but found 0 questions.');

            this.questions = raw.map(q => this.normalizeQuestion(q));
            console.log(`🎯 Total questions loaded: ${this.questions.length} from ${files.length} files`);

            // If focus areas weren't loaded from file, extract them from questions
            if (this.FOCUS_AREAS.length === 0) {
                console.log('🔍 Extracting focus areas from loaded questions...');
                const extractedFocusAreas = [...new Set(this.questions.map(q => q.focus || '1a'))].sort();
                this.FOCUS_AREAS = extractedFocusAreas;
                console.log(`✅ Extracted ${extractedFocusAreas.length} focus areas from questions:`, extractedFocusAreas);
            }

            this.showMainMenu();
        } catch (err) {
            console.error('❌ Error loading questions:', err);
            this.showError(`Failed to load questions: ${err.message}`);
        } finally {
            this.showLoading(false);
        }
    }

    // Method to dynamically add new question files
    addQuestionFile(filePath) {
        if (!this.questionFiles) {
            this.questionFiles = [];
        }
        if (!this.questionFiles.includes(filePath)) {
            this.questionFiles.push(filePath);
            console.log(`📁 Added question file: ${filePath}`);
        }
    }

    // Method to dynamically load additional question files
    async loadAdditionalQuestions(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const questions = await response.json();
            if (!Array.isArray(questions) || questions.length === 0) {
                throw new Error('Invalid questions format or empty questions array');
            }

            // Normalize and add new questions
            const normalizedQuestions = questions.map(q => this.normalizeQuestion(q));
            this.questions = this.questions.concat(normalizedQuestions);

            console.log(`✅ Loaded ${questions.length} additional questions from ${filePath}`);
            console.log(`🎯 Total questions now: ${this.questions.length}`);

            // Update UI
            if (this.elements.questionCountLabel) {
                this.elements.questionCountLabel.textContent = this.questions.length;
            }

            this.showSuccess(`Successfully loaded ${questions.length} additional questions!`);

        } catch (error) {
            console.error(`❌ Error loading additional questions from ${filePath}:`, error);
            this.showError(`Failed to load questions from ${filePath}: ${error.message}`);
        }
    }

    normalizeQuestion(question) {
        // Handle backward compatibility for old question format
        const normalized = { ...question };

        // Ensure ID exists
        if (!normalized.id) {
            normalized.id = `q${Math.random().toString(36).substr(2, 9)}`;
        }

        // Convert single answer to array format
        if (typeof normalized.answer === 'number') {
            normalized.answer = [normalized.answer];
        }

        // Ensure answer is always an array
        if (!Array.isArray(normalized.answer)) {
            normalized.answer = [normalized.answer];
        }

        // Set default difficulty if missing
        if (!normalized.difficulty) {
            normalized.difficulty = 'medium';
        }

        // Set default focus if missing
        if (!normalized.focus) {
            normalized.focus = '1a';
        }

        // Set default category if missing
        if (!normalized.category) {
            normalized.category = 'General';
        }

        // Set multiple flag based on answer array length
        normalized.multiple = normalized.answer.length > 1;

        // Ensure tags is always an array
        if (!Array.isArray(normalized.tags)) {
            normalized.tags = normalized.tags ? [normalized.tags] : [];
        }

        return normalized;
    }

    handleStartQuiz() {
        try {
            console.log('🚀 Starting quiz...');
            console.log('🔍 Balanced focus checked:', this.elements.balancedFocus?.checked);
            console.log('🔍 Question count input:', this.elements.countInput?.value);
            
            const count = this.validateQuestionCount();
            console.log('🔍 Validated count:', count);
            
            if (count === null) {
                console.log('❌ Quiz start blocked - count validation failed');
                return;
            }

            console.log('✅ Starting quiz with count:', count);
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

        // Additional validation for balanced focus mode
        if (this.elements.balancedFocus && this.elements.balancedFocus.checked) {
            const uniqueFocusAreas = this.FOCUS_AREAS.length;
            const minRequiredForBalanced = uniqueFocusAreas * 2;
            
            if (count < minRequiredForBalanced) {
                console.warn(`⚠️ Balanced focus mode requested with ${count} questions, but ${minRequiredForBalanced} questions are recommended for optimal balance (2 per focus area × ${uniqueFocusAreas} focus areas).`);
                console.warn(`⚠️ The quiz will still be created with balanced focus areas, but some areas may have fewer than 2 questions.`);
                
                // Show warning to user
                this.showBalancedModeWarning(true, count, minRequiredForBalanced);
                
                // Don't block the quiz, just warn the user
                // The createBalancedQuiz method will handle this gracefully
            } else {
                this.showBalancedModeWarning(false);
            }
        } else {
            this.showBalancedModeWarning(false);
        }

        return count;
    }

    startQuiz(count) {
        console.log('🎯 startQuiz called with count:', count);
        console.log('🎯 Balanced focus enabled:', this.elements.balancedFocus?.checked);
        
        // Clean up any existing state
        this.cleanup();

        // Create quiz with balanced focus area distribution if enabled
        if (this.elements.balancedFocus && this.elements.balancedFocus.checked) {
            console.log('🎯 Creating balanced quiz...');
            this.currentQuiz = this.createBalancedQuiz(count);
            console.log('🎯 Balanced quiz created with', this.currentQuiz.length, 'questions');
        } else {
            console.log('🎯 Creating regular quiz...');
            // Create quiz from questions (original behavior)
            this.currentQuiz = [...this.questions];
            if (this.elements.shuffleChoices.checked) {
                this.currentQuiz = this.shuffleArray(this.currentQuiz);
            }
            this.currentQuiz = this.currentQuiz.slice(0, count);
            console.log('🎯 Regular quiz created with', this.currentQuiz.length, 'questions');
        }

        // Initialize quiz state
        this.currentQuestionIndex = 0;
        this.answers = new Array(this.currentQuiz.length).fill(null);
        this.startTime = Date.now();

        // Start timer
        this.startTimer();

        // Show quiz
        console.log('🎯 Showing quiz card...');
        this.showQuizCard();
        console.log('🎯 Showing first question...');
        this.showQuestion();

        // Show focus area distribution if balanced mode is enabled
        if (this.elements.balancedFocus && this.elements.balancedFocus.checked) {
            console.log('🎯 Showing focus distribution...');
            this.showFocusDistribution();
        }
        
        console.log('🎯 Quiz started successfully!');
    }

    showFocusDistribution() {
        if (!this.elements.qContainer) return;

        const distribution = this.currentQuiz.reduce((acc, q) => {
            acc[q.focus] = (acc[q.focus] || 0) + 1;
            return acc;
        }, {});

        const distributionHtml = Object.entries(distribution)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([focus, count]) => `${focus}: ${count}`)
            .join(', ');

        const infoDiv = document.createElement('div');
        infoDiv.style.cssText = 'background: var(--card); border: 1px solid var(--border-light); border-radius: 8px; padding: 12px; margin-bottom: 16px; font-size: 0.9em; color: var(--muted);';
        infoDiv.innerHTML = `📊 <strong>Focus Area Distribution:</strong> ${distributionHtml}`;
        
        // Insert at the top of the question container
        this.elements.qContainer.insertBefore(infoDiv, this.elements.qContainer.firstChild);
    }

    createBalancedQuiz(targetCount) {
        try {
            console.log(`🎯 Creating balanced quiz with ${targetCount} questions...`);
            
            // Group questions by focus area
            const questionsByFocus = {};
            this.questions.forEach(question => {
                const focus = question.focus || '1a';
                if (!questionsByFocus[focus]) {
                    questionsByFocus[focus] = [];
                }
                questionsByFocus[focus].push(question);
            });

            const focusAreas = Object.keys(questionsByFocus);
            const totalFocusAreas = focusAreas.length;
            
            console.log(`📊 Found ${totalFocusAreas} focus areas:`, focusAreas);
            console.log(`📊 Questions per focus area:`, Object.fromEntries(
                Object.entries(questionsByFocus).map(([focus, questions]) => [focus, questions.length])
            ));

            if (totalFocusAreas === 0) {
                console.warn('No focus areas found, falling back to random selection');
                return this.shuffleArray([...this.questions]).slice(0, targetCount);
            }

            // Calculate minimum questions per focus area (at least 1, ideally 2 if possible)
            const minPerFocus = Math.max(1, Math.min(2, Math.floor(targetCount / totalFocusAreas)));
            const remainingQuestions = targetCount - (minPerFocus * totalFocusAreas);
            
            console.log(`📊 Min questions per focus: ${minPerFocus}, Remaining: ${remainingQuestions}`);

            let selectedQuestions = [];

            // First, select minimum questions from each focus area
            focusAreas.forEach(focus => {
                const focusQuestions = questionsByFocus[focus];
                const shuffled = this.shuffleArray([...focusQuestions]);
                const selectedFromFocus = shuffled.slice(0, minPerFocus);
                selectedQuestions.push(...selectedFromFocus);
                console.log(`📊 Selected ${selectedFromFocus.length} questions from focus ${focus}`);
            });

            // Then distribute remaining questions across focus areas
            if (remainingQuestions > 0) {
                const focusAreasWithMoreQuestions = focusAreas.filter(focus => 
                    questionsByFocus[focus].length > minPerFocus
                );

                if (focusAreasWithMoreQuestions.length > 0) {
                    // Shuffle focus areas to distribute remaining questions randomly
                    const shuffledFocusAreas = this.shuffleArray([...focusAreasWithMoreQuestions]);
                    
                    for (let i = 0; i < remainingQuestions && i < shuffledFocusAreas.length; i++) {
                        const focus = shuffledFocusAreas[i];
                        const focusQuestions = questionsByFocus[focus];
                        const alreadySelected = selectedQuestions.filter(q => q.focus === focus).length;
                        
                        if (alreadySelected < focusQuestions.length) {
                            const availableQuestions = focusQuestions.filter(q => 
                                !selectedQuestions.includes(q)
                            );
                            if (availableQuestions.length > 0) {
                                selectedQuestions.push(availableQuestions[0]);
                                console.log(`📊 Added 1 more question from focus ${focus}`);
                            }
                        }
                    }
                }
            }

            // Ensure we don't exceed the target count
            if (selectedQuestions.length > targetCount) {
                selectedQuestions = selectedQuestions.slice(0, targetCount);
                console.log(`📊 Trimmed to target count: ${selectedQuestions.length}`);
            }

            // If we don't have enough questions, fall back to random selection
            if (selectedQuestions.length < targetCount) {
                const remainingNeeded = targetCount - selectedQuestions.length;
                const usedQuestions = new Set(selectedQuestions.map(q => q.id));
                const availableQuestions = this.questions.filter(q => !usedQuestions.has(q.id));
                
                if (availableQuestions.length > 0) {
                    const shuffled = this.shuffleArray([...availableQuestions]);
                    selectedQuestions.push(...shuffled.slice(0, remainingNeeded));
                    console.log(`📊 Added ${Math.min(remainingNeeded, availableQuestions.length)} random questions to reach target`);
                }
            }

            // Shuffle the final selection if shuffle is enabled
            if (this.elements.shuffleChoices && this.elements.shuffleChoices.checked) {
                selectedQuestions = this.shuffleArray(selectedQuestions);
            }

            console.log(`🎯 Created balanced quiz with ${selectedQuestions.length} questions from ${totalFocusAreas} focus areas`);
            console.log('📊 Focus area distribution:', Object.entries(
                selectedQuestions.reduce((acc, q) => {
                    acc[q.focus] = (acc[q.focus] || 0) + 1;
                    return acc;
                }, {})
            ));

            return selectedQuestions;
        } catch (error) {
            console.error('Error creating balanced quiz:', error);
            console.warn('Falling back to random selection');
            return this.shuffleArray([...this.questions]).slice(0, targetCount);
        }
    }

    handleBalancedFocusChange() {
        if (this.elements.focusInfo && this.elements.availableFocusAreas) {
            if (this.elements.balancedFocus.checked) {
                this.updateFocusInfo();
                this.elements.focusInfo.style.display = 'block';
            } else {
                this.elements.focusInfo.style.display = 'none';
            }
        }
    }

    updateFocusInfo() {
        if (!this.elements.availableFocusAreas) return;

        // Use the loaded focus areas and count questions for each
        const focusAreas = this.FOCUS_AREAS;
        const focusCounts = {};
        
        this.questions.forEach(q => {
            const focus = q.focus || '1a';
            focusCounts[focus] = (focusCounts[focus] || 0) + 1;
        });

        console.log('🔍 Focus areas from loaded data:', focusAreas);
        console.log('🔍 Focus area counts:', focusCounts);

        const focusInfo = focusAreas.map(focus => 
            `${focus} (${focusCounts[focus] || 0} questions)`
        ).join(', ');

        this.elements.availableFocusAreas.textContent = focusInfo || 'None available';
    }

    showBalancedModeWarning(show, currentCount, recommendedCount) {
        if (!this.elements.balancedModeWarning) return;
        
        if (show) {
            this.elements.balancedModeWarning.style.display = 'block';
            this.elements.balancedModeWarning.innerHTML = `⚠️ <strong>Note:</strong> With ${currentCount} questions, some focus areas may have limited coverage. For optimal balance, consider using at least ${recommendedCount} questions.`;
        } else {
            this.elements.balancedModeWarning.style.display = 'none';
        }
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
                <div class="question-meta">
                    <span class="difficulty-badge ${question.difficulty}">${question.difficulty}</span>
                    <span class="focus-badge">${question.focus}</span>
                    <span class="category-badge">${question.category}</span>
                    ${question.multiple ? '<span class="multiple-badge">Multiple Choice</span>' : ''}
                </div>
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

        // Ensure multiple property is correctly set and persisted
        const isMultiple = question.answer && question.answer.length > 1;
        question.multiple = isMultiple;

        // Also set it on the currentQuiz array to ensure persistence
        if (this.currentQuiz[this.currentQuestionIndex]) {
            this.currentQuiz[this.currentQuestionIndex].multiple = isMultiple;
        }

        return choices.map((choice, index) => {
            const isSelected = this.isChoiceSelected(index);
            const inputType = question.multiple ? 'checkbox' : 'radio';
            const inputName = question.multiple ? `q${this.currentQuestionIndex}_${index}` : `q${this.currentQuestionIndex}`;

            return `
                <label class="choice ${isSelected ? 'selected' : ''}">
                    <input type="${inputType}" name="${inputName}" value="${index}" 
                           ${isSelected ? 'checked' : ''} data-choice-index="${index}">
                    <span>${this.escapeHtml(choice)}</span>
                </label>
            `;
        }).join('');
    }

    isChoiceSelected(choiceIndex) {
        const currentAnswers = this.answers[this.currentQuestionIndex];
        if (!currentAnswers) return false;

        if (Array.isArray(currentAnswers)) {
            return currentAnswers.includes(choiceIndex);
        }

        return currentAnswers === choiceIndex;
    }

    attachChoiceEventListeners() {
        const choices = this.elements.qContainer.querySelectorAll('.choice input');
        choices.forEach(choice => {
            choice.addEventListener('change', this.handleChoiceChange);
        });
    }

    handleChoiceChange(event) {
        const choiceIndex = parseInt(event.target.dataset.choiceIndex);
        const question = this.currentQuiz[this.currentQuestionIndex];

        // Use the multiple property from the question data
        if (question.multiple) {
            this.selectMultipleChoice(choiceIndex, event.target.checked);
        } else {
            this.selectSingleChoice(choiceIndex);
        }
    }

    selectSingleChoice(choiceIndex) {
        // For single choice questions, uncheck all other radio buttons
        const choices = this.elements.qContainer.querySelectorAll('.choice input[type="radio"]');
        choices.forEach(choice => {
            choice.checked = false;
        });

        // Check the selected choice
        const selectedChoice = this.elements.qContainer.querySelector(`input[data-choice-index="${choiceIndex}"]`);
        if (selectedChoice) {
            selectedChoice.checked = true;
        }

        this.answers[this.currentQuestionIndex] = choiceIndex;
        this.updateChoiceStyling();
        this.updateProgress();
    }

    selectMultipleChoice(choiceIndex, isChecked) {
        let currentAnswers = this.answers[this.currentQuestionIndex];

        // Initialize as empty array if no answers yet
        if (!currentAnswers) {
            currentAnswers = [];
        }

        // Convert single answer to array if needed (backward compatibility)
        if (!Array.isArray(currentAnswers)) {
            currentAnswers = [currentAnswers];
        }

        if (isChecked) {
            // Add choice if not already selected
            if (!currentAnswers.includes(choiceIndex)) {
                currentAnswers.push(choiceIndex);
            }
        } else {
            // Remove choice if selected
            currentAnswers = currentAnswers.filter(a => a !== choiceIndex);
        }

        this.answers[this.currentQuestionIndex] = currentAnswers;

        this.updateChoiceStyling();
        this.updateProgress();
    }

    updateChoiceStyling() {
        const choices = this.elements.qContainer.querySelectorAll('.choice');
        const question = this.currentQuiz[this.currentQuestionIndex];

        choices.forEach((choice, index) => {
            const isSelected = this.isChoiceSelected(index);
            choice.classList.toggle('selected', isSelected);
        });
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
        let totalPoints = 0;
        let wrong = [];

        this.currentQuiz.forEach((question, index) => {
            const questionPoints = this.calculateQuestionPoints(question, this.answers[index]);
            totalPoints += questionPoints;
            
            if (questionPoints === 0 && this.answers[index] !== null) {
                wrong.push(index);
            }
        });

        const percentage = Math.round((totalPoints / this.currentQuiz.length) * 100);
        const timeElapsed = Date.now() - this.startTime;

        this.showResults(totalPoints, this.currentQuiz.length, percentage, wrong, timeElapsed);

        // Store wrong answers for practice
        if (wrong.length > 0) {
            this.storeWrongAnswers(wrong);
        }
    }

    calculateQuestionPoints(question, userAnswer) {
        if (!userAnswer) return 0;

        const correctAnswers = question.answer;

        // Handle single answer questions
        if (!question.multiple) {
            return userAnswer === correctAnswers[0] ? 1 : 0;
        }

        // Handle multiple answer questions
        if (Array.isArray(userAnswer)) {
            // If any wrong answer is selected, the whole question gives 0 points
            for (const userChoice of userAnswer) {
                if (!correctAnswers.includes(userChoice)) {
                    return 0;
                }
            }
            
            // Count correct answers for points (1 point per correct answer)
            let points = 0;
            for (const userChoice of userAnswer) {
                if (correctAnswers.includes(userChoice)) {
                    points++;
                }
            }
            
            return points;
        }

        return 0;
    }

    isAnswerCorrect(question, userAnswer) {
        if (!userAnswer) return false;

        const correctAnswers = question.answer;

        // Handle single answer questions
        if (!question.multiple) {
            return userAnswer === correctAnswers[0];
        }

        // Handle multiple answer questions
        if (Array.isArray(userAnswer)) {
            // Check if arrays have same length and same elements
            if (userAnswer.length !== correctAnswers.length) return false;

            // Sort both arrays to compare regardless of order
            const sortedUser = [...userAnswer].sort();
            const sortedCorrect = [...correctAnswers].sort();

            return JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect);
        }

        return false;
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

    showResults(points, total, percentage, wrong, timeElapsed) {
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
                        <p><strong>Points:</strong> ${points} / ${total}</p>
                        <p><strong>Questions with errors:</strong> ${wrong.length}</p>
                        <p><strong>Unanswered:</strong> ${total - this.answers.filter(a => a !== null).length}</p>
                    </div>
                </div>
                ${wrong.length > 0 ? `<p><strong>Questions to review:</strong> ${wrong.length}</p>` : ''}
                <div class="scoring-breakdown" style="margin-top: 20px; padding: 16px; background: var(--accent-bg); border-radius: 8px;">
                    <p style="margin: 0 0 12px 0;"><strong>📊 Scoring Breakdown:</strong></p>
                    <p style="margin: 0; font-size: 0.9em; color: var(--text-muted);">
                        You earned ${points} points out of ${total} possible points. 
                        ${wrong.length > 0 ? `You have ${wrong.length} questions with errors that need review.` : 'Great job! No errors to review.'}
                    </p>
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border);">
                        <p style="margin: 0; font-size: 0.85em; color: var(--text-muted);">
                            <strong>Scoring:</strong> Single choice = 1 point, Multiple choice = 1 point per correct answer (0 if any wrong answer selected)
                        </p>
                    </div>
                </div>
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
        this.showResultCard();
    }

    handleRetry() {
        this.resetQuiz();
    }

    resetQuiz() {
        this.showMainMenu();
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
        this.showQuizCard();

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
            const isCorrect = this.isAnswerCorrect(question, userAnswer);
            const questionPoints = this.calculateQuestionPoints(question, userAnswer);
            const userChoice = this.formatUserAnswer(userAnswer, question);
            const correctChoice = this.formatCorrectAnswer(question);

            reviewHtml += `
                <div class="review-question ${isCorrect ? 'correct' : 'incorrect'}">
                    <h3>Question ${index + 1}</h3>
                    <div class="question-meta">
                        <span class="difficulty-badge ${question.difficulty}">${question.difficulty}</span>
                        <span class="focus-badge">${question.focus}</span>
                        <span class="category-badge">${question.category}</span>
                        <span class="points-badge ${questionPoints > 0 ? 'earned' : 'missed'}">${questionPoints} point${questionPoints !== 1 ? 's' : ''}</span>
                    </div>
                    <p><strong>Question:</strong> ${this.escapeHtml(question.q)}</p>
                    <p><strong>Your answer:</strong> ${userChoice}</p>
                    <p><strong>Correct answer:</strong> ${correctChoice}</p>
                    ${this.elements.showExplain?.checked ? `<p><strong>Explanation:</strong> ${this.escapeHtml(question.explain || 'No explanation available')}</p>` : ''}
                </div>
            `;
        });

        this.elements.resultSummary.innerHTML = reviewHtml;
    }

    formatUserAnswer(userAnswer, question) {
        if (!userAnswer) return 'Not answered';

        if (Array.isArray(userAnswer)) {
            return userAnswer.map(index => question.choices[index]).join(', ');
        }

        return question.choices[userAnswer] || 'Invalid answer';
    }

    formatCorrectAnswer(question) {
        return question.answer.map(index => question.choices[index]).join(', ');
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
                    // Normalize new questions
                    this.questions = newQuestions.map(q => this.normalizeQuestion(q));
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
        if (this.elements.errorBoundary) {
            this.elements.errorBoundary.textContent = message;
            this.elements.errorBoundary.style.display = 'block';
            setTimeout(() => {
                this.elements.errorBoundary.style.display = 'none';
            }, 5000);
        }
    }

    showSuccess(message) {
        if (this.elements.errorBoundary) {
            this.elements.errorBoundary.textContent = message;
            this.elements.errorBoundary.style.display = 'block';
            this.elements.errorBoundary.className = 'success-message';
            setTimeout(() => {
                this.elements.errorBoundary.style.display = 'none';
                this.elements.errorBoundary.className = 'error-boundary';
            }, 3000);
        }
    }

    showLoading(show) {
        if (this.elements.loadingIndicator) {
            this.elements.loadingIndicator.style.display = show ? 'block' : 'none';
        }
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

    showMainMenu() {
        this.currentView = 'main';
        
        // Show intro card (main menu), hide others
        if (this.elements.introCard) {
            this.elements.introCard.classList.remove('hidden');
        }
        if (this.elements.quizCard) {
            this.elements.quizCard.classList.add('hidden');
        }
        if (this.elements.resultCard) {
            this.elements.resultCard.classList.add('hidden');
        }

        // Update question count display
        if (this.elements.questionCountLabel) {
            this.elements.questionCountLabel.textContent = this.questions.length;
        }

        // Update load errors button state
        if (this.elements.btnLoadErrors) {
            this.elements.btnLoadErrors.disabled = this.questions.length === 0;
        }

        // Update focus info if balanced focus is enabled
        if (this.elements.balancedFocus && this.elements.balancedFocus.checked) {
            this.updateFocusInfo();
            if (this.elements.focusInfo) {
                this.elements.focusInfo.style.display = 'block';
            }
        }

        // Reset any previous quiz state
        this.resetQuiz();
    }

    showQuizCard() {
        this.currentView = 'quiz';
        
        // Hide intro card, show quiz card
        if (this.elements.introCard) {
            this.elements.introCard.classList.add('hidden');
        }
        if (this.elements.quizCard) {
            this.elements.quizCard.classList.remove('hidden');
        }
        if (this.elements.resultCard) {
            this.elements.resultCard.classList.add('hidden');
        }
    }

    showResultCard() {
        this.currentView = 'result';
        
        // Hide other cards, show result card
        if (this.elements.introCard) {
            this.elements.introCard.classList.add('hidden');
        }
        if (this.elements.quizCard) {
            this.elements.quizCard.classList.add('hidden');
        }
        if (this.elements.resultCard) {
            this.elements.resultCard.classList.remove('hidden');
        }
    }

    resetQuiz() {
        // Reset quiz state
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.startTime = null;
        this.stopTimer();
        
        // Clear any existing quiz content
        if (this.elements.qContainer) {
            this.elements.qContainer.innerHTML = '';
        }
        
        // Reset progress
        if (this.elements.progressInner) {
            this.elements.progressInner.style.width = '0%';
        }
        if (this.elements.progressLabel) {
            this.elements.progressLabel.textContent = '0 / 0';
        }
        
        // Reset timer display
        if (this.elements.liveTimer) {
            this.elements.liveTimer.textContent = '00:00';
        }
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