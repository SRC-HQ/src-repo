////////////////////////////////////////////////////////////
// GAME v1.3
////////////////////////////////////////////////////////////

/*!
 * 
 * GAME SETTING CUSTOMIZATION START
 * 
 */

//field settings
var fieldSettings = [
	{
		sky:'/game/assets/bg_sky_01.png',
		race:'/game/assets/bg_race_01.png',
		billboard:'/game/assets/bg_billboard_01.png',
		end:'/game/assets/bg_end_01.png',
		endline:'/game/assets/bg_end_line_01.png',
		gate:'/game/assets/item_race_gate.png',
		gateFirst:'/game/assets/item_race_gate_first.png',
		gateOpen:'/game/assets/item_gate_open.png',
		shadow:'/game/assets/bg_shadow_01.png',
	},
	{
		sky:'/game/assets/bg_sky_02.png',
		race:'/game/assets/bg_race_02.png',
		billboard:'/game/assets/bg_billboard_02.png',
		end:'/game/assets/bg_end_01.png',
		endline:'/game/assets/bg_end_line_01.png',
		gate:'/game/assets/item_race_gate.png',
		gateFirst:'/game/assets/item_race_gate_first.png',
		gateOpen:'/game/assets/item_gate_open.png',
		shadow:'/game/assets/bg_shadow_02.png',
	},
	{
		sky:'/game/assets/bg_sky_03.png',
		race:'/game/assets/bg_race_03.png',
		billboard:'/game/assets/bg_billboard_03.png',
		end:'/game/assets/bg_end_01.png',
		endline:'/game/assets/bg_end_line_01.png',
		gate:'/game/assets/item_race_gate_02.png',
		gateFirst:'/game/assets/item_race_gate_first_02.png',
		gateOpen:'/game/assets/item_gate_open_02.png',
		shadow:'/game/assets/bg_shadow_03.png',
	}
];

var racerSettings = [
	{
		name:'President',
		icon:'/game/assets/icon_01.png',
		race:'/game/assets/racer_01.png',
		odds:[
			2.38,
			1.25,
			1.10,
			2.38,
			2.38,
			2.38,
			2.38,
			2.38,
			2.38,
		],
		percent:80
	},
	{
		name:'Doctor',
		icon:'/game/assets/icon_02.png',
		race:'/game/assets/racer_02.png',
		odds:[
			2.75,
			1.29,
			1.11,
			2.75,
			2.75,
			2.75,
			2.75,
			2.75,
			2.75,
		],
		percent:80
	},
	{
		name:'Astronaut',
		icon:'/game/assets/icon_03.png',
		race:'/game/assets/racer_03.png',
		odds:[
			4.50,
			3.00,
			2.25,
			4.50,
			4.50,
			4.50,
			4.50,
			4.50,
			4.50,
		],
		percent:80
	},
	{
		name:'Bartender',
		icon:'/game/assets/icon_04.png',
		race:'/game/assets/racer_04.png',
		odds:[
			6.00,
			3.40,
			1.50,
			6.00,
			6.00,
			6.00,
			6.00,
			6.00,
			6.00,
		],
		percent:70
	},
	{
		name:'Teacher',
		icon:'/game/assets/icon_05.png',
		race:'/game/assets/racer_05.png',
		odds:[
			7.50,
			3.76,
			1.55,
			7.50,
			7.50,
			7.50,
			7.50,
			7.50,
			7.50,
		],
		percent:70
	},
	{
		name:'Chef',
		icon:'/game/assets/icon_06.png',
		race:'/game/assets/racer_06.png',
		odds:[
			8.50,
			6.00,
			3.25,
			8.50,
			8.50,
			8.50,
			8.50,
			8.50,
			8.50,
		],
		percent:50
	},
	{
		name:'War Admiral',
		icon:'/game/assets/icon_07.png',
		race:'/game/assets/racer_07.png',
		odds:[
			9.50,
			7.50,
			3.12,
			9.50,
			9.50,
			9.50,
			9.50,
			9.50,
			9.50,
		],
		percent:50
	},
	{
		name:'Farmer',
		icon:'/game/assets/icon_08.png',
		race:'/game/assets/racer_08.png',
		odds:[
			9.75,
			5.20,
			2.48,
			9.75,
			9.75,
			9.75,
			9.75,
			9.75,
			9.75,
		],
		percent:30
	},
	{
		name:'Engineer',
		icon:'/game/assets/icon_09.png',
		race:'/game/assets/racer_09.png',
		odds:[
			11.65,
			7.89,
			3.44,
			11.65,
			11.65,
			11.65,
			11.65,
			11.65,
			11.65,
		],
		percent:30
	},
	{
		name:'Police Officer',
		icon:'/game/assets/icon_10.png',
		race:'/game/assets/racer_10.png',
		odds:[
			17.25,
			8.75,
			6.30,
			17.25,
			17.25,
			17.25,
			17.25,
			17.25,
			17.25,
		],
		percent:30
	}
];
var betSettings = [
	{
		name:"WIN",
		nameShort:'WN',
		type:'win',
		bets:[1,2,5,10,50,100],
		payout:-1,	
	},
	{
		name:"PLACE",
		nameShort:'PL',
		type:'place',
		bets:[1,2,5,10,50,100],
		payout:-1,	
	},
	{
		name:"SHOW",
		nameShort:'SH',
		type:'show',
		bets:[1,2,5,10,50,100],
		payout:-1,
	},
	{
		name:"EXACTA",
		nameShort:'EX',
		type:'exacta',
		bets:[1,2,5,10],
		payout:1000,
	},
	{
		name:"EXACTA BOX",
		nameShort:'EX BOX',
		type:'exactabox',
		bets:[1,2,5,10],
		payout:500,
	},
	{
		name:"TRIFECTA",
		nameShort:'TR',
		type:'trifecta',
		bets:[1,2,5,10],
		payout:3000,
	},
	{
		name:"TRIFECTA BOX",
		nameShort:'TR BOX',
		type:'trifectabox',
		bets:[1,2,5,10],
		payout:1000,	
	},
	{
		name:"SUPERFECTA",
		nameShort:'SU',
		type:'superfecta',
		bets:[1,2,5,10],
		payout:5000,
	},
	{
		name:"SUPERFECTA BOX",
		nameShort:'SU BOX',
		type:'superfectabox',
		bets:[1,2,5,10],
		payout:3000,
	}
];

//game settings
var gameSettings = {
	credit:100, //game credit
	maxBets:8, //max bets
	winSpeed:1, //reveal result speed
	raceSpeed:280, //race speed
	enablePercentage:true //option to have result base on percentage
};

//game text display
var textStrings = {
	currency:'$',
	betType:'BET TYPE',
	betAmount:'BET AMOUNT',
	credits:'CREDITS',
	totalBet:'TOTAL BET',
	tablePlace:['POST','ODDS','RACER NAME'],
	tableSummary:['','BET TYPE','RACERS','TOTAL BET'],
	tableRaceSummary:['','BET TYPE','RACERS','TOTAL BET','WIN'],
	tableRaceResult:['POS','RACER NO & NAME'],
	position:['1ST','2ND','3RD','4TH','5TH','6TH','7TH','8TH','9TH','10TH'],
	or:', ',
	race:'LFG!',
	field:['MATRIX','SEA','SKY'],
	summaryTitle:'YOUR BETS SUMMARY',
	raceSummaryTitle:'THE WINNER',
	raceResultTitle:'RACE RESULT',
	totalWin:'TOTAL WIN',
	exitTitle:'EXIT GAME',
	exitMessage:'ARE YOU SURE YOU\nWANT TO QUIT GAME?',
	share:'SHARE YOUR SCORE:',
	resultTitle:'GAME OVER',
	resultDescTitle:'YOU WIN TOTAL OF',
	resultDesc:'$[NUMBER]',
};

//Social share, [SCORE] will replace with game score
var shareSettings = {
	enable:true,
	options:['facebook','twitter','whatsapp','telegram','reddit','linkedin'],
	shareTitle:'Highscore on Racer Racing is $[SCORE]',
	shareText:'$[SCORE] is mine new highscore on Racer Racing game! Try it now!',
	customScore:true, //share a custom score to Facebook, it use customize share.php (Facebook and PHP only)
	gtag:true //Google Tag
}

/*!
 *
 * GAME SETTING CUSTOMIZATION END
 *
 */
$.editor = {enable:false};
const playerData = {win:0, bets:[]};
const gameData = {paused:true, fieldIndex:0, betTypeIndex:0, betAmountIndex:0, revealResults:[]};
const tweenData = {win:0, credit:0, bet:0};
const blinkData = {alpha:1};

/*!
 * 
 * GAME BUTTONS - This is the function that runs to setup button event
 * 
 */
function buildGameButton(){
	$(window).focus(function() {
		if(!buttonSoundOn.visible){
			toggleSoundInMute(false);
		}

		if (typeof buttonMusicOn != "undefined") {
			if(!buttonMusicOn.visible){
				toggleMusicInMute(false);
			}
		}
	});
	
	$(window).blur(function() {
		if(!buttonSoundOn.visible){
			toggleSoundInMute(true);
		}

		if (typeof buttonMusicOn != "undefined") {
			if(!buttonMusicOn.visible){
				toggleMusicInMute(true);
			}
		}
	});
	
	if(audioOn){
		if(muteSoundOn){
			toggleSoundMute(true);
		}
		if(muteMusicOn){
			toggleMusicMute(true);
		}
	}

	buttonStart.cursor = "pointer";
	buttonStart.addEventListener("click", function(evt) {
		playSound('soundButton');
		goPage('game');
	});
	
	itemExit.addEventListener("click", function(evt) {
	});

	if(shareSettings.enable){
		buttonShare.cursor = "pointer";
		buttonShare.addEventListener("click", function(evt) {
			playSound('soundButton');
			toggleSocialShare(true);
		});

		for(let n=0; n<shareSettings.options.length; n++){
			$.share['button'+n].cursor = "pointer";
			$.share['button'+n].addEventListener("click", function(evt) {
				shareLinks(evt.target.shareOption, addCommas(playerData.totalWin));
			});
		}
	}
	
	buttonMain.cursor = "pointer";
	buttonMain.addEventListener("click", function(evt) {
		playSound('soundButton');
		goPage('main');
	});
	
	buttonSoundOff.cursor = "pointer";
	buttonSoundOff.addEventListener("click", function(evt) {
		toggleSoundMute(true);
	});
	
	buttonSoundOn.cursor = "pointer";
	buttonSoundOn.addEventListener("click", function(evt) {
		toggleSoundMute(false);
	});

	if (typeof buttonMusicOff != "undefined") {
		buttonMusicOff.cursor = "pointer";
		buttonMusicOff.addEventListener("click", function(evt) {
			toggleMusicMute(true);
		});
	}
	
	if (typeof buttonMusicOn != "undefined") {
		buttonMusicOn.cursor = "pointer";
		buttonMusicOn.addEventListener("click", function(evt) {
			toggleMusicMute(false);
		});
	}
	
	buttonFullscreen.cursor = "pointer";
	buttonFullscreen.addEventListener("click", function(evt) {
		toggleFullScreen();
	});
	
	buttonExit.cursor = "pointer";
	buttonExit.addEventListener("click", function(evt) {
		togglePop(true);
		toggleOptions();
	});
	
	buttonSettings.cursor = "pointer";
	buttonSettings.addEventListener("click", function(evt) {
		toggleOptions();
	});
	
	buttonConfirm.cursor = "pointer";
	buttonConfirm.addEventListener("click", function(evt) {
		playSound('soundButton');
		togglePop(false);
		
		stopGame();
		goPage('main');
	});
	
	buttonCancel.cursor = "pointer";
	buttonCancel.addEventListener("click", function(evt) {
		playSound('soundButton');
		togglePop(false);
	});

	buttonBetTypeL.cursor = "pointer";
	buttonBetTypeL.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleBetType(false);
	});

	buttonBetTypeR.cursor = "pointer";
	buttonBetTypeR.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleBetType(true);
	});

	buttonBetAmountL.cursor = "pointer";
	buttonBetAmountL.addEventListener("click", function(evt) {
		playSound('soundChips');
		toggleBetAmount(false);
	});

	buttonBetAmountR.cursor = "pointer";
	buttonBetAmountR.addEventListener("click", function(evt) {
		playSound('soundChips');
		toggleBetAmount(true);
	});

	buttonPlace.cursor = "pointer";
	buttonPlace.addEventListener("click", function(evt) {
		tryPlaceBet(true);
	});

	buttonCancelBet.cursor = "pointer";
	buttonCancelBet.addEventListener("click", function(evt) {
		playSound('soundButton');
		goGamePage('summary');
	});

	buttonNew.cursor = "pointer";
	buttonNew.addEventListener("click", function(evt) {
		playSound('soundButton');
		goGamePage('bet');
	});

	buttonRace.cursor = "pointer";
	buttonRace.addEventListener("click", function(evt) {
		playSound('soundButton');
		tryStartRace();
	});

	buttonPlaceAgain.cursor = "pointer";
	buttonPlaceAgain.addEventListener("click", function(evt) {
		playSound('soundButton');
		playSound('soundStart');
		playerData.bets = [];
		goGamePage('bet');
	});

	buttonContinue.cursor = "pointer";
	buttonContinue.addEventListener("click", function(evt) {
		playSound('soundButton');
		goPage('result');
	});

	buttonBetLeft.cursor = "pointer";
	buttonBetLeft.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleBetTable(false);
	});

	buttonBetRight.cursor = "pointer";
	buttonBetRight.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleBetTable(true);
	});

	buttonSummaryLeft.cursor = "pointer";
	buttonSummaryLeft.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleSummaryTable(false);
	});

	buttonSummaryRight.cursor = "pointer";
	buttonSummaryRight.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleSummaryTable(true);
	});

	buttonRaceSummaryLeft.cursor = "pointer";
	buttonRaceSummaryLeft.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleRaceSummaryTable(false);
	});

	buttonRaceSummaryRight.cursor = "pointer";
	buttonRaceSummaryRight.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleRaceSummaryTable(true);
	});

	buttonRaceLeft.cursor = "pointer";
	buttonRaceLeft.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleRaceTable(false);
	});

	buttonRaceRight.cursor = "pointer";
	buttonRaceRight.addEventListener("click", function(evt) {
		playSound('soundButton');
		toggleRaceTable(true);
	});

	buttonHow.cursor = "pointer";
	buttonHow.addEventListener("click", function(evt) {
		playSound('soundButton');
		goGamePage('how');
	});

	buttonClose.cursor = "pointer";
	buttonClose.addEventListener("click", function(evt) {
		playSound('soundButton');
		goGamePage('bet');
	});

	window.addEventListener('blur', function() {
		TweenMax.ticker.useRAF(false);
	}, false);


	window.addEventListener('focus', function() {
		TweenMax.ticker.useRAF(true);
	}, false);

	if(gameSettings.enablePercentage){
		createPercentage();
	}
}

/*!
 * 
 * TOGGLE SOCIAL SHARE - This is the function that runs to toggle social share
 * 
 */
function toggleSocialShare(con){
	if(!shareSettings.enable){return;}
	buttonShare.visible = con == true ? false : true;
	shareSaveContainer.visible = con == true ? false : true;
	socialContainer.visible = con;

	if(con){
		if (typeof buttonSave !== 'undefined') {
			TweenMax.to(buttonShare, 3, {overwrite:true, onComplete:toggleSocialShare, onCompleteParams:[false]});
		}
	}
}

function positionShareButtons(){
	if(!shareSettings.enable){return;}
	if (typeof buttonShare !== 'undefined') {
		if (typeof buttonSave !== 'undefined') {
			if(buttonSave.visible){
				buttonShare.x = -((buttonShare.image.naturalWidth/2) + 5);
				buttonSave.x = ((buttonShare.image.naturalWidth/2) + 5);
			}else{
				buttonShare.x = 0;
			}
		}
	}
}

/*!
 * 
 * TOGGLE POP - This is the function that runs to toggle popup overlay
 * 
 */
function togglePop(con){
	exitContainer.visible = con;
}


/*!
 * 
 * DISPLAY PAGES - This is the function that runs to display pages
 * 
 */
var curPage=''
function goPage(page, skipInit){
	curPage=page;
	
	if (typeof mainContainer !== 'undefined') mainContainer.visible = false;
	if (typeof gameContainer !== 'undefined') gameContainer.visible = false;
	if (typeof resultContainer !== 'undefined') resultContainer.visible = false;
	if (typeof togglePop === 'function') togglePop(false);
	if (typeof toggleOptions === 'function') toggleOptions(false);
	
	var targetContainer = null;
	switch(page){
		case 'main':
			if (typeof mainContainer !== 'undefined') targetContainer = mainContainer;
		break;
		
		case 'game':
			if (typeof gameContainer !== 'undefined') targetContainer = gameContainer;
			if (!skipInit) startGame();
		break;
		
		case 'result':
			if (typeof resultContainer !== 'undefined') targetContainer = resultContainer;
			stopGame();
			toggleSocialShare(false);
			playSound('soundResult');

			tweenData.win = 0;
			TweenMax.to(tweenData, .5, {win:playerData.totalWin, overwrite:true, onUpdate:function(){
				resultDescTxt.text = textStrings.resultDesc.replace('[NUMBER]', addCommas(Math.round(tweenData.win)));
			}});
			
			saveGame(playerData.totalWin);
		break;
	}
	
	if(targetContainer != null){
		targetContainer.visible = true;
		targetContainer.alpha = 0;
		TweenMax.to(targetContainer, .5, {alpha:1, overwrite:true});
	}
	
	resizeCanvas();
}

/*!
 * 
 * START GAME - This is the function that runs to start game
 * 
 */
function startGame(){
	gameData.paused = setGameLaunch();
	gameData.raceCount = 1;
	
	playerData.totalWin = 0;
	playerData.bets = [];
	playerData.credit = gameSettings.credit;

	gameData.fieldIndex = Math.floor(Math.random() * fieldSettings.length);

	gameBetContainer.visible = true;
	gameRaceContainer.visible = false;
	scoreContainer.visible = false;
	raceDisplayContainer.visible = false;
	creditRedTxt.alpha = 0;

	//memberpayment
	if(typeof memberData != 'undefined' && memberSettings.enableMembership){
		playerData.credit = memberData.point;
		if(!checkMemberGameType()){
			goMemberPage('user');
		}
	}

	/*gameData.revealResults = [1,2,0,4,3,5,6,7,8,9];
	playerData.bets.push({type:0, racer:[1], totalBet:60});
	playerData.bets.push({type:1, racer:[2], totalBet:1});
	playerData.bets.push({type:8, racer:[1,2,0,4], totalBet:5});
	playerData.bets.push({type:1, racer:[4], totalBet:10});
	goGamePage('summary');*/
	gameData.revealResults = [1,2,0,4,3,5,6,7,8,9];

	playSound('soundStart');
	// goGamePage('bet'); // Handled by Bridge/React

    // Notify Bridge that game is ready (assets loaded, containers created)
    if (window.GameBridge && typeof window.GameBridge.onGameReady === 'function') {
        window.GameBridge.onGameReady();
    }
}

function resizeGameLayout(){
	betTypeContainer.textL.visible = false;
	betTypeContainer.textP.visible = false;
	betAmountContainer.textL.visible = false;
	betAmountContainer.textP.visible = false;
	creditContainer.textL.visible = false;
	creditContainer.textP.visible = false;
	betTotalContainer.textL.visible = false;
	betTotalContainer.textP.visible = false;

	if(viewport.isLandscape){
		betContainer.visible = true;
		betContainerP.visible = false;
		betSummaryContainer.visible = true;
		betSummaryContainerP.visible = false;
		raceSummaryContainer.visible = true;
		raceSummaryContainerP.visible = false;
		raceResultContainer.visible = true;
		raceResultContainerP.visible = false;
		howContainer.visible = true;
		howContainerP.visible = false;

		betAllContainer.x = canvasW/2;
		betAllContainer.y = canvasH/2;

		preparationContainer.x = canvasW/2;
		preparationContainer.y = canvasH/2;

		betTypeContainer.x = canvasW/100 * 38;
		betTypeContainer.y = canvasH/100 * 17;

		betAmountContainer.x = canvasW/100 * 74;
		betAmountContainer.y = canvasH/100 * 17;

		buttonHow.x = canvasW/100 * 52;
		buttonHow.y = canvasH/100 * 17;

		buttonClose.x = canvasW/2;
		buttonClose.y = canvasH/100 * 83;

		creditContainer.x = canvasW/100 * 34;
		creditContainer.y = canvasH/100 * 83;

		betTotalContainer.x = canvasW/100 * 58;
		betTotalContainer.y = canvasH/100 * 83;

		betPlaceContainer.x = canvasW/100 * 72;
		betPlaceContainer.y = canvasH/100 * 83;

		betSummaryAllContainer.x = canvasW/2;
		betSummaryAllContainer.y = canvasH/2;

		buttonRace.x = canvasW/100 * 72;
		buttonRace.y = canvasH/100 * 83;
		buttonRaceDisabled.x = canvasW/100 * 72;
		buttonRaceDisabled.y = canvasH/100 * 83;

		buttonNew.x = canvasW/100 * 58;
		buttonNew.y = canvasH/100 * 83;

    raceResultAllContainer.x = canvasW/100 * 30;
		raceResultAllContainer.y = canvasH/2;

		raceSummaryAllContainer.x = canvasW/100 * 70;
		raceSummaryAllContainer.y = canvasH/2;

		raceButtonsContainer.x = canvasW/2;
		raceButtonsContainer.y = canvasH/100 * 83;

		howAllContainer.x = canvasW/2;
		howAllContainer.y = canvasH/2;

		scoreContainer.x = canvasW/2;
		scoreContainer.y = canvasH/100 * 82;

		raceDisplayContainer.x = canvasW/2;
		raceDisplayContainer.y = canvasH/100 * 50;

		gameRaceContainer.x = 0;
		gameRaceContainer.y = -200;
	}else{
		betContainer.visible = false;
		betContainerP.visible = true;
		betSummaryContainer.visible = false;
		betSummaryContainerP.visible = true;
		raceSummaryContainer.visible = false;
		raceSummaryContainerP.visible = true;
		raceResultContainer.visible = false;
		raceResultContainerP.visible = true;
		howContainer.visible = false;
		howContainerP.visible = true;

		betAllContainer.x = canvasW/2;
		betAllContainer.y = canvasH/2;

		preparationContainer.x = canvasW/2;
		preparationContainer.y = canvasH/2;

		betTypeContainer.x = canvasW/100 * 34;
		betTypeContainer.y = canvasH/100 * 25;

		betAmountContainer.x = canvasW/100 * 74;
		betAmountContainer.y = canvasH/100 * 25;

		buttonHow.x = canvasW/100 * 57;
		buttonHow.y = canvasH/100 * 25;

		buttonClose.x = canvasW/2;
		buttonClose.y = canvasH/100 * 78;

		creditContainer.x = canvasW/100 * 26;
		creditContainer.y = canvasH/100 * 78;

		betTotalContainer.x = canvasW/100 * 50;
		betTotalContainer.y = canvasH/100 * 78;

		betPlaceContainer.x = canvasW/100 * 74;
		betPlaceContainer.y = canvasH/100 * 78;

		betSummaryAllContainer.x = canvasW/2;
		betSummaryAllContainer.y = canvasH/2;

		buttonRace.x = canvasW/100 * 74;
		buttonRace.y = canvasH/100 * 78;
		buttonRaceDisabled.x = canvasW/100 * 74;
		buttonRaceDisabled.y = canvasH/100 * 78;

		buttonNew.x = canvasW/100 * 50;
		buttonNew.y = canvasH/100 * 78;

		raceResultAllContainer.x = canvasW/2;
		raceResultAllContainer.y = canvasH/100 * 25;

		raceSummaryAllContainer.x = canvasW/2;
		raceSummaryAllContainer.y = canvasH/100 * 60;

		raceButtonsContainer.x = canvasW/2;
		raceButtonsContainer.y = canvasH/100 * 86;

		howAllContainer.x = canvasW/2;
		howAllContainer.y = canvasH/2;

		scoreContainer.x = canvasW/2;
		scoreContainer.y = canvasH/100 * 82;

		raceDisplayContainer.x = canvasW/2;
		raceDisplayContainer.y = canvasH/100 * 50;

		gameRaceContainer.x = -200;
		gameRaceContainer.y = 0;
	}
}

 /*!
 * 
 * STOP GAME - This is the function that runs to stop play game
 * 
 */
function stopGame(){
	gameData.paused = true;
	TweenMax.killAll(false, true, false);
}

function saveGame(score){
	if ( typeof toggleScoreboardSave == 'function' ) { 
		$.scoreData.score = score;
		if(typeof type != 'undefined'){
			$.scoreData.type = type;	
		}
		toggleScoreboardSave(true);
	}

	/*$.ajax({
      type: "POST",
      url: 'saveResults.php',
      data: {score:score},
      success: function (result) {
          console.log(result);
      }
    });*/
}

/*!
 * 
 * GO GAME PAGE - This is the function that runs to go game page
 * 
 */
function goGamePage(type){
	if (typeof betAllContainer !== 'undefined') betAllContainer.visible = false;
	if (typeof betTypeContainer !== 'undefined') betTypeContainer.visible = false;
	if (typeof betAmountContainer !== 'undefined') betAmountContainer.visible = false;
	if (typeof creditContainer !== 'undefined') creditContainer.visible = false;
	if (typeof betTotalContainer !== 'undefined') betTotalContainer.visible = false;
	if (typeof betPlaceContainer !== 'undefined') betPlaceContainer.visible = false;

	if (typeof betSummaryAllContainer !== 'undefined') betSummaryAllContainer.visible = false;
	if (typeof buttonNew !== 'undefined') buttonNew.visible = false;
	if (typeof buttonRace !== 'undefined') buttonRace.visible = false;
	if (typeof buttonRaceDisabled !== 'undefined') buttonRaceDisabled.visible = false;

	if (typeof raceResultAllContainer !== 'undefined') raceResultAllContainer.visible = false;
	if (typeof raceSummaryAllContainer !== 'undefined') raceSummaryAllContainer.visible = false;
	if (typeof raceButtonsContainer !== 'undefined') raceButtonsContainer.visible = false;

	if (typeof howAllContainer !== 'undefined') howAllContainer.visible = false;
	if (typeof buttonHow !== 'undefined') buttonHow.visible = false;
	if (typeof buttonClose !== 'undefined') buttonClose.visible = false;
	if (typeof preparationContainer !== 'undefined') preparationContainer.visible = false;
	
	if (typeof buttonSettings !== 'undefined') buttonSettings.visible = false;
	if (typeof buttonStart !== 'undefined') buttonStart.visible = true;

	stopPreparationAnimation();

	if(type == 'preparation'){
		if (typeof buttonSettings !== 'undefined') buttonSettings.visible = false;
		if (typeof buttonStart !== 'undefined') buttonStart.visible = false;
		if (typeof optionsContainer !== 'undefined') optionsContainer.visible = false;
		if (typeof guideline !== 'undefined') guideline.visible = false;

		if (typeof preparationContainer !== 'undefined') {
			preparationContainer.visible = true;
			
			if (typeof preparationLogo !== 'undefined' && preparationLogo.image) {
				preparationLogo.visible = true;
				preparationLogo.scaleX = preparationLogo.scaleY = 0.3; // Scale down logo
				preparationLogo.y = -50; // Center vertically (offset for text below)
				preparationLogo.x = 0; // Center horizontally
			}
			
			if (typeof preparationTxt !== 'undefined') {
				preparationTxt.y = 120; // Position below logo
				preparationTxt.text = "SELECT YOUR RACER";
			}
			
			startPreparationAnimation();
		}
	}else if(type == 'bet'){
		if (typeof betAllContainer !== 'undefined') betAllContainer.visible = true;
		
		betTypeContainer.visible = true;
		betAmountContainer.visible = true;
		creditContainer.visible = true;
		betTotalContainer.visible = true;
		betPlaceContainer.visible = true;

		buttonHow.visible = true;
		buttonBetLeft.visible = false;
		buttonBetRight.visible = true;
		betContentContainerP.x = 0;
		
		updateBetOptions();
		updateBetTable();
		updateCredit();
	}else if(type == 'how'){
		howAllContainer.visible = true;
		buttonClose.visible = true;
	}else if(type == 'summary'){
		betSummaryAllContainer.visible = true;
		creditContainer.visible = true;
		buttonNew.visible = true;
		buttonRace.visible = true;
		buttonRaceDisabled.visible = true;

		buttonSummaryLeft.visible = false;
		buttonSummaryRight.visible = false;
		betSummaryContentContainerP.x = 0;

		checkCanBet();
		updateSummaryTable();
	}else if(type == 'result'){
		raceResultAllContainer.visible = true;
		raceSummaryAllContainer.visible = true;
		raceButtonsContainer.visible = true;

		buttonRaceLeft.visible = false;
		buttonRaceRight.visible = true;
		raceResultContentContainerP.x = 0;

		buttonRaceSummaryLeft.visible = false;
		buttonRaceSummaryRight.visible = false;
		raceSummaryContentContainerP.x = 0;

		updateRaceTable();
		updateRaceSummaryTable();

		if(playerData.credit > 0){
			buttonPlaceAgain.visible = true;
			buttonContinue.visible = true;
			buttonPlaceAgain.x = -90;
			buttonContinue.x = 90;
		}else{
			buttonPlaceAgain.visible = false;
			buttonContinue.visible = true;
			buttonContinue.x = 0;
		}

        // [Bridge Integration] Hide buttons to enforce server-controlled duration
        if (window.GameBridge) {
            if (typeof buttonPlaceAgain !== 'undefined') buttonPlaceAgain.visible = false;
            if (typeof buttonContinue !== 'undefined') buttonContinue.visible = false;
        }

		//memberpayment
		if(typeof memberData != 'undefined' && memberSettings.enableMembership){
			var returnPoint = {chance:0, point:playerData.credit, score:0};
			matchUserResult(undefined, returnPoint);
		}
	}
}

/*!
 * 
 * PREPARATION ANIMATION - This is the function that runs for preparation animation
 * 
 */
var preparationTimer = null;
var preparationDots = 0;
function startPreparationAnimation(){
	if(preparationTimer != null) return;
	preparationDots = 0;
	preparationTimer = setInterval(function(){
		preparationDots++;
		if(preparationDots > 3) preparationDots = 0;
		var dots = "";
		for(var i=0; i<preparationDots; i++) dots += ".";
		if (typeof preparationTxt !== 'undefined') preparationTxt.text = "SELECT YOUR RACER" + dots;
	}, 500);
}

function stopPreparationAnimation(){
	if(preparationTimer != null){
		clearInterval(preparationTimer);
		preparationTimer = null;
	}
}

function checkCanBet(){
	buttonNew.visible = true;
	var totalAmount = getCurrentBetAmount();
	if(playerData.bets.length >= gameSettings.maxBets || (playerData.credit - totalAmount) == 0){
		buttonNew.visible = false;
	}

	buttonRace.visible = false;
	if(playerData.bets.length > 0){
		buttonRace.visible = true;
	}
}

 /*!
 * 
 * BET OPTIONS - This is the function that runs to update bet options
 * 
 */
function toggleBetType(con){
	if(con){
		gameData.betTypeIndex++;
		gameData.betTypeIndex = gameData.betTypeIndex > betSettings.length-1 ? 0 :gameData.betTypeIndex;
	}else{
		gameData.betTypeIndex--;
		gameData.betTypeIndex = gameData.betTypeIndex < 0 ? betSettings.length-1 :gameData.betTypeIndex;
	}

	gameData.betAmountIndex = 0;
	updateBetOptions();
	updateBetTable();
}

function toggleBetAmount(con){
	if(con){
		gameData.betAmountIndex++;
		gameData.betAmountIndex = gameData.betAmountIndex > betSettings[gameData.betTypeIndex].bets.length-1 ? 0 :gameData.betAmountIndex;
	}else{
		gameData.betAmountIndex--;
		gameData.betAmountIndex = gameData.betAmountIndex < 0 ? betSettings[gameData.betTypeIndex].bets.length-1 :gameData.betAmountIndex;
	}

	updateBetOptions();
	updateTotalBet();
}

function updateBetOptions(){
	betTypeTxt.text = betSettings[gameData.betTypeIndex].name;
	betAmountTxt.text = textStrings.currency + addCommas(betSettings[gameData.betTypeIndex].bets[gameData.betAmountIndex]);

	buttonCancelBet.visible = false;
	if(playerData.bets.length > 0){
		buttonCancelBet.visible = true;
	}
}

 /*!
 * 
 * BET TABLE - This is the function that runs to update bet table
 * 
 */
function updateBetTable(){
	betContentContainer.removeAllChildren();

	var posData = {x:0, y:0, tY:-180, sX:-305, sY:-138, spaceY:35.5};
	var betType = betSettings[gameData.betTypeIndex].type;
	var columnPos = [0, 60, 110, 160, 210, 300, 400, 530];
	var columnDisplay = [];
	for(var n=0; n<columnPos.length; n++){
		if(n == 0){
			columnDisplay.push({type:'POS', name:textStrings.tablePlace[0], x:columnPos[n], align:'center'});
		}else if(n == 5){
			columnDisplay.push({type:'RACER', name:'', x:columnPos[n], align:'center'});
		}else if(n == 6){
			columnDisplay.push({type:'ODDS', name:textStrings.tablePlace[1], x:columnPos[n], align:'center'});
		}else if(n == 7){
			columnDisplay.push({type:'NAME', name:textStrings.tablePlace[2], x:columnPos[n], align:'center'});
		}else{
			if(betType == 'win'){
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[0], x:columnPos[1], align:'center'});
			}else if(betType == 'place'){
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[0]+textStrings.or+textStrings.position[1], x:columnPos[1], align:'left'});
			}else if(betType == 'show'){
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[0]+textStrings.or+textStrings.position[1]+textStrings.or+textStrings.position[2], x:columnPos[1], align:'left'});
			}else if(betType == 'exacta'){
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[0], x:columnPos[1], align:'center'});
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[1], x:columnPos[2], align:'center'});
			}else if(betType == 'exactabox'){
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[0]+textStrings.or+textStrings.position[1], x:columnPos[1], align:'left'});
			}else if(betType == 'trifecta'){
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[0], x:columnPos[1], align:'center'});
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[1], x:columnPos[2], align:'center'});
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[2], x:columnPos[3], align:'center'});
			}else if(betType == 'trifectabox'){
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[0]+textStrings.or+textStrings.position[1]+textStrings.or+textStrings.position[2], x:columnPos[1], align:'left'});
			}else if(betType == 'superfecta'){
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[0], x:columnPos[1], align:'center'});
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[1], x:columnPos[2], align:'center'});
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[2], x:columnPos[3], align:'center'});
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[3], x:columnPos[4], align:'center'});
			}else if(betType == 'superfectabox'){
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[0]+textStrings.or+textStrings.position[1]+textStrings.or+textStrings.position[2]+textStrings.or+textStrings.position[3], x:columnPos[1], align:'left'});
			}
			n = 4;
		}
	}

	posData.x = posData.sX;
	posData.y = posData.tY;
	for(var n=0; n<columnDisplay.length; n++){
		var newDisplay = new createjs.Text();
		newDisplay.font = "20px Orbitron";
		newDisplay.color = '#65EF96';
		newDisplay.textAlign = columnDisplay[n].align;
		newDisplay.textBaseline='alphabetic';
		newDisplay.text = columnDisplay[n].name;
		newDisplay.x = posData.x + columnDisplay[n].x;
		newDisplay.y = posData.y + 5;
		if(columnDisplay[n].align == 'left'){
			newDisplay.x -= 16;
		}
		betContentContainer.addChild(newDisplay);
	}

	posData.x = posData.sX;
	posData.y = posData.sY;
	for(var n=0; n<racerSettings.length; n++){
		for(var c=0; c<columnDisplay.length; c++){
			if(columnDisplay[c].type == 'POS'){
				var newIcon = new createjs.Bitmap(loader.getResult('racerIcon'+n));
				centerReg(newIcon);
				newIcon.x = posData.x;
				newIcon.y = posData.y;

				betContentContainer.addChild(newIcon);
			}else if(columnDisplay[c].type == 'ODDS'){
				var newOdds = new createjs.Text();
				newOdds.font = "20px Orbitron";
				newOdds.color = '#fff';
				newOdds.textAlign = columnDisplay[c].align;
				newOdds.textBaseline='alphabetic';
				newOdds.text = racerSettings[n].odds[gameData.betTypeIndex];
				newOdds.x = posData.x + columnDisplay[c].x;
				newOdds.y = posData.y + 5;

				betContentContainer.addChild(newOdds);
			}else if(columnDisplay[c].type == 'NAME'){
				var newName = new createjs.Text();
				newName.font = "20px Orbitron";
				newName.color = '#fff';
				newName.textAlign = columnDisplay[c].align;
				newName.textBaseline='alphabetic';
				newName.text = racerSettings[n].name;
				newName.x = posData.x + columnDisplay[c].x;
				newName.y = posData.y + 5;

				betContentContainer.addChild(newName);
			}else if(columnDisplay[c].type == 'RACER'){
				$.racer[n] = createRacer(n);
				$.racer[n].scaleX = $.racer[n].scaleY = .5;
				$.racer[n].x = posData.x + columnDisplay[c].x;
				$.racer[n].y = posData.y + 20;
				betContentContainer.addChild($.racer[n]);
			}else{
				$.checkbox[n+'_'+c] = new createjs.Container();
				$.checkbox[n+'_'+c].racerIndex = n;
				$.checkbox[n+'_'+c].columnIndex = c;

				var newCheckbox = new createjs.Bitmap(loader.getResult('itemCheckbox'));
				centerReg(newCheckbox);
				var newCheckboxTick = new createjs.Bitmap(loader.getResult('itemCheckboxTick'));
				centerReg(newCheckboxTick);
				var newCheckboxDisabled = new createjs.Bitmap(loader.getResult('itemCheckboxDisabled'));
				centerReg(newCheckboxDisabled);
				newCheckboxTick.visible = false;
				newCheckboxDisabled.visible = false;
				$.checkbox[n+'_'+c].x = posData.x + columnDisplay[c].x;
				$.checkbox[n+'_'+c].y = posData.y;

				$.checkbox[n+'_'+c].checkbox = newCheckbox;
				$.checkbox[n+'_'+c].checkboxTick = newCheckboxTick;
				$.checkbox[n+'_'+c].checkboxDisabled = newCheckboxDisabled;
				$.checkbox[n+'_'+c].addChild(newCheckboxDisabled, newCheckbox, newCheckboxTick);
				betContentContainer.addChild($.checkbox[n+'_'+c]);

				$.checkbox[n+'_'+c].cursor = "pointer";
				$.checkbox[n+'_'+c].addEventListener("click", function(evt) {
					playSound('soundButton');
					toggleCheckbox(evt.currentTarget.columnIndex, evt.currentTarget.racerIndex);
				});
			}
		}

		posData.y += posData.spaceY;
	}

	//portrait
	betContentContainerP.removeAllChildren();

	var posData = {x:0, y:0, tY:-180, sX:-210, sY:-138, spaceY:35.5};
	var betType = betSettings[gameData.betTypeIndex].type;
	var columnPos = [0, 60, 110, 160, 210, 300, 400, 530];
	var columnDisplay = [];
	for(var n=0; n<columnPos.length; n++){
		if(n == 0){
			columnDisplay.push({type:'POS', name:textStrings.tablePlace[0], x:columnPos[n], align:'center'});
		}else if(n == 5){
			columnDisplay.push({type:'RACER', name:'', x:columnPos[n], align:'center'});
		}else if(n == 6){
			columnDisplay.push({type:'ODDS', name:textStrings.tablePlace[1], x:columnPos[n], align:'center'});
		}else if(n == 7){
			columnDisplay.push({type:'NAME', name:textStrings.tablePlace[2], x:columnPos[n], align:'center'});
		}else{
			if(betType == 'win'){
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[0], x:columnPos[1], align:'center'});
			}else if(betType == 'place'){
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[0]+textStrings.or+textStrings.position[1], x:columnPos[1], align:'left'});
			}else if(betType == 'show'){
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[0]+textStrings.or+textStrings.position[1]+textStrings.or+textStrings.position[2], x:columnPos[1], align:'left'});
			}else if(betType == 'exacta'){
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[0], x:columnPos[1], align:'center'});
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[1], x:columnPos[2], align:'center'});
			}else if(betType == 'exactabox'){
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[0]+textStrings.or+textStrings.position[1], x:columnPos[1], align:'left'});
			}else if(betType == 'trifecta'){
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[0], x:columnPos[1], align:'center'});
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[1], x:columnPos[2], align:'center'});
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[2], x:columnPos[3], align:'center'});
			}else if(betType == 'trifectabox'){
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[0]+textStrings.or+textStrings.position[1]+textStrings.or+textStrings.position[2], x:columnPos[1], align:'left'});
			}else if(betType == 'superfecta'){
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[0], x:columnPos[1], align:'center'});
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[1], x:columnPos[2], align:'center'});
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[2], x:columnPos[3], align:'center'});
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[3], x:columnPos[4], align:'center'});
			}else if(betType == 'superfectabox'){
				columnDisplay.push({type:'CHECKBOX', name:textStrings.position[0]+textStrings.or+textStrings.position[1]+textStrings.or+textStrings.position[2]+textStrings.or+textStrings.position[3], x:columnPos[1], align:'left'});
			}
			n = 4;
		}
	}

	posData.x = posData.sX;
	posData.y = posData.tY;
	for(var n=0; n<columnDisplay.length; n++){
		var newDisplay = new createjs.Text();
		newDisplay.font = "20px Orbitron";
		newDisplay.color = '#65EF96';
		newDisplay.textAlign = columnDisplay[n].align;
		newDisplay.textBaseline='alphabetic';
		newDisplay.text = columnDisplay[n].name;
		newDisplay.x = posData.x + columnDisplay[n].x;
		newDisplay.y = posData.y + 5;
		if(columnDisplay[n].align == 'left'){
			newDisplay.x -= 16;
		}
		betContentContainerP.addChild(newDisplay);
	}

	posData.x = posData.sX;
	posData.y = posData.sY;
	for(var n=0; n<racerSettings.length; n++){
		for(var c=0; c<columnDisplay.length; c++){
			if(columnDisplay[c].type == 'POS'){
				var newIcon = new createjs.Bitmap(loader.getResult('racerIcon'+n));
				centerReg(newIcon);
				newIcon.x = posData.x;
				newIcon.y = posData.y;

				betContentContainerP.addChild(newIcon);
			}else if(columnDisplay[c].type == 'ODDS'){
				var newOdds = new createjs.Text();
				newOdds.font = "20px Orbitron";
				newOdds.color = '#fff';
				newOdds.textAlign = columnDisplay[c].align;
				newOdds.textBaseline='alphabetic';
				newOdds.text = racerSettings[n].odds[gameData.betTypeIndex];
				newOdds.x = posData.x + columnDisplay[c].x;
				newOdds.y = posData.y + 5;

				betContentContainerP.addChild(newOdds);
			}else if(columnDisplay[c].type == 'NAME'){
				var newName = new createjs.Text();
				newName.font = "20px Orbitron";
				newName.color = '#fff';
				newName.textAlign = columnDisplay[c].align;
				newName.textBaseline='alphabetic';
				newName.text = racerSettings[n].name;
				newName.x = posData.x + columnDisplay[c].x;
				newName.y = posData.y + 5;

				betContentContainerP.addChild(newName);
			}else if(columnDisplay[c].type == 'RACER'){
				$.racer[n+'_p'] = createRacer(n);
				$.racer[n+'_p'].scaleX = $.racer[n+'_p'].scaleY = .5;
				$.racer[n+'_p'].x = posData.x + columnDisplay[c].x;
				$.racer[n+'_p'].y = posData.y + 20;
				betContentContainerP.addChild($.racer[n+'_p']);
			}else{
				$.checkbox[n+'_'+c+'_p'] = new createjs.Container();
				$.checkbox[n+'_'+c+'_p'].racerIndex = n;
				$.checkbox[n+'_'+c+'_p'].columnIndex = c;

				var newCheckbox = new createjs.Bitmap(loader.getResult('itemCheckbox'));
				centerReg(newCheckbox);
				var newCheckboxTick = new createjs.Bitmap(loader.getResult('itemCheckboxTick'));
				centerReg(newCheckboxTick);
				var newCheckboxDisabled = new createjs.Bitmap(loader.getResult('itemCheckboxDisabled'));
				centerReg(newCheckboxDisabled);
				newCheckboxTick.visible = false;
				newCheckboxDisabled.visible = false;
				$.checkbox[n+'_'+c+'_p'].x = posData.x + columnDisplay[c].x;
				$.checkbox[n+'_'+c+'_p'].y = posData.y;

				$.checkbox[n+'_'+c+'_p'].checkbox = newCheckbox;
				$.checkbox[n+'_'+c+'_p'].checkboxTick = newCheckboxTick;
				$.checkbox[n+'_'+c+'_p'].checkboxDisabled = newCheckboxDisabled;
				$.checkbox[n+'_'+c+'_p'].addChild(newCheckboxDisabled, newCheckbox, newCheckboxTick);
				betContentContainerP.addChild($.checkbox[n+'_'+c+'_p']);

				$.checkbox[n+'_'+c+'_p'].cursor = "pointer";
				$.checkbox[n+'_'+c+'_p'].addEventListener("click", function(evt) {
					playSound('soundButton');
					toggleCheckbox(evt.currentTarget.columnIndex, evt.currentTarget.racerIndex);
				});
			}
		}

		posData.y += posData.spaceY;
	}

	buttonPlace.visible = false;
	updateTotalBet();
}

/*!
 * 
 * TOGGLE BET TABLE - This is the function that runs to toggle bet table
 * 
 */
function toggleBetTable(con){
	var newX = 0;
	if(con){
		buttonBetLeft.visible = true;
		buttonBetRight.visible = false;
		newX = -170;
	}else{
		buttonBetLeft.visible = false;
		buttonBetRight.visible = true;
	}

	TweenMax.to(betContentContainerP, .2, {x:newX, overwrite:true});
}

function toggleSummaryTable(con){
	var newX = 0;
	if(con){
		buttonSummaryLeft.visible = true;
		buttonSummaryRight.visible = false;
		newX = -105;
	}else{
		buttonSummaryLeft.visible = false;
		buttonSummaryRight.visible = true;
	}

	TweenMax.to(betSummaryContentContainerP, .2, {x:newX, overwrite:true});
}

function toggleRaceSummaryTable(con){
	var newX = 0;
	if(con){
		buttonRaceSummaryLeft.visible = true;
		buttonRaceSummaryRight.visible = false;
		newX = -75;
	}else{
		buttonRaceSummaryLeft.visible = false;
		buttonRaceSummaryRight.visible = true;
	}

	TweenMax.to(raceSummaryContentContainerP, .2, {x:newX, overwrite:true});
}

function toggleRaceTable(con){
	var newX = 0;
	if(con){
		buttonRaceLeft.visible = true;
		buttonRaceRight.visible = false;
		newX = -470;
	}else{
		buttonRaceLeft.visible = false;
		buttonRaceRight.visible = true;
	}

	TweenMax.to(raceResultContentContainerP, .2, {x:newX, overwrite:true});
}

 /*!
 * 
 * TOGGLE BET CHECKBOX - This is the function that runs to update bet checkbox
 * 
 */
function toggleCheckbox(column, racer){
	if($.checkbox[racer+'_'+column].checkboxDisabled.visible){
		return;
	}

	var betType = betSettings[gameData.betTypeIndex].type;
	var totalCheckboxs = 1;
	var totalSelect = 1;
	var totalSelected = 0;
	if(betType == 'exacta'){
		totalCheckboxs = 2;
	}else if(betType == 'exactabox'){
		totalSelect = 2;
	}else if(betType == 'trifecta'){
		totalCheckboxs = 3;
	}else if(betType == 'trifectabox'){
		totalSelect = 3;
	}else if(betType == 'superfecta'){
		totalCheckboxs = 4;
	}else if(betType == 'superfectabox'){
		totalSelect = 4;
	}

	if($.checkbox[racer+'_'+column].checkboxTick.visible){
		$.checkbox[racer+'_'+column].checkboxTick.visible = false;
		$.checkbox[racer+'_'+column].checkbox.visible = true;
		$.checkbox[racer+'_'+column].checkboxDisabled.visible = false;
		$.checkbox[racer+'_'+column+'_p'].checkboxTick.visible = false;
		$.checkbox[racer+'_'+column+'_p'].checkbox.visible = true;
		$.checkbox[racer+'_'+column+'_p'].checkboxDisabled.visible = false;

		$.racer[racer].gotoAndPlay('idle');
		$.racer[racer+'_p'].gotoAndPlay('idle');

		resetCheckbox(totalCheckboxs, column);
	}else{
		$.checkbox[racer+'_'+column].checkboxTick.visible = true;
		$.checkbox[racer+'_'+column].checkbox.visible = false;
		$.checkbox[racer+'_'+column].checkboxDisabled.visible = false;
		$.checkbox[racer+'_'+column+'_p'].checkboxTick.visible = true;
		$.checkbox[racer+'_'+column+'_p'].checkbox.visible = false;
		$.checkbox[racer+'_'+column+'_p'].checkboxDisabled.visible = false;

		$.racer[racer].gotoAndPlay('run');
		$.racer[racer+'_p'].gotoAndPlay('run');
		
		for(var n=0; n<racerSettings.length; n++){
			if($.checkbox[n+'_'+column].checkboxTick.visible){
				totalSelected++;
			}
		}

		if(totalSelected == totalSelect){
			for(var n=0; n<racerSettings.length; n++){
				if(!$.checkbox[n+'_'+column].checkboxTick.visible){
					$.checkbox[n+'_'+column].checkbox.visible = false;
					$.checkbox[n+'_'+column].checkboxDisabled.visible = true;
					$.checkbox[n+'_'+column+'_p'].checkbox.visible = false;
					$.checkbox[n+'_'+column+'_p'].checkboxDisabled.visible = true;
				}
			}

			for(var c=1; c<totalCheckboxs+1; c++){
				if(!$.checkbox[racer+'_'+c].checkboxTick.visible){
					$.checkbox[racer+'_'+c].checkbox.visible = false;
					$.checkbox[racer+'_'+c].checkboxDisabled.visible = true;
					$.checkbox[racer+'_'+c+'_p'].checkbox.visible = false;
					$.checkbox[racer+'_'+c+'_p'].checkboxDisabled.visible = true;
				}
			}
		}
	}

	tryPlaceBet(false);
	updateTotalBet();
}

function resetCheckbox(totalCheckboxs, column){
	var racerNumbers = [];

	if(totalCheckboxs > 1){
		for(var c=1; c<totalCheckboxs+1; c++){
			var thisRacerSelected = -1;
			for(var n=0; n<racerSettings.length; n++){
				if($.checkbox[n+'_'+c].checkboxTick.visible){
					thisRacerSelected = n;
				}
			}
			racerNumbers.push(thisRacerSelected);
		}

		for(var c=1; c<totalCheckboxs+1; c++){
			for(var n=0; n<racerSettings.length; n++){
				$.checkbox[n+'_'+c].checkbox.visible = true;
				$.checkbox[n+'_'+c].checkboxTick.visible = false;
				$.checkbox[n+'_'+c].checkboxDisabled.visible = false;

				$.checkbox[n+'_'+c+'_p'].checkbox.visible = true;
				$.checkbox[n+'_'+c+'_p'].checkboxTick.visible = false;
				$.checkbox[n+'_'+c+'_p'].checkboxDisabled.visible = false;
			}
		}
	
		//prefill
		for(var h=0; h<racerNumbers.length; h++){
			var racerSelect = racerNumbers[h];
			if(racerSelect != -1){
				//column
				for(var n=0; n<racerSettings.length; n++){
					$.checkbox[n+'_'+(h+1)].checkbox.visible = false;
					$.checkbox[n+'_'+(h+1)].checkboxTick.visible = false;
					$.checkbox[n+'_'+(h+1)].checkboxDisabled.visible = true;
					$.checkbox[n+'_'+(h+1)+'_p'].checkbox.visible = false;
					$.checkbox[n+'_'+(h+1)+'_p'].checkboxTick.visible = false;
					$.checkbox[n+'_'+(h+1)+'_p'].checkboxDisabled.visible = true;
				}
	
				//row
				for(var c=1; c<totalCheckboxs+1; c++){
					$.checkbox[racerSelect+'_'+c].checkbox.visible = false;
					$.checkbox[racerSelect+'_'+c].checkboxTick.visible = false;
					$.checkbox[racerSelect+'_'+c].checkboxDisabled.visible = true;
					$.checkbox[racerSelect+'_'+c+'_p'].checkbox.visible = false;
					$.checkbox[racerSelect+'_'+c+'_p'].checkboxTick.visible = false;
					$.checkbox[racerSelect+'_'+c+'_p'].checkboxDisabled.visible = true;
				}
			}
		}
	
		for(var h=0; h<racerNumbers.length; h++){
			var racerSelect = racerNumbers[h];
			if(racerSelect != -1){
				$.checkbox[racerSelect+'_'+(h+1)].checkbox.visible = false;
				$.checkbox[racerSelect+'_'+(h+1)].checkboxTick.visible = true;
				$.checkbox[racerSelect+'_'+(h+1)].checkboxDisabled.visible = false;
				$.checkbox[racerSelect+'_'+(h+1)+'_p'].checkbox.visible = false;
				$.checkbox[racerSelect+'_'+(h+1)+'_p'].checkboxTick.visible = true;
				$.checkbox[racerSelect+'_'+(h+1)+'_p'].checkboxDisabled.visible = false;
			}
		}
	}else{
		var racerNumbers = [];
		for(var n=0; n<racerSettings.length; n++){
			if($.checkbox[n+'_'+1].checkboxTick.visible){
				racerNumbers.push(n);
			}
		}

		for(var n=0; n<racerSettings.length; n++){
			if(racerNumbers.indexOf(n) == -1){
				$.checkbox[n+'_'+column].checkbox.visible = true;
				$.checkbox[n+'_'+column].checkboxTick.visible = false;
				$.checkbox[n+'_'+column].checkboxDisabled.visible = false;
				$.checkbox[n+'_'+column+'_p'].checkbox.visible = true;
				$.checkbox[n+'_'+column+'_p'].checkboxTick.visible = false;
				$.checkbox[n+'_'+column+'_p'].checkboxDisabled.visible = false;
			}
		}
	}
}

function updateTotalBet(){
	var betType = betSettings[gameData.betTypeIndex].type;
	var combination = 0;
	if(buttonPlace.visible){
		combination = 1;
		if(betType == 'exactabox'){
			combination = 4;
		}else if(betType == 'trifectabox'){
			combination = 6;
		}else if(betType == 'superfectabox'){
			combination = 24;
		}
	}

	gameData.totalBet = betSettings[gameData.betTypeIndex].bets[gameData.betAmountIndex] * combination;
	betTotalTxt.text = textStrings.currency + addCommas(gameData.totalBet);
}

/*!
 * 
 * TRY PLACE BET - This is the function that runs to try place bet
 * 
 */
function tryPlaceBet(con){
	buttonPlace.visible = false;

	var betType = betSettings[gameData.betTypeIndex].type;
	var totalCheckboxs = 1;
	var totalSelected = 1;
	var checkType = 0;
	if(betType == 'exacta'){
		totalCheckboxs = 2;
	}else if(betType == 'exactabox'){
		checkType = 1;
		totalSelected = 2;
	}else if(betType == 'trifecta'){
		totalCheckboxs = 3;
	}else if(betType == 'trifectabox'){
		checkType = 1;
		totalSelected = 3;
	}else if(betType == 'superfecta'){
		totalCheckboxs = 4;
	}else if(betType == 'superfectabox'){
		checkType = 1;
		totalSelected = 4;
	}

	var racerNumbers = [];
	for(var c=1; c<totalCheckboxs+1; c++){
		for(var n=0; n<racerSettings.length; n++){
			if($.checkbox[n+'_'+c].checkboxTick.visible){
				racerNumbers.push(n);
			}
		}
	}

	if(checkType == 0){
		if(racerNumbers.length == totalCheckboxs){
			buttonPlace.visible = true;
		}
	}else if(checkType == 1){
		if(racerNumbers.length == totalSelected){
			buttonPlace.visible = true;
		}
	}

	if(con){
		if(playerData.credit >= gameData.totalBet){
			playSound('soundBet');
			playerData.bets.push({type:gameData.betTypeIndex, racer:racerNumbers, totalBet:gameData.totalBet});
			goGamePage('summary');
			updateCredit();
			checkCanBet();
		}else{
			playSound('soundError');
			animateCredit(creditRedTxt, .5);
		}
	}
}

/*!
 * 
 * SUMMARY TABLE - This is the function that runs to update summary table
 * 
 */
function updateSummaryTable(){
	betSummaryContentContainer.removeAllChildren();

	var posData = {x:0, y:0, tY:-180, sX:-305, sY:-138, spaceY:35.5};
	var columnPos = [0, 30, 310, 450, 580];

	posData.x = posData.sX;
	posData.y = posData.tY;
	/*for(var n=0; n<columnPos.length; n++){
		var newDisplay = new createjs.Text();
		newDisplay.font = "bold 20px Orbitron";
		newDisplay.color = '#65EF96';
		newDisplay.textAlign = "center";
		if(n == 1){
			newDisplay.textAlign = "left";
		}
		newDisplay.textBaseline='alphabetic';
		newDisplay.text = textStrings.tableSummary[n];
		newDisplay.x = posData.x + columnPos[n];
		newDisplay.y = posData.y + 5;
		betSummaryContentContainer.addChild(newDisplay);
	}*/

	posData.x = posData.sX;
	posData.y = posData.sY;
	for(var n=0; n<playerData.bets.length; n++){
		for(var c=0; c<columnPos.length; c++){
			var extraY = 5;
			var newSummary = new createjs.Text();
			newSummary.font = "20px Orbitron";
			newSummary.color = '#fff';
			newSummary.textAlign = "center";
			newSummary.textBaseline='alphabetic';
			
			if(c == 0){
				newSummary.text = (n+1)+'.';
			}else if(c == 1){
				newSummary.textAlign = "left";
				newSummary.text = betSettings[playerData.bets[n].type].name;
		}else if(c == 2){
				newSummary.text = returnRacerNumbers(playerData.bets[n].racer);
			}else if(c == 3){
				newSummary.text = textStrings.currency + addCommas(playerData.bets[n].totalBet);
			}else if(c == 4){
				newSummary = new createjs.Bitmap(loader.getResult('buttonRemove'));
				newSummary.betIndex = n;
				centerReg(newSummary);
				extraY = 0;

				newSummary.cursor = "pointer";
				newSummary.addEventListener("click", function(evt) {
					playSound('soundError');
					removeBet(evt.currentTarget.betIndex);
				});
			}

			newSummary.x = posData.x + columnPos[c];
			newSummary.y = posData.y + extraY;

			betSummaryContentContainer.addChild(newSummary);
		}

		posData.y += posData.spaceY;
	}

	//portrait
	betSummaryContentContainerP.removeAllChildren();

	var posData = {x:0, y:0, tY:-180, sX:-225, sY:-138, spaceY:35.5};
	var columnPos = [0, 30, 190, 310, 420];

	posData.x = posData.sX;
	posData.y = posData.tY;
	/*for(var n=0; n<columnPos.length; n++){
		var newDisplay = new createjs.Text();
		newDisplay.font = "bold 20px Orbitron";
		newDisplay.color = '#65EF96';
		newDisplay.textAlign = "center";
		if(n == 1){
			newDisplay.textAlign = "left";
		}
		newDisplay.textBaseline='alphabetic';
		newDisplay.text = textStrings.tableSummary[n];
		newDisplay.x = posData.x + columnPos[n];
		newDisplay.y = posData.y + 5;
		betSummaryContentContainerP.addChild(newDisplay);
	}*/

	posData.x = posData.sX;
	posData.y = posData.sY;
	for(var n=0; n<playerData.bets.length; n++){
		for(var c=0; c<columnPos.length; c++){
			var extraY = 5;
			var newSummary = new createjs.Text();
			newSummary.font = "20px Orbitron";
			newSummary.color = '#fff';
			newSummary.textAlign = "center";
			newSummary.textBaseline='alphabetic';
			
			if(c == 0){
				newSummary.text = (n+1)+'.';
			}else if(c == 1){
				newSummary.textAlign = "left";
				newSummary.text = betSettings[playerData.bets[n].type].nameShort;
		}else if(c == 2){
				newSummary.text = returnRacerNumbers(playerData.bets[n].racer);
			}else if(c == 3){
				newSummary.text = textStrings.currency + addCommas(playerData.bets[n].totalBet);
			}else if(c == 4){
				newSummary = new createjs.Bitmap(loader.getResult('buttonRemove'));
				newSummary.betIndex = n;
				centerReg(newSummary);
				extraY = 0;

				newSummary.cursor = "pointer";
				newSummary.addEventListener("click", function(evt) {
					playSound('soundButton');
					removeBet(evt.currentTarget.betIndex);
				});
			}

			newSummary.x = posData.x + columnPos[c];
			newSummary.y = posData.y + extraY;

			betSummaryContentContainerP.addChild(newSummary);
		}

		posData.y += posData.spaceY;
	}
}

function removeBet(index){
	playerData.bets.splice(index,1);
	updateSummaryTable();
	updateCredit();
	checkCanBet();
}

function returnRacerNumbers(racers){
	var returnValue = '';
	for(var n=0; n<racers.length; n++){
		returnValue += (racers[n]+1);
		if(n < racers.length-1){
			returnValue += '-';
		}
	}
	return returnValue;
}

/*!
 * 
 * START RACE - This is the function that runs to start race
 * 
 */
function tryStartRace(){
	//memberpayment
	if(typeof memberData != 'undefined' && memberSettings.enableMembership){
		if(!checkMemberGameType()){
			goMemberPage('user');
		}else{
			startRace();
		}
	}else{
		startRace();
	}
}

function startRace(){
	//memberpayment
	if(typeof memberData != 'undefined' && memberSettings.enableMembership && !memberData.ready){
		return;
	}

	var totalAmount = getCurrentBetAmount();
	playerData.credit -= totalAmount;

	//memberpayment
	if(typeof memberData != 'undefined' && memberSettings.enableMembership){
		getUserResult("proceedStartRace", {bets:playerData.bets});
	}else{
		proceedStartRace();
	}
}

function proceedStartRace(result){
	if(result != undefined){
		gameData.revealResults = result.numbers;
	}else if(gameData.revealResults.length == 0){
		if(gameSettings.enablePercentage){
			gameData.revealResults = getResultOnPercent();
		}else{
			for(var n=0; n<racerSettings.length; n++){
				gameData.revealResults.push(n);
			}
			shuffle(gameData.revealResults);
		}
	}

	prepareRace();
	gameData.fieldIndex++;
	gameData.fieldIndex = gameData.fieldIndex > fieldSettings.length-1 ? 0 : gameData.fieldIndex;

	gameBetContainer.visible = false;
	gameRaceContainer.visible = true;
	scoreContainer.visible = true;
	raceDisplayContainer.visible = true;
}

function getCurrentBetAmount(){
	var totalAmount = 0;
	for(var n=0; n<playerData.bets.length; n++){
		totalAmount += playerData.bets[n].totalBet;
	}
	return totalAmount;
}

/*!
 * 
 * RACE TABLE - This is the function that runs to update race table
 * 
 */
function updateRaceTable(){
	if (!gameData.revealResults || gameData.revealResults.length === 0) {
		console.warn("No results available for race table");
		return;
	}
	raceResultContentContainer.removeAllChildren();

	var posData = {x:0, y:0, tY:-180, sX:-135, sY:-138, spaceY:35.5};
	var columnPos = [0, 70, 100];

	posData.x = posData.sX;
	posData.y = posData.tY;

	posData.x = posData.sX;
	posData.y = posData.tY;
	for(var n=0; n<columnPos.length; n++){
		var newDisplay = new createjs.Text();
		newDisplay.font = "bold 20px Orbitron";
		newDisplay.color = '#BBFF00';
		newDisplay.textAlign = "left";
		newDisplay.textBaseline='alphabetic';
		newDisplay.text = textStrings.tableRaceResult[n];
		newDisplay.x = posData.x + columnPos[n];
		newDisplay.y = posData.y + 5;
		raceResultContentContainer.addChild(newDisplay);
	}

	posData.x = posData.sX;
	posData.y = posData.sY;
	var delayCount = 0;
	for(var n=0; n<gameData.revealResults.length; n++){
		var racerIndex = gameData.revealResults[n];
		for(var c=0; c<columnPos.length; c++){
			var extraY = 5;
			var newRace = new createjs.Text();
			newRace.font = "bold 17px Orbitron";
			newRace.color = '#fff';
			newRace.textAlign = "left";
			newRace.textBaseline='alphabetic';

			if(c == 0){
				newRace.text = textStrings.position[n];
			}else if(c == 1){
				newRace = new createjs.Bitmap(loader.getResult('racerIcon'+racerIndex));
				centerReg(newRace);
				extraY = 0;
			}else if(c == 2){
				newRace.text = racerSettings[racerIndex].name;
			}

			newRace.x = posData.x + columnPos[c];
			newRace.y = posData.y + extraY;

			TweenMax.from(newRace, .5, {delay:delayCount, x:newRace.x + 30, alpha:0, overwrite:true});
			raceResultContentContainer.addChild(newRace);
		}
		delayCount += .4;
		posData.y += posData.spaceY;
	}

	//portrait
	raceResultContentContainerP.removeAllChildren();

	var posData = {x:0, y:0, sX:-195, sY:-35, spaceX:95};

	posData.x = posData.sX;
	posData.y = posData.sY;
	var delayCount = 0;
	for(var n=0; n<gameData.revealResults.length; n++){
		var racerIndex = gameData.revealResults[n];

		var newPos = new createjs.Text();
		newPos.font = "20px Orbitron";
		newPos.color = '#65EF96';
		newPos.textAlign = "center";
		newPos.textBaseline='alphabetic';
		newPos.text = textStrings.position[n];
		newPos.x = posData.x;
		newPos.y = posData.y;

		var newIcon = new createjs.Bitmap(loader.getResult('racerIcon'+racerIndex));
		centerReg(newIcon);
		newIcon.x = posData.x;
		newIcon.y = posData.y + 33;

		var newName = new createjs.Text();
		newName.font = "15px Orbitron";
		newName.color = '#fff';
		newName.textAlign = "center";
		newName.textBaseline='alphabetic';
		newName.text = racerSettings[racerIndex].name;
		newName.x = posData.x;
		newName.y = posData.y + 65;
		if(!isEven(n)){
			newName.y = posData.y + 82;
		}
		TweenMax.from(newPos, .5, {delay:delayCount, x:newPos.x + 30, alpha:0, overwrite:true});
		TweenMax.from(newIcon, .5, {delay:delayCount, x:newIcon.x + 30, alpha:0, overwrite:true});
		TweenMax.from(newName, .5, {delay:delayCount, x:newName.x + 30, alpha:0, overwrite:true});
		delayCount += .4;
		raceResultContentContainerP.addChild(newPos, newIcon, newName);
		posData.x += posData.spaceX;
	}
}

function updateRaceSummaryTable(){
	if (!gameData.revealResults || gameData.revealResults.length === 0) {
		console.warn("No results available for summary table");
		return;
	}
	raceSummaryContentContainer.removeAllChildren();

	gameData.summaryCredits.amount = playerData.credit;;
	gameData.summaryWin.amount = 0;

	gameData.summaryCredits.text = '';
	gameData.summaryWin.text = '';

	var racerIndex = gameData.revealResults[0];
	if (racerIndex === undefined) return;

	    var winnerRacer = createRacer(racerIndex);
    winnerRacer.gotoAndPlay('run');
    winnerRacer.x = -10; // compensate regX offset (scale 2)
    winnerRacer.y = 86; // center body vertically within glow (scale 2)
	winnerRacer.scaleX = winnerRacer.scaleY = 2;
    var winnerGlow = new createjs.Shape();
    winnerGlow.graphics.beginRadialGradientFill(['rgba(255,238,88,0.6)','rgba(255,238,88,0)'], [0,1], 0,0,0, 0,0,140).drawCircle(0,0,140);
    winnerGlow.x = 0;
    winnerGlow.y = 0;
    winnerGlow.compositeOperation = 'lighter';
    raceSummaryContentContainer.addChild(winnerGlow, winnerRacer);
    TweenMax.to(winnerGlow, 2, {scaleX:1.15, scaleY:1.15, alpha:.4, repeat:-1, yoyo:true, ease:Power1.easeInOut});
    TweenMax.to(winnerGlow, 20, {rotation:360, repeat:-1, ease:Linear.easeNone});

    // Winner number + name grouped and centered
	    var winnerInfoContainer = new createjs.Container();
	    var winnerIcon = new createjs.Bitmap(loader.getResult('racerIcon'+racerIndex));
    centerReg(winnerIcon);
    var winnerName = new createjs.Text();
    winnerName.font = "bold 30px Orbitron";
    winnerName.color = '#fff';
	    winnerName.textAlign = "left";
	    winnerName.textBaseline='alphabetic';
	    winnerName.text = racerSettings[racerIndex].name;
    var spacingWN = 12;
    var iconW = (winnerIcon.image && winnerIcon.image.naturalWidth) ? winnerIcon.image.naturalWidth : 40;
    var nameW = winnerName.getMeasuredWidth ? winnerName.getMeasuredWidth() : 180;
    var groupW = iconW + spacingWN + nameW;
    // horizontally center the group
    winnerIcon.x = -groupW/2 + iconW/2;
    winnerIcon.y = 160;
    winnerName.x = winnerIcon.x + iconW/2 + spacingWN;
    winnerName.y = 170;
    winnerInfoContainer.addChild(winnerIcon, winnerName);
    raceSummaryContentContainer.addChild(winnerInfoContainer);

    // TOTAL WIN label + SOL icon + amount centered as a group
    var totalGroup = new createjs.Container();
    var totalWinLabel = new createjs.Text();
    totalWinLabel.font = "bold 25px Orbitron";
    totalWinLabel.color = '#BBFF00';
    totalWinLabel.textAlign = "left";
    totalWinLabel.textBaseline='alphabetic';
    totalWinLabel.text = textStrings.totalWin + ' :';
    var solSvgStr = '<svg xmlns="http://www.w3.org/2000/svg" width="313" height="281" viewBox="0 0 313 281" fill="none"><g clip-path="url(#c)"><path d="M311.318 221.057L259.66 276.558C258.537 277.764 257.178 278.725 255.669 279.382C254.159 280.039 252.53 280.378 250.884 280.377H5.99719C4.8287 280.377 3.68568 280.035 2.70855 279.393C1.73143 278.751 0.962771 277.837 0.49702 276.764C0.0312691 275.69 -0.111286 274.504 0.0868712 273.35C0.285028 272.196 0.815265 271.126 1.61243 270.27L53.3099 214.769C54.4299 213.566 55.7843 212.607 57.2893 211.95C58.7943 211.293 60.4178 210.953 62.0595 210.95H306.933C308.101 210.95 309.244 211.292 310.221 211.934C311.199 212.576 311.967 213.49 312.433 214.564C312.899 215.637 313.041 216.824 312.843 217.977C312.645 219.131 312.115 220.201 311.318 221.057ZM259.66 109.294C258.537 108.088 257.178 107.127 255.669 106.47C254.159 105.813 252.53 105.474 250.884 105.475H5.99719C4.8287 105.475 3.68568 105.817 2.70855 106.459C1.73143 107.101 0.962771 108.015 0.49702 109.088C0.0312691 110.162 -0.111286 111.348 0.0868712 112.502C0.285028 113.656 0.815265 114.726 1.61243 115.582L53.3099 171.083C54.4299 172.286 55.7843 173.245 57.2893 173.902C58.7943 174.559 60.4178 174.899 62.0595 174.902H306.933C308.101 174.902 309.244 174.56 310.221 173.918C311.199 173.276 311.967 172.362 312.433 171.288C312.899 170.215 313.041 169.028 312.843 167.875C312.645 166.721 312.115 165.651 311.318 164.795L259.66 109.294ZM5.99719 69.4267H250.884C252.53 69.4275 254.159 69.089 255.669 68.432C257.178 67.7751 258.537 66.8139 259.66 65.6082L311.318 10.1069C312.115 9.25107 312.645 8.18056 312.843 7.02695C313.041 5.87334 312.899 4.68686 312.433 3.6133C311.967 2.53974 311.199 1.62586 310.221 0.983941C309.244 0.342026 308.101 3.95314e-05 306.933 0L62.0595 0C60.4178 0.00279866 58.7943 0.34314 57.2893 0.999953C55.7843 1.65677 54.4299 2.61607 53.3099 3.81847L1.62576 59.3197C0.829361 60.1748 0.299359 61.244 0.100752 62.3964C-0.0978539 63.5488 0.0435698 64.7342 0.507679 65.8073C0.971789 66.8803 1.73841 67.7943 2.71352 68.4372C3.68863 69.0802 4.82984 69.424 5.99719 69.4267Z" fill="url(#g)"/><defs><linearGradient id="g" x1="26.415" y1="287.059" x2="283.735" y2="-2.49574" gradientUnits="userSpaceOnUse"><stop offset="0.08" stop-color="#9945FF"/><stop offset="0.3" stop-color="#8752F3"/><stop offset="0.5" stop-color="#5497D5"/><stop offset="0.6" stop-color="#43B4CA"/><stop offset="0.72" stop-color="#28E0B9"/><stop offset="0.97" stop-color="#19FB9B"/></linearGradient><clipPath id="c"><rect width="312.93" height="280.377" fill="white"/></clipPath></defs></svg>';
    var solImg = new Image();
    solImg.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(solSvgStr);
    var solBmp = new createjs.Bitmap(solImg);
    var desiredH = 26; var baseH = 281; var baseW = 313; var scaleI = desiredH/baseH; 
    solBmp.scaleX = solBmp.scaleY = scaleI;
    var spacingTI = 10; var spacingIA = 8;
    var amountTxt = new createjs.Text();
    amountTxt.font = "bold 25px Orbitron";
    amountTxt.color = '#BBFF00';
    amountTxt.textAlign = "left";
    amountTxt.textBaseline='alphabetic';
    amountTxt.text = '0 SOL';

    var labelW = totalWinLabel.getMeasuredWidth ? totalWinLabel.getMeasuredWidth() : 140;
    var iconWScaled = baseW*scaleI;
    var amtW = amountTxt.getMeasuredWidth ? amountTxt.getMeasuredWidth() : 80;
    var totalW = labelW + spacingTI + iconWScaled + spacingIA + amtW;
    totalWinLabel.x = -totalW/2;
    solBmp.x = totalWinLabel.x + labelW + spacingTI;
    amountTxt.x = solBmp.x + iconWScaled + spacingIA;
    totalWinLabel.y = 210;
    solBmp.y = totalWinLabel.y - desiredH + 22;
    amountTxt.y = 210;
    totalGroup.addChild(totalWinLabel, solBmp, amountTxt);
    raceSummaryContentContainer.addChild(totalGroup);

	var isPlayerWin = false;
	var totalWinAmount = 0;
	for(var n=0; n<playerData.bets.length; n++){
		var winData = checkWinAmount(n);
		if(winData.win){
			isPlayerWin = true;
			totalWinAmount += Math.round(winData.amount);
			playerData.totalWin += Math.round(winData.amount);
			playerData.credit += Math.round(winData.amount);
		}
	}

    // Update amount text to SOL
    amountTxt.text = addCommas(totalWinAmount) + ' SOL';

	//portrait
	raceSummaryContentContainerP.removeAllChildren();

	gameData.summaryCreditsP.amount = playerData.credit;
	gameData.summaryWinP.amount = 0;

	gameData.summaryCreditsP.text = '';
	gameData.summaryWinP.text = '';

	    var winnerRacerP = createRacer(racerIndex);
    winnerRacerP.gotoAndPlay('run');
    winnerRacerP.x = -10; // compensate regX offset (scale 2)
    winnerRacerP.y = -86; // center body vertically within glow (scale 2)
	winnerRacerP.scaleX = winnerRacerP.scaleY = 2;
    var winnerGlowP = new createjs.Shape();
    winnerGlowP.graphics.beginRadialGradientFill(['rgba(255,238,88,0.6)','rgba(255,238,88,0)'], [0,1], 0,0,0, 0,0,140).drawCircle(0,0,140);
    winnerGlowP.x = 0;
    winnerGlowP.y = 0;
    winnerGlowP.compositeOperation = 'lighter';
    raceSummaryContentContainerP.addChild(winnerGlowP, winnerRacerP);
    TweenMax.to(winnerGlowP, 2, {scaleX:1.15, scaleY:1.15, alpha:.4, repeat:-1, yoyo:true, ease:Power1.easeInOut});
    TweenMax.to(winnerGlowP, 20, {rotation:360, repeat:-1, ease:Linear.easeNone});

	    var winnerInfoContainerP = new createjs.Container();
	    var winnerIconP = new createjs.Bitmap(loader.getResult('racerIcon'+racerIndex));
    centerReg(winnerIconP);
    var winnerNameP = new createjs.Text();
	    winnerNameP.font = "bold 30px Orbitron";
	    winnerNameP.color = '#fff';
	    winnerNameP.textAlign = "left";
	    winnerNameP.textBaseline='alphabetic';
	    winnerNameP.text = racerSettings[racerIndex].name;
    var spacingWNP = 12;
    var iconWP = (winnerIconP.image && winnerIconP.image.naturalWidth) ? winnerIconP.image.naturalWidth : 40;
    var nameWP = winnerNameP.getMeasuredWidth ? winnerNameP.getMeasuredWidth() : 180;
    var groupWP = iconWP + spacingWNP + nameWP;
    winnerIconP.x = -groupWP/2 + iconWP/2;
    winnerIconP.y = 140;
    winnerNameP.x = winnerIconP.x + iconWP/2 + spacingWNP;
    winnerNameP.y = 140;
    winnerInfoContainerP.addChild(winnerIconP, winnerNameP);
    raceSummaryContentContainerP.addChild(winnerInfoContainerP);

    var totalGroupP = new createjs.Container();
    var totalWinLabelP = new createjs.Text();
    totalWinLabelP.font = "bold 25px Orbitron";
    totalWinLabelP.color = '#65EF96';
    totalWinLabelP.textAlign = "left";
    totalWinLabelP.textBaseline='alphabetic';
    totalWinLabelP.text = textStrings.totalWin + ' :';
    var solImgP = new Image();
    solImgP.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(solSvgStr);
    var solBmpP = new createjs.Bitmap(solImgP);
    solBmpP.scaleX = solBmpP.scaleY = scaleI;
    var amountTxtP = new createjs.Text();
    amountTxtP.font = "bold 25px Orbitron";
    amountTxtP.color = '#65EF96';
    amountTxtP.textAlign = "left";
    amountTxtP.textBaseline='alphabetic';
    amountTxtP.text = '0 SOL';
    var labelWP = totalWinLabelP.getMeasuredWidth ? totalWinLabelP.getMeasuredWidth() : 140;
    var amtWP = amountTxtP.getMeasuredWidth ? amountTxtP.getMeasuredWidth() : 80;
    var totalWP = labelWP + spacingTI + iconWScaled + spacingIA + amtWP;
    totalWinLabelP.x = -totalWP/2;
    solBmpP.x = totalWinLabelP.x + labelWP + spacingTI;
    amountTxtP.x = solBmpP.x + iconWScaled + spacingIA;
    totalWinLabelP.y = 220;
    solBmpP.y = totalWinLabelP.y - desiredH + 22;
    amountTxtP.y = 220;
    totalGroupP.addChild(totalWinLabelP, solBmpP, amountTxtP);
    raceSummaryContentContainerP.addChild(totalGroupP);

    amountTxtP.text = addCommas(totalWinAmount) + ' SOL';

	if(!isPlayerWin){
		playSound('soundNoWin');
	}
}

function animateWinHighlight(itemHighlight, delay, winTxt, amount, update){
	TweenMax.to(itemHighlight, .3, {delay:delay, overwrite:true, onComplete:function(){
		playSound('soundHitWin');
		playSound('soundCount');
		itemHighlight.visible = true;
		animateBlink(itemHighlight, .5);

		if(update){
			updateSummary(amount);
		}
		
		winTxt.amount = 0;
		TweenMax.to(winTxt, gameSettings.winSpeed, {amount:amount, overwrite:true, onUpdate:function(){
			winTxt.text = textStrings.currency + addCommas(Math.round(winTxt.amount));
		}});
	}});
}

function updateSummary(amount){
	var newCredit = gameData.summaryCredits.amount + amount;
	TweenMax.to(gameData.summaryCredits, gameSettings.winSpeed, {amount:newCredit, overwrite:true, onUpdate:function(){
		gameData.summaryCredits.text = textStrings.credits +' : '+ textStrings.currency + addCommas(Math.round(gameData.summaryCredits.amount));
	}});
	TweenMax.to(gameData.summaryCreditsP, gameSettings.winSpeed, {amount:newCredit, overwrite:true, onUpdate:function(){
		gameData.summaryCreditsP.text = textStrings.credits +' : '+ textStrings.currency + addCommas(Math.round(gameData.summaryCreditsP.amount));
	}});

	var newWin = gameData.summaryWin.amount + amount;
	TweenMax.to(gameData.summaryWin, gameSettings.winSpeed, {amount:newWin, overwrite:true, onUpdate:function(){
		gameData.summaryWin.text = textStrings.totalWin +' : '+ textStrings.currency + addCommas(Math.round(gameData.summaryWin.amount));
	}});
	TweenMax.to(gameData.summaryWinP, gameSettings.winSpeed, {amount:newWin, overwrite:true, onUpdate:function(){
		gameData.summaryWinP.text = textStrings.totalWin +' : '+ textStrings.currency + addCommas(Math.round(gameData.summaryWinP.amount));
	}});
}

function checkWinAmount(index){
	var betIndex = playerData.bets[index].type;
	var betType = betSettings[betIndex].type;
	var winData = {win:false, amount:0};
	if(betType == 'win'){
		if(gameData.revealResults[0] == playerData.bets[index].racer[0]){
			winData.win = true;
			winData.amount += racerSettings[playerData.bets[index].racer[0]].odds[betIndex] * playerData.bets[index].totalBet;
		}
	}else if(betType == 'place'){
		if(gameData.revealResults[0] == playerData.bets[index].racer[0] || gameData.revealResults[1] == playerData.bets[index].racer[0]){
			winData.win = true;
			winData.amount += racerSettings[playerData.bets[index].racer[0]].odds[betIndex] * playerData.bets[index].totalBet;
		}
	}else if(betType == 'show'){
		if(gameData.revealResults[0] == playerData.bets[index].racer[0] || gameData.revealResults[1] == playerData.bets[index].racer[0] || gameData.revealResults[2] == playerData.bets[index].racer[0]){
			winData.win = true;
			winData.amount += racerSettings[playerData.bets[index].racer[0]].odds[betIndex] * playerData.bets[index].totalBet;
		}
	}else if(betType == 'exacta'){
		if(gameData.revealResults[0] == playerData.bets[index].racer[0] && gameData.revealResults[1] == playerData.bets[index].racer[1]){
			winData.win = true;
			winData.amount += betSettings[betIndex].payout;
		}
	}else if(betType == 'exactabox'){
		if(gameData.revealResults[0] == playerData.bets[index].racer[0] || gameData.revealResults[1] == playerData.bets[index].racer[0]){
			if(gameData.revealResults[0] == playerData.bets[index].racer[1] || gameData.revealResults[1] == playerData.bets[index].racer[1]){
				winData.win = true;
				winData.amount += betSettings[betIndex].payout;
			}
		}
	}else if(betType == 'trifecta'){
		if(gameData.revealResults[0] == playerData.bets[index].racer[0] && gameData.revealResults[1] == playerData.bets[index].racer[1] && gameData.revealResults[2] == playerData.bets[index].racer[2]){
			winData.win = true;
			winData.amount += betSettings[betIndex].payout;
		}
	}else if(betType == 'trifectabox'){
		if(gameData.revealResults[0] == playerData.bets[index].racer[0] || gameData.revealResults[1] == playerData.bets[index].racer[0] || gameData.revealResults[2] == playerData.bets[index].racer[0]){
			if(gameData.revealResults[0] == playerData.bets[index].racer[1] || gameData.revealResults[1] == playerData.bets[index].racer[1] || gameData.revealResults[2] == playerData.bets[index].racer[1]){
				if(gameData.revealResults[0] == playerData.bets[index].racer[2] || gameData.revealResults[1] == playerData.bets[index].racer[2] || gameData.revealResults[2] == playerData.bets[index].racer[2]){
					winData.win = true;
					winData.amount += betSettings[betIndex].payout;
				}
			}
		}
	}else if(betType == 'superfecta'){
		if(gameData.revealResults[0] == playerData.bets[index].racer[0] && gameData.revealResults[1] == playerData.bets[index].racer[1] && gameData.revealResults[2] == playerData.bets[index].racer[2] && gameData.revealResults[3] == playerData.bets[index].racer[3]){
			winData.win = true;
			winData.amount += betSettings[betIndex].payout;
		}
	}else if(betType == 'superfectabox'){
		if(gameData.revealResults[0] == playerData.bets[index].racer[0] || gameData.revealResults[1] == playerData.bets[index].racer[0] || gameData.revealResults[2] == playerData.bets[index].racer[0] || gameData.revealResults[3] == playerData.bets[index].racer[0]){
			if(gameData.revealResults[0] == playerData.bets[index].racer[1] || gameData.revealResults[1] == playerData.bets[index].racer[1] || gameData.revealResults[2] == playerData.bets[index].racer[1] || gameData.revealResults[3] == playerData.bets[index].racer[1]){
				if(gameData.revealResults[0] == playerData.bets[index].racer[2] || gameData.revealResults[1] == playerData.bets[index].racer[2] || gameData.revealResults[2] == playerData.bets[index].racer[2] || gameData.revealResults[3] == playerData.bets[index].racer[2]){
					if(gameData.revealResults[0] == playerData.bets[index].racer[3] || gameData.revealResults[1] == playerData.bets[index].racer[3] || gameData.revealResults[2] == playerData.bets[index].racer[3] || gameData.revealResults[3] == playerData.bets[index].racer[3]){
						winData.win = true;
						winData.amount += betSettings[betIndex].payout;
					}
				}
			}
		}
	}
	winData.amount = Math.round(winData.amount);
	return winData;
}

 /*!
 * 
 * UPDATE CREDIT VALUE - This is the function that runs to update credit value
 * 
 */
function updateCredit(){
	var totalAmount = getCurrentBetAmount();
	creditTxt.text = creditRedTxt.text = textStrings.currency + addCommas(playerData.credit-totalAmount);
}

/*!
 * 
 * CREATE RACER - This is the function that runs to create racer
 * 
 */
function createRacer(index){
	var _difSpeed = randomIntFromInterval(8,10) * .1;
	var _frameW = 131;
	var _frameH = 91;
	var _regX = _frameW/2 + 5; // Fine-tuned to keep racer centered over shadow
	var _regY = _frameH - 2; // Slightly above shadow for better layering
	var _count = 10;
	var _animations;
	var _spritesheetData;
	var _default = "idle";
	var _assetID = "racerRace" + index;
	var _asset = loader.getResult(_assetID);
	if (!_asset) {
		console.warn("Asset not found:", _assetID);
		return new createjs.Container(); // Return empty container to avoid crash
	}

	_animations = {
		idle:{frames: [0], speed:_difSpeed},
		run:{frames: [0,1,2,3,4,5,6,7,8,9], speed:_difSpeed}
	};
			
	_spritesheetData = new createjs.SpriteSheet({
		"images": [_asset.src],
		"frames": {"regX": _regX, "regY": _regY, "height": _frameH, "width": _frameW, "count": _count},
		"animations": _animations
	});

	var newRacer = new createjs.Sprite(_spritesheetData, _default);
	newRacer.framerate = 10;
	return newRacer;
}

 /*!
 * 
 * PREPARE RACE - This is the function that runs to prepare race
 * 
 */
function prepareRace(){
	gameData.race = {
		start:false,
		speed:500,
		gates:[],
		gatesOpen:[],
		rangeX:[300,800],
		rangeY:[455,455+360],
		moveX:[-50,50],
		moveY:[-50,50],
		endX:800,
		distance:0,
		distanceEnd:130,
		pos:[],
		update:0,
		lists:[]
	};

	gameRaceContainer.removeAllChildren();
	racersContainer.removeAllChildren();
	racersShadowContainer.removeAllChildren();
	scoreListContainer.removeAllChildren();

	    // billboard prepared first so sky and ground can align cleanly to it
	    var billboardImg = loader.getResult("bgBillboard"+gameData.fieldIndex);
	    var _billboardY = 305;
	    var _billboardTargetH = 0;
	    if (billboardImg) {
	        $.field['billboard'] = new createjs.Shape();
	        var _targetH = (typeof canvasH !== 'undefined' && canvasH) ? Math.round(canvasH * 0.12) : billboardImg.height;
	        var _scale = billboardImg.height ? (_targetH / billboardImg.height) : 1;
	        var _tileW = billboardImg.width * _scale;
	        _tileW = Math.round(_tileW);
	        var _tiles = 2;
	        if (typeof canvasW !== 'undefined' && _tileW) {
	            _tiles = Math.ceil(canvasW / _tileW) + 2;
	        }
	        var _drawW = _tileW * _tiles + 2;
	        var _m = new createjs.Matrix2D();
	        _m.a = _scale;
	        _m.d = _scale;
	        $.field['billboard'].graphics.beginBitmapFill(billboardImg, "repeat", _m).drawRect(0, 0, _drawW, _targetH);
	        $.field['billboard'].tileW = Math.max(1, _tileW - 1);
	        
	        var _yOffset = 0;
	        _billboardY = 305 + _yOffset;
	        $.field['billboard'].y = Math.round(_billboardY - 1);
	        _billboardTargetH = _targetH;
	    }

    var skyImg = loader.getResult("bgSky"+gameData.fieldIndex);
    if (skyImg && !$.field['sky']) {
        $.field['sky'] = new createjs.Shape();
        var _skyTiles = 2;
        if (typeof canvasW !== 'undefined' && skyImg.width) {
            _skyTiles = Math.ceil(canvasW / skyImg.width) + 2;
        }
        var _skyDrawW = skyImg.width * _skyTiles + 2;
        var _skyDrawH = skyImg.height + 2;
        $.field['sky'].graphics.beginBitmapFill(skyImg, "repeat").drawRect(0, 0, _skyDrawW, _skyDrawH);
        $.field['sky'].tileW = Math.max(1, skyImg.width - 1);
        $.field['sky'].y = 100;
    }

	    // billboard already prepared above; if missing we keep previous behavior via defaults

	    var groundImg = loader.getResult("bgRace"+gameData.fieldIndex);
	    if (groundImg) {
	        $.field['ground'] = new createjs.Shape();
	        var _gTiles = 2;
	        if (typeof canvasW !== 'undefined' && groundImg.width) {
	            _gTiles = Math.ceil(canvasW / groundImg.width) + 2;
	        }
	        var _gDrawW = groundImg.width * _gTiles + 2;
	        $.field['ground'].graphics.beginBitmapFill(groundImg, "repeat").drawRect(0, 0, _gDrawW, groundImg.height + 2);
	        $.field['ground'].tileW = Math.max(1, groundImg.width - 1);
	        
	        $.field['ground'].y = 330;
	    }
	
	var endImg = loader.getResult('bgEnd' + gameData.fieldIndex);
	if (endImg) {
		$.field['end'] = new createjs.Bitmap(endImg);
		centerReg($.field['end']);
		if ($.field['end'].image) {
			$.field['end'].regX = $.field['end'].image.naturalWidth;
			$.field['end'].regY = $.field['end'].image.naturalHeight;
		}
	}

	var endlineImg = loader.getResult('bgEndline' + gameData.fieldIndex);
	if (endlineImg) {
		$.field['endline'] = new createjs.Bitmap(endlineImg);
		if ($.field['endline'].image) {
			$.field['endline'].regX = $.field['endline'].image.naturalWidth;
			$.field['endline'].regY = 0;
		}
	}

	if ($.field['endline']) {
		$.field['endline'].x = 1310;
		$.field['endline'].y = 428;
	}
	if ($.field['end']) {
		$.field['end'].x = ($.field['endline'] ? $.field['endline'].x : 1310) + 20;
		$.field['end'].y = 432;
	}

	    var containerItems = [$.field['sky'], $.field['billboard'], $.field['ground'], $.field['endline'], racersShadowContainer, $.field['end'], racersContainer, dimShape];
	var validContainerItems = containerItems.filter(function(item) { return item != null; });
	gameRaceContainer.addChild.apply(gameRaceContainer, validContainerItems);
	scoreListContainer.x = 165;

	var posData = {x:300, y:455, spaceY:41.5, lX:0};
	gameData.race.gates = [];
	gameData.race.gatesOpen = [];
	for(var n=0; n<racerSettings.length; n++){
		//icons
		$.racer['icon'+n] = new createjs.Bitmap(loader.getResult('racerIcon'+n));
		centerReg($.racer['icon'+n]);
		$.racer['icon'+n].x = posData.lX;
		$.racer['icon'+n].y = 10;
		scoreListContainer.addChild($.racer['icon'+n]);
		posData.lX -= 35;
		gameData.race.lists.push($.racer['icon'+n].x);

		//position
		gameData.race.pos.push(0);

		$.racer['race'+n] = createRacer(n);
		$.racer['race'+n].x = posData.x;
		$.racer['race'+n].y = $.racer['race'+n].oriY = posData.y;
		$.racer['race'+n].delayNum = 0;

		$.racer['shadow'+n] = new createjs.Bitmap(loader.getResult('bgShadow'+gameData.fieldIndex));
		centerReg($.racer['shadow'+n]);
		$.racer['shadow'+n].x = posData.x;
		$.racer['shadow'+n].y = posData.y;

		var newGateT = new createjs.Bitmap(loader.getResult('bgGate'+gameData.fieldIndex));
		centerReg(newGateT);
		if (newGateT.image) newGateT.regY = newGateT.image.naturalHeight;
		newGateT.x = posData.x + 5;
		newGateT.y = posData.y - (posData.spaceY/2);
		gameData.race.gates.push(newGateT);

		var newGateB = new createjs.Bitmap(loader.getResult('bgGateFirst'+gameData.fieldIndex));
		centerReg(newGateB);
		if (newGateB.image) newGateB.regY = newGateB.image.naturalHeight;
		newGateB.x = posData.x + 8;
		newGateB.y = posData.y + (posData.spaceY/2);
		gameData.race.gates.push(newGateB);

		var newGateOpenT = new createjs.Bitmap(loader.getResult('bgGateOpen'+gameData.fieldIndex));
		newGateOpenT.regX = 0;
		if (newGateOpenT.image) newGateOpenT.regY = newGateOpenT.image.naturalHeight;
		newGateOpenT.x = posData.x + 68;
		newGateOpenT.y = posData.y - (posData.spaceY/2);
		newGateOpenT.scaleX = 0;
		gameData.race.gatesOpen.push(newGateOpenT);

		var newGateOpenB = new createjs.Bitmap(loader.getResult('bgGateOpen'+gameData.fieldIndex));
		newGateOpenB.regX = 0;
		if (newGateOpenB.image) newGateOpenB.regY = newGateOpenB.image.naturalHeight;
		newGateOpenB.x = posData.x + 68;
		newGateOpenB.y = posData.y + (posData.spaceY/2);
		newGateOpenB.scaleX = 0;
		gameData.race.gatesOpen.push(newGateOpenB);

		racersContainer.addChild($.racer['race'+n], newGateT, newGateB, newGateOpenT, newGateOpenB);
		racersShadowContainer.addChild($.racer['shadow'+n]);

		//race
		$.racer['raceicon'+n] = new createjs.Bitmap(loader.getResult('racerIcon'+n));
		centerReg($.racer['raceicon'+n]);
		$.racer['raceicon'+n].x = posData.x + 100;
		$.racer['raceicon'+n].y = posData.y;
		$.racer['raceicon'+n].alpha = 0;

		$.racer['racename'+n] = new createjs.Text();
		$.racer['racename'+n].font = "20px Orbitron";
		$.racer['racename'+n].color = '#fff';
		$.racer['racename'+n].textAlign = "left";
		$.racer['racename'+n].textBaseline='alphabetic';
		$.racer['racename'+n].text = racerSettings[n].name;
		$.racer['racename'+n].x = $.racer['raceicon'+n].x + 25;
		$.racer['racename'+n].y = posData.y + 5;
		$.racer['racename'+n].alpha = 0;
		racersContainer.addChild($.racer['raceicon'+n], $.racer['racename'+n]);

		posData.y += posData.spaceY;
	}

	playSound('soundCallToPost');
	playSoundLoop('soundAmbience');
	dimShape.alpha = 1;
	TweenMax.to(dimShape, 1, {delay:1.5, alpha:0, overwrite:true});

	// raceDisplayTxt.text = textStrings.race + gameData.raceCount;
	raceDisplayTxt.text = textStrings.race;
	gameData.raceCount++;
	fieldDisplayTxt.text = textStrings.field[gameData.fieldIndex];
	raceDisplayContainer.alpha = 0;
	raceDisplayMoveContainer.y = 0;
	
	if (gameData.isRestoring) {
		// Skip intro animation if restoring
		raceDisplayContainer.alpha = 0; // Keep it hidden or show immediately? Usually hidden during race except for results?
		// Actually, let's just skip the Tween sequence that blocks the start.
		
		gameRaceContainer.alpha = 1;
		for(var n=0; n<gameData.race.gatesOpen.length; n++){
			var gateOpen = gameData.race.gatesOpen[n];
			gateOpen.scaleX = 1;
		}
		
		gameData.race.start = true;
		for(var n=0; n<racerSettings.length; n++){
			$.racer['race'+n].gotoAndPlay('run');
		}
	} else {
		// Normal Intro Animation
		TweenMax.to(raceDisplayContainer, .5, {alpha:1, overwrite:true, onComplete:function(){
			var delayNum = 1;
			for(var n=0; n<racerSettings.length; n++){
				var oriX = $.racer['raceicon'+n].x;
				$.racer['raceicon'+n].x = $.racer['raceicon'+n].x + 50;
				TweenMax.to($.racer['raceicon'+n], .4, {delay:delayNum, x:oriX, alpha:1, overwrite:true});
				delayNum += .1;
			}
			
			var delayNum = 1.1;
			for(var n=0; n<racerSettings.length; n++){
				var oriX = $.racer['racename'+n].x;
				$.racer['racename'+n].x = $.racer['racename'+n].x + 50;
				TweenMax.to($.racer['racename'+n], .4, {delay:delayNum, x:oriX, alpha:1, overwrite:true});
				delayNum += .1;
			}

			TweenMax.to(raceDisplayMoveContainer, .5, {delay:1, y:-200, ease:Expo.easeOut, overwrite:true});
			TweenMax.to(raceDisplayContainer, .5, {delay:4.5, alpha:0, overwrite:true});
		}});

		scoreMoveContainer.alpha = 0;
		scoreMoveContainer.y = 50;
		TweenMax.to(scoreMoveContainer, .5, {delay:4.5, overwrite:true, onComplete:function(){
			var delayNum = 0;
			for(var n=0; n<racerSettings.length; n++){
				var moveX = $.racer['raceicon'+n].x - 50;
				TweenMax.to($.racer['raceicon'+n], .4, {delay:delayNum, x:moveX, alpha:0, overwrite:true});
				delayNum += .1;
			}
			
			var delayNum = .1;
			for(var n=0; n<racerSettings.length; n++){
				var moveX = $.racer['racename'+n].x - 50;
				TweenMax.to($.racer['racename'+n], .4, {delay:delayNum, x:moveX, alpha:0, overwrite:true});
				delayNum += .1;
			}

			TweenMax.to(scoreMoveContainer, .5, {delay:1.5, y:0, alpha:1, overwrite:true, onComplete:function(){
				
			}});
		}});

		TweenMax.to(gameRaceContainer, 8, {overwrite:true, onComplete:function(){
			playSound('soundGate');
			for(var n=0; n<gameData.race.gatesOpen.length; n++){
				var gateOpen = gameData.race.gatesOpen[n];
				TweenMax.to(gateOpen, .2, {scaleX:1, overwrite:true});
			}

			TweenMax.to(gameRaceContainer, .1, {overwrite:true, onComplete:function(){
				gameData.race.start = true;
				playSoundLoop('soundRun1');
				playSoundLoop('soundRun2');
				playSoundLoop('soundRun3');
				for(var n=0; n<racerSettings.length; n++){
					$.racer['race'+n].gotoAndPlay('run');
				}
			}});
		}});
	}

	updateRacerScore(0);
}

function updateRacePos(raceProgress){
	var endX = gameData.race.rangeX[1];
	var rangeX = [5,10];
	if(gameData.race.update == 0){
		var pos = getCenterPosition(gameData.race.rangeX[0], 0, gameData.race.rangeX[1], 0);
		endX = pos.x;
	}else if(gameData.race.update == 1){
		rangeX = [10,50];
		endX = gameData.race.rangeX[1];
	}else if(gameData.race.update == 2){
		rangeX = [10,50];
		endX = gameData.race.rangeX[1];
	}

	for(var n=0; n<gameData.revealResults.length; n++){
		var racerIndex = gameData.revealResults[n];
		$.racer['race'+racerIndex].delayNum = 0;

		var distanceX = randomIntFromInterval(rangeX[0],rangeX[1]);
		endX -= distanceX;
		gameData.race.pos[racerIndex] = endX;
	}
}

/*!
 * 
 * END RACE - This is the function that runs to end race
 * 
 */
function endRace(){
	gameData.race.isEnding = true;
	for(var n=0; n<racerSettings.length; n++){
		var randomX = randomIntFromInterval(10,500);
		$.racer['race'+n].newX = $.racer['race'+n].x + (1000 + randomX);
		var tweenSpeed = getDuration(1000, gameSettings.raceSpeed/1.7);
		TweenMax.to($.racer['race'+n], tweenSpeed, {x:$.racer['race'+n].newX, y:$.racer['race'+n].newY, overwrite:true, onUpdate:updateRacerShadow, onUpdateParams:[n]});
	}

	var volumeData = {volume:1};
	TweenMax.to(volumeData, 2.5, {volume:0, overwrite:true, onUpdate:function(){
		setSoundLoopVolume('soundRun1', volumeData.volume);
		setSoundLoopVolume('soundRun2', volumeData.volume);
		setSoundLoopVolume('soundRun3', volumeData.volume);
	}});

	TweenMax.to(gameRaceContainer, 2.5, {overwrite:true, onComplete:function(){
		stopSoundLoop('soundAmbience');
		stopSoundLoop('soundRun1');
		stopSoundLoop('soundRun2');
		stopSoundLoop('soundRun3');

		gameBetContainer.visible = true;
		gameRaceContainer.visible = false;
		scoreContainer.visible = false;
		raceDisplayContainer.visible = false;
		gameData.race.isEnding = false;
		goGamePage('result');
	}});
}

function updateRacerShadow(index){
	$.racer['shadow'+index].x = $.racer['race'+index].x;
	$.racer['shadow'+index].y = $.racer['race'+index].y;
}

/*!
 * 
 * LOOP FIELD - This is the function that runs to loop field
 * 
 */
function loopField(deltaS){
	if(gameData.race.start){
		// If server says finished, accelerate to end
		if (gameData.serverFinished) {
			gameData.race.distance = Math.max(gameData.race.distance, gameData.race.distanceEnd * 0.96);
		}

		gameData.race.distance = (gameData.race.distance + deltaS * (gameSettings.raceSpeed/50));

		var raceProgress = gameData.race.distance/gameData.race.distanceEnd * 100;
		updateRacerScore(raceProgress);

		var bgSpeed = gameSettings.raceSpeed;
		if (gameData.serverFinished) bgSpeed *= 2;

        if ($.field['ground']) {
            var _gx = $.field['ground'].x - deltaS * (bgSpeed);
            _gx = _gx % $.field['ground'].tileW;
            if (_gx > 0) _gx -= $.field['ground'].tileW;
            $.field['ground'].x = Math.round(_gx);
        }
        if ($.field['billboard']) {
            var _bx = $.field['billboard'].x - deltaS * (bgSpeed * .8);
            _bx = _bx % $.field['billboard'].tileW;
            if (_bx > 0) _bx -= $.field['billboard'].tileW;
            $.field['billboard'].x = Math.round(_bx);
        }
        if ($.field['sky']) {
            var _sx = $.field['sky'].x - deltaS * (bgSpeed * .3);
            _sx = _sx % $.field['sky'].tileW;
            if (_sx > 0) _sx -= $.field['sky'].tileW;
            $.field['sky'].x = Math.round(_sx);
        }

		if(raceProgress > 95){
			var finalSpeed = gameSettings.raceSpeed;
			if (gameData.serverFinished) finalSpeed *= 3; // Speed up end line if server already finished
			if ($.field['endline']) $.field['endline'].x = ($.field['endline'].x - deltaS * (finalSpeed));
			if ($.field['end']) $.field['end'].x = ($.field['end'].x - deltaS * (finalSpeed));
		}

		for(var n=0; n<gameData.race.gates.length; n++){
			var gate = gameData.race.gates[n];
			gate.x = (gate.x - deltaS * (gameSettings.raceSpeed));
			gate.x = gate.x < -200 ? -200 : gate.x;
		}

		for(var n=0; n<gameData.race.gatesOpen.length; n++){
			var gateOpen = gameData.race.gatesOpen[n];
			gateOpen.x = (gateOpen.x - deltaS * (gameSettings.raceSpeed));
			gateOpen.x = gateOpen.x < -200 ? -200 : gateOpen.x;
		}
		
		if(raceProgress > 0 && gameData.race.update == 0){
			updateRacePos(raceProgress);
			gameData.race.update++;
		}else if(raceProgress > 30 && gameData.race.update == 1){
			updateRacePos(raceProgress);
			gameData.race.update++;
		}else if(raceProgress > 90 && gameData.race.update == 2){
			updateRacePos(raceProgress);
			gameData.race.update++;
		}

		for(var n=0; n<racerSettings.length; n++){
			if($.racer['race'+n].delayNum <= 0){
				$.racer['race'+n].delayNum = randomIntFromInterval(10, 50);
				var rangeX = randomIntFromInterval(gameData.race.moveX[0], gameData.race.moveX[1]);
				var rangeY = randomIntFromInterval(gameData.race.moveY[0], gameData.race.moveY[1]);
				$.racer['race'+n].newX = $.racer['race'+n].x + rangeX;
				$.racer['race'+n].newY = $.racer['race'+n].y + rangeY;

				if(raceProgress > 90){
					$.racer['race'+n].newX = gameData.race.pos[n];
				}else if(raceProgress > 0){
					$.racer['race'+n].newX = gameData.race.pos[n] + rangeX;
				}

				$.racer['race'+n].newX = $.racer['race'+n].newX < gameData.race.rangeX[0] ? gameData.race.rangeX[0] : $.racer['race'+n].newX;
				$.racer['race'+n].newX = $.racer['race'+n].newX > gameData.race.rangeX[1] ? gameData.race.rangeX[1] : $.racer['race'+n].newX;
				$.racer['race'+n].newY = $.racer['race'+n].newY < gameData.race.rangeY[0] ? gameData.race.rangeY[0] : $.racer['race'+n].newY;
				$.racer['race'+n].newY = $.racer['race'+n].newY > gameData.race.rangeY[1] ? gameData.race.rangeY[1] : $.racer['race'+n].newY;

				var newDistance = getDistance($.racer['race'+n].x, $.racer['race'+n].y, $.racer['race'+n].newX, $.racer['race'+n].newY);
				var tweenSpeed = getDuration(newDistance, gameSettings.raceSpeed/10);
				TweenMax.to($.racer['race'+n], tweenSpeed, {x:$.racer['race'+n].newX, y:$.racer['race'+n].newY, overwrite:true});
			}else{
				$.racer['race'+n].delayNum = ($.racer['race'+n].delayNum - deltaS * (10));
			}

			updateRacerShadow(n);
		}

		if($.field['endline'] && $.field['endline'].x < gameData.race.endX){
			// Prevent premature ending if server says not finished
			if (typeof gameData.serverFinished !== 'undefined' && !gameData.serverFinished) {
				// Do not end race yet
			} else {
				gameData.race.start = false;
				endRace();
			}
		}
	}else if(gameData.race.update == 0){
		for(var n=0; n<racerSettings.length; n++){
			var randomY = randomIntFromInterval(-2,2);
			if(randomBoolean()){
				randomY = 0;
			}
			$.racer['race'+n].y = $.racer['race'+n].oriY + randomY;
		}
	}

	racersContainer.sortChildren(sortFunction);
}

var sortFunction = function(obj1, obj2) {
	if (obj1.y > obj2.y) { return 1; }
	if (obj1.y < obj2.y) { return -1; }
	return 0;
}

function updateRacerScore(raceProgress){
	var posData = {sX:-170, eX:195, length:0};
	posData.length = posData.eX - posData.sX;
	itemRaceScorePin.y = 32;

	itemRaceScorePin.x = Math.floor(posData.sX + (raceProgress/100 * posData.length));
	itemRaceScorePin.x = itemRaceScorePin.x > posData.eX ? posData.eX : itemRaceScorePin.x;

	var sortArr = [];
	for(var n=0; n<racerSettings.length; n++){
		sortArr.push({index:n, x:$.racer['race'+n].x});
	}

	sortOnObject(sortArr, 'x', true);
	for(var n=0; n<sortArr.length; n++){
		var racerIndex = sortArr[n].index;
		scoreListContainer.setChildIndex($.racer['icon'+racerIndex], scoreListContainer.numChildren-1);
		TweenMax.to($.racer['icon'+racerIndex], .2, {x:gameData.race.lists[n], overwrite:true});
	}
}

 /*!
 * 
 * ANIMATE - This is the function that runs to animate objects
 * 
 */
function animateBlink(obj, alpha){
	var alphaNum = alpha == undefined ? .5 : alpha;
	obj.visible = true;
	obj.alpha = alphaNum;
	TweenMax.to(obj, .3, {alpha:1, overwrite:true, onComplete:function(){
		TweenMax.to(obj, .3, {alpha:alphaNum, overwrite:true, onComplete:animateBlink, onCompleteParams:[obj, alpha]});	
	}});
}

function animateCredit(obj, alpha){
	var alphaNum = alpha == undefined ? .5 : alpha;
	obj.alpha = alphaNum;
	TweenMax.to(obj, .3, {alpha:1, overwrite:true, onComplete:function(){
		TweenMax.to(obj, .3, {alpha:0, overwrite:true, onComplete:function(){
			TweenMax.to(obj, .3, {alpha:1, overwrite:true, onComplete:function(){
				TweenMax.to(obj, .3, {alpha:0, overwrite:true});
			}});
		}});
	}});
}

function getDuration(distance, pixelsPerSecond){
	var duration = distance / pixelsPerSecond;
	return duration;
}

/*!
 * 
 * PERCENTAGE - This is the function that runs to create result percentage
 * 
 */
function createPercentage(){
	gameData.percentageArray = [];

	for(var n=0; n<racerSettings.length; n++){
		var percent = racerSettings[n].percent;
		if(!isNaN(percent)){
			if(percent > 0){
				for(var p=0; p<percent; p++){
					gameData.percentageArray.push(n);
				}
			}
		}
	}
}

function getResultOnPercent(){
	shuffle(gameData.percentageArray);

	var orderArr = [];
	for(var n=0; n<racerSettings.length; n++){
		orderArr.push({index:n, percent:0});
	}

	for(var n=0; n<gameData.percentageArray.length/2; n++){
		var racerIndex = gameData.percentageArray[n];
		orderArr[racerIndex].percent++;
	}

	sortOnObject(orderArr,'percent',true);
	var returnArr = [];
	for(var n=0; n<orderArr.length; n++){
		returnArr.push(orderArr[n].index);
	}
	return returnArr;
}

/*!
 * 
 * UPDATE GAME - This is the function that runs to loop game update
 * 
 */
function updateGame(event){
	if(!gameData.paused){
		var deltaS = event.delta / 1000;
		if(gameRaceContainer.visible){
			loopField(deltaS);
		}
	}
}

/*!
 * 
 * OPTIONS - This is the function that runs to toggle options
 * 
 */

function toggleOptions(con){
	if(optionsContainer.visible){
		optionsContainer.visible = false;
	}else{
		optionsContainer.visible = true;
	}
	if(con!=undefined){
		optionsContainer.visible = con;
	}
}


/*!
 * 
 * OPTIONS - This is the function that runs to mute and fullscreen
 * 
 */
function toggleSoundMute(con){
	buttonSoundOff.visible = false;
	buttonSoundOn.visible = false;
	toggleSoundInMute(con);
	if(con){
		buttonSoundOn.visible = true;
	}else{
		buttonSoundOff.visible = true;	
	}
}

function toggleMusicMute(con){
	buttonMusicOff.visible = false;
	buttonMusicOn.visible = false;
	toggleMusicInMute(con);
	if(con){
		buttonMusicOn.visible = true;
	}else{
		buttonMusicOff.visible = true;	
	}
}

function toggleFullScreen() {
  if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

/*!
 * 
 * SHARE - This is the function that runs to open share url
 * 
 */
function shareLinks(action, shareScore){
	if(shareSettings.gtag){
		gtag('event','click',{'event_category':'share','event_label':action});
	}

	var gameURL = location.href;
	gameURL = encodeURIComponent(gameURL.substring(0,gameURL.lastIndexOf("/") + 1));

	var shareTitle = shareSettings.shareTitle.replace("[SCORE]", shareScore);
	var shareText = shareSettings.shareText.replace("[SCORE]", shareScore);

	var shareURL = '';
	if( action == 'facebook' ){
		if(shareSettings.customScore){
			gameURL = decodeURIComponent(gameURL);
			shareURL = `https://www.facebook.com/sharer/sharer.php?u=`+encodeURIComponent(`${gameURL}share.php?title=${shareTitle}&url=${gameURL}&thumb=${gameURL}share.jpg`);
		}else{
			shareURL = `https://www.facebook.com/sharer/sharer.php?u=${gameURL}`;
		}
	}else if( action == 'twitter' ){
		shareURL = `https://twitter.com/intent/tweet?text=${shareText}&url=${gameURL}`;
	}else if( action == 'whatsapp' ){
		shareURL = `https://api.whatsapp.com/send?text=${shareText}%20${gameURL}`;
	}else if( action == 'telegram' ){
		shareURL = `https://t.me/share/url?url=${gameURL}&text=${shareText}`;
	}else if( action == 'reddit' ){
		shareURL = `https://www.reddit.com/submit?url=${gameURL}&title=${shareText}`;
	}else if( action == 'linkedin' ){
		shareURL = `https://www.linkedin.com/sharing/share-offsite/?url=${gameURL}`;
	}

	window.open(shareURL);
}

/*!
 * 
 * RESTORE RACE - Restore race state from external sync
 * 
 */
function restoreRace(progressPercent, elapsedMs, racersData, startTime, serverFinished) {
	// Wait for containers to be initialized
	if (typeof gameBetContainer === 'undefined' || typeof gameRaceContainer === 'undefined' || typeof scoreContainer === 'undefined') {
		console.log("Game containers not ready, waiting to restore race...");
		setTimeout(function() { restoreRace(progressPercent, elapsedMs, racersData, startTime, serverFinished); }, 200);
		return;
	}

	// Set restoring flag
	gameData.isRestoring = true;
	if (typeof serverFinished !== 'undefined') {
		gameData.serverFinished = serverFinished;
	}

	goPage('game', true);
	
	// Ensure basic data is initialized
	if (typeof gameData.raceCount === 'undefined' || !gameData.raceCount) {
		gameData.paused = setGameLaunch();
		gameData.raceCount = 1;
		playerData.totalWin = 0;
		playerData.bets = [];
		playerData.credit = gameSettings.credit;
		
		// Set field index deterministically if startTime provided
		if (typeof startTime !== 'undefined' && typeof fieldSettings !== 'undefined' && fieldSettings.length > 0) {
			gameData.fieldIndex = Math.floor(startTime / 1000) % fieldSettings.length;
		} else {
			gameData.fieldIndex = Math.floor(Math.random() * fieldSettings.length);
		}
		
		if(typeof memberData != 'undefined' && memberSettings.enableMembership){
			playerData.credit = memberData.point;
		}
	}

	// Force start race mode if not started
	if (!gameData.race || !gameData.race.start) {
		proceedStartRace(); 
	}
	
	// Reset restoring flag after start sequence initiated
	gameData.isRestoring = false;
	
	// Set distance and fast forward
	if (progressPercent > 0) {
		gameData.race.distance = (progressPercent / 100) * gameData.race.distanceEnd;
		
		// Update update status
		if (progressPercent > 90) gameData.race.update = 2;
		else if (progressPercent > 30) gameData.race.update = 1;
		else gameData.race.update = 0;
		
		// Sync Background Position
		if (elapsedMs && gameSettings.raceSpeed) {
			var deltaS = elapsedMs / 1000;
			if ($.field['ground']) $.field['ground'].x = ($.field['ground'].x - deltaS * (gameSettings.raceSpeed)) % $.field['ground'].tileW;
			if ($.field['billboard']) $.field['billboard'].x = ($.field['billboard'].x - deltaS * (gameSettings.raceSpeed * .8)) % $.field['billboard'].tileW;
			if ($.field['sky']) $.field['sky'].x = ($.field['sky'].x - deltaS * (gameSettings.raceSpeed * .3)) % $.field['sky'].tileW;
			
			// Move gates out of view
			if(gameData.race.gates) {
				for(var n=0; n<gameData.race.gates.length; n++){
					gameData.race.gates[n].x = -5000;
				}
			}
			if(gameData.race.gatesOpen) {
				for(var n=0; n<gameData.race.gatesOpen.length; n++){
					gameData.race.gatesOpen[n].x = -5000;
				}
			}
		}

		// Sync Racers Position
		if (racersData && Array.isArray(racersData) && racersData.length > 0) {
			var sortedRacers = racersData.slice(0).sort(function(a, b){ return b.x - a.x });
			var startX = gameData.race.rangeX[1]; 
			var gap = 40;
			
			for(var i=0; i<sortedRacers.length; i++) {
				var r = sortedRacers[i];
				var parts = r.id.split('_');
				var idx = parseInt(parts[1]);
				
				if (!isNaN(idx) && $.racer['race'+idx]) {
					var targetX = startX - (i * gap);
					targetX += (Math.random() * 20 - 10);
					
					$.racer['race'+idx].x = targetX;
					$.racer['race'+idx].newX = targetX;
					$.racer['race'+idx].delayNum = 10;
					
					if ($.racer['shadow'+idx]) {
						$.racer['shadow'+idx].x = targetX;
					}
					gameData.race.pos[idx] = targetX;
				}
			}
			updateRacerScore(progressPercent);
		} else {
			// Fallback
			if (gameData.race.distance > 0 && gameData.race.update == 0) {
				 updateRacePos(gameData.race.distance/gameData.race.distanceEnd * 100);
				 gameData.race.update++;
			}
		}
	}
}
window.restoreRace = restoreRace;
