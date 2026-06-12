// scripts/crawl-ewha-notice.ts
// =============================================
// 이화 공지사항 크롤러 - 수동 실행용 CLI
// 사용법: npm run crawl
// =============================================

import { runCrawl } from '../src/lib/crawler/runner'

async function main() {
  const result = await runCrawl({ maxPages: 5 })
  console.log(JSON.stringify(result, null, 2))

  if (result.errors.length > 0) {
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
