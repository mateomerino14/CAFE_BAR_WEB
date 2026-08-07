import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

/*Configuracion de cliente en supabase con credenciales */
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
