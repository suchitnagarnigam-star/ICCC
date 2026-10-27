import { validateStatusTransition } from '../services/stateMachine';

console.log('--- Testing Centralized FSM State Machine ---');

// 1. Direct jump to CLOSED without verification workflow must be blocked
const r1 = validateStatusTransition('IN_PROGRESS', 'CLOSED', 'je', false);
if (r1.allowed || !r1.error?.includes('Direct status transition to \'CLOSED\' is forbidden')) {
  throw new Error(`Test 1 Failed: Expected direct CLOSED transition to be blocked, got: ${JSON.stringify(r1)}`);
}
console.log('✅ Test 1: Direct transition to CLOSED via generic status update blocked.');

// 2. Direct jump to RESOLUTION_SUBMITTED without proof must be blocked
const r2 = validateStatusTransition('IN_PROGRESS', 'RESOLUTION_SUBMITTED', 'je', false);
if (r2.allowed || !r2.error?.includes('Direct status transition to \'RESOLUTION_SUBMITTED\' is forbidden')) {
  throw new Error(`Test 2 Failed: Expected direct RESOLUTION_SUBMITTED transition to be blocked, got: ${JSON.stringify(r2)}`);
}
console.log('✅ Test 2: Direct transition to RESOLUTION_SUBMITTED via generic status update blocked.');

// 3. Illegal transition: SUBMITTED directly to IN_PROGRESS
const r3 = validateStatusTransition('SUBMITTED', 'IN_PROGRESS', 'je', false);
if (r3.allowed || !r3.error?.includes('Illegal state transition')) {
  throw new Error(`Test 3 Failed: Expected SUBMITTED -> IN_PROGRESS to be illegal, got: ${JSON.stringify(r3)}`);
}
console.log('✅ Test 3: Illegal transition (SUBMITTED -> IN_PROGRESS) rejected.');

// 4. Valid transition: ASSIGNED -> ACKNOWLEDGED by field officer
const r4 = validateStatusTransition('ASSIGNED', 'ACKNOWLEDGED', 'je', true);
if (!r4.allowed) {
  throw new Error(`Test 4 Failed: Expected ASSIGNED -> ACKNOWLEDGED to be allowed, got: ${JSON.stringify(r4)}`);
}
console.log('✅ Test 4: Valid transition ASSIGNED -> ACKNOWLEDGED allowed.');

// 5. Valid transition: ACKNOWLEDGED -> IN_PROGRESS
const r5 = validateStatusTransition('ACKNOWLEDGED', 'IN_PROGRESS', 'je', false);
if (!r5.allowed) {
  throw new Error(`Test 5 Failed: Expected ACKNOWLEDGED -> IN_PROGRESS to be allowed, got: ${JSON.stringify(r5)}`);
}
console.log('✅ Test 5: Valid transition ACKNOWLEDGED -> IN_PROGRESS allowed.');

// 6. Citizen role cannot change operational status to IN_PROGRESS
const r6 = validateStatusTransition('ACKNOWLEDGED', 'IN_PROGRESS', 'citizen', false);
if (r6.allowed || !r6.error?.includes('Citizens cannot modify officer operational status')) {
  throw new Error(`Test 6 Failed: Expected citizen status change to be blocked, got: ${JSON.stringify(r6)}`);
}
console.log('✅ Test 6: Citizen operational status manipulation blocked.');

// 7. Specialized workflow: RESOLUTION_SUBMITTED -> CLOSED via verify-close
const r7 = validateStatusTransition('RESOLUTION_SUBMITTED', 'CLOSED', 'citizen', true);
if (!r7.allowed) {
  throw new Error(`Test 7 Failed: Expected verify-close to CLOSED to be allowed, got: ${JSON.stringify(r7)}`);
}
console.log('✅ Test 7: Formal verification closure allowed.');

console.log('🎉 ALL FSM TRANSITION AND WORKFLOW GATE TESTS PASSED!');
