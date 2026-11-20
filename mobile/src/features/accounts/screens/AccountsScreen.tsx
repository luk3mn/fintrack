import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { useThemeColors } from "@/theme/tokens";
import { AccountListRow } from "../components/AccountListRow";
import { AccountsHeader } from "../components/AccountsHeader";
import { AccountsHero } from "../components/AccountsHero";
import { ConnectionRow } from "../components/ConnectionRow";
import { SectionTitle } from "../components/SectionTitle";
import { useAccountsScreen } from "../hooks/useAccountsScreen";

const TOP_PADDING = 24;

export function AccountsScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const {
    accounts,
    connections,
    summary,
    lastSync,
    isLoading,
    isError,
    isConnectionsLoading,
    isConnectionsError,
    isRefetching,
    refetch,
  } = useAccountsScreen();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={colors.muted} />
      </View>
    );
  }

  if (isError) {
    return (
      <View
        className="flex-1 items-center justify-center gap-4 bg-background px-6"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-center text-base text-muted">
          Não foi possível carregar suas contas.
        </Text>
        <View className="w-full">
          <Button title="Tentar novamente" onPress={() => refetch()} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top > 0 ? insets.top + 12 : TOP_PADDING,
        paddingBottom: insets.bottom + 80,
      }}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => {
            void refetch();
          }}
          tintColor={colors.muted}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View className="px-4">
        <AccountsHeader lastSync={lastSync} loading={isConnectionsLoading} />

        <View className="pt-3">
          <AccountsHero summary={summary} />
        </View>

        <View className="pt-6">
          <SectionTitle title="Conexões" />
        </View>

        <View className="pt-1">
          {isConnectionsLoading ? (
            <Text className="px-1 py-2 text-xs text-muted">
              Carregando conexões…
            </Text>
          ) : isConnectionsError ? (
            <Text className="px-1 py-2 text-xs text-muted">
              Não foi possível carregar as conexões.
            </Text>
          ) : connections.length === 0 ? (
            <Text className="px-1 py-2 text-xs text-muted">
              Nenhuma conexão ativa.
            </Text>
          ) : (
            connections.map((connection, index) => (
              <ConnectionRow
                key={connection.id}
                connection={connection}
                first={index === 0}
              />
            ))
          )}
        </View>

        <View className="pt-6">
          <SectionTitle title="Contas" />
        </View>

        <View className="pt-1">
          {accounts.length === 0 ? (
            <Text className="px-1 py-2 text-xs text-muted">
              Nenhuma conta encontrada.
            </Text>
          ) : (
            accounts.map((account) => (
              <AccountListRow key={account.id} account={account} />
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}
