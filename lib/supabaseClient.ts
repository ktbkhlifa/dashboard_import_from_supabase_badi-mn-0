import { createClient } from '@supabase/supabase-js';

// !! IMPORTANT: Remplacez les valeurs ci-dessous par les vôtres !!
// Vous pouvez aussi les mettre dans un fichier .env pour plus de sécurité
const supabaseUrl = 'https://ahctrxxlinonkyauzpyb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoY3RyeHhsaW5vbmt5YXV6cHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMDU4MjksImV4cCI6MjA3MTg4MTgyOX0.J1CRnSk56jxb0zkm1TTNU9DQCHQMa3pbpGKkM6qmV5E';

// Crée et exporte le client Supabase
export const supabase = createClient(supabaseUrl, supabaseKey);
