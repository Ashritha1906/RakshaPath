const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('frontend/src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace the specific broken pattern from previous attempt
    content = content.replace(/'\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| "http:\/\/localhost:8000"\}'([^\s,)]*)/g, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}$1`');
    
    // Catch any remaining raw localhost URLs
    content = content.replace(/'http:\/\/localhost:8000([^\']*)'/g, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}$1`');
    content = content.replace(/"http:\/\/localhost:8000([^\"]*)"/g, '`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}$1`');

    fs.writeFileSync(file, content);
    console.log(`Fixed: ${file}`);
});
