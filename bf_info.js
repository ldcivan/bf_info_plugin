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
import fetch from "node-fetch"
import lodash from 'lodash'
import common from '../../lib/common/common.js'
//const require = createRequire(import.meta.url);

//const axios = require('axios');

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
                    reg: '^#?(B|b)(F|f)((1|v|V|5|2042))( )*(carriers?|vehicles?)(\d?\d?条)?.*$',
                    fnc: 'bf_carrier'
                },
                {
                    reg: '^#?(B|b)(F|f)((1|v|V|5|2042))( )*(weapons?)(\d?\d?条)?.*$',
                    fnc: 'bf_weapon'
                },
                {
                    reg: '^#?(B|b)(F|f)((1|v|V|5|2042))( )*(class(es)?).*$',
                    fnc: 'bf_class'
                },
                {
                    reg: '^#?(B|b)(F|f)((1|v|V|5|2042)).*$',
                    fnc: 'bf_base'
                },
                {
                  reg: "^#?(B|b)(F|f)( )*(help)?$",
                  fnc: 'bf_help'
                },
                {
                  reg: "^#?(B|b)(F|f)绑定(I|i)?(D|d)?.*$",
                  fnc: 'bf_creat'
                }
            ]
        })
    }
    
    
    async analysis_msg(msg,e) {
        let get_id = msg.replace(/#|(B|b)(F|f)((1|v|V|5|2042))( )*(vehicles?|carriers?|weapons?|class(es)?)?(\d?\d?条)?( )*/g, "");
        let get_version = "";
        if(msg.search(/^#?(B|b)(F|f)1/g)!=-1) {
            get_version = "bf1";
        }
        else if(msg.search(/^#?(B|b)(F|f)(v|V|5)/g)!=-1) {
            get_version = "bfv";
        }
        else if(msg.search(/^#?(B|b)(F|f)2042/g)!=-1) {
            get_version = "bf2042";
        }
        if (/\b(M|m)(E|e)\b/g.test(get_id)) {
            var id = e.user_id
            var json = JSON.parse(fs.readFileSync(dirpath + "/" + filename, "utf8"));//读取文件
            if(json.hasOwnProperty(id)) {//如果json中存在该用户
                await this.reply("使用已记录的绑定的id")
                get_id = JSON.stringify(json[id].bf_id).replace(/\"/g, "")
            }
            else{
                await this.reply("你在未绑定id的情况下使用了me\n请先用 #bf绑定id 来让bot记住你的战地id")
            }
        }
        return [get_id, get_version];
    }
    

    async bf_base(e) {
        await this.reply("正在查询综合战绩……");
        var analysis_msg = await this.analysis_msg(e.msg,e);
        let playerid = analysis_msg[0];
        let version = analysis_msg[1];
        await this.reply(`${playerid}-${version}`);
        var url = `https://api.gametools.network/${version}/all/?name=${playerid}&lang=zh-tw`
        //try {
            //const response = await axios.get(`https://api.gametools.network/${version}/all/?name=${playerid}&lang=zh-tw`,{headers: { "Accept-Encoding": "gzip,deflate,compress" }})
        //} catch (e) {
       //     await this.reply("404，可能是查无此人：\n"+e)
        //    console.log("发生异常:" + e)
        //    return
        //}
        //const response = await axios.get(`https://api.gametools.network/${version}/all/?name=${playerid}&lang=zh-tw`,{headers: { "Accept-Encoding": "gzip,deflate,compress" }})
        //var jsonobj = response.data;
        const response = await fetch(url, { "method": "GET" });
        var jsonobj = await response.json();
        if (jsonobj.errors){
            this.reply(`错误发生：${JSON.stringify(jsonobj.errors)}`)
            return
        }
        //await this.reply((JSON.stringify(jsonobj.avatar)).replaceAll(`\"`, ``));
        let message = []
        await message.push(segment.image((JSON.stringify(jsonobj.avatar)).replaceAll(`\"`, ``)))
        await message.push(
`玩家名：${JSON.stringify(jsonobj.userName)}
玩家等级：${JSON.stringify(jsonobj.rank)}
技巧值：${JSON.stringify(jsonobj.skill)}
每分钟得分：${JSON.stringify(jsonobj.scorePerMinute)}
每分钟击杀：${JSON.stringify(jsonobj.killsPerMinute)}
每分钟伤害：${JSON.stringify(jsonobj.damagePerMinute)}
每场击杀：${JSON.stringify(jsonobj.killsPerMatch)}
每场伤害：${JSON.stringify(jsonobj.damagePerMatch)}
胜率：${JSON.stringify(jsonobj.winPercent)}
最佳兵种：${JSON.stringify(jsonobj.bestClass)}
准度：${JSON.stringify(jsonobj.accuracy)}
爆头率：${JSON.stringify(jsonobj.headshots)}
爆头数：${JSON.stringify(jsonobj.headShots)}
最远爆头：${JSON.stringify(jsonobj.longestHeadShot)}
已游玩时间：${JSON.stringify(jsonobj.timePlayed)}
KD比：${JSON.stringify(jsonobj.killDeath)}
KD比(步兵)：${JSON.stringify(jsonobj.infantryKillDeath)}
击杀数：${JSON.stringify(jsonobj.kills)}
死亡数：${JSON.stringify(jsonobj.deaths)}
最高连续击杀：${JSON.stringify(jsonobj.highestKillStreak)}
助攻数：${JSON.stringify(jsonobj.killAssists)}
救起数：${JSON.stringify(jsonobj.revives)}
治疗量：${JSON.stringify(jsonobj.heals)}
维修量：${JSON.stringify(jsonobj.repairs)}
        `)
        //const response2 = await axios.get(`https://api.gametools.network/bfban/checkban?names=${playerid}&lang=zh-tw`,{headers: { "Accept-Encoding": "gzip,deflate,compress" }})
        const response2 = await fetch(`https://api.gametools.network/bfban/checkban?names=${playerid}`, { "method": "GET" });
        var jsonobj2 = await response2.json();
        for(var key in jsonobj2.names)
            message.push(`是否被联ban：${JSON.stringify(jsonobj2.names[key].hacker)}`)
        message.push(`\n\n您可使用#bf help获得更多功能命令`)
        
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
        var analysis_msg = await this.analysis_msg(e.msg,e);
        let playerid = analysis_msg[0];
        let version = analysis_msg[1];
        await this.reply(`${playerid}-${version}-${numres}条`);
        var url = `https://api.gametools.network/${version}/all/?name=${playerid}&lang=zh-tw`
        //try {
            //const response = await axios.get(`https://api.gametools.network/${version}/all/?name=${playerid}&lang=zh-tw`,{headers: { "Accept-Encoding": "gzip,deflate,compress" }})
        //} catch (e) {
       //     await this.reply("404，可能是查无此人：\n"+e)
        //    console.log("发生异常:" + e)
        //    return
        //}
        //const response = await axios.get(`https://api.gametools.network/${version}/all/?name=${playerid}&lang=zh-tw`,{headers: { "Accept-Encoding": "gzip,deflate,compress" }})
        //var jsonobj = response.data;
        const response = await fetch(url, { "method": "GET" });
        var jsonobj = await response.json();
        if (jsonobj.errors){
            this.reply(`错误发生：${JSON.stringify(jsonobj.errors)}`)
            return
        }
        //await this.reply((JSON.stringify(jsonobj.avatar)).replaceAll(`\"`, ``));
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
        await message.push(`\n玩家名：${JSON.stringify(jsonobj.userName)}\n共${Object.keys(jsonobj.vehicles).length}条信息，显示了${numres}条\n`)
        for (var i=0;i<numres;i++){
            await message.push(segment.image((JSON.stringify(jsonobj.vehicles[i].image)).replaceAll(`\"`, ``)))
            await message.push(`
载具名：${JSON.stringify(jsonobj.vehicles[i].vehicleName)}
载具种类：${JSON.stringify(jsonobj.vehicles[i].type)}
击杀数：${JSON.stringify(jsonobj.vehicles[i].kills)}
KPM：${JSON.stringify(jsonobj.vehicles[i].killsPerMinute)}
摧毁载具：${JSON.stringify(jsonobj.vehicles[i].destroyed)}
乘坐时间：${JSON.stringify(jsonobj.vehicles[i].timeIn)}\n
            `)
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
        var analysis_msg = await this.analysis_msg(e.msg,e);
        let playerid = analysis_msg[0];
        let version = analysis_msg[1];
        await this.reply(`${playerid}-${version}-${numres}条`);
        var url = `https://api.gametools.network/${version}/all/?name=${playerid}&lang=zh-tw`
        //try {
            //const response = await axios.get(`https://api.gametools.network/${version}/all/?name=${playerid}&lang=zh-tw`,{headers: { "Accept-Encoding": "gzip,deflate,compress" }})
        //} catch (e) {
       //     await this.reply("404，可能是查无此人：\n"+e)
        //    console.log("发生异常:" + e)
        //    return
        //}
        //const response = await axios.get(`https://api.gametools.network/${version}/all/?name=${playerid}&lang=zh-tw`,{headers: { "Accept-Encoding": "gzip,deflate,compress" }})
        //var jsonobj = response.data;
        const response = await fetch(url, { "method": "GET" });
        var jsonobj = await response.json();
        if (jsonobj.errors){
            this.reply(`错误发生：${JSON.stringify(jsonobj.errors)}`)
            return
        }
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
        await message.push(`\n玩家名：${JSON.stringify(jsonobj.userName)}\n共${Object.keys(jsonobj.weapons).length}条信息，显示了${numres}条\n`)
        for (var i=0;i<numres;i++){
            await message.push(segment.image((JSON.stringify(jsonobj.weapons[i].image)).replaceAll(`\"`, ``)))
            await message.push(`
武器名：${JSON.stringify(jsonobj.weapons[i].weaponName)}
武器种类：${JSON.stringify(jsonobj.weapons[i].type)}
击杀数：${JSON.stringify(jsonobj.weapons[i].kills)}
KPM：${JSON.stringify(jsonobj.weapons[i].killsPerMinute)}
准度：${JSON.stringify(jsonobj.weapons[i].accuracy)}
爆头率：${JSON.stringify(jsonobj.weapons[i].headshots)}
命中/击杀比：${JSON.stringify(jsonobj.weapons[i].hitVKills)}\n
            `)
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
        var analysis_msg = await this.analysis_msg(e.msg,e);
        let playerid = analysis_msg[0];
        let version = analysis_msg[1];
        await this.reply(`${playerid}-${version}`);
        var url = `https://api.gametools.network/${version}/all/?name=${playerid}&lang=zh-tw`
        //try {
            //const response = await axios.get(`https://api.gametools.network/${version}/all/?name=${playerid}&lang=zh-tw`,{headers: { "Accept-Encoding": "gzip,deflate,compress" }})
        //} catch (e) {
       //     await this.reply("404，可能是查无此人：\n"+e)
        //    console.log("发生异常:" + e)
        //    return
        //}
        //const response = await axios.get(`https://api.gametools.network/${version}/all/?name=${playerid}&lang=zh-tw`,{headers: { "Accept-Encoding": "gzip,deflate,compress" }})
        //var jsonobj = response.data;
        const response = await fetch(url, { "method": "GET" });
        var jsonobj = await response.json();
        if (jsonobj.errors){
            this.reply(`错误发生：${JSON.stringify(jsonobj.errors)}`)
            return
        }
        //await this.reply((JSON.stringify(jsonobj.avatar)).replaceAll(`\"`, ``));
        function down(a, b) {
            return b.kills-a.kills
        }
        jsonobj.classes.sort(down) //按击杀排序
        let message = []
        await message.push(segment.image((JSON.stringify(jsonobj.avatar)).replaceAll(`\"`, ``)))
        await message.push(`\n玩家名：${JSON.stringify(jsonobj.userName)}\n`)
        for (var i=0;i<Object.keys(jsonobj.classes).length;i++){
            await message.push(segment.image((JSON.stringify(jsonobj.classes[i].image)).replaceAll(`\"`, ``)))
            if (version=="bf2042"){message.push(`角色名：${JSON.stringify(jsonobj.classes[i].characterName)}`)}
            await message.push(`
兵种：${JSON.stringify(jsonobj.classes[i].className)}
兵种得分：${JSON.stringify(jsonobj.classes[i].score)}
击杀数：${JSON.stringify(jsonobj.classes[i].kills)}
KPM：${JSON.stringify(jsonobj.classes[i].kpm)}
游玩时间：${JSON.stringify(jsonobj.classes[i].timePlayed)}\n
            `)
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
    forwardMsg.data = JSON.stringify(forwardMsg.data)
    forwardMsg.data = forwardMsg.data
      .replace(/\n/g, '')
      .replace(/<title color="#777777" size="26">(.+?)<\/title>/g, '___')
      .replace(/___+/, `<title color="#777777" size="26">${title}</title>`)
    forwardMsg.data = JSON.parse(forwardMsg.data)

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
      await e.reply("发送 #bf绑定id 你的ID 将您的QQ与战地ID绑定\n发送 #bf1/v/2042 你的ID 查看基本战绩\n发送 #bf1/v/2042 weapon 你的ID 查看武器战绩\n发送 #bf1/v/2042 vehicles 你的ID 查看载具战绩\n发送 #bf1/v/2042 class 你的ID 查看兵种战绩\n将 你的ID 替换成 me 可使用绑定的ID进行查询")
  }
}
