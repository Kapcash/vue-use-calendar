import { computed, ComputedRef } from "vue";
import { ICalendarDate } from "../models/CalendarDate";
import { Listeners, Computeds } from "../types";
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
): Listeners<C> {
  function selectSingle(clickedDate: ICalendarDate) {
    selectedDates.value.forEach(day => {
      day.isSelected.value = false;
    });
    clickedDate.isSelected.value = true;
  }

  function selectRange(clickedDate: ICalendarDate) {
    betweenDates.value.forEach(day => {
      day.isBetween.value = false;
    });
    
    if (selectedDates.value.length >= 2 && !clickedDate.isSelected.value) {
      selectedDates.value.forEach((day) => {
        day.isSelected.value = false;
      });
    }
    
    if (selectedDates.value.length === 1) {
      getBetweenDays(days.value, selectedDates.value[0], clickedDate).forEach(day => {
        day.isBetween.value = true;
      });
    }
    
    clickedDate.isSelected.value = !clickedDate.isSelected.value;
  }

  function selectMultiple(clickedDate: ICalendarDate) {
    clickedDate.isSelected.value = !clickedDate.isSelected.value;
  }

  function hoverMultiple(hoveredDate: ICalendarDate) {
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
    selectSingle,
    selectRange,
    selectMultiple,
    hoverMultiple,
    resetHover,
  };
}