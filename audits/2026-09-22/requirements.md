# 审计预登记范围

扩展登记：在 Chromium 结果收敛后安装 Playwright 对应 Firefox/WebKit，引擎间串行执行同一套 25 个场景；每个引擎仍限制为 30 个生命周期和每规模 3 轮性能样本。CDP 堆/监听器计数只适用于 Chromium，另外两个引擎仅检查可见 DOM 与滚动状态。该扩展不替代历史最低版本或真实设备验证。

对象：vue-ex-ui 1.0.1，源代码 289cd707c0b334959fa5062af55183193fcc2e60；本地空检查点 7389952。所有业务实现保持原状。每项权重固定为 1；高风险决定执行顺序，不改变评分权重。未完成项不计通过，不输出最终总分。

| 编号 | 来源与预期                                      | 机制/组件                     | 风险 | 方法与环境                                         |
| ---- | ----------------------------------------------- | ----------------------------- | ---- | -------------------------------------------------- |
| R01  | package scripts/CI：格式、lint、类型检查通过    | 工程门禁                      | 中   | 当前 Windows/Node，现有脚本                        |
| R02  | vitest.config.ts：既有测试通过，四项覆盖率 ≥80% | 全库                          | 高   | Vitest/JSDOM，原始基线                             |
| R03  | package exports：整包、按需、类型、CSS 可消费   | 交付                          | 高   | 串行生产构建、tarball 独立安装                     |
| R04  | verify-tree-shaking：Button JS≤50KB、CSS≤30KB   | 按需打包                      | 高   | 源码与实际包消费构建                               |
| R05  | guide/index：Chrome88/Firefox78/Safari14/Edge88 | 兼容性                        | 高   | API 静态映射、缺失能力注入；旧引擎另列未测试       |
| R06  | useOverlay、APG：嵌套 Escape 一次仅关闭最上层   | 弹层/Select                   | 高   | 生产构建 Chromium 键盘                             |
| R07  | APG、原生 HTML：焦点导航跳过 disabled fieldset  | 弹层共享焦点管理              | 高   | Chromium 原生 Tab，与普通禁用控件对照              |
| R08  | useOverlay：关闭恢复焦点、滚动锁、清理 DOM      | Modal/Select                  | 高   | 30 次有上限生命周期与 CDP 资源采样                 |
| R09  | 表单异步契约：旧结果不能覆盖新值/卸载状态       | Form/FormItem                 | 高   | 可控 Promise 顺序/卸载，JSDOM                      |
| R10  | ConfigProvider 文档：局部语言覆盖默认组件文案   | Form/ConfigProvider           | 中   | 中英文 Provider 与默认校验规则组合                 |
| R11  | 输入组件契约：组合输入结束前不提交中间值        | Input                         | 高   | Chromium 合成 composition，真实 IME 另列未测试     |
| R12  | Table immutable 契约：新数组/新对象更新准确     | Table                         | 高   | 既有专项测试、实际浏览器数据更新                   |
| R13  | 虚拟滚动契约：末行可达、窗口规模受控            | Table/Select/VirtualList      | 高   | Chromium 100/1000/10000 行，排序/搜索/滚动         |
| R14  | HTML 消毒白名单：不可执行的本地输入输出         | Message/Notification/sanitize | 高   | 固定攻击语料、属性测试、浏览器解析，无外传         |
| R15  | 深合并/字段路径：不引入原型属性                 | deepMerge/Form utils          | 高   | JSON 特殊键与属性测试，区分目标/源对象             |
| R16  | npm audit：生产及开发依赖实际风险               | 供应链                        | 高   | 审计端点、官方公告、代码路径分析                   |
| R17  | guide 无障碍原则，候选 WCAG2.2 AA               | 代表性页面/弹层               | 高   | axe、键盘；读屏/完整 AA 未执行不得通过             |
| R18  | 两主题与配置继承契约                            | Theme/ConfigProvider          | 中   | 既有回归、浏览器两主题与窄视口截图                 |
| R19  | Node 入口与 SSR 相关测试契约                    | 根入口/Provider/ID            | 中   | Node 导入/渲染；hydration 单列                     |
| R20  | 资源管理：卸载后不持续保留实例资源              | 弹层/表格                     | 高   | CDP GC 后分段样本与 DOM/监听器；堆路径有增长再追踪 |
| R21  | 性能评估：同环境生产样本可重现                  | Table/表单/弹层               | 中   | 冷/热、3轮、原始样本；无硬预算不判性能门禁通过     |
| R22  | 测试有效性：关键安全/清理判断可被断言检出       | sanitize/字段路径/焦点        | 高   | 隔离变异、固定有限变异集                           |
| R23  | docs:build 与交互演示配对契约                   | 文档                          | 中   | 原有演示测试、VitePress 实际构建                   |
| R24  | 完整兼容性与感官验收                            | 设备/读屏/视觉                | 高   | 缺少真实设备/旧引擎/审批截图时明确未测试           |

执行上限：属性测试每项 200 次（固定种子 20260922）；HTML 固定语料不超过 20 条、生成字符串最大 256 字符；深度探针最大 4096 层；浏览器操作默认 10 秒超时；生命周期 30 轮；性能每模式 3 轮；最多 3 个定向变异。HTML 安全用例仅修改本地标记，无网络攻击。
