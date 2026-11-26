import "../global.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo } from "react";
import { useColorScheme } from "react-native";
import { useSession } from "@/features/auth/hooks/useSession";
import { queryClient } from "@/lib/queryClient";
import { themes } from "@/theme/tokens";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { user, ready } = useSession();

  useEffect(() => {
    if (!ready) return;

    if (!user) queryClient.clear();

    SplashScreen.hideAsync();
  }, [ready, user]);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!user} redirectTo="/login">
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="spending" />
      </Stack.Protected>
      <Stack.Protected guard={!user} redirectTo="/">
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const theme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    const colors = isDark ? themes.dark : themes.light;

    return {
      ...base,
      colors: {
        ...base.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.card,
        text: colors.foreground,
        border: colors.border,
        notification: colors.danger,
      },
    };
  }, [isDark]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={theme}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <RootNavigator />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
