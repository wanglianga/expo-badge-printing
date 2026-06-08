<script>
  import { createEventDispatcher, onMount } from 'svelte'
  import { storage } from '../lib/storage.js'

  const dispatch = createEventDispatcher()

  let activeTab = 'history'
  let history = []
  let blacklist = []
  let printQueue = []

  onMount(() => {
    refreshData()
  })

  function refreshData() {
    history = storage.getHistory()
    blacklist = storage.getBlacklist()
    printQueue = storage.getPrintQueue()
  }
</script>

<div class="panel-overlay" on:click={() => dispatch('close')}>
  <div class="panel" on:click|stopPropagation>
    <div class="panel-header">
      <div>
        <h2>历史记录与黑名单</h2>
        <p>查看打印历史、黑名单记录和打印队列</p>
      </div>
      <button class="close-btn" on:click={() => dispatch('close')}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>

    <div class="panel-tabs">
      <button class="tab {activeTab === 'history' ? 'active' : ''}" on:click={() => activeTab = 'history'}>
        <span class="tab-icon">📜</span>
        操作历史
        <span class="tab-count">{history.length}</span>
      </button>
      <button class="tab {activeTab === 'blacklist' ? 'active' : ''}" on:click={() => activeTab = 'blacklist'}>
        <span class="tab-icon">⛔</span>
        黑名单
        <span class="tab-count">{blacklist.length}</span>
      </button>
      <button class="tab {activeTab === 'queue' ? 'active' : ''}" on:click={() => activeTab = 'queue'}>
        <span class="tab-icon">🖨️</span>
        打印队列
        <span class="tab-count">{printQueue.length}</span>
      </button>
    </div>

    <div class="panel-body">
      {#if activeTab === 'history'}
        <div class="tab-content">
          {#if history.length === 0}
            <div class="empty">
              <span class="empty-icon">📜</span>
              <p>暂无操作历史</p>
            </div>
          {:else}
            <div class="timeline">
              {#each history as item (item.id)}
                <div class="timeline-item {item.type === 'print' ? 'success' : item.type === 'blocked' ? 'danger' : 'info'}">
                  <div class="timeline-dot"></div>
                  <div class="timeline-content">
                    <div class="timeline-head">
                      <span class="timeline-action">{item.action}</span>
                      <span class="timeline-time">{item.createdAt}</span>
                    </div>
                    <div class="timeline-detail">
                      {#if item.attendee}
                        <span class="tag">观众：{item.attendee}</span>
                      {/if}
                      {#if item.badgeType}
                        <span class="tag">证件：{item.badgeType}</span>
                      {/if}
                      {#if item.queueId}
                        <span class="tag tag-info">{item.queueId}</span>
                      {/if}
                      {#if item.reason}
                        <span class="tag tag-danger">{item.reason}</span>
                      {/if}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {:else if activeTab === 'blacklist'}
        <div class="tab-content">
          {#if blacklist.length === 0}
            <div class="empty">
              <span class="empty-icon">⛔</span>
              <p>黑名单为空</p>
            </div>
          {:else}
            <div class="card-list">
              {#each blacklist as item (item.id)}
                <div class="list-card list-danger">
                  <div class="list-header">
                    <div class="list-title">
                      <span class="list-icon">⛔</span>
                      <strong>{item.name}</strong>
                    </div>
                    <span class="badge badge-danger">黑名单</span>
                  </div>
                  <div class="list-body">
                    <div class="list-row">
                      <span class="list-label">黑名单编号</span>
                      <span>{item.id}</span>
                    </div>
                    <div class="list-row">
                      <span class="list-label">身份证号</span>
                      <span>{item.idCard}</span>
                    </div>
                    <div class="list-row">
                      <span class="list-label">列入原因</span>
                      <span class="danger-text">{item.reason}</span>
                    </div>
                    <div class="list-row">
                      <span class="list-label">列入时间</span>
                      <span>{item.addedAt}</span>
                    </div>
                    <div class="list-row">
                      <span class="list-label">状态</span>
                      <span class="badge badge-danger">{item.status === 'active' ? '生效中' : '已解除'}</span>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {:else if activeTab === 'queue'}
        <div class="tab-content">
          {#if printQueue.length === 0}
            <div class="empty">
              <span class="empty-icon">🖨️</span>
              <p>打印队列为空</p>
            </div>
          {:else}
            <div class="card-list">
              {#each printQueue as item (item.queueId)}
                <div class="list-card list-success">
                  <div class="list-header">
                    <div class="list-title">
                      <span class="list-icon">🎫</span>
                      <strong>{item.attendeeName}</strong>
                    </div>
                    <span class="badge {item.status === 'printed' ? 'badge-success' : 'badge-warning'}">
                      {item.status === 'printed' ? '已打印' : '等待中'}
                    </span>
                  </div>
                  <div class="list-body">
                    <div class="list-row">
                      <span class="list-label">队列编号</span>
                      <span>{item.queueId}</span>
                    </div>
                    <div class="list-row">
                      <span class="list-label">证件类型</span>
                      <span>{item.badgeType?.name || '—'}</span>
                    </div>
                    <div class="list-row">
                      <span class="list-label">公司</span>
                      <span>{item.preRegistration?.company || item.onsiteData?.company || '—'}</span>
                    </div>
                    <div class="list-row">
                      <span class="list-label">加入时间</span>
                      <span>{item.addedAt}</span>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .panel-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    justify-content: flex-end;
  }

  .panel {
    width: 480px;
    max-width: 100%;
    height: 100%;
    background: var(--surface);
    display: flex;
    flex-direction: column;
    box-shadow: -8px 0 30px rgba(0, 0, 0, 0.2);
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }

  .panel-header {
    padding: 24px 24px 20px;
    border-bottom: 1px solid var(--border-light);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }

  .panel-header h2 {
    font-size: 20px;
    font-weight: 800;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  .panel-header p {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .close-btn {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: var(--surface-light);
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .close-btn:hover {
    background: var(--border-light);
    color: var(--text-primary);
  }

  .panel-tabs {
    display: flex;
    padding: 12px 16px;
    gap: 6px;
    border-bottom: 1px solid var(--border-light);
    background: var(--surface-light);
  }

  .tab {
    flex: 1;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    flex-wrap: wrap;
  }

  .tab:hover {
    background: var(--border-light);
    color: var(--text-primary);
  }

  .tab.active {
    background: var(--primary);
    color: white;
  }

  .tab-icon {
    font-size: 14px;
  }

  .tab-count {
    background: rgba(0, 0, 0, 0.15);
    padding: 1px 8px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
  }

  .tab.active .tab-count {
    background: rgba(255, 255, 255, 0.2);
  }

  .panel-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px;
  }

  .tab-content {
    height: 100%;
  }

  .empty {
    text-align: center;
    padding: 60px 20px;
    color: var(--text-secondary);
  }

  .empty-icon {
    font-size: 48px;
    display: block;
    margin-bottom: 12px;
    opacity: 0.5;
  }

  .timeline {
    display: flex;
    flex-direction: column;
    gap: 4px;
    position: relative;
    padding-left: 24px;
  }

  .timeline::before {
    content: '';
    position: absolute;
    left: 8px;
    top: 8px;
    bottom: 8px;
    width: 2px;
    background: var(--border);
  }

  .timeline-item {
    position: relative;
    padding: 10px 0;
  }

  .timeline-dot {
    position: absolute;
    left: -20px;
    top: 14px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--border);
    border: 3px solid var(--surface);
    box-shadow: 0 0 0 1px var(--border);
  }

  .timeline-item.success .timeline-dot {
    background: #10b981;
    box-shadow: 0 0 0 1px #10b981;
  }

  .timeline-item.danger .timeline-dot {
    background: #ef4444;
    box-shadow: 0 0 0 1px #ef4444;
  }

  .timeline-item.info .timeline-dot {
    background: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }

  .timeline-content {
    background: var(--surface-light);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 12px 14px;
  }

  .timeline-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }

  .timeline-action {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .timeline-time {
    font-size: 11px;
    color: var(--text-light);
    white-space: nowrap;
  }

  .timeline-detail {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .tag {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    background: #e0e7ff;
    color: #3730a3;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
  }

  .tag-info {
    background: #dbeafe;
    color: #1e40af;
  }

  .tag-danger {
    background: #fee2e2;
    color: #991b1b;
  }

  .card-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .list-card {
    background: var(--surface-light);
    border: 1px solid var(--border);
    border-radius: 14px;
    overflow: hidden;
  }

  .list-card.list-danger {
    border-left: 4px solid #ef4444;
  }

  .list-card.list-success {
    border-left: 4px solid #10b981;
  }

  .list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 16px;
    border-bottom: 1px solid var(--border-light);
  }

  .list-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
  }

  .list-icon {
    font-size: 20px;
  }

  .list-body {
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .list-row {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    padding: 4px 0;
  }

  .list-label {
    color: var(--text-secondary);
    font-weight: 500;
  }

  .danger-text {
    color: #dc2626;
    font-weight: 500;
  }
</style>
