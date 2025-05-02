// src/server.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db"; // 初期化されたデータベース接続をインポート
import { firebaseAuthMiddleware } from "./middleware/authMiddleware"; // 認証ミドルウェアをインポート

// ------------------ ここから express.d.ts の内容 ------------------
import * as admin from "firebase-admin";
declare module "express" {
  interface Request {
    user?: admin.auth.DecodedIdToken;
    customProperty?: {
      userId: string;
    };
  }
}
// ------------------ ここまで express.d.ts の内容 ------------------

// .envファイルから環境変数をロード
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// --- ミドルウェア設定 ---
// CORS を有効にする (必要に応じてオリジンを制限)
app.use(cors());
// JSON形式のリクエストボディをパースできるようにする
app.use(express.json());

// --- ルート定義 ---

// テスト用ルート (認証不要)
app.get("/", (req: Request, res: Response) => {
  res.send("バックエンドサーバーが起動しています！");
});

// メッセージを保存するルート (認証が必要)
// POST /api/messages
app.post(
  "/api/messages",
  firebaseAuthMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    // firebaseAuthMiddleware で req.user が設定されているはず
    const userId = req.user?.uid;
    const { message } = req.body; // リクエストボディから message を取得

    // ユーザーIDが取得できない場合 (念のため)
    if (!userId) {
      res
        .status(401)
        .json({ message: "トークンからユーザーIDを取得できませんでした。" });
      return;
    }

    // message のバリデーション
    if (!message || typeof message !== "string" || message.trim() === "") {
      res.status(400).json({
        message: "リクエストボディに有効なメッセージが含まれていません。",
      });
      return;
    }

    // SQLインジェクションを防ぐためにプレースホルダ (?) を使用
    const sql = `INSERT INTO user_data (user_id, message) VALUES (?, ?)`;

    // データベースにデータを挿入
    // function() を使うことで this.lastID が利用可能になる
    db.run(sql, [userId, message], function (err) {
      if (err) {
        console.error("データベースへの挿入エラー:", err.message);
        return res.status(500).json({
          message: "メッセージの保存中にサーバーエラーが発生しました。",
        });
      }
      console.log(
        `メッセージを保存しました。ユーザーID: ${userId}, 行ID: ${this.lastID}`
      );
      // 成功レスポンス (作成されたリソースの情報を含めると良い)
      res
        .status(201)
        .json({ id: this.lastID, userId: userId, message: message });
    });
  }
);

// 特定ユーザーのメッセージを取得するルート (認証が必要)
// GET /api/messages
app.get(
  "/api/messages",
  firebaseAuthMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.uid;

    if (!userId) {
      res
        .status(401)
        .json({ message: "トークンからユーザーIDを取得できませんでした。" });
      return;
    }

    // ユーザーIDに紐づくメッセージをタイムスタンプの降順で取得
    const sql = `SELECT id, user_id, message, timestamp FROM user_data WHERE user_id = ? ORDER BY timestamp DESC`;

    // データベースからデータを取得
    db.all(sql, [userId], (err, rows) => {
      if (err) {
        console.error("データベースからの取得エラー:", err.message);
        return res.status(500).json({
          message: "メッセージの取得中にサーバーエラーが発生しました。",
        });
      }
      console.log(`ユーザーID ${userId} のメッセージを取得しました。`);
      // 成功レスポンス (取得したデータの配列)
      res.status(200).json(rows);
    });
  }
);

// --- エラーハンドリングミドルウェア ---
// すべてのルートの後に定義する基本的なエラーハンドラ
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("未処理のエラー:", err.stack); // エラーの詳細をログに出力
  res.status(500).json({ message: "サーバー内部でエラーが発生しました。" });
});

// --- サーバー起動 ---
app.listen(port, () => {
  console.log(
    `サーバーがポート ${port} で起動しました: http://localhost:${port}`
  );
});

// --- Graceful Shutdown (任意だが推奨) ---
// Ctrl+C などでプロセスが終了する際にDB接続を閉じる
process.on("SIGINT", () => {
  console.log("SIGINT シグナル受信: データベース接続を閉じています...");
  db.close((err) => {
    if (err) {
      console.error("データベース切断エラー:", err.message);
    } else {
      console.log("データベース接続が閉じられました。");
    }
    process.exit(0); // プロセスを正常終了
  });
});
