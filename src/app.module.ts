import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { MongooseModule } from "@nestjs/mongoose"
import { APP_GUARD } from "@nestjs/core"

import { DatabaseConnection } from "./db/connection"
import { customLoggerProvider } from "./utils/customLoggerProvider"
import { AuthMiddleware } from "./middlewares/AuthMiddleware"
import { RolesGuard } from "./guards/RolesGuard"
import { controllers } from "./controllers"
import { services } from "./services"
import { schemas } from "./db/schemas"
import { repositories } from "./repositories"

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature(schemas),
    DatabaseConnection,
  ],
  controllers: controllers,
  providers: [
    ...services,
    ...repositories,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    customLoggerProvider,
    AuthMiddleware,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: "departments*", method: RequestMethod.ALL },
        { path: "positions*", method: RequestMethod.ALL },
        { path: "users*", method: RequestMethod.ALL },
        { path: "employees*", method: RequestMethod.ALL },
        { path: "projects*", method: RequestMethod.ALL },
        { path: "employees*", method: RequestMethod.ALL },
        { path: "logged-hours*", method: RequestMethod.ALL },
      )
  }
}
