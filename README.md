# TAD — fanni o'qitish uchun interaktiv ta'lim platformasi

Bitta fanni chuqur o'zlashtirishga mo'ljallangan to'liq platforma. U **Cloudflare Workers + D1 + Workers AI** asosida ishlaydi va hech qanday alohida server talab qilmaydi.

Platforma dunyodagi yetakchi ta'lim platformalarining eng yaxshi yondashuvlarini birlashtiradi:

| Namuna | Platformadagi o'rni |
|---|---|
| **Coursera / edX** | Fan → bo'lim → dars → mashg'ulot tuzilmasi, fan dasturi va o'quv maqsadlari |
| **Khan Academy** | To'liq o'zlashtirish (mastery), har bir javobga izoh, qayta topshirish, shaxsiy tavsiyalar |
| **Duolingo** | XP, darajalar, kunlik seriya (streak), nishonlar va haftalik reyting |
| **Anki / Quizlet** | Kartochkalar va SM-2 algoritmi bo'yicha intervalli takrorlash |
| **Kahoot / Mentimeter / Padlet** | Interaktiv doska: aqliy hujum, Venn, INSERT, FSMU, SWOT va boshqa metodlar |
| **Labster / PhET** | Laboratoriya ishlari: bosqichlar, kuzatuvlar, simulyatsiya havolalari, nazorat savollari |
| **Harvard Case Method** | Keys (vaziyatli masala) mashg'ulotlari va ularni AI yordamida baholash |
| **Khanmigo** | Sokratik AI-yordamchi (tayyor javob bermaydi, fikrlashga yo'naltiradi) |

---

## Imkoniyatlar

### O'quvchi uchun
- **13 xil mashg'ulot turi:** taqdimot slaydlari, ma'ruza/video, test (5 xil savol turi, vaqt cheklovi bilan), kartochkalar, moslashtirish, ketma-ketlikni tiklash, bo'sh joylarni to'ldirish, guruhlash, laboratoriya ishi, amaliy topshiriq, keys, esse/refleksiya va interaktiv doska.
- **Darhol fikr-mulohaza:** testlarda har bir savolga izoh beriladi. Ochiq javobli ishlarni (laboratoriya, keys, amaliy ish) **AI rubrika asosida** baholaydi, kuchli tomonlarni va nimani yaxshilash kerakligini ko'rsatadi.
- **Shaxsiy AI-tavsiyalar:** zaif mavzular, keyingi qadamlar va o'qish bo'yicha maslahatlar.
- **AI-yordamchi (tyutor):** har bir darsda shu dars materiali asosida sokratik yoki tushuntiruvchi rejimda ishlaydi.
- **Intervalli takrorlash:** barcha kartochkalar avtomatik ravishda kundalik takrorlash navbatiga qo'shiladi.
- **Rag'batlantirish:** XP, 10 ta daraja, kunlik seriya, 20 ta nishon, guruh reytingi (haftalik, oylik va umumiy).
- **Qo'shimcha topshiriqlar:** o'qituvchi bergan individual topshiriqlar; ular bonus XP olib keladi va AI tomonidan baholanadi.
- Matematik formulalar (KaTeX), mobil qurilmalarga moslashgan dizayn, yorug' va qorong'i mavzu.

### O'qituvchi uchun
- **Kurs muharriri:** fan dasturi, o'quv maqsadlari, adabiyotlar, bo'limlar, darslar (ma'ruza, amaliy, laboratoriya, seminar, mustaqil ta'lim) va mashg'ulotlar.
- **Materiallarni ommaviy yuklash:** butun fanni bitta JSON fayl orqali import qilish mumkin (format quyida keltirilgan). Eksport ham bor.
- **AI studiya:** mavzu yoki ma'ruza matni asosida test, kartochkalar, keys, laboratoriya ishi, amaliy topshiriq, slaydlar va **dars ishlanmasi (texnologik xarita)** yaratiladi. Fan dasturidan kurs tuzilmasini avtomatik tuzish ham mumkin.
- **Guruhlar:** qo'shilish kodi va taklif havolasi orqali ishlaydi.
- **Jurnal (gradebook):** barcha baholar bitta jadvalda, 5 ballik baho bilan; Excel (CSV) formatida eksport qilinadi.
- **Analitika:** mashg'ulotlar bo'yicha o'rtacha natijalar, eng qiyin mavzular, e'tibor talab qiladigan o'quvchilar, baholar taqsimoti, faollik grafigi va **AI pedagogik tahlil**.
- **Tekshirish navbati:** AI qo'ygan bahoni tasdiqlash yoki o'zgartirish va izoh yozish.
- **Rag'batlantirish:** bonus XP va nishonlar ("Faol o'quvchi", "Ijodkor", "Lider" va boshqalar), bir yoki bir nechta o'quvchiga birdaniga.
- **Qo'shimcha topshiriqlar:** guruhga yoki tanlangan o'quvchilarga, muddat, ball va AI baholash bilan.
- **E'lonlar** va bildirishnomalar.
- **Metodlar kutubxonasi:** 26 ta pedagogik metod (aqliy hujum, klaster, INSERT, Venn, FSMU, zig-zag, bumerang, keys-stadi, olti qalpoqcha, SWOT, baliq skeleti, BBB, sinkveyn, debat, teskari sinf, PBL, mastery learning va boshqalar). Har birida bosqichlar, vaqt va maslahatlar bor, Bloom taksonomiyasi bo'yicha qo'llanma ham kiritilgan.
- **Dars vositalari:** taymer, tasodifiy o'quvchi tanlash, guruhlarga bo'lish va olti qalpoqcha rollarini taqsimlash.

### Administrator uchun
- Foydalanuvchilar va rollar (administrator, o'qituvchi, o'quvchi), parolni tiklash, AI holati.
- **Ro'yxatdan o'tgan birinchi foydalanuvchi avtomatik ravishda administrator bo'ladi.**

---

## "Tadbirkorlik asoslari" faniga moslashtirilgan imkoniyatlar

- **💼 Biznes loyiham** — semestr davomidagi vertikal loyiha uchun ish maydoni. U 12 bo'limdan iborat: g'oya, 9 blokli biznes-model, mijoz portreti, bozor va raqobat, SWOT, huquqiy shakl va soliq, narx va zararsizlik nuqtasi, marketing, 3 oylik pul oqimi, xavflar matritsasi, moliyalashtirish va pitch. Ma'lumotlar avtomatik saqlanadi. Zararsizlik nuqtasi, kassa uzilishi va xavf darajalari avtomatik hisoblanadi. Barcha bo'limlardan **biznes-reja hujjati** yig'iladi (chop etish yoki PDF). AI ekspert bahosi beriladi, o'qituvchi esa izoh qoldiradi.
- **🧮 Biznes kalkulyatorlari** — zararsizlik nuqtasi (grafik bilan), narx va tannarx, kredit (annuitet yoki differensial to'lov jadvali), soliq rejimlarini solishtirish, ROI va qoplanish muddati, bozor hajmi (TAM/SAM/SOM), reklama samaradorligi (CAC, ROMI).
- **📚 Resurslar** — 108 ta atamali lug'at, 12 ta shablon (biznes-reja, canvas, persona, intervyu, shartnoma, bank suhbati, pitch-deck hamda pul oqimi, daromad-xarajat, kontent-reja, xavflar va CRM uchun Excel jadvallari), rasmiy manbalar va 6 ta qo'shimcha keys.
- **🎲 "Mikrobiznes o'yini"** — 6 haftalik simulyatsiya: talaba narx, ishlab chiqarish hajmi va reklamani boshqaradi. Talab modeli serverda yashirin, natija avtomatik baholanadi.
- **🎭 AI rol o'yinlari** — AI-yordamchida "bank xodimi" (kredit suhbati), "investor" (pitch) va "xaridor" (e'tirozlar) rejimlari bor. Ular talabaning biznes loyihasini hisobga oladi.
- Birinchi administrator ro'yxatdan o'tganda kurs **avtomatik yuklanadi** (`DEFAULT_COURSE`).

## Tayyor kurslar

Platformaga quyidagi kurslar o'rnatilgan. Ularni **Kurslar → 📦 Tayyor kurslar** orqali bir bosishda yuklash mumkin:

| Kurs | Fayl | Tarkibi |
|---|---|---|
| **Tadbirkorlik asoslari** (TDAB 404, VII semestr, 4 kredit) | [`courses/tadbirkorlik-asoslari.json`](courses/tadbirkorlik-asoslari.json) | Rasmiy fan dasturi asosida: 15 mavzu (M1–M15), 15 amaliy mashg'ulot (A1–A15), 30 mustaqil ish (MT1–MT30), oraliq va yakuniy nazorat testlari; jami 18 dars, 125 mashg'ulot |
| Informatika (namuna) | [`sample/sample-course.json`](sample/sample-course.json) | Barcha mashg'ulot turlarining namunasi |

Yangi kurs qo'shish uchun JSON faylni `courses/` papkasiga joylang va uni `src/index.js` dagi `CATALOG` ro'yxatiga kiriting.

## Cloudflare'ga joylash

### 1-usul: Cloudflare paneli orqali (GitHub'dan avtomatik)
1. Cloudflare → **Workers & Pages → Create → Import a repository** → `Ulugbek3989/tad`.
2. "Missing git connection" chiqsa: **Connect GitHub** tugmasini bosing va Cloudflare GitHub ilovasiga shu repozitoriyga ruxsat bering.
3. Sozlamalar: *Project name* — `tad-platform` (yoki istalgan), *Build command* — bo'sh, *Deploy command* — `npx wrangler deploy`. Agar *Production branch* so'ralsa, kod joylashgan tarmoqni tanlang.
4. **Deploy** — D1 ma'lumotlar bazasi (`tad-db`) avtomatik yaratiladi, jadvallar esa birinchi so'rovda avtomatik tuziladi. Har bir yangi push avtomatik qayta joylanadi.

### 2-usul: buyruq satridan
```bash
npm install
npx wrangler login
npm run deploy          # D1 bazasi avtomatik yaratiladi
```

Ixtiyoriy maxfiy kalitlar:
```bash
npx wrangler secret put TEACHER_CODE        # o'qituvchilar ro'yxatdan o'tish kodi
npx wrangler secret put ANTHROPIC_API_KEY   # o'zbek tilida sifatliroq AI (Claude)
```

Joylashdan keyin sayt manzilini oching va birinchi bo'lib ro'yxatdan o'ting: siz administrator bo'lasiz. So'ng **Kurslar → 📦 Tayyor kurslar** dan "Tadbirkorlik asoslari"ni yuklang.

### Sun'iy intellekt
- Standart holatda **Cloudflare Workers AI** ishlatiladi (`AI_MODEL`, standart qiymati `@cf/meta/llama-3.3-70b-instruct-fp8-fast`). Qo'shimcha sozlash kerak emas.
- `ANTHROPIC_API_KEY` maxfiy kaliti o'rnatilgan bo'lsa, **Claude** ishlatiladi (`CLAUDE_MODEL`). Bu o'zbek tilida baholash va tavsiyalar sifatini sezilarli oshiradi.
- AI umuman bo'lmasa ham platforma ishlayveradi. Bunda ochiq javoblar qoidaga asoslangan dastlabki baho oladi va o'qituvchi tekshiruviga yuboriladi; tavsiyalar ham qoidalar asosida tuziladi.

### Lokal ishga tushirish
```bash
npm install
npm run db:migrate:local
npm run dev        # http://localhost:8787
```
> Workers AI lokal rejimda Cloudflare akkauntini talab qiladi. Akkauntsiz sinab ko'rish uchun `wrangler.jsonc` faylidan `"ai"` qatorini vaqtincha olib tashlang: platforma AI'siz rejimda ishlaydi.

---

## Fan materiallarini yuklash formati (`tad-course-v1`)

Fan dasturi va materiallarini quyidagi JSON tuzilmasida tayyorlab, **Kurslar → 📥 Import** orqali yuklang. To'liq namuna: [`sample/sample-course.json`](sample/sample-course.json). U barcha mashg'ulot turlarini o'z ichiga oladi. Platforma ishlab turganda bu namuna `/api/courses/template` manzilida ham mavjud.

```jsonc
{
  "format": "tad-course-v1",
  "course": {
    "title": "Fan nomi", "code": "FAN-101", "description": "...",
    "syllabus": "## Fan dasturi (markdown)", "objectives": ["Maqsad 1"], "literature": "1. ...",
    "color": "#4f46e5"
  },
  "modules": [{
    "title": "1-bo'lim", "description": "...",
    "lessons": [{
      "title": "Dars mavzusi", "summary": "...", "kind": "lecture",   // lecture|practical|lab|seminar|independent
      "hours": 2, "methods": ["brainstorm", "cluster"],                // metod kalitlari (/api/methods)
      "content": "# Ma'ruza matni (markdown, $formula$)",
      "activities": [ { "type": "quiz", "title": "...", "max_points": 10, "content": { ... } } ]
    }]
  }]
}
```

### Mashg'ulot turlari va `content` tuzilmasi

| `type` | `content` | Baholash |
|---|---|---|
| `slides` | `{"slides":[{"title","body","notes"}]}` | ko'rib chiqildi |
| `reading` | `{"body","video_url","links":[{"title","url"}]}` | o'qildi |
| `quiz` | `{"time_limit_min","shuffle","show_answers","questions":[{"type":"single\|multiple\|truefalse\|short\|numeric","text","options","answer","tolerance","explanation","points"}]}` | avtomatik |
| `flashcards` | `{"cards":[{"front","back"}]}` | SRS takrorlash |
| `matching` | `{"pairs":[{"left","right"}]}` | avtomatik |
| `ordering` | `{"prompt","items":[to'g'ri tartibda]}` | avtomatik |
| `fillblank` | `{"text":"... [[javob/muqobil]] ...","word_bank":true}` | avtomatik |
| `classify` | `{"categories":[{"name","items":[]}]}` | avtomatik |
| `lab` | `{"objective","equipment":[],"theory","steps":[{"title","body"}],"questions":[],"video_url","simulation_url","reference_answer"}` + `rubric` | AI + o'qituvchi |
| `practical` | `{"task","hints":[],"reference_answer"}` + `rubric` | AI + o'qituvchi |
| `case` | `{"scenario","questions":[],"reference_answer"}` + `rubric` | AI + o'qituvchi |
| `essay` | `{"prompt","min_words"}` + `rubric` | AI + o'qituvchi |
| `board` | `{"method","prompt","columns":[],"anonymous"}` | ishtirok |

`reference_answer` (namunaviy javob) va test javoblari o'quvchiga hech qachon yuborilmaydi: ular faqat serverda tekshirish va AI uchun ishlatiladi.

---

## Arxitektura

```
public/                 Statik frontend (build talab qilmaydi, ES modullar)
  js/app.js             Marshrutlash, maket, holat
  js/views/*.js         Sahifalar: dars pleyeri, muharrir, jurnal, AI studiya ...
  vendor/               marked, DOMPurify, KaTeX (lokal nusxa)
src/                    Cloudflare Worker (REST API)
  index.js              Kirish nuqtasi, /api/* marshrutlari
  lib/                  auth (PBKDF2, sessiyalar), grading, ai, gamification, access
  routes/               auth, courses, learning, groups, teaching, ai, dashboard
  data/methods.js       Pedagogik metodlar kutubxonasi
migrations/             D1 sxemasi
sample/                 Namuna kurs / import formati
```

**Xavfsizlik:**
- Parollar PBKDF2-SHA256 (100 000 iteratsiya) bilan xeshlanadi.
- Sessiya `HttpOnly`, `SameSite=Lax` cookie'da saqlanadi.
- O'zgartiruvchi so'rovlar `Origin` va `Content-Type` bo'yicha tekshiriladi (CSRF himoyasi).
- Har bir API so'rovida rol va kursga kirish huquqi tekshiriladi.
- Markdown DOMPurify bilan tozalanadi, barcha shablon qiymatlari avtomatik ekranlanadi.
