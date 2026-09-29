# Design decisions for the System X demo

- Synthetic dataset: v1
- Decision model: deterministic mock classifier used for MVP; no external AI provider is required
- Employee approval required before booking confirmation
- Final booking always uses the employee-approved or employee-overridden category
- Availability is simulated and stored in local demo data only
- Latency target remains TBD for the MVP because no agreed production SLA is specified in the source requirement
- No real customer data, production credentials, or live System X integration are used

## Notes

This demo intentionally keeps all values synthetic and uses a deterministic rule-based classification layer to make the scenario repeatable and testable.
