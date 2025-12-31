
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ezwapsjlyqbsxxoeqboo.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6d2Fwc2pseXFic3h4b2VxYm9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDk4MzIsImV4cCI6MjA4MDE4NTgzMn0.3TqkfUeh4Gm2K1oy46fMN2F7U99Pzc_bfTpxfT2Xjis';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWrite() {
    console.log("Testing write permission on 'cities' table...");

    // Try to update San Jose (id: 51a4e5f1-51a9-49d2-9f56-f4eb5667d7e0)
    const { data, error } = await supabase
        .from('cities')
        .update({ lat: 37.3382, lng: -121.8863 })
        .eq('id', '51a4e5f1-51a9-49d2-9f56-f4eb5667d7e0')
        .select();

    if (error) {
        console.log(`❌ Update failed: ${error.message} (${error.code})`);
    } else {
        console.log(`✅ Update successful!`, data);
    }
}

testWrite();
