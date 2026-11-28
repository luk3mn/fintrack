import { Text } from "react-native";
import { relativeSyncLabel } from "@/lib/dates";
import { useThemeColors } from "@/theme/tokens";

type Props = {
  lastSync?: Date;
  loading?: boolean;
  /** Optional override for tabs that use their own color palette. */
  color?: string;
};

/** Text-only sync label, reusable across tabs. */
export function SyncStatus({ lastSync, loading = false, color }: Props) {
  const theme = useThemeColors();
  const label = loading ? "Sincronizando…" : relativeSyncLabel(lastSync);

  return (
    <Text
      numberOfLines={1}
      accessibilityLabel={`Status de sincronização: ${label}`}
      className="text-xs"
      style={{ color: color ?? theme.muted }}
    >
      {label}
    </Text>
  );
}
