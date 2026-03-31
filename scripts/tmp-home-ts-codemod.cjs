const fs = require('fs');
const path = require('path');

const targetRoots = [
  'src/pages/Home',
  'src/hooks/useHomeHandlers.ts',
  'src/hooks/useHomeState.ts',
  'src/pages/Home/hooks/useHomeLogic.ts',
  'src/pages/Home/hooks/useHomePageState.tsx',
  'src/pages/Home/hooks/useHomePageHandlers.ts',
  'src/components/modals/FolderTreeModal.tsx'
];

function collectFiles(root) {
  if (!fs.existsSync(root)) return [];
  const stat = fs.statSync(root);
  if (stat.isFile()) return [root];
  const out = [];
  const walk = (dir) => {
    for (const name of fs.readdirSync(dir)) {
      const fp = path.join(dir, name);
      const st = fs.statSync(fp);
      if (st.isDirectory()) walk(fp);
      else if (st.isFile() && (fp.endsWith('.ts') || fp.endsWith('.tsx'))) out.push(fp);
    }
  };
  walk(root);
  return out;
}

const files = Array.from(new Set(targetRoots.flatMap(collectFiles)));
let changed = 0;

for (const file of files) {
  let src = fs.readFileSync(file, 'utf8');
  const original = src;

  // Normalize inferred-never state.
  src = src.replace(/useState\s*<\s*never\[\]\s*>\s*\(\s*\[\s*\]\s*\)/g, 'useState<any[]>([])');
  src = src.replace(/useState\s*\(\s*\[\s*\]\s*\)/g, 'useState<any[]>([])');
  src = src.replace(/useState\s*\(\s*\{\s*\}\s*\)/g, 'useState<any>({})');

  // Add explicit any state for object literals when generic is missing.
  src = src.replace(/useState\s*\(\s*\{/g, 'useState<any>({');

  // Make catch blocks explicit to avoid unknown property access errors.
  src = src.replace(/catch\s*\(\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*\)/g, 'catch ($1: any)');

  // ForwardRef without props typing often infers {} props.
  src = src.replace(/React\.forwardRef\s*\(\s*\(/g, 'React.forwardRef<any, any>((');

  if (src !== original) {
    fs.writeFileSync(file, src, 'utf8');
    changed += 1;
  }
}

console.log(`Patched ${changed} files.`);
