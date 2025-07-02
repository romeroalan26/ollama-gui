# Chat con IA Local - Ollama

Una aplicación web simple para chatear con modelos de IA locales usando Ollama.

## 🚀 Características

- **Interfaz moderna y responsive**: Diseño limpio y fácil de usar
- **Conexión directa a Ollama**: Se conecta a tu servidor Ollama local
- **Múltiples modelos**: Soporte para diferentes modelos de IA
- **Configuración personalizable**: URL del API y modelo configurable
- **Historial de conversaciones**: Guarda y exporta tus conversaciones
- **Atajos de teclado**: Navegación rápida con teclado
- **Indicador de escritura**: Muestra cuando la IA está procesando

## 📋 Requisitos

- [Ollama](https://ollama.ai/) instalado y ejecutándose
- Un modelo de IA descargado (ej: `llama3:8b`)
- Navegador web moderno

## 🛠️ Instalación

1. **Descarga Ollama** (si no lo tienes):

   ```bash
   # Windows (usando winget)
   winget install Ollama.Ollama

   # O descarga desde https://ollama.ai/
   ```

2. **Descarga un modelo**:

   ```bash
   ollama pull llama3:8b
   ```

3. **Ejecuta Ollama**:

   ```bash
   ollama serve
   ```

4. **Abre la aplicación**:

   - Simplemente abre `index.html` en tu navegador
   - O usa un servidor local:

     ```bash
     # Python 3
     python -m http.server 8000

     # Node.js
     npx serve .

     # PHP
     php -S localhost:8000
     ```

## 🎯 Uso

1. **Abrir la aplicación**: Navega a `http://localhost:8000` (o abre `index.html` directamente)

2. **Configurar conexión**:

   - **URL del API**: `http://localhost:11434` (por defecto)
   - **Modelo**: Selecciona el modelo que quieres usar

3. **Chatear**:
   - Escribe tu mensaje en el área de texto
   - Presiona `Enter` o haz clic en el botón de enviar
   - Espera la respuesta de la IA

## ⌨️ Atajos de Teclado

- **Enter**: Enviar mensaje
- **Shift + Enter**: Nueva línea
- **Ctrl/Cmd + L**: Limpiar chat
- **Ctrl/Cmd + E**: Exportar conversación

## ⚙️ Configuración

### Modelos Disponibles

La aplicación incluye varios modelos predefinidos:

- `llama3:8b` - Modelo rápido y eficiente
- `llama3:70b` - Modelo más potente (requiere más recursos)
- `mistral:7b` - Modelo especializado en código
- `codellama:7b` - Modelo optimizado para programación

### Agregar Nuevos Modelos

Para agregar más modelos:

1. Descarga el modelo con Ollama:

   ```bash
   ollama pull nombre-del-modelo
   ```

2. Edita `index.html` y agrega la opción:
   ```html
   <option value="nombre-del-modelo">nombre-del-modelo</option>
   ```

## 🔧 Solución de Problemas

### Error de Conexión

Si ves "Error: HTTP 404" o similar:

1. **Verifica que Ollama esté ejecutándose**:

   ```bash
   curl http://localhost:11434/api/tags
   ```

2. **Verifica que el modelo esté descargado**:

   ```bash
   ollama list
   ```

3. **Reinicia Ollama**:
   ```bash
   ollama serve
   ```

### Error CORS (Cross-Origin Resource Sharing)

Si ves "Failed to fetch" o errores de CORS:

#### Solución 1: Usar un servidor local (Recomendado)

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve . -p 8000

# PHP
php -S localhost:8000
```

Luego abre `http://localhost:8000` en tu navegador.

#### Solución 2: Usar el proxy incluido

```bash
# Ejecutar el proxy
python proxy.py

# Cambiar la URL en la aplicación a:
http://localhost:8080
```

#### Solución 3: Abrir con navegador especial

```bash
# Chrome (Windows)
chrome.exe --disable-web-security --user-data-dir="C:/temp/chrome_dev"

# Firefox
firefox -P "dev" --disable-web-security
```

### Modelo No Encontrado

Si el modelo no está disponible:

1. **Descarga el modelo**:

   ```bash
   ollama pull nombre-del-modelo
   ```

2. **Verifica el nombre exacto**:
   ```bash
   ollama list
   ```

## 📁 Estructura del Proyecto

```
chat-ia-local/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── script.js           # Lógica JavaScript
└── README.md           # Este archivo
```

## 🔄 API de Ollama

La aplicación usa la API REST de Ollama:

```bash
curl --location 'http://localhost:11434/api/generate' \
--header 'Content-Type: application/json' \
--data '{
  "model": "llama3:8b",
  "prompt": "Tu mensaje aquí",
  "stream": false
}'
```

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Puedes:

1. Reportar bugs
2. Sugerir nuevas características
3. Mejorar el diseño
4. Agregar soporte para más modelos

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🙏 Agradecimientos

- [Ollama](https://ollama.ai/) por proporcionar la infraestructura de IA local
- La comunidad de modelos de IA de código abierto
