import { estimateMonthsRemaining } from '../../utils/dates';

export const calculateGoal = (goal) => {
  const { target, saved, deadline } = goal;
  const monthsRemaining = estimateMonthsRemaining(deadline);
  const amountNeeded = target - saved;
  const requiredMonthly = monthsRemaining > 0 ? Math.ceil(amountNeeded / monthsRemaining) : amountNeeded;
  const percentComplete = Math.min(100, Math.round((saved / target) * 100));
  const onTrack = saved >= (target * ((12 - monthsRemaining) / 12));

  return {
    monthsRemaining,
    amountNeeded,
    requiredMonthly,
    percentComplete,
    onTrack,
  };
};