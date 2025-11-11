// components/FileUpload.tsx
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, X, FileText, Image, CheckCircle2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { workOrderSchema } from "@/lib/validations/workOrder";
import z, { file } from "zod";
import { v4 } from "uuid";

interface FilePreview {
  id: string;
  file: File;
  previewUrl: string;
  type: "image" | "pdf" | "other";
}

interface UploadProgress {
  [key: string]: number;
}

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

interface DocumentsEntryStepProps {
  form: UseFormReturn<WorkOrderFormData>;
}

export function DocumentUpload({ form }: DocumentsEntryStepProps) {
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    [key: string]: boolean;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const newFiles: FilePreview[] = [];

    Array.from(selectedFiles).forEach((file) => {
      const previewUrl = URL.createObjectURL(file);
      let type: "image" | "pdf" | "other" = "other";

      if (file.type.startsWith("image/")) {
        type = "image";
      } else if (file.type === "application/pdf") {
        type = "pdf";
      }

      newFiles.push({ id: v4(), file, previewUrl, type });
    });

    setFiles((prev) => [...prev, ...newFiles]);

    // Reset input to allow selecting same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (id: string) => {
    const index = files.findIndex((f) => f.id === id);
    if (index === -1) return;
    const fileToRemove = files[index];
    URL.revokeObjectURL(fileToRemove.previewUrl);

    setFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadResults((prev) => {
      const newResults = { ...prev };
      delete newResults[fileToRemove.file.name];
      return newResults;
    });
  };

  const getPresignedUrl = async (
    fileName: string,
    fileType: string
  ): Promise<{ url: string; key: string }> => {
    // Replace with your actual backend endpoint
    const response = await fetch("/api/documents/presigned-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName,
        fileType,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to get presigned URL");
    }

    const data = await response.json();
    return data.data;
  };

  const uploadToS3 = async (
    file: File,
    presignedUrl: string
  ): Promise<void> => {
    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: progress,
          }));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error("Upload failed"));
        }
      });

      xhr.addEventListener("error", () => reject(new Error("Upload failed")));
      xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

      xhr.open("PUT", presignedUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      xhr.send(file);
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress({});
    setUploadResults({});

    try {
      for (const filePreview of files) {
        const { file } = filePreview;

        try {
          // Step 1: Get presigned URL from backend
          const presignedUrl = await getPresignedUrl(file.name, file.type);

          // Step 2: Upload file to S3 using presigned URL
          await uploadToS3(file, presignedUrl.url);

          // Mark as successful
          setUploadResults((prev) => ({
            ...prev,
            [filePreview.id]: true,
          }));

          form.setValue("documents", [
            ...(form.getValues("documents") || []),
            {
              id: filePreview.id,
              file_name: file.name,
              file_type: file.type,
              s3_path: presignedUrl.key,
            },
          ]);
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          setUploadResults((prev) => ({
            ...prev,
            [filePreview.id]: false,
          }));
        }
      }
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (type: "image" | "pdf" | "other") => {
    switch (type) {
      case "image":
        return <Image className="h-5 w-5" />;
      case "pdf":
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-6 w-6" />
          Upload Files
        </CardTitle>
        <CardDescription>
          Upload documents and images. Files will be securely stored in AWS S3.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Drop Zone */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
          />
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-semibold">Drag and drop files here</p>
            <p className="text-sm text-gray-500">or click to browse</p>
            <p className="text-xs text-gray-400">
              Supports PDF, JPG, PNG, GIF, WEBP (Max 10MB each)
            </p>
          </div>
        </div>

        {/* Selected Files List */}
        {files.length > 0 && (
          <div className="space-y-4">
            <Label>Selected Files ({files.length})</Label>
            <div className="space-y-3">
              {files.map((filePreview, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {getFileIcon(filePreview.type)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {filePreview.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(filePreview.file.size)}
                      </p>
                    </div>
                    {uploadResults[filePreview.id] !== undefined &&
                      (uploadResults[filePreview.id] ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <span className="text-xs text-red-500">Failed</span>
                      ))}
                  </div>

                  {/* Progress Bar */}
                  {isUploading &&
                    uploadProgress[filePreview.file.name] !== undefined && (
                      <div className="w-32 mx-4">
                        <Progress
                          value={uploadProgress[filePreview.file.name]}
                          className="h-2"
                        />
                      </div>
                    )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(filePreview.id)}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Preview Area */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              {files.map((filePreview, index) => (
                <div
                  key={index}
                  className="relative border rounded-lg overflow-hidden"
                >
                  {filePreview.type === "image" && (
                    <img
                      src={filePreview.previewUrl}
                      alt="Preview"
                      className="w-full h-32 object-cover"
                    />
                  )}
                  {filePreview.type === "pdf" && (
                    <div className="w-full h-32 bg-red-50 flex items-center justify-center">
                      <FileText className="h-12 w-12 text-red-400" />
                      <span className="sr-only">PDF Document</span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 truncate">
                    {filePreview.file.name}
                  </div>
                </div>
              ))}
            </div>

            {/* Upload Button */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleUpload}
                disabled={isUploading || files.length === 0}
                className="flex-1"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setFiles([])}
                disabled={isUploading || files.length === 0}
              >
                Clear All
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
