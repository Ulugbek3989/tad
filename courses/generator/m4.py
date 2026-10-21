from common import *

T8_LECT = """# Mahsulotni reklama qilish va mijozga yetkazish

## Marketing kompleksi (4P)
- **Product (Mahsulot)** — nima taklif qilamiz;
- **Price (Narx)** — qanchaga sotamiz;
- **Place (Joy / kanal)** — qayerda va qanday yetkazamiz;
- **Promotion (Rag'batlantirish / reklama)** — mijoz qanday bilib oladi.

## Mijozning xarid yo'li (AIDA)
1. **Attention (Diqqat)** — mijoz sizni payqaydi;
2. **Interest (Qiziqish)** — batafsil bilishni xohlaydi;
3. **Desire (Istak)** — sotib olishni xohlaydi;
4. **Action (Harakat)** — buyurtma beradi.
Har bir bosqich uchun alohida kontent va xabar kerak.

## Reklama kanallari
| Kanal | Qachon samarali |
|---|---|
| **Telegram** kanal/bot/guruhlar | O'zbekistonda eng keng auditoriya, buyurtma qabul qilish qulay |
| **Instagram** | Vizual mahsulotlar: kiyim, ovqat, dizayn, go'zallik |
| **YouTube** | Ta'limiy va batafsil kontent, ishonch yaratish |
| **TikTok** | Yoshlar auditoriyasi, qisqa video, tez tarqalish |
| Tashqi reklama, varaqalar | Mahalliy biznes (do'kon, kafe) |
| "Og'izdan-og'izga", tavsiya | Har qanday biznes uchun eng arzon va ishonchli |
| Blogerlar bilan hamkorlik | Yangi auditoriyaga tez chiqish |

## Kontent-reja
**Kontent-reja** — qaysi kanalda, qachon, qanday kontent chiqarilishining jadvali.
Kontent turlari (taxminiy nisbat):
- **foydali** (maslahat, qo'llanma) — ~40%;
- **ishonch** (mijoz fikrlari, ish jarayoni, jamoa) — ~30%;
- **sotuv** (taklif, aksiya, narx) — ~20%;
- **ko'ngilochar** (trend, hazil) — ~10%.
Jadval ustunlari: sana | kanal | mavzu | format (post, reels, stories) | maqsad | natija.

## Reklama byudjeti va samaradorlik
- byudjetni **daromadning ulushi** sifatida yoki **maqsadga qarab** rejalashtirish;
- asosiy ko'rsatkichlar:
  - **CAC** — bitta mijozni jalb qilish narxi = reklama xarajati ÷ yangi mijozlar soni;
  - **konversiya** = xaridorlar ÷ qiziqqanlar × 100%;
  - **ROMI** = (reklamadan qo'shimcha foyda − reklama xarajati) ÷ reklama xarajati × 100%.
> Agar **CAC** bitta mijozdan olinadigan foydadan katta bo'lsa — reklama zarar keltiradi.

## Mahsulotni mijozga yetkazish (logistika)
- **O'zi olib ketish** (pickup) — arzon, lekin mijoz uchun noqulay;
- **O'z kuryeri** — nazorat yuqori, xarajat doimiy;
- **Kuryerlik xizmatlari va yetkazib berish agregatorlari** — moslashuvchan, har buyurtma uchun to'lov;
- **Pochta xizmati** — viloyatlararo yetkazish;
- **Marketpleyslar** orqali sotish — ombor va yetkazishni platforma bajaradi (komissiya evaziga).
Tanlov mezonlari: **narx, tezlik, ishonchlilik, qamrov, mahsulot xususiyati** (tez buziladigan, mo'rt)."""

T8_QUIZ = [
    S("Marketing kompleksi 4P ga qaysi element KIRMAYDI?", ["Product", "Price", "Place", "Profit"], 3, "4P: Product, Price, Place, Promotion."),
    S("AIDA modelida birinchi bosqich qaysi?", ["Interest", "Attention", "Desire", "Action"], 1, "Avval mijozning diqqatini tortish kerak."),
    N("Reklamaga 3 000 000 so'm sarflandi va 60 ta yangi mijoz keldi. CAC (bitta mijozni jalb qilish narxi) necha so'm?", 50000, "3 000 000 ÷ 60 = 50 000 so'm."),
    N("Sahifaga 2 000 kishi qiziqdi, ulardan 80 tasi xarid qildi. Konversiya necha foiz?", 4, "80 ÷ 2000 × 100% = 4%."),
    S("Kontent-rejada eng katta ulush odatda qaysi kontent turiga ajratiladi?", ["Sotuv kontenti", "Foydali kontent", "Faqat aksiyalar", "Faqat ko'ngilochar"], 1, "Foydali kontent auditoriyani ushlab turadi va ishonch yaratadi."),
    M("Yetkazib berish usulini tanlash mezonlarini belgilang.", ["Narx", "Tezlik", "Ishonchlilik", "Kuryerning ismi"], [0, 1, 2], "Narx, tezlik, ishonchlilik, qamrov va mahsulot xususiyati."),
    TF("Agar bitta mijozni jalb qilish narxi undan olinadigan foydadan katta bo'lsa, reklama foydali hisoblanadi.", False, "Bu holda reklama zarar keltiradi."),
    S("Yoshlar auditoriyasiga qisqa video orqali tez tarqalish uchun qaysi kanal ko'proq mos?", ["Gazeta", "TikTok", "Radio", "Pochta"], 1, "TikTok — qisqa video va yoshlar auditoriyasi."),
]
T8_CARDS = [("4P", "Product, Price, Place, Promotion — marketing kompleksi"),
            ("AIDA", "Diqqat → Qiziqish → Istak → Harakat"),
            ("Kontent-reja", "Qaysi kanalda qachon qanday kontent chiqarilishi jadvali"),
            ("CAC", "Bitta mijozni jalb qilish narxi = reklama xarajati ÷ yangi mijozlar"),
            ("Konversiya", "Xaridorlar ÷ qiziqqanlar × 100%"),
            ("ROMI", "Marketing investitsiyalari qaytimi"),
            ("Logistika", "Mahsulotni saqlash va mijozga yetkazishni tashkil etish")]
T8 = lesson("8", "Mahsulotni reklama qilish va mijozga yetkazish",
    "4P, AIDA, reklama kanallari, kontent-reja, reklama samaradorligi va logistika (M8, A8).",
    ["brainstorm", "workshop", "gallery", "pbl"], T8_LECT, T8_QUIZ, T8_CARDS,
    [{"type": "ordering", "title": "AIDA modeli bosqichlari", "max_points": 10,
      "content": {"prompt": "Mijozning xarid yo'li", "items": ["Diqqat — mijoz reklamani payqaydi", "Qiziqish — batafsil ma'lumot o'qiydi", "Istak — mahsulotni xohlaydi", "Harakat — buyurtma beradi"]}},
     board("Aqliy hujum: kontent g'oyalari", "brainstorm", "Biznesingiz uchun 1 oyda chiqarish mumkin bo'lgan kontent g'oyalari.",
           ["Foydali", "Ishonch", "Sotuv", "Ko'ngilochar"], "Har bir ustunga kamida 1 ta g'oya yozing.")],
    amaliy("A8", "Bir oylik kontent-reja",
        "1. Biznesingizning **maqsadli auditoriyasini** (mijoz portreti asosida) qisqacha yozing.\n2. 2–3 ta **kanalni** tanlang (Telegram, Instagram, YouTube, TikTok va h.k.) va tanlovni asoslang.\n3. **Bir oylik kontent-reja** tuzing (kamida 12 ta post/video): sana | kanal | mavzu | format | maqsad (AIDA bosqichi).\n4. Reklama **byudjeti** va kutilgan natijani yozing: qamrov, qiziqqanlar, xaridorlar, CAC.\n5. Mahsulotni **yetkazib berish usulini** tanlang va asoslang.",
        "Auditoriya tavsifi — 1; kanallar tanlovi — 2; kontent-reja (12+ birlik, turli tur va AIDA bosqichlari) — 4; byudjet va CAC hisobi — 2; yetkazish usuli — 1.",
        ["Kontent nisbati: 40% foydali, 30% ishonch, 20% sotuv, 10% ko'ngilochar", "Har bir post maqsadini o'lchanadigan qilib yozing"]),
    [mustaqil("MT21", "Ijtimoiy tarmoqlar orqali biznesni targ'ib qilish va bir oylik kontent-reja tayyorlash",
        "3 ta muvaffaqiyatli mahalliy biznesning Instagram/Telegram sahifasini tahlil qiling (kontent turi, chastota, faollik) va o'z kontent-rejangizga 5 ta xulosa chiqaring."),
     mustaqil("MT22", "Reklama byudjetini shakllantirish va marketing faoliyati samaradorligini baholash",
        "3 oylik reklama byudjetini kanallar bo'yicha taqsimlang va har bir kanal uchun kutilgan CAC, konversiya va ROMI ni hisoblang."),
     mustaqil("MT25", "Mahsulotni mijozga yetkazib berish, logistika usullari va ularning samaradorligini qiyosiy baholash",
        "4 ta yetkazib berish usulini narx, tezlik, ishonchlilik va qamrov bo'yicha baholang (ball bilan jadval) va o'z mahsulotingiz uchun eng samaralisini tanlang.")])

T9_LECT = """# Savdo jarayonini tashkil etish va mijozlar bilan ishlash

## Savdo voronkasi
**Savdo voronkasi** — potensial mijozning birinchi tanishuvdan xaridgacha bo'lgan bosqichlari:
1. **Qamrov** — reklamani ko'rganlar;
2. **Qiziqish (lid)** — murojaat qilganlar;
3. **Muloqot / taklif** — ehtiyoji aniqlangan, taklif berilganlar;
4. **Xarid** — to'lov qilganlar;
5. **Takroriy xarid va tavsiya** — sodiq mijozlar.
Har bosqichdagi **konversiyani** o'lchab, eng ko'p mijoz "yo'qolayotgan" joyni topish va yaxshilash kerak.

## Sotuv muloqoti bosqichlari
1. **Aloqa o'rnatish** — salomlashish, ishonch yaratish;
2. **Ehtiyojni aniqlash** — ochiq savollar: "Qanday maqsadda kerak?", "Nimaga e'tibor berasiz?";
3. **Taklif (prezentatsiya)** — xususiyat emas, **mijoz uchun foyda** haqida gapirish;
4. **E'tirozlar bilan ishlash**;
5. **Savdoni yakunlash** — aniq keyingi qadamni taklif qilish ("Qaysi rangini rasmiylashtiramiz?");
6. **Xariddan keyingi aloqa** — fikr so'rash, qo'shimcha taklif.

## E'tirozlar bilan ishlash
E'tiroz — rad javobi emas, **qo'shimcha ma'lumotga ehtiyoj**. Usul: **tinglash → qo'shilish → aniqlashtirish → javob → tasdiqlash**.
| E'tiroz | Javob yo'nalishi |
|---|---|
| **"Qimmat"** | Narxni qiymatga bog'lash: "Nima bilan solishtiryapsiz?", sifat, kafolat, xizmat muddati, bo'lib to'lash |
| **"Keyin olaman"** | Haqiqiy sababni aniqlash; cheklangan taklif, band qilib qo'yish |
| **"Kerak emas"** | Ehtiyojni qayta aniqlash, foydasini misol bilan ko'rsatish |
| **"O'ylab ko'raman"** | "Qaysi jihatini o'ylamoqchisiz?" — shubhani aniqlash |
| **"Boshqa joyda arzon"** | Taklifni to'liq solishtirish: yetkazish, kafolat, sifat |

## Mijozlar bazasi (CRM)
**CRM** — mijozlar bilan munosabatlarni boshqarish tizimi. Kichik biznes uchun hatto **elektron jadval** ham yetarli:
- ism, telefon, manba (qayerdan keldi), xaridlar tarixi, o'rtacha chek, oxirgi xarid sanasi, izohlar;
- mijozlarni guruhlash: yangi, doimiy, "uxlab qolgan".

## Mijozlar bilan uzoq muddatli munosabat
- **Yangi mijoz jalb qilish** odatda **mavjud mijozni saqlab qolishdan** bir necha barobar qimmat;
- sodiqlik dasturlari: chegirma kartasi, bonuslar, "5-xarid bepul";
- shaxsiy muloqot, tug'ilgan kun tabrigi, xariddan keyingi so'rov;
- **shikoyatlar bilan ishlash**: tez javob, kechirim, yechim, kompensatsiya — norozi mijozni sodiq mijozga aylantirish mumkin.

## Tadbirkorlik etikasi
Halollik, va'dalarni bajarish, mijoz ma'lumotlarini himoya qilish, raqobatchilarni qoralamaslik — uzoq muddatli obro' asosi."""

T9_QUIZ = [
    S("Savdo voronkasining birinchi bosqichi qaysi?", ["Xarid", "Qamrov (reklamani ko'rganlar)", "Takroriy xarid", "E'tiroz"], 1, "Voronka eng keng qamrovdan boshlanadi."),
    S("Sotuv muloqotida ehtiyojni aniqlash uchun qanday savollar beriladi?", ["Yopiq (ha/yo'q)", "Ochiq savollar", "Savol berilmaydi", "Faqat narx haqida"], 1, "Ochiq savollar mijozni ko'proq gapirishga undaydi."),
    S("Taklif bosqichida nimaga e'tibor qaratish kerak?", ["Mahsulotning texnik xususiyatlariga", "Mijoz uchun foydaga", "Raqobatchilarni tanqid qilishga", "Narxni yashirishga"], 1, "Mijoz xususiyatni emas, foydani sotib oladi."),
    S("\"Qimmat\" e'tiroziga eng to'g'ri yondashuv qaysi?", ["Darhol chegirma berish", "Narxni qiymat (sifat, kafolat, natija) bilan bog'lab tushuntirish", "Bahslashish", "Mijozni e'tiborsiz qoldirish"], 1, "Narx qiymat orqali asoslanadi."),
    TF("Yangi mijoz jalb qilish odatda mavjud mijozni saqlab qolishdan arzonroq.", False, "Aksincha — mavjud mijozni saqlash ancha arzon."),
    S("Mijozlar bilan munosabatlarni boshqarish tizimi qisqacha qanday ataladi?", ["ERP", "CRM", "KPI", "SMM"], 1, "CRM — Customer Relationship Management."),
    M("E'tiroz bilan ishlash bosqichlariga nimalar kiradi?", ["Tinglash", "Aniqlashtirish", "Javob berish", "Mijozni ayblash"], [0, 1, 2], "Tinglash → qo'shilish → aniqlashtirish → javob → tasdiqlash."),
    N("Voronkada 500 ta lid bor edi, ulardan 50 tasi xarid qildi. Lid → xarid konversiyasi necha foiz?", 10, "50 ÷ 500 × 100% = 10%."),
]
T9_CARDS = [("Savdo voronkasi", "Qamrovdan xaridgacha mijozning bosqichma-bosqich yo'li"),
            ("Lid", "Mahsulotga qiziqib murojaat qilgan potensial mijoz"),
            ("E'tiroz", "Mijozning qo'shimcha ma'lumot yoki ishonchga ehtiyoji"),
            ("CRM", "Mijozlar bilan munosabatlarni boshqarish tizimi"),
            ("Sodiqlik dasturi", "Takroriy xarid uchun rag'bat (bonus, chegirma)"),
            ("Ochiq savol", "Ha/yo'q bilan javob berib bo'lmaydigan, batafsil javob talab qiladigan savol")]
T9 = lesson("9", "Savdo jarayonini tashkil etish va mijozlar bilan ishlash",
    "Savdo voronkasi, sotuv muloqoti, e'tirozlar bilan ishlash, CRM va mijozlarni saqlab qolish (M9, A9).",
    ["role_play", "simulation", "fishbone", "peer_review"], T9_LECT, T9_QUIZ, T9_CARDS,
    [{"type": "ordering", "title": "Sotuv muloqoti bosqichlari", "max_points": 10,
      "content": {"prompt": "Savdo muloqotini to'g'ri tartibga keltiring", "items": ["Aloqa o'rnatish", "Ehtiyojni aniqlash", "Taklif (foydani ko'rsatish)", "E'tirozlar bilan ishlash", "Savdoni yakunlash", "Xariddan keyingi aloqa"]}},
     {"type": "case", "title": "Rol o'yini: \"Savdogar — xaridor\"", "max_points": 10,
      "instructions": "Simulyatsiya: siz sotuvchisiz. Har bir e'tirozga muloqot ssenariysini yozing (o'zingizning so'zlaringiz bilan, 2–4 gap).",
      "rubric": "Har bir e'tirozga tinglash-aniqlashtirish-javob tuzilmasida, foydaga yo'naltirilgan, hurmatli javob — har biri 2 ball; savdoni yakunlovchi aniq taklif — 2 ball.",
      "content": {"scenario": "Siz qo'lda tikilgan sumkalar sotasiz (narxi 280 000 so'm, 6 oy kafolat, bepul yetkazish). Instagramda mijoz yozdi va quyidagi e'tirozlarni bildirdi.",
                  "questions": ["\"Bozorda shunga o'xshashi 150 000 so'm, siznikida qimmat.\"", "\"Hozir emas, keyin olaman.\"", "\"Menga sumka kerak emas, bor.\"", "\"Onlayn olishga ishonmayman.\""],
                  "reference_answer": "Qimmat: farqni aniqlash (material, qo'lda tikilgan, 6 oy kafolat, bepul yetkazish), narxni xizmat muddatiga bo'lish. Keyin: sababni so'rash, band qilib qo'yish yoki cheklangan aksiya. Kerak emas: qaysi vaziyatlar uchun ishlatishini so'rash, yangi foydani ko'rsatish. Ishonmayman: mijoz izohlari, yetkazilganda to'lash, kafolat. Yakun: \"Qaysi rangini rasmiylashtiramiz?\""}}],
    amaliy("A9", "Sotuv muloqoti ssenariysi (rol o'yini)",
        "Rol o'yini orqali sotuv muloqotini mashq qiling va **o'z mahsulotingiz uchun sotuv ssenariysini** yozing:\n\n1. Aloqa o'rnatish va ehtiyojni aniqlash uchun **5 ta ochiq savol**;\n2. Mahsulotning 3 ta xususiyatini **mijoz foydasiga** aylantiring (\"xususiyat → foyda\");\n3. **\"Qimmat\", \"keyin olaman\", \"kerak emas\"** e'tirozlariga javob ssenariysi;\n4. Savdoni **yakunlash** iborasi va xariddan keyingi aloqa xabari;\n5. Rol o'yinidan keyingi **refleksiya**: sherigingiz nimani yaxshi qildi, nimani yaxshilash kerak?",
        "Ochiq savollar — 2; xususiyat→foyda — 2; uchta e'tirozga sifatli javob — 3; yakunlash va keyingi aloqa — 1; refleksiya — 2.",
        ["E'tirozga darhol chegirma bilan javob bermang — avval sababni aniqlang"]),
    [mustaqil("MT23", "Savdo jarayoni, mijozlar bilan ishlash va xaridor e'tirozlariga javob berish usullarini ishlab chiqish",
        "O'z biznesingiz uchun savdo voronkasini chizing (bosqichlar va taxminiy raqamlar) va 7 ta eng ko'p uchraydigan e'tirozga javoblar \"shpargalkasi\"ni tuzing."),
     mustaqil("MT24", "Mijozlar bazasini shakllantirish, yuritish va mijozlar bilan uzoq muddatli munosabatlarni tashkil etish",
        "Elektron jadvalda oddiy CRM shablonini yarating (ustunlar va namuna yozuvlar) va sodiqlik dasturi g'oyasini ishlab chiqing.")])

T10_LECT = """# Mahsulot narxini shakllantirish

## Narx nimaga bog'liq?
Narxni uchta asosiy omil belgilaydi:
- **Xarajatlar** — narxning quyi chegarasi (zarar ko'rmaslik uchun);
- **Mijoz uchun qiymat** — narxning yuqori chegarasi (mijoz to'lashga tayyor summa);
- **Raqobatchilar narxi** — bozordagi mo'ljal.

## Xarajatlar turlari
- **Doimiy xarajatlar (FC)** — savdo hajmiga bog'liq emas: ijara, oylik maosh (belgilangan), kommunal, internet, kredit foizi;
- **O'zgaruvchan xarajatlar (VC)** — har bir birlik bilan o'zgaradi: xomashyo, qadoq, yetkazish, sotuvchi foizi;
- **Birlik tannarxi** = o'zgaruvchan xarajat (1 birlikka) + doimiy xarajatlarning 1 birlikka to'g'ri keladigan qismi.

## Narx belgilash usullari
| Usul | Mohiyati |
|---|---|
| **Xarajat + ustama** | Tannarxga foiz qo'shiladi: Narx = Tannarx × (1 + ustama%) |
| **Raqobatchilarga qarab** | Bozor narxiga yaqin, farq sifat yoki xizmat bilan asoslanadi |
| **Qiymatga asoslangan** | Mijoz oladigan foyda asosida (masalan, vaqt yoki pul tejash) |
| **Kirish narxi (penetratsiya)** | Bozorni egallash uchun past narx bilan boshlash |
| **"Qaymog'ini olish"** | Yangi noyob mahsulotga yuqori narx, keyin pasaytirish |
| **Psixologik narx** | 99 900 so'm, to'plam narxi, "2+1" |

## Zararsizlik nuqtasi
**Zararsizlik nuqtasi** — daromad barcha xarajatlarni aynan qoplaydigan, foyda ham, zarar ham bo'lmagan savdo hajmi.
- **Marjinal daromad (1 birlik)** = Narx − O'zgaruvchan xarajat (1 birlik);
- **Zararsizlik nuqtasi (dona)** = Doimiy xarajatlar ÷ (Narx − O'zgaruvchan xarajat);
- **Zararsizlik nuqtasi (so'm)** = Zararsizlik nuqtasi (dona) × Narx.
> **Misol:** Doimiy xarajat 6 000 000 so'm/oy, narx 50 000 so'm, o'zgaruvchan xarajat 30 000 so'm. Zararsizlik nuqtasi = 6 000 000 ÷ 20 000 = **300 dona/oy**. 301-donadan boshlab biznes foyda ko'radi.

## Raqobatbardosh narx siyosati
- chegirmalar va aksiyalar (mavsumiy, birinchi xarid, ulgurji);
- **narx differensiatsiyasi** — turli segmentlar uchun turli paketlar (ekonom, standart, premium);
- to'plam (bundle) narxlari;
- narxni o'zgartirishda mijozlarni oldindan xabardor qilish.
> Narxni pasaytirishdan oldin hisoblang: narx 10% pasaysa, xuddi shu foydani olish uchun savdo hajmi qancha oshishi kerak?"""

T10_QUIZ = [
    S("Savdo hajmiga bog'liq bo'lmagan xarajatlar qanday ataladi?", ["O'zgaruvchan", "Doimiy", "Marjinal", "Bilvosita"], 1, "Doimiy xarajatlar (ijara, belgilangan maosh) hajmga bog'liq emas."),
    S("Quyidagilardan qaysi biri o'zgaruvchan xarajat?", ["Ofis ijarasi", "Xomashyo", "Qo'riqchi maoshi", "Internet abonent to'lovi"], 1, "Xomashyo har bir birlik bilan ortadi."),
    N("Doimiy xarajatlar 6 000 000 so'm, narx 50 000 so'm, o'zgaruvchan xarajat 30 000 so'm. Zararsizlik nuqtasi necha dona?", 300, "6 000 000 ÷ (50 000 − 30 000) = 300 dona."),
    N("Tannarx 40 000 so'm, ustama 25%. \"Xarajat + ustama\" usulida narx necha so'm?", 50000, "40 000 × 1,25 = 50 000 so'm."),
    S("Bozorni tez egallash uchun past narx bilan boshlash strategiyasi qaysi?", ["Qaymog'ini olish", "Kirish (penetratsiya) narxi", "Psixologik narx", "Premium narx"], 1, "Penetratsiya — past narx bilan bozorga kirish."),
    S("Narxning yuqori chegarasini nima belgilaydi?", ["Xarajatlar", "Mijoz uchun qiymat (to'lashga tayyorlik)", "Soliq", "Ijara"], 1, "Mijoz qiymatidan yuqori narxda sotib olmaydi."),
    TF("Marjinal daromad = narx − o'zgaruvchan xarajat (1 birlikka).", True, "Bu summa doimiy xarajatlarni qoplash va foyda uchun qoladi."),
    M("Psixologik narx usullarini belgilang.", ["99 900 so'm narx", "\"2+1\" aksiyasi", "To'plam narxi", "Tannarxdan past narxda doimiy sotish"], [0, 1, 2], "Psixologik narxlar mijoz idrokiga ta'sir qiladi."),
]
T10_CARDS = [("Doimiy xarajatlar", "Savdo hajmiga bog'liq bo'lmagan xarajatlar (ijara, belgilangan maosh)"),
             ("O'zgaruvchan xarajatlar", "Har bir birlik bilan o'zgaradigan xarajatlar (xomashyo, qadoq)"),
             ("Tannarx", "Bitta mahsulot birligini ishlab chiqarish va sotish xarajati"),
             ("Marjinal daromad", "Narx − o'zgaruvchan xarajat (1 birlikka)"),
             ("Zararsizlik nuqtasi", "Doimiy xarajatlar ÷ (narx − o'zgaruvchan xarajat)"),
             ("Ustama (nadbavka)", "Tannarxga qo'shiladigan foiz"),
             ("Penetratsiya narxi", "Bozorni egallash uchun past boshlang'ich narx"),
             ("Qaymog'ini olish strategiyasi", "Yangi noyob mahsulotga dastlab yuqori narx")]
T10 = lesson("10", "Mahsulot narxini shakllantirish",
    "Xarajatlar turlari, tannarx, narx belgilash usullari, zararsizlik nuqtasi va narx siyosati (M10, A10).",
    ["simulation", "problem", "tps", "blitz"], T10_LECT, T10_QUIZ, T10_CARDS,
    [{"type": "classify", "title": "Doimiy va o'zgaruvchan xarajatlar", "max_points": 10, "instructions": "Kafe xarajatlarini to'g'ri guruhga ajrating.",
      "content": {"categories": [{"name": "Doimiy xarajatlar", "items": ["Bino ijarasi", "Administrator belgilangan oyligi", "Internet abonent to'lovi", "Kredit foizi"]},
                                 {"name": "O'zgaruvchan xarajatlar", "items": ["Go'sht va sabzavotlar", "Bir martalik qadoq", "Kuryerga har buyurtma uchun to'lov", "Ofitsiant savdodan foizi"]}]}},
     {"type": "quiz", "title": "Hisob-kitob mashqi: narx va zararsizlik", "max_points": 10, "attempts": 0,
      "instructions": "Kalkulyatordan foydalaning. Javobni faqat son bilan yozing (bo'sh joysiz).",
      "content": {"time_limit_min": 0, "shuffle": False, "show_answers": True, "questions": [
          N("Tikuv sexi: 1 ta ko'ylak uchun mato 45 000, ip va tugma 5 000, tikuvchiga 30 000 so'm. Bitta ko'ylakning o'zgaruvchan xarajati necha so'm?", 80000, "45 000 + 5 000 + 30 000 = 80 000 so'm."),
          N("Sexning oylik doimiy xarajati 8 000 000 so'm, oyiga 200 ta ko'ylak tikiladi. Bitta ko'ylakka to'g'ri keladigan doimiy xarajat necha so'm?", 40000, "8 000 000 ÷ 200 = 40 000 so'm."),
          N("To'liq tannarx (80 000 + 40 000) ga 30% ustama qo'shilsa, narx necha so'm?", 156000, "120 000 × 1,3 = 156 000 so'm."),
          N("Narx 156 000, o'zgaruvchan xarajat 80 000, doimiy xarajat 8 000 000 so'm. Zararsizlik nuqtasi necha dona (yuqoriga yaxlitlang)?", 106, "8 000 000 ÷ 76 000 ≈ 105,3 → 106 dona."),
          N("200 ta ko'ylak sotilsa, oylik foyda necha so'm? (200 × 156 000 − 200 × 80 000 − 8 000 000)", 7200000, "31 200 000 − 16 000 000 − 8 000 000 = 7 200 000 so'm.")]}}],
    amaliy("A10", "Tannarx, zararsizlik nuqtasi va narx variantlari",
        "O'z mahsulotingiz (xizmatingiz) uchun:\n\n1. **Xarajatlar jadvalini** tuzing: doimiy (oylik) va o'zgaruvchan (1 birlikka) xarajatlar;\n2. Oylik rejalashtirilgan hajmda **birlik tannarxini** hisoblang;\n3. **Zararsizlik nuqtasini** dona va so'mda hisoblang (formula bilan);\n4. **Narxning 3 ta variantini** solishtiring (masalan: kirish narxi, raqobatchilar narxi, premium): har biri uchun marjinal daromad, zararsizlik nuqtasi va rejalashtirilgan foyda;\n5. Yakuniy narxni tanlang va raqobatchilar narxi bilan solishtirib asoslang.",
        "Xarajatlar to'g'ri tasniflangan — 2; tannarx hisobi — 2; zararsizlik nuqtasi to'g'ri — 2; 3 variant taqqoslangan — 2; narx tanlovi asoslangan — 2.",
        ["Zararsizlik nuqtasi = Doimiy xarajatlar ÷ (Narx − O'zgaruvchan xarajat)", "Hisobni elektron jadvalda qiling va formulalarni ko'rsating"]),
    [mustaqil("MT20", "Mahsulot yoki xizmat uchun narx belgilash va raqobatbardosh narx siyosatini ishlab chiqish",
        "3 ta narx belgilash usulini o'z mahsulotingizga qo'llab ko'ring va natijalarni solishtiring. Chegirma va aksiyalar siyosatini ishlab chiqing (qachon, kimga, qancha)."),
     mustaqil("MT26", "Mahsulot tannarxi, zararsizlik nuqtasi va xarajatlarni kamaytirish imkoniyatlarini hisoblash",
        "Tannarxni 10% kamaytirishning 5 ta real yo'lini toping va har biri zararsizlik nuqtasini qanchaga o'zgartirishini hisoblang.")])

MODULE4 = {"title": "4-bo'lim. Marketing, savdo va narx",
           "description": "Reklama va kontent-reja, logistika, savdo jarayoni va e'tirozlar, narx va zararsizlik nuqtasi (M8–M10, A8–A10).",
           "lessons": [T8, T9, T10]}
