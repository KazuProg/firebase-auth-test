# Firebase Auth Test (backend)

[Firebase Console](https://console.firebase.google.com/)の`プロジェクトの設定`->`サービスアカウント`から、秘密鍵を生成し、`firebase-service-account.json`へ保存する

`.env`

```.env
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
PORT=3001
DATABASE_PATH=./my_database.db
```
