const fs = require('fs');
const path = require('path');

const libDir = path.join(__dirname, 'lib');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(filePath));
        } else if (filePath.endsWith('.js')) {
            results.push(filePath);
        }
    });
    return results;
}

const files = walk(libDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Calculate depth to determine correct relative path to WAProto
    const relativePath = path.relative(__dirname, file); // e.g., lib/Socket/socket.js
    const depth = relativePath.split(path.sep).length - 1; // 2
    let protoPath = '../'.repeat(depth) + 'WAProto/index.js';

    // Replace incorrect WAProto paths
    // Look for anything like import { proto } from '../../../../WAProto/index.js'
    const newContent = content.replace(/from\s+['"](?:\.\.\/)+WAProto(?:\/index\.js)?['"]/g, `from '${protoPath}'`)
                              .replace(/require\(['"](?:\.\.\/)+WAProto(?:\/index\.js)?['"]\)/g, `require('${protoPath}')`);

    if (newContent !== content) {
        fs.writeFileSync(file, newContent);
        console.log(`Fixed WAProto path in: ${relativePath}`);
    }
});

console.log('Path resolution fix complete.');
