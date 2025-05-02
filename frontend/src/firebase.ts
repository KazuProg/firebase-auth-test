import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  Auth,
} from "firebase/auth";
import { FirebaseOptions } from "firebase/app";

// Firebaseコンソールからコピーした設定オブジェクト
const firebaseConfig: FirebaseOptions = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
};

// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig);

// 認証オブジェクトを取得
export const auth: Auth = getAuth(app);

// サインアップ（登録）処理
export const handleSignUp = async (
  email: string,
  password: string,
  authInstance: Auth = auth
): Promise<void> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      authInstance,
      email,
      password
    );
    console.log("ユーザー登録成功:", userCredential.user);
  } catch (error: unknown) {
    let errorMessage = "不明なエラーが発生しました";
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error("ユーザー登録エラー:", errorMessage);
    } else {
      console.error("ユーザー登録エラー:", error);
    }
    throw error; // エラーをコンポーネント側で処理できるように再スロー
  }
};

// サインイン（ログイン）処理
export const handleSignIn = async (
  email: string,
  password: string,
  authInstance: Auth = auth
): Promise<void> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      authInstance,
      email,
      password
    );
    console.log("ログイン成功:", userCredential.user);
  } catch (error: unknown) {
    let errorMessage = "不明なエラーが発生しました";
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error("ログインエラー:", errorMessage);
    } else {
      console.error("ログインエラー:", error);
    }
    throw error; // エラーをコンポーネント側で処理できるように再スロー
  }
};

// サインアウト（ログアウト）処理
export const handleSignOut = async (
  authInstance: Auth = auth
): Promise<void> => {
  try {
    await firebaseSignOut(authInstance);
    console.log("ログアウト成功");
  } catch (error: unknown) {
    let errorMessage = "不明なエラーが発生しました";
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error("ログアウトエラー:", errorMessage);
    } else {
      console.error("ログアウトエラー:", error);
    }
    throw error; // エラーをコンポーネント側で処理できるように再スロー
  }
};
