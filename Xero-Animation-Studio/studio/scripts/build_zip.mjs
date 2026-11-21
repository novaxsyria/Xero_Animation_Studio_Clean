import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '../..');
const STUDIO_DIR = path.join(ROOT, 'studio');
const EXPORTS_DIR = path.join(ROOT, 'public/exports');
const ZIP_OUT = path.join(EXPORTS_DIR, 'AmberFrame_Studio_Complete_Project.zip');
const LEGACY_ZIP = path.join(EXPORTS_DIR, 'Hal_Taarif_Innaka_Tahlum_Remotion_Project.zip');

fs.mkdirSync(EXPORTS_DIR, { recursive: true });
if (fs.existsSync(ZIP_OUT)) fs.unlinkSync(ZIP_OUT);

const pyScript = `
import os, zipfile
root = ${JSON.stringify(STUDIO_DIR)}
out = ${JSON.stringify(ZIP_OUT)}
skip_dirs = {'node_modules', 'out', '.amberframe_cache'}
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in sorted(dirnames) if d not in skip_dirs]
        for fn in sorted(filenames):
            full = os.path.join(dirpath, fn)
            rel = os.path.relpath(full, root)
            zf.write(full, rel)
`;

execFileSync('python3', ['-c', pyScript], { stdio: 'inherit' });
fs.copyFileSync(ZIP_OUT, LEGACY_ZIP);

const sizeMB = (fs.statSync(ZIP_OUT).size / (1024 * 1024)).toFixed(2);
console.log(`Packaged ${ZIP_OUT} (${sizeMB} MB)`);
