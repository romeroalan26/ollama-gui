# 🖥️ Aplicación de Escritorio - Chat IA Local

Esta aplicación web también puede ejecutarse como una aplicación de escritorio nativa usando Electron.

## 🚀 Instalación y Uso

### Prerrequisitos

- [Node.js](https://nodejs.org/) (versión 16 o superior)
- [Ollama](https://ollama.ai/) instalado y ejecutándose
- Un modelo de IA descargado

### Instalación

1. **Instalar dependencias**:

   ```bash
   npm install
   ```

2. **Ejecutar en modo desarrollo**:

   ```bash
   npm run electron
   ```

3. **Construir aplicación ejecutable**:

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

## 🎯 Características de la Aplicación de Escritorio

### ✅ Ventajas sobre la versión web:

- **Sin problemas de CORS**: No hay restricciones de origen cruzado
- **Menú nativo**: Menús del sistema operativo con atajos de teclado
- **Configuración persistente**: Configuración guardada localmente
- **Exportación nativa**: Diálogos de guardado del sistema operativo
- **Verificación de Ollama**: Comprobación automática del estado del servidor
- **Mejor rendimiento**: Aplicación nativa más rápida
- **Sin dependencias de servidor**: No necesitas un servidor web

### 🖱️ Funcionalidades del Menú:

#### Archivo

- **Nueva Conversación** (Ctrl+N): Limpia el chat actual
- **Exportar Conversación** (Ctrl+E): Guarda la conversación en un archivo
- **Salir** (Ctrl+Q): Cierra la aplicación

#### Editar

- Cortar, Copiar, Pegar, Seleccionar Todo
- Deshacer/Rehacer

#### Ver

- Recargar página
- Herramientas de desarrollador
- Zoom in/out
- Pantalla completa

#### Herramientas

- **Verificar Ollama**: Comprueba si Ollama está ejecutándose
- **Abrir Ollama Web**: Abre la interfaz web de Ollama
- **Configuración**: Abre la configuración avanzada

#### Ayuda

- **Acerca de**: Información de la aplicación
- **Documentación de Ollama**: Enlace a la documentación oficial
- **Reportar un Problema**: Enlace al repositorio

## 🔧 Configuración

### Almacenamiento de Configuración

La aplicación de escritorio guarda la configuración en:

- **Windows**: `%APPDATA%/chat-ia-local/config.json`
- **macOS**: `~/Library/Application Support/chat-ia-local/config.json`
- **Linux**: `~/.config/chat-ia-local/config.json`

### Configuración Automática

- **URL del API**: Se guarda automáticamente
- **Modelo seleccionado**: Se recuerda entre sesiones
- **Tema**: Configuración de apariencia (futuro)

## 📦 Construcción de la Aplicación

### Estructura de Archivos

```
chat-ia-local/
├── main.js              # Proceso principal de Electron
├── preload.js           # Script de precarga seguro
├── index.html           # Interfaz de usuario
├── styles.css           # Estilos
├── script.js            # Lógica de la aplicación
├── package.json         # Configuración del proyecto
├── assets/              # Iconos y recursos
│   ├── icon.png         # Icono de la aplicación
│   ├── icon.ico         # Icono para Windows
│   └── icon.icns        # Icono para macOS
└── dist/                # Aplicaciones construidas
```

### Personalización

#### Cambiar el Icono

1. Reemplaza los archivos en la carpeta `assets/`:

   - `icon.png` (512x512px)
   - `icon.ico` (Windows)
   - `icon.icns` (macOS)

2. Actualiza `package.json` si es necesario

#### Cambiar el Nombre de la Aplicación

Edita `package.json`:

```json
{
  "name": "tu-nombre-app",
  "productName": "Tu Nombre de App",
  "build": {
    "appId": "com.tuempresa.tuapp"
  }
}
```

## 🐛 Solución de Problemas

### Error: "Cannot find module 'electron'"

```bash
npm install
```

### Error: "Cannot find module 'electron-store'"

```bash
npm install electron-store
```

### La aplicación no se conecta a Ollama

1. Verifica que Ollama esté ejecutándose:

   ```bash
   ollama serve
   ```

2. Usa el menú **Herramientas > Verificar Ollama**

3. Verifica la URL en la configuración

### Error al construir la aplicación

1. Asegúrate de tener todas las dependencias:

   ```bash
   npm install
   ```

2. Para Windows, asegúrate de tener Visual Studio Build Tools

3. Para macOS, asegúrate de tener Xcode Command Line Tools

## 🔄 Desarrollo

### Modo de Desarrollo

```bash
npm run electron-dev
```

### Herramientas de Desarrollador

- Presiona `F12` o usa **Ver > Herramientas de Desarrollador**
- Recarga con `Ctrl+R` o **Ver > Recargar**

### Logs de la Aplicación

Los logs aparecen en la consola donde ejecutas la aplicación.

## 📱 Distribución

### Crear Instalador

```bash
# Windows (crea .exe)
npm run build-win

# macOS (crea .dmg)
npm run build-mac

# Linux (crea AppImage)
npm run build-linux
```

### Archivos Generados

- **Windows**: `dist/Chat IA Local Setup.exe`
- **macOS**: `dist/Chat IA Local.dmg`
- **Linux**: `dist/Chat IA Local.AppImage`

## 🎨 Personalización Avanzada

### Temas

Puedes agregar temas personalizados modificando `styles.css` y agregando clases de tema.

### Plugins

La arquitectura permite agregar plugins para funcionalidades adicionales.

### Integración con Ollama

La aplicación se integra directamente con la API REST de Ollama sin necesidad de configuraciones adicionales.

---

¡Disfruta de tu aplicación de escritorio para chatear con IA local! 🤖✨
