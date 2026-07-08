import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

declare const process: { env: { [key: string]: string | undefined } };

const supabaseUrl = (process.env.SUPABASE_URL || '') as string;
const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || '') as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);