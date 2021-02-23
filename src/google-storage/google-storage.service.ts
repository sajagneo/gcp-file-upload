import { GetFilesOptions, Storage } from "@google-cloud/storage";
import { Injectable } from "@nestjs/common";
import { GoogleCredetailsOptions } from "./google-storage-service-options";
import { Constant } from "../constant/constant";
@Injectable()
export class GoogleStorageService {
  storage;
  constructor(credentails: Partial<GoogleCredetailsOptions>) {
    this.storage = new Storage({
      credentials: credentails,
    });
  }

  uploadFile = (
    bucketName: string,
    fileData: Buffer,
    newPath: string
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const bucket = this.storage.bucket(bucketName);
      // Create a new blob in the bucket and upload the file data.
      const blob = bucket.file(newPath);
      const blobStream = blob.createWriteStream();
      blobStream.on("error", (err) => {
        reject(err);
      });

      blobStream.on("finish", () => {
        resolve(newPath);
      });
      blobStream.end(fileData);
    });
  };

  getSignedUrlForFile = async (
    bucketName: string,
    filePath: string,
    expiryHours: number = Constant.DEFAULT_EXPIRY_FOR_SIGNED_URL
  ) => {
    const bucket = this.storage.bucket(bucketName);
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() + expiryHours);
    const [signedUrl] = await bucket.file(filePath).getSignedUrl({
      version: "v4",
      expires: expiryTime,
      action: "read",
    });
    return signedUrl;
  };

  deleteFile = async (bucketName: string, filePath: string) => {
    // Deletes the file from the bucket
    return await this.storage.bucket(bucketName).file(filePath).delete();
  };
  getFiles = async (
    bucketName: string,
    requireSignedUrl: boolean = true,
    signedUrlExpiryHours: number = Constant.DEFAULT_EXPIRY_FOR_SIGNED_URL,
    options?: GetFilesOptions
  ): Promise<string[]> => {
    const bucket = this.storage.bucket(bucketName);
    // Lists files in the bucket, filtered by a prefix
    let [files] = await bucket.getFiles(options);

    /**
     * Return File Name
     */
    if (requireSignedUrl) {
      return await Promise.all(
        [...files].map(
          async (file): Promise<string> => {
            return await this.getSignedUrlForFile(
              bucketName,
              file.name,
              signedUrlExpiryHours
            );
          }
        )
      );
    } else {
      return [...files].map((file) => {
        return file.name;
      });
    }
  };
}
