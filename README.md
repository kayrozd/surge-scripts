# Surge 脚本

## IPData IP信誉面板

在 Surge iOS 的模块页面中选择从 URL 安装，粘贴下方链接并启用模块：

https://raw.githubusercontent.com/kayrozd/surge-scripts/main/IPData.sgmodule

脚本地址：https://raw.githubusercontent.com/kayrozd/surge-scripts/main/ipdata-panel.js

面板显示当前出口 IP、Threats 数量和 Trust Score。先通过 api.ipify.org 获取出口 IP，再读取 ipdata.co 网站的公开演示数据；评分缺失时尝试公开 IP 查询页。无需配置个人 API key 或 MITM。进入策略选择页面时，距上次更新至少 300 秒才会自动刷新；也可手动刷新。

Threats 按网站 Summary 的方式统计 threat 对象中值为 true 的字段。Trust Score 优先使用同一份演示数据，并按网站 Summary 的阈值显示风险等级：60 及以上 Low risk，40 至不足 60 Moderate risk，低于 40 High risk。若使用公开查询页回退，则保留该页展示的评分与风险等级。未返回的数据显示“未提供”，请求失败显示错误。

网站演示凭据每次从 ipdata.co 页面动态读取，仅用于当次请求，不硬编码、保存或记录。演示服务的可用性及额度由 ipdata.co 控制。

api.ipify.org、ipdata.co、api.ipdata.co 的请求均遵循当前 Surge 分流规则。若使用不同出口，查询到的 IP 可能与直接打开 ipdata.co 首页时不同；需在配置中将三者安排到同一出口。

公开网页和演示接口可能改变结构、限流或拒绝请求；本脚本不将解析失败视为无风险。已通过真实公开查询页、演示数据和模拟 Surge 回调验证，尚未在 iPhone Surge 中实机验证。

相关文档：[更新记录](docs/changelogs.md)、[项目进度](docs/todo.md)。
