const styles = {
  base: 'w-full rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-base focus:border-blue-500 focus:outline-none'
};

export const ComboInput = ({ options = [], listId, className = '', ...props }) => {
  return (
    <>
      <input list={listId} className={`${styles.base} ${className}`} {...props} />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </>
  );
};