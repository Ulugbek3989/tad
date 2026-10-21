from common import *

T11_LECT = """# Biznesda pul oqimini rejalashtirish: kirim, chiqim va mablag' jalb qilish

## Pul oqimi nima?
**Pul oqimi (cash flow)** — ma'lum davrda biznesga kirgan va undan chiqqan **real pul** harakati.
> Muhim: **foyda ≠ pul**. Biznes qog'ozda foydali bo'lsa ham, pul yetishmasligi (kassa uzilishi) sababli yopilishi mumkin. Masalan, mijoz to'lovni 30 kun kechiktirsa, siz esa xomashyoni oldindan to'lashingiz kerak.

## Pul oqimining turlari
- **Operatsion** — asosiy faoliyatdan: savdo tushumi, xomashyo, maosh, soliq, ijara;
- **Investitsion** — uskunalar, binolar sotib olish yoki sotish;
- **Moliyaviy** — kredit olish va qaytarish, ta'sischilar mablag'i, dividendlar.

## Pul oqimi jadvali (byudjeti)
| Ko'rsatkich | 1-oy | 2-oy | 3-oy |
|---|---|---|---|
| Oy boshidagi qoldiq | | | |
| **+ Kirimlar** (savdo, kredit, o'z mablag'i) | | | |
| **− Chiqimlar** (xomashyo, maosh, ijara, reklama, soliq, kredit to'lovi, uskuna) | | | |
| **= Sof pul oqimi** (kirim − chiqim) | | | |
| **Oy oxiridagi qoldiq** | | | |
Oy oxiridagi qoldiq = oy boshidagi qoldiq + kirimlar − chiqimlar; u keyingi oyning boshlang'ich qoldig'i bo'ladi.

## Kassa uzilishi va uning oldini olish
Qoldiq **manfiy** bo'lgan oy — **kassa uzilishi** xavfi. Choralar:
- mijozlardan **oldindan to'lov** yoki qisman avans olish;
- yetkazib beruvchilar bilan **to'lov muddatini** uzaytirish;
- ortiqcha **zaxirani** kamaytirish;
- **zaxira fondi** — kamida 2–3 oylik doimiy xarajat;
- o'z vaqtida **qisqa muddatli moliyalashtirish** (overdraft, kredit liniyasi).

## Mablag' jalb qilish
Pul oqimi jadvali **qachon va qancha** mablag' kerakligini ko'rsatadi. Manbalar: o'z jamg'armasi, oila, bank krediti, mikrokredit, grant, investor, lizing (3-mavzuga qarang).

## Iqtisodiy omillar ta'siri
- **Inflyatsiya** — xarajatlar oshadi, pulning xarid qobiliyati pasayadi: narxlarni va zaxiralarni rejalashtirishda hisobga oling;
- **Kredit foizlari** — qarz xarajatini oshiradi; Markaziy bank asosiy stavkasi o'zgarishi kredit narxiga ta'sir qiladi;
- **Valyuta kursi** — import xomashyo narxiga ta'sir qiladi;
- **Mavsumiylik** — savdo oylar bo'yicha notekis.
> Rejani 3 ssenariyda tuzing: **optimistik, real, pessimistik**."""

T11_QUIZ = [
    TF("Foydali biznesda pul yetishmasligi (kassa uzilishi) bo'lishi mumkin emas.", False, "Foyda va pul bir xil emas: to'lovlar kechiksa, foydali biznesda ham pul yetishmaydi."),
    S("Kredit olish va qaytarish qaysi pul oqimiga kiradi?", ["Operatsion", "Investitsion", "Moliyaviy", "Hech qaysi"], 2, "Kredit va ta'sischilar mablag'i — moliyaviy faoliyat."),
    S("Uskuna sotib olish qaysi pul oqimiga kiradi?", ["Operatsion", "Investitsion", "Moliyaviy", "Soliq"], 1, "Uzoq muddatli aktivlar — investitsion faoliyat."),
    N("Oy boshidagi qoldiq 2 000 000, kirimlar 15 000 000, chiqimlar 16 500 000 so'm. Oy oxiridagi qoldiq necha so'm?", 500000, "2 000 000 + 15 000 000 − 16 500 000 = 500 000 so'm."),
    M("Kassa uzilishining oldini olish choralarini belgilang.", ["Mijozlardan avans olish", "Yetkazib beruvchilarga to'lov muddatini uzaytirish", "Zaxira fondi yaratish", "Barcha pulni bitta uskunaga sarflash"], [0, 1, 2], "Pulni boshqarishda muvozanat va zaxira muhim."),
    S("Inflyatsiya biznesga qanday ta'sir qiladi?", ["Xarajatlar kamayadi", "Xarajatlar oshadi va pulning xarid qobiliyati pasayadi", "Ta'sir qilmaydi", "Faqat eksportga ta'sir qiladi"], 1, "Inflyatsiya narxlarning umumiy o'sishi."),
    S("Zaxira fondi odatda necha oylik doimiy xarajat hajmida tavsiya etiladi?", ["1 hafta", "2–3 oy", "5 yil", "Kerak emas"], 1, "Kamida 2–3 oylik doimiy xarajat."),
    S("Pul oqimi rejasini qaysi ssenariylarda tuzish tavsiya etiladi?", ["Faqat optimistik", "Optimistik, real va pessimistik", "Faqat pessimistik", "Ssenariy kerak emas"], 1, "Uch ssenariy xavfga tayyor bo'lishga yordam beradi."),
]
T11_CARDS = [("Pul oqimi", "Davr mobaynida biznesga kirgan va chiqqan real pul harakati"),
             ("Sof pul oqimi", "Kirimlar − chiqimlar"),
             ("Kassa uzilishi", "Majburiyatlarni to'lash uchun pul yetishmay qolishi"),
             ("Operatsion pul oqimi", "Asosiy faoliyatdan pul harakati (savdo, xomashyo, maosh)"),
             ("Investitsion pul oqimi", "Uzoq muddatli aktivlarni sotib olish/sotish"),
             ("Moliyaviy pul oqimi", "Kredit, ta'sischilar mablag'i, dividendlar"),
             ("Inflyatsiya", "Narxlarning umumiy darajasining o'sishi"),
             ("Zaxira fondi", "Kutilmagan holatlar uchun 2–3 oylik doimiy xarajat miqdoridagi pul")]
T11 = lesson("11", "Biznesda pul oqimini rejalashtirish: kirim, chiqim va mablag' jalb qilish",
    "Pul oqimi turlari, pul oqimi jadvali, kassa uzilishi, mablag' jalb qilish va iqtisodiy omillar (M11, A11).",
    ["simulation", "fishbone", "workshop", "problem"], T11_LECT, T11_QUIZ, T11_CARDS,
    [{"type": "classify", "title": "Pul oqimi turlari", "max_points": 10,
      "content": {"categories": [{"name": "Operatsion", "items": ["Mijozdan savdo tushumi", "Xodimlarga maosh", "Xomashyo uchun to'lov"]},
                                 {"name": "Investitsion", "items": ["Tikuv mashinasini sotib olish", "Eski uskunani sotish"]},
                                 {"name": "Moliyaviy", "items": ["Bankdan kredit olish", "Kredit asosiy qarzini qaytarish", "Ta'sischining qo'shimcha hissasi"]}]}},
     {"type": "case", "title": "Simulyatsiya: \"Jamg'arma o'yini\" — kassa uzilishi", "max_points": 10,
      "rubric": "Muammo sababini to'g'ri aniqlash — 3; jadval bo'yicha hisob — 3; 3 ta real chora — 4.",
      "content": {"scenario": "\"Shirin dunyo\" qandolat sexi to'yxonalarga tort yetkazadi. Sentabrda 40 mln so'mlik buyurtma oldi, lekin to'yxonalar **30 kundan keyin** to'laydi. Xomashyoni (22 mln so'm) esa **oldindan** to'lash kerak. Sex hisobida 8 mln so'm bor, oylik doimiy xarajatlar (ijara, maosh) — 12 mln so'm.",
                  "questions": ["Sentabr oyi uchun pul oqimini hisoblang: oy oxirida qoldiq qancha bo'ladi?", "Biznes foydalimi? Nega baribir muammo bor?", "Kassa uzilishining oldini olish uchun 3 ta aniq chora taklif qiling."],
                  "reference_answer": "Sentabr: 8 + 0 (tushum oktabrda) − 22 − 12 = −26 mln so'm — kassa uzilishi. Biznes foydali (40 − 22 − 12 = 6 mln foyda), lekin pul kechikib keladi. Choralar: to'yxonalardan 30–50% avans olish; yetkazib beruvchidan xomashyoni muddatli to'lovga olish; qisqa muddatli kredit/overdraft; buyurtmalarni bosqichma-bosqich qabul qilish."}}],
    amaliy("A11", "3 oylik pul oqimi jadvali",
        "1. O'z biznesingiz uchun **3 oylik pul oqimi jadvalini** tuzing (oy boshidagi qoldiq, kirimlar moddalari, chiqimlar moddalari, sof pul oqimi, oy oxiridagi qoldiq).\n2. **Qaysi oyda mablag' yetishmasligi** mumkinligini aniqlang.\n3. Yetishmovchilikni qoplash uchun **moliyalashtirish manbalarini** tanlang (summa, muddat, sabab).\n4. Pessimistik ssenariyni (savdo 30% kam) hisoblab ko'ring — biznes chidaydimi?",
        "Jadval tuzilmasi to'g'ri va to'liq — 4; hisob-kitob to'g'ri — 2; yetishmovchilik oyi aniqlangan — 1; moliyalashtirish manbalari asoslangan — 2; pessimistik ssenariy — 1.",
        ["Birinchi oyga boshlang'ich xarajatlarni (uskuna, ro'yxatdan o'tish, birinchi zaxira) kiriting", "Kredit to'lovlari ham chiqimga kiradi"]),
    [mustaqil("MT28", "Inflyatsiya, kredit foizlari va boshqa iqtisodiy omillarning biznes faoliyatiga ta'sirini tahlil qilish",
        "cbu.uz va stat.uz ma'lumotlari asosida so'nggi yildagi inflyatsiya va asosiy stavka darajasini aniqlang hamda ular o'z biznesingiz xarajatlari va narxlariga qanday ta'sir qilishini hisob bilan ko'rsating.")])

T12_LECT = """# Biznesda foyda va zarar tahlili

## Foyda va zarar hisoboti (moliyaviy natijalar hisoboti)
Ma'lum davr (oy, chorak, yil) uchun biznesning **daromadlari, xarajatlari va moliyaviy natijasini** ko'rsatadi.
| Ko'rsatkich | Hisoblash |
|---|---|
| **Sotishdan tushgan sof tushum** | Savdo hajmi (QQSsiz, qaytarishlarsiz) |
| − Sotilgan mahsulot tannarxi | Xomashyo, ishlab chiqarish xarajatlari |
| **= Yalpi foyda** | Tushum − tannarx |
| − Davr xarajatlari | Ijara, boshqaruv maoshi, reklama, kommunal |
| **= Asosiy faoliyat foydasi** | Yalpi foyda − davr xarajatlari |
| ± Moliyaviy daromad/xarajat | Kredit foizlari va h.k. |
| **= Soliq to'lagungacha foyda** | |
| − Foyda solig'i (yoki aylanma solig'i) | |
| **= Sof foyda** | Biznes egasida qoladigan foyda |

## Asosiy rentabellik ko'rsatkichlari
- **Yalpi rentabellik** = Yalpi foyda ÷ Tushum × 100%;
- **Sof rentabellik (sotish rentabelligi)** = Sof foyda ÷ Tushum × 100%;
- **Investitsiyaning qaytimi (ROI)** = Sof foyda ÷ Investitsiya × 100%;
- **Qoplanish muddati** = Investitsiya ÷ oylik sof foyda (oylarda).

## Foyda va pul oqimi o'rtasidagi farq
- foyda **hisoblangan** (sotilgan, lekin to'lanmagan bo'lishi mumkin) daromad asosida;
- pul oqimi — **real** to'langan pul;
- uskuna sotib olish pulni kamaytiradi, lekin oylik foydaga faqat **amortizatsiya** orqali ta'sir qiladi.

## Foyda va zarar tahlili qanday o'tkaziladi?
1. **Dinamika** — oylar bo'yicha o'zgarish (o'sish/pasayish);
2. **Tuzilma** — qaysi xarajat moddasi eng katta ulushga ega;
3. **Reja va fakt** — rejalashtirilgan va haqiqiy ko'rsatkichlarni solishtirish;
4. **Sabablarni aniqlash** — zarar sababi past narxmi, yuqori xarajatmi yoki kam savdo?

## Foydani oshirish yo'llari
- **savdo hajmini** oshirish (yangi mijozlar, takroriy xarid);
- **o'rtacha chekni** oshirish (qo'shimcha mahsulot, paketlar);
- **narxni optimallashtirish**;
- **o'zgaruvchan xarajatlarni** kamaytirish (ulgurji xarid, chiqitlarni kamaytirish);
- **doimiy xarajatlarni** nazorat qilish;
- zarar keltiruvchi mahsulotlardan voz kechish."""

T12_QUIZ = [
    S("Yalpi foyda qanday hisoblanadi?", ["Tushum − sotilgan mahsulot tannarxi", "Tushum − barcha soliqlar", "Sof foyda + soliq", "Tushum × 12"], 0, "Yalpi foyda = tushum − tannarx."),
    N("Tushum 50 mln, tannarx 30 mln, davr xarajatlari 12 mln so'm. Asosiy faoliyat foydasi necha mln so'm?", 8, "50 − 30 − 12 = 8 mln so'm."),
    N("Sof foyda 6 mln, tushum 50 mln so'm. Sof rentabellik necha foiz?", 12, "6 ÷ 50 × 100% = 12%."),
    N("Investitsiya 24 mln so'm, oylik sof foyda 2 mln so'm. Qoplanish muddati necha oy?", 12, "24 ÷ 2 = 12 oy."),
    TF("Sof foyda — soliqlar to'langandan keyin biznes egasida qoladigan foyda.", True, "Sof foyda — yakuniy moliyaviy natija."),
    M("Foydani oshirish yo'llarini belgilang.", ["O'rtacha chekni oshirish", "O'zgaruvchan xarajatlarni kamaytirish", "Takroriy xaridlarni ko'paytirish", "Hisob yuritishni to'xtatish"], [0, 1, 2], "Daromadni oshirish va xarajatni boshqarish orqali."),
    S("Reja va haqiqiy ko'rsatkichlarni solishtirish qanday tahlil?", ["Dinamika tahlili", "Reja-fakt tahlili", "SWOT", "Segmentatsiya"], 1, "Reja-fakt tahlili og'ishlarni aniqlaydi."),
    S("ROI nimani ko'rsatadi?", ["Bozor hajmini", "Investitsiyaning qaytimini (samaradorligini)", "Xodimlar sonini", "Soliq stavkasini"], 1, "ROI = sof foyda ÷ investitsiya × 100%."),
]
T12_CARDS = [("Sof tushum", "Sotishdan tushgan daromad (QQS va qaytarishlarsiz)"),
             ("Yalpi foyda", "Tushum − sotilgan mahsulot tannarxi"),
             ("Davr xarajatlari", "Ijara, boshqaruv, reklama kabi ishlab chiqarishga bevosita bog'liq bo'lmagan xarajatlar"),
             ("Sof foyda", "Barcha xarajat va soliqlardan keyin qoladigan foyda"),
             ("Rentabellik", "Foydaning tushum yoki investitsiyaga nisbati (%)"),
             ("ROI", "Sof foyda ÷ investitsiya × 100%"),
             ("Qoplanish muddati", "Investitsiya ÷ oylik sof foyda"),
             ("Amortizatsiya", "Uzoq muddatli aktiv qiymatining xarajatga bosqichma-bosqich o'tkazilishi")]
T12 = lesson("12", "Biznesda foyda va zarar tahlili",
    "Foyda va zarar hisoboti, rentabellik ko'rsatkichlari, ROI, qoplanish muddati va foydani oshirish (M12, A12).",
    ["case_study", "fishbone", "workshop", "tps"], T12_LECT, T12_QUIZ, T12_CARDS,
    [{"type": "ordering", "title": "Foyda va zarar hisoboti tuzilmasi", "max_points": 10, "instructions": "Hisobot qatorlarini yuqoridan pastga to'g'ri tartibda joylashtiring.",
      "content": {"prompt": "Moliyaviy natijalar hisoboti", "items": ["Sotishdan tushgan sof tushum", "Sotilgan mahsulot tannarxi", "Yalpi foyda", "Davr xarajatlari", "Asosiy faoliyat foydasi", "Soliq to'lagungacha foyda", "Foyda solig'i", "Sof foyda"]}},
     board("Baliq skeleti: nega foyda kamaydi?", "fishbone", "Kichik kafe foydasi 3 oyda 40% ga kamaydi. Sabablarini toping va yechim taklif qiling.",
           ["Muammo", "Sabablar (daromad tomoni)", "Sabablar (xarajat tomoni)", "Yechimlar"], "Guruh bilan sabablarni ikki guruhga ajrating va har biriga yechim yozing.")],
    amaliy("A12", "Foyda va zarar hisobotini tuzish",
        "Quyidagi ma'lumotlar asosida kichik biznes (\"Toza kiyim\" kimyoviy tozalash xizmati) uchun **oylik foyda va zarar hisobotini** tuzing:\n\n- Xizmatlar: 600 ta buyurtma × 45 000 so'm;\n- Kimyoviy vositalar va qadoq: har buyurtmaga 12 000 so'm;\n- Ustalar ishbay haqi: har buyurtmaga 8 000 so'm;\n- Ijara: 4 000 000; administrator maoshi: 3 500 000; kommunal: 1 200 000; reklama: 1 500 000 so'm;\n- Kredit foizi: 600 000 so'm;\n- Aylanmadan olinadigan soliq: tushumning 4%.\n\nVazifalar:\n1. Hisobotni jadval ko'rinishida tuzing (tushum → yalpi foyda → asosiy faoliyat foydasi → soliqgacha foyda → sof foyda);\n2. **Yalpi va sof rentabellikni** hisoblang;\n3. Eng katta 3 ta xarajat moddasini aniqlang va **foydani oshirishning 3 ta yo'lini** taklif qiling;\n4. Xuddi shunday hisobotni **o'z biznesingiz** uchun taxminiy raqamlar bilan tuzing.",
        "Hisobot tuzilmasi — 3; hisob-kitoblar to'g'ri — 3; rentabellik — 1; tahlil va 3 taklif — 2; o'z biznesi uchun hisobot — 1.",
        ["Yalpi foyda uchun faqat o'zgaruvchan (bevosita) xarajatlarni ayiring", "Aylanma solig'i tushumdan hisoblanadi"],
        "Tushum 27 000 000; bevosita xarajatlar 600×20 000 = 12 000 000; yalpi foyda 15 000 000 (yalpi rentabellik 55,6%). Davr xarajatlari 10 200 000 → asosiy faoliyat foydasi 4 800 000. Kredit foizi 600 000 → soliqgacha 4 200 000. Aylanma solig'i 27 000 000 × 4% = 1 080 000 → sof foyda 3 120 000 so'm (sof rentabellik ≈ 11,6%)."),
    [mustaqil("MT27", "Biznesning pul oqimi, foyda va zarar ko'rsatkichlarini hisoblash hamda moliyaviy natijalarni baholash",
        "O'z biznesingiz uchun 3 oylik pul oqimi va foyda-zarar hisobotini bitta elektron jadvalda bog'lang. Foyda va pul qoldig'i qaysi oyda va nima uchun farq qilishini tushuntiring.")])

T13_LECT = """# Biznes-reja tuzish va mahsulotni tashqi bozorga olib chiqish

## Biznes-reja nima va kimga kerak?
**Biznes-reja** — biznes g'oyani amalga oshirish maqsadlari, yo'llari, resurslari va kutilayotgan natijalarini asoslaydigan hujjat.
Kimga kerak:
- **tadbirkorning o'ziga** — yo'l xaritasi va xavflarni oldindan ko'rish;
- **bankka** — qaytarish qobiliyatini baholash;
- **investorga** — o'sish salohiyati va daromadlilik;
- **grant beruvchiga** — ijtimoiy-iqtisodiy samara.

## Biznes-reja tuzilmasi
1. **Rezyume** — butun rejaning 1 sahifalik qisqacha mazmuni (oxirida yoziladi!);
2. **Biznes g'oya va mahsulot** — muammo, yechim, qiymat taklifi, MVP natijalari;
3. **Bozor tahlili** — segment, mijoz portreti, bozor hajmi, raqobatchilar, SWOT;
4. **Marketing rejasi** — 4P, kanallar, kontent-reja, savdo voronkasi;
5. **Ishlab chiqarish / operatsion reja** — jarayon, uskuna, joy, yetkazib beruvchilar, logistika;
6. **Tashkiliy reja** — huquqiy shakl, jamoa, rollar, soliq rejimi;
7. **Moliyaviy reja** — boshlang'ich investitsiya, xarajatlar, narx, zararsizlik nuqtasi, pul oqimi, foyda-zarar, qoplanish muddati;
8. **Xavflar tahlili** — xavflar matritsasi va choralar;
9. **Moliyalashtirish** — qancha, qayerdan, qanday qaytariladi;
10. **Ilovalar** — so'rovnoma natijalari, shartnomalar, hisob-kitoblar.

## Yaxshi biznes-reja belgilari
- **aniq raqamlar** va ularning manbalari;
- **real** (haddan tashqari optimistik emas) prognozlar;
- bo'limlar o'zaro **mantiqan bog'langan** (marketingdagi savdo hajmi = moliyaviy rejadagi tushum);
- qisqa, tushunarli, vizual (jadval, grafik).

## Bank, investor va grant talablariga moslashtirish
| Kim | Asosiy qiziqishi |
|---|---|
| **Bank** | Pul oqimi, garov, qaytarish jadvali, kredit tarixi |
| **Investor** | Bozor hajmi, o'sish tezligi, jamoa, ulush va chiqish strategiyasi |
| **Grant** | Ijtimoiy samara, ish o'rinlari, maqsadli ishlatish, hisobot |

## Tashqi bozorga chiqish
Eksport — biznes o'sishining kuchli yo'li. Bosqichlar:
1. **Eksport salohiyatini** baholash — mahsulot sifati, sertifikatlar, ishlab chiqarish quvvati;
2. **Maqsadli davlatni** tanlash — talab, raqobat, bojxona, logistika, til va madaniyat;
3. **Sertifikatlash** va standartlarga moslashtirish;
4. **Kanalni** tanlash — distribyutor, xalqaro marketpleyslar, ko'rgazmalar, B2B platformalar;
5. **Shartnoma va to'lov** shartlari, bojxona rasmiylashtiruvi, valyuta xavfi;
6. **Davlat ko'magi** — eksportni qo'llab-quvvatlash agentligi va dasturlari.
> Kichik biznes eksportni **onlayn kanallar** (xalqaro marketpleyslar, ijtimoiy tarmoqlar) orqali kichik partiyalar bilan sinab ko'rishdan boshlashi mumkin."""

T13_QUIZ = [
    S("Biznes-rejaning qaysi bo'limi oxirida yoziladi, lekin hujjat boshida turadi?", ["Moliyaviy reja", "Rezyume", "Ilovalar", "Xavflar tahlili"], 1, "Rezyume butun rejaning qisqacha mazmuni bo'lgani uchun oxirida yoziladi."),
    S("Bank biznes-rejada eng avvalo nimaga e'tibor beradi?", ["Logotip dizayni", "Pul oqimi va qaytarish qobiliyati", "Jamoa a'zolarining hobbisi", "Ofis interyeri"], 1, "Bank uchun asosiy masala — kredit qaytarilishi."),
    S("Investor uchun eng muhim ko'rsatkichlardan biri qaysi?", ["Bozor hajmi va o'sish salohiyati", "Garov qiymati", "Ijara shartnomasi", "Soliq kalendari"], 0, "Investor o'sish va daromad salohiyatiga qiziqadi."),
    M("Biznes-rejaning moliyaviy bo'limiga nimalar kiradi?", ["Pul oqimi prognozi", "Zararsizlik nuqtasi", "Foyda va zarar prognozi", "Mijoz portreti"], [0, 1, 2], "Mijoz portreti — bozor tahlili bo'limida."),
    TF("Marketing rejasidagi savdo hajmi moliyaviy rejadagi tushum bilan mos kelishi kerak.", True, "Bo'limlar o'zaro mantiqan bog'langan bo'lishi kerak."),
    S("Grant beruvchi uchun eng muhim mezon odatda qaysi?", ["Ijtimoiy samara va mablag'ning maqsadli ishlatilishi", "Garov", "Dividendlar", "Aksiyalar soni"], 0, "Grant — ijtimoiy-iqtisodiy samaraga yo'naltiriladi."),
    S("Eksportga tayyorgarlikda mahsulotni xorijiy standartlarga moslashtirish qanday ataladi?", ["Sertifikatlash", "Segmentatsiya", "Amortizatsiya", "Franshiza"], 0, "Sertifikat — mahsulotning standartlarga mosligini tasdiqlaydi."),
    S("Kichik biznes eksportni qanday sinab ko'rishi mumkin?", ["Darhol yirik zavod qurib", "Onlayn kanallar orqali kichik partiyalar bilan", "Faqat davlat buyurtmasi bilan", "Sinab bo'lmaydi"], 1, "Kichik qadamlar bilan sinash — Lean yondashuvi."),
]
T13_CARDS = [("Biznes-reja", "G'oyani amalga oshirish maqsadlari, resurslari va natijalarini asoslovchi hujjat"),
             ("Rezyume (executive summary)", "Biznes-rejaning 1 sahifalik qisqacha mazmuni"),
             ("Moliyaviy reja", "Investitsiya, xarajat, narx, pul oqimi, foyda-zarar va qoplanish muddati"),
             ("Eksport salohiyati", "Mahsulotning xorijiy bozorda raqobatlasha olish qobiliyati"),
             ("Sertifikatlash", "Mahsulotning standart talablariga mosligini tasdiqlash"),
             ("Distribyutor", "Mahsulotni boshqa bozorda tarqatuvchi vositachi kompaniya")]
T13 = lesson("13", "Biznes-reja tuzish va mahsulotni tashqi bozorga olib chiqish",
    "Biznes-reja tuzilmasi, bank/investor/grant talablari va eksport bosqichlari (M13, A13).",
    ["pbl", "workshop", "peer_review", "flipped"], T13_LECT, T13_QUIZ, T13_CARDS,
    [{"type": "matching", "title": "Biznes-reja bo'limlari va mazmuni", "max_points": 10,
      "content": {"pairs": [{"left": "Rezyume", "right": "Butun rejaning 1 sahifalik qisqacha mazmuni"},
                            {"left": "Bozor tahlili", "right": "Segment, bozor hajmi, raqobatchilar"},
                            {"left": "Marketing rejasi", "right": "Kanallar, narx, kontent, savdo voronkasi"},
                            {"left": "Tashkiliy reja", "right": "Huquqiy shakl, jamoa va rollar"},
                            {"left": "Moliyaviy reja", "right": "Pul oqimi, foyda-zarar, zararsizlik nuqtasi"},
                            {"left": "Xavflar tahlili", "right": "Xavflar matritsasi va choralar"}]}}],
    {"type": "lab", "title": "A13. Amaliy mashg'ulot: yagona biznes-reja (loyiha ustaxonasi)", "max_points": 20,
     "instructions": "Semestr davomida bajargan barcha ishlaringizni (A1–A12) yagona biznes-rejaga jamlang. Har bir bo'limni to'ldirib, \"bajarildi\" deb belgilang.",
     "rubric": "Barcha bo'limlar mavjud — 4; g'oya, mijoz va bozor asoslangan — 4; marketing va savdo rejasi — 3; moliyaviy hisob-kitoblar to'g'ri va bog'langan — 5; xavflar va moliyalashtirish — 2; rezyume aniq va ishonarli — 2.",
     "content": {"objective": "Semestr davomida tayyorlangan vertikal loyiha qismlarini to'liq, mantiqan bog'langan biznes-rejaga aylantirish.",
                 "equipment": ["A1–A12 natijalari", "Elektron jadval (moliyaviy model)", "Matn muharriri yoki Google Docs", "Canva (taqdimot uchun)"],
                 "theory": "Biznes-reja bo'limlari: rezyume, g'oya va mahsulot, bozor tahlili, marketing, operatsion reja, tashkiliy reja, moliyaviy reja, xavflar, moliyalashtirish, ilovalar.",
                 "steps": [{"title": "G'oya va mahsulot", "body": "A1, A2 natijalari: muammo, yechim, qiymat taklifi, MVP sinovi natijalari."},
                           {"title": "Mijoz va bozor", "body": "A6, A7: biznes-model, segmentlar, mijoz portreti, bozor hajmi, raqobatchilar."},
                           {"title": "Marketing va savdo", "body": "A8, A9: kanallar, kontent-reja, savdo voronkasi, e'tirozlar bilan ishlash."},
                           {"title": "Huquqiy shakl va soliq", "body": "A4, A5: tashkiliy-huquqiy shakl, soliq rejimi, hujjatlar."},
                           {"title": "Moliyaviy reja", "body": "A3, A10, A11, A12: xarajatlar, narx, zararsizlik nuqtasi, pul oqimi, foyda-zarar, moliyalashtirish."},
                           {"title": "Xavflar", "body": "A14 tayyorgarligi: asosiy 5 ta xavf va choralar."},
                           {"title": "Rezyume", "body": "Oxirida 1 sahifalik rezyume yozing: muammo, yechim, bozor, raqamlar, kerakli mablag'."}],
                 "questions": ["Biznesingizning zararsizlik nuqtasi va qoplanish muddati qancha?", "Bank (yoki investor) sizning rejangizdan nima uchun moliyalashtirishi kerak?", "Tashqi bozorga chiqish imkoniyati bormi? Qaysi bozor va qanday kanal?"],
                 "reference_answer": ""}},
    [mustaqil("MT29", "Biznes-reja tuzish, uni bank, investor va grant talablariga moslashtirish hamda tashqi bozorga chiqish imkoniyatlarini baholash",
        "Biznes-rejangiz rezyumesining 3 xil versiyasini yozing: bank uchun, investor uchun va grant komissiyasi uchun. Tashqi bozorga chiqish uchun bitta maqsadli davlatni tanlang va 5 mezon bo'yicha baholang.", words=250)])

T14_LECT = """# Jamoani shakllantirish, xodimlarni boshqarish va xavflarni aniqlash

## Jamoa — biznesning asosiy resursi
Investorlar ko'pincha **"g'oyaga emas, jamoaga"** sarmoya kiritadi. Kichik biznesda har bir odamning hissasi katta.
Jamoa turlari: **sheriklar (ta'sischilar)**, **xodimlar**, **pudratchilar va frilanserlar**, **maslahatchilar va mentorlar**.

## Vazifalarni taqsimlash
- biznes jarayonlarini sanab chiqing (ishlab chiqarish, savdo, marketing, hisob, yetkazish);
- har bir jarayon uchun **javobgar** shaxsni belgilang;
- nima doimiy xodim, nima **autsorsing** (buxgalteriya, dizayn, yetkazish) bo'lishini hal qiling;
- har bir lavozim uchun **ish o'rni tavsifi** (vazifalar, talablar, natija ko'rsatkichlari).
> Sheriklar bilan ulushlar, vazifalar va chiqish shartlarini **yozma kelishuvda** oldindan belgilang.

## Xodimlarni tanlash
1. Lavozim profili va talablar;
2. E'lon (hh.uz, Telegram kanallar, tanishlar);
3. Rezyumelarni saralash;
4. **Ish suhbati** — vaziyatli savollar: "Mijoz shikoyat qilsa nima qilasiz?";
5. Sinov muddati va amaliy topshiriq;
6. **Mehnat shartnomasi** bilan rasmiylashtirish (Mehnat kodeksi).

## Xodimlarni rag'batlantirish va boshqarish
- **moddiy**: ish haqi, bonus, savdodan foiz, KPI asosidagi mukofot;
- **nomoddiy**: e'tirof, o'sish imkoniyati, o'qish, qulay muhit, moslashuvchan grafik;
- aniq **maqsadlar** va muntazam **fikr-mulohaza**;
- yetakchilik uslubi: vaziyatga qarab yo'naltiruvchi, maslahatchi, qo'llab-quvvatlovchi.

## Biznes xavflari (risklar)
| Tur | Misol |
|---|---|
| **Bozor xavfi** | Talab pasayishi, yangi raqobatchi |
| **Moliyaviy xavf** | Kassa uzilishi, kredit foizining oshishi, valyuta kursi |
| **Operatsion xavf** | Uskuna buzilishi, yetkazib beruvchi kechikishi |
| **Huquqiy xavf** | Qonunchilik o'zgarishi, jarimalar, shartnoma nizolari |
| **Kadrlar xavfi** | Asosiy xodimning ketishi |
| **Tashqi xavflar** | Tabiiy ofat, pandemiya, elektr uzilishi |

## Xavflar matritsasi
Har bir xavf **ehtimollik** (1–5) va **ta'sir kuchi** (1–5) bo'yicha baholanadi:
**Xavf darajasi = Ehtimollik × Ta'sir.**
- 15–25 — **yuqori** (darhol chora);
- 8–14 — **o'rta** (reja tuzish);
- 1–7 — **past** (kuzatish).

## Xavflarni boshqarish strategiyalari
- **Oldini olish** — xavf manbaidan voz kechish;
- **Kamaytirish** — zaxira yetkazib beruvchi, sifat nazorati, o'qitish;
- **O'tkazish** — sug'urta, shartnomada javobgarlikni belgilash, autsorsing;
- **Qabul qilish** — kichik xavflar uchun zaxira fondi."""

T14_QUIZ = [
    N("Xavf ehtimolligi 4, ta'sir kuchi 5 baho bilan baholandi. Xavf darajasi necha ball?", 20, "4 × 5 = 20 — yuqori xavf."),
    S("Sug'urta qaysi xavfni boshqarish strategiyasiga kiradi?", ["Oldini olish", "Kamaytirish", "O'tkazish", "Qabul qilish"], 2, "Sug'urta xavfni boshqa tomonga o'tkazadi."),
    S("Valyuta kursining o'zgarishi qanday xavf?", ["Moliyaviy", "Kadrlar", "Huquqiy", "Operatsion"], 0, "Valyuta xavfi — moliyaviy xavf."),
    S("Uskunaning buzilishi qanday xavf turiga kiradi?", ["Bozor", "Operatsion", "Huquqiy", "Moliyaviy"], 1, "Ichki jarayon va uskunalar bilan bog'liq — operatsion."),
    M("Nomoddiy rag'batlantirish usullarini belgilang.", ["E'tirof va maqtov", "O'sish va o'qish imkoniyati", "Moslashuvchan ish grafigi", "Savdodan foiz"], [0, 1, 2], "Savdodan foiz — moddiy rag'bat."),
    TF("Sheriklar o'rtasida ulush va vazifalarni og'zaki kelishuv bilan belgilash yetarli.", False, "Kelishuvlar yozma bo'lishi kerak — bu nizolarning oldini oladi."),
    S("Xodim bilan mehnat munosabatlari qaysi hujjat bilan rasmiylashtiriladi?", ["Ta'sis shartnomasi", "Mehnat shartnomasi", "Hisob-faktura", "Ustav"], 1, "Mehnat kodeksiga muvofiq — mehnat shartnomasi."),
    S("Buxgalteriyani tashqi kompaniyaga topshirish qanday ataladi?", ["Autsorsing", "Franshiza", "Lizing", "Faktoring"], 0, "Autsorsing — funksiyani tashqi ijrochiga berish."),
]
T14_CARDS = [("Ish o'rni tavsifi", "Lavozim vazifalari, talablar va natija ko'rsatkichlari"),
             ("Autsorsing", "Biznes funksiyasini tashqi ijrochiga topshirish"),
             ("KPI", "Asosiy samaradorlik ko'rsatkichi"),
             ("Xavflar matritsasi", "Xavflarni ehtimollik va ta'sir bo'yicha baholash jadvali"),
             ("Xavf darajasi", "Ehtimollik × ta'sir kuchi"),
             ("Xavfni o'tkazish", "Sug'urta yoki shartnoma orqali xavfni boshqa tomonga o'tkazish"),
             ("Mehnat shartnomasi", "Ish beruvchi va xodim o'rtasidagi mehnat munosabatlarini rasmiylashtiruvchi hujjat")]
T14 = lesson("14", "Jamoani shakllantirish, xodimlarni boshqarish va xavflarni aniqlash",
    "Jamoa va vazifalar, xodimlarni tanlash va rag'batlantirish, xavf turlari, xavflar matritsasi va boshqaruv strategiyalari (M14, A14).",
    ["role_play", "six_hats", "workshop", "fishbone"], T14_LECT, T14_QUIZ, T14_CARDS,
    [{"type": "classify", "title": "Xavflar turlari", "max_points": 10,
      "content": {"categories": [{"name": "Bozor xavfi", "items": ["Yangi kuchli raqobatchi paydo bo'ldi", "Mavsumiy talab pasaydi"]},
                                 {"name": "Moliyaviy xavf", "items": ["Kredit foizi oshdi", "Mijoz to'lovni 2 oy kechiktirdi"]},
                                 {"name": "Operatsion xavf", "items": ["Asosiy uskuna buzildi", "Yetkazib beruvchi xomashyoni kechiktirdi"]},
                                 {"name": "Huquqiy xavf", "items": ["Litsenziya talablari o'zgardi", "Shartnoma bo'yicha nizo"]}]}},
     {"type": "case", "title": "Keys: \"Asosiy usta ketib qoldi\"", "max_points": 10,
      "rubric": "Muammo va sabablarni aniqlash — 3; qisqa muddatli choralar — 3; uzoq muddatli tizimli yechim (rag'bat, jarayon, xavf rejasi) — 4.",
      "content": {"scenario": "Kichik mebel ustaxonasida 5 kishi ishlaydi. Eng tajribali usta Botir aka barcha murakkab buyurtmalarni bajaradi va mijozlar aynan unga ishonadi. U raqobatchi korxonaga 30% ko'p maoshga o'tib ketishini aytdi. Ustaxonada 12 ta faol buyurtma bor.",
                  "questions": ["Bu qanday turdagi xavf va uning darajasini (ehtimollik × ta'sir) baholang.", "Bugundan boshlab 2 hafta ichida qanday choralar ko'rasiz?", "Kelajakda bunday holatning oldini olish uchun qanday tizim yaratasiz?"],
                  "reference_answer": "Kadrlar (operatsion) xavfi; ehtimollik 4, ta'sir 5 → 20 (yuqori). Qisqa muddat: Botir aka bilan suhbat (sabablar, qarshi taklif yoki bosqichma-bosqich ketish), buyurtmalarni qayta taqsimlash, mijozlarni xabardor qilish, vaqtinchalik pudratchi. Uzoq muddat: bilim almashuvi va shogird tayyorlash, jarayonlarni hujjatlashtirish, KPI va bonus tizimi, nomoddiy rag'bat, raqobatbardosh ish haqi, xavflar matritsasini yangilash."}}],
    amaliy("A14", "Jamoa va xavflar matritsasi",
        "1. Biznesingiz uchun **xodim, sherik va pudratchi vazifalarini** ajrating (jadval: rol, vazifalar, kim bajaradi, doimiy/autsorsing).\n2. Bitta asosiy lavozim uchun **ish o'rni tavsifini** yozing.\n3. **Ish suhbati simulyatsiyasi** uchun 5 ta savol (shu jumladan 2 ta vaziyatli) tayyorlang.\n4. **Xavflar matritsasini** tuzing: kamida 6 ta xavf (turli turlardan), har biri uchun ehtimollik (1–5), ta'sir (1–5), daraja va boshqarish chorasi.\n5. Eng yuqori 2 ta xavf uchun batafsil **harakat rejasini** yozing.",
        "Vazifalar taqsimoti — 2; ish o'rni tavsifi — 2; suhbat savollari — 1; xavflar matritsasi (6+ xavf, to'g'ri hisob, choralar) — 4; harakat rejasi — 1.",
        ["Xavf darajasi = ehtimollik × ta'sir; 15+ — yuqori", "Har bir xavf uchun strategiyani ko'rsating: oldini olish, kamaytirish, o'tkazish yoki qabul qilish"]),
    [mustaqil("MT30", "Biznesni boshqarish, xodimlarni tanlash va rag'batlantirish, biznes xavflarini baholash hamda loyihani investorlar oldida taqdim etish",
        "O'z biznesingiz uchun xodimlarni rag'batlantirish tizimini (moddiy va nomoddiy) ishlab chiqing va investor so'rashi mumkin bo'lgan 5 ta xavf haqidagi savolga javob tayyorlang.", words=200)])

T15_LECT = """# Biznes g'oyani taqdim etish va tadbirkorlik yo'lini boshlash

## Pitch — biznes g'oyani taqdim etish
**Pitch** — investor, bank yoki ekspertlarga biznes g'oyani qisqa (odatda 3–7 daqiqa) va ishonarli taqdim etish.
Maqsad: tinglovchini **qiziqtirish** va **keyingi qadamga** (uchrashuv, investitsiya, kredit) olib chiqish.

## Pitch tuzilmasi (10–12 slayd)
1. **Muammo** — kim va qanchalik qiynaladi (raqamlar bilan);
2. **Yechim** — mahsulotingiz va uning qiymati;
3. **Bozor** — segment va bozor hajmi (TAM/SAM/SOM);
4. **Mahsulot / MVP natijalari** — dalil: buyurtmalar, so'rov natijalari;
5. **Biznes-model** — qanday pul topasiz;
6. **Raqobat** — farqingiz va ustunligingiz;
7. **Marketing va savdo** — mijozlarni qanday jalb qilasiz;
8. **Moliyaviy ko'rsatkichlar** — tushum, foyda, zararsizlik nuqtasi, qoplanish muddati;
9. **Jamoa** — nega aynan siz bajara olasiz;
10. **So'rov** — qancha mablag' kerak, nimaga sarflanadi, investor nima oladi;
11. **Kelajak rejasi** — 1–3 yillik bosqichlar.

## Ishonchli taqdimot qoidalari
- **hikoya** bilan boshlang — real mijoz va uning muammosi;
- har slaydda **bitta asosiy fikr**, kam matn, ko'p vizual;
- **raqamlar** va dalillar — "mijozlar yoqtiradi" emas, "35 ta buyurtma, 80% takroriy xarid";
- vaqtga rioya qiling, oldindan **3 marta mashq** qiling;
- ko'z bilan aloqa, aniq ovoz, ishonchli holat.

## Savollarga javob berish va muzokaralar
- savolni oxirigacha tinglang, **minnatdorchilik** bildiring;
- bilmasangiz — halol ayting va keyinroq javob berishni va'da qiling;
- eng ko'p beriladigan savollarni oldindan tayyorlang: raqobat, xavflar, mablag'ning sarflanishi, nima uchun aynan siz;
- muzokarada **o'z chegaralaringizni** (minimal summa, maksimal ulush) oldindan belgilang;
- **g'alaba-g'alaba** yechimiga intiling.

## Tadbirkorlik etikasi
- **halollik** — raqamlarni bo'rttirmaslik;
- va'dalarni bajarish, shartnomaga rioya;
- mijoz, xodim va hamkorga **hurmat**;
- qonunlarga va soliq intizomiga rioya;
- ijtimoiy mas'uliyat — jamiyat va atrof-muhitga g'amxo'rlik.

## Tadbirkorlik yo'lini boshlash: birinchi 90 kun
1. **1–30 kun:** MVPni yakunlash, birinchi 10 ta to'lovchi mijoz;
2. **31–60 kun:** rasmiy ro'yxatdan o'tish, soliq rejimi, hisob yuritish, savdo tizimi;
3. **61–90 kun:** marketing kanallarini kengaytirish, birinchi xodim/hamkor, moliyalashtirishga ariza.
> **"Mukammal reja"ni kutmang — kichik qadam bilan boshlang, o'lchang va yaxshilang.**"""

T15_QUIZ = [
    S("Pitch odatda qancha vaqt davom etadi?", ["30 soniya", "3–7 daqiqa", "1 soat", "1 kun"], 1, "Qisqa va lo'nda: odatda 3–7 daqiqa."),
    S("Pitch qaysi slayd bilan boshlanishi tavsiya etiladi?", ["Moliyaviy jadval", "Muammo", "Jamoa", "Rahmat"], 1, "Muammo tinglovchini qiziqtiradi va kontekst yaratadi."),
    S("\"So'rov\" (Ask) slaydida nima ko'rsatiladi?", ["Kerakli mablag', uning sarflanishi va investor nima olishi", "Raqobatchilar ro'yxati", "Kompaniya tarixi", "Logotip variantlari"], 0, "Ask — aniq so'rov va investor uchun shartlar."),
    M("Ishonchli taqdimot qoidalarini belgilang.", ["Har slaydda bitta asosiy fikr", "Raqamlar va dalillar", "Oldindan mashq qilish", "Slaydni matn bilan to'ldirish"], [0, 1, 2], "Kam matn, ko'p dalil va mashq."),
    TF("Investor savoliga javobni bilmasangiz, taxminiy raqam o'ylab topish tavsiya etiladi.", False, "Halollik muhim: bilmasangiz, keyinroq aniq javob berishni va'da qiling."),
    S("Muzokaralarda qanday natijaga intilish kerak?", ["G'alaba — mag'lubiyat", "G'alaba — g'alaba", "Har qanday narxda kelishish", "Muzokarani to'xtatish"], 1, "Ikkala tomon uchun foydali kelishuv uzoq muddatli hamkorlik beradi."),
    S("Tadbirkorlik etikasiga ZID harakat qaysi?", ["Shartnomaga rioya qilish", "Moliyaviy raqamlarni bo'rttirib ko'rsatish", "Mijozga hurmat", "Soliq intizomi"], 1, "Raqamlarni bo'rttirish — ishonchni yo'qotadi va etikaga zid."),
    S("\"Birinchi 90 kun\" rejasining birinchi oyidagi asosiy maqsad nima?", ["Ofis qurish", "MVPni yakunlash va birinchi to'lovchi mijozlar", "Xorijga eksport", "100 ta xodim yollash"], 1, "Avval real mijoz va daromad bilan g'oyani tasdiqlash."),
]
T15_CARDS = [("Pitch", "Biznes g'oyani investor yoki ekspertlarga qisqa va ishonarli taqdim etish"),
             ("Ask (so'rov)", "Kerakli mablag', uning sarflanishi va investor oladigan ulush"),
             ("Traction", "Biznesning real natijalari: mijozlar, savdo, o'sish"),
             ("G'alaba-g'alaba", "Ikkala tomonga foydali muzokara natijasi"),
             ("Tadbirkorlik etikasi", "Halollik, va'daga sodiqlik, hurmat, qonun va ijtimoiy mas'uliyat")]
T15 = lesson("15", "Biznes g'oyani taqdim etish va tadbirkorlik yo'lini boshlash",
    "Pitch tuzilmasi, ishonchli taqdimot, savollar va muzokaralar, tadbirkorlik etikasi va birinchi 90 kun (M15, A15).",
    ["debate", "peer_review", "role_play", "exit_ticket"], T15_LECT, T15_QUIZ, T15_CARDS,
    [{"type": "ordering", "title": "Pitch slaydlari tartibi", "max_points": 10,
      "content": {"prompt": "Investorga taqdimot", "items": ["Muammo", "Yechim", "Bozor hajmi", "MVP natijalari", "Biznes-model", "Raqobat va ustunlik", "Moliyaviy ko'rsatkichlar", "Jamoa", "So'rov (kerakli mablag')"]}},
     board("O'zaro baholash: biznes-reja taqdimotlari", "peer_review", "Har bir taqdimotdan keyin: 2 ta kuchli tomon va 1 ta tavsiya (\"2 yulduz va 1 tilak\").",
           ["⭐ Kuchli tomonlar", "💡 Tavsiyalar", "❓ Investor savollari"], "Taqdimot muallifining ismini yozib, izoh qoldiring. Mezonlar: muammo, dalillar, raqamlar, nutq, savollarga javob.")],
    {"type": "practical", "title": "A15. Amaliy mashg'ulot: biznes-reja taqdimoti (pitch)", "max_points": 20, "attempts": 0,
     "instructions": "Ekspertlar oldida 5–7 daqiqalik taqdimot. Bu yerga taqdimot havolasini, nutq matnini va savol-javoblar natijasini yuklang.",
     "rubric": "Muammo va yechim aniq — 3; bozor va raqobat dalillar bilan — 3; biznes-model va moliyaviy ko'rsatkichlar — 5; aniq so'rov (ask) — 2; vaqt va taqdimot sifati — 3; savollarga javob va keyingi qadamlar — 4.",
     "content": {"task": "Yakuniy taqdimot (vertikal loyiha yakuni):\n\n1. 10–12 slayddan iborat **pitch-deck** tayyorlang (Canva/PowerPoint/Google Slides) va havolasini qo'shing;\n2. **5–7 daqiqalik nutq matnini** yozing;\n3. Ekspertlar bergan **savollar va sizning javoblaringizni** yozing;\n4. Taqdimotdan keyingi **keyingi amaliy qadamlaringizni** (\"birinchi 90 kun\" rejasi) belgilang.",
                 "hints": ["Har slaydda bitta fikr va bitta raqam", "Taqdimotni vaqt bilan kamida 3 marta mashq qiling"], "reference_answer": ""}},
    [])

MODULE5 = {"title": "5-bo'lim. Moliya, biznes-reja, jamoa va taqdimot",
           "description": "Pul oqimi, foyda-zarar tahlili, biznes-reja, tashqi bozor, jamoa va xavflar, pitch va tadbirkorlik etikasi (M11–M15, A11–A15).",
           "lessons": [T11, T12, T13, T14, T15]}
