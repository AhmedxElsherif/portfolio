# Portfolio — Ahmed Hassan

موقع Portfolio ثابت (Static) يعمل على **GitHub Pages** بدون أي سيرفر، ومعه لوحة تحكم لإضافة/تعديل/حذف المشاريع وعرض نماذج ثلاثية الأبعاد (PCB من KiCad وغيرها).

## هيكل الملفات

```
index.html            ← الموقع العام
admin.html            ← لوحة التحكم
data/site.json        ← كل البيانات (الملف الشخصي + المشاريع)
assets/css, assets/js ← التصميم والأكواد
assets/Ahmed_Hassan_CV.pdf
models/               ← ملفات 3D (GLB / WRL / STL / OBJ)
images/               ← صور المشاريع
.nojekyll
```

## الرفع على GitHub Pages

1. ارفع محتويات هذا المجلد إلى المستودع `portfolio` (في الجذر مباشرة، وليس داخل مجلد فرعي).
2. من المستودع: **Settings → Pages → Build and deployment → Source: Deploy from a branch** ثم اختر `main` و `/ (root)`.
3. بعد دقيقة سيعمل الموقع على: `https://ahmedxelsherif.github.io/portfolio/`
   ولوحة التحكم على: `https://ahmedxelsherif.github.io/portfolio/admin.html`

## تشغيل لوحة التحكم (مرة واحدة)

لأن GitHub Pages لا يحتوي على سيرفر، اللوحة تحفظ التعديلات بعمل commit مباشر على المستودع عبر GitHub API:

1. GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate new token.
2. Repository access: **Only select repositories** → اختر `portfolio`.
3. Permissions → Repository permissions → **Contents: Read and write**.
4. افتح `admin.html` → تبويب **Settings** → الصق التوكن → **Save & test connection**.

التوكن يُحفظ في متصفحك فقط (localStorage) ولا يُرفع للمستودع أبدًا. صفحة admin.html عامة لكنها لا تستطيع تعديل أي شيء بدون التوكن.

## الاستخدام اليومي

- **+ New** لإضافة مشروع، **Delete** للحذف، والأسهم ▲▼ لترتيب المشاريع.
- **Upload** بجانب أي صورة أو نموذج 3D يرفع الملف مباشرة إلى `images/` أو `models/` في المستودع.
- **View** يعرض النموذج ثلاثي الأبعاد داخل اللوحة قبل النشر.
- **Preview ↗** يفتح الموقع بالمسودة الحالية قبل النشر.
- **Save & Publish** ينشر التعديلات — يتحدث الموقع خلال دقيقة تقريبًا.
- كل تعديل يُحفظ تلقائيًا كمسودة في المتصفح، فلن تضيع تعديلاتك لو أغلقت الصفحة.
- **Export / Import** لأخذ نسخة احتياطية من `site.json` أو تعديله يدويًا.

## نماذج 3D من KiCad

- الأفضل: **GLB** — من PCB Editor: `File → Export → GLB` (في KiCad 8 وما بعده).
- الإصدارات الأقدم: `File → Export → VRML` (ملف `.wrl`) وهو مدعوم أيضًا.
- مدعوم كذلك: `.gltf`, `.stl`, `.obj` (مثلًا للعلب المصممة في SolidWorks).
- لو ظهرت البوردة واقفة، اكتب `-90` في خانة الدوران X الخاصة بالنموذج.
- يمكن إضافة أكثر من نموذج لنفس المشروع (مثلًا: PCB + Enclosure) وسيظهر لكل منها تبويب.
- حاول إبقاء الملف أقل من 25MB. لضغط ملف GLB كبير:
  `npx @gltf-transform/cli optimize board.glb board-small.glb --compress meshopt`
- ملاحظة: GitHub Pages لا يخدم ملفات Git LFS، لذا ارفع النماذج كملفات عادية.

> النموذج الموجود في `models/smart-pills-box-demo.glb` نموذج تجريبي للعرض فقط — استبدله بملف التصدير الحقيقي من KiCad.

## التجربة على جهازك

افتح الطرفية داخل المجلد ثم:

```
python -m http.server 8000
```

وافتح `http://localhost:8000` (فتح index.html مباشرة بالضغط عليه لن يعمل لأن المتصفح يمنع تحميل ملف JSON محليًا).
