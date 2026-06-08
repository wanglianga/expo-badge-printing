const STORAGE_KEYS = {
  PRE_REGISTRATIONS: 'expo_pre_registrations_v2',
  ONSITE_RECORDS: 'expo_onsite_records_v2',
  BADGE_TYPES: 'expo_badge_types_v2',
  PRINT_QUEUE: 'expo_print_queue_v2',
  BLACKLIST: 'expo_blacklist_v2',
  HISTORY: 'expo_history_v2',
  CURRENT_FLOW: 'expo_current_flow_v2'
}

const DEFAULT_BADGE_TYPES = [
  { id: 'normal', name: '普通观众证', color: '#3b82f6', icon: '🎫', description: '标准观众证件' },
  { id: 'vip', name: 'VIP贵宾证', color: '#f59e0b', icon: '👑', description: '高级别嘉宾专属证件' },
  { id: 'media', name: '媒体证', color: '#8b5cf6', icon: '📷', description: '新闻媒体人员' },
  { id: 'exhibitor', name: '参展商证', color: '#ef4444', icon: '🏪', description: '参展企业人员' }
]

const DEMO_PRE_REGISTRATIONS = [
  {
    id: 'PRE20260001',
    name: '张明远',
    company: '华创科技有限公司',
    title: '技术总监',
    phone: '138****5678',
    email: 'zhangmy@huachuang.com',
    registeredAt: '2026-05-20 14:30:00',
    badgeType: 'normal',
    repeatedEntry: true,
    status: 'approved'
  },
  {
    id: 'PRE20260002',
    name: '李思琪',
    company: '鼎盛集团',
    title: 'CEO',
    phone: '139****1234',
    email: 'lisq@dingsheng.com',
    registeredAt: '2026-05-18 09:15:00',
    badgeType: 'vip',
    repeatedEntry: true,
    status: 'approved'
  },
  {
    id: 'PRE20260003',
    name: '王晓峰',
    company: '新锐传媒',
    title: '记者',
    phone: '137****9012',
    email: 'wangxf@xinrui.com',
    registeredAt: '2026-05-22 16:45:00',
    badgeType: 'media',
    repeatedEntry: false,
    status: 'pending'
  },
  {
    id: 'PRE20260004',
    name: '赵某某',
    company: '未知',
    title: '—',
    phone: '135****0001',
    email: '',
    registeredAt: '2026-05-10 09:00:00',
    badgeType: 'normal',
    repeatedEntry: false,
    status: 'approved'
  },
  {
    id: 'PRE20260005',
    name: '钱某某',
    company: '未知',
    title: '—',
    phone: '136****0002',
    email: '',
    registeredAt: '2026-05-12 11:20:00',
    badgeType: 'normal',
    repeatedEntry: false,
    status: 'approved'
  }
]

const DEMO_BLACKLIST = [
  {
    id: 'BL001',
    name: '赵某某',
    idCard: '110***********1234',
    reason: '多次扰乱展会秩序',
    addedAt: '2026-03-15 10:00:00',
    status: 'active'
  },
  {
    id: 'BL002',
    name: '钱某某',
    idCard: '310***********5678',
    reason: '涉嫌倒卖证件',
    addedAt: '2026-04-02 14:30:00',
    status: 'active'
  }
]

function getStorage(key, defaultValue) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : defaultValue
  } catch {
    return defaultValue
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export const storage = {
  initDefaults() {
    if (!getStorage(STORAGE_KEYS.BADGE_TYPES, null)) {
      setStorage(STORAGE_KEYS.BADGE_TYPES, DEFAULT_BADGE_TYPES)
    }
    if (!getStorage(STORAGE_KEYS.PRE_REGISTRATIONS, null)) {
      setStorage(STORAGE_KEYS.PRE_REGISTRATIONS, DEMO_PRE_REGISTRATIONS)
    }
    if (!getStorage(STORAGE_KEYS.BLACKLIST, null)) {
      setStorage(STORAGE_KEYS.BLACKLIST, DEMO_BLACKLIST)
    }
    if (!getStorage(STORAGE_KEYS.PRINT_QUEUE, null)) {
      setStorage(STORAGE_KEYS.PRINT_QUEUE, [])
    }
    if (!getStorage(STORAGE_KEYS.HISTORY, null)) {
      setStorage(STORAGE_KEYS.HISTORY, [])
    }
    if (!getStorage(STORAGE_KEYS.ONSITE_RECORDS, null)) {
      setStorage(STORAGE_KEYS.ONSITE_RECORDS, [])
    }
  },

  getPreRegistrations() {
    return getStorage(STORAGE_KEYS.PRE_REGISTRATIONS, [])
  },

  findPreRegistration(query) {
    const list = this.getPreRegistrations()
    return list.find(r =>
      r.id === query ||
      r.name === query ||
      r.phone === query ||
      r.email === query
    )
  },

  getBadgeTypes() {
    return getStorage(STORAGE_KEYS.BADGE_TYPES, [])
  },

  getBadgeType(id) {
    return this.getBadgeTypes().find(b => b.id === id)
  },

  getBlacklist() {
    return getStorage(STORAGE_KEYS.BLACKLIST, [])
  },

  checkBlacklist(name) {
    return this.getBlacklist().find(b => b.name === name && b.status === 'active')
  },

  getPrintQueue() {
    return getStorage(STORAGE_KEYS.PRINT_QUEUE, [])
  },

  addToPrintQueue(item) {
    const queue = this.getPrintQueue()
    const newItem = {
      ...item,
      queueId: 'Q' + Date.now(),
      addedAt: new Date().toLocaleString('zh-CN'),
      status: 'pending'
    }
    queue.push(newItem)
    setStorage(STORAGE_KEYS.PRINT_QUEUE, queue)
    return newItem
  },

  updatePrintQueueStatus(queueId, status) {
    const queue = this.getPrintQueue()
    const idx = queue.findIndex(q => q.queueId === queueId)
    if (idx !== -1) {
      queue[idx].status = status
      queue[idx].updatedAt = new Date().toLocaleString('zh-CN')
      setStorage(STORAGE_KEYS.PRINT_QUEUE, queue)
    }
  },

  getHistory() {
    return getStorage(STORAGE_KEYS.HISTORY, [])
  },

  addHistory(record) {
    const history = this.getHistory()
    history.unshift({
      ...record,
      id: 'H' + Date.now(),
      createdAt: new Date().toLocaleString('zh-CN')
    })
    setStorage(STORAGE_KEYS.HISTORY, history)
  },

  addOnsiteRecord(record) {
    const records = getStorage(STORAGE_KEYS.ONSITE_RECORDS, [])
    records.push({
      ...record,
      id: 'ON' + Date.now(),
      createdAt: new Date().toLocaleString('zh-CN')
    })
    setStorage(STORAGE_KEYS.ONSITE_RECORDS, records)
  },

  clearCurrentFlow() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_FLOW)
  },

  saveCurrentFlow(data) {
    setStorage(STORAGE_KEYS.CURRENT_FLOW, data)
  },

  getCurrentFlow() {
    return getStorage(STORAGE_KEYS.CURRENT_FLOW, null)
  },

  getBlacklistedPreRegistrations() {
    const blacklistNames = this.getBlacklist().map(b => b.name)
    return this.getPreRegistrations().filter(r => blacklistNames.includes(r.name))
  },

  ensureDemoHistory() {
    const history = this.getHistory()
    if (history.length === 0) {
      const now = new Date()
      const t1 = new Date(now.getTime() - 3600 * 1000 * 2).toLocaleString('zh-CN')
      const t2 = new Date(now.getTime() - 3600 * 1000 * 1).toLocaleString('zh-CN')
      const seed = [
        {
          id: 'H_seed_1',
          type: 'blocked',
          action: '证件打印被拦截',
          attendee: '赵某某',
          reason: '黑名单拦截：缺少重复入场权限',
          createdAt: t1
        },
        {
          id: 'H_seed_2',
          type: 'blocked',
          action: '证件打印被拦截',
          attendee: '钱某某',
          reason: '黑名单拦截：缺少重复入场权限',
          createdAt: t2
        }
      ]
      setStorage(STORAGE_KEYS.HISTORY, seed)
    }
  },

  resetAll() {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k))
    this.initDefaults()
  }
}

export function validateFlow(flowData) {
  const errors = []
  const warnings = []

  if (!flowData.preRegistration && !flowData.onsiteData) {
    errors.push('缺少观众基础信息，请先完成预登记或现场补录')
  }

  if (flowData.preRegistration) {
    if (flowData.preRegistration.repeatedEntry === false || flowData.preRegistration.repeatedEntry === undefined) {
      warnings.push('该观众未配置重复入场权限，黑名单校验将不可跳过')
    }
  }

  if (flowData.onsiteData) {
    if (!flowData.onsiteData.repeatedEntry) {
      warnings.push('现场补录未开启重复入场，黑名单校验将严格执行')
    }
  }

  if (!flowData.badgeType) {
    errors.push('请选择证件类型')
  }

  const blacklistMatch = flowData.attendeeName
    ? storage.checkBlacklist(flowData.attendeeName)
    : null

  if (blacklistMatch) {
    const hasRepeatedEntry = (flowData.preRegistration && flowData.preRegistration.repeatedEntry) ||
      (flowData.onsiteData && flowData.onsiteData.repeatedEntry)
    if (!hasRepeatedEntry) {
      errors.push({
        type: 'blacklist_blocked',
        message: `观众「${blacklistMatch.name}」在黑名单中，原因为：${blacklistMatch.reason}。因缺少重复入场权限，无法生成证件。`,
        blacklist: blacklistMatch
      })
    } else {
      warnings.push({
        type: 'blacklist_warning',
        message: `观众「${blacklistMatch.name}」在黑名单中（原因：${blacklistMatch.reason}），但因拥有重复入场权限，可继续处理。`,
        blacklist: blacklistMatch
      })
    }
  }

  return { errors, warnings, valid: errors.length === 0 }
}
