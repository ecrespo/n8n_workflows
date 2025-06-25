/**
 * LegallyAsk - Legal AI Assistant
 * JavaScript functionality for form handling and API communication
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const legalForm = document.getElementById('legalForm');
    const legalQuestion = document.getElementById('legalQuestion');
    const country = document.getElementById('country');
    const loadingElement = document.getElementById('loading');
    const responseElement = document.getElementById('response');
    const webhookResponseElement = document.getElementById('webhookResponse');
    const webhookResponseContent = document.getElementById('webhookResponseContent');

    // Populate the countries dropdown
    populateCountries();

    // Webhook URL for sending data
    const webhookUrl = 'https://integrador.seraph13.dev/webhook-test/338b86b2-9277-44e7-9f84-1020734793ee';

    // Store for webhook responses
    let webhookResponses = [];
    let lastRequestId = null;
    let pollingInterval = null;

    // Handle form submission
    legalForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        // Validate form
        if (!legalQuestion.value.trim()) {
            showError('Please enter your legal question');
            return;
        }

        if (!country.value) {
            showError('Please select your country');
            return;
        }

        // Show loading state
        showLoading(true);
        hideResponse();

        try {
            // Generate a unique request ID
            const requestId = generateRequestId();
            lastRequestId = requestId;

            // Send data to webhook
            const response = await sendToWebhook({
                requestId: requestId,
                legalQuestion: legalQuestion.value.trim(),
                country: country.value
            });

            // Process response
            showLoading(false);

            if (response.ok) {
                const data = await response.json();
                showSuccess(data);

                // Start polling for webhook responses
                startPollingForResponses(requestId);
            } else {
                throw new Error(`Server responded with status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error:', error);
            showLoading(false);
            showError('There was an error processing your request. Please try again later.');
        }
    });

    /**
     * Send data to webhook URL via server API
     * @param {Object} data - The data to send
     * @returns {Promise} - Fetch promise
     */
    async function sendToWebhook(data) {
        console.log(`Sending POST request to server API endpoint`);
        console.log(`Request data: ${JSON.stringify(data)}`);

        // Send to our server API endpoint instead of directly to webhook
        return fetch('/api/submit-question', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    /**
     * Show loading spinner
     * @param {boolean} isLoading - Whether to show or hide loading spinner
     */
    function showLoading(isLoading) {
        if (isLoading) {
            loadingElement.classList.remove('hidden');
        } else {
            loadingElement.classList.add('hidden');
        }
    }

    /**
     * Show error message in response area
     * @param {string} message - Error message to display
     */
    function showError(message) {
        responseElement.innerHTML = `
            <div class="error-message">
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
        responseElement.classList.remove('hidden');
    }

    /**
     * Show success message with data
     * @param {Object} data - Response data from server
     */
    function showSuccess(data) {
        // If this is a text response, display it in the main response area
        if (data.isTextResponse && data.text) {
            responseElement.innerHTML = `
                <div class="success-message">
                    <h3>Response from Legal AI</h3>
                    <p>${data.text}</p>
                </div>
            `;
            responseElement.classList.remove('hidden');
            console.log(`Text response displayed to user: ${data.text}`);

            // Add the text response to the webhook responses
            const textResponse = {
                requestId: lastRequestId,
                timestamp: new Date().toISOString(),
                content: data.text,
                source: "Webhook Response"
            };

            // Add to webhook responses and update display
            addWebhookResponse(textResponse);

            // Show the webhook response section
            webhookResponseElement.classList.remove('hidden');
        } else {
            // Display the standard success message
            responseElement.innerHTML = `
                <div class="success-message">
                    <h3>Request Submitted</h3>
                    <p>Your legal question has been submitted successfully. Our AI is analyzing your question.</p>
                    <p>Your request has been sent to the webhook URL.</p>
                    <p class="note">You may receive a response via email or through this interface shortly.</p>
                </div>
            `;
            responseElement.classList.remove('hidden');
            console.log(`Success response displayed to user. Webhook response data:`, data);
        }
    }

    /**
     * Hide response area
     */
    function hideResponse() {
        responseElement.classList.add('hidden');
    }

    /**
     * Generate a unique request ID
     * @returns {string} - Unique ID
     */
    function generateRequestId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    /**
     * Start polling for webhook responses
     * @param {string} requestId - The request ID to poll for
     */
    function startPollingForResponses(requestId) {
        // Clear any existing polling interval
        if (pollingInterval) {
            clearInterval(pollingInterval);
        }

        // Show the webhook response section
        webhookResponseElement.classList.remove('hidden');
        webhookResponseContent.innerHTML = '<p>Waiting for response from the AI...</p>';

        // Set up polling interval (every 5 seconds)
        pollingInterval = setInterval(async () => {
            try {
                // In a real implementation, this would make an API call to check for responses
                // For this demo, we'll simulate receiving responses
                await checkForWebhookResponses(requestId);
            } catch (error) {
                console.error('Error polling for webhook responses:', error);
            }
        }, 5000);

        // Stop polling after 2 minutes (to prevent indefinite polling)
        setTimeout(() => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
                pollingInterval = null;
                console.log('Stopped polling for webhook responses after timeout');
            }
        }, 120000);
    }

    /**
     * Check for webhook responses
     * @param {string} requestId - The request ID to check for
     */
    async function checkForWebhookResponses(requestId) {
        try {
            // Make an API call to check for responses
            const response = await fetch(`/api/webhook-responses/${requestId}`);

            if (response.ok) {
                const data = await response.json();

                // Check if we have new responses
                if (data.length > webhookResponses.length) {
                    console.log(`Received ${data.length - webhookResponses.length} new webhook responses`);

                    // Replace our responses array with the new data
                    webhookResponses = data;

                    // Update the display
                    updateWebhookResponseDisplay();
                }
            } else {
                console.error(`Error fetching webhook responses: ${response.status}`);
            }
        } catch (error) {
            console.error('Error checking for webhook responses:', error);
        }

        // If we still don't have any responses after 30 seconds, show a fallback message
        if (webhookResponses.length === 0 && Date.now() - parseInt(requestId.split('').slice(0, 8).join(''), 36) > 30000) {
            const fallbackResponse = {
                requestId: requestId,
                timestamp: new Date().toISOString(),
                content: "I'm still processing your question. Please check back in a few moments for a detailed response.",
                source: "AI Legal Assistant"
            };

            addWebhookResponse(fallbackResponse);
        }
    }

    /**
     * Add a webhook response to the display
     * @param {Object} response - The webhook response
     */
    function addWebhookResponse(response) {
        // Add to our responses array
        webhookResponses.push(response);

        // Update the display
        updateWebhookResponseDisplay();
    }

    /**
     * Update the webhook response display
     */
    function updateWebhookResponseDisplay() {
        if (webhookResponses.length === 0) {
            webhookResponseContent.innerHTML = '<p>No responses received yet.</p>';
            return;
        }

        // Clear existing content
        webhookResponseContent.innerHTML = '';

        // Add each response
        webhookResponses.forEach(response => {
            const responseItem = document.createElement('div');
            responseItem.className = 'response-item';

            const timestamp = new Date(response.timestamp);
            const formattedTime = timestamp.toLocaleTimeString() + ' ' + timestamp.toLocaleDateString();

            responseItem.innerHTML = `
                <div class="timestamp">${formattedTime} - ${response.source || 'Unknown'}</div>
                <div class="content">${response.content}</div>
            `;

            webhookResponseContent.appendChild(responseItem);
        });

        // Scroll to the bottom to show the latest response
        webhookResponseContent.scrollTop = webhookResponseContent.scrollHeight;
    }

    // Add all countries to the dropdown
    function populateCountries() {
        const countries = [
            "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", 
            "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", 
            "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Côte d'Ivoire", "Cabo Verde", 
            "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", 
            "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", 
            "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", 
            "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", 
            "Guinea-Bissau", "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", 
            "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", 
            "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", 
            "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", 
            "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", 
            "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", 
            "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", 
            "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", 
            "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", 
            "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", 
            "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", 
            "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", 
            "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
        ];

        // Get the select element
        const countrySelect = document.getElementById('country');

        // Clear existing options except the first one (placeholder)
        while (countrySelect.options.length > 1) {
            countrySelect.remove(1);
        }

        // Add all countries to the dropdown
        countries.forEach(countryName => {
            const option = document.createElement('option');
            option.value = countryName;
            option.textContent = countryName;
            countrySelect.appendChild(option);
        });

        // Log the number of countries added to the dropdown
        console.log(`Total countries added to dropdown: ${countrySelect.options.length - 1}`);

        // Set the size attribute to show more options at once (showing all would be too large)
        countrySelect.size = 10;

        // Add keyboard navigation for quick country selection
        countrySelect.addEventListener('keydown', function(event) {
            // Only process if it's a single letter key
            if (event.key.length === 1 && /[a-zA-Z]/.test(event.key)) {
                const letter = event.key.toUpperCase();

                // Find the first option that starts with the pressed letter
                for (let i = 0; i < countrySelect.options.length; i++) {
                    const option = countrySelect.options[i];
                    if (option.text.toUpperCase().startsWith(letter)) {
                        // Select this option
                        countrySelect.selectedIndex = i;

                        // Ensure the selected option is visible in the scrollable area
                        const optionTop = i * option.offsetHeight;
                        countrySelect.scrollTop = optionTop;

                        // Prevent default behavior to avoid typing the letter in other inputs
                        event.preventDefault();
                        break;
                    }
                }
            }
        });
    }
});
