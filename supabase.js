const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = 'https://jzrisvwferxhpijyiqcr.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6cmlzdndmZXJ4aHBpanlpcWNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mjk5NjI2NSwiZXhwIjoyMDU4NTcyMjY1fQ.aYuKB-hxpyBctGIohgGIm3p4ZaTgs7xB08i4kMhMlF4';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

module.exports ={
    supabase
}