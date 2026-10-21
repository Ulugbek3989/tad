import json, random, sys, copy
sys.path.insert(0, '.')
from common import *
from m1 import MODULE1
from m2 import MODULE2
from m3 import MODULE3
from m4 import MODULE4
from m5 import MODULE5
from resources import TEMPLATES, LINKS, CASES

MODULES = [MODULE1, MODULE2, MODULE3, MODULE4, MODULE5]
LESSONS = [l for m in MODULES for l in m['lessons']]
assert len(LESSONS) == 15

TN = [
 "TN1. Tadbirkorlikning iqtisodiy mohiyati, zarurati va turlari (kichik biznes, mikrobiznes, startap, oilaviy va ijtimoiy tadbirkorlik)ni, bozor imkoniyatlarini aniqlash va biznes g'oyani shakllantirish jarayonini bilish",
 "TN2. Biznes modelining tarkibiy elementlari — mijozlar segmentlari, qiymat taklifi, sotish kanallari, daromad manbalari va xarajatlar tuzilmasini, turli biznes modellarning ishlash mexanizmlarini tahlil qilish",
 "TN3. Biznesni qonuniy rasmiylashtirish tartibini, tashkiliy-huquqiy shakllarni, soliq tizimining asosiy tamoyillarini, soliq rejimlari va moliyaviy hujjatlarni yuritish qoidalarini bilish",
 "TN4. Marketing va savdo jarayonining asosiy bosqichlarini, mijozlarni jalb qilish kanallarini, narx shakllantirish, pul oqimini rejalashtirish, foyda-zarar tahlili va biznes-reja tuzish tamoyillarini o'rganish",
 "TN5. Bozor muammolarini mustaqil aniqlash, ulardan biznes g'oya yaratish va uni sinov mahsuloti (MVP) orqali kam xarajat bilan bozorda sinab ko'rish",
 "TN6. O'z biznes g'oyasi uchun biznes model sxemasini tuzish, mijoz portretini shakllantirish, raqobatchilar tahlilini o'tkazish hamda maqsadli marketing va reklama rejasini ishlab chiqish",
 "TN7. Mahsulot tannarxi va sotish narxini hisoblash, zararsizlik nuqtasini aniqlash, pul oqimi jadvalini tuzish hamda foyda-zarar hisobotini shakllantirish",
 "TN8. Biznesni qonuniy ro'yxatdan o'tkazish, mos soliq rejimini tanlash, birlamchi moliyaviy hujjatlarni yuritish va oddiy shartnomalar tuzish",
 "TN9. O'z biznes g'oyasi bo'yicha to'liq biznes-reja loyihasini mustaqil ishlab chiqish va uning iqtisodiy maqsadga muvofiqligini asoslab bera olish",
 "TN10. Samarali jamoa shakllantirish, xodimlarni rag'batlantirib boshqarish, biznesning asosiy xavflarini aniqlash va ularni boshqarish choralarini ishlab chiqish",
 "TN11. Zamonaviy raqamli vositalar (my.gov.uz, my.soliq.uz va boshqalar) hamda davlat qo'llab-quvvatlash dasturlari (jumladan, \"Kelajakka qadam\")dan foydalanib, o'z biznes faoliyatini yuritish va rivojlantirish bo'yicha qarorlar qabul qilish",
 "TN12. O'z biznes g'oyasini investor va ekspertlar oldida ishonchli taqdim etish, muzokaralar olib borish hamda tadbirkorlik etikasiga rioya qilish",
]

TOPIC_ROWS = [(f"M{i+1}", l['title'].split('. ', 1)[1]) for i, l in enumerate(LESSONS)]

SYLLABUS = f"""## Fan ma'lumotlari
| Ko'rsatkich | Qiymat |
|---|---|
| Fan kodi | **TDAB 404** |
| O'quv yili / semestr | 2026/2027 · VII semestr |
| ECTS kreditlar | 4 |
| Fan turi | Tanlov |
| Ta'lim tili | O'zbek |
| Haftadagi dars soatlari | 4 |
| Ma'ruza | 30 soat |
| Amaliy mashg'ulot | 30 soat |
| Mustaqil ta'lim | 60 soat |
| **Jami** | **120 soat** |

Ta'lim yo'nalishi: barcha noiqtisodiy bakalavriat ta'lim yo'nalishlari (kunduzgi ta'lim shakli).
Mirzo Ulug'bek nomidagi O'zbekiston Milliy universitetining Jizzax filiali, "Iqtisodiyot va turizm" kafedrasi.
Tuzuvchi: N.G'. To'ychiyeva (i.f.f.d., PhD). Taqrizchi: Z.I. Usmanova (SamISI "Marketing" kafedrasi dotsenti).

## Fanni o'qitishdan maqsad
Talabalarda tadbirkorlik ko'nikmalarini shakllantirish, bozor muammolarini aniqlash va biznes g'oya yaratishdan boshlab, o'z biznesini mustaqil tashkil etish, boshqarish va kengaytirishgacha bo'lgan jarayonni amaliy o'zlashtirish uchun zarur bilim, malaka va ko'nikmalarni berish.

## Fanning asosiy vazifasi
Talabalarga tadbirkorlik faoliyatining mohiyatini yaxlit va amaliy yondashuv asosida o'rgatish. Dars jarayonida talabalar dastlab bozor muammolarini aniqlash va mijoz ehtiyojini o'rganib, so'ngra o'z biznes g'oyasini iqtisodiy, huquqiy va moliyaviy jihatdan asoslash ko'nikmalarini egallaydi.

> **Vertikal loyiha:** butun semestr davomida har bir talaba bitta loyiha ustida ishlaydi — har bir mavzu va amaliy mashg'ulotda o'z biznes g'oyasiga o'rgangan bilimlarni qo'llab boradi. A1–A12 natijalari A13 da yagona biznes-rejaga jamlanadi va A15 da ekspertlar oldida himoya qilinadi.

Fan doirasida talabalar o'z biznes modelini loyihalash, bozor tadqiqotini o'tkazish, narxni asoslab belgilash, moliyaviy hisob-kitob yuritish, biznes-reja tuzish, jamoani shakllantirish, xavflarni boshqarish hamda o'z biznes g'oyasini investor va ekspertlarga taqdim etish ko'nikmalarini rivojlantiradi.

## Fanni o'zlashtirish uchun zarur boshlang'ich bilimlar
1. (IN1104) Iqtisodiyot nazariyasi
2. (MAK1406) Makroiqtisodiyot
3. (IQTB 404) Moliya

## Mavzular rejasi (ma'ruza va amaliy mashg'ulotlar)
| № | Mavzu | Ma'ruza | Amaliy |
|---|---|---|---|
""" + "\n".join(f"| {c} | {t} | 2 | 2 |" for c, t in TOPIC_ROWS) + """
| | **Jami** | **30** | **30** |

Har bir mavzu platformada quyidagi tartibda o'tiladi: **ma'ruza matni → taqdimot → kartochkalar → interaktiv metod → test → amaliy mashg'ulot (A) → mustaqil ish (MT)**.

## Mustaqil ta'lim (60 soat)
30 ta mustaqil ish topshirig'i (MT1–MT30, har biri 2 soat) tegishli mavzular ichida joylashtirilgan. Ular AI yordamida dastlabki baholanadi, yakuniy bahoni o'qituvchi tasdiqlaydi.

## Ta'lim texnologiyalari va metodlari
- **Simulyatsiya o'yinlari** — Jamg'arma o'yini, Mikrobiznes o'yini, Bank suhbati, Savdo o'yini;
- **Rol o'yinlari** — savdogar-xaridor, tadbirkor-bank xodimi, rahbar-xodim, investor-tadbirkor;
- **Holatni tahlil qilish (Case-study)** — O'zbekistondagi real muvaffaqiyatli va muvaffaqiyatsiz biznes holatlari;
- **Guruh ustaxonalari** — biznes model sxemasi, xavf matritsasi, moliyaviy jadval, ish o'rni tavsifi;
- **O'zaro baholash** — talabalar bir-birining ishini mezonlar asosida baholashi;
- **Raqamli amaliyot** — my.gov.uz, my.soliq.uz, hisob-kitob jadvallari va boshqa raqamli vositalar.

## Talabalar bilimini baholash va nazorat mezonlari
| № | Nazorat turi | Nazorat shakli | Eng yuqori ball | O'tish balli | Umumiy ball |
|---|---|---|---|---|---|
| 1 | Joriy nazorat | Amaliy mashg'ulotda talabaning faolligi | 20 | 30 (joriy + oraliq) | 20 |
| 2 | Oraliq nazorat | Yozma-og'zaki yoki test | 10 | | 30 |
| | | Mustaqil ish | 20 | | |
| 3 | Yakuniy nazorat | Yozma ish yoki test | 50 | 30 | 50 |
| | **Jami** | | **100** | **60** | **100** |

Platformada: joriy nazorat — A1–A15 amaliy mashg'ulotlar, testlar va interaktiv mashg'ulotlardagi faollik; oraliq nazorat — "Oraliq nazorat testi" va MT1–MT30 mustaqil ishlar; yakuniy nazorat — "Yakuniy nazorat testi".

### Baholash mezonlari (5 baholik shkala)
- **5 (a'lo, 86–100 ball):** fanning mohiyati va mazmunini to'liq yoritadi; mavzularni bayon qilishda ilmiylik va mantiqiylik saqlanadi; mustaqil erkin fikrlaydi; savollarga aniq va lo'nda javob beradi; mustaqil topshiriqlarni to'liq va aniq bajargan; barcha amaliy ko'nikma va malakalarni o'zlashtirgan; nazariy bilimlarni turli vaziyatda qo'llay oladi; tizimli yondashadi.
- **4 (yaxshi, 71–85 ball):** fanning mohiyati va mazmunini tushungan, ilmiy va mantiqiy chalkashliklarga yo'l qo'ymaydi; amaliy ahamiyatini tushunadi; topshiriqlarni o'quv dasturi doirasida bajaradi; savollarga to'g'ri javob beradi; konspekt va mustaqil topshiriqlarni to'liq bajargan.
- **3 (qoniqarli, 55–70 ball):** fan haqida umumiy tushunchaga ega; mavzularni tor doirada yoritadi, ayrim chalkashliklarga yo'l qo'yadi; mustaqil topshiriqlarni bajargan; bayon ravon emas.
- **2 (qoniqarsiz):** mashg'ulotlarga tayyorgarlik ko'rmagan; mustaqil topshiriqlarni bajarmagan; matnlarni ko'chirgan; jiddiy xatolarga yo'l qo'ygan; savollarga javob bera olmaydi.

Baholash Oliy va o'rta maxsus ta'lim vazirining 2018-yil 9-avgustdagi 19-2018-son buyrug'i bilan tasdiqlangan nizom asosida **100 ballik tizimda** amalga oshiriladi (5,00–4,96 → 100 ball; 4,00–3,96 → 80 ball; 3,00 → 60 ball; 3,0 dan kam → 60 dan kam).

## Kreditni olish uchun talablar
Fanga oid nazariy va uslubiy tushunchalarni to'liq o'zlashtirish, tahlil natijalarini to'g'ri aks ettira olish, o'rganilayotgan jarayonlar haqida mustaqil mushohada yuritish, joriy nazorat shakllari hamda mustaqil ta'limda berilgan topshiriqlarni bajarish, yakuniy nazorat ishini topshirish."""

LITERATURE = """### Asosiy adabiyotlar
1. O'zbekiston Respublikasining "Tadbirkorlik faoliyati erkinligining kafolatlari to'g'risida"gi Qonuni. Amaldagi tahrir. https://lex.uz
2. O'zbekiston Respublikasining Fuqarolik kodeksi. Amaldagi tahrir. https://lex.uz
3. O'zbekiston Respublikasining "Mas'uliyati cheklangan hamda qo'shimcha mas'uliyatli jamiyatlar to'g'risida"gi Qonuni. 2001-yil 6-dekabr, 310-II-son. https://lex.uz
4. O'zbekiston Respublikasining Soliq kodeksi. 2019-yil 30-dekabr, O'RQ–599-son. https://lex.uz
5. O'zbekiston Respublikasining "Buxgalteriya hisobi to'g'risida"gi Qonuni. 2016-yil 13-aprel, O'RQ–404-son. https://lex.uz
6. O'zbekiston Respublikasi Prezidentining "Yoshlar tadbirkorligini hamda ularning bandligini ta'minlashga qaratilgan biznes loyihalarni qo'llab-quvvatlash tizimini takomillashtirish chora-tadbirlari to'g'risida"gi qarori. 2025-yil 14-fevral, PQ–60-son. https://lex.uz
7. O'zbekiston Respublikasi Prezidentining "Yoshlar tadbirkorligini rivojlantirish va bandligini ta'minlashga doir qo'shimcha chora-tadbirlar to'g'risida"gi qarori. 2025-yil 14-fevral, PQ–62-son. https://lex.uz
8. Buxgalteriya hisobining milliy standarti — 20-sonli BHMS "Kichik tadbirkorlik sub'ektlari tomonidan buxgalteriya hisobini yuritishning soddalashtirilgan tartibi". Amaldagi tahrir. https://lex.uz
9. Raxmatullaeva D.R. Tadbirkorlikni tashkil etish. O'quv qo'llanma. — Toshkent: Tafakkur bo'stoni, 2022.
10. Raxmatullaeva D.R. Kichik biznes va xususiy tadbirkorlikni tashkil etish. O'quv qo'llanma. — Toshkent, 2025.
11. Samadov A.N., Ostanaqulova G.N. Kichik biznes va tadbirkorlik. — Toshkent: Moliya-iqtisod, 2008.

### Tavsiya qilinadigan qo'shimcha adabiyotlar
12. Osterwalder A., Pigneur Y. Business Model Generation: A Handbook for Visionaries, Game Changers, and Challengers. — Hoboken: Wiley, 2010.
13. Ries E. The Lean Startup: How Today's Entrepreneurs Use Continuous Innovation to Create Radically Successful Businesses. — New York: Crown Business, 2011.
14. Blank S., Dorf B. The Startup Owner's Manual: The Step-by-Step Guide for Building a Great Company. — Pescadero: K&S Ranch, 2012.

### Axborot manbalari
15. https://lex.uz — O'zbekiston Respublikasi qonunchilik hujjatlari milliy bazasi
16. https://my.soliq.uz — Soliq to'lovchining shaxsiy kabineti
17. https://my.gov.uz — Davlat xizmatlari yagona interaktiv portali
18. https://stat.uz — O'zbekiston Respublikasi Milliy statistika qo'mitasi rasmiy sayti
19. https://finlit.uz — Markaziy bankning moliyaviy savodxonlik bo'yicha elektron resursi
20. https://sparkassenstiftung-uzbekistan.org — German Sparkassenstiftung for International Cooperation'ning O'zbekistondagi dasturlari"""

INTRO = {
  "title": "Kirish. Fan dasturi, vertikal loyiha va baholash tizimi",
  "summary": "Fan bilan tanishish: maqsad, ta'lim natijalari, semestr loyihasi va baholash tartibi.",
  "kind": "independent", "hours": 0, "methods": ["kwl", "flipped", "gamification"],
  "content": """# "Tadbirkorlik asoslari" fani — kirish

## Fan sizga nima beradi?
Semestr oxirida siz **o'z biznes g'oyangiz bo'yicha to'liq biznes-reja** tayyorlab, uni ekspertlar oldida himoya qilasiz. Fan nazariya bilan cheklanmaydi: har bir mavzu sizning shaxsiy loyihangizga qo'llaniladi.

## Vertikal loyiha — semestr yo'l xaritasi
| Bosqich | Mavzular | Natija |
|---|---|---|
| 1. G'oya | M1–M3 | Muammo, biznes g'oya, MVP, moliyaviy yo'l xaritasi |
| 2. Huquq va soliq | M4–M5 | Huquqiy shakl, ro'yxatdan o'tish modeli, soliq rejimi |
| 3. Model va mijoz | M6–M7 | 9 blokli biznes-model, mijoz portreti, raqobat tahlili |
| 4. Bozorga chiqish | M8–M10 | Kontent-reja, sotuv ssenariysi, narx va zararsizlik nuqtasi |
| 5. Moliya va himoya | M11–M15 | Pul oqimi, foyda-zarar, biznes-reja, xavflar, pitch |

## Platformada qanday o'qiysiz?
1. **Ma'ruza matni va taqdimot** — darsdan oldin yoki dars davomida;
2. **Kartochkalar** — asosiy atamalarni yodlang (\"Takrorlash\" bo'limi har kuni eslatadi);
3. **Interaktiv mashg'ulotlar** — moslashtirish, guruhlash, ketma-ketlik, interaktiv doska;
4. **Test** — mavzuni o'zlashtirganingizni tekshiring (3 ta urinish);
5. **Amaliy mashg'ulot (A1–A15)** — loyihangizning navbatdagi qismi; AI darhol fikr-mulohaza beradi;
6. **Mustaqil ish (MT1–MT30)** — chuqurroq o'rganish.

## Baholash
- **Joriy nazorat — 20 ball:** amaliy mashg'ulotlardagi faollik;
- **Oraliq nazorat — 30 ball:** test (10) + mustaqil ishlar (20);
- **Yakuniy nazorat — 50 ball:** yozma ish yoki test;
- **O'tish balli — 60**, jami — 100.

## Rag'batlantirish
Har bir bajarilgan topshiriq uchun **XP**, kunlik faollik uchun **seriya** 🔥, yutuqlar uchun **nishonlar** 🏅 va guruh **reytingi** 🏆. O'qituvchi faol va ijodkor talabalarni qo'shimcha nishonlar bilan taqdirlaydi.""",
  "activities": [
    board("BBB jadvali: Tadbirkorlik haqida nimalarni bilaman?", "kwl", "Tadbirkorlik va biznes haqida nimalarni bilasiz va nimalarni bilishni xohlaysiz? (\"Bilib oldim\" ustunini semestr oxirida to'ldiramiz.)",
          ["Bilaman", "Bilishni xohlayman", "Bilib oldim"], "Har bir ustunga kamida bitta fikr yozing."),
    {"type": "essay", "title": "Refleksiya: Mening tadbirkorlik maqsadim", "max_points": 5,
     "instructions": "Qisqa esse: nima uchun bu fan sizga kerak, qaysi sohada biznes qilishni xohlaysiz va semestr oxirida nimaga erishmoqchisiz?",
     "rubric": "Shaxsiy maqsad aniq — 2; soha va g'oya yo'nalishi — 2; samimiy va mantiqiy bayon — 1.",
     "content": {"prompt": "Mening tadbirkorlik maqsadim va semestr oxiridagi kutilgan natijam", "min_words": 80}},
  ]}

def pool(lessons, per, seed):
    rnd = random.Random(seed)
    out = []
    for l in lessons:
        qs = [q for q in l['_quiz'] if q['type'] in ('single', 'multiple', 'truefalse', 'numeric')]
        out += [copy.deepcopy(q) for q in rnd.sample(qs, min(per, len(qs)))]
    return out

oraliq = pool(LESSONS[:7], 3, 7)[:20]
yakuniy = pool(LESSONS, 2, 15)
NAZORAT = {
  "title": "Nazorat. Oraliq va yakuniy nazorat",
  "description": "Oraliq nazorat testi (10 ball) va yakuniy nazorat testi (50 ball). Mustaqil ishlar (20 ball) mavzular ichida joylashgan.",
  "lessons": [{
    "title": "Oraliq nazorat (M1–M7)", "summary": "1–7-mavzular bo'yicha test: 20 ta savol, 30 daqiqa, 1 ta urinish.", "kind": "independent", "hours": 0, "methods": ["blitz"],
    "content": "# Oraliq nazorat\n\n- Qamrov: **M1–M7** mavzulari;\n- **20 ta savol**, **30 daqiqa**, **1 ta urinish**;\n- Maksimal ball: **10**.\n\nOraliq nazoratning qolgan **20 balli** — mustaqil ishlar (MT1–MT30) uchun beriladi.\n\n> Testdan oldin \"Takrorlash\" bo'limida kartochkalarni ko'rib chiqing.",
    "activities": [{"type": "quiz", "title": "Oraliq nazorat testi", "max_points": 10, "attempts": 1,
                    "instructions": "Diqqat: faqat 1 ta urinish. Vaqt — 30 daqiqa.",
                    "content": {"time_limit_min": 30, "shuffle": True, "show_answers": False, "questions": oraliq}}]},
   {"title": "Yakuniy nazorat (M1–M15)", "summary": "Barcha mavzular bo'yicha test: 30 ta savol, 45 daqiqa, 1 ta urinish.", "kind": "independent", "hours": 0, "methods": ["blitz", "exit_ticket"],
    "content": "# Yakuniy nazorat\n\n- Qamrov: **barcha 15 mavzu**;\n- **30 ta savol**, **45 daqiqa**, **1 ta urinish**;\n- Maksimal ball: **50** (o'tish balli — 30).\n\nO'qituvchi qarori bilan yakuniy nazorat yozma ish shaklida ham o'tkazilishi mumkin.",
    "activities": [{"type": "quiz", "title": "Yakuniy nazorat testi", "max_points": 50, "attempts": 1,
                    "instructions": "Diqqat: faqat 1 ta urinish. Vaqt — 45 daqiqa.",
                    "content": {"time_limit_min": 45, "shuffle": True, "show_answers": False, "questions": yakuniy}},
                   board("Yakuniy refleksiya: BBB jadvalini yakunlash", "kwl", "Semestr boshidagi BBB jadvaliga qayting: endi nimalarni bilib oldingiz?",
                         ["Bilib oldim", "Eng foydali mavzu", "Keyingi qadamim"], "Kamida 3 ta fikr yozing.")]}]}

SIMULATION = {"type": "simulation", "title": "Simulyatsiya: \"Mikrobiznes o'yini\" — uy qandolatchiligi", "max_points": 15, "attempts": 3,
  "instructions": "6 hafta davomida tort sotadigan kichik biznesni boshqaring. Har hafta narx, tayyorlanadigan tortlar soni va reklama byudjetini tanlang. Sotilmagan tortlar buziladi, yetishmagan tortlar — yo'qotilgan mijoz. Maqsad: 6 haftada kamida 9 mln so'm sof foyda.",
  "content": {"game": "mikrobiznes", "product": "Buyurtma tortlari (uy qandolatchiligi)", "round_label": "Hafta",
    "intro": "Sizda 3 000 000 so'm boshlang'ich mablag' bor. Bitta tortning xomashyo tannarxi — 60 000 so'm, haftalik doimiy xarajatlar (ijara, kommunal, qadoq) — 400 000 so'm. Bozordagi o'rtacha narx — 120 000 so'm. Har hafta tushumdan 4% aylanma solig'i to'lanadi.",
    "rounds": 6, "start_cash": 3000000, "unit_cost": 60000, "fixed_cost": 400000, "price_ref": 120000,
    "base_demand": 35, "elasticity": 1.8, "ad_boost": 0.6, "ad_half": 250000, "tax_rate": 0.04,
    "season": [1, 1, 1.1, 1.5, 0.8, 1.2], "target_profit": 9000000,
    "events": [{"round": 3, "text": "📈 Shakar va sariyog' narxi oshdi: tort tannarxi 15% ga qimmatladi (keyingi haftalarda ham).", "unit_cost_mult": 1.15},
               {"round": 4, "text": "🎉 Bayram va to'ylar mavsumi: talab odatdagidan ancha yuqori bo'lishi kutilmoqda."},
               {"round": 5, "text": "🏪 Mahallada yangi qandolatxona ochildi, bayramdan keyin talab pasaydi."},
               {"round": 6, "text": "🎓 Bitiruv kechalari yaqinlashmoqda: talab yana o'smoqda."}]}}
t10 = LESSONS[9]
qi = next(i for i, a in enumerate(t10['activities']) if a['type'] == 'quiz')
t10['activities'].insert(qi, SIMULATION)
t10['methods'] = list(dict.fromkeys(['simulation'] + t10['methods']))

glossary, seen = [], set()
for i, l in enumerate(LESSONS):
    for a in l['activities']:
        if a['type'] == 'flashcards':
            for c in a['content']['cards']:
                k = c['front'].lower()
                if k not in seen:
                    seen.add(k)
                    glossary.append({"term": c['front'], "def": c['back'], "topic": f"M{i+1}"})
glossary.sort(key=lambda g: g['term'].lower())
RESOURCES = {"glossary": glossary, "templates": TEMPLATES, "links": LINKS, "cases": CASES}

for l in LESSONS:
    l.pop('_quiz')

course = {
  "format": "tad-course-v1",
  "course": {
    "title": "Tadbirkorlik asoslari",
    "code": "TDAB 404",
    "description": "VII semestr · 4 kredit · barcha noiqtisodiy bakalavriat yo'nalishlari uchun tanlov fani. Semestr davomida har bir talaba o'z biznes g'oyasini g'oyadan biznes-reja himoyasigacha olib boradi (vertikal loyiha).",
    "color": "#0f766e",
    "objectives": TN,
    "syllabus": SYLLABUS,
    "literature": LITERATURE,
  },
  "resources": RESOURCES,
  "modules": [{"title": "Kirish", "description": "Fan dasturi, semestr loyihasi va baholash tizimi.", "lessons": [INTRO]}] + MODULES + [NAZORAT],
}
out = sys.argv[1]
json.dump(course, open(out, 'w'), ensure_ascii=False, indent=1)
acts = [a for m in course['modules'] for l in m['lessons'] for a in l['activities']]
from collections import Counter
print('lessons', sum(len(m['lessons']) for m in course['modules']), 'activities', len(acts), Counter(a['type'] for a in acts))
print('MT', sorted(int(a['title'].split('.')[0][2:]) for a in acts if a['title'].startswith('MT')))
print('A', [a['title'].split('.')[0] for a in acts if a['title'][:1]=='A' and a['title'][1].isdigit()])
print('oraliq', len(oraliq), 'yakuniy', len(yakuniy), 'glossary', len(glossary))
