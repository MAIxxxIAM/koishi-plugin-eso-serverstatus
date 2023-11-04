"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = exports.inject = exports.Config = void 0;
const koishi_1 = require("koishi");
const ws_1 = __importDefault(require("ws"));
exports.Config = koishi_1.Schema.object({
    群ID: koishi_1.Schema.array(String).role('table'),
    端口: koishi_1.Schema.number().default(38001)
});
exports.inject = [];
async function apply(ctx, config) {
    const logger = ctx.logger('eso-serverstatus');
    let ws;
    let status = '';
    let timeOut;
    ctx.command('开启服务器状态')
        .action(async ({ session }) => {
        ws = new ws_1.default(`ws://107.175.8.40:${config.端口}`);
        let wsStatus;
        ws.onmessage = function (event) {
            wsStatus = event.data.toString();
        };
        ws.onopen = () => {
            session.send(`服务器状态查看已开启`);
        };
        async function check() {
            let statusClass = ['Online', 'Offline'];
            if (status !== wsStatus && statusClass.includes(wsStatus)) {
                status = wsStatus;
                await ctx.broadcast(config.群ID, `服务器状态已更新为 ${status}`);
            }
            timeOut = setTimeout(check, 2000);
        }
        check();
    });
    ctx.command('关闭服务器状态')
        .action(async () => {
        try {
            ws.close();
            clearTimeout(timeOut);
            status = '';
            return `服务器状态查看已关闭`;
        }
        catch (e) {
            logger.error(e);
            return `服务器状态查看未开启`;
        }
    });
    ctx.command('服务器状态')
        .action(async () => {
        if (status === '')
            return `服务器状态查看未开启`;
        return (`当前服务器状态为 ${status}`);
    });
}
exports.apply = apply;
