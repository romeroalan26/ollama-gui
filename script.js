class ChatApp {
    constructor() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.status = document.getElementById('status');
        this.modelSelect = document.getElementById('modelSelect');
        this.apiUrl = document.getElementById('apiUrl');
        this.settingsModal = document.getElementById('settingsModal');
        this.openSettingsBtn = document.getElementById('openSettingsBtn');
        this.closeSettingsBtn = document.getElementById('closeSettingsBtn');

        this.isLoading = false;
        this.conversationHistory = [];
        this.isElectron = typeof window.electronAPI !== 'undefined';

        this.initializeEventListeners();
        this.loadSettings();
        this.initializeElectron();
    }

    initializeEventListeners() {
        // Enviar mensaje con botón
        this.sendButton.addEventListener('click', () => this.sendMessage());

        // Enviar mensaje con Enter (Shift+Enter para nueva línea)
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize del textarea
        this.messageInput.addEventListener('input', () => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
        });

        // Guardar configuración cuando cambie
        this.modelSelect.addEventListener('change', () => {
            this.saveSettings();
            this.updateCurrentModelHeader();
        });
        this.apiUrl.addEventListener('change', () => this.saveSettings());

        // Actualizar el header al iniciar
        this.updateCurrentModelHeader();

        // Modal de configuración
        if (this.openSettingsBtn && this.settingsModal) {
            this.openSettingsBtn.addEventListener('click', () => {
                this.settingsModal.classList.add('show');
            });
        }
        if (this.closeSettingsBtn && this.settingsModal) {
            this.closeSettingsBtn.addEventListener('click', () => {
                this.settingsModal.classList.remove('show');
            });
        }
        // Cerrar modal al hacer click fuera del contenido
        if (this.settingsModal) {
            this.settingsModal.addEventListener('click', (e) => {
                if (e.target === this.settingsModal) {
                    this.settingsModal.classList.remove('show');
                }
            });
        }
    }

    initializeElectron() {
        if (!this.isElectron) return;

        // Escuchar eventos del menú
        window.electronAPI.onNewConversation(() => {
            this.clearChat();
        });

        window.electronAPI.onExportConversation(() => {
            this.exportConversation();
        });

        window.electronAPI.onOpenSettings(() => {
            this.showSettings();
        });

        window.electronAPI.onOllamaStatus((event, status) => {
            this.handleOllamaStatus(status);
        });

        // Cargar configuración desde Electron
        this.loadElectronSettings();
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isLoading) return;

        // Agregar mensaje del usuario
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';

        // Mostrar indicador de escritura
        this.showTypingIndicator();
        this.setStatus('Enviando mensaje...');
        this.isLoading = true;
        this.sendButton.disabled = true;

        try {
            const response = await this.callOllamaAPI(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'ai');
            this.setStatus('Mensaje enviado');
        } catch (error) {
            this.hideTypingIndicator();
            this.setStatus(`Error: ${error.message}`, 'error');
            console.error('Error al enviar mensaje:', error);
        } finally {
            this.isLoading = false;
            this.sendButton.disabled = false;
            this.messageInput.focus();
        }
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
                mode: 'cors' // Intentar CORS primero
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data.response || 'No se recibió respuesta del modelo.';
        } catch (corsError) {
            // Si falla CORS, intentar con XMLHttpRequest
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
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        resolve(data.response || 'No se recibió respuesta del modelo.');
                    } catch (parseError) {
                        reject(new Error('Error al parsear la respuesta JSON'));
                    }
                } else {
                    reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
                }
            };

            xhr.onerror = function () {
                reject(new Error('Error de red al conectar con Ollama'));
            };

            xhr.ontimeout = function () {
                reject(new Error('Timeout al conectar con Ollama'));
            };

            xhr.timeout = 30000; // 30 segundos de timeout

            try {
                xhr.send(JSON.stringify(requestBody));
            } catch (sendError) {
                reject(new Error('Error al enviar la petición'));
            }
        });
    }

    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';

        if (sender === 'user') {
            messageContent.textContent = content;
        } else {
            // Formatear respuesta de IA con saltos de línea
            messageContent.innerHTML = `<strong>IA:</strong> ${this.formatResponse(content)}`;
        }

        messageDiv.appendChild(messageContent);
        this.chatMessages.appendChild(messageDiv);

        // Scroll al final
        this.scrollToBottom();

        // Guardar en historial
        this.conversationHistory.push({ sender, content, timestamp: new Date() });
    }

    formatResponse(text) {
        // Función para escapar HTML
        const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        };

        // Procesar bloques de código primero
        let processedText = text;
        const codeBlocks = [];
        let codeBlockIndex = 0;

        // Extraer bloques de código ```...```
        processedText = processedText.replace(/```([\s\S]*?)```/g, (match, code) => {
            const placeholder = `__CODE_BLOCK_${codeBlockIndex}__`;
            codeBlocks[codeBlockIndex] = `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
            codeBlockIndex++;
            return placeholder;
        });

        // Procesar markdown en el texto restante
        processedText = processedText
            // Convertir **texto** a <strong>texto</strong>
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            // Convertir *texto* a <em>texto</em>
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Convertir `texto` a <code>texto</code>
            .replace(/`(.*?)`/g, (match, code) => `<code>${escapeHtml(code)}</code>`)
            // Convertir saltos de línea en <br>
            .replace(/\n/g, '<br>')
            // Preservar espacios múltiples
            .replace(/\s{2,}/g, (match) => '&nbsp;'.repeat(match.length));

        // Restaurar bloques de código
        codeBlocks.forEach((block, index) => {
            processedText = processedText.replace(`__CODE_BLOCK_${index}__`, block);
        });

        return processedText;
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message';
        typingDiv.id = 'typingIndicator';

        const typingContent = document.createElement('div');
        typingContent.className = 'typing-indicator';

        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            typingContent.appendChild(dot);
        }

        typingDiv.appendChild(typingContent);
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    setStatus(message, type = 'info') {
        this.status.textContent = message;
        this.status.className = `status ${type}`;

        // Limpiar mensaje después de 3 segundos
        if (type !== 'error') {
            setTimeout(() => {
                this.status.textContent = '';
            }, 3000);
        }
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    async saveSettings() {
        const settings = {
            model: this.modelSelect.value,
            apiUrl: this.apiUrl.value
        };

        if (this.isElectron) {
            try {
                await window.electronAPI.saveSettings(settings);
            } catch (error) {
                console.error('Error al guardar configuración en Electron:', error);
                // Fallback a localStorage
                localStorage.setItem('ollamaChatSettings', JSON.stringify(settings));
            }
        } else {
            localStorage.setItem('ollamaChatSettings', JSON.stringify(settings));
        }
    }

    async loadSettings() {
        if (this.isElectron) {
            try {
                const settings = await window.electronAPI.getSettings();
                this.modelSelect.value = settings.model || 'llama3:8b';
                this.apiUrl.value = settings.apiUrl || 'http://localhost:11434';
            } catch (error) {
                console.error('Error al cargar configuración de Electron:', error);
                this.loadLocalSettings();
            }
        } else {
            this.loadLocalSettings();
        }
    }

    loadLocalSettings() {
        const saved = localStorage.getItem('ollamaChatSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.modelSelect.value = settings.model || 'llama3:8b';
                this.apiUrl.value = settings.apiUrl || 'http://localhost:11434';
            } catch (error) {
                console.error('Error al cargar configuración local:', error);
            }
        }
    }

    async loadElectronSettings() {
        if (!this.isElectron) return;

        try {
            const settings = await window.electronAPI.getSettings();
            this.modelSelect.value = settings.model || 'llama3:8b';
            this.apiUrl.value = settings.apiUrl || 'http://localhost:11434';
        } catch (error) {
            console.error('Error al cargar configuración de Electron:', error);
        }
    }

    // Método para limpiar el chat
    clearChat() {
        this.chatMessages.innerHTML = `
            <div class="message ai-message">
                <div class="message-content">
                    <strong>IA:</strong> ¡Hola! Soy tu asistente de IA local. ¿En qué puedo ayudarte hoy?
                </div>
            </div>
        `;
        this.conversationHistory = [];
    }

    // Método para exportar conversación
    async exportConversation() {
        const conversation = this.conversationHistory.map(msg =>
            `${msg.sender === 'user' ? 'Usuario' : 'IA'}: ${msg.content}`
        ).join('\n\n');

        if (this.isElectron) {
            try {
                const result = await window.electronAPI.exportConversation(conversation);
                if (result.success) {
                    this.setStatus(`Conversación exportada a: ${result.filePath}`, 'success');
                } else {
                    this.setStatus('Exportación cancelada', 'info');
                }
            } catch (error) {
                console.error('Error al exportar conversación:', error);
                this.setStatus('Error al exportar conversación', 'error');
            }
        } else {
            // Fallback para navegador
            const blob = new Blob([conversation], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `conversacion-${new Date().toISOString().split('T')[0]}.txt`;
            a.click();
            URL.revokeObjectURL(url);
            this.setStatus('Conversación exportada', 'success');
        }
    }

    handleOllamaStatus(status) {
        if (status.status === 'running') {
            this.setStatus('✅ Ollama está ejecutándose', 'success');
        } else {
            this.setStatus(`❌ ${status.message}`, 'error');
        }
    }

    showSettings() {
        // Mostrar configuración avanzada si es necesario
        this.setStatus('Configuración abierta', 'info');
    }

    updateCurrentModelHeader() {
        const currentModelSpan = document.getElementById('currentModel');
        if (currentModelSpan) {
            currentModelSpan.textContent = this.modelSelect.value;
        }
    }
}

// Inicializar la aplicación cuando se cargue la página
document.addEventListener('DOMContentLoaded', () => {
    const chatApp = new ChatApp();

    // Agregar atajos de teclado
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + L para limpiar chat
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            e.preventDefault();
            chatApp.clearChat();
        }

        // Ctrl/Cmd + E para exportar conversación
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            chatApp.exportConversation();
        }
    });

    // Mostrar información de atajos
    console.log('Atajos de teclado:');
    console.log('Ctrl/Cmd + L: Limpiar chat');
    console.log('Ctrl/Cmd + E: Exportar conversación');
    console.log('Enter: Enviar mensaje');
    console.log('Shift + Enter: Nueva línea');
}); 