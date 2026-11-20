import { zodResolver } from "@hookform/resolvers/zod";
import { FirebaseError } from "firebase/app";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TextField } from "@/components/ui/TextField";
import { useThemeColors } from "@/theme/tokens";
import { signIn } from "../api/auth";
import { loginSchema, type LoginInput } from "../schemas/login";

const CREDENTIAL_ERRORS = new Set([
  "auth/invalid-credential",
  "auth/wrong-password",
  "auth/user-not-found",
  "auth/invalid-email",
]);

function messageFor(error: unknown) {
  if (error instanceof FirebaseError) {
    if (CREDENTIAL_ERRORS.has(error.code)) return "E-mail ou senha incorretos.";
    if (error.code === "auth/too-many-requests") {
      return "Muitas tentativas. Tente novamente em alguns minutos.";
    }
    if (error.code === "auth/network-request-failed") {
      return "Sem conexão. Verifique sua internet.";
    }
  }

  return "Não foi possível entrar. Tente novamente.";
}

function SparkleIcon({ color }: { color: string }) {
  return (
    <Svg width={28} height={28} viewBox="0 0 32 32" fill="none">
      <Path
        d="M16 2C16.9 10.6 21.4 15.1 30 16C21.4 16.9 16.9 21.4 16 30C15.1 21.4 10.6 16.9 2 16C10.6 15.1 15.1 10.6 16 2Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function LoginScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setSubmitError(null);

    try {
      await signIn(email, password);
    } catch (error) {
      setSubmitError(messageFor(error));
    }
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-background"
    >
      <View style={{ paddingTop: insets.top + 16 }} className="px-5">
        <Text className="text-2xl font-semibold text-foreground">
          FinTrack
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 20,
          paddingVertical: 32,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center">
          <View className="h-22 w-22 items-center justify-center rounded-3xl bg-card">
            <SparkleIcon color={colors.accent} />
          </View>
        </View>

        <View className="pl-5 pt-10">
          <Text className="text-2xl font-semibold leading-7 text-foreground">
            Seu dinheiro, protegido.
          </Text>
          <Text className="pt-2 text-xs text-muted">
            Acesso privado aos seus dados financeiros.
          </Text>
        </View>

        <View className="gap-4 pt-8">
          <Controller
            control={control}
            name="email"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextField
                label="E-mail"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextField
                label="Senha"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                autoCapitalize="none"
                autoComplete="current-password"
                secureTextEntry
                textContentType="password"
              />
            )}
          />

          {submitError ? (
            <Text className="text-sm text-danger">{submitError}</Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Entrar"
            disabled={isSubmitting}
            onPress={() => {
              void onSubmit();
            }}
            className={`mt-2 h-13 items-center justify-center rounded-xl bg-accent active:opacity-80 ${isSubmitting ? "opacity-50" : ""}`}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.foreground} />
            ) : (
              <Text className="text-sm font-semibold text-foreground">
                Entrar
              </Text>
            )}
          </Pressable>
        </View>

        <Text className="pt-8 text-center text-xs text-subtle">
          Acesso protegido com criptografia e biometria
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
