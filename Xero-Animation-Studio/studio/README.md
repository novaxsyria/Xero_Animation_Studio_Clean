# AmberFrame Animation Studio

Reusable, deterministic 2D animated storytelling engine built on **React + SVG + Remotion** (extending procedural character rigs, 3D perspective room math, volumetric lighting, Haas binaural SFX, and frame-accurate audio synchronization).

## Episodes Included
1. **«من داخل الخزانة» (`KhizanatAlGhurfa`)** — *A6 Amber Noir 32s Cinematic Horror Short*
   - **Duration**: `32.00s` (`960 frames @ 30 FPS`), aligned directly to the authoritative Arabic voiceover (`30.792s`) via `analyze_audio.mjs` silence-midpoint analysis plus a `1.21s` post-dialogue horror sting climax tail (`f915`).
   - **Scenes**: **18 dynamic shots (`S01`–`S18`)** across 4 beats (`1.78s` avg shot length, zero frame gaps), fixed bedroom geography (bed left, wardrobe right), articulated double-door wardrobe + `ShadowEntity` predator rig (`ClosetBedroom`), volumetric moonlight beams, 2.25:1 widescreen letterbox + crimson danger edge + film grain post-FX (`CinematicSvgOverlay`), `telephone-caller` & `closet-horror-entity` character voice transformations, Haas binaural spatial SFX (`sfx.mp3`), multi-harmonic bowed horror score + dead silence drop (`music.mp3`), and `horror_sting_climax` right after `"عليك!"`.
   - **Pre-rendered Verified MP4**: `public/exports/Khizanat_Al_Ghurfa_1080p.mp4` (`1920×1080`, `30 FPS`, `H.264 BT.709`, `AAC 192k`, `-14 LUFS` audio mix).
2. **«هل تعرف إنك تحلم؟» (`HalTaarifInnakaTahlum`)** — *Long-Form Episode (Preserved)*
   - **Duration**: `582.93s` (`17,488 frames @ 30 FPS`), 70 scenes across Acts I–VI.

---

## Reusable AmberFrame Architecture (`src/engine/`)
- **`amberframe.ts`**: Formal `ScenePlan`, `EpisodeManifest`, `VoiceSegmentSpec`, `VoiceCharacterPreset`, `VOICE_PRESET_SPECS`, `AudioEventSpec`, and `QCReport` schemas; `motivatedCamera`, `cameraTransform`, and `handheldOffset` physiological drift/Dutch roll framing helpers; `breathCurve`, `microTremor`, and `validateEpisodePlan()`.
- **`voice_fx.mjs`**: Reusable non-destructive character voice transformation & horror sting SFX engine (`telephone-caller`, `closet-horror-entity`, `vintage-recorder`, `behind-door`, and `buildHorrorStingSamples`).
- **`audio_engine.mjs`**: Reusable voice-RMS ducking (`computeVoiceDuckEnvelope`), binaural Haas + bedroom early-reflection spatial mixer (`mixSpatialSfxEvent`), `buildSubRiserSamples`, and dynamic multi-harmonic bowed horror score + tension-reactive heartbeat (`renderDynamicHorrorScore`).
- **`rig.tsx`**: High-contrast **A6 Amber Noir** character costume (`LOOKS.amberNoir`) with sleeve/collar/pocket detail, chest breathing & dynamic directional rim lighting (`lightSide`, `lightColor`), expressive eyes (`pupilScale`), plus reusable **`ShadowEntity`** horror rig.
- **`core.tsx`**: Shared **`CinematicSvgOverlay`** (`letterbox`, `danger`, `grain`, `vignette`, multi-frame `flash`) consumed identically by Browser Studio, Remotion `Episode`, and headless `export_mp4.mjs`.
- **`sets/closet_bedroom.tsx`**: Perspective midnight bedroom (`CLOSET_ROOM`) with volumetric moonlight shafts, smartphone bounce pool, nightstand digital clock (`03:07`), hanging wardrobe coats, and integrated `ShadowEntity` + claw reveal.

---

## Episode-Agnostic CLI Automation (`scripts/`)
1. Analyze voiceover silence midpoints & pause cuts:
   ```bash
   node scripts/analyze_audio.mjs --audio=../public/assets/aistudio/tts-output_10__5aad1f8e.mp3
   ```
2. Build episode JSONs & spatial audio stems:
   ```bash
   node scripts/build_khizanat_data.mjs
   node scripts/build_khizanat_audio.mjs
   ```
3. Headless 1080p MP4 export (episode-agnostic):
   ```bash
   node scripts/export_mp4.mjs --episode=khizanat-al-ghurfa
   ```
4. Unified QC Validation:
   ```bash
   node scripts/validate_amberframe.mjs --episode=khizanat-al-ghurfa
   ```

---

## Quick Start on Windows (NVIDIA RTX 3060)
1. Extract `AmberFrame_Studio_Complete_Project.zip`.
2. Open PowerShell inside the extracted folder:
   ```powershell
   npm install
   .\check_gpu.ps1
   ```
3. Preview live in Remotion Studio (port `3430`):
   ```powershell
   npm run studio
   ```
4. Render crisp 1080p MP4 via **NVIDIA RTX 3060 (`h264_nvenc`)**:
   ```powershell
   .\render_nvidia.ps1 -Episode KhizanatAlGhurfa
   ```
   Or CPU fallback (`libx264`):
   ```powershell
   .\render_cpu.ps1 -Episode KhizanatAlGhurfa
   ```
