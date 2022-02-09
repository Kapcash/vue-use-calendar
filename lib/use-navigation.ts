import { computed, ComputedRef, ref } from "vue";
import { WrappedDays } from './types';

export function useNavigation<T extends WrappedDays>(daysWrapper: T[], generateWrapper: (wrapperIndex: number, currentWrapper: ComputedRef<T>) => T, infinite = false) {
  const currentWrapperIndex = ref(0);

  const currentWrapper = computed(() => daysWrapper[currentWrapperIndex.value]);
  const prevWrapperEnabled = computed(() => infinite || currentWrapperIndex.value > 0);
  const nextWrapperEnabled = computed(() => infinite || currentWrapperIndex.value < (daysWrapper.length - 1));

  function nextWrapper () {
    const newMontIndex = currentWrapperIndex.value + 1;
    if (infinite && !currentWrapper.value) {
      const newWrapper = generateWrapper(newMontIndex, currentWrapper);
      daysWrapper.push(newWrapper);
    }
    if (nextWrapperEnabled.value) {
      currentWrapperIndex.value = newMontIndex;
    }
  }

  function prevWrapper () {
    const newMontIndex = currentWrapperIndex.value - 1;
    if (infinite && !currentWrapper.value) {
      const newWrapper = generateWrapper(newMontIndex, currentWrapper);
      daysWrapper.unshift(newWrapper);
    }
    if (prevWrapperEnabled.value) {
      currentWrapperIndex.value = Math.max(0, newMontIndex);
    }
  }

  return {
    nextWrapper,
    prevWrapper,
    prevWrapperEnabled,
    nextWrapperEnabled,
    currentWrapper,
  };
}
