import { useState, createContext } from "react";

const UserType = createContext();

const UserContext = ({ children }) => {
  const [userData, setuserData] = useState("");
  return (
    <UserType.Provider value={{ userData, setuserData }}>
      {children}
    </UserType.Provider>
  );
};

export { UserType, UserContext };
