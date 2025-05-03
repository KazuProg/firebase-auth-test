import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, handleSignIn } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate("/dashboard");
    } catch (error: unknown) {
      console.error("Googleログインエラー:", error);
    }
  };

  const signIn = async () => {
    try {
      await handleSignIn(email, password);
      navigate("/dashboard");
    } catch (error: unknown) {
      console.error("ログインエラー:", error);
    }
  };

  return (
    <div>
      <h2>ログイン</h2>
      <div>
        <button onClick={signInWithGoogle}>Googleでログイン</button>
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
  );
};

export default Login;
