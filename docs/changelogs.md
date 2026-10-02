# 更新记录

## [Unreleased]
### 新增
- 所有 IPData 检测请求固定使用已有 AI 策略组，面板标题显示组名。
- IPData Surge iOS / Mac 面板模块及远程脚本，显示出口 IP、Summary 的 Threats 数量与 Trust Score。
- 安装说明和请求失败、字段缺失提示。

### 修复
- 兼容未提供 clearTimeout 的脚本引擎，确保能返回面板结果。
- 模块引用提交固定的 JS 地址，避免使用旧脚本缓存。
- 移除仅限 iOS 的模块声明，允许 Surge Mac 安装。
