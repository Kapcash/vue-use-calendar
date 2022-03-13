import { computed, ComputedRef, reactive, ShallowRef, shallowRef, watch } from 'vue';
import { isAfter, isBefore, isSameDay } from 'date-fns';
import { dateToMonthYear, ICalendarDate } from "../models/CalendarDate";
import { Selectors, Computeds } from "../types";
import { getBetweenDays } from "../utils/utils";

export function useComputeds<C extends ICalendarDate> (days: ComputedRef<C[]>): Computeds<C> {
  const pureDates = computed(() => {
    return days.value.filter(day => !day._copied);
  });

  const selectedDates = computed(() => {
    return pureDates.value.filter(day => day.isSelected.value);
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
  selectedDates: ComputedRef<C[]>,
  betweenDates: ComputedRef<C[]>,
  hoveredDates: ComputedRef<C[]>,
): Selectors<C> {
  const selection: Array<Date> = reactive([]);

  watch(selection, () => {
    days.value.forEach((day) => {
      // TODO Optimize to avoid full array loop
      day.isSelected.value = selection.some(selected => isSameDay(selected, day.date));
    });

    if (selection.length >= 2) {
      const isAsc = isBefore(selection[0], selection[1]);
      const firstOfMonth = isBefore(days.value[0].date, selection[isAsc ? 0 : 1]) ? null : days.value[0];
      const lastOfMonth = isAfter(days.value[days.value.length - 1].date, selection[isAsc ? 1 : 0]) ? null : days.value[days.value.length - 1];
      const firstDate = days.value.find(day => isSameDay(day.date, selection[0])) || (isAsc ? firstOfMonth : days.value[days.value.length - 1]);
      const secondDate = days.value.find(day => isSameDay(day.date, selection[1])) || (isAsc ? lastOfMonth : firstOfMonth);
      if (firstDate && secondDate) {
        getBetweenDays(days.value, firstDate, secondDate).forEach(day => {
          day.isBetween.value = true;
        });
      }
    } else {
      betweenDates.value.forEach(betweenDate => {
        betweenDate.isBetween.value = false;
      });
    }
  });

  function updateSelection (calendarDate: C) {
    const selectedDateIndex = selection.findIndex(date => isSameDay(calendarDate.date, date));
    if (selectedDateIndex >= 0) {
      selection.splice(selectedDateIndex, 1);
    } else {
      selection.push(calendarDate.date);
    }
  }

  function selectSingle(clickedDate: C) {
    // selectedDates.value.forEach(day => {
    //   day.isSelected.value = false;
    // });
    // clickedDate.isSelected.value = true;
    updateSelection(clickedDate);
  }

  function selectRange(clickedDate: C) {
    // betweenDates.value.forEach(day => {
    //   day.isBetween.value = false;
    // });
    
    if (selection.length >= 2 && !clickedDate.isSelected.value) {
      selection.splice(0);
      // selectedDates.value.forEach((day) => {
      //   day.isSelected.value = false;
      // });
    }
    
    if (selectedDates.value.length === 1) {
      // getBetweenDays(days.value, selectedDates.value[0], clickedDate).forEach(day => {
      //   day.isBetween.value = true;
      // });
    }
    
    clickedDate.isSelected.value = !clickedDate.isSelected.value;
    updateSelection(clickedDate);
  }

  function selectMultiple(clickedDate: C) {
    clickedDate.isSelected.value = !clickedDate.isSelected.value;
    updateSelection(clickedDate);
  }

  function hoverMultiple(hoveredDate: C) {
    if (selectedDates.value.length !== 1) { return; }

    hoveredDates.value.forEach((day) => {
      day.isHovered.value = false;
    });
    
    const betweenDates = getBetweenDays(days.value, selectedDates.value[0], hoveredDate);
    betweenDates.forEach(day => {
      day.isHovered.value = true;
    });
    hoveredDate.isHovered.value = true;
  }

  function resetHover() {
    hoveredDates.value.forEach(day => {
      day.isHovered.value = false;
    });
  }

  return {
    selection,
    selectSingle,
    selectRange,
    selectMultiple,
    hoverMultiple,
    resetHover,
  };
}