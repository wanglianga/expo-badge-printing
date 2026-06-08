<script>
  export let steps = []
  export let current = 1
</script>

<div class="stepper">
  {#each steps as step, index}
    <div class="step-item {step.id < current ? 'completed' : ''} {step.id === current ? 'active' : ''}">
      <div class="step-circle">
        {#if step.id < current}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 10L8 13L15 6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        {:else}
          <span class="step-icon">{step.icon}</span>
        {/if}
      </div>
      <div class="step-info">
        <div class="step-number">步骤 {step.id}</div>
        <div class="step-title">{step.title}</div>
        <div class="step-subtitle">{step.subtitle}</div>
      </div>
    </div>
  {/each}
</div>

<style>
  .stepper {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    padding: 24px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }

  .step-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    position: relative;
    min-width: 0;
    padding: 0 4px;
  }

  .step-circle {
    width: 56px;
    height: 56px;
    min-width: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    z-index: 2;
    position: relative;
  }

  .step-item.active .step-circle {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
    transform: scale(1.1);
  }

  .step-item.completed .step-circle {
    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
  }

  .step-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .step-info {
    margin-top: 12px;
    width: 100%;
  }

  .step-number {
    font-size: 11px;
    font-weight: 600;
    color: var(--text-light);
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 2px;
  }

  .step-item.active .step-number {
    color: var(--primary);
  }

  .step-item.completed .step-number {
    color: #059669;
  }

  .step-title {
    font-size: 15px;
    font-weight: 700;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .step-item.active .step-title {
    color: var(--primary);
  }

  .step-item.completed .step-title {
    color: #059669;
  }

  .step-subtitle {
    font-size: 12px;
    color: var(--text-light);
    margin-top: 2px;
  }

  @media (max-width: 640px) {
    .stepper {
      padding: 16px 12px;
      overflow-x: auto;
      gap: 8px;
    }
    .step-item {
      flex: 0 0 auto;
      min-width: 90px;
    }
    .step-circle {
      width: 44px;
      height: 44px;
      min-width: 44px;
      font-size: 18px;
    }
    .step-info {
      margin-top: 8px;
    }
    .step-title {
      font-size: 12px;
    }
    .step-subtitle {
      display: none;
    }
  }
</style>
