const fs = require('fs');
const path = require('path');

function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name.endsWith('.jsx')) fix(p);
  }
}

function fix(p) {
  let c = fs.readFileSync(p, 'utf8');
  const orig = c;

  // loading states
  c = c.replace(
    /if \(!(\w+)\) return <TopBar title=\{([^}]+)\} \/><span className="spinner" \/>\s*<\/div>;/g,
    'if (!$1) return (<><TopBar title={$2} /><span className="spinner" /></>);'
  );
  c = c.replace(
    /if \(!(\w+)\) return <TopBar title=\{([^}]+)\} \/><span className="spinner" \/>;/g,
    'if (!$1) return (<><TopBar title={$2} /><span className="spinner" /></>);'
  );

  // fragment opened but closed with stray </div> before );
  if (c.includes('return (\n    <>') || c.includes('return (\n    <>\n')) {
    c = c.replace(/\n<\/div>\s*\n\s*\);\s*\n\}/, '\n    </>\n  );\n}');
  }

  // Home: two root divs without fragment
  if (path.basename(p) === 'Home.jsx' && c.includes('app-header-purple') && !c.includes('return (\n    <>')) {
    c = c.replace(/return \(\s*\n\s*<div className="app-header-purple">/, 'return (\n    <>\n      <div className="app-header-purple">');
    c = c.replace(/\n<\/div>\s*\n\s*\);\s*\n\}$/, '\n    </>\n  );\n}');
  }

  if (c !== orig) {
    fs.writeFileSync(p, c);
    console.log('fixed', path.relative(path.join(__dirname, '..'), p));
  }
}

walk(path.join(__dirname, '..', 'src', 'pages', 'app'));
