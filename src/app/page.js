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
} from "lucide-react";

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
  const metadataDoc = await getDoc(doc(db, "metadata", "setupComplete"));
  if (!metadataDoc.exists()) {
    console.log("初期データを作成します...");
    const initialProducts = [
      {
        id: "vanilla",
        name: "濃厚バニラ",
        price: 300,
        stock: 50,
        imageUrl: "https://placehold.co/400x300/F2EAD3/333?text=バニラ",
      },
      {
        id: "chocolate",
        name: "とろけるチョコ",
        price: 350,
        stock: 50,
        imageUrl: "https://placehold.co/400x300/603813/FFF?text=チョコ",
      },
      {
        id: "strawberry",
        name: "果肉いちご",
        price: 350,
        stock: 40,
        imageUrl: "https://placehold.co/400x300/F472B6/FFF?text=いちご",
      },
      {
        id: "matcha",
        name: "本格抹茶",
        price: 400,
        stock: 30,
        imageUrl: "https://placehold.co/400x300/166534/FFF?text=抹茶",
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <div className="text-xl font-bold text-gray-800">🍦 ICE CREAM SHOP</div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span>8:40 PM</span>
          <Wifi size={16} />
          <BatteryFull size={16} />
        </div>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end z-50">
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
        const productRefs = orderItems.map((item) =>
          doc(db, "products", item.productId)
        );
        const productDocs = await Promise.all(
          productRefs.map((ref) => transaction.get(ref))
        );

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

        // 在庫を減らす
        productDocs.forEach((productDoc, i) => {
          const newStock = productDoc.data().stock - orderItems[i].quantity;
          transaction.update(productDoc.ref, { stock: newStock });
        });

        // 注文記録を作成
        // 最新の注文番号を取得
        const latestOrderRef = doc(db, "metadata", "latestOrder");
        const latestOrderSnapshot = await transaction.get(latestOrderRef);
        const lastOrderNumber = latestOrderSnapshot.exists()
          ? latestOrderSnapshot.data().number
          : 0;
        const newOrderNumber = lastOrderNumber + 1;

        const newOrderRef = doc(collection(db, "orders"));
        transaction.set(newOrderRef, {
          items: orderItems,
          totalAmount: totalAmount,
          createdAt: new Date(),
          ticketNumber: newOrderNumber,
          status: "pending", // ステータスを追加
        });
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
const AdminPage = ({ products, orders, onLogout }) => {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">ダッシュボード</h2>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
        >
          <Lock size={16} />
          ログアウト
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
        <h3 className="text-lg font-bold text-gray-700 mb-4">全体の売上</h3>
        <p className="text-4xl font-extrabold text-blue-600">
          ¥{totalRevenue.toLocaleString()}
        </p>
        <p className="text-gray-500 mt-1">合計 {orders.length} 件の注文</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    ticketUrl
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

// --- メインコンポーネント ---
export default function App() {
  const [page, setPage] = useState("customer"); // 'customer', 'admin', 'ticket'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState(null);
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

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
        return <AdminPage products={products} orders={orders} onLogout={handleAdminLogout} />;
      case "ticket":
        return <TicketPage lastOrder={lastOrder} setPage={setPage} />;
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
      {page !== "ticket" && (
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
