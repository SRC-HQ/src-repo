////////////////////////////////////////////////////////////
// CANVAS LOADER
////////////////////////////////////////////////////////////

 /*!
 * 
 * START CANVAS PRELOADER - This is the function that runs to preload canvas asserts
 * 
 */
function initPreload(){
	// toggleLoader(true);
	checkMobileEvent();
	
	$(window).resize(function(){
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(checkMobileOrientation, 1000);
	});
	resizeGameFunc();
	
	loader = new createjs.LoadQueue(false);
	manifest=[
			{src:'/game/assets/background.png', id:'background'},
			{src:'/game/assets/src-logo.png', id:'logo'},
			{src:'/game/assets/item_bg_result.png', id:'itemBgResult'},
			{src:'/game/assets/item_race_score.png', id:'itemRaceScore'},
			{src:'/game/assets/item_race_pin.png', id:'itemRaceScorePin'},
			{src:'/game/assets/item_race_display.png', id:'itemRaceDisplay'}
	];

    for(var n=0; n<fieldSettings.length; n++){
        manifest.push({src:fieldSettings[n].sky, id:'bgSky'+n});
        manifest.push({src:fieldSettings[n].race, id:'bgRace'+n});
        manifest.push({src:fieldSettings[n].billboard, id:'bgBillboard'+n});
        manifest.push({src:fieldSettings[n].end, id:'bgEnd'+n});
        manifest.push({src:fieldSettings[n].endline, id:'bgEndline'+n});
        manifest.push({src:fieldSettings[n].shadow, id:'bgShadow'+n});
    }

	for(var n=0; n<racerSettings.length; n++){
		manifest.push({src:racerSettings[n].icon, id:'racerIcon'+n});
		manifest.push({src:racerSettings[n].race, id:'racerRace'+n});
	}

	//memberpayment
	if(typeof memberData != 'undefined' && memberSettings.enableMembership){
		addMemberRewardAssets();
	}
	
	if ( typeof addScoreboardAssets == 'function' ) { 
		addScoreboardAssets();
	}
	
	audioOn = false;
	
	if(audioOn){
		manifest.push({src:'/game/assets/sounds/sound_click.ogg', id:'soundButton'});
		manifest.push({src:'/game/assets/sounds/sound_error.ogg', id:'soundError'});
		manifest.push({src:'/game/assets/sounds/sound_start.ogg', id:'soundStart'});
		manifest.push({src:'/game/assets/sounds/sound_end.ogg', id:'soundEnd'});
		manifest.push({src:'/game/assets/sounds/sound_win.ogg', id:'soundWin'});
		manifest.push({src:'/game/assets/sounds/sound_nowin.ogg', id:'soundNoWin'});
		manifest.push({src:'/game/assets/sounds/sound_result.ogg', id:'soundResult'});
		manifest.push({src:'/game/assets/sounds/sound_hitwin.ogg', id:'soundHitWin'});
		manifest.push({src:'/game/assets/sounds/sound_play.ogg', id:'soundPlay'});
		manifest.push({src:'/game/assets/sounds/sound_chips.ogg', id:'soundChips'});
		manifest.push({src:'/game/assets/sounds/sound_bet.ogg', id:'soundBet'});
		manifest.push({src:'/game/assets/sounds/sound_count.ogg', id:'soundCount'});
		manifest.push({src:'/game/assets/sounds/sound_gate.ogg', id:'soundGate'});
		manifest.push({src:'/game/assets/sounds/sound_run.ogg', id:'soundRun1'});
		manifest.push({src:'/game/assets/sounds/sound_run2.ogg', id:'soundRun2'});
		manifest.push({src:'/game/assets/sounds/sound_run3.ogg', id:'soundRun3'});
		manifest.push({src:'/game/assets/sounds/sound_ambience.ogg', id:'soundAmbience'});
		manifest.push({src:'/game/assets/sounds/sound_calltopost.ogg', id:'soundCallToPost'});
		
		createjs.Sound.alternateExtensions = ["mp3"];
		loader.installPlugin(createjs.Sound);
	}
	
	if(loader.setMaxConnections){
		loader.setMaxConnections(8);
	}
	loader.removeAllEventListeners();
	loader.addEventListener("complete", handleComplete);
	loader.addEventListener("fileload", fileComplete);
	loader.addEventListener("error",handleFileError);
	loader.on("progress", handleProgress, this);
	loader.loadManifest(manifest);
}

/*!
 * 
 * CANVAS FILE COMPLETE EVENT - This is the function that runs to update when file loaded complete
 * 
 */
function fileComplete(evt) {
	var item = evt.item;
	//console.log("Event Callback file loaded ", item.id);
}

/*!
 * 
 * CANVAS FILE HANDLE EVENT - This is the function that runs to handle file error
 * 
 */
function handleFileError(evt) {
	console.log("error ", evt);
}

/*!
 * 
 * CANVAS PRELOADER UPDATE - This is the function that runs to update preloder progress
 * 
 */
function handleProgress() {
	$('#mainLoader span').html(Math.round(loader.progress/1*100)+' percent');
}

/*!
 * 
 * CANVAS PRELOADER COMPLETE - This is the function that runs when preloader is complete
 * 
 */
function handleComplete() {
	// toggleLoader(false);
	initMain();
};

/*!
 * 
 * TOGGLE LOADER - This is the function that runs to display/hide loader
 * 
 */
function toggleLoader(con){
	if(con){
		$('#mainLoader').show();
	}else{
		$('#mainLoader').hide();
	}
}
