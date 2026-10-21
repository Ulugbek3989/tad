import re

VERTICAL = ("**Vertikal loyiha:** fan davomida har bir talaba bitta o'z biznes g'oyasi ustida ishlaydi. "
            "Ushbu topshiriq natijasini loyihangiz papkasida saqlang — u yakuniy biznes-rejaning bir qismi bo'ladi (A13, A15).")

def slides_from(lecture, title, code):
    """Ma'ruza matnidan (## bo'limlar) avtomatik slaydlar yasaydi."""
    parts = re.split(r'\n## ', '\n' + lecture.split('\n', 1)[1])
    slides = [{"title": title, "body": f"**{code}-mavzu** · Tadbirkorlik asoslari\n\nMa'ruza (2 soat) + amaliy mashg'ulot (2 soat)", "notes": "Darsni muammoli savol yoki qisqa hayotiy vaziyat bilan boshlang."}]
    for p in parts:
        p = p.strip()
        if not p:
            continue
        head, _, body = p.partition('\n')
        lines = [l for l in body.split('\n') if l.strip()]
        keep = []
        for l in lines:
            s = l.strip()
            if s.startswith(('- ', '* ', '|', '> ')) or re.match(r'^\d+\.', s):
                keep.append(l)
        if not keep:
            keep = [lines[0]] if lines else []
        slides.append({"title": head.strip('# ').strip(), "body": '\n'.join(keep[:9]), "notes": ""})
    return slides

def quiz(questions, title="Mavzu bo'yicha test", pts=10):
    return {"type": "quiz", "title": title, "instructions": "Har bir savolni diqqat bilan o'qing. Har bir javobdan keyin izohni o'qib chiqing.",
            "max_points": pts, "attempts": 3,
            "content": {"time_limit_min": 10, "shuffle": True, "show_answers": True, "questions": questions}}

def S(text, options, answer, expl):  # bitta javobli
    return {"type": "single", "text": text, "options": options, "answer": answer, "explanation": expl, "points": 1}

def M(text, options, answer, expl):  # ko'p javobli
    return {"type": "multiple", "text": text, "options": options, "answer": answer, "explanation": expl, "points": 1}

def TF(text, answer, expl):
    return {"type": "truefalse", "text": text, "answer": answer, "explanation": expl, "points": 1}

def N(text, answer, expl, tol=0):
    return {"type": "numeric", "text": text, "answer": answer, "tolerance": tol, "explanation": expl, "points": 1}

def flash(cards):
    return {"type": "flashcards", "title": "Kartochkalar: asosiy tushunchalar", "max_points": 0,
            "content": {"cards": [{"front": a, "back": b} for a, b in cards]}}

def amaliy(code, title, task, rubric, hints=(), reference=""):
    return {"type": "practical", "title": f"{code}. Amaliy mashg'ulot: {title}",
            "instructions": "Amaliy mashg'ulot (2 soat). Natijani shu yerga yozing — AI darhol baholaydi va tavsiya beradi, o'qituvchi yakuniy bahoni tasdiqlaydi.",
            "max_points": 10, "attempts": 0, "rubric": rubric,
            "content": {"task": task + "\n\n" + VERTICAL, "hints": list(hints), "reference_answer": reference}}

def mustaqil(code, text, task, rubric=None, words=150):
    return {"type": "practical", "title": f"{code}. Mustaqil ish: {text}",
            "instructions": "Mustaqil ta'lim topshirig'i (2 soat). Manbalardan foydalaning va ularni javob oxirida ko'rsating.",
            "max_points": 5, "attempts": 0,
            "rubric": rubric or "Mavzuning to'liq yoritilishi — 2 ball; o'zbekistonlik misollar va manbalar — 1 ball; tahlil va shaxsiy xulosa — 1 ball; o'z biznes g'oyasiga bog'lash — 1 ball.",
            "content": {"task": task + f"\n\n*Hajm: kamida {words} so'z.*", "hints": ["Manbalar: lex.uz, my.gov.uz, soliq.uz, stat.uz, finlit.uz", "Javobni o'z biznes g'oyangiz misolida yakunlang"], "reference_answer": ""}}

def board(title, method, prompt, columns, instr, pts=5):
    return {"type": "board", "title": title, "instructions": instr, "max_points": pts,
            "content": {"method": method, "prompt": prompt, "columns": columns, "anonymous": False}}

def lesson(code, title, summary, methods, lecture, quiz_qs, cards, extras, amaliy_act, mts):
    acts = [{"type": "slides", "title": f"Taqdimot: {title}", "max_points": 0, "content": {"slides": slides_from(lecture, title, code)}},
            flash(cards)]
    acts += extras
    acts.append(quiz(quiz_qs))
    acts.append(amaliy_act)
    acts += mts
    return {"title": f"{code}. {title}", "summary": summary, "kind": "lecture", "hours": 4, "methods": methods,
            "content": lecture, "activities": acts, "_quiz": quiz_qs}
