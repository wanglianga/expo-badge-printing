<script>
  import { createEventDispatcher, onMount } from 'svelte'
  import { storage } from '../lib/storage.js'

  const dispatch = createEventDispatcher()
  export let flowData

  let mode = 'list'
  let searchQuery = ''
  let preRegistrations = []
  let selectedId = null

  let formData = {
    name: '',
    company: '',
    title: '',
    phone: '',
    email: '',
    idCard: '',
    repeatedEntry: null,
    notes: ''
  }

  let errors = {}
  let initialized = false

  onMount(() => {
    preRegistrations = storage.getPreRegistrations()
    if (flowData.preRegistration) {
      selectedId = flowData.preRegistration.id
      switchToForm(flowData.preRegistration)
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

  function switchToForm(record) {
    mode = 'form'
    if (record) {
      formData = {
        name: record.name || '',
        company: record.company || '',
        title: record.title || '',
        phone: record.phone || '',
        email: record.email || '',
        idCard: record.idCard || '',
        repeatedEntry: record.repeatedEntry === true || record.repeatedEntry === false ? record.repeatedEntry : null,
        notes: record.notes || ''
      }
    } else {
      formData = {
        name: '',
        company: '',
        title: '',
        phone: '',
        email: '',
        idCard: '',
        repeatedEntry: null,
        notes: ''
      }
    }
    errors = {}
    initialized = true
  }

  function switchToList() {
    mode = 'list'
    errors = {}
  }

  function selectRecord(record) {
    selectedId = record.id
    switchToForm(record)
  }

  function validate() {
    errors = {}
    if (!formData.name.trim()) errors.name = '请输入姓名'
    if (!formData.phone.trim()) errors.phone = '请输入手机号'
    else if (!/^1[3-9]\d{9}$/.test(formData.phone.replace(/\*/g, '0')) && !formData.phone.includes('*')) {
      errors.phone = '手机号格式不正确'
    }
    if (formData.repeatedEntry !== true && formData.repeatedEntry !== false) {
      errors.repeatedEntry = '请明确配置重复入场权限（开启或关闭）'
    }
    return Object.keys(errors).length === 0
  }

  function handleSubmit() {
    if (!validate()) return

    let preReg = null
    if (selectedId) {
      const existing = preRegistrations.find(r => r.id === selectedId)
      if (existing) {
        preReg = {
          ...existing,
          name: formData.name,
          company: formData.company,
          title: formData.title,
          phone: formData.phone,
          email: formData.email,
          idCard: formData.idCard,
          repeatedEntry: formData.repeatedEntry,
          notes: formData.notes
        }
      }
    }

    const onsiteData = { ...formData }

    if (!preReg) {
      preReg = {
        name: formData.name,
        company: formData.company,
        title: formData.title,
        phone: formData.phone,
        email: formData.email,
        idCard: formData.idCard,
        repeatedEntry: formData.repeatedEntry,
        notes: formData.notes,
        status: 'onsite'
      }
    }

    dispatch('complete', { preRegistration: preReg, onsiteData })
  }
</script>

<div class="step-content">
  <div class="step-header">
    <div class="step-icon-wrap">
      <span class="big-icon">📋</span>
    </div>
    <div>
      <h2>预登记与信息补录</h2>
      <p>选择已预登记观众或直接填写现场注册信息</p>
    </div>
  </div>

  <div class="mode-tabs">
    <button
      class="mode-tab {mode === 'list' ? 'active' : ''}"
      on:click={switchToList}
    >
      <span class="tab-icon">🔍</span>
      选择预登记观众
    </button>
    <button
      class="mode-tab {mode === 'form' ? 'active' : ''}"
      on:click={() => { selectedId = null; switchToForm(null) }}
    >
      <span class="tab-icon">✏️</span>
      现场补录信息
    </button>
  </div>

  {#if mode === 'list'}
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
    </div>

    <div class="results-section">
      <div class="results-header">
        <h3>匹配结果 <span class="count-badge">{filtered.length}</span></h3>
        <span class="tip">点击选择一位观众，确认信息后进入下一步</span>
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
            <p>请尝试其他关键词，或切换到「现场补录信息」标签</p>
          </div>
        {/each}
      </div>
    </div>
  {:else}
    {#if selectedId}
      <div class="info-banner info-success">
        <span class="banner-icon">✅</span>
        <div>
          <strong>已关联预登记记录</strong>
          <p>{formData.name} · {selectedId}</p>
        </div>
        <button class="banner-btn" on:click={switchToList}>重新选择</button>
      </div>
    {:else}
      <div class="info-banner info-warning">
        <span class="banner-icon">ℹ️</span>
        <div>
          <strong>现场注册模式</strong>
          <p>该观众无预登记记录，将作为现场注册观众处理</p>
        </div>
        <button class="banner-btn" on:click={switchToList}>选择预登记</button>
      </div>
    {/if}

    <form on:submit|preventDefault={handleSubmit} class="onsite-form">
      <div class="form-grid">
        <div class="form-field">
          <label class="form-label">姓名 <span class="required">*</span></label>
          <input
            class="form-input {errors.name ? 'input-error' : ''}"
            type="text"
            bind:value={formData.name}
            placeholder="请输入真实姓名"
          />
          {#if errors.name}<span class="field-error">{errors.name}</span>{/if}
        </div>

        <div class="form-field">
          <label class="form-label">手机号 <span class="required">*</span></label>
          <input
            class="form-input {errors.phone ? 'input-error' : ''}"
            type="text"
            bind:value={formData.phone}
            placeholder="请输入11位手机号"
          />
          {#if errors.phone}<span class="field-error">{errors.phone}</span>{/if}
        </div>

        <div class="form-field">
          <label class="form-label">公司名称</label>
          <input
            class="form-input"
            type="text"
            bind:value={formData.company}
            placeholder="请输入所在公司"
          />
        </div>

        <div class="form-field">
          <label class="form-label">职位</label>
          <input
            class="form-input"
            type="text"
            bind:value={formData.title}
            placeholder="请输入职位"
          />
        </div>

        <div class="form-field">
          <label class="form-label">邮箱</label>
          <input
            class="form-input"
            type="email"
            bind:value={formData.email}
            placeholder="请输入邮箱地址"
          />
        </div>

        <div class="form-field">
          <label class="form-label">身份证号</label>
          <input
            class="form-input"
            type="text"
            bind:value={formData.idCard}
            placeholder="选填，用于黑名单校验"
          />
        </div>
      </div>

      <div class="form-section">
        <h3 class="section-title">
          <span class="section-icon">🔐</span>
          权限配置
        </h3>
        <div class="permission-card {errors.repeatedEntry ? 'permission-error' : ''}">
          <div class="permission-item">
            <div class="permission-info">
              <div class="permission-title">重复入场权限 <span class="required">*</span></div>
              <div class="permission-desc">开启后可多次进出展馆，同时影响黑名单校验规则。<strong>必须明确选择开启或关闭。</strong></div>
            </div>
            <label class="switch {formData.repeatedEntry === true ? 'active' : ''} {formData.repeatedEntry === null ? 'inactive' : ''}">
              <input type="checkbox" bind:checked={formData.repeatedEntry} />
              <span class="slider"></span>
            </label>
          </div>
          {#if formData.repeatedEntry === null}
            <div class="permission-warning permission-neutral">
              <span>❓</span>
              <p>请选择是否开启重复入场权限</p>
            </div>
          {:else if !formData.repeatedEntry}
            <div class="permission-warning">
              <span>⚠️</span>
              <p>未开启重复入场：若观众在黑名单中，将<strong>无法</strong>生成证件</p>
            </div>
          {:else}
            <div class="permission-info-inline">
              <span>✅</span>
              <p>已开启重复入场：黑名单观众可二次确认后继续</p>
            </div>
          {/if}
          {#if errors.repeatedEntry}<span class="field-error field-error-block">{errors.repeatedEntry}</span>{/if}
        </div>
      </div>

      <div class="form-field full-width">
        <label class="form-label">备注</label>
        <textarea
          class="form-input"
          bind:value={formData.notes}
          rows="2"
          placeholder="可选，填写特殊说明..."
        ></textarea>
      </div>

      <div class="form-actions">
        <button type="button" class="btn-secondary" on:click={switchToList}>
          ← 返回列表
        </button>
        <button type="submit" class="btn-primary">
          确认信息，选择证件 →
        </button>
      </div>
    </form>
  {/if}
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

  .mode-tabs {
    display: flex;
    gap: 0;
    background: var(--surface-light);
    border-radius: 12px;
    padding: 4px;
    border: 1px solid var(--border);
  }

  .mode-tab {
    flex: 1;
    padding: 12px 20px;
    border-radius: 10px;
    background: transparent;
    color: var(--text-secondary);
    font-weight: 600;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s ease;
  }

  .mode-tab:hover {
    color: var(--text-primary);
  }

  .mode-tab.active {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
    color: white;
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  }

  .tab-icon {
    font-size: 16px;
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

  .info-banner {
    padding: 16px 20px;
    border-radius: 12px;
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .info-success {
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
    border: 1px solid #6ee7b7;
  }

  .info-warning {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border: 1px solid #fcd34d;
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
    flex: 1;
  }

  .banner-btn {
    padding: 6px 14px;
    background: white;
    border: 1px solid var(--border);
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-primary);
    flex-shrink: 0;
  }

  .banner-btn:hover {
    background: var(--surface-light);
  }

  .onsite-form {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-field.full-width {
    grid-column: 1 / -1;
  }

  .required {
    color: #ef4444;
  }

  .input-error {
    border-color: #ef4444 !important;
    background: #fef2f2 !important;
  }

  .field-error {
    color: #ef4444;
    font-size: 12px;
  }

  .form-section {
    border-top: 1px solid var(--border-light);
    padding-top: 24px;
  }

  .section-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .section-icon {
    font-size: 18px;
  }

  .permission-card {
    background: var(--surface-light);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 20px;
  }

  .permission-card.permission-error {
    border-color: #ef4444;
    background: #fef2f2;
  }

  .switch.inactive .slider {
    background: #e2e8f0;
    box-shadow: inset 0 0 0 2px #cbd5e1;
  }

  .switch.inactive .slider::before {
    background: #f8fafc;
  }

  .permission-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  .permission-info {
    flex: 1;
  }

  .permission-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 3px;
  }

  .permission-desc {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .switch {
    position: relative;
    width: 54px;
    height: 30px;
    flex-shrink: 0;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    inset: 0;
    background: #cbd5e1;
    border-radius: 30px;
    transition: 0.3s;
    cursor: pointer;
  }

  .slider::before {
    content: '';
    position: absolute;
    height: 24px;
    width: 24px;
    left: 3px;
    bottom: 3px;
    background: white;
    border-radius: 50%;
    transition: 0.3s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .switch.active .slider {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  }

  .switch.active .slider::before {
    transform: translateX(24px);
  }

  .permission-warning {
    margin-top: 16px;
    padding: 12px 14px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 10px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 12px;
    color: #991b1b;
  }

  .permission-warning span {
    flex-shrink: 0;
  }

  .permission-warning.permission-neutral {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #1e40af;
  }

  .permission-info-inline {
    margin-top: 16px;
    padding: 12px 14px;
    background: #dcfce7;
    border: 1px solid #86efac;
    border-radius: 10px;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 12px;
    color: #166534;
  }

  .permission-info-inline span {
    flex-shrink: 0;
  }

  .field-error-block {
    display: block;
    margin-top: 12px;
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
    .search-section {
      flex-direction: column;
      align-items: stretch;
    }
    .form-grid {
      grid-template-columns: 1fr;
    }
    .form-actions {
      flex-direction: column-reverse;
    }
    .form-actions button {
      width: 100%;
    }
    .mode-tabs {
      flex-direction: column;
    }
    .info-banner {
      flex-wrap: wrap;
    }
  }
</style>
