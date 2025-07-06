'use client';

import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Info,
  CheckCircle,
  AlertCircle,
  Settings,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

const columnCategories = [
  {
    category: '🧑‍💻 Player Identity',
    columns: [
      { column: 'username', description: 'Player username (required)', example: 'john_doe123', required: true },
    ],
  },
  {
    category: '🎯 Pre-Flop Statistics',
    columns: [
      { column: 'vpip', description: 'Voluntarily Put $ In Pot percentage', example: '25.5', required: false },
      { column: 'pfr', description: 'Pre-Flop Raise percentage', example: '18.2', required: false },
      { column: 'three_bet', description: '3-bet percentage', example: '8.7', required: false },
      { column: 'fold_to_three_bet', description: 'Fold to 3-bet percentage', example: '65.4', required: false },
      { column: 'steal', description: 'Steal attempt percentage', example: '42.1', required: false },
      { column: 'check_raise', description: 'Check-raise percentage', example: '12.3', required: false },
    ],
  },
  {
    category: '🧠 Post-Flop Statistics',
    columns: [
      { column: 'cbet', description: 'Continuation bet percentage', example: '68.5', required: false },
      { column: 'fold_to_cbet', description: 'Fold to continuation bet percentage', example: '45.2', required: false },
      { column: 'wtsd', description: 'Went to showdown percentage', example: '28.7', required: false },
      { column: 'wsd', description: 'Won at showdown percentage', example: '52.3', required: false },
      { column: 'aggression_factor', description: 'Aggression factor ratio', example: '2.3', required: false },
      { column: 'fold', description: 'Overall fold percentage', example: '67.8', required: false },
    ],
  },
  {
    category: '🏆 Tournament Performance',
    columns: [
      { column: 'total_tournaments', description: 'Total tournaments played', example: '1250', required: false },
      { column: 'itm_percent', description: 'In-the-money percentage', example: '22.5', required: false },
      { column: 'final_table_percent', description: 'Final table percentage', example: '8.3', required: false },
      { column: 'win_percent', description: 'Tournament win percentage', example: '2.1', required: false },
    ],
  },
];

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (selected && selected.type === 'text/csv') {
      setFile(selected);
      setUploadStatus('idle');
      setUploadMessage('');
    } else {
      setFile(null);
      setUploadStatus('error');
      setUploadMessage('Please select a valid CSV file');
    }
  };

  const handleUpload = async () => {
    try {
      if (!file) throw new Error('No file selected.');
      setUploadStatus('uploading');

      // CSV parsing
      const text = await file.text();
      const [headerLine, ...lines] = text.trim().split('\n');
      const headers = headerLine.split(',').map(h => h.trim());
      const rawRows = lines.map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: Record<string, any> = {};
        headers.forEach((key, idx) => {
          const val = values[idx] ?? '';
          const num = Number(val);
          row[key] = isNaN(num) || key === 'username' ? val : num;
        });
        return row;
      });

      // Upsert profiles and build id map
      const idMap: Record<string, string> = {};
      for (const { username } of rawRows) {
        if (!idMap[username]) {
          const { data: profile, error: e1 } = await supabase
            .from('player_profiles')
            .select('id')
            .eq('username', username)
            .single();
          if (e1 || !profile) {
            const { data: ins, error: e2 } = await supabase
              .from('player_profiles')
              .insert({ username })
              .select('id')
              .single();
            if (e2 || !ins) throw new Error(e2?.message || 'Profile upsert failed');
            idMap[username] = ins.id;
          } else {
            idMap[username] = profile.id;
          }
        }
      }

      // Prepare stats rows
      const statsRows = rawRows.map(({ username, ...rest }) => ({
        player_id: idMap[username],
        ...rest,
      }));

      // Insert stats
      const { error: statsError } = await supabase.from('player_stats').insert(statsRows);
      if (statsError) throw new Error(statsError.message);

      setUploadStatus('success');
      setUploadMessage(`Uploaded ${statsRows.length} rows from ${file.name}`);
      setFile(null);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadStatus('error');
      setUploadMessage(err.message || 'Upload failed');
    }
  };

  const platforms = ['pokerbaazi', 'adda52', 'pokerstars', 'partypoker', '888poker', 'betway'];

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-green-300">Admin Dashboard</h1>
          <Link href="/">
            <Button variant="outline" className="text-green-300 border-green-300 hover:bg-green-300 hover:text-black">
              <Settings className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upload Section */}
          <Card className="w-full bg-green-900/10 backdrop-blur-sm border-green-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-300">
                <Upload className="h-5 w-5" /> Upload CSV File
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 w-full">
              <div className="w-full border-2 border-dashed border-green-700 rounded-lg p-6 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <Input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="w-full cursor-pointer bg-green-900/20 border-green-700 text-green-100"
                />
                <p className="mt-2 text-sm text-green-100">Select a CSV file containing player statistics</p>
              </div>

              {file && (
                <div className="flex items-center justify-between p-3 bg-green-900/20 rounded-lg w-full">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-300" />
                    <span className="text-sm font-medium text-green-100">{file.name}</span>
                    <Badge className="bg-green-700 text-green-100">{(file.size / 1024).toFixed(1)} KB</Badge>
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={uploadStatus === 'uploading'}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-black"
                  >
                    {uploadStatus === 'uploading' ? 'Processing...' : 'Upload'}
                  </Button>
                </div>
              )}

              {uploadStatus !== 'idle' && (
                <Alert
                  variant={uploadStatus === 'success' ? 'default' : 'destructive'}
                  className="w-full bg-green-900/10 border-green-700"
                >
                  <div className="flex items-start gap-2 w-full">
                    {uploadStatus === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-400" />
                    )}
                    <AlertDescription className="flex-1 text-green-100 whitespace-pre-wrap break-words">
                      {uploadMessage}
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="w-full bg-green-900/10 backdrop-blur-sm border-green-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-300">
                <Info className="h-5 w-5" /> CSV Format Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 w-full">
              <Alert className="mb-4 bg-green-900/10 border-green-700">
                <Info className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-100">
                  Your CSV must start with a header row listing all fields. Username is required.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-green-300">Supported Platforms:</h4>
                  <div className="flex flex-wrap gap-2">
                    {platforms.map(pl => (
                      <Badge key={pl} className="bg-green-700 text-black">{pl}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-green-300">Example CSV Structure:</h4>
                  <div className="bg-black/30 p-3 rounded-lg text-sm font-mono text-green-100 w-full">
                    username,vpip,pfr,three_bet,total_tournaments<br />
                    john_doe,25.5,18.2,8.7,1250<br />
                    jane_smith,22.1,16.9,6.3,987
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-green-300">CSV Fields:</h4>
                  <div className="bg-black/20 p-3 rounded-lg text-sm font-mono text-green-100 w-full">
                    username, vpip, pfr, three_bet, fold_to_three_bet, steal, check_raise,<br />
                    cbet, fold_to_cbet, wtsd, wsd, aggression_factor, fold,<br />
                    total_tournaments, itm_percent, final_table_percent, win_percent
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CSV Fields Reference Guide */}
        <h2 className="text-2xl font-semibold text-green-300 mt-8 mb-4">CSV Fields Reference Guide</h2>
        <div className="space-y-4">
          {columnCategories.map((category, idx) => (
            <Card key={idx} className="bg-green-900/10 backdrop-blur-sm border-green-700">
              <CardHeader>
                <CardTitle className="text-green-300">{category.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-green-700">
                      <TableHead className="text-green-100">Column Name</TableHead>
                      <TableHead className="text-green-100">Description</TableHead>
                      <TableHead className="text-green-100">Example</TableHead>
                      <TableHead className="text-green-100">Required</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {category.columns.map((col, i) => (
                      <TableRow key={i} className="border-green-800">
                        <TableCell className="font-mono text-sm text-green-300">{col.column}</TableCell>
                        <TableCell className="text-green-100">{col.description}</TableCell>
                        <TableCell className="font-mono text-sm text-green-200">{col.example}</TableCell>
                        <TableCell>
                          <Badge className={col.required ? 'bg-red-600 text-white' : 'bg-green-700 text-green-100'}>
                            {col.required ? 'Yes' : 'No'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}