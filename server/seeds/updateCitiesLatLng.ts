
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ezwapsjlyqbsxxoeqboo.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6d2Fwc2pseXFic3h4b2VxYm9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDk4MzIsImV4cCI6MjA4MDE4NTgzMn0.3TqkfUeh4Gm2K1oy46fMN2F7U99Pzc_bfTpxfT2Xjis';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateCities() {
    console.log("Reading zip.csv...");
    const csvPath = path.resolve(process.cwd(), 'server', 'data', 'zip.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf-8');

    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true,
        trim: true
    });

    console.log(`Found ${records.length} records in CSV.`);

    console.log("Fetching existing cities from DB...");
    // Fetch ALL cities to map them properly
    // Since we might have > 1000, we should page or just assume < 1000 for now (currently 501)
    const { data: dbCities, error } = await supabase.from('cities').select('id, name, state');

    if (error) {
        console.error("Error fetching cities:", error);
        return;
    }

    console.log(`Fetched ${dbCities.length} existing cities from DB.`);

    const cityMap = new Map();
    dbCities.forEach(c => {
        const key = `${c.name.trim().toLowerCase()}|${c.state.trim().toLowerCase()}`;
        cityMap.set(key, c.id);
    });

    let updatedCount = 0;
    let insertedCount = 0;
    let skippedCount = 0;

    console.log(`Starting sync...`);

    for (const record of records) {
        // Cast record to any to avoid "unknown" type error during access
        const r = record as Record<string, string>;

        const keys = Object.keys(r);
        const cityKey = keys.find(k => k.includes('City'));
        const latKey = keys.find(k => k.toLowerCase().includes('lat'));
        const longKey = keys.find(k => k.toLowerCase().includes('long'));
        const factorKey = keys.find(k => k.toLowerCase().includes('factor'));

        if (!cityKey || !latKey || !longKey) {
            skippedCount++;
            continue;
        }

        const cityStZip = r[cityKey];
        let latStr = r[latKey];
        let longStr = r[longKey];
        let factorStr = factorKey ? r[factorKey] : '1.0';

        const parts = cityStZip.split(',');
        let cityName = "", stateCode = "";

        if (parts.length >= 2) {
            cityName = parts[0].trim();
            const statePart = parts[1].trim();
            stateCode = statePart.split(' ')[0];
        } else {
            skippedCount++;
            continue;
        }

        const parseCoord = (str: string) => {
            if (!str) return NaN;
            str = str.trim();
            let isNeg = false;
            if (str.startsWith('(') && str.endsWith(')')) {
                isNeg = true;
                str = str.slice(1, -1);
            }
            let val = parseFloat(str);
            if (isNeg) val = -val;
            return val;
        };

        const lat = parseCoord(latStr);
        let lng = parseCoord(longStr);
        const factor = parseFloat(factorStr) || 1.0;

        if (isNaN(lat) || isNaN(lng)) {
            skippedCount++;
            continue;
        }

        const key = `${cityName.toLowerCase()}|${stateCode.toLowerCase()}`;
        const id = cityMap.get(key);

        if (id && id !== 'pending-id') {
            // Update existing city
            await supabase
                .from('cities')
                .update({ lat, lng, cost_factor: factor })
                .eq('id', id);

            updatedCount++;
        } else if (!id) {
            // INSERT NEW CITY
            // Check if we already inserted this session (map check above handles it if we set key)

            const { error: insertError } = await supabase
                .from('cities')
                .insert({
                    name: cityName,
                    state: stateCode,
                    lat,
                    lng,
                    cost_factor: factor,
                    region: 'National' // Default value required if column is not nullable
                });

            if (insertError) {
                // Handle duplicate key error gracefully just in case
                if (insertError.code === '23505') { // Unique violation usually
                    // ignore
                } else {
                    // console.error(`Failed to insert ${cityName}: ${insertError.message}`);
                    skippedCount++;
                }
            } else {
                insertedCount++;
                cityMap.set(key, 'pending-id'); // Mark as handled so we don't insert valid dupe rows from CSV if any
            }
        } else {
            // Already handled (pending-id)
            skippedCount++;
        }

        if ((updatedCount + insertedCount + skippedCount) % 50 === 0) process.stdout.write('.');
    }

    console.log(`\n\nSync Complete!`);
    console.log(`Updated Existing: ${updatedCount}`);
    console.log(`Inserted New: ${insertedCount}`);
    console.log(`Skipped/Errors: ${skippedCount}`);
}

updateCities();
