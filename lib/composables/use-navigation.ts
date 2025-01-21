import { computed, ComputedRef, ref, ShallowReactive } from "vue";
import { WrappedDays } from '../types';

export function useNavigation<T extends WrappedDays>(daysWrapper: ShallowReactive<Array<T>>, generateWrapper: (wrapperIndex: number, currentWrapper?: ComputedRef<T>) => T, infinite = false) {
  const currentWrapperIndex = ref<number>(0);

  const currentWrapper = computed(() => daysWrapper[currentWrapperIndex.value]!);
  const prevWrapperEnabled = computed(() => infinite || currentWrapperIndex.value > 0);
  const nextWrapperEnabled = computed(() => infinite || currentWrapperIndex.value < (Math.max(...Object.keys(daysWrapper).map(Number))));

  function nextWrapper () {
    jumpTo(currentWrapper.value.index + 1);
  }

  function prevWrapper () {
    jumpTo(currentWrapper.value.index - 1);
  }
  
  function jumpTo (newWrapperIndex: number) {
    if (newWrapperIndex === currentWrapper.value.index) { return; }
    
    const index = daysWrapper.findIndex(day => day.index === newWrapperIndex);
    if (index >= 0) {
      currentWrapperIndex.value = index;
    } else {
      const newWrapper = generateWrapper(newWrapperIndex, currentWrapper);
      daysWrapper.push(newWrapper);
      currentWrapperIndex.value = daysWrapper.length - 1;
    }
  }

  function generate(newWrapperIndex: number) {
    if (newWrapperIndex === currentWrapper.value.index) { return; }
    
    const index = daysWrapper.findIndex(day => day.index === newWrapperIndex);
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
    currentWrapper,
  };
}
