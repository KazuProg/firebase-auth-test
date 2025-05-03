import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleSignUp } from "../firebase";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const signUp = async () => {
    try {
      await handleSignUp(email, password);
      navigate("/dashboard");
    } catch (error: unknown) {
      console.error("登録エラー:", error);
    }
  };

  return (
    <div>
      <h2>新規登録</h2>
      <div>
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
    </div>
  );
};

export default SignUp;
