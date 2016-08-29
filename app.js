/*Problems/to do:

1. Make sure that when you check for bankruptcy you update ability to mortgage properties
2. LuxuryTax (room and board tile) is not working
3.Work on player updates when free
4. Maybe add dice rolling test for when players go to jail


TIP: Get $(".name").text() to get the name of the card and to identify it on the document page

*/


//Resize gameboard when loading page

// var width = []
//
// $("td").children().each(function() {
//   width.push($(this).css("width"))
//   for(var i = 0; i < width.length; i++){
//     width[i]= parseInt(width[i])*0.15
//     $(this).css("width", width[i])
//   }
// });
var width = []

$(".row").children().each(function() {
  width.push($(this).css("width"))
  for(var i = 0; i < width.length; i++){
    width[i]= parseInt(width[i])*0.15
    $(this).css("width", width[i])
  }
});


// Dice mechanism

var gameStatus = "notStarted"
var playerFirstMove = true;
var enemyFirstMove = true;
var dice = document.getElementById("dice");
var dice1 = document.getElementById("dice1");
var dice2 = document.getElementById("dice2");
var roll = document.getElementById("roll");
var begin = document.getElementById("begin");
var random1
var random2
var rollValue
var dices = ['&#9856;', '&#9857;', '&#9858;', '&#9859;', '&#9860;', '&#9861;'];
var stopped;
var t;

begin.addEventListener("click", ongoing);
dice.addEventListener("click", stopstart);
dice.addEventListener("click", change);

function ongoing() {
  gameStatus = "ongoing";
  updateCash();
  begin.textContent= "Your roll"
}

function updateCash() {
  $("#playerCash").text(playerCash);
  $("#enemyCash").text(enemyCash);
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
    } else {
      setTimeout(showStatus, 500);
      clearInterval(t);
      stopped = true;
      rollValue = "";
    }
 }
}

function showStatus() {
  rollValue = (parseInt(random1) + parseInt(random2) + 2);
  roll.textContent = "Move "+ rollValue + " spaces";
  gameStatus = "ongoing"
  makeMove();
}


//Moving across the board

var turn = "player"
var playerPosition
var enemyPosition

/* Depending on whether it's the enemy's or player's first move, go to position on board according to dice roll
and bring up the card options for the tile we've landed on */
function makeMove() {
  if(turn == "player" && gameStatus == "ongoing" && playerFirstMove == true){
    // var startPosition = 1
    // parseInt(start.attr("class").substr(-1,2));
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
    turn = "player";
    begin.textContent="Your roll";
  }else if(turn == "enemy" && gameStatus == "ongoing") {
    $("#enemy").removeAttr("id");
    enemyPosition = parseInt(enemyPosition.substr(1));
    if((enemyPosition+rollValue)>40){
      enemyPosition = "p"+((enemyPosition+rollValue)-40);
      enemyCash += 200
      updateCash();
    }else{
      enemyPosition = "p"+(enemyPosition+rollValue);
    }
    var toGo = document.getElementsByClassName(enemyPosition);
    $(toGo).attr("id","enemy")
    cardOptions();
    turn = "player";
    begin.textContent="Your roll";
  }
}

// var pCover = document.getElementsByClassName('pCard-cover');
//
// pCover.addEventListener("click", showpCards);
// $(".pCard").hide();
// function showpCards(){
//   $(".pCard").show();
//   console.log("working")
// }

//Player and Enemy Stats
var playerCash = 1500
var enemyCash = 1500
var currentPosition

//Bring up card options depending on where player/enemy has landed
function cardOptions () {
  if(turn == "player"){
    playerChoice = parseInt(playerPosition.substr(1));
    currentPosition = propertyCards[(playerChoice-1)];
    var type = propertyCards[(playerChoice-1)].type;
    if(type === "pCard"){ if (currentPosition.owned === "no"){
      buyOptionp()}else if (currentPosition.owned === "enemy"){payUp()}
     }
    else if (type === "vCard"){ if (currentPosition.owned=== "no"){
      buyOptionv()}else if (currentPosition.owned === "enemy"){payUp()}
    }
    else if (type === "uCard"){ if (currentPosition.owned === "no"){
      buyOptionu()}else if (currentPosition.owned === "enemy"){payUp()}
    }
    else if (type === "fcard1") {formationFee()}
    else if (type === "fcard2") {luxuryTax()}
    else if (type === "goToJail") {goToJail()}
  }else if(turn == "enemy"){
    enemyChoice = parseInt(enemyPosition.substr(1));
    currentPosition = propertyCards[(enemyChoice-1)];
    var type = propertyCards[(enemyChoice-1)].type;
    if(type === "pCard") { if (currentPosition.owned === "no"){
        currentPosition = propertyCards[(enemyChoice-1)]
        var newCard = $("<div>").addClass("pCard");
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
        $("#enemyStats").append(newCard);
        currentPosition.owned="enemy";
        enemyCash -= currentPosition.price;
        updateCash();
        currentPosition.rentStatus="basic";
      }
    }
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

//If player chooses to buy property card add it to deck
function addpCard() {
  if(playerCash < propertyCards[(playerChoice-1)].price){
    alert("Not enough cash!");
  }else{
    var newCard = $("<div>").addClass("pCard");
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
    $("#playerStats").append(newCard);
    $("#promptp").remove();
    playerCash -= currentPosition.price;
    updateCash();
    currentPosition.owned="player";
    currentPosition.rentStatus="basic";
    checkPropertiesOwnedPlayer();
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
  $("#no-buy").on("click", function(){$("#promptp").remove()})
}

//If player chooses to buy van card add it to deck
function addvCard() {
  if(playerCash < propertyCards[(playerChoice-1)].price){
    alert("Not enough cash!");
  }else{
    var newCard = $("<div>").addClass("vCard");
    var name = $("<p>").addClass("name").text(currentPosition.name).css("background-color", currentPosition.color).css("color","white");
    var l1 = $("<p>").text("Price: $" + currentPosition.price);
    var l2 = $("<p>").text("Own 1: $" + currentPosition.own1);
    var l3 = $("<p>").text("Own 2: $" + currentPosition.own2);
    var l4 = $("<p>").text("Own 3: $" + currentPosition.own3);
    var l5 = $("<p>").text("Own 4: $" + currentPosition.own4);
    var l6 = $("<p>").text("Mortgage Value: $" + currentPosition.mortgage);
    newCard.append(name).append(l1).append(l2).append(l3).append(l4).append(l5).append(l6);
    $("#playerStats").append(newCard);
    $("#promptp").remove();
    playerCash -= currentPosition.price;
    updateCash();
    currentPosition.owned="player";
  }
}

//Give player option to buy utility card if it's not already owned
function buyOptionu() {
  var newPrompt = $("<div>").attr("id","promptp");
  var qn = $("<p>").text("Would you like to purchase?")
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
  $("#no-buy").on("click", function(){$("#promptp").remove()})
}

//If player chooses to buy utility card add it to deck
function adduCard() {
  if(playerCash < propertyCards[(playerChoice-1)].price){
    alert("Not enough cash!");
  }else{
    var newCard = $("<div>").addClass("vCard");
    var name = $("<p>").addClass("name").text(currentPosition.name).css("background-color", currentPosition.color).css("color","white");
    var l1 = $("<p>").text("Price: $" + currentPosition.price);
    var l2 = $("<p>").text("Own 1: Pay 4 times dice roll");
    var l3 = $("<p>").text("Own 2: Pay 10 times dice roll");
    var l4 = $("<p>").text("Mortgage Value: $" + currentPosition.mortgage);
    newCard.append(name).append(l1).append(l2).append(l3).append(l4);
    $("#playerStats").append(newCard);
    $("#promptp").remove();
    playerCash -= currentPosition.price;
    updateCash();
    currentPosition.owned="player";
  }
}

function formationFee() {
  if(playerCash < 200){
    playerCash -= (0.1*playerCash);
  }else{
    playerCash -= 200;
  }
  updateCash();
}

function luxuryTax() {
  if(playerCash <= 75){
    // bankrupt();
  }else{
    playerCash -= 75
    updateCash();
  }
}

/* Rent and bankrupty ************************************************************************************************************************************************/

function payUp() {
  if(currentPosition.rentStatus="basic"){
    playerCash -= currentPosition.rent;
    updateCash()
  }else if(currentPosition.rentStatus="upgrade1"){
    playerCash -= currentPosition.upgrade1;
    updateCash()
  }else if(currentPosition.rentStatus="upgrade2"){
    playerCash -= currentPosition.upgrade2;
    updateCash()
  }else if(currentPosition.rentStatus="upgrade3"){
    playerCash -= currentPosition.upgrade3;
    updateCash()
  }else if(currentPosition.rentStatus="upgrade4"){
    playerCash -= currentPosition.upgrade4;
    updateCash()
  }
}

function checkBankruptcy() {
  if(turn === "player" && playerCash < 0){
    alert("Sorry, you've gone bankrupt!")
  }
}

function goToJail() {
  if( turn === "player" ){
    $("#user").removeAttr("id");
    var toGo = document.getElementsByClassName("p11");
    $(toGo).attr("id","user");
    turn = "enemy";
    begin.textContent="Roll dice for enemy move";
    playerCash -= (0.3 * playerCash);
    updateCash();
  }else if( turn === "enemy" ){
    $("#enemy").removeAttr("id");
    var toGo = document.getElementsByClassName("p11");
    $(toGo).attr("id","enemy");
    turn = "player";
    begin.textContent="Your roll";
    enemyCash -= (0.3 * enemyCash);
    updateCash();
  }
}

/* Managing upgrades and mortgages ************************************************************************************************************************************************/

$("#buyUpgrades").on("click", buyUpgrades);

function buyUpgrades () {
  var newPrompt = $("<div>").attr("id","promptUpgrade");
  var qn = $("<p>").text("What would you like to upgrade?");
  var select = $("<select>");
  for( var i = 0 ; i < setsOwnedPlayer.length; i++ ){
    var color = setsOwnedPlayer[i];
    var newOption = $("<option>").attr("value",setsOwnedPlayer[i]).text(setsOwnedPlayer[i]);
    select.append(newOption);
  }
  var button1 = $("<button>").attr("id","upgradeSubmit").text("Submit");
  var button2 = $("<button>").attr("id","upgradeClose").text("Close");
  newPrompt.append(qn).append(select).append(button1).append(button2);
  newPrompt.insertAfter("#playerStats");
  $("#upgradeClose").on("click", function(){$("#promptUpgrade").remove()});
  $("#upgradeSubmit").on("click", addPlayerUpgrade);
  $("#upgradeSubmit").on("click", function(){$("#promptUpgrade").remove()});
}


function addPlayerUpgrade() {
  var currentOption = $("select").val();
  function getSet (obj){
    if(obj.color == currentOption){
      return true
    }
  }
  var setToUpgrade = propertyCards.filter(getSet);
  if(setToUpgrade[0].rentStatus == "basic"){
    if(playerCash >= (setToUpgrade[0].upgradeCost * 3)){
      $.each(setToUpgrade, function(newRentStatus){this.rentStatus= "upgrade1"});
      playerCash -= (setToUpgrade[0].upgradeCost * 3)
      updateCash();
    } else {alert("You don't have enough cash :(")};
  }else if (setToUpgrade[0].rentStatus == "upgrade1"){
    if(playerCash >= (setToUpgrade[0].upgradeCost * 3)){
      $.each(setToUpgrade, function(newRentStatus){this.rentStatus= "upgrade2"});
      playerCash -= (setToUpgrade[0].upgradeCost * 3)
      updateCash();
    } else {alert("You don't have enough cash :(")};
  }else if (setToUpgrade[0].rentStatus == "upgrade3"){
    if(playerCash >= (setToUpgrade[0].upgradeCost * 3)){
      $.each(setToUpgrade, function(newRentStatus){this.rentStatus= "upgrade4"});
      playerCash -= (setToUpgrade[0].upgradeCost * 3)
      updateCash();
    } else {alert("You don't have enough cash :(")};
  }else if(setToUpgrade[0].rentStatus == "upgrade4"){
    alert("You already have the most stellar upgrades for this")
  }
}

/* Enemy moves/tactics ************************************************************************************************************************************************/



/* Bankruptcy/etc ************************************************************************************************************************************************/

// function bankrupt() {
//   if()
// }



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

//If you want to buy upgrades, you can access the prices in the objects (upgradeCost) and the current rent value will be updated by changing "current-rent" attribute (this will be turned into a string that will then find out what the rent is as a search parameter in the object)


//Enemy:
//Enemy starts with 1500. As long as he has more than 1000, he will buy all properties if unowned, below 1000 he will not but green and blue
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









/* Information storage for cards ************************************************************************************************************************************************/

var propertyCards = [
  {
    type: "go"
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
    owned: "no"
  },
  {
    type: "coCard"
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
    owned: "no"
  },
  {
    type: "fcard1"
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
    owned: "no"
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
    owned: "no"
  },
  {
    type: "chCard"
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
    owned: "no"
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
    owned: "no"
  },
  {
    type: "jail"
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
    owned: "no"
  },
  {
    type: "uCard",
    name: "Kenrick Light and Magic",
    price: 150,
    own1: 4,
    own2: 10,
    mortgage: 75,
    color: "black",
    owned: "no"
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
    owned: "no"
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
    owned: "no"
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
    owned: "no"
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
    owned: "no"
  },
  {
    type: "coCard"
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
    owned: "no"
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
    owned: "no"
  },
  {
    type: "freeParking"
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
    owned: "no"
  },
  {
    type: "chCard"
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
    owned: "no"
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
    owned: "no"
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
    owned: "no"
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
    owned: "no"
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
    owned: "no"
  },
  {
    type: "uCard",
    name: "Student Computer Service",
    price: 150,
    own1: 4,
    own2: 10,
    mortgage: 75,
    color: "black",
    owned: "no"
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
    owned: "no"
  },
  {
    type: "goToJail"
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
    owned: "no"
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
    owned: "no"
  },
  {
    type: "coCard"
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
    owned: "no"
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
    owned: "no"
  },
  {
    type: "chCard"
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
    owned: "no"
  },
  {
    type: "fCard2"
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
    owned: "no"
  }
]

/* Check for property ownership ************************************************************************************************************************************************/

var propertyColors = ["purple", "lightblue", "pink", "orange", "red", "yellow", "green", "darkblue"];
var propertyNumber = [2,3,3,3,3,3,3,2];
var setsOwnedPlayer = [];

function checkPropertiesOwnedPlayer(){
  setsOwnedPlayer = [];
  for(var i = 0; i<propertyColors.length; i++){
    function getColor(obj){
      if(obj.color == propertyColors[i] && obj.owned == "player"){
        return true
      }
    }
    var ownedStatus = propertyCards.filter(getColor);
    if(ownedStatus.length == propertyNumber[i]){
      setsOwnedPlayer.push(propertyColors[i]);
      console.log(setsOwnedPlayer);
    }
  }
}
// if(purpleOwnedStatus.length == 2){
//   console.log("Yes both are owned")
// }
//
// console.log(purpleOwnedStatus);
