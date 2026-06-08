<script>
  import { onMount } from 'svelte'
  import { storage, validateFlow } from './lib/storage.js'
  import Stepper from './components/Stepper.svelte'
  import PreRegistrationStep from './components/PreRegistrationStep.svelte'
  import BadgeTypeStep from './components/BadgeTypeStep.svelte'
  import PrintQueueStep from './components/PrintQueueStep.svelte'
  import Header from './components/Header.svelte'
  import HistoryPanel from './components/HistoryPanel.svelte'

  const STEPS = [
    { id: 1, title: '预登记与信息', subtitle: '选择或补录观众信息', icon: '📋' },
    { id: 2, title: '证件类型', subtitle: '选择证件种类', icon: '🎫' },
    { id: 3, title: '打印队列', subtitle: '确认并输出证件', icon: '🖨️' }
  ]

  let currentStep = 1
  let flowData = {
    preRegistration: null,
    onsiteData: null,
    badgeType: null,
    attendeeName: ''
  }
  let validationResult = null
  let showHistory = false
  let badgeTypeAutoFail = false
  let badgeTypeAutoSelect = null
  let badgeTypeResetKey = 0

  onMount(() => {
    storage.initDefaults()
    storage.ensureDemoHistory()
    const saved = storage.getCurrentFlow()
    if (saved && saved.step) {
      currentStep = saved.step > 3 ? 1 : saved.step
      flowData = saved.data || flowData
    }
  })

  $: attendeeName = flowData.preRegistration?.name || flowData.onsiteData?.name || ''
  $: combinedData = { ...flowData, attendeeName }

  function saveFlow() {
    storage.saveCurrentFlow({ step: currentStep, data: flowData })
  }

  function resetBadgeTypeFlags() {
    badgeTypeAutoFail = false
    badgeTypeAutoSelect = null
    badgeTypeResetKey++
  }

  function handleStep1Complete(result) {
    resetBadgeTypeFlags()
    flowData.preRegistration = result.preRegistration
    flowData.onsiteData = result.onsiteData
    flowData.badgeType = null
    validationResult = null
    currentStep = 2
    saveFlow()
  }

  function handleBadgeTypeSelected(type) {
    flowData.badgeType = type
    validationResult = validateFlow({ ...flowData, attendeeName })
    resetBadgeTypeFlags()
    currentStep = 3
    saveFlow()
  }

  function handleBackFromBadgeType() {
    resetBadgeTypeFlags()
    currentStep = 1
  }

  function handleBackFromPrintQueue() {
    resetBadgeTypeFlags()
    currentStep = 2
  }

  function handlePrintSuccess(item) {
    storage.addHistory({
      type: 'print',
      action: '证件打印成功',
      attendee: attendeeName,
      badgeType: item.badgeType?.name,
      queueId: item.queueId
    })
    resetFlow()
  }

  function handlePrintBlocked(reason) {
    storage.addHistory({
      type: 'blocked',
      action: '证件打印被拦截',
      attendee: attendeeName,
      reason: reason
    })
  }

  function resetFlow() {
    flowData = {
      preRegistration: null,
      onsiteData: null,
      badgeType: null,
      attendeeName: ''
    }
    validationResult = null
    resetBadgeTypeFlags()
    currentStep = 1
    storage.clearCurrentFlow()
  }

  function goBack() {
    if (currentStep > 1) {
      resetBadgeTypeFlags()
      currentStep--
      saveFlow()
    }
  }

  function triggerDemoScenario(scenario) {
    resetFlow()

    if (scenario === 'pre-register-demo') {
      const demo = storage.getPreRegistrations()[0]
      if (demo) {
        handleStep1Complete({
          preRegistration: { ...demo },
          onsiteData: {
            name: demo.name,
            company: demo.company,
            title: demo.title,
            phone: demo.phone,
            email: demo.email,
            idCard: demo.idCard || '',
            repeatedEntry: demo.repeatedEntry === true,
            notes: ''
          }
        })
      }
      return
    }

    if (scenario === 'badge-type-fail') {
      const demo = storage.getPreRegistrations()[2]
      if (!demo) return
      flowData.preRegistration = { ...demo }
      flowData.onsiteData = {
        name: demo.name,
        company: demo.company,
        title: demo.title,
        phone: demo.phone,
        email: demo.email,
        idCard: demo.idCard || '',
        repeatedEntry: demo.repeatedEntry === true,
        notes: ''
      }
      flowData.badgeType = null
      validationResult = null
      badgeTypeAutoFail = true
      badgeTypeAutoSelect = demo.badgeType || null
      currentStep = 2
      saveFlow()
      return
    }

    if (scenario === 'blacklist-history') {
      storage.ensureDemoHistory()
      const blacklisted = storage.getBlacklistedPreRegistrations()
      const demo = blacklisted[0] || storage.getPreRegistrations()[3]
      if (demo) {
        flowData.preRegistration = { ...demo, repeatedEntry: false }
        flowData.onsiteData = {
          name: demo.name,
          company: demo.company,
          title: demo.title,
          phone: demo.phone,
          email: demo.email,
          idCard: demo.idCard || '',
          repeatedEntry: false,
          notes: ''
        }
        const badgeTypes = storage.getBadgeTypes()
        flowData.badgeType = badgeTypes.find(b => b.id === (demo.badgeType || 'normal')) || badgeTypes[0]
        validationResult = validateFlow({
          ...flowData,
          attendeeName: demo.name
        })
        currentStep = 3
        saveFlow()
      }
      showHistory = true
      return
    }
  }
</script>

<div class="app-container">
  <Header {showHistory} {triggerDemoScenario} on:toggleHistory={() => showHistory = !showHistory} />

  <main class="main-content">
    <div class="container">
      <Stepper steps={STEPS} current={currentStep} />

      <div class="step-card card">
        {#if currentStep === 1}
          <PreRegistrationStep
            {flowData}
            on:complete={e => handleStep1Complete(e.detail)}
          />
        {:else if currentStep === 2}
          <BadgeTypeStep
            {flowData}
            autoFail={badgeTypeAutoFail}
            autoSelect={badgeTypeAutoSelect}
            resetKey={badgeTypeResetKey}
            on:select={e => handleBadgeTypeSelected(e.detail)}
            on:back={handleBackFromBadgeType}
          />
        {:else if currentStep === 3}
          <PrintQueueStep
            data={combinedData}
            {validationResult}
            on:success={e => handlePrintSuccess(e.detail)}
            on:blocked={e => handlePrintBlocked(e.detail)}
            on:back={handleBackFromPrintQueue}
            on:reset={resetFlow}
          />
        {/if}
      </div>
    </div>
  </main>

  {#if showHistory}
    <HistoryPanel on:close={() => showHistory = false} />
  {/if}
</div>

<style>
  .app-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .main-content {
    flex: 1;
    padding: 32px 24px 48px;
  }

  .container {
    max-width: 1100px;
    margin: 0 auto;
  }

  .step-card {
    margin-top: 32px;
    padding: 40px;
    min-height: 500px;
  }

  @media (max-width: 768px) {
    .main-content {
      padding: 16px 12px 32px;
    }
    .step-card {
      margin-top: 20px;
      padding: 20px;
    }
  }
</style>
