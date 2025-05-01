#!/usr/bin/env node

const { exec } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Running Supabase setup script...');
console.log('This script will:');
console.log('1. Create Supabase tables for workouts, exercises, and sets');
console.log('2. Setup the Supabase database with the correct schema');
console.log('3. Clear any existing seed data');

rl.question('Do you want to proceed? (yes/no): ', (answer) => {
  if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
    // Run the Supabase setup
    const command = 'tsx db/switch-to-supabase.ts';
    
    console.log('Setting up Supabase...');
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        rl.close();
        return;
      }
      
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      
      console.log(stdout);
      console.log('Supabase setup completed successfully!');
      console.log('You can now use the application with Supabase as the database.');
      console.log('');
      console.log('To clear all data at any time, click the "Clear All Data" button in the application.');
      
      rl.close();
    });
  } else {
    console.log('Setup cancelled.');
    rl.close();
  }
});