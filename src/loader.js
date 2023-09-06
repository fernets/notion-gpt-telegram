export class Loader {
  icons = [
    '🕐',
    '🕑',
    '🕒',
    '🕓',
    '🕔',
    '🕕',
    '🕖',
    '🕗',
    '🕘',
    '🕙',
    '🕚',
    '🕛'
  ]

  message = null
  interval = null

  constructor(ctx) {
    this.ctx = ctx
  }

  async show() {
    try {
    } catch (error) {
      console.log('Error while showing loader: ', error.message)
    }
    let index = 0
    this.message = await this.ctx.reply(this.icons[index])
    this.interval = setInterval(() => {
      index = index < this.icons.length - 1 ? index + 1 : 0
      // index = (index + 1) % this.icons.length
      this.ctx.telegram.editMessageText(
        this.ctx.chat.id,
        this.message.message_id,
        null,
        this.icons[index]
      )
    }, 500)
  }

  hide() {
    clearInterval(this.interval)
    this.ctx.telegram.deleteMessage(this.ctx.chat.id, this.message.message_id)
  }
}
