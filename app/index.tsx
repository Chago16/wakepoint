import { Redirect } from 'expo-router';

export default function Index() {
  const isLoggedIn = true;

  return (
    <Redirect href={isLoggedIn ? '/(home)/dashboard' : '/login'} />
  );
}
