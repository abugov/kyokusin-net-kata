const fs = require('fs');
let content = fs.readFileSync('./build_page.js', 'utf8');

content = content.replace(
  '<button class="view-btn active" id="viewBtnConcise" onclick="setViewMode(\'concise\')">☰ Concise</button>',
  '<button class="view-btn active" id="viewBtnConcise" onclick="setViewMode(\'concise\')">☰ List</button>'
);

fs.writeFileSync('./build_page.js', content);
