# Kreativ tavsif — Focus AI (FOCUS AI)

*(Konkurs talabi: kreativ g'oyalar bayoni)*

Focus AI ortidagi asosiy g'oya — **vaqtni halol o'lchash**. Bozordagi ko'pchilik odat ilovalari shunchaki "qildim / qilmadim" degan belgini so'raydi. Bu esa o'z-o'zini aldashga yo'l qo'yadi: 5 daqiqa ham, 3 soat ham bir xil "bajarildi" bo'ladi. Biz boshqacha yo'l tutdik — foydalanuvchi taymerni bosadi, jarayon paneli **haqiqiy sarflangan vaqt** bilan to'ladi, 100% bo'lganda esa g'alaba keladi. Shu falsafa butun ilovani belgilaydi: ilova nomi ham "FOCUS AI" — sizning *intizom do'stingiz*, qo'riqchi emas. Ohang iliq, qo'llab-quvvatlovchi; jazolamaydi, rag'batlantiradi.

**Eng noyob funksiya — "Telefon yuztuban = chuqur fokus".** Sessiya davomida telefonni yuztuban qo'ysangiz, akselerometr buni aniqlaydi va ekranda "chuqur fokusdasiz" belgisi yonadi. Bu — chalg'ituvchini (telefonni) jismonan chetga qo'yishga undaydigan jismoniy odat. Veb-versiya buni qila olmaydi — bu sof mobil superkuch va ilovaning intizom falsafasiga to'liq mos.

**AI murabbiy.** Kun yakunida ilova sizning natijangizga (nechta vazifa bajarildi, qancha vaqt fokuslandingiz, streak) qarab qisqa, shaxsiy, iliq xabar beradi. Buning ortida bepul Google Gemini turadi. Eng muhimi — agar AI kaliti bo'lmasa yoki internet uzilsa, ilova oddiy shablon murabbiy bilan ishlayveradi. Ya'ni AI — bezak emas, lekin u **hech qachon ilovani buzmaydi**. Bu nom ("Focus **AI**") va "Just **AI** It" jamoasiga ham mantiqan bog'lanadi.

**Texnik kreativlik — mustahkam taymer.** Taymer `setInterval` sanog'iga emas, balki **timestamp'larga** asoslangan: o'tgan vaqt = to'plangan + (hozir − boshlangan vaqt). Shu tufayli ilova yopilsa, sahifa yangilansa yoki telefon uxlasa ham vaqt **aniq** qoladi — drift bo'lmaydi. Bir nechta sessiya bir vaqtda mustaqil ishlay oladi. Bu — ko'pchilik shu yerda yiqiladigan tuzoqni yengib o'tish.

**Dizayn va his.** Yagona rang tizimi (coral·yashil·pushti·ko'k), ikki shrift (Anton sarlavha + Inter matn), yorug'/qorong'u rejim, kapsula kartalar, mikro-animatsiyalar, haptic va yengil ovoz. Uch til (o'zbek, rus, ingliz) va to'liq offline ishlash — barcha ma'lumot telefonda saqlanadi.

**Sifat qalqoni.** Loyiha 0 dependency bilan 109 ta avtomatik test bilan himoyalangan (TDD uslubida): taymer, telefon-yuztuban aniqlash, streak, AI fallback, har ekran sintaksisi va uch tilning to'liqligi tekshiriladi. Bu — kod sifatiga jiddiy yondashuvni ko'rsatadi.

Xulosa: Focus AI shunchaki "qildim" tugmasi emas — u vaqtni halol o'lchaydi, telefoningizni chetga qo'yishga undaydi, kun oxirida sizni qo'llab-quvvatlaydi va buni ishonchli, chiroyli, ko'p tilli, offline tarzda qiladi.
