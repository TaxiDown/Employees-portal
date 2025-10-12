"use client"

import { useState, useRef, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, FileText, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function XmlFileUploadDialog() {
  const t = useTranslations("xmlUpload")
  const [open, setOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const validateXmlFile = (file) => file.name.toLowerCase().endsWith(".xml")

  const parseXmlContent = async (file) => {
    try {
      const text = await file.text()
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(text, "text/xml")
      return !xmlDoc.querySelector("parsererror")
    } catch {
      return false
    }
  }

  const processFile = useCallback(async (file) => {
    setIsProcessing(true)
    setError(null)

    if (!validateXmlFile(file)) {
      setError(t("errors.invalidType"))
      setIsProcessing(false)
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(t("errors.tooLarge"))
      setIsProcessing(false)
      return
    }

    try {
      const content = await file.text()
      const isValid = await parseXmlContent(file)

      setUploadedFile({
        name: file.name,
        size: file.size,
        content,
        isValid,
      })

      if (!isValid) {
        setError(t("errors.invalidXml"))
      }
    } catch {
      setError(t("errors.readFail"))
    } finally {
      setIsProcessing(false)
    }
  }, [t])

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) processFile(files[0])
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0])
    }
  }

  const handleButtonClick = () => fileInputRef.current?.click()

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }


  
  const handleProcessFile = async () => {
    if (!uploadedFile) return

    setIsUploading(true)
    setError(null)
    setUploadSuccess(false)

    try {
      const formData = new FormData()
      const fileInput = fileInputRef.current;
      if (fileInput && fileInput.files && fileInput.files[0]) {
        formData.append("file", fileInput.files[0])
      } else {
        throw new Error("File not found")
      }

      const response = await fetch("/api/upload_xml", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      setUploadSuccess(true)

      setTimeout(() => {
        
        window.location.reload();
        /*setOpen(false)
        setUploadedFile(null)
        setError(null)
        setUploadSuccess(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }*/
      }, 2000)
    } catch (err) {
      setError(err.message || "Failed to upload file. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }
  
  

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="hover:text-orange-700 hover:bg-white cursor-pointer text-orange-500 bg-white text-lg font-medium">
          <Upload strokeWidth={2.75} /> {t("buttons.upload")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative border-2 border-dashed rounded-lg transition-all duration-200",
              isDragging
                ? "border-accent bg-accent/5"
                : "border-border bg-background",
              "hover:border-accent/50",
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xml"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="p-8 text-center">
              {isProcessing ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-10 w-10 text-accent animate-spin" />
                  <p className="text-sm font-medium text-foreground">
                    {t("processing")}
                  </p>
                </div>
              ) : uploadedFile ? (
                <div className="flex flex-col items-center gap-3">
                  <div
                    className={`h-12 w-12 rounded-full flex items-center justify-center ${
                      uploadedFile.isValid
                        ? "bg-[oklch(0.55_0.15_145)]"
                        : "bg-destructive"
                    }`}
                  >
                    {uploadedFile.isValid ? (
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    ) : (
                      <XCircle className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-foreground flex items-center gap-2 justify-center">
                      <FileText className="h-4 w-4" />
                      {uploadedFile.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(uploadedFile.size)}
                    </p>
                    {uploadedFile.isValid && (
                      <p className="text-sm font-medium text-[oklch(0.55_0.15_145)]">
                        {t("status.valid")}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleRemoveFile}
                    variant="outline"
                    size="sm"
                    className="mt-2 border-border hover:bg-muted bg-transparent"
                  >
                    {t("buttons.remove")}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-foreground">
                      {t("dragDrop.title")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("dragDrop.subtitle")}
                    </p>
                  </div>
                  <Button
                    onClick={handleButtonClick}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
                  >
                    {t("buttons.browse")}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    {t("dragDrop.hint")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-destructive">
                    {t("errorTitle")}
                  </p>
                  <p className="text-xs text-destructive/90">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* File details */}
          {uploadedFile && uploadedFile.isValid && (
            <div className="p-4 bg-muted rounded-lg border border-border">
              <h4 className="font-semibold text-foreground mb-2 text-sm">
                {t("fileDetails.title")}
              </h4>
              <div className="space-y-1 text-xs">
                <p className="text-foreground">
                  <span className="font-medium">{t("fileDetails.name")}:</span>{" "}
                  {uploadedFile.name}
                </p>
                <p className="text-foreground">
                  <span className="font-medium">{t("fileDetails.size")}:</span>{" "}
                  {formatFileSize(uploadedFile.size)}
                </p>
                <p className="text-foreground">
                  <span className="font-medium">{t("fileDetails.status")}:</span>{" "}
                  <span className="text-[oklch(0.55_0.15_145)] font-medium">
                    {t("status.ready")}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Process button */}
          {uploadedFile && uploadedFile.isValid && (
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleProcessFile}
                className="bg-[oklch(0.55_0.15_145)] hover:bg-[oklch(0.50_0.15_145)] text-white font-medium"
              >
                {t("buttons.process")}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
