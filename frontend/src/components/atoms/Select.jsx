const styles = {
  base: 'w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-base focus:border-blue-500 focus:outline-none'
};

export const Select = ({ options, placeholder, className = '', ...props }) => {
  return (
    <select className={`${styles.base} ${className}`} {...props}>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
};