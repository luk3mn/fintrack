import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import * as firebaseAuth from "firebase/auth";
import { env } from "./env";

type PersistenceFactory = (
  storage: typeof AsyncStorage,
) => firebaseAuth.Persistence;

const { getReactNativePersistence } = firebaseAuth as unknown as {
  getReactNativePersistence: PersistenceFactory;
};

const app = getApps().length ? getApp() : initializeApp(env.firebase);

function createAuth() {
  try {
    return firebaseAuth.initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return firebaseAuth.getAuth(app);
  }
}

export const auth = createAuth();
