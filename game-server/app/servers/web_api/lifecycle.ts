import {ILifeCycle ,Application} from "pinus";
import {events} from "pinus";

import "reflect-metadata";
import {createConnection, createConnections} from "typeorm";
import {Recharge_Log_SQL} from "../../entity/Recharge_Log_SQL";
import { User_MOG } from "../../entity/User_MOG";
import { Account_MOG } from "../../entity/Account_MOG";

var redis = require('redis');

export default function () {
    return new Lifecycle();
}

class Lifecycle implements ILifeCycle {

    beforeStartup(app:Application,next:()=>void) {

        createConnections([{
            name: 'xue_game', // 给这个连接起个名字，如果是用户库，则可以起名 account
            type: 'mongodb',
            host: 'localhost',
            port: 27017,
            username: '',
            password: '',
            database: 'xue_game',
            entities: [
                User_MOG,
                Account_MOG,
             ], // 用此连接的实体
            logging: true, // 开启所有数据库信息打印
            logger: 'advanced-console', // 高亮字体的打印信息
            extra: {
              connectionLimit:  10, // 连接池最大连接数量, 查阅资料 建议是  core number  * 2 + n 
              useNewUrlParser: true,
              useUnifiedTopology: true,
              useCreateIndex: true,
            },
            // cache: {
            //   type: 'redis',
            //   options: {
            //      host: 'localhost',
            //      port: 6379,
            //      username: '',
            //     //  password:'',
            //      db: 0, // 这个任君选择，0～15库都可以选
            //    }
            // }, // 如果对cache没有需求，设置`cache:false`或者干脆不填此个参数也是可以的
          },{
            name: 'xue_log', // 给这个连接起个名字，如果是用户库，则可以起名 account
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: '123456',
            database: 'xue_log',
            entities: [
                Recharge_Log_SQL,
             ], // 用此连接的实体
            synchronize: true,
            logging: true, // 开启所有数据库信息打印
            logger: 'advanced-console', // 高亮字体的打印信息
            extra: {
              connectionLimit:  10, // 连接池最大连接数量, 查阅资料 建议是  core number  * 2 + n 
            },
            // cache: {
            //   type: 'redis',
            //   options: {
            //      host: 'localhost',
            //      port: 6379,
            //      username: '',
            //     //  password:'',
            //      db: 1, // 这个任君选择，0～15库都可以选
            //    }
            // }, // 如果对cache没有需求，设置`cache:false`或者干脆不填此个参数也是可以的
          },
        ]).then(async connections => {
          var client = redis.createClient('6379', '127.0.0.1');
          client.on('connect', function () {
              global["REDIS"] = client;
              next();
          });
        }).catch(error => console.log(error));
    }

    afterStartAll(app:Application):void {
        console.log("------------------初始化web_api-------------------");
    }

    beforeShutdown(app:Application):void {
        console.log("------------------clear web_api-------------------");
    }
}