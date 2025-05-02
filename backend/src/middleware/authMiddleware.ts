// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import * as admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Firebase Admin SDK を一度だけ初期化
try {
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!serviceAccountPath) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_PATH が .env ファイルに定義されていません。"
    );
  }
  // require を使って JSON ファイルを読み込む (tsconfig の resolveJsonModule: true が必要)
  // require.resolve でカレントディレクトリ基準のパス解決を確実にする
  const serviceAccount = require(require.resolve(serviceAccountPath, {
    paths: [process.cwd()],
  }));

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("Firebase Admin SDK が正常に初期化されました。");
} catch (error: any) {
  console.error("Firebase Admin SDK の初期化エラー:", error.message);
  // SDKがないと認証が機能しないため、プロセスを終了するか適切に処理
  process.exit(1);
}

// 認証ミドルウェア関数
export const firebaseAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authorizationHeader = req.headers.authorization;

  // Authorization ヘッダーが存在し、'Bearer 'で始まるかチェック
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    res.status(401).json({
      message: "認証が必要です: トークンがありません、または形式が無効です。",
    });
    return;
  }

  // 'Bearer ' 部分を除去してトークンを取得
  const idToken = authorizationHeader.split("Bearer ")[1];

  try {
    // Firebase Admin SDK を使って ID トークンを検証
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // 検証成功: デコードされたトークン情報 (特に uid) をリクエストオブジェクトに追加
    // (型定義を拡張した場合、req.user でアクセス可能)
    req.user = decodedToken;
    console.log(`トークン検証成功: ユーザーID ${decodedToken.uid}`);

    // 次のミドルウェアまたはルートハンドラへ処理を移す
    next();
  } catch (error: any) {
    console.error("Firebase ID トークンの検証エラー:", error);
    // エラーの種類に応じて適切なステータスコードとメッセージを返す
    if (error.code === "auth/id-token-expired") {
      res
        .status(401)
        .json({ message: "認証エラー: トークンの有効期限が切れています。" });
      return;
    }
    res.status(403).json({ message: "認証エラー: 無効なトークンです。" });
    return;
  }
};
