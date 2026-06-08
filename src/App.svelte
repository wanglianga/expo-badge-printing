<script>
  import { onMount } from 'svelte'
  import { storage, validateFlow } from './lib/storage.js'
  import Stepper from './components/Stepper.svelte'
  import PreRegistrationStep from './components/PreRegistrationStep.svelte'
  import OnsiteStep from './components/OnsiteStep.svelte'
  import BadgeTypeStep from './components/BadgeTypeStep.svelte'
  import PrintQueueStep from './components/PrintQueueStep.svelte'
  import Header from './components/Header.svelte'
  import HistoryPanel from './components/HistoryPanel.svelte'

  const STEPS = [
    { id: 1, title: '预登记查询', subtitle: '查找已注册观众', icon: '📋' },
    { id: 2, title: '现场补录', subtitle: '完善或新增信息', icon: '✏️' },
    { id: 3, title: '证件类型', subtitle: '选择证件种类', icon: '🎫' },
    { id: 4, title: '打印队列', subtitle: '确认并输出', icon: '🖨️' }
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
      currentStep = saved.step
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

  function syncOnsiteToPre(data) {
    if (flowData.preRegistration) {
      flowData.preRegistration = {
        ...flowData.preRegistration,
        name: data.name,
        company: data.company,
        title: data.title,
        phone: data.phone,
        email: data.email,
        idCard: data.idCard,
        repeatedEntry: data.repeatedEntry,
        notes: data.notes
      }
    }
  }

  function handlePreRegistrationSelected(record) {
    resetBadgeTypeFlags()
    if (record === null) {
      flowData.preRegistration = null
      flowData.onsiteData = null
    } else {
      flowData.preRegistration = { ...record }
      flowData.onsiteData = null
    }
    flowData.badgeType = null
    validationResult = null
    currentStep = 2
    saveFlow()
  }

  function handleOnsiteComplete(data) {
    flowData.onsiteData = { ...data }
    if (!flowData.preRegistration) {
      flowData.preRegistration = {
        name: data.name,
        company: data.company,
        title: data.title,
        phone: data.phone,
        email: data.email,
        idCard: data.idCard,
        repeatedEntry: data.repeatedEntry,
        notes: data.notes,
        status: 'onsite'
      }
    } else {
      syncOnsiteToPre(data)
    }
    flowData.badgeType = null
    validationResult = null
    resetBadgeTypeFlags()
    currentStep = 3
    saveFlow()
  }

  function handleBadgeTypeSelected(type) {
    flowData.badgeType = type
    validationResult = validateFlow({ ...flowData, attendeeName })
    resetBadgeTypeFlags()
    currentStep = 4
    saveFlow()
  }

  function handleBackFromBadgeType() {
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
        handlePreRegistrationSelected(demo)
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
      currentStep = 3
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
        flowData.badgeType = badgeTypes.find(b => b.id === (demo.badgeType || 'onsite')) || badgeTypes[0]
        validationResult = validateFlow({
          ...flowData,
          attendeeName: demo.name
        })
        currentStep = 4
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
            on:select={e => handlePreRegistrationSelected(e.detail)}
          />
        {:else if currentStep === 2}
          <OnsiteStep
            {flowData}
            on:complete={e => handleOnsiteComplete(e.detail)}
            on:back={goBack}
          />
        {:else if currentStep === 3}
          <BadgeTypeStep
            {flowData}
            autoFail={badgeTypeAutoFail}
            autoSelect={badgeTypeAutoSelect}
            resetKey={badgeTypeResetKey}
            on:select={e => handleBadgeTypeSelected(e.detail)}
            on:back={handleBackFromBadgeType}
          />
        {:else if currentStep === 4}
          <PrintQueueStep
            data={combinedData}
            {validationResult}
            on:success={e => handlePrintSuccess(e.detail)}
            on:blocked={e => handlePrintBlocked(e.detail)}
            on:back={() => { resetBadgeTypeFlags(); currentStep = 3 }}
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
