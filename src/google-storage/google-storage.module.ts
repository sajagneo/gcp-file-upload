import { Module, DynamicModule } from "@nestjs/common";
import { GoogleStorageService } from "./google-storage.service";
import { GoogleCredetailsOptions } from "./google-storage-service-options";

const googleStorageServiceFactory = (
  options: Partial<GoogleCredetailsOptions>
) => {
  return {
    provide: GoogleStorageService,
    useFactory: () => {
      return new GoogleStorageService(options);
    },
    inject: [],
  };
};

@Module({})
export class GoogleStorageModule {
  static forRoot(
    options: Partial<GoogleCredetailsOptions>
  ): DynamicModule {
    const providers = [googleStorageServiceFactory(options)];
    return {
      providers: providers,
      exports: providers,
      module: GoogleStorageModule,
    };
  }
}
