////////////////////////////////////////////////////////////
// CANVAS
////////////////////////////////////////////////////////////
var stage;
var canvasW=0;
var canvasH=0;

/*!
 * 
 * START GAME CANVAS - This is the function that runs to setup game canvas
 * 
 */
function initGameCanvas(w,h){
	const gameCanvas = document.getElementById("gameCanvas");
	gameCanvas.width = w;
	gameCanvas.height = h;
	
	canvasW=w;
	canvasH=h;
    stage = new createjs.Stage("gameCanvas",{ antialias: true });
    stage.snapToPixelEnabled = true;
    createjs.Bitmap.prototype.snapToPixel = true;
    createjs.Sprite.prototype.snapToPixel = true;
	
	createjs.Touch.enable(stage);
	stage.enableMouseOver(20);
	stage.mouseMoveOutside = true;
	
	createjs.Ticker.timingMode = createjs.Ticker.RAF;
	createjs.Ticker.framerate = 60;
	TweenMax.ticker.fps(60);
	createjs.Ticker.removeAllEventListeners();
	createjs.Ticker.addEventListener("tick", tick);
}

var safeZoneGuide = false;
var canvasContainer, mainContainer, gameContainer, resultContainer, exitContainer, optionsContainer, shareContainer, shareSaveContainer, socialContainer, preparationContainer;
var guideline, bg, bgP, logo, logoP;
var itemExit, itemExitP, popTitleTxt, popDescTxt, buttonConfirm, buttonCancel;
var itemResult, itemResultP, buttonContinue, resultTitleTxt, resultDescTxt, buttonShare, buttonSave;
var resultTitleOutlineTxt,resultDescOutlineTxt,resultShareTxt,resultShareOutlineTxt,popTitleOutlineTxt,popDescOutlineTxt;
var buttonSettings, buttonFullscreen, buttonSoundOn, buttonSoundOff, buttonMusicOn, buttonMusicOff, buttonExit;
var preparationTxt, preparationLogo;
$.share = {};

var betAllContainer,betContainer,betContentContainer,betContainerP,betContentContainerP,betTypeContainer,betAmountContainer,betTotalContainer,betPlaceContainer,creditContainer,betSummaryAllContainer,betSummaryContainer,betSummaryContentContainer,betSummaryContainerP,betSummaryContentContainerP,raceResultAllContainer,raceResultContainer,raceResultContentContainer,raceResultContainerP,raceResultContentContainerP,raceSummaryAllContainer,raceSummaryContainer,raceSummaryContentContainer,raceSummaryContainerP,raceSummaryContentContainerP,raceButtonsContainer,howAllContainer,howContainer,howContainerP,statusContainer,racersContainer,racersShadowContainer,scoreMoveContainer,scoreListContainer,gameRaceContainer,gameBetContainer,raceDisplayContainer,raceDisplayMoveContainer;
var buttonStart,itemExplain,itemExplainP,buttonClose,buttonHow,itemBgPlace,itemBgPlaceP,buttonBetLeft,buttonBetRight,betMaskP,itemTypeField,buttonBetTypeL,buttonBetTypeR,betTypeTxt,betTypeDisplayTxt,betTypeDisplayPTxt,itemBetField,buttonBetAmountL,buttonBetAmountR,betAmountTxt,betAmountDisplayTxt,betAmountDisplayPTxt;
var itemCreditField,creditTxt,creditRedTxt,creditDisplayTxt,creditDisplayPTxt,itemBetTotalField,betTotalTxt,betTotalDisplayTxt,betTotalDisplayPTxt,buttonPlace,buttonPlaceDisabled,buttonCancelBet,itemBgSummary,summaryTitleTxt,itemBgSummaryP,summaryTitleTxtP,buttonSummaryLeft,buttonSummaryRight;
var buttonRace,buttonRaceDisabled,buttonNew,itemBgResult,raceResultTitleTxt,itemBgResultP,raceResultTitleTxtP,buttonRaceLeft,buttonRaceRight,raceSummaryTitleTxt,raceSummaryTitleTxtP,buttonRaceSummaryLeft,buttonRaceSummaryRight,buttonPlaceAgain,buttonContinue,itemRaceScore,itemRaceScorePin,itemRaceDisplay,raceDisplayTxt,fieldDisplayTxt,dimShape;
var buttonMain,resultDescTitleTxt,itemResultScore;
$.checkbox = {};
$.racer = {};
$.field = {};

/*!
 * 
 * BUILD GAME CANVAS ASSERTS - This is the function that runs to build game canvas asserts
 * 
 */
function buildGameCanvas(){
	canvasContainer = new createjs.Container();
	mainContainer = new createjs.Container();
	gameContainer = new createjs.Container();
	exitContainer = new createjs.Container();
	resultContainer = new createjs.Container();
	shareContainer = new createjs.Container();
	shareSaveContainer = new createjs.Container();
	socialContainer = new createjs.Container();
	preparationContainer = new createjs.Container();

	betAllContainer = new createjs.Container();
	betContainer = new createjs.Container();
	betContentContainer = new createjs.Container();
	betContainerP = new createjs.Container();
	betContentContainerP = new createjs.Container();
	betTypeContainer = new createjs.Container();
	betAmountContainer = new createjs.Container();
	betTotalContainer = new createjs.Container();
	betPlaceContainer = new createjs.Container();
	creditContainer = new createjs.Container();
	betSummaryAllContainer = new createjs.Container();
	betSummaryContainer = new createjs.Container();
	betSummaryContentContainer = new createjs.Container();
	betSummaryContainerP = new createjs.Container();
	betSummaryContentContainerP = new createjs.Container();
	raceResultAllContainer = new createjs.Container();
	raceResultContainer = new createjs.Container();
	raceResultContentContainer = new createjs.Container();
	raceResultContainerP = new createjs.Container();
	raceResultContentContainerP = new createjs.Container();
	raceSummaryAllContainer = new createjs.Container();
	raceSummaryContainer = new createjs.Container();
	raceSummaryContentContainer = new createjs.Container();
	raceSummaryContainerP = new createjs.Container();
	raceSummaryContentContainerP = new createjs.Container();
	raceButtonsContainer = new createjs.Container();
	howAllContainer = new createjs.Container();
	howContainer = new createjs.Container();
	howContainerP = new createjs.Container();
	statusContainer = new createjs.Container();
	racersContainer = new createjs.Container();
	racersShadowContainer = new createjs.Container();
	scoreContainer = new createjs.Container();
	scoreMoveContainer = new createjs.Container();
	scoreListContainer = new createjs.Container();
	gameRaceContainer = new createjs.Container();
	gameBetContainer = new createjs.Container();
	raceDisplayContainer = new createjs.Container();
	raceDisplayMoveContainer = new createjs.Container();
	
	
	bg = new createjs.Bitmap(loader.getResult('background'));
	bgP = new createjs.Bitmap(loader.getResult('backgroundP'));
	logo = new createjs.Bitmap(loader.getResult('logo'));
	logoP = new createjs.Bitmap(loader.getResult('logoP'));
	
	preparationTxt = new createjs.Text();
	preparationTxt.font = "40px Orbitron";
	preparationTxt.fontWeight = "bold";
	preparationTxt.color = "#BBFF00";
	preparationTxt.textAlign = "center";
	preparationTxt.textBaseline='alphabetic';
	preparationTxt.text = "SELECT YOUR RACER";
	
	preparationLogo = new createjs.Bitmap(loader.getResult('logo'));
	centerReg(preparationLogo);
	preparationContainer.addChild(preparationLogo, preparationTxt);
	
	buttonStart = new createjs.Bitmap(loader.getResult('buttonStart'));
	centerReg(buttonStart);
	
	//game
	itemExplain = new createjs.Bitmap(loader.getResult('itemExplain'));
	centerReg(itemExplain);
	itemExplain.y
	howContainer.addChild(itemExplain);

	itemExplainP = new createjs.Bitmap(loader.getResult('itemExplainP'));
	centerReg(itemExplainP);
	howContainerP.addChild(itemExplainP);

	buttonClose = new createjs.Bitmap(loader.getResult('buttonClose'));
	centerReg(buttonClose);

	buttonHow = new createjs.Bitmap(loader.getResult('buttonHow'));
	centerReg(buttonHow);
	howAllContainer.addChild(howContainer, howContainerP, buttonClose);

	itemBgPlace = new createjs.Bitmap(loader.getResult('itemBgPlace'));
	centerReg(itemBgPlace);
	betContainer.addChild(itemBgPlace, betContentContainer);

	itemBgPlaceP = new createjs.Bitmap(loader.getResult('itemBgPlaceP'));
	centerReg(itemBgPlaceP);
	buttonBetLeft = new createjs.Bitmap(loader.getResult('buttonLeft'));
	centerReg(buttonBetLeft);
	buttonBetRight = new createjs.Bitmap(loader.getResult('buttonRight'));
	centerReg(buttonBetRight);
	buttonBetLeft.x = -270;
	buttonBetRight.x = 270;

	betMaskP = new createjs.Shape();	
	betMaskP.graphics.beginFill('red').drawRect(-240, -210, 480, 420);
	betContentContainerP.mask = betMaskP;
	betContainerP.addChild(itemBgPlaceP, betContentContainerP, buttonBetLeft, buttonBetRight);

	betAllContainer.addChild(betContainer, betContainerP);

	itemTypeField = new createjs.Bitmap(loader.getResult('itemFieldLong'));
	centerReg(itemTypeField);
	buttonBetTypeL = new createjs.Bitmap(loader.getResult('buttonArrowL'));
	centerReg(buttonBetTypeL);
	buttonBetTypeR = new createjs.Bitmap(loader.getResult('buttonArrowR'));
	centerReg(buttonBetTypeR);
	buttonBetTypeL.x = -119;
	buttonBetTypeR.x = 119;
	betTypeTxt = new createjs.Text();
	betTypeTxt.font = "20px Orbitron";
	betTypeTxt.color = '#fff';
	betTypeTxt.textAlign = "center";
	betTypeTxt.textBaseline='alphabetic';
	betTypeTxt.text = 'WIN';
	betTypeTxt.y = 6;

	betTypeDisplayTxt = new createjs.Text();
	betTypeDisplayTxt.font = "20px Orbitron";
	betTypeDisplayTxt.color = '#fff';
	betTypeDisplayTxt.textAlign = "right";
	betTypeDisplayTxt.textBaseline='alphabetic';
	betTypeDisplayTxt.text = textStrings.betType;
	betTypeDisplayTxt.x = -155;
	betTypeDisplayTxt.y = 6;
	betTypeDisplayTxt.visible = false;

	betTypeDisplayPTxt = new createjs.Text();
	betTypeDisplayPTxt.font = "20px Orbitron";
	betTypeDisplayPTxt.color = '#fff';
	betTypeDisplayPTxt.textAlign = "center";
	betTypeDisplayPTxt.textBaseline='alphabetic';
	betTypeDisplayPTxt.text = textStrings.betType;
	betTypeDisplayPTxt.y = -30;
	betTypeDisplayPTxt.visible = false;

	betTypeContainer.textL = betTypeDisplayTxt;
	betTypeContainer.textP = betTypeDisplayPTxt;
	betTypeContainer.addChild(itemTypeField, betTypeDisplayTxt, betTypeDisplayPTxt, buttonBetTypeL, buttonBetTypeR, betTypeTxt);


	itemBetField = new createjs.Bitmap(loader.getResult('itemField'));
	centerReg(itemBetField);
	buttonBetAmountL = new createjs.Bitmap(loader.getResult('buttonArrowL'));
	centerReg(buttonBetAmountL);
	buttonBetAmountR = new createjs.Bitmap(loader.getResult('buttonArrowR'));
	centerReg(buttonBetAmountR);
	buttonBetAmountL.x = -59;
	buttonBetAmountR.x = 59;
	betAmountTxt = new createjs.Text();
	betAmountTxt.font = "20px Orbitron";
	betAmountTxt.color = '#fff';
	betAmountTxt.textAlign = "center";
	betAmountTxt.textBaseline='alphabetic';
	betAmountTxt.text = 'WIN';
	betAmountTxt.y = 6;

	betAmountDisplayTxt = new createjs.Text();
	betAmountDisplayTxt.font = "20px Orbitron";
	betAmountDisplayTxt.color = '#fff';
	betAmountDisplayTxt.textAlign = "right";
	betAmountDisplayTxt.textBaseline='alphabetic';
	betAmountDisplayTxt.text = textStrings.betAmount;
	betAmountDisplayTxt.x = -95;
	betAmountDisplayTxt.y = 6;
	betAmountDisplayTxt.visible = false;

	betAmountDisplayPTxt = new createjs.Text();
	betAmountDisplayPTxt.font = "20px Orbitron";
	betAmountDisplayPTxt.color = '#fff';
	betAmountDisplayPTxt.textAlign = "center";
	betAmountDisplayPTxt.textBaseline='alphabetic';
	betAmountDisplayPTxt.text = textStrings.betAmount;
	betAmountDisplayPTxt.y = -30;
	betAmountDisplayPTxt.visible = false;

	betAmountContainer.textL = betAmountDisplayTxt;
	betAmountContainer.textP = betAmountDisplayPTxt;
	betAmountContainer.addChild(itemBetField, betAmountDisplayTxt, betAmountDisplayPTxt, buttonBetAmountL, buttonBetAmountR, betAmountTxt);

	itemCreditField = new createjs.Bitmap(loader.getResult('itemField'));
	centerReg(itemCreditField);
	creditTxt = new createjs.Text();
	creditTxt.font = "20px Orbitron";
	creditTxt.color = '#fff';
	creditTxt.textAlign = "center";
	creditTxt.textBaseline='alphabetic';
	creditTxt.y = 6;

	creditRedTxt = new createjs.Text();
	creditRedTxt.font = "20px Orbitron";
	creditRedTxt.color = '#D90000';
	creditRedTxt.textAlign = "center";
	creditRedTxt.textBaseline='alphabetic';
	creditRedTxt.y = 6;

	creditDisplayTxt = new createjs.Text();
	creditDisplayTxt.font = "20px Orbitron";
	creditDisplayTxt.color = '#fff';
	creditDisplayTxt.textAlign = "right";
	creditDisplayTxt.textBaseline='alphabetic';
	creditDisplayTxt.text = textStrings.credits;
	creditDisplayTxt.x = -95;
	creditDisplayTxt.y = 6;
	creditDisplayTxt.visible = false;

	creditDisplayPTxt = new createjs.Text();
	creditDisplayPTxt.font = "20px Orbitron";
	creditDisplayPTxt.color = '#fff';
	creditDisplayPTxt.textAlign = "center";
	creditDisplayPTxt.textBaseline='alphabetic';
	creditDisplayPTxt.text = textStrings.credits;
	creditDisplayPTxt.y = -30;
	creditDisplayPTxt.visible = false;

	creditContainer.textL = creditDisplayTxt;
	creditContainer.textP = creditDisplayPTxt;
	creditContainer.addChild(itemCreditField, creditDisplayTxt, creditDisplayPTxt, creditTxt, creditRedTxt);

	itemBetTotalField = new createjs.Bitmap(loader.getResult('itemField'));
	centerReg(itemBetTotalField);
	betTotalTxt = new createjs.Text();
	betTotalTxt.font = "20px Orbitron";
	betTotalTxt.color = '#fff';
	betTotalTxt.textAlign = "center";
	betTotalTxt.textBaseline='alphabetic';
	betTotalTxt.text = 'WIN';
	betTotalTxt.y = 6;

	betTotalDisplayTxt = new createjs.Text();
	betTotalDisplayTxt.font = "20px Orbitron";
	betTotalDisplayTxt.color = '#fff';
	betTotalDisplayTxt.textAlign = "right";
	betTotalDisplayTxt.textBaseline='alphabetic';
	betTotalDisplayTxt.text = textStrings.totalBet;
	betTotalDisplayTxt.x = -95;
	betTotalDisplayTxt.y = 6;
	betTotalDisplayTxt.visible = false;

	betTotalDisplayPTxt = new createjs.Text();
	betTotalDisplayPTxt.font = "20px Orbitron";
	betTotalDisplayPTxt.color = '#fff';
	betTotalDisplayPTxt.textAlign = "center";
	betTotalDisplayPTxt.textBaseline='alphabetic';
	betTotalDisplayPTxt.text = textStrings.totalBet;
	betTotalDisplayPTxt.y = -30;
	betTotalDisplayPTxt.visible = false;

	betTotalContainer.textL = betTotalDisplayTxt;
	betTotalContainer.textP = betTotalDisplayPTxt;
	betTotalContainer.addChild(itemBetTotalField, betTotalDisplayTxt, betTotalDisplayPTxt, betTotalTxt);

	buttonPlace = new createjs.Bitmap(loader.getResult('buttonPlace'));
	centerReg(buttonPlace);
	buttonPlaceDisabled = new createjs.Bitmap(loader.getResult('buttonPlaceDisabled'));
	centerReg(buttonPlaceDisabled);
	buttonCancelBet = new createjs.Bitmap(loader.getResult('buttonCancelBet'));
	centerReg(buttonCancelBet);
	betPlaceContainer.addChild(buttonPlaceDisabled, buttonCancelBet, buttonPlace);

	itemBgSummary = new createjs.Bitmap(loader.getResult('itemBgPlace'));
	centerReg(itemBgSummary);
	summaryTitleTxt = new createjs.Text();
	summaryTitleTxt.font = "bold 28px Orbitron";
	summaryTitleTxt.color = "#fff";
	summaryTitleTxt.textAlign = "center";
	summaryTitleTxt.textBaseline='alphabetic';
	summaryTitleTxt.text = textStrings.summaryTitle;
	summaryTitleTxt.y = -230;
	betSummaryContainer.addChild(itemBgSummary, summaryTitleTxt, betSummaryContentContainer);

	itemBgSummaryP = new createjs.Bitmap(loader.getResult('itemBgPlaceP'));
	centerReg(itemBgSummaryP);
	summaryTitleTxtP = new createjs.Text();
	summaryTitleTxtP.font = "bold 28px Orbitron";
	summaryTitleTxtP.color = "#fff";
	summaryTitleTxtP.textAlign = "center";
	summaryTitleTxtP.textBaseline='alphabetic';
	summaryTitleTxtP.text = textStrings.summaryTitle;
	summaryTitleTxtP.y = -230;

	buttonSummaryLeft = new createjs.Bitmap(loader.getResult('buttonLeft'));
	centerReg(buttonSummaryLeft);
	buttonSummaryRight = new createjs.Bitmap(loader.getResult('buttonRight'));
	centerReg(buttonSummaryRight);
	buttonSummaryLeft.x = -270;
	buttonSummaryRight.x = 270;

	betMaskP = new createjs.Shape();	
	betMaskP.graphics.beginFill('red').drawRect(-240, -210, 480, 420);
	betSummaryContentContainerP.mask = betMaskP;
	betSummaryContainerP.addChild(itemBgSummaryP, summaryTitleTxtP, betSummaryContentContainerP, buttonSummaryLeft, buttonSummaryRight);

	betSummaryAllContainer.addChild(betSummaryContainer, betSummaryContainerP);

	buttonRace = new createjs.Bitmap(loader.getResult('buttonRace'));
	centerReg(buttonRace);
	buttonRaceDisabled = new createjs.Bitmap(loader.getResult('buttonRaceDisabled'));
	centerReg(buttonRaceDisabled);
	buttonNew = new createjs.Bitmap(loader.getResult('buttonNew'));
	centerReg(buttonNew);

	itemBgResult = new createjs.Bitmap(loader.getResult('itemBgResult'));
	centerReg(itemBgResult);
	raceResultTitleTxt = new createjs.Text();
	raceResultTitleTxt.font = "bold 28px Orbitron";
	raceResultTitleTxt.color = "#fff";
	raceResultTitleTxt.textAlign = "center";
	raceResultTitleTxt.textBaseline='alphabetic';
	raceResultTitleTxt.text = textStrings.raceResultTitle;
	raceResultTitleTxt.y = -230;
	raceResultContainer.addChild(itemBgResult, raceResultTitleTxt, raceResultContentContainer);

	itemBgResultP = new createjs.Bitmap(loader.getResult('itemBgResultP'));
	centerReg(itemBgResultP);
	raceResultTitleTxtP = new createjs.Text();
	raceResultTitleTxtP.font = "bold 28px Orbitron";
	raceResultTitleTxtP.color = "#fff";
	raceResultTitleTxtP.textAlign = "center";
	raceResultTitleTxtP.textBaseline='alphabetic';
	raceResultTitleTxtP.text = textStrings.raceResultTitle;
	raceResultTitleTxtP.y = -90;
	buttonRaceLeft = new createjs.Bitmap(loader.getResult('buttonLeft'));
	centerReg(buttonRaceLeft);
	buttonRaceRight = new createjs.Bitmap(loader.getResult('buttonRight'));
	centerReg(buttonRaceRight);
	buttonRaceLeft.x = -270;
	buttonRaceRight.x = 270;

	betMaskP = new createjs.Shape();
	betMaskP.graphics.beginFill('red').drawRect(-245, -210, 490, 420);
	raceResultContentContainerP.mask = betMaskP;
	raceResultContainerP.addChild(itemBgResultP, raceResultTitleTxtP, raceResultContentContainerP, buttonRaceLeft, buttonRaceRight);

	raceResultAllContainer.addChild(raceResultContainer, raceResultContainerP);

	itemBgSummary = new createjs.Bitmap(loader.getResult('itemBgSummary'));
	centerReg(itemBgSummary);
	raceSummaryTitleTxt = new createjs.Text();
	raceSummaryTitleTxt.font = "bold 28px Orbitron";
	raceSummaryTitleTxt.color = "#fff";
	raceSummaryTitleTxt.textAlign = "center";
	raceSummaryTitleTxt.textBaseline='alphabetic';
	raceSummaryTitleTxt.text = textStrings.raceSummaryTitle;
	raceSummaryTitleTxt.x = 0;
	raceSummaryTitleTxt.y = -230;

	var newCredits = new createjs.Text();
	newCredits.font = "bold 20px Orbitron";
	newCredits.color = '#fff';
	newCredits.textAlign = "left";
	newCredits.textBaseline='alphabetic';
	newCredits.x = -275;
	newCredits.y = 190;

	var newWin = new createjs.Text();
	newWin.font = "bold 20px Orbitron";
	newWin.color = '#fff';
	newWin.textAlign = "right";
	newWin.textBaseline='alphabetic';
	newWin.x = 275;
	newWin.y = 190;

	gameData.summaryCredits = newCredits;
	gameData.summaryWin = newWin;
	newCredits.visible = false;
	newWin.visible = false;
	raceSummaryContainer.addChild(itemBgSummary, raceSummaryTitleTxt, raceSummaryContentContainer, newCredits, newWin);

	itemBgSummaryP = new createjs.Bitmap(loader.getResult('itemBgPlaceP'));
	centerReg(itemBgSummaryP);
	raceSummaryTitleTxtP = new createjs.Text();
	raceSummaryTitleTxtP.font = "bold 28px Orbitron";
	raceSummaryTitleTxtP.color = "#fff";
	raceSummaryTitleTxtP.textAlign = "center";
	raceSummaryTitleTxtP.textBaseline='alphabetic';
	raceSummaryTitleTxtP.text = textStrings.raceSummaryTitle;
	raceSummaryTitleTxtP.x = 0;
	raceSummaryTitleTxtP.y = -230;
	buttonRaceSummaryLeft = new createjs.Bitmap(loader.getResult('buttonLeft'));
	centerReg(buttonRaceSummaryLeft);
	buttonRaceSummaryRight = new createjs.Bitmap(loader.getResult('buttonRight'));
	centerReg(buttonRaceSummaryRight);
	buttonRaceSummaryLeft.x = -270;
	buttonRaceSummaryRight.x = 270;

	betMaskP = new createjs.Shape();	
	betMaskP.graphics.beginFill('red').drawRect(-250, -210, 500, 420);
	raceSummaryContentContainerP.mask = betMaskP;

	var newCreditsP = new createjs.Text();
	newCreditsP.font = "20px Orbitron";
	newCreditsP.color = '#fff';
	newCreditsP.textAlign = "left";
	newCreditsP.textBaseline='alphabetic';
	newCreditsP.x = -245;
	newCreditsP.y = 190;

	var newWinP = new createjs.Text();
	newWinP.font = "20px Orbitron";
	newWinP.color = '#fff';
	newWinP.textAlign = "right";
	newWinP.textBaseline='alphabetic';
	newWinP.x = 245;
	newWinP.y = 190;

	gameData.summaryCreditsP = newCreditsP;
	gameData.summaryWinP = newWinP;
	newCreditsP.visible = false;
	newWinP.visible = false;

	raceSummaryContainerP.addChild(itemBgSummaryP, raceSummaryTitleTxtP, raceSummaryContentContainerP, buttonRaceSummaryLeft, buttonRaceSummaryRight, newCreditsP, newWinP);

	raceSummaryAllContainer.addChild(raceSummaryContainer, raceSummaryContainerP);

	buttonPlaceAgain = new createjs.Bitmap(loader.getResult('buttonPlace'));
	centerReg(buttonPlaceAgain);
	buttonContinue = new createjs.Bitmap(loader.getResult('buttonContinue'));
	centerReg(buttonContinue);
	raceButtonsContainer.addChild(buttonPlaceAgain, buttonContinue);

	itemRaceScore = new createjs.Bitmap(loader.getResult('itemRaceScore'));
	centerReg(itemRaceScore);
	itemRaceScorePin = new createjs.Bitmap(loader.getResult('itemRaceScorePin'));
	centerReg(itemRaceScorePin);
	scoreMoveContainer.addChild(itemRaceScore, itemRaceScorePin, scoreListContainer);
	scoreContainer.addChild(scoreMoveContainer);

	itemRaceDisplay = new createjs.Bitmap(loader.getResult('itemRaceDisplay'));
	centerReg(itemRaceDisplay);
	itemRaceDisplay.x = -20;

	raceDisplayTxt = new createjs.Text();
	raceDisplayTxt.font = "bold 35px Orbitron";
	raceDisplayTxt.color = '#fff';
	raceDisplayTxt.textAlign = "center";
	raceDisplayTxt.textBaseline='alphabetic';
	raceDisplayTxt.x = 25;
	raceDisplayTxt.y = 0;

	fieldDisplayTxt = new createjs.Text();
	fieldDisplayTxt.font = "bold 22px Orbitron";
	fieldDisplayTxt.color = '#000';
	fieldDisplayTxt.textAlign = "center";
	fieldDisplayTxt.textBaseline='alphabetic';
	fieldDisplayTxt.y = 33;
	raceDisplayMoveContainer.addChild(itemRaceDisplay, raceDisplayTxt, fieldDisplayTxt);
	raceDisplayContainer.addChild(raceDisplayMoveContainer);

	dimShape = new createjs.Shape();	
	dimShape.graphics.beginFill('#000').drawRect(-(landscapeSize.w/2), -(portraitSize.h/2), landscapeSize.w, portraitSize.h);
	dimShape.x = landscapeSize.w/2;
	dimShape.y = portraitSize.h/2;
	
	//result
	itemResult = new createjs.Bitmap(loader.getResult('itemResult'));
	itemResultP = new createjs.Bitmap(loader.getResult('itemResultP'));
	
	buttonMain = new createjs.Bitmap(loader.getResult('buttonMain'));
	centerReg(buttonMain);
	
	resultShareTxt = new createjs.Text();
	resultShareTxt.font = "25px Orbitron";
	resultShareTxt.color = '#1e4f27';
	resultShareTxt.textAlign = "center";
	resultShareTxt.textBaseline='alphabetic';
	resultShareTxt.text = textStrings.share;
	
	resultTitleTxt = new createjs.Text();
	resultTitleTxt.font = "bold 50px Orbitron";
	resultTitleTxt.color = '#1e4f27';
	resultTitleTxt.textAlign = "center";
	resultTitleTxt.textBaseline='alphabetic';
	resultTitleTxt.text = textStrings.resultTitle;

	resultDescTitleTxt = new createjs.Text();
	resultDescTitleTxt.font = "bold 28px Orbitron";
	resultDescTitleTxt.color = '#1e4f27';
	resultDescTitleTxt.textAlign = "center";
	resultDescTitleTxt.textBaseline='alphabetic';
	resultDescTitleTxt.text = textStrings.resultDescTitle;
	
	resultDescTxt = new createjs.Text();
	resultDescTxt.font = "45px Orbitron";
	resultDescTxt.lineHeight = 45;
	resultDescTxt.color = '#f8e02f';
	resultDescTxt.textAlign = "center";
	resultDescTxt.textBaseline='alphabetic';
	resultDescTxt.text = '';

	itemResultScore = new createjs.Bitmap(loader.getResult('itemResultScore'));
	centerReg(itemResultScore);

	socialContainer.visible = false;
	socialContainer.scale = .9;
	shareContainer.addChild(resultShareTxt, socialContainer);

	if(shareSettings.enable){
		buttonShare = new createjs.Bitmap(loader.getResult('buttonShare'));
		centerReg(buttonShare);
		
		var pos = {x:0, y:45, spaceX:65};
		pos.x = -(((shareSettings.options.length-1) * pos.spaceX)/2)
		for(let n=0; n<shareSettings.options.length; n++){
			var shareOption = shareSettings.options[n];
			var shareAsset = String(shareOption[0]).toUpperCase() + String(shareOption).slice(1);
			$.share['button'+n] = new createjs.Bitmap(loader.getResult('button'+shareAsset));
			$.share['button'+n].shareOption = shareOption;
			centerReg($.share['button'+n]);
			$.share['button'+n].x = pos.x;
			$.share['button'+n].y = pos.y;
			socialContainer.addChild($.share['button'+n]);
			pos.x += pos.spaceX;
		}
		if (buttonShare.image && buttonShare.image.naturalHeight > 0) {
			buttonShare.y = (buttonShare.image.naturalHeight/2) + 10;
		}
		shareContainer.addChild(buttonShare);
	}

	if ( typeof toggleScoreboardSave == 'function' ) { 
		buttonSave = new createjs.Bitmap(loader.getResult('buttonSave'));
		centerReg(buttonSave);
		if (buttonSave.image && buttonSave.image.naturalHeight > 0) {
			buttonSave.y = (buttonSave.image.naturalHeight/2) + 10;
		}
		shareSaveContainer.addChild(buttonSave);
	}
	
	//options
	buttonFullscreen = new createjs.Bitmap(loader.getResult('buttonFullscreen'));
	centerReg(buttonFullscreen);
	buttonSoundOn = new createjs.Bitmap(loader.getResult('buttonSoundOn'));
	centerReg(buttonSoundOn);
	buttonSoundOff = new createjs.Bitmap(loader.getResult('buttonSoundOff'));
	centerReg(buttonSoundOff);
	buttonSoundOn.visible = false;
	buttonMusicOn = new createjs.Bitmap(loader.getResult('buttonMusicOn'));
	centerReg(buttonMusicOn);
	buttonMusicOff = new createjs.Bitmap(loader.getResult('buttonMusicOff'));
	centerReg(buttonMusicOff);
	buttonMusicOn.visible = false;
	
	buttonExit = new createjs.Bitmap(loader.getResult('buttonExit'));
	centerReg(buttonExit);
	buttonSettings = new createjs.Bitmap(loader.getResult('buttonSettings'));
	buttonSettings.visible = false;
	centerReg(buttonSettings);
	
	createHitarea(buttonFullscreen);
	createHitarea(buttonSoundOn);
	createHitarea(buttonSoundOff);
	createHitarea(buttonMusicOn);
	createHitarea(buttonMusicOff);
	createHitarea(buttonExit);
	createHitarea(buttonSettings);
	optionsContainer = new createjs.Container();
	optionsContainer.addChild(buttonFullscreen, buttonSoundOn, buttonSoundOff, buttonMusicOn, buttonMusicOff, buttonExit);
	optionsContainer.visible = false;
	
	//exit
	itemExit = new createjs.Bitmap(loader.getResult('itemResult'));
	itemExitP = new createjs.Bitmap(loader.getResult('itemResultP'));
	
	buttonConfirm = new createjs.Bitmap(loader.getResult('buttonConfirm'));
	centerReg(buttonConfirm);
	
	buttonCancel = new createjs.Bitmap(loader.getResult('buttonCancel'));
	centerReg(buttonCancel);
	
	popTitleTxt = new createjs.Text();
	popTitleTxt.font = "bold 50px Orbitron";
	popTitleTxt.color = "#1e4f27";
	popTitleTxt.textAlign = "center";
	popTitleTxt.textBaseline='alphabetic';
	popTitleTxt.text = textStrings.exitTitle;
	
	popDescTxt = new createjs.Text();
	popDescTxt.font = "28px Orbitron";
	popDescTxt.color = "#1e4f27";
	popDescTxt.textAlign = "center";
	popDescTxt.textBaseline='alphabetic';
	popDescTxt.text = textStrings.exitMessage;
	
	exitContainer.addChild(itemExit, itemExitP, popTitleTxt, popDescTxt, buttonConfirm, buttonCancel);
	exitContainer.visible = false;
	
	guideline = new createjs.Shape();
	
	mainContainer.addChild(logo, logoP, buttonStart);
	gameBetContainer.addChild(howAllContainer, buttonHow, buttonClose, betAllContainer, betSummaryAllContainer, raceResultAllContainer, raceSummaryAllContainer, raceButtonsContainer, betTypeContainer, betAmountContainer, creditContainer, betTotalContainer, betPlaceContainer, buttonRaceDisabled, buttonRace, buttonNew);
	gameRaceContainer.addChild();
	gameContainer.addChild(gameRaceContainer, gameBetContainer, scoreContainer, raceDisplayContainer);
	resultContainer.addChild(itemResult, itemResultP, itemResultScore, buttonMain, resultTitleTxt, resultDescTxt, resultDescTitleTxt, shareContainer, shareSaveContainer);

	canvasContainer.addChild(bg, bgP, preparationContainer, mainContainer, gameContainer, resultContainer, exitContainer, optionsContainer, buttonSettings, guideline);
	stage.addChild(canvasContainer);
	
	changeViewport(viewport.isLandscape);
	resizeGameFunc();
}

function changeViewport(isLandscape){
	if(isLandscape){
		//landscape
		stageW=landscapeSize.w;
		stageH=landscapeSize.h;
		contentW = landscapeSize.cW;
		contentH = landscapeSize.cH;
	}else{
		//portrait
		stageW=portraitSize.w;
		stageH=portraitSize.h;
		contentW = portraitSize.cW;
		contentH = portraitSize.cH;
	}
	
	canvasW=stageW;
	canvasH=stageH;
	
	changeCanvasViewport();
}

function changeCanvasViewport(){
	if(canvasContainer!=undefined){
		stage.scaleX = stage.scaleY = dpr;
		
		if(safeZoneGuide){	
			guideline.graphics.clear().setStrokeStyle(2).beginStroke('red').drawRect((stageW-contentW)/2, (stageH-contentH)/2, contentW, contentH);
		}

		if(viewport.isLandscape){
			bg.visible = true;
			bgP.visible = false;
			
			logo.visible = true;
			logoP.visible = false;
			
			buttonStart.x = canvasW/2;
			buttonStart.y = canvasH/100 * 76;
			
			//game
			
			//result
			itemResult.visible = true;
			itemResultP.visible = false;
			
			buttonMain.x = canvasW/2;
			buttonMain.y = canvasH/100 * 68;
	
			shareContainer.x = shareSaveContainer.x = canvasW/2;
			shareContainer.y = shareSaveContainer.y = canvasH/100 * 52;
	
			resultTitleTxt.x = canvasW/2;
			resultTitleTxt.y = canvasH/100 * 32;
	
			resultDescTxt.x = canvasW/2;
			resultDescTxt.y = canvasH/100 * 45;

			resultDescTitleTxt.x = canvasW/2;
			resultDescTitleTxt.y = canvasH/100 * 37;

			itemResultScore.x = canvasW/2;
			itemResultScore.y = canvasH/100 * 43;
			
			//exit
			itemExit.visible = true;
			itemExitP.visible = false;

			buttonConfirm.x = (canvasW/2);
			buttonConfirm.y = (canvasH/100 * 56);
			
			buttonCancel.x = (canvasW/2);
			buttonCancel.y = (canvasH/100 * 68);

			popTitleTxt.x = canvasW/2;
			popTitleTxt.y = canvasH/100 * 32;
			
			popDescTxt.x = canvasW/2;
			popDescTxt.y = canvasH/100 * 42;
		}else{
			bg.visible = false;
			bgP.visible = true;
			
			logo.visible = false;
			logoP.visible = true;
			
			buttonStart.x = canvasW/2;
			buttonStart.y = canvasH/100 * 80;
			
			//game
			
			//result
			itemResult.visible = false;
			itemResultP.visible = true;
			
			buttonMain.x = canvasW/2;
			buttonMain.y = canvasH/100 * 63;
	
			shareContainer.x = shareSaveContainer.x = canvasW/2;
			shareContainer.y = shareSaveContainer.y = canvasH/100 * 51;
	
			resultTitleTxt.x = canvasW/2;
			resultTitleTxt.y = canvasH/100 * 37;
	
			resultDescTxt.x = canvasW/2;
			resultDescTxt.y = canvasH/100 * 45.5;

			resultDescTitleTxt.x = canvasW/2;
			resultDescTitleTxt.y = canvasH/100 * 39.5;

			itemResultScore.x = canvasW/2;
			itemResultScore.y = canvasH/100 * 44;
			
			//exit
			itemExit.visible = false;
			itemExitP.visible = true;

			buttonConfirm.x = (canvasW/2);
			buttonConfirm.y = (canvasH/100 * 54);
			
			buttonCancel.x = (canvasW/2);
			buttonCancel.y = (canvasH/100 * 63);

			popTitleTxt.x = canvasW/2;
			popTitleTxt.y = canvasH/100 * 37;
			
			popDescTxt.x = canvasW/2;
			popDescTxt.y = canvasH/100 * 43;
		}
	}
}



/*!
 * 
 * RESIZE GAME CANVAS - This is the function that runs to resize game canvas
 * 
 */
function resizeCanvas(){
 	if(canvasContainer!=undefined){
		
		buttonSettings.x = (canvasW - offset.x) - 50;
		buttonSettings.y = offset.y + 45;
		
		var distanceNum = 60;
		var nextCount = 0;
		buttonSoundOn.x = buttonSoundOff.x = buttonSettings.x;
		buttonSoundOn.y = buttonSoundOff.y = buttonSettings.y+distanceNum;
		buttonSoundOn.x = buttonSoundOff.x;
		buttonSoundOn.y = buttonSoundOff.y = buttonSettings.y+distanceNum;
		if (typeof buttonMusicOn != "undefined") {
			buttonMusicOn.x = buttonMusicOff.x = buttonSettings.x;
			buttonMusicOn.y = buttonMusicOff.y = buttonSettings.y+(distanceNum*2);
			buttonMusicOn.x = buttonMusicOff.x;
			buttonMusicOn.y = buttonMusicOff.y = buttonSettings.y+(distanceNum*2);
			nextCount = 2;
		}else{
			nextCount = 1;
		}
		buttonFullscreen.x = buttonSettings.x;
		buttonFullscreen.y = buttonSettings.y+(distanceNum*(nextCount+1));

		if(curPage == 'main' || curPage == 'result'){
			buttonExit.visible = false;			
			buttonFullscreen.x = buttonSettings.x;
			buttonFullscreen.y = buttonSettings.y+(distanceNum*(nextCount+1));
		}else{
			buttonExit.visible = true;			
			buttonExit.x = buttonSettings.x;
			buttonExit.y = buttonSettings.y+(distanceNum*(nextCount+2));
		}

		if(curPage == 'game'){
			resizeGameLayout();
		}
	}
}

/*!
 * 
 * REMOVE GAME CANVAS - This is the function that runs to remove game canvas
 * 
 */
 function removeGameCanvas(){
	 stage.autoClear = true;
	 stage.removeAllChildren();
	 stage.update();
	 createjs.Ticker.removeEventListener("tick", tick);
	 createjs.Ticker.removeEventListener("tick", stage);
 }

/*!
 * 
 * CANVAS LOOP - This is the function that runs for canvas loop
 * 
 */ 
function tick(event) {
	updateGame(event);
	stage.update(event);
}

/*!
 * 
 * CANVAS MISC FUNCTIONS
 * 
 */
function centerReg(obj){
	if (obj.image && obj.image.naturalWidth > 0) {
		obj.regX=obj.image.naturalWidth/2;
		obj.regY=obj.image.naturalHeight/2;
	}
}

function createHitarea(obj){
	if (obj.image && obj.image.naturalWidth > 0) {
		obj.hitArea = new createjs.Shape(new createjs.Graphics().beginFill("#000").drawRect(0, 0, obj.image.naturalWidth, obj.image.naturalHeight));	
	}
}
