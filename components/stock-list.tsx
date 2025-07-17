"use client";

import {
  useStock,
  type Brand,
  type Model,
  type BarcodeItem,
} from "@/context/stock-context";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Trash2, ImageIcon } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function StockList() {
  const {
    stock,
    deleteBarcode,
    deleteModel,
    deleteBrand,
    updateBrandImage,
    updateModelImage,
  } = useStock();
  const [showBrandImageDialog, setShowBrandImageDialog] = useState(false);
  const [currentBrandName, setCurrentBrandName] = useState("");
  const [currentBrandImageUrl, setCurrentBrandImageUrl] = useState("");

  const [showModelImageDialog, setShowModelImageDialog] = useState(false);
  const [currentModelBrandName, setCurrentModelBrandName] = useState("");
  const [currentModelName, setCurrentModelName] = useState("");
  const [currentModelImageUrl, setCurrentModelImageUrl] = useState("");

  const handleUpdateBrandImage = () => {
    if (currentBrandName && currentBrandImageUrl) {
      updateBrandImage(currentBrandName, currentBrandImageUrl);
      setShowBrandImageDialog(false);
      setCurrentBrandName("");
      setCurrentBrandImageUrl("");
    }
  };

  const handleUpdateModelImage = () => {
    if (currentModelBrandName && currentModelName && currentModelImageUrl) {
      updateModelImage(
        currentModelBrandName,
        currentModelName,
        currentModelImageUrl
      );
      setShowModelImageDialog(false);
      setCurrentModelBrandName("");
      setCurrentModelName("");
      setCurrentModelImageUrl("");
    }
  };

  const openBrandImageEdit = (brand: Brand) => {
    setCurrentBrandName(brand.name);
    setCurrentBrandImageUrl(brand.imageUrl || "");
    setShowBrandImageDialog(true);
  };

  const openModelImageEdit = (brandName: string, model: Model) => {
    setCurrentModelBrandName(brandName);
    setCurrentModelName(model.name);
    setCurrentModelImageUrl(model.imageUrl || "");
    setShowModelImageDialog(true);
  };

  const sortedBrandNames = Object.keys(stock).sort();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Stok Listesi</CardTitle>
        <CardDescription>
          Marka ve modellere göre düzenlenmiş ürün barkodları.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sortedBrandNames.length === 0 ? (
          <p className="text-muted-foreground">
            Henüz stokta ürün yok. Yeni ürün eklemek için yukarıdaki butonu
            kullanın.
          </p>
        ) : (
          <Accordion type="multiple" className="w-full">
            {sortedBrandNames.map((brandName) => {
              const brand = stock[brandName];
              const sortedModelNames = Object.keys(brand.models).sort();
              return (
                <AccordionItem key={brand.name} value={brand.name}>
                  <AccordionTrigger className="flex items-center justify-between w-full text-lg font-semibold">
                    <div className="flex items-center gap-3">
                      {brand.imageUrl && (
                        <Image
                          src={brand.imageUrl || "/placeholder.svg"}
                          alt={`${brand.name} Logo`}
                          width={48}
                          height={48}
                          className="rounded-full object-cover h-12 w-12"
                          onError={(e) =>
                            (e.currentTarget.src =
                              "/placeholder.svg?height=48&width=48")
                          }
                        />
                      )}
                      {brand.name}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="p-4 border rounded-md bg-muted/20 space-y-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openBrandImageEdit(brand)}
                        >
                          <ImageIcon className="h-4 w-4 mr-2" /> Görseli Düzenle
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteBrand(brand.name)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Markayı Sil
                        </Button>
                      </div>
                      {sortedModelNames.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                          Bu markaya ait model bulunmamaktadır.
                        </p>
                      ) : (
                        <div className="grid gap-4">
                          {sortedModelNames.map((modelName) => {
                            const model = brand.models[modelName];
                            return (
                              <Card key={model.name} className="p-4">
                                <CardTitle className="flex items-center justify-between text-base mb-2">
                                  <div className="flex items-center gap-2">
                                    {model.imageUrl && (
                                      <Image
                                        src={
                                          model.imageUrl || "/placeholder.svg"
                                        }
                                        alt={`${model.name} Görseli`}
                                        width={32}
                                        height={32}
                                        className="rounded-md object-cover h-8 w-8"
                                        onError={(e) =>
                                          (e.currentTarget.src =
                                            "/placeholder.svg?height=32&width=32")
                                        }
                                      />
                                    )}
                                    {model.name}
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        openModelImageEdit(brand.name, model)
                                      }
                                    >
                                      <ImageIcon className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() =>
                                        deleteModel(brand.name, model.name)
                                      }
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </CardTitle>
                                <CardDescription className="mb-2">
                                  Barkodlar:
                                </CardDescription>
                                {model.barcodes.length === 0 ? (
                                  <p className="text-muted-foreground text-sm">
                                    Bu modele ait barkod bulunmamaktadır.
                                  </p>
                                ) : (
                                  <ul className="space-y-1 text-sm">
                                    {model.barcodes.map(
                                      (barcode: BarcodeItem) => (
                                        <li
                                          key={barcode.id}
                                          className="flex items-center justify-between bg-background p-2 rounded-md"
                                        >
                                          <span>{barcode.value}</span>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              deleteBarcode(
                                                brand.name,
                                                model.name,
                                                barcode.id
                                              )
                                            }
                                            className="text-red-500 hover:text-red-700"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">
                                              Barkodu Sil
                                            </span>
                                          </Button>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                )}
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </CardContent>

      {/* Brand Image Edit Dialog */}
      <Dialog
        open={showBrandImageDialog}
        onOpenChange={setShowBrandImageDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marka Görselini Düzenle</DialogTitle>
            <DialogDescription>
              {currentBrandName} markası için yeni bir görsel URLsi girin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brandImageUrlEdit" className="text-right">
                Görsel URL
              </Label>
              <Input
                id="brandImageUrlEdit"
                value={currentBrandImageUrl}
                onChange={(e) => setCurrentBrandImageUrl(e.target.value)}
                className="col-span-3"
                placeholder="Örn: /placeholder.svg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateBrandImage}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Model Image Edit Dialog */}
      <Dialog
        open={showModelImageDialog}
        onOpenChange={setShowModelImageDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Model Görselini Düzenle</DialogTitle>
            <DialogDescription>
              {currentModelName} modeli için yeni bir görsel URLsi girin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="modelImageUrlEdit" className="text-right">
                Görsel URL
              </Label>
              <Input
                id="modelImageUrlEdit"
                value={currentModelImageUrl}
                onChange={(e) => setCurrentModelImageUrl(e.target.value)}
                className="col-span-3"
                placeholder="Örn: /placeholder.svg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateModelImage}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
