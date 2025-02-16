import express from 'express';
import cors from 'cors';
import watchdutyRouter from './routes/watchduty';

const app = express();

// Enable CORS
app.use(cors());

// Add error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Internal server error' 
  });
});

app.use('/api/watchduty', watchdutyRouter);

// Start the server
const PORT = 2022;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app; 