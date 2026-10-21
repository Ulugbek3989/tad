from common import *

T1_LECT = """# Tadbirkorlik tafakkuri va biznes imkoniyatlarini aniqlash

## Tadbirkorlik nima?
Tadbirkorlik — tadbirkorlik subyektlari tomonidan qonunchilikka muvofiq amalga oshiriladigan, **foyda (daromad) olishga qaratilgan, tavakkalchilik asosidagi va o'z mulkiy javobgarligi ostidagi** tashabbuskorlik faoliyati.
- **Tashabbuskorlik** — imkoniyatni birinchi bo'lib ko'rish va harakat qilish;
- **Tavakkalchilik (risk)** — natija kafolatlanmagan sharoitda qaror qabul qilish;
- **Mustaqillik** — resurslarni o'zi tanlaydi va boshqaradi;
- **Innovatsiya** — yangi mahsulot, xizmat, usul yoki bozor;
- **Javobgarlik** — natija uchun mulkiy va huquqiy javobgarlik.

## Tadbirkorlikning iqtisodiy mohiyati va zarurati
Tadbirkor ishlab chiqarish omillarini (mehnat, kapital, yer, axborot) birlashtirib, jamiyatga kerakli tovar va xizmatlar yaratadi. Natijada:
- yangi **ish o'rinlari** yaratiladi va aholi daromadi oshadi;
- **raqobat** kuchayadi — sifat oshadi, narx pasayadi;
- byudjetga **soliq tushumlari** ko'payadi;
- **innovatsiyalar** joriy etiladi va iqtisodiyot diversifikatsiyalanadi.
> O'zbekistonda kichik biznes va xususiy tadbirkorlik yalpi ichki mahsulotning yarmidan ko'prog'ini va bandlikning katta qismini ta'minlaydi (aniq ko'rsatkichlar — stat.uz).

## Tadbirkorlik turlari
| Tur | Qisqacha tavsif |
|---|---|
| Mikrobiznes | Juda kichik hajm, 1–bir necha xodim (sartaroshxona, tikuvchilik ustaxonasi) |
| Kichik biznes | Kichik korxona, cheklangan xodim soni va aylanma |
| Startap | Tez o'sishga mo'ljallangan, innovatsion, kengaytiriladigan (masshtablanadigan) model |
| Oilaviy tadbirkorlik | Oila a'zolari mehnati asosida (oilaviy korxona, hunarmandchilik) |
| Ijtimoiy tadbirkorlik | Asosiy maqsad — ijtimoiy muammoni hal qilish, foyda shu maqsadga yo'naltiriladi |
Faoliyat sohasiga ko'ra: **ishlab chiqarish, savdo (tijorat), xizmat ko'rsatish, moliyaviy, innovatsion** tadbirkorlik.

## Tadbirkorlik tafakkuri (mindset)
Muvaffaqiyatli tadbirkorni bilimdan tashqari, uning fikrlash tarzi ajratib turadi:
- muammoni **imkoniyat** sifatida ko'rish;
- **mijozdan boshlash** — "men nima qila olaman?" emas, "odamlarga nima kerak?";
- xatoni **tajriba** deb qabul qilish va tez o'rganish;
- **kichik qadamlar** bilan, kam xarajat bilan sinab ko'rish;
- **javobgarlikni** o'z zimmasiga olish.

## Biznes imkoniyatlari qayerdan topiladi?
1. **Kundalik muammolar va noqulayliklar** — navbatlar, vaqt yo'qotish, sifatsiz xizmat;
2. **O'zgarishlar** — texnologiya, qonunchilik, demografiya, moda;
3. **Bozordagi bo'shliqlar** — mavjud bo'lmagan yoki yomon ko'rsatilayotgan xizmatlar;
4. **O'z qiziqishi va ko'nikmalari** (hunar, til, IT, dizayn);
5. **Mahalliy resurslar** — qishloq xo'jaligi mahsulotlari, turizm salohiyati.

## "Muammo — yechim — mijoz — daromad manbai" zanjiri
Har qanday biznes g'oyani to'rt savol orqali tekshiring:
1. **Muammo:** qanday aniq muammo bor va u qanchalik og'riqli?
2. **Yechim:** siz qanday hal qilasiz va bu mavjud variantlardan nimasi bilan yaxshi?
3. **Mijoz:** kim aynan shu muammoga duch keladi va to'lashga tayyor?
4. **Daromad manbai:** pul qayerdan va qanday keladi (sotuv, obuna, komissiya)?

## Biznes g'oyani tanlash mezonlari
- muammoning **dolzarbligi** va mijozlar soni;
- **boshlang'ich xarajat** va o'z resurslaringiz;
- sizning **ko'nikma va qiziqishingizga** mosligi;
- **raqobat** darajasi;
- **tez sinab ko'rish** imkoniyati.
> **Xulosa:** biznes g'oya — bu mahsulot emas, balki *mijozning hal qilinishi kerak bo'lgan muammosi*dan boshlanadi."""

T1_QUIZ = [
    S("Tadbirkorlikning asosiy belgilari qatoriga quyidagilardan qaysi biri KIRMAYDI?", ["Tashabbuskorlik", "Tavakkalchilik", "Kafolatlangan daromad", "O'z mulkiy javobgarligi"], 2, "Tadbirkorlik tavakkalchilikka asoslanadi — daromad kafolatlanmagan."),
    S("Tez o'sishga mo'ljallangan, innovatsion va masshtablanadigan biznes qanday ataladi?", ["Mikrobiznes", "Startap", "Oilaviy korxona", "Fermer xo'jaligi"], 1, "Startapning asosiy belgisi — tez o'sish va kengaytiriladigan model."),
    S("Ijtimoiy tadbirkorlikning asosiy maqsadi nima?", ["Maksimal foyda olish", "Ijtimoiy muammoni hal qilish", "Davlat buyurtmalarini bajarish", "Eksportni oshirish"], 1, "Ijtimoiy tadbirkorlikda foyda ijtimoiy maqsadga xizmat qiladi."),
    M("Tadbirkorlikning iqtisodiyotga ijobiy ta'sirlarini belgilang.", ["Yangi ish o'rinlari", "Raqobatning kuchayishi", "Soliq tushumlarining oshishi", "Inflyatsiyaning majburiy o'sishi"], [0, 1, 2], "Tadbirkorlik bandlik, raqobat va soliq tushumlarini oshiradi."),
    S("\"Muammo — yechim — mijoz — ...\" zanjirining to'rtinchi bo'g'ini qaysi?", ["Raqobatchi", "Daromad manbai", "Reklama", "Investor"], 1, "To'liq zanjir: muammo — yechim — mijoz — daromad manbai."),
    TF("Tadbirkorlik tafakkuriga ko'ra, biznes g'oya \"men nima ishlab chiqara olaman?\" degan savoldan boshlanishi kerak.", False, "To'g'ri yondashuv — mijozning muammosidan boshlash."),
    M("Biznes imkoniyatlarining manbalarini belgilang.", ["Kundalik muammolar", "Texnologik va qonunchilikdagi o'zgarishlar", "Bozordagi bo'shliqlar", "Tasodifiy omad"], [0, 1, 2], "Imkoniyatlar muammolar, o'zgarishlar va bozor bo'shliqlaridan topiladi."),
    S("Biznes g'oyani tanlashda qaysi mezon eng avvalo hisobga olinadi?", ["G'oyaning chiroyli nomi", "Muammoning dolzarbligi va to'lovga tayyor mijozlar", "Do'stlarning fikri", "Ofisning joylashuvi"], 1, "Dolzarb muammo va to'lovga tayyor mijoz — g'oyaning asosi."),
]

T1_CARDS = [("Tadbirkorlik", "Foyda olishga qaratilgan, tavakkalchilik asosidagi va o'z mulkiy javobgarligi ostidagi tashabbuskorlik faoliyati"),
            ("Startap", "Tez o'sishga mo'ljallangan, innovatsion va masshtablanadigan yangi biznes"),
            ("Mikrobiznes", "Juda kichik hajmdagi, odatda 1–bir necha kishilik biznes"),
            ("Ijtimoiy tadbirkorlik", "Ijtimoiy muammoni hal qilishni asosiy maqsad qilgan tadbirkorlik"),
            ("Tadbirkorlik tafakkuri", "Muammoni imkoniyat sifatida ko'rish, mijozdan boshlash, kichik qadamlar bilan sinash"),
            ("Biznes imkoniyati", "Mijozlarning qondirilmagan ehtiyoji yoki hal qilinmagan muammosi"),
            ("Tavakkalchilik (risk)", "Natija kafolatlanmagan sharoitda qaror qabul qilish")]

T1 = lesson("1", "Tadbirkorlik tafakkuri va biznes imkoniyatlarini aniqlash",
    "Tadbirkorlik mohiyati, turlari, tadbirkorlik tafakkuri va biznes imkoniyatlarini topish (M1, A1).",
    ["brainstorm", "cluster", "problem", "kwl"], T1_LECT, T1_QUIZ, T1_CARDS,
    [board("Aqliy hujum: atrofimdagi muammolar", "brainstorm", "Kundalik hayotingizda qaysi muammolar sizni bezovta qiladi? Har bir muammoni alohida yozing.",
           ["Muammolar", "Kim duch keladi?", "Mumkin bo'lgan biznes g'oya"], "Aqliy hujum: kamida 3 ta muammo va undan kelib chiqadigan g'oya yozing. Boshqalarning g'oyalarini \"yoqdi\" bilan baholang."),
     {"type": "classify", "title": "Tadbirkorlik turlarini ajrating", "instructions": "Har bir misolni tegishli tadbirkorlik turiga joylashtiring.", "max_points": 10,
      "content": {"categories": [
          {"name": "Mikrobiznes", "items": ["Uy sharoitida tort pishirib sotish", "Bir kishilik telefon ta'mirlash ustaxonasi"]},
          {"name": "Startap", "items": ["Mahalliy kuryerlar uchun mobil platforma", "Sun'iy intellekt asosidagi til o'rganish ilovasi"]},
          {"name": "Oilaviy tadbirkorlik", "items": ["Oila a'zolari boshqaradigan gilam to'qish korxonasi", "Oilaviy mehmon uyi"]},
          {"name": "Ijtimoiy tadbirkorlik", "items": ["Imkoniyati cheklanganlarni ishga oladigan tikuv sexi", "Plastik chiqindini qayta ishlovchi korxona"]}]}}],
    amaliy("A1", "O'z imkoniyatlaringiz va atrofdagi muammolar",
        "\"Tadbirkorlik tafakkuri va biznes imkoniyatlarini aniqlash\" mavzusi bo'yicha:\n\n1. **O'z tahlilingiz:** qiziqishlaringiz (3 ta), ko'nikmalaringiz (3 ta) va resurslaringizni (vaqt, pul, tanishlar, joy) yozing.\n2. **Atrofdagi imkoniyatlar:** mahallangiz, oilangiz yoki universitetingizda kuzatgan **3–5 ta muammoni** yozing.\n3. Har bir muammoni **\"muammo — yechim — mijoz — daromad manbai\"** zanjiri bo'yicha tahlil qiling (jadval ko'rinishida).\n4. Har bir g'oyani 1–5 ball bilan baholang: dolzarblik, boshlang'ich xarajat, sizning ko'nikmangizga mosligi, raqobat.\n5. Eng yuqori ball olgan g'oyani tanlang va nima uchun tanlaganingizni 3–4 gapda asoslang.",
        "Shaxsiy tahlil (qiziqish, ko'nikma, resurs) — 2 ball; kamida 3 ta aniq muammo — 2 ball; zanjir bo'yicha to'g'ri tahlil — 3 ball; baholash jadvali — 1 ball; tanlovning asoslanishi — 2 ball.",
        ["Muammoni aniq odam va aniq vaziyat bilan ta'riflang: \"kim, qachon, nima uchun qiynaladi?\"", "Daromad manbai — sotuv, obuna, komissiya, ijara va h.k."],
        "Namuna: Muammo — talabalar yotoqxonasida kir yuvish mashinasi navbati uzun. Yechim — onlayn navbat va pullik kir yuvish xizmati. Mijoz — yotoqxonada yashovchi 300 talaba. Daromad — har bir yuvish uchun to'lov. Baholash: dolzarblik 5, xarajat 3, ko'nikma 4, raqobat 4."),
    [mustaqil("MT1", "Tadbirkorlik turlari va ularning o'ziga xos xususiyatlarini qiyosiy tahlil qilish",
        "Mikrobiznes, kichik biznes, startap, oilaviy va ijtimoiy tadbirkorlikni **qiyosiy jadval** asosida tahlil qiling: maqsad, hajm, boshlang'ich kapital, xavf darajasi, o'sish salohiyati, O'zbekistondan misol. Xulosada o'zingiz uchun eng mos turni asoslang."),
     mustaqil("MT3", "Atrof-muhitdagi muammolarni \"muammo — yechim — mijoz — daromad manbai\" zanjiri asosida tahlil qilish",
        "Yashash joyingizdagi 3 ta muammoni tanlang va har birini zanjir bo'yicha batafsil tahlil qiling. Qaysi biri biznes uchun eng istiqbolli ekanini dalillar bilan ko'rsating.")])

T2_LECT = """# Mijoz muammosini biznes g'oyaga aylantirish va uni kam xarajat bilan bozorda sinab ko'rish

## Nega ko'p yangi bizneslar muvaffaqiyatsiz bo'ladi?
Yangi bizneslarning muvaffaqiyatsizligining eng ko'p uchraydigan sababi — **bozorda unga ehtiyoj yo'qligi**. Tadbirkor mahsulotni oylab tayyorlaydi, keyin ma'lum bo'ladiki, mijoz uni sotib olmaydi.
- Yechim: **avval sinab ko'r, keyin investitsiya qil** (Lean Startup yondashuvi, E. Ris).

## Mijoz muammosini aniqlash usullari
- **Kuzatuv** — odamlar qayerda qiynalayotganini o'z ko'zingiz bilan ko'rish;
- **Mijoz bilan suhbat (intervyu)** — o'tmishdagi real xatti-harakat haqida so'rash;
- **So'rovnoma** — ko'p odamdan qisqa javob olish (Google Forms, Telegram so'rovnoma);
- **Fikrlar yo'g'ini (brainstorming)** — guruh bilan g'oyalar to'plash;
- **Raqobatchilarga sharhlar** — onlayn izohlardagi shikoyatlar.

## To'g'ri suhbat qoidalari
1. G'oyangizni emas, **mijozning hayotini** so'rang;
2. "Sotib olarmidingiz?" deb emas, **"Oxirgi marta bu muammoga duch kelganingizda nima qildingiz?"** deb so'rang;
3. Muammo uchun hozir **qancha pul va vaqt** sarflayotganini bilib oling;
4. Ko'proq tinglang, kamroq gapiring;
5. Kamida **5–10 suhbat** o'tkazing va takrorlanuvchi javoblarni ajrating.

## Qiymat taklifi (value proposition)
Qiymat taklifi — mijozga **nima uchun aynan sizdan sotib olishi kerakligini** bitta jumlada tushuntirish:
> "Biz **[mijoz]**ga **[muammo]**ni **[yechim]** orqali hal qilishga yordam beramiz, **[raqobatchi]**dan farqli ravishda **[afzallik]**."

## MVP — minimal hayotiy mahsulot
**MVP (Minimum Viable Product)** — g'oyaning asosiy qiymatini tekshirish uchun eng kam xarajat va vaqt bilan yaratilgan dastlabki versiya.
MVP shakllari:
- **sodda namuna (prototip)** — qo'lda yasalgan bitta mahsulot;
- **xizmat ssenariysi** — xizmatni qo'lda, kichik hajmda ko'rsatish;
- **e'lon yoki katalog** — Telegram kanal, Instagram sahifa;
- **onlayn buyurtma shakli** — Google Forms, landing sahifa;
- **oldindan buyurtma** — mahsulot tayyor bo'lmasdan buyurtma yig'ish.

## "Yarat — ko'rsat — fikr ol — yaxshila" sikli
1. **Yarat** — eng sodda MVP;
2. **Ko'rsat** — real mijozlarga taklif qil;
3. **Fikr ol** — nechta odam qiziqdi, buyurtma berdi, to'ladi?
4. **Yaxshila** — natijaga qarab g'oyani o'zgartir yoki davom ettir.
Bu sikl tez va qayta-qayta takrorlanadi.

## Bozorda sinash rejasi
- **Gipoteza:** "Talabalar uy ovqatini 25 000 so'mga buyurtma qiladi";
- **Tajriba:** 1 hafta Telegram kanal orqali buyurtma qabul qilish;
- **Ko'rsatkich:** kamida 20 ta buyurtma;
- **Qaror:** ko'rsatkich bajarilsa — davom etish; bajarilmasa — g'oyani o'zgartirish (pivot)."""

T2_QUIZ = [
    S("Yangi bizneslarning eng ko'p uchraydigan muvaffaqiyatsizlik sababi nima?", ["Soliqlarning yuqoriligi", "Mahsulotga bozorda ehtiyoj yo'qligi", "Xodimlar yetishmasligi", "Ofis ijarasi"], 1, "Ko'p bizneslar mijozga kerak bo'lmagan mahsulot yaratadi."),
    S("MVP nima?", ["Eng ko'p sotiladigan mahsulot", "G'oyani tekshirish uchun minimal xarajat bilan yaratilgan dastlabki versiya", "Yakuniy mukammal mahsulot", "Marketing rejasining bir qismi"], 1, "MVP — Minimum Viable Product."),
    S("Mijoz bilan suhbatda qaysi savol eng to'g'ri?", ["Mening g'oyam sizga yoqdimi?", "Buni sotib olarmidingiz?", "Oxirgi marta bu muammoga duch kelganingizda nima qildingiz?", "Narxi qimmat emasmi?"], 2, "O'tmishdagi real xatti-harakat haqidagi savollar ishonchli ma'lumot beradi."),
    M("Quyidagilardan qaysilari MVP shakli bo'lishi mumkin?", ["Telegram kanaldagi e'lon", "Google Forms orqali buyurtma shakli", "Qo'lda yasalgan bitta namuna", "To'liq qurilgan zavod"], [0, 1, 2], "MVP arzon va tez bo'lishi kerak."),
    S("\"Yarat — ko'rsat — fikr ol — ...\" siklining oxirgi bosqichi qaysi?", ["Sot", "Yaxshila", "Kutib tur", "Reklama qil"], 1, "Fikr asosida mahsulot yaxshilanadi va sikl takrorlanadi."),
    TF("Qiymat taklifi mijozga nima uchun aynan sizdan sotib olishi kerakligini tushuntiradi.", True, "Qiymat taklifi — mijoz uchun asosiy foyda va farq."),
    S("Bozorda sinash rejasidagi \"kamida 20 ta buyurtma\" nima hisoblanadi?", ["Gipoteza", "Muvaffaqiyat ko'rsatkichi", "Xarajat", "Raqobatchi"], 1, "Ko'rsatkich — tajriba natijasini o'lchash mezoni."),
    S("Sinov natijasi kutilganidek bo'lmasa, g'oyani o'zgartirish nima deb ataladi?", ["Pivot", "Franshiza", "Dividend", "Audit"], 0, "Pivot — biznes yo'nalishini o'zgartirish."),
]
T2_CARDS = [("MVP", "Minimal hayotiy mahsulot — g'oyani kam xarajat bilan sinash uchun dastlabki versiya"),
            ("Qiymat taklifi", "Mijozga nima uchun aynan sizning mahsulotingiz kerakligini tushuntiruvchi jumla"),
            ("Mijoz bilan suhbat (intervyu)", "Mijozning real muammosi va xatti-harakatini aniqlash usuli"),
            ("Pivot", "Sinov natijasiga ko'ra biznes g'oya yoki yo'nalishni o'zgartirish"),
            ("Gipoteza", "Bozorda tekshirilishi kerak bo'lgan taxmin"),
            ("Lean Startup", "Kam xarajat bilan tez sinash va o'rganishga asoslangan yondashuv (E. Ris)")]
T2 = lesson("2", "Mijoz muammosini biznes g'oyaga aylantirish va uni kam xarajat bilan bozorda sinab ko'rish",
    "Mijoz muammosini aniqlash, qiymat taklifi, MVP va bozorda sinash (M2, A2).",
    ["tps", "problem", "role_play", "peer_review"], T2_LECT, T2_QUIZ, T2_CARDS,
    [{"type": "ordering", "title": "\"Yarat — ko'rsat — fikr ol — yaxshila\" siklini tiklang", "instructions": "Biznes g'oyani bozorda sinash bosqichlarini to'g'ri tartibga keltiring.", "max_points": 10,
      "content": {"prompt": "G'oyadan sinovgacha", "items": ["Mijoz muammosini kuzatish va suhbatlar o'tkazish", "Qiymat taklifini shakllantirish", "Eng sodda MVP yaratish", "MVPni real mijozlarga ko'rsatish", "Natijalarni o'lchash va fikr-mulohaza yig'ish", "G'oyani yaxshilash yoki pivot qilish"]}},
     board("O'zaro baholash: qiymat takliflarimiz", "peer_review", "O'z qiymat taklifingizni shablon bo'yicha yozing; sheriklaringiz takliflariga izoh qoldiring.",
           ["⭐ Kuchli tomonlar", "💡 Tavsiyalar", "❓ Savollar"], "Shablon: \"Biz [mijoz]ga [muammo]ni [yechim] orqali hal qilishga yordam beramiz, [raqobatchi]dan farqli ravishda [afzallik].\"")],
    amaliy("A2", "Muammolarni aniqlash va MVP tayyorlash",
        "1. Fikrlar yo'g'ini, kuzatuv va mijozlar bilan suhbat orqali **kamida 5 ta muammoni** aniqlang (har biri uchun: kim bilan suhbatlashdingiz, nima dedi).\n2. Ulardan bitta biznes g'oyani tanlang va **qiymat taklifini** shablon bo'yicha yozing.\n3. G'oyangiz uchun **MVP** ishlab chiqing: sodda namuna, xizmat ssenariysi, e'lon, katalog yoki onlayn buyurtma shakli (havola yoki tavsif).\n4. **Bozorda sinash rejasini** tuzing: gipoteza, tajriba, muddat, muvaffaqiyat ko'rsatkichi, qaror qoidasi.",
        "5 ta muammo va suhbat dalillari — 2 ball; qiymat taklifi — 2 ball; MVP tavsifi (aniq, arzon, tez) — 3 ball; sinash rejasi (gipoteza, ko'rsatkich, qaror) — 3 ball.",
        ["MVP uchun bepul vositalar: Telegram kanal/bot, Instagram, Google Forms, Canva", "Ko'rsatkich raqam bilan o'lchanishi kerak"],
        "Namuna: Gipoteza — talabalar uy ovqatini 25 000 so'mga buyurtma qiladi. MVP — Telegram kanal va Google Forms buyurtma shakli. Tajriba — 1 hafta. Ko'rsatkich — 20 ta buyurtma. Qaror — 20+ bo'lsa kengaytirish, kam bo'lsa narx yoki menyuni o'zgartirish."),
    [mustaqil("MT4", "Bozor muammolarini kuzatish, mijozlar bilan suhbat va so'rovnoma o'tkazish orqali aniqlash",
        "Kamida 5 ta potensial mijoz bilan suhbat o'tkazing va 10 savoldan iborat so'rovnoma tuzing (Google Forms). Javoblarni umumlashtirib, eng ko'p takrorlangan 3 ta muammoni ko'rsating."),
     mustaqil("MT5", "Biznes g'oyani shakllantirish, sinov mahsuloti (MVP)ni ishlab chiqish va bozorda sinash rejasini tuzish",
        "O'z g'oyangiz uchun MVPni real yarating (kanal, sahifa, namuna) va 1 hafta sinab ko'ring. Natijalar: nechta odam ko'rdi, qiziqdi, buyurtma berdi."),
     mustaqil("MT6", "\"Yarat — ko'rsat — fikr ol — yaxshila\" tamoyili asosida biznes g'oyani takomillashtirish",
        "MT5 natijalariga tayanib, sikldan yana bir marta o'ting: nimani o'zgartirdingiz, nima uchun va natija qanday o'zgardi? Jadval ko'rinishida \"oldin/keyin\" taqqoslang.")])

T3_LECT = """# Biznes boshlash uchun kredit olishning afzalliklari, iste'mol kreditidan farqlari va "Kelajakka qadam" dasturi

## Biznesni moliyalashtirish manbalari
| Manba | Afzalligi | Kamchiligi |
|---|---|---|
| Shaxsiy jamg'arma | Qarzsiz, mustaqil | Hajmi cheklangan |
| Oila va do'stlar | Tez, yumshoq shartlar | Munosabatlarga xavf |
| Bank krediti | Katta summa, rasmiy | Foiz, garov, qaytarish majburiyati |
| Mikrokredit / mikromoliya | Kichik summalar, sodda talablar | Foiz nisbatan yuqori bo'lishi mumkin |
| Grant va subsidiya | Qaytarilmaydi | Tanlov, hisobot talab qilinadi |
| Investor / hamkor | Pul + tajriba | Ulush va nazoratni bo'lishish |
| Lizing | Uskunani bosqichma-bosqich to'lash | Umumiy qiymat yuqoriroq |

## Biznes krediti va iste'mol krediti
- **Iste'mol krediti** — shaxsiy ehtiyojlar (maishiy texnika, telefon, ta'mir) uchun olinadi va **daromad keltirmaydi**; qarz oluvchining ish haqidan qaytariladi.
- **Biznes krediti** — daromad keltiruvchi faoliyat (uskuna, xomashyo, aylanma mablag') uchun olinadi va **biznesning o'z daromadidan** qaytariladi.
| Mezon | Iste'mol krediti | Biznes krediti |
|---|---|---|
| Maqsad | Shaxsiy iste'mol | Daromad keltiruvchi faoliyat |
| Qaytarish manbai | Ish haqi | Biznes daromadi (pul oqimi) |
| Talab qilinadigan hujjat | Daromad ma'lumotnomasi | Biznes-reja, pul oqimi prognozi |
| Pulning ishlashi | Qiymat yaratmaydi | Yangi qiymat va foyda yaratadi |

## Kredit olishning afzalliklari
- biznesni **tezroq boshlash** yoki kengaytirish;
- **moliyaviy richag** effekti: kredit foizidan yuqori rentabellikda ishlasangiz, o'z kapitalingiz daromadliligi oshadi;
- **kredit tarixini** shakllantirish — keyingi moliyalashtirish osonlashadi;
- davlat dasturlari orqali **imtiyozli foizlar**.

## Kreditning asosiy shartlari
- **Summa** va **muddat**;
- **foiz stavkasi** (yillik), **imtiyozli davr** (asosiy qarzni to'lamaslik muddati);
- **ta'minot** — garov, kafillik, sug'urta polisi;
- **to'lov jadvali** — annuitet (teng to'lovlar) yoki differensial (kamayib boruvchi).
> **Muhim qoida:** oylik kredit to'lovi biznesning oylik sof pul oqimidan kam bo'lishi kerak. Aks holda biznes qarzni qaytara olmaydi.

## "Kelajakka qadam" va boshqa davlat dasturlari
O'zbekistonda yoshlar tadbirkorligini qo'llab-quvvatlash uchun imtiyozli kreditlar, subsidiyalar, grantlar, biznes-inkubatorlar va mentorlik dasturlari amalda.
- **"Kelajakka qadam"** — yoshlar va boshlovchi tadbirkorlarning biznes loyihalarini imtiyozli moliyalashtirish va qo'llab-quvvatlashga qaratilgan dastur;
- Prezidentning 2025-yil 14-fevraldagi **PQ–60** va **PQ–62** qarorlari — yoshlar tadbirkorligini qo'llab-quvvatlash va bandligini ta'minlash choralari;
- Yoshlar ishlari agentligi, tijorat banklarining yoshlar dasturlari, biznes-inkubatorlar va IT-park.
> Dastur shartlari (summa, foiz, yosh chegarasi, talab qilinadigan hujjatlar) vaqti-vaqti bilan yangilanadi — har doim **lex.uz** va bank rasmiy saytlaridan amaldagi tahririni tekshiring.

## Bank bilan suhbatga tayyorgarlik
1. Qisqa **biznes-reja** (g'oya, bozor, xarajat, daromad);
2. **Pul oqimi prognozi** — kreditni qaysi daromaddan qaytarasiz;
3. Kredit **maqsadi** va aniq **xarajatlar smetasi**;
4. **Ta'minot** variantlari;
5. Shaxsiy hujjatlar va **kredit tarixi**;
6. Ehtimoliy savollarga javoblar: "Agar savdo kutilganidan kam bo'lsa nima qilasiz?"

## Moliyaviy yo'l xaritasi
Kredit olishdan oldin quyidagilarni yozing: **maqsad → summa → muddat → qaytarish manbai → ta'minot → dastur/bank → harakatlar jadvali**."""

T3_QUIZ = [
    S("Biznes kreditining iste'mol kreditidan asosiy farqi nima?", ["Foizi har doim pastroq", "Daromad keltiruvchi faoliyat uchun olinadi va biznes daromadidan qaytariladi", "Garov talab qilinmaydi", "Faqat jismoniy shaxslarga beriladi"], 1, "Biznes krediti yangi qiymat yaratadigan faoliyatga yo'naltiriladi."),
    S("Qaysi moliyalashtirish manbai odatda QAYTARILMAYDI?", ["Bank krediti", "Lizing", "Grant", "Mikroqarz"], 2, "Grant qaytarilmaydi, lekin maqsadli ishlatilishi va hisobot talab qilinadi."),
    S("Kredit bo'yicha asosiy qarz to'lanmaydigan boshlang'ich muddat qanday ataladi?", ["Imtiyozli davr", "Annuitet", "Garov", "Kredit tarixi"], 0, "Imtiyozli davrda odatda faqat foiz to'lanadi yoki umuman to'lanmaydi."),
    S("Teng oylik to'lovlar bilan kreditni so'ndirish usuli qanday ataladi?", ["Differensial", "Annuitet", "Lizing", "Faktoring"], 1, "Annuitet — har oy bir xil summa to'lanadi."),
    M("Bank bilan suhbatga nimalar tayyorlanadi?", ["Qisqa biznes-reja", "Pul oqimi prognozi", "Xarajatlar smetasi", "Raqobatchilarning parollari"], [0, 1, 2], "Bank qaytarish qobiliyatini biznes-reja va pul oqimiga qarab baholaydi."),
    TF("Oylik kredit to'lovi biznesning oylik sof pul oqimidan katta bo'lsa ham xavf yo'q.", False, "To'lov sof pul oqimidan kam bo'lishi shart, aks holda qarz qaytarilmaydi."),
    S("Investordan mablag' olishning asosiy \"narxi\" nima?", ["Yuqori foiz", "Biznesdagi ulush va nazoratning bir qismini berish", "Garov", "Soliq imtiyozi"], 1, "Investor odatda biznes ulushini oladi."),
    N("Biznes 10 000 000 so'm kreditni 12 oyga yillik 24% oddiy foiz bilan oldi. 1 yil uchun to'lanadigan foiz summasi necha so'm?", 2400000, "10 000 000 × 24% = 2 400 000 so'm (oddiy foiz, qarz yil davomida to'liq qoldirilgan deb hisoblanganda)."),
]
T3_CARDS = [("Iste'mol krediti", "Shaxsiy ehtiyoj uchun olinadigan, ish haqidan qaytariladigan kredit"),
            ("Biznes krediti", "Daromad keltiruvchi faoliyat uchun olinib, biznes daromadidan qaytariladigan kredit"),
            ("Imtiyozli davr", "Asosiy qarz to'lanmaydigan boshlang'ich muddat"),
            ("Annuitet to'lov", "Kreditni teng oylik to'lovlar bilan so'ndirish"),
            ("Differensial to'lov", "Asosiy qarz teng bo'linib, foiz kamayib boruvchi to'lov"),
            ("Garov (ta'minot)", "Qarz qaytarilmasa bank undirib olishi mumkin bo'lgan mol-mulk yoki kafillik"),
            ("Grant", "Maqsadli ishlatiladigan, qaytarilmaydigan moliyaviy yordam"),
            ("Moliyaviy richag", "Qarz mablag'ini ishlatish orqali o'z kapitali daromadliligini oshirish")]
T3 = lesson("3", "Biznes boshlash uchun kredit olishning afzalliklari, iste'mol kreditidan farqlari va \"Kelajakka qadam\" dasturi",
    "Moliyalashtirish manbalari, biznes va iste'mol krediti, davlat dasturlari, bank suhbatiga tayyorgarlik (M3, A3).",
    ["simulation", "tchart", "role_play", "case_study"], T3_LECT, T3_QUIZ, T3_CARDS,
    [{"type": "matching", "title": "Moliyalashtirish manbalari va ularning xususiyati", "max_points": 10,
      "instructions": "Har bir manbani uning asosiy xususiyati bilan moslang.",
      "content": {"pairs": [{"left": "Grant", "right": "Qaytarilmaydi, maqsadli ishlatiladi"},
                            {"left": "Bank krediti", "right": "Foiz va garov bilan qaytariladi"},
                            {"left": "Investor", "right": "Biznes ulushi evaziga mablag' beradi"},
                            {"left": "Lizing", "right": "Uskunani bosqichma-bosqich to'lab olish"},
                            {"left": "Shaxsiy jamg'arma", "right": "Qarzsiz, lekin hajmi cheklangan"}]}},
     {"type": "case", "title": "Keys: \"Telefon kreditga yoki tikuv mashinasi kreditga?\"", "max_points": 10,
      "instructions": "Simulyatsiya: \"Bank suhbati\". Vaziyatni tahlil qiling va bank xodimi o'rnida qaror qabul qiling.",
      "rubric": "Kredit turini to'g'ri farqlash — 3; qaytarish qobiliyatini hisoblash — 4; asoslangan tavsiya — 3.",
      "content": {"scenario": "21 yoshli Madina tikuvchilik kursini tugatgan. U ikkita variantni o'ylayapti:\n\n1. **6 000 000 so'mga** yangi smartfonni muddatli to'lovga olish (\"Instagramda buyurtma olaman\").\n2. **18 000 000 so'mga** sanoat tikuv mashinasi va overlok olish uchun biznes krediti (yillik 14%, 24 oy, 6 oy imtiyozli davr).\n\nMadinaning hisob-kitobi: oyiga 40 ta buyurtma × 120 000 so'm; xomashyo va boshqa xarajatlar — tushumning 45%.",
                  "questions": ["Har bir variant iste'mol krediti yoki biznes kreditimi? Nima uchun?", "Madinaning oylik sof pul oqimini hisoblang.", "Biznes krediti bo'yicha taxminiy oylik to'lov sof pul oqimiga nisbatan qanday? Xavf bormi?", "Bank xodimi sifatida qanday qaror qabul qilasiz va qanday shart qo'yasiz?"],
                  "reference_answer": "1-variant — iste'mol krediti (smartfon daromad keltiruvchi asosiy vosita emas), 2-variant — biznes krediti. Tushum 40×120 000 = 4 800 000; xarajat 45% = 2 160 000; sof pul oqimi ≈ 2 640 000 so'm. Imtiyozli davrdan keyin 18 mln ni 18 oyda qaytarish ≈ 1 000 000 + foiz ≈ 1 200 000 so'm/oy — sof pul oqimining ~45%, qabul qilinadigan. Tavsiya: biznes kreditini berish, buyurtmalar bazasi (MVP natijalari) va kafillik talab qilish."}}],
    amaliy("A3", "Moliyaviy yo'l xaritasi",
        "\"Kelajakka qadam\" dasturi (yoki boshqa davlat dasturi) asosida o'z biznes g'oyangiz uchun **moliyaviy yo'l xaritasi** yarating:\n\n1. Kredit (moliyalashtirish) **maqsadi** va xarajatlar smetasi (jadval);\n2. Taxminiy **summa**, muddat va to'lov turi;\n3. **Qaytarish manbai** — qaysi daromad hisobidan (oylik sof pul oqimi taxmini);\n4. Mos **dastur yoki bank** va uning shartlari (manbasini ko'rsating);\n5. Ta'minot (garov, kafillik) variantlari;\n6. **Qisqa harakat rejasi** — sana va qadamlar (hujjatlar yig'ish, ariza, suhbat).",
        "Maqsad va smeta — 2; summa/muddat/to'lov turi — 2; qaytarish manbai va hisob — 3; dastur/bank tanlovi asoslangan — 1; harakat rejasi — 2.",
        ["Oylik to'lov oylik sof pul oqimining 50% idan oshmasligi tavsiya etiladi", "Dastur shartlarini lex.uz va bankning rasmiy saytidan tekshiring"]),
    [mustaqil("MT7", "O'zbekistonda tadbirkorlarni qo'llab-quvvatlashga qaratilgan davlat dasturlari, grantlar, biznes-inkubatorlar va mentorlik tizimini o'rganish",
        "Kamida 3 ta amaldagi dastur yoki tashkilotni o'rganing (masalan, \"Kelajakka qadam\", yoshlar dasturlari, biznes-inkubatorlar, IT-park). Har biri uchun: kimga mo'ljallangan, qanday yordam beradi, shartlari, manbasi."),
     mustaqil("MT8", "Tadbirkorlikni moliyalashtirish manbalari: shaxsiy mablag', kredit, grant va hamkorlik imkoniyatlarini qiyosiy tahlil qilish",
        "Moliyalashtirish manbalarini qiyosiy jadvalda tahlil qiling (narxi, tezligi, xavfi, nazoratga ta'siri) va o'z biznesingiz uchun optimal kombinatsiyani asoslang."),
     mustaqil("MT9", "Biznes krediti va iste'mol kreditining xususiyatlari hamda ulardan foydalanish shartlarini taqqoslash",
        "Ikki tijorat bankining biznes va iste'mol kreditlari shartlarini (foiz, muddat, ta'minot, hujjatlar) solishtiring. Qaysi holatda qaysi kredit maqsadga muvofiq?"),
     mustaqil("MT10", "Biznes g'oya uchun moliyaviy yo'l xaritasi va bank suhbatiga tayyorgarlik rejasini ishlab chiqish",
        "Bank xodimi beradigan 10 ta ehtimoliy savolni yozing va har biriga o'z biznesingiz misolida javob tayyorlang (rol o'yini uchun ssenariy).")])

MODULE1 = {"title": "1-bo'lim. Tadbirkorlik tafakkuri, biznes g'oya va boshlang'ich moliyalashtirish",
           "description": "Biznes imkoniyatlarini topish, g'oyani MVP orqali sinash va boshlang'ich moliyalashtirish manbalari (M1–M3, A1–A3).",
           "lessons": [T1, T2, T3]}
