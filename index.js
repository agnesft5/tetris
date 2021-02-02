document.addEventListener('DOMContentLoaded', () => {
    let grid = document.querySelector('.grid');
    let width = 10;
    let height = 20;
    let currentPos = 4;
    let squares = Array.from(grid.querySelectorAll('.square'));
    let displayPreview = document.querySelectorAll('.previous-grid div');
    let displayWidth = 4;
    let displayIndex = 0;
    let nextRandom = 0;
    let startButton = document.querySelector('#start-button');
    startButton.classList.add('start-button-off');
    let timerId;
    let displayScore = document.getElementById('score');
    let score = 0;
    displayScore.innerText = score;
    let displayLines = document.getElementById('lines');
    let lines = 0;
    displayLines.innerText = lines;
    let upKey = document.getElementById('up-key');
    let downKey = document.getElementById('down-key');
    let leftKey = document.getElementById('left-key');
    let rightKey = document.getElementById('right-key');
    let canRotate = true;
    let selectedColor;
    const colorDisplay = document.getElementById('selected-palette-display');

    const brightDisplay = document.querySelectorAll('.bright-color');
    const pastelDisplay = document.querySelectorAll('.pastel-color');

    const brightColors = ['#c200fb', '#6610f2', '#ff6000', '#ffd000', '#fc2f00'];
    const pastelColors = ['#cdb4db', '#ffc8dd', '#ffafcc', '#bde0fe', '#a2d2ff'];

    //COLORS
    function displayColors(element, colors){
        element[0].setAttribute('style', `background-color: ${colors[0]}`);
        element[1].setAttribute('style', `background-color: ${colors[1]}`);
        element[2].setAttribute('style', `background-color: ${colors[2]}`);
        element[3].setAttribute('style', `background-color: ${colors[3]}`);
        element[4].setAttribute('style', `background-color: ${colors[4]}`);
    }

    document.getElementById('pastel-colors').addEventListener('click', ()=>{
        colors = pastelColors;
        selectedColor = 'Pastel colors';
        colorDisplay.innerText = selectedColor;
    })
    document.getElementById('bright-colors').addEventListener('click', ()=>{
        colors = brightColors;
        selectedColor = 'Bright colors';
        colorDisplay.innerText = selectedColor;
    })

    //TETROMINOS
    const lTetromino = [
        [1, width + 1, width * 2 + 1, 2],
        [width, width + 1, width + 2, width * 2 + 2],
        [1, width + 1, width * 2 + 1, width * 2],
        [width, width * 2, width * 2 + 1, width * 2 + 2],
    ]
    const zTetromino = [
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1],
        [0, width, width + 1, width * 2 + 1],
        [width + 1, width + 2, width * 2, width * 2 + 1],
    ]
    const tTetromino = [
        [1, width, width + 1, width + 2],
        [1, width + 1, width + 2, width * 2 + 1],
        [width, width + 1, width + 2, width * 2 + 1],
        [1, width, width + 1, width * 2 + 1],
    ]
    const oTetromino = [
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
        [0, 1, width, width + 1],
    ]
    const iTetromino = [
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3],
        [1, width + 1, width * 2 + 1, width * 3 + 1],
        [width, width + 1, width + 2, width + 3]
    ]

    const smallTermominoes = [
        [1, displayWidth + 1, displayWidth * 2 + 1, 2],
        [0, displayWidth, displayWidth + 1, displayWidth * 2 + 1],
        [1, displayWidth, displayWidth + 1, displayWidth + 2],
        [0, 1, displayWidth, displayWidth + 1],
        [1, displayWidth + 1, displayWidth * 2 + 1, displayWidth * 3 + 1]
    ]

    //Controls
    function control(e) {
        if (e.keyCode === 39) {
            moveRight();
        } else if (e.keyCode === 37) {
            moveLeft();
        } else if (e.keyCode === 38) {
            rotate();
        } else if (e.keyCode === 40) {
            moveDown();
        }
    }

    upKey.addEventListener('click', rotate);
    downKey.addEventListener('click', moveDown);
    leftKey.addEventListener('click', moveLeft);
    rightKey.addEventListener('click', moveRight);

    document.addEventListener('keyup', control);

    //Randomize
    const tetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];
    let colors = pastelColors;
    selectedColor = 'Pastel colors';
    colorDisplay.innerText = selectedColor;
    let random = Math.floor(Math.random() * tetrominoes.length);
    let currentRotation = 0;
    let current = tetrominoes[random][currentRotation];
    let currentColor = colors[random];

    //Draw
    //this function draws the tetromino everytime the side is refreshed
    //is also used inside the other functions such as move down, move right
    //or move left. To be used it just requires the current position of the 
    //tetromino to be changed.
    function draw() {
        current.forEach(index => {
            squares[currentPos + index].classList.add('block');
            squares[currentPos + index].setAttribute('style', `background-color: ${currentColor} !important`);
        })
    }

    //Undraw
    //it works like the draw function but instead of drawing the tetromino by
    //adding the block class, it erases it but removing the block class
    function undraw() {
        current.forEach(index => {
            squares[currentPos + index].classList.remove('block');
            squares[currentPos + index].removeAttribute('style');
        })
    }

    //Move down
    //this function changes the current position by adding the width
    //this way me move the tetromino a whole line or row.
    //we remove the whole tetromino in first place, change the position and
    //we draw it again
    //the freeze function added at the end of the function checks were the tetromino
    //is at to decide wether to fix the tetromino or not
    //the tetromino will be fixed just in case it is located at the bottom of the grid
    //or next or above of an already fixed tetromino
    function moveDown() {
        undraw();
        currentPos = currentPos + width;
        draw();
        freeze();
    }


    //both functions (move right and move left), check the tetromino position
    //if the tetromino is placed at the left edge, it won't be able to move left
    //if it's placed at the right edge, it won't be able to move right.
    //knowing where the tetromino is, we can decide the direction by adding or
    //substracting 1 to the current position
    //once added or substracted the tetromino should be drawn again by using the function draw

    //Move right
    function moveRight() {
        undraw();
        const isAtRightEdge = current.some(index => (currentPos + index) % width === width - 1);
        if (!isAtRightEdge) {
            currentPos++
            //can be erased
            if (current.some(index => (currentPos + index) % width === width - 2) || current.some(index => (currentPos + index) % width === width - 1)) {
                canRotate = false;
            } else if (current.some(index => (currentPos + index) % width === 1) || current.some(index => (currentPos + index) % width === 0)) {
                canRotate = false;
            } else {
                canRotate = true;
            }
            console.log(canRotate)
        }
        //till here
        if (current.some(index => squares[currentPos + index].classList.contains('block2'))) {
            currentPos--
        }
        draw();
    }

    //Move left
    function moveLeft() {
        undraw();
        const isAtlLeftEdge = current.some(index => (currentPos + index) % width === 0);
        if (!isAtlLeftEdge) {
            currentPos--
            //can be erased
            if (current.some(index => (currentPos + index) % width === 1) || current.some(index => (currentPos + index) % width === 0)) {
                canRotate = false;
            } else if (current.some(index => (currentPos + index) % width === width - 2) || current.some(index => (currentPos + index) % width === width - 1)) {
                canRotate = false;
            } else {
                canRotate = true;
            }
            console.log(canRotate)
        }
        //thill here
        if (current.some(index => squares[currentPos + index].classList.contains('block2'))) {
            currentPos++
        }
        draw();
    }

    //Rotate
    //by using this function we first undraw the previous tetromino and then add 1 to the current rotation
    //so we can change from the rotation we are at to the next one
    //since our tetromino array contains every rotation the tetromino could possibily have
    //by adding 1 to the current rotation we change the index of the array so we can change one for another
    //just in case the current rotation index reaches the array length (meaning that we already drawn every 
    //rotation we could possibly draw), the current rotation will go back to 0 (the initial rotation)
    //after giving value to the current rotation we use it as an index for our current tetromino
    // and use the draw function to make the tetromino show up again
    function rotate() {
        undraw();
        if (canRotate) {
            currentRotation++
            if (currentRotation === current.length) {
                currentRotation = 0;
            }
            current = tetrominoes[random][currentRotation];
            draw();
        } else {
            current = tetrominoes[random][currentRotation];
            draw();
        }
    }


    //Display Shape
    //this function allow us to display a previous view of the next tetromino that will appear
    //in our grid
    //first of all we need to create a new grid with the amount of squares required to show the preview
    //we'll use a grid of 4 by 4, after that we we'll assing its value to a variable by using a query selector
    //we also need an index to indicate which position of the new grid we want the first square of the tetromino
    //to be displayed on and we need to set up a new variable to randomize which tetromino will be shown up nextç
    //on the grid, this variable will be also used as an index for the current tetromino (of the grid), this way
    //the tetromino will be the same that we previsualized
    //once we have the variable, we need to erase any previous view that could had been displayed before
    //just like the undraw function
    //we did also set up a new array with just one rotation of the tetrominoes, this variable will be used to display
    //the tetrominoes on the previous view
    //to display this preview we'll do exactly the same we did in our draw function, using the index of the current small tetromino
    //by adding them into the position (display index) we assigned before.
    function displayShape() {
        displayPreview.forEach(square => {
            square.classList.remove('block');
            square.removeAttribute('style');
        })
        smallTermominoes[nextRandom].forEach(index => {
            displayPreview[displayIndex + index].classList.add('block');
            displayPreview[displayIndex + index].setAttribute('style', `background-color: ${colors[nextRandom]}`);
        })
    }

    //Freeze
    function freeze() {
        //checking if in the next line the tetromino will hit the bottom line or any previous fixed tetromino so
        //we can fix the tetromino and avoid it to be fixed on any position
        if (current.some(index => squares[currentPos + index + width].classList.contains('block3') || squares[currentPos + index + width].classList.contains('block2'))) {
            current.forEach(index => {
                squares[currentPos + index].classList.add('block2');
            })
            //once we checked if we hit the bottom line or any previous fixed tetromino and we added the block2 class
            //to our current tetromino so it can be permanently displayed we need to change the random index for the
            //next random index (the one we used on the preview)
            //this way the current tetromino of the grid will be the last small tetromino previsualized
            //after that we need to change the value of the next random and set the initial position of the current
            //tetromino along with the reassignment of the current tetromino by changing the random value
            //once everything is set up, we can use again the draw function to display the tetromino, the displayShape to
            //display the preview and the gameOver and addScore function to check wether if the game is over or we added
            //points to our score
            random = nextRandom;
            //since we reassign the random value with the nextRandom value
            //before reassigning the next random value, we'll keep the previous
            //next random as random value until the next round
            canRotate = true;
            nextRandom = Math.floor(Math.random() * tetrominoes.length);
            current = tetrominoes[random][currentRotation];
            currentColor = colors[random];
            currentPos = 4;
            draw();
            displayShape();
            gameOver();
            addScore();
        }
    }

    //Start
    startButton.addEventListener('click', () => {
        startButton.classList.remove('start-button-off');
        startButton.classList.add('start-button-on');
        setTimeout(() => {
            startButton.classList.remove('start-button-on');
            startButton.classList.add('start-button-off');
            document.querySelector('.wrapper').classList.remove('wrapper-opacity');
            document.querySelector('.grid').classList.remove('grid-opacity')
            if (timerId) {
                clearInterval(timerId);
                timerId = null;
            } else {
                draw();
                timerId = setInterval(moveDown, 1000);
                nextRandom = Math.floor(Math.random() * tetrominoes.length);
                displayShape();
            }
        }, 1500);
    })

    //Game over
    function gameOver() {
        if (current.some(index => squares[currentPos + index].classList.contains('block2'))) {
            displayScore.innerText = 'GAME OVER';
            document.querySelector('.wrapper').classList.add('.wrapper-opacity');
            document.querySelector('.grid').classList.add('.grid-opacity');
            document.querySelector('.previous-shape').setAttribute('style', 'height: 285px');
            if (window.innerWidth > 688 && window.innerWidth < 992){
                document.querySelector('.previous-shape').setAttribute('style', 'height: 510px');
            }
            clearInterval(timerId);
            undraw();
            document.removeEventListener('keyup', control);
        }
    }

    //Add score
    function addScore() {
        //since we have a grid of 200 squares, we will create a loop with this lenght
        //and we'll incrase a whole line every loop
        for (let i = 0; i < 199; i += width) {
            //this way we'll check all the grid and we'll look for a row where every square
            //on it has a class named block2, that meaning that we reached a complete line
            //and that we can add 10 points to our score and a line in our lines counter.
            const row = [i, i + 1, i + 2, i + 3, i + 4, i + 5, i + 6, i + 7, i + 8, i + 9];
            //in case every index on the row has the class block2, we'll add the score and the lines
            //on the punctuation and we'll remove the propertie block2 so the squares are not drawn anymore
            if (row.every(index => squares[index].classList.contains('block2'))) {
                score += 10;
                lines += 1;
                displayScore.innerText = score;
                displayLines.innerText = lines;
                row.forEach(index =>
                    squares[index].classList.remove('block') || squares[index].classList.remove('block2') &&
                    squares[index].removeAttribute('style'));
                //now we need to remove the last line of the squares array and add it on the top of it with the
                //prototype function concat()
                //first of all we splice those squares (the whole line) and save them into array
                //once we saved them we'll reassign the squares array with those we erased at the begining
                //lastly we'll append the whole squares array into the grid
                const squaresRemoved = squares.splice(i, width); //this way we erase the whole line or row
                squaresRemoved.forEach(square => square.removeAttribute('style'));
                squares = squaresRemoved.concat(squares) //we add the squares array at the end of the squaresRemoved
                squares.forEach(cell => grid.appendChild(cell));
            }
        }
    }

    displayColors(brightDisplay, brightColors);
    displayColors(pastelDisplay, pastelColors);
    console.log(innerWidth);
    console.log(innerHeight);

}) 