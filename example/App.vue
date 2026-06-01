<template>
  <div class="app">
    <header class="app-header">
      <div class="header-inner">
        <div class="header-brand">
          <code class="brand-name">use-calendar</code>
          <span class="brand-sub">Vue 3 composable</span>
        </div>
        <nav class="app-nav">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            class="nav-tab"
            :class="{ 'nav-tab--active': activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>
    </header>

    <main class="app-main">
      <Transition name="fade" mode="out-in">
        <component :is="activeComponent" :key="activeTab" />
      </Transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, shallowRef, watch } from 'vue';
import DatePickerPage from './pages/DatePickerPage.vue';
import MonthRangePage from './pages/MonthRangePage.vue';
import WeeklyPage from './pages/WeeklyPage.vue';
import PricePage from './pages/PricePage.vue';
import MultiplePage from './pages/MultiplePage.vue';
import MultiMonthPage from './pages/MultiMonthPage.vue';

const tabs = [
  { id: 'datepicker', label: '📅 Date Picker', component: DatePickerPage },
  { id: 'range', label: '📆 Month Range', component: MonthRangePage },
  { id: 'weekly', label: '🗓 Weekly', component: WeeklyPage },
  { id: 'price', label: '💰 Price Calendar', component: PricePage },
  { id: 'multiple', label: '✅ Multiple Select', component: MultiplePage },
  { id: 'multimonth', label: '📅📅 Multi-Month', component: MultiMonthPage },
] as const;

const activeTab = ref<string>('datepicker');
const activeComponent = computed(() => tabs.find(t => t.id === activeTab.value)?.component);
</script>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #f8fafc;
  color: #1e293b;
  -webkit-font-smoothing: antialiased;
}

select {
  font-family: inherit;
  font-size: inherit;
  color: inherit;
  border-radius: 6px;
  padding: 6px 8px;
  border: 1px solid #e2e8f0;
  background: white;
  cursor: pointer;
  outline: none;
}

select:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ── Header ─────────────────────────────────────────────────────── */

.app-header {
  background: #0f172a;
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  flex-wrap: wrap;
  min-height: 60px;
  position: relative;
}

.header-brand {
  display: flex;
  align-items: baseline;
  gap: 10px;
  flex-shrink: 0;
  position: absolute;
  left: 24px;
}

.brand-name {
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 1.05rem;
  font-weight: 700;
  color: #a5b4fc;
  letter-spacing: -0.02em;
}

.brand-sub {
  font-size: 0.75rem;
  color: #475569;
}

/* ── Navigation ─────────────────────────────────────────────────── */

.app-nav {
  display: flex;
  gap: 2px;
  flex-wrap: wrap;
  justify-content: center;
}

.nav-tab {
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: background 0.12s, color 0.12s;
  white-space: nowrap;
}

.nav-tab:hover {
  background: rgba(255, 255, 255, 0.07);
  color: #e2e8f0;
}

.nav-tab--active {
  background: #6366f1;
  color: white;
}

.nav-tab--active:hover {
  background: #4f46e5;
  color: white;
}

/* ── Main content ────────────────────────────────────────────────── */

.app-main {
  flex: 1;
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  padding: 28px 24px;
}

/* ── Page transition ─────────────────────────────────────────────── */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ── Scrollbar polish ────────────────────────────────────────────── */

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 99px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@media (max-width: 640px) {
  .header-brand {
    position: static;
  }

  .header-inner {
    flex-direction: column;
    padding: 12px 16px;
    gap: 10px;
  }
}
</style>

