# Card 卡片

用于承载指标、业务对象和操作入口。

<script setup>
const reportCover = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="720" height="360" viewBox="0 0 720 360">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#172554"/><stop offset=".55" stop-color="#1d4ed8"/><stop offset="1" stop-color="#06b6d4"/></linearGradient></defs>
    <rect width="720" height="360" fill="url(#g)"/>
    <path d="M54 282 164 204l92 36 116-126 112 68 152-118" fill="none" stroke="white" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity=".84"/>
    <circle cx="372" cy="114" r="13" fill="white"/><circle cx="484" cy="182" r="13" fill="white"/><circle cx="636" cy="64" r="13" fill="white"/>
  </svg>
`)}`
</script>

## 经营指标

::: raw
<div class="vp-raw card-metric-grid">
  <ex-card class="metric-card" shadow="sm">
    <div class="metric-heading"><span>本月营收</span><ex-icon icon="arrow-up-line" /></div>
    <strong class="metric-value">¥ 8,426,500</strong>
    <span class="metric-change metric-change--up">较上月 +18.6%</span>
  </ex-card>
  <ex-card class="metric-card" shadow="sm">
    <div class="metric-heading"><span>新增客户</span><ex-icon icon="user-add-line" /></div>
    <strong class="metric-value">1,284</strong>
    <span class="metric-change metric-change--up">较上月 +12.4%</span>
  </ex-card>
  <ex-card class="metric-card" shadow="sm">
    <div class="metric-heading"><span>续约率</span><ex-icon icon="refresh-line" /></div>
    <strong class="metric-value">94.8%</strong>
    <span class="metric-change metric-change--up">目标完成 105%</span>
  </ex-card>
  <ex-card class="metric-card" shadow="sm">
    <div class="metric-heading"><span>待处理工单</span><ex-icon icon="file-text-line" /></div>
    <strong class="metric-value">38</strong>
    <span class="metric-change metric-change--attention">其中 6 项即将超时</span>
  </ex-card>
</div>
:::

## 项目交付

::: raw
<div class="vp-raw card-business-grid">
  <ex-card hoverable shadow="md" aria-label="Aurora 数据中台项目">
    <template #header>
      <div class="card-header-row">
        <div>
          <strong>Aurora 数据中台</strong>
          <p>企业数字化平台 · 二期交付</p>
        </div>
        <ex-tag type="success">进展正常</ex-tag>
      </div>
    </template>
    <div class="project-summary">
      <div class="project-progress-row"><span>整体进度</span><strong>72%</strong></div>
      <div class="project-progress"><span style="width: 72%"></span></div>
      <div class="project-meta">
        <span><ex-icon icon="calendar-line" /> 7 月 28 日交付</span>
        <span><ex-icon icon="user-line" /> 12 位成员</span>
      </div>
      <ex-avatar-group :max-count="4" :size="34" spacing="-8px">
        <ex-avatar text="林" background-color="#2563eb" text-color="#fff" />
        <ex-avatar text="周" background-color="#7c3aed" text-color="#fff" />
        <ex-avatar text="陈" background-color="#0891b2" text-color="#fff" />
        <ex-avatar text="许" background-color="#059669" text-color="#fff" />
        <ex-avatar text="宋" background-color="#d97706" text-color="#fff" />
      </ex-avatar-group>
    </div>
    <template #actions>
      <ex-button type="default" size="small" :glow="false">查看任务</ex-button>
      <ex-button type="primary" size="small">进入项目</ex-button>
    </template>
  </ex-card>

  <ex-card hoverable shadow="md" aria-label="重点客户销售机会">
    <template #header>
      <div class="card-header-row">
        <div>
          <strong>重点客户机会</strong>
          <p>华东区域 · 企业服务</p>
        </div>
        <ex-tag type="warning">商务谈判</ex-tag>
      </div>
    </template>
    <div class="opportunity-value">¥ 2,680,000</div>
    <dl class="opportunity-detail">
      <div><dt>预计签约</dt><dd>2026-07-25</dd></div>
      <div><dt>成交概率</dt><dd>75%</dd></div>
      <div><dt>负责人</dt><dd>许清和</dd></div>
    </dl>
    <template #actions>
      <ex-button type="default" size="small" :glow="false">记录跟进</ex-button>
      <ex-button type="primary" size="small">查看机会</ex-button>
    </template>
  </ex-card>
</div>
:::

## 报告与订阅方案

::: raw
<div class="vp-raw card-business-grid">
  <ex-card :cover="reportCover" :cover-height="180" hoverable shadow="md" aria-label="年度增长报告">
    <template #header>
      <div class="card-header-row"><strong>年度增长报告</strong><ex-tag type="info">报告</ex-tag></div>
    </template>
    <p class="card-copy">汇总渠道效率、客户留存与区域增长数据，支持管理层快速复盘。</p>
    <template #actions>
      <ex-button type="primary" size="small">查看报告</ex-button>
    </template>
  </ex-card>

  <ex-card type="primary" shadow="lg" aria-label="企业专业版订阅">
    <template #header>
      <div class="card-header-row"><strong>企业专业版</strong><ex-tag type="success">推荐</ex-tag></div>
    </template>
    <div class="plan-price"><strong>¥ 2,499</strong><span>/ 月</span></div>
    <ul class="plan-features">
      <li><ex-icon icon="check-line" /> 不限项目与成员</li>
      <li><ex-icon icon="check-line" /> 高级权限与审计日志</li>
      <li><ex-icon icon="check-line" /> 专属客户成功服务</li>
    </ul>
    <template #actions>
      <ex-button type="primary" block>升级专业版</ex-button>
    </template>
  </ex-card>
</div>
:::

## 状态与尺寸

::: raw
<div class="vp-raw card-state-grid">
  <ex-card size="small" type="success"><strong>小型成功卡片</strong></ex-card>
  <ex-card size="medium" type="warning"><strong>中型警告卡片</strong></ex-card>
  <ex-card size="large" loading><strong>正在加载</strong></ex-card>
</div>
:::

## API

### Props

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| `type` | 状态类型 | `default \| primary \| success \| warning \| danger \| info` | `default` |
| `size` | 尺寸 | `small \| medium \| large` | `medium` |
| `shadow` | 阴影 | `none \| sm \| base \| md \| lg \| xl \| neon` | `base` |
| `bordered` | 是否显示边框 | `boolean` | `true` |
| `hoverable` | 是否显示悬停反馈 | `boolean` | `false` |
| `loading` | 是否显示加载遮罩 | `boolean` | `false` |
| `cover` | 封面图片地址 | `string` | — |
| `coverHeight` | 封面高度 | `string \| number` | — |
| `headerStyle` | 头部样式 | `StyleValue` | — |
| `bodyStyle` | 内容样式 | `StyleValue` | — |
| `footerStyle` | 底部样式 | `StyleValue` | — |
| `ariaLabel` | 无障碍名称 | `string` | — |

### Events

| 事件名 | 参数 |
| --- | --- |
| `click` | `(event: MouseEvent)` |

### Slots

| 名称 | 说明 |
| --- | --- |
| `default` | 主体内容 |
| `cover` | 自定义封面 |
| `header` | 头部内容 |
| `footer` | 自定义底部 |
| `actions` | 操作区 |

### Exposes

| 方法 | 类型 |
| --- | --- |
| `getElement` | `() => HTMLDivElement \| null` |

<style scoped>
.card-metric-grid,
.card-business-grid,
.card-state-grid {
  display: grid;
  gap: 20px;
  margin: 18px 0;
}

.card-metric-grid {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.card-business-grid {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.card-state-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.metric-card :deep(.ex-card__body) {
  display: grid;
  gap: 12px;
}

.metric-heading,
.card-header-row,
.project-progress-row,
.project-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.metric-heading,
.card-header-row p,
.project-meta,
.card-copy,
.plan-price span {
  color: var(--ex-color-text-secondary);
}

.metric-value {
  color: var(--ex-color-text-primary);
  font-size: clamp(24px, 3vw, 34px);
  line-height: 1.15;
}

.metric-change {
  font-size: var(--ex-text-sm);
}

.metric-change--up {
  color: var(--ex-color-success);
}

.metric-change--attention {
  color: var(--ex-color-warning);
}

.card-header-row p {
  margin: 4px 0 0;
  font-size: var(--ex-text-sm);
}

.project-summary {
  display: grid;
  gap: 18px;
}

.project-progress {
  height: 8px;
  overflow: hidden;
  border-radius: var(--ex-radius-full);
  background: var(--ex-color-bg-tertiary);
}

.project-progress span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: var(--ex-color-primary);
}

.project-meta {
  flex-wrap: wrap;
  font-size: var(--ex-text-sm);
}

.project-meta span {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.opportunity-value,
.plan-price strong {
  color: var(--ex-color-text-primary);
  font-size: 30px;
  font-weight: var(--ex-font-bold);
}

.opportunity-detail {
  display: grid;
  gap: 12px;
  margin: 22px 0 0;
}

.opportunity-detail div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.opportunity-detail dt {
  color: var(--ex-color-text-secondary);
}

.opportunity-detail dd {
  margin: 0;
  color: var(--ex-color-text-primary);
  font-weight: var(--ex-font-medium);
}

.card-copy {
  margin: 0;
  line-height: var(--ex-leading-relaxed);
}

.plan-price {
  display: flex;
  gap: 6px;
  align-items: baseline;
}

.plan-features {
  display: grid;
  gap: 12px;
  margin: 22px 0 0;
  padding: 0;
  list-style: none;
}

.plan-features li {
  display: flex;
  gap: 8px;
  align-items: center;
}

.plan-features li::marker {
  content: '';
}
</style>
