# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.


<!--  reduse the app size  -->

Got it! If you want to **reduce the app size** without drastically changing your project or updating packages, here are **simpler, safer** actions that can help without the risk of breaking things. 😊

### 1. **Enable Hermes (if not already enabled)**

Hermes is a JavaScript engine optimized for React Native, and it can significantly reduce your app size.

#### How to enable Hermes:

1. Open **`app.json`** or **`app.config.js`**.

2. Make sure you have the following setting:

   ```json
   {
     "expo": {
       "jsEngine": "hermes"
     }
   }
   ```

3. Rebuild your app with `npx expo build:android` or `npx expo build:ios` (if using EAS Build, use `npx eas build`).

Hermes will automatically shrink your JavaScript bundle, reducing your app size.

---

### 2. **Compress and Optimize Images**

If you're using large images (e.g., PNGs or JPGs), converting them to **WebP** format can drastically reduce their size without much quality loss.

#### How to compress images:

1. **Use online tools** like [TinyPNG](https://tinypng.com) or [Squoosh](https://squoosh.app) to convert images to WebP.
2. Use **`expo-asset`** to handle assets:

   ```bash
   expo install expo-asset
   ```

   When using images, make sure you’re using compressed formats and manage them using **`expo-asset`** for better bundling.

---

### 3. **Remove Unused Assets and Dependencies**

If you have images, fonts, or libraries you're not using, removing them can help reduce the app size.

#### How to check for unused assets:

* Look through your **`assets`** folder and remove any unused image files.
* Run `expo doctor` to detect unused dependencies and remove them manually.

#### Remove unused packages:

1. Run `npm ls --depth=0` to list all installed packages.
2. Uninstall any packages that you don't need:

   ```bash
   npm uninstall <package-name>
   ```

---

### 4. **Use SVGs for Icons Instead of PNGs**

Switch from PNG/JPG icons to **SVG** icons. SVG files are smaller and more flexible.

To use **React Native SVG**, install the library:

```bash
expo install react-native-svg
```

Then replace PNGs with SVG components.

---

### 5. **Remove Console Logs and Debugging Code**

Debugging code like `console.log` can increase your bundle size, especially in production.

#### How to remove console logs:

1. Install `babel-plugin-transform-remove-console`:

   ```bash
   npm install babel-plugin-transform-remove-console --save-dev
   ```

2. In **`babel.config.js`**, add this:

   ```javascript
   module.exports = {
     presets: ['babel-preset-expo'],
     plugins: ['transform-remove-console'],
   };
   ```

This will remove all `console.log` statements from your production build.

---

### 6. **Use Production Build for Distribution**

Make sure you’re using the **production build** rather than a development build, which can be much larger.

Run:

```bash
npx expo build:android
npx expo build:ios
```

Production builds are optimized, whereas development builds include extra code for debugging and testing.

---

### 7. **Use `expo-splash-screen` for Custom Splash Screens**

If you have a custom splash screen with large images, consider using **`expo-splash-screen`** for optimized splash screen handling.

```bash
expo install expo-splash-screen
```

This way, the splash screen assets are handled more efficiently.

---

### Summary: Low-risk actions to reduce app size

1. **Enable Hermes engine** for JavaScript size reduction.
2. **Compress images** and use **WebP** for reduced size.
3. **Remove unused assets** and **dependencies**.
4. Use **SVGs** instead of PNGs for icons.
5. **Remove console logs** with Babel plugin.
6. Always build in **production mode** to reduce bundle size.

These actions should help you shrink the app size without having to touch critical package versions. Let me know if you need more details on any step! 😊

