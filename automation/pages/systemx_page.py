from playwright.sync_api import Page

class SystemXPage:
    def __init__(self, page: Page, base_url: str):
        self.page = page
        self.base_url = base_url.rstrip('/')

    def goto(self):
        self.page.goto(f"{self.base_url}/index.html")

    def _text(self, selector: str, timeout: int = 2000) -> str:
        try:
            el = self.page.wait_for_selector(selector, timeout=timeout)
            return (el.text_content() or '').strip()
        except Exception:
            return ''

    def choose_scenario(self, scenario_id: str):
        # Prefer calling the demo helper to fully apply the scenario (updates internal state and context)
        try:
            self.page.evaluate("(id) => { if(window.applyScenarioById){ window.applyScenarioById(id); } else { const sc = window.SystemXDemo.scenarios.find(s => s.id===id); if(sc){ document.getElementById('caseDescription').value = sc.description; } } }", scenario_id)
        except Exception:
            # fallback: set description directly
            self.page.evaluate("(id) => { const sc = window.SystemXDemo.scenarios.find(s => s.id===id); if(sc){ document.getElementById('caseDescription').value = sc.description; } }", scenario_id)

        # Wait for the authoritative scenario data and select the case label option
        try:
            sc = self.page.evaluate("(id) => { const s = window.SystemXDemo.scenarios.find(x => x.id===id); return s ? { caseLabel: s.caseLabel || '', customerType: s.customerType || '' } : null }", scenario_id)
            if sc and sc.get('caseLabel'):
                case_label = sc.get('caseLabel')
                # Wait for an option with the matching value or text to appear, then select it by label.
                try:
                    self.page.wait_for_selector(f"#caseLabel option[value=\"{case_label}\"]", timeout=2000)
                except Exception:
                    try:
                        self.page.wait_for_selector(f"#caseLabel option:has-text('{case_label}')", timeout=2000)
                    except Exception:
                        pass
                try:
                    self.page.select_option('#caseLabel', label=case_label)
                except Exception:
                    # fallback: set value via evaluate
                    try:
                        self.page.evaluate("(lbl) => { const sel = document.getElementById('caseLabel'); if(!sel) return; for(const opt of Array.from(sel.options)){ if(opt.text === lbl || opt.value === lbl){ sel.value = opt.value; sel.dispatchEvent(new Event('change', { bubbles: true })); break; } } }", case_label)
                    except Exception:
                        pass
        except Exception:
            pass

    def clear_description(self):
        # textarea may be hidden; set value directly via JS to avoid Playwright visibility restrictions
        self.page.evaluate("() => { const el = document.getElementById('caseDescription'); if(el){ el.value = ''; el.dispatchEvent(new Event('input', { bubbles: true })); } }")

    def click_analyse(self):
        self.page.click('#analyzeButton')

    def get_triage_case_type(self):
        return (self._text('#triageCaseType') or '').strip()

    def get_triage_complexity(self):
        return (self._text('#triageComplexity') or '').strip()

    def get_recommended_capacity(self):
        return (self._text('#triageCapacity') or '').strip()

    def get_form_error(self):
        return (self._text('#formError') or '').strip()

    def set_final_category(self, category: str):
        self.page.select_option('#finalCategory', category)

    def enter_override_reason(self, reason: str):
        # override input may be visible after triage; use evaluate to avoid timing issues
        self.page.evaluate("(v) => { const el = document.getElementById('overrideReason'); if(el){ el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); } }", reason)

    def click_approve(self):
        self.page.click('#approvalButton')

    def click_override(self):
        self.page.click('#overrideButton')

    def get_decision_error(self):
        return (self._text('#decisionError') or '').strip()

    def get_available_slots(self):
        # wait for slot list to render; then return only actual slot buttons
        try:
            self.page.wait_for_selector('#slotList', timeout=2000)
        except Exception:
            return []
        buttons = self.page.query_selector_all('.slot-button')
        # filter out any placeholder empty-slot elements
        return [b for b in buttons if b.get_attribute('data-slot-id')]

    def select_slot(self, slot_id: str):
        # find button with data-slot-id
        self.page.click(f".slot-button[data-slot-id=\"{slot_id}\"]")

    def click_confirm(self):
        self.page.click('#confirmButton')

    def get_booking_details(self):
        return self.page.text_content('#bookingDetails') or ''

    def get_booking_error(self):
        return (self.page.text_content('#bookingError') or '').strip()
