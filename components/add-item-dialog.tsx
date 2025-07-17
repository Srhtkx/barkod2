"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStock } from "@/context/stock-context";
import { PlusCircle } from "lucide-react";

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialBarcode?: string;
}

export default function AddItemDialog({
  open,
  onOpenChange,
  initialBarcode,
}: AddItemDialogProps) {
  const { addStockItem } = useStock();
  const [brandName, setBrandName] = useState("");
  const [modelName, setModelName] = useState("");
  const [barcodeValue, setBarcodeValue] = useState(initialBarcode || "");
  const [brandImageUrl, setBrandImageUrl] = useState("");
  const [modelImageUrl, setModelImageUrl] = useState("");

  useEffect(() => {
    if (initialBarcode) {
      setBarcodeValue(initialBarcode);
    }
  }, [initialBarcode]);

  const handleSubmit = () => {
    if (brandName && modelName && barcodeValue) {
      addStockItem(
        brandName,
        modelName,
        barcodeValue,
        brandImageUrl,
        modelImageUrl
      );
      // Reset form fields
      setBrandName("");
      setModelName("");
      setBarcodeValue("");
      setBrandImageUrl("");
      setModelImageUrl("");
      onOpenChange(false); // Close dialog
    } else {
      alert("Lütfen marka, model ve barkod bilgilerini girin.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" /> Yeni Ürün Ekle
          </DialogTitle>
          <DialogDescription>
            Yeni bir ürün eklemek için marka, model ve barkod bilgilerini girin.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="brandName" className="text-right">
              Marka Adı
            </Label>
            <Input
              id="brandName"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="col-span-3"
              placeholder="Örn: Deri Sanat"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="brandImageUrl" className="text-right">
              Marka Görsel URL
            </Label>
            <Input
              id="brandImageUrl"
              value={brandImageUrl}
              onChange={(e) => setBrandImageUrl(e.target.value)}
              className="col-span-3"
              placeholder="Örn: /placeholder.svg"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="modelName" className="text-right">
              Model Adı
            </Label>
            <Input
              id="modelName"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              className="col-span-3"
              placeholder="Örn: Klasik Cüzdan"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="modelImageUrl" className="text-right">
              Model Görsel URL
            </Label>
            <Input
              id="modelImageUrl"
              value={modelImageUrl}
              onChange={(e) => setModelImageUrl(e.target.value)}
              className="col-span-3"
              placeholder="Örn: /placeholder.svg"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="barcodeValue" className="text-right">
              Barkod Değeri
            </Label>
            <Input
              id="barcodeValue"
              value={barcodeValue}
              onChange={(e) => setBarcodeValue(e.target.value)}
              className="col-span-3"
              placeholder="Barkodu buraya girin veya tarayın"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>
            Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
