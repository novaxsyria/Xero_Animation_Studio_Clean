# AmberFrame Implementation & QC Report

## 1. Reusable AmberFrame Engine Upgrades (`src/engine/`)
- **`amberframe.ts`**:
  - Structured JSON/TypeScript production schema (`ScenePlan`, `EpisodeManifest`, `VoiceSegmentSpec`, `VoiceCharacterPreset`, `VOICE_PRESET_SPECS`, `AudioEventSpec`, `ContinuityMetadata`, `QCReport`).
  - Motivated camera helpers (`motivatedCamera`, `cameraTransform`), subtle physiological motion (`breathCurve`, `microTremor`), and automated QC validator (`validateEpisodePlan`) checking character voice FX & horror payoff SFX.
- **`voice_fx.mjs`**:
  - Reusable character & perspective audio transformation engine for every AmberFrame episode:
    - `telephone-caller`: Distinct caller pitch shift (`-2.2st`) + `480–2450Hz` micro-speaker bandpass + harmonic saturation + GSM line static (`100%` wet inside isolated speech window).
    - `closet-horror-entity`: Deep terrifying entity voice (`-3.8st` primary + `-7.0st` sub-shadow double + hollow wooden enclosure reflections + breath grit).
    - `buildHorrorStingSamples`: Visceral chest-drop sub-boom + dissonant bowed horror screech triggered right after terrifying character lines (`"sfx بعدها رعب"`).
- **`rig.tsx`**:
  - Added signature **A6 Amber Noir** protagonist look (`LOOKS.amberNoir` — matte-black `#1A1824` circular head, crisp `#F6EFE3` facial features, `#FF8A3D` orange hoodie).
- **`sets/closet_bedroom.tsx`**:
  - Persistent midnight bedroom set (`CLOSET_ROOM`) enforcing fixed left/right geography (bed & nightstand left, moonlit window center-back, articulated wooden wardrobe right).

## 2. Episode Production — «من داخل الخزانة» (`KhizanatAlGhurfa`)
- **Authoritative Audio**: Probed `public/assets/aistudio/tts-output_10__5aad1f8e.mp3` (`30.792s`, `48kHz mono`, `192kbps`).
- **Syllable-Verified Timeline**: `960 frames @ 30 FPS` (`32.00s`), 9 contiguous zero-gap scenes (`S01`–`S09`) anchored directly to `ffmpeg silencedetect` and verified spoken Arabic phrase segments.
- **Character Voice Transformations & Spatial SFX**:
  - **Voice Stem (`voice.mp3`)**: Narrator lines stay clean and natural, while `21.90s–24.06s` («لا تفتح الخزانه... أنا محبوس داخلها!») uses `telephone-caller` (`100%` wet) and `28.90s–30.54s` («لا تصدقه... أنا اللي اتصلت عليك!») uses `closet-horror-entity` (`100%` wet).
  - **Stereo SFX Stem (`sfx.mp3`)**: 16 cataloged WAV clips in `library/sfx/amberframe/` (`sfx_catalog.json`), including bedroom room tone, occluded closet breathing, slow & wide wooden door creaks (`f172`, `f762`), bed rustle (`f238`), **5 unique wood floorboard footstep variations** (`f268, f288, f312, f332, f386`), sudden nightstand smartphone ring (`f430`), earpiece static (`f517`), inner closet resonance (`f866`), and **`horror_sting_climax`** (`f914`) landing right after «عليك!».
  - **Restrained Score (`music.mp3`)**: Attack/release RMS-ducked D-minor dread underscore dropping to **intentional musical silence** (`21.85s–28.88s`) across the telephone caller warning and self-opening wardrobe reveal, before surging into the climax horror sting.

## 3. Production Checkpoint & Verification Scope
- **Automated QC**: Verified via `node studio/scripts/validate_amberframe.mjs` (zero-gap contiguity, authoritative audio alignment, A6 Amber Noir continuity, Character Voice-FX & horror SFX, 3-stem sync, and `ffprobe` MP4 check).
- **1080p MP4 Render Pipeline**: Executed `node studio/scripts/export_mp4.mjs` (streaming all `960` 1920×1080 frames in-memory via `@resvg/resvg-js` directly to `ffmpeg` stdin with `libx264`/`AAC` `-14 LUFS` muxing into `public/exports/Khizanat_Al_Ghurfa_1080p.mp4`).
- **Preserved Legacy Episode**: `hal-taarif-innaka-tahlum` (70 scenes / 17,488 frames) remains intact and selectable in both Remotion and the Web Studio UI.
