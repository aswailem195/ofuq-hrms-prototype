# المراجع والأصول البصرية

تمت مراجعة المصادر في 14 نوفمبر 2026. الواجهة الأصلية لهذا المشروع مبنية من الصفر؛ لم يُنسخ كود أو شعار أو صور أو واجهة منافسة.

## المراجع المحلية

- `references/01_employee_portal_reference.png`: استُخدم مبدأ جمع هوية الموظف مع الراتب والإجازات والحضور، ثم أُعيدت صياغته بهرمية أهدأ ومساحات أفضل.
- `references/02_admin_dashboard_reference.png`: استُخدم مبدأ القائمة اليمنى الكاملة، المؤشرات العلوية، الرسوم، الموافقات والأنشطة في نظرة واحدة.

## المنتجات والمشاريع

- [BambooHR Platform](https://www.bamboohr.com/platform/): وحدة تجربة الموارد البشرية وربط بيانات الموظف والرواتب والحضور؛ إلهام للمكونات المتماسكة والتحديثات المشتركة.
- [Zoho People welcome guide](https://www.zoho.com/people/welcome-guide.html): فصل خدمات الموظف والملف الشخصي والإجازة والحضور والتقييمات عن الإدارة؛ إلهام للوصول المباشر للخدمة.
- [Headcount README](https://github.com/bluewave-labs/Headcount/blob/main/README.md): إدارة الموظفين والإجازات وسجل الموظف وبدء/نهاية الخدمة. يتضمن رابط [تصاميم Figma](https://www.figma.com/design/GC5nLN8GAXV9NJkzEnDRj3/HRM-app?node-id=1-1207). بيانات المستودع تعلن AGPL-3.0. لم يُنسخ منه كود أو أصول أو تصميم Figma؛ الاستفادة على مستوى تنظيم المجالات فقط.
- [TalentFlow README](https://github.com/N2896/talentflow-hr/blob/main/README.md): تجربة أدوار مختلفة، بيانات محلية مشتركة، طلب إجازة ثم موافقة، وكشف راتب الموظف. لا ترخيص محدد في بيانات المستودع وقت المراجعة؛ لم يُنسخ منه كود أو أصول.
- [WorkSphere README](https://github.com/aimenyusra/hr-management-dashboard/blob/main/README.md): مرشحات متعددة متعاونة، حالات الطلبات، مؤشرات ورسوم وتغذية نشاط. يذكر README ترخيص MIT، لكن ملف LICENSE في جذر المستودع أعاد 404 وبيانات المستودع لم تحدد ترخيصًا؛ لم يُنسخ كود أو أصول. الصفحات التوضيحية المذكورة فيه لم تُنقل إلى هذا النموذج.

## الأصول الأصلية المحلية

تم استخدام أداة `image_gen` المدمجة لإنشاء ثلاث صور أصلية مساندة، ثم حفظها محليًا؛ ليست صورًا ثابتة للواجهة:

- `public/assets/banner-team.png`: تعاون فريق على درجات نمو زرقاء، لاستخدام لوحة الإدارة.
- `public/assets/hero-success.png`: درجات نجاح وقوس ونبتة، لاستخدام بوابة الموظف.
- `public/assets/leave-illustration.png`: حقيبة سفر وقوس ونباتات، لاستخدام الإجازات.

النصوص المستخدمة للتوليد محفوظة بالكامل في `docs/ASSET_PROMPTS.md`. طُلبت لوحة كحلية وزرقاء، أسطح خزفية وورقية مطفأة، ظلال هادئة وخلفية فاتحة، دون أي كتابة أو علامات تجارية. روجعت الصور بصريًا بعد التوليد.

`logo.svg` رسم SVG أصلي كُتب لهذا المشروع. استُبدلت الصور الرمزية المرسومة بـ12 بورتريه فوتوغرافي المظهر مولد بأداة `image_gen` المدمجة، ومحفوظة في `public/assets/avatars/`. الأشخاص افتراضيون بالكامل ولا يمثلون موظفين حقيقيين. يوضح `docs/AVATAR_PROMPTS.md` أوصاف التوليد. لا Hotlinks للصور داخل المنتج.

## الخط

IBM Plex Sans Arabic من [Google Fonts](https://github.com/google/fonts/tree/main/ofl/ibmplexsansarabic)، حقوق IBM Corp. 2017. نُسخة ترخيص SIL Open Font License 1.1 كاملة محفوظة مع الخط في `public/assets/OFL-IBM-Plex-Sans-Arabic.txt`.
