import { Client } from '@notionhq/client'
import config from 'config'

class Notion {
  constructor(auth) {
    this.notion = new Client({
      auth
    })
  }

  #splitText = (text, maxLength) => {
    const chunks = []
    let i = 0
    while (i < text.length) {
      chunks.push(text.slice(i, i + maxLength))
      i += maxLength
    }
    return chunks
  }

  async create(short, text) {
    try {
      const response = await this.notion.pages.create({
        parent: { database_id: config.get('NOTION_DB_ID') },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: short
                }
              }
            ]
          },
          Date: {
            date: {
              start: new Date().toISOString()
            }
          }
        }
      })

      const textChunks = this.#splitText(text, 2000)

      for (const chunk of textChunks) {
        await this.notion.blocks.children.append({
          block_id: response.id,
          children: [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    type: 'text',
                    text: {
                      content: chunk
                    }
                  }
                ]
              }
            }
          ]
        })
      }

      return response
    } catch (error) {
      console.error('Error while creating content in notion: ', error.message)
    }
  }
}

export const notion = new Notion(config.get('NOTION_KEY'))
