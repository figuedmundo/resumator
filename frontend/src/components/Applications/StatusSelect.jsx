import { STATUS_CONFIG } from './StatusBadge';
import clsx from 'clsx';
import styles from './StatusSelect.module.css';

/**
 * Reusable status dropdown component
 */
const StatusSelect = ({ 
  value, 
  onChange, 
  includeAllOption = false,
  allOptionLabel = 'All Statuses',
  className,
  disabled = false,
  ...props 
}) => {
  const options = includeAllOption 
    ? [{ value: '', label: allOptionLabel }, ...STATUS_CONFIG]
    : STATUS_CONFIG;

  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      className={clsx(styles.select, disabled && styles.selectDisabled, className)}
      {...props}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default StatusSelect;
