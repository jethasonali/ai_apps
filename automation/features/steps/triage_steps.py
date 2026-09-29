from pytest_bdd import given, when, then, parsers
from automation.pages.systemx_page import SystemXPage
import time

@given(parsers.parse('the demo is served at "{base_url}"'))
def base_url(base_url, request):
    request.config.base_url = base_url

@when('I open the demo page')
def open_demo(page, request):
    base = getattr(request.config, 'base_url', 'http://127.0.0.1:8000')
    p = SystemXPage(page, base)
    p.goto()
    request._systemx_page = p

@when(parsers.parse('I choose scenario "{scenario_id}"'))
def choose_scenario(request, scenario_id):
    p: SystemXPage = request._systemx_page
    p.choose_scenario(scenario_id)

@when('I click Analyse')
def click_analyse(request):
    p: SystemXPage = request._systemx_page
    p.click_analyse()
    time.sleep(0.2)

@when('I clear the description')
def clear_description(request):
    p: SystemXPage = request._systemx_page
    p.clear_description()

@then(parsers.parse('the triage case type should be "{case_type}"'))
def check_case_type(request, case_type):
    p: SystemXPage = request._systemx_page
    assert p.get_triage_case_type().strip() == case_type

@then(parsers.parse('the triage complexity should be "{complexity}"'))
def check_complexity(request, complexity):
    p: SystemXPage = request._systemx_page
    assert p.get_triage_complexity().strip() == complexity

@then(parsers.parse('the recommended capacity should be "{capacity}"'))
def check_capacity(request, capacity):
    p: SystemXPage = request._systemx_page
    assert p.get_recommended_capacity().strip() == capacity

@then(parsers.parse('the form error should contain "{msg}"'))
def check_form_error(request, msg):
    p: SystemXPage = request._systemx_page
    assert msg in p.get_form_error()

@when(parsers.parse('I set final category to "{category}"'))
def set_final_category(request, category):
    p: SystemXPage = request._systemx_page
    p.set_final_category(category)

@when(parsers.parse('I enter override reason "{reason}"'))
def enter_override(request, reason):
    p: SystemXPage = request._systemx_page
    p.enter_override_reason(reason)

@when('I click Use override')
def click_use_override(request):
    p: SystemXPage = request._systemx_page
    p.click_override()
    time.sleep(0.1)

@then('the decision error should be empty')
def decision_error_empty(request):
    p: SystemXPage = request._systemx_page
    assert p.get_decision_error() == ''


@then(parsers.parse('the decision error should contain "{msg}"'))
def decision_error_contains(request, msg):
    p: SystemXPage = request._systemx_page
    assert msg in p.get_decision_error()

@then('available slots should be empty')
def slots_empty(request):
    p: SystemXPage = request._systemx_page
    assert len(p.get_available_slots()) == 0

@when('I click Approve recommendation')
def click_approve(request):
    p: SystemXPage = request._systemx_page
    p.click_approve()
    time.sleep(0.1)

@when(parsers.parse('I select slot "{slot_id}"'))
def select_slot(request, slot_id):
    p: SystemXPage = request._systemx_page
    p.select_slot(slot_id)
    time.sleep(0.1)

@when('I click Confirm booking')
def click_confirm(request):
    p: SystemXPage = request._systemx_page
    p.click_confirm()
    time.sleep(0.2)

@then(parsers.parse('the booking details should contain "{text}"'))
def booking_details_contains(request, text):
    p: SystemXPage = request._systemx_page
    assert text in p.get_booking_details()

@then(parsers.parse('the booking error should contain "{text}"'))
def booking_error_contains(request, text):
    p: SystemXPage = request._systemx_page
    assert text in p.get_booking_error()

@when('I clear override reason')
def clear_override_reason(request):
    p: SystemXPage = request._systemx_page
    p.enter_override_reason('')
