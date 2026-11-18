import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { signOut } from "@/features/auth/api/auth";
import { AccountRow } from "../components/AccountRow";
import { BalanceCard } from "../components/BalanceCard";
import { useOverview } from "../hooks/useOverview";

export function OverviewScreen() {
  const { accounts, summary, isLoading, isError, isRefetching, refetch } =
    useOverview();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-950">
        <ActivityIndicator color="#a1a1aa" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-zinc-950 px-6">
        <Text className="text-center text-base text-zinc-300">
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
      className="flex-1 bg-zinc-950"
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => {
            void refetch();
          }}
          tintColor="#a1a1aa"
        />
      }
    >
      <View className="gap-6 p-4">
        <BalanceCard summary={summary} />

        <View className="gap-2">
          <Text className="text-sm font-medium uppercase tracking-wide text-zinc-400">
            Contas
          </Text>
          <View className="overflow-hidden rounded-2xl bg-zinc-900">
            {accounts.map((account, index) => (
              <AccountRow
                key={account.id}
                account={account}
                divider={index > 0}
              />
            ))}
          </View>
        </View>

        <Button title="Sair" variant="secondary" onPress={() => signOut()} />
      </View>
    </ScrollView>
  );
}
