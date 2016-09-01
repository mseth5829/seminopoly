/*Problems/to do:

-Create options for player to buy enemy's properties and vice versa?

*/



/* Resizing board/page set up  ************************************************************************************************************************************************/

var width = []

setTimeout(showBoard,2000);

function showBoard() {
  $("#helloMsg").fadeOut(600)
  $("#noBoard").fadeIn(1000).attr("id","board");
  $(".row").children().each(function() {
    width.push($(this).css("width"))
    for(var i = 0; i < width.length; i++){
      width[i]= parseInt(width[i])*0.15
      $(this).css("width", width[i])
    }
  });
}

$("#plist").hide()
$("#elist").hide()

$(".showPlayerProperties").on("click",showPlayerProperties)
$(".hidePlayerProperties").on("click",hidePlayerProperties)
$(".showEnemyProperties").on("click",showEnemyProperties)
$(".hideEnemyProperties").on("click",hideEnemyProperties)



function showPlayerProperties() {
    $("#plist").slideDown()
}

function hidePlayerProperties() {
    $("#plist").slideUp()
}

function showEnemyProperties() {
    $("#elist").slideDown()
}

function hideEnemyProperties() {
    $("#elist").slideUp()
}


/* Dice mechanism  ************************************************************************************************************************************************/

var gameStatus = "notStarted"
var playerFirstMove = true;
var enemyFirstMove = true;
var dice = document.getElementById("dice");
var dice1 = document.getElementById("dice1");
var dice2 = document.getElementById("dice2");
var roll = document.getElementById("roll");
var begin = document.getElementById("begin");
var shuffle = document.getElementById("shuffle");
var random1
var random2
var rollValue
var dices = ['&#9856;', '&#9857;', '&#9858;', '&#9859;', '&#9860;', '&#9861;'];
var stopped;
var t;

begin.addEventListener("click", ongoing);
dice.addEventListener("click", stopstart);
dice.addEventListener("click", change);
shuffle.addEventListener("click", shuffleDeck);

function ongoing() {
  gameStatus = "ongoing";
  updateCash();
  begin.textContent= "Your roll"
}

function updateCash() {
  $("#playerCash").text(playerCash);
  $("#enemyCash").text(enemyCash);
  checkBankruptcy();
  checkEnemyBankruptcy();
}

function change() {
  if(gameStatus == "ongoing"){
    random1 = Math.floor(Math.random()*6);
    random2 = Math.floor(Math.random()*6);
    dice1.innerHTML = dices[random1];
    dice2.innerHTML = dices[random2];
  }
}

function stopstart() {
  if(gameStatus == "ongoing"){
    if(stopped) {
      stopped = false;
      t = setInterval(change, 100);
    }else {
      setTimeout(showStatus, 500);
      clearInterval(t);
      stopped = true;
      rollValue = "";
    }
  }
}

//With each dice roll update where player/enemy has moved and recheck status of certain objects
function showStatus() {
  rollValue = (parseInt(random1) + parseInt(random2) + 2);
  roll.textContent = "Move "+ rollValue + " spaces";
  gameStatus = "ongoing"
  makeMove();
  checkUnmortgages();
  updateVansOwnedStatus();
}

function playerUpdate(update) {
  $("#playerUpdate").text(update);
  $("#noBoard").fadeIn(1000).attr("id","board");
}

function enemyUpdate(update) {
  $("#enemyUpdate").text(update);
}


/* Moving across the board  ************************************************************************************************************************************************/

var turn = "player"
var playerPosition
var enemyPosition

/* Depending on whether it's the enemy's or player's first move, go to position on board according to dice roll
and bring up the card options for the tile we've landed on */
function makeMove() {
  if(turn == "player" && gameStatus == "ongoing" && playerFirstMove == true){
    playerPosition = "p"+(1+rollValue);
    var toGo = document.getElementsByClassName(playerPosition);
    $(toGo).attr("id","user");
    playerFirstMove = false
    cardOptions();
    turn = "enemy";
    begin.textContent="Roll dice for enemy move";
  }else if(turn == "player" && gameStatus == "ongoing") {
    $("#user").removeAttr("id");
    playerPosition = parseInt(playerPosition.substr(1));
    if((playerPosition+rollValue)>40){
      playerPosition = "p"+((playerPosition+rollValue)-40);
      playerCash += 200;
      playerUpdate("You passed go! Collect $200")
      updateCash();
    }else{
      playerPosition = "p"+(playerPosition+rollValue);
    }
    var toGo = document.getElementsByClassName(playerPosition);
    $(toGo).attr("id","user")
    cardOptions();
    turn = "enemy";
    begin.textContent="Roll dice for enemy move";
  }else if(turn == "enemy" && gameStatus == "ongoing" && enemyFirstMove == true) {
    enemyPosition = "p"+(1+rollValue);
    var toGo = document.getElementsByClassName(enemyPosition);
    $(toGo).attr("id","enemy");
    enemyFirstMove = false
    cardOptions();
    executeEnemyStrategies();
    turn = "player";
    begin.textContent="Your roll";
  }else if(turn == "enemy" && gameStatus == "ongoing") {
    $("#enemy").removeAttr("id");
    enemyPosition = parseInt(enemyPosition.substr(1));
    if((enemyPosition+rollValue)>40){
      enemyOfferOptions()
      enemyPosition = "p"+((enemyPosition+rollValue)-40);
      enemyCash += 200
      updateCash();
      enemyUpdate("Enemy passed go! Collect $200")
    }else{
      enemyPosition = "p"+(enemyPosition+rollValue);
    }
    var toGo = document.getElementsByClassName(enemyPosition);
    $(toGo).attr("id","enemy")
    cardOptions();
    executeEnemyStrategies();
    turn = "player";
    begin.textContent="Your roll";
  }
}

//Player and Enemy Stats
var playerCash = 1500;
var enemyCash = 1500;
var currentPosition

//Bring up card options depending on where player/enemy has landed
function cardOptions () {
  if(turn == "player"){
    playerChoice = parseInt(playerPosition.substr(1));
    currentPosition = propertyCards[(playerChoice-1)];
    var type = propertyCards[(playerChoice-1)].type;
    if(type === "pCard"){ if (currentPosition.owned === "no"){                                                         //If current property isn't owned give player option to purchase
      buyOptionp()}else if (currentPosition.owned === "enemy" && currentPosition.inPlay == "yes"){payUpProperty()}    //If current property is owned by the enemy and isn't mortgaged player must pay rent
     }
    else if (type === "vCard"){ if (currentPosition.owned=== "no"){
      buyOptionv()}else if (currentPosition.owned === "enemy" && currentPosition.inPlay == "yes"){payUpVan()}
    }
    else if (type === "uCard"){ if (currentPosition.owned === "no"){
      buyOptionu()}else if (currentPosition.owned === "enemy" && currentPosition.inPlay == "yes"){payUpUtility()}
    }
    else if (type === "fcard1") {formationFee()}
    else if (type === "fcard2") {luxuryTax()}
    else if (type === "goToJail") {goToJail()
    }else if (type === "chCard" || type === "coCard"){landOnChance()}
  }else if(turn == "enemy"){
    enemyChoice = parseInt(enemyPosition.substr(1));
    currentPosition = propertyCards[(enemyChoice-1)];
    var type = propertyCards[(enemyChoice-1)].type;
    if(type === "pCard") {
      if(currentPosition.owned === "no"){enemyBuyOptionp()
      }else if(currentPosition.owned === "player" && currentPosition.inPlay == "yes"){payUpProperty()}
    }else if(type === "vCard"){
      if(currentPosition.owned === "no"){enemyBuyOptionv()
      }else if(currentPosition.owned === "player" && currentPosition.inPlay == "yes"){payUpVan()}
    }else if(type === "uCard"){
      if(currentPosition.owned === "no"){enemyBuyOptionu()
      }else if(currentPosition.owned === "player" && currentPosition.inPlay == "yes"){payUpUtility()}
    }else if(type === "fCard1"){formationFee()
    }else if(type === "fCard2"){luxuryTax()
    }else if(type === "goToJail"){goToJail()
    }else if (type === "chCard" || type === "coCard"){landOnChance()}
  }
}

/* Player moves/options ************************************************************************************************************************************************/

//Give player option to buy property card if it's not already owned
function buyOptionp() {
  var newPrompt = $("<div>").attr("id","promptp");
  var qn = $("<p>").text("Would you like to purchase?")
  var newCard = $("<div>").addClass("pcardPrompt");
  if(currentPosition.color == "yellow"){
    var name = $("<p>").addClass("name").text(currentPosition.name).css("background-color", currentPosition.color).css("color","black");
  }else{var name = $("<p>").addClass("name").text(currentPosition.name).css("background-color", currentPosition.color);}
  var l1 = $("<p>").text("Price: $"+ currentPosition.price+",Rent: $"+currentPosition.rent);
  var l2 = $("<p>").text("With minor upgrades: $"+ currentPosition.upgrade1);
  var l3 = $("<p>").text("With better upgrades: $"+ currentPosition.upgrade2);
  var l4 = $("<p>").text("With great upgrades: $"+ currentPosition.upgrade3);
  var l5 = $("<p>").text("With stellar upgrades: $"+ currentPosition.upgrade4);
  var l6 = $("<p>").text("Upgrade Cost: $"+ currentPosition.upgradeCost+ "    " + ",Mortgage Value: $"+currentPosition.mortgage);
  var cardToBuy = newCard.append(name).append(l1).append(l2).append(l3).append(l4).append(l5).append(l6);
  var button1 = $("<button>").attr("id","buy").text("Buy");
  var button2 = $("<button>").attr("id","no-buy").text("No thanks");
  newPrompt.append(qn).append(cardToBuy).append(button1).append(button2);
  newPrompt.insertAfter("#playerStats");
  $("#buy").on("click", addpCard);
  $("#no-buy").on("click", function(){$("#promptp").remove()});
}

//If player chooses to buy property card add it to deck and update values for number of color sets owned/etc
function addpCard() {
  if(playerCash < propertyCards[(playerChoice-1)].price){
    alert("Not enough cash!");
  }else{
    if(currentPosition.color == "yellow"){
      var name = $("<p>").addClass("name").text(currentPosition.name).css("background-color", currentPosition.color).css("color","black");
    }else{var name = $("<p>").addClass("name").text(currentPosition.name).css("background-color", currentPosition.color);}
    var newCard = $("<li>").addClass("vCard");
    var l1 = $("<p>").text("Price: $"+ currentPosition.price+",Rent: $"+currentPosition.rent);
    var l2 = $("<p>").text("With minor upgrades: $"+ currentPosition.upgrade1);
    var l3 = $("<p>").text("With better upgrades: $"+ currentPosition.upgrade2);
    var l4 = $("<p>").text("With great upgrades: $"+ currentPosition.upgrade3);
    var l5 = $("<p>").text("With stellar upgrades: $"+ currentPosition.upgrade4);
    var l6 = $("<p>").text("Upgrade Cost: $"+ currentPosition.upgradeCost+ "    " + ",Mortgage Value: $"+currentPosition.mortgage);
    newCard.append(name).append(l1).append(l2).append(l3).append(l4).append(l5).append(l6);
    newCard.insertBefore(".hidePlayerProperties");
    $("#promptp").remove();
    playerCash -= currentPosition.price;
    updateCash();
    currentPosition.owned="player";
    currentPosition.rentStatus="basic";
    currentPosition.inPlay="yes";
    checkPropertiesOwnedPlayer();
    checkMortgages();
    function getCardsOfSameColor (obj) {
      if(obj.type == "pCard" && obj.owned == "player" && obj.color == currentPosition.color){
        return true
      }
    }
    var toUpdate = propertyCards.filter(getCardsOfSameColor);
    if(toUpdate[0].color == "darkblue" || toUpdate[0].color == "purple"){
      for(var i =0; i<toUpdate.length; i++){
        if(toUpdate[i].numberOwnedOfSet == 0){
          toUpdate[i].numberOwnedOfSet = 1;
        }else if(toUpdate[i].numberOwnedOfSet == 1){
          toUpdate[i].numberOwnedOfSet = 2;
        }
      }
    }else{
      for(var i =0; i<toUpdate.length; i++){
        if(toUpdate[i].numberOwnedOfSet == 0){
          toUpdate[i].numberOwnedOfSet = 1;
        }else if(toUpdate[i].numberOwnedOfSet == 1){
          toUpdate[i].numberOwnedOfSet = 2;
        }else if(toUpdate[i].numberOwnedOfSet == 2){
          toUpdate[i].numberOwnedOfSet = 3;
        }
      }
    }
    playerUpdate("You just purchased the "+ currentPosition.name + " !")
  }
}


//Give player option to buy van card if it's not already owned
function buyOptionv() {
  var newPrompt = $("<div>").attr("id","promptp");
  var qn = $("<p>").text("Would you like to purchase?")
  var newCard = $("<div>").addClass("pcardPrompt");
  var name = $("<p>").addClass("name").text(currentPosition.name).css("background-color", currentPosition.color).css("color","white");
  var l1 = $("<p>").text("Price: $" + currentPosition.price);
  var l2 = $("<p>").text("Own 1: $" + currentPosition.own1);
  var l3 = $("<p>").text("Own 2: $" + currentPosition.own2);
  var l4 = $("<p>").text("Own 3: $" + currentPosition.own3);
  var l5 = $("<p>").text("Own 4: $" + currentPosition.own4);
  var l6 = $("<p>").text("Mortgage Value: $" + currentPosition.mortgage);
  var cardToBuy = newCard.append(name).append(l1).append(l2).append(l3).append(l4).append(l5).append(l6);
  var button1 = $("<button>").attr("id","buy").text("Buy");
  var button2 = $("<button>").attr("id","no-buy").text("No thanks");
  newPrompt.append(qn).append(cardToBuy).append(button1).append(button2);
  newPrompt.insertAfter("#playerStats");
  $("#buy").on("click", addvCard);
  $("#no-buy").on("click", function(){$("#promptp").remove()});
}

//If player chooses to buy van card add it to deck
function addvCard() {
  if(playerCash < propertyCards[(playerChoice-1)].price){
    alert("Not enough cash!");
  }else{
    var newCard = $("<li>").addClass("vCard");
    var name = $("<p>").addClass("name").text(currentPosition.name).css("background-color", currentPosition.color).css("color","white");
    var l1 = $("<p>").text("Price: $" + currentPosition.price);
    var l2 = $("<p>").text("Own 1: $" + currentPosition.own1);
    var l3 = $("<p>").text("Own 2: $" + currentPosition.own2);
    var l4 = $("<p>").text("Own 3: $" + currentPosition.own3);
    var l5 = $("<p>").text("Own 4: $" + currentPosition.own4);
    var l6 = $("<p>").text("Mortgage Value: $" + currentPosition.mortgage);
    newCard.append(name).append(l1).append(l2).append(l3).append(l4).append(l5).append(l6);
    newCard.insertBefore(".hidePlayerProperties")
    $("#promptp").remove();
    playerCash -= currentPosition.price;
    updateCash();
    playerUpdate("You just purchased some "+ currentPosition.name + "!")
    currentPosition.owned="player";
    currentPosition.inPlay="yes";
    checkMortgages();
    checkVansOwned();
    function getVans (obj){
      if(obj.type == "vCard" && obj.owned == "player"){
        return true
      }
    }
    var toUpdate = propertyCards.filter(getVans);
    for(var i =0; i<toUpdate.length; i++){
      if(vansOwnedPlayer == 1){
        toUpdate[i].rentStatus = "own1";
      }else if(vansOwnedPlayer == 2){
        toUpdate[i].rentStatus = "own2";
      }else if(vansOwnedPlayer == 3){
        toUpdate[i].rentStatus = "own3";
      }else if(vansOwnedPlayer ==4){
        toUpdate[i].rentStatus = "own4";
      }
    }
  }
}


//Give player option to buy utility card if it's not already owned
function buyOptionu() {
  var newPrompt = $("<div>").attr("id","promptp");
  var qn = $("<p>").text("Would you like to purchase?");
  var newCard = $("<div>").addClass("pcardPrompt");
  var name = $("<p>").addClass("name").text(currentPosition.name).css("background-color", currentPosition.color).css("color","white");
  var l1 = $("<p>").text("Price: $" + currentPosition.price);
  var l2 = $("<p>").text("Own 1 Pay 4 times dice roll");
  var l3 = $("<p>").text("Own 2: Pay 10 times dice roll");
  var l4 = $("<p>").text("Mortgage Value: $" + currentPosition.mortgage);
  var cardToBuy = newCard.append(name).append(l1).append(l2).append(l3).append(l4);
  var button1 = $("<button>").attr("id","buy").text("Buy");
  var button2 = $("<button>").attr("id","no-buy").text("No thanks");
  newPrompt.append(qn).append(cardToBuy).append(button1).append(button2);
  newPrompt.insertAfter("#playerStats");
  $("#buy").on("click", adduCard);
  $("#no-buy").on("click", function(){$("#promptp").remove()});
}

//If player chooses to buy utility card add it to deck
function adduCard() {
  if(playerCash < propertyCards[(playerChoice-1)].price){
    alert("Not enough cash!");
  }else{
    var newCard = $("<li>").addClass("uCard");
    var name = $("<p>").addClass("name").text(currentPosition.name).css("background-color", currentPosition.color).css("color","white");
    var l1 = $("<p>").text("Price: $" + currentPosition.price);
    var l2 = $("<p>").text("Own 1: Pay 4 times dice roll");
    var l3 = $("<p>").text("Own 2: Pay 10 times dice roll");
    var l4 = $("<p>").text("Mortgage Value: $" + currentPosition.mortgage);
    newCard.append(name).append(l1).append(l2).append(l3).append(l4);
    newCard.insertBefore(".hidePlayerProperties")
    $("#promptp").remove();
    playerCash -= currentPosition.price;
    updateCash();
    currentPosition.owned="player";
    currentPosition.inPlay="yes";
    currentPosition.rentStatus="own1";
    checkMortgages();
    checkUtilitiesOwned();
    if(utilitiesOwnedPlayer == 1){
      currentPosition.rentStatus="own1";
    }else if(utilitiesOwnedPlayer == 2){
      function getUtilities (obj){
        if(obj.type == "uCard" && obj.owned == "player"){
          return true
        }
      }
      var toUpdate = propertyCards.filter(getUtilities);
      for(var i =0; i<toUpdate.length; i++){
        toUpdate[i].rentStatus = "own2";
      }
    }
  playerUpdate("You just purchased the "+ currentPosition.name + "!")
  }
}

//If player/enemy lands on this tile they have to pay either 10% of their cash or $200, whatever's smaller
function formationFee() {
  if(turn == "player"){
    if(playerCash < 200){
      playerCash -= (0.1*playerCash);
    }else{
      playerCash -= 200;
    }
    updateCash();
    playerUpdate("Eek! you just had to pay some shitty fee sorry.")
  }else if (turn == "enemy"){
    if(enemyCash < 200){
      enemyCash -= (0.1*playerCash);
    }else{
      enemyCash -= 200;
    }
    updateCash();
    enemyUpdate("Muahaha looks like the enemy has some fee payments due.")
  }
}

//Pay $75 'room and board' tax if player/enemy lands here
function luxuryTax() {
  if (turn == "player"){
    if(playerCash < 75){
      checkBankruptcy();
    }else{
      playerCash -= 75
      updateCash();
      playerUpdate("Room and board. Pay up.")
    }
  }else if(turn == "enemy"){
    if(enemyCash < 75){
      checkEnemyBankruptcy();
    }else{
      enemyCash -= 75
      updateCash();
      enemyUpdate("Room and board. Pay up.")
    }
  }
}

/* Unfortunate events: rent, bankrupty and jail ************************************************************************************************************************************************/

//If enemy or player lands on a property tile they have to pay up according to upgrades made
function payUpProperty() {
  if(currentPosition.rentStatus == "basic"){
    if(turn == "player"){
      playerCash -= currentPosition.rent;
      enemyCash += currentPosition.rent;
      playerUpdate("Fork out the cash rent is due!!" + " You'll have to pay "+ currentPosition.rent)
      updateCash()
    }else if( turn == "enemy"){
      enemyCash -= currentPosition.rent;
      playerCash += currentPosition.rent;
      enemyUpdate("Looks like there's some cash coming our way. Enemy owes us "+ currentPosition.rent)
      updateCash()
    }
  }else if(currentPosition.rentStatus == "upgrade1"){
    if(turn == "player"){
      playerCash -= currentPosition.upgrade1;
      enemyCash += currentPosition.upgrade1;
      playerUpdate("Fork out the cash rent is due!!" + " You'll have to pay "+ currentPosition.upgrade1)
      updateCash()
    }else if (turn == "enemy"){
      enemyCash -= currentPosition.upgrade1;
      playerCash += currentPosition.upgrade1;
      enemyUpdate("Looks like there's some cash coming our way. Enemy owes us "+ currentPosition.upgrade1)
      updateCash()
    }
  }else if(currentPosition.rentStatus == "upgrade2"){
    if(turn == "player"){
      playerCash -= currentPosition.upgrade2;
      enemyCash += currentPosition.upgrade2;
      playerUpdate("Fork out the cash rent is due!!" + " You'll have to pay "+ currentPosition.upgrade2)
      updateCash()
    }else if(turn == "enemy"){
      enemyCash -= currentPosition.upgrade2;
      playerCash += currentPosition.upgrade2;
      enemyUpdate("Looks like there's some cash coming our way. Enemy owes us "+ currentPosition.upgrade2)
      updateCash()
    }
  }else if(currentPosition.rentStatus == "upgrade3"){
    if(turn == "player"){
      playerCash -= currentPosition.upgrade3;
      enemyCash += currentPosition.upgrade3;
      playerUpdate("Fork out the cash rent is due!!" + " You'll have to pay "+ currentPosition.upgrade3)
      updateCash()
    }else if(turn == "enemy"){
      enemyCash -= currentPosition.upgrade3;
      playerCash += currentPosition.upgrade3;
      enemyUpdate("Looks like there's some cash coming our way. Enemy owes us "+ currentPosition.upgrade3)
      updateCash()
    }
  }else if(currentPosition.rentStatus == "upgrade4"){
    if(turn == "player"){
      playerCash -= currentPosition.upgrade4;
      enemyCash += currentPosition.upgrade4;
      playerUpdate("Fork out the cash rent is due!!" + " You'll have to pay "+ currentPosition.upgrade4)
      updateCash()
    }else if(turn =="enemy"){
      enemyCash -= currentPosition.upgrade4;
      playerCash += currentPosition.upgrade4;
      enemyUpdate("Looks like there's some cash coming our way. Enemy owes us "+ currentPosition.upgrade4)
      updateCash()
    }
  }
}


//If enemy or player lands on a property tile they have to pay up according to number of vans owned
function payUpVan() {
  if(currentPosition.rentStatus == "own1"){
    if(turn == "player"){
      playerCash -= currentPosition.own1;
      enemyCash += currentPosition.own1;
      playerUpdate("Vehicle rental will cost you "+ currentPosition.own1)
      updateCash()
    }else if( turn == "enemy"){
      enemyCash -= currentPosition.own1;
      playerCash += currentPosition.own1;
      enemyUpdate("Vehicle rental costs our enemy "+ currentPosition.own1)
      updateCash()
    }
  }else if(currentPosition.rentStatus == "own2"){
    if(turn == "player"){
      playerCash -= currentPosition.own2;
      enemyCash += currentPosition.own2;
      playerUpdate("Vehicle rental will cost you "+ currentPosition.own2)
      updateCash()
    }else if( turn == "enemy"){
      enemyCash -= currentPosition.own2;
      playerCash += currentPosition.own2;
      enemyUpdate("Vehicle rental costs our enemy "+ currentPosition.own2)
      updateCash()
    }
  }else if(currentPosition.rentStatus == "own3"){
    if(turn == "player"){
      playerCash -= currentPosition.own3;
      enemyCash += currentPosition.own3;
      playerUpdate("Vehicle rental will cost you "+ currentPosition.own3)
      updateCash()
    }else if( turn == "enemy"){
      enemyCash -= currentPosition.own3;
      playerCash += currentPosition.own3;
      enemyUpdate("Vehicle rental costs our enemy "+ currentPosition.own3)
      updateCash()
    }
  }else if(currentPosition.rentStatus == "own4"){
    if(turn == "player"){
      playerCash -= currentPosition.own4;
      enemyCash += currentPosition.own4;
      playerUpdate("Vehicle rental will cost you "+ currentPosition.own4)
      updateCash()
    }else if( turn == "enemy"){
      enemyCash -= currentPosition.own4;
      playerCash += currentPosition.own4;
      enemyUpdate("Vehicle rental costs our enemy "+ currentPosition.own4)
      updateCash()
    }
  }
}

//If enemy or player lands on a property tile they have to pay up according to number of utilities owned
function payUpUtility() {
  if(currentPosition.rentStatus == "own1"){
    if(turn == "player"){
      playerCash -= (rollValue * 4);
      enemyCash += (rollValue * 4);
      playerUpdate("Rent's up! You have to pay 4 times your roll value")
      updateCash()
    }else if( turn == "enemy"){
      enemyCash -= (rollValue * 4);
      playerCash += (rollValue * 4);
      enemyUpdate("Rent's up! Enemy has to pay 4 times his roll value")
      updateCash()
    }
  }else if(currentPosition.rentStatus == "own2"){
    if(turn == "player"){
      playerCash -= (rollValue * 11);
      enemyCash += (rollValue * 11);
      playerUpdate("Rent's up! You have to pay 11 times your roll value")
      updateCash()
    }else if( turn == "enemy"){
      enemyCash -= (rollValue * 11);
      playerCash += (rollValue * 11);
      enemyUpdate("Rent's up! Enemy has to pay 11 times his roll value")
      updateCash()
    }
  }
}


function checkBankruptcy() {
//If player is bankrupt give prompt to ask if they want to mortgage anything
  if(turn === "player" && playerCash < 0){
    var newPrompt = $("<div>").attr("id","promptUpgrade");
    var qn = $("<p>").text("Oh no! You're all out of cash! Would you like to mortgage something?");
    var button1 = $("<button>").attr("id","upgradeSubmit").text("Yes");
    var button2 = $("<button>").attr("id","upgradeClose").text("No");
    newPrompt.append(qn).append(button1).append(button2);
    newPrompt.insertAfter("#playerStats");
    $("#upgradeClose").on("click", gameOver);
    $("#upgradeSubmit").on("click", function(){$("#promptUpgrade").remove()});
    $("#upgradeSubmit").on("click", playerMortgage);
  }
}

function gameOver() {
  alert("GAME OVER");
  gameStatus = "notStarted";
}

function gameOverEnemy() {
  alert("YOU WIN!!!!");
  gameStatus = "notStarted";
}

function goToJail() {
  if(turn === "player"){
    $("#user").removeAttr("id");
    var toGo = document.getElementsByClassName("p11");
    $(toGo).attr("id","user");
    turn = "enemy";
    begin.textContent="Roll dice for enemy move";
    playerCash -= (0.3 * playerCash);
    playerUpdate("Ahhh looks like you're off to jail! You end up paying bail worth "+ (0.3*playerCash))
    updateCash();
  }else if(turn === "enemy"){
    $("#enemy").removeAttr("id");
    var toGo = document.getElementsByClassName("p11");
    $(toGo).attr("id","enemy");
    turn = "player";
    begin.textContent="Your roll";
    enemyCash -= (0.3 * enemyCash);
    enemyUpdate("Hehehe looks like our pal's off to jail! He ends up paying bail worth "+ (0.3*playerCash))
    updateCash();
  }
}

/* Managing upgrades and mortgages ************************************************************************************************************************************************/

$("#buyPropertyUpgrades").on("click", buyPropertyUpgrades);


//Player option to buy property upgrades based on which color sets they own
function buyPropertyUpgrades () {
  var newPrompt = $("<div>").attr("id","promptUpgrade");
  var qn = $("<p>").text("What would you like to upgrade?");
  var select = $("<select>").addClass("styled-select");
  for(var i = 0 ; i < setsOwnedPlayer.length; i++){
    var color = setsOwnedPlayer[i];
    var newOption = $("<option>").attr("value",setsOwnedPlayer[i]).text(setsOwnedPlayer[i]);
    select.append(newOption);
  }
  var button1 = $("<button>").attr("id","upgradeSubmit").text("Submit");
  var button2 = $("<button>").attr("id","upgradeClose").text("Close");
  newPrompt.append(qn).append(select).append(button1).append(button2);
  newPrompt.insertAfter("#playerStats");
  $("#upgradeClose").on("click", function(){$("#promptUpgrade").remove()});
  $("#upgradeSubmit").on("click", addPropertyUpgrade);
  $("#upgradeSubmit").on("click", function(){$("#promptUpgrade").remove()});
}


//Buy property upgrades, which changes rent status of all properties of the same color set
function addPropertyUpgrade() {
  var currentOption = $("select").val();
  function getSet (obj){
    if(obj.color == currentOption){
      return true
    }
  }
  var setToUpgrade = propertyCards.filter(getSet);
  if(setToUpgrade[0].rentStatus == "basic"){
    if(playerCash >= (setToUpgrade[0].upgradeCost * setToUpgrade.length)){
      $.each(setToUpgrade, function(newRentStatus){this.rentStatus= "upgrade1"});
      playerCash -= (setToUpgrade[0].upgradeCost * setToUpgrade.length)
      updateCash();
      $("#playerUpdate").text($(this).text()+"You just upgraded the "+ setToUpgrade[0].color+ " set")
    } else {alert("You don't have enough cash :(")};
  }else if (setToUpgrade[0].rentStatus == "upgrade1"){
    if(playerCash >= (setToUpgrade[0].upgradeCost * setToUpgrade.length)){
      $.each(setToUpgrade, function(newRentStatus){this.rentStatus= "upgrade2"});
      playerCash -= (setToUpgrade[0].upgradeCost * setToUpgrade.length)
      updateCash();
      $("#playerUpdate").text($(this).text()+"You just upgraded the "+ setToUpgrade[0].name+ " set")
    } else {alert("You don't have enough cash :(")};
  }else if (setToUpgrade[0].rentStatus == "upgrade2"){
    if(playerCash >= (setToUpgrade[0].upgradeCost * setToUpgrade.length)){
      $.each(setToUpgrade, function(newRentStatus){this.rentStatus= "upgrade3"});
      playerCash -= (setToUpgrade[0].upgradeCost * setToUpgrade.length)
      updateCash();
      $("#playerUpdate").text($(this).text()+"You just upgraded the "+ setToUpgrade[0].name+" set")
      }else {alert("You don't have enough cash :(")}
  }else if (setToUpgrade[0].rentStatus == "upgrade3"){
    if(playerCash >= (setToUpgrade[0].upgradeCost * setToUpgrade.length)){
      $.each(setToUpgrade, function(newRentStatus){this.rentStatus= "upgrade4"});
      playerCash -= (setToUpgrade[0].upgradeCost * setToUpgrade.length)
      updateCash();
      $("#playerUpdate").text($(this).text()+"You just upgraded the "+ setToUpgrade[0].name+ " set")
      }else {alert("You don't have enough cash :(")};
  }else if(setToUpgrade[0].rentStatus == "upgrade4"){
    alert("You already have the most stellar upgrades for this")
  }
}


$("#mortgageSth").on("click", playerMortgage)

//Prompt to mortgage something
function playerMortgage() {
  var newPrompt = $("<div>").attr("id","promptUpgrade");
  var qn = $("<p>").text("What would you like to mortgage?");
  var select = $("<select>").addClass("styled-select");
  for( var i = 0 ; i < propertiesInPlay.length; i++ ){
    var notMortgaged = propertiesInPlay[i].name;
    var newOption = $("<option>").attr("value",propertiesInPlay[i].name).text(propertiesInPlay[i].name);
    select.append(newOption);
  }
  var button1 = $("<button>").attr("id","upgradeSubmit").text("Submit");
  var button2 = $("<button>").attr("id","upgradeClose").text("Close");
  newPrompt.append(qn).append(select).append(button1).append(button2);
  newPrompt.insertAfter("#playerStats");
  $("#upgradeClose").on("click", function(){$("#promptUpgrade").remove()});
  $("#upgradeSubmit").on("click", mortgageProperty);
  $("#upgradeSubmit").on("click", function(){$("#promptUpgrade").remove()});
}

//Change status of mortgaged property (no longer in play, can't collect rent)
function mortgageProperty() {
  var currentOption = $("select").val();
  function getChoice (obj){
    if(obj.name == currentOption){
      return true
    }
  }
  var toMortgage = propertyCards.filter(getChoice);
  toMortgage[0].inPlay = "no";
  playerCash += toMortgage[0].mortgage;
  // var className = toMortgage[0].position;
  // var cardOnPage= document.getElementsByClassName(className);
  // cardOnPage.textContent = "MORTGAGED"
  updateCash();
  playerUpdate("You just mortgaged the "+ toMortgage[0].name)
  checkMortgages();
  checkUnmortgages();
}

$("#unmortgageSth").on("click", playerUnmortgage)

//Player option to unmortgage property
function playerUnmortgage() {
  var newPrompt = $("<div>").attr("id","promptUpgrade");
  var qn = $("<p>").text("What would you like to unmortgage?");
  var select = $("<select>").addClass("styled-select");
  for( var i = 0 ; i < propertiesMortgaged.length; i++ ){
    var notMortgaged = propertiesMortgaged[i].name;
    var newOption = $("<option>").attr("value",propertiesMortgaged[i].name).text(propertiesMortgaged[i].name);
    select.append(newOption);
  }
  var button1 = $("<button>").attr("id","upgradeSubmit").text("Submit");
  var button2 = $("<button>").attr("id","upgradeClose").text("Close");
  newPrompt.append(qn).append(select).append(button1).append(button2);
  newPrompt.insertAfter("#playerStats");
  $("#upgradeClose").on("click", function(){$("#promptUpgrade").remove()});
  $("#upgradeSubmit").on("click", unmortgageProperty);
  $("#upgradeSubmit").on("click", function(){$("#promptUpgrade").remove()});
}

//Process unmortgaging- property becomes in play again
function unmortgageProperty() {
  var currentOption = $("select").val();
  function getChoice (obj){
    if(obj.name == currentOption){
      return true
    }
  }
  var toUnmortgage = propertyCards.filter(getChoice);
  if(playerCash>=toUnmortgage[0].mortgage){
    toUnmortgage[0].inPlay = "yes";
    playerCash -= toUnmortgage[0].mortgage;
    updateCash();
    playerUpdate("You just unmortgaged the "+ toUnmortgage[0].name)
    checkMortgages();
    checkUnmortgages();
  }else{
    alert("Not enough cash! Sorry :(")
  }
}


/* Enemy moves/tactics ************************************************************************************************************************************************/

//Conditions under which an enemy chooses to buy a property he lands on
function enemyBuyOptionp() {
  currentPosition = propertyCards[(enemyChoice-1)]
  if(enemyCash<currentPosition.price){
  }else if(enemyCash>1000){
    enemyBuyP();
  }else if(enemyCash>600){
    if(currentPosition.color !== "green" || currentPosition.color !=="darkblue"){
      enemyBuyP();
    }
  }else if(enemyCash>300){
    if(currentPosition.color == "lightblue" || currentPosition.color == "purple" || currentPosition.color == "pink"){
      enemyBuyP();
    }
  }else {
  }
}

//Process of enemy purchase of property
  function enemyBuyP() {
  var newCard = $("<li>").addClass("eCard");
  if(currentPosition.color == "yellow"){
    var name = $("<p>").addClass("name").text(currentPosition.name).css("background-color", currentPosition.color).css("color","black");
  }else{var name = $("<p>").addClass("name").text(currentPosition.name).css("background-color", currentPosition.color);}
  var l1 = $("<p>").text("Price: $"+ currentPosition.price+",Rent: $"+currentPosition.rent);
  var l2 = $("<p>").text("With minor upgrades: $"+ currentPosition.upgrade1);
  var l3 = $("<p>").text("With better upgrades: $"+ currentPosition.upgrade2);
  var l4 = $("<p>").text("With great upgrades: $"+ currentPosition.upgrade3);
  var l5 = $("<p>").text("With stellar upgrades: $"+ currentPosition.upgrade4);
  var l6 = $("<p>").text("Upgrade Cost: $"+ currentPosition.upgradeCost+ "    " + ",Mortgage Value: $"+currentPosition.mortgage);
  newCard.append(name).append(l1).append(l2).append(l3).append(l4).append(l5).append(l6);
  newCard.insertBefore(".hideEnemyProperties")
  currentPosition.owned="enemy";
  currentPosition.inPlay="yes";
  enemyCash -= currentPosition.price;
  updateCash();
  enemyUpdate("Enemy just purchased the "+ currentPosition.name)
  currentPosition.rentStatus="basic";
  function getCardsOfSameColor (obj) {
    if(obj.type == "pCard" && obj.owned == "enemy" && obj.color == currentPosition.color){
      return true
    }
  }
  var toUpdate = propertyCards.filter(getCardsOfSameColor);
  if(toUpdate[0].color == "darkblue" || toUpdate[0].color == "purple"){
    for(var i =0; i<toUpdate.length; i++){
      if(toUpdate[i].numberOwnedOfSet == 0){
        toUpdate[i].numberOwnedOfSet = 1;
      }else if(toUpdate[i].numberOwnedOfSet == 1){
        toUpdate[i].numberOwnedOfSet = 2;
      }
    }
  }else{
    for(var i =0; i<toUpdate.length; i++){
      if(toUpdate[i].numberOwnedOfSet == 0){
        toUpdate[i].numberOwnedOfSet = 1;
      }else if(toUpdate[i].numberOwnedOfSet == 1){
        toUpdate[i].numberOwnedOfSet = 2;
      }else if(toUpdate[i].numberOwnedOfSet == 2){
        toUpdate[i].numberOwnedOfSet = 3;
      }
    }
  }
}


//Conditions under which an enemy buys a van
function enemyBuyOptionv() {
  if(enemyCash>400){
    enemyBuyV();
  }
}

//Process of enemy purchasing van
function enemyBuyV () {
  var newCard = $("<li>").addClass("evCard");
  var name = $("<p>").addClass("name").text(currentPosition.name).css("background-color", currentPosition.color).css("color","white");
  var l1 = $("<p>").text("Price: $" + currentPosition.price);
  var l2 = $("<p>").text("Own 1: $" + currentPosition.own1);
  var l3 = $("<p>").text("Own 2: $" + currentPosition.own2);
  var l4 = $("<p>").text("Own 3: $" + currentPosition.own3);
  var l5 = $("<p>").text("Own 4: $" + currentPosition.own4);
  var l6 = $("<p>").text("Mortgage Value: $" + currentPosition.mortgage);
  newCard.append(name).append(l1).append(l2).append(l3).append(l4).append(l5).append(l6);
  newCard.insertBefore(".hideEnemyProperties")
  $("#promptp").remove();
  enemyCash -= currentPosition.price;
  updateCash();
  enemyUpdate("Enemy just purchased some "+ currentPosition.name)
  currentPosition.owned="enemy";
  currentPosition.inPlay="yes";
  checkVansOwned();
  function getVans (obj){
    if(obj.type == "vCard" && obj.owned == "enemy"){
      return true
    }
  }
  var toUpdate = propertyCards.filter(getVans);
  for(var i =0; i<toUpdate.length; i++){
    if(vansOwnedEnemy == 1){
      toUpdate[i].rentStatus = "own1";
    }else if(vansOwnedEnemy == 2){
      toUpdate[i].rentStatus = "own2";
    }else if(vansOwnedEnemy == 3){
      toUpdate[i].rentStatus = "own3";
    }else if(vansOwnedEnemy ==4){
      toUpdate[i].rentStatus = "own4";
    }
  }
}

//Conditions under which enemy buys a service
function enemyBuyOptionu() {
  if(enemyCash>300){
    enemyBuyU();
  }
}

//Process of enemy purchasing a service
function enemyBuyU() {
  var newCard = $("<li>").addClass("euCard");
  var name = $("<p>").addClass("name").text(currentPosition.name).css("background-color", currentPosition.color).css("color","white");
  var l1 = $("<p>").text("Price: $" + currentPosition.price);
  var l2 = $("<p>").text("Own 1: Pay 4 times dice roll");
  var l3 = $("<p>").text("Own 2: Pay 10 times dice roll");
  var l4 = $("<p>").text("Mortgage Value: $" + currentPosition.mortgage);
  newCard.append(name).append(l1).append(l2).append(l3).append(l4);
  newCard.insertBefore(".hideEnemyProperties")
  $("#promptp").remove();
  playerCash -= currentPosition.price;
  updateCash();
  enemyUpdate("Enemy just purchased the "+ currentPosition.name)
  currentPosition.owned="enemy";
  currentPosition.inPlay="yes";
  checkUtilitiesOwned();
  if(utilitiesOwnedEnemy == 1){
    currentPosition.rentStatus="own1";
  }else if(utilitiesOwnedEnemy == 2){
    function getUtilities (obj){
      if(obj.type == "uCard" && obj.owned == "enemy"){
        return true
      }
    }
    var toUpdate = propertyCards.filter(getUtilities);
    for(var i =0; i<toUpdate.length; i++){
      toUpdate[i].rentStatus = "own2";
    }
  }
}

//Miscellaneous enemy strategies
function executeEnemyStrategies() {
  enemyUpgrades();
}



//Conditions under which enemy decides to upgrade his properties
function enemyUpgrades() {
  for(var i = 0 ; i < setsOwnedEnemy.length; i++){
    var colorSet = setsOwnedEnemy[i];
    function getColorSet (obj){
      if(obj.color == colorSet && obj.owned == "enemy"){
        return true
      }
    };
    var toUpgrade = propertyCards.filter(getColorSet);
    if((toUpgrade[0].upgradeCost * 3)>enemyCash){
    }else{
      if(toUpgrade[0].rentStatus == "basic"){
        $.each(toUpgrade, function(newRentStatus){this.rentStatus= "upgrade1"});
        enemyCash -= (toUpgrade[0].upgradeCost * toUpgrade.length)
        updateCash();
        $("#enemyUpdate").text($(this).text()+"Enemy just upgraded his "+ toUpgrade[i].color + "set")
      }else if (toUpgrade[0].rentStatus == "upgrade1"){
        $.each(toUpgrade, function(newRentStatus){this.rentStatus= "upgrade2"});
        enemyCash -= (toUpgrade[0].upgradeCost * toUpgrade.length)
        updateCash();
        $("#enemyUpdate").text($(this).text()+"Enemy just upgraded his "+ toUpgrade[i].color + "set")
      }else if (toUpgrade[0].rentStatus == "upgrade2"){
        $.each(toUpgrade, function(newRentStatus){this.rentStatus= "upgrade3"});
        enemyCash -= (toUpgrade[0].upgradeCost * toUpgrade.length)
        updateCash();
        $("#enemyUpdate").text($(this).text()+"Enemy just upgraded his "+ toUpgrade[i].color + "set")
      }else if(toUpgrade[0].rentStatus == "upgrade3"){
        $.each(toUpgrade, function(newRentStatus){this.rentStatus= "upgrade4"});
        enemyCash -= (toUpgrade[0].upgradeCost * toUpgrade.length)
        updateCash();
        $("#enemyUpdate").text($(this).text()+"Enemy just upgraded his "+ toUpgrade[i].color + "set")
      }
    }
  }
}

function checkEnemyBankruptcy() {
  if(enemyCash<0){
    enemyMortgage();
  }
  checkagain()
}

function checkagain() {
  if(enemyCash<0){
    gameOverEnemy()
  }
}

//Process of what enemy will choose to mortgage first
function enemyMortgage() {
  function mortgageUcards(obj) {
    if(obj.type == "uCard" && obj.owned == "enemy"){
      return true
    }
  }
  var toMortgageU = propertyCards.filter(mortgageUcards);

  function mortgageVcards(obj) {
    if(obj.type == "vCard" && obj.owned == "enemy"){
      return true
    }
  }
  var toMortgageV = propertyCards.filter(mortgageVcards);


  function mortgagePcards2(obj) {
    if(obj.type == "pCard" && obj.owned == "enemy" && obj.numberOwnedOfSet == 1 ){
      if(obj.color == "darkblue" || obj.color == "purple"){
        return true
      }
    }
  }
  var toMortgageP2 = propertyCards.filter(mortgagePcards2);


  function mortgagePcards3(obj) {
    if(obj.type == "pCard" && obj.owned == "enemy" && obj.numberOwnedOfSet == 1 ){
      if(obj.color !== "darkblue" || obj.color !== "purple"){
        return true
      }
    }
  }
  var toMortgageP3 = propertyCards.filter(mortgagePcards3);

  function mortgagePcards1(obj) {
    if(obj.type == "pCard" && obj.owned == "enemy" && obj.numberOwnedOfSet == 2 ){
      if(obj.color !== "darkblue" || obj.color !== "purple"){
        return true
      }
    }
  }
  var toMortgageP1 = propertyCards.filter(mortgagePcards1);

  function mortgagePcardsRest(obj) {
    if(obj.type == "pCard" && obj.owned == "enemy"){
        return true
    }
  }
  var toMortgagePRest = propertyCards.filter(mortgagePcardsRest);

  if(toMortgageU.length>0){
    for(var i =0; i<toMortgageU.length; i++){
      toMortgageU[i].inPlay = "no";
      enemyCash += toMortgageU[i].mortgage;
      updateCash();
      enemyUpdate("Enemy just mortgaged the "+ toMortgageU[i].name)
    }
  }else if(toMortgageV.length>0){
    for(var i =0; i<toMortgageU.length; i++){
      toMortgageV[i].inPlay = "no";
      enemyCash += toMortgageV[i].mortgage;
      updateCash();
      enemyUpdate("Enemy just mortgaged the "+ toMortgageV[i].name)
    }
  }else if (toMortgageP2.length>0){
    for(var i =0; i<toMortgageP2.length; i++){
      toMortgageP2[i].inPlay = "no";
      enemyCash += toMortgageP2[i].mortgage;
      updateCash();
      enemyUpdate("Enemy just mortgaged the "+ toMortgageP2[i].name)
    }
  }else if (toMortgageP3.length>0){
    for(var i =0; i<toMortgageP3.length; i++){
      toMortgageP3[i].inPlay = "no";
      enemyCash += toMortgageP3[i].mortgage;
      updateCash();
      enemyUpdate("Enemy just mortgaged the "+ toMortgageP3[i].name)
    }
  }else if (toMortgageP1.length>0){
    for(var i =0; i<toMortgageP1.length; i++){
      toMortgageP1[i].inPlay = "no";
      enemyCash += toMortgageP1[i].mortgage;
      updateCash();
      enemyUpdate("Enemy just mortgaged the "+ toMortgageP1[i].name)
    }
  }else if (toMortgagePRest.length>0){
    for(var i =0; i<toMortgagePRest.length; i++){
      toMortgagePRest[i].inPlay = "no";
      enemyCash += toMortgagePRest[i].mortgage;
      updateCash();
      enemyUpdate("Enemy just mortgaged the "+ toMortgagePRest[i].name)
    }
  }
}


/* Shuffle mode ************************************************************************************************************************************************/

var playerDeckNumbers = [];
var enemyDeckNumbers = [];
var playerDeck = [];
var enemyDeck = [];

//Randomly distribute cards between player and enemy
function shuffleDeck() {
  var numberArray = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27];
  for(var i = 0 ; i<14; i++){
    var randomNumber = Math.floor(Math.random() * numberArray.length);
    var deckNumberArray = numberArray.splice(randomNumber, 1);
    var deckNumber = deckNumberArray[0];
    playerDeckNumbers.push(deckNumber);
  }
  enemyDeckNumbers = numberArray
  createPlayerCards();
  createEnemyCards();
  $("#begin").text("Click here to begin game")
  checkVansOwned()
  checkUtilitiesOwned()
  checkPropertiesOwnedEnemy()
  checkPropertiesOwnedPlayer()
  checkMortgages()
  checkUnmortgages()
}

//Create and attach all player cards to player deck
function createPlayerCards() {
  for(var i = 0; i<14; i++){
    // console.log("working")
    var cardNumber = playerDeckNumbers[i];
    var newCard = playableCards[cardNumber];
    playerDeck.push(newCard);
    if(playerDeck[i].type == "pCard"){
      var newCard = $("<li>").addClass("pCard");
      if(playerDeck[i].color == "yellow"){
        var name = $("<p>").addClass("name").text(playerDeck[i].name).css("background-color", playerDeck[i].color).css("color","black");
      }else{var name = $("<p>").addClass("name").text(playerDeck[i].name).css("background-color", playerDeck[i].color);}
      var l1 = $("<p>").text("Price: $"+ playerDeck[i].price+",Rent: $"+playerDeck[i].rent);
      var l2 = $("<p>").text("With minor upgrades: $"+ playerDeck[i].upgrade1);
      var l3 = $("<p>").text("With better upgrades: $"+ playerDeck[i].upgrade2);
      var l4 = $("<p>").text("With great upgrades: $"+ playerDeck[i].upgrade3);
      var l5 = $("<p>").text("With stellar upgrades: $"+ playerDeck[i].upgrade4);
      var l6 = $("<p>").text("Upgrade Cost: $"+ playerDeck[i].upgradeCost+ "    " + ",Mortgage Value: $"+playerDeck[i].mortgage);
      newCard.append(name).append(l1).append(l2).append(l3).append(l4).append(l5).append(l6);
      newCard.insertBefore(".hidePlayerProperties")
      $("#promptp").remove();
      playerDeck[i].owned="player";
      playerDeck[i].rentStatus="basic";
      playerDeck[i].inPlay="yes";
    } else if(playerDeck[i].type == "vCard"){
      var newCard = $("<li>").addClass("vCard");
      var name = $("<p>").addClass("name").text(playerDeck[i].name).css("background-color", playerDeck[i].color).css("color","white");
      var l1 = $("<p>").text("Price: $" + playerDeck[i].price);
      var l2 = $("<p>").text("Own 1: $" + playerDeck[i].own1);
      var l3 = $("<p>").text("Own 2: $" + playerDeck[i].own2);
      var l4 = $("<p>").text("Own 3: $" + playerDeck[i].own3);
      var l5 = $("<p>").text("Own 4: $" + playerDeck[i].own4);
      var l6 = $("<p>").text("Mortgage Value: $" + playerDeck[i].mortgage);
      newCard.append(name).append(l1).append(l2).append(l3).append(l4).append(l5).append(l6);
      newCard.insertBefore(".hidePlayerProperties")
      playerDeck[i].owned="player";
      playerDeck[i].inPlay="yes";
      checkVansOwned();
      function getVans (obj){
        if(obj.type == "vCard" && obj.owned == "player"){
          return true
        }
      }
      var toUpdateV = propertyCards.filter(getVans);
      for(var y =0; y<toUpdateV.length; y++){
        if(vansOwnedPlayer == 1){
          toUpdateV[y].rentStatus = "own1";
        }else if(vansOwnedPlayer == 2){
          toUpdateV[y].rentStatus = "own2";
        }else if(vansOwnedPlayer == 3){
          toUpdateV[y].rentStatus = "own3";
        }else if(vansOwnedPlayer ==4){
          toUpdateV[y].rentStatus = "own4";
        }
      }
    }else if(playerDeck[i].type == "uCard"){
      var newCard = $("<li>").addClass("uCard");
      var name = $("<p>").addClass("name").text(playerDeck[i].name).css("background-color", playerDeck[i].color).css("color","white");
      var l1 = $("<p>").text("Price: $" + playerDeck[i].price);
      var l2 = $("<p>").text("Own 1: Pay 4 times dice roll");
      var l3 = $("<p>").text("Own 2: Pay 10 times dice roll");
      var l4 = $("<p>").text("Mortgage Value: $" + playerDeck[i].mortgage);
      newCard.append(name).append(l1).append(l2).append(l3).append(l4);
      newCard.insertBefore(".hidePlayerProperties")
      playerDeck[i].owned="player";
      playerDeck[i].inPlay="yes";
      playerDeck[i].rentStatus="own1";
      checkUtilitiesOwned();
      if(utilitiesOwnedPlayer == 1){
        playerDeck[i].rentStatus="own1";
      }else if(utilitiesOwnedPlayer == 2){
        function getUtilities (obj){
          if(obj.type == "uCard" && obj.owned == "player"){
            return true
          }
        }
        var toUpdate = propertyCards.filter(getUtilities);
        for(var j =0; j<toUpdate.length; j++){
          toUpdate[j].rentStatus = "own2";
        }
      }
    }
  }
}

//Create and distribute all enemy cards to enemy deck
function createEnemyCards() {
  for(var i = 0; i<14; i++){
    var cardNumber = enemyDeckNumbers[i];
    var newCard = playableCards[cardNumber];
    enemyDeck.push(newCard);
    if(enemyDeck[i].type == "pCard"){
      var newCard = $("<li>").addClass("eCard");
      if(enemyDeck[i].color == "yellow"){
        var name = $("<p>").addClass("name").text(enemyDeck[i].name).css("background-color", enemyDeck[i].color).css("color","black");
      }else{var name = $("<p>").addClass("name").text(enemyDeck[i].name).css("background-color", enemyDeck[i].color);}
      var l1 = $("<p>").text("Price: $"+ enemyDeck[i].price+",Rent: $"+enemyDeck[i].rent);
      var l2 = $("<p>").text("With minor upgrades: $"+ enemyDeck[i].upgrade1);
      var l3 = $("<p>").text("With better upgrades: $"+ enemyDeck[i].upgrade2);
      var l4 = $("<p>").text("With great upgrades: $"+ enemyDeck[i].upgrade3);
      var l5 = $("<p>").text("With stellar upgrades: $"+ enemyDeck[i].upgrade4);
      var l6 = $("<p>").text("Upgrade Cost: $"+ enemyDeck[i].upgradeCost+ "    " + ",Mortgage Value: $"+enemyDeck[i].mortgage);
      newCard.append(name).append(l1).append(l2).append(l3).append(l4).append(l5).append(l6);
      newCard.insertBefore(".hideEnemyProperties")
      $("#promptp").remove();
      enemyDeck[i].owned="enemy";
      enemyDeck[i].rentStatus="basic";
      enemyDeck[i].inPlay="yes";
    } else if(enemyDeck[i].type == "vCard"){
      var newCard = $("<li>").addClass("evCard");
      var name = $("<p>").addClass("name").text(enemyDeck[i].name).css("background-color", enemyDeck[i].color).css("color","white");
      var l1 = $("<p>").text("Price: $" + enemyDeck[i].price);
      var l2 = $("<p>").text("Own 1: $" + enemyDeck[i].own1);
      var l3 = $("<p>").text("Own 2: $" + enemyDeck[i].own2);
      var l4 = $("<p>").text("Own 3: $" + enemyDeck[i].own3);
      var l5 = $("<p>").text("Own 4: $" + enemyDeck[i].own4);
      var l6 = $("<p>").text("Mortgage Value: $" + enemyDeck[i].mortgage);
      newCard.append(name).append(l1).append(l2).append(l3).append(l4).append(l5).append(l6);
      newCard.insertBefore(".hideEnemyProperties")
      enemyDeck[i].owned="enemy";
      enemyDeck[i].inPlay="yes";
      checkVansOwned();
      function getVans (obj){
        if(obj.type == "vCard" && obj.owned == "enemy"){
          return true
        }
      }
      var toUpdateV = propertyCards.filter(getVans);
      for(var y =0; y<toUpdateV.length; y++){
        if(vansOwnedEnemy == 1){
          toUpdateV[y].rentStatus = "own1";
        }else if(vansOwnedEnemy == 2){
          toUpdateV[y].rentStatus = "own2";
        }else if(vansOwnedEnemy == 3){
          toUpdateV[y].rentStatus = "own3";
        }else if(vansOwnedEnemy ==4){
          toUpdateV[y].rentStatus = "own4";
        }
      }
    }else if(enemyDeck[i].type == "uCard"){
      var newCard = $("<li>").addClass("euCard");
      var name = $("<p>").addClass("name").text(enemyDeck[i].name).css("background-color", enemyDeck[i].color).css("color","white");
      var l1 = $("<p>").text("Price: $" + enemyDeck[i].price);
      var l2 = $("<p>").text("Own 1: Pay 4 times dice roll");
      var l3 = $("<p>").text("Own 2: Pay 10 times dice roll");
      var l4 = $("<p>").text("Mortgage Value: $" + enemyDeck[i].mortgage);
      newCard.append(name).append(l1).append(l2).append(l3).append(l4);
      newCard.insertBefore(".hideEnemyProperties")
      enemyDeck[i].owned="enemy";
      enemyDeck[i].inPlay="yes";
      enemyDeck[i].rentStatus="own1";
      checkUtilitiesOwned();
      if(utilitiesOwnedEnemy == 1){
        enemyDeck[i].rentStatus="own1";
      }else if(utilitiesOwnedEnemy == 2){
        function getUtilities (obj){
          if(obj.type == "uCard" && obj.owned == "enemy"){
            return true
          }
        }
        var toUpdate = propertyCards.filter(getUtilities);
        for(var j =0; j<toUpdate.length; j++){
          toUpdate[j].rentStatus = "own2";
        }
      }
    }
  }
}


/* Information storage for cards ************************************************************************************************************************************************/

var propertyCards = [
  {
    type: "go",
    position: "p1"
  },
  {
    type: "pCard",
    name: "Wreck Room",
    price: 60,
    rent: 2,
    upgrade1: 10,
    upgrade2: 30,
    upgrade3: 90,
    upgrade4: 160,
    upgradeCost: 50,
    mortgage: 30,
    color: "purple",
    owned: "no",
    position: "p2"
  },
  {
    type: "coCard",
    position: "p3"
  },
  {
    type: "pCard",
    name: "Boiler Room",
    price: 60,
    rent: 4,
    upgrade1: 20,
    upgrade2: 60,
    upgrade3: 180,
    upgrade4: 320,
    upgradeCost: 50,
    mortgage: 30,
    color: "purple",
    owned: "no",
    position: "p4"
  },
  {
    type: "fcard1",
    position: "p5"
  },
  {
    type: "vCard",
    name: "Red Van",
    price: 200,
    own1: 25,
    own2: 50,
    own3: 100,
    own4: 200,
    mortgage: 100,
    color: "black",
    owned: "no",
    position: "p6"

  },
  {
    type: "pCard",
    name: "Tennis Courts",
    price: 100,
    rent: 6,
    upgrade1: 30,
    upgrade2: 90,
    upgrade3: 270,
    upgrade4: 400,
    upgradeCost: 50,
    mortgage: 50,
    color: "lightblue",
    owned: "no",
    position: "p7"
  },
  {
    type: "chCard",
    position: "p8"
  },
  {
    type: "pCard",
    name: "Laundry Room",
    price: 100,
    rent: 6,
    upgrade1: 30,
    upgrade2: 90,
    upgrade3: 270,
    upgrade4: 400,
    upgradeCost: 50,
    mortgage: 50,
    color: "lightblue",
    owned: "no",
    position: "p9"
  },
  {
    type: "pCard",
    name: "Weight Room",
    price: 120,
    rent: 8,
    upgrade1: 40,
    upgrade2: 100,
    upgrade3: 300,
    upgrade4: 450,
    upgradeCost: 50,
    mortgage: 60,
    color: "lightblue",
    owned: "no",
    position: "p10"
  },
  {
    type: "jail",
    position: "p11"
  },
  {
    type: "pCard",
    name: "The Dorm",
    price: 140,
    rent: 10,
    upgrade1: 50,
    upgrade2: 150,
    upgrade3: 450,
    upgrade4: 625,
    upgradeCost: 100,
    mortgage: 70,
    color: "pink",
    owned: "no",
    position: "p12"
  },
  {
    type: "uCard",
    name: "Kenrick Light and Magic",
    price: 150,
    own1: 4,
    own2: 10,
    mortgage: 75,
    color: "black",
    owned: "no",
    position: "p13"
  },
  {
    type: "pCard",
    name: "The Library",
    price: 140,
    rent: 10,
    upgrade1: 50,
    upgrade2: 150,
    upgrade3: 450,
    upgrade4: 625,
    upgradeCost: 100,
    mortgage: 70,
    color: "pink",
    owned: "no",
    position: "p14"
  },
  {
    type: "pCard",
    name: "The Auditorium",
    price: 160,
    rent: 12,
    upgrade1: 60,
    upgrade2: 180,
    upgrade3: 500,
    upgrade4: 700,
    upgradeCost: 100,
    mortgage: 80,
    color: "pink",
    owned: "no",
    position: "p15"
  },
  {
    type: "vCard",
    name: "Silver Van",
    price: 200,
    own1: 25,
    own2: 50,
    own3: 100,
    own4: 200,
    mortgage: 100,
    color: "black",
    owned: "no",
    position: "p16"
  },
  {
    type: "pCard",
    name: "The Gym",
    price: 180,
    rent: 14,
    upgrade1: 70,
    upgrade2: 200,
    upgrade3: 550,
    upgrade4: 700,
    upgradeCost: 100,
    mortgage: 90,
    color: "orange",
    owned: "no",
    position: "p17"
  },
  {
    type: "coCard",
    position: "p18"
  },
  {
    type: "pCard",
    name: "The Heights",
    price: 180,
    rent: 14,
    upgrade1: 70,
    upgrade2: 200,
    upgrade3: 550,
    upgrade4: 700,
    upgradeCost: 100,
    mortgage: 90,
    color: "orange",
    owned: "no",
    position: "p19"
  },
  {
    type: "pCard",
    name: "The Refectory",
    price: 200,
    rent: 16,
    upgrade1: 80,
    upgrade2: 220,
    upgrade3: 600,
    upgrade4: 800,
    upgradeCost: 100,
    mortgage: 100,
    color: "orange",
    owned: "no",
    position: "p20"
  },
  {
    type: "freeParking",
    position: "p21"
  },
  {
    type: "pCard",
    name: "The Lobby",
    price: 220,
    rent: 18,
    upgrade1: 90,
    upgrade2: 250,
    upgrade3: 700,
    upgrade4: 875,
    upgradeCost: 150,
    mortgage: 110,
    color: "red",
    owned: "no",
    position: "p22"
  },
  {
    type: "chCard",
    position: "p23"
  },
  {
    type: "pCard",
    name: "The Courtyard",
    price: 220,
    rent: 18,
    upgrade1: 90,
    upgrade2: 250,
    upgrade3: 700,
    upgrade4: 875,
    upgradeCost: 150,
    mortgage: 110,
    color: "red",
    owned: "no",
    position: "p24"
  },
  {
    type: "pCard",
    name: "Priest Dining Room",
    price: 240,
    rent: 20,
    upgrade1: 100,
    upgrade2: 300,
    upgrade3: 750,
    upgrade4: 925,
    upgradeCost: 150,
    mortgage: 120,
    color: "red",
    owned: "no",
    position: "p25"
  },
  {
    type: "vCard",
    name: "White Van",
    price: 200,
    own1: 25,
    own2: 50,
    own3: 100,
    own4: 200,
    mortgage: 100,
    color: "black",
    owned: "no",
    position: "p26"
  },
  {
    type: "pCard",
    name: "Convent Chapel",
    price: 260,
    rent: 22,
    upgrade1: 110,
    upgrade2: 330,
    upgrade3: 800,
    upgrade4: 975,
    upgradeCost: 150,
    mortgage: 130,
    color: "yellow",
    owned: "no",
    position: "p27"
  },
  {
    type: "pCard",
    name: "Mary Mother of the Word Chapel",
    price: 260,
    rent: 22,
    upgrade1: 110,
    upgrade2: 330,
    upgrade3: 800,
    upgrade4: 975,
    upgradeCost: 150,
    mortgage: 130,
    color: "yellow",
    owned: "no",
    position: "p28"
  },
  {
    type: "uCard",
    name: "Student Computer Service",
    price: 150,
    own1: 4,
    own2: 10,
    mortgage: 75,
    color: "black",
    owned: "no",
    position: "p29"
  },
  {
    type: "pCard",
    name: "St Charles Chapel",
    price: 280,
    rent: 24,
    upgrade1: 120,
    upgrade2: 360,
    upgrade3: 850,
    upgrade4: 1025,
    upgradeCost: 150,
    mortgage: 140,
    color: "yellow",
    owned: "no",
    position: "p30"
  },
  {
    type: "goToJail",
    position: "p31"
  },
  {
    type: "pCard",
    name: "Glennon Lounge",
    price: 300,
    rent: 26,
    upgrade1: 130,
    upgrade2: 390,
    upgrade3: 900,
    upgrade4: 1100,
    upgradeCost: 200,
    mortgage: 150,
    color: "green",
    owned: "no",
    position: "p32"
  },
  {
    type: "pCard",
    name: "Priest's Lounge",
    price: 300,
    rent: 26,
    upgrade1: 130,
    upgrade2: 390,
    upgrade3: 900,
    upgrade4: 1100,
    upgradeCost: 200,
    mortgage: 150,
    color: "green",
    owned: "no",
    position: "p33"
  },
  {
    type: "coCard",
    position: "p34"
  },
  {
    type: "pCard",
    name: "Kenrick Lounge",
    price: 320,
    rent: 28,
    upgrade1: 150,
    upgrade2: 450,
    upgrade3: 1000,
    upgrade4: 1200,
    upgradeCost: 200,
    mortgage: 160,
    color: "green",
    owned: "no",
    position: "p35"
  },
  {
    type: "vCard",
    name: "Sister's Car",
    price: 200,
    own1: 25,
    own2: 50,
    own3: 100,
    own4: 200,
    mortgage: 100,
    color: "black",
    owned: "no",
    position: "p36"
  },
  {
    type: "chCard",
    position: "p37"
  },
  {
    type: "pCard",
    name: "St Joseph Chapel",
    price: 350,
    rent: 35,
    upgrade1: 175,
    upgrade2: 500,
    upgrade3: 1100,
    upgrade4: 1300,
    upgradeCost: 200,
    mortgage: 175,
    color: "darkblue",
    owned: "no",
    position: "p38"
  },
  {
    type: "fCard2",
    position: "p39"
  },
  {
    type: "pCard",
    name: "The Tower",
    price: 400,
    rent: 50,
    upgrade1: 200,
    upgrade2: 600,
    upgrade3: 1400,
    upgrade4: 1700,
    upgradeCost: 200,
    mortgage: 200,
    color: "darkblue",
    owned: "no",
    position: "p40"
  }
]

/* Checking for properties/assets owned ************************************************************************************************************************************************/


//Finding out if player/enemy owns a set (all properties of the same color)
var propertyColors = ["purple", "lightblue", "pink", "orange", "red", "yellow", "green", "darkblue"];
var propertyNumber = [2,3,3,3,3,3,3,2];
var setsOwnedPlayer = [];
var setsOwnedEnemy = [];

function checkPropertiesOwnedPlayer(){
  setsOwnedPlayer = [];
  for(var i = 0; i<propertyColors.length; i++){
    function getColor(obj){
      if(obj.color == propertyColors[i] && obj.owned == "player" && obj.inPlay == "yes"){
        return true
      }
    }
    var ownedStatus = propertyCards.filter(getColor);
    if(ownedStatus.length == propertyNumber[i]){
      setsOwnedPlayer.push(propertyColors[i]);
    }
  }
}

function checkPropertiesOwnedEnemy() {
  setsOwnedEnemy = [];
  for(var i = 0; i<propertyColors.length; i++){
    function getColor(obj){
      if(obj.color == propertyColors[i] && obj.owned == "enemy" && obj.inPlay == "yes"){
        return true
      }
    }
    var ownedStatus = propertyCards.filter(getColor);
    if(ownedStatus.length == propertyNumber[i]){
      setsOwnedEnemy.push(propertyColors[i]);
    }
  }
}

//Finding out how many of a color set a player/enemy owns

function numberInSet() {

}


//Checking ownership status of vans

var vansOwnedPlayer  //If number of vans owned is 1, rentStatus = own1
var vansOwnedEnemy  //If number of vans owned is 1, rentStatus = own1

function checkVansOwned() {
  function getVansPlayer(obj){
    if(obj.type == "vCard" && obj.owned == "player" && obj.inPlay == "yes"){
      return true;
    }
  }
  var ownedStatusPlayer = propertyCards.filter(getVansPlayer);
  vansOwnedPlayer = ownedStatusPlayer.length;
  function getVansEnemy(obj){
    if(obj.type == "vCard" && obj.owned == "enemy" && obj.inPlay == "yes"){
      return true;
    }
  }
  var ownedStatusEnemy = propertyCards.filter(getVansEnemy);
  vansOwnedEnemy = ownedStatusEnemy.length;
}

//Checking owndership of utilities
var utitliesOwnedPlayer      //If number of utities owned is 1, rent is 4 * (random1+random2)
var utilitiesOwnedEnemy

function checkUtilitiesOwned() {
  function getUtilitiesPlayer(obj){
    if(obj.type == "uCard" && obj.owned == "player" && obj.inPlay == "yes"){
      return true;
    }
  }
  var ownedStatusPlayer = propertyCards.filter(getUtilitiesPlayer);
  utilitiesOwnedPlayer = ownedStatusPlayer.length;
  function getUtilitiesEnemy(obj){
    if(obj.type == "uCard" && obj.owned == "enemy"){
      return true;
    }
  }
  var ownedStatusEnemy = propertyCards.filter(getUtilitiesEnemy);
  utilitiesOwnedEnemy = ownedStatusEnemy.length;
}


//Checking mortgage status of properties
var propertiesInPlay
var propertiesMortgaged

function checkMortgages() {
  function getMortgages(obj){
    if(obj.inPlay == "yes" && obj.owned == "player"){
      return true;
    }
  }
  var mortageStatus = propertyCards.filter(getMortgages);
  propertiesInPlay = mortageStatus
}

function checkUnmortgages() {
  function getMortgages(obj){
    if(obj.inPlay == "no" && obj.owned == "player"){
      return true;
    }
  }
  var mortageStatus = propertyCards.filter(getMortgages);
  propertiesMortgaged = mortageStatus
}


//Get playable cards for shuffle mode
function getPlayableCards(obj) {
  if(obj.type == "pCard" || obj.type == "vCard" || obj.type == "uCard"){
    return true
  }
}
var playableCards = propertyCards.filter(getPlayableCards);



//Constantly updating van owership status
function updateVansOwnedStatus(){
  function getVansPlayer (obj) {
    if(obj.type == "vCard" && obj.owned == "player" && obj.inPlay == "yes"){
    return true;
    }
  }
  var ownedStatusPlayer = propertyCards.filter(getVansPlayer);
  if(vansOwnedPlayer == 1){
    $.each(ownedStatusPlayer, function(newStatus){this.rentStatus= "own1"})
  }else if(vansOwnedPlayer == 2){
    $.each(ownedStatusPlayer, function(newStatus){this.rentStatus= "own2"})
  }else if(vansOwnedPlayer == 3){
    $.each(ownedStatusPlayer, function(newStatus){this.rentStatus= "own3"})
  }else if(vansOwnedPlayer == 4){
    $.each(ownedStatusPlayer, function(newStatus){this.rentStatus= "own4"})
  }

  function getVansEnemy (obj) {
    if(obj.type == "vCard" && obj.owned == "enemy" && obj.inPlay == "yes"){
    return true;
    }
  }
  var ownedStatusEnemy = propertyCards.filter(getVansEnemy);
  if(vansOwnedEnemy == 1){
    $.each(ownedStatusEnemy, function(newStatus){this.rentStatus= "own1"})
  }else if(vansOwnedEnemy == 2){
    $.each(ownedStatusEnemy, function(newStatus){this.rentStatus= "own2"})
  }else if(vansOwnedEnemy == 3){
    $.each(ownedStatusEnemy, function(newStatus){this.rentStatus= "own3"})
  }else if(vansOwnedEnemy == 4){
    $.each(ownedStatusEnemy, function(newStatus){this.rentStatus= "own4"})
  }
}



/* Handling summaries of player/enemy asset information ************************************************************************************************************************************************/

$("#assetSummaryPlayer").on("click",showPlayerSummary)

var playerMortgageSummary = []
var playerPropertiesinPlaySummary = []
var playerPropertiesinPlayColors = []
var playerBasicRentSummary = []
var playerU1Summary = []
var playerU2Summary = []
var playerU3Summary = []
var playerU4Summary = []

//Prompt box for player summary
function showPlayerSummary(){
  updatePlayerSummary();
  var newStatus = $("<div>").attr("id","assetSummaryP");
  var heading = $("<h1>").text("PlayerSummary")
  var l1 = $("<p>").text("Mortgaged Properties")
  var s1 = $("<select>").addClass("styled-select")
  for(var i = 0 ; i < playerMortgageSummary.length; i++){
    var newOption = $("<option>").text(playerMortgageSummary[i]);
    s1.append(newOption);
  }
  var l2 = $("<p>").text("Properties in Play")
  var s2 = $("<select>").addClass("styled-select")
  for(var i = 0 ; i < playerPropertiesinPlaySummary.length; i++){
    var newOption = $("<option>").text(playerPropertiesinPlaySummary[i]+ " from the " + playerPropertiesinPlayColors[i]+ " set");
    s2.append(newOption);
  }
  var l3 = $("<p>").text("Basic Rent")
  var s3 = $("<select>").addClass("styled-select")
  for(var i = 0 ; i < playerBasicRentSummary.length; i++){
    var newOption = $("<option>").text(playerBasicRentSummary[i]);
    s3.append(newOption);
  }
  var l4 = $("<p>").text("On 1st upgrade")
  var s4 = $("<select>").addClass("styled-select")
  for(var i = 0 ; i < playerU1Summary.length; i++){
    var newOption = $("<option>").text(playerU1Summary[i]);
    s4.append(newOption);
  }
  var l5 = $("<p>").text("On 2nd upgrade")
  var s5 = $("<select>").addClass("styled-select")
  for(var i = 0 ; i < playerU2Summary.length; i++){
    var newOption = $("<option>").text(playerU2Summary[i]);
    s5.append(newOption);
  }
  var l6 = $("<p>").text("On 3rd upgrade")
  var s6 = $("<select>").addClass("styled-select")
  for(var i = 0 ; i < playerU3Summary.length; i++){
    var newOption = $("<option>").text(playerU3Summary[i]);
    s6.append(newOption);
  }
  var l7 = $("<p>").text("On 4th upgrade")
  var s7 = $("<select>").addClass("styled-select")
  for(var i = 0 ; i < playerU4Summary.length; i++){
    var newOption = $("<option>").text(playerU4Summary[i]);
    s7.append(newOption);
  }
  var button = $("<button>").addClass("closeSummary").text("Close");
  newStatus.append(heading).append(l1).append(s1).append(l2).append(s2).append(l3).append(s3).append(l4).append(s4).append(l5).append(s5).append(l6).append(s6).append(l7).append(s7).append(button)
  newStatus.insertAfter("#playerStats");
  $(".closeSummary").on("click",function(){$("#assetSummaryP").remove()})
}



//Update player summary based on current status of propertyCard array
function updatePlayerSummary() {
  playerMortgageSummary = []
  playerPropertiesinPlaySummary = []
  playerPropertiesinPlayColors = []
  playerBasicRentSummary = []
  playerU1Summary = []
  playerU2Summary = []
  playerU3Summary = []
  playerU4Summary = []
  function getMortgages(obj){
    if(obj.inPlay == "no" && obj.owned == "player"){
      return true;
    }
  }
  var mortgageStatus = propertyCards.filter(getMortgages);
  $.each(mortgageStatus, function (){playerMortgageSummary.push(this.name)})

  function getinPlay(obj){
    if(obj.inPlay == "yes" && obj.owned == "player"){
      return true;
    }
  }
  var inPlayStatus = propertyCards.filter(getinPlay);
  inPlayStatus.sort(function(a,b){if(a.color>b.color){return 1}})
  $.each(inPlayStatus, function (){playerPropertiesinPlaySummary.push(this.name)})
  $.each(inPlayStatus, function (){playerPropertiesinPlayColors.push(this.color)})


  function getBasicRent(obj){
    if(obj.rentStatus == "basic" && obj.owned == "player"){
      return true;
    }
  }
  var basicRentStatus = propertyCards.filter(getBasicRent);
  $.each(basicRentStatus, function (){playerBasicRentSummary.push(this.name)})

  function getU1(obj){
    if(obj.rentStatus == "upgrade1" && obj.owned == "player"){
      return true;
    }
  }
  var u1Status = propertyCards.filter(getU1);
  u1Status.sort(function(a,b){if(a.color>b.color){return 1}})
  $.each(u1Status, function (){playerU1Summary.push(this.name)})

  function getU2(obj){
    if(obj.rentStatus == "upgrade2" && obj.owned == "player"){
      return true;
    }
  }
  var u2Status = propertyCards.filter(getU2);
  u2Status.sort(function(a,b){if(a.color>b.color){return 1}})
  $.each(u2Status, function (){playerU2Summary.push(this.name)})

  function getU3(obj){
    if(obj.rentStatus == "upgrade3" && obj.owned == "player"){
      return true;
    }
  }
  var u3Status = propertyCards.filter(getU3);
  u3Status.sort(function(a,b){if(a.color>b.color){return 1}})
  $.each(u3Status, function (){playerU3Summary.push(this.name)})

  function getU4(obj){
    if(obj.rentStatus == "upgrade4" && obj.owned == "player"){
      return true;
    }
  }
  var u4Status = propertyCards.filter(getU4);
  u1Status.sort(function(a,b){if(a.color>b.color){return 1}})
  $.each(u4Status, function (){playerU4Summary.push(this.name)})
}



$("#assetSummaryEnemy").on("click",showEnemySummary)

var enemyMortgageSummary = []
var enemyPropertiesinPlaySummary = []
var enemyPropertiesinPlayColors = []
var enemyBasicRentSummary = []
var enemyU1Summary = []
var enemyU2Summary = []
var enemyU3Summary = []
var enemyU4Summary = []

//Prompt for enemy summary
function showEnemySummary(){
  updateEnemySummary();
  var newStatus = $("<div>").attr("id","assetSummaryP");
  var heading = $("<h1>").text("EnemySummary")
  var l1 = $("<p>").text("Mortgaged Properties")
  var s1 = $("<select>").addClass("styled-select")
  for(var i = 0 ; i < enemyMortgageSummary.length; i++){
    var newOption = $("<option>").text(enemyMortgageSummary[i]);
    s1.append(newOption);
  }
  var l2 = $("<p>").text("Properties in Play")
  var s2 = $("<select>").addClass("styled-select")
  for(var i = 0 ; i < enemyPropertiesinPlaySummary.length; i++){
    var newOption = $("<option>").text(enemyPropertiesinPlaySummary[i]+ " from the " + enemyPropertiesinPlayColors[i]+ " set");
    s2.append(newOption);
  }
  var l3 = $("<p>").text("Basic Rent")
  var s3 = $("<select>").addClass("styled-select")
  for(var i = 0 ; i < enemyBasicRentSummary.length; i++){
    var newOption = $("<option>").text(enemyBasicRentSummary[i]);
    s3.append(newOption);
  }
  var l4 = $("<p>").text("On 1st upgrade")
  var s4 = $("<select>").addClass("styled-select")
  for(var i = 0 ; i < enemyU1Summary.length; i++){
    var newOption = $("<option>").text(enemyU1Summary[i]);
    s4.append(newOption);
  }
  var l5 = $("<p>").text("On 2nd upgrade")
  var s5 = $("<select>").addClass("styled-select")
  for(var i = 0 ; i < enemyU2Summary.length; i++){
    var newOption = $("<option>").text(enemyU2Summary[i]);
    s5.append(newOption);
  }
  var l6 = $("<p>").text("On 3rd upgrade")
  var s6 = $("<select>").addClass("styled-select")
  for(var i = 0 ; i < enemyU3Summary.length; i++){
    var newOption = $("<option>").text(enemyU3Summary[i]);
    s6.append(newOption);
  }
  var l7 = $("<p>").text("On 4th upgrade")
  var s7 = $("<select>").addClass("styled-select")
  for(var i = 0 ; i < enemyU4Summary.length; i++){
    var newOption = $("<option>").text(enemyU4Summary[i]);
    s7.append(newOption);
  }
  var button = $("<button>").addClass("closeSummary").text("Close")
  newStatus.append(heading).append(l1).append(s1).append(l2).append(s2).append(l3).append(s3).append(l4).append(s4).append(l5).append(s5).append(l6).append(s6).append(l7).append(s7).append(button)
  newStatus.insertAfter("#playerStats");
  $(".closeSummary").on("click",function(){$("#assetSummaryP").remove()})
}


//Update enemy summary based on current status of propertyCard array
function updateEnemySummary() {
  enemyMortgageSummary = []
  enemyPropertiesinPlaySummary = []
  enemyPropertiesinPlayColors = []
  enemyBasicRentSummary = []
  enemyU1Summary = []
  enemyU2Summary = []
  enemyU3Summary = []
  enemyU4Summary = []
  function getMortgages(obj){
    if(obj.inPlay == "no" && obj.owned == "enemy"){
      return true;
    }
  }
  var mortgageStatus = propertyCards.filter(getMortgages);
  $.each(mortgageStatus, function (){enemyMortgageSummary.push(this.name)})

  function getinPlay(obj){
    if(obj.inPlay == "yes" && obj.owned == "enemy"){
      return true;
    }
  }
  var inPlayStatus = propertyCards.filter(getinPlay);
  inPlayStatus.sort(function(a,b){if(a.color>b.color){return 1}})
  $.each(inPlayStatus, function (){enemyPropertiesinPlaySummary.push(this.name)})
  $.each(inPlayStatus, function (){enemyPropertiesinPlayColors.push(this.color)})


  function getBasicRent(obj){
    if(obj.rentStatus == "basic" && obj.owned == "enemy"){
      return true;
    }
  }
  var basicRentStatus = propertyCards.filter(getBasicRent);
  $.each(basicRentStatus, function (){enemyBasicRentSummary.push(this.name)})

  function getU1(obj){
    if(obj.rentStatus == "upgrade1" && obj.owned == "enemy"){
      return true;
    }
  }
  var u1Status = propertyCards.filter(getU1);
  u1Status.sort(function(a,b){if(a.color>b.color){return 1}})
  $.each(u1Status, function (){enemyU1Summary.push(this.name)})

  function getU2(obj){
    if(obj.rentStatus == "upgrade2" && obj.owned == "enemy"){
      return true;
    }
  }
  var u2Status = propertyCards.filter(getU2);
  u2Status.sort(function(a,b){if(a.color>b.color){return 1}})
  $.each(u2Status, function (){enemyU2Summary.push(this.name)})

  function getU3(obj){
    if(obj.rentStatus == "upgrade3" && obj.owned == "enemy"){
      return true;
    }
  }
  var u3Status = propertyCards.filter(getU3);
  u3Status.sort(function(a,b){if(a.color>b.color){return 1}})
  $.each(u3Status, function (){enemyU3Summary.push(this.name)})

  function getU4(obj){
    if(obj.rentStatus == "upgrade4" && obj.owned == "enemy"){
      return true;
    }
  }
  var u4Status = propertyCards.filter(getU4);
  u1Status.sort(function(a,b){if(a.color>b.color){return 1}})
  $.each(u4Status, function (){enemyU4Summary.push(this.name)})
}




/* Chance and community cards ************************************************************************************************************************************************/

//Randomize chance/community cards when player/enemy lands on chance/community tile
function landOnChance() {
  var random = Math.floor(Math.random()*chanceCards.length);
  var card = chanceCards[random];
  var prompt = $("<div>").attr("id","chcCard")
  var l1= $("<h4>").text(card.message)
  var l2 = $("<p>").text(card.message2)
  var button = $("<button>").addClass("chanceClose").text("Close")
  if(turn == "player"){
    playerCash += card.todo
    updateCash()
    var playerNote = $("<p>").text("Player")
    prompt.append(playerNote)
  }else if(turn == "enemy"){
    enemyCash += card.todo
    updateCash()
    var enemyNote = $("<p>").text("Enemy")
    prompt.append(enemyNote)
  }
  prompt.append("<img src='images/monopoly-man.jpg'>").append(l1).append(l2).append(button)
  prompt.insertAfter("#playerStats");
  $(".chanceClose").on("click",function(){$("#chcCard").remove()})
}


//Chance/ community events
var chanceCards =
[
  {
    message:"YOU JUST RAN OFF WITH A MIDGET",
    message2:"Collect $500 in reality show rights",
    todo: 500
  },
  {
    message:"THAT'S NOT A WOMAN",
    message2:"You owe $300 in attorney fees",
    todo: -300
  },
  {
    message:"THAT'S NOT A WOMAN",
    message2:"You owe $300 in attorney fees",
    todo: -300
  },
  {
    message:"DNA TESTS PROVE YOU ARE THE FATHER OF THE PUPPY AND THE BABY",
    message2:"Pay $150 in child and doggy support",
    todo: -150
  },
  {
    message:"Your avant garde dance troupe just won an arts grant from a company that manufactures baby seal burgers",
    message2:"Collect $2,000 with mixed feelings",
    todo: 2000
  },
  {
    message:"Well, you did it. You killed them all. The family business is now yours.",
    message2:"Save $550 on not having to buy family christmas gifts this year",
    todo: 550
  },
  {
    message:"You are now playing the Mad Men edition of monopoly. Have a martini everytime you roll, move, or blink.",
    message2:"Winner is the last person left with a full functioning liver. Might be hard against an AI",
    todo: 0
  },
  {
    message:"You invest in print media",
    message2:"Lose $800",
    todo: -800
  },
  {
    message:"Get out of jail free card!",
    message2:"Hehe just kidding we don't have those here.",
    todo: 0
  },
  {
    message:"2nd prize in beauty contest",
    message2:"Collect $0.50",
    todo: 0.5
  },
  {
    message:"Your girlfriend's period is late",
    message2:"Her bus ticket to Anchorage costs you $50",
    todo: -50
  },
  {
    message:"You just won $1,000,000 in the lottery!!!!",
    message2:"After taxes, you collect $500",
    todo: 500
  },
  {
    message:"Your monkey lost",
    message2:"Pay $150",
    todo: -150
  }
]


/* Puchasing/selling properties between player and enemy ************************************************************************************************************************************************/

$("#playerOffer").on("click",offerOptions)

function offerOptions() {
  updateEnemySummary()
  var newPrompt = $("<div>").attr("id","promptOffer");
  var qn = $("<p>").text("What property would you like to make an offer on?");
  var select = $("<select>").addClass("styled-select");
  var qn2 = $("<p>").text("How much would your offer be?");
  var offerValue = $("<input>").attr("type","text");
  for(var i = 0 ; i < enemyPropertiesinPlaySummary.length; i++){
    var newOption = $("<option>").attr("value",enemyPropertiesinPlaySummary[i]).text(enemyPropertiesinPlaySummary[i]);
    select.append(newOption);
  }
  var button1 = $("<button>").attr("id","offerSubmit").text("Submit");
  var button2 = $("<button>").attr("id","offerClose").text("Close");
  newPrompt.append(qn).append(select).append(qn2).append(offerValue).append(button1).append(button2);
  newPrompt.insertAfter("#playerStats");
  $("#offerClose").on("click", function(){$("#promptOffer").remove()});
  $("#offerSubmit").on("click", makeEnemyOffer);
  $("#offerSubmit").on("click", function(){$("#promptOffer").remove()});
}

function makeEnemyOffer() {
  var chosenProperty = $('select').val()
  var moneyOffered = parseInt($('input').val());
  function getProperty (obj){
    if(obj.name == chosenProperty){
      return true
    }
  }
  var propertyOfferMadeOn = propertyCards.filter(getProperty);
  if(propertyOfferMadeOn[0].rentStatus !== "basic" && propertyOfferMadeOn[0].price*6){
  } else if((propertyOfferMadeOn[0].price*3) <= moneyOffered){
    playerCash -= moneyOffered
    enemyCash += moneyOffered
    updateCash()
    playerUpdate("You just bought "+ chosenProperty+ " from the enemy!")
    propertyOfferMadeOn[0].owned= "player"
    var lookFor = "p:contains('"+chosenProperty+"')"
    console.log(lookFor)
    var cardOnPage = $(lookFor).parent()
    $(cardOnPage).removeClass();
    $(cardOnPage).addClass("pCard");
    cardOnPage.insertBefore(".hidePlayerProperties")
    checkVansOwned()
    checkUtilitiesOwned()
    checkPropertiesOwnedEnemy()
    checkPropertiesOwnedPlayer()
  }else {
    alert("The enemy scoffs at your offer. Try going a little higher.")
  }
}


var almostCompletePropertyNumber = [1,2,2,2,2,2,2,1];
var almostCompleteSetsOwnedEnemy = [];
var setNumber = 0

function checkEnemyAlmostCompleteSets() {
  almostCompleteSetsOwnedEnemy = [];
  for(var i = 0; i<propertyColors.length; i++){
    function getColor(obj){
      if(obj.color == propertyColors[i] && obj.owned == "enemy" && obj.inPlay == "yes"){
        return true
      }
    }
    var ownedStatus = propertyCards.filter(getColor);
    if(ownedStatus.length == almostCompletePropertyNumber[i]){
      almostCompleteSetsOwnedEnemy.push(propertyColors[i]);
    }
  }
}


function enemyOfferOptions() {
  checkEnemyAlmostCompleteSets();
  var color = almostCompleteSetsOwnedEnemy[setNumber]
  function getColor(obj){
    if(obj.color == almostCompleteSetsOwnedEnemy[setNumber] && obj.owned == "player"){
      return true
    }
  }
  var playerCardWanted = propertyCards.filter(getColor);
  if(playerCardWanted.length == 1){
    var priceOffered = playerCardWanted[0].price * 2.5
    if(enemyCash+250>priceOffered){
      var newPrompt = $("<div>").attr("id","promptOffer").css("height","100px").css("margin-top", "-100px").css("top","40%");
      var qn = $("<p>").text("Enemy would like to make an offer of "+priceOffered+ " on "+ playerCardWanted[0].name);
      var button1 = $("<button>").attr("id","offerAccept").text("Accept");
      var button2 = $("<button>").attr("id","offerReject").text("Reject");
      newPrompt.append(qn).append(button1).append(button2);
      newPrompt.insertAfter("#playerStats");
      $("#offerReject").on("click", function(){$("#promptOffer").remove()});
      $("#offerReject").on("click", function(){
        setNumber += 1
      });
      $("#offerAccept").on("click", function(){$("#promptOffer").remove()});
      $("#offerAccept").on("click", function(){
        playerCash += priceOffered;
        enemyCash -= priceOffered;
        updateCash();
        enemyUpdate("You just sold "+ playerCardWanted[0].name + " to the enemy!")
        playerCardWanted[0].owned= "enemy"
        var lookFor = "p:contains('"+playerCardWanted[0].name+"')"
        var cardOnPage = $(lookFor).parent()
        $(cardOnPage).removeClass();
        $(cardOnPage).addClass("eCard");
        cardOnPage.insertBefore(".hideEnemyProperties")
        checkVansOwned()
        checkUtilitiesOwned()
        checkPropertiesOwnedEnemy()
        checkPropertiesOwnedPlayer()
      });
    }
  }
}







/* Game Logic ************************************************************************************************************************************************/

//Player:
// Each player starts with 1500

//If player has properties, he can but upgrades if he has enough money, if not he is told he does not have enough
//Once he clicks on dice to roll he cannot buy upgrades

// If you land on a chance/community card- you have to do that
// If you land on gotojail, you go to jail
//     You have to stay in jail 3 turns unless random1 === random2
// If you land on "fee" cards you have to pay the fee stated or the lesser of the 2 fees
// If you land on a pCard, you are given a choice to buy if it is not already owned
//     If bought, it will become "owned player" (object property added), and stored in player's array and card deck, and money is deducted
//     Can't buy if there isn't enough money
//     If not, nothing will happen
//
// If you land on enemy property tile, your money is reduced by rent/upgrade (depending on level)
// If you don't have enough money to pay, you are given the option to mortgage property
// If you still don't have enough money, you are bankrupt (same for fees/coCard and chCards)



//Enemy:
// As long as he has more than 1000, he will buy all properties if unowned, below 1000 he will not but green and blue
// If not, as long as he has less than 700, he will only buy red orange pink lightblue and purple
// If not, as long as he has 500 or less, he will buy purple
// If not, he will not buy the property he lands on
// Properties that are bought become "owned enemy"
//
// If he lands on player's tile, his money will automatically be deducted according to the rent, but if the rent is more than his total cash, he will mortgage the properties with the lowest mortgage values until he pays it off
// If he is stil broke, he goes bankrupt
//
//If he has all three of a kind for properties, he will buy upgrades when he will be left with at least 200 in cash (so like a min cash for him)
//If not, he won't buy upgrades
