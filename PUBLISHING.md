# Publishing to NPM Guide

This guide will help you publish your `@mattc/capacitor-plugin-msauth` package to npm.

## Prerequisites

1. **npm Account**: You need an npm account. If you don't have one:
   - Go to [npmjs.com](https://www.npmjs.com/)
   - Click "Sign Up" and create an account
   - Verify your email address

2. **Login to npm CLI**:
   ```bash
   npm login
   ```
   Enter your username, password, and email when prompted.

## Pre-Publishing Checklist

✅ Package name updated to `@mattc/capacitor-plugin-msauth`
✅ Version bumped to `3.7.0` 
✅ Description updated to reflect fork status
✅ Author updated to your name
✅ Repository URLs updated (you may need to create the GitHub repo)
✅ Keywords added for discoverability
✅ .npmignore file created
✅ Build process working
✅ Linting and formatting complete

## Publishing Steps

1. **Final Check**: Run prepublish checks:
   ```bash
   npm run prepublishOnly
   ```

2. **Dry Run**: Test what will be published without actually publishing:
   ```bash
   npm publish --dry-run
   ```

3. **Publish**: Actually publish to npm:
   ```bash
   npm publish --access public
   ```
   (The `--access public` flag is required for scoped packages like `@mattc/...`)

## Post-Publishing

1. **Verify**: Check your package on npmjs.com:
   - Visit: https://www.npmjs.com/package/@mattc/capacitor-plugin-msauth

2. **Test Installation**: In a test project:
   ```bash
   npm install @mattc/capacitor-plugin-msauth
   ```

## Version Management

For future updates:
1. Make your changes
2. Update the version in package.json:
   ```bash
   npm version patch  # for bug fixes (3.7.0 → 3.7.1)
   npm version minor  # for new features (3.7.0 → 3.8.0)
   npm version major  # for breaking changes (3.7.0 → 4.0.0)
   ```
3. Run `npm publish --access public` again

## Notes

- **GitHub Repository**: Make sure to create the GitHub repository at https://github.com/mattc/capacitor-plugin-msauth
- **License**: Currently set to LGPL-3.0 (same as original). You may want to verify this is appropriate for your fork.
- **Scoped Package**: Using `@mattc/` scope helps avoid naming conflicts with the original package

## Troubleshooting

- If you get authentication errors, run `npm login` again
- If the package name is taken, you may need to choose a different scope or name
- For more help, see [npm documentation](https://docs.npmjs.com/cli/v8/commands/npm-publish)
