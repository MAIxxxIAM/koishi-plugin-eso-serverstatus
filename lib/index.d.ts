import { Context, Schema } from 'koishi';
export interface Config {
    群ID: string[];
    端口: number;
}
export declare const Config: Schema<Config>;
export declare const inject: any[];
export declare function apply(ctx: Context, config: Config): Promise<void>;
