# Updated Test Cases and Scenarios

## Scenario Coverage

- D-001 BankID happy path
- D-005 Mandate / power-of-attorney (complex)
- D-009 Employee override changes category
- D-010 No capacity available
- D-011 Triage failure simulation
- Empty description rejected
- Missing override reason blocks booking
- Double booking attempt

## Updated Scenario Details

### D-001 BankID happy path
- Given the demo page is loaded
- When I choose scenario D-001
- And I click Analyse
- Then the triage case type should be bank_id_support
- And the triage complexity should be quick
- And the recommended capacity should be quick_case

### D-005 Mandate / power-of-attorney (complex)
- Given the demo page is loaded
- When I choose scenario D-005
- And I click Analyse
- Then the triage case type should be mandate_power_of_attorney
- And the triage complexity should be complex
- And the recommended capacity should be complex_case

### D-009 Employee override changes category
- Given the demo page is loaded
- When I choose scenario D-009
- And I click Analyse
- And I set final category to standard_case
- And I enter override reason Employee judgement
- And I click Use override
- Then the decision error should be empty

### D-010 No capacity available
- Given the demo page is loaded
- When I choose scenario D-010
- And I click Analyse
- Then available slots should be empty

### D-011 Triage failure simulation
- Given the demo page is loaded
- When I choose scenario D-011
- And I click Analyse
- Then the form error should contain Triage service failed

### Empty description rejected
- Given the demo page is loaded
- When I clear the description
- And I click Analyse
- Then the form error should contain Case description is required

### Missing override reason blocks booking
- Given the demo page is loaded
- When I choose scenario D-001
- And I click Analyse
- And I set final category to standard_case
- And I clear override reason
- And I click Use override
- Then the decision error should contain An override reason is required

### Double booking attempt
- Given the demo page is loaded
- When I choose scenario D-001
- And I click Analyse
- And I click Approve recommendation
- And I select slot SLOT-1001
- And I click Confirm booking
- Then the booking details should contain Booking ID
- When I repeat the same flow for the same slot
- Then the booking error should contain The selected slot is unavailable

## Verification Status
The current automation suite covering these scenarios passes successfully with:

```powershell
python -m pytest automation/test_features.py -q
```

Result: 8 scenarios passed.
