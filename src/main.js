import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import config from 'config'
import { openAiTools } from './openai.js'
import { notion } from './notion.js'
import { ogg } from './ogg.js'
import { Loader } from './loader.js'

const bot = new Telegraf(config.get('TELEGRAM_TOKEN'), {
  handlerTimeout: Infinity
})

bot.command('start', async (ctx) => {
  ctx.reply(
    'Добро пожаловать в бота. Отправьте текстовое или голосовое сообщение с тезисами про историю.'
  )
})

bot.on(message('text'), async (ctx) => {
  try {
    const text = ctx.message.text
    if (!text.trim()) return ctx.reply('Текст не может быть пустым')

    const loader = new Loader(ctx)

    loader.show()

    const response = await openAiTools.chatGPT(text)

    if (!response) return ctx.reply('Ошибка с API', response)

    const notionResponse = await notion.create(text, response.content)

    loader.hide()

    ctx.reply(`Ваша страница: ${notionResponse.url}`)
  } catch (error) {
    console.log('Error while processing text: ', error.message)
  }
})

bot.on(message('voice'), async (ctx) => {
  try {
    const loader = new Loader(ctx)

    loader.show()

    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
    const userId = String(ctx.message.from.id)

    const oggPath = await ogg.create(link.href, userId)
    const mp3Path = await ogg.toMp3(oggPath, userId)

    const text = await openAiTools.transcription(mp3Path)

    if (!text.trim()) {
      loader.hide()
      return await ctx.reply('Текст не может быть пустым')
    }

    // await ctx.reply(`Ваши тезисы: ${text}`)

    const response = await openAiTools.chatGPT(text)

    if (!response) return ctx.reply('Ошибка с API', response)

    const notionResponse = await notion.create(text, response.content)

    loader.hide()

    ctx.reply(`Ваша страница: ${notionResponse.url}`)
  } catch (error) {
    console.log('Error while processing text: ', error.message)
  }
})

bot.launch()
