export const capitalizeFirstLetter = (string: string) => {
  if (!string) return string; // Handle empty strings
  return string.charAt(0).toUpperCase() + string.slice(1);
};
