import { APPLICATION_STATUS } from '../../utils/constants';
import styles from './StatusBadge.module.css';
import clsx from 'clsx';

/**
 * Unified status configuration
 */
export const STATUS_CONFIG = [
  { value: APPLICATION_STATUS.APPLIED, label: 'Applied', color: 'blue' },
  { value: APPLICATION_STATUS.INTERVIEWING, label: 'Interviewing', color: 'yellow' },
  { value: APPLICATION_STATUS.OFFER, label: 'Offer', color: 'green' },
  { value: APPLICATION_STATUS.REJECTED, label: 'Rejected', color: 'red' },
  { value: APPLICATION_STATUS.WITHDRAWN, label: 'Withdrawn', color: 'gray' }
];

/**
 * Get status configuration by value
 */
export function getStatusConfig(status) {
  return STATUS_CONFIG.find(config => config.value === status);
}

/**
 * Status badge component with consistent styling
 */
const StatusBadge = ({ status, className, ...props }) => {
  const statusConfig = getStatusConfig(status);
  
  if (!statusConfig) return null;

  const colorClass = styles[`status${statusConfig.color.charAt(0).toUpperCase() + statusConfig.color.slice(1)}`];

  return (
    <span 
      className={clsx(styles.statusBadge, colorClass, className)} 
      {...props}
    >
      {statusConfig.label}
    </span>
  );
};

export default StatusBadge;
