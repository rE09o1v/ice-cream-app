"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  runTransaction,
  addDoc,
  getDoc,
  deleteDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import {
  Wifi,
  BatteryFull,
  X,
  ShoppingCart,
  User,
  Ticket,
  BarChart2,
  AlertTriangle,
  Lock,
  QrCode,
  CheckCircle,
  Camera,
} from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

// --- Firebaseの初期設定 ---
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-x6D3zA8o9LNXTpMjQK142Lw66z549PA",
  authDomain: "f-ice-913c7.firebaseapp.com",
  projectId: "f-ice-913c7",
  storageBucket: "f-ice-913c7.firebasestorage.app",
  messagingSenderId: "966826031567",
  appId: "1:966826031567:web:85b08aab43d2e0eb303aba",
  measurementId: "G-NBN18MQRPC"
};

// --- Firebaseアプリの初期化 ---
// 設定が有効な場合のみ初期化
let app;
let db;
if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

// --- ダミーデータ設定用の関数 ---
// 初回実行時にFirestoreにサンプルデータを作成します。
const setupInitialData = async () => {
  if (!db) return; // DBが初期化されていなければ何もしない
  console.log("初期データのセットアップを確認します...");
  
  // データをリセットする場合は、この行をコメントアウトしてください
  //await deleteDoc(doc(db, "metadata", "setupComplete"));
  
  const metadataDoc = await getDoc(doc(db, "metadata", "setupComplete"));
  if (!metadataDoc.exists()) {
    console.log("初期データを作成します...");
    const initialProducts = [
      {
        id: "vanilla",
        name: "濃厚バニラ",
        price: 300,
        stock: 50,
        imageUrl: "/images/choco-mint.jpg",
      },
      {
        id: "chocolate",
        name: "とろけるチョコ",
        price: 350,
        stock: 50,
        imageUrl: "https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400&h=300&fit=crop",
      },
      {
        id: "strawberry",
        name: "果肉いちご",
        price: 350,
        stock: 40,
        imageUrl: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&h=300&fit=crop",
      },
      {
        id: "matcha",
        name: "本格抹茶",
        price: 400,
        stock: 30,
        imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
      },
    ];
    await runTransaction(db, async (transaction) => {
      initialProducts.forEach((prod) => {
        transaction.set(doc(db, "products", prod.id), prod);
      });
      transaction.set(doc(db, "metadata", "setupComplete"), { done: true });
      transaction.set(doc(db, "metadata", "latestOrder"), { number: 0 });
    });
    console.log("初期データを作成しました。");
  } else {
    console.log("データは既に存在します。");
  }
};

// --- 管理画面ログインモーダル ---
const AdminLoginModal = ({ isOpen, onClose, onLogin }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // パスワードをチェック（デフォルト: "admin123"）
    const correctPassword = "staff1fstd";
    
    if (password === correctPassword) {
      // ログイン成功
      onLogin();
      setPassword("");
    } else {
      setError("パスワードが正しくありません");
    }
    
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/70 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-6">
          <Lock className="mx-auto h-12 w-12 text-blue-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">管理者認証</h2>
          <p className="text-gray-600 mt-2">管理画面にアクセスするにはパスワードを入力してください</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="パスワードを入力"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "認証中..." : "ログイン"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- ヘッダーコンポーネント ---
const AppHeader = ({ page, setPage, onAdminClick }) => (
  <header className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-40">
    <div className="container mx-auto px-4 py-3">
      <div className="flex justify-between items-center">
        <div className="text-xl font-bold text-gray-800">🍦 Welcome to 1-F_BlueSeal</div>
      </div>
    </div>
    <nav className="bg-gray-100">
      <div className="container mx-auto px-4 flex justify-around">
        <button
          onClick={() => setPage("customer")}
          className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 ${
            page === "customer"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600"
          }`}
        >
          <ShoppingCart size={16} /> 注文
        </button>
        <button
          onClick={onAdminClick}
          className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 ${
            page === "admin"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600"
          }`}
        >
          <BarChart2 size={16} /> 管理
        </button>
      </div>
    </nav>
  </header>
);

// --- 商品カードコンポーネント ---
const ProductCard = ({ product, onAddToCart }) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
    <Image
      src={product.imageUrl}
      alt={product.name}
      width={400}
      height={160}
      className="w-full h-40 object-cover"
    />
    <div className="p-4">
      <h3 className="text-lg font-bold text-gray-800">{product.name}</h3>
      <p className="text-xl font-light text-gray-700 mt-1">¥{product.price}</p>
      <p
        className={`text-sm font-semibold mt-2 ${
          product.stock > 10
            ? "text-green-600"
            : product.stock > 0
            ? "text-yellow-600"
            : "text-red-600"
        }`}
      >
        在庫: {product.stock > 0 ? `あと ${product.stock} 個` : "売り切れ"}
      </p>
      <button
        onClick={() => onAddToCart(product)}
        disabled={product.stock === 0}
        className="w-full mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center gap-2"
      >
        <ShoppingCart size={16} />
        <span>カートに入れる</span>
      </button>
    </div>
  </div>
);

// --- カートモーダル ---
const CartModal = ({ cart, setCart, onCheckout }) => {
  if (Object.keys(cart).length === 0) return null;

  const totalAmount = Object.values(cart).reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalItems = Object.values(cart).reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const updateQuantity = (productId, delta) => {
    const newCart = { ...cart };
    if (newCart[productId]) {
      newCart[productId].quantity += delta;
      if (newCart[productId].quantity <= 0) {
        delete newCart[productId];
      }
    }
    setCart(newCart);
  };

  const clearCart = () => {
    setCart({});
  };

  return (
    <div className="fixed inset-0 bg-white/70 flex justify-center items-end z-50">
      <div className="bg-white w-full max-w-lg rounded-t-2xl p-6 shadow-xl animate-slide-up">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">注文内容の確認</h2>
          <button
            onClick={() => setCart({})}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={28} />
          </button>
        </div>
        <div className="max-h-60 overflow-y-auto pr-2">
          {Object.values(cart).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between mb-4"
            >
              <div>
                <p className="font-semibold text-gray-700">{item.name}</p>
                <p className="text-sm text-gray-500">¥{item.price}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="w-8 h-8 rounded-full bg-gray-200 text-lg font-bold"
                >
                  -
                </button>
                <span className="w-8 text-center font-semibold">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="w-8 h-8 rounded-full bg-gray-200 text-lg font-bold"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>合計 ({totalItems}点)</span>
            <span>¥{totalAmount}</span>
          </div>
          <button
            onClick={onCheckout}
            className="w-full mt-4 bg-green-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-600 transition-colors duration-300 text-lg"
          >
            注文を確定して整理券を受け取る
          </button>
          <button
            onClick={clearCart}
            className="w-full mt-2 text-sm text-gray-500 hover:text-red-500"
          >
            カートを空にする
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 顧客向け注文ページ ---
const CustomerPage = ({ products, setPage, setLastOrder }) => {
  const [cart, setCart] = useState({});

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      if (newCart[product.id]) {
        if (newCart[product.id].quantity < product.stock) {
          newCart[product.id].quantity++;
        }
      } else {
        newCart[product.id] = { ...product, quantity: 1 };
      }
      return newCart;
    });
  };

  const handleCheckout = async () => {
    console.log("注文処理を開始します:", cart);
    const orderItems = Object.values(cart).map((item) => ({
      productId: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));
    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    try {
      // Firestoreのトランザクションを使って、在庫の更新と注文の記録を安全に行う
      const newOrderData = await runTransaction(db, async (transaction) => {
        // すべての読み取りを先に実行
        const productRefs = orderItems.map((item) =>
          doc(db, "products", item.productId)
        );
        const productDocs = await Promise.all(
          productRefs.map((ref) => transaction.get(ref))
        );

        // 最新の注文番号を取得（読み取り）
        const latestOrderRef = doc(db, "metadata", "latestOrder");
        const latestOrderSnapshot = await transaction.get(latestOrderRef);
        const lastOrderNumber = latestOrderSnapshot.exists()
          ? latestOrderSnapshot.data().number
          : 0;
        const newOrderNumber = lastOrderNumber + 1;

        // 在庫チェック
        for (let i = 0; i < productDocs.length; i++) {
          const productDoc = productDocs[i];
          const orderItem = orderItems[i];
          if (
            !productDoc.exists() ||
            productDoc.data().stock < orderItem.quantity
          ) {
            throw new Error(`${orderItem.name}の在庫が不足しています。`);
          }
        }

        // すべての書き込みを後で実行
        // 在庫を減らす
        productDocs.forEach((productDoc, i) => {
          const newStock = productDoc.data().stock - orderItems[i].quantity;
          transaction.update(productDoc.ref, { stock: newStock });
        });

        // 注文記録を作成
        const newOrderRef = doc(collection(db, "orders"));
        transaction.set(newOrderRef, {
          items: orderItems,
          totalAmount: totalAmount,
          createdAt: new Date(),
          ticketNumber: newOrderNumber,
          status: "pending", // ステータスを追加
        });

        // 最新注文番号を更新
        transaction.set(latestOrderRef, { number: newOrderNumber });

        return { id: newOrderRef.id, ticketNumber: newOrderNumber };
      });

      console.log("注文が作成されました:", newOrderData.id);
      setLastOrder(newOrderData);
      setCart({});
      setPage("ticket");
    } catch (e) {
      console.error("注文処理中にエラーが発生しました: ", e);
      alert(`エラー: ${e.message}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        商品をえらんでください
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>
      <CartModal cart={cart} setCart={setCart} onCheckout={handleCheckout} />
    </div>
  );
};

// --- スタッフ向け管理ページ ---
const AdminPage = ({ products, orders, onLogout, onOpenScanner, onOpenProductManagement }) => {
  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );
  const salesByProduct = products.map((product) => {
    const soldQuantity = orders.reduce((sum, order) => {
      const item = order.items.find((i) => i.productId === product.id);
      return sum + (item ? item.quantity : 0);
    }, 0);
    return {
      ...product,
      soldQuantity,
      revenue: soldQuantity * product.price,
    };
  });

  const pendingOrders = orders.filter(order => order.status !== "completed");
  const completedOrders = orders.filter(order => order.status === "completed");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">ダッシュボード</h2>
        <div className="flex gap-3">
          <button
            onClick={onOpenProductManagement}
            className="px-4 py-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
          >
            <ShoppingCart size={16} />
            商品管理
          </button>
          <button
            onClick={onOpenScanner}
            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <QrCode size={16} />
            QRスキャン
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
          >
            <Lock size={16} />
            ログアウト
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h3 className="text-lg font-bold text-gray-700 mb-4">全体の売上</h3>
        <p className="text-4xl font-extrabold text-blue-600">
          ¥{totalRevenue.toLocaleString()}
        </p>
        <p className="text-gray-500 mt-1">合計 {orders.length} 件の注文</p>
        <div className="flex gap-4 mt-4">
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-yellow-800 font-semibold">対応中: {pendingOrders.length}件</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-green-800 font-semibold">完了: {completedOrders.length}件</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 在庫状況 */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-bold text-gray-700 mb-4">
            リアルタイム在庫状況
          </h3>
          <div className="space-y-4">
            {products.map((p) => (
              <div key={p.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-gray-600">{p.name}</span>
                  <span
                    className={`font-bold ${
                      p.stock > 10
                        ? "text-green-600"
                        : p.stock > 0
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {p.stock} 個
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      p.stock > 10
                        ? "bg-green-500"
                        : p.stock > 0
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${(p.stock / 50) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 商品別売上 */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-bold text-gray-700 mb-4">
            商品別 売上レポート
          </h3>
          <div className="space-y-3">
            {salesByProduct.map((p) => (
              <div key={p.id} className="flex justify-between items-center">
                <span className="font-semibold text-gray-600">{p.name}</span>
                <div className="text-right">
                  <p className="font-bold text-gray-800">{p.soldQuantity} 個</p>
                  <p className="text-sm text-gray-500">
                    ¥{p.revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 最新注文一覧 */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-bold text-gray-700 mb-4">
            最新注文一覧
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {orders.slice(0, 10).map((order) => (
              <div
                key={order.id}
                className={`p-3 rounded-lg border ${
                  order.status === "completed"
                    ? "bg-green-50 border-green-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">
                      整理番号: {String(order.ticketNumber).padStart(3, "0")}
                    </p>
                    <p className="text-sm text-gray-600">
                      ¥{order.totalAmount.toLocaleString()} ({order.items.length}点)
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.createdAt?.toDate ? 
                        order.createdAt.toDate().toLocaleString('ja-JP') : 
                        new Date().toLocaleString('ja-JP')
                      }
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {order.status === "completed" ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-green-600 font-semibold">完了</span>
                      </>
                    ) : (
                      <>
                        <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
                        <span className="text-xs text-yellow-600 font-semibold">対応中</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 整理券ページ ---
const TicketPage = ({ lastOrder, setPage }) => {
  if (!lastOrder) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>注文情報が見つかりません。</p>
        <button
          onClick={() => setPage("customer")}
          className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded"
        >
          注文ページに戻る
        </button>
      </div>
    );
  }

  const ticketUrl = `${
    window.location.href.split("?")[0]
  }?page=ticket&orderId=${lastOrder.id}`;
  
  // QRコードにより実用的な情報を含める
  const qrCodeData = {
    ticketNumber: lastOrder.ticketNumber,
    orderId: lastOrder.id,
    items: lastOrder.items,
    totalAmount: lastOrder.totalAmount,
    createdAt: lastOrder.createdAt?.toDate ? lastOrder.createdAt.toDate().toISOString() : new Date().toISOString(),
    status: lastOrder.status || "pending"
  };
  
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    JSON.stringify(qrCodeData)
  )}`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-sm w-full rounded-2xl shadow-2xl p-8 text-center border-t-8 border-blue-500">
        <Ticket className="mx-auto text-blue-500 mb-4" size={48} />
        <h2 className="text-xl font-bold text-gray-600">
          ご注文ありがとうございます
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          商品受け取り時にこの画面をお見せください
        </p>

        <div className="bg-gray-100 p-6 rounded-lg my-6">
          <p className="text-lg text-gray-600">整理番号</p>
          <p className="text-7xl font-extrabold tracking-wider text-blue-600">
            {String(lastOrder.ticketNumber).padStart(3, "0")}
          </p>
        </div>

        <div className="my-6">
          <Image
            src={qrCodeApiUrl}
            alt="整理券のQRコード"
            width={180}
            height={180}
            className="mx-auto"
          />
        </div>

        <button
          onClick={() => setPage("customer")}
          className="w-full mt-4 bg-blue-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors duration-300"
        >
          新しい注文をする
        </button>
      </div>
    </div>
  );
};

// --- ★ 新規追加: 設定案内コンポーネント ★ ---
const SetupGuide = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
    <div className="max-w-2xl w-full p-8 bg-white rounded-lg shadow-2xl text-center">
      <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
      <h1 className="mt-4 text-2xl font-bold text-gray-800">
        初期設定が必要です
      </h1>
      <p className="mt-2 text-gray-600">
        このアプリケーションを実行するには、Firebaseの接続情報（`firebaseConfig`）をあなたのプロジェクトのものに更新する必要があります。
      </p>
      <div className="mt-6 text-left bg-gray-800 text-white p-4 rounded-lg font-mono text-sm overflow-x-auto">
        <pre>
          <code>
            {`// このコードをあなたのFirebase設定に書き換えてください。
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};`}
          </code>
        </pre>
      </div>
      <p className="mt-4 text-gray-600">
        上記のコード内の{" "}
        <code className="bg-gray-200 p-1 rounded">&quot;YOUR_API_KEY&quot;</code>{" "}
        などの値を、
        <a
          href="https://console.firebase.google.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline font-semibold"
        >
          Firebaseコンソール
        </a>
        で取得した実際のキーに置き換えてください。
      </p>
    </div>
  </div>
);

// --- QRコード読み取り画面 ---
const QRScannerPage = ({ onClose, onOrderComplete }) => {
  const [scannedData, setScannedData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    // QRコードスキャナーの初期化
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    html5QrcodeScanner.render((decodedText) => {
      handleQRCodeScanned(decodedText);
    }, (error) => {
      // エラーは無視（継続的にスキャン）
    });

    setScanner(html5QrcodeScanner);

    return () => {
      if (html5QrcodeScanner) {
        html5QrcodeScanner.clear();
      }
    };
  }, []);

  const handleQRCodeScanned = async (decodedText) => {
    try {
      setError(null);
      setScannedData(decodedText);
      
      // QRコードのデータを解析
      let orderInfo;
      try {
        orderInfo = JSON.parse(decodedText);
      } catch (e) {
        // JSONでない場合は、URLパラメータから注文IDを抽出
        const urlParams = new URLSearchParams(decodedText.split('?')[1]);
        const orderId = urlParams.get('orderId');
        if (!orderId) {
          throw new Error('無効なQRコードです');
        }
        orderInfo = { orderId };
      }

      // Firestoreから注文データを取得
      const orderDoc = await getDoc(doc(db, "orders", orderInfo.orderId));
      if (!orderDoc.exists()) {
        throw new Error('注文が見つかりません');
      }

      const order = { id: orderDoc.id, ...orderDoc.data() };
      
      // 既に完了済みの場合はエラー
      if (order.status === "completed") {
        throw new Error('この注文は既に完了済みです');
      }

      setOrderData(order);
      
      // スキャナーを停止
      if (scanner) {
        scanner.clear();
      }
    } catch (err) {
      setError(err.message);
      setOrderData(null);
    }
  };

  const handleCompleteOrder = async () => {
    if (!orderData) return;
    
    setIsProcessing(true);
    try {
      // 注文ステータスを完了に更新
      await updateDoc(doc(db, "orders", orderData.id), {
        status: "completed",
        completedAt: new Date()
      });

      // 完了コールバックを呼び出し
      onOrderComplete(orderData);
      
      // 画面を閉じる
      onClose();
    } catch (err) {
      setError('注文の完了処理中にエラーが発生しました: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetry = () => {
    setScannedData(null);
    setOrderData(null);
    setError(null);
    
    // スキャナーを再初期化
    if (scanner) {
      scanner.clear();
    }
    
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    html5QrcodeScanner.render((decodedText) => {
      handleQRCodeScanned(decodedText);
    }, (error) => {
      // エラーは無視
    });

    setScanner(html5QrcodeScanner);
  };

  return (
    <div className="fixed inset-0 bg-white/70 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Camera className="h-6 w-6" />
            QRコード読み取り
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={28} />
          </button>
        </div>

        {!orderData && (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              お客様の整理券のQRコードをカメラにかざしてください
            </p>
            <div id="qr-reader" className="mx-auto"></div>
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
                <button
                  onClick={handleRetry}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  再試行
                </button>
              </div>
            )}
          </div>
        )}

        {orderData && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">QRコード読み取り成功</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-gray-800 mb-3">注文内容</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">整理番号:</span>
                  <span className="font-bold text-blue-600">
                    {String(orderData.ticketNumber).padStart(3, "0")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">注文時刻:</span>
                  <span className="font-semibold">
                    {orderData.createdAt?.toDate ? 
                      orderData.createdAt.toDate().toLocaleString('ja-JP') : 
                      new Date().toLocaleString('ja-JP')
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">合計金額:</span>
                  <span className="font-bold text-green-600">
                    ¥{orderData.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">商品詳細</h4>
              <div className="space-y-2">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-700">{item.name}</span>
                    <span className="font-semibold">
                      {item.quantity}個 × ¥{item.price} = ¥{(item.quantity * item.price).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleCompleteOrder}
                disabled={isProcessing}
                className="flex-1 py-3 px-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    処理中...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    受け渡し完了
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- 商品管理コンポーネント ---
const ProductManagement = ({ products, onClose, onProductUpdate }) => {
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: 0,
    stock: 0,
    imageUrl: ""
  });
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEditProduct = (product) => {
    setEditingProduct({ ...product });
    setIsAddingProduct(false);
  };

  const handleAddProduct = () => {
    setNewProduct({
      name: "",
      price: 0,
      stock: 0,
      imageUrl: ""
    });
    setEditingProduct(null);
    setIsAddingProduct(true);
  };

  const handleSaveProduct = async () => {
    setIsProcessing(true);
    try {
      if (isAddingProduct) {
        // 新しい商品を追加
        const productId = `product_${Date.now()}`;
        await setDoc(doc(db, "products", productId), {
          ...newProduct,
          price: parseInt(newProduct.price),
          stock: parseInt(newProduct.stock)
        });
        setNewProduct({ name: "", price: 0, stock: 0, imageUrl: "" });
        setIsAddingProduct(false);
      } else if (editingProduct) {
        // 既存商品を更新
        await updateDoc(doc(db, "products", editingProduct.id), {
          name: editingProduct.name,
          price: parseInt(editingProduct.price),
          stock: parseInt(editingProduct.stock),
          imageUrl: editingProduct.imageUrl
        });
        setEditingProduct(null);
      }
      onProductUpdate();
    } catch (error) {
      console.error("商品の保存中にエラーが発生しました:", error);
      alert("商品の保存に失敗しました: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("この商品を削除しますか？")) return;
    
    setIsProcessing(true);
    try {
      await deleteDoc(doc(db, "products", productId));
      onProductUpdate();
    } catch (error) {
      console.error("商品の削除中にエラーが発生しました:", error);
      alert("商品の削除に失敗しました: " + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setIsAddingProduct(false);
    setNewProduct({ name: "", price: 0, stock: 0, imageUrl: "" });
  };

  return (
    <div className="fixed inset-0 bg-white/70 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-4xl rounded-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">商品管理</h2>
          <div className="flex gap-3">
            <button
              onClick={handleAddProduct}
              className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
            >
              新規追加
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800"
            >
              <X size={28} />
            </button>
          </div>
        </div>

        {/* 商品一覧 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {products.map((product) => (
            <div key={product.id} className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">{product.name}</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditProduct(product)}
                    className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                  >
                    削除
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600">¥{product.price.toLocaleString()}</p>
              <p className={`text-sm font-semibold ${
                product.stock > 10 ? "text-green-600" : 
                product.stock > 0 ? "text-yellow-600" : "text-red-600"
              }`}>
                在庫: {product.stock}個
              </p>
            </div>
          ))}
        </div>

        {/* 商品編集フォーム */}
        {(editingProduct || isAddingProduct) && (
          <div className="bg-gray-50 rounded-lg p-6 border">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {isAddingProduct ? "新規商品追加" : "商品編集"}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  商品名
                </label>
                <input
                  type="text"
                  value={isAddingProduct ? newProduct.name : editingProduct.name}
                  onChange={(e) => {
                    if (isAddingProduct) {
                      setNewProduct({ ...newProduct, name: e.target.value });
                    } else {
                      setEditingProduct({ ...editingProduct, name: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="商品名を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  価格 (円)
                </label>
                <input
                  type="number"
                  value={isAddingProduct ? newProduct.price : editingProduct.price}
                  onChange={(e) => {
                    if (isAddingProduct) {
                      setNewProduct({ ...newProduct, price: e.target.value });
                    } else {
                      setEditingProduct({ ...editingProduct, price: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="価格を入力"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  在庫数
                </label>
                <input
                  type="number"
                  value={isAddingProduct ? newProduct.stock : editingProduct.stock}
                  onChange={(e) => {
                    if (isAddingProduct) {
                      setNewProduct({ ...newProduct, stock: e.target.value });
                    } else {
                      setEditingProduct({ ...editingProduct, stock: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="在庫数を入力"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  画像URL
                </label>
                <input
                  type="text"
                  value={isAddingProduct ? newProduct.imageUrl : editingProduct.imageUrl}
                  onChange={(e) => {
                    if (isAddingProduct) {
                      setNewProduct({ ...newProduct, imageUrl: e.target.value });
                    } else {
                      setEditingProduct({ ...editingProduct, imageUrl: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="画像URLを入力"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveProduct}
                disabled={isProcessing}
                className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isProcessing ? "保存中..." : "保存"}
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- メインコンポーネント ---
export default function App() {
  const [page, setPage] = useState("customer"); // 'customer', 'admin', 'ticket', 'productManagement'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState(null);
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);

  // 管理画面ボタンクリック時の処理
  const handleAdminClick = () => {
    if (isAdminAuthenticated) {
      setPage("admin");
    } else {
      setAdminLoginModalOpen(true);
    }
  };

  // 管理画面ログイン成功時の処理
  const handleAdminLogin = () => {
    setIsAdminAuthenticated(true);
    setAdminLoginModalOpen(false);
    setPage("admin");
  };

  // 管理画面ログインモーダルを閉じる
  const handleCloseAdminLoginModal = () => {
    setAdminLoginModalOpen(false);
  };

  // 管理画面ログアウト処理
  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setPage("customer");
  };

  // QRスキャナーを開く
  const handleOpenScanner = () => {
    setQrScannerOpen(true);
  };

  // QRスキャナーを閉じる
  const handleCloseScanner = () => {
    setQrScannerOpen(false);
  };

  // 商品管理を開く
  const handleOpenProductManagement = () => {
    setPage("productManagement");
  };

  // 商品管理を閉じる
  const handleCloseProductManagement = () => {
    setPage("admin");
  };

  // 注文完了時の処理
  const handleOrderComplete = (completedOrder) => {
    console.log('注文完了:', completedOrder);
    // 必要に応じて完了通知などを追加
  };

  // 商品更新時の処理
  const handleProductUpdate = () => {
    console.log('商品が更新されました');
    // 必要に応じて更新通知などを追加
  };

  // Firestoreからデータをリアルタイムで購読する
  useEffect(() => {
    const initializeAppAndData = async () => {
      try {
        await setupInitialData();

        const unsubscribeProducts = onSnapshot(
          collection(db, "products"),
          (snapshot) => {
            const productsData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setProducts(productsData);
            setLoading(false);
          }
        );

        const unsubscribeOrders = onSnapshot(
          collection(db, "orders"),
          (snapshot) => {
            const ordersData = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            ordersData.sort((a, b) => {
              const dateA = a.createdAt?.toDate
                ? a.createdAt.toDate()
                : new Date(0);
              const dateB = b.createdAt?.toDate
                ? b.createdAt.toDate()
                : new Date(0);
              return dateB - dateA;
            });
            setOrders(ordersData);
          }
        );

        return () => {
          unsubscribeProducts();
          unsubscribeOrders();
        };
      } catch (error) {
        console.error("Firebaseの初期化またはデータ取得でエラー:", error);
        if (error.code === "unavailable" || error.message.includes("offline")) {
          setFirebaseError(
            "Firebaseに接続できませんでした。ページを再読み込みするか、設定情報を確認してください。"
          );
        } else {
          setFirebaseError("データの読み込み中に不明なエラーが発生しました。");
        }
        setLoading(false);
      }
    };

    const cleanupPromise = initializeAppAndData();

    return () => {
      cleanupPromise.then((cleanup) => {
        if (cleanup) {
          cleanup();
        }
      });
    };
  }, []);

  // URLクエリパラメータに基づいて初期ページを設定
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialPage = params.get("page");
    if (initialPage === "admin" || initialPage === "customer") {
      setPage(initialPage);
    }
  }, []);

  const renderPage = () => {
    if (firebaseConfig.apiKey === "YOUR_API_KEY" || !firebaseConfig.projectId) {
      return <SetupGuide />;
    }
    if (firebaseError) {
      return (
        <div className="container mx-auto px-4 py-8 text-center text-red-700">
          <div className="bg-red-100 border-l-4 border-red-500 p-6 rounded-lg max-w-2xl mx-auto">
            <div className="flex">
              <div className="py-1">
                <AlertTriangle className="h-6 w-6 text-red-500 mr-4" />
              </div>
              <div>
                <p className="font-bold text-lg">接続エラー</p>
                <p className="text-sm">{firebaseError}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    switch (page) {
      case "customer":
        return (
          <CustomerPage
            products={products}
            setPage={setPage}
            setLastOrder={setLastOrder}
          />
        );
      case "admin":
        return (
          <AdminPage 
            products={products} 
            orders={orders} 
            onLogout={handleAdminLogout}
            onOpenScanner={handleOpenScanner}
            onOpenProductManagement={handleOpenProductManagement}
          />
        );
      case "ticket":
        return <TicketPage lastOrder={lastOrder} setPage={setPage} />;
      case "productManagement":
        return (
          <ProductManagement 
            products={products} 
            onClose={handleCloseProductManagement}
            onProductUpdate={handleProductUpdate}
          />
        );
      default:
        return (
          <CustomerPage
            products={products}
            setPage={setPage}
            setLastOrder={setLastOrder}
          />
        );
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      {page !== "ticket" && page !== "productManagement" && (
        <AppHeader 
          page={page} 
          setPage={setPage} 
          onAdminClick={handleAdminClick}
        />
      )}
      <main>{renderPage()}</main>
      
      {/* 管理画面ログインモーダル */}
      <AdminLoginModal
        isOpen={adminLoginModalOpen}
        onClose={handleCloseAdminLoginModal}
        onLogin={handleAdminLogin}
      />
      
      {/* QRコード読み取り画面 */}
      {qrScannerOpen && (
        <QRScannerPage
          onClose={handleCloseScanner}
          onOrderComplete={handleOrderComplete}
        />
      )}
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&display=swap');
        body {
          font-family: 'Noto Sans JP', sans-serif;
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out forwards;
        }
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
