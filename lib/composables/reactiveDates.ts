import { computed, ComputedRef, Ref, ref, watch } from 'vue';
import { isAfter, isBefore, isSameDay } from 'date-fns';
import { CalendarDate } from "../models/CalendarDate";
import { Selectors, Computeds } from "../types";
import { getBetweenDays } from "../utils/utils";

/**
 * Computes various date-related properties from a list of days.
 * @template C - A type that extends CalendarDate.
 * @param {ComputedRef<C[]>} days - Array of calendar dates.
 * @returns {Computeds<C>} An object containing computed properties for pure dates, selected dates, hovered dates, and between dates.
 */
export function useDaysComputeds<C extends CalendarDate> (days: ComputedRef<C[]>): Computeds<C> {
  /** All the dates, without the copies */
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

/**
 * Manages selection and hover states for calendar dates.
 * @template C - A type that extends CalendarDate.
 * @param {ComputedRef<C[]>} currentViewDays - Array of calendar dates.
 * @param {ComputedRef<C[]>} betweenDates - Array of dates between selected dates.
 * @param {ComputedRef<C[]>} hoveredDates - Array of hovered calendar dates.
 * @returns {Selectors<C>} The methods for selecting and hovering dates, and the current selection.
 */
export function useSelectors<C extends CalendarDate> (
  currentViewDays: ComputedRef<C[]>,
  betweenDates: ComputedRef<C[]>,
  hoveredDates: ComputedRef<C[]>,
  preSelection: C[] = [],
): Selectors<C> {

  /** List of currently selected dates.
   * This cannot be a computed over the `currentViewDays` because a date can be selected without being in the current view.
   * i.e. if we select a date then jump to another month / year, the `currentViewDays` will only contain
   * the dates from that month / year, so it won't include the first selected date.
   */
  const selection = ref<Array<C>>(preSelection);

  watch(() => selection.value, (newSelection) => {
    const normalizedSelectedDates = normalizeDates(newSelection);
    setSelectedDates(normalizedSelectedDates);
    setBetweenDates(normalizedSelectedDates);
  }, { immediate: true });

  function normalizeDates<D extends Date> (dates: D[]): C[] {
    return dates.map(date => new CalendarDate(date) as C); // FIXME: use custom factory
  }

  function setBetweenDates(selectionDates: C[]) {
    if (selectionDates.length >= 2) {
      const [lowestSelection, highestSelection] = selectionDates.sort((a, b) => a.getTime() - b.getTime());

      const firstDay = currentViewDays.value[0];
      const lastDay = currentViewDays.value[currentViewDays.value.length - 1];
      const lowestDay = isBefore(firstDay, lowestSelection) ? null : firstDay;
      const highestDay = isAfter(lastDay, highestSelection) ? null : lastDay;

      const firstDate = currentViewDays.value.find(day => isSameDay(day, lowestSelection)) || lowestDay;
      const secondDate = currentViewDays.value.find(day => isSameDay(day, highestSelection)) || highestDay;
      if (firstDate && secondDate) {
        getBetweenDays(currentViewDays.value, firstDate, secondDate).forEach(day => {
          day.isBetween.value = true;
        });
      }
    } else {
      betweenDates.value.forEach(betweenDate => {
        betweenDate.isBetween.value = false;
      });
    }
  }

  function setSelectedDates(selectionDates: C[]) {
    currentViewDays.value.forEach((day) => {
      // TODO Optimize to avoid full array loop
      day.isSelected.value = selectionDates.some(selected => isSameDay(selected, day));
    });
  }

  /**
   * Updates the selection state for a given calendar date.
   * @param {C} calendarDate - The calendar date to update the selection for.
   */
  function updateSelection (calendarDate: C) {
    const selectedDateIndex = selection.value.findIndex(date => isSameDay(calendarDate, date));
    if (selectedDateIndex >= 0) {
      selection.value.splice(selectedDateIndex, 1);
    } else {
      selection.value.push(calendarDate as any);
    }
  }

  /**
   * Selects a single date.
   * @param {C} clickedDate - The date that was clicked.
   */
  function selectSingle(clickedDate: C) {
    const selectedDate = currentViewDays.value.find(day => isSameDay(day, selection.value[0]));
    if (selectedDate) {
      updateSelection(selectedDate);
    }
    updateSelection(clickedDate);
  }

  /**
   * Selects a range of dates.
   * @param {C} clickedDate - The date that was clicked.
   */
  function selectRange(clickedDate: C) {
    if (selection.value.length >= 2 && !clickedDate.isSelected.value) {
      selection.value.splice(0);
    }
    
    clickedDate.isSelected.value = !clickedDate.isSelected.value;
    updateSelection(clickedDate);
  }

  /**
   * Selects multiple dates, not as a range.
   * @param {C} clickedDate - The date that was clicked.
   */
  function selectMultiple(clickedDate: C) {
    clickedDate.isSelected.value = !clickedDate.isSelected.value;
    updateSelection(clickedDate);
  }

  /**
   * Set the dates between the selected date and the hovered date as hovered.
   * @param {C} hoveredDate - The date that is being hovered over.
   */
  function hoverRange(hoveredDate: C) {
    if (selection.value.length !== 1) { return; }

    hoveredDates.value.forEach((day) => {
      day.isHovered.value = false;
    });
    
    const betweenDates = getBetweenDays(currentViewDays.value, selection.value[0] as C, hoveredDate);
    betweenDates.forEach(day => {
      day.isHovered.value = true;
    });
    hoveredDate.isHovered.value = true;
  }

  /**
   * Resets the hover state for all dates.
   */
  function resetHover() {
    hoveredDates.value.forEach(day => {
      day.isHovered.value = false;
    });
  }

  return {
    // @ts-ignore
    selection,
    selectSingle,
    selectRange,
    selectMultiple,
    hoverRange,
    resetHover,
  };
}