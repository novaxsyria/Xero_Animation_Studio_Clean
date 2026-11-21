# AGENTS.md — التعليمات الدائمة لمحرك AmberFrame Studio

هذا الملف هو الدليل التشغيلي الدائم للوكيل (Gemini) وللمطورين عند العمل على هذا المشروع أو إنتاج أي قصة جديدة داخل **AmberFrame Animation Studio**. يجب قراءته والالتزام به قبل تعديل أي كود أو إنشاء حلقة جديدة.

---

## 1. المبادئ غير القابلة للكسر (Hard Rules)

1. **عدم المساس بالملفات الصوتية المرجعية الأصلية**:
   - ملف السرد الذي يرفعه المستخدم (مثل `public/assets/aistudio/*.mp3`) هو المرجع الزمني الأعلى (**Authoritative Clock**). يُمنع الكتابة فوقه أو تعديله.
   - أي معالجة صوتية (مثل مؤثرات الهاتف أو صوت الرعب) تُنفَّذ **بطريقة غير تدميرية (Non-destructive)** على نسخة العمل (`voice.mp3`) عبر `studio/src/engine/voice_fx.mjs`.

2. **حماية الحلقات المكتملة والمحرك المشترك**:
   - يُمنع حذف أو تخريب الحلقات السابقة المسجلة في `studio/src/episodes/index.ts` (حالياً: `KhizanatAlGhurfa` و`HalTaarifInnakaTahlum`)، ويجب الحفاظ على نجاح `validate_episode.mjs` و`validate_amberframe.mjs`.
   - أي ميزة جديدة عامة (كاميرا، إضاءة، مؤثرات صوت شخصية، إخفاء موسيقي، فحص جودة QC) تُضاف أولاً إلى المحرك الأساسي في `studio/src/engine/` ولا تُحصر داخل ملف حلقة واحدة.

3. **ممنوع التخمين الزمني في المزامنة الصوتية**:
   - لا تفترض توقيت الجمل العربية من طول النص.
   - يجب استخراج مناطق الكلام والصمت الفعلي من ملف الصوت عبر `ffmpeg -af "silencedetect=..."` ثم قصّ/سماع المقاطع للتأكد 100% من الحدود الدقيقة لكل جملة حوارية أو وصفية قبل كتابة `startFrame`/`endFrame` أو `voiceSegments`.

4. **تحويل صوت الشخصيات ومؤثر الرعب الإلزامي (Engine Audio Law)**:
   - صوت الراوي يبقى صافياً (`narrator-clean`) في جمل السرد.
   - أي جملة تنطقها شخصية غير الراوي داخل القصة **يجب** أن يتغيّر صوتها فعلياً عبر `VoiceSegmentSpec` في `manifest.json` ومعالج `applyVoiceCharacterPresets()` في `studio/src/engine/voice_fx.mjs`:
     - متصل عبر الهاتف: preset = `telephone-caller` (`wetMix: 1.0` — بدون تسريب للصوت الجاف النظيف).
     - كيان مرعب / صوت مخيف داخل الخزانة أو الظلام: preset = `closet-horror-entity` (`-3.8st` + طبقة ظل `-7.0st` + صدى حيز مغلق).
     - مسجل قديم: preset = `vintage-recorder`.
     - صوت خلف باب/حاجز: preset = `behind-door`.
   - **قاعدة الرعب (`sfx بعدها رعب`)**: كل سطر حواري مرعب/مخيف (`closet-horror-entity`) يجب أن يُتبع فوراً بعد نهايته بمؤثر رعب صوتي (`followupSfxClip` مثل `horror_sting_climax` من `buildHorrorStingSamples`) مع توسيع زمن النهاية (`outroSfxTailSec`) كي يضرب الرعب بصرياً وصوتياً قبل التلاشي للأسود.

5. **جغرافية المشهد الثابتة (Spatial Continuity)**:
   - لا تعكس مواقع الأثاث الثابت (السرير، الخزانة، النافذة، الباب) بين اللقطات داخل الغرفة نفسها.
   - احفظ الجغرافية في `continuity` داخل `ScenePlan` وتحقق منها تلقائياً في `validateEpisodePlan`.

6. **أداء التصيير في البيئة السحابية (`@resvg/resvg-js`)**:
   - **يُمنع كتابة ملفات `.rgba` مؤقتة على القرص** أثناء التصدير الجماعي (تتسبب في اختناق I/O وتجاوز مهلة الحاوية `DEADLINE_EXCEEDED`). يجب البث المباشر في الذاكرة (`ffmpeg stdin`) مع backpressure كما في `studio/scripts/export_mp4.mjs` وبإعداد `grain: false` و`-preset veryfast`.
   - في لقطات التصيير السريع داخل السيرفر (`Resvg`): استخدم خطوط عربية محددة (`fontFiles` مع `loadSystemFonts: false`)، وتجنّب أقنعة `5000x4500` أو فلاتر `feTurbulence`/`feDropShadow` الثقيلة على كل إطار (`texture={false}`, `rimId=""` عند الحاجة).

7. **حدود الفحص النوعي بين الواجهة و Remotion (`tsconfig.json`)**:
   - الواجهة الأمامية والخادم يعتمدان على `package.json` في الجذر، بينما حزم Remotion معرفّة في `studio/package.json` (غير مثبّتة داخل `studio/node_modules` في بيئة البناء السحابية).
   - لذلك يستثني `tsconfig.json` في الجذر ملفات مدخل Remotion الصريحة (`studio/src/index.ts`, `studio/src/Root.tsx`, `studio/src/engine/episode.tsx`, `studio/src/episodes/*/index.tsx`, إلخ). عند استيراد أي دالة مشتركة في الواجهة أو السكربتات، استوردها من `studio/src/engine/core.tsx` أو `studio/src/engine/amberframe.ts` — لا تستورد `remotion` في كود الواجهة.

8. **توحيد المؤثرات البصرية بعد الإنتاج (`CinematicSvgOverlay`) وترتيب الطبقات (Z-Order)**:
   - يجب أن تمر لقطات المعاينة في الويب (`EpisodeStage.tsx`)، وRemotion (`episode.tsx`)، والتصدير السحابي (`export_mp4.mjs`) عبر `CinematicSvgOverlay` من `studio/src/engine/core.tsx` لضمان تطابق الـ Letterbox (`2.25:1`)، النبض الخطر الأحمر (`danger`)، والفلاش (`flash`) والاهتزاز (`shake`).
   - داخل المشاهد ذات الأبواب المفصلية والكيانات (`ClosetBedroom` + `ShadowEntity`): تُرسم `ShadowEntity` داخل تجويف الباب المفتوح مع استخدام `translate(...) scale(...) translate(...)` في SVG بدل `transform-origin`، وتُرسم مخالب اليد **بعد** لوح الباب (`door leaf`) لتظهر ملتفةً أمام الحافة.

9. **معيار الإيقاع الديناميكي والهندسة الصوتية المكانية (`audio_engine.mjs` + `analyze_audio.mjs`)**:
   - استخدم أداة الاكتشاف `node studio/scripts/analyze_audio.mjs --input=<audio.mp3>` لاستخراج مناطق الكلام والفواصل (`silencedetect`) ونقاط القطع المقترحة قبل تأليف `timeline.json`.
   - يُشترط في القصص السينمائية القصيرة اجتياز فحص الإيقاع في `validateEpisodePlan()` (`shotTypesUsed >= 4` و`avgShotSec <= 4.2`).
   - استخدم `studio/src/engine/audio_engine.mjs` لخفض الموسيقى الناعم (`computeVoiceDuckEnvelope`)، والمزج المكاني (`mixSpatialSfxEvent` بتأخير Haas `0.5ms` وانعكاسات الغرفة المبكرة)، وبناء الموسيقى متعددة التوافقيات مع نبض القلب والصمت الدرامي (`renderDynamicHorrorScore`, `buildSubRiserSamples`).

10. **حيادية السكربتات وتصيير السيرفر غير الحاجز (`--episode=<slug>`)**:
    - تُمرَّر جميع الحلقات عبر `--episode=<slug>` في `export_mp4.mjs` و`validate_amberframe.mjs`، مع استخدام `--only-keyframes` لفحص الإطارات المفتاحية بصرياً قبل التصدير الكامل.
    - في `server.ts`، يبقى `POST /api/render-mp4` غير حاجز (`spawn` + `202 Accepted`) مع تتبّع التقدم عبر `GET /api/render-status`.

---

## 2. قائمة التحقق القياسية قبل إضافة أي قصة جديدة

عندما يطلب المستخدم إنتاج حلقة/قصة جديدة (نص + ملف صوتي):

1. حلّل ملف الصوت المرجعي عبر:
   `node studio/scripts/analyze_audio.mjs --input=<source.mp3> --fps=30 --tail=1.21`
   واسماعياً للتحقق 100% من حدود كل جملة وحوار.
2. أنشئ مجلداً جديداً تحت `studio/src/episodes/<slug>/` بدون لمس الحلقات الأخرى.
3. ابنِ سكربت بيانات `studio/scripts/build_<slug>_data.mjs` يولّد:
   - `timeline.json` (فريمات متصلة من `0` إلى `total` بدون فجوات أو تداخل، متضمناً `fx` من نوع `letterbox`/`danger`/`flash`/`shake`).
   - `storyboard.json` (وصف اللقطات، الكاميرا، `dutchDeg`, `handheldAmp`, الحركة، الإضاءة، المؤثرات، `voicePerspective`).
   - `manifest.json` (متوافق مع `EpisodeManifest` في `amberframe.ts` متضمناً `voiceSegments`, `outroSfxTailSec`, `sfxCatalogDir`, و`exportFileName`).
   - `episode.json`.
4. ابنِ سكربت صوت `studio/scripts/build_<slug>_audio.mjs` يستدعي `applyVoiceCharacterPresets()` من `studio/src/engine/voice_fx.mjs` ودوال `audio_engine.mjs` ويولّد 3 مسارات متطابقة المدة (`voice.mp3`, `sfx.mp3`, `music.mp3`) في `studio/public/<slug>/` وفي `public/<slug>-*.mp3`.
5. نفّذ مشاهد JSX/SVG في `studio/src/episodes/<slug>/shots.tsx` وسجّل الحلقة في:
   - `studio/src/episodes/index.ts` (لـ Remotion).
   - `src/types/episode.ts` و`src/components/EpisodeStage.tsx` و`src/App.tsx` (لاستوديو الويب).
   - `studio/render_nvidia.ps1` / `studio/render_cpu.ps1` عند الحاجة لتصدير الحلقة الجديدة محلياً.
6. شغّل `node studio/scripts/export_mp4.mjs --episode=<slug> --only-keyframes` وافحص الصور بصرياً، ثم شغّل التصدير الكامل لملف MP4، ثم تحقّق من:
   - `node studio/scripts/validate_amberframe.mjs --episode=<slug>`
   - `node studio/scripts/validate_episode.mjs` (لضمان سلامة `HalTaarifInnakaTahlum`)
   - `node studio/scripts/build_zip.mjs` و`compile_applet` + `lint_applet`.
7. **حدّث ملفات التوثيق الخمسة (`AGENTS.md`, `ARCHITECTURE.md`, `CHANGELOG.md`, `ERRORS_AND_FIXES.md`, `VIDEO_PRODUCTION.md`)** بعد أي تطوير جوهري في المحرك.
