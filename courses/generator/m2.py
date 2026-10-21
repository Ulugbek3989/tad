from common import *

LEGAL_NOTE = "> **Eslatma:** qonunchilik, soliq stavkalari va chegaralari o'zgarib turadi. Amaliyotda har doim **lex.uz** (amaldagi tahrir), **soliq.uz** va **my.gov.uz** ma'lumotlarini tekshiring."

T4_LECT = """# Biznesni qonuniy rasmiylashtirish va davlat ro'yxatidan o'tkazish

## Nima uchun biznes rasmiylashtiriladi?
- qonuniy faoliyat va **jarimalardan himoya**;
- bank hisobvarag'i ochish, **kredit va grant** olish imkoniyati;
- yirik mijozlar va davlat xaridlarida ishtirok etish;
- huquqlarning (brend, shartnomalar) **himoyasi**;
- ishonch va obro'.

## Tadbirkorlik subyektlarining tashkiliy-huquqiy shakllari
| Shakl | Asosiy xususiyati |
|---|---|
| **Yakka tartibdagi tadbirkor (YaTT)** | Yuridik shaxs tashkil etmasdan faoliyat; barcha mol-mulki bilan javob beradi |
| **O'zini o'zi band qilgan shaxs** | Ruxsat etilgan faoliyat turlari bo'yicha soddalashtirilgan tartibda ro'yxatdan o'tadi |
| **Mas'uliyati cheklangan jamiyat (MChJ)** | Yuridik shaxs; ishtirokchilar faqat ustav fondidagi ulushi doirasida javob beradi; ishtirokchilar soni 50 tadan oshmaydi |
| **Oilaviy korxona** | Oila a'zolari ishtirokida tashkil etiladi |
| **Fermer xo'jaligi** | Ijaraga olingan yer uchastkasida qishloq xo'jaligi mahsuloti yetishtiradi |
| **Aksiyadorlik jamiyati (AJ)** | Ustav kapitali aksiyalarga bo'lingan; yirik biznes uchun |

## Shaklni tanlash mezonlari
1. **Javobgarlik darajasi** — shaxsiy mulkni himoya qilish kerakmi?
2. **Ta'sischilar soni** — yakka yoki sheriklar bilan;
3. **Faoliyat turi** — ayrim faoliyatlar faqat yuridik shaxsga ruxsat etilgan;
4. **Soliq rejimi** va hisob yuritish murakkabligi;
5. **Investitsiya jalb qilish** rejasi — investorga ulush berish uchun MChJ qulay;
6. **Xodimlar soni** va kengayish rejalari.

## Davlat ro'yxatidan o'tkazish tartibi
1. Tashkiliy-huquqiy shaklni va **faoliyat turini** (OKED kodi) tanlash;
2. **Firma nomini** tanlash va band qilish (yuridik shaxs uchun);
3. Hujjatlarni tayyorlash: ariza, **ustav** va **ta'sis shartnomasi** (MChJ uchun), pasport ma'lumotlari;
4. **my.gov.uz** (Yagona interaktiv davlat xizmatlari portali) yoki **Davlat xizmatlari markazi** orqali ariza berish;
5. Davlat bojini to'lash;
6. **Guvohnoma** va STIR (soliq to'lovchining identifikatsiya raqami) olish — soliq organida hisobga qo'yish avtomatik amalga oshiriladi;
7. **Bank hisobvarag'i** ochish va, zarur bo'lsa, onlayn-kassa (NKM) o'rnatish;
8. Litsenziya yoki ruxsatnoma talab qilinadigan faoliyat uchun — ularni olish.

## Elektron davlat xizmatlari
- **my.gov.uz** — ro'yxatdan o'tish, ma'lumotnomalar, litsenziyalar;
- **my.soliq.uz** — soliq to'lovchining shaxsiy kabineti, hisobotlar;
- **lex.uz** — qonunchilik hujjatlari milliy bazasi;
- elektron raqamli imzo (**ERI**) — hujjatlarni masofadan imzolash.

## Shartnomaviy munosabatlar
Tadbirkorlik faoliyati shartnomalar asosida yuritiladi (Fuqarolik kodeksi):
- **oldi-sotdi**, **yetkazib berish**, **xizmat ko'rsatish**, **ijara**, **pudrat**, **mehnat** shartnomalari.
Oddiy shartnomaning asosiy qismlari:
1. Tomonlar va ularning rekvizitlari;
2. **Shartnoma predmeti** — nima sotiladi yoki bajariladi;
3. Narx va **to'lov tartibi**;
4. Muddatlar va topshirish tartibi;
5. Tomonlarning huquq va majburiyatlari;
6. **Javobgarlik** (jarima, penya) va nizolarni hal qilish tartibi;
7. Imzolar va sana.
""" + LEGAL_NOTE

T4_QUIZ = [
    S("Ishtirokchilari faqat ustav fondidagi ulushi doirasida javob beradigan yuridik shaxs qaysi?", ["YaTT", "Mas'uliyati cheklangan jamiyat (MChJ)", "O'zini o'zi band qilgan shaxs", "Oddiy shirkat"], 1, "MChJ ishtirokchilari jamiyat majburiyatlari bo'yicha faqat ulushi doirasida tavakkal qiladi."),
    S("Yakka tartibdagi tadbirkor majburiyatlari bo'yicha qanday javob beradi?", ["Faqat ustav fondi doirasida", "O'ziga tegishli mol-mulk bilan", "Umuman javob bermaydi", "Faqat davlat kafolati bilan"], 1, "YaTT yuridik shaxs emas, shuning uchun shaxsiy mol-mulki bilan javob beradi."),
    S("MChJ ishtirokchilarining maksimal soni nechta?", ["10", "25", "50", "Cheklanmagan"], 2, "\"MChJ va QMJ to'g'risida\"gi qonunga ko'ra ishtirokchilar soni 50 tadan oshmasligi kerak."),
    S("Biznesni onlayn ro'yxatdan o'tkazish uchun qaysi portal ishlatiladi?", ["my.gov.uz", "stat.uz", "finlit.uz", "lex.uz"], 0, "my.gov.uz — Yagona interaktiv davlat xizmatlari portali."),
    M("Shartnomaning muhim (asosiy) shartlariga nimalar kiradi?", ["Shartnoma predmeti", "Narx va to'lov tartibi", "Muddatlar", "Tomonlarning sevimli rangi"], [0, 1, 2], "Predmet, narx, muddat va javobgarlik — shartnomaning asosiy qismlari."),
    TF("STIR — soliq to'lovchining identifikatsiya raqami.", True, "STIR har bir soliq to'lovchiga beriladi."),
    S("Investorga ulush berib, sheriklar bilan biznes boshlash uchun qaysi shakl qulayroq?", ["YaTT", "O'zini o'zi band qilgan shaxs", "MChJ", "Fermer xo'jaligi"], 2, "MChJda ulushlarni taqsimlash va o'zgartirish mumkin."),
    S("Qonunchilik hujjatlarining amaldagi tahririni qayerdan topish mumkin?", ["lex.uz", "my.soliq.uz", "stat.uz", "Telegram kanallar"], 0, "lex.uz — qonunchilik hujjatlari milliy bazasi."),
]
T4_CARDS = [("YaTT", "Yuridik shaxs tashkil etmasdan tadbirkorlik bilan shug'ullanuvchi, o'z mol-mulki bilan javob beruvchi jismoniy shaxs"),
            ("MChJ", "Ishtirokchilari ulushi doirasida javob beradigan yuridik shaxs (ishtirokchilar 50 tagacha)"),
            ("Ustav", "Yuridik shaxsning nomi, maqsadi, boshqaruvi va faoliyat tartibini belgilovchi ta'sis hujjati"),
            ("Ta'sis shartnomasi", "Ta'sischilar o'rtasida yuridik shaxsni tashkil etish shartlari haqidagi kelishuv"),
            ("STIR", "Soliq to'lovchining identifikatsiya raqami"),
            ("OKED", "Iqtisodiy faoliyat turlari tasniflagichi bo'yicha faoliyat kodi"),
            ("ERI", "Elektron raqamli imzo — hujjatni elektron shaklda imzolash vositasi"),
            ("Shartnoma predmeti", "Shartnoma bo'yicha nima sotilishi, bajarilishi yoki ko'rsatilishi")]
T4 = lesson("4", "Biznesni qonuniy rasmiylashtirish va davlat ro'yxatidan o'tkazish",
    "Tashkiliy-huquqiy shakllar, ro'yxatdan o'tish tartibi, elektron davlat xizmatlari va shartnomalar (M4, A4).",
    ["insert", "venn", "workshop", "case_study"], T4_LECT, T4_QUIZ, T4_CARDS,
    [board("Venn diagrammasi: YaTT va MChJ", "venn", "YaTT va MChJni solishtiring: har biriga xos va umumiy jihatlar.",
           ["YaTT ga xos", "Umumiy jihatlar", "MChJ ga xos"], "Kamida 2 ta fikr yozing; boshqalarning fikrlarini o'qib, to'g'rilarini \"yoqdi\" bilan belgilang."),
     {"type": "ordering", "title": "Davlat ro'yxatidan o'tish bosqichlari", "max_points": 10, "instructions": "Bosqichlarni to'g'ri tartibda joylashtiring.",
      "content": {"prompt": "MChJni ro'yxatdan o'tkazish", "items": ["Tashkiliy-huquqiy shakl va faoliyat turini tanlash", "Firma nomini tanlash", "Ustav va ta'sis hujjatlarini tayyorlash", "my.gov.uz orqali ariza berish va davlat bojini to'lash", "Guvohnoma va STIR olish", "Bank hisobvarag'ini ochish"]}}],
    amaliy("A4", "Huquqiy shaklni tanlash va ro'yxatdan o'tishni modellashtirish",
        "1. O'z biznes g'oyangiz uchun **mos tashkiliy-huquqiy shaklni** tanlang va kamida 4 ta mezon bo'yicha asoslang (javobgarlik, ta'sischilar, soliq, kengayish).\n2. **Zarur hujjatlar ro'yxatini** tuzing.\n3. **my.gov.uz orqali ro'yxatdan o'tish jarayonini** bosqichma-bosqich modellashtiring (har bir bosqichda nima kiritiladi, qaysi ma'lumot kerak).\n4. OKED bo'yicha faoliyat turingizni va litsenziya/ruxsatnoma kerak yoki kerak emasligini aniqlang.",
        "Shakl tanlovi va 4 mezon bo'yicha asoslash — 4; hujjatlar ro'yxati — 2; ro'yxatdan o'tish bosqichlari to'g'ri va to'liq — 3; litsenziya masalasi — 1.",
        ["my.gov.uz da \"Tadbirkorlik subyektlarini davlat ro'yxatidan o'tkazish\" xizmatini oching", "Ayrim faoliyatlar (masalan, ta'lim, tibbiyot) litsenziya talab qiladi"]),
    [mustaqil("MT2", "Tadbirkorlikning tashkiliy-huquqiy shakllari va ularni tanlash mezonlarini o'rganish",
        "YaTT, o'zini o'zi band qilgan shaxs, MChJ, oilaviy korxona va fermer xo'jaligini javobgarlik, ta'sischilar, soliq va hisob yuritish bo'yicha solishtiring (jadval) va tanlash mezonlarini yozing."),
     mustaqil("MT11", "Biznesni davlat ro'yxatidan o'tkazish va elektron davlat xizmatlaridan foydalanish bosqichlarini o'rganish",
        "my.gov.uz, my.soliq.uz va ERI orqali tadbirkor foydalanadigan 5 ta elektron xizmatni tavsiflang: nima uchun kerak, qanday olinadi, qancha vaqt ketadi."),
     mustaqil("MT12", "Tadbirkorlik faoliyatida shartnomaviy munosabatlar va oddiy shartnoma loyihasini tayyorlash",
        "O'z biznesingiz uchun oddiy **xizmat ko'rsatish yoki yetkazib berish shartnomasi** loyihasini tuzing (tomonlar, predmet, narx, to'lov, muddat, javobgarlik, nizolar).",
        "Shartnomaning barcha asosiy bo'limlari — 3 ball; huquqiy atamalarning to'g'ri qo'llanishi — 1 ball; o'z biznesiga moslik — 1 ball.", 200)])

T5_LECT = """# Tadbirkor qanday soliqlarni to'laydi va hujjatlarni yuritadi

## Soliq tizimining asosiy tamoyillari
O'zbekiston **Soliq kodeksi** (2019-yil 30-dekabr, O'RQ–599) soliqlarni belgilaydi. Asosiy tamoyillar: **qonuniylik, majburiylik, aniqlik, adolatlilik, soliq tizimining yagonaligi** va **oshkoralik**.

## Asosiy soliqlar
| Soliq | Kim to'laydi / qanday |
|---|---|
| **Qo'shilgan qiymat solig'i (QQS)** | QQS to'lovchilari; asosiy stavka **12%** |
| **Foyda solig'i** | Umumbelgilangan tartibdagi yuridik shaxslar; asosiy stavka **15%** |
| **Aylanmadan olinadigan soliq** | Yillik aylanmasi belgilangan chegaradan (1 mlrd so'm) oshmaydigan subyektlar; asosiy stavka **4%** (ayrim faoliyatlar uchun boshqacha) |
| **Jismoniy shaxslardan olinadigan daromad solig'i (JShDS)** | Xodimlar ish haqidan — **12%** (ish beruvchi ushlab qoladi) |
| **Ijtimoiy soliq** | Ish beruvchi, mehnatga haq to'lash fondidan |
| **Mol-mulk, yer va suv resurslari soliqlari** | Mol-mulk, yer va suvdan foydalanuvchilar |
| **YaTT uchun soliq** | Faoliyat turi va aylanmasiga qarab qat'iy belgilangan yoki aylanmadan olinadigan soliq |

## Soliq rejimini tanlash
- **Soddalashtirilgan rejim (aylanmadan olinadigan soliq)** — kichik biznes uchun: hisob oddiy, soliq tushumdan hisoblanadi;
- **Umumbelgilangan rejim (QQS + foyda solig'i)** — aylanma chegaradan oshganda yoki ixtiyoriy ravishda; xarajatlar ko'p bo'lsa va mijozlar QQS to'lovchilari bo'lsa foydali bo'lishi mumkin.
> Tanlov mezoni: **aylanma hajmi, xarajatlar ulushi, mijozlar turi** (QQS to'lovchilarmi), hisob yuritish imkoniyati.

## Birlamchi moliyaviy hujjatlar
- **Elektron hisob-faktura (EHF)** — tovar/xizmat yetkazib berilganini tasdiqlaydi; elektron operatorlar orqali ERI bilan imzolanadi;
- **Fiskal chek** — onlayn nazorat-kassa mashinasi (NKM) yoki virtual kassa orqali beriladi;
- **Ishonchnoma**, yuk xati, **dalolatnoma** (bajarilgan ishlar);
- **Kassa kirim/chiqim orderlari**, bank ko'chirmalari;
- **Shartnomalar**.

## Daromad va xarajatlar hisobi
Kichik biznes uchun ham hisob yuritish majburiy va foydali. **20-sonli BHMS** kichik tadbirkorlik subyektlari uchun soddalashtirilgan buxgalteriya hisobini belgilaydi.
Daromad-xarajat daftari (jurnali) ustunlari:
| Sana | Hujjat № | Operatsiya mazmuni | Daromad | Xarajat | Qoldiq |
|---|---|---|---|---|---|
Qoidalar: har bir operatsiya **hujjat bilan tasdiqlanadi**, shaxsiy va biznes pullari **aralashtirilmaydi**, yozuvlar **o'z vaqtida** kiritiladi.

## Soliq hisobotlari va muddatlar
- hisobotlar **my.soliq.uz** shaxsiy kabineti orqali elektron topshiriladi;
- muddatni buzish — **jarima va penya**;
- soliq kalendarini yuritish: har oy/chorak qaysi hisobot va to'lov borligini yozib qo'ying.

## Soliq madaniyati va halollik
Soliqni yashirish (\"konvertda\" ish haqi, cheksiz savdo) — qonunbuzarlik bo'lib, katta jarimalarga olib keladi va biznesning **kredit olish, yirik mijozlar bilan ishlash** imkoniyatlarini yo'qotadi.
""" + LEGAL_NOTE

T5_QUIZ = [
    S("O'zbekistonda QQSning asosiy stavkasi qancha?", ["10%", "12%", "15%", "20%"], 1, "QQS asosiy stavkasi 2023-yildan 12%."),
    S("Foyda solig'ining asosiy stavkasi qancha?", ["4%", "12%", "15%", "25%"], 2, "Foyda solig'i asosiy stavkasi — 15%."),
    S("Xodim ish haqidan ushlab qolinadigan jismoniy shaxslar daromad solig'i stavkasi qancha?", ["7,5%", "12%", "15%", "20%"], 1, "JShDS — 12%."),
    N("Aylanmadan olinadigan soliq stavkasi 4%. Oylik tushum 50 000 000 so'm bo'lsa, soliq summasi necha so'm?", 2000000, "50 000 000 × 4% = 2 000 000 so'm."),
    S("Tovar yetkazib berilganini tasdiqlovchi va ERI bilan imzolanadigan hujjat qaysi?", ["Elektron hisob-faktura", "Ishonchnoma", "Pasport", "Ustav"], 0, "Elektron hisob-faktura — asosiy birlamchi hujjatlardan biri."),
    M("Daromad-xarajat hisobini yuritish qoidalarini belgilang.", ["Har bir operatsiya hujjat bilan tasdiqlanadi", "Shaxsiy va biznes pullari aralashtirilmaydi", "Yozuvlar o'z vaqtida kiritiladi", "Faqat yil oxirida bir marta yoziladi"], [0, 1, 2], "Hisob muntazam va hujjatlarga asoslangan bo'lishi kerak."),
    TF("Kichik tadbirkorlik subyektlari uchun buxgalteriya hisobining soddalashtirilgan tartibi 20-sonli BHMSda belgilangan.", True, "20-sonli BHMS — kichik tadbirkorlik subyektlari uchun."),
    S("Soliq hisobotlari qaysi tizim orqali elektron topshiriladi?", ["my.soliq.uz", "stat.uz", "lex.uz", "finlit.uz"], 0, "my.soliq.uz — soliq to'lovchining shaxsiy kabineti."),
]
T5_CARDS = [("QQS", "Qo'shilgan qiymat solig'i — asosiy stavka 12%"),
            ("Foyda solig'i", "Yuridik shaxs foydasidan olinadigan soliq — asosiy stavka 15%"),
            ("Aylanmadan olinadigan soliq", "Kichik biznes uchun tushumdan hisoblanadigan soliq (asosiy stavka 4%)"),
            ("JShDS", "Jismoniy shaxslardan olinadigan daromad solig'i — 12%"),
            ("Elektron hisob-faktura", "Tovar/xizmat yetkazib berilganini tasdiqlovchi, ERI bilan imzolanadigan hujjat"),
            ("Fiskal chek", "Onlayn-kassa yoki virtual kassa orqali beriladigan savdo cheki"),
            ("Penya", "Soliq yoki to'lov kechiktirilgan har bir kun uchun hisoblanadigan qo'shimcha summa"),
            ("20-sonli BHMS", "Kichik tadbirkorlik subyektlari uchun soddalashtirilgan buxgalteriya hisobi standarti")]
T5 = lesson("5", "Tadbirkor qanday soliqlarni to'laydi va hujjatlarni yuritadi",
    "Soliq tizimi, asosiy soliqlar, soliq rejimini tanlash, birlamchi hujjatlar va daromad-xarajat hisobi (M5, A5).",
    ["simulation", "tchart", "blitz", "workshop"], T5_LECT, T5_QUIZ, T5_CARDS,
    [{"type": "matching", "title": "Soliq va uning stavkasi/xususiyati", "max_points": 10, "instructions": "Har bir soliqni to'g'ri tavsif bilan moslang.",
      "content": {"pairs": [{"left": "QQS", "right": "Asosiy stavka 12%"}, {"left": "Foyda solig'i", "right": "Asosiy stavka 15%"},
                            {"left": "Aylanmadan olinadigan soliq", "right": "Kichik biznes tushumidan, asosiy stavka 4%"},
                            {"left": "JShDS", "right": "Ish haqidan ushlab qolinadi, 12%"},
                            {"left": "Ijtimoiy soliq", "right": "Ish beruvchi mehnatga haq to'lash fondidan to'laydi"}]}},
     {"type": "fillblank", "title": "Daromad-xarajat hisobi", "max_points": 10,
      "content": {"word_bank": True, "text": "Tadbirkor har bir operatsiyani [[hujjat]] bilan tasdiqlashi kerak. Tovar yetkazib berilganda elektron [[hisob-faktura]] rasmiylashtiriladi va u ERI bilan imzolanadi. Mijozga savdo paytida fiskal [[chek]] beriladi. Shaxsiy va biznes pullari [[aralashtirilmaydi]]. Soliq hisobotlari [[my.soliq.uz]] orqali topshiriladi. Hisobot muddati buzilsa, jarima va [[penya]] qo'llaniladi."}}],
    amaliy("A5", "Soliq rejimi va hujjatlar bilan ishlash",
        "1. O'z biznesingiz uchun **mos soliq rejimini** tanlang va asoslang (aylanma, xarajatlar, mijozlar turi).\n2. 1 oylik **daromad-xarajat daftarini** to'ldiring (kamida 10 ta operatsiya: sana, hujjat, mazmun, daromad, xarajat, qoldiq) va oy oxiridagi qoldiqni hisoblang.\n3. Tanlangan rejim bo'yicha **oylik soliq summasini** hisoblang.\n4. Bitta **hisob-faktura** va bitta **chek** namunasining zarur rekvizitlarini sanab bering.\n5. 3 oylik **soliq kalendari**ni tuzing.",
        "Soliq rejimi tanlovi va asoslash — 2; daromad-xarajat daftari (10+ operatsiya, to'g'ri qoldiq) — 3; soliq hisoblash to'g'ri — 2; hujjat rekvizitlari — 2; soliq kalendari — 1.",
        ["Xarajatlar ham hujjat bilan tasdiqlanishi kerak", "Soliqni tushumdan (aylanmadan) hisoblang, foydadan emas — agar soddalashtirilgan rejimni tanlasangiz"]),
    [mustaqil("MT13", "Tadbirkorlik subyektlari uchun soliq tizimlari va elektron soliq xizmatlaridan foydalanish tartibini o'rganish",
        "my.soliq.uz va \"Soliq\" mobil ilovasidagi tadbirkor uchun eng muhim 5 ta xizmatni tavsiflang. Soddalashtirilgan va umumbelgilangan rejimlarni solishtiring."),
     mustaqil("MT14", "Tadbirkorlik faoliyatida daromad va xarajatlar hisobini yuritish",
        "Elektron jadvalda (Excel/Google Sheets) daromad-xarajat jurnali shablonini yarating: formulalar bilan avtomatik qoldiq, oylik jami va soliq summasi. Shablon tuzilishini va formulalarni tavsiflang.")])

MODULE2 = {"title": "2-bo'lim. Biznesni huquqiy rasmiylashtirish va soliqlar",
           "description": "Tashkiliy-huquqiy shakllar, davlat ro'yxatidan o'tish, shartnomalar, soliq rejimlari va moliyaviy hujjatlar (M4–M5, A4–A5).",
           "lessons": [T4, T5]}
