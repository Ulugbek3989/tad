// Mashg'ulot turlari (frontend)
export const TYPES = {
  slides: { icon: '📊', name: 'Taqdimot slaydlari', desc: "Slaydlar to'plami (markdown, formula, rasm)" },
  reading: { icon: '📖', name: "O'quv materiali / video", desc: 'Matn, video, havolalar' },
  quiz: { icon: '📝', name: 'Test', desc: "Bir/ko'p javobli, to'g'ri-noto'g'ri, qisqa va sonli javoblar" },
  flashcards: { icon: '🃏', name: 'Kartochkalar', desc: 'Atama — ta\'rif; intervalli takrorlash' },
  matching: { icon: '🔗', name: 'Moslashtirish', desc: 'Juftliklarni moslash' },
  ordering: { icon: '🔢', name: 'Ketma-ketlik', desc: "Bosqichlarni to'g'ri tartiblash" },
  fillblank: { icon: '✏️', name: "Bo'sh joyni to'ldirish", desc: "Matndagi bo'sh joylarni to'ldirish" },
  classify: { icon: '🗂️', name: 'Guruhlash', desc: 'Elementlarni toifalarga ajratish' },
  lab: { icon: '🧪', name: 'Laboratoriya ishi', desc: 'Bosqichlar, kuzatuvlar, nazorat savollari; AI baholaydi' },
  practical: { icon: '🛠️', name: 'Amaliy topshiriq', desc: 'Masala/topshiriq; AI baholaydi' },
  case: { icon: '💼', name: 'Keys', desc: 'Vaziyatli masala tahlili; AI baholaydi' },
  essay: { icon: '🖋️', name: 'Esse / refleksiya', desc: 'Erkin javob; AI baholaydi' },
  board: { icon: '🧠', name: 'Interaktiv doska', desc: "Metod asosida jamoaviy ish (aqliy hujum, Venn, INSERT…)" },
};

export const LESSON_KINDS = {
  lecture: "Ma'ruza",
  practical: "Amaliy mashg'ulot",
  lab: 'Laboratoriya',
  seminar: 'Seminar',
  independent: "Mustaqil ta'lim",
};

export const typeIcon = (t) => TYPES[t]?.icon || '•';
export const typeName = (t) => TYPES[t]?.name || t;
