import clerkNext from '@clerk/eslint-plugin/next'

export default [
  { ignores: ['.next/**'] },
  {
    plugins: { '@clerk/next': clerkNext },

    rules: {
      "@clerk/next/require-auth-protection": [
        "error",
        {
         protected: [
            "app/panel/**",
            "app/blog/**",
            "app/forum/**",
            "app/admin/**",
         ],
         public: ['src/app/sign-in/**', 'src/app/sign-up/**'],
         resources: {
            routeHandlers: true,
            serverFunctions: true,
            serverComponentEntrypoints: false, // Skip for now.
          },
        },
      ],
    },
  },
];