(function () {
  const datasetVersion = 'v1';
  const ruleVersion = 'v1';

  const capacityMap = {
    quick: { type: 'quick_case', durationBand: '2_5', minMinutes: 2, maxMinutes: 5, label: '2-5 min' },
    standard: { type: 'standard_case', durationBand: '10_15', minMinutes: 10, maxMinutes: 15, label: '10-15 min' },
    complex: { type: 'complex_case', durationBand: '20_30_plus', minMinutes: 20, maxMinutes: 30, label: '20-30+ min' }
  };

  const customerContextMap = {
    'CUSTCTX-0101': {
      customerContextId: 'CUSTCTX-0101',
      datasetVersion: 'v1',
      recentChange: 'none',
      informationCompleteness: 'complete',
      mandateStatus: 'not_relevant',
      similarActionHistory: 'not_relevant',
      additionalActionLikely: 'no'
    },
    'CUSTCTX-0102': {
      customerContextId: 'CUSTCTX-0102',
      datasetVersion: 'v1',
      recentChange: 'within_30_days',
      informationCompleteness: 'partial',
      mandateStatus: 'unclear',
      similarActionHistory: 'yes',
      additionalActionLikely: 'possible'
    },
    'CUSTCTX-0103': {
      customerContextId: 'CUSTCTX-0103',
      datasetVersion: 'v1',
      recentChange: 'none',
      informationCompleteness: 'complete',
      mandateStatus: 'not_relevant',
      similarActionHistory: 'yes',
      additionalActionLikely: 'no'
    },
    'CUSTCTX-0104': {
      customerContextId: 'CUSTCTX-0104',
      datasetVersion: 'v1',
      recentChange: 'within_7_days',
      informationCompleteness: 'missing',
      mandateStatus: 'missing',
      similarActionHistory: 'unknown',
      additionalActionLikely: 'yes'
    },
    'CUSTCTX-0105': {
      customerContextId: 'CUSTCTX-0105',
      datasetVersion: 'v1',
      recentChange: 'within_30_days',
      informationCompleteness: 'partial',
      mandateStatus: 'exists',
      similarActionHistory: 'no',
      additionalActionLikely: 'yes'
    },
    'CUSTCTX-0106': {
      customerContextId: 'CUSTCTX-0106',
      datasetVersion: 'v1',
      recentChange: 'unknown',
      informationCompleteness: 'partial',
      mandateStatus: 'unclear',
      similarActionHistory: 'unknown',
      additionalActionLikely: 'possible'
    }
  };

  const scenarios = [
    { id: 'D-001', label: 'BankID activation', description: 'I need help activating BankID.', customerContextId: 'CUSTCTX-0101', caseLabel: 'BankID activation - Self', expected: { caseType: 'bank_id_support', complexity: 'quick', durationBand: '2_5', capacity: 'quick_case' } },
    { id: 'D-002', label: 'BankID issue, unclear change', description: 'My BankID is not working but I cannot explain what changed.', customerContextId: 'CUSTCTX-0102', caseLabel: 'BankID activation - Other', expected: { caseType: 'bank_id_support', complexity: 'standard', durationBand: '10_15', capacity: 'standard_case' } },
    { id: 'D-003', label: 'Transfer to existing account', description: 'I want to transfer money to my existing account.', customerContextId: 'CUSTCTX-0103', caseLabel: 'Transfer to existing', expected: { caseType: 'payment_transfer', complexity: 'quick', durationBand: '2_5', capacity: 'quick_case' } },
    { id: 'D-004', label: 'Account details change', description: 'I need to change my account details.', customerContextId: 'CUSTCTX-0104', caseLabel: 'Account details change', expected: { caseType: 'account_change', complexity: 'standard', durationBand: '10_15', capacity: 'standard_case' } },
    { id: 'D-005', label: 'Power of attorney case', description: 'I need help with a power of attorney changed last week.', customerContextId: 'CUSTCTX-0105', caseLabel: 'Power of attorney', expected: { caseType: 'mandate_power_of_attorney', complexity: 'complex', durationBand: '20_30_plus', capacity: 'complex_case' } },
    { id: 'D-006', label: 'Missing documents', description: 'I do not know which documents are missing for this change.', customerContextId: 'CUSTCTX-0104', caseLabel: 'Other', expected: { caseType: 'missing_information', complexity: 'complex', durationBand: '20_30_plus', capacity: 'complex_case' } },
    { id: 'D-007', label: 'Quick service question', description: 'I have a quick question about a service.', customerContextId: 'CUSTCTX-0101', caseLabel: 'Service information', expected: { caseType: 'information_question', complexity: 'quick', durationBand: '2_5', capacity: 'quick_case' } },
    { id: 'D-008', label: 'Short text with recent change', description: 'BankID update.', customerContextId: 'CUSTCTX-0106', caseLabel: 'Other', expected: { caseType: 'ambiguous_other', complexity: 'standard', durationBand: '10_15', capacity: 'standard_case' } },
    { id: 'D-009', label: 'Employee override scenario', description: 'I need help activating BankID.', customerContextId: 'CUSTCTX-0101', caseLabel: 'BankID activation - Self', expected: { caseType: 'bank_id_support', complexity: 'quick', durationBand: '2_5', capacity: 'quick_case' } },
    { id: 'D-010', label: 'No capacity available', description: 'I need help with a power of attorney changed last week.', customerContextId: 'CUSTCTX-0105', caseLabel: 'Power of attorney', expected: { caseType: 'mandate_power_of_attorney', complexity: 'complex', durationBand: '20_30_plus', capacity: 'complex_case' } },
    { id: 'D-011', label: 'Triage failure simulation', description: 'This triage service failed for a demo scenario.', customerContextId: 'CUSTCTX-0106', caseLabel: 'Other', expected: { caseType: 'ambiguous_other', complexity: 'standard', durationBand: '10_15', capacity: 'standard_case' } }
  ];

  function getScenarioById(id) {
    return scenarios.find((scenario) => scenario.id === id) || null;
  }

  function getCustomerContext(customerContextId) {
    return customerContextMap[customerContextId] || null;
  }

  function validateDescription(description) {
    if (typeof description !== 'string' || !description.trim()) {
      const error = new Error('Case description is required.');
      error.code = 'CASE_DESCRIPTION_REQUIRED';
      throw error;
    }

    return description.trim();
  }

  function getCaseDescriptionValue(description) {
    const normalized = description.toLowerCase();
    const tokens = normalized.match(/[a-z0-9]+/g) || [];
    const stopWords = new Set([
      'a', 'about', 'again', 'and', 'are', 'but', 'can', 'do', 'for', 'have',
      'help', 'i', 'in', 'is', 'it', 'my', 'need', 'of', 'on', 'the', 'this',
      'to', 'with'
    ]);
    const meaningfulTokens = tokens.filter((token) => !stopWords.has(token));
    const hasAction = /\b(activate|activated|activation|change|check|explain|fix|send|transfer|update|verify|withdraw)\b/.test(normalized);
    const hasProblem = /\b(cannot|error|issue|missing|not working|stopped|unable|wrong)\b/.test(normalized);
    const hasTimeOrSequence = /\b(after|before|during|last|recent|since|when|yesterday|today|week|month)\b/.test(normalized);
    const hasReasonOrDependency = /\b(because|so|therefore|which|while)\b/.test(normalized) || /,|;/.test(normalized);
    const evidenceScore = [hasAction, hasProblem, hasTimeOrSequence, hasReasonOrDependency]
      .filter(Boolean)
      .length;

    return meaningfulTokens.length >= 2 && evidenceScore >= 1 ? 'elaborated' : 'not elaborated';
  }

  function createReason(code, message) {
    return { code, message };
  }

  function getCaseLabelRule(selectedCaseLabel) {
    const label = (selectedCaseLabel || '').trim();
    if (!label) {
      return null;
    }

    const normalized = label.toLowerCase();
    const caseLabelRules = {
      'bankid activation - self': { caseType: 'bank_id_support', complexity: 'quick' },
      'bankid activation - other': { caseType: 'bank_id_support_other', complexity: 'standard' },
      'transfer to existing': { caseType: 'payment_transfer', complexity: 'quick' },
      'account details change': { caseType: 'account_change', complexity: 'standard' },
      'power of attorney': { caseType: 'mandate_power_of_attorney', complexity: 'complex' },
      'other': { caseType: 'ambiguous_other', complexity: 'complex' },
      'open account': { caseType: 'new_customer_account', complexity: 'complex' },
      'service information': { caseType: 'service_details', complexity: 'standard' }
    };

    return caseLabelRules[normalized] || null;
  }

  function triageCase(description, context = {}, selectedCaseLabel = '') {
    const safeDescription = validateDescription(description);
    const normalized = safeDescription.toLowerCase();
    const contextData = context || {};
    const caseLabelRule = getCaseLabelRule(selectedCaseLabel);
    const caseLabelComplexity = caseLabelRule ? caseLabelRule.complexity : null;
    const caseLabelType = caseLabelRule ? caseLabelRule.caseType : null;

    const bankIdMatch = /bankid/.test(normalized) || /activate.*bankid/.test(normalized);
    const transferMatch = /transfer|payment|send money/.test(normalized);
    const infoQuestion = /quick question|question about a service|service/.test(normalized);
    const accountChange = /change.*account.*detail|update.*account|account details/.test(normalized);
    const mandateMatch = /power of attorney|mandate|poa|authoris|authoriz/.test(normalized);
    const missingDocumentMatch = /missing documents|documents are missing|do not know which documents/.test(normalized);
    const recentChange = contextData.recentChange === 'within_7_days' || contextData.recentChange === 'within_30_days';
    const missingInfo = contextData.informationCompleteness === 'missing' || contextData.informationCompleteness === 'partial';
    const unclearMandate = contextData.mandateStatus === 'unclear' || contextData.mandateStatus === 'missing';
    const extraActionPossible = contextData.additionalActionLikely === 'possible' || contextData.additionalActionLikely === 'yes';

    let caseType = 'ambiguous_other';
    let complexity = 'standard';
    let reasons = [];
    let requiresEmployeeReview = true;
    let fallbackApplied = false;
    let confidenceStatus = 'medium';

    if (bankIdMatch && contextData.informationCompleteness === 'complete' && contextData.additionalActionLikely !== 'yes') {
      caseType = 'bank_id_support';
      complexity = 'quick';
      requiresEmployeeReview = true;
      confidenceStatus = 'high';
      reasons = [
        createReason('well_defined_case', 'The request is clearly scoped and well defined.'),
        createReason('no_additional_action', 'Context shows complete information and no likely follow-up action.')
      ];
    } else if (transferMatch && contextData.informationCompleteness === 'complete' && contextData.additionalActionLikely !== 'yes') {
      caseType = 'payment_transfer';
      complexity = 'quick';
      confidenceStatus = 'high';
      requiresEmployeeReview = true;
      reasons = [
        createReason('similar_previous_action', 'The request matches a standard payment flow with enough context.'),
        createReason('complete_context', 'The context indicates complete information and no expected extra work.')
      ];
    } else if (infoQuestion) {
      caseType = 'information_question';
      complexity = 'quick';
      confidenceStatus = 'high';
      requiresEmployeeReview = true;
      reasons = [
        createReason('information_only', 'The message looks like an informational request rather than a complex account change.'),
        createReason('low_risk_scope', 'The issue appears narrow and does not require investigation.')
      ];
    } else if (accountChange) {
      caseType = 'account_change';
      complexity = 'standard';
      confidenceStatus = 'medium';
      requiresEmployeeReview = true;
      reasons = [
        createReason('account_change_need', 'The request is for an account change and needs review before booking.'),
        createReason('context_risk', missingInfo ? 'Context suggests partial information or additional work.' : 'The request is routine but still needs employee review.')
      ];
    } else if (mandateMatch || (recentChange && unclearMandate)) {
      caseType = 'mandate_power_of_attorney';
      complexity = 'complex';
      confidenceStatus = 'low';
      requiresEmployeeReview = true;
      reasons = [
        createReason('verification_needed', 'The case appears to involve a mandate or verification step.'),
        createReason('recent_change', 'A recent change combined with an unclear mandate increases the likely work required.')
      ];
    } else if (missingDocumentMatch || contextData.informationCompleteness === 'missing') {
      caseType = 'missing_information';
      complexity = 'complex';
      confidenceStatus = 'low';
      requiresEmployeeReview = true;
      reasons = [
        createReason('documents_missing', 'The case suggests missing documents or unknown information.'),
        createReason('document_review', 'Missing information prevents a quick-case recommendation.')
      ];
    } else {
      caseType = 'ambiguous_other';
      complexity = 'standard';
      confidenceStatus = 'medium';
      requiresEmployeeReview = true;
      fallbackApplied = true;
      reasons = [
        createReason('ambiguous_case', 'The description is short or ambiguous and needs employee review.'),
        createReason('fallback_applied', 'The system used a safe standard fallback because the current text is not sufficiently clear.')
      ];
    }

    if (caseLabelType) {
      caseType = caseLabelType;
      reasons.push(createReason('case_label_type', `The selected case label maps to ${caseLabelType}.`));
    }

    if (caseLabelComplexity) {
      complexity = caseLabelComplexity;
      reasons.push(createReason('case_label_complexity', `The selected case label sets this scenario to ${caseLabelComplexity} complexity.`));
    }

    if (contextData.additionalActionLikely === 'yes' || contextData.additionalActionLikely === 'possible') {
      if (complexity !== 'complex') {
        complexity = 'standard';
        reasons.push(createReason('additional_action_likely', 'The context indicates likely follow-up actions that justify more time.'));
      }
    }

    if (contextData.mandateStatus === 'missing' || contextData.mandateStatus === 'unclear') {
      if (complexity === 'quick') {
        complexity = 'standard';
        reasons.push(createReason('mandate_unclear', 'The mandate status is unclear, so the system cannot safely shorten the slot.'));
      }
    }

    if (complexity === 'quick') {
      confidenceStatus = 'high';
    } else if (complexity === 'standard') {
      confidenceStatus = 'medium';
    } else if (complexity === 'complex') {
      confidenceStatus = 'low';
    }

    if (/\b(test|failure|error|failed)\b/.test(normalized) && normalized.includes('triage')) {
      throw new Error('Triage service failed for the synthetic demo scenario.');
    }

    const capacity = capacityMap[complexity].type;
    const durationBand = capacityMap[complexity].durationBand;
    const minMinutes = capacityMap[complexity].minMinutes;
    const maxMinutes = capacityMap[complexity].maxMinutes;

    return {
      triageId: `TRIAGE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      caseType,
      complexity,
      caseDescriptionValue: getCaseDescriptionValue(safeDescription),
      durationBand,
      estimatedHandlingTime: {
        minMinutes,
        maxMinutes,
        label: capacityMap[complexity].label
      },
      recommendedCapacity: capacity,
      confidence: {
        status: confidenceStatus,
        score: null
      },
      reasons,
      requiresEmployeeReview,
      fallbackApplied,
      ruleVersion,
      datasetVersion,
      currentDescription: safeDescription,
      context: contextData
    };
  }

  function getAvailability(capacityType, durationBand, scenarioId = null) {
    const quickSlots = [
      { slotId: 'SLOT-1001', start: '2026-10-01T09:00:00Z', end: '2026-10-01T09:05:00Z', available: true },
      { slotId: 'SLOT-1002', start: '2026-10-01T09:05:00Z', end: '2026-10-01T09:10:00Z', available: true },
      { slotId: 'SLOT-1003', start: '2026-10-01T09:10:00Z', end: '2026-10-01T09:15:00Z', available: true }
    ];

    const standardSlots = [
      { slotId: 'SLOT-2001', start: '2026-10-01T10:00:00Z', end: '2026-10-01T10:15:00Z', available: true },
      { slotId: 'SLOT-2002', start: '2026-10-01T10:15:00Z', end: '2026-10-01T10:30:00Z', available: true }
    ];

    const complexSlots = [
      { slotId: 'SLOT-3001', start: '2026-10-01T11:00:00Z', end: '2026-10-01T11:30:00Z', available: true },
      { slotId: 'SLOT-3002', start: '2026-10-01T11:30:00Z', end: '2026-10-01T12:00:00Z', available: true }
    ];

    if (scenarioId === 'D-010') {
      return [];
    }

    const slotMap = {
      quick_case: quickSlots,
      standard_case: standardSlots,
      complex_case: complexSlots
    };

    return slotMap[capacityType] || [];
  }

  function getBookedSlotIds() {
    try {
      const raw = localStorage.getItem('demo_booked_slots_v1');
      if (!raw) {
        return new Set();
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed);
      }
      if (parsed && Array.isArray(parsed.bookedSlots)) {
        return new Set(parsed.bookedSlots);
      }
    } catch (error) {
      // Ignore malformed storage and treat it as an empty set.
    }
    return new Set();
  }

  function persistBookedSlot(slotId) {
    const booked = getBookedSlotIds();
    booked.add(slotId);
    localStorage.setItem('demo_booked_slots_v1', JSON.stringify(Array.from(booked)));
  }

  function createBooking({ triage, slotId, employeeDecision, finalCapacity, finalDurationBand, overrideReason }) {
    if (!triage || !slotId) {
      const error = new Error('A valid triage result and slot are required for booking.');
      error.code = 'BOOKING_INVALID';
      throw error;
    }

    if (!employeeDecision || !['approved', 'overridden'].includes(employeeDecision)) {
      const error = new Error('Employee decision must be approved or overridden before booking.');
      error.code = 'BOOKING_DECISION_REQUIRED';
      throw error;
    }

    if (employeeDecision === 'overridden' && !overrideReason) {
      const error = new Error('An override reason is required when changing the recommendation.');
      error.code = 'OVERRIDE_REASON_REQUIRED';
      throw error;
    }

    const slots = getAvailability(finalCapacity, finalDurationBand, triage.scenarioId);
    const selectedSlot = slots.find((slot) => slot.slotId === slotId);
    const alreadyBooked = getBookedSlotIds().has(slotId);

    if (!selectedSlot || !selectedSlot.available || alreadyBooked) {
      const error = new Error('The selected slot is unavailable.');
      error.code = 'NO_CAPACITY';
      throw error;
    }

    persistBookedSlot(slotId);

    return {
      bookingId: `BOOK-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      status: 'confirmed',
      triageId: triage.triageId,
      slotId,
      finalCapacity,
      finalDurationBand,
      wasOverridden: employeeDecision === 'overridden',
      createdAt: new Date().toISOString()
    };
  }

  const demo = {
    datasetVersion,
    ruleVersion,
    scenarios,
    getScenarioById,
    getCustomerContext,
    triageCase,
    getAvailability,
    createBooking
  };

  if (typeof window !== 'undefined') {
    window.SystemXDemo = demo;
  }
})();
