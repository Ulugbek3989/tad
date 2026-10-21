from common import *

T6_LECT = """# Biznes-model qanday ishlaydi

## Biznes-model nima?
**Biznes-model** — kompaniya qanday qilib **qiymat yaratadi, uni mijozga yetkazadi va undan daromad oladi** degan savolga javob beradigan mantiqiy sxema.
- G'oya — "nima qilamiz?";
- Biznes-model — "kimga, qanday va qanday pul topamiz?".

## 9 blokli biznes-model sxemasi (Business Model Canvas)
A. Ostervalder va I. Pinye taklif qilgan sxema 9 ta blokdan iborat:
1. **Mijozlar segmentlari** — kimlar uchun qiymat yaratamiz?
2. **Qiymat taklifi** — qanday muammoni hal qilamiz, qanday foyda beramiz?
3. **Sotish kanallari** — mijozga qanday yetib boramiz (do'kon, onlayn, ijtimoiy tarmoq)?
4. **Mijozlar bilan munosabat** — shaxsiy xizmat, o'z-o'ziga xizmat, jamoa, obuna;
5. **Daromad manbalari** — mijoz nima uchun va qanday to'laydi?
6. **Asosiy resurslar** — moddiy, intellektual, inson, moliyaviy;
7. **Asosiy faoliyat turlari** — ishlab chiqarish, sotish, xizmat ko'rsatish;
8. **Asosiy hamkorlar** — yetkazib beruvchilar, sheriklar;
9. **Xarajatlar tuzilmasi** — doimiy va o'zgaruvchan xarajatlar.

## Bloklar qanday bog'langan?
- O'ng tomon (1–5) — **qiymat va daromad** (mijoz tomoni);
- Chap tomon (6–9) — **samaradorlik va xarajat** (biznes ichki tomoni).
> Daromad manbalari xarajatlar tuzilmasidan katta bo'lsa — model **barqaror**.

## Daromad modellari
| Model | Misol |
|---|---|
| Tovar sotish | Do'kon, ishlab chiqarish |
| Xizmat uchun to'lov | Sartaroshxona, repetitor |
| **Obuna** | Sport zali a'zoligi, onlayn kurslar |
| **Komissiya (vositachilik)** | Marketpleys, taksi agregatori |
| Ijara | Uskuna yoki xona ijarasi |
| **Freemium** | Bepul asosiy xizmat + pullik qo'shimcha imkoniyat |
| Reklama | Bepul kontent, reklama beruvchi to'laydi |
| Litsenziya / **franshiza** | Brend va tizimdan foydalanish huquqi |

## Zamonaviy biznes modellari
- **Obuna** — barqaror, oldindan ma'lum daromad;
- **Franshiza** — sinalgan brend va tizim; franchayzi boshlang'ich to'lov va royalti to'laydi;
- **Elektron platforma (marketpleys)** — sotuvchi va xaridorni bog'laydi, komissiya oladi;
- **D2C (to'g'ridan-to'g'ri iste'molchiga)** — vositachisiz onlayn sotish;
- **Ijtimoiy biznes modeli** — daromadning bir qismi ijtimoiy maqsadga.

## Biznes-modelni tekshirish
Har bir blok — bu **gipoteza**. Uni mijozlar bilan suhbat, MVP va raqamlar orqali tekshiring. Sxema qog'ozda bir martalik emas — bozordan olingan ma'lumotlarga qarab doimiy yangilanadi."""

T6_QUIZ = [
    S("9 blokli biznes-model sxemasi (Business Model Canvas) mualliflari kimlar?", ["F. Kotler va K. Keller", "A. Ostervalder va I. Pinye", "E. Ris va S. Blank", "M. Porter va P. Druker"], 1, "\"Business Model Generation\" kitobi mualliflari — Ostervalder va Pinye."),
    S("Qaysi blok \"Biz qanday muammoni hal qilamiz?\" savoliga javob beradi?", ["Asosiy resurslar", "Qiymat taklifi", "Xarajatlar tuzilmasi", "Hamkorlar"], 1, "Qiymat taklifi — mijoz uchun asosiy foyda."),
    S("Marketpleys asosan qanday daromad modelidan foydalanadi?", ["Komissiya", "Ijara", "Litsenziya", "Grant"], 0, "Platforma har bir savdodan komissiya oladi."),
    S("Bepul asosiy xizmat va pullik qo'shimcha imkoniyatlar modeli qanday ataladi?", ["Franshiza", "Freemium", "Lizing", "Barter"], 1, "Freemium = free + premium."),
    M("Biznes-model sxemasining \"chap tomoni\" (ichki tomoni) bloklarini belgilang.", ["Asosiy resurslar", "Asosiy hamkorlar", "Xarajatlar tuzilmasi", "Mijozlar segmentlari"], [0, 1, 2], "Mijozlar segmentlari — o'ng (mijoz) tomonda."),
    TF("Franshizada franchayzi brenddan foydalanish uchun odatda boshlang'ich to'lov va royalti to'laydi.", True, "Franshiza — sinalgan brend va tizimdan pullik foydalanish."),
    S("Obuna modelining asosiy afzalligi nima?", ["Bir martalik katta daromad", "Barqaror va oldindan ma'lum takroriy daromad", "Xarajat umuman yo'q", "Soliqdan ozod"], 1, "Obuna takroriy, prognoz qilinadigan daromad beradi."),
    S("Biznes-model qachon barqaror hisoblanadi?", ["Xodimlar ko'p bo'lsa", "Daromad manbalari xarajatlardan katta bo'lsa", "Reklama ko'p bo'lsa", "Ofis katta bo'lsa"], 1, "Barqarorlik — daromad xarajatlarni qoplab, foyda keltirishi."),
]
T6_CARDS = [("Biznes-model", "Qiymat yaratish, yetkazish va undan daromad olish mantig'i"),
            ("Mijozlar segmentlari", "Biznes qiymat yaratadigan mijozlar guruhlari"),
            ("Sotish kanallari", "Mahsulot mijozga yetib boradigan yo'llar"),
            ("Daromad manbalari", "Mijoz nima uchun va qanday to'lashi"),
            ("Freemium", "Bepul asosiy xizmat + pullik qo'shimcha imkoniyatlar"),
            ("Franshiza", "Sinalgan brend va biznes tizimidan haq evaziga foydalanish huquqi"),
            ("Marketpleys", "Sotuvchi va xaridorni bog'lab, komissiya oladigan elektron platforma"),
            ("Xarajatlar tuzilmasi", "Biznes-modelni amalga oshirish uchun doimiy va o'zgaruvchan xarajatlar")]
T6 = lesson("6", "Biznes-model qanday ishlaydi",
    "Biznes-model tushunchasi, 9 blokli sxema, daromad modellari va zamonaviy biznes modellari (M6, A6).",
    ["workshop", "cluster", "gallery", "peer_review"], T6_LECT, T6_QUIZ, T6_CARDS,
    [{"type": "matching", "title": "Biznes-model bloklari va savollar", "max_points": 10, "instructions": "Har bir blokni u javob beradigan savol bilan moslang.",
      "content": {"pairs": [{"left": "Mijozlar segmentlari", "right": "Kim uchun qiymat yaratamiz?"}, {"left": "Qiymat taklifi", "right": "Qanday muammoni hal qilamiz?"},
                            {"left": "Sotish kanallari", "right": "Mijozga qanday yetib boramiz?"}, {"left": "Daromad manbalari", "right": "Mijoz nima uchun va qanday to'laydi?"},
                            {"left": "Asosiy resurslar", "right": "Qanday aktivlar zarur?"}, {"left": "Asosiy hamkorlar", "right": "Kim bilan birga ishlaymiz?"},
                            {"left": "Xarajatlar tuzilmasi", "right": "Eng katta xarajatlar qaysilar?"}]}},
     {"type": "classify", "title": "Kompaniyalarning daromad modelini aniqlang", "max_points": 10,
      "content": {"categories": [{"name": "Obuna", "items": ["Sport zali oylik a'zoligi", "Onlayn kino xizmati"]},
                                 {"name": "Komissiya", "items": ["Taksi agregatori", "Onlayn marketpleys"]},
                                 {"name": "Franshiza", "items": ["Fast-food tarmog'i filiali", "Xalqaro til markazi filiali"]},
                                 {"name": "Freemium", "items": ["Bepul va pullik versiyali mobil ilova", "Bepul darslar + pullik sertifikat"]}]}},
     board("Galereya sayri: biznes-model sxemalarimiz", "gallery", "O'z biznes-model sxemangizning eng kuchli va eng zaif blokini yozing; boshqalarnikiga izoh qoldiring.",
           ["Eng kuchli blok", "Eng zaif blok", "Sheriklarga tavsiyalar"], "Guruh ustaxonasi natijasini taqdim eting va kamida 2 ta sherikka izoh yozing.")],
    amaliy("A6", "9 blokli biznes-model sxemasi",
        "O'z biznes g'oyangiz uchun **9 blokli biznes-model sxemasini** to'ldiring. Har bir blokka 2–4 ta aniq punkt yozing:\n\n1. Mijozlar segmentlari\n2. Qiymat taklifi (mahsulot foydasi)\n3. Sotish kanallari\n4. Mijozlar bilan munosabat\n5. Daromad manbalari (narx bilan)\n6. Asosiy resurslar\n7. Asosiy faoliyat\n8. Asosiy hamkorlar\n9. Xarajatlar (doimiy va o'zgaruvchan)\n\nSo'ng sxemadagi **eng xavfli 2 ta gipotezani** ko'rsating va ularni qanday tekshirishingizni yozing.",
        "9 blokning hammasi to'ldirilgan va aniq — 5; bloklar o'zaro mantiqan bog'langan — 2; daromad va xarajat real — 1; xavfli gipotezalar va tekshirish usuli — 2.",
        ["Har bir blokda umumiy so'zlar emas, aniq ma'lumot bo'lsin (\"yoshlar\" emas, \"18–25 yoshli talabalar, Jizzax shahri\")"]),
    [mustaqil("MT15", "Biznes modelning asosiy elementlari va 9 blokli biznes model sxemasini ishlab chiqish",
        "O'zbekistonda faoliyat yuritayotgan bitta tanish kompaniya (masalan, mahalliy marketpleys, yetkazib berish xizmati yoki kafe tarmog'i) uchun 9 blokli sxemani tuzing va uning qaysi blokini o'z biznesingizda qo'llash mumkinligini yozing."),
     mustaqil("MT16", "Zamonaviy biznes modellar: obuna, franshiza, elektron platforma va boshqa modellarni qiyosiy tahlil qilish",
        "Obuna, franshiza, elektron platforma va freemium modellarini afzallik, kamchilik, boshlang'ich xarajat va misollar bo'yicha qiyosiy jadvalda tahlil qiling.")])

T7_LECT = """# Mijoz kim va unga nima kerak?

## Mijozni bilish — biznesning asosi
"Hamma — mening mijozim" degan yondashuv xato. Mahsulot **aniq odamlar guruhining aniq muammosini** hal qilishi kerak. Mijozni chuqur bilish: to'g'ri mahsulot, narx, reklama kanali va xabarni tanlash imkonini beradi.

## Bozor segmentatsiyasi
**Segmentatsiya** — bozorni o'xshash ehtiyoj va xatti-harakatga ega mijozlar guruhlariga bo'lish.
Segmentatsiya mezonlari:
- **Geografik** — shahar, tuman, qishloq, iqlim;
- **Demografik** — yosh, jins, daromad, ma'lumot, oila tarkibi;
- **Psixografik** — turmush tarzi, qadriyatlar, qiziqishlar;
- **Xulq-atvor** — xarid chastotasi, sodiqlik, foydalanish sababi;
- B2B uchun: soha, kompaniya hajmi, joylashuvi.

## Maqsadli segmentni tanlash
Yaxshi segment:
1. **Yetarli hajmga** ega;
2. **To'lov qobiliyatiga** ega;
3. Unga **yetib borish** mumkin (kanal bor);
4. **Raqobat** haddan tashqari yuqori emas;
5. Sizning **resurslaringizga** mos.

## Mijoz portreti (persona)
Mijoz portreti — maqsadli segmentning tipik vakilini tasvirlovchi **umumlashtirilgan obraz**:
- ism, yosh, kasb, daromad, yashash joyi;
- kundalik hayoti va **muammolari (og'riq nuqtalari)**;
- **maqsad va istaklari**;
- qayerdan ma'lumot oladi (Telegram, Instagram, do'stlar);
- xarid qarorini nima belgilaydi (narx, sifat, tezlik, ishonch);
- **e'tirozlari** ("qimmat", "ishonmayman").
> Namuna: *Dilnoza, 22 yosh, talaba, Jizzax. Darsdan keyin ishlaydi, vaqti kam. Muammosi — sog'lom ovqatlanishga vaqt yo'q. Telegramdan ma'lumot oladi. Narx 30 000 so'mgacha bo'lsa, tez yetkazib berishga pul to'laydi.*

## "Bajarilishi kerak bo'lgan ish" (Jobs to be done)
Mijoz mahsulotni emas, **natijani** sotib oladi: "odamlar parma sotib olmaydi — ularga devordagi teshik kerak". Mijoz qaysi "ishni" bajarish uchun mahsulotingizni "yollaydi"?

## Bozor hajmini baholash: TAM, SAM, SOM
- **TAM** (umumiy bozor) — mahsulotga bo'lgan umumiy talab;
- **SAM** (xizmat ko'rsatish mumkin bo'lgan bozor) — sizning geografiya va segmentingizdagi qism;
- **SOM** (real egallanadigan bozor) — yaqin 1–3 yilda real egallash mumkin bo'lgan ulush.
**Hisoblash formulasi:** mijozlar soni × yillik xaridlar soni × o'rtacha chek.

## Raqobatchilar tahlili
- **To'g'ridan-to'g'ri** raqobatchilar — xuddi shunday mahsulot;
- **Bilvosita** raqobatchilar — muammoni boshqacha hal qiladiganlar;
- taqqoslash: taklif, **narx**, sifat, xizmat, joylashuv, **zaif tomonlari**;
- **SWOT tahlil**: kuchli tomonlar (S), zaif tomonlar (W), imkoniyatlar (O), tahdidlar (T)."""

T7_QUIZ = [
    S("Bozorni o'xshash ehtiyojli mijozlar guruhlariga bo'lish nima deb ataladi?", ["Pozitsiyalash", "Segmentatsiya", "Diversifikatsiya", "Integratsiya"], 1, "Segmentatsiya — bozorni guruhlarga bo'lish."),
    S("Yosh, jins, daromad bo'yicha segmentatsiya qanday mezonga kiradi?", ["Geografik", "Demografik", "Psixografik", "Xulq-atvor"], 1, "Bu demografik mezonlar."),
    S("Turmush tarzi va qadriyatlar bo'yicha segmentatsiya qaysi?", ["Psixografik", "Geografik", "Demografik", "Texnologik"], 0, "Psixografik — qadriyatlar, qiziqishlar, turmush tarzi."),
    S("Maqsadli segmentning tipik vakilini tasvirlovchi umumlashtirilgan obraz nima?", ["Brend", "Mijoz portreti (persona)", "Logotip", "Slogan"], 1, "Persona — mijoz portreti."),
    S("Yaqin 1–3 yilda real egallash mumkin bo'lgan bozor ulushi qanday belgilanadi?", ["TAM", "SAM", "SOM", "ROI"], 2, "SOM — Serviceable Obtainable Market."),
    N("Shaharda 20 000 potensial mijoz bor, har biri yiliga 4 marta xarid qiladi, o'rtacha chek 50 000 so'm. Yillik bozor hajmi necha so'm?", 4000000000, "20 000 × 4 × 50 000 = 4 000 000 000 so'm (4 mlrd)."),
    M("SWOT tahlilidagi ICHKI omillarni belgilang.", ["Kuchli tomonlar (S)", "Zaif tomonlar (W)", "Imkoniyatlar (O)", "Tahdidlar (T)"], [0, 1], "S va W — ichki; O va T — tashqi omillar."),
    TF("Taksi xizmati uchun jamoat transporti bilvosita raqobatchi hisoblanadi.", True, "Bilvosita raqobatchi mijoz muammosini boshqacha usulda hal qiladi."),
]
T7_CARDS = [("Segmentatsiya", "Bozorni o'xshash ehtiyojli mijozlar guruhlariga bo'lish"),
            ("Mijoz portreti (persona)", "Maqsadli segmentning tipik vakili obrazi"),
            ("Og'riq nuqtasi", "Mijozni eng ko'p qiynaydigan muammo"),
            ("TAM / SAM / SOM", "Umumiy bozor / xizmat ko'rsatish mumkin bo'lgan bozor / real egallanadigan ulush"),
            ("Jobs to be done", "Mijoz mahsulotni bajarishi kerak bo'lgan \"ish\" (natija) uchun sotib oladi"),
            ("To'g'ridan-to'g'ri raqobatchi", "Xuddi shunday mahsulot taklif qiluvchi"),
            ("Bilvosita raqobatchi", "Mijoz muammosini boshqa usulda hal qiluvchi"),
            ("SWOT", "Kuchli, zaif tomonlar, imkoniyatlar va tahdidlar tahlili")]
T7 = lesson("7", "Mijoz kim va unga nima kerak?",
    "Bozor segmentatsiyasi, mijoz portreti, bozor hajmi (TAM/SAM/SOM) va raqobatchilar tahlili (M7, A7).",
    ["swot", "six_hats", "tps", "case_study"], T7_LECT, T7_QUIZ, T7_CARDS,
    [{"type": "classify", "title": "Segmentatsiya mezonlari", "max_points": 10, "instructions": "Har bir belgini tegishli segmentatsiya mezoniga joylashtiring.",
      "content": {"categories": [{"name": "Geografik", "items": ["Jizzax shahri", "Qishloq hududi"]},
                                 {"name": "Demografik", "items": ["18–25 yosh", "Oylik daromadi 5 mln so'mgacha"]},
                                 {"name": "Psixografik", "items": ["Sog'lom turmush tarziga intiladi", "Ekologik qadriyatlarga ega"]},
                                 {"name": "Xulq-atvor", "items": ["Haftada 3 marta xarid qiladi", "Brendga sodiq mijoz"]}]}},
     board("SWOT: raqobatchimiz", "swot", "Tanlangan raqobatchingiz (yoki o'z biznesingiz) uchun SWOT tahlil.",
           ["S — Kuchli", "W — Zaif", "O — Imkoniyat", "T — Tahdid"], "Guruhda bitta mahalliy raqobatchini tanlang va har bir ustunga kamida 1 ta fikr yozing.")],
    amaliy("A7", "Mijoz portreti va raqobatchilar tahlili",
        "1. Biznesingiz uchun **kamida ikkita mijoz guruhini (segment)** aniqlang va har birini 4 mezon bo'yicha tavsiflang.\n2. Asosiy segment uchun **mijoz portretini** tuzing (ism, yosh, kasb, daromad, muammolar, maqsadlar, ma'lumot manbalari, xarid mezonlari, e'tirozlar).\n3. Kamida **3 ta raqobatchini** aniqlang va jadvalda solishtiring: taklif, narx, sifat, xizmat, **zaif tomonlari**.\n4. Raqobatchilarning zaif tomonlariga qarab, **sizning ustunligingiz** nimada ekanini 2–3 gapda yozing.",
        "Ikki segment va mezonlar — 2; batafsil mijoz portreti — 3; raqobatchilar jadvali (3+ raqobatchi, narx, zaif tomon) — 3; o'z ustunligini asoslash — 2.",
        ["Raqobatchilarni Instagram, Telegram, Google Maps va 2GIS dagi izohlar orqali o'rganing"]),
    [mustaqil("MT17", "Bozor segmentatsiyasi, maqsadli mijozlarni aniqlash va mijoz portretini shakllantirish",
        "Biznesingiz uchun bozorni 4 mezon bo'yicha segmentlarga ajrating, maqsadli segmentni 5 ta mezon (hajm, to'lov qobiliyati, yetib borish, raqobat, resurs) bo'yicha tanlang."),
     mustaqil("MT18", "Bozor hajmini aniqlash va biznesning rejalashtirilgan bozor ulushini hisoblash",
        "stat.uz ma'lumotlaridan foydalanib, TAM, SAM va SOM ni hisoblang (formula va manbalar bilan). Birinchi yil uchun real savdo hajmini asoslang."),
     mustaqil("MT19", "Raqobatchilar faoliyatini SWOT tahlili, narx va takliflar asosida baholash",
        "2 ta asosiy raqobatchi uchun to'liq SWOT tahlil qiling va ularning narx/taklif strategiyasini solishtiring. Xulosa: siz qaysi bo'shliqni egallaysiz?")])

MODULE3 = {"title": "3-bo'lim. Biznes-model va mijoz",
           "description": "9 blokli biznes-model, daromad modellari, segmentatsiya, mijoz portreti va raqobat tahlili (M6–M7, A6–A7).",
           "lessons": [T6, T7]}
