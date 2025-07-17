/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { BrowserMultiFormatReader, NotFoundException } from "@zxing/library";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Camera, Scan, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({
  onScan,
  onClose,
}: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  // selectedDeviceId'ı string | null olarak başlatıyoruz
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const stopScanning = useCallback(() => {
    if (codeReader.current) {
      codeReader.current.reset();
    }
    setIsScanning(false);
    setError(null);
  }, []);

  const startScanning = useCallback(async () => {
    setError(null);
    if (!videoRef.current) return;

    if (!codeReader.current) {
      codeReader.current = new BrowserMultiFormatReader();
    }

    try {
      // deviceIdToUse'ı string | null olarak başlatıyoruz
      let deviceIdToUse: string | null = null;
      let videoInputDevices: MediaDeviceInfo[] = [];

      try {
        // Cihazları listelemeyi dene
        videoInputDevices = await codeReader.current.getVideoInputDevices();
        if (videoInputDevices.length > 0) {
          setDevices(videoInputDevices);
          // selectedDeviceId null ise ilk cihazı kullan, aksi takdirde null olarak kalır
          deviceIdToUse =
            selectedDeviceId || videoInputDevices[0].deviceId || null;
          setSelectedDeviceId(deviceIdToUse); // setSelectedDeviceId de string | null bekliyor
        } else {
          setError(
            "Kamera cihazı bulunamadı. Cihazınızda kamera olduğundan ve izin verdiğinizden emin olun."
          );
          deviceIdToUse = null; // Cihaz bulunamazsa null olarak ayarla
        }
      } catch (enumError: any) {
        console.warn(
          "Cihazları listelerken hata oluştu, varsayılan kamerayı deniyor:",
          enumError
        );
        setError(
          "Kamera cihazlarını listelerken bir sorun oluştu. Varsayılan kamerayı kullanmayı deniyorum. Lütfen kamera izinlerini kontrol edin."
        );
        deviceIdToUse = null; // Hata oluşursa null olarak ayarla
      }

      // Video cihazından barkod çözmeyi dene, seçilen cihaz kimliğini veya null (varsayılan) kullanarak
      codeReader.current.decodeFromVideoDevice(
        deviceIdToUse,
        videoRef.current,
        (result, err) => {
          if (result) {
            onScan(result.getText());
            stopScanning(); // Başarılı taramadan sonra taramayı durdur
          }
          if (err && !(err instanceof NotFoundException)) {
            console.error(err);
            setError("Barkod tararken hata oluştu. Lütfen tekrar deneyin.");
          }
        }
      );
      setIsScanning(true);
    } catch (err: any) {
      console.error("Kamera erişim hatası:", err);
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
  }, [onScan, selectedDeviceId, stopScanning]); // stopScanning'i bağımlılıklara ekledik

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      stopScanning();
    };
  }, [stopScanning]);

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
          <video ref={videoRef} className="w-full h-full object-cover"></video>
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
              <Camera className="h-12 w-12" />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {!isScanning ? (
            <Button onClick={startScanning} className="flex-1">
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
        {devices.length > 1 && isScanning && (
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
                setSelectedDeviceId(e.target.value || null); // Seçilen değer boşsa null olarak ayarla
                stopScanning(); // Stop current scan to restart with new device
                // startScanning will be called by useEffect or manually if needed
              }}
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Kamera ${device.deviceId}`}
                </option>
              ))}
            </select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
