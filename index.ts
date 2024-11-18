import express from 'express';
import cors from 'cors';
import routes from './routes/routes';

const app = express();

// Define the allowed origins
const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500'];

// Configure CORS middleware
app.use(cors({
    origin: function (origin, callback) {
        console.log("Request Origin:", origin); // Log the origin
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            console.log("CORS Success for Origin:", origin);
            callback(null, true);
        } else {
            console.log("CORS Denied for Origin:", origin);
            callback(new Error('CORS policy does not allow access from this origin.'), false);
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth-guardian', routes);

app.listen(8000, () => {
    console.log("Connected to Server");
});
