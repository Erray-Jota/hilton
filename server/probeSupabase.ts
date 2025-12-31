
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ezwapsjlyqbsxxoeqboo.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6d2Fwc2pseXFic3h4b2VxYm9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDk4MzIsImV4cCI6MjA4MDE4NTgzMn0.3TqkfUeh4Gm2K1oy46fMN2F7U99Pzc_bfTpxfT2Xjis';

const supabase = createClient(supabaseUrl, supabaseKey);

async function probeDatabase() {
    console.log("Probing Supabase Database for 'cities' table...");

    const { data, error } = await supabase.from('cities').select('*').limit(5);

    if (error) {
        console.log(`❌ Error querying cities: ${error.message} (${error.code})`);
    } else {
        console.log(`✅ Table 'cities' found! Sample data:`, data);
        if (data && data.length > 0) {
            console.log("Columns:", Object.keys(data[0]));
        }
    }
}

probeDatabase();
