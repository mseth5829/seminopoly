//Resize gameboard when loading page

var width = []

$("td").children().each(function() {
  width.push($(this).css("width"))
  for(var i = 0; i < width.length; i++){
    width[i]= parseInt(width[i])*0.15
    $(this).css("width", width[i])
    $("td").css("width", "")
  }
});

// Dice mechanism

var dice = document.getElementById("dice");
var dice1 = document.getElementById("dice1");
var dice2 = document.getElementById("dice2");
var roll = document.getElementById("roll");
var random1
var random2
var rollValue
var dices = ['&#9856;', '&#9857;', '&#9858;', '&#9859;', '&#9860;', '&#9861;'];
var stopped = true;
var t;

dice.addEventListener("click", stopstart);
dice.addEventListener("click", change);

function change() {
  random1 = Math.floor(Math.random()*6);
  random2 = Math.floor(Math.random()*6);
  dice1.innerHTML = dices[random1];
  dice2.innerHTML = dices[random2];
}

function stopstart() {
  if(stopped) {
    stopped = false;
    t = setInterval(change, 100);
  } else {
    setTimeout(showStatus, 500);
    clearInterval(t);
    stopped = true;
    rollValue = "";
  }
}

function showStatus() {
  rollValue = (parseInt(random1) + parseInt(random2) + 2);
  roll.textContent = "Move "+ rollValue + " spaces";
}


// After player move remember to set back to ROll the dice!
