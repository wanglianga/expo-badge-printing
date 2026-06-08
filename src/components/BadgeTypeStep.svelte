<script>
  import { createEventDispatcher, onMount } from 'svelte'
  import { storage } from '../lib/storage.js'

  const dispatch = createEventDispatcher()
  export let flowData

  let badgeTypes = []
  let selectedId = null
  let forceFail = false
  let failMessage = ''

  onMount(() => {
    badgeTypes = storage.getBadgeTypes()
    if (flowData.badgeType) {
      selectedId = flowData.badgeType.id
    }
  })

  $: attendee = flowData.preRegistration?.name || flowData.onsiteData?.name || '该观众'
  $: currentBadgeType = flowData.preRegistration?.badgeType || flowData.onsiteData?.badgeType || null

  function selectType(type) {
    selectedId = type.id
  }

  function confirmSelection() {
    const selected = badgeTypes.find(b => b.id === selectedId)
    if (!selected) return

    if (forceFail) {
      failMessage = `证件类型「${selected.name}」库存不足，当前剩余 0 张，请选择其他证件类型或联系管理员补充库存。`
      return
    }

    failMessage = ''
    dispatch('select', selected)
  }

  function triggerFail() {
    forceFail = true
    if (selectedId) {
      const selected = badgeTypes.find(b => b.id === selectedId)
      failMessage = `证件类型「${selected.name}」库存不足，当前剩余 0 张，请选择其他证件类型或联系管理员补充库存。`
    }
  }
</script>

<div class="step-content">
  <div class="step-header">
    <div class="step-icon-wrap">
      <span class="big-icon">🎫</span>
    </div>
    <div>
      <h2>选择证件类型</h2>
      <p>为 <strong class="attendee-name">{attendee}</strong> 选择合适的证件类型</p>
    </div>
  </div>

  {#if currentBadgeType}
    <div class="info-banner">
      <span class="banner-icon">💡</span>
      <div>
        <strong>推荐证件类型</strong>
        <p>根据预登记信息，推荐选择「{storage.getBadgeType(currentBadgeType)?.name || currentBadgeType}」</p>
      </div>
    </div>
  {/if}

  <div class="badge-grid">
    {#each badgeTypes as type (type.id)}
      <div
        class="badge-card {selectedId === type.id ? 'selected' : ''}"
        on:click={() => selectType(type)}
        style="--card-color: {type.color}"
      >
        <div class="badge-visual">
          <div class="badge-shape">
            <span class="badge-emoji">{type.icon}</span>
          </div>
          {#if selectedId === type.id}
            <div class="check-badge">✓</div>
          {/if}
        </div>
        <div class="badge-info">
          <h3 class="badge-name">{type.name}</h3>
          <p class="badge-desc">{type.description}</p>
        </div>
        <div class="badge-status">
          <span class="stock-tag">
            <span class="dot"></span>
            库存充足
          </span>
        </div>
      </div>
    {/each}
  </div>

  {#if failMessage}
    <div class="fail-banner">
      <span class="fail-icon">❌</span>
      <div>
        <strong>证件类型分配失败</strong>
        <p>{failMessage}</p>
      </div>
      <button class="fail-retry" on:click={() => { failMessage = ''; forceFail = false }}>
        重试
      </button>
    </div>
  {/if}

  <div class="debug-section">
    <span class="debug-label">演示场景：</span>
    <button class="debug-btn" on:click={triggerFail}>
      ⚠️ 触发证件类型失败（库存不足）
    </button>
  </div>

  <div class="form-actions">
    <button class="btn-secondary" on:click={() => dispatch('back')}>
      ← 返回修改信息
    </button>
    <button
      class="btn-primary"
      disabled={!selectedId}
      on:click={confirmSelection}
    >
      确认证件类型，进入打印 →
    </button>
  </div>
</div>

<style>
  .step-content {
    display: flex;
    flex-direction: column;
    gap: 28px;
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
    background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
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

  .attendee-name {
    color: var(--primary);
  }

  .info-banner {
    padding: 16px 20px;
    border-radius: 12px;
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    border: 1px solid #93c5fd;
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .banner-icon {
    font-size: 24px;
    flex-shrink: 0;
  }

  .info-banner strong {
    display: block;
    font-size: 14px;
    color: var(--text-primary);
    margin-bottom: 2px;
  }

  .info-banner p {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .badge-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 16px;
  }

  .badge-card {
    position: relative;
    padding: 24px 20px;
    border: 2px solid var(--border);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.25s ease;
    background: var(--surface-light);
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .badge-card:hover {
    transform: translateY(-4px);
    border-color: var(--card-color);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  }

  .badge-card.selected {
    border-color: var(--card-color);
    background: linear-gradient(135deg, var(--surface-light) 0%, rgba(0,0,0,0.02) 100%);
    box-shadow: 0 8px 24px color-mix(in srgb, var(--card-color) 25%, transparent);
  }

  .badge-visual {
    position: relative;
    display: flex;
    justify-content: center;
    padding: 10px 0;
  }

  .badge-shape {
    width: 76px;
    height: 96px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--card-color) 0%, color-mix(in srgb, var(--card-color) 70%, black) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6px 16px color-mix(in srgb, var(--card-color) 40%, transparent);
  }

  .badge-emoji {
    font-size: 38px;
  }

  .check-badge {
    position: absolute;
    top: 0;
    right: 0;
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, var(--card-color) 0%, color-mix(in srgb, var(--card-color) 70%, black) 100%);
    border-radius: 50%;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 14px;
    box-shadow: 0 2px 8px color-mix(in srgb, var(--card-color) 50%, transparent);
  }

  .badge-info {
    text-align: center;
  }

  .badge-name {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  .badge-desc {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .badge-status {
    display: flex;
    justify-content: center;
  }

  .stock-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    background: #d1fae5;
    color: #065f46;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
  }

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #10b981;
  }

  .fail-banner {
    padding: 18px 20px;
    border-radius: 14px;
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    border: 1px solid #f87171;
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .fail-icon {
    font-size: 24px;
    flex-shrink: 0;
  }

  .fail-banner strong {
    display: block;
    font-size: 15px;
    color: #991b1b;
    margin-bottom: 4px;
  }

  .fail-banner p {
    font-size: 13px;
    color: #b91c1c;
    flex: 1;
  }

  .fail-retry {
    padding: 8px 16px;
    background: white;
    color: #991b1b;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid #fca5a5;
  }

  .fail-retry:hover {
    background: #fef2f2;
  }

  .debug-section {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    background: #fff7ed;
    border: 1px dashed #fdba74;
    border-radius: 10px;
  }

  .debug-label {
    font-size: 12px;
    font-weight: 600;
    color: #9a3412;
  }

  .debug-btn {
    padding: 6px 14px;
    background: white;
    color: #c2410c;
    border: 1px solid #fdba74;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
  }

  .debug-btn:hover {
    background: #ffedd5;
  }

  .form-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
    gap: 12px;
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
    .debug-section {
      flex-wrap: wrap;
    }
  }
</style>
