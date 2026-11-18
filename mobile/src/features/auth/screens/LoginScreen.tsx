import { zodResolver } from "@hookform/resolvers/zod";
import { FirebaseError } from "firebase/app";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
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

export function LoginScreen() {
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
      className="flex-1 justify-center bg-zinc-950 px-6"
    >
      <View className="mb-10 gap-2">
        <Text className="text-3xl font-bold text-zinc-50">FinTrack</Text>
        <Text className="text-base text-zinc-400">
          Entre para ver suas finanças.
        </Text>
      </View>

      <View className="gap-4">
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
          <Text className="text-sm text-red-400">{submitError}</Text>
        ) : null}

        <Button title="Entrar" onPress={onSubmit} loading={isSubmitting} />
      </View>
    </KeyboardAvoidingView>
  );
}
