import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';

// Setup Supabase client securely using environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // needs insert/update access
);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file || file.type !== 'text/csv') {
      return NextResponse.json({ error: 'Invalid CSV file' }, { status: 400 });
    }

    const text = await file.text();
    const rows = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Array<Record<string, any>>;

    for (const row of rows) {
      const { username, ...rawStats } = row;
      if (!username) continue;

      // 1. Find or create profile
      const { data: profile, error: fetchErr } = await supabase
        .from('player_profiles')
        .select('id')
        .eq('username', username)
        .single();

      let playerId = profile?.id;
      if (fetchErr || !playerId) {
        const { data: inserted, error: insertErr } = await supabase
          .from('player_profiles')
          .insert({ username })
          .select('id')
          .single();
        if (insertErr || !inserted) {
          console.error('Failed to create profile for', username, insertErr);
          continue;
        }
        playerId = inserted.id;
      }

      // 2. Upsert alias for searchability
      const { error: aliasErr } = await supabase
        .from('player_aliases')
        .upsert(
          {
            player_id: playerId,
            username: username,
            platform: 'pokerbaazi',
          },
          {
            onConflict: 'player_id,username,platform', // ✅ string not array
          }
        );
      if (aliasErr) console.error('Failed to upsert alias for', username, aliasErr);

      // 3. Skip if stats already exist for this player
      const { count, error: countErr } = await supabase
        .from('player_stats')
        .select('player_id', { head: true, count: 'exact' })
        .eq('player_id', playerId);
      if (countErr) console.error('Count check error for', username, countErr);
      if (count && count > 0) {
        console.log(`Skipping ${username} — stats already exist`);
        continue;
      }

      // 4. Clean + format stats
      const stats: Record<string, number | null> = {};
      for (const [key, val] of Object.entries(rawStats)) {
        const num = parseFloat(val as string);
        stats[key] = isNaN(num) ? null : num;
      }

      // 5. Insert into player_stats
      const { error: statsErr } = await supabase
        .from('player_stats')
        .insert({ player_id: playerId, ...stats });
      if (statsErr) console.error(`Failed to insert stats for ${username}:`, statsErr);
    }

    return NextResponse.json({ message: 'CSV processed successfully' });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
