import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router/js-tabs";
import { useThemeColors } from "@/theme/tokens";

export default function TabsLayout() {
  const colors = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.foreground },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Visão geral",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="wallet-outline"
              color={typeof color === "string" ? color : colors.muted}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: "Contas",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="grid-outline"
              color={typeof color === "string" ? color : colors.muted}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="investments"
        options={{
          title: "Investir",
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="pie-chart-outline"
              color={typeof color === "string" ? color : colors.muted}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}
