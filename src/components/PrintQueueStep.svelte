<script>
  import { createEventDispatcher, onMount } from 'svelte'
  import { storage } from '../lib/storage.js'

  const dispatch = createEventDispatcher()
  export let data
  export let validationResult

  let isPrinting = false
  let printSuccess = false
  let queueItem = null
  let showBlacklistConfirm = false
  let hasAutoLoggedBlocked = false

  $: errors = validationResult?.errors || []
  $: warnings = validationResult?.warnings || []
  $: hasBlacklistError = errors.some(e => e.type === 'blacklist_blocked')
  $: hasBlacklistWarning = warnings.some(w => w.type === 'blacklist_warning')
  $: blacklistInfo = hasBlacklistError
    ? errors.find(e => e.type === 'blacklist_blocked')?.blacklist
    : hasBlacklistWarning
    ? warnings.find(w => w.type === 'blacklist_warning')?.blacklist
    : null

  $: canPrint = validationResult?.valid && !isPrinting && !printSuccess

  $: if (hasBlacklistError && !hasAutoLoggedBlocked) {
    hasAutoLoggedBlocked = true
    const reason = '黑名单拦截：缺少重复入场权限'
    storage.addHistory({
      type: 'blocked',
      action: '证件打印被拦截',
      attendee: data.attendeeName,
      reason: reason,
      badgeType: data.badgeType?.name
    })
    dispatch('blocked', reason)
  }

  onMount(() => {
    hasAutoLoggedBlocked = false
  })

  function confirmBlacklist() {
    showBlacklistConfirm = true
  }

  function proceedWithWarning() {
    showBlacklistConfirm = false
    doPrint()
  }

  function handleBlocked() {
    const reason = hasBlacklistError
      ? '黑名单拦截：缺少重复入场权限'
      : errors.map(e => e.message || e).join('; ')
    dispatch('blocked', reason)
  }

  async function doPrint() {
    isPrinting = true

    await new Promise(r => setTimeout(r, 1500))

    const item = storage.addToPrintQueue({
      attendeeName: data.attendeeName,
      preRegistration: data.preRegistration,
      onsiteData: data.onsiteData,
      badgeType: data.badgeType
    })

    queueItem = item

    await new Promise(r => setTimeout(r, 1000))

    storage.updatePrintQueueStatus(item.queueId, 'printed')
    isPrinting = false
    printSuccess = true

    dispatch('success', item)
  }

  function handlePrint() {
    if (!canPrint) return
    if (hasBlacklistWarning && !showBlacklistConfirm) {
      confirmBlacklist()
    } else {
      doPrint()
    }
  }
</script>

<div class="step-content">
  <div class="step-header">
    <div class="step-icon-wrap">
      <span class="big-icon">🖨️</span>
    </div>
    <div>
      <h2>打印队列确认</h2>
      <p>核对信息后将证件加入打印队列</p>
    </div>
  </div>

  {#if errors.length > 0}
    <div class="error-section">
      <div class="error-header">
        <span class="error-icon">⛔</span>
        <div>
          <h3>无法生成证件</h3>
          <p>存在以下问题，需先解决后方可继续：</p>
        </div>
      </div>
      <div class="error-list">
        {#each errors as error, i}
          <div class="error-item">
          <span class="error-num">{i + 1}</span>
          <span>{typeof error === 'string' ? error : error.message}</span>
        </div>
      {/each}
      </div>
      {#if hasBlacklistError}
        <div class="auto-logged-info">
          <span>📝</span>
          <p>该拦截事件已<strong>自动记录</strong>至操作历史，可在右侧历史面板查看</p>
        </div>
        <button class="btn-secondary" on:click={() => dispatch('blocked', '__openHistory__')}>
          打开历史记录面板
        </button>
      {/if}
    </div>
  {/if}

  {#if warnings.length > 0}
    <div class="warning-section">
      <div class="warning-header">
        <span class="warning-icon">⚠️</span>
        <div>
          <h3>注意事项</h3>
          <p>请确认以下风险提示：</p>
        </div>
      </div>
      <div class="warning-list">
        {#each warnings as warning}
          <div class="warning-item">
            <span class="warning-dot"></span>
            <span>{typeof warning === 'string' ? warning : warning.message}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if showBlacklistConfirm}
    <div class="confirm-dialog">
      <div class="confirm-header">
        <span class="confirm-icon">🚨</span>
        <div>
          <h3>黑名单观众确认</h3>
          <p>该观众在黑名单中，是否仍要继续打印证件？</p>
        </div>
      </div>
      {#if blacklistInfo}
        <div class="blacklist-detail">
          <div class="bl-row"><span class="bl-label">姓名</span><span>{blacklistInfo.name}</span></div>
          <div class="bl-row"><span class="bl-label">黑名单编号</span><span>{blacklistInfo.id}</span></div>
          <div class="bl-row"><span class="bl-label">列入原因</span><span>{blacklistInfo.reason}</span></div>
          <div class="bl-row"><span class="bl-label">列入时间</span><span>{blacklistInfo.addedAt}</span></div>
        </div>
      {/if}
      <div class="confirm-actions">
        <button class="btn-secondary" on:click={() => showBlacklistConfirm = false}>
          取消
        </button>
        <button class="btn-danger" on:click={proceedWithWarning}>
          确认继续打印
        </button>
      </div>
    </div>
  {/if}

  <div class="preview-section">
    <h3 class="section-title">
      <span class="title-icon">👁️</span>
      证件信息预览
    </h3>

    <div class="badge-preview">
      <div class="preview-card" style="--badge-color: {data.badgeType?.color || '#3b82f6'}">
        <div class="preview-header">
          <span class="preview-icon">{data.badgeType?.icon || '🎫'}</span>
          <span class="preview-type">{data.badgeType?.name || '证件'}</span>
        </div>
        <div class="preview-name">{data.attendeeName || '—'}</div>
        <div class="preview-company">{data.preRegistration?.company || data.onsiteData?.company || '—'}</div>
        <div class="preview-title">{data.preRegistration?.title || data.onsiteData?.title || '—'}</div>
        <div class="preview-footer">
          <span>EXPO 2026</span>
          <span>NO. {data.preRegistration?.id || 'ONSITE'}</span>
        </div>
      </div>

      <div class="info-list">
        <div class="info-row">
          <span class="info-label">证件类型</span>
          <span class="info-value">{data.badgeType?.name || '未选择'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">手机号码</span>
          <span class="info-value">{data.preRegistration?.phone || data.onsiteData?.phone || '—'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">邮箱</span>
          <span class="info-value">{data.preRegistration?.email || data.onsiteData?.email || '—'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">重复入场</span>
          <span class="info-value">
            {#if data.preRegistration?.repeatedEntry || data.onsiteData?.repeatedEntry}
              <span class="badge badge-success">已开启</span>
            {:else}
              <span class="badge badge-warning">未开启</span>
            {/if}
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">来源</span>
          <span class="info-value">
            {data.preRegistration?.status === 'onsite' ? '现场注册' : '预登记'}
          </span>
        </div>
      </div>
    </div>
  </div>

  {#if printSuccess && queueItem}
    <div class="success-section">
      <div class="success-icon">✅</div>
      <h3>证件已加入打印队列</h3>
      <p>队列编号：{queueItem.queueId}</p>
      <p class="success-time">添加时间：{queueItem.addedAt}</p>
    </div>
  {/if}

  {#if isPrinting}
    <div class="printing-section">
      <div class="printer-animation">
        <div class="printer">
          <div class="printer-body">
            <div class="printer-top"></div>
            <div class="printer-output">
              <div class="paper">
                <span>🖨️</span>
                <span class="paper-text">{data.attendeeName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p class="printing-text">正在处理打印任务...</p>
    </div>
  {/if}

  <div class="form-actions">
    <button class="btn-secondary" on:click={() => dispatch('back')} disabled={isPrinting}>
      ← 返回修改
    </button>
    {#if printSuccess}
      <button class="btn-primary" on:click={() => dispatch('reset')}>
        开始新的打印流程
      </button>
    {:else}
      <button
        class="btn-primary"
        disabled={!canPrint || showBlacklistConfirm}
        on:click={handlePrint}
      >
        {isPrinting ? '打印中...' : '确认并加入打印队列 →'}
      </button>
    {/if}
  </div>
</div>

<style>
  .step-content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .step-header {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .step-icon-wrap {
    width: 68px;
    height: 68px;
    border-radius: 18px;
    background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .big-icon {
    font-size: 34px;
  }

  .step-header h2 {
    font-size: 26px;
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: 4px;
    letter-spacing: -0.3px;
  }

  .step-header p {
    color: var(--text-secondary);
    font-size: 14px;
  }

  .error-section {
    padding: 24px;
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    border: 1px solid #fca5a5;
    border-radius: 16px;
  }

  .error-header {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 16px;
  }

  .error-icon {
    font-size: 32px;
    flex-shrink: 0;
  }

  .error-header h3 {
    font-size: 18px;
    font-weight: 700;
    color: #991b1b;
    margin-bottom: 2px;
  }

  .error-header p {
    font-size: 13px;
    color: #b91c1c;
  }

  .error-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 18px;
  }

  .error-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 14px;
    background: white;
    border-radius: 10px;
    font-size: 13px;
    color: #991b1b;
  }

  .error-num {
    width: 22px;
    height: 22px;
    min-width: 22px;
    background: #ef4444;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
  }

  .auto-logged-info {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    background: white;
    border: 1px solid #86efac;
    border-radius: 10px;
    font-size: 13px;
    color: #166534;
    margin-bottom: 14px;
  }

  .auto-logged-info span {
    flex-shrink: 0;
  }

  .warning-section {
    padding: 20px 24px;
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    border: 1px solid #fcd34d;
    border-radius: 16px;
  }

  .warning-header {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 14px;
  }

  .warning-icon {
    font-size: 28px;
    flex-shrink: 0;
  }

  .warning-header h3 {
    font-size: 16px;
    font-weight: 700;
    color: #92400e;
    margin-bottom: 2px;
  }

  .warning-header p {
    font-size: 13px;
    color: #a16207;
  }

  .warning-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .warning-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 13px;
    color: #92400e;
  }

  .warning-dot {
    width: 6px;
    height: 6px;
    min-width: 6px;
    background: #f59e0b;
    border-radius: 50%;
    margin-top: 6px;
  }

  .confirm-dialog {
    padding: 24px;
    background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
    border: 2px solid #fb923c;
    border-radius: 16px;
  }

  .confirm-header {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    margin-bottom: 16px;
  }

  .confirm-icon {
    font-size: 32px;
    flex-shrink: 0;
  }

  .confirm-header h3 {
    font-size: 17px;
    font-weight: 700;
    color: #9a3412;
    margin-bottom: 2px;
  }

  .confirm-header p {
    font-size: 13px;
    color: #c2410c;
  }

  .blacklist-detail {
    background: white;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
  }

  .bl-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #fed7aa;
    font-size: 13px;
  }

  .bl-row:last-child {
    border-bottom: none;
  }

  .bl-label {
    color: var(--text-secondary);
    font-weight: 500;
  }

  .confirm-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .section-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .title-icon {
    font-size: 18px;
  }

  .preview-section {
    padding-top: 4px;
  }

  .badge-preview {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 28px;
    align-items: start;
  }

  .preview-card {
    background: linear-gradient(135deg, var(--badge-color) 0%, rgba(0,0,0,0.35) 100%);
    border-radius: 18px;
    padding: 28px 24px;
    color: white;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    position: relative;
    overflow: hidden;
  }

  .preview-card::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -30%;
    width: 200px;
    height: 200px;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50%;
  }

  .preview-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 28px;
    position: relative;
    z-index: 1;
  }

  .preview-icon {
    font-size: 26px;
  }

  .preview-type {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 2px;
    opacity: 0.95;
  }

  .preview-name {
    font-size: 28px;
    font-weight: 800;
    margin-bottom: 6px;
    letter-spacing: -0.3px;
    position: relative;
    z-index: 1;
  }

  .preview-company {
    font-size: 14px;
    opacity: 0.95;
    margin-bottom: 4px;
    position: relative;
    z-index: 1;
  }

  .preview-title {
    font-size: 12px;
    opacity: 0.8;
    margin-bottom: 24px;
    position: relative;
    z-index: 1;
  }

  .preview-footer {
    display: flex;
    justify-content: space-between;
    padding-top: 14px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 11px;
    opacity: 0.85;
    letter-spacing: 1px;
    position: relative;
    z-index: 1;
  }

  .info-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 0;
    border-bottom: 1px solid var(--border-light);
  }

  .info-row:last-child {
    border-bottom: none;
  }

  .info-label {
    font-size: 13px;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .info-value {
    font-size: 14px;
    color: var(--text-primary);
    font-weight: 600;
  }

  .success-section {
    text-align: center;
    padding: 32px;
    background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
    border: 1px solid #86efac;
    border-radius: 16px;
  }

  .success-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .success-section h3 {
    font-size: 20px;
    font-weight: 700;
    color: #065f46;
    margin-bottom: 6px;
  }

  .success-section > p {
    font-size: 14px;
    color: #047857;
    margin-bottom: 4px;
  }

  .success-time {
    font-size: 12px !important;
    color: var(--text-secondary) !important;
  }

  .printing-section {
    text-align: center;
    padding: 24px;
  }

  .printer-animation {
    display: flex;
    justify-content: center;
    margin-bottom: 16px;
  }

  .printer-top {
    width: 100px;
    height: 50px;
    background: linear-gradient(180deg, #64748b 0%, #475569 100%);
    border-radius: 10px 10px 4px 4px;
  }

  .printer-output {
    position: relative;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    animation: paperOut 1.5s ease-in-out infinite;
  }

  .paper {
    width: 80px;
    height: 60px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    font-size: 20px;
  }

  .paper-text {
    font-size: 9px;
    color: var(--text-secondary);
    max-width: 70px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @keyframes paperOut {
    0%, 100% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(20px); }
  }

  .printing-text {
    color: var(--text-secondary);
    font-size: 14px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .form-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
    gap: 12px;
  }

  @media (max-width: 768px) {
    .badge-preview {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 640px) {
    .step-header {
      flex-direction: column;
      text-align: center;
    }
    .form-actions {
      flex-direction: column-reverse;
    }
    .form-actions button {
      width: 100%;
    }
  }
</style>
