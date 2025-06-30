// utils/fetchUserName.ts
import { getUserId } from '@utils/session';
import { BASE_URL } from '@config';

export const fetchUserName = async () => {
  const user_id = await getUserId();
  if (!user_id) return null;

  try {
    const res = await fetch(`${BASE_URL}/api/user-name`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id }),
    });

    const data = await res.json();
    return res.ok ? data.user_name : null;
  } catch (err) {
    console.error('❌ fetchUserName error:', err);
    return null;
  }
};
