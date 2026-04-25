

const fs = require('fs');
const txt = fs.readFileSync('diff.txt', 'utf8');

const parts = txt.split('--- a/frontend/src/pages/admin/DashboardPage.jsx\n+++ b/frontend/src/pages/admin/DashboardPage.jsx\n');
if (parts.length > 1) {
    const diffBlock = parts[1].split('diff --git')[0];
    const lines = diffBlock.split('\n');
    const oldLines = [];

    // We only want the old version of the file.
    // In unified diff, line without prefix = context (keep)
    // '-' prefix = old (keep, remove prefix)
    // '+' prefix = new (discard)
    // '@@' = chunk header (discard)

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('@@')) continue;
        if (line.startsWith('+')) continue;
        if (line.startsWith('-')) {
            oldLines.push(line.substring(1));
        } else if (line.startsWith(' ')) {
            oldLines.push(line.substring(1));
        } else if (line === '') {
            oldLines.push('');
        }
    }

    fs.writeFileSync('old_dashboard.jsx', oldLines.join('\n'));
    console.log('Saved to old_dashboard.jsx');
}
