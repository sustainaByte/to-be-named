import { Provider } from "@nestjs/common"

import { CustomLogger } from "src/utils/index"

export const customLoggerProvider: Provider = {
  provide: CustomLogger,
  useValue: new CustomLogger(),
}
