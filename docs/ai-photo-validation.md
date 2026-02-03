# AI Photo Validation Rules (Spec Only)

This document defines **non-blocking** photo validation rules for future AI checks.
It does **not** change runtime logic or require new auth.

## Global Rules
- Photos must be non-empty and readable (base64 string or object metadata).
- Minimum resolution guideline: 720p.
- Reject fully black / fully white frames.
- Flag extreme blur or over-exposure for manual review.

## Pre-Cleaning (Decoration + Production)
- **Equipment condition:** detect visible damage on frames, conveyors, pipes, plugs, emergency button.
- **Dismantling verification:** components removed (die, pipes, pumps, catchpans).
- **Dry cleaning:** no visible residue on frames, conveyors, scrapers, floor.
- **Coverage count evidence:** if coverage count provided, require a photo showing covered equipment.

## Post-Cleaning (Decoration + Production)
- **Motors/sensors/panels covered:** verify covers in place.
- **CIP completed (Depositor Side A/B):** verify clean surfaces and no residue.
- **Injection unit / hopper toppers / manifolds:** verify assembled + clean.
- **Conveyors, rollers, belts:** verify clean + air-dried.
- **Floor + drains:** verify clean, dry, no equipment left on floor.

## Damage Completion
- Before/after comparison if both available.
- Identify repaired component in frame (non-blank, no obstruction).
- Flag if “Completed” photo is identical to an earlier “Open” image.

## Handover Completion
- Require photo of corrective action result.
- Confirm that the task description context is visible (label or part identity).

## Area Lead Verification
- Verify signature presence (non-empty canvas).
- For “Not Acceptable” items, confirm a photo is attached.

## Operational Notes
- These rules are **advisory** and should not block submissions yet.
- Surface detections only feed audit dashboards and supervisor review queues.
