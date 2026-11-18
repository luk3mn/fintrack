const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);
const nativewindConfig = withNativewind(config);

// NativeWind v5 redirects every `react-native` import to its component shim
// (`react-native-css/components`), which is a hand-maintained list of exports.
// That list is missing `AssetRegistry` (added to React Native 0.88), so
// `expo-asset` receives `undefined` and crashes with
// "Cannot read property 'getAssetByID' of undefined".
// Keep the shim for app code (so `className` works), but let dependencies in
// node_modules import the real `react-native`.
// Remove once https://github.com/nativewind/react-native-css/pull/504 is released.
const resolveWithNativewind = nativewindConfig.resolver.resolveRequest;

nativewindConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  const fromDependency = context.originModulePath.includes("node_modules");
  const fromNativewind =
    context.originModulePath.includes("react-native-css") ||
    context.originModulePath.includes("nativewind");

  if (moduleName === "react-native" && fromDependency && !fromNativewind) {
    return context.resolveRequest(context, moduleName, platform);
  }

  return resolveWithNativewind(context, moduleName, platform);
};

module.exports = nativewindConfig;
