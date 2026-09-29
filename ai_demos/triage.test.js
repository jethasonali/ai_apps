import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getCustomerContext,
  triageCase,
  getAvailability,
  createBooking,
  scenarios
} from './triage.js';

test('BankID happy path returns quick-case triage', () => {
  const context = getCustomerContext('CUSTCTX-0101');
  const result = triageCase('I need help activating BankID.', context);

  assert.equal(result.caseType, 'bank_id_support');
  assert.equal(result.complexity, 'quick');
  assert.equal(result.durationBand, '2_5');
  assert.equal(result.recommendedCapacity, 'quick_case');
  assert.equal(result.confidence.status, 'high');
});

test('Case labels change complexity without altering the detected case type', () => {
  const quickCase = triageCase('I need help activating BankID.', getCustomerContext('CUSTCTX-0101'), 'BankID activation - Self');
  const standardCase = triageCase('I need help activating BankID.', getCustomerContext('CUSTCTX-0101'), 'BankID activation - Other');
  const complexCase = triageCase('I need help with a power of attorney changed last week.', getCustomerContext('CUSTCTX-0105'), 'Power of attorney');

  assert.equal(quickCase.caseType, 'bank_id_support');
  assert.equal(quickCase.complexity, 'quick');
  assert.equal(standardCase.caseType, 'bank_id_support');
  assert.equal(standardCase.complexity, 'standard');
  assert.equal(complexCase.caseType, 'mandate_power_of_attorney');
  assert.equal(complexCase.complexity, 'complex');
});

test('Confidence is derived directly from the complexity tier', () => {
  const quickCase = triageCase('I need help activating BankID.', getCustomerContext('CUSTCTX-0101'));
  const standardCase = triageCase('I need to change my account details.', getCustomerContext('CUSTCTX-0104'));
  const complexCase = triageCase('I need help with a power of attorney changed last week.', getCustomerContext('CUSTCTX-0105'));

  assert.equal(quickCase.complexity, 'quick');
  assert.equal(quickCase.confidence.status, 'high');
  assert.equal(standardCase.complexity, 'standard');
  assert.equal(standardCase.confidence.status, 'medium');
  assert.equal(complexCase.complexity, 'complex');
  assert.equal(complexCase.confidence.status, 'low');
});

test('Case description value reflects the description text', () => {
  const elaboratedCase = triageCase(
    'My BankID stopped working after I changed phones, and I cannot activate it again.',
    getCustomerContext('CUSTCTX-0101')
  );
  const notElaboratedCase = triageCase('Power of attorney', getCustomerContext('CUSTCTX-0105'));
  const complexButElaboratedCase = triageCase(
    'I need help with a power of attorney because the document changed after my recent account update.',
    getCustomerContext('CUSTCTX-0105')
  );

  assert.equal(elaboratedCase.caseDescriptionValue, 'elaborated');
  assert.equal(notElaboratedCase.caseDescriptionValue, 'not elaborated');
  assert.equal(complexButElaboratedCase.complexity, 'complex');
  assert.equal(complexButElaboratedCase.caseDescriptionValue, 'elaborated');
});

test('Mandate case with recent change becomes complex', () => {
  const context = getCustomerContext('CUSTCTX-0105');
  const result = triageCase('I need help with a power of attorney changed last week.', context);

  assert.equal(result.caseType, 'mandate_power_of_attorney');
  assert.equal(result.complexity, 'complex');
  assert.equal(result.durationBand, '20_30_plus');
  assert.equal(result.recommendedCapacity, 'complex_case');
});

test('An empty description is rejected', () => {
  assert.throws(() => triageCase('   '), /required/i);
});

test('Override requires a reason to book', () => {
  const triage = triageCase('I need help activating BankID.', getCustomerContext('CUSTCTX-0101'));

  assert.throws(
    () => createBooking({
      triage,
      slotId: 'SLOT-1001',
      employeeDecision: 'overridden',
      finalCapacity: 'quick_case',
      finalDurationBand: '2_5',
      overrideReason: ''
    }),
    /reason is required/i
  );
});

test('Availability returns slots for quick cases and no capacity for D-010', () => {
  assert.equal(getAvailability('quick_case', '2_5').length > 0, true);
  assert.deepEqual(getAvailability('complex_case', '20_30_plus', 'D-010'), []);
});

test('Scenario catalogue contains the required demo cases', () => {
  const ids = scenarios.map((scenario) => scenario.id);
  assert.ok(ids.includes('D-001'));
  assert.ok(ids.includes('D-005'));
  assert.ok(ids.includes('D-010'));
  assert.ok(ids.includes('D-011'));
});
