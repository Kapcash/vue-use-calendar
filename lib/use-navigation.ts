import { computed, ComputedRef, ref } from "vue";
import { WrappedDays } from './types';

export function useNavigation<T extends WrappedDays>(daysWrapper: T[], generateWrapper: (wrapperIndex: number, currentWrapper: ComputedRef<T>) => T, infinite = false) {
  const currentWrapperIndex = ref(0);

  const currentWrapper = computed(() => daysWrapper[currentWrapperIndex.value]);
  const prevWrapperEnabled = computed(() => infinite || currentWrapperIndex.value > 0);
  const nextWrapperEnabled = computed(() => infinite || currentWrapperIndex.value < (daysWrapper.length - 1));

  function nextWrapper () {
    jumpTo(currentWrapper.value.index + 1);
  }

  function prevWrapper () {
    jumpTo(currentWrapper.value.index - 1);
  }
  
  function jumpTo (newWrapperIndex: number) {
    let newIndex = daysWrapper.findIndex(wrap => wrap.index === newWrapperIndex);
    if (infinite && newIndex < 0) {
      const newWrapper = generateWrapper(newWrapperIndex, currentWrapper);
      if (newWrapperIndex === daysWrapper[0].index - 1) {
        daysWrapper.unshift(newWrapper);
        newIndex = 0;
      } else if (newWrapperIndex === daysWrapper[daysWrapper.length - 1].index + 1) {
        daysWrapper.push(newWrapper);
        newIndex = daysWrapper.length - 1;
      } else {
        daysWrapper = [newWrapper];
        newIndex = 0;
      }
    }
    currentWrapperIndex.value = Math.max(0, newIndex);
  }

  return {
    jumpTo,
    nextWrapper,
    prevWrapper,
    prevWrapperEnabled,
    nextWrapperEnabled,
    currentWrapper,
  };
}
