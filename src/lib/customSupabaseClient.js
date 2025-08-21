import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hlxpoyzjgqynpzdnkndr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhseHBveXpqZ3F5bnB6ZG5rbmRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MTIwMzQsImV4cCI6MjA2OTM4ODAzNH0.bbj5Mfye7rViTPul27Al16yOtNeNNZd9uCzDYqyOFeA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);