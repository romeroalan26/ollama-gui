class ChatApp {
    constructor() {
        this.initializeElements();
        this.initializeState();
        this.initializeEventListeners();
        this.loadSettings();
        this.initializeElectron();
        this.setupAutoResize();
        this.setupTheme();

        // Verificar estado inicial del modelo
        setTimeout(() => {
            this.checkModelStatus(this.settings.model);
        }, 1000);
    }

    initializeElements() {
        // Elementos principales
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.status = document.getElementById('status');
        this.modelSelect = document.getElementById('modelSelect');
        this.apiUrl = document.getElementById('apiUrl');
        this.currentModel = document.getElementById('currentModel');

        // Sidebar
        this.sidebar = document.querySelector('.sidebar');
        this.toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.clearBtn = document.getElementById('clearBtn');

        // Modal
        this.settingsModal = document.getElementById('settingsModal');
        this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
        this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
        this.cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
        this.themeSelect = document.getElementById('themeSelect');
        this.autoScroll = document.getElementById('autoScroll');
        this.markdownEnabled = document.getElementById('markdownEnabled');

        // Loading
        this.loadingOverlay = document.getElementById('loadingOverlay');

        // Búsqueda de modelos
        this.modelSearch = document.getElementById('modelSearch');
        this.modalModelSearch = document.getElementById('modalModelSearch');

        // Verificación de modelo
        this.checkModelBtn = document.getElementById('checkModelBtn');

        // Sugerencias
        this.suggestionBtns = document.querySelectorAll('.suggestion-btn');
    }

    initializeState() {
        this.isLoading = false;
        this.conversationHistory = [];
        this.isElectron = typeof window.electronAPI !== 'undefined';
        this.settings = {
            theme: 'dark',
            autoScroll: true,
            markdownEnabled: true,
            apiUrl: 'http://localhost:11434',
            model: 'llama3:8b'
        };
    }

    initializeEventListeners() {
        // Envío de mensajes
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // Sidebar
        this.toggleSidebarBtn.addEventListener('click', () => this.toggleSidebar());
        this.newChatBtn.addEventListener('click', () => this.newChat());
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.exportBtn.addEventListener('click', () => this.exportChat());
        this.clearBtn.addEventListener('click', () => this.clearChat());

        // Modal
        this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        this.cancelSettingsBtn.addEventListener('click', () => this.closeSettings());
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) this.closeSettings();
        });

        // Cambios de configuración
        this.modelSelect.addEventListener('change', () => {
            this.updateModel();
            this.clearSearch();
        });
        this.modalModelSelect = document.getElementById('modalModelSelect');
        this.modalModelSelect.addEventListener('change', () => {
            this.updateModelFromModal();
            this.clearSearch();
        });
        this.themeSelect.addEventListener('change', () => this.changeTheme());

        // Verificar modelo cuando cambia la URL del API
        this.apiUrl.addEventListener('change', () => {
            setTimeout(() => {
                this.checkModelStatus(this.settings.model);
            }, 500);
        });

        // Búsqueda de modelos
        this.modelSearch.addEventListener('input', () => this.filterModels(this.modelSearch, this.modelSelect));
        this.modalModelSearch.addEventListener('input', () => this.filterModels(this.modalModelSearch, this.modalModelSelect));

        // Verificación de modelo
        this.checkModelBtn.addEventListener('click', () => this.checkModelStatus(this.settings.model));

        // Cerrar dropdown cuando se hace clic fuera
        document.addEventListener('click', (e) => {
            // Solo cerrar si se hace clic en algo que no sea el selector o el modal
            if (!e.target.closest('.model-selector') && !e.target.closest('.setting-group')) {
                this.closeDropdowns();
            }
        });

        // Manejar el foco del campo de búsqueda
        [this.modelSearch, this.modalModelSearch].forEach(searchInput => {
            if (searchInput) {
                searchInput.addEventListener('focus', () => {
                    // Si hay texto en la búsqueda, expandir el dropdown
                    if (searchInput.value.trim()) {
                        const selectElement = searchInput === this.modelSearch ? this.modelSelect : this.modalModelSelect;
                        selectElement.size = Math.min(8, this.countVisibleOptions(selectElement, searchInput.value));
                    }
                });

                searchInput.addEventListener('blur', () => {
                    // Pequeño delay para permitir clics en el dropdown
                    setTimeout(() => {
                        if (!document.activeElement || !document.activeElement.closest('select')) {
                            this.closeDropdowns();
                        }
                    }, 150);
                });
            }
        });

        // Sugerencias
        this.suggestionBtns.forEach(btn => {
            btn.addEventListener('click', () => this.handleSuggestion(btn.textContent));
        });

        // Cerrar modal con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.settingsModal.classList.contains('show')) {
                this.closeSettings();
            }

            // Limpiar búsqueda con Escape si está activa
            if (e.key === 'Escape' && (this.modelSearch.value || this.modalModelSearch.value)) {
                e.preventDefault();
                this.clearSearch();
                if (this.modelSearch) this.modelSearch.focus();
                if (this.modalModelSearch) this.modalModelSearch.focus();
            }

            // Atajo Ctrl/Cmd + F para buscar modelos
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                if (this.settingsModal.classList.contains('show')) {
                    this.modalModelSearch.focus();
                } else {
                    this.modelSearch.focus();
                }
            }
        });
    }

    setupAutoResize() {
        this.messageInput.addEventListener('input', () => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
        });
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.themeSelect.value = savedTheme;
        this.changeTheme();
    }

    changeTheme() {
        const theme = this.themeSelect.value;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.settings.theme = theme;
    }

    toggleSidebar() {
        this.sidebar.classList.toggle('show');
    }

    newChat() {
        if (this.conversationHistory.length > 0) {
            if (confirm('¿Estás seguro de que quieres iniciar un nuevo chat? Se perderá la conversación actual.')) {
                this.clearChat();
            }
        }
    }

    openSettings() {
        this.settingsModal.classList.add('show');
        this.toggleSidebar(); // Cerrar sidebar en móvil
    }

    closeSettings() {
        this.settingsModal.classList.remove('show');
    }

    async saveSettings() {
        this.settings.apiUrl = this.apiUrl.value;
        this.settings.model = this.modelSelect.value;
        this.settings.theme = this.themeSelect.value;
        this.settings.autoScroll = this.autoScroll.checked;
        this.settings.markdownEnabled = this.markdownEnabled.checked;

        if (this.isElectron) {
            try {
                await window.electronAPI.saveSettings(this.settings);
            } catch (error) {
                console.error('Error al guardar configuración en Electron:', error);
            }
        } else {
            localStorage.setItem('ollamaChatSettings', JSON.stringify(this.settings));
        }

        this.updateModel();
        this.closeSettings();
        this.showStatus('Configuración guardada', 'success');
    }

    updateModel() {
        const model = this.modelSelect.value;
        this.currentModel.textContent = model;
        this.settings.model = model;
        // Sincronizar con el modal
        if (this.modalModelSelect) {
            this.modalModelSelect.value = model;
        }
        // Verificar si el modelo está disponible
        this.checkModelStatus(model);
    }

    updateModelFromModal() {
        const model = this.modalModelSelect.value;
        this.currentModel.textContent = model;
        this.settings.model = model;
        // Sincronizar con el sidebar
        this.modelSelect.value = model;
        // Verificar si el modelo está disponible
        this.checkModelStatus(model);
    }

    filterModels(searchInput, selectElement) {
        const searchTerm = searchInput.value.toLowerCase();
        const options = selectElement.querySelectorAll('option');
        const optgroups = selectElement.querySelectorAll('optgroup');

        // Abrir el dropdown automáticamente cuando se busca
        if (searchTerm) {
            selectElement.size = Math.min(8, this.countVisibleOptions(selectElement, searchTerm));
        } else {
            selectElement.size = 1; // Volver al tamaño normal
        }

        // Ocultar/mostrar optgroups basado en si tienen opciones visibles
        optgroups.forEach(optgroup => {
            const groupOptions = optgroup.querySelectorAll('option');
            const hasVisibleOptions = Array.from(groupOptions).some(option => {
                const text = option.textContent.toLowerCase();
                const matches = text.includes(searchTerm);
                option.style.display = matches ? '' : 'none';
                return matches;
            });
            optgroup.style.display = hasVisibleOptions ? '' : 'none';
        });

        // Si no hay término de búsqueda, mostrar todo
        if (!searchTerm) {
            optgroups.forEach(optgroup => {
                optgroup.style.display = '';
                const groupOptions = optgroup.querySelectorAll('option');
                groupOptions.forEach(option => {
                    option.style.display = '';
                });
            });
        }

        // Mostrar mensaje si no hay resultados o indicador de resultados
        this.showNoResultsMessage(selectElement, searchTerm, options);
        this.showResultsCount(selectElement, searchTerm, options);
    }

    countVisibleOptions(selectElement, searchTerm) {
        const options = selectElement.querySelectorAll('option');
        return Array.from(options).filter(option => {
            const text = option.textContent.toLowerCase();
            return text.includes(searchTerm);
        }).length;
    }

    closeDropdowns() {
        // Cerrar todos los dropdowns
        [this.modelSelect, this.modalModelSelect].forEach(select => {
            if (select) {
                select.size = 1;
            }
        });

        // Restaurar visibilidad de todas las opciones
        [this.modelSelect, this.modalModelSelect].forEach(select => {
            if (select) {
                const optgroups = select.querySelectorAll('optgroup');
                const options = select.querySelectorAll('option');

                optgroups.forEach(optgroup => {
                    optgroup.style.display = '';
                });

                options.forEach(option => {
                    option.style.display = '';
                });
            }
        });

        // Remover mensajes de "no resultados" y contadores
        document.querySelectorAll('.no-results, .results-count').forEach(msg => msg.remove());
    }

    clearSearch() {
        // Limpiar búsquedas
        if (this.modelSearch) this.modelSearch.value = '';
        if (this.modalModelSearch) this.modalModelSearch.value = '';

        // Cerrar dropdowns
        this.closeDropdowns();
    }

    async checkModelStatus(modelName) {
        const statusDot = document.querySelector('.status-dot');
        const currentModelSpan = document.getElementById('currentModel');

        // Mostrar estado de verificación
        statusDot.style.backgroundColor = '#fbbf24'; // Amarillo - verificando
        statusDot.style.animation = 'pulse 1s infinite';

        // Animar el botón de verificación
        if (this.checkModelBtn) {
            this.checkModelBtn.classList.add('loading');
        }

        try {
            // Verificar si Ollama está ejecutándose
            const response = await fetch(`${this.apiUrl.value}/api/tags`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const models = data.models || [];

            // Buscar el modelo específico
            const modelExists = models.some(model => model.name === modelName);

            if (modelExists) {
                // Modelo disponible
                statusDot.style.backgroundColor = '#10b981'; // Verde - disponible
                statusDot.style.animation = 'pulse 2s infinite';
                this.showStatus(`Modelo ${modelName} disponible`, 'success');
            } else {
                // Modelo no disponible
                statusDot.style.backgroundColor = '#ef4444'; // Rojo - no disponible
                statusDot.style.animation = 'none';
                this.showStatus(`Modelo ${modelName} no encontrado. Ejecuta: ollama pull ${modelName}`, 'error');
            }

        } catch (error) {
            // Error de conexión
            statusDot.style.backgroundColor = '#ef4444'; // Rojo - error
            statusDot.style.animation = 'none';
            this.showStatus(`Error de conexión con Ollama: ${error.message}`, 'error');
            console.error('Error al verificar modelo:', error);
        } finally {
            // Detener animación del botón
            if (this.checkModelBtn) {
                this.checkModelBtn.classList.remove('loading');
            }
        }
    }

    showNoResultsMessage(selectElement, searchTerm, options) {
        // Remover mensaje anterior si existe
        const existingMessage = selectElement.parentNode.querySelector('.no-results');
        if (existingMessage) {
            existingMessage.remove();
        }

        if (searchTerm) {
            const visibleOptions = Array.from(options).filter(option =>
                option.style.display !== 'none' && option.textContent.toLowerCase().includes(searchTerm)
            );

            if (visibleOptions.length === 0) {
                const message = document.createElement('div');
                message.className = 'no-results';
                message.textContent = `No se encontraron modelos que coincidan con "${searchTerm}"`;
                message.style.cssText = `
                    color: var(--text-muted);
                    font-size: 0.875rem;
                    padding: var(--spacing-sm);
                    text-align: center;
                    font-style: italic;
                `;
                selectElement.parentNode.appendChild(message);
            }
        }
    }

    getModelDisplayName(modelName) {
        // Mapeo de nombres de modelos a nombres de visualización más amigables
        const modelDisplayNames = {
            // Llama 3
            'llama3:8b': 'Llama 3 (8B)',
            'llama3:70b': 'Llama 3 (70B)',
            'llama3:8b-instruct': 'Llama 3 Instruct (8B)',
            'llama3:70b-instruct': 'Llama 3 Instruct (70B)',

            // Mistral
            'mistral:7b': 'Mistral (7B)',
            'mistral:7b-instruct': 'Mistral Instruct (7B)',
            'mistral:7b-openorca': 'Mistral OpenOrca (7B)',
            'mixtral:8x7b': 'Mixtral (8x7B)',
            'mixtral:8x7b-instruct': 'Mixtral Instruct (8x7B)',

            // Code Llama
            'codellama:7b': 'Code Llama (7B)',
            'codellama:7b-instruct': 'Code Llama Instruct (7B)',
            'codellama:7b-python': 'Code Llama Python (7B)',
            'codellama:13b': 'Code Llama (13B)',
            'codellama:13b-instruct': 'Code Llama Instruct (13B)',
            'codellama:34b': 'Code Llama (34B)',
            'codellama:34b-instruct': 'Code Llama Instruct (34B)',

            // Neural Chat
            'neural-chat:7b': 'Neural Chat (7B)',
            'neural-chat:7b-v3': 'Neural Chat v3 (7B)',

            // Phi
            'phi:2.7b': 'Phi (2.7B)',
            'phi:3.5': 'Phi (3.5)',
            'phi:3.5-mini': 'Phi Mini (3.5)',

            // Gemma
            'gemma:2b': 'Gemma (2B)',
            'gemma:7b': 'Gemma (7B)',
            'gemma:2b-it': 'Gemma Instruct (2B)',
            'gemma:7b-it': 'Gemma Instruct (7B)',

            // Qwen
            'qwen:7b': 'Qwen (7B)',
            'qwen:7b-chat': 'Qwen Chat (7B)',
            'qwen:14b': 'Qwen (14B)',
            'qwen:14b-chat': 'Qwen Chat (14B)',

            // Yi
            'yi:6b': 'Yi (6B)',
            'yi:6b-chat': 'Yi Chat (6B)',
            'yi:34b': 'Yi (34B)',
            'yi:34b-chat': 'Yi Chat (34B)',

            // Especializados
            'gpt-oss:20b': 'GPT-OSS (20B)',
            'orca-mini:3b': 'Orca Mini (3B)',
            'orca-mini:7b': 'Orca Mini (7B)',
            'llama2:7b': 'Llama 2 (7B)',
            'llama2:7b-chat': 'Llama 2 Chat (7B)',
            'llama2:13b': 'Llama 2 (13B)',
            'llama2:13b-chat': 'Llama 2 Chat (13B)'
        };

        // Si no hay un nombre específico, crear uno basado en el nombre del modelo
        if (modelDisplayNames[modelName]) {
            return modelDisplayNames[modelName];
        } else {
            // Crear un nombre amigable basado en el nombre del modelo
            const parts = modelName.split(':');
            const baseName = parts[0];
            const size = parts[1];

            // Capitalizar la primera letra y agregar el tamaño
            const displayName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
            return size ? `${displayName} (${size})` : displayName;
        }
    }

    showResultsCount(selectElement, searchTerm, options) {
        // Remover contador anterior si existe
        const existingCount = selectElement.parentNode.querySelector('.results-count');
        if (existingCount) {
            existingCount.remove();
        }

        if (searchTerm) {
            const visibleOptions = Array.from(options).filter(option =>
                option.style.display !== 'none' && option.textContent.toLowerCase().includes(searchTerm)
            );

            if (visibleOptions.length > 0) {
                const countMessage = document.createElement('div');
                countMessage.className = 'results-count';
                countMessage.textContent = `${visibleOptions.length} modelo${visibleOptions.length !== 1 ? 's' : ''} encontrado${visibleOptions.length !== 1 ? 's' : ''}`;
                countMessage.style.cssText = `
                    color: var(--text-muted);
                    font-size: 0.75rem;
                    padding: var(--spacing-xs) var(--spacing-sm);
                    text-align: right;
                    font-style: italic;
                    margin-top: var(--spacing-xs);
                `;
                selectElement.parentNode.appendChild(countMessage);
            }
        }
    }

    handleSuggestion(text) {
        this.messageInput.value = text;
        this.messageInput.focus();
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isLoading) return;

        this.isLoading = true;
        this.sendButton.disabled = true;
        this.showLoading(true);

        // Agregar mensaje del usuario
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';

        // Mostrar indicador de escritura
        this.showTypingIndicator();

        try {
            const response = await this.callOllamaAPI(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'ai');
            this.showStatus('Mensaje enviado correctamente', 'success');
        } catch (error) {
            this.hideTypingIndicator();
            this.showStatus(`Error: ${error.message}`, 'error');
            console.error('Error al enviar mensaje:', error);
        } finally {
            this.isLoading = false;
            this.sendButton.disabled = false;
            this.showLoading(false);
        }
    }

    addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        const header = document.createElement('div');
        header.className = 'message-header';

        if (type === 'user') {
            header.innerHTML = '<i class="fas fa-user"></i><span>Tú</span>';
        } else {
            const modelName = this.settings.model;
            const displayName = this.getModelDisplayName(modelName);
            header.innerHTML = `<i class="fas fa-robot"></i><span>${displayName}</span>`;
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        if (this.settings.markdownEnabled && type === 'ai') {
            contentDiv.innerHTML = this.parseMarkdown(content);
        } else {
            contentDiv.textContent = content;
        }

        messageDiv.appendChild(header);
        messageDiv.appendChild(contentDiv);

        // Remover mensaje de bienvenida si existe
        const welcomeMessage = this.chatMessages.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.remove();
        }

        this.chatMessages.appendChild(messageDiv);
        this.conversationHistory.push({
            type,
            content,
            timestamp: new Date(),
            model: type === 'ai' ? this.settings.model : null
        });

        if (this.settings.autoScroll) {
            this.scrollToBottom();
        }
    }

    parseMarkdown(text) {
        // Implementación básica de Markdown
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = this.chatMessages.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    showLoading(show) {
        if (show) {
            this.loadingOverlay.classList.add('show');
        } else {
            this.loadingOverlay.classList.remove('show');
        }
    }

    showStatus(message, type = 'info') {
        this.status.textContent = message;
        this.status.className = `status ${type}`;

        setTimeout(() => {
            this.status.textContent = '';
            this.status.className = 'status';
        }, 3000);
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    async callOllamaAPI(prompt) {
        const url = `${this.apiUrl.value}/api/generate`;
        const model = this.modelSelect.value;

        const requestBody = {
            model: model,
            prompt: prompt,
            stream: false
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
                mode: 'cors'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data.response || 'No se recibió respuesta del modelo.';
        } catch (corsError) {
            console.log('CORS falló, intentando con XMLHttpRequest...');
            return this.callOllamaAPIWithXHR(url, requestBody);
        }
    }

    callOllamaAPIWithXHR(url, requestBody) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');

            xhr.onload = function () {
                if (xhr.status === 200) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        resolve(data.response || 'No se recibió respuesta del modelo.');
                    } catch (error) {
                        reject(new Error('Error al parsear la respuesta JSON'));
                    }
                } else {
                    reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                }
            };

            xhr.onerror = function () {
                reject(new Error('Error de red al conectar con Ollama'));
            };

            xhr.send(JSON.stringify(requestBody));
        });
    }

    clearChat() {
        this.conversationHistory = [];
        this.chatMessages.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">
                    <i class="fas fa-robot"></i>
                </div>
                <h2>¡Hola! Soy tu asistente de IA local</h2>
                <p>Estoy aquí para ayudarte. ¿En qué puedo asistirte hoy?</p>
                <div class="suggestions">
                    <button class="suggestion-btn">Explícame un concepto</button>
                    <button class="suggestion-btn">Ayúdame con código</button>
                    <button class="suggestion-btn">Escribe un texto</button>
                    <button class="suggestion-btn">Resuelve un problema</button>
                </div>
            </div>
        `;

        // Re-attach event listeners to new suggestion buttons
        this.suggestionBtns = document.querySelectorAll('.suggestion-btn');
        this.suggestionBtns.forEach(btn => {
            btn.addEventListener('click', () => this.handleSuggestion(btn.textContent));
        });

        this.showStatus('Chat limpiado', 'success');
    }

    exportChat() {
        if (this.conversationHistory.length === 0) {
            this.showStatus('No hay conversación para exportar', 'error');
            return;
        }

        const exportData = {
            currentModel: this.modelSelect.value,
            timestamp: new Date().toISOString(),
            messages: this.conversationHistory.map(msg => ({
                type: msg.type,
                content: msg.content,
                timestamp: msg.timestamp,
                model: msg.model || (msg.type === 'ai' ? this.settings.model : null)
            }))
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showStatus('Chat exportado correctamente', 'success');
    }

    async loadSettings() {
        if (this.isElectron) {
            try {
                const settings = await window.electronAPI.getSettings();
                this.settings = { ...this.settings, ...settings };
            } catch (error) {
                console.error('Error al cargar configuración de Electron:', error);
                this.loadLocalSettings();
            }
        } else {
            this.loadLocalSettings();
        }

        // Aplicar configuración
        this.apiUrl.value = this.settings.apiUrl;
        this.modelSelect.value = this.settings.model;
        if (this.modalModelSelect) {
            this.modalModelSelect.value = this.settings.model;
        }
        this.themeSelect.value = this.settings.theme;
        this.autoScroll.checked = this.settings.autoScroll;
        this.markdownEnabled.checked = this.settings.markdownEnabled;

        this.updateModel();
        this.changeTheme();
    }

    loadLocalSettings() {
        const saved = localStorage.getItem('ollamaChatSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.settings = { ...this.settings, ...settings };
            } catch (error) {
                console.error('Error al cargar configuración local:', error);
            }
        }
    }

    initializeElectron() {
        if (this.isElectron) {
            // Configurar menú de Electron si es necesario
            console.log('Ejecutando en Electron');
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ChatApp();
}); 