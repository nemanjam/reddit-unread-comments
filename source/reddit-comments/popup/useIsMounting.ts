import { useEffect, useState } from 'react';

const useIsMounting = () => {
  const [isMounting, setIsMounting] = useState(true);

  useEffect(() => {
    setIsMounting(false);
  }, []);

  return { isMounting };
};

export default useIsMounting;
