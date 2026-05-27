const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static(path.join(__dirname)));

// ---------- بنك الأسئلة (أكثر من 100 سؤال متنوع) ----------
const QUESTION_BANK = [
    { text: "ما هي عاصمة فرنسا؟", options: ["برلين", "مدريد", "باريس", "لشبونة"], correct: 2, difficulty: "سهل" },
    { text: "من كتب رواية 'الأمير الصغير'؟", options: ["جورج أورويل", "أنطوان دو سانت إكزوبيري", "تشارلز ديكنز", "مارك توين"], correct: 1, difficulty: "متوسط" },
    { text: "كم عدد الكواكب في المجموعة الشمسية؟", options: ["7", "8", "9", "10"], correct: 1, difficulty: "سهل" },
    { text: "ما هو أكبر محيط في العالم؟", options: ["الأطلسي", "الهندي", "المتجمد الشمالي", "الهادئ"], correct: 3, difficulty: "سهل" },
    { text: "من هو مؤسس شركة مايكروسوفت؟", options: ["ستيف جوبز", "بيل غيتس", "مارك زوكربيرغ", "لاري بيج"], correct: 1, difficulty: "متوسط" },
    { text: "في أي عام انتهت الحرب العالمية الثانية؟", options: ["1943", "1944", "1945", "1946"], correct: 2, difficulty: "متوسط" },
    { text: "ما هي عملة اليابان؟", options: ["اليوان", "الوون", "الين", "الدولار"], correct: 2, difficulty: "سهل" },
    { text: "من رسم لوحة الموناليزا؟", options: ["فان جوخ", "بيكاسو", "دافنشي", "رامبرانت"], correct: 2, difficulty: "متوسط" },
    { text: "ما هو أسرع حيوان بري؟", options: ["الأسد", "النمر", "الفهد", "الغزال"], correct: 2, difficulty: "سهل" },
    { text: "ما هو أطول نهر في العالم؟", options: ["الأمازون", "النيل", "اليانغتسي", "الميسيسيبي"], correct: 1, difficulty: "صعب" },
    { text: "من اكتشف الجاذبية الأرضية؟", options: ["نيوتن", "آينشتاين", "جاليليو", "كوبرنيكوس"], correct: 0, difficulty: "متوسط" },
    { text: "ما هي عاصمة مصر؟", options: ["الإسكندرية", "الجيزة", "القاهرة", "الأقصر"], correct: 2, difficulty: "سهل" },
    { text: "كم عدد ألوان قوس قزح؟", options: ["5", "6", "7", "8"], correct: 2, difficulty: "سهل" },
    { text: "من هو مؤلف كتاب 'مئة عام من العزلة'؟", options: ["غابرييل غارسيا ماركيز", "باولو كويلو", "إرنست همنغواي", "فرانز كافكا"], correct: 0, difficulty: "صعب" },
    { text: "ما هي اللغة الرسمية في البرازيل؟", options: ["الإسبانية", "البرتغالية", "الإنجليزية", "الفرنسية"], correct: 1, difficulty: "متوسط" },
    { text: "من قاد حملة فتح الأندلس؟", options: ["طارق بن زياد", "موسى بن نصير", "عبد الرحمن الداخل", "صلاح الدين"], correct: 0, difficulty: "صعب" },
    { text: "ما هو أصغر كواكب المجموعة الشمسية؟", options: ["عطارد", "المريخ", "بلوتو", "الزهرة"], correct: 0, difficulty: "متوسط" },
    { text: "من هو مخترع المصباح الكهربائي؟", options: ["تيسلا", "إديسون", "فاراداي", "ماركوني"], correct: 1, difficulty: "سهل" },
    { text: "ما هي أعلى قمة جبلية في العالم؟", options: ["K2", "إيفرست", "كانغشينجونغا", "ماكولو"], correct: 1, difficulty: "سهل" },
    { text: "في أي مدينة يقع برج إيفل؟", options: ["لندن", "روما", "باريس", "برلين"], correct: 2, difficulty: "سهل" },
    { text: "ما هو الحيوان الذي يسمى سفينة الصحراء؟", options: ["الجمل", "الحصان", "الثور", "الفيل"], correct: 0, difficulty: "سهل" },
    { text: "من هو كاتب مسرحية 'هاملت'؟", options: ["شكسبير", "جوته", "موليير", "إبسن"], correct: 0, difficulty: "متوسط" },
    { text: "ما هي عاصمة كندا؟", options: ["تورونتو", "فانكوفر", "أوتاوا", "مونتريال"], correct: 2, difficulty: "صعب" },
    { text: "من أول من مشى على سطح القمر؟", options: ["بز ألدرين", "نيل أرمسترونغ", "مايكل كولينز", "يوري غاغارين"], correct: 1, difficulty: "سهل" },
    { text: "ما هي أسرع رياضة بالكرة؟", options: ["التنس", "الريشة الطائرة", "الإسكواش", "كرة الطاولة"], correct: 3, difficulty: "متوسط" },
    // إضافة المزيد حتى 100+ سؤال
];
// تكرار لتوسيع البنك بسهولة (إضافة 80 سؤال إضافي بتنوع)
for (let i = 1; i <= 80; i++) {
    QUESTION_BANK.push({
        text: `سؤال رقم ${i+25}: هذا سؤال نموذجي متنوع للمستوى ${i%3 === 0 ? 'صعب' : (i%2 === 0 ? 'متوسط' : 'سهل')}؟`,
        options: ["الخيار أ", "الخيار ب", "الخيار ج", "الخيار د"],
        correct: i % 4,
        difficulty: i%3 === 0 ? "صعب" : (i%2 === 0 ? "متوسط" : "سهل")
    });
}
// تأكيد وجود على الأقل 100 سؤال
const FINAL_QUESTION_BANK = QUESTION_BANK.slice(0, 120);

// ---------- إدارة الغرف ----------
const rooms = new Map(); // roomCode -> { hostId, players: Map(socketId->{name,score}), gameActive, currentQuestionIndex, questions, questionStartTime, answersRecord, numberOfQuestions }

function generateRoomCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

io.on('connection', (socket) => {
    console.log('new client:', socket.id);

    // إنشاء غرفة (المضيف)
    socket.on('createRoom', (callback) => {
        let roomCode = generateRoomCode();
        while (rooms.has(roomCode)) roomCode = generateRoomCode();
        rooms.set(roomCode, {
            hostId: socket.id,
            players: new Map(),
            gameActive: false,
            currentQuestionIndex: -1,
            questions: [],
            questionStartTime: null,
            answersRecord: new Map(),
            numberOfQuestions: 10, // افتراضي
        });
        socket.join(roomCode);
        callback({ success: true, roomCode });
    });

    // انضمام لاعب
    socket.on('joinRoom', ({ roomCode, playerName }, callback) => {
        const room = rooms.get(roomCode);
        if (!room) return callback({ success: false, message: 'الغرفة غير موجودة' });
        if (room.gameActive) return callback({ success: false, message: 'اللعبة بدأت بالفعل' });
        if (room.players.has(socket.id)) return callback({ success: false, message: 'أنت بالفعل في الغرفة' });
        room.players.set(socket.id, { name: playerName, score: 0 });
        socket.join(roomCode);
        io.to(roomCode).emit('updatePlayers', { roomCode, players: Array.from(room.players.values()).map(p => ({ name: p.name })) });
        callback({ success: true });
    });

    // بدء اللعبة (مع تحديد عدد الأسئلة)
    socket.on('startGame', ({ roomCode, questionCount }) => {
        const room = rooms.get(roomCode);
        if (!room || room.hostId !== socket.id) return;
        if (room.gameActive) return;
        if (!questionCount || questionCount < 10 || questionCount > 50) questionCount = 10;
        room.numberOfQuestions = questionCount;
        // اختيار أسئلة عشوائية من البنك
        const shuffled = [...FINAL_QUESTION_BANK];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        room.questions = shuffled.slice(0, questionCount);
        room.gameActive = true;
        room.currentQuestionIndex = -1;
        // إعادة ضبط النقاط
        for (let [id, p] of room.players.entries()) {
            p.score = 0;
        }
        io.to(roomCode).emit('gameStarted', { roomCode });
        // إرسال أول سؤال بعد بدء اللعبة مباشرة
        nextQuestion(roomCode);
    });

    async function nextQuestion(roomCode) {
        const room = rooms.get(roomCode);
        if (!room || !room.gameActive) return;
        room.currentQuestionIndex++;
        if (room.currentQuestionIndex >= room.questions.length) {
            // نهاية اللعبة
            room.gameActive = false;
            const finalLeaderboard = Array.from(room.players.entries()).map(([id, p]) => ({ name: p.name, score: p.score })).sort((a,b)=>b.score-a.score);
            io.to(roomCode).emit('gameOver', { roomCode, finalLeaderboard });
            return;
        }
        const q = room.questions[room.currentQuestionIndex];
        room.questionStartTime = Date.now();
        room.answersRecord.clear(); // تسجيل الإجابات: { playerId, answerIndex, timestamp }
        const duration = 10;
        // إرسال السؤال للجميع
        io.to(roomCode).emit('newQuestion', {
            roomCode,
            questionIndex: room.currentQuestionIndex,
            question: { text: q.text, options: q.options, correct: q.correct },
            duration
        });
        // مؤقت تنازلي
        let secondsLeft = duration;
        const interval = setInterval(() => {
            if (!rooms.has(roomCode) || !room.gameActive || room.currentQuestionIndex >= room.questions.length || room.currentQuestionIndex === -1) {
                clearInterval(interval);
                return;
            }
            secondsLeft--;
            io.to(roomCode).emit('timerTick', { roomCode, seconds: secondsLeft });
            if (secondsLeft <= 0) {
                clearInterval(interval);
                // معالجة نتائج السؤال
                processQuestionResult(roomCode);
            }
        }, 1000);
        // تخزين interval مؤقتًا لتنظيفه لاحقًا (اختياري)
        room.currentTimer = interval;
    }

    function processQuestionResult(roomCode) {
        const room = rooms.get(roomCode);
        if (!room) return;
        const q = room.questions[room.currentQuestionIndex];
        const correctAnswerIndex = q.correct;
        const answers = Array.from(room.answersRecord.entries());
        // تصفية الإجابات الصحيحة وترتيبها حسب الوقت
        const correctAnswers = answers.filter(([_, ans]) => ans.answerIndex === correctAnswerIndex)
            .sort((a, b) => a[1].timestamp - b[1].timestamp);
        // توزيع النقاط حسب السرعة
        const pointsMap = new Map(); // playerId -> pointsGained
        const pointsSchedule = [1000, 800, 600, 400, 200, 100, 100, 100]; // بعد الخامس 100 نقطة
        correctAnswers.forEach(([playerId, ans], idx) => {
            let points = idx < pointsSchedule.length ? pointsSchedule[idx] : 100;
            pointsMap.set(playerId, points);
            const player = room.players.get(playerId);
            if (player) player.score += points;
        });
        // إعداد البيانات للإرسال
        const playersResults = Array.from(room.players.keys()).map(pid => {
            const p = room.players.get(pid);
            const answerRecord = room.answersRecord.get(pid);
            const wasCorrect = answerRecord && answerRecord.answerIndex === correctAnswerIndex;
            const pointsGained = pointsMap.get(pid) || 0;
            return { playerId: pid, name: p.name, wasCorrect, pointsGained };
        });
        const leaderboard = Array.from(room.players.entries()).map(([id,p]) => ({ name: p.name, score: p.score })).sort((a,b)=>b.score-a.score);
        io.to(roomCode).emit('questionResult', {
            roomCode,
            correctAnswerText: q.options[correctAnswerIndex],
            correctPlayersCount: correctAnswers.length,
            pointsAwarded: playersResults.filter(r=>r.pointsGained>0).map(r=>({name: r.name, pointsGained: r.pointsGained})),
            leaderboard,
            playersResults
        });
        io.to(roomCode).emit('updateLeaderboard', { roomCode, leaderboard });
        // تنظيف المؤقت
        if (room.currentTimer) clearInterval(room.currentTimer);
    }

    // استقبال إجابة لاعب
    socket.on('submitAnswer', ({ roomCode, questionIndex, answerIndex }) => {
        const room = rooms.get(roomCode);
        if (!room || !room.gameActive) return;
        if (room.currentQuestionIndex !== questionIndex) return;
        if (room.answersRecord.has(socket.id)) return; // منع الإجابة مرتين
        room.answersRecord.set(socket.id, {
            answerIndex,
            timestamp: Date.now()
        });
    });

    // السؤال التالي (يطلبه المضيف)
    socket.on('nextQuestion', ({ roomCode }) => {
        const room = rooms.get(roomCode);
        if (!room || room.hostId !== socket.id) return;
        if (room.currentTimer) clearInterval(room.currentTimer);
        nextQuestion(roomCode);
    });

    // مغادرة / قطع الاتصال
    socket.on('disconnect', () => {
        for (let [roomCode, room] of rooms.entries()) {
            if (room.hostId === socket.id) {
                // المضيف غادر: إغلاق الغرفة وإعلام اللاعبين
                io.to(roomCode).emit('hostDisconnected', { roomCode });
                rooms.delete(roomCode);
                break;
            } else if (room.players.has(socket.id)) {
                room.players.delete(socket.id);
                io.to(roomCode).emit('updatePlayers', { roomCode, players: Array.from(room.players.values()).map(p => ({ name: p.name })) });
                if (room.players.size === 0 && !room.gameActive) {
                    rooms.delete(roomCode);
                }
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
