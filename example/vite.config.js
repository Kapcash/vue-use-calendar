import vue from '@vitejs/plugin-vue';

export default {
  plugins: [vue()],
  base: process.env.NODE_ENV === 'production' ? '/vue-use-calendar/' : '',
};