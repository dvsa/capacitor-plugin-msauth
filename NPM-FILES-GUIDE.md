# NPM Files Configuration Guide

This guide explains how to control which files are published to npm for your Capacitor plugin.

## Current Configuration

```json
"files": [
  "android/src/main/",
  "android/build.gradle", 
  "dist/",
  "ios/Plugin/",
  "RecognizebvCapacitorPluginMsauth.podspec"
]
```

## What Gets Published

### ✅ **Always Included (automatic)**
- `package.json` - Package metadata
- `README.md` - Documentation  
- `LICENSE` - License file
- Files referenced in `main`, `module`, `types`, `unpkg` fields

### ✅ **Explicitly Included (via files field)**
- `android/src/main/` - Android native source code
- `android/build.gradle` - Android build configuration
- `dist/` - All compiled TypeScript output
- `ios/Plugin/` - iOS native source code
- `DvsaCapacitorPluginMsauth.podspec` - iOS CocoaPods spec

### ❌ **Always Excluded**
- `node_modules/` 
- `.git/`
- Files matching `.npmignore` patterns
- Development files (tests, source TypeScript, etc.)

## Alternative Configurations

### **More Restrictive (Smaller Package)**
```json
"files": [
  "android/src/main/java/",
  "android/src/main/AndroidManifest.xml", 
  "android/build.gradle",
  "dist/esm/",
  "dist/plugin.js",
  "dist/plugin.cjs.js",
  "ios/Plugin/*.swift",
  "ios/Plugin/*.h",
  "ios/Plugin/*.m",
  "ios/Plugin/Info.plist",
  "*.podspec"
]
```

### **Using Glob Patterns**
```json
"files": [
  "android/src/main/**/*",
  "android/build.gradle",
  "dist/**/*",
  "ios/Plugin/**/*", 
  "*.podspec"
]
```

### **Include Specific File Types Only**
```json
"files": [
  "android/**/*.java",
  "android/**/*.xml",
  "android/build.gradle",
  "dist/**/*.js",
  "dist/**/*.d.ts", 
  "ios/**/*.swift",
  "ios/**/*.h",
  "ios/**/*.m",
  "ios/**/*.plist",
  "*.podspec"
]
```

## Checking What Will Be Published

### **1. Dry Run (recommended)**
```bash
npm publish --dry-run
```

### **2. Pack and Inspect**
```bash
npm pack
tar -tzf dvsa-capacitor-plugin-msauth-1.0.0.tgz
```

### **3. Pack Dry Run**
```bash
npm pack --dry-run
```

## Common Exclusions (.npmignore)

Your current `.npmignore` already excludes development files:
```
src/
*.ts
!*.d.ts
tsconfig.json
rollup.config.mjs
**/__tests__/
node_modules/
.DS_Store
*.log
# ... etc
```

## File Size Optimization

Current package stats:
- **Compressed**: 17.1 kB
- **Uncompressed**: 71.5 kB  
- **Files**: 33

To reduce size further, you could:
1. Exclude source maps: Add `**/*.map` to `.npmignore`
2. Exclude test files: Add `**/*test*` to `.npmignore`  
3. Be more selective with Android resources

## Verification Commands

After changing the `files` field:

```bash
# Check what will be published
npm publish --dry-run

# Create local package for testing
npm pack

# Test installation from local package
npm install ./dvsa-capacitor-plugin-msauth-1.0.0.tgz
```

## Best Practices

1. **Include only necessary runtime files**
2. **Exclude development dependencies and tooling**
3. **Test package installation before publishing**
4. **Use `.npmignore` for broad exclusions**
5. **Use `files` field for explicit inclusions**
6. **Keep package size reasonable (<50KB compressed is ideal)**

Your current configuration strikes a good balance between completeness and size!
