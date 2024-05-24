export const validateUserAuth = (
  endpointAuthority: string,
  userAuthority: string
) => {
  console.log("validate", endpointAuthority, userAuthority);
  if (userAuthority === "ADMIN") {
    return true;
  }

  return userAuthority === endpointAuthority;
};
