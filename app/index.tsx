import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { getUserId } from '@utils/session';

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const userId = await getUserId();
      setIsLoggedIn(!!userId);
    };

    checkSession();
  }, []);

  if (isLoggedIn === null) return null; // ⏳ wait for session check

  return <Redirect href={isLoggedIn ? '/(home)/dashboard' : '/login'} />;
}
