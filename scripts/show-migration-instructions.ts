#!/usr/bin/env tsx
/**
 * Show migration instructions for Supabase
 */

import fs from 'fs/promises';
import path from 'path';

async function showInstructions() {
  const migrationFile = 'supabase/migrations/001_create_portfolios_table.sql';
  const migrationPath = path.join(process.cwd(), migrationFile);
  
  try {
    const migrationSQL = await fs.readFile(migrationPath, 'utf-8');
    
    console.log('\n📋 Supabase Migration Instructions\n');
    console.log('================================\n');
    
    console.log('Since Supabase CLI is not installed, you need to run the migration manually.\n');
    
    console.log('Option 1: Supabase Dashboard (Recommended)');
    console.log('------------------------------------------');
    console.log('1. Go to: https://app.supabase.com/project/djdioapdziwrjqbqzykf/sql/new');
    console.log('2. Copy and paste the SQL below into the SQL editor');
    console.log('3. Click "Run" to execute the migration\n');
    
    console.log('Option 2: Install Supabase CLI');
    console.log('-------------------------------');
    console.log('1. Install: npm install -g supabase');
    console.log('2. Login: supabase login');
    console.log('3. Link: supabase link --project-ref djdioapdziwrjqbqzykf');
    console.log('4. Push: supabase db push\n');
    
    console.log('Migration SQL:');
    console.log('==============\n');
    console.log(migrationSQL);
    
  } catch (error) {
    console.error('Error reading migration file:', error);
  }
}

showInstructions();