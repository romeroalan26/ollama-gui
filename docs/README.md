# Chat IA Local (Ollama)

Aplicación web y de escritorio para chatear con modelos de IA locales usando Ollama. Fácil de usar, multiplataforma y con interfaz moderna.

---

## 🚀 Características

- Interfaz moderna, responsive y modo oscuro
- Conexión directa a Ollama (local)
- Selector de modelo y URL de API
- Historial y exportación de chat
- Atajos de teclado
- Soporte para Markdown
- App web y escritorio (Electron)

---

## 📋 Requisitos

- [Ollama](https://ollama.ai/) instalado y ejecutándose
- Al menos un modelo descargado (ej: `llama3:8b`)
- Node.js 18+ y npm
- (Para escritorio) Windows, Linux o Mac

---

## 📁 Estructura del Proyecto

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

---

## 🛠️ Instalación y Primer Uso

### 1. Clona el repositorio y entra al directorio

```bash
# Windows, Linux o Mac
 git clone https://github.com/tu-usuario/chat-ia-local.git
 cd chat-ia-local
```

### 2. Instala dependencias

```bash
npm install
```

### 3. Descarga y ejecuta Ollama

```bash
# Instala Ollama (ver https://ollama.ai/download)
# Descarga un modelo
ollama pull llama3:8b
# Inicia el servidor
ollama serve
```

---

## 🚦 Modo Web (servidor local)

```bash
npm start
```

- Abre tu navegador en: [http://localhost:8000](http://localhost:8000)
- Si el puerto 8000 está ocupado, revisa la consola para el puerto alternativo.

---

## 🖥️ Modo Escritorio (Electron)

```bash
npm run electron
```

- Se abrirá la app de escritorio.
- Si tienes problemas, asegúrate de que Ollama esté corriendo y el modelo descargado.

---

## ⚙️ Configuración

- Haz clic en el engranaje (⚙️) para abrir el modal de configuración.
- Cambia la URL del API (por defecto: `http://localhost:11434`)
- Selecciona el modelo de IA disponible (ej: `llama3:8b`)

### Agregar más modelos

1. Descarga el modelo:
   ```bash
   ollama pull nombre-del-modelo
   ```
2. Agrega la opción en el selector de modelo en `public/index.html`.

---

## ⌨️ Atajos de Teclado

- **Enter**: Enviar mensaje
- **Shift + Enter**: Nueva línea
- **Ctrl/Cmd + L**: Limpiar chat
- **Ctrl/Cmd + E**: Exportar conversación

---

## 🆘 Solución de Problemas

### Ollama no responde

- Verifica que Ollama esté ejecutándose: `ollama serve`
- Verifica que el modelo esté descargado: `ollama list`
- Prueba la API: `curl http://localhost:11434/api/tags`

### Error CORS en modo web

- Usa `npm start` o un servidor local (no abras el HTML directamente)
- Alternativamente, ejecuta el proxy: `python tools/proxy.py` y usa la URL `http://localhost:8080` en la configuración

### Error al iniciar Electron

- Asegúrate de tener Node.js y npm instalados
- Ejecuta desde la raíz del proyecto: `npm run electron`
- Si ves "Cannot find Electron app", revisa que el script apunte a `electron/main.js`

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Puedes:

- Reportar bugs
- Sugerir mejoras
- Mejorar la documentación
- Agregar soporte para más modelos

---

## 📄 Licencia

MIT

---

## 🙏 Agradecimientos

- [Ollama](https://ollama.ai/)
- Comunidad open source
