"""Bootstrap test file to load all feature scenarios for pytest-bdd collection."""
from pathlib import Path
# Ensure step definition modules are imported so pytest-bdd registers step handlers
import automation.triage_steps
import automation.features.steps.triage_steps as nested_steps
from pytest_bdd import scenarios
from pytest_bdd import when, then, parsers

# Ensure critical step handlers are registered in the test module namespace.
# Some pytest-bdd discovery environments require steps to be visible from
# the test module where `scenarios()` is invoked. Re-bind the most-used
# steps here to guarantee lookup, including parameterised parsers.
try:
	when('I open the demo page')(nested_steps.open_demo)
	when(parsers.parse('I choose scenario "{scenario_id}"'))(nested_steps.choose_scenario)
	when('I click Analyse')(nested_steps.click_analyse)
	when('I clear the description')(nested_steps.clear_description)
	when('I click Approve recommendation')(nested_steps.click_approve)
	when(parsers.parse('I select slot "{slot_id}"'))(nested_steps.select_slot)
	when('I click Confirm booking')(nested_steps.click_confirm)
	when(parsers.parse('I set final category to "{category}"'))(nested_steps.set_final_category)
	when(parsers.parse('I enter override reason "{reason}"'))(nested_steps.enter_override)
	when('I click Use override')(nested_steps.click_use_override)
	when('I clear override reason')(nested_steps.clear_override_reason)
except Exception:
	# If registration fails, continue — import-time diagnostics will show up in test output.
	pass

try:
	then(parsers.parse('the form error should contain "{msg}"'))(nested_steps.check_form_error)
	then(parsers.parse('the triage case type should be "{case_type}"'))(nested_steps.check_case_type)
	then(parsers.parse('the triage complexity should be "{complexity}"'))(nested_steps.check_complexity)
	then(parsers.parse('the recommended capacity should be "{capacity}"'))(nested_steps.check_capacity)
	then('the decision error should be empty')(nested_steps.decision_error_empty)
	then(parsers.parse('the decision error should contain "{msg}"'))(nested_steps.decision_error_contains)
	then('available slots should be empty')(nested_steps.slots_empty)
	then(parsers.parse('the booking details should contain "{text}"'))(nested_steps.booking_details_contains)
	then(parsers.parse('the booking error should contain "{text}"'))(nested_steps.booking_error_contains)
except Exception:
	pass

# Resolve the features directory relative to this file so paths are correct
FEATURES_DIR = Path(__file__).resolve().parent / 'features'
scenarios(str(FEATURES_DIR))
