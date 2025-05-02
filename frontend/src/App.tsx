import { useState, useEffect } from "react";
import "./App.css";
import {
  auth,
  handleSignUp as signUpWithEmailPassword,
  handleSignIn as signInWithEmailPassword,
  handleSignOut,
} from "./firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { User } from "firebase/auth";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      // ログイン成功時の処理 (必要に応じて)
    } catch (error: unknown) {
      let errorMessage = "Googleログインに失敗しました";
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("Googleログインエラー:", errorMessage);
      } else {
        console.error("Googleログインエラー:", error);
      }
      // エラー処理 (必要に応じて)
    }
  };

  const signUp = async () => {
    try {
      await signUpWithEmailPassword(email, password);
      // 登録成功時の処理 (必要に応じて)
    } catch (error: unknown) {
      let errorMessage = "登録に失敗しました";
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("登録エラー:", errorMessage);
      } else {
        console.error("登録エラー:", error);
      }
      // エラー処理 (必要に応じて)
    }
  };

  const signIn = async () => {
    try {
      await signInWithEmailPassword(email, password);
      // ログイン成功時の処理 (必要に応じて)
    } catch (error: unknown) {
      let errorMessage = "ログインに失敗しました";
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("ログインエラー:", errorMessage);
      } else {
        console.error("ログインエラー:", error);
      }
      // エラー処理 (必要に応じて)
    }
  };

  const signOut = async () => {
    try {
      await handleSignOut();
      // ログアウト成功時の処理 (必要に応じて)
    } catch (error: unknown) {
      let errorMessage = "ログアウトに失敗しました";
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("ログアウトエラー:", errorMessage);
      } else {
        console.error("ログアウトエラー:", error);
      }
      // エラー処理 (必要に応じて)
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Firebase Authentication Test</h1>

      <div>
        <h2>現在のログイン情報</h2>
        {currentUser ? (
          <p>ログイン中のユーザー: {currentUser.email}</p>
        ) : (
          <p>ログインしていません。</p>
        )}
      </div>

      {currentUser ? (
        <div>
          <h2>ログアウト</h2>
          <button onClick={signOut}>ログアウト</button>
        </div>
      ) : (
        <div>
          <h2>ログイン</h2>
          <div>
            <button onClick={signInWithGoogle}>Googleでログイン</button>
          </div>
          <div>
            <h3>メールアドレスで登録</h3>
            <input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={signUp}>登録</button>
          </div>
          <div>
            <h3>メールアドレスでログイン</h3>
            <input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={signIn}>ログイン</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
