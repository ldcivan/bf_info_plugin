/*
田野打架™1！5！战绩查询插件
改自：椰奶plugin - pixiv tag功能
改编者：Yujio_Nako
若有bug可以在GitHub提请issue：
https://github.com/ldcivan/bf_info_plugin
*/

import plugin from '../../lib/plugins/plugin.js'
import { segment } from "oicq";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const axios = require('axios');

var limit = 1 //是否限制武器载具信息输出个数
var output_amount = 5 //武器载具信息最多输出几个  我个人建议限制在5-10个，不然输出太慢了
if (limit==1)
    var numres = output_amount
    
export class example extends plugin {
    constructor() {
        super({
            name: 'bf_info',
            event: 'message',
            priority: 5000,
            rule: [
                {
                    reg: '^#?bf(1|5)(carriers?|vehicles?).*$',
                    fnc: 'bf_carrier'
                },
                {
                    reg: '^#?bf(1|5)(weapons?).*$',
                    fnc: 'bf_weapon'
                },
                {
                    reg: '^#?bf(1|5).*$',
                    fnc: 'bf_base'
                },
                {
                  reg: "^#?bf( help)?$",
                  fnc: 'bf_help'
                }
            ]
        })
    }


    async bf_base(e) {
        await this.reply("正在查询综合战绩……");
        let playerid = e.msg.replace(/#|bf1| |bf5/g, "")
        var version = ""
        if(e.msg.indexOf("bf1")!=-1) version = "bf1"
        if(e.msg.indexOf("bf5")!=-1) version = "bf5"
        await this.reply(`${playerid}-${version}`);
        const response = await axios.get(`https://api.gametools.network/${version}/all/?name=${playerid}&lang=en-us`,{
            headers: { "Accept-Encoding": "gzip,deflate,compress" }
        })
        
        var jsonobj = response.data;
        //await this.reply((JSON.stringify(jsonobj.avatar)).replaceAll(`\"`, ``));
        if (jsonobj==""|[]){
            await this.reply("未收到返回数据")
            return
        }
        if (jsonobj.error){
            await this.reply("查无此人")
            return
        }
        if (jsonobj.detail){
            await this.reply("检验错误")
            return
        }
        let message = []
        await message.push(segment.image((JSON.stringify(jsonobj.avatar)).replaceAll(`\"`, ``)))
        await message.push(`玩家名：${JSON.stringify(jsonobj.userName)}\n玩家等级：${JSON.stringify(jsonobj.rank)}\n技巧值：${JSON.stringify(jsonobj.skill)}\n每分钟得分：${JSON.stringify(jsonobj.scorePerMinute)}\n每分钟击杀：${JSON.stringify(jsonobj.killsPerMinute)}\n胜率：${JSON.stringify(jsonobj.winPercent)}\n最佳兵种：${JSON.stringify(jsonobj.bestClass)}\n准度：${JSON.stringify(jsonobj.accuracy)}\n爆头率：${JSON.stringify(jsonobj.headshots)}\n爆头数：${JSON.stringify(jsonobj.headShots)}\n最远爆头：${JSON.stringify(jsonobj.longestHeadShot)}\n已游玩时间：${JSON.stringify(jsonobj.timePlayed)}\nKD比：${JSON.stringify(jsonobj.killDeath)}\n击杀数：${JSON.stringify(jsonobj.kills)}\n死亡数：${JSON.stringify(jsonobj.deaths)}\n最高连续击杀：${JSON.stringify(jsonobj.highestKillStreak)}\n助攻数：${JSON.stringify(jsonobj.killAssists)}\n救起数：${JSON.stringify(jsonobj.revives)}\n治疗量：${JSON.stringify(jsonobj.heals)}\n维修量：${JSON.stringify(jsonobj.repairs)}\n`)
        message.push(`您可使用#${version} carrier/weapon 获取载具武器数据`)
        
        let forwardMsg = await this.makeForwardMsg(`以下是您查询的${version}玩家${playerid}的综合战绩：`, message)
        await this.reply(forwardMsg)
        //await this.reply(JSON.stringify(jsonobj.results));
        //await this.reply("诶呀，作者还在写，接口还没接上捏");
        //await this.reply(segment.image(e.img[0]));
        await this.reply("以上是所有结果~如果上头没东西，可能是bot被风控了~~");
    }
    
    async bf_carrier(e) {
        await this.reply("正在查询载具战绩……");
        let playerid = e.msg.replace(/#|bf1|carriers?|vehicles?| |bf5/g, "")
        var version = ""
        if(e.msg.indexOf("bf1")!=-1) version = "bf1"
        if(e.msg.indexOf("bf5")!=-1) version = "bf5"
        await this.reply(`${playerid}-${version}`);
        const response = await axios.get(`https://api.gametools.network/${version}/all/?name=${playerid}&lang=en-us`,{
            headers: { "Accept-Encoding": "gzip,deflate,compress" }
        })
        
        var jsonobj = response.data;
        //await this.reply((JSON.stringify(jsonobj.avatar)).replaceAll(`\"`, ``));
        if (jsonobj==""|[]){
            await this.reply("未收到返回数据")
            return
        }
        if (jsonobj.error){
            await this.reply("查无此人")
            return
        }
        if (jsonobj.detail){
            await this.reply("检验错误")
            return
        }
        function down(a, b) {
            return b.kills-a.kills
        }
        jsonobj.vehicles.sort(down) //按击杀排序
        let message = []
        await message.push(segment.image((JSON.stringify(jsonobj.avatar)).replaceAll(`\"`, ``)))
        await message.push(`玩家名：${JSON.stringify(jsonobj.userName)}\n`)
        if(limit==0){
            numres=Object.keys(jsonobj.vehicles).length
        }
        for (var i=0;i<numres||Object.keys(jsonobj.vehicles).length;i++){
            await message.push(segment.image((JSON.stringify(jsonobj.vehicles[i].image)).replaceAll(`\"`, ``)))
            await message.push(`载具名：${JSON.stringify(jsonobj.vehicles[i].vehicleName)}\n载具种类：${JSON.stringify(jsonobj.vehicles[i].type)}\n击杀数：${JSON.stringify(jsonobj.vehicles[i].kills)}\nKPM：${JSON.stringify(jsonobj.vehicles[i].killsPerMinute)}\n摧毁载具：${JSON.stringify(jsonobj.vehicles[i].destroyed)}\n乘坐时间：${JSON.stringify(jsonobj.vehicles[i].timeIn)}\n`)
        }
        message.push(`您可使用#${version} weapon 获取武器数据`)
        
        let forwardMsg = await this.makeForwardMsg(`以下是您查询的${version}玩家${playerid}的载具战绩：`, message)
        await this.reply(forwardMsg)
        //await this.reply(JSON.stringify(jsonobj.results));
        //await this.reply("诶呀，作者还在写，接口还没接上捏");
        //await this.reply(segment.image(e.img[0]));
        await this.reply("以上是所有结果~如果上头没东西，可能是bot被风控了~~");
    }
    
    async bf_weapon(e) {
        await this.reply("正在查询武器战绩……");
        let playerid = e.msg.replace(/#|bf1|weapons?| |bf5/g, "")
        var version = ""
        if(e.msg.indexOf("bf1")!=-1) version = "bf1"
        if(e.msg.indexOf("bf5")!=-1) version = "bf5"
        await this.reply(`${playerid}-${version}`);
        const response = await axios.get(`https://api.gametools.network/${version}/all/?name=${playerid}&lang=en-us`,{
            headers: { "Accept-Encoding": "gzip,deflate,compress" }
        })
        
        var jsonobj = response.data;
        //await this.reply((JSON.stringify(jsonobj.avatar)).replaceAll(`\"`, ``));
        if (jsonobj==""|[]){
            await this.reply("未收到返回数据")
            return
        }
        if (jsonobj.error){
            await this.reply("查无此人")
            return
        }
        if (jsonobj.detail){
            await this.reply("检验错误")
            return
        }
        function down(a, b) {
            return b.kills-a.kills
        }
        jsonobj.weapons.sort(down) //按击杀排序
        let message = []
        await message.push(segment.image((JSON.stringify(jsonobj.avatar)).replaceAll(`\"`, ``)))
        await message.push(`玩家名：${JSON.stringify(jsonobj.userName)}\n`)
        if(limit==0){
            numres=Object.keys(jsonobj.weapons).length
        }
        for (var i=0;i<numres;i++){
            await message.push(segment.image((JSON.stringify(jsonobj.weapons[i].image)).replaceAll(`\"`, ``)))
            await message.push(`武器名：${JSON.stringify(jsonobj.weapons[i].weaponName)}\n武器种类：${JSON.stringify(jsonobj.weapons[i].type)}\n击杀数：${JSON.stringify(jsonobj.weapons[i].kills)}\nKPM：${JSON.stringify(jsonobj.weapons[i].killsPerMinute)}\n准度：${JSON.stringify(jsonobj.weapons[i].accuracy)}\n爆头率：${JSON.stringify(jsonobj.weapons[i].headshots)}\n命中/击杀比：${JSON.stringify(jsonobj.weapons[i].hitVKills)}\n`)
        }
        message.push(`您可使用#${version} carrier 获取载具数据`)
        
        let forwardMsg = await this.makeForwardMsg(`以下是您查询的${version}玩家${playerid}的武器战绩：`, message)
        await this.reply(forwardMsg)
        //await this.reply(JSON.stringify(jsonobj.results));
        //await this.reply("诶呀，作者还在写，接口还没接上捏");
        //await this.reply(segment.image(e.img[0]));
        await this.reply("以上是所有结果~如果上头没东西，可能是bot被风控了~~");
    }
    
    
    async makeForwardMsg (title, msg) {
    let nickname = Bot.nickname
    if (this.e.isGroup) {
      let info = await Bot.getGroupMemberInfo(this.e.group_id, Bot.uin)
      nickname = info.card ?? info.nickname
    }
    let userInfo = {
      user_id: Bot.uin,
      nickname
    }

    let forwardMsg = [
      {
        ...userInfo,
        message: title
      },
      {
        ...userInfo,
        message: msg
      }
    ]

    /** 制作转发内容 */
    if (this.e.isGroup) {
      forwardMsg = await this.e.group.makeForwardMsg(forwardMsg)
    } else {
      forwardMsg = await this.e.friend.makeForwardMsg(forwardMsg)
    }

    /** 处理描述 */
    forwardMsg.data = forwardMsg.data
      .replace(/\n/g, '')
      .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
      .replace(/___+/, `<title color="#777777" size="26">${title}</title>`)

    return forwardMsg
  }
  async bf_help(e){
      await e.reply("回复图片“#搜图”或带图发送“#搜图”即可查询图片来源")
  }
}