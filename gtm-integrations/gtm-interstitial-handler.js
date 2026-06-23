/**
 * ====================================================================
 * GTM TELEMETRY INTERSTITIAL DISPATCHER & CLICK MAPPER
 * Scope: Programmatic Visual Injection & Targeted Conversion Mapping
 * Target Backend: Sportsbook Campaign Attribution Data Schemas
 * ====================================================================
 */

(function (window) {
    'use strict';

    class GTMInterstitialDispatcher {
        constructor() {
            this.leagues = ['nba', 'nfl', 'ncaab', 'mlb', 'video'];
            this.contentTypes = ['trending', 'recommended', 'parlays'];
            this.maxPositionsCount = 6;
        }

        /**
         * Triggers tracking SDK interstitial rendering and injects behavioral event listeners
         * @param {string} placementId - Case-sensitive campaign placement trigger map
         */
        showPlatformInterstitial(placementId) {
            if (typeof window._tc !== 'function') {
                console.error("Integration Abort: Core tracking engine namespace unavailable.");
                return;
            }

            // Programmatically construct the dynamic click-action callback map
            const callbackBindingMap = this.generateDynamicActionMap();

            // Invoke vendor-agnostic script execution call
            window._tc('displayInterstitial', placementId, callbackBindingMap, 
                // Callback A: Executes if the campaign modal is explicitly dismissed
                () => {
                    window._tc("registerEvent", `${placementId}_Dismissed`, "User dismissed placement view layer.");
                }, 
                // Callback B: Executes on successful visual creative render load
                () => {
                    this.initializePostLoadSequences();
                    window._tc("registerEvent", `${placementId}_interstitial_loaded`, "Sportsbook campaign rendered successfully.");
                }, 
                // Callback C: Absolute error safety fallback catch
                (error) => {
                    console.warn(`Interstitial execution bypassed for [${placementId}]:`, error);
                }
            );
        }

        /**
         * Structural Refactoring: Generates extensive click handler configurations on the fly
         * Replaces explicit multi-line duplicate string property declarations cleanly.
         */
        generateDynamicActionMap() {
            const actionsMap = {};
            const standardTrackingHandler = function(event, context) {
                // Extracts and logs the production payload identifier hash
                context.pushPhash(); 
                // Gracefully unmounts the active DOM element overlay view
                context.close();
            };

            // Loop structures systematically mirror every permutation of league, track layout, and slot
            this.leagues.forEach(league => {
                this.contentTypes.forEach(type => {
                    // Skip invalid permutations (e.g., video category doesn't have custom parlay lists)
                    if (league === 'video' && type !== 'trending') return;

                    for (let position = 1; position <= this.maxPositionsCount; position++) {
                        const wordMapping = ['one', 'two', 'three', 'four', 'five', 'six'][position - 1];
                        
                        // Constructs precise key identifiers (e.g., 'click nbahtmltrendingone')
                        const dynamicTriggerKey = `click ${league}html${type}${wordMapping}`;
                        actionsMap[dynamicTriggerKey] = standardTrackingHandler;
                    }
                });
            });

            return actionsMap;
        }

        /**
         * Coordinates secondary analytical actions immediately after visual components render
         */
        initializePostLoadSequences() {
            // Trigger downstream operational sync tasks
            if (typeof window.startCheckingOdds === 'function') {
                window.startCheckingOdds();
            }
            if (typeof window.handleGameClicks === 'function') {
                window.handleGameClicks();
            }
        }
    }

    // Expose layout driver to global context to bind smoothly with the initialization pipeline
    window.showPlatformInterstitialInstance = new GTMInterstitialDispatcher();
    window.showPlatformInterstitial = function(placement) {
        window.showPlatformInterstitialInstance.showPlatformInterstitial(placement);
    };

})(window);
