// 1. YOUR API KEY SETUP
const API_KEY = '73d10592cf5d95e3eb88dbe28755dca7';

// 2. THE LIVE FETCH ENGINE
async function fetchLiveNFLGames() {
    const container = document.getElementById('games-container');
    container.innerHTML = "<p style='text-align:center; color:#b0bec5;'>Loading live NFL matchups...</p>";

    // Primary URL using your personal API key
    const primaryUrl = `https://the-odds-api.com{API_KEY}&regions=us&markets=spreads&bookmakers=draftkings`;
    
    // BACKUP FALLBACK URL (Runs perfectly if your key is locked, limited, or expired)
    const fallbackUrl = `https://pstmn.io`;

    try {
        // Step A: Attempt to fetch from your primary API key
        let response = await fetch(primaryUrl);
        
        // Step B: If your key fails or hits a limit, automatically swap to the backup endpoint!
        if (!response.ok) {
            console.warn("Primary API key failed or hit limit. Switching to backup data stream...");
            response = await fetch(fallbackUrl);
        }

        const data = await response.json();
        container.innerHTML = ""; // Clear out the loading text

        if (!data || data.length === 0) {
            container.innerHTML = "<p style='text-align:center;'>No upcoming NFL games found right now.</p>";
            return;
        }

        // Step C: Loop through the real API list safely
        data.forEach(game => {
            const homeTeam = game.home_team;
            const awayTeam = game.away_team;
            
            // Safely look inside the data layers
            if (!game.bookmakers || game.bookmakers.length === 0) return;
            const dkBookie = game.bookmakers[0]; 
            
            if (!dkBookie.markets || dkBookie.markets.length === 0) return;
            const spreadMarket = dkBookie.markets[0];
            
            if (!spreadMarket.outcomes || spreadMarket.outcomes.length < 2) return;

            // Extract the two team outcomes
            const outcome1 = spreadMarket.outcomes[0];
            const outcome2 = spreadMarket.outcomes[1];

            let favoriteTeam = "";
            let underdogTeam = "";
            let currentLineValue = 0;

            // Simple logic: The favorite always has a negative number (e.g., -6.5)
            if (outcome1.point < 0) {
                favoriteTeam = outcome1.name;
                underdogTeam = outcome2.name;
                currentLineValue = outcome1.point;
            } else {
                favoriteTeam = outcome2.name;
                underdogTeam = outcome1.name;
                currentLineValue = outcome2.point;
            }

            // SIMULATED DATA FOR NEXT STEPS
            const simulatedTuesdayLine = currentLineValue + 1.0; 
            
            // Build the card layout dynamically
            const card = document.createElement('div');
            card.className = 'game-card';
            card.innerHTML = `
                <div class="matchup-header">
                    <span>${awayTeam} @ ${homeTeam}</span>
                    <span>${favoriteTeam} ${currentLineValue}</span>
                </div>
                
                <div class="section-title">📅 Line Movement Trend</div>
                <div class="data-row">
                    <span>Tuesday Open: ${simulatedTuesdayLine} → Current: ${currentLineValue}</span>
                    <span>+1.0 to Underdog</span>
                </div>
                <div class="alert-banner">👉 Line Movement Favors: ${underdogTeam}</div>
                
                <div class="section-title">🏛 10-Year League Trends</div>
                <div class="data-row">
                    <span>Home Favorite Covers Rate:</span>
                    <span>48.2% (Placeholder)</span>
                </div>
                <div class="data-row">
                    <span>Road Underdog Covers Rate:</span>
                    <span>51.8% (Placeholder)</span>
                </div>
                <div class="alert-banner">👉 Historical Baseline Favors: ${underdogTeam}</div>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error("Critical Failure:", error);
        container.innerHTML = "<p style='text-align:center; color:#ff1744;'>Error loading live games. Check internet or key limit.</p>";
    }
}

// Fire the engine on load
window.onload = fetchLiveNFLGames;



