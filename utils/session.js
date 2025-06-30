import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_ID_KEY = 'user_id';

// ✅ Save user_id to session
export const saveUserId = async (userId) => {
  try {
    await AsyncStorage.setItem(USER_ID_KEY, userId);
    console.log('💾 user_id saved:', userId);
  } catch (error) {
    console.error('❌ Failed to save user_id:', error);
  }
};

// ✅ Get user_id from session
export const getUserId = async () => {
  try {
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    console.log('📥 user_id retrieved:', userId);
    return userId;
  } catch (error) {
    console.error('❌ Failed to get user_id:', error);
    return null;
  }
};

// ✅ Clear user_id (e.g., on logout)
export const clearUserId = async () => {
  try {
    await AsyncStorage.removeItem(USER_ID_KEY);
    console.log('🗑️ user_id cleared');
  } catch (error) {
    console.error('❌ Failed to clear user_id:', error);
  }
};
