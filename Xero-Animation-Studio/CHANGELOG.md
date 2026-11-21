# CHANGELOG.md — سجل التطورات والتغييرات الفعلي

يوثق هذا الملف التطورات المنفذة فعلياً في المشروع مرتبة زمنياً من البداية وحتى الحالة الحالية.

---

## المرحلة 1: التأسيس وحلقة «هل تعرف إنك تحلم؟» (`HalTaarifInnakaTahlum`)
- اعتماد محرك `what-if-animation` (الـ `rig`، منظورات الغرف ثلاثية الأبعاد، ومكونات الإضاءة والأثاث) وتكييفه باللغة العربية (`IBM Plex Sans Arabic` و`Noto Sans Arabic`).
- بناء حلقة طويلة كاملة في `studio/src/episodes/hal-taarif-innaka-tahlum/`:
  - **70 مشهد** متصلة تغطي **17,488 فريم** (`582.93` ثانية @ `30 FPS`) عبر 6 فصول (`shots_act1.tsx` – `shots_act6.tsx`).
  - بناء `build_episode_data.mjs`، `build_audio.mjs` (توليد 93 مقطع SFX في `studio/library/sfx/` و122 حدثاً صوتياً متزامناً)، و`validate_episode.mjs` (6 فحوصات نجاح).
  - إزالة العلامات الزائدة من شاشة البداية واعتماد موسيقى المقدمة فقط (أول 10 ثوانٍ) وضبط توازن الخلط الافتراضي للحلقة: `Voice 100%`, `SFX 13%`, `Music 5%`.
  - إضافة سكربتات التصيير لنظام Windows وبطاقة RTX 3060 (`check_gpu.ps1`, `render_nvidia.ps1`, `render_cpu.ps1`).

---

## المرحلة 2: تأسيس نواة AmberFrame وبناء حلقة «من داخل الخزانة» (`KhizanatAlGhurfa`)
- ترقية اسم الاستوديو والواجهة إلى **AmberFrame Studio** مع دعم التبديل الفوري بين الحلقات عبر `src/App.tsx`, `src/types/episode.ts`, `src/components/EpisodeStage.tsx`, و`src/components/RenderExportView.tsx`.
- إضافة وحدات محرك **AmberFrame** القابلة لإعادة الاستخدام:
  - `studio/src/engine/amberframe.ts`: مخططات `ScenePlan`, `EpisodeManifest`, `AudioEventSpec`, `ContinuityMetadata`, `QCReport`, ودوال `motivatedCamera`, `cameraTransform`, `breathCurve`, `microTremor`, و`validateEpisodePlan`.
  - `studio/src/engine/rig.tsx`: إضافة المظهر القياسي **A6 Amber Noir** (`LOOKS.amberNoir`: رأس أسود مطفي `#1A1824`، ملامح `#F6EFE3`، وهودي برتقالي `#FF8A3D`) مع دعم `rimId=""` للتصيير السريع.
  - `studio/src/engine/sets/closet_bedroom.tsx`: غرفة نوم متسقة الجغرافيا (`CLOSET_ROOM`: السرير والكومودينو يساراً، نافذة القمر في الخلف، الخزانة يميناً بباب مفصلي متحرك، بخار تنفس، عيون خافتة بالداخل، وهاتف ذكي بحالات `dim | incoming | connected`).
  - `studio/src/engine/furnish.tsx` و`fonts.pure.ts`: إضافة `texture?: boolean` في `RoomShell` وتوفير بديل `Noto Sans Arabic`.
- بناء المشاهد الـ 9 (`S01`–`S09`) في `studio/src/episodes/khizanat-al-ghurfa/shots.tsx` وتسجيل الحلقة في `studio/src/episodes/index.ts`.
- بناء `studio/scripts/export_mp4.mjs` (تصيير headless عبر `@resvg/resvg-js` + `ffmpeg`) و`build_zip.mjs` (حزم `studio/` باستخدام Python `zipfile` بدلاً من أداة `zip` المفقودة)، وإضافة `/api/render-mp4` و`/api/download-mp4` في `server.ts`.

---

## المرحلة 3: تحويل أصوات الشخصيات، مؤثر الرعب الختامي، وإعادة المزامنة الدقيقة
- **تصحيح المزامنة الصوتية من الجذر**:
  - الاستماع الفعلي وتقطيع مقاطع الصوت المرجعي (`tts-output_10__5aad1f8e.mp3`، `30.792s`) عبر `silencedetect` واكتشاف المواضع الحقيقية الدقيقة لجمل `S03`–`S09` (بما فيها خطأ سابق كان يضع مؤثر الهاتف عند `24.22s` بينما كانت جملة الهاتف الفعلية تقع عند `21.90s–24.06s`).
  - ضبط الحدود النهائية للحلقة على **960 فريم (`32.00s`)**: `30.792s` صوت سردي/حواري كامل + `1.21s` ذيل لمؤثر صدمة الرعب الختامي.
- **إضافة محرك تحويل الأصوات ومؤثرات الرعب (`studio/src/engine/voice_fx.mjs`)**:
  - بناء `applyVoiceCharacterPresets()` لإسناد معالجة صوتية مستقلة بنسبة `100% wet` لكل شخصية في `manifest.voiceSegments` دون المساس بصوت الراوي النظيف:
    - جملة المتصل بالهاتف (`21.90s–24.06s` في `S07`): قالب **`telephone-caller`** (`-2.2` نصف درجة، نطاق `480–2450Hz`، تعزيز ترددات `1180Hz`/`2050Hz`، تشبع سماعة `tanh`، ضغط 7:1، وتشويش خط GSM).
    - جملة الكيان المرعب داخل الخزانة (`28.90s–30.54s` في `S09`): قالب **`closet-horror-entity`** (`-3.8` نصف درجة + طبقة سفلية `-7.0` نصف درجة + صدى تجويف خشبي مغلق + خشونة تنفسية).
  - بناء `buildHorrorStingSamples()` وتوليد مقطع **`horror_sting_climax.wav`** (16 مقطعا في `studio/library/sfx/amberframe/`) ليضرب مباشرة عند `f914` (`30.467s`) عقب جملة «لا تصدقه... أنا اللي اتصلت عليك!» مع اهتزاز ووميض رعب بصري في `S09`.
- **تحديث معايير الفحص والواجهة والسكربتات**:
  - توسيع `amberframe.ts` و`validate_amberframe.mjs` لفحص `VoiceSegmentSpec` وربط `followupSfxClip` (`horror_sting_climax`).
  - تحديث `src/App.tsx`, `src/types/episode.ts`, `PlayerView.tsx`, `AudioSfxView.tsx`, `RenderExportView.tsx`, `render_nvidia.ps1`, `render_cpu.ps1`, و`studio/README.md` + `studio/IMPLEMENTATION_REPORT.md`.
- **إعادة كتابة `export_mp4.mjs` للبث الصفري في الذاكرة**:
  - التخلص التام من كتابة ملفات `.rgba` المؤقتة على القرص وبث الإطارات مباشرة عبر `ArrayBuffer` إلى `ffmpeg stdin` مع التحكم بالضغط الخلفي.
  - التحقق الناجح: تصدير `Khizanat_Al_Ghurfa_1080p.mp4` (`8.15 MB`, `1920x1080 @ 30 FPS`, `32.00s`) خلال `231.8s` دون أي انقطاع، وتحديث `AmberFrame_Studio_Complete_Project.zip` (`18.30 MB`)، واجتياز `compile_applet`, `lint_applet`, `validate_amberframe.mjs` (6/6), و`validate_episode.mjs` (6/6).

---

## المرحلة 4: الترقية الشاملة لمحرك السينما، الصوت المكاني، وإعادة إنتاج الـ 32 ثانية بـ 18 لقطة
- **إخراج ومونتاج ديناميكي من 18 لقطة (`S01`–`S18`)**:
  - إعادة بناء `build_khizanat_data.mjs` و`studio/src/episodes/khizanat-al-ghurfa/shots.tsx` إلى **18 لقطة متسارعة** عبر **11 نوع لقطة** (`establishing`, `wide`, `medium`, `close-up`, `extreme-close-up`, `over-shoulder`, `pov`, `reaction`, `insert`, `reveal`, `tracking`) بمتوسط **`1.78s`/لقطة** على **960 فريم (`32.00s`)**، مربوطة بفواصل الكلام الفعلية المكتشفة عبر أداة CLI الجديدة `studio/scripts/analyze_audio.mjs`.
  - إضافة انحراف الكاميرا الفيزيولوجي (`handheldOffset` في `amberframe.ts`)، وزوايا الهولندي (`dutchDeg`) أثناء الذعر (`S14`/`S18`)، وحركة النابض (`spring` / `backOut`).
- **ترقية العتاد البصري، الإضاءة الحجمية، وكيان الظل (`rig.tsx` و`closet_bedroom.tsx`)**:
  - إضافة **`ShadowEntity`** في `studio/src/engine/rig.tsx` مع تحجيم حدقة مرعب متوافق مع React عبر `translate(0 -122) scale(...) translate(0 122)` دون `transform-origin`.
  - تحسين `Hero`/`Actor` بالتنفس المستمر (`breath`)، اتساع/ضيق الحدقة (`pupilScale`)، إضاءة الحافة الموجهة (`lightColor`, `lightStrength`, `lightSide`)، أكمام وجيب وحافة جاكيت محبوكة، وحذف تداخل خصلة الشعر مع الهودي البرتقالي.
  - ترقية `ClosetBedroom` (`sets/closet_bedroom.tsx`): شعاع ضوء قمر حجمي، ساعة كومودينو رقمية `03:07` (بخط `FONT.ui`)، إضاءة شاشة الجوال المنعكسة، شارة `«رقم غريب»` أوضح مع تحديد، توسيط `ShadowEntity` داخل فتحة الخزانة اليسرى، ورسم المخالب المتشابكة **بعد** لوح الباب المفتوح لتظهر فوق حافته.
- **توحيد طبقة ما بعد الإنتاج (`CinematicSvgOverlay`)**:
  - إنشاء `CinematicSvgOverlay` وتوسيع `fxAt()` في `studio/src/engine/core.tsx` لدعم شريط السينما `2.25:1` (`letterbox`)، النبض الأحمر للخطر (`danger`)، الفلاش (`flash`)، والاهتزاز (`shake`) وتطبيقها بشكل موحّد في `EpisodeStage.tsx`، `episode.tsx` (Remotion)، و`export_mp4.mjs`.
- **محرك الصوت المكاني والموسيقى متعددة التوافقيات (`studio/src/engine/audio_engine.mjs`)**:
  - إنشاء وحدة عامة تضم `computeVoiceDuckEnvelope` (خفض ناعم بمراقبة RMS)، `mixSpatialSfxEvent` (توزيع ستيريو بتأخير Haas `0.5ms` وانعكاسين مبكرين للغرفة `11ms`/`19ms`)، `buildSubRiserSamples`، و`renderDynamicHorrorScore` (وتر قوس متعدد التوافقيات D2+A2+F3+Eb3 مع نبض قلب متسارع `64–110 BPM` وصمت موسيقي تام عند `21.82s–28.85s` يعقبه انفجار وتري عند `f915` / `30.50s`).
  - ترقية `build_khizanat_audio.mjs` لتوليد **`17` ملف WAV** مفهرساً ومزج **`20` حدث SFX مكانياً** متطابقاً مع `32.03s` للمسارات الثلاثة، مع الحفاظ الكامل على `telephone-caller` (`100% wet`, `21.90s–24.06s`) و`closet-horror-entity` (`28.90s–30.52s`) متبوعاً بـ `horror_sting_climax`.
- **تعميم السكربتات وتصيير السيرفر غير الحاجز**:
  - تعميم `export_mp4.mjs` و`validate_amberframe.mjs` بوسيط `--episode=<slug>`، وإضافة `--only-keyframes` للفحص البصري، وضبط `-preset veryfast` مع `grain: false` في Resvg.
  - تحويل `POST /api/render-mp4` في `server.ts` إلى مهمة خلفية غير حاجزة (`202 Accepted`) مع مسار تتبع حي `GET /api/render-status` وشريط تقدم في `RenderExportView.tsx`.
  - التحقق المقاس: نجاح تصدير `Khizanat_Al_Ghurfa_1080p.mp4` (`9.33 MB` / `9,779,249` بايت، `1920x1080 h264 bt709 @ 30 FPS + AAC`, `32.00s`, جهارة مقاسة `-14.6 LUFS`, `LRA 1.7 LU`, `Peak -4.3 dBFS`) خلال `283.1s`، وفحص الإطارات المفتاحية بصرياً، واجتياز `validate_amberframe.mjs` (6/6)، و`validate_episode.mjs` (6/6)، وتحديث `AmberFrame_Studio_Complete_Project.zip` (`18.45 MB`).
