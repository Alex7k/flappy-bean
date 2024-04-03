document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('startButton');
    const difficultySlider = document.getElementById('difficultySlider');
    const toggleDifficulty = document.getElementById('toggleDifficulty');
    const scoreDisplay = document.getElementById('scoreDisplay');

    document.body.style.backgroundColor = 'black';

    let bird, obstacles, score = 0, lastScore = 0, highScore = 0, gravity, gameSpeed, speedMultiplier, gameActive;
    let beanImage = new Image();
    beanImage.src = 'bean.png';
    let stars = [];

    function updateCanvasSize() {
        const aspectRatio = 16 / 9;
        const browserWidth = window.innerWidth;
        const browserHeight = window.innerHeight;
        let scale;
    
        // Reset the transform to the default state.
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    
        // Determine the scale based on maintaining aspect ratio.
        if (browserWidth / browserHeight < aspectRatio) {
            scale = browserWidth / 1600;
        } else {
            scale = browserHeight / 900;
        }
    
        canvas.width = 1600 * scale;
        canvas.height = 900 * scale;
    
        // Center the canvas.
        canvas.style.left = `${(browserWidth - canvas.width) / 2}px`;
        canvas.style.top = `${(browserHeight - canvas.height) / 2}px`;
        canvas.style.position = 'absolute';
    
        // Apply the new scaling transformation.
        ctx.setTransform(scale, 0, 0, scale, 0, 0);
    
        // Redraw the game scene to fit the new dimensions.
        if (gameActive) {
            drawEverything();
        }
    }


    function drawGame() {
        // Clear the canvas.
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Redraw the background with the current score-based color.
        updateBackground();
        // Redraw the bird.
        drawBird();
        // Redraw each obstacle.
        obstacles.forEach(obstacle => {
            drawObstacle(obstacle);
        });
        // Redraw the scores on the screen.
        displayScores();
        // If the score is high enough, draw the stars for the "space" background.
        if (score > 150) {
            drawStars();
        }
    }
    
    // You should create a function that draws everything - bird, obstacles, score, etc.
    function drawEverything() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateBackground();
        drawBird();
        obstacles.forEach(drawObstacle);
        displayScores();
        if (score > 150) {
            drawStars();
        }
    }
    
    // Call updateCanvasSize initially and on resize
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    

    function resetGame() {
        bird = { x: 1600 / 10, y: 900 / 2, radius: 20, velocity: 0 };
        obstacles = [];
        score = 0;
        gravity = 0.8;
        gameSpeed = 2 + parseFloat(difficultySlider.value) * 2;
        speedMultiplier = toggleDifficulty.checked ? 0.01 + parseFloat(difficultySlider.value) * 0.01 : 0;
        gameActive = true;
        stars = []; // Clear stars for new game

        startButton.style.display = 'none';
        document.getElementById('controls').style.display = 'none';
        scoreDisplay.style.display = 'none';
        startScreenImage.style.display = 'none';

        window.requestAnimationFrame(gameLoop);
    }

    function drawBird() {
        ctx.drawImage(beanImage, bird.x - bird.radius, bird.y - bird.radius, bird.radius * 2, bird.radius * 2);
    }

    function updateBird() {
        bird.velocity += gravity;
        bird.y += bird.velocity;
        if (bird.y + bird.radius >= 900 || bird.y - bird.radius <= 0) {
            endGame();
        }
    }

    const BASE_WIDTH = canvas.width;
    const BASE_HEIGHT = canvas.height  ;
    
    function handleObstacles() {
        let scaleWidth = canvas.width / BASE_WIDTH;
        let scaleHeight = canvas.height / BASE_HEIGHT;
    
        if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - (300 * scaleWidth)) {
            let gap = (BASE_HEIGHT / 2.5) * scaleHeight;
            let obstacleHeight = (Math.random() * (BASE_HEIGHT / 3) + 50) * scaleHeight;
            obstacles.push({
                x: canvas.width,
                y: 0,
                width: 50 * scaleWidth,
                height: obstacleHeight,
                gap: gap,
                passed: false
            });
        }
    
        obstacles.forEach(obstacle => {
            obstacle.x -= gameSpeed * scaleWidth;
            ctx.fillStyle = 'green';
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            ctx.fillRect(obstacle.x, obstacle.height + obstacle.gap, obstacle.width, canvas.height - obstacle.height - obstacle.gap);
    
            if (bird.x > obstacle.x + obstacle.width && !obstacle.passed) {
                obstacle.passed = true;
                score++;
                if (toggleDifficulty.checked) {
                    gameSpeed += speedMultiplier;
                }
            }
    
            if (bird.x + bird.radius > obstacle.x && bird.x - bird.radius < obstacle.x + obstacle.width &&
                (bird.y - bird.radius < obstacle.height || bird.y + bird.radius > obstacle.height + obstacle.gap)) {
                endGame();
            }
        });
    
        obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
    }
    
    


    function updateBackground() {
        let bgColor;
        if (score <= 100) {
            // Start with a brighter, more vivid blue and transition to dark blue
            // Adjusting the initial hue and lightness for a more distinctly blue color at the start
            let progress = score / 100;
            bgColor = `hsl(217, 100%, ${75 - 25 * progress}%)`; // Light to darker blue transition
        } else if (score <= 150) {
            // Transition from dark blue to black
            let progress = (score - 100) / 50;
            bgColor = `hsl(240, 100%, ${50 - 50 * progress}%)`; // Dark blue to black
        } else {
            // Space background achieved, with black and stars
            bgColor = 'black';
            if (stars.length < 100) addStars(1); // Add stars gradually if less than 100 stars
        }
        canvas.style.backgroundColor = bgColor;
    }

    function addStars(count) {
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 1.5
            });
        }
    }

    function drawStars() {
        stars.forEach(star => {
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    function displayScores() {
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.fillText(`Score: ${score}`, 20, 100);
        if (score > highScore) {
            highScore = score;
        }
        scoreDisplay.innerHTML = `Last Score: ${lastScore}<br>High Score: ${highScore}`;
    }

    function endGame() {
        gameActive = false;
        startButton.style.display = 'block';
        document.getElementById('controls').style.display = 'flex';
        scoreDisplay.style.display = 'block';
        startScreenImage.style.display = 'block';
       
        lastScore = score; // Update last score
    }

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateBackground(); // Update the background based on the current score
        if (gameActive) {
            drawBird();
            updateBird();
            handleObstacles();
            displayScores();
            if (score > 150) drawStars(); // Only draw stars once in "space"
            window.requestAnimationFrame(gameLoop);
        }
    }
    

    startButton.addEventListener('click', resetGame);
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            if (!gameActive) resetGame();
            else bird.velocity = -12;
        }
    });

    difficultySlider.addEventListener('input', () => {
        if (!gameActive) {
            gameSpeed = 2 + parseFloat(difficultySlider.value) * 2;
            speedMultiplier = toggleDifficulty.checked ? 0.01 + parseFloat(difficultySlider.value) * 0.01 : 0;
        }
    });

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    endGame(); // Initialize the game state
});