
const styles = {
  base: 'w-full resize-none rounded-lg border-2 border-gray-300 bg-white px-3 py-2 text-base focus:border-blue-500 focus:outline-none'
};

export const Textarea = ({className = '', ...props}) => {
  return <textarea className={`${styles.base} ${className}`} rows={3} {...props} />;
};