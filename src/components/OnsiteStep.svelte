<script>
  import { createEventDispatcher, onMount } from 'svelte'
  const dispatch = createEventDispatcher()

  export let flowData

  let formData = {
    name: '',
    company: '',
    title: '',
    phone: '',
    email: '',
    idCard: '',
    repeatedEntry: false,
    notes: ''
  }

  let errors = {}

  onMount(() => {
    if (flowData.preRegistration) {
      const p = flowData.preRegistration
      formData = {
        name: p.name || '',
        company: p.company || '',
        title: p.title || '',
        phone: p.phone || '',
        email: p.email || '',
        idCard: '',
        repeatedEntry: p.repeatedEntry || false,
        notes: ''
      }
    } else if (flowData.onsiteData) {
      formData = { ...flowData.onsiteData }
    }
  })

  function validate() {
    errors = {}
    if (!formData.name.trim()) errors.name = '请输入姓名'
    if (!formData.phone.trim()) errors.phone = '请输入手机号'
    else if (!/^1[3-9]\d{9}$/.test(formData.phone.replace(/\*/g, '0')) && !formData.phone.includes('*')) {
      errors.phone = '手机号格式不正确'
    }
    return Object.keys(errors).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    dispatch('complete', { ...formData })
  }
</script>

<div class="step-content">
  <div class="step-header">
    <div class="step-icon-wrap">
      <span class="big-icon">✏️</span>
    </div>
    <div>
      <h2>现场信息补录</h2>
      <p>
        {flowData.preRegistration
          ? '请核对并补充预登记观众信息'
          : '请填写现场观众的完整信息'}
      </p>
    </div>
  </div>

  {#if flowData.preRegistration}
    <div class="info-banner info-success">
      <span class="banner-icon">✅</span>
      <div>
        <strong>已关联预登记记录</strong>
        <p>{flowData.preRegistration.name} · {flowData.preRegistration.id} · 注册时间：{flowData.preRegistration.registeredAt}</p>
      </div>
    </div>
  {:else}
    <div class="info-banner info-warning">
      <span class="banner-icon">ℹ️</span>
      <div>
        <strong>现场注册模式</strong>
        <p>该观众无预登记记录，将作为现场注册观众处理</p>
      </div>
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
      <div class="permission-card">
        <div class="permission-item">
          <div class="permission-info">
            <div class="permission-title">重复入场权限</div>
            <div class="permission-desc">开启后可多次进出展馆，同时影响黑名单校验规则</div>
          </div>
          <label class="switch {formData.repeatedEntry ? 'active' : ''}">
            <input type="checkbox" bind:checked={formData.repeatedEntry} />
            <span class="slider"></span>
          </label>
        </div>
        {#if !formData.repeatedEntry}
          <div class="permission-warning">
            <span>⚠️</span>
            <p>未开启重复入场：若观众在黑名单中，将<strong>无法</strong>生成证件</p>
          </div>
        {/if}
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
      <button type="button" class="btn-secondary" on:click={() => dispatch('back')}>
        ← 返回上一步
      </button>
      <button type="submit" class="btn-primary">
        确认信息，选择证件 →
      </button>
    </div>
  </form>
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
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
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

  .form-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 8px;
    gap: 12px;
  }

  @media (max-width: 640px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
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
