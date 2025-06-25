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
  getDocs,
  deleteDoc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
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
  Upload,
  Image as ImageIcon,
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
let storage;
if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  storage = getStorage(app);
}

// --- 画像アップロード関数 ---
const uploadImage = async (file, productId) => {
  if (!storage) {
    throw new Error("Firebase Storageが初期化されていません");
  }

  // ファイルサイズチェック（5MB以下）
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("ファイルサイズは5MB以下にしてください");
  }

  // ファイル形式チェック
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("JPEG、PNG、WebP形式の画像のみアップロード可能です");
  }

  try {
    // ファイル名を生成（productId_timestamp.extension）
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${productId}_${timestamp}.${fileExtension}`;

    // Storageの参照を作成
    const storageRef = ref(storage, `product-images/${fileName}`);

    // ファイルをアップロード
    const snapshot = await uploadBytes(storageRef, file);

    // ダウンロードURLを取得
    const downloadURL = await getDownloadURL(snapshot.ref);

    return downloadURL;
  } catch (error) {
    console.error("画像アップロードエラー:", error);
    throw new Error("画像のアップロードに失敗しました");
  }
};

// --- 画像削除関数 ---
const deleteImage = async (imageUrl) => {
  if (!storage || !imageUrl) return;

  try {
    // URLからファイルパスを抽出
    const urlParts = imageUrl.split('/');
    const fileName = urlParts[urlParts.length - 1].split('?')[0];
    const storageRef = ref(storage, `product-images/${fileName}`);

    await deleteObject(storageRef);
  } catch (error) {
    console.error("画像削除エラー:", error);
    // 削除に失敗しても処理を続行
  }
};

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
        maxStock: 100,
        imageUrl: "/images/choco-mint.jpg",
      },
      {
        id: "chocolate",
        name: "とろけるチョコ",
        price: 350,
        stock: 50,
        maxStock: 100,
        imageUrl: "https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400&h=300&fit=crop",
      },
      {
        id: "strawberry",
        name: "果肉いちご",
        price: 350,
        stock: 40,
        maxStock: 80,
        imageUrl: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&h=300&fit=crop",
      },
      {
        id: "matcha",
        name: "本格抹茶",
        price: 400,
        stock: 30,
        maxStock: 60,
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="パスワードを入力"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors bg-white"
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
        <div className="text-xl font-bold text-gray-800">🍦 Welcome to BlueRush</div>
      </div>
    </div>
    <nav className="bg-gray-100">
      <div className="container mx-auto px-4 flex justify-around">
        <button
          onClick={() => setPage("customer")}
          className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 ${page === "customer"
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-gray-600"
            }`}
        >
          <ShoppingCart size={16} /> 注文
        </button>
        <button
          onClick={onAdminClick}
          className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 ${page === "admin"
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
        className={`text-sm font-semibold mt-2 ${product.stock > 10
          ? "text-green-600"
          : product.stock > 0
            ? "text-yellow-600"
            : "text-red-600"
          }`}
      >
        在庫: {product.stock > 0 ? `あと ${product.stock} 個` : "売り切れ"}
      </p>
      <button
        onClick={e => { e.stopPropagation(); onAddToCart(product); }}
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
const CartModal = ({ cart, setCart, onCheckout, onClose }) => {
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
            onClick={onClose}
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
                  className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 text-2xl font-bold flex items-center justify-center hover:bg-blue-200 transition-colors"
                >
                  −
                </button>
                <span className="w-10 text-center font-extrabold text-xl text-gray-900">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 text-2xl font-bold flex items-center justify-center hover:bg-blue-200 transition-colors"
                >
                  ＋
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span className="text-gray-800">合計 <span className="text-blue-700">({totalItems}点)</span></span>
            <span className="text-green-700 text-2xl">¥{totalAmount}</span>
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
const CustomerPage = ({ products, setPage, setLastOrder, cart, setCart, cartModalOpen, setCartModalOpen }) => {
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      console.log('setCart called for', product.name);
      const newCart = { ...prevCart };
      if (newCart[product.id]) {
        if (newCart[product.id].quantity < product.stock) {
          newCart[product.id].quantity = newCart[product.id].quantity + 1;
        }
      } else {
        newCart[product.id] = { ...product, quantity: 1 };
      }
      return newCart;
    });
    setCartModalOpen(true);
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
    <div className="bg-white min-h-screen font-sans">
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
        <button
          className="fixed top-4 right-4 z-50 bg-blue-500 text-white rounded-full shadow-lg w-14 h-14 flex flex-col items-center justify-center text-xs font-bold hover:bg-blue-600 transition-colors"
          onClick={() => setCartModalOpen(true)}
        >
          <ShoppingCart size={28} />
          <span>カート</span>
          {Object.keys(cart).length > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white rounded-full px-2 text-xs">{Object.values(cart).reduce((sum, item) => sum + item.quantity, 0)}</span>
          )}
        </button>
        {cartModalOpen && (
          <CartModal cart={cart} setCart={setCart} onCheckout={handleCheckout} onClose={() => setCartModalOpen(false)} />
        )}
      </div>
    </div>
  );
};

// --- スタッフ向け管理ページ ---
const AdminPage = ({ products, orders, onLogout, onOpenScanner, onOpenProductManagement, onCancelOrder }) => {
  // 完了した注文のみを売上計算に含める
  const completedOrders = orders.filter(order => order.status === "completed");
  const totalRevenue = completedOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );

  const salesByProduct = products.map((product) => {
    const soldQuantity = completedOrders.reduce((sum, order) => {
      const item = order.items.find((i) => i.productId === product.id);
      return sum + (item ? item.quantity : 0);
    }, 0);
    return {
      ...product,
      soldQuantity,
      revenue: soldQuantity * product.price,
    };
  });

  const pendingOrders = orders.filter(order => order.status === "pending");
  const cancelledOrders = orders.filter(order => order.status === "cancelled");

  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [proxyModalOpen, setProxyModalOpen] = useState(false);

  const handleResetProducts = async () => {
    setIsResetting(true);
    try {
      // 1. 全ての注文データを削除
      const ordersSnapshot = await getDocs(collection(db, "orders"));
      const orderDeletePromises = ordersSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(orderDeletePromises);

      // 2. 商品データを初期状態にリセット
      const initialProducts = [
        {
          id: "vanilla",
          name: "濃厚バニラ",
          price: 300,
          stock: 50,
          maxStock: 100,
          imageUrl: "/images/choco-mint.jpg",
        },
        {
          id: "chocolate",
          name: "とろけるチョコ",
          price: 350,
          stock: 50,
          maxStock: 100,
          imageUrl: "https://images.unsplash.com/photo-1488900128323-21503983a07e?w=400&h=300&fit=crop",
        },
        {
          id: "strawberry",
          name: "果肉いちご",
          price: 350,
          stock: 40,
          maxStock: 80,
          imageUrl: "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400&h=300&fit=crop",
        },
        {
          id: "matcha",
          name: "本格抹茶",
          price: 400,
          stock: 30,
          maxStock: 60,
          imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
        },
      ];

      // 3. トランザクションで商品データとメタデータを更新
      await runTransaction(db, async (transaction) => {
        // 各商品を初期状態に更新
        initialProducts.forEach((prod) => {
          transaction.set(doc(db, "products", prod.id), prod);
        });

        // 整理番号カウンターをリセット
        transaction.set(doc(db, "metadata", "latestOrder"), { number: 0 });

        // セットアップ完了フラグを更新
        transaction.set(doc(db, "metadata", "setupComplete"), { done: true });
      });

      alert("すべてのデータ（商品・注文・売上・在庫）を初期状態にリセットしました。");
    } catch (error) {
      console.error("リセットエラー:", error);
      alert("データリセットに失敗しました: " + error.message);
    } finally {
      setIsResetting(false);
      setResetModalOpen(false);
    }
  };

  const handleOpenProxyModal = () => {
    setProxyModalOpen(true);
  };

  const handleCloseProxyModal = () => {
    setProxyModalOpen(false);
  };

  const handleProxyOrder = async (orderData) => {
    try {
      // 代理注文処理
      await runTransaction(db, async (transaction) => {
        // 1. まず全ての読み取り操作を実行
        const productDocs = [];
        for (const item of orderData.items) {
          const productRef = doc(db, "products", item.productId);
          const productDoc = await transaction.get(productRef);
          if (!productDoc.exists()) {
            throw new Error(`商品が見つかりません: ${item.productId}`);
          }
          const productData = productDoc.data();
          if (productData.stock < item.quantity) {
            throw new Error(`在庫不足: ${productData.name}`);
          }
          productDocs.push({ ref: productRef, data: productData, item });
        }

        // 整理番号を取得
        const latestOrderRef = doc(db, "metadata", "latestOrder");
        const latestOrderDoc = await transaction.get(latestOrderRef);
        const currentNumber = latestOrderDoc.exists() ? latestOrderDoc.data().number : 0;
        const newTicketNumber = currentNumber + 1;

        // 2. 次に全ての書き込み操作を実行
        // 商品の在庫を減少
        for (const { ref, data, item } of productDocs) {
          transaction.update(ref, { stock: data.stock - item.quantity });
        }

        // 整理番号を更新
        transaction.update(latestOrderRef, { number: newTicketNumber });

        // 注文を作成
        const orderRef = doc(collection(db, "orders"));
        transaction.set(orderRef, {
          ...orderData,
          ticketNumber: newTicketNumber,
          status: "pending",
          isProxy: true,
          createdAt: new Date(),
          id: orderRef.id,
        });
      });

      setProxyModalOpen(false);
      alert("代理注文を受け付けました。");
    } catch (error) {
      console.error("代理注文エラー:", error);
      alert("代理注文に失敗しました: " + error.message);
    }
  };

  const handleCompleteOrder = async (orderId) => {
    if (!confirm("この注文を受け渡し完了にしますか？")) {
      return;
    }

    try {
      // 注文ステータスを完了に更新
      await updateDoc(doc(db, "orders", orderId), {
        status: "completed",
        completedAt: new Date()
      });

      alert("注文を受け渡し完了にしました。");
    } catch (error) {
      console.error("注文完了エラー:", error);
      alert("注文の完了処理に失敗しました: " + error.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* スマホ用ダッシュボードタイトルとボタン */}
      <div className="block sm:hidden mb-6">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">ダッシュボード</h2>
        <div className="grid grid-cols-2 gap-2 w-full mb-6">
          <button
            onClick={onOpenProductManagement}
            className="flex flex-col items-center justify-center aspect-square bg-purple-500 text-white font-semibold rounded-xl hover:bg-purple-600 transition-colors"
          >
            <ShoppingCart className="w-8 h-8 mb-1" />
            <span className="text-xs">商品管理</span>
          </button>
          <button
            onClick={onOpenScanner}
            className="flex flex-col items-center justify-center aspect-square bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors"
          >
            <QrCode className="w-8 h-8 mb-1" />
            <span className="text-xs">QRスキャン</span>
          </button>
          <button
            onClick={handleOpenProxyModal}
            className="flex flex-col items-center justify-center aspect-square bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors"
          >
            <User className="w-8 h-8 mb-1" />
            <span className="text-xs">代理注文</span>
          </button>
          <button
            onClick={onLogout}
            className="flex flex-col items-center justify-center aspect-square bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors"
          >
            <Lock className="w-8 h-8 mb-1" />
            <span className="text-xs">ログアウト</span>
          </button>
        </div>
      </div>
      {/* PC用ダッシュボードタイトルとボタン */}
      <div className="hidden sm:flex justify-between items-center mb-6">
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
            onClick={handleOpenProxyModal}
            className="px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <User size={16} />
            代理注文
          </button>
          <button
            onClick={() => setResetModalOpen(true)}
            className="px-4 py-2 bg-red-400 text-white font-semibold rounded-lg hover:bg-red-500 transition-colors flex items-center gap-2"
          >
            <X size={16} />
            全データリセット
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
        <h3 className="text-lg font-bold text-gray-700 mb-4">完了済み注文の売上</h3>
        <p className="text-4xl font-extrabold text-blue-600">
          ¥{totalRevenue.toLocaleString()}
        </p>
        <p className="text-gray-500 mt-1">完了済み {completedOrders.length} 件の注文</p>
        <div className="flex gap-4 mt-4">
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-yellow-800 font-semibold">対応中: {pendingOrders.length}件</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-green-800 font-semibold">完了: {completedOrders.length}件</p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <p className="text-red-800 font-semibold">取り消し: {cancelledOrders.length}件</p>
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
                    className={`font-bold ${p.stock > 10
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
                    className={`h-2.5 rounded-full ${p.stock > 10
                      ? "bg-green-500"
                      : p.stock > 0
                        ? "bg-yellow-500"
                        : "bg-red-500"
                      }`}
                    style={{ width: `${(p.stock / (p.maxStock || 50)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 商品別売上 */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-bold text-gray-700 mb-4">
            商品別 売上レポート（完了済みのみ）
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
                className={`p-3 rounded-lg border ${order.status === "completed"
                  ? "bg-green-50 border-green-200"
                  : order.status === "cancelled"
                    ? "bg-red-50 border-red-200"
                    : "bg-yellow-50 border-yellow-200"
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">
                      整理番号: {String(order.ticketNumber).padStart(3, "0")}
                      {order.isProxy && (
                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">
                          代理
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      ¥{order.totalAmount.toLocaleString()} ({order.items.reduce((sum, item) => sum + item.quantity, 0)}点)
                    </p>
                    {/* 商品詳細表示 */}
                    <div className="text-xs text-gray-600 mt-1">
                      {order.items.map((item, index) => (
                        <span key={index}>
                          {item.name || item.productName}×{item.quantity}
                          {index < order.items.length - 1 ? "、" : ""}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
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
                    ) : order.status === "cancelled" ? (
                      <>
                        <X className="h-4 w-4 text-red-600" />
                        <span className="text-xs text-red-600 font-semibold">取り消し</span>
                      </>
                    ) : (
                      <>
                        <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
                        <span className="text-xs text-yellow-600 font-semibold">対応中</span>
                        <div className="ml-2 flex gap-1">
                          <button
                            onClick={() => handleCompleteOrder(order.id)}
                            className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors font-medium"
                          >
                            受け渡し完了
                          </button>
                          <button
                            onClick={() => onCancelOrder(order.id)}
                            className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors font-medium"
                          >
                            取り消し
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={() => setResetModalOpen(true)}
          className="px-4 py-2 bg-red-400 text-white font-semibold rounded-lg hover:bg-red-500 transition-colors flex items-center gap-2"
        >
          <X size={16} />
          全データリセット
        </button>
      </div>
      {/* ここにモーダルを配置 */}
      {resetModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-red-600">本当に全データをリセットしますか？</h2>
            <p className="mb-4">この操作は元に戻せません。すべての商品・注文・売上・在庫データが初期状態に戻ります。</p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setResetModalOpen(false)}
                className="flex-1 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >キャンセル</button>
              <button
                onClick={handleResetProducts}
                disabled={isResetting}
                className="flex-1 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300"
              >{isResetting ? "リセット中..." : "OK（リセット）"}</button>
            </div>
          </div>
        </div>
      )}

      {/* 代理注文モーダル */}
      {proxyModalOpen && (
        <ProxyOrderModal
          products={products}
          onClose={handleCloseProxyModal}
          onOrder={handleProxyOrder}
        />
      )}
    </div>
  );
};

// --- 整理券ページ ---
const TicketPage = ({ lastOrder, setPage, orders, setCompletedOrder }) => {
  const [isCancelling, setIsCancelling] = useState(false);

  // 注文ステータスをリアルタイムで確認
  useEffect(() => {
    if (lastOrder) {
      const currentOrder = orders.find(o => o.id === lastOrder.id);
      if (currentOrder) {
        if (currentOrder.status === "completed") {
          // 完了済みの場合は感謝メッセージページに遷移
          setCompletedOrder(currentOrder);
          setPage("thankYou");
        } else if (currentOrder.status === "cancelled") {
          // 取り消し済みの場合は注文ページに戻る
          alert("この注文は取り消されました。");
          setPage("customer");
        }
      }
    }
  }, [orders, lastOrder, setPage, setCompletedOrder]);

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

  const ticketUrl = `${window.location.href.split("?")[0]
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

  const handleCancelOrder = async () => {
    if (!confirm("この注文を取り消しますか？取り消し後は元に戻せません。")) {
      return;
    }

    setIsCancelling(true);
    try {
      // 在庫を戻す
      await runTransaction(db, async (transaction) => {
        // 1. まず全ての読み取り操作を実行
        const orderRef = doc(db, "orders", lastOrder.id);
        const orderDoc = await transaction.get(orderRef);

        if (!orderDoc.exists()) {
          throw new Error("注文が見つかりません");
        }

        const order = orderDoc.data();

        // 各商品の現在の在庫を読み取り
        const productUpdates = [];
        for (const item of order.items) {
          const productRef = doc(db, "products", item.productId);
          const productDoc = await transaction.get(productRef);
          if (productDoc.exists()) {
            const currentStock = productDoc.data().stock;
            productUpdates.push({
              ref: productRef,
              newStock: currentStock + item.quantity
            });
          }
        }

        // 2. 次に全ての書き込み操作を実行
        // 各商品の在庫を更新
        for (const update of productUpdates) {
          transaction.update(update.ref, { stock: update.newStock });
        }

        // 注文ステータスを取り消しに更新
        transaction.update(orderRef, {
          status: "cancelled",
          cancelledAt: new Date()
        });
      });

      alert("注文を取り消しました。在庫も戻されました。");
      setPage("customer");
    } catch (error) {
      console.error("注文取り消し中にエラーが発生しました:", error);
      alert("注文の取り消しに失敗しました: " + error.message);
    } finally {
      setIsCancelling(false);
    }
  };

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

        <div className="space-y-3">
          <button
            onClick={() => setPage("customer")}
            className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors duration-300"
          >
            新しい注文をする
          </button>
          <button
            onClick={() => {
              // 整理券を再表示するためのURLをコピー
              navigator.clipboard.writeText(ticketUrl);
              alert('整理券のURLをクリップボードにコピーしました。\n\nこのURLをブックマークしておくと、後で整理券を再表示できます。');
            }}
            className="w-full bg-gray-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-gray-600 transition-colors duration-300"
          >
            整理券URLをコピー
          </button>
          <button
            onClick={handleCancelOrder}
            disabled={isCancelling}
            className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-300"
          >
            {isCancelling ? "取り消し中..." : "注文を取り消す"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 受け渡し完了感謝メッセージページ ---
const ThankYouPage = ({ completedOrder, setPage }) => {
  if (!completedOrder) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>完了した注文情報が見つかりません。</p>
        <button
          onClick={() => setPage("customer")}
          className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded"
        >
          注文ページに戻る
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl p-8 text-center border-t-8 border-green-500">
        <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          ご利用ありがとうございました！
        </h2>
        <p className="text-gray-600 mb-6">
          商品の受け渡しが完了しました。<br />
          おいしいアイスクリームをお楽しみください。
        </p>

        <div className="bg-green-50 p-6 rounded-lg my-6">
          <p className="text-lg text-gray-700 mb-2">整理番号</p>
          <p className="text-4xl font-extrabold tracking-wider text-green-600">
            {String(completedOrder.ticketNumber).padStart(3, "0")}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            完了時刻: {completedOrder.completedAt?.toDate ?
              completedOrder.completedAt.toDate().toLocaleString('ja-JP') :
              new Date().toLocaleString('ja-JP')
            }
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">ご注文内容</h3>
          <div className="space-y-1">
            {completedOrder.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.name}</span>
                <span className="font-semibold text-green-600">{item.quantity}個</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-bold">
              <span className="text-gray-800">合計金額</span>
              <span className="text-green-600">¥{completedOrder.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setPage("customer")}
            className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-600 transition-colors duration-300"
          >
            新しい注文をする
          </button>
        </div>
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

// --- 代理注文モーダル ---
const ProxyOrderModal = ({ products, onClose, onOrder }) => {
  const [selectedItems, setSelectedItems] = useState({});
  const [isOrdering, setIsOrdering] = useState(false);

  const updateQuantity = (productId, delta) => {
    setSelectedItems(prev => {
      const currentQuantity = prev[productId] || 0;
      const newQuantity = Math.max(0, Math.min(currentQuantity + delta, 10));
      if (newQuantity === 0) {
        const { [productId]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newQuantity };
    });
  };

  const totalAmount = Object.entries(selectedItems).reduce((sum, [productId, quantity]) => {
    const product = products.find(p => p.id === productId);
    return sum + (product ? product.price * quantity : 0);
  }, 0);

  const totalItems = Object.values(selectedItems).reduce((sum, quantity) => sum + quantity, 0);

  const handleOrder = async () => {
    if (totalItems === 0) {
      alert("商品を選択してください");
      return;
    }

    setIsOrdering(true);
    try {
      const orderData = {
        items: Object.entries(selectedItems).map(([productId, quantity]) => {
          const product = products.find(p => p.id === productId);
          return {
            productId,
            name: product.name, // nameとproductNameの両方を保存
            productName: product.name,
            price: product.price,
            quantity,
          };
        }),
        totalAmount,
      };

      await onOrder(orderData);
    } catch (error) {
      console.error("注文エラー:", error);
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">代理注文</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* 選択中の商品一覧 */}
          {totalItems > 0 && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-800 mb-3">選択中の商品</h3>
              <div className="space-y-2">
                {Object.entries(selectedItems).map(([productId, quantity]) => {
                  const product = products.find(p => p.id === productId);
                  return (
                    <div key={productId} className="flex justify-between items-center bg-white rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="rounded-lg object-cover"
                        />
                        <div>
                          <span className="font-bold text-gray-800">{product.name}</span>
                          <p className="text-sm text-gray-600">¥{product.price} × {quantity}個</p>
                        </div>
                      </div>
                      <div className="font-bold text-green-600">
                        ¥{(product.price * quantity).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 商品選択エリア */}
          <h3 className="font-bold text-gray-800 mb-4">商品を選択してください</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product) => {
              const isSelected = selectedItems[product.id] > 0;
              return (
                <div key={product.id} className={`rounded-lg p-4 border-2 transition-all ${isSelected
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}>
                  <div className="flex items-center gap-4">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={60}
                      height={60}
                      className="rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className={`font-semibold ${isSelected ? 'text-blue-800' : 'text-gray-800'}`}>
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600">¥{product.price}</p>
                      <p className="text-xs text-gray-500">在庫: {product.stock}個</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(product.id, -1)}
                        disabled={!selectedItems[product.id]}
                        className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-gray-300 transition-colors"
                      >
                        -
                      </button>
                      <span className={`w-8 text-center font-bold ${isSelected ? 'text-blue-600' : 'text-gray-600'}`}>
                        {selectedItems[product.id] || 0}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, 1)}
                        disabled={product.stock === 0 || (selectedItems[product.id] || 0) >= Math.min(product.stock, 10)}
                        className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-blue-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-sm text-gray-600">合計: {totalItems}点</p>
              <p className="text-xl font-bold text-blue-600">¥{totalAmount.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleOrder}
              disabled={totalItems === 0 || isOrdering}
              className="flex-1 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:bg-gray-300 transition-colors"
            >
              {isOrdering ? "注文中..." : "注文確定"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- QRコード読み取り画面 ---
const QRScannerPage = ({ onClose, onOrderComplete, setPage }) => {
  const [scannedData, setScannedData] = useState(null);
  const [orderData, setOrderData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [scanner, setScanner] = useState(null);

  useEffect(() => {
    // 既存のスキャナーがあればクリア
    if (scanner) {
      scanner.clear();
    }

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
  }, []); // 空の依存関係配列で一度だけ実行

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

      // 取り消し済みの場合はエラー
      if (order.status === "cancelled") {
        throw new Error('この注文は取り消し済みです。整理券が無効になっています。');
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

      // スタッフの画面を閉じる（客の画面遷移はFirestoreのリアルタイム更新で処理）
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
                <p className="text-red-700 text-sm font-medium">{error}</p>
                <button
                  onClick={handleRetry}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
                  <span className="text-gray-700 font-medium">整理番号:</span>
                  <span className="font-bold text-blue-600">
                    {String(orderData.ticketNumber).padStart(3, "0")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 font-medium">注文時刻:</span>
                  <span className="font-bold text-gray-900">
                    {orderData.createdAt?.toDate ?
                      orderData.createdAt.toDate().toLocaleString('ja-JP') :
                      new Date().toLocaleString('ja-JP')
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 font-medium">合計金額:</span>
                  <span className="font-bold text-green-600">
                    ¥{orderData.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-bold text-gray-800 mb-3">商品詳細</h4>
              <div className="space-y-3">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-800 font-medium">{item.name}</span>
                    <span className="font-bold text-gray-900 text-sm">
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
    maxStock: 100,
    imageUrl: ""
  });
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleEditProduct = (product) => {
    setEditingProduct({ ...product });
    setIsAddingProduct(false);
    setImagePreview(product.imageUrl);
    setSelectedFile(null);
  };

  const handleAddProduct = () => {
    setNewProduct({
      name: "",
      price: 0,
      stock: 0,
      maxStock: 100,
      imageUrl: ""
    });
    setEditingProduct(null);
    setIsAddingProduct(true);
    setImagePreview(null);
    setSelectedFile(null);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);

      // プレビュー表示
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = async () => {
    setIsProcessing(true);
    setUploadProgress(0);

    try {
      let imageUrl = "";

      // 画像が選択されている場合はアップロード
      if (selectedFile) {
        const productId = isAddingProduct ? `product_${Date.now()}` : editingProduct.id;
        imageUrl = await uploadImage(selectedFile, productId);
        setUploadProgress(100);
      } else {
        // 既存の画像URLを使用
        imageUrl = isAddingProduct ? newProduct.imageUrl : editingProduct.imageUrl;
      }

      if (isAddingProduct) {
        // 新しい商品を追加
        const productId = `product_${Date.now()}`;
        await setDoc(doc(db, "products", productId), {
          ...newProduct,
          price: parseInt(newProduct.price),
          stock: parseInt(newProduct.stock),
          maxStock: parseInt(newProduct.maxStock),
          imageUrl: imageUrl
        });
        setNewProduct({ name: "", price: 0, stock: 0, imageUrl: "" });
        setIsAddingProduct(false);
      } else if (editingProduct) {
        // 既存商品を更新
        await updateDoc(doc(db, "products", editingProduct.id), {
          name: editingProduct.name,
          price: parseInt(editingProduct.price),
          stock: parseInt(editingProduct.stock),
          maxStock: parseInt(editingProduct.maxStock),
          imageUrl: imageUrl
        });
        setEditingProduct(null);
      }

      // 状態をリセット
      setSelectedFile(null);
      setImagePreview(null);
      setUploadProgress(0);

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
      // 商品の画像URLを取得して削除
      const product = products.find(p => p.id === productId);
      if (product && product.imageUrl) {
        await deleteImage(product.imageUrl);
      }

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
    setNewProduct({ name: "", price: 0, stock: 0, maxStock: 100, imageUrl: "" });
    setSelectedFile(null);
    setImagePreview(null);
    setUploadProgress(0);
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
              {product.imageUrl && (
                <div className="mb-2">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                </div>
              )}
              <p className="text-sm text-gray-600">¥{product.price.toLocaleString()}</p>
              <p className={`text-sm font-semibold ${product.stock > 10 ? "text-green-600" :
                product.stock > 0 ? "text-yellow-600" : "text-red-600"
                }`}>
                在庫: {product.stock}個 / {product.maxStock || 50}個
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                <div
                  className={`h-1.5 rounded-full ${product.stock > 10
                    ? "bg-green-500"
                    : product.stock > 0
                      ? "bg-yellow-500"
                      : "bg-red-500"
                    }`}
                  style={{ width: `${(product.stock / (product.maxStock || 50)) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* 商品編集フォーム */}
        {(editingProduct || isAddingProduct) && (
          <div className="bg-gray-50 rounded-lg p-6 border">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {isAddingProduct ? "新規商品追加" : "商品編集"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="在庫数を入力"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  在庫上限
                </label>
                <input
                  type="number"
                  value={isAddingProduct ? newProduct.maxStock : editingProduct.maxStock}
                  onChange={(e) => {
                    if (isAddingProduct) {
                      setNewProduct({ ...newProduct, maxStock: e.target.value });
                    } else {
                      setEditingProduct({ ...editingProduct, maxStock: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="在庫上限を入力"
                  min="1"
                />
              </div>

            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                商品画像
              </label>
              <div className="space-y-3">
                {/* 画像アップロード */}
                <div className="flex items-center space-x-2">
                  <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>画像を選択</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  {selectedFile && (
                    <span className="text-sm text-gray-600">
                      {selectedFile.name}
                    </span>
                  )}
                </div>

                {/* 画像プレビュー */}
                {imagePreview && (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="プレビュー"
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      onClick={() => {
                        setImagePreview(null);
                        setSelectedFile(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* アップロード進捗 */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}

                {/* 代替: 画像URL入力 */}
                <div className="text-sm text-gray-600">
                  <p>または画像URLを直接入力:</p>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white mt-1"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
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
  const [page, setPage] = useState("customer"); // 'customer', 'admin', 'ticket', 'productManagement', 'thankYou'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState(null);
  const [adminLoginModalOpen, setAdminLoginModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [cart, setCart] = useState({});

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

  // 注文完了時の処理（スタッフ用）
  const handleOrderComplete = (completedOrderData) => {
    console.log('注文完了:', completedOrderData);
    setCompletedOrder(completedOrderData);
  };

  // 注文取り消し処理
  const handleCancelOrder = async (orderId) => {
    if (!confirm("この注文を取り消しますか？取り消し後は元に戻せません。")) {
      return;
    }

    try {
      // 在庫を戻す
      await runTransaction(db, async (transaction) => {
        // 1. まず全ての読み取り操作を実行
        const orderRef = doc(db, "orders", orderId);
        const orderDoc = await transaction.get(orderRef);

        if (!orderDoc.exists()) {
          throw new Error("注文が見つかりません");
        }

        const order = orderDoc.data();

        // 各商品の現在の在庫を読み取り
        const productUpdates = [];
        for (const item of order.items) {
          const productRef = doc(db, "products", item.productId);
          const productDoc = await transaction.get(productRef);
          if (productDoc.exists()) {
            const currentStock = productDoc.data().stock;
            productUpdates.push({
              ref: productRef,
              newStock: currentStock + item.quantity
            });
          }
        }

        // 2. 次に全ての書き込み操作を実行
        // 各商品の在庫を更新
        for (const update of productUpdates) {
          transaction.update(update.ref, { stock: update.newStock });
        }

        // 注文ステータスを取り消しに更新
        transaction.update(orderRef, {
          status: "cancelled",
          cancelledAt: new Date()
        });
      });

      alert("注文を取り消しました。在庫も戻されました。");
    } catch (error) {
      console.error("注文取り消し中にエラーが発生しました:", error);
      alert("注文の取り消しに失敗しました: " + error.message);
    }
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

            // 客の画面で整理券を表示している場合、注文ステータスの変更を監視
            if (page === "ticket" && lastOrder) {
              const currentOrder = ordersData.find(o => o.id === lastOrder.id);
              if (currentOrder) {
                // 注文が完了したら感謝メッセージページに遷移
                if (currentOrder.status === "completed") {
                  setCompletedOrder(currentOrder);
                  setPage("thankYou");
                }
                // 注文が取り消されたら注文ページに戻る
                else if (currentOrder.status === "cancelled") {
                  alert("この注文は取り消されました。");
                  setPage("customer");
                }
              }
            }
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
  }, [page, lastOrder]); // pageとlastOrderを依存関係に追加

  // URLクエリパラメータに基づいて初期ページを設定
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialPage = params.get("page");
    const orderId = params.get("orderId");

    if (initialPage === "admin" || initialPage === "customer") {
      setPage(initialPage);
    } else if (initialPage === "ticket" && orderId) {
      // 整理券の再表示
      const order = orders.find(o => o.id === orderId);
      if (order) {
        // 注文ステータスを確認
        if (order.status === "completed") {
          // 完了済みの場合は感謝メッセージページを表示
          setCompletedOrder(order);
          setPage("thankYou");
        } else if (order.status === "cancelled") {
          // 取り消し済みの場合は注文ページに戻る
          alert("この注文は取り消されました。");
          setPage("customer");
        } else {
          // 対応中の場合は整理券ページを表示
          setLastOrder(order);
          setPage("ticket");
        }
      }
    }
  }, [orders]);

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
            cart={cart}
            setCart={setCart}
            cartModalOpen={cartModalOpen}
            setCartModalOpen={setCartModalOpen}
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
            onCancelOrder={handleCancelOrder}
          />
        );
      case "ticket":
        return <TicketPage lastOrder={lastOrder} setPage={setPage} orders={orders} setCompletedOrder={setCompletedOrder} />;
      case "thankYou":
        return <ThankYouPage completedOrder={completedOrder} setPage={setPage} />;
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
            cart={cart}
            setCart={setCart}
            cartModalOpen={cartModalOpen}
            setCartModalOpen={setCartModalOpen}
          />
        );
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      {page !== "ticket" && page !== "productManagement" && page !== "thankYou" && (
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
          setPage={setPage}
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
        
        /* QRスキャナーのカメラ選択UIのスタイル修正 */
        #qr-reader select {
          color: #1f2937 !important;
          background-color: #ffffff !important;
          border: 2px solid #d1d5db !important;
          border-radius: 0.5rem !important;
          padding: 0.5rem !important;
          font-size: 1rem !important;
          font-weight: 600 !important;
        }
        
        #qr-reader button {
          color: #ffffff !important;
          background-color: #3b82f6 !important;
          border: none !important;
          border-radius: 0.5rem !important;
          padding: 0.5rem 1rem !important;
          font-size: 1rem !important;
          font-weight: 600 !important;
          cursor: pointer !important;
        }
        
        #qr-reader button:hover {
          background-color: #2563eb !important;
        }
        
        #qr-reader span {
          color: #374151 !important;
          font-weight: 600 !important;
        }
        
        #qr-reader div {
          color: #374151 !important;
        }
        
        /* QRスキャナーのメッセージテキスト */
        #qr-reader__dashboard_section_csr {
          color: #374151 !important;
          font-weight: 600 !important;
        }
        
        /* QRスキャナーのヘッダー部分 */
        #qr-reader__header_message {
          color: #374151 !important;
          font-weight: 600 !important;
          background-color: #f9fafb !important;
          padding: 0.75rem !important;
          border-radius: 0.5rem !important;
          margin-bottom: 1rem !important;
        }
        
        /* QRスキャナーの設定やカメラ選択関連のテキスト */
        #qr-reader__dashboard_section_csr span,
        #qr-reader__dashboard_section_csr div,
        #qr-reader__dashboard_section_csr label {
          color: #1f2937 !important;
          font-weight: 600 !important;
        }
        
        /* QRスキャナー全体のコンテナ */
        #qr-reader {
          background-color: #ffffff !important;
          border-radius: 1rem !important;
          padding: 1rem !important;
        }
      `}</style>
    </div>
  );
}
