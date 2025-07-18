"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

export default function QrCodeReader() {
  const [result, setResult] = useState<string | null>(null);
  const qrRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const initScanner = async () => {
      const cameras = await Html5Qrcode.getCameras();

      if (!cameras || cameras.length === 0) {
        alert("Kamera bulunamadı.");
        return;
      }

      // Arka kamera otomatik seçimi
      const backCam = cameras.find((cam) =>
        cam.label.toLowerCase().includes("back")
      );
      const cameraId = backCam?.id || cameras[0].id;

      qrRef.current = new Html5Qrcode("reader", {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });

      try {
        await qrRef.current.start(
          cameraId,
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          (decodedText) => {
            setResult(decodedText);
            stopScanner();
          },
          (error) => {
            // Her hata loglanmasın, sessiz geç
          }
        );
      } catch (err) {
        console.error("Kamera başlatılamadı:", err);
      }
    };

    initScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = () => {
    qrRef.current?.stop().then(() => {
      qrRef.current?.clear();
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-100 text-gray-800">
      <h1 className="text-xl sm:text-2xl font-semibold my-4">
        📷 QR Kod Okuyucu
      </h1>

      <div
        id="reader"
        className="w-[90vw] max-w-[320px] aspect-square rounded overflow-hidden shadow-md bg-white"
      ></div>

      {result && (
        <div className="mt-4 text-green-700 font-medium break-words text-center max-w-xs">
          ✅ Sonuç: {result}
        </div>
      )}

      <button
        onClick={stopScanner}
        className="mt-6 px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
      >
        Durdur
      </button>
    </div>
  );
}
