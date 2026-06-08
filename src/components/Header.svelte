<script>
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  export let showHistory = false
  export let triggerDemoScenario
</script>

<header class="app-header">
  <div class="header-inner">
    <div class="logo-section">
      <div class="logo-badge">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="3" y="6" width="26" height="20" rx="3" fill="url(#logoGrad)"/>
          <circle cx="11" cy="16" r="3" fill="white"/>
          <path d="M17 13h8M17 16h6M17 19h8" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
          <defs>
            <linearGradient id="logoGrad" x1="3" y1="6" x2="29" y2="26" gradientUnits="userSpaceOnUse">
              <stop stop-color="#1e3a8a"/>
              <stop offset="1" stop-color="#3b82f6"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div class="logo-text">
        <h1>ExpoBadge Pro</h1>
        <p>展会观众证件打印系统</p>
      </div>
    </div>

    <div class="header-actions">
      <div class="demo-triggers">
        <button class="demo-btn demo-primary" on:click={() => triggerDemoScenario('pre-register-demo')}>
          <span class="demo-icon">▶</span>
          预登记样例
        </button>
        <button class="demo-btn demo-warning" on:click={() => triggerDemoScenario('badge-type-fail')}>
          <span class="demo-icon">⚠</span>
          证件类型失败
        </button>
        <button class="demo-btn demo-danger" on:click={() => triggerDemoScenario('blacklist-history')}>
          <span class="demo-icon">⛔</span>
          黑名单历史
        </button>
      </div>
      <button class="history-btn" class:active={showHistory} on:click={() => dispatch('toggleHistory')}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 4V10L14 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M3.34 11a6.67 6.67 0 1 1 3.33 5.57" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        历史记录
      </button>
    </div>
  </div>
</header>

<style>
  .app-header {
    background: rgba(15, 23, 42, 0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-inner {
    max-width: 1400px;
    margin: 0 auto;
    padding: 14px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }

  .logo-section {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .logo-badge {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(30, 58, 138, 0.3) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .logo-text h1 {
    font-size: 19px;
    font-weight: 800;
    background: linear-gradient(135deg, #ffffff 0%, #93c5fd 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    letter-spacing: -0.3px;
  }

  .logo-text p {
    font-size: 12px;
    color: #94a3b8;
    margin-top: 1px;
    letter-spacing: 0.5px;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .demo-triggers {
    display: flex;
    gap: 8px;
  }

  .demo-btn {
    padding: 8px 14px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
  }

  .demo-icon {
    font-size: 10px;
    opacity: 0.9;
  }

  .demo-primary {
    background: rgba(59, 130, 246, 0.15);
    color: #93c5fd;
    border: 1px solid rgba(59, 130, 246, 0.3);
  }

  .demo-primary:hover {
    background: rgba(59, 130, 246, 0.25);
  }

  .demo-warning {
    background: rgba(245, 158, 11, 0.15);
    color: #fcd34d;
    border: 1px solid rgba(245, 158, 11, 0.3);
  }

  .demo-warning:hover {
    background: rgba(245, 158, 11, 0.25);
  }

  .demo-danger {
    background: rgba(239, 68, 68, 0.15);
    color: #fca5a5;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .demo-danger:hover {
    background: rgba(239, 68, 68, 0.25);
  }

  .history-btn {
    background: rgba(255, 255, 255, 0.08);
    color: #e2e8f0;
    padding: 10px 18px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .history-btn:hover,
  .history-btn.active {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.4);
    color: #ffffff;
  }

  @media (max-width: 900px) {
    .demo-triggers {
      display: none;
    }
  }

  @media (max-width: 640px) {
    .header-inner {
      padding: 12px 16px;
    }
    .logo-text h1 {
      font-size: 16px;
    }
    .logo-text p {
      display: none;
    }
  }
</style>
