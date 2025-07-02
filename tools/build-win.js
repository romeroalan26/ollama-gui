const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Construyendo aplicación de Windows...');

// Crear directorio de salida
const distDir = path.join(__dirname, 'dist');
const winDir = path.join(distDir, 'win-unpacked');

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

if (!fs.existsSync(winDir)) {
    fs.mkdirSync(winDir);
}

// Copiar archivos de la aplicación
const filesToCopy = [
    path.join('public', 'index.html'),
    path.join('public', 'styles.css'),
    path.join('public', 'script.js'),
    path.join('electron', 'main.js'),
    path.join('electron', 'preload.js'),
    path.join('public', 'package.json')
];

console.log('📁 Copiando archivos de la aplicación...');
filesToCopy.forEach(file => {
    const source = path.resolve(__dirname, '..', file);
    const dest = path.join(winDir, path.basename(file));
    if (fs.existsSync(source)) {
        fs.copyFileSync(source, dest);
        console.log(`✅ Copiado: ${file}`);
    } else {
        console.log(`⚠️  No encontrado: ${file}`);
    }
});

// Crear directorio assets si no existe
const assetsDir = path.join(winDir, 'assets');
const publicAssetsDir = path.resolve(__dirname, '..', 'public', 'assets');
if (fs.existsSync(publicAssetsDir)) {
    fs.cpSync(publicAssetsDir, assetsDir, { recursive: true });
}

// Crear un icono simple si no existe
const iconPath = path.join(assetsDir, 'icon.png');
if (!fs.existsSync(iconPath)) {
    console.log('🎨 Creando icono por defecto...');
    // Crear un archivo de icono simple (placeholder)
    fs.writeFileSync(iconPath, '');
}

// Crear package.json para la aplicación
const appPackage = {
    name: "chat-ia-local",
    version: "1.0.0",
    main: "main.js",
    scripts: {
        start: "electron ."
    },
    dependencies: {
        "electron": "^28.0.0",
        "electron-store": "^8.1.0"
    }
};

fs.writeFileSync(path.join(winDir, 'package.json'), JSON.stringify(appPackage, null, 2));

// Instalar dependencias en el directorio de la aplicación
console.log('📦 Instalando dependencias...');
try {
    execSync('npm install --production', { cwd: winDir, stdio: 'inherit' });
    console.log('✅ Dependencias instaladas');
} catch (error) {
    console.log('⚠️  Error instalando dependencias, continuando...');
}

// Crear archivo batch para ejecutar la aplicación
const batchContent = `@echo off
cd /d "%~dp0"
node_modules\\.bin\\electron . --no-sandbox
pause
`;

fs.writeFileSync(path.join(winDir, 'run.bat'), batchContent);

// Crear archivo README
const readmeContent = `# Chat IA Local

## Instalación

1. Asegúrate de tener Ollama instalado y ejecutándose
2. Ejecuta \`run.bat\` para iniciar la aplicación
3. O ejecuta \`node_modules\\.bin\\electron .\` desde la línea de comandos

## Requisitos

- Ollama instalado y ejecutándose
- Modelo de IA descargado (ej: \`ollama pull llama3:8b\`)

## Uso

1. Ejecuta la aplicación
2. Configura la URL del API (por defecto: http://localhost:11434)
3. Selecciona el modelo que quieres usar
4. ¡Empieza a chatear!

## Solución de Problemas

Si la aplicación no se conecta a Ollama:
1. Verifica que Ollama esté ejecutándose: \`ollama serve\`
2. Verifica que tengas un modelo descargado: \`ollama list\`
3. Descarga un modelo si es necesario: \`ollama pull llama3:8b\`
`;

fs.writeFileSync(path.join(winDir, 'README.txt'), readmeContent);

console.log('🎉 ¡Aplicación construida exitosamente!');
console.log(`📂 Ubicación: ${winDir}`);
console.log('🚀 Para ejecutar:');
console.log(`   1. Navega a: ${winDir}`);
console.log('   2. Ejecuta: run.bat');
console.log('   3. O ejecuta: node_modules\\.bin\\electron .'); 