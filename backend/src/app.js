const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Firebase 설정 불러오기
const { db } = require('./config/firebase'); 


// 미들웨어 및 라우트 불러오기
const logger = require('./middlewares/logger.middleware');
const errorHandler = require('./middlewares/error.middleware');
const authRoutes = require('./routes/auth.routes');
const gameRoutes = require('./routes/game.routes');
const rankingRoutes = require('./routes/ranking.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(logger);

app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/ranking', rankingRoutes);

app.use(errorHandler); 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 서버 실행: http://localhost:${PORT}`);
});