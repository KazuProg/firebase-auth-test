import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, handleSignOut } from "../firebase";
import MessageComponent from "./MessageComponent";

const Dashboard = () => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/login");
      } else {
        user.getIdToken().then((token) => {
          setAuthToken(token);
        });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const signOut = async () => {
    try {
      await handleSignOut();
      navigate("/login");
    } catch (error: unknown) {
      console.error("ログアウトエラー:", error);
    }
  };

  return (
    <div>
      <h1>ダッシュボード</h1>
      <div>
        <h2>メッセージボード</h2>
        {authToken ? <MessageComponent authToken={authToken} /> : ""}
        <button onClick={signOut}>ログアウト</button>
      </div>
    </div>
  );
};

export default Dashboard;
