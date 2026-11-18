import "../global.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { useSession } from "@/features/auth/hooks/useSession";
import { queryClient } from "@/lib/queryClient";

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
      </Stack.Protected>
      <Stack.Protected guard={!user} redirectTo="/">
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={DarkTheme}>
        <StatusBar style="light" />
        <RootNavigator />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
