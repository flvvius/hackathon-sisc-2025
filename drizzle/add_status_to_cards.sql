-- First check if task_status enum type exists, if not create it
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE task_status AS ENUM ('todo', 'in-progress', 'completed');
  END IF;
END $$;

-- Add the status column to the card table if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'card' AND column_name = 'status'
  ) THEN
    ALTER TABLE card ADD COLUMN status task_status DEFAULT 'todo';
  END IF;
END $$; 