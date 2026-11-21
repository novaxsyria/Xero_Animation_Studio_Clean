# ARCHITECTURE.md — بنية AmberFrame Animation Studio

هذا المستند يوثق البنية الفعلية الحالية للمشروع وآلية عمل كل طبقة برمجية استناداً إلى الملفات الموجودة في مساحة العمل.

---

## 1. نظرة عامة على الهيكل (Directory Layout)

```text
/
├── AGENTS.md / ARCHITECTURE.md / CHANGELOG.md / ERRORS_AND_FIXES.md / VIDEO_PRODUCTION.md
├── package.json                  # حزم الواجهة، Express، Vite، esbuild، و @resvg/resvg-js
├── tsconfig.json                 # فحص TypeScript للواجهة مع استثناء نقاط دخول Remotion
├── vite.config.ts                # إعداد Vite للواجهة الأمامية
├── server.ts                     # خادم Express + Vite middleware (المنفذ 3000) + API التصدير والفحص
├── index.html                    # صفحة الدخول وروابط الخطوط العربية (IBM Plex Sans Arabic / Noto)
├── public/                       # الملفات الساكنة المتاحة للخادم مباشرة
│   ├── assets/aistudio/          # ملفات النصوص والصوتيات الأصلية المرفوعة (تُقرأ فقط)
│   ├── exports/                  # المخرجات النهائية: MP4 و ZIP
│   ├── khizanat-al-ghurfa-*.mp3  # مسارات الصوت الـ 3 لحلقة «من داخل الخزانة»
│   └── hal-taarif-innaka-tahlum-*.mp3 # مسارات الصوت الـ 3 لحلقة «هل تعرف إنك تحلم؟»
├── src/                          # تطبيق الويب (AmberFrame Studio UI)
│   ├── App.tsx                   # المبدّل بين الحلقات والواجهة ذات الـ 3 مناطق + مزامنة الصوت بالفريم
│   ├── types/episode.ts          # أنواع TypeScript وخريطة الفصول EPISODE_ACTS
│   └── components/
│       ├── EpisodeStage.tsx      # عارض SVG الحي المتزامن مع frame
│       ├── PlayerView.tsx        # المشغل، Timeline، خلاط 3 مسارات، وفاحص المشهد
│       ├── StoryboardView.tsx    # شبكة القصة المصورة الكاملة مع التصفية والبحث ونافذة المعاينة
│       ├── AudioSfxView.tsx      # كشف المؤثرات Frame-aligned ومستعرض مكتبة WAV
│       └── RenderExportView.tsx  # تقرير QC الحي، تحميل/توليد MP4، تحميل ZIP، وأوامر RTX 3060
└── studio/                       # مشروع إنتاج الرسوم المتحركة و Remotion المستقل
    ├── package.json              # إعداد Remotion v4.0.530 للتصيير المحلي على Windows/RTX 3060
    ├── studio.config.ts          # الثوابت العامة: fps=30, width=1920, height=1080
    ├── remotion.config.ts        # إعدادات Remotion CLI (png, entry src/index.ts, angle)
    ├── render_nvidia.ps1         # سكربت تصيير Windows GPU عبر h264_nvenc + دمج -14 LUFS
    ├── render_cpu.ps1            # سكربت تصيير Windows CPU عبر libx264 CRF=15
    ├── check_gpu.ps1 / package_project.ps1
    ├── library/
    │   ├── sfx/                  # مكتبة SFX للحلقة الأولى (hal-taarif-innaka-tahlum)
    │   └── sfx/amberframe/       # مكتبة SFX المهيكلة + sfx_catalog.json لحلقة AmberFrame
    ├── scripts/                  # سكربتات البناء، معالجة الصوت، التصيير، التحقق، والضغط
    └── src/
        ├── index.ts / Root.tsx / CastSheet.tsx
        ├── engine/               # نواة محرك AmberFrame القابلة لإعادة الاستخدام
        └── episodes/             # تعريفات الحلقات والبيانات والمشاهد
```

---

## 2. نواة المحرك (`studio/src/engine/`)

| الملف | الوظيفة والمسؤولية |
| :--- | :--- |
| `amberframe.ts` | المخطط الرسمي لإنتاج الحلقات: أنواع `ScenePlan`, `EpisodeManifest`, `VoiceSegmentSpec`, `VoiceCharacterPreset`, `VOICE_PRESET_SPECS`, `AudioEventSpec`, `QCReport`؛ دوال الكاميرا `motivatedCamera` و`cameraTransform` (مع `dutchDeg`, `handheldAmp`, `spring`) و`handheldOffset`؛ دوال الحركة الفيزيولوجية `breathCurve` و`microTremor`؛ والمدقق الآلي `validateEpisodePlan` (شاملاً فحص `shotTypesUsed >= 4` و`avgShotSec <= 4.2`). |
| `voice_fx.mjs` | محرك المعالجة الصوتية غير التدميري (Node + FFmpeg): `applyVoiceCharacterPresets` لتطبيق قوالب `telephone-caller`, `closet-horror-entity`, `vintage-recorder`, `behind-door` على مقاطع زمنية محددة، و`buildHorrorStingSamples` لتوليد مؤثرات صدمة الرعب (`horror_sting_climax`). |
| `audio_engine.mjs` | محرك الخلط المكاني والموسيقى الديناميكية القابل لإعادة الاستخدام: `computeVoiceDuckEnvelope` للخفض الناعم للموسيقى، `mixSpatialSfxEvent` للتوزيع الستيريو المكاني مع تأخير Haas البيني (`0.5ms`) وانعكاسات الغرفة المبكرة، `buildSubRiserSamples` للتصاعد التوتري، و`renderDynamicHorrorScore` لتوليد موسيقى وترية متعددة التوافقيات مع نبض قلب وصمت درامي. |
| `core.tsx` | نقطة التصدير الموحدة الآمنة للواجهة و`Resvg`: يعيد تصدير `anim`, `rig`, `props`, `kit`, `light`, `room`, `furnish`, `ui`, `fonts.pure`, جميع الخلفيات `sets/*` و`amberframe.ts` مع `ShotFrame`, `Grade`, المكون المشترك **`CinematicSvgOverlay`** (letterbox/danger/flash/vignette)، ودوال `segAt`, `clockAt`, `lookRuns`, `fxAt`. |
| `episode.tsx` | مغلف تكوين حلقات Remotion (`Episode`, `Board`, `defineEpisode`) ويعيد تصدير `clamp`, `Timeline`, `LookDef` ويستخدم `CinematicSvgOverlay` لمطابقة مرحلة الويب والتصدير السحابي. |
| `rig.tsx` | الهيكل البرمجي الموحّد للشخصيات (`Actor` / `Hero`) وكيان الظل (**`ShadowEntity`**) مع تعبيرات الوجه (`Expr`)، الأيادي (`HandKind`: `open`, `point`, `six`)، مكتبة المظاهر `LOOKS` (بما فيها `LOOKS.amberNoir`)، التحكم في التنفس واتساع الحدقة وإضاءة الحافة الموجهة، وحسابات الحركة (`walkPose`, `joints`, `toWorld`, `reachAngle`). |
| `room.tsx` و`furnish.tsx` | حساب المنظور ثلاثي الأبعاد للغرف (`makeRoom` بالإحداثيات `u, v, w`) وبناء الجدران والأرضيات والأثاث (`RoomShell`, `Box`, `BackWindow`, `FloorShadow`, `stand`). يتيح `RoomShell` خيار `texture={false}` للأداء السريع. |
| `light.tsx` و`kit.tsx` و`ui.tsx` | تدرجات الإضاءة، `SetDefs`, `KitDefs`, الغبار العائم `Dust`, التوهج `Glow`, وبطاقات العناوين العربية `ArabicTitleCard`. |
| `fonts.pure.ts` و`fonts.ts` | تعريف عائلات الخطوط العربية (`IBM Plex Sans Arabic`, `Noto Sans Arabic`, `Bricolage Grotesque`, `Fragment Mono`). |
| `sets/*.tsx` | مكتبة البيئات والمشاهد الجاهزة، ومن أبرزها `sets/closet_bedroom.tsx` (`ClosetBedroom`, `CLOSET_ROOM`, `ClosetBedDuvet`, `CLOSET_HANDLE`, `CLOSET_PHONE`) المصممة لغرفة النوم بأسلوب Amber Noir مع شعاع ضوء قمر حجمي، ساعة رقمية `03:07`، باب خزانة مفصلي متحرك، تجسيد `ShadowEntity` مع مخالب أمامية فوق الباب، وبخار تنفس متدرج. |

---

## 3. طبقة السكربتات والأتمتة (`studio/scripts/`)

1. **تحليل الصوت واكتشاف الفواصل (`analyze_audio.mjs`)**:
   - أداة CLI عامة تفحص أي ملف سرد عبر `ffprobe` و`ffmpeg silencedetect` لاستخراج الجزر الكلامية (`speechIslands`) وفجوات الصمت ونقاط القطع المقترحة (`suggestedCutFrames`) قبل بناء `timeline.json`.
2. **إنتاج بيانات القصة**:
   - `build_khizanat_data.mjs` (و`build_episode_data.mjs` للحلقة الأولى): يولّد ملفات `timeline.json`, `storyboard.json`, `episode.json`, و`manifest.json` (بصيغة **18 لقطة ديناميكية** متسارعة في `khizanat-al-ghurfa` على `960` فريم) مع التحقق الصارم من الاتصال الصفري للفريمات ومؤثرات `fx` (`letterbox`, `danger`, `flash`, `shake`).
3. **معالجة الصوت وتوليد المؤثرات**:
   - `build_khizanat_audio.mjs` (و`build_audio.mjs` للحلقة الأولى):
     - يحوّل الصوت المرجعي مؤقتاً إلى WAV أحادي `44.1kHz`، يمرّر `manifest.voiceSegments` إلى `voice_fx.mjs`، ثم يُنتج `voice.mp3`.
     - يولّد مؤثرات WAV (`17` ملفاً مفهرساً في `studio/library/sfx/amberframe/` عبر `sfx_catalog.json`)، ويمزج `20` حدثاً مكانياً عبر `mixSpatialSfxEvent()` في `audio_engine.mjs`.
     - يبني مسار الموسيقى `music.mp3` عبر `computeVoiceDuckEnvelope()` و`renderDynamicHorrorScore()` مع صمت موسيقي متعمد (`21.82s–28.85s`) وضربة الختام (`30.50s`).
     - ينسخ المسارات الثلاثة إلى `studio/public/<slug>/` و`public/<slug>-*.mp3`.
4. **التصدير والتحقق والتغليف**:
   - `export_mp4.mjs`: يدعم `--episode=<slug>`, `--only-keyframes`, `--test-frames=N`, `--skip-audio`. يجمع الكود عبر `esbuild`، يخلط الصوت بمستوى `-14 LUFS`، ويرندر إطارات `1920x1080` مع `CinematicSvgOverlay` عبر `worker_threads` و`@resvg/resvg-js` مباشرة إلى `ffmpeg stdin` (صفر ملفات `.rgba` على القرص).
   - `validate_amberframe.mjs --episode=<slug>` و`validate_episode.mjs`: فحص آلي لصحة الفريمات، الصوت، الإيقاع الديناميكي، الصوتيات المحولة، SFX، ومواصفات MP4 عبر `ffprobe`.
   - `build_zip.mjs`: يضغط مجلد `studio/` (باستثناء `node_modules`, `out`, `.amberframe_cache`) عبر Python `zipfile` إلى `public/exports/AmberFrame_Studio_Complete_Project.zip`.

---

## 4. الخادم وواجهة الاستوديو (`server.ts` و `src/`)

- **`server.ts`** (المنفذ `3000`):
  - `GET /api/health`: حالة الاستوديو.
  - `GET /api/project-validation?episode=...`: يشغّل `validate_amberframe.mjs --episode=...` أو `validate_episode.mjs` ويعيد حالة QC وأحجام ملفات MP4 وZIP.
  - `GET /api/sfx-list?episode=...`: يعيد قائمة ملفات SFX المربوطة ببيانات `sfx_catalog.json`.
  - `POST /api/render-mp4`: يبدأ التصيير بالخلفية عبر `spawn` بدون حجب الخادم (`202 Accepted`).
  - `GET /api/render-status?episode=...`: يرجع نسبة التقدم الحية وعدد الإطارات المنجزة وحالة الجاهزية.
  - `GET /api/download-mp4?episode=...` و`GET /api/download-zip`: تنزيل مباشر للملفات.
  - يخدم `/library/sfx`, `/exports`, ويحمّل `vite.middlewares` في وضع التطوير أو `dist/` في الإنتاج.
- **مزامنة المشغل والعرض في `src/`**:
  - يعمل عنصر الصوت `voiceRef` كساعة رئيسية (`requestAnimationFrame` في `src/App.tsx`).
  - يستخدم `EpisodeStage.tsx` المكون `CinematicSvgOverlay` لمطابقة المعاينة مع MP4، بينما يستطلع `RenderExportView.tsx` المسار `/api/render-status` لعرض شريط التقدم المباشر.
