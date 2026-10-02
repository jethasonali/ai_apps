Feature: Triage and booking flow
  In order to demonstrate the booking triage demo
  As a tester
  I want to verify the D- scenarios produce the expected triage and booking outcomes

  Scenario: D-001 BankID happy path
    When I open the demo page
    And I choose scenario "D-001"
    And I click Analyse
    Then the triage case type should be "bank_id_support"
    And the triage complexity should be "quick"
    And the recommended capacity should be "quick_case"

  Scenario: D-005 Mandate / power-of-attorney (complex)
    When I open the demo page
    And I choose scenario "D-005"
    And I click Analyse
    Then the triage case type should be "mandate_power_of_attorney"
    And the triage complexity should be "complex"
    And the recommended capacity should be "complex_case"

  Scenario: D-009 Employee override changes category
    When I open the demo page
    And I choose scenario "D-009"
    And I click Analyse
    And I set final category to "standard_case"
    And I enter override reason "Employee judgement"
    And I click Use override
    Then the decision error should be empty

  Scenario: D-010 No capacity available
    When I open the demo page
    And I choose scenario "D-010"
    And I click Analyse
    Then available slots should be empty

  Scenario: D-011 Triage failure simulation
    When I open the demo page
    And I choose scenario "D-011"
    And I click Analyse
    Then the form error should contain "Triage service failed"
