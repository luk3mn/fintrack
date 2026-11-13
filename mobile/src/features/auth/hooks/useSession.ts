import { onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "@/config/firebase";

type SessionState = {
  user: User | null;
  ready: boolean;
};

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({
    user: auth.currentUser,
    ready: false,
  });

  useEffect(
    () => onAuthStateChanged(auth, (user) => setState({ user, ready: true })),
    [],
  );

  return state;
}
