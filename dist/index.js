"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// lib/index.ts
var lib_exports = {};
__export(lib_exports, {
  dateToMonthYear: () => dateToMonthYear,
  monthFromMonthYear: () => monthFromMonthYear,
  useCalendar: () => useCalendar,
  yearFromMonthYear: () => yearFromMonthYear
});
module.exports = __toCommonJS(lib_exports);

// lib/composables/use-weekdays.ts
var import_date_fns = require("date-fns");
function useWeekdays({ firstDayOfWeek, locale }) {
  return (weekdayFormat = "iiiii") => {
    const sunday = (0, import_date_fns.nextSunday)(new Date());
    const weekdays = Array.from(Array(7).keys()).map((i) => (0, import_date_fns.addDays)(sunday, i));
    Array.from(Array(firstDayOfWeek)).forEach(() => {
      weekdays.push(weekdays.shift());
    });
    return weekdays.map((day) => (0, import_date_fns.format)(day, weekdayFormat, { locale }));
  };
}

// lib/composables/use-monthly-calendar.ts
var import_vue5 = require("vue");
var import_date_fns6 = require("date-fns");

// lib/utils/utils.ts
var import_date_fns2 = require("date-fns");
function generators(globalOptions) {
  function generateConsecutiveDays(from, to) {
    var _a;
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);
    const dates = [globalOptions.factory(from)];
    let dayIndex = from.getDate() + 1;
    if ((0, import_date_fns2.isAfter)(from, to)) {
    }
    while ((0, import_date_fns2.isBefore)(((_a = dates[dates.length - 1]) == null ? void 0 : _a.date) || 0, to)) {
      const date = globalOptions.factory(from.getFullYear(), from.getMonth(), dayIndex++);
      date.disabled.value = Array.isArray(globalOptions.disabled) ? globalOptions.disabled.some((disabled) => (0, import_date_fns2.isEqual)(date.date, disabled)) : globalOptions.disabled(date.date);
      date.isSelected.value = globalOptions.preSelection.some((pre) => (0, import_date_fns2.isEqual)(date.date, pre));
      dates.push(date);
    }
    return dates;
  }
  return {
    generateConsecutiveDays
  };
}
function getBetweenDays(pureDates, first, second) {
  const firstSelectedDayIndex = pureDates.findIndex((day) => (0, import_date_fns2.isEqual)(day.date, first.date));
  const secondSelectedDayIndex = pureDates.findIndex((day) => (0, import_date_fns2.isEqual)(day.date, second.date));
  const [lowestDate, greatestDate] = [firstSelectedDayIndex, secondSelectedDayIndex].sort((a, b) => a - b);
  return pureDates.slice(lowestDate + 1, greatestDate);
}
function disableExtendedDates(dates, from, to) {
  const beforeFromDates = from ? dates.slice(0, dates.findIndex((day) => (0, import_date_fns2.isEqual)(day.date, from))) : [];
  const afterToDates = to ? dates.slice(dates.findIndex((day) => (0, import_date_fns2.isEqual)(day.date, to))) : [];
  [...beforeFromDates, ...afterToDates].forEach((day) => {
    day.disabled.value = true;
  });
}
function chunk(arr, size = 7) {
  return Array(Math.ceil(arr.length / size)).fill(null).map((_, i) => {
    return arr.slice(i * size, i * size + size);
  });
}

// lib/models/CalendarDate.ts
var import_date_fns3 = require("date-fns");
var import_vue = require("vue");
function generateCalendarFactory(customFactory) {
  const extendFactory = customFactory || ((c) => c);
  return function(...args) {
    const date = new Date(...args);
    const weekDay = date.getDay();
    return extendFactory({
      date,
      isToday: (0, import_date_fns3.isToday)(date),
      isWeekend: weekDay === 0 || weekDay > 6,
      otherMonth: false,
      disabled: (0, import_vue.ref)(false),
      isSelected: (0, import_vue.ref)(false),
      isBetween: (0, import_vue.ref)(false),
      isHovered: (0, import_vue.ref)(false),
      monthYearIndex: dateToMonthYear(date),
      dayId: [date.getFullYear(), date.getMonth(), date.getDate()].join("-"),
      _copied: false
    });
  };
}
function copyCalendarDate(date) {
  return { ...date, _copied: true };
}
function dateToMonthYear(dateOrYear, month) {
  if (typeof dateOrYear === "number") {
    return dateOrYear * 12 + (month || 0);
  } else {
    return dateOrYear.getFullYear() * 12 + dateOrYear.getMonth();
  }
}
function yearFromMonthYear(monthYear) {
  return Math.floor(monthYear / 12);
}
function monthFromMonthYear(monthYear) {
  return monthYear % 12;
}

// lib/composables/reactiveDates.ts
var import_vue2 = require("vue");
var import_date_fns4 = require("date-fns");
function useComputeds(days, preSelectedDays) {
  const pureDates = (0, import_vue2.computed)(() => {
    return days.value.filter((day) => !day._copied);
  });
  const selectedDates = (0, import_vue2.computed)(() => {
    const monthDates = pureDates.value.filter((day) => day.isSelected.value);
    const uniqueDates = {};
    monthDates.forEach((day) => {
      uniqueDates[day.date.toISOString()] = day;
    });
    preSelectedDays.forEach((day) => {
      uniqueDates[day.date.toISOString()] = day;
    });
    return Object.values(uniqueDates);
  });
  const hoveredDates = (0, import_vue2.computed)(() => {
    return pureDates.value.filter((day) => day.isHovered.value);
  });
  const betweenDates = (0, import_vue2.computed)(() => {
    return pureDates.value.filter((day) => day.isBetween.value);
  });
  return {
    pureDates,
    selectedDates,
    hoveredDates,
    betweenDates
  };
}
function useSelectors(days, preSelectedDays, selectedDates, betweenDates, hoveredDates) {
  const selection = (0, import_vue2.reactive)([]);
  const selectionRanges = (0, import_vue2.reactive)([]);
  (0, import_vue2.watch)(selection, () => {
    days.value.forEach((day) => {
      day.isSelected.value = selection.some((selected) => (0, import_date_fns4.isEqual)(selected, day.date));
    });
    betweenDates.value.forEach((betweenDate) => {
      betweenDate.isBetween.value = false;
    });
    const selectedDateRanges = [];
    for (let i = 0; i < selectionRanges.length; i++) {
      const found = selectedDates.value.find((day) => (0, import_date_fns4.isEqual)(day.date, selectionRanges[i]));
      if (found) {
        selectedDateRanges.push(found);
      }
    }
    for (let i = 0; i < selectedDateRanges.length - 1; i += 2) {
      const firstDate = selectedDateRanges[i];
      const secondDate = selectedDateRanges[i + 1];
      if (!firstDate || !secondDate) {
        continue;
      }
      const daysBetween = getBetweenDays(days.value, firstDate, secondDate);
      daysBetween.forEach((day) => {
        day.isBetween.value = true;
      });
    }
  });
  (0, import_vue2.watch)(selectedDates, () => {
    selection.splice(0);
    selection.push(...selectedDates.value.map((day) => day.date));
    selectionRanges.splice(0);
    selectionRanges.push(...selectedDates.value.map((day) => day.date));
  }, { immediate: true });
  function updateSelection(calendarDate, updatePreSelected = true) {
    const selectedDateIndex = selection.findIndex((date) => (0, import_date_fns4.isEqual)(calendarDate.date, date));
    if (selectedDateIndex >= 0) {
      selection.splice(selectedDateIndex, 1);
    } else {
      selection.push(calendarDate.date);
    }
    if (!updatePreSelected) {
      return;
    }
    const preSelectedDateIndex = preSelectedDays.findIndex((day) => (0, import_date_fns4.isEqual)(day.date, calendarDate.date));
    if (preSelectedDateIndex >= 0) {
      preSelectedDays.splice(preSelectedDateIndex, 1);
    } else {
      preSelectedDays.push(calendarDate);
    }
  }
  function selectSingle(clickedDate) {
    const selectedDate = days.value.find((day) => (0, import_date_fns4.isEqual)(day.date, selection[0]));
    if (selectedDate) {
      updateSelection(selectedDate);
    }
    updateSelection(clickedDate);
  }
  function selectRange(clickedDate, options = {}) {
    const { strict = false, multiple = false } = options;
    let isValid = true;
    if (strict) {
      const selectedDateRanges = [];
      for (let i = 0; i < selectionRanges.length; i++) {
        const found = selectedDates.value.find((day) => (0, import_date_fns4.isEqual)(day.date, selectionRanges[i]));
        if (found) {
          selectedDateRanges.push(found);
        }
      }
      for (let i = 0; i < selectedDateRanges.length; i += 2) {
        const firstDate = selectedDateRanges[i];
        const secondDate = selectedDateRanges[i + 1] || clickedDate;
        if (!firstDate || !secondDate) {
          continue;
        }
        if (!((0, import_date_fns4.isEqual)(firstDate.date, clickedDate.date) || (0, import_date_fns4.isEqual)(secondDate.date, clickedDate.date))) {
          continue;
        }
        const daysBetween = getBetweenDays(days.value, firstDate, secondDate);
        if (daysBetween.some((day) => day.disabled.value || day.isBetween.value)) {
          isValid = false;
        }
      }
    }
    if (!multiple && selection.length >= 2 && !clickedDate.isSelected.value) {
      resetSelection();
    }
    if (!isValid) {
      selection.splice(-1);
      selectionRanges.splice(-1);
    }
    clickedDate.isSelected.value = !clickedDate.isSelected.value;
    updateSelection(clickedDate, false);
    selectionRanges.push(clickedDate.date);
  }
  function selectMultiple(clickedDate) {
    clickedDate.isSelected.value = !clickedDate.isSelected.value;
    updateSelection(clickedDate);
  }
  function hoverMultiple(hoveredDate, options = {}) {
    const { strict = false } = options;
    if (selectedDates.value.length % 2 === 0) {
      return;
    }
    hoveredDates.value.forEach((day) => {
      day.isHovered.value = false;
    });
    const lastSelectedDate = selection[selection.length - 1];
    const lastSelectedCalendarDate = days.value.find((day) => (0, import_date_fns4.isEqual)(day.date, lastSelectedDate));
    if (!lastSelectedCalendarDate) {
      return;
    }
    const datesToHover = [
      hoveredDate,
      lastSelectedCalendarDate,
      ...getBetweenDays(days.value, lastSelectedCalendarDate, hoveredDate)
    ];
    if (strict && datesToHover.some((day) => (day.disabled.value || day.isSelected.value || day.isBetween.value) && !(0, import_date_fns4.isEqual)(day.date, lastSelectedDate))) {
      return;
    }
    datesToHover.forEach((day) => {
      day.isHovered.value = true;
    });
    hoveredDate.isHovered.value = true;
  }
  function resetHover() {
    hoveredDates.value.forEach((day) => {
      day.isHovered.value = false;
    });
  }
  function resetSelection() {
    selection.splice(0);
    selectionRanges.splice(0);
    preSelectedDays.splice(0);
    selectedDates.value.forEach((day) => {
      day.isSelected.value = false;
    });
    betweenDates.value.forEach((day) => {
      day.isBetween.value = false;
    });
  }
  return {
    selection,
    selectSingle,
    selectRange,
    selectMultiple,
    hoverMultiple,
    resetHover,
    resetSelection
  };
}

// lib/composables/use-navigation.ts
var import_vue3 = require("vue");
function useNavigation(daysWrapper, generateWrapper, infinite = false) {
  const currentWrapperIndex = (0, import_vue3.ref)(0);
  const currentWrapper = (0, import_vue3.computed)(() => daysWrapper[currentWrapperIndex.value]);
  const prevWrapperEnabled = (0, import_vue3.computed)(() => infinite || currentWrapperIndex.value > 0);
  const nextWrapperEnabled = (0, import_vue3.computed)(() => infinite || currentWrapperIndex.value < Math.max(...Object.keys(daysWrapper).map(Number)));
  function nextWrapper() {
    jumpTo(currentWrapper.value.index + 1);
  }
  function prevWrapper() {
    jumpTo(currentWrapper.value.index - 1);
  }
  function jumpTo(newWrapperIndex) {
    if (newWrapperIndex === currentWrapper.value.index) {
      return;
    }
    const index = daysWrapper.findIndex((day) => day.index === newWrapperIndex);
    if (index >= 0) {
      currentWrapperIndex.value = index;
    } else {
      const newWrapper = generateWrapper(newWrapperIndex, currentWrapper);
      daysWrapper.push(newWrapper);
      currentWrapperIndex.value = daysWrapper.length - 1;
    }
  }
  function generate(newWrapperIndex) {
    if (newWrapperIndex === currentWrapper.value.index) {
      return;
    }
    const index = daysWrapper.findIndex((day) => day.index === newWrapperIndex);
    if (index < 0) {
      const newWrapper = generateWrapper(newWrapperIndex, currentWrapper);
      daysWrapper.push(newWrapper);
    }
  }
  return {
    jumpTo,
    nextWrapper,
    prevWrapper,
    generate,
    prevWrapperEnabled,
    nextWrapperEnabled,
    currentWrapper
  };
}

// lib/utils/utils.month.ts
var import_vue4 = require("vue");
var import_date_fns5 = require("date-fns");
function monthGenerators(globalOptions) {
  const { generateConsecutiveDays } = generators(globalOptions);
  function monthFactory(monthDays) {
    return {
      days: monthDays,
      month: monthDays[10].date.getMonth(),
      year: monthDays[10].date.getFullYear(),
      index: monthDays[10].monthYearIndex
    };
  }
  function wrapByMonth(days, otherMonthsDays = false, fixedWeeks = false) {
    const allMonthYearsIndex = [...new Set(days.map((day) => day.monthYearIndex))];
    const wrap = (0, import_vue4.shallowReactive)([]);
    allMonthYearsIndex.forEach((monthYear) => {
      var _a;
      const monthFirstDayIndex = days.findIndex((day) => day.monthYearIndex === monthYear);
      const nextMonthFirstDayIndex = days.findIndex((day) => day.monthYearIndex === monthYear + 1);
      const monthLastDayIndex = nextMonthFirstDayIndex >= 0 ? nextMonthFirstDayIndex : days.length;
      const monthDays = days.slice(monthFirstDayIndex, monthLastDayIndex);
      if (otherMonthsDays) {
        const beforeMonth = ((_a = wrap[wrap.length - 1]) == null ? void 0 : _a.days) || [];
        generateOtherMonthDays(monthDays, beforeMonth, [], fixedWeeks);
      }
      wrap.push(monthFactory(monthDays));
    });
    return wrap;
  }
  function generateMonth(monthYear, options) {
    const {
      fixedWeeks = false,
      otherMonthsDays = false,
      beforeMonthDays = [],
      afterMonthDays = []
    } = options;
    const monthRefDay = new Date(yearFromMonthYear(monthYear), monthFromMonthYear(monthYear));
    const monthDays = generateConsecutiveDays((0, import_date_fns5.startOfMonth)(monthRefDay), (0, import_date_fns5.endOfMonth)(monthRefDay));
    if (otherMonthsDays) {
      generateOtherMonthDays(monthDays, beforeMonthDays, afterMonthDays, fixedWeeks);
    }
    return monthFactory(monthDays);
  }
  function generateOtherMonthDays(monthDays, monthBefore, monthAfter, fixedWeeks = false) {
    if (monthDays.length <= 0) {
      return;
    }
    completeWeekBefore(monthDays, monthBefore);
    completeWeekAfter(monthDays, monthAfter, fixedWeeks);
  }
  function completeWeekBefore(daysToComplete, previousDays) {
    let beforeDays = [];
    if (previousDays.length > 0) {
      const currentIndex = daysToComplete[0].monthYearIndex;
      const howManyDaysDuplicated = previousDays.slice(-14).filter((day) => day.monthYearIndex === currentIndex).length;
      if (howManyDaysDuplicated > 0) {
        daysToComplete.splice(0, howManyDaysDuplicated);
        const spliceDays = howManyDaysDuplicated > 7 ? 14 : 7;
        const lastDays = previousDays.slice(-spliceDays);
        const lastDaysCopy = lastDays.map(copyCalendarDate);
        lastDays.forEach((day) => {
          day._copied = day.otherMonth;
        });
        lastDaysCopy.forEach((day) => {
          day.otherMonth = !day.otherMonth;
          day._copied = day.otherMonth;
        });
        beforeDays = lastDaysCopy;
      }
    } else {
      const beforeTo = daysToComplete[0].date;
      const beforeFrom = (0, import_date_fns5.startOfWeek)(beforeTo, { weekStartsOn: globalOptions.firstDayOfWeek });
      beforeDays = generateConsecutiveDays(beforeFrom, beforeTo).slice(0, -1);
      beforeDays.forEach((day) => {
        day.otherMonth = true;
      });
    }
    daysToComplete.unshift(...beforeDays);
  }
  function completeWeekAfter(daysToComplete, followingDays, fixedWeeks = false) {
    let afterDays = [];
    if (followingDays.length > 0) {
      const fullWeekCount = Math.floor(daysToComplete.length / 7) + (fixedWeeks ? 0 : 1);
      const needDays = 7 * (6 - fullWeekCount);
      const nextDays = followingDays.slice(0, needDays);
      const nextDaysCopy = nextDays.map(copyCalendarDate);
      nextDays.forEach((day) => {
        day._copied = day.otherMonth;
      });
      nextDaysCopy.forEach((day) => {
        day.otherMonth = !day.otherMonth;
        day._copied = day.otherMonth;
      });
      afterDays = nextDaysCopy;
      const currentIndex = daysToComplete[daysToComplete.length - 1].monthYearIndex;
      const howManyDaysDuplicated = followingDays.slice(0, 14).filter((day) => day.monthYearIndex === currentIndex).length;
      if (howManyDaysDuplicated > 0) {
        daysToComplete.splice(-howManyDaysDuplicated, howManyDaysDuplicated);
      }
    } else {
      const allWeekCount = Math.ceil(daysToComplete.length / 7);
      const afterFrom = daysToComplete[daysToComplete.length - 1];
      const afterTo = (0, import_date_fns5.endOfWeek)(afterFrom.date, { weekStartsOn: globalOptions.firstDayOfWeek });
      if (daysToComplete.length < 36 && fixedWeeks) {
        afterTo.setDate(afterTo.getDate() + 7 * (6 - allWeekCount));
      }
      afterDays = generateConsecutiveDays(afterFrom.date, afterTo).slice(1);
      afterDays.forEach((day) => {
        day.otherMonth = true;
      });
    }
    daysToComplete.push(...afterDays);
  }
  return {
    generateConsecutiveDays,
    generateMonth,
    wrapByMonth
  };
}

// lib/composables/use-monthly-calendar.ts
function monthlyCalendar(globalOptions) {
  const { generateConsecutiveDays, generateMonth, wrapByMonth } = monthGenerators(globalOptions);
  return function useMonthlyCalendar(opts = {}) {
    const { infinite = true, fullWeeks = true, fixedWeeks = false } = opts;
    const monthlyDays = generateConsecutiveDays(
      (0, import_date_fns6.startOfMonth)(globalOptions.startOn),
      (0, import_date_fns6.endOfMonth)(globalOptions.maxDate || globalOptions.startOn)
    );
    const daysByMonths = wrapByMonth(monthlyDays, fullWeeks, fixedWeeks);
    const {
      currentWrapper,
      jumpTo,
      nextWrapper,
      prevWrapper,
      generate,
      prevWrapperEnabled,
      nextWrapperEnabled
    } = useNavigation(
      daysByMonths,
      (newIndex) => {
        var _a, _b;
        const newMonth = generateMonth(newIndex, {
          otherMonthsDays: !!fullWeeks,
          fixedWeeks: !!fixedWeeks,
          beforeMonthDays: ((_a = daysByMonths.find((month) => month.index === newIndex - 1)) == null ? void 0 : _a.days) || [],
          afterMonthDays: ((_b = daysByMonths.find((month) => month.index === newIndex + 1)) == null ? void 0 : _b.days) || []
        });
        selection.splice(0, selection.length, ...selection.reverse());
        return newMonth;
      },
      infinite
    );
    const currentMonthYearIndex = (0, import_vue5.computed)(() => {
      return dateToMonthYear(currentMonthAndYear.year, currentMonthAndYear.month);
    });
    const currentMonthAndYear = (0, import_vue5.reactive)({ month: globalOptions.startOn.getMonth(), year: globalOptions.startOn.getFullYear() });
    (0, import_vue5.watch)(currentWrapper, (newWrapper) => {
      if (currentMonthAndYear.month === newWrapper.month && currentMonthAndYear.year === newWrapper.year) {
        return;
      }
      currentMonthAndYear.month = newWrapper.month;
      currentMonthAndYear.year = newWrapper.year;
    });
    (0, import_vue5.watch)(currentMonthAndYear, (newCurrentMonth) => {
      newCurrentMonth.month = Math.min(11, newCurrentMonth.month);
      jumpTo(currentMonthYearIndex.value);
    });
    const preSelectedDates = (0, import_vue5.reactive)(globalOptions.preSelection.map((date) => globalOptions.factory(date)));
    const days = (0, import_vue5.computed)(() => daysByMonths.flatMap((month) => month.days).filter(Boolean));
    const months = (0, import_vue5.computed)(() => daysByMonths.toSorted((a, b) => a.index - b.index));
    const computeds = useComputeds(days, preSelectedDates);
    (0, import_vue5.watchEffect)(() => {
      disableExtendedDates(days.value, globalOptions.minDate, globalOptions.maxDate);
    });
    const { selection, ...listeners } = useSelectors(
      computeds.pureDates,
      preSelectedDates,
      computeds.selectedDates,
      computeds.betweenDates,
      computeds.hoveredDates
    );
    (0, import_vue5.watch)(() => preSelectedDates, () => {
      preSelectedDates.forEach((d) => {
        const index = dateToMonthYear(d.date.getFullYear(), d.date.getMonth());
        generate(index);
      });
    }, { immediate: true, deep: true });
    (0, import_vue5.watch)(() => globalOptions.preSelection, () => {
      preSelectedDates.splice(0, preSelectedDates.length, ...globalOptions.preSelection.map((date) => globalOptions.factory(date)));
    });
    return {
      currentMonth: currentWrapper,
      currentMonthAndYear,
      currentMonthYearIndex,
      months,
      days,
      jumpTo,
      nextMonth: nextWrapper,
      prevMonth: prevWrapper,
      prevMonthEnabled: prevWrapperEnabled,
      nextMonthEnabled: nextWrapperEnabled,
      selectedDates: selection,
      listeners
    };
  };
}

// lib/composables/use-weekly-calendar.ts
var import_vue6 = require("vue");
var import_date_fns8 = require("date-fns");

// lib/utils/utils.week.ts
var import_date_fns7 = require("date-fns");
function weekGenerators(globalOptions) {
  const { generateConsecutiveDays } = generators(globalOptions);
  function weekFactory(weekDays) {
    const getNbWeek = (day) => (0, import_date_fns7.getWeek)(day.date, { weekStartsOn: globalOptions.firstDayOfWeek });
    return {
      days: weekDays,
      weekNumber: getNbWeek(weekDays[0]),
      month: weekDays[0].date.getMonth(),
      year: weekDays[0].date.getFullYear(),
      index: parseInt(weekDays[0].date.getFullYear().toString() + getNbWeek(weekDays[0]).toString().padStart(2, "0"), 10)
    };
  }
  function wrapByWeek(days) {
    const firstStartOfWeek = days.findIndex((day) => day.date.getDay() === globalOptions.firstDayOfWeek);
    const weeks = [
      days.slice(0, firstStartOfWeek),
      ...chunk(days.slice(firstStartOfWeek), 7)
    ].filter((chunk2) => chunk2.length > 0).map(weekFactory);
    return weeks;
  }
  function generateWeek(weekYearId) {
    const weekRefDay = (0, import_date_fns7.setWeek)(new Date(weekYearId.year, 0, 0), weekYearId.weekNumber, { weekStartsOn: globalOptions.firstDayOfWeek });
    const weekDays = generateConsecutiveDays(
      (0, import_date_fns7.startOfWeek)(weekRefDay, { weekStartsOn: globalOptions.firstDayOfWeek }),
      (0, import_date_fns7.endOfWeek)(weekRefDay, { weekStartsOn: globalOptions.firstDayOfWeek })
    );
    const newWeek = weekFactory(weekDays);
    return newWeek;
  }
  return {
    generateConsecutiveDays,
    generateWeek,
    wrapByWeek
  };
}

// lib/composables/use-weekly-calendar.ts
var DEFAULT_MONTLY_OPTS = {
  infinite: false
};
function weeklyCalendar(globalOptions) {
  const { generateConsecutiveDays, wrapByWeek, generateWeek } = weekGenerators(globalOptions);
  return function useWeeklyCalendar(opts) {
    const { infinite } = { ...DEFAULT_MONTLY_OPTS, ...opts };
    const weeklyDays = generateConsecutiveDays(
      (0, import_date_fns8.startOfWeek)(globalOptions.startOn, { weekStartsOn: globalOptions.firstDayOfWeek }),
      (0, import_date_fns8.endOfWeek)(globalOptions.maxDate || globalOptions.startOn, { weekStartsOn: globalOptions.firstDayOfWeek })
    );
    disableExtendedDates(weeklyDays, globalOptions.minDate, globalOptions.maxDate);
    const daysByWeeks = wrapByWeek(weeklyDays);
    const days = (0, import_vue6.computed)(() => daysByWeeks.flatMap((week) => week.days));
    const weeks = (0, import_vue6.computed)(() => daysByWeeks.toSorted((a, b) => a.index - b.index));
    (0, import_vue6.watchEffect)(() => {
      disableExtendedDates(weeklyDays, globalOptions.minDate, globalOptions.maxDate);
    });
    const currentWeekIndex = (0, import_vue6.computed)(() => {
      return currentWrapper.value.index;
    });
    const { currentWrapper, jumpTo, nextWrapper, prevWrapper, prevWrapperEnabled, nextWrapperEnabled } = useNavigation(
      daysByWeeks,
      (newWeekIndex) => {
        const year = parseInt(newWeekIndex.toString().slice(0, 4), 10);
        const weekNumber = parseInt(newWeekIndex.toString().slice(4), 10);
        return generateWeek({ year, weekNumber });
      },
      infinite
    );
    const computeds = useComputeds(days);
    const { selection, ...selectors } = useSelectors(days, computeds.selectedDates, computeds.betweenDates, computeds.hoveredDates);
    return {
      currentWeek: currentWrapper,
      currentWeekIndex,
      days,
      weeks,
      jumpTo,
      nextWeek: nextWrapper,
      prevWeek: prevWrapper,
      prevWeekEnabled: prevWrapperEnabled,
      nextWeekEnabled: nextWrapperEnabled,
      selectedDates: selection,
      listeners: selectors
    };
  };
}

// lib/use-calendar.ts
var import_vue7 = require("vue");
function useCalendar(rawOptions) {
  const options = normalizeGlobalParameters(rawOptions);
  const useMonthlyCalendar = monthlyCalendar(options);
  const useWeeklyCalendar = weeklyCalendar(options);
  return {
    useMonthlyCalendar,
    useWeeklyCalendar,
    useWeekdays: useWeekdays(options),
    factory: options.factory
  };
}
function normalizeGlobalParameters(opts) {
  const minDate = opts.minDate ? new Date(opts.minDate) : void 0;
  const maxDate = opts.maxDate ? new Date(opts.maxDate) : void 0;
  const startOn = opts.startOn ? new Date(opts.startOn) : minDate || new Date();
  const disabledUnref = (0, import_vue7.unref)((0, import_vue7.unref)(opts.disabled));
  const disabled = Array.isArray(disabledUnref) ? disabledUnref.map((dis) => new Date(dis)) : disabledUnref || [];
  const preSelection = Array.isArray(opts.preSelection) ? opts.preSelection.map((pre) => new Date(pre)) : [];
  const factory = generateCalendarFactory(opts.factory);
  const firstDayOfWeek = opts.firstDayOfWeek || 0;
  return { ...opts, startOn, firstDayOfWeek, minDate, maxDate, disabled, preSelection, factory };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  dateToMonthYear,
  monthFromMonthYear,
  useCalendar,
  yearFromMonthYear
});
