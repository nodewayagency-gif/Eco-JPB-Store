import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oxpnlbldyxjrgbuicttx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94cG5sYmxkeXhqcmdidWljdHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1OTc3MjIsImV4cCI6MjA5MzE3MzcyMn0.MRmSDnHL3O7IGZtfMaIFuGSMpBquNQgwJbqNvybyajY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
