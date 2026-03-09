export default defineAppConfig({
  ui: {
    prose: {
      pre: {
        slots: {
          copy: [
            'absolute top-3 right-3 lg:opacity-0',
            'lg:group-hover:opacity-100 transition-opacity',
            'text-white focus-visible:text-white',
          ].join(' '),
          base: 'p-3 bg-secondary border-none',
        },
      },
    },
  },
})
