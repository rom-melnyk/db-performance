import { connect, shutdown, testConnection } from "./pg-utils/index.ts"


;(async () => {
  await connect()
  await testConnection()
  await shutdown()
})()
