document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    // Default to light mode unless user previously enabled dark mode
    const isDarkMode = localStorage.getItem('darkMode') === 'true';

    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.querySelector('.navbar').classList.add('dark-mode');
        document.querySelectorAll('.nav-links a').forEach(link => link.classList.add('dark-mode'));
        document.querySelector('.main-content').classList.add('dark-mode');
        document.querySelectorAll('.quiz-button').forEach(button => button.style.color = 'black'); // Change quiz button text color
    } else {
        document.body.classList.remove('dark-mode');
        document.querySelector('.navbar').classList.remove('dark-mode');
        document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('dark-mode'));
        document.querySelector('.main-content').classList.remove('dark-mode');
        document.querySelectorAll('.quiz-button').forEach(button => button.style.color = '');
    }

    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        document.querySelector('.navbar').classList.toggle('dark-mode');
        document.querySelectorAll('.nav-links a').forEach(link => link.classList.toggle('dark-mode'));
        document.querySelector('.main-content').classList.toggle('dark-mode');
        document.querySelectorAll('.quiz-button').forEach(button => {
            if (document.body.classList.contains('dark-mode')) {
                button.style.color = 'black'; // Change quiz button text color to black
            } else {
                button.style.color = ''; // Reset to default color
            }
        });

        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode ? 'true' : 'false');
    });

    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    menuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
    });

    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navLinks.classList.remove('active');
        });
    });
});

// Global variables
let questions = {};
let currentLanguage = '';
let currentQuestionIndex = 0;
let score = 0;
let totalQuestions = 30; // Adjust this to match the number of questions you're using
let questionsShuffled = [];
let selectedAnswers = [];
let incorrectAnswers = []; // Array to store incorrectly answered questions
let isOptionSelected = false; // Track if an option is selected
let isCountdownActive = false; // Track if countdown is active
let userDefinedTime = 2; // Countdown time in seconds

// Fetch questions from questions.json
async function loadQuestions() {
    try {
        const response = await fetch('/questions.json'); // Adjust path if necessary
        if (!response.ok) throw new Error('Failed to load questions');
        questions = await response.json();

        // Check if questions are loaded for each language
        if (!Object.keys(questions).length) {
            console.log('No questions available for any language.');
        } else {
            console.log('Questions loaded successfully:', questions);
        }
    } catch (error) {
        console.error('Error loading questions:', error);
    }
}

// Shuffle Questions Function
function shuffleQuestions(language) {
    const shuffled = questions[language].sort(() => Math.random() - 0.5); // Shuffle the questions
    return shuffled.slice(0, totalQuestions); // Return a random set of questions up to totalQuestions (default 30)
}

// Function to start the quiz based on the selected language
function startQuiz(language) {
    currentLanguage = language;
    currentQuestionIndex = 0;
    score = 0;

    if (!questions[currentLanguage] || questions[currentLanguage].length === 0) {
        alert(`No questions available for ${currentLanguage}`);
        return;
    }

    // Shuffle questions for the selected language
    questionsShuffled = shuffleQuestions(language);

    // Reset selected answers
    selectedAnswers = [];

    // Hide the intro text and language buttons
    document.getElementById('intro-text').style.display = 'none';
    document.getElementById('language-buttons').style.display = 'none';

    // Clear previous performance section
    document.getElementById('performanceSection').style.display = 'none';

    // Show the first question
    showQuestion();
}

// Show the current question with a countdown
function showQuestion() {
    const quizSection = document.getElementById('quizSection');
    quizSection.innerHTML = ''; // Clear previous content

    const question = questionsShuffled[currentQuestionIndex];

    if (!question) {
        showFinalPerformance(); // Show performance when no more questions are available
        return;
    }

    if (isCountdownActive) return; // Prevent multiple countdowns

    // Countdown logic before showing the question
    let countdown = userDefinedTime;
    isCountdownActive = true;

    // Display countdown message
    quizSection.innerHTML = `
        <div class="countdown-timer">
            <h3>Get ready! The next question will appear in <span id="countdown">${countdown}</span> seconds...</h3>
        </div>
    `;

    // Countdown interval
    const countdownInterval = setInterval(function() {
        countdown--;
        document.getElementById('countdown').textContent = countdown;

        if (countdown === 0) {
            clearInterval(countdownInterval);
            isCountdownActive = false; // Countdown ends, reset active state
            showQuizQuestion(question); // Show the question after countdown
        }
    }, 100); // 1-second interval
}

// Utility function to shuffle an array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Function to display the quiz question after countdown
function showQuizQuestion(question) {
    const quizSection = document.getElementById('quizSection');
    const shuffledOptions = shuffleArray([...question.options]); // Shuffle the options
    quizSection.innerHTML = `
        <div class="quiz-question">
            <h3>${currentQuestionIndex + 1}. ${question.question}</h3>
            ${shuffledOptions.map(option => `
                <div class="option" id="option-${option}" onclick="selectOption('${option}', '${question.answer}')">${option}</div>
            `).join('')}
            <div id="result-message"></div>
        </div>
    `;
    updateProgressBar(currentQuestionIndex + 1, totalQuestions); // Update progress bar
    quizSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Progress bar initialization
function updateProgressBar(current, total) {
    const progressBar = document.getElementById('progressBar');
    const progress = (current / total) * 100;
    progressBar.style.width = `${progress}%`;
}

// Function to select an option
function selectOption(selected, correctAnswer) {
    if (isOptionSelected || isCountdownActive) return; // Prevent multiple selections or actions during countdown
    isOptionSelected = true; // Mark that an option is selected

    const resultMessage = document.getElementById('result-message');
    const currentQuestion = questionsShuffled[currentQuestionIndex];

    // Check the selected answer
    if (selected === correctAnswer) {
        score++;
        resultMessage.innerText = "Correct!!! ";
        resultMessage.style.color = "green";
    } else {
        resultMessage.innerText = `Incorrect! The correct answer is: ${correctAnswer}`;
        resultMessage.style.color = "red";
        
        // Add to incorrectAnswers if the answer is wrong
        incorrectAnswers.push({
            question: currentQuestion.question,
            options: currentQuestion.options,
            correctAnswer: currentQuestion.answer,
            selectedAnswer: selected
        });
    }

    const optionContainer = document.getElementById(`option-${selected}`);
    optionContainer.style.color = 'white'; // Change text color to white after clicking

    // Move to the next question after 2 seconds
    setTimeout(() => {
        currentQuestionIndex++;
        isOptionSelected = false; // Reset option selection flag
        if (currentQuestionIndex % 15 === 0 && currentQuestionIndex < totalQuestions) {
            showIntermediatePerformance(); // Show performance after every 5 questions
        } else if (currentQuestionIndex < totalQuestions) {
            showQuestion(); // Show the next question after countdown
        } else {
            showFinalPerformance(); // Show final performance after all questions
        }
    }, 2000);
}

// Function to evaluate performance based on score
function evaluatePerformance(score, totalAnswered) {
    let performanceMessage;
    const percentage = (score / totalAnswered) * 100;

    if (percentage === 100) {
        performanceMessage = "Excellent! You answered all questions correctly. Keep up the great work!";
    } else if (percentage >= 90) {
        performanceMessage = "Great job! You have a strong understanding of the material.";
    } else if (percentage >= 80) {
        performanceMessage = "Good job! You answered most questions correctly. A little more practice and you'll be perfect.";
    } else if (percentage >= 70) {
        performanceMessage = "Nice effort! You're getting there. Keep studying and you'll improve even more.";
    } else if (percentage >= 60) {
        performanceMessage = "You're doing okay, but there's room for improvement. Keep practicing!";
    } else if (percentage >= 50) {
        performanceMessage = "You're getting better! Keep working on it and you'll see more progress.";
    } else {
        performanceMessage = "Improvement needed. Don't give up, keep practicing and you'll get better!";
    }
    return performanceMessage;
}

// Function to show intermediate performance after every 5 questions
function showIntermediatePerformance() {
    const quizSection = document.getElementById('quizSection');
    const performanceMessage = evaluatePerformance(score, currentQuestionIndex);  // Display up to the current question number
    const percentage = ((score / currentQuestionIndex) * 100).toFixed(2); // Calculate percentage

    quizSection.innerHTML = `
        <div class="performance-message">
            <h3>Your Performance Till Now</h3>
            <p>${performanceMessage}</p>
            <p>Current Score: ${score} out of ${currentQuestionIndex} (${percentage}%)</p>
            <button class="quiz-button" onclick="showQuestion()">Continue Quiz</button>
        </div>
    `;
}

// Function to show final performance at the end
function showFinalPerformance() {
    const performanceMessage = evaluatePerformance(score, currentQuestionIndex);
    const percentage = ((score / currentQuestionIndex) * 100).toFixed(2); // Calculate final percentage

    const resultSection = document.getElementById('performanceSection');
    resultSection.innerHTML = `
        <div class="performance-message">
            <h3>Your Final Performance</h3>
            <p>${performanceMessage}</p>
            <p>Final Score: ${score} out of ${currentQuestionIndex} (${percentage}%)</p>
            <button class="quiz-button" onclick="enterReviewMode()">Review Incorrect Answers</button>
            <button class="quiz-button" onclick="retakeIncorrectQuestions()">Retake Incorrect Questions</button> <!-- Retake button -->
        </div>
    `;
    resultSection.style.display = 'block'; // Show performance section
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Function to enter review mode for incorrect answers
function enterReviewMode() {
    const quizSection = document.getElementById('quizSection');
    quizSection.innerHTML = ''; // Clear previous content

    const reviewMessage = document.createElement('h3');
    reviewMessage.textContent = "Review Incorrect Answers";
    quizSection.appendChild(reviewMessage);

    // Loop through incorrect answers and display them
    incorrectAnswers.forEach((incorrect, index) => {
        const questionElement = document.createElement('div');
        questionElement.className = 'review-question';
        questionElement.innerHTML = `
            <h4>${index + 1}. ${incorrect.question}</h4>
            <p>Your Answer: ${incorrect.selectedAnswer}</p>
            <p>Correct Answer: ${incorrect.correctAnswer}</p>
            <p>Options: ${incorrect.options.join(', ')}</p>
        `;
        quizSection.appendChild(questionElement);
    });

    const restartButton = document.createElement('button');
    restartButton.className = 'quiz-button';
    restartButton.textContent = 'Back to Quiz';
    restartButton.onclick = () => showFinalPerformance();  // Go back to final performance
    quizSection.appendChild(restartButton);
}

// Retake incorrect questions
function retakeIncorrectQuestions() {
    currentQuestionIndex = 0; // Reset to the first question
    score = 0; // Reset score

    // Use incorrectAnswers array for retake
    questionsShuffled = incorrectAnswers.map(incorrect => ({
        question: incorrect.question,
        options: incorrect.options,
        answer: incorrect.correctAnswer
    }));

    totalQuestions = questionsShuffled.length; // Update totalQuestions to the number of incorrect questions

    // Reset incorrectAnswers array for a fresh start
    incorrectAnswers = [];

    showQuestion(); // Start retaking questions
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadQuestions();
});