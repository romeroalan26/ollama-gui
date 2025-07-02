const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

console.log('📦 Empaquetando aplicación de Windows...');

// Crear archivo ZIP
const output = fs.createWriteStream(path.join(__dirname, 'dist', 'Chat-IA-Local-Windows.zip'));
const archive = archiver('zip', {
    zlib: { level: 9 } // Máxima compresión
});

output.on('close', () => {
    console.log('🎉 ¡Aplicación empaquetada exitosamente!');
    console.log(`📁 Archivo: dist/Chat-IA-Local-Windows.zip`);
    console.log(`📊 Tamaño: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
});

archive.on('error', (err) => {
    throw err;
});

archive.pipe(output);

// Agregar archivos de la aplicación
const winDir = path.join(__dirname, 'dist', 'win-unpacked');
archive.directory(winDir, 'Chat IA Local');

archive.finalize(); 