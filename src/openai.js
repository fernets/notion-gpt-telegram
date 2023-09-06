import OpenAI from 'openai'
import config from 'config'
import { createReadStream } from 'fs'

class OpenAITools {
  CHATGPT_MODEL = 'gpt-3.5-turbo'

  ROLES = {
    ASSISTANT: 'assistant',
    SYSTEM: 'system',
    USER: 'user'
  }

  constructor(apiKey) {
    this.openai = new OpenAI({
      apiKey
    })
  }

  #getMessage = (m) => `
Напиши на основе этих тезисов последовательную эмоциональную историю: ${m}

Это тезисы с описанием ключевых моментов дня.
Необходимо в итоге получить такую историю, чтобы я запомнил этот день и смог в последствии рассказать её друзьям. Много текста не нужно, главное, чтобы были эмоции, правильная последовательность + учтение контекста.`

  async chatGPT(message = '') {
    const messages = [
      {
        role: this.ROLES.SYSTEM,
        content:
          'Ты опытный копирайтер, который пишет краткие эмоциональные статьи для соц. сетей.'
      },
      { role: this.ROLES.USER, content: this.#getMessage(message) }
    ]
    try {
      const completion = await this.openai.chat.completions.create({
        messages,
        model: this.CHATGPT_MODEL
      })

      return completion.choices[0].message
    } catch (error) {
      console.error('Error while chat completion', error.message)
    }
  }

  async transcription(filepath) {
    try {
      const transcription = await this.openai.audio.transcriptions.create({
        file: createReadStream(filepath),
        model: 'whisper-1'
      })
      return transcription.text
    } catch (error) {
      console.log('Error while transcription', error.message)
    }
  }
}

export const openAiTools = new OpenAITools(config.get('OPENAI_KEY'))
