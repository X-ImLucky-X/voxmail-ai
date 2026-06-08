
  import "react-native-url-polyfill/auto";

  import { createClient } from "@supabase/supabase-js";
  
  import * as SecureStore from "expo-secure-store";
  
  const ExpoSecureStoreAdapter = {
    getItem: (key: string) => {
      return SecureStore.getItemAsync(key);
    },
  
    setItem: (key: string, value: string) => {
      return SecureStore.setItemAsync(key, value);
    },
  
    removeItem: (key: string) => {
      return SecureStore.deleteItemAsync(key);
    },
  };
  
  const supabaseUrl =
    "https://gatesuexmgzbeiefffyc.supabase.co";
  
  const supabaseAnonKey =
    "sb_publishable_uk2aNr07a7L9jStWxS3rQg_gPfrI9AV";
  
  export const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    }
  );