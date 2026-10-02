(function () {
  const demo = window.SystemXDemo;
  const { datasetVersion, ruleVersion, scenarios, getScenarioById, getCustomerContext, triageCase, getAvailability, createBooking } = demo;

  const customerTypeMap = {
    new: 'D-001',
    existing: 'D-003'
  };

  const state = {
    selectedScenarioId: customerTypeMap.new,
    selectedCustomerType: 'new',
    triageResult: null,
    selectedFinalCategory: 'quick_case',
    selectedSlotId: null,
    employeeDecision: null,
    bookingSummary: null,
    previousDescription: null
  };

  const caseDescriptionInput = document.getElementById('caseDescription');
  const caseDescriptionWrapper = document.getElementById('caseDescriptionWrapper');
  const caseDescriptionValueDisplay = document.getElementById('caseDescriptionValueDisplay');
  const caseDescriptionValue = document.getElementById('caseDescriptionValue');
  const caseLabelSelect = document.getElementById('caseLabel');
  const scenarioSelect = document.getElementById('scenarioSelect');
  const contextPreviewSection = document.getElementById('contextPreviewSection');

  const caseLabelOptions = {
    new: ['Open account', 'Service information'],
    existing: [
      'BankID activation - Self',
      'BankID activation - Other',
      'Transfer to existing',
      'Account details change',
      'Power of attorney',
      'Other'
    ]
  };
  const scenarioCaseLabelMap = {
    'D-001': 'BankID activation - Self',
    'D-002': 'BankID activation - Other',
    'D-003': 'Transfer to existing',
    'D-004': 'Account details change',
    'D-005': 'Power of attorney',
    'D-006': 'Other',
    'D-007': 'Service information',
    'D-008': 'Other',
    'D-009': 'BankID activation - Self',
    'D-010': 'Power of attorney',
    'D-011': 'Other'
  };
  const contextPreview = document.getElementById('contextPreview');
  const formError = document.getElementById('formError');
  const analyzeButton = document.getElementById('analyzeButton');
  const triageCard = document.getElementById('triageCard');
  const triageCaseType = document.getElementById('triageCaseType');
  const triageComplexity = document.getElementById('triageComplexity');
  const triageDuration = document.getElementById('triageDuration');
  const triageCapacity = document.getElementById('triageCapacity');
  const triageConfidence = document.getElementById('triageConfidence');
  const triageReasons = document.getElementById('triageReasons');
  const triageContext = document.getElementById('triageContext');
  const recommendationStatus = document.getElementById('recommendationStatus');
  const decisionPanel = document.getElementById('decisionPanel');
  const finalCategorySelect = document.getElementById('finalCategory');
  const overrideReasonInput = document.getElementById('overrideReason');
  const approvalButton = document.getElementById('approvalButton');
  const overrideButton = document.getElementById('overrideButton');
  const decisionError = document.getElementById('decisionError');
  const slotList = document.getElementById('slotList');
  const bookingPanel = document.getElementById('bookingPanel');
  const bookingWorkspace = document.getElementById('bookingWorkspace');
  const bookingDetails = document.getElementById('bookingDetails');
  const bookingError = document.getElementById('bookingError');
  const disclaimer = document.getElementById('disclaimer');
  const triageMeta = document.getElementById('triageMeta');

  function populateScenarioOptions() {
    scenarioSelect.value = state.selectedCustomerType;
    updateCaseLabelOptions(state.selectedCustomerType);
    updateDescriptionVisibility();
  }

  function updateCaseLabelOptions(customerType) {
    const options = caseLabelOptions[customerType] || caseLabelOptions.existing;
    caseLabelSelect.innerHTML = options
      .map((label) => `<option value="${label}">${label}</option>`)
      .join('');
    caseLabelSelect.selectedIndex = -1;
    caseLabelSelect.value = '';
  }

  function updateDescriptionVisibility() {
    const hasSelectedLabel = Boolean(caseLabelSelect.value && caseLabelSelect.value.trim() !== '');
    caseDescriptionWrapper.hidden = !hasSelectedLabel;
  }

  function refreshCaseLabels(customerType) {
    const labelSet = caseLabelOptions[customerType] || caseLabelOptions.existing;
    caseLabelSelect.innerHTML = labelSet
      .map((label) => `<option value="${label}">${label}</option>`)
      .join('');
    caseLabelSelect.selectedIndex = -1;
    caseLabelSelect.value = '';
  }

  function applyScenario(scenarioId) {
    const scenario = getScenarioById(scenarioId) || scenarios[0];
    const customerType = scenario.customerContextId === 'CUSTCTX-0101' || scenario.customerContextId === 'CUSTCTX-0102' || scenario.customerContextId === 'CUSTCTX-0103' || scenario.customerContextId === 'CUSTCTX-0104' || scenario.customerContextId === 'CUSTCTX-0105' || scenario.customerContextId === 'CUSTCTX-0106' ? 'existing' : 'new';
    state.selectedCustomerType = customerType;
    state.selectedScenarioId = scenario.id;
    scenarioSelect.value = customerType;

    refreshCaseLabels(customerType);

    const caseLabel = scenarioCaseLabelMap[scenario.id] || caseLabelOptions.existing[0];
    caseLabelSelect.value = caseLabel;
    caseDescriptionInput.value = scenario.description;
    caseDescriptionInput.placeholder = 'I need help with ...';
    state.previousDescription = scenario.description;

    const context = getCustomerContext(scenario.customerContextId) || {};
    contextPreview.innerHTML = Object.entries(context)
      .map(([key, value]) => `<li><span>${key}</span><strong>${value}</strong></li>`)
      .join('');
    contextPreviewSection.hidden = true;
    contextPreview.hidden = true;

    disclaimer.textContent = 'Synthetic data / demo environment';
    clearTriageState();
    caseLabelSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }

  window.applyScenarioById = function (id) {
    applyScenario(id);
  };

  function clearTriageState() {
    state.triageResult = null;
    state.bookingSummary = null;
    state.selectedSlotId = null;
    state.employeeDecision = null;
    decisionError.textContent = '';
    bookingError.textContent = '';
    triageReasons.innerHTML = '';
    triageContext.innerHTML = '';
    slotList.innerHTML = '';
    bookingPanel.hidden = true;
    triageCard.hidden = true;
    decisionPanel.hidden = true;
    formError.textContent = '';
    caseDescriptionValue.textContent = '';
    caseDescriptionValueDisplay.hidden = true;
    bookingDetails.innerHTML = '';
  }

  function renderDecisionSection() {
    if (!state.triageResult) {
      decisionPanel.hidden = true;
      return;
    }

    decisionPanel.hidden = false;
    const currentCategory = state.triageResult.recommendedCapacity;
    finalCategorySelect.innerHTML = ['quick_case', 'standard_case', 'complex_case']
      .map((category) => `<option value="${category}" ${category === currentCategory ? 'selected' : ''}>${category}</option>`)
      .join('');
    state.selectedFinalCategory = currentCategory;

    const slots = getAvailability(currentCategory, state.triageResult.durationBand, state.selectedScenarioId);
    renderSlots(slots);
    recommendationStatus.textContent = state.triageResult.requiresEmployeeReview
      ? 'Recommendation requires employee review.'
      : 'Recommendation ready for approval.';
  }

  function renderSlots(slots) {
    if (!slots.length) {
      slotList.innerHTML = '<div class="empty-slot">No suitable slots available for the selected category.</div>';
      return;
    }

    slotList.innerHTML = slots
      .map(
        (slot) => `
          <button type="button" class="slot-button ${slot.slotId === state.selectedSlotId ? 'is-selected' : ''}" data-slot-id="${slot.slotId}">
            <span>${new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <strong>${slot.slotId}</strong>
          </button>
        `
      )
      .join('');

    slotList.querySelectorAll('.slot-button').forEach((button) => {
      button.addEventListener('click', () => {
        state.selectedSlotId = button.dataset.slotId;
        renderSlots(getAvailability(state.selectedFinalCategory, state.triageResult.durationBand, state.selectedScenarioId));
      });
    });
  }

  function onAnalyze() {
    const description = caseDescriptionInput.value;
    const scenario = getScenarioById(state.selectedScenarioId) || scenarios[0];
    const selectedCaseLabel = caseLabelSelect.value || '';

    try {
      const context = getCustomerContext(scenario.customerContextId) || {};
      const result = triageCase(description, context, selectedCaseLabel);
      state.triageResult = { ...result, scenarioId: scenario.id };
      formError.textContent = '';
      contextPreviewSection.hidden = false;
      contextPreview.hidden = false;
      triageCard.hidden = false;
      caseDescriptionValue.textContent = result.caseDescriptionValue;
      caseDescriptionValueDisplay.hidden = false;
      triageCaseType.textContent = result.caseType;
      triageComplexity.textContent = result.complexity;
      triageDuration.textContent = result.durationBand;
      triageCapacity.textContent = result.recommendedCapacity;
      triageConfidence.textContent = `${result.confidence.status} · ${result.confidence.score ?? 'deterministic mock'}`;
      triageReasons.innerHTML = result.reasons.map((reason) => `<li><strong>${reason.code}</strong><span>${reason.message}</span></li>`).join('');
      triageContext.innerHTML = Object.entries(context)
        .map(([key, value]) => `<li><span>${key}</span><strong>${value}</strong></li>`)
        .join('');
      triageMeta.textContent = `Dataset ${datasetVersion} · Rules ${ruleVersion}`;
      renderDecisionSection();
    } catch (error) {
      formError.textContent = error.message;
      contextPreviewSection.hidden = true;
      contextPreview.hidden = true;
      triageCard.hidden = true;
      decisionPanel.hidden = true;
    }
  }

  function handleApproval() {
    if (!state.triageResult) {
      decisionError.textContent = 'Run triage before approving a recommendation.';
      return;
    }

    state.employeeDecision = 'approved';
    decisionError.textContent = 'Employee approved the recommendation.';
    finalCategorySelect.value = state.triageResult.recommendedCapacity;
    renderSlots(getAvailability(state.selectedFinalCategory, state.triageResult.durationBand, state.selectedScenarioId));
  }

  function handleOverride() {
    if (!state.triageResult) {
      decisionError.textContent = 'Run triage before overriding the recommendation.';
      return;
    }

    const overrideReason = overrideReasonInput.value.trim();
    if (!overrideReason) {
      decisionError.textContent = 'An override reason is required before the booking can continue.';
      return;
    }

    state.employeeDecision = 'overridden';
    state.selectedFinalCategory = finalCategorySelect.value;
    decisionError.textContent = '';
    renderSlots(getAvailability(state.selectedFinalCategory, state.triageResult.durationBand, state.selectedScenarioId));
  }

  finalCategorySelect.addEventListener('change', () => {
    state.selectedFinalCategory = finalCategorySelect.value;
    const defaultSlots = getAvailability(state.selectedFinalCategory, state.triageResult?.durationBand || '2_5', state.selectedScenarioId);
    renderSlots(defaultSlots);
  });

  approvalButton.addEventListener('click', handleApproval);
  overrideButton.addEventListener('click', handleOverride);

  analyzeButton.addEventListener('click', onAnalyze);

  scenarioSelect.addEventListener('change', (event) => {
    const customerType = event.target.value;
    refreshCaseLabels(customerType);
    updateDescriptionVisibility();
    const scenarioId = customerTypeMap[customerType] || 'D-001';
    applyScenario(scenarioId);
  });

  caseLabelSelect.addEventListener('change', () => {
    updateDescriptionVisibility();
  });

  caseDescriptionInput.addEventListener('input', () => {
    if (state.triageResult) {
      clearTriageState();
    }
  });

  function confirmBooking() {
    if (!state.triageResult) {
      bookingError.textContent = 'Please analyse a case before confirming a booking.';
      return;
    }

    if (!state.employeeDecision) {
      bookingError.textContent = 'The employee must approve or override the recommendation before booking.';
      return;
    }

    if (!state.selectedSlotId) {
      bookingError.textContent = 'Select an available slot before confirming the booking.';
      return;
    }

    try {
      const booking = createBooking({
        triage: { ...state.triageResult, scenarioId: state.selectedScenarioId },
        slotId: state.selectedSlotId,
        employeeDecision: state.employeeDecision,
        finalCapacity: state.selectedFinalCategory,
        finalDurationBand: state.triageResult.durationBand,
        overrideReason: overrideReasonInput.value.trim() || null
      });

      state.bookingSummary = booking;
      bookingWorkspace.hidden = true;
      bookingPanel.hidden = false;
      bookingDetails.innerHTML = `
        <li><span>Booking ID</span><strong>${booking.bookingId}</strong></li>
        <li><span>Case type</span><strong>${state.triageResult.caseType}</strong></li>
        <li><span>Final category</span><strong>${booking.finalCapacity}</strong></li>
        <li><span>Final duration</span><strong>${booking.finalDurationBand}</strong></li>
        <li><span>Capacity pool</span><strong>${booking.finalCapacity}</strong></li>
        <li><span>Selected slot</span><strong>${booking.slotId}</strong></li>
        <li><span>Decision status</span><strong>${state.employeeDecision}</strong></li>
      `;
      bookingError.textContent = '';
      location.hash = 'booking-summary';
      bookingPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (error) {
      bookingError.textContent = error.message;
      bookingPanel.hidden = true;
    }
  }

  const confirmButton = document.getElementById('confirmButton');
  confirmButton.addEventListener('click', confirmBooking);

  populateScenarioOptions();
  applyScenario(state.selectedScenarioId);
})();
