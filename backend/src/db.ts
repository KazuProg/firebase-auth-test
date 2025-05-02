// src/db.ts
import sqlite3 from "sqlite3";
import dotenv from "dotenv";

dotenv.config(); // .envファイルから環境変数を読み込む

const dbFile = process.env.DATABASE_PATH || "./my_database.db"; // デフォルトパス

// エラー発生時に詳細なスタックトレースを表示するために verbose() を使用
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error("SQLiteデータベース接続エラー:", err.message);
  } else {
    console.log("SQLiteデータベースに接続しました:", dbFile);
    initializeDb(); // データベース初期化関数を呼び出し
  }
});

// テーブルを初期化する関数
const initializeDb = () => {
  // serialize で実行順序を保証
  db.serialize(() => {
    // user_data テーブルが存在しない場合のみ作成
    db.run(
      `
      CREATE TABLE IF NOT EXISTS user_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
      (err) => {
        if (err) {
          console.error("テーブル user_data の作成エラー:", err.message);
        } else {
          console.log(
            'テーブル "user_data" の準備完了 (存在しない場合は作成)。'
          );
        }
      }
    );
  });
};

// データベースインスタンスをエクスポート
export default db;
