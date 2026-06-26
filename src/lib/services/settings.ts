import { supabase } from '../supabase';

export interface UserSettings {
  name: string;
  email: string;
  role: string;
  location: string;
  themePreference: 'dark' | 'light';
  fontSize: string;
  compactMode: boolean;
  notificationPrefs: Record<string, boolean>;
}

export const settingsService = {
  get: async (userId: string): Promise<Partial<UserSettings>> => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) throw error;
    return {
      name: data.name || '',
      email: data.email || '',
      role: data.role || 'Developer',
      location: data.location || '',
      themePreference: data.theme_preference || 'dark',
      fontSize: data.font_size || 'Medium',
      compactMode: data.compact_mode || false,
      notificationPrefs: data.notification_prefs || {},
    };
  },
  update: async (userId: string, settings: Partial<UserSettings>) => {
    const payload: Record<string, any> = {};
    if (settings.name !== undefined) payload.name = settings.name;
    if (settings.email !== undefined) payload.email = settings.email;
    if (settings.role !== undefined) payload.role = settings.role;
    if (settings.location !== undefined) payload.location = settings.location;
    if (settings.themePreference !== undefined) payload.theme_preference = settings.themePreference;
    if (settings.fontSize !== undefined) payload.font_size = settings.fontSize;
    if (settings.compactMode !== undefined) payload.compact_mode = settings.compactMode;
    if (settings.notificationPrefs !== undefined) payload.notification_prefs = settings.notificationPrefs;
    const { error } = await supabase.from('profiles').update(payload).eq('id', userId);
    if (error) throw error;
  },
};
