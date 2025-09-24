import { STATUS_CONFIG } from './StatusBadge';
import clsx from 'clsx';
import styles from './StatusIndicator.module.css';

/**
 * Status indicator dot for stats and quick visual reference
 */
const StatusIndicator = ({ status, size = 'sm', className, ...props }) => {
  const statusConfig = STATUS_CONFIG.find(config => config.value === status);
  
  if (!statusConfig) return null;

  const colorClass = styles[`indicator${statusConfig.color.charAt(0).toUpperCase() + statusConfig.color.slice(1)}`];
  const sizeClass = styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`];

  return (
    <div 
      className={clsx(
        styles.indicator,
        colorClass,
        sizeClass,
        className
      )} 
      title={statusConfig.label}
      {...props}
    />
  );
};

export default StatusIndicator;
