## Wolfmed

## Development with teaching-playground-core

This project uses `@teaching-playground/core` package which can be used in two modes: local development and npm version.

### Local Development Mode

When you want to make changes to the core package and test them immediately:

1. Switch to local version:
```bash
pnpm core:local
```

2. Start the main project in one terminal:
```bash
pnpm dev
```

3. Start the core package in watch mode in another terminal:
```bash
pnpm core:dev
```

Now any changes you make to the core package will be automatically recompiled and reflected in the main project.

### Using the NPM Version

When you want to use the published version from npm:

```bash
pnpm core:npm
```

This will install the latest version from npm.

### Publishing Changes to NPM

When you're ready to publish your changes to the core package:

1. Navigate to the core package directory:
```bash
cd ../teaching-playground-core
```

2. Build the package:
```bash
pnpm build
```

3. Publish to npm:
```bash
pnpm publish --access public
```

4. Switch back to the main project directory and update to the new npm version:
```bash
cd ../wolfmed
pnpm core:npm
```

### Available Scripts

- `pnpm core:local` - Switch to local version of the core package
- `pnpm core:npm` - Switch to the npm version of the core package
- `pnpm core:dev` - Start the core package in development (watch) mode

### Project Structure

```
root/
├── wolfmed/               # Main project
└── teaching-playground-core/  # Core package
```

### Troubleshooting

If you encounter any issues:

1. Make sure both projects are properly installed:
```bash
cd teaching-playground-core && pnpm install
cd ../wolfmed && pnpm install
```

2. Clear the Next.js cache if needed:
```bash
rm -rf .next
```

3. Ensure you're running the correct version:
```bash
pnpm list @teaching-playground/core
```

Edukacja medyczna może być jeszcze łatwiejsza.
