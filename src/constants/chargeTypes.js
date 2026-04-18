import COLORS from './colors';

const CHARGE_TYPES = {
  atm: {
    key: 'atm',
    name: 'ATM Withdrawals',
    color: COLORS.blue,
    alternative: 'Use tap-to-pay or app transfers instead',
  },
  serviceFee: {
    key: 'serviceFee',
    name: 'Monthly Service Fee',
    color: COLORS.orange,
    alternative: 'Consider a lower-tier account if available',
  },
  interbank: {
    key: 'interbank',
    name: 'Interbank Transfer Fees',
    color: COLORS.purple,
    alternative: 'FNB-to-FNB transfers are free — use them where possible',
  },
  sms: {
    key: 'sms',
    name: 'SMS Notifications',
    color: COLORS.red,
    alternative: 'Switch to push notifications only — free on the app',
  },
};

export default CHARGE_TYPES;