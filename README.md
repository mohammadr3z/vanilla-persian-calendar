# تقویم شمسی مستقل (Persian Calendar Standalone)

یک کتابخانه جاوااسکریپت خالص (Vanilla JS)، سبک، مدرن و بدون هیچ وابستگی خارجی (Zero Dependencies) برای رندر کردن تقویم فارسی و شمسی به همراه قابلیت انتخاب زمان (ساعت و دقیقه)، اعمال محدودیت‌های تاریخی، تم تاریک و نمایش به صورت پاپ‌اور روی فیلدهای متنی ورودی فرم.

---

## ویژگی‌های برجسته
- 🚀 **بدون وابستگی**: ساخته شده با جاوااسکریپت خالص بدون نیاز به جی‌کوئری (jQuery)، بوت‌استرپ یا Moment.js.
- 🕒 **پشتیبانی از زمان**: انتخاب راحت ساعت و دقیقه به همراه تقویم.
- 🎨 **سفارشی‌سازی آسان**: استایل‌دهی مدرن با استفاده از متغیرهای CSS (CSS Custom Properties).
- 🌓 **تم تاریک پیش‌فرض**: سوئیچ خودکار بین حالت روشن و تاریک با پاس دادن یک آپشن.
- 📱 **کاملاً واکنش‌گرا**: نمایش بهینه‌سازی شده در صفحات نمایش موبایل و دسکتاپ.
- 🔒 **محدودیت زمانی**: پشتیبانی از تاریخ‌های حداقل (`minDate`) و حداکثر (`maxDate`).
- ✍️ **فرمت‌های مختلف**: امکان نمایش اعداد به صورت فارسی یا انگلیسی (ASCII) و فرمت‌بندی خروجی دلخواه.

---

## راهنمای راه‌اندازی سریع

برای استفاده، کافی است فایل‌های CSS و JS تقویم را به پروژه خود اضافه کنید:

```html
<!-- اضافه کردن استایل‌ها -->
<link rel="stylesheet" href="path/to/persian-calendar.css">

<!-- المان هدف برای نمایش تقویم یا فیلد ورودی -->
<input type="text" id="my-datepicker" placeholder="انتخاب تاریخ...">

<!-- اضافه کردن اسکریپت جاوااسکریپت -->
<script src="path/to/persian-calendar.js"></script>

<script>
  // مقداردهی اولیه به صورت پاپ‌اور روی فیلد ورودی
  new PersianCalendar(document.getElementById('my-datepicker'), {
    showTime: true,
    onDateSelect: function(data) {
      console.log('تاریخ انتخاب شده:', data);
    }
  });
</script>
```

---

## نمونه‌های استفاده مختلف

### ۱. تقویم زمان‌دار (فیلد پاپ‌اور به همراه زمان)
در این حالت، تقویم همراه با ساعت و دقیقه نمایش داده می‌شود:

```javascript
new PersianCalendar(document.getElementById('picker-timed'), {
  showTime: true,
  onDateSelect: (data) => {
    console.log("رشته تاریخ و زمان:", data.value);
  }
});
```

### ۲. تقویم بدون زمان (فقط تاریخ - پاپ‌اور)
با انتخاب این حالت، بخش ساعت و دقیقه پنهان شده و بلافاصله پس از کلیک روی روز، پاپ‌اور بسته می‌شود:

```javascript
new PersianCalendar(document.getElementById('picker-date-only'), {
  showTime: false
});
```

### ۳. محدودیت تاریخ (مثلاً فقط از امروز به بعد)
می‌توانید محدوده مجاز انتخاب تاریخ را با `minDate` و `maxDate` کنترل کنید. مقادیر می‌توانند شیء `Date` یا رشته `'today'` باشند:

```javascript
new PersianCalendar(document.getElementById('picker-limited'), {
  minDate: 'today', // غیرفعال کردن تاریخ‌های گذشته
  maxDate: new Date(2027, 11, 30) // حداکثر تا اواخر سال ۲۰۲۷ میلادی
});
```

### ۴. تقویم ثابت درجا (Inline)
اگر به جای فیلد ورودی، یک تگ `div` یا عنصر معمولی را پاس دهید، تقویم درجا رندر شده و همیشه باز می‌ماند:

```javascript
new PersianCalendar(document.getElementById('inline-container'), {
  showTime: true
});
```

### ۵. استفاده از تم تاریک (Dark Mode)
به راحتی با پاس دادن `theme: 'dark'` تم تاریک تقویم فعال می‌شود:

```javascript
new PersianCalendar(document.getElementById('dark-container'), {
  theme: 'dark',
  showTime: false
});
```

### ۶. فرمت دلخواه خروجی به همراه اعداد انگلیسی (ASCII)
مناسب برای زمانی که می‌خواهید تاریخ را با اعداد انگلیسی و با جداکننده دلخواه به سرور ارسال کنید:

```javascript
new PersianCalendar(document.getElementById('picker-custom'), {
  persianDigits: false, // استفاده از اعداد انگلیسی 0-9 به جای ۰-۹
  dateFormat: 'YYYY-MM-DD', // تغییر فرمت خروجی به صورت سال-ماه-روز
  showTime: false
});
```

### ۷. انتخاب بازه تاریخ رفت و برگشت (Range Picker)
اتصال دو فیلد تاریخ به یکدیگر. انتخاب تاریخ رفت، حداقل تاریخ فیلد برگشت را به صورت پویا تغییر می‌دهد:

```javascript
const startPicker = new PersianCalendar(document.getElementById('picker-start'), {
  showTime: false,
  onDateSelect: (data) => {
    // تغییر پویای حداقل تاریخ پایان به تاریخ شروع انتخاب شده
    endPicker.setOptions({ minDate: data.date });
  }
});

const endPicker = new PersianCalendar(document.getElementById('picker-end'), {
  showTime: false
});
```

### ۸. غیرفعال کردن روزهای خاص (مثال: جمعه‌ها تعطیل)
با استفاده از تابع `filterDate` می‌توان هر روز خاصی را فیلتر و غیرفعال کرد:

```javascript
new PersianCalendar(document.getElementById('picker-no-fridays'), {
  showTime: false,
  filterDate: (date) => {
    // 5 معادل روز جمعه در استاندارد JS Date است
    return date.getDay() !== 5; 
  }
});
```

---

## تنظیمات (Options API)

شما می‌توانید تنظیمات زیر را در پارامتر دوم ارسال کنید:

| نام پارامتر | نوع داده | مقدار پیش‌فرض | توضیحات |
| :--- | :--- | :--- | :--- |
| `selectedDate` | `Date` | `new Date()` | تاریخ اولیه انتخاب شده تقویم. |
| `showTime` | `Boolean` | `true` | نمایش یا عدم نمایش بخش ساعت و دقیقه. |
| `useIranTimezone` | `Boolean` | `false` | هماهنگ‌سازی مبدا تاریخ با منطقه زمانی ایران (۳:۳۰+). |
| `persianDigits` | `Boolean` | `true` | نمایش اعداد تقویم و خروجی فیلد به صورت فارسی. |
| `dateFormat` | `String` | `'YYYY/MM/DD'` | فرمت نمایش تاریخ (قابل شخصی‌سازی به فرمت‌هایی مثل `YYYY-MM-DD`). |
| `minDate` | `Date` \| `String` | `null` | حداقل تاریخ مجاز برای انتخاب. می‌تواند `'today'` یا شیء `Date` باشد. |
| `maxDate` | `Date` \| `String` | `null` | حداکثر تاریخ مجاز برای انتخاب. می‌تواند شیء `Date` باشد. |
| `theme` | `String` | `'light'` | پوسته تقویم. مقادیر مجاز: `'light'` یا `'dark'`. |
| `showCloseButton` | `Boolean` | `true` (برای پاپ‌اور) | نمایش دکمه ضربدر بستن تقویم در بالا. |
| `altInput` | `Boolean` | `false` | فعال‌سازی فیلد ثانویه خوانا برای نمایش به کاربر در حالیکه فیلد اصلی با دیتای تمیز ذخیره می‌شود. |
| `altFormat` | `String` | `null` | فرمت نمایش فیلد خوانای ثانویه (در صورت نال، یک عبارت فارسی بسیار شکیل مانند "پنجشنبه، ۱۲ مرداد ۱۴۰۲" تولید می‌شود). |
| `filterDate` | `Function` | `null` | تابع بررسی روزها. اگر مقدار `false` برگرداند آن روز غیرفعال می‌شود. |
| `onDateSelect` | `Function` | `function` | رویداد پس از انتخاب تاریخ (حاوی داده‌های بازگشتی). |
| `onClose` | `Function` | `function` | رویداد پس از بسته شدن پاپ‌اور تقویم. |

---

## متدهای عمومی (Public Methods)

پس از کلاس‌دهی اولیه، متدهای زیر در دسترس هستند:

### `setOptions(newOptions)`
تغییر تنظیمات تقویم به صورت داینامیک پس از لود شدن (مانند تغییر `minDate` یا `theme`):
```javascript
const calendar = new PersianCalendar(element, options);
calendar.setOptions({ minDate: new Date() });
```

### `getSelectedDate()`
بازگرداندن تاریخ انتخاب شده به صورت شیء استاندارد `Date` میلادی:
```javascript
const dateObj = calendar.getSelectedDate();
```

---

## داده‌های بازگشتی رویداد `onDateSelect`

هنگامی که کاربر تاریخی را انتخاب می‌کند، رویداد `onDateSelect` فراخوانی شده و یک شیء با ساختار زیر ارسال می‌کند:

```javascript
{
  value: "۱۴۰۲/۰۵/۱۲ ۱۲:۳۰",      // رشته تاریخ فرمت شده دیتابیس (dateFormat)
  altValue: "پنجشنبه، ۱۲ مرداد ۱۴۰۲ ساعت ۱۲:۳۰", // رشته تاریخ خوانای کاربر (altInput)
  jalali: {                      // جزئیات تاریخ شمسی
    year: 1402,
    month: 5,
    day: 12
  },
  gregorian: {                   // جزئیات تاریخ میلادی معادل
    year: 2023,
    month: 8,
    day: 3
  },
  time: {                        // زمان انتخاب شده
    hour: 12,
    minute: 30
  },
  date: DateObject               // شیء استاندارد جاوااسکریپت (Date) معادل
}
```

---

## سفارشی‌سازی استایل (CSS Custom Variables)

برای شخصی‌سازی رنگ‌ها و فونت تقویم به راحتی می‌توانید متغیرهای زیر را در استایل پروژه خود بازنویسی کنید:

```css
:root {
  --pc-font: 'Vazirmatn', sans-serif; /* فونت تقویم */
  --pc-primary: #4f46e5;             /* رنگ اصلی دکمه‌ها و روز انتخاب شده */
  --pc-primary-hover: #4338ca;       /* رنگ هاور دکمه‌های اصلی */
  --pc-primary-light: #eef2ff;       /* رنگ پس‌زمینه روز هاور شده */
  --pc-radius-lg: 16px;              /* میزان گردی گوشه‌های تقویم */
  --pc-bg: #ffffff;                  /* پس‌زمینه تقویم */
  --pc-text: #0f172a;                /* رنگ نوشته‌های اصلی */
}
```

---

## توسعه و مشارکت

این پروژه به صورت متن‌باز منتشر شده است. برای ثبت گزارش خطا، پیشنهاد ویژگی جدید یا مشارکت در توسعه، می‌توانید به مخزن گیت‌هاب مراجعه کنید:

🔗 **مخزن گیت‌هاب:** [vanilla-persian-calendar](https://github.com/mohammadr3z/vanilla-persian-calendar)
👤 **توسعه‌دهنده:** [@mohammadr3z](https://github.com/mohammadr3z)
