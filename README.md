# BTU Safety Platform - Düşme ve Hareketsizlik Analizi

Bu proje, yaşlı ve yalnız yaşayan bireylerin güvenliğini sağlamak amacıyla geliştirilmiş, IoT tabanlı bir düşme ve hareketsizlik algılama platformudur. Sistem, akıllı telefon sensörlerini kullanarak anlık hareket verilerini işler ve bir Node.js sunucusu üzerinden web arayüzüne gerçek zamanlı alarm bildirimleri gönderir.

## 🚀 Proje Mimarisi

Sistem, üç ana katmandan oluşan dağıtık bir yapıya sahiptir:



1. **Mobil İstemci (IoT):** Expo/React Native kullanılarak geliştirilmiştir. İvmeölçer ve jiroskop verilerini sürekli analiz eder, "Düşme" veya "Hareketsizlik" anomali durumlarını algılar.
2. **Backend (Sunucu):** Node.js ve Express.js ile geliştirilmiştir. Socket.io üzerinden anlık haberleşmeyi sağlar ve JWT ile güvenli kimlik doğrulaması gerçekleştirir.
3. **Frontend (Dashboard):** HTML5, Tailwind CSS ve Chart.js ile geliştirilmiş, operatörlerin verileri anlık takip edebildiği bir SPA (Single Page Application) arayüzüdür.

## 🛠️ Kullanılan Teknolojiler

* **Backend:** Node.js, Express.js, MongoDB (Mongoose), Socket.io, JWT, Bcrypt.
* **Frontend:** HTML5, Tailwind CSS, Vanilla JavaScript, Chart.js.
* **Mobil:** React Native, Expo, Expo-Sensors.
* **Altyapı:** Ngrok (Tünelleme), MongoDB Atlas (Bulut Veritabanı).

## 🔑 Temel Özellikler

- **Gerçek Zamanlı Takip:** WebSocket (Socket.io) sayesinde düşük gecikmeli veri akışı.
- **Güvenli Kimlik Doğrulama:** JWT tabanlı yetkilendirme ve bcrypt ile şifreli kullanıcı verileri.
- **Hata Toleransı (Fault Tolerance):** Ağ bağlantısı kesintilerinde sistemi ayakta tutan mock-data simülasyonu.
- **Dinamik Görselleştirme:** Anlık sensör verilerinin Chart.js ile canlı grafiklendirilmesi.

## 📦 Kurulum ve Çalıştırma

### Backend
1. `cd backend` klasörüne gidin.
2. `npm install` komutu ile bağımlılıkları yükleyin.
3. Çevre değişkenlerini (`.env`) ayarlayın:
   ```bash
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key