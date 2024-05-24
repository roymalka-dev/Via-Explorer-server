export const validateUserAuth = (
  endpointAuthority: string,
  userAuthority: string
) => {
  if (userAuthority === "ADMIN") {
    return true;
  }

  return userAuthority === endpointAuthority;
};
