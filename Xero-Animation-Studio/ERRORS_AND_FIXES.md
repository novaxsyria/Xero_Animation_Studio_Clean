# ERRORS_AND_FIXES.md — سجل الأخطاء، الجذور التقنية، والحلول المؤكدة

يفرّق هذا الملف بوضوح بين **الإصلاحات المؤكدة والمختبرة** وبين **القيود/النقاط غير المحلولة** التي يجب الانتباه إليها عند المتابعة.

---

## 1. الإصلاحات المؤكدة (Verified Fixes)

### خطأ 1: اختناق الحاوية وفشل المهلة (`RPC::DEADLINE_EXCEEDED`) أثناء تصدير MP4
- **العَرَض**: توقّف تصيير الإطارات عند تشغيل `export_mp4.mjs` وتعليق أوامر لاحقة حتى انتهاء المهلة.
- **السبب الجذري**: كل إطار `1920x1080` بصيغة RGBA يزن `8.29 MB` (`930` إطار ≈ `7.7 GB`). كانت النسخة القديمة تكتب ملفات `.rgba` على القرص عبر عمال متوازيين على حاوية ذات نواتي CPU فقط، مما أغرق طبقة الإدخال/الإخراج (Disk I/O).
- **الحل المؤكد**:
  - إعادة كتابة `studio/scripts/export_mp4.mjs` للبث المباشر في الذاكرة عبر نقل `ArrayBuffer` من worker إلى `ffmpeg stdin` مع بوابة ضغط خلفي (`readyFrames.size < 4` و`drain`).
  - النتيجة المقاسة: `960` إطاراً أُنجزت في `229.7s` (ومخرج MP4 في `231.8s`, بحجم `8.15 MB`) بدون أي ملف `.rgba` على القرص.
- **الوقاية**: لا تكتب أي إطارات خام على القرص عند التصيير في السحابة. استخدم `--test-frames=12` أولاً لأي تعديل جديد في المحرك.

### خطأ 2: بطء شديد في تصيير SVG عبر `@resvg/resvg-js` (~13.3 ثانية للإطار)
- **العَرَض**: استغراق `Resvg` أكثر من 13 ثانية لإطار واحد.
- **السبب الجذري**:
  1. تفعيل `loadSystemFonts: true` يمسح جميع خطوط النظام في كل إطار.
  2. فلاتر SVG مثل `WallTexture` (`feTurbulence`), `feDropShadow`, وأقنعة `LightVeil` بمساحة `5000x4500` تستهلك معالج `@resvg/resvg-js` البرمجي بشدة.
- **الحل المؤكد**:
  - تعيين `loadSystemFonts: false` وتمرير مسارات الخطوط المطلوبة فقط (`NotoSansArabic-Regular.ttf`, `NotoSansArabic-Bold.ttf`, `DejaVuSansMono.ttf`).
  - إضافة خيار `texture={false}` في `RoomShell` (`studio/src/engine/furnish.tsx`)، وإضافة `rimId=""` في `Actor`، واستخدام تدرجات شعاعية مباشرة (`radialGradient`) بدلاً من `<mask>` كبير في `ClosetBedroom`.
  - النتيجة المقاسة: هبوط زمن الإطار إلى `~250ms–310ms` في المتوسط (`12` إطاراً في `3.1s`).

### خطأ 3: أخطاء توقيت الجمل الحوارية وعدم تميز صوت المتصل وصوت الخزانة
- **العَرَض**:
  1. تأثير الهاتف الأولي كان مضبوطاً خطأً عند `24.22s–25.16s` وبنسبة مزج `55%` فقط — وبفحص الصوت تبيّن أن `24.28s–25.21s` هي جملة الراوي «تتجمد بمكانك...» بينما جملة الهاتف الفعلية «لا تفتح الخزانة... أنا محبوس داخلها!» تقع عند `21.97s–23.99s`، ما جعل صوت المتصل يبدو كالراوي العادي في لقطة `S07`.
  2. جملة «لا تصدقه... أنا اللي اتصلت عليك!» (`28.96s–30.48s`) لم تكن معالجة لتناسب شخصية مرعبة، ولم يكن يتبعها مؤثر رعب (`sfx بعدها رعب`).
- **السبب الجذري**: الاعتماد المبدئي على تقدير بصري لطول الجمل بدلاً من التحقق المسموع لكل شريحة من `silencedetect`.
- **الحل المؤكد**:
  - تقطيع مناطق `silencedetect` الفعلية وسماعها للتحقق من كل كلمة، وتحديث حدود `S03`–`S09` و`EPISODE_ACTS`.
  - إنشاء `studio/src/engine/voice_fx.mjs` وتطبيق `telephone-caller` (`100% wet`, `-2.2st`, `480–2450Hz`) على `21.90s–24.06s`، وتطبيق `closet-horror-entity` (`100% wet`, `-3.8st` + `-7.0st`, صدى تجويف) على `28.90s–30.54s`، وإطلاق `horror_sting_climax` عند `f914` (`30.467s`) مع تمديد النهاية إلى `960` فريم (`32.00s`).
- **الوقاية**: القاعدة #3 و#4 في `AGENTS.md` (سماع شرائح `silencedetect` + `VoiceSegmentSpec` إلزامي).

### خطأ 4: فشل `zip: not found` عند بناء أرشيف المشروع
- **العَرَض**: فشل `build_zip.mjs` لأن أداة سطر الأوامر `zip` غير مثبتة في حاوية Linux.
- **الحل المؤكد**: استبدال استدعاء `zip` باستدعاء `python3` باستخدام المكتبة القياسية `zipfile` (`ZIP_DEFLATED`). تم التحقق بإنتاج `AmberFrame_Studio_Complete_Project.zip` بحجم `18.30 MB`.

### خطأ 5: فشل `esbuild` من `/tmp` في إيجاد `react` (`Cannot find package 'react'`)
- **العَرَض**: عند حزم المشاهد في مجلد مؤقت خارج مساحة المشروع (`/tmp`), تفشل Node في حل حزمة `react`.
- **الحل المؤكد**: وضع ملف الحزمة المؤقت داخل workspace (`studio/.amberframe_cache`) وحذفه فور انتهاء البناء (`fs.rmSync(TMP_DIR, { recursive: true, force: true })`).

### خطأ 6: فشل `tsc --noEmit` في الجذر بسبب استيراد `remotion`، ونقص تصدير في `episode.tsx`
- **العَرَض**:
  1. `tsc --noEmit` في الجذر يفشل على ملفات `studio/` التي تستورد `remotion` لأن `remotion` معرف في `studio/package.json` وليس في `package.json` الجذري.
  2. `hal-taarif-innaka-tahlum/index.tsx` يستورد `clamp`, `Timeline`, `LookDef` من `../../engine/episode` ولم تكن مُصدَّرة هناك.
- **الحل المؤكد**:
  1. استثناء نقاط دخول Remotion الصريحة في `tsconfig.json` الجذري مع إبقاء `core.tsx`, `amberframe.ts`, `rig.tsx`, `sets/*`, و`shots.tsx` تحت فحص `tsc --noEmit`.
  2. إضافة `export { clamp }; export type { Timeline, LookDef };` في `studio/src/engine/episode.tsx`.

### خطأ 7: تحذير React `Invalid DOM property 'transform-origin'`، وخطأ TypeScript `FONT.mono`
- **العَرَض**: ظهور تحذير React حول `transform-origin` في `ShadowEntity` أثناء التصيير الخادمي، وخطأ فحص الأنواع `TS2339: Property 'mono' does not exist` في `closet_bedroom.tsx`.
- **الحل المؤكد**:
  - استبدال `transformOrigin` في `ShadowEntity` (`studio/src/engine/rig.tsx`) بتحويل SVG صريح `translate(0 -122) scale(...) translate(0 122)`.
  - استبدال `FONT.mono` بـ `FONT.ui` (`Fragment Mono, monospace`) في `studio/src/engine/sets/closet_bedroom.tsx` مع توسيع إطار ساعة `03:07` إلى `width={36}`.

### خطأ 8: عيوب تركيبية في الإطارات المفتاحية (تداخل خصلة الشعر مع الهودي، وترتيب طبقات المخالب والباب)
- **العَرَض**: عند الفحص البصري للإطارات المفتاحية ظهرت خصلة شعر تتقاطع مع طوق الهودي البرتقالي، كما ظهرت `ShadowEntity` مزاحة ومخالبها خلف لوح باب الخزانة في `S16`–`S18`.
- **الحل المؤكد**:
  - إخفاء خصلة الشعر الإضافية عندما يكون `L.extra === 'hood'` في `rig.tsx`.
  - توسيط `ShadowEntity` داخل فتحة الباب الأيسر المفتوح (`(CLOSET.w0 + doorMidW) * 0.5 - 0.015`)، ورسم مخالب الكيان **بعد** لوح الباب المفتوح في `closet_bedroom.tsx`.
  - التأكد البصري من الإطارات المعدلة عبر `--only-keyframes` (`frame_0360`, `frame_0408`, `frame_0444`, `frame_0706`, `frame_0794`, `frame_0842`, `frame_0916`, `frame_0922`).

### خطأ 9: تعثر تصدير 960 إطاراً عند الحافة الزمنية للحاوية (~328s) مع تفعيل 28 مستطيل حبوب فيلم (`grain: true`)
- **العَرَض**: توقّف تصدير MP4 عند الإطار ~900 (`327.7s`) أثناء تشغيل `grain: true` وبالتزامن مع مهام بناء أخرى.
- **الحل المؤكد**:
  - ضبط `grain: false` في `CinematicSvgOverlay` داخل `export_mp4.mjs` (مطابقاً للويب وRemotion) واستخدام `-preset veryfast` في `ffmpeg` وتشغيل التصيير منفرداً.
  - النتيجة المقاسة: إتمام جميع الـ `960` إطاراً في `282.4s` وبناء `Khizanat_Al_Ghurfa_1080p.mp4` (`9.33 MB`) كاملاً في `283.1s`.

### خطأ 10: ارتباط `export_mp4.mjs` وحجب `POST /api/render-mp4` لمهلة Express
- **العَرَض**: سابقاً كان `export_mp4.mjs` مرتبطاً بحلقة واحدة ويُشغَّل بـ `execSync` في `server.ts` مما يهدد بانتهاء مهلة HTTP.
- **الحل المؤكد**:
  - تعميم `export_mp4.mjs` و`validate_amberframe.mjs` بوسيط `--episode=<slug>`.
  - تحويل `POST /api/render-mp4` في `server.ts` إلى `spawn` غير حاجز (`202 Accepted`) مع قراءة تقدم الإطارات عبر `GET /api/render-status` وشريط التقدم الحي في `RenderExportView.tsx`.

---

## 2. المشاكل والقيود غير المحلولة (Unresolved Limitations & Open Items)

1. **`studio/node_modules` غير مثبت داخل الحاوية السحابية**:
   - التشغيل المحلي لـ Remotion (`npm run studio` أو `npm run typecheck` داخل `studio/`) يتطلب تنفيذ `npm install` داخل مجلد `studio/` على جهاز المستخدم (أو فك `AmberFrame_Studio_Complete_Project.zip` على Windows ثم تشغيل `npm install` و`.\render_nvidia.ps1`). في الحاوية الحالية يعمل التصيير عبر `export_mp4.mjs` (`@resvg/resvg-js`) ولا يوجد `studio/node_modules`.
2. **الحلقة الأولى `hal-taarif-innaka-tahlum` لا تزال على مسار التصدير التراثي القديم**:
   - تحتفظ الحلقة الأولى بنسختها السليمة الحالية (`music` للمقدمة فقط، `SFX 13%`, `Music 5%`، و`validate_episode.mjs` 6/6) عبر `build_episode_data.mjs` و`build_audio.mjs`، ولم تُرحَّل بعد إلى مخطط `EpisodeManifest`/`audio_engine.mjs` الجديد أو لقطات `export_mp4.mjs` التلقائي السحابي (لتشغيلها السحابي الضخم بـ 17,488 إطاراً يُفضّل التصيير المحلي عبر `render_nvidia.ps1` بعد `npm install`).
3. **متغير البيئة `GEMINI_API_KEY` فارغ في بيئة الخادم الحالية (`KEY_LEN=0`)**:
   - لا يعتمد أي مسار حالي في المشروع على Gemini API وقت التشغيل؛ التحقق من نصوص المقاطع الصوتية تم عبر التقطيع بـ `ffmpeg` والفحص المباشر.
4. **تصيير الويب عبر `POST /api/render-mp4` في بيئة السيرفر السحابي (2 vCPU)**:
   - رغم تحويل الطلب إلى غير حاجز (`202 Accepted` + `GET /api/render-status`)، يستغرق تصيير 960 إطاراً كاملة قرابة `~283s` في الخلفية؛ لذا يُنصح بترك العملية تكتمل دون إطلاق تصيير متوازي ثانٍ (يحميها `renderJob.running` في `server.ts`).
