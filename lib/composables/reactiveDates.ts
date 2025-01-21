import { computed, ComputedRef, Reactive, reactive, ref, watch } from 'vue';
import { isEqual } from 'date-fns';
import { ICalendarDate } from "../models/CalendarDate";
import { Selectors, Computeds, SelectRangeOptions, HoverMultipleOptions } from "../types";
import { getBetweenDays } from "../utils/utils";

export function useComputeds<C extends ICalendarDate> (days: ComputedRef<C[]>, preSelectedDays: C[]): Computeds<C> {
  const pureDates = computed(() => {
    return days.value.filter(day => !day._copied);
  });

  const selectedDates = computed(() => {
    const monthDates = pureDates.value.filter(day => day.isSelected.value);
    const uniqueDates: Record<string, C> = {};
    monthDates.forEach(day => {
      uniqueDates[day.date.toISOString()] = day;
    });
    preSelectedDays.forEach(day => {
      uniqueDates[day.date.toISOString()] = day;
    });
    return Object.values(uniqueDates);
  });

  const hoveredDates = computed(() => {
    return pureDates.value.filter(day => day.isHovered.value);
  });

  const betweenDates = computed(() => {
    return pureDates.value.filter(day => day.isBetween.value);
  });

  return {
    pureDates,
    selectedDates,
    hoveredDates,
    betweenDates,
  };
}

export function useSelectors<C extends ICalendarDate> (
  days: ComputedRef<C[]>,
  preSelectedDays: C[],
  selectedDates: ComputedRef<C[]>,
  betweenDates: ComputedRef<C[]>,
  hoveredDates: ComputedRef<C[]>,
): Selectors<C> {
  const selection: Array<Date> = reactive([]);
  const selectionRanges: Array<Date> = reactive([]);

  watch(selection, () => {
    days.value.forEach((day) => {
      // TODO Optimize to avoid full array loop
      day.isSelected.value = selection.some(selected => isEqual(selected, day.date));
    });

    betweenDates.value.forEach(betweenDate => {
      betweenDate.isBetween.value = false;
    });

    const selectedDateRanges: Array<C> = [];
    for (let i = 0; i < selectionRanges.length; i++) {
      const found = selectedDates.value.find(day => isEqual(day.date, selectionRanges[i]));
      if (found) {
        selectedDateRanges.push(found);
      }
    }
    
    for (let i = 0; i < selectedDateRanges.length - 1; i += 2) {
      const firstDate = selectedDateRanges[i];
      const secondDate = selectedDateRanges[i + 1];

      if (!firstDate || !secondDate) { continue; }

      const daysBetween = getBetweenDays(days.value, firstDate, secondDate);
      daysBetween.forEach(day => {
        // if (isSameDay(day.date, firstDate.date) || isSameDay(day.date, secondDate.date)) { return; }
        day.isBetween.value = true;
      });
    }
  });

  watch(selectedDates, () => {
    selection.splice(0);
    selection.push(...selectedDates.value.map(day => day.date));
    selectionRanges.splice(0);
    selectionRanges.push(...selectedDates.value.map(day => day.date));
  }, { immediate: true });

  function updateSelection(calendarDate: C, updatePreSelected = true) {
    const selectedDateIndex = selection.findIndex(date => isEqual(calendarDate.date, date));
    if (selectedDateIndex >= 0) {
      selection.splice(selectedDateIndex, 1);
    } else {
      selection.push(calendarDate.date);
    }
    if (!updatePreSelected) { return; }
    const preSelectedDateIndex = preSelectedDays.findIndex(day => isEqual(day.date, calendarDate.date));
    if (preSelectedDateIndex >= 0) {
      preSelectedDays.splice(preSelectedDateIndex, 1);
    } else {
      preSelectedDays.push(calendarDate);
    }
  }

  function selectSingle(clickedDate: C) {
    const selectedDate = days.value.find(day => isEqual(day.date, selection[0]));
    if (selectedDate) {
      updateSelection(selectedDate);
    }
    updateSelection(clickedDate);
  }

  function selectRange(clickedDate: C, options: SelectRangeOptions = {}) {
    const { strict = false, multiple = false } = options;
    let isValid = true;
    if (strict) {
      const selectedDateRanges: Array<C> = [];
      for (let i = 0; i < selectionRanges.length; i++) {
        const found = selectedDates.value.find(day => isEqual(day.date, selectionRanges[i]));
        if (found) {
          selectedDateRanges.push(found);
        }
      }

      for (let i = 0; i < selectedDateRanges.length; i += 2) {
        const firstDate = selectedDateRanges[i];
        const secondDate = selectedDateRanges[i + 1] || clickedDate;

        if (!firstDate || !secondDate) { continue; }
        if (!(isEqual(firstDate.date, clickedDate.date) || isEqual(secondDate.date, clickedDate.date))) { continue; }

        const daysBetween = getBetweenDays(days.value, firstDate, secondDate);
        if (daysBetween.some(day => day.disabled.value || day.isBetween.value)) {
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


  function selectMultiple(clickedDate: C) {
    clickedDate.isSelected.value = !clickedDate.isSelected.value;
    updateSelection(clickedDate);
  }

  function hoverMultiple(hoveredDate: C, options: HoverMultipleOptions = {}) {
    const { strict = false } = options;
    if (selectedDates.value.length % 2 === 0) {
      return;
    }

    hoveredDates.value.forEach((day) => {
      day.isHovered.value = false;
    });

    const lastSelectedDate = selection[selection.length - 1];
    const lastSelectedCalendarDate = days.value.find(day => isEqual(day.date, lastSelectedDate));
    if (!lastSelectedCalendarDate) {
      return;
    }
    
    const datesToHover = [
      hoveredDate,
      lastSelectedCalendarDate,
      ...getBetweenDays(days.value, lastSelectedCalendarDate, hoveredDate),
    ];
    if (strict && datesToHover.some(day => (day.disabled.value || day.isSelected.value || day.isBetween.value) && !isEqual(day.date, lastSelectedDate))) {
      return;
    }
    datesToHover.forEach(day => {
      day.isHovered.value = true;
    });
    hoveredDate.isHovered.value = true;
  }

  function resetHover() {
    hoveredDates.value.forEach(day => {
      day.isHovered.value = false;
    });
  }

  function resetSelection() {
    selection.splice(0);
    selectionRanges.splice(0);
    preSelectedDays.splice(0);
    selectedDates.value.forEach(day => {
      day.isSelected.value = false;
    });
    betweenDates.value.forEach(day => {
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
    resetSelection,
  };
}