import { connect, testConnection } from "./pg-utils/index.ts"


;(async () => {
  await connect()
  await testConnection()
})()
