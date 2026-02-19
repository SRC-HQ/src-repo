
window.GameBridge = {
    // Called from React to set the race results
    setResults: function(results) {
        this.currentResults = results; // Store results
        if (typeof gameData !== 'undefined') {
            console.log("Setting results:", results);
            gameData.revealResults = results;
        } else {
            console.log("Game not ready, storing results for later");
        }
    },

    // Called from React to start the race
    startRace: function() {
        // Ensure we are on the game page (handles refresh case)
        if (typeof curPage !== 'undefined' && curPage !== 'game' && typeof goPage === 'function' && typeof mainContainer !== 'undefined') {
            goPage('game');
        }

        if (typeof tryStartRace === 'function' && typeof betAllContainer !== 'undefined') {
            console.log("Starting race via bridge");
            tryStartRace();
        } else {
            console.warn("tryStartRace not found or game not initialized");
        }
    },

    // Called from React to update credits/balance
    updateBalance: function(balance) {
        if (typeof playerData !== 'undefined') {
            playerData.credit = balance;
            // Update UI if needed
            if (typeof updateBetOptions === 'function') updateBetOptions();
        }
    },

    // Called from React to handle mode changes
    setMode: function(mode) {
        console.log("Bridge mode:", mode);
        this.currentMode = mode; // Store current mode
        
        // Ensure we are on the game page
        if (typeof curPage !== 'undefined' && curPage !== 'game' && typeof goPage === 'function' && typeof mainContainer !== 'undefined') {
            goPage('game');
        }

        // Ensure game is initialized (betAllContainer is created in buildGameCanvas)
        if (typeof goGamePage === 'function' && typeof betAllContainer !== 'undefined' && typeof buttonRace !== 'undefined') {
            if (mode === 'PREPARATION') {
                goGamePage('preparation');
            } else if (mode === 'BETTING') {
                goGamePage('bet');
            } else if (mode === 'DISTRIBUTION') {
                // If race is currently running OR ending (animation playing), let it finish visually first
                if (typeof gameData !== 'undefined' && gameData.race && (gameData.race.start || gameData.race.isEnding)) {
                    console.log("Server finished, waiting for visual finish...");
                    gameData.serverFinished = true;
                } else {
                    // Force re-apply results if available, just in case they were lost or overwritten
                    if (this.currentResults) {
                        console.log("Re-applying results before showing result page");
                        this.setResults(this.currentResults);
                    }
                    goGamePage('result');
                }
            }
        } else {
            console.log("Game not ready, storing mode for later:", mode);
        }
    },

    // Called when game is fully ready (assets loaded)
    onGameReady: function() {
        console.log("Game Bridge: onGameReady called");
        console.log("Game Ready, applying stored data");
        
        // Apply stored results first if available
        if (this.currentResults) {
            this.setResults(this.currentResults);
        }

        // Apply stored mode
        console.log("Applying stored mode:", this.currentMode);
        if (this.currentMode) {
            this.setMode(this.currentMode);
        }
    },

    restoreGame: function(progress, elapsed, racers, startTime, serverFinished) {
      if (typeof window.restoreRace === 'function') {
        window.restoreRace(progress, elapsed, racers, startTime, serverFinished);
      }
    }
};
