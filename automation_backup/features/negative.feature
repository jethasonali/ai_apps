Feature: Negative and validation flows
  Scenario: Empty description rejected
    When I open the demo page
    And I clear the description
    And I click Analyse
    Then the form error should contain "Case description is required"

  Scenario: Missing override reason blocks booking
    When I open the demo page
    And I choose scenario "D-001"
    And I click Analyse
    And I set final category to "standard_case"
    And I clear override reason
    And I click Use override
    Then the decision error should contain "An override reason is required"

  Scenario: Double booking attempt
    When I open the demo page
    And I choose scenario "D-001"
    And I click Analyse
    And I click Approve recommendation
    And I select slot "SLOT-1001"
    And I click Confirm booking
    Then the booking details should contain "Booking ID"
    When I open the demo page
    And I choose scenario "D-001"
    And I click Analyse
    And I click Approve recommendation
    And I select slot "SLOT-1001"
    And I click Confirm booking
    Then the booking error should contain "The selected slot is unavailable"
