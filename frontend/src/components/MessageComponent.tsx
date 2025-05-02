import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  useCallback,
} from "react";
import axios, { AxiosResponse, AxiosError } from "axios";

interface Message {
  id: number;
  user_id: string;
  message: string;
  timestamp: string;
}

interface ErrorResponse {
  message: string;
}

interface Props {
  authToken: string | null;
}

const API_BASE_URL = "http://localhost:3001/api"; // バックエンドのAPIベースURL

const MessageComponent: React.FC<Props> = ({ authToken }) => {
  const [newMessage, setNewMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string>("");

  const fetchMessages = useCallback(async () => {
    setError("");
    if (!authToken) {
      console.log(
        "認証トークンが存在しないため、メッセージの取得をスキップします。"
      );
      return;
    }
    try {
      const response: AxiosResponse<Message[]> = await axios.get(
        `${API_BASE_URL}/messages`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setMessages(response.data);
    } catch (err) {
      console.error("メッセージの取得エラー:", err);
      setError("メッセージの取得に失敗しました。");
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ErrorResponse>;
        if (axiosError.response?.status === 401) {
          setError("認証が必要です。トークンが無効です。");
        } else if (axiosError.message) {
          setError(axiosError.message);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      }
    }
  }, [authToken]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    if (!newMessage.trim()) {
      setError("メッセージを入力してください。");
      return;
    }
    if (!authToken) {
      setError("認証トークンが存在しません。");
      return;
    }

    try {
      const response: AxiosResponse<Message> = await axios.post(
        `${API_BASE_URL}/messages`,
        { message: newMessage },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("メッセージ送信成功:", response.data);
      setNewMessage("");
      fetchMessages();
    } catch (err) {
      console.error("メッセージの送信エラー:", err);
      setError("メッセージの送信に失敗しました。");
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ErrorResponse>;
        if (axiosError.response?.status === 401) {
          setError("認証が必要です。トークンが無効です。");
        } else if (axiosError.response?.status === 400) {
          setError(
            axiosError.response.data?.message || "無効なメッセージです。"
          );
        } else if (axiosError.message) {
          setError(axiosError.message);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      }
    }
  };

  const handleNewMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setNewMessage(event.target.value);
  };

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div>
        <label htmlFor="newMessage">メッセージ:</label>
        <input
          type="text"
          id="newMessage"
          value={newMessage}
          onChange={handleNewMessageChange}
        />
        <button type="submit" onClick={handleSendMessage} disabled={!authToken}>
          送信
        </button>
      </div>
      <h2>メッセージ一覧</h2>
      <ul>
        {messages.map((msg) => (
          <li key={msg.id}>
            {msg.message} (ユーザーID: {msg.user_id}, 送信日時:{" "}
            {new Date(msg.timestamp).toLocaleString()})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MessageComponent;
