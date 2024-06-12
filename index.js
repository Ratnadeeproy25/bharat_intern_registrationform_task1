const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require("dotenv");
const app = express();
dotenv.config();

const port = process.env.PORT || 3000;
const username = process.env.MONGODB_USERNAME;
const password = process.env.MONGODB_PASSWORD;

mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.wtd5vsj.mongodb.net/rgistrationform`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connection successful"))
.catch((err) => console.error("MongoDB connection error:", err));

const registrationFormSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    password: String,
});

const Registration = mongoose.model("Registration", registrationFormSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/pages'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/pages/index.html');
});

app.post('/', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log(`Received form data: name=${name}, email=${email}`);

        const existing = await Registration.findOne({ email: email });
        if (!existing) {
            console.log("No existing user found, creating a new user");
            const registrationData = new Registration({
                name,
                email,
                password
            });
            console.log("Saving data to the database...");
            await registrationData.save();
            console.log("Data saved successfully");
            res.redirect('/success');
        } else {
            console.log("User already exists");
            res.redirect('/error');
        }
    } catch (error) {
        console.error("Error occurred:", error);
        res.redirect('/error');
    }
});

app.get('/success', (req, res) => {
    res.sendFile(__dirname + '/pages/success.html');
});

app.get('/error', (req, res) => {
    console.log("Serving error page");
    res.sendFile(__dirname + '/pages/error.html');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});