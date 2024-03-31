export const verifyServerSide = () => {
  if (typeof window !== "undefined") {
    throw new Error("This function can only be called on the server");
  }
};
