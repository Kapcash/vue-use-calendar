<template>
  <aside class="control-panel">
    <button class="mobile-toggle" @click="open = !open">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 1 0 4.93 19.07"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.22 4.22 1.42 1.42"/><path d="m18.36 18.36 1.42 1.42"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.22 19.78 1.42-1.42"/><path d="m18.36 5.64 1.42-1.42"/>
      </svg>
      Options
      <span class="toggle-arrow">{{ open ? '▲' : '▼' }}</span>
    </button>
    <div class="panel-body" :class="{ 'panel-body--open': open }">
      <slot />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const open = ref(false);
</script>

<style scoped>
.control-panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  width: 280px;
  flex-shrink: 0;
  align-self: flex-start;
  position: sticky;
  top: 76px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.mobile-toggle {
  display: none;
  width: 100%;
  align-items: center;
  gap: 8px;
  background: #f8fafc;
  border: none;
  border-bottom: 1px solid #e2e8f0;
  padding: 12px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
  cursor: pointer;
  text-align: left;
}

.toggle-arrow {
  margin-left: auto;
  font-size: 0.7rem;
}

.panel-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
}

@media (max-width: 768px) {
  .control-panel {
    width: 100%;
    position: static;
    border-radius: 8px;
  }

  .mobile-toggle {
    display: flex;
  }

  .panel-body {
    display: none;
    max-height: 380px;
  }

  .panel-body--open {
    display: flex;
  }
}
</style>
