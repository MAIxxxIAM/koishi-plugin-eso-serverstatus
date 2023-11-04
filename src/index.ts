import { Context, Schema, h } from 'koishi'
import { } from 'koishi-plugin-downloads'
import { } from 'koishi-plugin-puppeteer'
import WebSocket from 'ws'

export interface Config { 
  群ID: string[],
  端口:number
}
export const Config: Schema<Config> = Schema.object({
  群ID: Schema.array(String).role('table'),
  端口: Schema.number().default(38001)
})
export const inject = []



export async function apply(ctx: Context, config: Config) {
  const logger = ctx.logger('eso-serverstatus')
  let ws
  let status = ''
  let timeOut
  ctx.command('开启服务器状态')
    .action(async ({ session }) => {
      ws = new WebSocket(`ws://107.175.8.40:${config.端口}`)
      let wsStatus
      ws.onmessage = function (event) {
        wsStatus = event.data.toString()
      }
      ws.onopen = () => {
        session.send(`服务器状态查看已开启`)
      }

      async function check() {
        let statusClass=['Online','Offline']
        if (status !== wsStatus && statusClass.includes(wsStatus)) {
          status = wsStatus
          await ctx.broadcast(config.群ID ,`服务器状态已更新为 ${status}`)
        }
        timeOut = setTimeout(check, 2000)
      }
      check()
    })


  ctx.command('关闭服务器状态')
    .action(async () => {
      try {
        ws.close()
        clearTimeout(timeOut)
        status = ''
        return `服务器状态查看已关闭`
      } catch (e) {
        logger.error(e)
        return `服务器状态查看未开启`
      }
    })
  ctx.command('服务器状态')
    .action(async () => {
      if (status === '') return `服务器状态查看未开启`
      return (`当前服务器状态为 ${status}`)
    })
}
