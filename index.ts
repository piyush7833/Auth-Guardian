import express from 'express';
import cors from 'cors';
import session from "express-session";
import passport from "passport";
import routes from './routes/routes';
const app=express();

// const allowedOrigins = ['http://localhost:3000','http://localhost:3000','http://127.0.0.1:5500','http://localhost:5500',];

app.use(cors());

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(
    session({
      secret: "secret", 
      resave: false,
      saveUninitialized: true,
    })
  );
  
  // Initialize Passport and session
  app.use(passport.initialize());
  app.use(passport.session());
app.use('/api/auth-guardian',routes);

app.listen(8000, () => {
    console.log("Connected to Server");
});

