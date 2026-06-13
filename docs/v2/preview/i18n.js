/**
 * brend — i18n (O'zbekcha / Русский / English)
 *
 * Ishlatish:
 *   <h1 data-i18n="welcome.title">Tanishaylik</h1>
 *   <input data-i18n-placeholder="welcome.name_ph" placeholder="ismingni yoz">
 *   <button data-i18n="common.continue">Davom</button>
 *
 * Sahifa yuklanganida i18n.js applyTranslations() chaqiradi —
 * data-i18n / data-i18n-placeholder / data-i18n-aria atributlari almashtiriladi.
 */
(function () {
  'use strict';

  // ──────────────────────────────────────────────────────────────
  // LUG'AT
  // ──────────────────────────────────────────────────────────────
  const DICT = {
    uz: {
      common: {
        continue: 'Davom',
        start: 'Boshlayman',
        save: 'Saqla',
        cancel: 'Bekor',
        delete: "O'chir",
        back: 'Orqaga',
        close: 'Yopish',
        skip: "O'tkazib yubor",
        next: 'Keyingi',
        prev: 'Oldingi',
        yes: 'Ha',
        no: "Yo'q",
        ok: 'OK',
        loading: 'Yuklanmoqda...',
        error: 'Xato',
        and: 'va'
      },
      brand: {
        tagline: "sizning intizom do'stingiz"
      },
      intro: {
        salom: 'Assalomu alaykum.',
        sub_line1: 'Men — sizning do\'stingizman.',
        sub_line2: 'Siz — niyatingiz ortidan boruvchi insonsiz.',
        promise1_head: 'Siz ayting — men eshitaman.',
        promise1_body: "Rejani siz tuzasiz. Yozma yoki ovozda — marhamat. Men ularni kun tartibiga aylantiraman.",
        promise2_head: 'Fokus paytida — yoningizda turaman.',
        promise2_body: "Taymer ishlaydi, chalg'ituvchi narsalar to'sib qo'yiladi. Telefoningiz yo'ldan adashsa — qaytaraman.",
        promise3_head: 'Har kun — bitta qadamni sanayman.',
        promise3_body: "Streak, bajarish hisobi, haftalik o'sish. Tog' bir kechada qurilmaydi — har qadam ko'rinib turadi.",
        promise4_head: "Siz va men — birga qolamiz.",
        promise4_body: "Ma'lumotingiz telefoningizda saqlanadi. Server yo'q, kuzatuv yo'q, AI'ga jo'natilmaydi. Hech kim bilmaydi.",
        pact_lbl: 'Bizning kelishuv',
        pact_text1: 'Siz "qila olmadim" desangiz —',
        pact_text2: 'men "ertaga yana bormiz" deyman.',
        pact_text3: "Intizom — qo'rqitish emas,",
        pact_text4: "qo'llab turish.",
        cta: 'Tanishaylik'
      },
      welcome: {
        name_ph: 'ismingizni yozing',
        bio_ph: "o'zingiz haqingizda bir-ikki jumla (ixtiyoriy)",
        name_err: 'Ismingizni kiriting (kamida 2 harf)',
        vow_line1: 'Men',
        vow_line2: 'intizomli bo\'laman.',
        vow_line3: 'Rejaga sodiq qolaman.',
        vow_record: 'Bosing · ushlab turing · ayting',
        vow_recording: 'Tinglayapman…',
        vow_done: 'Yozildi · va\'da berildi',
        cta: 'Boshlaymiz',
        nav_hint: '‹ strelka bilan ham harakatlanasiz ›'
      },
      goal: {
        title: 'Tanishaylik',
        sub: "Sizga to'g'ri yondashish uchun",
        age_lbl: 'Yosh',
        age_ph: '28',
        age_err: "10-99 oraliqida bo'lsin",
        gender_lbl: 'Jins',
        gender_m: 'Erkak',
        gender_f: 'Ayol',
        gender_x: 'Aytmayman',
        job_lbl: 'Ish',
        job_ph: 'masalan, talaba',
        aim_lbl: 'Niyat (3 oydan keyin kim?)',
        aim_ph: 'masalan, intizomli, ilm ortidan ergashgan inson',
        confirm_head: "Sizni ko'rdim.",
        confirm_meta: 'Birinchi reja tayyor',
        cta: 'Davom'
      },
      auth: {
        title: "Ro'yhatdan o'tish",
        sub: "Yo'lingizni saqlash uchun",
        google: 'Google bilan davom',
        or: 'yoki',
        email_lbl: 'Email',
        email_err: "To'g'ri email kiriting",
        cta: "Ro'yhatdan o'tish",
        skip: "Hozircha o'tkazib yuborish",
        terms: "Ro'yhatdan o'tish bilan siz Foydalanish shartlariga rozilik bildirasiz.",
        terms_link: 'Foydalanish shartlari'
      },
      vada: {
        title: "Va'da bering",
        line1: "intizomli bo'lishga",
        line2: "rejamga sodiq bo'lishga",
        record: 'Ovozda ayting',
        recording: 'Tinglayapman…',
        done: "Va'da berildi",
        cta: 'Davom'
      },
      permissions: {
        title: 'Ruxsatlar',
        screen_time: 'Ekran vaqti',
        screen_time_why: "Fokus paytida chalg'ituvchi ilovalarni fokus rejimi uchun.",
        notif: 'Bildirishnomalar',
        notif_why: "Ish boshlanishi va eslatma uchun. Spam yo'q.",
        cta: 'Davom'
      },
      settings: {
        sub: 'kun yo\'l',
        sec_mentor: 'Mentor',
        sec_session: 'Ish',
        sec_notif: 'Bildirishnomalar',
        sec_lang: 'Til',
        tone: 'Mentor ohangi',
        tone_warm: 'Iliq',
        tone_mid: "O'rta",
        tone_strict: 'Qattiq',
        meddle: 'Aralashish darajasi',
        meddle_quiet: 'Kamtar',
        meddle_mid: "O'rta",
        meddle_active: 'Faol',
        session_mins: 'Ish davomiyligi',
        wake_time: 'Uyg\'onish vaqti',
        auto_next: 'Auto-davom',
        voice_remind: 'Ovozli eslatma',
        negotiation: 'Diqqat sinovi',
        about_link: 'Bu ilov haqida',
        reset: 'Hammasini tozalash',
        reset_confirm: 'Aniqmisiz? Bosing',
        reset_done: 'Tozalandi · qaytamiz',
        language: 'Til'
      },
      alarm: {
        title: "Uyg'oning. Misolni yeching.",
        hint: 'javobni kiriting',
        correct: "to'g'ri",
        wrong: "noto'g'ri · yangisi",
        done: "Uyg'ondingiz. Barakallo.",
        cta: 'Davom'
      },
      home: {
        greet: 'Assalomu alaykum',
        greet_morning: 'Xayrli tong',
        greet_day: 'Assalomu alaykum',
        greet_evening: 'Xayrli kech',
        greet_night: 'Xayrli tun',
        addressee: "do'stim",
        streak_lbl: "kun yo'l",
        streak_xatarda: 'xatarda',
        next: 'Keyingi',
        no_plan: "birinchi qadamingizni qo'ying",
        no_upcoming: 'bugungi rejalar tugadi',
        no_plan_short: "reja yo'q",
        focus_lbl: 'fokus',
        sessions_lbl: 'bugun',
        soat: 'soat',
        ish: 'reja',
        // CTA variantlari (smart logic)
        cta_add_goal: "Maqsad qo'shing",
        cta_evening: 'Kun yakuni',
        cta_start: 'Boshlayman',
        cta_today_plan: 'Bugungi reja',
        cta_plan: 'Rejani tuzing',
        view_plan: 'Bugungi reja',
        streak_warn1: "Streak yo'qoladi — bugun bitta reja qoldi.",
        streak_warn2_a: 'soat qoldi.',
        // Tile (4 tugma) labellari
        tile_plan: 'Bugungi reja',
        tile_goals: 'Maqsadlar',
        tile_calendar: 'Kalendar',
        tile_evening: 'Kun yakuni',
        // AI Murabbiy xabarlar
        murabbiy_all_done: 'Bugun hammasi bajarildi. Tabriklayman.',
        murabbiy_high: 'Bugun {n} reja qoldi. Kecha {pct}% bajardingiz. Davom eting.',
        murabbiy_mid:  'Bugun {n} reja qoldi. Kecha {pct}% — bugun yaxshilang.',
        murabbiy_low:  'Bugun {n} reja qoldi. Kecha {pct}% — bugun qaytib keling.',
        murabbiy_zero: 'Bugun {n} reja kutmoqda. Boshlang.',
        murabbiy_plain: 'Bugun {n} reja kutmoqda.',
        // Streak context
        streak_at_risk: '{n} kunlik streak xatarda — vaqt bor.',
        // Recovery
        recovery_lead: '{n} kun reja bajarilmagan.',
        recovery_simple_q: 'Qolgan kunlarga qayta tarqataymizmi?',
        recovery_diag_q: 'Sabab nima edi?',
        recovery_btn_simple: 'Rejani qayta tuzish',
        recovery_opt_reduce: 'Vazifa hajmi katta edi',
        recovery_opt_reduce_desc: 'Davomiylikni qisqartirish — siz % tanlaysiz',
        recovery_opt_time: "Vaqt to'g'ri kelmadi",
        recovery_opt_time_desc: 'Maqsadlarni tahrirlash — vaqtni o\'zgartiring',
        recovery_opt_other: 'Boshqa sabab',
        recovery_opt_other_desc: 'Rejani qolgan kunlarga qayta tarqatish',
        recovery_pct_q: 'Necha foiz qisqartiramiz?',
        recovery_pct_recommended: 'tavsiya',
        recovery_pct_other: 'Boshqa',
        // Identity
        identity_with_goal: "Siz {streak} kun davomida «{goal}» yo'lidasiz.",
        identity_plain: "Siz {streak} kun davomida intizom yo'lidasiz.",
        identity_sub: 'Bu — sizning yangi shaxsingizdir.',
        // Milestone progress
        milestone_label: '{next} kun gacha {remaining} kun',
        milestone_master: 'Yillik usta · {n} kun',
        // Pattern detection
        pattern_text: 'Siz {time} da «{goal}» rejasini {n} kun ketma-ket bajarmadingiz.',
        pattern_choose: "Qaysi vaqtga ko'chiramiz?",
        pattern_time_dawn: 'erta tong',
        pattern_time_morning: 'tong',
        pattern_time_noon: 'tushda',
        pattern_time_evening: 'kech',
        pattern_recommended_tag: 'tavsiya',
        pattern_custom_label: 'Belgila',
        pattern_reject: "Hozircha yo'q"
      },
      routine: {
        title: 'Rejalaringizni ayting',
        sub_a: 'Yozing yoki',
        sub_em: 'ovozda',
        sub_b: "ayting — shunga ko'ra kun tartibini tuzaman.",
        ph: "masalan: ertalab mashq, til o'rganish, kunduzi loyiha, kechqurun kitob...",
        suggest_lbl: 'Yoki tezda boshlang:',
        cta: 'Kun tartibini tuzing'
      },
      today: {
        title: 'Bugungi reja',
        focus_lbl: 'fokus',
        ish_lbl: 'reja',
        add: "+ reja qo'shish",
        empty_a: "Bugun bo'sh.",
        empty_b: "Maqsadlardan reja chiqmadi — pastdan qo'shing.",
        cta: 'Boshlayman',
        time_ph: '07:00',
        name_ph: 'reja nomi',
        dur_ph: '45 daq',
        // Maqsadlardan tuzilgan eslatma
        hint_from_goals: 'Maqsadlaringizdan tuzildi',
        // Bo'sh holat — maqsad bor, lekin bugunga reja chiqmagan
        empty_has_goals_title: 'Maqsadlardan bugunga reja chiqmadi.',
        empty_has_goals_sub: "Maqsad muddati tugagan bo'lishi mumkin. Maqsadlarni ko'ring yoki qisqa reja qo'shing.",
        empty_has_goals_btn_view: "Maqsadlarni ko'rish",
        empty_has_goals_btn_add: '+ Qisqa reja',
        // Bo'sh holat — maqsad ham yo'q
        empty_no_goals_title: "Reja maqsaddan tug'iladi.",
        empty_no_goals_sub: 'Avval maqsad qo\'ying — kun tartibi avtomatik tuziladi.',
        empty_no_goals_btn: "Maqsad qo'shish",
        // Kunlik moslash so'rovi
        adjust_q: "Bugungi kuningizga moslab kun tartibingizni o'zgartirasizmi?",
        adjust_sub: 'Vaqt yoki davomiylikni har vazifani bosib tahrirlang',
        adjust_yes: 'Ha, tahrirlayman',
        adjust_no: "Hozircha yo'q",
        // Edit/cancel/save
        edit_save: 'Saqla',
        edit_cancel: 'Bekor',
        edit_delete: "O'chir"
      },
      calendar: {
        prev: 'Oldingi hafta',
        next: 'Keyingi hafta',
        add: "+ reja qo'sh",
        empty: "Bu kuni hech narsa rejalashtirilmagan."
      },
      dayflow: {
        ready: 'tayyor',
        cta: 'Boshlayman',
        back_to_plan: 'Rejaga qaytish'
      },
      hardlock: {
        sub_locked: 'fokusdasiz',
        sub_remain: 'davom etyapsiz',
        ask_open: 'ochmoqchimisiz?',
        stay: 'Fokusda qoling',
        ask_permission: "Ruxsat so'rang",
        end: 'Yaxshi, qaytaman'
      },
      negotiation: {
        thinking_stamp: "Do'st o'ylayapti",
        thinking_text: 'Sababingizni tinglayapman.',
        thinking_wait: 'Bir lahza…',
        thinking_btn: 'Kutaman',
        denied_stamp: 'Bu vaqt sizniki',
        denied_text_a: 'Hozir',
        denied_text_em: 'fokus',
        denied_text_b: 'vaqti.',
        denied_text_c: "Bu narsa kechqurun ham kuta oladi.",
        denied_btn: 'Qaytaman',
        granted_stamp: 'Ruxsat · 5 daqiqa',
        granted_text_a: 'Bu',
        granted_text_em: 'muhim',
        granted_text_b: "5 daqiqa olib turaman.",
        granted_btn: 'Davom etaman'
      },
      session: {
        done_a: 'Bajardingiz',
        sub_count: 'bugun bajarildi',
        cta: 'Davom',
        cta_celebrate: 'Yakuniy bayram'
      },
      notif: {
        title: 'Xabarlar',
        clear: 'Tozalash',
        empty_a: "Bugun hech qanday xabar yo'q.",
        empty_b: 'Reja tuzing, ishni bajaring — bu yerda chiqadi.'
      },
      weekly: {
        focus_hours: 'Soat fokus',
        session_count: 'Ish',
        streak_lbl: 'Streak',
        change_lbl: "O'zgarish",
        day: 'Kun',
        week: 'Hafta',
        month: 'Oy'
      },
      celebrate: {
        sub: 'oldingi sizdan kuchliroqsiz',
        cta: 'Keyingi hafta'
      },
      about: {
        what_lbl: 'Nima bu?',
        what_text: "Bu ilov sizga kunlik rejani tuzish, fokus paytida chalg'imaslik va har kuni bitta qadam tashlashda yordam beradi. Do'st — sizning intizom do'stingiz.",
        feat_lbl: 'Imkoniyatlar',
        feat1: 'Rejani yozma yoki ovozli kiritish',
        feat2: 'Bugungi kun tartibi — tahrirlanadi',
        feat3: 'Haqiqiy fokus taymeri',
        feat4: 'Streak — kunlar ketma-ketligi',
        feat5: "Uyg'onish — 3 ta misol bilan",
        feat6: 'Haftalik natijalar va kalendar',
        priv_lbl: 'Maxfiylik',
        priv_text: "Hech narsa serverga jo'natilmaydi. Hech qanday AI'ga, hech qanday kuzatuvchiga. Barcha ma'lumotingiz — telefoningizda. Istasangiz — bir tugma bilan tozalaysiz.",
        settings_link: 'Sozlamalar',
        privacy_link: 'Maxfiylik siyosati',
        all_screens: 'Barcha ekranlar',
        creator: 'Yaratuvchi',
        footer: 'Hammaning niyati bilan'
      },
      menu: {
        sub_count: 'ekran',
        sec_intro: 'Tanishuv',
        sec_settings: 'Sozlama',
        sec_day: 'Kun',
        sec_do: 'Bajarish',
        sec_result: 'Natija'
      },
      sections: {
        intro: 'Tanishuv',
        settings: 'Sozlama',
        day: 'Kun',
        do: 'Bajarish',
        result: 'Natija'
      }
    },

    ru: {
      common: {
        continue: 'Продолжить',
        start: 'Начинаю',
        save: 'Сохранить',
        cancel: 'Отмена',
        delete: 'Удалить',
        back: 'Назад',
        close: 'Закрыть',
        skip: 'Пропустить',
        next: 'Далее',
        prev: 'Назад',
        yes: 'Да',
        no: 'Нет',
        ok: 'OK',
        loading: 'Загрузка...',
        error: 'Ошибка',
        and: 'и'
      },
      brand: {
        tagline: 'ваш друг по дисциплине'
      },
      intro: {
        salom: 'Здравствуйте.',
        sub_line1: 'Я — ваш друг.',
        sub_line2: 'Вы — человек, идущий за своим намерением.',
        promise1_head: 'Вы скажите — я услышу.',
        promise1_body: 'План составляете вы. Текст или голос — как удобно. Я превращу его в расписание дня.',
        promise2_head: 'Во время фокуса — я рядом.',
        promise2_body: 'Таймер идёт, отвлекающее блокируется. Если ваш телефон собьётся с пути — верну.',
        promise3_head: 'Каждый день — считаю по шагу.',
        promise3_body: 'Стрик, счёт сделанного, недельный рост. Гора не строится за ночь — каждый шаг виден.',
        promise4_head: 'Вы и я — остаёмся вместе.',
        promise4_body: 'Данные — в вашем телефоне. Ни сервера, ни слежки, ни передачи в ИИ. Никто не узнает.',
        pact_lbl: 'Наш договор',
        pact_text1: 'Вы говорите "не смог" —',
        pact_text2: 'я говорю "завтра пойдём снова".',
        pact_text3: 'Дисциплина — это не запугивание,',
        pact_text4: 'это поддержка.',
        cta: 'Познакомимся'
      },
      welcome: {
        name_ph: 'ваше имя',
        bio_ph: 'пара слов о себе (по желанию)',
        name_err: 'Введите имя (минимум 2 буквы)',
        vow_line1: 'Я',
        vow_line2: 'буду дисциплинирован.',
        vow_line3: 'Не отклонюсь от плана.',
        vow_record: 'Нажмите · удерживайте · скажите',
        vow_recording: 'Слушаю…',
        vow_done: 'Записано · обещание дано',
        cta: 'Начнём',
        nav_hint: '‹ можете двигаться и стрелками ›'
      },
      goal: {
        title: 'Знакомство',
        sub: 'Чтобы найти к вам подход',
        age_lbl: 'Возраст',
        age_ph: '28',
        age_err: 'В диапазоне 10-99',
        gender_lbl: 'Пол',
        gender_m: 'Мужской',
        gender_f: 'Женский',
        gender_x: 'Не скажу',
        job_lbl: 'Занятие',
        job_ph: 'например, студент',
        aim_lbl: 'Намерение (кем хотите быть через 3 месяца?)',
        aim_ph: 'например, дисциплинированный человек, следующий за знанием',
        confirm_head: 'Я вас увидел.',
        confirm_meta: 'Первый план готов',
        cta: 'Продолжить'
      },
      auth: {
        title: 'Регистрация',
        sub: 'Чтобы сохранить ваш путь',
        google: 'Продолжить с Google',
        or: 'или',
        email_lbl: 'Email',
        email_err: 'Введите правильный email',
        cta: 'Зарегистрироваться',
        skip: 'Пока пропустить',
        terms: 'Регистрируясь, вы соглашаетесь с Условиями использования.',
        terms_link: 'Условиями использования'
      },
      vada: {
        title: 'Дайте обещание',
        line1: 'быть дисциплинированным',
        line2: 'остаться верным плану',
        record: 'Скажите вслух',
        recording: 'Слушаю…',
        done: 'Обещание дано',
        cta: 'Продолжить'
      },
      permissions: {
        title: 'Разрешения',
        screen_time: 'Время экрана',
        screen_time_why: 'Чтобы блокировать отвлекающие приложения во время фокуса.',
        notif: 'Уведомления',
        notif_why: 'Для напоминаний о сессиях. Без спама.',
        cta: 'Продолжить'
      },
      settings: {
        sub: 'дней пути',
        sec_mentor: 'Наставник',
        sec_session: 'Дело',
        sec_notif: 'Уведомления',
        sec_lang: 'Язык',
        tone: 'Тон наставника',
        tone_warm: 'Тёплый',
        tone_mid: 'Средний',
        tone_strict: 'Строгий',
        meddle: 'Уровень вмешательства',
        meddle_quiet: 'Сдержанный',
        meddle_mid: 'Средний',
        meddle_active: 'Активный',
        session_mins: 'Длительность дела',
        wake_time: 'Время пробуждения',
        auto_next: 'Авто-продолжение',
        voice_remind: 'Голосовое напоминание',
        negotiation: 'Тест внимания',
        about_link: 'О приложении',
        reset: 'Очистить всё',
        reset_confirm: 'Уверены? Нажмите',
        reset_done: 'Очищено · возвращаемся',
        language: 'Язык'
      },
      alarm: {
        title: 'Просыпайтесь. Решите пример.',
        hint: 'введите ответ',
        correct: 'верно',
        wrong: 'неверно · новый',
        done: 'Проснулись. Хорошо.',
        cta: 'Продолжить'
      },
      home: {
        greet: 'Здравствуйте',
        greet_morning: 'Доброе утро',
        greet_day: 'Здравствуйте',
        greet_evening: 'Добрый вечер',
        greet_night: 'Доброй ночи',
        addressee: 'друг',
        streak_lbl: 'дней пути',
        streak_xatarda: 'под угрозой',
        next: 'Следующее',
        no_plan: 'сделайте первый шаг',
        no_upcoming: 'на сегодня всё',
        no_plan_short: 'плана нет',
        focus_lbl: 'фокус',
        sessions_lbl: 'сегодня',
        soat: 'ч',
        ish: 'дел',
        cta_add_goal: 'Добавить цель',
        cta_evening: 'Итог дня',
        cta_start: 'Начинаю',
        cta_today_plan: 'План на сегодня',
        cta_plan: 'Составить план',
        view_plan: 'План на сегодня',
        streak_warn1: 'Стрик прервётся — осталось одно дело.',
        streak_warn2_a: 'часов осталось.',
        tile_plan: 'План на сегодня',
        tile_goals: 'Цели',
        tile_calendar: 'Календарь',
        tile_evening: 'Итог дня',
        murabbiy_all_done: 'Сегодня всё сделано. Поздравляю.',
        murabbiy_high: 'На сегодня осталось {n} дел. Вчера {pct}% — продолжайте.',
        murabbiy_mid:  'На сегодня осталось {n} дел. Вчера {pct}% — улучшайте сегодня.',
        murabbiy_low:  'На сегодня осталось {n} дел. Вчера {pct}% — возвращайтесь.',
        murabbiy_zero: 'На сегодня {n} дел ждут. Начинайте.',
        murabbiy_plain: 'На сегодня {n} дел ждут.',
        streak_at_risk: 'Стрик {n} дней под угрозой — время ещё есть.',
        recovery_lead: '{n} дней дело не выполнялось.',
        recovery_simple_q: 'Распределить на оставшиеся дни?',
        recovery_diag_q: 'Какая была причина?',
        recovery_btn_simple: 'Перестроить план',
        recovery_opt_reduce: 'Объём задачи был большой',
        recovery_opt_reduce_desc: 'Сократить длительность — вы выбираете %',
        recovery_opt_time: 'Время не подошло',
        recovery_opt_time_desc: 'Редактировать цели — поменять время',
        recovery_opt_other: 'Другая причина',
        recovery_opt_other_desc: 'Просто перераспределить на оставшиеся дни',
        recovery_pct_q: 'На сколько процентов сократить?',
        recovery_pct_recommended: 'рекомендуем',
        recovery_pct_other: 'Другое',
        identity_with_goal: 'Вы {streak} дней идёте к «{goal}».',
        identity_plain: 'Вы {streak} дней на пути дисциплины.',
        identity_sub: 'Это — ваша новая личность.',
        milestone_label: 'До {next} дней — {remaining}',
        milestone_master: 'Мастер года · {n} дней',
        pattern_text: 'Вы в {time} {n} дней подряд не выполняли «{goal}».',
        pattern_choose: 'На какое время переносим?',
        pattern_time_dawn: 'раннее утро',
        pattern_time_morning: 'утро',
        pattern_time_noon: 'день',
        pattern_time_evening: 'вечер',
        pattern_recommended_tag: 'рекомендуем',
        pattern_custom_label: 'Установить',
        pattern_reject: 'Пока нет'
      },
      routine: {
        title: 'Расскажите свой план',
        sub_a: 'Напишите или скажите',
        sub_em: 'голосом',
        sub_b: '— я составлю расписание.',
        ph: 'например: утром зарядка, изучение языка, днём проект, вечером книга...',
        suggest_lbl: 'Или быстрый старт:',
        cta: 'Составить расписание'
      },
      today: {
        title: 'План на сегодня',
        focus_lbl: 'фокус',
        ish_lbl: 'дел',
        add: '+ добавить дело',
        empty_a: 'Сегодня пусто.',
        empty_b: 'Начните с одного дела — добавьте снизу.',
        cta: 'Начинаю',
        time_ph: '07:00',
        name_ph: 'название дела',
        dur_ph: '45 мин',
        hint_from_goals: 'Составлен из ваших целей',
        empty_has_goals_title: 'Из целей на сегодня плана не вышло.',
        empty_has_goals_sub: 'Возможно, срок цели закончился. Посмотрите цели или добавьте короткое дело.',
        empty_has_goals_btn_view: 'Посмотреть цели',
        empty_has_goals_btn_add: '+ Короткое дело',
        empty_no_goals_title: 'План рождается из цели.',
        empty_no_goals_sub: 'Сначала поставьте цель — расписание дня создастся автоматически.',
        empty_no_goals_btn: 'Добавить цель',
        adjust_q: 'Подкорректировать сегодняшний день под себя?',
        adjust_sub: 'Время или длительность — нажмите на каждое дело',
        adjust_yes: 'Да, изменю',
        adjust_no: 'Пока нет',
        edit_save: 'Сохранить',
        edit_cancel: 'Отмена',
        edit_delete: 'Удалить'
      },
      calendar: {
        prev: 'Предыдущая неделя',
        next: 'Следующая неделя',
        add: '+ добавить дело',
        empty: 'На этот день ничего не запланировано.'
      },
      dayflow: {
        ready: 'готов',
        cta: 'Начинаю',
        back_to_plan: 'Назад к плану'
      },
      hardlock: {
        sub_locked: 'в фокусе',
        sub_remain: 'продолжаете',
        ask_open: 'хотите открыть?',
        stay: 'Остаться в фокусе',
        ask_permission: 'Спросить разрешение',
        end: 'Хорошо, возвращаюсь'
      },
      negotiation: {
        thinking_stamp: 'Друг думает',
        thinking_text: 'Слушаю вашу причину.',
        thinking_wait: 'Минуту…',
        thinking_btn: 'Жду',
        denied_stamp: 'Это ваше время',
        denied_text_a: 'Сейчас время',
        denied_text_em: 'фокуса',
        denied_text_b: '.',
        denied_text_c: 'Это может подождать до вечера.',
        denied_btn: 'Возвращаюсь',
        granted_stamp: 'Разрешено · 5 минут',
        granted_text_a: 'Это',
        granted_text_em: 'важно',
        granted_text_b: '. Дам 5 минут.',
        granted_btn: 'Продолжаю'
      },
      session: {
        done_a: 'Сделано',
        sub_count: 'сегодня выполнено',
        cta: 'Продолжить',
        cta_celebrate: 'Финальный праздник'
      },
      notif: {
        title: 'Уведомления',
        clear: 'Очистить',
        empty_a: 'Сегодня нет сообщений.',
        empty_b: 'Составь план, выполни сессию — увидишь здесь.'
      },
      weekly: {
        focus_hours: 'Часов фокуса',
        session_count: 'Дел',
        streak_lbl: 'Стрик',
        change_lbl: 'Изменение',
        day: 'День',
        week: 'Неделя',
        month: 'Месяц'
      },
      celebrate: {
        sub: 'сильнее, чем были раньше',
        cta: 'Следующая неделя'
      },
      about: {
        what_lbl: 'Что это?',
        what_text: 'Это приложение поможет вам составить дневной план, не отвлекаться во время фокуса и каждый день делать один шаг. Друг — ваш друг по дисциплине.',
        feat_lbl: 'Возможности',
        feat1: 'Текстовый или голосовой ввод плана',
        feat2: 'План на сегодня — редактируется',
        feat3: 'Реальный таймер фокуса',
        feat4: 'Стрик — последовательность дней',
        feat5: 'Пробуждение — с 3 примерами',
        feat6: 'Недельные результаты и календарь',
        priv_lbl: 'Конфиденциальность',
        priv_text: 'Ничего не отправляется на сервер. Ни ИИ, ни трекерам. Все данные — в вашем телефоне. Очистите — одной кнопкой.',
        settings_link: 'Настройки',
        privacy_link: 'Политика конфиденциальности',
        all_screens: 'Все экраны',
        creator: 'Создатель',
        footer: 'С общим намерением'
      },
      menu: {
        sub_count: 'экранов',
        sec_intro: 'Знакомство',
        sec_settings: 'Настройки',
        sec_day: 'День',
        sec_do: 'Выполнение',
        sec_result: 'Результат'
      },
      sections: {
        intro: 'Знакомство',
        settings: 'Настройки',
        day: 'День',
        do: 'Выполнение',
        result: 'Результат'
      }
    },

    en: {
      common: {
        continue: 'Continue',
        start: 'Start',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        back: 'Back',
        close: 'Close',
        skip: 'Skip',
        next: 'Next',
        prev: 'Previous',
        yes: 'Yes',
        no: 'No',
        ok: 'OK',
        loading: 'Loading...',
        error: 'Error',
        and: 'and'
      },
      brand: {
        tagline: 'your discipline companion'
      },
      intro: {
        salom: 'Hello.',
        sub_line1: 'I am your mentor.',
        sub_line2: 'You are the one pursuing your intention.',
        promise1_head: 'You speak — I listen.',
        promise1_body: 'You make the plan. Text or voice — either works. I shape it into your day.',
        promise2_head: 'During focus — I stay with you.',
        promise2_body: 'Timer runs, distractions get locked. If your phone wanders — I bring it back.',
        promise3_head: 'Each day — one step counted.',
        promise3_body: 'Streak, completion, weekly growth. Mountains aren\'t built overnight — every step shows.',
        promise4_head: 'You and me — we stay together.',
        promise4_body: 'Your data stays on your phone. No server, no tracking, no AI. Nobody else knows.',
        pact_lbl: 'Our pact',
        pact_text1: 'You say "I couldn\'t" —',
        pact_text2: 'I say "tomorrow we go again."',
        pact_text3: 'Discipline isn\'t intimidation,',
        pact_text4: 'it is support.',
        cta: 'Let\'s begin'
      },
      welcome: {
        name_ph: 'your name',
        bio_ph: 'a line or two about you (optional)',
        name_err: 'Enter your name (at least 2 letters)',
        vow_line1: 'I,',
        vow_line2: 'will stay disciplined.',
        vow_line3: 'I will follow the plan.',
        vow_record: 'Press · hold · speak',
        vow_recording: 'Listening…',
        vow_done: 'Recorded · vow taken',
        cta: 'Begin',
        nav_hint: '‹ arrows also move you ›'
      },
      goal: {
        title: 'Let\'s get acquainted',
        sub: 'So I can approach you right',
        age_lbl: 'Age',
        age_ph: '28',
        age_err: 'Must be between 10-99',
        gender_lbl: 'Gender',
        gender_m: 'Male',
        gender_f: 'Female',
        gender_x: 'Prefer not',
        job_lbl: 'Work',
        job_ph: 'e.g., student',
        aim_lbl: 'Intention (who in 3 months?)',
        aim_ph: 'e.g., disciplined person who follows knowledge',
        confirm_head: 'I see you.',
        confirm_meta: 'First plan ready',
        cta: 'Continue'
      },
      auth: {
        title: 'Sign up',
        sub: 'To save your path',
        google: 'Continue with Google',
        or: 'or',
        email_lbl: 'Email',
        email_err: 'Enter a valid email',
        cta: 'Sign up',
        skip: 'Skip for now',
        terms: 'By signing up, you agree to the Terms of Use.',
        terms_link: 'Terms of Use'
      },
      vada: {
        title: 'Take the vow',
        line1: 'to be disciplined',
        line2: 'to stay true to my plan',
        record: 'Say it aloud',
        recording: 'Listening…',
        done: 'Vow taken',
        cta: 'Continue'
      },
      permissions: {
        title: 'Permissions',
        screen_time: 'Screen time',
        screen_time_why: 'To lock distracting apps during focus.',
        notif: 'Notifications',
        notif_why: 'For session reminders. No spam.',
        cta: 'Continue'
      },
      settings: {
        sub: 'days on the path',
        sec_mentor: 'Mentor',
        sec_session: 'Session',
        sec_notif: 'Notifications',
        sec_lang: 'Language',
        tone: 'Mentor tone',
        tone_warm: 'Warm',
        tone_mid: 'Middle',
        tone_strict: 'Strict',
        meddle: 'Intervention level',
        meddle_quiet: 'Quiet',
        meddle_mid: 'Middle',
        meddle_active: 'Active',
        session_mins: 'Session length',
        wake_time: 'Wake time',
        auto_next: 'Auto-continue',
        voice_remind: 'Voice reminder',
        negotiation: 'Attention test',
        about_link: 'About this app',
        reset: 'Clear everything',
        reset_confirm: 'Sure? Tap',
        reset_done: 'Cleared · going back',
        language: 'Language'
      },
      alarm: {
        title: 'Wake up. Solve the problem.',
        hint: 'enter the answer',
        correct: 'correct',
        wrong: 'wrong · new one',
        done: 'You\'re awake. Good.',
        cta: 'Continue'
      },
      home: {
        greet: 'Hello',
        greet_morning: 'Good morning',
        greet_day: 'Hello',
        greet_evening: 'Good evening',
        greet_night: 'Good night',
        addressee: 'friend',
        streak_lbl: 'day streak',
        streak_xatarda: 'at risk',
        next: 'Next',
        no_plan: 'take your first step',
        no_upcoming: 'today\'s plan is done',
        no_plan_short: 'no plan',
        focus_lbl: 'focus',
        sessions_lbl: 'today',
        soat: 'h',
        ish: 'tasks',
        cta_add_goal: 'Add a goal',
        cta_evening: 'Day summary',
        cta_start: 'Start',
        cta_today_plan: 'Today\'s plan',
        cta_plan: 'Build the plan',
        view_plan: 'Today\'s plan',
        streak_warn1: 'Streak will break — one task left today.',
        streak_warn2_a: 'hours remaining.',
        tile_plan: 'Today\'s plan',
        tile_goals: 'Goals',
        tile_calendar: 'Calendar',
        tile_evening: 'Day summary',
        murabbiy_all_done: 'All done for today. Well done.',
        murabbiy_high: '{n} tasks left today. Yesterday {pct}% — keep going.',
        murabbiy_mid:  '{n} tasks left today. Yesterday {pct}% — improve today.',
        murabbiy_low:  '{n} tasks left today. Yesterday {pct}% — come back.',
        murabbiy_zero: '{n} tasks waiting today. Begin.',
        murabbiy_plain: '{n} tasks waiting today.',
        streak_at_risk: '{n}-day streak at risk — time still available.',
        recovery_lead: '{n} days without completing the plan.',
        recovery_simple_q: 'Redistribute across remaining days?',
        recovery_diag_q: 'What was the reason?',
        recovery_btn_simple: 'Rebuild plan',
        recovery_opt_reduce: 'Task was too big',
        recovery_opt_reduce_desc: 'Shorten duration — you choose the %',
        recovery_opt_time: 'Time didn\'t suit',
        recovery_opt_time_desc: 'Edit goals — change the time',
        recovery_opt_other: 'Other reason',
        recovery_opt_other_desc: 'Just redistribute across remaining days',
        recovery_pct_q: 'By what percent should we reduce?',
        recovery_pct_recommended: 'recommended',
        recovery_pct_other: 'Other',
        identity_with_goal: 'You\'ve been on «{goal}» for {streak} days.',
        identity_plain: 'You\'ve been on the discipline path for {streak} days.',
        identity_sub: 'This is your new identity.',
        milestone_label: '{remaining} days until {next}',
        milestone_master: 'Year-master · {n} days',
        pattern_text: 'You haven\'t done «{goal}» at {time} for {n} days running.',
        pattern_choose: 'Which time should we move it to?',
        pattern_time_dawn: 'dawn',
        pattern_time_morning: 'morning',
        pattern_time_noon: 'afternoon',
        pattern_time_evening: 'evening',
        pattern_recommended_tag: 'recommended',
        pattern_custom_label: 'Set',
        pattern_reject: 'Not now'
      },
      routine: {
        title: 'Tell me your plan',
        sub_a: 'Type or say it by',
        sub_em: 'voice',
        sub_b: '— I\'ll arrange the day.',
        ph: 'e.g., morning exercise, language study, daytime project, evening reading...',
        suggest_lbl: 'Or quick start:',
        cta: 'Build the day'
      },
      today: {
        title: 'Today\'s plan',
        focus_lbl: 'focus',
        ish_lbl: 'tasks',
        add: '+ add task',
        empty_a: 'Today is empty.',
        empty_b: 'Start with one task — add below.',
        cta: 'Start',
        time_ph: '07:00',
        name_ph: 'task name',
        dur_ph: '45 min',
        hint_from_goals: 'Built from your goals',
        empty_has_goals_title: 'No plan for today from your goals.',
        empty_has_goals_sub: 'A goal\'s period may have ended. Review goals or add a short task.',
        empty_has_goals_btn_view: 'View goals',
        empty_has_goals_btn_add: '+ Short task',
        empty_no_goals_title: 'The plan is born from a goal.',
        empty_no_goals_sub: 'Set a goal first — the day\'s schedule builds itself.',
        empty_no_goals_btn: 'Add a goal',
        adjust_q: 'Adjust today\'s schedule to your day?',
        adjust_sub: 'Tap any task to edit its time or duration',
        adjust_yes: 'Yes, I\'ll edit',
        adjust_no: 'Not now',
        edit_save: 'Save',
        edit_cancel: 'Cancel',
        edit_delete: 'Delete'
      },
      calendar: {
        prev: 'Previous week',
        next: 'Next week',
        add: '+ add task',
        empty: 'Nothing planned for this day.'
      },
      dayflow: {
        ready: 'ready',
        cta: 'Start',
        back_to_plan: 'Back to plan'
      },
      hardlock: {
        sub_locked: 'in focus',
        sub_remain: 'going on',
        ask_open: 'want to open?',
        stay: 'Stay in focus',
        ask_permission: 'Ask permission',
        end: 'Okay, I\'m back'
      },
      negotiation: {
        thinking_stamp: 'Mentor is thinking',
        thinking_text: 'I\'m listening to your reason.',
        thinking_wait: 'One moment…',
        thinking_btn: 'I wait',
        denied_stamp: 'This time is yours',
        denied_text_a: 'It\'s',
        denied_text_em: 'focus',
        denied_text_b: 'time now.',
        denied_text_c: 'This can wait until evening.',
        denied_btn: 'Going back',
        granted_stamp: 'Allowed · 5 min',
        granted_text_a: 'This is',
        granted_text_em: 'important',
        granted_text_b: '. I\'ll give you 5 minutes.',
        granted_btn: 'I continue'
      },
      session: {
        done_a: 'Done',
        sub_count: 'completed today',
        cta: 'Continue',
        cta_celebrate: 'Final celebration'
      },
      notif: {
        title: 'Notifications',
        clear: 'Clear',
        empty_a: 'No messages today.',
        empty_b: 'Plan a day, finish a session — they\'ll appear here.'
      },
      weekly: {
        focus_hours: 'Focus hours',
        session_count: 'Sessions',
        streak_lbl: 'Streak',
        change_lbl: 'Change',
        day: 'Day',
        week: 'Week',
        month: 'Month'
      },
      celebrate: {
        sub: 'stronger than before',
        cta: 'Next week'
      },
      about: {
        what_lbl: 'What is this?',
        what_text: 'This app helps you plan your day, stay focused, and take one step every day. The Mentor — your discipline companion.',
        feat_lbl: 'Features',
        feat1: 'Text or voice input for plans',
        feat2: 'Today\'s plan — editable',
        feat3: 'Real focus timer',
        feat4: 'Streak — day sequence',
        feat5: 'Wake-up — with 3 problems',
        feat6: 'Weekly results and calendar',
        priv_lbl: 'Privacy',
        priv_text: 'Nothing sent to a server. No AI, no trackers. All your data stays on your phone. Wipe with one tap.',
        settings_link: 'Settings',
        privacy_link: 'Privacy policy',
        all_screens: 'All screens',
        creator: 'Creator',
        footer: 'With shared intention'
      },
      menu: {
        sub_count: 'screens',
        sec_intro: 'Intro',
        sec_settings: 'Settings',
        sec_day: 'Day',
        sec_do: 'Doing',
        sec_result: 'Results'
      },
      sections: {
        intro: 'Intro',
        settings: 'Settings',
        day: 'Day',
        do: 'Doing',
        result: 'Results'
      }
    }
  };

  // ──────────────────────────────────────────────────────────────
  // CORE
  // ──────────────────────────────────────────────────────────────
  function detectLang() {
    const stored = localStorage.getItem('mvow.lang');
    if (stored && DICT[stored]) return stored;
    const browserLang = (navigator.language || 'uz').slice(0,2);
    if (DICT[browserLang]) return browserLang;
    return 'uz';
  }
  let CURRENT_LANG = detectLang();

  function resolve(key, lang) {
    const parts = key.split('.');
    let val = DICT[lang || CURRENT_LANG];
    for (const p of parts) {
      if (val == null) return null;
      val = val[p];
    }
    return val;
  }

  // Public API
  const I18N = {
    get lang() { return CURRENT_LANG; },
    available: ['uz','ru','en'],
    labels: { uz: "O'zbekcha", ru: 'Русский', en: 'English' },
    t(key, fallback) {
      const v = resolve(key);
      return (v != null) ? v : (fallback != null ? fallback : key);
    },
    // Template substitution — replaces {name} placeholders with params
    tWith(key, params) {
      let s = String(this.t(key, ''));
      if (!s) return '';
      if (params && typeof params === 'object') {
        Object.keys(params).forEach(k => {
          s = s.split('{' + k + '}').join(String(params[k]));
        });
      }
      return s;
    },
    set(lang) {
      if (!DICT[lang]) return;
      CURRENT_LANG = lang;
      localStorage.setItem('mvow.lang', lang);
      // Sahifa yo'naltirilishini yangilash
      document.documentElement.lang = lang;
      I18N.apply();
    },
    apply(root) {
      const ctx = root || document;
      // data-i18n="key" — textContent
      ctx.querySelectorAll('[data-i18n]').forEach(el => {
        const v = resolve(el.dataset.i18n);
        if (v != null) el.textContent = v;
      });
      // data-i18n-html="key" — innerHTML (xavfli, ehtiyot bo'l)
      ctx.querySelectorAll('[data-i18n-html]').forEach(el => {
        const v = resolve(el.dataset.i18nHtml);
        if (v != null) el.innerHTML = v;
      });
      // data-i18n-placeholder="key" — input/textarea placeholder
      ctx.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const v = resolve(el.dataset.i18nPlaceholder);
        if (v != null) el.placeholder = v;
      });
      // data-i18n-aria="key" — aria-label
      ctx.querySelectorAll('[data-i18n-aria]').forEach(el => {
        const v = resolve(el.dataset.i18nAria);
        if (v != null) el.setAttribute('aria-label', v);
      });
      // data-i18n-title="key" — title attribute
      ctx.querySelectorAll('[data-i18n-title]').forEach(el => {
        const v = resolve(el.dataset.i18nTitle);
        if (v != null) el.setAttribute('title', v);
      });
    }
  };

  document.documentElement.lang = CURRENT_LANG;
  window.I18N = I18N;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => I18N.apply());
  } else {
    I18N.apply();
  }
})();
