# "Tadbirkorlik asoslari" kursi generatori

`courses/tadbirkorlik-asoslari.json` fayli shu skriptlardan yig'iladi:

| Fayl | Mazmuni |
|---|---|
| `m1.py` … `m5.py` | 1–5-bo'limlar: ma'ruza matnlari, testlar, kartochkalar, interaktiv mashg'ulotlar, A1–A15, MT1–MT30 |
| `resources.py` | Shablonlar, rasmiy manbalar, qo'shimcha keyslar |
| `common.py` | Mashg'ulot yaratish yordamchilari (slaydlar ma'ruza matnidan avtomatik yasaladi) |
| `build.py` | Fan dasturi, ta'lim natijalari, kirish darsi, simulyatsiya, nazorat testlari, lug'at va yakuniy JSON |

Qayta yig'ish:

```bash
cd courses/generator
python3 build.py ../tadbirkorlik-asoslari.json
```

Platformada allaqachon yuklangan kursni o'zgartirish uchun muharrirdan foydalaning yoki yangilangan JSON'ni qayta import qiling.
