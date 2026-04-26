# راهنمای ساخت CRM در Airtable

## گام ۱ — ساخت اکانت رایگان

1. برو به **airtable.com**
2. روی **"Sign up for free"** کلیک کن
3. با ایمیل یا Google ثبت‌نام کن
4. پلن رایگان (Free) انتخاب کن — برای الان کافیه

---

## گام ۲ — ساخت Base جدید

1. بعد از ورود، روی **"+ Create"** کلیک کن
2. **"Start from scratch"** رو انتخاب کن
3. اسمش رو بذار: `DirectKey CRM`
4. روی **"Create"** کلیک کن

---

## گام ۳ — گرفتن Base ID

URL آدرس رو نگاه کن — یه چیزی مثل این میبینی:
```
https://airtable.com/appXXXXXXXXXXXXXX/tblYYYYYY/...
```

**Base ID** همون بخشیه که با `app` شروع میشه (مثلاً `appXXXXXXXXXXXXXX`).
اون رو کپی کن.

---

## گام ۴ — گرفتن Personal Access Token

1. برو به: **airtable.com/create/tokens**
2. روی **"+ Create token"** کلیک کن
3. یه اسم بذار: `DirectKey CRM Token`
4. توی **Scopes** این ۳ تا رو انتخاب کن:
   - ✅ `data.records:read`
   - ✅ `data.records:write`
   - ✅ `schema.bases:write`
   - ✅ `schema.bases:read`
5. توی **Access** گزینه **"All current and future bases"** رو انتخاب کن
6. روی **"Create token"** کلیک کن
7. **Token رو کپی کن** (فقط یه بار نشون داده میشه!)

---

## گام ۵ — اجرای Script

توی ترمینال پروژه بنویس:

**Windows:**
```cmd
set AIRTABLE_TOKEN=your_token_here
set AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
node scripts/airtable-setup.js
```

**Mac/Linux:**
```bash
AIRTABLE_TOKEN=your_token_here AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX node scripts/airtable-setup.js
```

---

## گام ۶ — اضافه کردن به .env.local

بعد از اجرای موفق script، این خطوط رو به `.env.local` اضافه کن:

```env
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
AIRTABLE_TOKEN=patXXXXXXXXXXXXXXX
```

---

## بعد از Setup — چی می‌بینی؟

وقتی base رو باز کنی این جدول‌ها رو داری:

### 📋 Leads
پایپ‌لاین اصلی فروش — هر لید یه ردیفه با:
- وضعیت: Cold → Mid → Hot → Booked → Sold
- امتیاز: ۱ تا ۱۰ ستاره
- زبان، بودجه، هدف خرید
- تاریخ follow-up
- خلاصه مکالمه SARA

### 📝 Interactions  
لاگ هر تماسی که با لید داشتی:
- WhatsApp، ایمیل، تلفن، بازدید
- SARA انجام داد یا انسان؟
- نتیجه چی شد؟

### 🏠 Projects
پروژه‌های ملکی:
- شهر، قیمت، وضعیت
- واحدهای موجود

---

## View های پیشنهادی در Airtable

بعد از setup، این View ها رو بساز:

1. **Kanban Pipeline** — Group by: Status → مثل Trello
2. **Follow-up Calendar** — Calendar by: Next Follow-up → چه روزی کی رو باید follow کنی
3. **Hot Leads** — Filter: Status = Hot OR Booked → فوری‌ترین‌ها
4. **SARA Queue** — Filter: Requires Human = true → کی نیاز به دخالت داری
5. **This Week** — Filter: Next Follow-up = this week

---

## بعدی چیه؟

بعد از setup CRM:
1. ➡️ API route در Next.js بسازیم که لیدهای فرم سایت رو به Airtable بفرسته
2. ➡️ 360dialog تنظیم کنیم برای WhatsApp Business API
3. ➡️ SARA رو وصل کنیم به Claude API
4. ➡️ Notification system بسازیم

