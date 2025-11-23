-- Create step_timings table to track time spent on each step
CREATE TABLE step_timings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  step_id INT NOT NULL,
  step_name VARCHAR(255) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  duration_seconds INT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX idx_step_timings_customer_id ON step_timings(customer_id);
CREATE INDEX idx_step_timings_service_id ON step_timings(service_id);

-- Add comment to table
COMMENT ON TABLE step_timings IS 'Tracks time spent by customers on each service step';
