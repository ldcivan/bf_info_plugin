/*
田野打架™1！5！战绩查询插件
改自：椰奶plugin - pixiv tag功能
改编者：Yujio_Nako
若有bug可以在GitHub提请issue：
https://github.com/ldcivan/bf_info_plugin
*/

import plugin from '../../lib/plugins/plugin.js'
import fs from 'fs'
import { segment } from "oicq";
import { createRequire } from "module";
import cfg from '../../lib/config/config.js'
const require = createRequire(import.meta.url);

const axios = require('axios');

const dirpath = "plugins/example/bf_info"
var filename = `bf_info.json`
if (!fs.existsSync(dirpath)) {//如果文件夹不存在
	fs.mkdirSync(dirpath);//创建文件夹
}
//如果文件不存在，创建文件
if (!fs.existsSync(dirpath + "/" + filename)) {
    fs.writeFileSync(dirpath + "/" + filename, JSON.stringify({
    }))
}

var limit = 1 //是否限制武器载具信息输出个数
var output_amount = 8 //武器载具信息最多输出几个  我个人建议限制在5-10个，不然输出太慢了
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
                    reg: '^#?(B|b)(F|f)(1|v)(carriers?|vehicles?)(\d?\d?条)?.*$',
                    fnc: 'bf_carrier'
                },
                {
                    reg: '^#?(B|b)(F|f)(1|v)(weapons?)(\d?\d?条)?.*$',
                    fnc: 'bf_weapon'
                },
                {
                    reg: '^#?(B|b)(F|f)(1|v)(class(es)?).*$',
                    fnc: 'bf_class'
                },
                {
                    reg: '^#?(B|b)(F|f)(1|v).*$',
                    fnc: 'bf_base'
                },
                {
                  reg: "^#?(B|b)(F|f)( help)?$",
                  fnc: 'bf_help'
                },
                {
                  reg: "^#?(B|b)(F|f)绑定(I|i)?(D|d)?.*$",
                  fnc: 'bf_creat'
                }
            ]
        })
    }
    

    async bf_base(e) {
        await this.reply("正在查询综合战绩……");
        let playerid = e.msg.replace(/#|(B|b)(F|f)(1|v)| /g, "")
        var version = ""
        if(e.msg.search(/(B|b)(F|f)1/g)!=-1) version = "bf1"
        if(e.msg.search(/(B|b)(F|f)v/g)!=-1) version = "bfv"
        if (/(M|m)(E|e)/g.test(playerid)) {
            var id = e.user_id
            var json = JSON.parse(fs.readFileSync(dirpath + "/" + filename, "utf8"));//读取文件
            if(json.hasOwnProperty(id)) {//如果json中存在该用户
                await this.reply("使用已记录的绑定的id")
                playerid = JSON.stringify(json[id].bf_id).replace(/\"/g, "")
            }
            else{
                await this.reply("你在未绑定id的情况下使用了me\n请先用 #bf绑定id 来让bot记住你的战地id")
            }
        }
        await this.reply(`${playerid}-${version}`);
        try {
            const response = await axios.get(`https://api.gametools.network/${version}/all/?name=${playerid}&lang=zh-tw`,{
                headers: { "Accept-Encoding": "gzip,deflate,compress" }
            })
        } catch (e) {
            await this.reply("404，可能是查无此人：\n"+e)
            console.log("发生异常:" + e)
            return
        }
        const response = await axios.get(`https://api.gametools.network/${version}/all/?name=${playerid}&lang=zh-tw`,{
            headers: { "Accept-Encoding": "gzip,deflate,compress" }
        })
        var jsonobj = response.data;
        //await this.reply((JSON.stringify(jsonobj.avatar)).replaceAll(`\"`, ``));
        let message = []
        await message.push(segment.image((JSON.stringify(jsonobj.avatar)).replaceAll(`\"`, ``)))
        await message.push(`玩家名：${JSON.stringify(jsonobj.userName)}\n玩家等级：${JSON.stringify(jsonobj.rank)}\n技巧值：${JSON.stringify(jsonobj.skill)}\n每分钟得分：${JSON.stringify(jsonobj.scorePerMinute)}\n每分钟击杀：${JSON.stringify(jsonobj.killsPerMinute)}\n胜率：${JSON.stringify(jsonobj.winPercent)}\n最佳兵种：${JSON.stringify(jsonobj.bestClass)}\n准度：${JSON.stringify(jsonobj.accuracy)}\n爆头率：${JSON.stringify(jsonobj.headshots)}\n爆头数：${JSON.stringify(jsonobj.headShots)}\n最远爆头：${JSON.stringify(jsonobj.longestHeadShot)}\n已游玩时间：${JSON.stringify(jsonobj.timePlayed)}\nKD比：${JSON.stringify(jsonobj.killDeath)}\n击杀数：${JSON.stringify(jsonobj.kills)}\n死亡数：${JSON.stringify(jsonobj.deaths)}\n最高连续击杀：${JSON.stringify(jsonobj.highestKillStreak)}\n助攻数：${JSON.stringify(jsonobj.killAssists)}\n救起数：${JSON.stringify(jsonobj.revives)}\n治疗量：${JSON.stringify(jsonobj.heals)}\n维修量：${JSON.stringify(jsonobj.repairs)}\n`)
        const response2 = await axios.get(`https://api.gametools.network/bfban/checkban?names=${playerid}&lang=zh-tw`,{
            headers: { "Accept-Encoding": "gzip,deflate,compress" }
        })
        var jsonobj2 = response2.data;
        for(var key in jsonobj2.names)
            message.push(`是否被联ban：${JSON.stringify(jsonobj2.names[key].hacker)}`)
        message.push(`\n您可使用#bf help获得更多功能命令`)
        
        let forwardMsg = await this.makeForwardMsg(`以下是您查询的${version}玩家${playerid}的综合战绩：`, message)
        await this.reply(forwardMsg)
        //await this.reply(JSON.stringify(jsonobj.results));
        //await this.reply("诶呀，作者还在写，接口还没接上捏");
        //await this.reply(segment.image(e.img[0]));
        await this.reply("以上是所有结果~如果上头没东西，可能是bot被风控了~~");
    }
    
    async bf_carrier(e) {
        //this.reply(e.msg.match(/\d?\d?条/g)[0])
        if(e.msg.match(/\d?\d?条/g)){
            var number_str = e.msg.match(/\d?\d?条/i)[0]
            var number = parseInt(number_str.replace("/条/g",""))
            if(limit==1){
                numres = number
            }
            else{
                var numres = number
            }
            await this.reply(`正在查询载具战绩,需要${numres}条……`);
        }
        else{
            if(limit==1){
                numres = output_amount
                await this.reply(`正在查询载具战绩,需要${numres}条……`);}
            else
                await this.reply(`正在查询载具战绩,需要全部……`);
        }
        let playerid = e.msg.replace(/#|(B|b)(F|f)(1|v)|carriers?|vehicles?| |\d?\d?条/g, "")
        var version = ""
        if(e.msg.search(/(B|b)(F|f)1/g)!=-1) version = "bf1"
        if(e.msg.search(/(B|b)(F|f)v/g)!=-1) version = "bfv"
        if (/(M|m)(E|e)/g.test(playerid)) {
            var id = e.user_id
            var json = JSON.parse(fs.readFileSync(dirpath + "/" + filename, "utf8"));//读取文件
            if(json.hasOwnProperty(id)) {//如果json中存在该用户
                await this.reply("使用已记录的绑定的id")
                playerid = JSON.stringify(json[id].bf_id).replace(/\"/g, "")
            }
            else{
                await this.reply("你在未绑定id的情况下使用了me\n请先用 #bf绑定id 来让bot记住你的战地id")
            }
        }
        await this.reply(`${playerid}-${version}-${numres}条`);
        try {
            const response = await axios.get(`https://api.gametools.network/${version}/all/?name=${playerid}&lang=zh-tw`,{
                headers: { "Accept-Encoding": "gzip,deflate,compress" }
            })
        } catch (e) {
            await this.reply("404，可能是查无此人：\n"+e)
            console.log("发生异常:" + e)
            return
        }
        const response = await axios.get(`https://api.gametools.network/${version}/all/?name=${playerid}&lang=zh-tw`,{
            headers: { "Accept-Encoding": "gzip,deflate,compress" }
        })
        
        var jsonobj = response.data;
        //await this.reply("返回："+JSON.stringify(jsonobj));
        function down(a, b) {
            return b.kills-a.kills
        }
        jsonobj.vehicles.sort(down) //按击杀排序
        let message = []
        if(limit==0&&!numres){
            var numres=Object.keys(jsonobj.vehicles).length
        }
        if(numres > Object.keys(jsonobj.vehicles).length){
            await this.reply(`需要条数越界，已更正为最大值`)
            numres = Object.keys(jsonobj.vehicles).length
        }
        await message.push(segment.image((JSON.stringify(jsonobj.avatar)).replaceAll(`\"`, ``)))
        await message.push(`玩家名：${JSON.stringify(jsonobj.userName)}\n共${Object.keys(jsonobj.vehicles).length}条信息，显示了${numres}条\n`)
        for (var i=0;i<numres;i++){
            await message.push(segment.image((JSON.stringify(jsonobj.vehicles[i].image)).replaceAll(`\"`, ``)))
            await message.push(`载具名：${JSON.stringify(jsonobj.vehicles[i].vehicleName)}\n载具种类：${JSON.stringify(jsonobj.vehicles[i].type)}\n击杀数：${JSON.stringify(jsonobj.vehicles[i].kills)}\nKPM：${JSON.stringify(jsonobj.vehicles[i].killsPerMinute)}\n摧毁载具：${JSON.stringify(jsonobj.vehicles[i].destroyed)}\n乘坐时间：${JSON.stringify(jsonobj.vehicles[i].timeIn)}\n`)
        }
        message.push(`\n您还可以使用“#${version}carrier10条 您的ID”来自定义输出条数\n您可使用#bf help获得更多功能命令`)
        
        let forwardMsg = await this.makeForwardMsg(`以下是您查询的${version}玩家${playerid}的载具战绩：`, message)
        await this.reply(forwardMsg)
        //await this.reply(JSON.stringify(jsonobj.results));
        //await this.reply("诶呀，作者还在写，接口还没接上捏");
        //await this.reply(segment.image(e.img[0]));
        await this.reply("以上是所有结果~如果上头没东西，可能是bot被风控了~~");
    }
    
    async bf_weapon(e) {
        if(e.msg.match(/\d?\d?条/g)){
            var number_str = e.msg.match(/\d?\d?条/i)[0]
            var number = parseInt(number_str.replace("/条/g",""))
            if(limit==1){
                numres = number
            }
            else{
                var numres = number
            }
            await this.reply(`正在查询武器战绩,需要${numres}条……`);
        }
        else{
            if(limit==1){
                numres = output_amount
                await this.reply(`正在查询武器战绩,需要${numres}条……`);}
            else
                await this.reply(`正在查询武器战绩,需要全部……`);
        }
        let playerid = e.msg.replace(/#|(B|b)(F|f)(1|v)|weapons?| |\d?\d?条/g, "")
        var version = ""
        if(e.msg.search(/(B|b)(F|f)1/g)!=-1) version = "bf1"
        if(e.msg.search(/(B|b)(F|f)v/g)!=-1) version = "bfv"
        if (/(M|m)(E|e)/g.test(playerid)) {
            var id = e.user_id
            var json = JSON.parse(fs.readFileSync(dirpath + "/" + filename, "utf8"));//读取文件
            if(json.hasOwnProperty(id)) {//如果json中存在该用户
                await this.reply("使用已记录的绑定的id")
                playerid = JSON.stringify(json[id].bf_id).replace(/\"/g, "")
            }
            else{
                await this.reply("你在未绑定id的情况下使用了me\n请先用 #bf绑定id 来让bot记住你的战地id")
            }
        }
        await this.reply(`${playerid}-${version}-${numres}条`);
        try {
            const response = await axios.get(`https://api.gametools.network/${version}/all/?name=${playerid}&lang=zh-tw`,{
                headers: { "Accept-Encoding": "gzip,deflate,compress" }
            })
        } catch (e) {
            await this.reply("404，可能是查无此人：\n"+e)
            console.log("发生异常:" + e)
            return
        }
        const response = await axios.get(`https://api.gametools.network/${version}/all/?name=${playerid}&lang=zh-tw`,{
            headers: { "Accept-Encoding": "gzip,deflate,compress" }
        })
        
        var jsonobj = response.data;
        //await this.reply((JSON.stringify(jsonobj.avatar)).replaceAll(`\"`, ``));
        function down(a, b) {
            return b.kills-a.kills
        }
        jsonobj.weapons.sort(down) //按击杀排序
        let message = []
        if(limit==0&&!numres){
            var numres=Object.keys(jsonobj.weapon).length
        }
        if(numres>Object.keys(jsonobj.weapons).length){
            await this.reply(`需要条数越界，已更正为最大值`)
            numres = Object.keys(jsonobj.weapons).length
        }
        await message.push(segment.image((JSON.stringify(jsonobj.avatar)).replaceAll(`\"`, ``)))
        await message.push(`玩家名：${JSON.stringify(jsonobj.userName)}\n共${Object.keys(jsonobj.weapons).length}条信息，显示了${numres}条\n`)
        for (var i=0;i<numres;i++){
            await message.push(segment.image((JSON.stringify(jsonobj.weapons[i].image)).replaceAll(`\"`, ``)))
            await message.push(`武器名：${JSON.stringify(jsonobj.weapons[i].weaponName)}\n武器种类：${JSON.stringify(jsonobj.weapons[i].type)}\n击杀数：${JSON.stringify(jsonobj.weapons[i].kills)}\nKPM：${JSON.stringify(jsonobj.weapons[i].killsPerMinute)}\n准度：${JSON.stringify(jsonobj.weapons[i].accuracy)}\n爆头率：${JSON.stringify(jsonobj.weapons[i].headshots)}\n命中/击杀比：${JSON.stringify(jsonobj.weapons[i].hitVKills)}\n`)
        }
        message.push(`\n您还可以使用“#${version}weapon10条 您的ID”来自定义输出条数\n您可使用#bf help获得更多功能命令`)
        
        let forwardMsg = await this.makeForwardMsg(`以下是您查询的${version}玩家${playerid}的武器战绩：`, message)
        await this.reply(forwardMsg)
        //await this.reply(JSON.stringify(jsonobj.results));
        //await this.reply("诶呀，作者还在写，接口还没接上捏");
        //await this.reply(segment.image(e.img[0]));
        await this.reply("以上是所有结果~如果上头没东西，可能是bot被风控了~~");
    }
    
    async bf_class(e) {
        await this.reply("正在查询兵种战绩……");
        let playerid = e.msg.replace(/#|(B|b)(F|f)(1|v)| |class(es)?|/g, "")
        var version = ""
        if(e.msg.search(/(B|b)(F|f)1/g)!=-1) version = "bf1"
        if(e.msg.search(/(B|b)(F|f)v/g)!=-1) version = "bfv"
        if (/(M|m)(E|e)/g.test(playerid)) {
            var id = e.user_id
            var json = JSON.parse(fs.readFileSync(dirpath + "/" + filename, "utf8"));//读取文件
            if(json.hasOwnProperty(id)) {//如果json中存在该用户
                await this.reply("使用已记录的绑定的id")
                playerid = JSON.stringify(json[id].bf_id).replace(/\"/g, "")
            }
            else{
                await this.reply("你在未绑定id的情况下使用了me\n请先用 #bf绑定id 来让bot记住你的战地id")
            }
        }
        await this.reply(`${playerid}-${version}`);
        try {
            const response = await axios.get(`https://api.gametools.network/${version}/all/?name=${playerid}&lang=zh-tw`,{
                headers: { "Accept-Encoding": "gzip,deflate,compress" }
            })
        } catch (e) {
            await this.reply("404，可能是查无此人：\n"+e)
            console.log("发生异常:" + e)
            return
        }
        const response = await axios.get(`https://api.gametools.network/${version}/all/?name=${playerid}&lang=zh-tw`,{
            headers: { "Accept-Encoding": "gzip,deflate,compress" }
        })
        
        var jsonobj = response.data;
        //await this.reply((JSON.stringify(jsonobj.avatar)).replaceAll(`\"`, ``));
        let message = []
        await message.push(segment.image((JSON.stringify(jsonobj.avatar)).replaceAll(`\"`, ``)))
        await message.push(`玩家名：${JSON.stringify(jsonobj.userName)}\n`)
        for (var i=0;i<7;i++){
            await message.push(segment.image((JSON.stringify(jsonobj.classes[i].image)).replaceAll(`\"`, ``)))
            await message.push(`兵种：${JSON.stringify(jsonobj.classes[i].className)}\n兵种得分：${JSON.stringify(jsonobj.classes[i].score)}\n击杀数：${JSON.stringify(jsonobj.classes[i].kills)}\nKPM：${JSON.stringify(jsonobj.classes[i].kpm)}\n游玩时间：${JSON.stringify(jsonobj.classes[i].timePlayed)}\n`)
        }
        message.push(`\n您可使用#bf help获得更多功能命令`)
        
        let forwardMsg = await this.makeForwardMsg(`以下是您查询的${version}玩家${playerid}的兵种战绩：`, message)
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
  
  async bf_creat(e){
    var bf_id = e.msg.replace(/#| |(B|b)(F|f)绑定(I|i)?(D|d)?/g, "")
    var data = {
    "bf_id": bf_id,
    }
    var id = e.user_id
    var json = JSON.parse(fs.readFileSync(dirpath + "/" + filename, "utf8"));//读取文件
    if(!json.hasOwnProperty(id)) {//如果json中不存在该用户
        json[id] = data
        fs.writeFileSync(dirpath + "/" + filename, JSON.stringify(json, null, "\t"));//写入文件
        await this.reply("已记录您的ID，您可再次使用命令覆盖老的记录")
    }
    else{
        json[id] = data
        fs.writeFileSync(dirpath + "/" + filename, JSON.stringify(json, null, "\t"));//写入文件
        await this.reply("已覆盖您的ID，您可再次使用命令覆盖老的记录")
    }
  }
  
  async bf_help(e){
      await e.reply("发送 #bf绑定id 你的ID 将您的QQ与战地ID绑定\n发送 #bf1/v 你的ID 查看基本战绩\n发送 #bf1/vweapon 你的ID 查看武器战绩\n发送 #bf1/vvehicles 你的ID 查看载具战绩\n发送 #bf1/vclass 你的ID 查看兵种战绩\n将 你的ID 替换成 me 可使用绑定的ID进行查询")
  }
}
