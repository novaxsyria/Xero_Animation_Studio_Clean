# VIDEO_PRODUCTION.md — معايير إنتاج الفيديو في AmberFrame Studio

هذا المرجع يحدد المعايير الفنية والهندسية لإنتاج أي قصة متحركة جديدة من النص العربي والملف الصوتي حتى ملف MP4 النهائي بدقة 1080p.

---

## 1. المواصفات التقنية القياسية (Output Spec)
- **الدقة ومعدل الإطارات**: `1920 × 1080` (16:9)، `30 FPS` (`studio/src/studio.config.ts`).
- **الألوان والتشفير**:
  - محلياً (Windows RTX 3060): `h264_nvenc -preset p7 -tune hq -rc vbr -cq 16` + `yuv420p` + وسوم `bt709`، وصوت `AAC 320kbps`.
  - تصدير السحابة (`export_mp4.mjs`): `libx264 -preset veryfast -crf 17` + `yuv420p` + `bt709` + `-movflags +faststart`، وصوت `AAC 192kbps`.
- **تطبيع الصوت النهائي**: `-14 LUFS` (`loudnorm=I=-14:TP=-1.5:LRA=11` عند `48kHz stereo`).
- **الخطوط العربية**: `IBM Plex Sans Arabic` في الويب وRemotion، و`Noto Sans Arabic` (`NotoSansArabic-{Regular,Bold}.ttf`) كخط مؤكد في تصيير `@resvg/resvg-js`.

---

## 2. تحليل الصوت والمزامنة بالسيلابل (Audio-First Timing)

1. **قياس المدة واكتشاف الفواصل آلياً (`analyze_audio.mjs`)**:
   - شغّل أداة التحليل القابلة لإعادة الاستخدام مع أي قصة:
     ```bash
     node studio/scripts/analyze_audio.mjs --input=<source.mp3> --fps=30 --tail=1.21
     ```
   - يستخرج السكربت الجزر الكلامية (`speechIslands`)، فجوات الصمت (`silencedetect=-34dB:d=0.10`)، ونقاط القطع النظيفة (`suggestedCutFrames`).
2. **التحقق من الجمل قبل تقسيم الفريمات**:
   - قصّ واسمع أي مناطق مشكوك فيها حول الحوارات لتثبيت الثواني الدقيقة لكل جملة.
   - **قاعدة الإيقاع الديناميكي**: قسم القصة إلى لقطات متعددة الزوايا (تأسيس، متوسطة، قريبة، ردود فعل، إدخال، كشف) بحيث لا تقل الأنواع المستخدمة عن 4 ومعدل مدة اللقطة `<= 4.2s` في القصص القصيرة، مع اتصال صفري (`startFrame === prevScene.endFrame`).
3. **ذيل الرعب بعد النهاية (`outroSfxTailSec`)**:
   - إذا انتهى النص الصوتي بجملة مرعبة أو صدمة، أضف `1.2s–2.0s` بعد آخر لفظ في `totalFrames` كي يكتمل مؤثر الرعب (`horror_sting_climax`) والتلاشي للأسود بشكل سينمائي غير مبتور.

---

## 3. تحويل أصوات الشخصيات ومعايير الصوت الدرامي

يُدار الصوت عبر **3 مسارات منفصلة** (`voice.mp3`, `sfx.mp3`, `music.mp3`) عبر `voice_fx.mjs` و`audio_engine.mjs`:

### أ. مسار الصوت (`voice.mp3` عبر `studio/src/engine/voice_fx.mjs`)
- **الراوي (`narrator-clean`)**: يُترك صافياً تماماً دون فلاتر.
- **مكالمة هاتفية (`telephone-caller`)**:
  - تطبيق مبلّل `100%` (`wetMix: 1.0`) بانتقال `25ms` داخل فجوات الصمت حول الجملة.
  - خفض نبرة `-2.2` نصف درجة، مرشح نطاق `480–2450Hz`، تعزيز `1180Hz (+8.5dB)` و`2050Hz (+4.5dB)`، ضغط 7:1، تشبع `tanh`، وتشويش خط GSM خفيف.
- **كيان مرعب / صوت من داخل الخزانة (`closet-horror-entity`)**:
  - تطبيق مبلّل `100%` مع خفض نبرة `-3.8` نصف درجة + طبقة ظل سفلية `-7.0` نصف درجة (`lowpass 540Hz`) + صدى حيز خشبي مغلق (`aecho`) + خشونة تنفسية، مع تعزيز وضوح الحروف حول `3050Hz`.
- **أوضاع إضافية جاهزة**: `vintage-recorder` و`behind-door`.

### ب. مسار المؤثرات الصوتية (`sfx.mp3` عبر `audio_engine.mjs`)
- **المزج المكاني (`mixSpatialSfxEvent`)**: توجيه ستيريو ثابت الطاقة (`spatialPan`) + توهين مسافة + تأخير Haas بين الأذنين (`~0.5ms`) + انعكاسين مبكرين للغرفة (`11ms` و`19ms`).
- **التصاعد التوتري (`buildSubRiserSamples`)**: موجة وترية صاعدة مع هواء مصفّى قبل لحظات الذروة.
- **قاعدة `sfx بعدها رعب`**: بعد أي جملة بصوت `closet-horror-entity` مباشرةً، فعّل ضربة رعب (`horror_sting_climax` عبر `buildHorrorStingSamples`) مع تفاعل بصري في نفس الفريم (`flash + shake + danger`).

### ج. مسار الموسيقى (`music.mp3` عبر `audio_engine.mjs`)
- **الخفض التلقائي الناعم (`computeVoiceDuckEnvelope`)**: حساب مغلف RMS كل `20ms` مع هجوم سريع وتحرير ناعم لتفادي التموج أثناء السرد.
- **الموسيقى متعددة التوافقيات (`renderDynamicHorrorScore`)**: دمج وتر D2 + A2 + F3 + Eb3 التوتري مع نسيج قوس خفيف ونبض قلب يتسارع مع الاقتراب (`64–110 BPM`).
- **الصمت الموسيقي المتعمد (`intentional-silence`)**: أوقف الموسيقى إلى الصفر في لحظات التحذير الحاسمة (`21.82s–28.85s` في `khizanat-al-ghurfa`) ثم عد بضربة مفاجئة عند الذروة.
- **سياسة الحلقات التعليمية/الطويلة**: مثل `hal-taarif-innaka-tahlum` حيث طلب المستخدم إبقاء الموسيقى في الانترو فقط وبمستوى خلط `Voice 100% / SFX 13% / Music 5%` (مقابل خلطة الرعب القصير `Voice 100% / SFX 88% / Music 65%` في `khizanat-al-ghurfa`).

---

## 4. التصوير، الكاميرا، الإخراج البصري، والحركة

- **اتجاه الفن Amber Noir (`A6 Amber Noir`) وبيئة `ClosetBedroom`**:
  - لوحة داكنة زرقاء-فحمية (`#080A14`, `#1F233A`) مع شعاع قمر حجمي، توهج شاشة جوال ديناميكي، ساعة رقمية `03:07`، وتجسيد `ShadowEntity` مع مخالب تُرسم فوق حافة الباب المفتوح.
  - الشخصية القياسية `LOOKS.amberNoir`: رأس أسود مطفي `#1A1824`، ملامح `#F6EFE3`، وهودي برتقالي `#FF8A3D` مع حركة تنفس، تضييق حدقة عند الصدمة، وإضاءة حافة موجهة (`lightSide`/`lightColor`/`lightStrength`).
- **تحريك الكاميرا المبرّر (`motivatedCamera`) والانحراف الحركي**:
  - دعم `handheldOffset()` للانجراف التنفسي الموزون أثناء الخوف، والزوايا المائلة (`dutchDeg`) أثناء الذعر، ودالة `spring` (`backOut`) للردود السريعة.
- **طبقة ما بعد الإنتاج الموحدة (`CinematicSvgOverlay`)**:
  - توحيد شريط السينما `2.25:1` (`letterbox`)، الحواف القرمزية النابضة (`danger`)، الفلاش (`flash`)، والفينيت عبر الويب وRemotion و`export_mp4.mjs` (مع إبقاء `grain={false}` في Resvg للحفاظ على سرعة التصيير).

---

## 5. التغليف والتحقق قبل التسليم (Release Checklist)
1. تشغيل `node studio/scripts/analyze_audio.mjs` ثم `build_<slug>_data.mjs` و`build_<slug>_audio.mjs`.
2. فحص مقاطع الحوار المحوّلة ومؤثر الرعب الختامي والتأكد من خلو الراوي من أي تداخل.
3. تشغيل `node studio/scripts/export_mp4.mjs --episode=<slug> --only-keyframes` ومراجعة الإطارات المفتاحية بصرياً (`studio/out/keyframes_*`) قبل التصدير الكامل.
4. تشغيل التصدير الكامل `node studio/scripts/export_mp4.mjs --episode=<slug>` وفحص الصوت النهائي بـ `ffprobe` و`ebur128`.
5. نجاح `validate_amberframe.mjs --episode=<slug>` و`validate_episode.mjs`، `build_zip.mjs`، `npm run build` (`vite build`)، و`npm run lint` (`tsc --noEmit`).
