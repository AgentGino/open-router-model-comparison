// OpenRouter AI Model Comparison App
class OpenRouterApp {
    constructor() {
        this.apiKey = '';
        this.models = [];
        this.selectedModels = new Set();
        this.isLoading = false;
        
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        // DOM elements
        this.apiKeyInput = document.getElementById('apiKey');
        this.loadModelsBtn = document.getElementById('loadModels');
        
        // New dropdown elements
        this.modelDropdownHeader = document.getElementById('modelDropdownHeader');
        this.modelSearchInput = document.getElementById('modelSearchInput');
        this.selectedModelsDisplay = document.getElementById('selectedModelsDisplay');
        this.modelDropdownOptions = document.getElementById('modelDropdownOptions');
        this.modelOptionsContainer = document.getElementById('modelOptionsContainer');
        this.selectAllDropdown = document.getElementById('selectAllDropdown');
        this.clearAllDropdown = document.getElementById('clearAllDropdown');
        
        this.selectedModelsCount = document.getElementById('selectedModelsCount');
        this.promptInput = document.getElementById('promptInput');
        this.streamingCheckbox = document.getElementById('streaming');
        this.sendPromptBtn = document.getElementById('sendPrompt');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.resultsSection = document.getElementById('resultsSection');
        this.responseGrid = document.getElementById('responseGrid');
        this.errorMessage = document.getElementById('errorMessage');
        
        // Dropdown state
        this.isDropdownOpen = false;
        this.filteredModels = [];
    }

    attachEventListeners() {
        this.loadModelsBtn.addEventListener('click', () => this.loadModels());
        
        // Dropdown event listeners
        this.modelSearchInput.addEventListener('click', () => this.toggleDropdown(true));
        this.modelSearchInput.addEventListener('input', (e) => this.filterModels(e.target.value));
        this.modelSearchInput.addEventListener('focus', () => this.toggleDropdown(true));
        
        this.selectAllDropdown.addEventListener('click', () => this.selectAllModels());
        this.clearAllDropdown.addEventListener('click', () => this.clearAllModels());
        
        this.sendPromptBtn.addEventListener('click', () => this.sendPrompt());
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.modelDropdownHeader.contains(e.target) && !this.modelDropdownOptions.contains(e.target)) {
                this.toggleDropdown(false);
            }
        });
        
        // Enable/disable send button based on selections
        this.promptInput.addEventListener('input', () => this.updateSendButtonState());
        
        // Load API key from localStorage if exists and auto-load models
        const savedApiKey = localStorage.getItem('openrouter_api_key');
        if (savedApiKey) {
            this.apiKeyInput.value = savedApiKey;
            // Auto-load models after a short delay
            setTimeout(() => this.loadModels(), 500);
        }
    }

    async loadModels() {
        const apiKey = this.apiKeyInput.value.trim();
        if (!apiKey) {
            this.showError('Please enter your OpenRouter API key');
            return;
        }

        this.apiKey = apiKey;
        localStorage.setItem('openrouter_api_key', apiKey);
        
        this.setLoading(true);
        this.loadModelsBtn.disabled = true;
        this.loadModelsBtn.textContent = 'Loading...';
        
        // Show loading state in dropdown
        this.modelOptionsContainer.innerHTML = '<div class="model-dropdown-loading">Loading models...</div>';

        try {
            const response = await fetch('https://openrouter.ai/api/v1/models', {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'AI Model Comparison'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.models = data.data || [];
            this.renderModels();
            this.hideError();
            
            console.log(`Loaded ${this.models.length} models`);
            
        } catch (error) {
            console.error('Error loading models:', error);
            this.showError('Failed to load models. Please check your API key and try again.');
            this.modelOptionsContainer.innerHTML = '<div class="no-models-message">Failed to load models</div>';
        } finally {
            this.setLoading(false);
            this.loadModelsBtn.disabled = false;
            this.loadModelsBtn.textContent = 'Load Models';
        }
    }

    renderModels() {
        if (this.models.length === 0) {
            this.modelOptionsContainer.innerHTML = '<div class="no-models-message">No models available</div>';
            return;
        }

        this.filteredModels = [...this.models];
        this.renderFilteredModels();
    }
    
    renderFilteredModels() {
        this.modelOptionsContainer.innerHTML = this.filteredModels.map(model => `
            <div class="model-option" data-model-id="${model.id}">
                <div class="model-option-checkbox"></div>
                <div class="model-option-info">
                    <div class="model-option-name">${this.escapeHtml(model.name || model.id)}</div>
                    <div class="model-option-provider">${this.escapeHtml(this.getModelProvider(model.id))}</div>
                </div>
            </div>
        `).join('');

        // Add event listeners to options
        this.modelOptionsContainer.querySelectorAll('.model-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                const modelId = option.getAttribute('data-model-id');
                const isSelected = this.selectedModels.has(modelId);
                this.toggleModel(modelId, !isSelected);
            });
        });
        
        // Update visual state for already selected models
        this.selectedModels.forEach(modelId => {
            this.updateModelOptionState(modelId, true);
        });
    }
    
    toggleDropdown(open) {
        this.isDropdownOpen = open;
        const container = this.modelDropdownHeader.closest('.model-dropdown-container');
        
        if (open) {
            container.classList.add('open');
            this.modelDropdownOptions.classList.remove('hidden');
            if (this.filteredModels.length === 0 && this.models.length > 0) {
                this.renderFilteredModels();
            }
        } else {
            container.classList.remove('open');
            this.modelDropdownOptions.classList.add('hidden');
            this.modelSearchInput.value = '';
            this.filteredModels = [...this.models];
        }
    }
    
    filterModels(searchTerm) {
        if (!searchTerm.trim()) {
            this.filteredModels = [...this.models];
        } else {
            const term = searchTerm.toLowerCase();
            this.filteredModels = this.models.filter(model => {
                const name = (model.name || model.id).toLowerCase();
                const provider = this.getModelProvider(model.id).toLowerCase();
                const id = model.id.toLowerCase();
                return name.includes(term) || provider.includes(term) || id.includes(term);
            });
        }
        this.renderFilteredModels();
    }

    getModelProvider(modelId) {
        if (modelId.includes('gpt')) return 'OpenAI';
        if (modelId.includes('claude')) return 'Anthropic';
        if (modelId.includes('gemini')) return 'Google';
        if (modelId.includes('llama')) return 'Meta';
        if (modelId.includes('mistral')) return 'Mistral';
        if (modelId.includes('cohere')) return 'Cohere';
        return 'Various';
    }

    toggleModel(modelId, selected) {
        if (selected) {
            this.selectedModels.add(modelId);
        } else {
            this.selectedModels.delete(modelId);
        }
        
        this.updateModelOptionState(modelId, selected);
        this.updateSelectedModelsDisplay();
        this.updateSelectedCount();
        this.updateSendButtonState();
    }

    updateModelOptionState(modelId, selected) {
        const option = this.modelOptionsContainer.querySelector(`[data-model-id="${modelId}"]`);
        if (option) {
            option.classList.toggle('selected', selected);
        }
    }
    
    updateSelectedModelsDisplay() {
        if (this.selectedModels.size === 0) {
            this.selectedModelsDisplay.classList.add('hidden');
            return;
        }
        
        this.selectedModelsDisplay.classList.remove('hidden');
        
        const selectedArray = Array.from(this.selectedModels);
        this.selectedModelsDisplay.innerHTML = selectedArray.map(modelId => {
            const model = this.models.find(m => m.id === modelId);
            const displayName = model?.name || modelId;
            const safeModelId = modelId.replace(/'/g, "\\'");
            
            return `
                <div class="selected-model-chip">
                    <span class="model-name" title="${this.escapeHtml(displayName)}">
                        ${this.escapeHtml(displayName.length > 25 ? displayName.substring(0, 25) + '...' : displayName)}
                    </span>
                    <span class="remove-chip" onclick="app.removeSelectedModel('${safeModelId}')">×</span>
                </div>
            `;
        }).join('');
    }
    
    removeSelectedModel(modelId) {
        this.toggleModel(modelId, false);
    }

    selectAllModels() {
        // Select all filtered models (what's currently visible in search)
        this.filteredModels.forEach(model => {
            this.selectedModels.add(model.id);
            this.updateModelOptionState(model.id, true);
        });
        
        this.updateSelectedModelsDisplay();
        this.updateSelectedCount();
        this.updateSendButtonState();
    }

    clearAllModels() {
        // Clear all selected models
        this.filteredModels.forEach(model => {
            this.selectedModels.delete(model.id);
            this.updateModelOptionState(model.id, false);
        });
        
        this.updateSelectedModelsDisplay();
        this.updateSelectedCount();
        this.updateSendButtonState();
    }

    updateSelectedCount() {
        const count = this.selectedModels.size;
        this.selectedModelsCount.textContent = count === 0 
            ? 'No models selected' 
            : `${count} model${count > 1 ? 's' : ''} selected`;
    }

    updateSendButtonState() {
        const hasPrompt = this.promptInput.value.trim().length > 0;
        const hasModels = this.selectedModels.size > 0;
        this.sendPromptBtn.disabled = !hasPrompt || !hasModels || this.isLoading;
    }

    async sendPrompt() {
        const prompt = this.promptInput.value.trim();
        if (!prompt || this.selectedModels.size === 0) {
            console.warn('Cannot send prompt: missing prompt or no models selected');
            return;
        }

        console.log('Starting prompt submission:', {
            prompt: prompt.substring(0, 100) + '...',
            selectedModels: Array.from(this.selectedModels),
            streaming: this.streamingCheckbox.checked
        });

        this.setLoading(true);
        this.showResults();
        this.renderLoadingResponses();

        try {
            const responses = await this.processModels(prompt);
            this.renderResponses(responses);
            console.log('All responses completed:', responses);
        } catch (error) {
            console.error('Error in sendPrompt:', error);
            this.showError('An error occurred while processing the requests: ' + error.message);
        } finally {
            this.setLoading(false);
        }
    }

    async processModels(prompt) {
        const responses = [];
        const isStreaming = this.streamingCheckbox.checked;
        const modelArray = Array.from(this.selectedModels);
        
        console.log(`Processing ${modelArray.length} models:`, modelArray);

        // Process models in parallel for better performance
        const promises = modelArray.map(async (modelId) => {
            try {
                console.log(`Starting request for model: ${modelId}`);
                const startTime = Date.now();
                let response;
                
                if (isStreaming) {
                    response = await this.sendStreamingRequest(modelId, prompt);
                } else {
                    response = await this.sendRegularRequest(modelId, prompt);
                }
                
                const endTime = Date.now();
                const duration = endTime - startTime;
                
                console.log(`Received response from ${modelId}:`, response);

                const responseData = {
                    modelId,
                    success: true,
                    content: response.content,
                    duration,
                    tokensUsed: response.tokensUsed
                };
                
                responses.push(responseData);
                
                // Update response in real-time
                this.updateResponseCard(modelId, responseData);
                
                return responseData;
                
            } catch (error) {
                console.error(`Error with model ${modelId}:`, error);
                const errorData = {
                    modelId,
                    success: false,
                    error: error.message,
                    duration: 0
                };
                
                responses.push(errorData);
                
                // Update response in real-time
                this.updateResponseCard(modelId, errorData);
                
                return errorData;
            }
        });
        
        // Wait for all requests to complete
        await Promise.allSettled(promises);
        console.log('All model requests completed:', responses);

        return responses;
    }

    async sendRegularRequest(modelId, prompt) {
        console.log(`Sending request to model: ${modelId}`);
        
        const requestBody = {
            model: modelId,
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 1000,
            temperature: 0.7
        };
        
        console.log('Request body:', requestBody);
        
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'AI Model Comparison',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log(`Response status for ${modelId}:`, response.status);
        
        if (!response.ok) {
            let errorMessage;
            try {
                const errorData = await response.json();
                console.error(`Error response for ${modelId}:`, errorData);
                errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
            } catch (e) {
                errorMessage = `HTTP ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log(`Response data for ${modelId}:`, data);
        
        // Handle different response structures
        let content = 'No response generated';
        let tokensUsed = 0;
        
        if (data.choices && data.choices.length > 0) {
            const choice = data.choices[0];
            content = choice.message?.content || choice.text || 'No content in response';
        }
        
        if (data.usage) {
            tokensUsed = data.usage.total_tokens || data.usage.prompt_tokens + data.usage.completion_tokens || 0;
        }
        
        console.log(`Parsed response for ${modelId}:`, { content, tokensUsed });
        
        return {
            content: content,
            tokensUsed: tokensUsed
        };
    }

    async sendStreamingRequest(modelId, prompt) {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'AI Model Comparison',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: modelId,
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7,
                stream: true
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `HTTP ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let content = '';
        let tokensUsed = 0;

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);
                            const delta = parsed.choices[0]?.delta?.content;
                            if (delta) {
                                content += delta;
                                // Update streaming content in real-time
                                this.updateStreamingContent(modelId, content);
                            }
                            if (parsed.usage?.total_tokens) {
                                tokensUsed = parsed.usage.total_tokens;
                            }
                        } catch (e) {
                            // Ignore parsing errors for streaming data
                        }
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }

        return { content: content || 'No response generated', tokensUsed };
    }

    renderLoadingResponses() {
        const modelArray = Array.from(this.selectedModels);
        console.log('Rendering loading responses for models:', modelArray);
        
        this.responseGrid.className = `grid gap-6 ${this.getGridClass(modelArray.length)}`;
        
        this.responseGrid.innerHTML = modelArray.map(modelId => {
            const model = this.models.find(m => m.id === modelId);
            return `
                <div class="response-card loading-response" data-model-id="${modelId}">
                    <div class="model-header">
                        <div class="model-title">${this.escapeHtml(model?.name || modelId)}</div>
                        <div class="model-subtitle">${this.escapeHtml(this.getModelProvider(modelId))}</div>
                    </div>
                    <div class="response-content">
                        <div class="flex items-center">
                            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            Generating response...
                        </div>
                    </div>
                    <div class="response-footer">
                        <span>Processing...</span>
                    </div>
                </div>
            `;
        }).join('');
        
        console.log('Loading response cards created:', this.responseGrid.children.length);
    }

    updateResponseCard(modelId, response) {
        console.log(`Updating response card for ${modelId}:`, response);
        
        // Use a more robust way to find the card
        let card = null;
        const allCards = document.querySelectorAll('.response-card');
        for (const cardElement of allCards) {
            if (cardElement.getAttribute('data-model-id') === modelId) {
                card = cardElement;
                break;
            }
        }
        
        if (!card) {
            console.error(`Card not found for model: ${modelId}`);
            console.log('Available model IDs:', Array.from(allCards).map(c => c.getAttribute('data-model-id')));
            console.log('Looking for model ID:', modelId);
            return;
        }

        console.log('Found card element:', card);
        const model = this.models.find(m => m.id === modelId);
        const isSuccess = response.success;
        
        // Force remove loading class and add appropriate class
        card.classList.remove('loading-response');
        card.className = `response-card ${isSuccess ? 'success-response' : 'error-response'}`;
        
        console.log('Updated card className:', card.className);
        
        // For content, we want to preserve line breaks and formatting
        const contentText = isSuccess 
            ? (response.content || 'No response generated')
            : `Error: ${response.error || 'Unknown error'}`;
        
        console.log('Content to display:', contentText.substring(0, 100) + '...');
        
        // Create safe model ID for onclick handler
        const safeModelId = modelId.replace(/'/g, "\\'");
        
        // Update the card structure
        card.innerHTML = `
            <div class="model-header">
                <div class="model-title">${this.escapeHtml(model?.name || modelId)}</div>
                <div class="model-subtitle">${this.escapeHtml(this.getModelProvider(modelId))}</div>
            </div>
            <div class="response-content"></div>
            <div class="response-footer">
                <span>${response.duration || 0}ms</span>
                ${isSuccess ? `<span>${response.tokensUsed || 0} tokens</span>` : ''}
                <button class="copy-button" onclick="copyToClipboard('${safeModelId}')">Copy</button>
            </div>
        `;
        
        // Set the content separately using textContent to preserve formatting
        const contentElement = card.querySelector('.response-content');
        if (contentElement) {
            contentElement.textContent = contentText;
            console.log('Content element updated with text');
        } else {
            console.error('Could not find response-content element after innerHTML update');
        }
        
        // Force a repaint
        card.offsetHeight;
        
        console.log(`Successfully updated card for ${modelId}`);
        console.log('Final card HTML:', card.outerHTML.substring(0, 200) + '...');
    }

    updateStreamingContent(modelId, content) {
        // Use the same robust card finding approach
        let card = null;
        const allCards = document.querySelectorAll('.response-card');
        for (const cardElement of allCards) {
            if (cardElement.getAttribute('data-model-id') === modelId) {
                card = cardElement;
                break;
            }
        }
        
        if (!card) {
            console.warn(`Card not found for streaming update: ${modelId}`);
            return;
        }

        const contentElement = card.querySelector('.response-content');
        if (contentElement) {
            // Use textContent to safely handle any special characters
            contentElement.textContent = content || 'Generating response...';
            contentElement.scrollTop = contentElement.scrollHeight;
            console.log(`Streaming content updated for ${modelId}:`, content.substring(0, 50) + '...');
        } else {
            console.warn(`Content element not found for streaming update: ${modelId}`);
        }
    }

    getGridClass(count) {
        if (count >= 4) return 'response-grid-4';
        if (count >= 3) return 'response-grid-3';
        if (count >= 2) return 'response-grid-2';
        return '';
    }

    renderResponses(responses) {
        // Response cards are already updated in real-time during processing
        // This method can be used for any final cleanup if needed
    }

    showResults() {
        this.resultsSection.classList.remove('hidden');
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    setLoading(loading) {
        this.isLoading = loading;
        this.loadingIndicator.classList.toggle('hidden', !loading);
        this.updateSendButtonState();
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.remove('hidden');
        setTimeout(() => this.hideError(), 5000);
    }

    hideError() {
        this.errorMessage.classList.add('hidden');
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }
    
    // Helper method to escape HTML characters
    escapeHtml(text) {
        if (typeof text !== 'string') return String(text);
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global function for copy functionality
function copyToClipboard(modelId) {
    const card = document.querySelector(`[data-model-id="${modelId}"]`);
    if (!card) return;

    const content = card.querySelector('.response-content').textContent;
    navigator.clipboard.writeText(content).then(() => {
        const button = card.querySelector('.copy-button');
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.classList.add('copied');
        
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

// Initialize the app when DOM is loaded
let app; // Global app instance
document.addEventListener('DOMContentLoaded', () => {
    app = new OpenRouterApp();
});