/**
 * Persian Calendar Standalone Component
 * A lightweight, dependency-free Jalali calendar library.
 * Supports inline rendering, input picker popover, min/max constraints, time picker, and dark mode.
 */
(function () {
  'use strict';

  // Date Converter Functions
  const G_DAYS_IN_MONTH_NON_LEAP = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const JALALI_EPOCH_DIFFERENCE = 355666;
  const JALALI_33_YEAR_CYCLE_DAYS = 12053;
  const GREGORIAN_4_YEAR_CYCLE_DAYS = 1461;
  const JALALI_YEAR_START_OFFSET = -1595;
  const GREGORIAN_EPOCH_DIFFERENCE = -355668;
  const JALALI_33_YEAR_CYCLE_LEAP_DAYS = 8;
  const GREGORIAN_400_YEAR_CYCLE_DAYS = 146097;
  const GREGORIAN_100_YEAR_CYCLE_DAYS = 36524;

  const isValidGregorian = (gy, gm, gd) => {
    if (!Number.isInteger(gy) || !Number.isInteger(gm) || !Number.isInteger(gd)) return false;
    if (gy < 1 || gy > 3000 || gm < 1 || gm > 12 || gd < 1 || gd > 31) return false;
    return true;
  };

  const gregorianToJalali = (gy, gm, gd) => {
    if (!isValidGregorian(gy, gm, gd)) return [0, 0, 0];
    const gy2 = gm > 2 ? (gy + 1) : gy;
    let days = JALALI_EPOCH_DIFFERENCE + (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + G_DAYS_IN_MONTH_NON_LEAP[gm - 1];
    let jy = JALALI_YEAR_START_OFFSET + 33 * Math.floor(days / JALALI_33_YEAR_CYCLE_DAYS);
    days %= JALALI_33_YEAR_CYCLE_DAYS;
    jy += 4 * Math.floor(days / GREGORIAN_4_YEAR_CYCLE_DAYS);
    days %= GREGORIAN_4_YEAR_CYCLE_DAYS;
    if (days > 365) {
      jy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }
    let jm, jd;
    if (days < 186) {
      jm = 1 + Math.floor(days / 31);
      jd = 1 + (days % 31);
    } else {
      jm = 7 + Math.floor((days - 186) / 30);
      jd = 1 + ((days - 186) % 30);
    }
    return [jy, jm, jd];
  };

  const isValidJalali = (jy, jm, jd) => {
    if (!Number.isInteger(jy) || !Number.isInteger(jm) || !Number.isInteger(jd)) return false;
    if (jy < 1 || jy > 3000 || jm < 1 || jm > 12 || jd < 1 || jd > 31) return false;
    return true;
  };

  const jalaliToGregorian = (jy, jm, jd) => {
    if (!isValidJalali(jy, jm, jd)) return [0, 0, 0];
    const jy_adj = jy + 1595;
    let days = GREGORIAN_EPOCH_DIFFERENCE + (365 * jy_adj) + (Math.floor(jy_adj / 33) * JALALI_33_YEAR_CYCLE_LEAP_DAYS) + Math.floor(((jy_adj % 33) + 3) / 4) + jd;
    if (jm < 7) {
      days += (jm - 1) * 31;
    } else {
      days += (jm - 7) * 30 + 186;
    }
    let gy = 400 * Math.floor(days / GREGORIAN_400_YEAR_CYCLE_DAYS);
    days %= GREGORIAN_400_YEAR_CYCLE_DAYS;
    if (days > GREGORIAN_100_YEAR_CYCLE_DAYS) {
      gy += 100 * Math.floor(--days / GREGORIAN_100_YEAR_CYCLE_DAYS);
      days %= GREGORIAN_100_YEAR_CYCLE_DAYS;
      if (days >= 365) days++;
    }
    gy += 4 * Math.floor(days / GREGORIAN_4_YEAR_CYCLE_DAYS);
    days %= GREGORIAN_4_YEAR_CYCLE_DAYS;
    if (days > 365) {
      gy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }
    let gd = days + 1;
    const isLeap = ((gy % 4 === 0) && (gy % 100 !== 0)) || (gy % 400 === 0);
    const G_DAYS_IN_MONTH = [0, 31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let gm;
    for (gm = 1; gm <= 12; gm++) {
      if (gd <= G_DAYS_IN_MONTH[gm]) break;
      gd -= G_DAYS_IN_MONTH[gm];
    }
    return [gy, gm, gd];
  };

  // Helper Utility Functions
  const safeParseInt = (value, defaultValue = 0, min = null, max = null) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) return defaultValue;
    if (min !== null && parsed < min) return min;
    if (max !== null && parsed > max) return max;
    return parsed;
  };

  const isValidJalaliDate = (year, month, day) => {
    return year >= 1 && year <= 3000 && month >= 1 && month <= 12 && day >= 1 && day <= 31;
  };

  const padZero = (num) => String(num).padStart(2, '0');

  // Constants
  const PERSIAN_MONTHS = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
  const PERSIAN_WEEKDAYS = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
  const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

  const toPersianDigits = (str) => String(str).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[d]);
  const toAsciiDigits = (str) => String(str).replace(/[۰-۹]/g, (d) => PERSIAN_DIGITS.indexOf(d).toString());

  const getDaysInJalaliMonth = (jy, jm) => {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    const leapYears = [1, 5, 9, 13, 17, 22, 26, 30];
    return leapYears.includes(jy % 33) ? 30 : 29;
  };

  // Helper to format date
  const formatDate = (jy, jm, jd, hour, minute, showTime, format, usePersian) => {
    let formatted = format || (showTime ? 'YYYY/MM/DD HH:mm' : 'YYYY/MM/DD');
    formatted = formatted
      .replace('YYYY', jy)
      .replace('MM', padZero(jm))
      .replace('DD', padZero(jd));
    if (showTime) {
      formatted = formatted
        .replace('HH', padZero(hour))
        .replace('mm', padZero(minute));
    }
    return usePersian ? toPersianDigits(formatted) : formatted;
  };

  const PERSIAN_WEEKDAYS_LONG = ['یکشنبه', 'دوشنبه', 'سه شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];

  // Helper to format alt (readable Persian) date
  const formatAltDate = (jy, jm, jd, jsDay, hour, minute, showTime, format, usePersian) => {
    if (format) {
      return formatDate(jy, jm, jd, hour, minute, showTime, format, usePersian);
    }
    const weekdayName = PERSIAN_WEEKDAYS_LONG[jsDay];
    const monthName = PERSIAN_MONTHS[jm - 1];
    const datePart = `${weekdayName}، ${usePersian ? toPersianDigits(jd) : jd} ${monthName} ${usePersian ? toPersianDigits(jy) : jy}`;
    if (showTime) {
      return `${datePart} ساعت ${usePersian ? toPersianDigits(padZero(hour)) : padZero(hour)}:${usePersian ? toPersianDigits(padZero(minute)) : padZero(minute)}`;
    }
    return datePart;
  };

  // Helper to parse Jalali date string
  const parseJalaliString = (str) => {
    if (!str) return null;
    const asciiStr = toAsciiDigits(str);
    const parts = asciiStr.match(/\d+/g);
    if (!parts || parts.length < 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    let hour = 0, minute = 0;
    if (parts.length >= 5) {
      hour = parseInt(parts[3], 10);
      minute = parseInt(parts[4], 10);
    }
    if (isValidJalaliDate(year, month, day)) {
      return { year, month, day, hour, minute };
    }
    return null;
  };

  class PersianCalendar {
    /**
     * Creates a new instance of PersianCalendar
     * @param {HTMLElement|HTMLInputElement} targetElement - The element to render the calendar in or input element to bind to
     * @param {Object} options - Configuration options
     */
    constructor(targetElement, options = {}) {
      if (!targetElement || !(targetElement instanceof Element)) {
        throw new Error('PersianCalendar: Invalid target element');
      }

      this.isInput = targetElement instanceof HTMLInputElement;
      this.inputElement = this.isInput ? targetElement : null;
      this.container = this.isInput ? null : targetElement;

      this.options = {
        selectedDate: (options.selectedDate instanceof Date) ? options.selectedDate : new Date(),
        onDateSelect: (typeof options.onDateSelect === 'function') ? options.onDateSelect : () => { },
        showTime: (typeof options.showTime === 'boolean') ? options.showTime : true,
        useIranTimezone: (typeof options.useIranTimezone === 'boolean') ? options.useIranTimezone : false,
        persianDigits: (typeof options.persianDigits === 'boolean') ? options.persianDigits : true,
        dateFormat: options.dateFormat || null,
        minDate: options.minDate || null,
        maxDate: options.maxDate || null,
        rangeStart: options.rangeStart || null,
        rangeEnd: options.rangeEnd || null,
        altInput: (typeof options.altInput === 'boolean') ? options.altInput : false,
        altFormat: options.altFormat || null,
        onClose: (typeof options.onClose === 'function') ? options.onClose : () => { },
        theme: options.theme || 'light', // 'light' or 'dark'
        showCloseButton: (typeof options.showCloseButton === 'boolean') ? options.showCloseButton : this.isInput,
        ...options
      };

      // Set initial date/time values
      let initialDate = this.options.selectedDate;

      // Adjust for Iran timezone if specified
      if (this.options.useIranTimezone) {
        const iranOffsetMinutes = 210;
        const browserOffsetMinutes = -initialDate.getTimezoneOffset();
        const diffMinutes = iranOffsetMinutes - browserOffsetMinutes;
        initialDate = new Date(initialDate.getTime() + diffMinutes * 60 * 1000);
      }

      // Try to parse existing value from the input field
      let parsedDate = null;
      if (this.isInput && this.inputElement.value) {
        parsedDate = parseJalaliString(this.inputElement.value);
      }

      if (parsedDate) {
        this.currentYear = parsedDate.year;
        this.currentMonth = parsedDate.month;
        this.selectedDate = { year: parsedDate.year, month: parsedDate.month, day: parsedDate.day };
        this.selectedTime = { hour: parsedDate.hour, minute: parsedDate.minute };
      } else {
        const [jy, jm, jd] = gregorianToJalali(initialDate.getFullYear(), initialDate.getMonth() + 1, initialDate.getDate());
        this.currentYear = jy;
        this.currentMonth = jm;
        this.selectedDate = { year: jy, month: jm, day: jd };
        this.selectedTime = {
          hour: initialDate.getHours(),
          minute: initialDate.getMinutes()
        };
      }

      // Initialize DOM structure
      this.initDOM();
      this.attachEventListeners();
    }

    initDOM() {
      if (this.isInput) {
        // Handle altInput setup
        if (this.options.altInput) {
          this.inputElement.style.display = 'none';
          this.altInputElement = document.createElement('input');
          this.altInputElement.type = 'text';
          this.altInputElement.className = this.inputElement.className;
          this.altInputElement.placeholder = this.inputElement.placeholder;
          this.altInputElement.readOnly = true;
          this.inputElement.parentNode.insertBefore(this.altInputElement, this.inputElement.nextSibling);
        }

        // Create popover calendar
        this.popover = document.createElement('div');
        this.popover.className = `persian-calendar-wrapper persian-calendar-popover`;
        if (this.options.theme === 'dark') {
          this.popover.classList.add('persian-calendar-dark');
        }
        document.body.appendChild(this.popover);
        this.calendarWrapper = this.popover;
      } else {
        // Render inline inside container
        this.container.textContent = '';
        const wrapper = document.createElement('div');
        wrapper.className = 'persian-calendar-wrapper';
        if (this.options.theme === 'dark') {
          wrapper.classList.add('persian-calendar-dark');
        }
        this.container.appendChild(wrapper);
        this.calendarWrapper = wrapper;
      }

      this.renderStructure();
      this.cacheDOMElements();
      this.updateCalendarView();
    }

    renderStructure() {
      // Header
      const header = document.createElement('div');
      header.className = 'persian-calendar-header';
      
      const title = document.createElement('h3');
      title.className = 'persian-calendar-title';
      title.textContent = this.isInput ? 'انتخاب تاریخ' : 'تقویم';
      header.appendChild(title);

      const actions = document.createElement('div');
      actions.className = 'persian-calendar-header-actions';

      const nowBtn = document.createElement('button');
      nowBtn.className = 'persian-calendar-now-btn';
      nowBtn.type = 'button';
      nowBtn.textContent = 'اکنون';
      actions.appendChild(nowBtn);

      if (this.options.showCloseButton) {
        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'persian-calendar-close-btn';
        closeBtn.setAttribute('aria-label', 'بستن');
        closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M12 13.06l3.712 3.713 1.061-1.06L13.061 12l3.712-3.712-1.06-1.06L12 10.938 8.288 7.227l-1.061 1.06L10.939 12l-3.712 3.712 1.06 1.061L12 13.061z"></path></svg>';
        actions.appendChild(closeBtn);
      }

      header.appendChild(actions);
      this.calendarWrapper.appendChild(header);

      // Time picker
      if (this.options.showTime) {
        const timeTitle = document.createElement('div');
        timeTitle.className = 'persian-calendar-time-title';
        timeTitle.textContent = 'زمان';
        this.calendarWrapper.appendChild(timeTitle);

        const timeContainer = document.createElement('div');
        timeContainer.className = 'persian-calendar-time';
        timeContainer.innerHTML = `
          <div class="persian-calendar-time-inputs">
            <input type="number" class="persian-calendar-hour" min="0" max="23" value="${padZero(this.selectedTime.hour)}">
            <span>:</span>
            <input type="number" class="persian-calendar-minute" min="0" max="59" value="${padZero(this.selectedTime.minute)}">
          </div>
        `;
        this.calendarWrapper.appendChild(timeContainer);
      }

      // Date Picker Section
      const datePicker = document.createElement('div');
      datePicker.className = 'persian-calendar-date-picker';

      const dateTitle = document.createElement('div');
      dateTitle.className = 'persian-calendar-date-title';
      dateTitle.textContent = 'تاریخ';
      datePicker.appendChild(dateTitle);

      // Month/Year inputs
      const monthYear = document.createElement('div');
      monthYear.className = 'persian-calendar-month-year';
      
      const dayInput = document.createElement('input');
      dayInput.type = 'text';
      dayInput.className = 'persian-calendar-day-display';
      dayInput.value = toPersianDigits(this.selectedDate.day);
      dayInput.maxLength = 2;
      monthYear.appendChild(dayInput);

      const monthSelect = document.createElement('select');
      monthSelect.className = 'persian-calendar-month';
      monthSelect.innerHTML = PERSIAN_MONTHS.map((month, index) =>
        `<option value="${index + 1}"${(index + 1) === this.currentMonth ? ' selected' : ''}>${month}</option>`
      ).join('');
      monthYear.appendChild(monthSelect);

      const yearInput = document.createElement('input');
      yearInput.type = 'text';
      yearInput.className = 'persian-calendar-year-display';
      yearInput.value = toPersianDigits(this.currentYear);
      yearInput.maxLength = 4;
      monthYear.appendChild(yearInput);

      datePicker.appendChild(monthYear);

      // Navigation Bar
      const nav = document.createElement('div');
      nav.className = 'persian-calendar-nav';
      nav.innerHTML = `
        <button class="persian-calendar-prev" type="button">‹</button>
        <span class="persian-calendar-current-month">${PERSIAN_MONTHS[this.currentMonth - 1]} ${toPersianDigits(this.currentYear)}</span>
        <button class="persian-calendar-next" type="button">›</button>
      `;
      datePicker.appendChild(nav);

      // Grid for Days
      const grid = document.createElement('div');
      grid.className = 'persian-calendar-grid';
      grid.innerHTML = `
        <div class="persian-calendar-weekdays">
          ${PERSIAN_WEEKDAYS.map(day => `<div class="persian-calendar-weekday">${day}</div>`).join('')}
        </div>
        <div class="persian-calendar-days"></div>
      `;
      datePicker.appendChild(grid);

      this.calendarWrapper.appendChild(datePicker);
    }

    cacheDOMElements() {
      this.dom = {
        monthSelect: this.calendarWrapper.querySelector('.persian-calendar-month'),
        dayInput: this.calendarWrapper.querySelector('.persian-calendar-day-display'),
        yearInput: this.calendarWrapper.querySelector('.persian-calendar-year-display'),
        currentMonthText: this.calendarWrapper.querySelector('.persian-calendar-current-month'),
        daysContainer: this.calendarWrapper.querySelector('.persian-calendar-days'),
        hourInput: this.calendarWrapper.querySelector('.persian-calendar-hour'),
        minuteInput: this.calendarWrapper.querySelector('.persian-calendar-minute')
      };
    }

    createDaysFragment() {
      const daysInMonth = getDaysInJalaliMonth(this.currentYear, this.currentMonth);
      const [gy, gm, gd] = jalaliToGregorian(this.currentYear, this.currentMonth, 1);
      // jsDay is Sunday=0, Monday=1, ..., Saturday=6
      const jsDay = new Date(Date.UTC(gy, gm - 1, gd)).getUTCDay();
      // startDay converts JS day to Persian day index: Saturday=0, Sunday=1, ..., Friday=6
      const startDay = (jsDay + 1) % 7;

      let today = new Date();
      if (this.options.useIranTimezone) {
        const iranOffsetMinutes = 210;
        const browserOffsetMinutes = -today.getTimezoneOffset();
        const diffMinutes = iranOffsetMinutes - browserOffsetMinutes;
        today = new Date(today.getTime() + diffMinutes * 60 * 1000);
      }
      const [todayJy, todayJm, todayJd] = gregorianToJalali(today.getFullYear(), today.getMonth() + 1, today.getDate());
      const isTodayMonth = (this.currentMonth === todayJm && this.currentYear === todayJy);
      const isSelectedMonth = (this.currentMonth === this.selectedDate.month && this.currentYear === this.selectedDate.year);

      // Parse date boundaries
      let minDateObj = null;
      if (this.options.minDate === 'today' || this.options.minDate === 'current' || this.options.minDate === 'now') {
        minDateObj = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      } else if (this.options.minDate instanceof Date) {
        minDateObj = new Date(this.options.minDate.getFullYear(), this.options.minDate.getMonth(), this.options.minDate.getDate());
      }

      let maxDateObj = null;
      if (this.options.maxDate === 'today' || this.options.maxDate === 'current' || this.options.maxDate === 'now') {
        maxDateObj = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      } else if (this.options.maxDate instanceof Date) {
        maxDateObj = new Date(this.options.maxDate.getFullYear(), this.options.maxDate.getMonth(), this.options.maxDate.getDate());
      }

      // Setup range calculations
      const compareDateOnly = (d1, d2) => {
        if (!d1 || !d2) return false;
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
      };

      const fragment = document.createDocumentFragment();

      // Leading empty day slots
      for (let i = 0; i < startDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'persian-calendar-day empty';
        fragment.appendChild(emptyDay);
      }

      // Populate month days
      for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'persian-calendar-day';
        dayElement.setAttribute('data-day', day.toString());
        dayElement.textContent = this.options.persianDigits ? toPersianDigits(day) : day;

        // Verify bounds
        let isDisabled = false;
        const [dgy, dgm, dgd] = jalaliToGregorian(this.currentYear, this.currentMonth, day);
        const currentDayDate = new Date(dgy, dgm - 1, dgd);

        if (minDateObj && currentDayDate < minDateObj) {
          isDisabled = true;
        }
        if (maxDateObj && currentDayDate > maxDateObj) {
          isDisabled = true;
        }
        if (typeof this.options.filterDate === 'function' && !this.options.filterDate(currentDayDate, { year: this.currentYear, month: this.currentMonth, day: day })) {
          isDisabled = true;
        }

        if (isDisabled) {
          dayElement.classList.add('disabled');
        } else {
          if (isTodayMonth && day === todayJd) dayElement.classList.add('today');
          if (isSelectedMonth && day === this.selectedDate.day) dayElement.classList.add('selected');

          // Apply static range styles
          if (this.options.rangeStart) {
            const rStart = new Date(this.options.rangeStart.getFullYear(), this.options.rangeStart.getMonth(), this.options.rangeStart.getDate());
            const isRangeStart = compareDateOnly(currentDayDate, rStart);
            if (isRangeStart) dayElement.classList.add('range-start');

            if (this.options.rangeEnd) {
              const rEnd = new Date(this.options.rangeEnd.getFullYear(), this.options.rangeEnd.getMonth(), this.options.rangeEnd.getDate());
              const isRangeEnd = compareDateOnly(currentDayDate, rEnd);
              if (isRangeEnd) dayElement.classList.add('range-end');

              if (currentDayDate > rStart && currentDayDate < rEnd) {
                dayElement.classList.add('in-range');
              }
            }
          }
        }

        fragment.appendChild(dayElement);
      }

      return fragment;
    }

    attachEventListeners() {
      // Handle interactive click elements on wrapper
      this.calendarWrapper.addEventListener('click', (e) => {
        const target = e.target;
        if (target.matches('.persian-calendar-day:not(.empty):not(.disabled)')) {
          const day = safeParseInt(target.dataset.day, 1, 1, 31);
          if (isValidJalaliDate(this.currentYear, this.currentMonth, day)) {
            this.selectDate(this.currentYear, this.currentMonth, day);
          }
        } else if (target.matches('.persian-calendar-prev')) {
          this.previousMonth();
        } else if (target.matches('.persian-calendar-next')) {
          this.nextMonth();
        } else if (target.matches('.persian-calendar-now-btn')) {
          this.setToNow();
        } else if (target.matches('.persian-calendar-close-btn') || target.closest('.persian-calendar-close-btn')) {
          this.close();
        }
      });

      // Mouse hover event listeners for dynamic range preview
      if (this.dom.daysContainer) {
        this.dom.daysContainer.addEventListener('mouseover', (e) => {
          const target = e.target;
          if (target.matches('.persian-calendar-day:not(.empty):not(.disabled)')) {
            const day = safeParseInt(target.dataset.day, 0);
            if (day > 0) {
              this.handleDayHover(day);
            }
          }
        });

        this.dom.daysContainer.addEventListener('mouseleave', () => {
          this.clearHoverRange();
        });
      }

      // Month select dropdown handler
      if (this.dom.monthSelect) {
        this.dom.monthSelect.addEventListener('change', (e) => {
          const month = safeParseInt(e.target.value, 1, 1, 12);
          if (isValidJalaliDate(this.currentYear, month, this.selectedDate.day)) {
            this.currentMonth = month;
            this.updateCalendarView();
          }
        });
      }

      // Key/change listeners helper
      const setupInput = (input, onChange) => {
        input.addEventListener('change', onChange);
        input.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            e.preventDefault();
            const step = e.key === 'ArrowUp' ? 1 : -1;
            const currentVal = safeParseInt(toAsciiDigits(input.value), 0);
            input.value = currentVal + step;
            onChange({ target: input });
          }
        });
      };

      // Day input field
      if (this.dom.dayInput) {
        setupInput(this.dom.dayInput, (e) => {
          const day = safeParseInt(toAsciiDigits(e.target.value), 1, 1, 31);
          const daysInMonth = getDaysInJalaliMonth(this.currentYear, this.currentMonth);
          if (day <= daysInMonth && isValidJalaliDate(this.currentYear, this.currentMonth, day)) {
            this.selectedDate.day = day;
            this.updateCalendarView();
            this.notifyDateChange();
          } else {
            e.target.value = this.options.persianDigits ? toPersianDigits(this.selectedDate.day) : this.selectedDate.day;
          }
        });
      }

      // Year input field
      if (this.dom.yearInput) {
        setupInput(this.dom.yearInput, (e) => {
          const year = safeParseInt(toAsciiDigits(e.target.value), 1400, 1, 3000);
          if (isValidJalaliDate(year, this.currentMonth, this.selectedDate.day)) {
            this.currentYear = year;
            this.updateCalendarView();
          } else {
            e.target.value = this.options.persianDigits ? toPersianDigits(this.currentYear) : this.currentYear;
          }
        });
      }

      // Time inputs
      if (this.options.showTime && this.dom.hourInput && this.dom.minuteInput) {
        setupInput(this.dom.hourInput, (e) => {
          const hour = safeParseInt(e.target.value, 0, 0, 23);
          this.selectedTime.hour = hour;
          e.target.value = padZero(hour);
          this.notifyDateChange();
        });

        setupInput(this.dom.minuteInput, (e) => {
          const minute = safeParseInt(e.target.value, 0, 0, 59);
          this.selectedTime.minute = minute;
          e.target.value = padZero(minute);
          this.notifyDateChange();
        });
      }

      // Popover Mode Event Listeners
      if (this.isInput) {
        const triggerEl = this.altInputElement || this.inputElement;

        // Toggle calendar visible on input focus/click
        triggerEl.addEventListener('focus', () => this.open());
        triggerEl.addEventListener('click', (e) => {
          e.stopPropagation();
          this.open();
        });

        // Close on clicking outside the input/calendar
        document.addEventListener('click', (e) => {
          if (!triggerEl.contains(e.target) && !this.popover.contains(e.target)) {
            this.close();
          }
        });

        // Listen for scroll & window resize to adjust popover location
        window.addEventListener('resize', () => {
          if (this.popover.classList.contains('active')) {
            this.positionPopover();
          }
        });

        window.addEventListener('scroll', () => {
          if (this.popover.classList.contains('active')) {
            this.positionPopover();
          }
        }, true);
      }
    }

    open() {
      if (!this.isInput) return;
      this.popover.classList.add('active');
      this.positionPopover();
    }

    close() {
      if (!this.isInput) return;
      if (this.popover.classList.contains('active')) {
        this.popover.classList.remove('active');
        this.options.onClose();
      }
    }

    positionPopover() {
      if (!this.isInput || !this.popover) return;
      const triggerEl = this.altInputElement || this.inputElement;
      const rect = triggerEl.getBoundingClientRect();
      const popoverRect = this.popover.getBoundingClientRect();
      
      let top = rect.bottom + window.scrollY;
      let left = (rect.right - popoverRect.width) + window.scrollX; // Align to the right bounds of the input (RTL behavior)
      
      // Boundary check left side
      if (left < window.scrollX) {
        left = rect.left + window.scrollX;
      }
      
      // Boundary check screen width
      if (left + popoverRect.width > window.innerWidth + window.scrollX) {
        left = window.innerWidth + window.scrollX - popoverRect.width - 10;
      }

      // Boundary check vertical (flip popover up if no room below)
      const viewportHeight = window.innerHeight;
      if (rect.bottom + popoverRect.height > viewportHeight + window.scrollY && rect.top - popoverRect.height > window.scrollY) {
        top = rect.top - popoverRect.height + window.scrollY;
      }

      this.popover.style.top = `${top}px`;
      this.popover.style.left = `${left}px`;
    }

    selectDate(year, month, day) {
      this.selectedDate = { year, month, day };
      this.updateCalendarView();
      this.notifyDateChange();
      
      // Auto close popover if time picker is not displayed
      if (this.isInput && !this.options.showTime) {
        this.close();
      }
    }

    previousMonth() {
      this.currentMonth--;
      if (this.currentMonth < 1) {
        this.currentMonth = 12;
        this.currentYear--;
      }
      this.updateCalendarView();
    }

    nextMonth() {
      this.currentMonth++;
      if (this.currentMonth > 12) {
        this.currentMonth = 1;
        this.currentYear++;
      }
      this.updateCalendarView();
    }

    setToNow() {
      let now = new Date();
      if (this.options.useIranTimezone) {
        const iranOffsetMinutes = 210;
        const browserOffsetMinutes = -now.getTimezoneOffset();
        const diffMinutes = iranOffsetMinutes - browserOffsetMinutes;
        now = new Date(now.getTime() + diffMinutes * 60 * 1000);
      }

      const [jy, jm, jd] = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
      this.currentYear = jy;
      this.currentMonth = jm;
      this.selectedDate = { year: jy, month: jm, day: jd };
      this.selectedTime = {
        hour: now.getHours(),
        minute: now.getMinutes()
      };

      this.updateCalendarView();
      this.updateTimeDisplay();
      this.notifyDateChange();
    }

    updateCalendarView() {
      if (this.dom.monthSelect) this.dom.monthSelect.value = this.currentMonth;
      if (this.dom.dayInput) this.dom.dayInput.value = this.options.persianDigits ? toPersianDigits(this.selectedDate.day) : this.selectedDate.day;
      if (this.dom.yearInput) this.dom.yearInput.value = this.options.persianDigits ? toPersianDigits(this.currentYear) : this.currentYear;
      if (this.dom.currentMonthText) {
        this.dom.currentMonthText.textContent = `${PERSIAN_MONTHS[this.currentMonth - 1]} ${this.options.persianDigits ? toPersianDigits(this.currentYear) : this.currentYear}`;
      }

      if (this.dom.daysContainer) {
        this.dom.daysContainer.textContent = '';
        this.dom.daysContainer.appendChild(this.createDaysFragment());
      }
    }

    updateTimeDisplay() {
      if (!this.options.showTime) return;
      if (this.dom.hourInput) this.dom.hourInput.value = padZero(this.selectedTime.hour);
      if (this.dom.minuteInput) this.dom.minuteInput.value = padZero(this.selectedTime.minute);
    }

    notifyDateChange() {
      const [gy, gm, gd] = jalaliToGregorian(this.selectedDate.year, this.selectedDate.month, this.selectedDate.day);
      const gregorianDate = new Date(gy, gm - 1, gd, this.selectedTime.hour, this.selectedTime.minute);

      const formatted = formatDate(
        this.selectedDate.year,
        this.selectedDate.month,
        this.selectedDate.day,
        this.selectedTime.hour,
        this.selectedTime.minute,
        this.options.showTime,
        this.options.dateFormat,
        this.options.persianDigits
      );

      // Write output back to standard input elements if bound
      if (this.isInput) {
        this.inputElement.value = formatted;
        this.inputElement.dispatchEvent(new Event('change', { bubbles: true }));

        if (this.altInputElement) {
          const altFormatted = formatAltDate(
            this.selectedDate.year,
            this.selectedDate.month,
            this.selectedDate.day,
            gregorianDate.getDay(),
            this.selectedTime.hour,
            this.selectedTime.minute,
            this.options.showTime,
            this.options.altFormat,
            this.options.persianDigits
          );
          this.altInputElement.value = altFormatted;
          this.altInputElement.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }

      this.options.onDateSelect({
        value: formatted,
        altValue: this.altInputElement ? this.altInputElement.value : null,
        jalali: this.selectedDate,
        gregorian: { year: gy, month: gm, day: gd },
        time: this.selectedTime,
        date: gregorianDate
      });
    }

    /**
     * Gets the currently selected date as a native JavaScript Date object.
     * @returns {Date}
     */
    getSelectedDate() {
      const [gy, gm, gd] = jalaliToGregorian(this.selectedDate.year, this.selectedDate.month, this.selectedDate.day);
      return new Date(gy, gm - 1, gd, this.selectedTime.hour, this.selectedTime.minute);
    }

    /**
     * Updates calendar configuration options dynamically and redraws the grid.
     * @param {Object} newOptions 
     */
    setOptions(newOptions = {}) {
      this.options = { ...this.options, ...newOptions };
      this.updateCalendarView();
    }

    /**
     * Highlights days dynamically from rangeStart up to the hovered day.
     * @param {number} hoverDay 
     */
    handleDayHover(hoverDay) {
      if (!this.options.rangeStart || this.options.rangeEnd) return; // Highlight only if start is set but end is not

      const [hgy, hgm, hgd] = jalaliToGregorian(this.currentYear, this.currentMonth, hoverDay);
      const hoverDate = new Date(hgy, hgm - 1, hgd);

      const rStart = new Date(this.options.rangeStart.getFullYear(), this.options.rangeStart.getMonth(), this.options.rangeStart.getDate());
      if (hoverDate < rStart) return; // Do not highlight range in the past

      const dayElements = this.dom.daysContainer.querySelectorAll('.persian-calendar-day:not(.empty):not(.disabled)');
      dayElements.forEach(el => {
        const elDay = safeParseInt(el.dataset.day, 0);
        const [egy, egm, egd] = jalaliToGregorian(this.currentYear, this.currentMonth, elDay);
        const elDate = new Date(egy, egm - 1, egd);

        // Reset temporary highlight styles
        el.classList.remove('in-range', 'range-end');

        if (elDate > rStart && elDate < hoverDate) {
          el.classList.add('in-range');
        } else if (elDate.getTime() === hoverDate.getTime()) {
          el.classList.add('range-end');
        }
      });
    }

    /**
     * Resets the temporary hover styles back to static ranges.
     */
    clearHoverRange() {
      if (!this.options.rangeStart || this.options.rangeEnd) return;

      const dayElements = this.dom.daysContainer.querySelectorAll('.persian-calendar-day:not(.empty):not(.disabled)');
      dayElements.forEach(el => {
        el.classList.remove('in-range', 'range-end');
      });
    }
  }

  // Export globally
  window.PersianDateConverter = {
    gregorianToJalali,
    jalaliToGregorian,
    isValidGregorian,
    isValidJalali
  };

  window.PersianCalendar = PersianCalendar;
})();
