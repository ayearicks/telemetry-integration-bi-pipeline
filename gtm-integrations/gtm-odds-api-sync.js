/**
 * ====================================================================
 * ASYNCHRONOUS SPORTSBOOK ODDS TELEMETRY & API SYNCHRONIZER
 * Scope: Real-Time Odds Verification, Dynamic UI Mutation, & Event Ingestion
 * API Layer: Native Fetch Promisified Data Mapping Loop
 * ====================================================================
 */

(function (window, document) {
    'use strict';

    class GTMOddsAPISynchronizer {
        constructor() {
            this.intervalId = null;
            this.checkIntervalMs = 60000; // 1-minute interval loop
        }

        /**
         * 1. Dynamic User Click Listener Assignment
         * Intercepts DOM selections inside layout containers to track event clicks
         */
        handleGameClicks() {
            const betContainers = document.querySelectorAll('.telemetry-carousel-wrapper');
            
            betContainers.forEach(container => {
                container.addEventListener('click', (event) => {
                    const targetWrapper = event.target.closest('.telemetry-carousel-wrapper');
                    if (!targetWrapper) return;

                    // Extract embedded tracking identifiers out of DOM element datasets
                    const ctaElement = targetWrapper.querySelector('.telemetry-cta-action');
                    const gameType = ctaElement ? ctaElement.id : 'UNKNOWN_GAME';
                    const betIds = ctaElement ? ctaElement.dataset.bets : '';
                    
                    const marketLineElement = targetWrapper.querySelector('.telemetry-market-line');
                    const parlayLines = marketLineElement ? marketLineElement.getElementsByClassName("telemetry-parlay-line") : [];
                    
                    let aggregatedBetText = "";

                    // Process multi-leg parlay lines vs traditional single line layouts
                    if (parlayLines.length > 0) {
                        for (let p = 0; p < parlayLines.length; p++) {
                            const parlayNode = parlayLines[p].getElementsByClassName('telemetry-parlay')[0];
                            if (parlayNode) {
                                aggregatedBetText += parlayNode.innerHTML + ";";
                            }
                        }
                    } else if (marketLineElement) {
                        aggregatedBetText = marketLineElement.innerHTML;
                    }

                    // Format structured logging arguments to feed analytical tracking databases
                    const payloadString = JSON.stringify({
                        htmlId: gameType,
                        betMarket: aggregatedBetText,
                        betIds: betIds
                    });

                    if (typeof window._tc === 'function') {
                        window._tc("registerEvent", "interstitialBetClicked", payloadString);
                    }
                });
            });
        }

        /**
         * 2. Orchestration Loop for Real-Time Live Line Sweeping
         */
        startCheckingOdds() {
            // Initial operational check on component mount without layout animation flashes
            this.checkOdds(false);
            
            // Establish continuous rolling synchronization routine
            this.intervalId = setInterval(() => {
                this.checkOdds(true);
            }, this.checkIntervalMs);
        }

        /**
         * 3. UI Ingestion & Validation Sweeper
         */
        checkOdds(shouldFlashColor) {
            if (typeof window.appendCouponToURL === 'function') {
                window.appendCouponToURL();
            }

            const targetCTAs = document.querySelectorAll('.telemetry-cta-action, .telemetry-cta-action-dark');
            
            // Defensive Check: If target components vanish, clear loops to mitigate resource leaks
            if (targetCTAs && targetCTAs.length === 0) {
                if (this.intervalId) {
                    clearInterval(this.intervalId);
                    this.intervalId = null;
                }
                this.purgeTargetLayoutShells();
                return;
            }

            const totalBetElementsCount = targetCTAs.length;
            let processedElementsCount = 0;
            let areActiveBetsAvailable = false;

            targetCTAs.forEach(element => {
                const betIds = element.getAttribute('data-bets');
                const eventIds = element.getAttribute('data-events');
                let outcomePromise;

                // Routing Layer: Separate query rules based on array comma structure (Parlay vs Single)
                if (betIds && eventIds && betIds.split(',').length === 3 && eventIds.split(',').length === 1) {
                    const encodedBetIds = betIds.replace(/,/g, '%2C');
                    outcomePromise = this.fetchParlayOddsFromAPI(encodedBetIds, eventIds, element, shouldFlashColor);
                } else if (betIds && eventIds && betIds.split(',').length === 1 && eventIds.split(',').length === 1) {
                    outcomePromise = this.fetchSingleOddsFromAPI(betIds, element, shouldFlashColor);
                } else {
                    outcomePromise = Promise.resolve(false);
                }

                // Ingest responses using asynchronous Promise chains
                outcomePromise.then((isLineActive) => {
                    if (isLineActive === false) {
                        this.removeElementIfError(element); // Drop component if match is closed/stale
                    } else if (isLineActive && !areActiveBetsAvailable) {
                        areActiveBetsAvailable = true;
                    }

                    processedElementsCount++;
                    
                    // Fire layout update hooks once the entire queue finishes resolving
                    if (processedElementsCount === totalBetElementsCount && areActiveBetsAvailable) {
                        if (typeof window.showBetRecommendations === 'function') {
                            window.showBetRecommendations();
                        }
                    }
                }).catch((error) => {
                    processedElementsCount++;
                    console.error("Asynchronous calculation loop bypassed:", error);
                    if (processedElementsCount === totalBetElementsCount && areActiveBetsAvailable) {
                        if (typeof window.showBetRecommendations === 'function') {
                            window.showBetRecommendations();
                        }
                    }
                });
            });
        }

        /**
         * 4. Asynchronous Network Ingestion Layers (Single Lines)
         */
        fetchSingleOddsFromAPI(betId, element, shouldFlashColor) {
            const sanitizedEndpoint = `https://mock-sportsbook-feed.com{betId}`;
            
            return fetch(sanitizedEndpoint, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            })
            .then(response => {
                if (!response.ok) throw new Error(`Network failure status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                if (typeof window.updateOddsAfterFetching === 'function') {
                    window.updateOddsAfterFetching(data, betId, element, shouldFlashColor);
                }
                return true;
            })
            .catch(() => false); // Gracefully return false to signal UI cleanup
        }

        /**
         * 5. Asynchronous Network Ingestion Layers (Multi-Leg Parlays)
         */
        fetchParlayOddsFromAPI(betIds, eventIds, element, shouldFlashColor) {
            const sanitizedEndpoint = `https://mock-sportsbook-feed.com{eventIds}/outcome/${betIds}?lang=en_US`;
            
            return fetch(sanitizedEndpoint, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            })
            .then(response => {
                if (!response.ok) throw new Error(`Network failure status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                if (data && data.selectedOdds && data.selectedOdds.american) {
                    const americanOddsString = String(data.selectedOdds.american);
                    if (typeof window.updateOdds === 'function') {
                        window.updateOdds(americanOddsString, element, shouldFlashColor);
                    }
                    return true;
                }
                return false;
            })
            .catch(() => false);
        }

        /**
         * Safe DOM Mutation Fallback Utilities
         */
        removeElementIfError(element) {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }

        purgeTargetLayoutShells() {
            const elementsToPurge = ['telemetry-heading', 'telemetry-carousel-one', 'telemetry-carousel-two'];
            elementsToPurge.forEach(id => {
                const node = document.getElementById(id);
                if (node && node.parentNode) {
                    node.parentNode.removeChild(node);
                }
            });
        }

        /**
         * 6. Nested API Payload Parsing & Extraction
         * Traverses the live REST response matrices to isolate and extract specific line numbers
         */
        updateOddsAfterFetching(data, targetBetId, uiElement, shouldFlashColor) {
            let isLineIdentified = false;

            if (!data || !data.betOffers) {
                this.removeElementIfError(uiElement);
                return;
            }

            // High-efficiency double-iteration traversal across multi-layered sports data feeds
            for (let i = 0; i < data.betOffers.length; i++) {
                const outcomes = data.betOffers[i].outcomes || [];
                for (let j = 0; j < outcomes.length; j++) {
                    const currentOutcome = outcomes[j];

                    if (currentOutcome.id.toString() === targetBetId.toString()) {
                        if (currentOutcome.oddsAmerican) {
                            const freshlyFetchedOdds = currentOutcome.oddsAmerican;
                            this.updateOddsDOMValue(freshlyFetchedOdds, uiElement, shouldFlashColor);
                            isLineIdentified = true;
                            break;
                        }
                    }
                }
                if (isLineIdentified) break;
            }

            // Defensive Fallback: If line drops from the data feed, instantly strip its visual card
            if (!isLineIdentified) {
                this.removeElementIfError(uiElement);
            }
        }

        /**
         * 7. Low-Level DOM Mutation & Value Evaluation
         * Safely performs string mutation checks to evaluate line movements before rendering adjustments
         */
        updateOddsDOMValue(freshlyFetchedOdds, uiElement, shouldFlashColor) {
            const oddsContainer = uiElement.querySelector('.telemetry-odds');
            if (!oddsContainer) return;

            // Strip prefix indicators to achieve raw numeric string equivalence checks
            const currentOnScreenOdds = oddsContainer.innerText.replace('+', '');

            if (currentOnScreenOdds !== freshlyFetchedOdds.toString()) {
                const formattedNewOddsString = freshlyFetchedOdds > 0 ? `+${freshlyFetchedOdds}` : freshlyFetchedOdds;
                oddsContainer.innerText = formattedNewOddsString;

                // Fire async visual feedback loops if explicit telemetry updates are requested
                if (shouldFlashColor) {
                    this.executeLayoutColorFlash(oddsContainer);
                }
            }
        }

        /**
         * 8. Asynchronous UI Flash Timing Execution
         */
        executeLayoutColorFlash(oddsContainer) {
            const preservedBaselineColor = oddsContainer.style.color;
            oddsContainer.style.color = 'indianred'; // Temporary highlight indicator flag
            
            setTimeout(() => {
                oddsContainer.style.color = preservedBaselineColor;
            }, 5000);
        }

        /**
         * 9. Dynamic DOM Assembly & Session State Caching
         * Injects operational layouts on verification, caching the fully assembled HTML string
         */
        showBetRecommendations() {
            const platformParentFrame = document.querySelector(".telemetry-sportsbook-container");
            const headingBlock = document.getElementById("telemetry-heading");
            const rowOneBlock = document.getElementById("telemetry-carousel-one");
            const rowTwoBlock = document.getElementById("telemetry-carousel-two");

            this.synchronizeStyleSheets();

            const currentUrl = window.location.href;

            // Strict URL path checkpoint alignment before altering spatial visibility flags
            if (currentUrl.includes(window.currentOperationalLeagueScope)) {
                if (platformParentFrame && headingBlock && rowOneBlock && rowTwoBlock) {
                    // Position components using semantic adjacent array stacks
                    platformParentFrame.insertAdjacentElement("afterbegin", rowTwoBlock);
                    platformParentFrame.insertAdjacentElement("afterbegin", rowOneBlock);
                    platformParentFrame.insertAdjacentElement("afterbegin", headingBlock);

                    headingBlock.style.display = 'flex';
                    rowOneBlock.style.display = 'flex';
                    rowTwoBlock.style.display = 'flex';

                    // Cache structural code layout strings to completely optimize subsequent page hits
                    const bundledHtmlLayoutString = headingBlock.outerHTML + rowOneBlock.outerHTML + rowTwoBlock.outerHTML;
                    this.writeSessionCache(window.currentOperationalLeagueScope, bundledHtmlLayoutString);
                }
            } else {
                this.purgeTargetLayoutShells();
            }
        }

        /**
         * 10. Cache Hydration & Local Route Recovery
         * Decouples the UI from cold API loads by restoring full layouts directly from sessionStorage
         */
        showStoredBetRecommendations(leagueScope) {
            const platformParentFrame = document.querySelector(".telemetry-sportsbook-container");
            const currentUrl = window.location.href;
            const hydratedSessionString = sessionStorage.getItem(`telemetry_${leagueScope}_interstitial_html`);

            if (!document.getElementById("telemetry-carousel-two") && hydratedSessionString && currentUrl.includes(leagueScope)) {
                const documentsandboxNode = document.createElement('div');
                documentsandboxNode.innerHTML = hydratedSessionString;

                const headingBlock = documentsandboxNode.querySelector("#telemetry-heading");
                const rowOneBlock = documentsandboxNode.querySelector("#telemetry-carousel-one");
                const rowTwoBlock = documentsandboxNode.querySelector("#telemetry-carousel-two");

                this.startCheckingOdds();

                if (headingBlock) platformParentFrame.insertAdjacentElement("afterbegin", rowTwoBlock);
                if (rowOneBlock) platformParentFrame.insertAdjacentElement("afterbegin", rowOneBlock);
                if (rowTwoBlock) platformParentFrame.insertAdjacentElement("afterbegin", headingBlock);

                if (headingBlock) headingBlock.style.style.display = 'flex';
                if (rowOneBlock) rowOneBlock.style.style.display = 'flex';
                if (rowTwoBlock) rowTwoBlock.style.style.display = 'flex';
            }
        }

        /**
         * 11. Spatial Canvas SVG/Line Drawing Calculation
         * Calculates coordinates dynamically to draw structural connections between parlay segments
         */
        adjustVisualParlayLines() {
            const parlayGroupNodeLists = document.getElementsByClassName('telemetry-parlay-group');

            for (let i = 0; i < parlayGroupNodeLists.length; i++) {
                const nodePoints = parlayGroupNodeLists[i].getElementsByClassName('telemetry-circle');
                const connectionLine = parlayGroupNodeLists[i].getElementsByClassName('telemetry-line')[0];

                if (nodePoints.length > 1 && connectionLine) {
                    const primaryPoint = nodePoints[0];
                    const terminatingPoint = nodePoints[nodePoints.length - 1];

                    // Formulate dynamic spatial calculations based on active DOM offsets
                    const primaryPointCenterY = primaryPoint.offsetTop + (primaryPoint.offsetHeight / 2);
                    const terminatingPointCenterY = terminatingPoint.offsetTop + (terminatingPoint.offsetHeight / 2);

                    connectionLine.style.top = `${primaryPointCenterY}px`;
                    connectionLine.style.height = `${terminatingPointCenterY - primaryPointCenterY}px`;
                    connectionLine.style.visibility = 'visible';
                }
            }
        }

        /**
         * 12. Deep Telemetry URL Attribution Mapping
         * Extracts transaction parameter coupons from href actions and pairs them to page URLs
         */
        appendAttributionCouponsToURL() {
            const activePageUrl = window.location.href;
            const interactiveCtaLinks = document.getElementsByClassName("telemetry-cta-action");

            for (let i = 0; i < interactiveCtaLinks.length; i++) {
                const targetActionHref = interactiveCtaLinks[i].getAttribute("href");

                if (targetActionHref && targetActionHref.indexOf('?') !== -1) {
                    const transactionalCouponString = targetActionHref.split('?')[1];
                    interactiveCtaLinks[i].setAttribute("href", `${activePageUrl}?${transactionalCouponString}`);
                } else {
                    interactiveCtaLinks[i].setAttribute("href", activePageUrl);
                }
            }
        }

        // Cache write utilities wrapper
        writeSessionCache(league, layoutPayload) {
            sessionStorage.setItem(`telemetry_${league}_interstitial_html`, layoutPayload);
        }

        // Stylesheet injection security validator
        synchronizeStyleSheets() {
            const modalTarget = document.querySelector(".telemetry-modal");
            const structuralModalStyle = modalTarget ? modalTarget.querySelector("style") : null;
            const primaryDocumentStyle = document.querySelector("style");

            if (structuralModalStyle && primaryDocumentStyle && !primaryDocumentStyle.innerHTML.includes(structuralModalStyle.innerHTML)) {
                primaryDocumentStyle.innerHTML += structuralModalStyle.innerHTML;
            }
        }

        removeElementIfError(element) {
            if (element) {
                const imageContainerShell = element.closest('.telemetry-carousel-wrapper');
                if (imageContainerShell) {
                    imageContainerShell.remove();
                }
            }
        }
    }
    // Instantiation routine assignment
    const syncInstance = new GTMOddsAPISynchronizer();
    window.updateOddsAfterFetching = (data, betId, el, flash) => syncInstance.updateOddsAfterFetching(data, betId, el, flash);
    window.updateOdds = (odds, el, flash) => syncInstance.updateOddsDOMValue(odds, el, flash);
    window.appendCouponToURL = () => syncInstance.appendAttributionCouponsToURL();
})(window, document);