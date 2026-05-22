import { useState } from "react";

const useNotification = () => {
  const [updated, setUpdated] = useState(true);
  return { updated, setUpdated };
};

export default useNotification;
