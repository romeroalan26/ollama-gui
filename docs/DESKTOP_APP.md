# 🖥️ Aplicación de Escritorio - Chat IA Local

Esta aplicación puede ejecutarse como app de escritorio nativa usando Electron, además de funcionar como web.

## 🚀 Instalación y Uso

### Prerrequisitos

- [Node.js](https://nodejs.org/) 18+
- [Ollama](https://ollama.ai/) instalado y ejecutándose
- Al menos un modelo descargado (ej: `llama3:8b`)

### Instalación

1. **Instala dependencias** (desde la raíz del proyecto):
   ```bash
   npm install
   ```
2. **Ejecuta en modo escritorio**:
   ```bash
   npm run electron
   ```
3. **Construye la app ejecutable**:
   ```bash
   # Windows
   npm run build-win
   # macOS
   npm run build-mac
   # Linux
   npm run build-linux
   # Todas las plataformas
   npm run build
   ```

## 📁 Estructura del Proyecto (actual)

```
ia/
├── package.json           # Configuración principal (npm, scripts, Electron)
├── .gitignore             # Exclusión de archivos
├── public/                # App web (HTML, CSS, JS, assets, package.json)
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   ├── assets/
│   └── package.json
├── electron/              # Código principal de Electron
│   ├── main.js
│   └── preload.js
├── tools/                 # Scripts y utilidades
│   ├── build-win.js
│   ├── package-win.js
│   ├── proxy.py
│   └── bfg-1.15.0.jar
├── docs/                  # Documentación
│   ├── README.md
│   ├── DESKTOP_APP.md
│   └── BUILD_INSTRUCTIONS.md
└── dist/                  # Builds generados
```

## 🏆 Ventajas sobre la versión web

- Sin problemas de CORS
- Menú nativo y atajos de teclado
- Configuración persistente local
- Exportación nativa
- Verificación automática de Ollama
- Mejor rendimiento
- No requiere servidor web

## 🛠️ Menú de la app de escritorio

- **Archivo**: Nueva conversación, exportar, salir
- **Editar**: Cortar, copiar, pegar, deshacer, rehacer
- **Ver**: Recargar, herramientas de desarrollador, zoom, pantalla completa
- **Herramientas**: Verificar Ollama, abrir Ollama Web, configuración
- **Ayuda**: Acerca de, documentación, reportar problema

## ⚙️ Configuración y almacenamiento

- La configuración se guarda automáticamente en el sistema operativo:
  - **Windows**: `%APPDATA%/chat-ia-local/config.json`
  - **macOS**: `~/Library/Application Support/chat-ia-local/config.json`
  - **Linux**: `~/.config/chat-ia-local/config.json`
- Se recuerda la URL del API, modelo y preferencias.

## 🧩 Personalización

- Cambia el icono reemplazando los archivos en `public/assets/` (icon.png, icon.ico, icon.icns)
- Cambia el nombre editando `package.json` (campos `name`, `productName`, `build.appId`)

## 🆘 Solución de Problemas

- **No se encuentra Electron**: `npm install`
- **No se encuentra electron-store**: `npm install electron-store`
- **No conecta a Ollama**: Verifica que Ollama esté corriendo y la URL sea correcta
- **Error al construir**: Asegúrate de tener todas las dependencias y herramientas de build
- **Error de rutas**: Ejecuta los comandos desde la raíz del proyecto

## 🛠️ Desarrollo

- Modo desarrollo: `npm run electron-dev`
- Herramientas de desarrollador: F12 o menú Ver
- Logs: consola donde ejecutas la app

## 📦 Distribución

- Windows: `npm run build-win` (genera ejecutable en `dist/`)
- macOS: `npm run build-mac`
- Linux: `npm run build-linux`
- Paquete ZIP: `npm run package-win`

¡Disfruta de tu app de escritorio para chatear con IA local! 🤖✨
