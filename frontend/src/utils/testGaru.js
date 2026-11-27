
import { Garu } from 'garu-ko'

const main = async () => {
  console.log('Garu 테스트 시작!')

  const garu = await Garu.load()

  const text =
    '2026년 국내 경제 상황에 대해 정부가 발표했다. 관계자에 따르면 경제 상황은 긍정적이다.'

  const result = garu.analyze(text)

  console.log('형태소 분석 결과:', result.tokens)
  console.log('명사만 추출:', garu.nouns(text))

  garu.destroy()
}

main().catch(console.error)
