<script>
  import { createEventDispatcher, onMount } from 'svelte'
  import { storage } from '../lib/storage.js'

  const dispatch = createEventDispatcher()
  export let flowData

  let searchQuery = ''
  let preRegistrations = []
  let selectedId = null

  onMount(() => {
    preRegistrations = storage.getPreRegistrations()
    if (flowData.preRegistration) {
      selectedId = flowData.preRegistration.id
    }
  })

  $: filtered = searchQuery
    ? preRegistrations.filter(r =>
        r.name.includes(searchQuery) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.company.includes(searchQuery) ||
        r.phone.includes(searchQuery)
      )
    : preRegistrations

  function selectRecord(record) {
    selectedId = record.id
    dispatch('select', record)
  }

  function skipToOnsite() {
    dispatch('select', null)
  }

  function getAvatarColor(name, dark = false) {
    const colors = [
      ['#3b82f6', '#1d4ed8'],
      ['#8b5cf6', '#6d28d9'],
      ['#ec4899', '#be185d'],
      ['#10b981', '#059669'],
      ['#f59e0b', '#d97706'],
      ['#ef4444', '#dc2626'],
      ['#06b6d4', '#0891b2']
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const idx = Math.abs(hash) % colors.length
    return dark ? colors[idx][1] : colors[idx][0]
  }
</script>

<div class="step-content">
  <div class="step-header">
    <div class="step-icon-wrap">
      <span class="big-icon">📋</span>
    </div>
    <div>
      <h2>预登记观众查询</h2>
      <p>通过姓名、预登记编号、手机号或公司名称搜索已预登记的观众</p>
    </div>
  </div>

  <div class="search-section">
    <div class="search-box">
      <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M9 4a5 5 0 1 1 0 10 5 5 0 0 1 0-10ZM17 17l-3.5-3.5" stroke="#94a3b8" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
      <input
        class="form-input search-input"
        type="text"
        bind:value={searchQuery}
        placeholder="输入姓名 / 预登记编号 / 手机号 / 公司名称..."
      />
    </div>
    <button class="btn-secondary skip-btn" on:click={skipToOnsite}>
      <span>＋</span> 无预登记，直接现场补录
    </button>
  </div>

  <div class="results-section">
    <div class="results-header">
      <h3>匹配结果 <span class="count-badge">{filtered.length}</span></h3>
      <span class="tip">点击选择一位观众继续流程</span>
    </div>

    <div class="results-list">
      {#each filtered as record (record.id)}
        <div
          class="record-card {selectedId === record.id ? 'selected' : ''}"
          on:click={() => selectRecord(record)}
        >
          <div class="avatar" style="background: linear-gradient(135deg, {getAvatarColor(record.name)} 0%, {getAvatarColor(record.name, true)} 100%)">
            {record.name.charAt(0)}
          </div>
          <div class="record-info">
            <div class="record-top">
              <h4>{record.name}</h4>
              <span class="badge badge-{record.status === 'approved' ? 'success' : record.status === 'pending' ? 'warning' : 'info'}">
                {record.status === 'approved' ? '已审核' : record.status === 'pending' ? '待审核' : '现场注册'}
              </span>
            </div>
            <p class="record-sub">{record.title} · {record.company}</p>
            <div class="record-meta">
              <span>📱 {record.phone}</span>
              <span>🏷️ {record.id}</span>
              {#if record.repeatedEntry}
                <span class="badge badge-info">🔄 可重复入场</span>
              {/if}
            </div>
          </div>
          <div class="select-arrow">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M7 5l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
      {:else}
        <div class="empty-state">
          <span class="empty-icon">🔍</span>
          <h4>未找到匹配的预登记记录</h4>
          <p>请尝试其他关键词，或点击上方按钮进行现场补录</p>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .step-content {
    display: flex;
    flex-direction: column;
    gap: 32px;
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
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
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

  .search-section {
    display: flex;
    gap: 12px;
    align-items: flex-end;
  }

  .search-box {
    flex: 1;
    position: relative;
  }

  .search-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }

  .search-input {
    padding-left: 48px;
  }

  .skip-btn {
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
  }

  .results-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .results-header h3 {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .count-badge {
    background: var(--primary);
    color: white;
    font-size: 12px;
    padding: 2px 10px;
    border-radius: 999px;
    font-weight: 600;
  }

  .tip {
    font-size: 12px;
    color: var(--text-light);
  }

  .results-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .record-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 18px 20px;
    border: 2px solid var(--border);
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: var(--surface-light);
  }

  .record-card:hover {
    border-color: var(--primary-light);
    background: #eff6ff;
    transform: translateX(4px);
  }

  .record-card.selected {
    border-color: var(--primary);
    background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  }

  .avatar {
    width: 54px;
    height: 54px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 22px;
    font-weight: 700;
    flex-shrink: 0;
  }

  .record-info {
    flex: 1;
    min-width: 0;
  }

  .record-top {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 4px;
  }

  .record-top h4 {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
  }

  .record-sub {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }

  .record-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 12px;
    color: var(--text-light);
  }

  .record-meta .badge {
    font-size: 11px;
  }

  .select-arrow {
    color: var(--text-light);
    transition: all 0.2s ease;
  }

  .record-card:hover .select-arrow,
  .record-card.selected .select-arrow {
    color: var(--primary);
    transform: translateX(4px);
  }

  .empty-state {
    text-align: center;
    padding: 60px 24px;
    color: var(--text-secondary);
  }

  .empty-icon {
    font-size: 48px;
    display: block;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  .empty-state h4 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 6px;
    color: var(--text-primary);
  }

  .empty-state p {
    font-size: 13px;
  }

  @media (max-width: 640px) {
    .step-header {
      flex-direction: column;
      text-align: center;
    }
    .search-section {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>
