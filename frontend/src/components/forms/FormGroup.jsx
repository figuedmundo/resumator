import clsx from 'clsx';

const FormGroup = ({ children, className }) => {
  return (
    <div className={clsx('grid grid-cols-1 md:grid-cols-2 gap-6', className)}>
      {children}
    </div>
  );
};

export default FormGroup;
