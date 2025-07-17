/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Html5QrcodeSupportedFormats, Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Camera, Scan, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

type Html5QrcodeCameraDevice = {
  id: string;
  label: string;
};

export default function BarcodeScanner({
  onScan,
  onClose,
}: BarcodeScannerProps) {
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<Html5QrcodeCameraDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const qrCodeRegionId = "qr-code-full-region"; // Tarayıcının render edileceği div ID'si

  const stopScanning = useCallback(async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        console.log("QR Code scanning stopped.");
        setIsScanning(false);
        setError(null);
      } catch (err) {
        console.error("Unable to stop scanning.", err);
        setError("Tarayıcı durdurulurken hata oluştu.");
      }
    }
  }, []);

  const startScanning = useCallback(
    async (deviceId: string | null) => {
      setError(null);
      setIsScanning(true);
      console.log("Attempting to start scanning with deviceId:", deviceId);

      const config = {
        fps: 10, // Saniyedeki kare sayısı
        qrbox: { width: 250, height: 250 }, // Tarama kutusu boyutu
        disableFlip: false, // Ters çevrilmiş barkodları okuma
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.DATA_MATRIX,
          Html5QrcodeSupportedFormats.AZTEC,
          Html5QrcodeSupportedFormats.CODABAR,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.MAXICODE,
          Html5QrcodeSupportedFormats.PDF_417,
          Html5QrcodeSupportedFormats.RSS_14,
          Html5QrcodeSupportedFormats.RSS_EXPANDED,
        ],
        // Mobil cihazlar için video kısıtlamaları ekleyelim
        videoConstraints: {
          facingMode: "environment", // Arka kamerayı tercih et
          // ideal çözünürlükler deneyebiliriz
          width: { ideal: 1280 },
          height: { ideal: 720 },
          // veya daha düşük bir çözünürlük deneyebiliriz
          // width: { ideal: 640 },
          // height: { ideal: 480 },
        },
      };

      const onScanSuccess = (decodedText: string, decodedResult: any) => {
        console.log(`Code matched = ${decodedText}`, decodedResult);
        onScan(decodedText);
        stopScanning(); // Başarılı taramadan sonra taramayı durdur
      };

      const onScanError = (errorMessage: string) => {
        // Hata mesajlarını konsola yazdır, kullanıcıya gösterme
        // console.warn(`QR Code scanning error = ${errorMessage}`);
        // setError(errorMessage); // Çok fazla hata mesajı gösterebilir, dikkatli kullanın
      };

      // Önceki tarayıcıyı durdur
      await stopScanning();

      // Html5Qrcode instance'ını oluştur veya mevcutsa kullan
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId);
      }

      try {
        // Tarayıcıyı başlat
        // deviceId null ise, Html5Qrcode varsayılan olarak arka kamerayı (environment) kullanmaya çalışır.
        await html5QrCodeRef.current.start(
          deviceId || { facingMode: "environment" }, // Seçilen cihazı kullan veya arka kamerayı tercih et
          config,
          onScanSuccess,
          onScanError
        );
        setIsScanning(true);
      } catch (err: any) {
        console.error("Kamera başlatılamadı:", err);
        if (err.name === "NotAllowedError") {
          setError(
            "Kamera erişimi reddedildi. Lütfen tarayıcı ayarlarınızdan kamera izinlerini verin."
          );
        } else if (err.name === "NotFoundError") {
          setError(
            "Kamera bulunamadı. Lütfen bir kamera bağlı olduğundan emin olun."
          );
        } else {
          setError(
            `Kamera başlatılamadı: ${err.message}. Lütfen tarayıcı ayarlarınızı kontrol edin.`
          );
        }
        setIsScanning(false);
      }
    },
    [onScan, stopScanning]
  );

  useEffect(() => {
    // Bileşen yüklendiğinde kamera cihazlarını bir kez al
    Html5Qrcode.getCameras()
      .then((videoInputDevices) => {
        if (videoInputDevices && videoInputDevices.length > 0) {
          setDevices(videoInputDevices);
          // İlk bulunan cihazı varsayılan olarak seç
          setSelectedDeviceId(videoInputDevices[0].id || null);
        } else {
          setError("Kamera cihazı bulunamadı.");
        }
      })
      .catch((err) => {
        console.error("Kamera cihazları listelenirken hata:", err);
        setError(
          "Kamera cihazları listelenirken hata oluştu. Lütfen izinleri kontrol edin."
        );
      });

    // Bileşen kaldırıldığında tarayıcıyı durdur
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

  // selectedDeviceId değiştiğinde taramayı başlat/yeniden başlat
  useEffect(() => {
    if (selectedDeviceId) {
      startScanning(selectedDeviceId);
    }
  }, [selectedDeviceId, startScanning]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-6 w-6" /> Barkod Tarayıcı
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Hata!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="relative w-full h-64 bg-gray-200 rounded-md overflow-hidden">
          {/* html5-qrcode tarayıcıyı bu div içine render edecek */}
          <div id={qrCodeRegionId} className="w-full h-full object-cover"></div>
          {/* Tarama kutusunu görselleştirmek için overlay */}
          {isScanning && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{
                // qrbox boyutuna göre ortalanmış bir çerçeve
                border: "2px dashed rgba(255, 255, 255, 0.7)",
                boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
                borderRadius: "8px",
                width: "70%", // %70'lik genişlik
                height: "70%", // %70'lik yükseklik
                maxWidth: "250px", // Maksimum 250px
                maxHeight: "250px", // Maksimum 250px
                margin: "auto",
              }}
            ></div>
          )}
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
              <Camera className="h-12 w-12" />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {!isScanning ? (
            <Button
              onClick={() => startScanning(selectedDeviceId)}
              className="flex-1"
              disabled={!selectedDeviceId}
            >
              <Scan className="mr-2 h-4 w-4" /> Taramayı Başlat
            </Button>
          ) : (
            <Button
              onClick={stopScanning}
              variant="outline"
              className="flex-1 bg-transparent"
            >
              <XCircle className="mr-2 h-4 w-4" /> Taramayı Durdur
            </Button>
          )}
          <Button onClick={onClose} variant="secondary">
            Kapat
          </Button>
        </div>
        {devices.length > 1 && (
          <div className="mt-4">
            <label
              htmlFor="camera-select"
              className="block text-sm font-medium text-gray-700"
            >
              Kamera Seç:
            </label>
            <select
              id="camera-select"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={selectedDeviceId || ""}
              onChange={(e) => {
                setSelectedDeviceId(e.target.value || null);
              }}
            >
              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.label || `Kamera ${device.id}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
