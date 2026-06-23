/**
 * ====================================================================
 * CUSTOM PLATFORM INITIALIZATION & CONTEXTUAL TARGETING PIPELINE
 * Scope: Client-Side SDK Hydration & Dynamic DOM State Management
 * Trigger: Early Page-Load / Ready State Synchronization
 * ====================================================================
 * 
 * SANITIZATION NOTE: All vendor-specific platform tracking methods and client
 * keys have been abstracted to open-source structural paradigms.
 */

(function (window, document) {
    'use strict';

    class OperationalInitializationPipeline {
        constructor(config = {}) {
            this.appKey = config.appKey || "CONFIG_APP_KEY_SAMPLE_HEX";
            this.appName = config.appName || "Enterprise Sportsbook - Production";
            this.isTrackingIntervalRunning = false;
            this.pollingAttempts = 1;
            this.maxPollingLimits = 10;
        }

        // 1. Core Lifecycle Entry Point
        execute() {
            // Check document state to gauge if DOM initialization has already compiled
            if (/comp|inter|loaded/.test(document.readyState)) {
                this.injectTelemetryEngine(this.appKey);
            } else {
                document.addEventListener("DOMContentLoaded", () => {
                    this.injectTelemetryEngine(this.appKey);
                }, false);
            }
        }

        // 2. Asynchronous Script Ingestion (IIFE Pattern)
        injectTelemetryEngine(appKey) {
            // Emulates an isolated environment load pattern to stream external analytics layers safely
            !(function (n, e, w, j, o, b, v) {
                !n[j] && ((n.GlobalCoreObject = j), (b = n[j] = function () {
                    b.q ? b.q.push(arguments) : b.apply(b, arguments);
                }), (b.q = []), (v = e.createElement(w)), (v.async = !0), (v.src = o), 
                (e = e.getElementsByTagName(w)[0]), e.parentNode.insertBefore(v, e));
            })(window, document, "script", "_tc", "https://mock-telemetry-engine.com" + appKey);

            const options = {
                appName: this.appName,
                trackingParameterTag: 'p=',
                onError: function(err) {
                    console.error('Telemetry Init Layer Exception Raised:', err.message);
                }
            };

            // Instantiate session configurations on core tracking callback completion
            window._tc("create", appKey, options, () => {
                this.synchronizeSessionIdentities();
                this.purgeStaleStateCache();
                
                // Mount soft opt-in dialog flows asynchronously post initial tracking baseline
                setTimeout(() => {
                    if (typeof window.showPlatformSoftOptIn === 'function') {
                        window.showPlatformSoftOptIn();
                    }
                }, 5000);
            });
        }

        // 3. User Identity Cross-System Synchronization
        synchronizeSessionIdentities() {
            setTimeout(() => {
                // Check if account authentication tracking states exist on the custom window domain
                if (typeof window._accountStateContext !== 'undefined' && window._accountStateContext.playerId) {
                    let sitePlayerId = window._accountStateContext.playerId || '';
                    
                    if (sitePlayerId !== '') {
                        window._tc('getTrackingId', (extractedValue) => {
                            let systemTrackingId = extractedValue;
                            
                            // Align external third-party tracker instances with core customer system profiles
                            if (systemTrackingId !== sitePlayerId) {
                                window._tc('setTrackingId', sitePlayerId);
                                systemTrackingId = sitePlayerId;
                            }
                            console.log('Synchronized Customer Profile Tracking ID:', systemTrackingId);
                        });
                    }
                }
            }, 5000);
        }

        // 4. State Purge Architecture
        purgeStaleStateCache() {
            // Clear prior contextual interstitial templates out of browser sessionStorage elements
            const legacyCacheKeys = [
                "telemetry_home_interstitial_html",
                "telemetry_mlb_interstitial_html",
                "telemetry_nba_interstitial_html",
                "telemetry_ncaab_interstitial_html",
                "telemetry_nfl_interstitial_html"
            ];
            legacyCacheKeys.forEach(key => sessionStorage.removeItem(key));
        }

        // 5. Contextual Path Evaluator & Mutation Hook
        evaluateTargetPageLayout() {
            const currentUrl = window.location.href;
            const currentPath = window.location.pathname;

            // Route execution paths specifically for sportsbook components
            if (currentPath.includes('sports')) {
                // Clear active duplicate layout overlays from page spaces
                const activeModals = document.querySelectorAll('.telemetry-modal:not(.telemetry-softoptin)');
                activeModals.forEach(modal => modal.remove());

                if (!this.isTrackingIntervalRunning) {
                    this.isTrackingIntervalRunning = true;
                    
                    const sportsPageLayoutPollingLoop = setInterval(() => {
                        // Monitor for client-specific layout shell classes to prevent rendering failures
                        const layoutFilterTarget = document.getElementsByClassName("telemetry-ui-sportsbook-container")[0];
                        const headingCheck = document.querySelectorAll('#telemetry-heading').length === 0;

                        if (layoutFilterTarget && headingCheck) {
                            let structuralLeagueScope = "";

                            // Determine segmentation context via structural deep path parsing
                            if (currentUrl.includes("ncaab")) {
                                structuralLeagueScope = "ncaab";
                                this.processTargetPlacement(structuralLeagueScope, "Placement_Schema_1");
                            } else if (currentUrl.includes("nba")) {
                                structuralLeagueScope = "nba";
                                this.processTargetPlacement(structuralLeagueScope, "Placement_Schema_2");
                            } else if (currentUrl.includes("mlb")) {
                                structuralLeagueScope = "mlb";
                                this.processTargetPlacement(structuralLeagueScope, "Placement_Schema_3");
                            } else if (currentUrl.includes("nfl")) {
                                structuralLeagueScope = "nfl";
                                this.processTargetPlacement(structuralLeagueScope, "Placement_Schema_4");
                            } else if (currentUrl.includes("home")) {
                                structuralLeagueScope = "home";
                                this.processTargetPlacement(structuralLeagueScope, "Placement_Schema_5");
                            }

                            clearInterval(sportsPageLayoutPollingLoop);
                            this.isTrackingIntervalRunning = false;
                            this.pollingAttempts = 1;
                        } else if (this.pollingAttempts >= this.maxPollingLimits) {
                            clearInterval(sportsPageLayoutPollingLoop);
                            this.isTrackingIntervalRunning = false;
                            this.pollingAttempts = 1;
                        }
                        this.pollingAttempts++;
                    }, 1000);
                }
            }
        }

        // Helper routing layer to map stored profile states vs fresh payload calls
        processTargetPlacement(league, placementId) {
            if (typeof window.isSessionDataAvailable === 'function' && window.isSessionDataAvailable(league)) {
                if (typeof window.showStoredBetRecommendations === 'function') {
                    window.showStoredBetRecommendations(league);
                }
            } else {
                if (typeof window.showPlatformInterstitial === 'function') {
                    window.showPlatformInterstitial(placementId);
                }
            }
        }
    }

    // Instantiate and execute on current document viewport compile
    const initAppPipeline = new OperationalInitializationPipeline();
    initAppPipeline.execute();

})(window, document);
