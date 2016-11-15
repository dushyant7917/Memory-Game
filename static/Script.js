var mainList = [];
var randomCount = [];
var soundFreq = [];
var time = 500;
var counter = 0;
var userCounter = 0;
var takeInput = false;
var interval = null;
var level = parseInt(document.querySelector("#submitLevel").innerHTML);
var duration = 0.5;
var notChnaged = true;
var timesCorrect = 3;
var currentTimesCorrect = (parseInt(document.querySelector("#submitScore").innerHTML) - (level - 1) * 15) / 5;
var timesIncorrect = 0;
var currentScore = parseInt(document.querySelector("#submitScore").innerHTML);

var playerProgress = $("#progressReport");
var levelNumber = document.querySelector("#level");
var score = document.querySelector("#score");
var levelText = document.querySelector("#textLevel");
var completedLevel = document.querySelector("#completed");
var audio = document.querySelector("#myAudio");
var story = document.querySelector("#storyPart");
var inputScore = document.querySelector("#currentScore");
inputScore.value = currentScore.toString();
var inputLevel = document.querySelector("#currentLevel");
inputLevel.value = level.toString();
var button = document.querySelector("#hideButton");
if(level === 1 && currentScore === 0)
    button.style.display = "none";
var context = new AudioContext();
var volume = context.createGain();


function removeOptions(){
    $("#gameOptions").fadeOut();
    if(level === 1 && currentScore === 0)
        setTimeout(playStory, 500);
    else
        setTimeout(displayGame, 500);
}
function displayGame(){
    $("#mainGame").fadeIn();
    notChnaged = false;
}
function removeStory(){
    $("#storyPart").fadeOut();
    setTimeout(displayGame, 500);
}
function customProgress(){
    if(level === 1 && currentScore === 0)
        removeOptions();
    else
        resetProgress(0);
}
function displayProgress(){
    playerProgress.fadeTo(500, 1);
    playerProgress.delay(500).fadeTo(500, 0);
}

$(document).ready(function(){
    for(var i = 1; i <= 9; i++){
        var tempName = "#box_" + i.toString();
        mainList.push(tempName);
    }
});

function randomGenerator(){
    return Math.floor(Math.random() * (900 - 300 + 1)) + 300;
}

function selectColors(){
    if(notChnaged === true)
        return;
    randomCount.length = 0;
    soundFreq.length = 0;
    counter = 0;
    takeInput = false;
    userCounter = 0;
    for(var i = 0; i < level; i++){
        var value = randomGenerator();
        randomCount.push(document.querySelector(mainList[value % 9]));
        soundFreq.push(value);
    }
    interval = setInterval(displayColors, time + 5);
}

function displayColors(){
    if(counter === level){
        clearInterval(interval);
        interval = null;
        randomCount[counter - 1].style.opacity = 0.5;
        takeInput = true;
        return;
    }

    var startTime = context.currentTime;
    var oscillator_1 = context.createOscillator();
    var oscillator_2 = context.createOscillator();
    var volume = context.createGain();
    oscillator_1.type = "sawtooth";
    oscillator_2.type = "sawtooth";

    volume.gain.volume = 0.1;
    oscillator_1.connect(volume);
    oscillator_2.connect(volume);
    volume.connect(context.destination);

    oscillator_1.frequency.value = soundFreq[counter] + 1;
    oscillator_2.frequency.value = soundFreq[counter] - 1;

    if(counter === level - 1){
        volume.gain.setValueAtTime(0.1, startTime + duration - 0.05);
        volume.gain.linearRampToValueAtTime(0, startTime + duration);
    }

    oscillator_1.start(startTime);
    oscillator_2.start(startTime);

    oscillator_1.stop(startTime + duration);
    oscillator_2.stop(startTime + duration);

    if(counter === 0)
        randomCount[counter].style.opacity = 1;
    else{
        randomCount[counter - 1].style.opacity = 0.5;
        randomCount[counter].style.opacity = 1;
    }

    counter += 1;
}

function getUserInput(event){
    if(takeInput === false)
        return;

    var idName = event.target.id;
    var correctIdName = randomCount[userCounter].id;

    if(idName === correctIdName){
        playOscillator(userCounter);
        userCounter += 1;
    }
    else{
        audio.currentTime = 0;
        audio.play();
        userCounter = 0;
        timesIncorrect += 1;
        takeInput = false;
        if(timesIncorrect !== 3){
            playerProgress.html("Wrong answer!!! Play carefully else you'll loose points...");
            displayProgress();
        }
    }
    if(timesIncorrect === 3 && level !== 1){
        level -= 1;
        levelNumber.innerHTML = "Level: " + level.toString();
        levelText.innerHTML = " " + level.toString();
        completedLevel.innerHTML = " Failed ";
        inputLevel.value = level;
        userCounter = 0;
        takeInput = false;
        timesIncorrect = 0;
        currentTimesCorrect = 0;
        currentScore = (0 > currentScore - 15)? 0: currentScore - 15;
        score.innerHTML = "Score: " + currentScore;
        inputScore.value = currentScore;
        $("#mainGame").fadeOut();
        setTimeout(displayLoader, 500);
    }
    else if(timesIncorrect === 3 && level === 1){
        userCounter = 0;
        takeInput = false;
        timesIncorrect = 0;
        currentTimesCorrect = 0;
        currentScore = 0;
        score.innerHTML = "Score: 0";
        inputScore.value = 0;
        playerProgress.html("Aww...  You failed three times! Level decreased by one...");
        displayProgress();
    }
    
    if(userCounter === level){
        timesIncorrect = 0;
        takeInput = false;
        userCounter = 0;
        currentTimesCorrect += 1;
        currentScore += 5;
        score.innerHTML = "Score: " + currentScore;
        inputScore.value = currentScore;
        if(currentTimesCorrect === timesCorrect){
            level += 1;
            levelNumber.innerHTML = "Level: " + level.toString();
            levelText.innerHTML = " " + level.toString();
            inputLevel.value = level;
            completedLevel.innerHTML = " Completed ";
            currentTimesCorrect = 0;
            timesIncorrect = 0;
            userCounter = 0;
            $("#mainGame").fadeOut();
            setTimeout(displayLoader, 500);
        }
        else{
            playerProgress.html("Right answer!!! Press play button to play again...")
            displayProgress();
        }
    }
}

function reduceOpacity(event){
    if(takeInput === false)
        return;
    event.target.style.opacity = 1;
}
function increaseOpacity(event){
    if(takeInput === false)
        return;

    event.target.style.opacity = 0.5;
}

function playOscillator(currentValue){
    var startTime = context.currentTime;
    var oscillator_1 = context.createOscillator();
    var oscillator_2 = context.createOscillator();
    oscillator_1.type = "sawtooth";
    oscillator_2.type = "sawtooth";

    volume.gain.volume = 0.1;
    oscillator_1.connect(volume);
    oscillator_2.connect(volume);
    volume.connect(context.destination);

    oscillator_1.frequency.value = soundFreq[currentValue] + 1;
    oscillator_2.frequency.value = soundFreq[currentValue] - 1;

    oscillator_1.start(startTime);
    oscillator_2.start(startTime);

    oscillator_1.stop(startTime + duration);
    oscillator_2.stop(startTime + duration);
}

function displayLoader(){
    $("#continueGame").fadeIn();
    setTimeout(removeLoader, 1000);
}
function removeLoader(){
    $("#continueGame").fadeOut();
    setTimeout(displayGame, 500);
}
function playStory(){
    $("#storyPart").fadeIn();
    story.innerHTML = "Get ready to test your memory!"
    setTimeout(removeStory, 3000);
}

function resetProgress(value){
    currentScore = 0;
    currentTimesCorrect = 0;
    level = 1;
    timesIncorrect = 0;
    takeInput = false;
    inputLevel.value = "1";
    inputScore.value = "0";
    levelNumber.innerHTML = "Level: " + level.toString();
    levelText.innerHTML = " " + level.toString();
    score.innerHTML = "Score: 0";
    if(value === 0)
        removeOptions();
}
