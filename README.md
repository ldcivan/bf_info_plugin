# bf_info_plugin
田野打架1！5！战绩查询，支持查看所有武器载具详细信息 / 为Yunzai-Bot设计

## 使用方法
<del>
扔进/plugins后，再Yunzai-Bot根目录上运行安装axios（具体用哪个看你当初怎么装的Yunzai依赖）：
</del>

<del>
<code>cnpm install axios</code>或者<code>npm install axios</code>
</del>

<del>
再不行试试<code>pnpm add axios -w</code>
</del>

不用axios了，直接扔进plugin/example就好

之后在js里调调要不要限制输出，限制的话再调调限制多少就好。

发送 #bf1/5 你的ID 查看基本战绩\n发送 #bf1/5weapon 你的ID 查看武器战绩；发送 #bf1/5vehicles 你的ID 查看载具战绩\n发送 #bf1/5class 你的ID 查看兵种战绩；在载具/武器信息指令和Id间加“x条”（如：#bf1weapon5条 Yujio_Nako）可控制返回信息数量

现在可以用#bf绑定id 来绑定你的战地ID了，绑定后您可以用 me 代替您的id

输入#bf help查看帮助

我建议限制一下，要不然半天反不回来结果
## 注意
网页请求出错会反状态码：404大概率是因为查无此人，403大概率是你IP被api限制了

针对报错fetch is not defined，可以参考这个>>>https://github.com/ldcivan/Yunzai_imgSearcher/issues/3

因为每代战地的数据种类不同，数据可能会出现undefined的参数——这是正常的，意味着该代战地风云没有这个数据
## 其他
感谢：

* [官方Yunzai-Bot-V3](https://github.com/Le-niao/Yunzai-Bot) : [Gitee](https://gitee.com/Le-niao/Yunzai-Bot)
  / [Github](https://github.com/Le-niao/Yunzai-Bot)
* [椰羊Plugin](https://github.com/yeyang52/yenai-plugin) : [Gitee](https://gitee.com/yeyang52/yenai-plugin)
  / [Github](https://github.com/yeyang52/yenai-plugin)
