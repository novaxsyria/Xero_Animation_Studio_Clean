# Xero Animation Studio — Clean Transfer Copy

This is the original supplied `yt-main` source project with generated exports and unreferenced AI Studio upload artifacts removed. The two existing episode source trees, source narration needed for rebuilding, web UI, Remotion engine, SFX library, scripts, and project documentation are retained.

## Quick start (Windows PowerShell)

Open PowerShell in this folder:

```powershell
npm install
npm run build
npm run dev
```

For Remotion, open a **second** PowerShell in `studio`:

```powershell
cd studio
npm install
npx remotion compositions src/index.ts
```

You must have a current Node.js, FFmpeg in PATH for renders, and any external API credentials configured locally from `.env.example`. Never commit real credentials. For NVIDIA exports, consult `studio/render_nvidia.ps1` and `studio/README.md`.

## Scope and caveats

- Prior generated `public/exports/*.mp4` and `*.zip` are not included. Those are generated deliverables, not required source. Re-render or repackage them using the project tools. Until then, buttons showing existing exports may not have files to download.
- Unreferenced AI Studio image/text uploads were excluded; the two original source narration assets *referenced by existing scripts* were retained.
- Similar audio files under root `public/` and `studio/public/` were retained intentionally, because the web preview and Remotion/PowerShell scripts use different paths.
- Root `package.json` had a verified package resolution conflict (`esbuild ^0.25.0` versus Vite 8); this copy changes only that dependency to `^0.28.2`. No other package or engine logic was changed.
- The existing `render_nvidia.ps1` / `render_cpu.ps1` scripts still use `element-%05d.png`, while an earlier real render produced `element-000.png`. Inspect generated filenames and adjust pattern before FFmpeg encoding if that happens again.
- No full build, functional browser preview, or render was run as part of cleaning. The ZIP was checked for completeness and basic structural references only.

## Transfers

For a new AI Studio chat, upload/import this clean project and ask it to read `AGENTS.md`, `ARCHITECTURE.md`, `VIDEO_PRODUCTION.md`, `ERRORS_AND_FIXES.md`, and `studio/README.md` first. An attached ZIP may not automatically become an editable project in every AI Studio session. Use project import where supported.
